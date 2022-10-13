const mongoose = require("mongoose");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const auth = require("../auth");
const Users = mongoose.model("Users");
const Channel = mongoose.model("Channel");
const Offer = mongoose.model("Offer");
const VerifyCodes = require("./../../models/VerifyCodes");

const passRegExp = new RegExp(
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
);

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(
  "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"
);

// #####################
// new buyer setup
// #####################

// POST new customer route
router.post("/registerCustomer", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.sendStatus(422).json({
      errors: {
        password: "is required",
      },
    });
  } else if (!passRegExp.test(user.password)) {
    return res.status(422).json({
      errors: {
        password: "wrong format",
      },
    });
  }

  Users.findOne(
    {
      email: user.email,
    },
    (err, foundedUser) => {
      if (err) {
        console.log("Search in database error");
      }

      if (foundedUser) {
        res.json({ errors: "Error: email is in use" });
      } else {
        const finalUser = new Users({
          ...user,
          role: "customer",
          createdAt: new Date().getTime(),
          notificationsType: "offer", // Only offers notifications by default
        });

        finalUser.setPassword(user.password);

        return finalUser
          .save()
          .then(() => res.json({ user: finalUser.toAuthJSON() }));
      }
    }
  );
});

// #####################
// new dealer setup
// #####################

// POST new dealer route
router.post("/registerDealer", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  console.log("user >>>", user);

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.sendStatus(422).json({
      errors: {
        password: "is required",
      },
    });
  } else if (!passRegExp.test(user.password)) {
    return res.status(422).json({
      errors: {
        password: "wrong format",
      },
    });
  }

  if (!user.zip) {
    return res.sendStatus(422).json({
      errors: {
        zip: "is required",
      },
    });
  }

  if (!user.name) {
    return res.sendStatus(422).json({
      errors: {
        name: "is required",
      },
    });
  }

  Users.findOne(
    {
      email: user.email,
    },
    (err, foundedUser) => {
      if (err) {
        console.log("Search in database error");
      }

      if (foundedUser) {
        return res.json({ errors: "Error: email is in use" });
      } else {
        const finalUser = new Users({
          ...user,
          name: user.name,

          role: "dealer",
          type: "Manager",
          dealershipName: user.name,
          createdAt: new Date().getTime(),
          notificationsType: "offer", // Only offers notifications by default
        });
        finalUser.Dealership = finalUser._id;

        finalUser.setPassword(user.password);

        // Welcome Message for new dealerships

        const msg = {
          to: user.email,
          from: "no-reply@dealstryker.com",
          subject: "Welcome to DealStryker",
          html: `<span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Welcome to DealStryker,</span><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><br></span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">We appreciate you as a member and would like to thank you for choosing&nbsp; our platform. As a forward-thinking company, we are continually making improvements to our environment and appreciate feedback</span><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);">.&nbsp;</span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);"><br></span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);">If you have any questions, need assistance or have suggestions please feel free to reach out to me, thanks!</span></div><div dir="auto"><span style="color: var(--textColor); font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; orphans: 2; widows: 2; background-color: var(--backgroundColor);"><br></span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Regards,</span><div dir="auto"><br style="box-sizing: inherit; font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">Farhid Azari</span><br style="box-sizing: inherit; font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;">CMO / Co-Founder</span></div><div dir="auto"><span style="font-family: Slack-Lato, appleLogo, sans-serif; font-size: 15px; font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><img src="cid:BF19D9A57BEE45398FF6E41974AA748D"><br></span></div></div>`,
        };
        sgMail
          .send(msg)
          .then(() => res.status(200))
          .catch((err) => {
            console.log("SendGrid sending error: ", err);
            res.status(400);
          });

        return finalUser
          .save()
          .then(() => res.json({ user: finalUser.toAuthJSON() }));
      }
    }
  );
});

