import React from "react";
import { Button, Modal, Input, Table, message, Empty, Spin } from "antd";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import BigButton from "../../components/BigButton";
import AreaTable from "./../../components/AreaTable";
import { actions as authActions } from "../../store/auth/index";
import { actions as bidsActions } from "../../store/bids";
import { actions as chatActions } from "../../store/chat";
import { actions as requestActions } from "../../store/requestForm";
import { actions as userActions } from "../../store/user";
import { sendMessage } from "../App/ws.js";
import "./style.css";
import { Collapse } from "antd";
import { usePubNub } from "pubnub-react";
import PubNub from "pubnub";
import { relativeTimeThreshold } from "moment";
import CurrencyInput from 'react-currency-input-field';

class LiveBidsPage extends React.Component {
  constructor(props) {
    super(props);
    const pubnub = new PubNub({
      publishKey: "pub-c-52a85dfa-7124-4c33-9a53-d9165416ac22",
      subscribeKey: "sub-c-d6be03d2-3337-11ec-b2c1-a25c7fcd9558",
    });

    this.priceInput = React.createRef();
    this.pubnub = pubnub;
  }

  state = {
    visible: false,
    requestId: "",
    unreadCounts: {},
    price:"",
  };

  componentDidMount() {
    this.props.actions.getChannel({ email: this.props.decodedJWT.email });
    // this.loadUnreadCount();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.channels !== this.props.channels)
      this.unReadCountFromChannel();
    // this.loadUnreadCount();
  }

  //   componentWillUnmount() {
  //     // fix Warning: Can't perform a React state update on an unmounted component
  //     this.setState = (state,callback)=>{
  //         return;
  //     };
  // }

  //   componentWillReceiveProps(nextProps){
  //     if (this.props.unreadCounts !== nextProps.unreadCounts){
  //       this.setState({
  //         unreadCounts: nextProps.unreadCounts
  //       })
  //     }
  //   }

  handleMarkRead = (id) => {
    const { userId, actions } = this.props;
    sendMessage("MARK_AS_READ", { userId, id }, (res) => {
      if (res === true) {
        actions.removeUnread({ id });
      }
    });
  };
  renderTable = (bids) => {
    const { userId, isDealer, isLoading, unreadLiveBids } = this.props;
    
    const filtered = bids.filter((el) => !el.isClosed);

    console.log(bids);
    if (!isLoading && (!filtered || !filtered.length)) {
      return (
        <Table
          dataSource={filtered}
          columns={this.getColumns()}
          locale={this.getLocale()}
        />
      );
    } else {
      return filtered.map((bid) => {
        return (
          <AreaTable
            key={bid._id}
            id={bid._id}
            unreadLiveBids={unreadLiveBids}
            handleMarkRead={this.handleMarkRead}
            userId={userId}
            isDealer={isDealer}
            dataSource={bid?.responses?.sort((a, b) => -a.price + b.price)}
            requestInfo={bid}
            setBidClosed={this.setBidClosed}
            columns={this.getColumns()}
            loading={isLoading}
            locale={this.getLocale()}
          />
        );
      });
    }
  };

  renderTable2 = (bids) => {
    const { isLoading, unreadLiveBids, userId } = this.props;
    const filtered = bids.filter((bid) => !bid.isClosed).sort((a, b) => -a.createdAt + b.createdAt);

    return (
      <Table
        dataSource={filtered}
        columns={this.getColumns()}
        loading={isLoading}
        locale={this.getLocale()}
        rowClassName={(record) =>
          unreadLiveBids.indexOf(record._id) !== -1 ? "new" : ""
        }
        onRow={(record) => {
          return {
            onMouseEnter: () => {
              return unreadLiveBids.indexOf(record._id) !== -1
                ? this.handleMarkRead(record._id)
                : {};
            },
          };
        }}
      />
    );
  };

