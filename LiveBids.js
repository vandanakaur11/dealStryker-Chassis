const mongoose = require("mongoose");
const app = require("./app");
const zipcodes = require("zipcodes");
const Users = mongoose.model("Users");
const Bid = mongoose.model("Bid");
const Offer = mongoose.model("Offer");
const PotentialBuyer = mongoose.model("PotentialBuyer");
const Channel = mongoose.model("Channel");

function zipcodeDistancer(zipA, zipB) {
  var results = zipcodes.distance(zipA, zipB);

  if (zipA == zipB) {
    return 0;
  } else {
    return results;
  }
}

const {
  USER_CONNECT,
  OFFER_REQUEST_CREATED,
  OFFER_CREATED,
  OFFER_ACCEPTED,
  OFFER_UPDATED,
  END_CAMPAIGN,
  REQUEST_OUT_THE_DOOR_PRICE,
  MARK_AS_READ,
  GET_LAST_SEEN_LIST,
  SET_LAST_SEEN,
  MESSAGE_SEND,
  ADD_MEMBER_REQUEST,
} = require("./Events");

let connectedUsers = [];

const sendMsg = (email, title, text) => {
  const SENDGRID_API_KEY =
    "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";
  const isProduction = process.env.NODE_ENV === "production";
  const link = isProduction
    ? process.env.ServerAddress
    : "http://localhost:3000";

  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(SENDGRID_API_KEY);
  const msg = {
    to: email,
    from: "no-reply@dealstryker.com",
    subject: title,
    html: `${text}\n <a href=${link}>${link}</a>`,
  };
  sgMail
    .send(msg)
    .then(() => console.log("email sended"))
    .catch((err) => console.log("email sending error"));
};