router.post("/registerSubUser", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.name) {
    return res.sendStatus(422).json({
      errors: {
        name: "is required",
      },
    });
  }

  Users.findOne(
    {
      _id: user.id,
    },
    (err, dealershipUser) => {
      if (err) {
        console.log("Search in database error");
      }
      Users.findOne(
        {
          email: user.email,
        },
        (err, foundedUser) => {
          if (err) {
            console.log("Search in database error");
          }

          if (foundedUser) {
            res.json({ errors: "User is not added, email is in use" });
          } else {
            const finalUser = new Users({
              ...user,
              name: user.name + " - " + user.type,
              manufacturers: dealershipUser.manufacturers,
              Dealership: user.id,
              role: "dealer",
              type: user.type,
              zip: dealershipUser.zip,
              dealershipName: dealershipUser.name,
              createdAt: new Date().getTime(),
              notificationsType: "all",
            });
            finalUser.setPassword(
              (Math.random() * (1000000000 - 900000000) + 900000000).toString()
            );
            // finalUser.setPassword("12345678");
            finalUser.save();
            dealershipUser.subuser.push(finalUser._id);
            dealershipUser.save();
            const SENDGRID_API_KEY =
              "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";
            const isProduction = process.env.NODE_ENV === "production";
            const token = jwt.sign(
              {
                id: finalUser._id,
                email: finalUser.email,
              },
              `${finalUser.hash}-${finalUser.createdAt}`
            );
            const link = `${isProduction ? process.env.ServerAddress : "http://localhost:5000"
              }/resetPassword?id=${finalUser._id}&token=${token}`;

            const msg = {
              // this is for sub users
              to: user.email,
              from: "no-reply@dealstryker.com",
              subject:
                "DealStryker Platform Signup - Please Set Your Password!",
              html: `
          <p style="line-height: 140%;">Hey ${user.name},</p>
          <p style="line-height: 140%;">Welcome to the DealStryker sales platform.</p>
          <p style="line-height: 140%;">You have been added as a team member of ${dealershipUser.name}.</p>
          <p style="line-height: 140%;">To access your account please use this email as your username and set your password using this <a href=${link}>link</a></p>
          <p style="line-height: 140%;">If you have questions or feedback please feel free to email me, thanks!</p>
          <p style="line-height: 140%;">Sincerely,<br>Farhid Azari<br>CMO / Co-Founder</p><p style="line-height: 140%;"><img src="cid:CC73905B49224335B2C07005F0C8A697"><br></p>
          `,
            };
            sgMail
              .send(msg)
              .then(() => res.status(200))
              .catch((err) => {
                console.log("SendGrid sending error: ", err);
                res.status(400);

                const msg = {
                  // try sending again once
                  to: user.email,
                  from: "no-reply@dealstryker.com",
                  subject:
                    "DealStryker Platform Signup - Please Set Your Password!",
                  html: `
              <p style="line-height: 140%;">Hey ${user.name},</p>
              <p style="line-height: 140%;">Welcome to the DealSryker sales platform.</p>
              <p style="line-height: 140%;">You have been added as a team member of ${dealershipUser.name}.</p>
              <p style="line-height: 140%;">To access your account please use this email as your username and set your password using this <a href=${link}>link</a></p>
              <p style="line-height: 140%;">If you have questions or feedback please feel free to email me, thanks!</p>
              <p style="line-height: 140%;">Sincerely,<br>Farhid Azari<br>CMO</p><p style="line-height: 140%;"><img src="cid:CC73905B49224335B2C07005F0C8A697"><br></p>
              `,
                };
              });
            res.json({ user: finalUser.toAuthJSON() });
          }
        }
      );
    }
  );
});

// #####################
//     oauth setup
// #####################

// POST login route (optional, everyone has access)
router.post("/login", auth.optional, (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.password) {
    return res.sendStatus(422).json({
      errors: {
        password: "is required",
      },
    });
  }

  return passport.authenticate(
    "local",
    {
      session: false,
    },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.sendStatus(400);
    }
  )(req, res, next);
});

router.post("/oauth/facebook", auth.optional, (req, res, next) => {
  return passport.authenticate(
    "facebookToken",
    {
      session: false,
    },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.sendStatus(400);
    }
  )(req, res, next);
});

router.post("/oauth/google", auth.optional, (req, res, next) => {
  return passport.authenticate(
    "googleToken",
    {
      session: false,
    },
    (err, passportUser, info) => {
      if (err) {
        return next(err);
      }

      if (passportUser) {
        const user = passportUser;
        user.token = passportUser.generateJWT();

        return res.json({ user: user.toAuthJSON() });
      }

      return res.sendStatus(400);
    }
  )(req, res, next);
});

// #####################
// passwrd reset setup
// #####################

// POST reset password (optional, everyone has access)
router.post("/changePassword", auth.required, (req, res, next) => {
  const {
    body: { email, oldPassword, newPassword },
  } = req;
  if (!email)
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });

  Users.findOne({ email })
    .then((user) => {
      if (!user || !user.validatePassword(oldPassword)) {
        return res.json({ error: "Old password is invalid" });
      } else {
        user.setPassword(newPassword);
        user.save().then(() => res.sendStatus(200));
      }
    })
    .catch((err) => `changePassword failed: ${err}`);
});