  setBidClosed = (bidId) => {
    const { bids, actions } = this.props;
    const newLiveBids = [...bids];

    const bidIndex = newLiveBids.findIndex((bid) => bid._id === bidId);
    if (bidIndex >= 0) {
      newLiveBids[bidIndex].isClosed = true;
      const offersArr = newLiveBids[bidIndex].responses;
      if (offersArr && offersArr.length)
        newLiveBids[bidIndex].responses.forEach((offer) => {
          offer.isClosed = true;
          actions.removeUnread({ id: offer._id });
        });
    }

    actions.setBids(newLiveBids);
  };

  clickRedirectToOffers = () => {
    this.props.history.push("/dash");
  };

  clickRedirectToChat = () => {
    this.props.history.push("/dash/chat");
  };

  onCancel = () => {
    this.setState({ visible: false });
  };

  onClickDealer = (requestId) => {
    const { userId, bids, actions, userData, history } = this.props;
    const foundedBid = bids && bids.find((bid) => bid._id === requestId);
    // console.log(userData);
    if (foundedBid && foundedBid.responses) {
      const foundedOwnOffer = foundedBid.responses.find(
        (offer) => offer.members.includes(userId) || offer.dealerId === userId
      );
      if (foundedOwnOffer) {
        if (foundedOwnOffer.isAccepted) {
          return actions.setRecipient({ offerId: foundedOwnOffer._id });
        } else return this.setState({ visible: true, requestId });
      }
    }

    return this.setState({ visible: true, requestId });
  };

  dealerActionBtn = (requestId) => {
    const { userId } = this.props;
    const { bids, history } = this.props;
    const foundedBid = bids && bids.find((bid) => bid._id === requestId);
    if (foundedBid && foundedBid.responses) {
      const foundedOwnOffer = foundedBid.responses.find(
        (offer) => offer.members.includes(userId) || offer.dealerId === userId
      );
      if (foundedOwnOffer) {
        if (foundedOwnOffer.isAccepted) return "Chat";
        else return "Update";
      }
    }
    return "Send Offer";
  };

  requestPrice = () => {
    const { requestId } = this.state;
    const { userId, bids, actions, userData } = this.props;

    const requestData = {
      requestId,
      dealerId: userId,
      bids,
      dealerInformation: userData,
      price: this?.state?.price,
    };

    const newBids = [...bids];

    sendMessage("OFFER_CREATED", requestData, (code, offer) => {
      if (code === 200 && offer) {
        message.success("Offer Was Sent!");
        let bidIndex;
        if (offer.parentBidId) {
          bidIndex = newBids.findIndex((bid) => offer.parentBidId === bid._id);
          if (bidIndex >= 0) {
            newBids[bidIndex].responses = [
              ...newBids[bidIndex].responses,
              offer,
            ];
            actions.setBids([...newBids]);
          }
        }
      } else if (code === 201 && offer) message.success("Offer Was Updated!");
      else message.success(`Offer already made by your dealership ${code}`);
    });

    this.onCancel();
  };