module.exports = function (socket) {
  console.log("Socket ID: " + socket.id);

  socket.on(USER_CONNECT, (userId, callback) => {
    console.log("userId >>>>>>>>>>>", userId);
    console.log("callback >>>>>>>>>>>", callback);

    let connectedUser = {};

    Users.findOne(
      {
        _id: userId,
      },
      (err, foundedUser) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedUser) {
          connectedUser = {
            role: foundedUser.role,
            email: foundedUser.email,
            name: foundedUser.name,
            zip: foundedUser.zip,
            bids: foundedUser.bids,
            socketId: socket.id,
            id: userId,

            type: foundedUser.type,
            Dealership: foundedUser.Dealership,
            dealershipName: foundedUser.dealershipName,
          };

          console.log("connectedUser >>>>>", connectedUser);

          connectedUsers.push(connectedUser);
          socket.user = connectedUser;
          socket.join(connectedUser.role);
          console.log("user " + socket.user);
          socket.on("disconnect", () => {
            const userIndexInArray = connectedUsers.findIndex(
              (foundedUser) => foundedUser.id === connectedUser.id
            );
            connectedUsers.splice(userIndexInArray, 1);
            console.log("user disconnected");
          });

          Bid.find({
            _id: {
              $in: connectedUser.bids,
            },
          })
            .sort({ createdAt: -1 })
            .exec(async function (err, docs) {
              let newReq = [];

              await Promise.all(
                docs.map(async (request) => {
                  let offersArr = [...request.responses];
                  console.log(offersArr);
                  await Offer.find(
                    {
                      _id: {
                        $in: offersArr,
                      },
                    },
                    (err, offers) => {
                      if (connectedUser.role === "dealer")
                        newReq.push({
                          ...request._doc,
                          responses: offers
                            .filter((offer) => {
                              return offer.members.includes(connectedUser.id);
                            })
                            .sort((a, b) =>
                              a.createdAt > b.createdAt ? 1 : -1
                            ),
                        });
                      else
                        newReq.push({
                          ...request._doc,
                          responses: offers,
                        });
                    }
                  );
                })
              );
              callback(newReq);
            });
        } else console.log("User not founded");
      }
    );
    console.log("user connected");
  });

  socket.on(OFFER_REQUEST_CREATED, (offerRequestData, callback) => {
    console.log("[BE]Offer request created");
    Users.findOne(
      {
        _id: offerRequestData.userId,
      },
      async (err, user) => {
        if (err) {
          console.log("Search in database error");
        }

        if (user) {
          let activeBids = [];

          await Bid.find(
            {
              _id: {
                $in: user.bids,
              },
            },
            async function (err, docs) {
              if (!err && docs && docs.length) {
                activeBids = docs.filter((bid) => !bid.isClosed);
              }
            }
          );

          if (activeBids && activeBids.length < 3) {
            const currentDate = new Date();

            const numericalDistance = offerRequestData.distance
              ? Number(offerRequestData.distance.replace("mil", ""))
              : 30;

            let offerRequest = new Bid({
              userId: user._id,
              name: offerRequestData.name,
              manufacturer: offerRequestData.manufacturer,
              car: offerRequestData.car,
              color: offerRequestData.color,
              model: offerRequestData.model,
              vehicleId: offerRequestData.vehicleId,
              financing: offerRequestData.financing,
              distance: numericalDistance,
              zip: offerRequestData.zip,
              year: offerRequestData.year,
              isClosed: false,
              createdAt: currentDate.getTime(),
            });
            offerRequest.save().then(() => {
              user.linkBid(offerRequest._id);
              user.save();
              Users.find(
                {
                  role: "dealer",
                },
                (error, result) => {
                  if (error) {
                    return console.log(`Error has occurred: ${error}`);
                  }
                  if (result && result.length) {
                    const fitDealers = result.filter(
                      (dealer) =>
                        zipcodeDistancer(
                          parseInt(dealer.zip),
                          parseInt(offerRequest.zip)
                        ) < offerRequest.distance &&
                        dealer.manufacturers.includes(
                          offerRequestData.manufacturer
                        )
                    );

                    if (fitDealers && fitDealers.length) {
                      fitDealers.forEach((fitDealer) => {
                        fitDealer.markAsUnread(offerRequest._id);
                        const fitNotificationsType = ["all", "offer"];
                        if (
                          fitNotificationsType.indexOf(
                            fitDealer.notificationsType
                          ) !== -1
                        )
                          sendMsg(
                            fitDealer.email,
                            "New offer request",
                            "You received new offer request."
                          );

                        fitDealer.linkBid(offerRequest._id);
                        fitDealer.save().then(() => {
                          const connectedDealer = connectedUsers.filter(
                            (connectedUser, i) => {
                              if (
                                connectedUser.id === fitDealer.id &&
                                connectedUsers[i]
                              ) {
                                connectedUsers[i].bids = [
                                  ...connectedUsers[i].bids,
                                  offerRequest._id.toString(),
                                ];
                              }
                              return connectedUser.id === fitDealer.id;
                            }
                          );
                          if (connectedDealer && connectedDealer.length)
                            connectedDealer.map((dealer) =>
                              app.ioLiveBids
                                .to(dealer.socketId)
                                .emit(OFFER_REQUEST_CREATED, offerRequest)
                            );
                        });
                      });
                    } else {
                      const potentialBuyer = new PotentialBuyer({
                        userId: offerRequest.userId,
                        zip: offerRequest.zip,
                        manufacturer: offerRequest.manufacturer,
                        offerId: offerRequest._id,
                      });
                      potentialBuyer.save().then(() => callback(400));
                    }
                  }
                }
              );
              callback(200, offerRequest);
            });
            console.log("offer request created");
          } else {
            callback(409);
          }
        } else {
          callback(401);
        }
      }
    );
  });

  socket.on(OFFER_CREATED, (offerData, callback) => {
    var sockSearch = [socket.user.id];
    Bid.findOne(
      {
        _id: offerData.requestId,
      },
      (err, foundedBid) => {
        Offer.findOne(
          {
            parentBidId: foundedBid._id,
            members: {
              $in: sockSearch,
            },
          },
          (err, foundedOffer) => {
            if (err) {
              console.log("Search in database error");
            }
            console.log("1: " + foundedOffer);
            console.log(offerData.price);
            if (foundedOffer) {
              // console.log(foundedOffer)
              // foundedOffer.price=offerData.price;
              foundedOffer.update(offerData.price.toString());
              foundedOffer.biddedBy = socket.user.name;
              foundedOffer.save().then(() => {
                if (foundedBid) {
                  Users.findOne(
                    {
                      _id: foundedBid.userId,
                    },
                    (err, customer) => {
                      if (!err && customer) {
                        if (
                          customer.unreadLiveBids.indexOf(foundedOffer._id) ===
                          -1
                        ) {
                          customer.markAsUnread(foundedOffer._id);
                          const fitNotificationsType = ["all", "offer"];
                          if (
                            fitNotificationsType.indexOf(
                              customer.notificationsType
                            ) !== -1
                          )
                            sendMsg(
                              customer.email,
                              "Offer updated",
                              `${foundedBid.manufacturer} ${foundedBid.car} offer from ${socket.user.name} was updated.`
                            );

                          customer.save();
                        }
                      }
                    }
                  );
                }

                const connectedCustomer = connectedUsers.filter(
                  (connectedUser) => connectedUser.id === foundedBid.userId
                );
                if (connectedCustomer && connectedCustomer.length)
                  connectedCustomer.map((customer) =>
                    app.ioLiveBids
                      .to(customer.socketId)
                      .emit(
                        OFFER_UPDATED,
                        offerData.requestId,
                        foundedOffer._id,
                        {
                          price: offerData.price,
                        }
                      )
                  );

                console.log(`offer ${foundedOffer._id} updated`);
                callback(201, foundedOffer);
              });
            } else {
              console.log(
                offerData.dealerInformation.user.bids.includes(foundedBid._id)
              );
              console.log(socket.user.bids);
              console.log(foundedBid);
              Users.findOne(
                {
                  _id: socket.user.id,
                },
                (err, dealerUser) => {
                  if (foundedBid && dealerUser.bids.includes(foundedBid._id)) {
                    const currentDate = new Date();
                    var formatter = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",

                      // These options are needed to round to whole numbers if that's what you want.
                      // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
                      // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
                    });

                    let offer = new Offer({
                      parentBidId: foundedBid._id,
                      dealerId: offerData.dealerId,
                      dealerName: socket.user.dealershipName,
                      biddedBy: socket.user.name,
                      dealershipId: offerData.dealerInformation.user.Dealership,
                      price: formatter.format(offerData.price),
                      createdAt: currentDate.getTime(),
                    });

                    offer.save().then(() => {
                      foundedBid.addOffer(offer._id);
                      foundedBid.save().then(() =>
                        Users.find(
                          {
                            Dealership:
                              offerData.dealerInformation.user.Dealership,
                          },
                          (err, user) => {
                            if (err) {
                              console.log("Search in database error");
                            }
                            if (foundedBid)
                              if (user) {
                                user.map((u) => {
                                  if (
                                    u.type === "Manager" ||
                                    u._id == offerData.dealerId
                                  ) {
                                    offer.members.push(u._id);
                                  } else {
                                    u.unlinkBid(foundedBid._id);
                                    u.markAsRead(foundedBid._id);
                                    u.save();
                                  }
                                });

                                offer.save();
                                Users.findOne(
                                  {
                                    _id: foundedBid.userId,
                                  },
                                  (err, customer) => {
                                    if (!err && customer) {
                                      customer.markAsUnread(offer._id);
                                      const fitNotificationsType = [
                                        "all",
                                        "offer",
                                      ];
                                      if (
                                        fitNotificationsType.indexOf(
                                          customer.notificationsType
                                        ) !== -1
                                      )
                                        sendMsg(
                                          customer.email,
                                          "New offer",
                                          "You received new offer."
                                        );

                                      customer.save();
                                    }
                                  }
                                );
                                const connectedDealer = connectedUsers.filter(
                                  (connectedUser, i) =>
                                    connectedUser.Dealership ===
                                    offerData.dealerInformation.user.Dealership
                                );

                                console.log(connectedDealer);
                                if (connectedDealer && connectedDealer.length) {
                                  connectedDealer.map((dealer) =>
                                    app.ioLiveBids
                                      .to(dealer.socketId)
                                      .emit(OFFER_CREATED, offer)
                                  );
                                }
                                const connectedCustomer = connectedUsers.filter(
                                  (connectedUser) =>
                                    connectedUser.id === foundedBid.userId
                                );
                                if (
                                  connectedCustomer &&
                                  connectedCustomer.length
                                ) {
                                  connectedCustomer.map((cuustomer) =>
                                    app.ioLiveBids
                                      .to(cuustomer.socketId)
                                      .emit(OFFER_CREATED, offer)
                                  );
                                }

                                callback(200, offer);
                              } else {
                                callback(403);
                              }
                          }
                        )
                      ); //
                      console.log("offer created");
                    });
                  } else {
                    callback(404);
                  }
                }
              );
            }
          }
        );
      }
    );
  });

  socket.on(OFFER_ACCEPTED, (offerId, callback) => {
    Offer.findOne(
      {
        _id: offerId,
      },
      (err, foundedOffer) => {
        if (err) console.log("Search in database error");

        if (foundedOffer) {
          foundedOffer.accept();
          foundedOffer.save().then(() => {
            const connectedDealer = connectedUsers.filter(
              (connectedUser) => connectedUser.id === foundedOffer.dealerId
            );
            console.log("connectedDealer" + JSON.stringify(connectedDealer));
            if (connectedDealer && connectedDealer.length)
              connectedDealer.map((dealer) =>
                app.ioLiveBids
                  .to(dealer.socketId)
                  .emit(
                    OFFER_ACCEPTED,
                    foundedOffer.parentBidId,
                    foundedOffer._id
                  )
              );

            // foundedOffer.accept();
            // foundedOffer.save().then(() => {
            // const connectedDealer = connectedUsers.filter(
            //     (connectedUser) => connectedUser.id === foundedOffer.dealerId
            // );
            // if (connectedDealer && connectedDealer.length)
            //     connectedDealer.map((dealer) =>
            //       app.ioLiveBids
            //         .to(dealer.socketId)
            //         .emit(
            //           OFFER_ACCEPTED,
            //           foundedOffer.parentBidId,
            //           foundedOffer._id
            //         )
            //     );
          });
          console.log(`offer ${offerId} accepted`);
        }
        callback(foundedOffer);
      }
    );
  });

  socket.on(END_CAMPAIGN, ({ bidId }, callback) => {
    Bid.findOne(
      {
        _id: bidId,
      },
      (err, foundedBid) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedBid && foundedBid.userId === socket.user.id) {
          let customers = [];
          let dealers = [];
          Users.find(
            {
              bids: foundedBid._id,
            },
            (err, users) => {
              if (!err && users && users.length) {
                customers = users.filter((user) => user.role === "customer");
                dealers = users.filter((user) => user.role === "dealer");

                dealers.forEach((dealer) => {
                  dealer.markAsRead(bidId);
                  dealer.save();
                });
              }
            }
          );

          foundedBid.close();
          Offer.find(
            {
              _id: {
                $in: foundedBid.responses,
              },
            },
            (err, offers) => {
              if (offers && offers.length)
                offers.map((offer) => {
                  offer.close();
                  offer.save().then(() => {
                    customers.forEach((customer) => {
                      customer.markAsRead(offer._id.toString());
                      customer.save();
                    });
                  });
                });
            }
          );
          foundedBid.save().then(() => {
            callback({ message: "End campaign" });
            const connectedDealer = connectedUsers.filter(
              (connectedUser) => connectedUser.bids.indexOf(bidId) !== -1
            );
            if (connectedDealer && connectedDealer.length)
              connectedDealer.map((dealer) =>
                app.ioLiveBids.to(dealer.socketId).emit(END_CAMPAIGN, bidId)
              );
          });
        } else callback({ message: "Bid not found", error: 409 });
      }
    );
  });

  socket.on(REQUEST_OUT_THE_DOOR_PRICE, (userId, offerId, callback) => {
    Offer.findOne(
      {
        _id: offerId,
      },
      (err, foundedOffer) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedOffer) {
          const connectedDealer = connectedUsers.filter(
            (connectedUser) => connectedUser.id === foundedOffer.dealerId
          );
          if (connectedDealer && connectedDealer.length)
            connectedDealer.map((dealer) =>
              app.ioLiveBids
                .to(dealer.socketId)
                .emit(REQUEST_OUT_THE_DOOR_PRICE, foundedOffer._id)
            );

          foundedOffer.save().then(() => callback());
        } else callback("Offer not found");
      }
    );
  });

  socket.on(MARK_AS_READ, ({ id }, callback) => {
    Users.findOne(
      {
        _id: socket.user.id,
      },
      (err, foundedUser) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedUser) {
          foundedUser.markAsRead(id);
          foundedUser.save().then(() => callback(true));
        } else callback("Offer not found");
      }
    );
  });

  socket.on(GET_LAST_SEEN_LIST, ({}, callback) => {
    Users.findOne(
      {
        _id: socket.user.id,
      },
      (err, foundedUser) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedUser) {
          callback(foundedUser.lastSeenMessages);
        } else callback("User not found");
      }
    );
  });

  socket.on(SET_LAST_SEEN, ({ offerId, date }, callback) => {
    Users.findOne(
      {
        _id: socket.user.id,
      },
      (err, foundedUser) => {
        if (err) {
          console.log("Search in database error");
        }

        if (foundedUser && foundedUser.lastSeenMessages) {
          foundedUser.lastSeenMessages = {
            ...foundedUser.lastSeenMessages,
            [offerId]: date,
          };
          foundedUser.save().then(() => callback(true));
        } else callback("User not found");
      }
    );
  });
  socket.on(ADD_MEMBER_REQUEST, ({ userId, offerId }, callback) => {
    console.log("Why channel bro", offerId);

    Offer.findOne(
      {
        _id: offerId,
      },
      (err, foundedOffer) => {
        if (err) {
          console.log("Search in database error");
        }
        if (foundedOffer) {
          Users.findOne(
            {
              _id: userId,
            },
            (err, foundedUser) => {
              foundedUser.linkBid(foundedOffer.parentBidId);
              foundedUser.markAsUnread(foundedOffer._id);
              foundedUser.save();
            }
          );
          Channel.findOne(
            {
              offerRef: offerId,
            },
            (err, foundedChannel) => {
              if (err) {
                console.log("Search in database error");
              }
              if (foundedChannel) {
                if (
                  !foundedOffer.members.includes(userId) &&
                  !foundedChannel.members.includes(userId)
                ) {
                  foundedOffer.members.push(userId);
                  foundedChannel.members.push(userId);
                  foundedOffer.save();
                  foundedChannel.save();
                  callback("User added");
                } else {
                  callback("The User is already added");
                }
              }
            }
          );
        } else callback("Offer not found");
      }
    );
  });
  socket.on(MESSAGE_SEND, ({ offerId, message }) => {
    Users.findOne(
      {
        _id: socket.user.id,
      },
      (err, foundedUser) => {
        if (foundedUser) {
          if (foundedUser.role === "dealer") {
            Offer.findOne(
              {
                _id: offerId,
              },
              (err, foundedOffer) => {
                if (foundedOffer) {
                  Bid.findOne(
                    {
                      _id: foundedOffer.parentBidId,
                    },
                    (err, foundedBid) => {
                      if (foundedBid) {
                        Users.findOne(
                          {
                            _id: foundedBid.userId,
                          },
                          (err, foundedReceiver) => {
                            if (foundedReceiver) {
                              const fitNotificationsType = ["all", "chat"];
                              if (
                                fitNotificationsType.indexOf(
                                  foundedReceiver.notificationsType
                                ) !== -1
                              )
                                sendMsg(
                                  foundedReceiver.email,
                                  "New message",
                                  "Your received new message from dealer"
                                );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              }
            );
          } else {
            Offer.findOne(
              {
                _id: offerId,
              },
              (err, foundedOffer) => {
                if (foundedOffer) {
                  Users.findOne(
                    {
                      _id: foundedOffer.dealerId,
                    },
                    (err, foundedReceiver) => {
                      if (foundedReceiver) {
                        const fitNotificationsType = ["all", "chat"];
                        if (
                          fitNotificationsType.indexOf(
                            foundedReceiver.notificationsType
                          ) !== -1
                        )
                          sendMsg(
                            foundedReceiver.email,
                            "New message",
                            "Your received new message from customer"
                          );
                      }
                    }
                  );
                }
              }
            );
          }
        }
      }
    );
  });
};