// POST reset password request (optional, everyone has access)
router.post("/resetPasswordReq", auth.optional, (req, res, next) => {
  const {
    body: { email },
  } = req;

  if (!email)
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });

  Users.findOne(
    {
      email,
    },
    function (err, user) {
      if (!user) {
        const SENDGRID_API_KEY =
          "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";
        const isProduction = process.env.NODE_ENV === "production";

        const msg = {
          to: email,
          from: "no-reply@dealstryker.com",
          subject: "Reset Password - No Acount Found - DealStryker",
          html:
            '<div dir="auto"><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;"><font color="#D4D4D4">Greetings from DealStryker,</font><br><br><font color="#D4D4D4">We received a request for a password reset but u</font>nfortunately there was no account found associated with this e-mail address.&nbsp;</font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;"><br></font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;">DealStryker is the better way to buy. To learn more about our platform and to sign up please visit by clicking <a href="https://www.dealstryker.com">here</a>.<br><br><font color="#D4D4D4">For further assistance and support please email us at <a href="mailto:support@dealstryker.com">support@dealstryker.com</a></font><br><br><font color="#D4D4D4">Sincerely,</font><br><font color="#D4D4D4">The DealStryker Team</font></font><br></span></div></div>',
        };
        sgMail
          .send(msg)
          .then(() => res.status(200))
          .catch((err) => {
            console.log("SendGrid sending error: ", err);
            res.status(400);
          });

        return res.send(
          "Email not found - Email sent about failed password reset"
        );
      } else {
        const SENDGRID_API_KEY =
          "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";
        const isProduction = process.env.NODE_ENV === "production";
        const token = jwt.sign(
          {
            id: user._id,
            email: user.email,
          },
          `${user.hash}-${user.createdAt}`
        );
        const link = `${isProduction
          ? "https:/chassis-staging.herokuapp.com"
          : "http://localhost:5000"
          }/resetPassword?id=${user._id}&token=${token}`;
        const msg = {
          to: email,
          from: "no-reply@dealstryker.com",
          subject: "Reset Password - DealStryker",
          html: `<div dir="auto"><div style="color: rgb(212, 212, 212); font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-size: 12px; line-height: 18px; white-space: pre;"><div>Greetings from DealStryker,</div><br><div>We received a request to reset the password for the account associated with this e-mail address.</div><div dir="auto"><br></div><div>Click the link below to reset your password.</div><br><p>${link}</p><br><div>For help and support please email us at support@dealstryker.com</div><div>Thank you for using DealStryker.</div><br><div>Sincerely,</div><div>The DealStryker Team</div><div dir="auto"><br></div><div dir="auto"><img src="cid:7494EBD88C3B4CE9AF7FEEB8D3F15DDB" style="caret-color: rgb(213, 218, 222); white-space: normal;"><br></div><div dir="auto"><br></div></div></div>`,
        };
        sgMail
          .send(msg)
          .then(() => res.status(200))
          .catch((err) => {
            console.log("SendGrid sending error: ", err);
            res.status(400);
          });
      }
    }
  );
});

// POST reset password (optional, everyone has access)
router.post("/resetPassword", auth.optional, (req, res, next) => {
  const {
    body: { id, token, newPassword },
  } = req;

  if (!id)
    return res.sendStatus(422).json({
      errors: {
        id: "is required",
      },
    });

  if (!token)
    return res.sendStatus(422).json({
      errors: {
        token: "is required",
      },
    });

  if (!newPassword)
    return res.sendStatus(422).json({
      errors: {
        newPassword: "is required",
      },
    });

  Users.findOne(
    {
      _id: id,
    },
    function (err, user) {
      if (!user) {
        return res.status(404);
      } else {
        console.log(user);
        const secret = `${user.hash}-${user.createdAt}`;
        jwt.verify(token, secret, (err, decoded) => {
          console.log(err);
          if (!err && decoded && decoded.email === user.email) {
            user.setPassword(newPassword);
            user.save().then(() => res.status(200).json({ code: 200 }));
          } else
            return res.status(200).json({
              code: 404,
              errors: {
                token: "is invalid",
              },
            });
        });
      }
    }
  );
});

// #####################
// auth verify setup
// #####################