  connectDealership = (offerId) => {
    const { bids, actions, userData, decodedJWT } = this.props;

    sendMessage("OFFER_ACCEPTED", offerId, (foundedOffer) => {
      if (foundedOffer) {
        const bidId = foundedOffer.parentBidId;
        const newLiveBids = [...bids];
        const bidIndex = newLiveBids.findIndex((bid) => bid._id === bidId);
        if (bidIndex >= 0) {
          const offersArr = newLiveBids[bidIndex].responses;
          if (offersArr && offersArr.length) {
            newLiveBids[bidIndex].responses.some((offer) => {
              if (offer._id === offerId) {
                offer.isAccepted = true;
                return true;
              }
              return false;
            });
          }
        }
        actions.setBids(newLiveBids);
        actions.setRecipient({ offerId: foundedOffer._id });
        actions.addChannel({
          email: decodedJWT.email,
          offerId: foundedOffer._id,
          name: "Mahad bajwa me",
        });
        console.log("offer accepted successfully");
      } else console.log("offer acceptation error");
    });
  };
  displayPrice(requestId) {
    const { userId } = this.props;
    const { bids } = this.props;
    const foundedBid = bids && bids.find((bid) => bid._id === requestId);
    if (foundedBid && foundedBid.responses) {
      const foundedOwnOffer = foundedBid.responses.find(
        (offer) => offer.members.includes(userId) || offer.dealerId === userId
      );
      if (foundedOwnOffer) {
        return foundedOwnOffer.price;
      }
    }
    return " ";
  }
  displayDealerName(requestId) {
    const { userId } = this.props;
    const { bids } = this.props;
    const foundedBid = bids && bids.find((bid) => bid._id === requestId);
    if (foundedBid && foundedBid.responses) {
      const foundedOwnOffer = foundedBid.responses.find(
        (offer) => offer.members.includes(userId) || offer.dealerId === userId
      );
      if (foundedOwnOffer) {
        return foundedOwnOffer.biddedBy;
      }
    }
    return "Not Yet Claimed";
  }
  getColumns = () => {
    const { isDealer } = this.props;

    if (isDealer) {
      return [
        {
          title: "Name",
          dataIndex: "name",
          key: "name",
        },
        {
          title: "Year",
          dataIndex: "year",
          key: "year",
        },
        {
          title: "Color",
          dataIndex: "color",
          key: "color",
        },
        {
          title: "Manufacturer",
          dataIndex: "manufacturer",
          key: "manufacturer",
        },
        {
          title: "Model",
          dataIndex: "car",
          key: "car",
        },
        {
          title: "Trim",
          dataIndex: "model",
          key: "model",
        },
        {
          title: "Finance Preference",
          dataIndex: "financing",
          key: "financing",
        },
        {
          title: "Offer By",
          dataIndex: "_id",
          key: "_id",
          render: (requestId) => (
            <span>{this.displayDealerName(requestId)}</span>
          ),
        },
        {
          title: "Offer Price",
          dataIndex: "_id",
          key: "_id",
          render: (requestId) => <span>{this.displayPrice(requestId)}</span>,
        },
        {
          title: "Action",
          dataIndex: "_id",
          key: "_id",
          render: (requestId) => (
            <span>
              {
                <Button onClick={() => this.onClickDealer(requestId)}>
                  {this.dealerActionBtn(requestId)}
                </Button>
              }
            </span>
          ),
        },
      ];
    } else {
      return [
        {
          title: "Dealership",
          dataIndex: "dealerName",
          key: "dealerName",
        },
        {
          title: "Offers",
          dataIndex: "price",
          key: "price",
        },
        {
          title: "Actions",
          dataIndex: "_id",
          key: "_id",
          render: (offerId) => (
            <span>
              <Button onClick={() => this.connectDealership(offerId)}>
                Chat With Dealership
              </Button>
            </span>
          ),
        },
      ];
    }
  };