router.post("/getUserData", auth.required, (req, res, next) => {
  const {
    body: { email },
  } = req;
  if (!email)
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });

  Users.findOne({ email })
    .populate("subuser")
    .populate("Dealership")
    .populate({
      path: "Dealership",
      populate: {
        path: "subuser",
      },
    })
    .exec(function (err, user) {
      if (err) return handleError(err);

      if (user) {
        res.status(200).json({
          user: user,
          notificationsType: user.notificationsType,
          unreadLiveBids: user.unreadLiveBids,
        });
      }
      // prints "The author is Ian Fleming"
    });
});

// #####################
// Delete Subuser
// #####################

router.post("/deleteSubUser", (req, res, next) => {
  const {
    body: { user },
  } = req;
  console.log(user);
  if (!user.email)
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });

  const email = user.email;
  Users.findOne({ email }).remove(function (err) {
    if (err) return handleError(err);

    res.status(200).json("deletion successful");

    // prints "The author is Ian Fleming"
  });
});

// #####################
// Edit Subuser
// #####################

router.post("/editUser", (req, res, next) => {
  const {
    body: { user },
  } = req;
  console.log(user);
  if (!user.email)
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });

  const email = user.email;
  if (user.type === "Manager") {
    Users.findOneAndUpdate(
      {
        // find user w/ email
        email: user.email,
      },
      {
        // edit the following:
        dealershipName: user.name,
        name: user.name,
        zip: user.zip,
        manufacturers: user.manufacturers,
      },
      null,
      function (err, docs) {
        Users.updateMany(
          {
            // find user w/ email
            Dealership: docs._id,
          },
          {
            // edit the following:
            dealershipName: user.name,
          }
        );

        if (err) {
          console.log(err);
          res.status(422).json("Houston, we have a problem"); // response failed
        } else {
          if (docs.dealershipName === docs.name) {
            Offer.updateMany(
              {
                dealershipId: docs.Dealership,
              },
              {
                // edit the following:
                dealerName: user.name,
              },
              null,
              function (err, doc) {
                if (err) {
                  console.log(err);
                  res.json("Houston, we have a problem"); // response failed
                } else {
                  Offer.find(
                    {
                      dealershipId: docs.Dealership,
                    },
                    (err, offer) => {
                      if (err) {
                        console.log(err);
                        res.json("Houston, we have a problem"); // response failed
                      } else {
                        offer.map((d) => {
                          d.biddedBy === d.dealerName
                            ? (d.biddedBy = user.name)
                            : null;

                          d.dealerName = user.name;
                          Channel.findOneAndUpdate(
                            {
                              // find user w/ email
                              offerRef: d._id,
                            },
                            {
                              // edit the following:
                              dealerName: user.name,
                            },
                            null,
                            function (err, doc) {
                              if (err) {
                                console.log(err);
                                res.json("Houston, we have a problem"); // response failed
                              } else {
                                console.log("All edited");
                              }
                            }
                          );
                          d.save();
                        });
                        console.log("Heyy" + offer);
                      }
                      console.log(doc);
                    }
                  );
                }
              }
            );
          }

          res.json("User edit successful");
          // response success
          // console.log("Original Doc : ",docs);
        }
      }
    );
  } else {
    Users.findOneAndUpdate(
      {
        // find user w/ email
        email: user.email,
      },
      {
        // edit the following:
        name: user.name,
        type: user.type,
      },
      null,
      function (err, docs) {
        if (err) {
          console.log(err);
          res.status(422).json("Houston, we have a problem"); // response failed
        } else {
          res.status(200).json("User edit successful");
          // response success
          // console.log("Original Doc : ",docs);
        }
      }
    );
  }
});

// #####################
// Edit Manufactuer
// #####################

router.post("/editManu", (req, res, next) => {
  const {
    body: { user },
  } = req;
  console.log(user);
  if (!user.email || !user.manufacturers)
    return res.status(422).json({
      errors: {
        email: "is required",
        manufacturers: "is required",
      },
    });

  const email = user.email;
  const newManuArray = user.manufacturers;

  Users.findOne(
    {
      // find user w/ email
      email: email,
    },
    function (err, result) {
      if (err) throw err;

      var DealershipID = result.Dealership;
      // The id of Dealership is the same "Dealership" object ID of all accounts associated with it.

      Users.updateMany(
        {
          Dealership: DealershipID,
        },
        {
          // edit the following:
          manufacturers: newManuArray,
        },
        null,
        function (err, docs) {
          if (err) {
            console.log(err);
            res.status(422).json("Houston, we have a problem - 536"); // response failed
          } else {
            res
              .status(200)
              .json("Dealership Group Manufacturers edit successful"); // response success
          }
        }
      );
    }
  );
});

// #####################
//     notifs setup
// #####################

router.post("/setNotificationsType", auth.required, (req, res, next) => {
  const {
    body: { email, type },
  } = req;
  if (!email)
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });

  Users.findOne({ email })
    .then((user) => {
      if (user) {
        user.setNotificationsType(type);
        user.save().then(() => res.json({ type }));
      }
    })
    .catch((err) => `changePassword failed: ${err}`);
});

// #####################
// send verify code
// #####################

router.post("/sendVerifyCode", (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }
  Users.findOne(
    {
      email: user.email,
    },
    (err, foundedUser) => {
      if (err) {
        console.log("Search in database error");
      }

      if (!foundedUser) {
        // if no user email
        res.json({ errors: "Error: not a registered email!" });
      } else {
        // if user email

        var TempCode = Math.floor(100000 + Math.random() * 900000);

        const newCode = new VerifyCodes({
          email: user.email,
          code: TempCode,
        });

        newCode.save();

        var emailTemp = '<div dir="auto"><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;" color="#000000">Greetings from DealStryker,<br><br></font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial; caret-color: rgb(212, 212, 212);"><font face="Arial" style="font-size: 12px;" color="#000000">Below is your one time use code:</font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial; caret-color: rgb(212, 212, 212);"><font face="Arial" style="font-size: 12px;" color="#000000"><br></font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial; caret-color: rgb(212, 212, 212);"><div style="font-family: Menlo, Monaco, &quot;Courier New&quot;, monospace; font-size: 12px; line-height: 18px; white-space: pre;"><div><font color="#000000">' + TempCode + '</font></div></div></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;" color="#000000"><br></font></span></div><div dir="auto"><span style="font-variant-ligatures: common-ligatures; orphans: 2; widows: 2; text-decoration-thickness: initial;"><font face="Arial" style="font-size: 12px;" color="#000000">Please be aware that this code is only valid for one hour.&nbsp;<br>For further assistance and support please email us at <a href="mailto:support@dealstryker.com">support@dealstryker.com</a><br><br>Sincerely,<br>The DealStryker Team</font><br></span></div></div>';

        const msg = {
          to: user.email,
          from: "no-reply@dealstryker.com",
          subject: "Verify Code - DealStryker",
          html: emailTemp,
        };
        sgMail
          .send(msg)
          .then(() => res.status(200))
          .catch((err) => {
            console.log("SendGrid sending error: ", err);
            res.status(400);
          });

        res.send("Success! Verify Code sent to email!");
      }
    }
  );
});

// #####################
// verify code password reset
// #####################

router.post("/checkVerifyCode", (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.code) {
    return res.sendStatus(422).json({
      errors: {
        code: "is required",
      },
    });
  }

  VerifyCodes.findOne(
    {
      email: user.email,
      code: user.code,
    }, null, { sort: { createdAt: -1 } }, (err, foundedUser) => {
      if (err) {
        console.log("Search in database error");
      }

      if (!foundedUser) {
        // if no user email
        res.json({ errors: "Error: Not Valid" });
      } else {
        // if user email exists

        res.send("Verrified!");
      }
    }
  ); // end of VerifyCode FindOne
});

router.post("/verified-passwordReset", (req, res) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.sendStatus(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if (!user.code) {
    return res.sendStatus(422).json({
      errors: {
        code: "is required",
      },
    });
  }
  if (!user.newPassword) {
    // new password
    return res.sendStatus(422).json({
      errors: {
        newPassword: "is required",
      },
    });
  }

  VerifyCodes.findOne(
    {
      email: user.email,
      code: user.code,
    }, null, { sort: { createdAt: -1 } }, (err, foundedUser) => {
      if (err) {
        console.log("Search in database error");
      }

      if (!foundedUser) {
        // if no user email
        res.json({ errors: "Error: Not Valid" });
      } else {
        // if user email exists

        Users.findOne({ email: user.email })
          .then((user) => {
            user.setPassword(newPassword);
            user.save().then(
              () => {
                VerifyCodes.deleteOne({ email: user.email, code: user.code }); // delete the verify code
                res.send("Success!"); // send success
              } // send success status
            );
          })
          .catch((err) => `changePassword failed: ${err}`);
      }
    }
  ); // end of VerifyCode FindOne
});

module.exports = router;