  getLocale = () => {
    const { isDealer } = this.props;
    return {
      emptyText: (
        <Empty
          description={
            isDealer
              ? "Sorry no leads are available right now, please check back later!"
              : "Sorry no offers are available right now, please check back later!"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ),
    };
  };
  handleSubmit = (email) => {
    const { actions } = this.props;

    // console.log(actions);
    actions.deleteSubuser({
      email,
    });
  };

  loadUnreadCount = () => {
    const { userData, offers } = this.props;

    if (offers?.length) {
      console.log(offers);
      sendMessage(
        "GET_LAST_SEEN_LIST",
        { userId: userData?.user?._id },
        (list) => {
          this.pubnub.messageCounts(
            {
              channels: offers.map((offer) => offer._id),
              channelTimetokens: [
                offers.map((offer) =>
                  list[offer._id]
                    ? list[offer._id].toString()
                    : (new Date().getTime() * 10000).toString()
                ),
              ],
            },
            (status, results) => {
              console.log(userData?.user?._id);
              if (results && results.channels)
                this.setState({ unreadCounts: results.channels });
            }
          );
        }
      );
    }
  };

  //unread count from channel

  unReadCountFromChannel = () => {
    let { channels } = this.props;
    let unReadMessages = 0;
    if (channels?.length > 0) {
      channels.map((channel) => {
        if (channel.unRead > 0) {
          unReadMessages = unReadMessages + channel.unRead;
        }
      });
    }
    return unReadMessages;
  };

  getCount = (array) => {
    let count = 0;
    for (let [key, value] of Object.entries(array)) {
      count += value;
    }
    return count;
  };

  render() {
    const {
      isDealer,
      history,
      bids,
      isLoading,
      unreadLiveBids,
      userId,
      userData,
    } = this.props;
    const { visible, unreadCounts } = this.state;
    console.log(bids);

    let totalChatCount = this.getCount(unreadCounts);
    return (
      <React.Fragment>
        <section className="main-info">
          {userData?.user?.type != "Finance" ? (
            <div className="live-bids">
              <div className="live-bids-wrapper-big-button">
                <BigButton
                  text="Offers"
                  unreadCount={unreadLiveBids.length}
                  clickRedirect={this.clickRedirectToOffers}
                  isSelected={history.location.pathname === "/dash"}
                />
                <BigButton
                  text="Chatting"
                  unreadCount={this.unReadCountFromChannel()}
                  clickRedirect={this.clickRedirectToChat}
                  isSelected={history.location.pathname === "/dash/chat"}
                />
              </div>

              <div className="live-bids-head">
                {!isDealer &&
                  bids &&
                  !isLoading &&
                  bids.filter((bid) => !bid.isClosed).length < 3 && (
                    <Button
                      type="default"
                      onClick={() => history.push("/dash/requestOffer")}
                    >
                      Create new request
                    </Button>
                  )}
              </div>

              {isLoading ? (
                <div className="live-bids-spinner">
                  <Spin size="large" />
                </div>
              ) : isDealer ? (
                this.renderTable2([...bids].reverse())
              ) : (
                this.renderTable([...bids].reverse())
              )}
            </div>
          ) :     this.props.history.push("/dash/chat")}
        </section>

        <Modal
          title="Send Offer"
          className="centre BindOnLeadModal"
          visible={visible}
          onCancel={this.onCancel}
          footer={[
            <Button key="submit" type="primary" onClick={this.requestPrice}>
              Submit
            </Button>,
          ]}
        >
          <CurrencyInput
            id="InputOffer"
            name="input-name"
            defaultValue={1000}
            prefix="$"
            decimalsLimit={2}
            ref={this.priceInput} 
            className={`form-control`}
            style={{width: "100%"}}
            placeholder="Offer Price"
            onValueChange={(value, name) =>
            {
              this.setState({ price: value}); 
              console.log(value, name);
            
            }}
          />
          {/* <Input ref={this.priceInput} placeholder="Offer Price" /> */}
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { decodedJWT } = state.loginForm;
  const { bids = [], loading } = state.bids;
  const { channels } = state.chat;
  const {
    isLoading: isLoadingUserData,
    unreadLiveBids = [],
    userData,
  } = state.user;
  const offers = [];
  bids.forEach((bid) =>
    offers.push(...bid.responses.filter((offer) => offer.isAccepted))
  );
  offers.forEach((offer) => {
    const parentBid = bids.find((bid) => bid._id === offer.parentBidId);
    if (parentBid && parentBid.name) offer.customerName = parentBid.name;
  });
  // console.log(offers)
  return {
    isDealer: decodedJWT && decodedJWT.role === "dealer",
    userId: decodedJWT.id,
    decodedJWT,
    requests: state.requestF,
    offers,
    bids: bids,
    isLoading: loading,
    channels,
    isLoadingUserData,
    unreadLiveBids,
    userData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...bidsActions,
      ...chatActions,
      ...requestActions,
      ...userActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(LiveBidsPage);
