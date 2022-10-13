import React from "react";
import { connect } from "react-redux";
import { Empty, Spin, message } from "antd";
import ChatListItem from "../../components/ChatListItem";
import ChatArea from "../../components/ChatArea";
import { sendMessage } from "../App/ws";
import { actions as bidsActions } from "../../store/bids";
import { actions as userActions } from "../../store/user";
import { actions, actions as chatActions } from "../../store/chat";
import moment from "moment";
import BigButton from "../../components/BigButton";
import FileSaver from "file-saver";
import "./style.css";
import { bindActionCreators } from "redux";
import {
  createSocketAlternator,
  disconnectAlternator,
  getChatWithChannel,
  joinChannel,
  leaveChannel,
} from "../App/wsAlternator";
import makeChatApi from "../../api/chatApi";
import makeApi from "../../api";
import { uploadToS3 } from "../../api/upload-file";
import fileDownload from "js-file-download";
import axios from "axios";

class PageChat extends React.Component {
  constructor(props) {
    super(props);

    const { decodedJWT, actions } = this.props;

    actions.getChannel({ email: decodedJWT.email });
  }
  state = {
    currentChannel: undefined,
    recipientName: "",
    unreadCounts: {},
    messages: [],
    unreadLiveCounts: {},
    channels: [],
    currentChannelInfo: {},
    loading: false,
    number: 0,
    otdRequest: true,
    otdPost: true
  };

  componentDidMount(prevProps, prevState, snapshot) {
    const { roomId, offers, isLoading, ownId, userData, bids, decodedJWT, actions } = this.props;
    // console.log(offers);

    actions.getChannel({ email: decodedJWT.email });
    this.startSocketWithAlternator();
    // const foundedOffer = offers.find((offer) => offer._id === roomId);
    // this.loadChatData();
    // if (roomId) {
    //   this.setState({ currentChannel: foundedOffer });
    // }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    actions.getChannel({ email: this.props.decodedJWT.email })
    const { channels, myLoading, messages } = this.props;
    console.log("THERE IS THE CHANNEL", channels, myLoading);
    // saving the channels to state
    if (this.state.channels.length !== channels.length) {
      this.setState({ channels: channels });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { channels, myLoading, messages } = this.props;
    console.log("THERE IS THE CHANNEL", channels, myLoading);
    // saving the channels to state
    if (this.state.channels.length !== channels.length) {
      this.setState({ channels: channels });
    }

    // saving the chats from channel to state

    if (messages.length !== prevProps.messages.length) {
      this.setState({
        messages: messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      });
    }

    // if (
    // (isLoading !== prevProps.isLoading && !isLoading) ||
    // (offers && offers.length !== prevProps.offers.length)
    // ) {
    // this.loadChatData();
    // }
    // if (roomId !== prevProps.roomId && roomId) {
    // const foundedOffer = offers.find((offer) => offer._id === roomId);
    // this.setState({ currentChannel: foundedOffer });
    // }
  }

  componentWillUnmount() {
    disconnectAlternator();
  }

  startSocketWithAlternator = () => {
    createSocketAlternator(this.props, () => {
      console.log("KKKKKKK");
      this.props.actions.getChannel({ email: this.props.decodedJWT.email });
    });
  };

  createSocketConnectionWithChannelId = (id) => {
    console.log("ME GUSA");
    const { decodedJWT } = this.props;
    const callbacks = {
      user_connected: () => {
        return { room: id };
      },
    };
    joinChannel(this.props, callbacks);
    getChatWithChannel(
      {
        channelId: id,
        userId: decodedJWT.id,
      },
      (e) => {
        this.setState({
          messages: [...this.state.messages, e],
        });
      }
    );
    this.setState({ currentChannel: id });
  };
  leaveChannel = (id) => {
    console.log("ME NIKLA");
    if (this.state.currentChannel) {
      const callbacks = {
        user_connected: () => {
          return { room: this.state.currentChannel };
        },
      };

      leaveChannel(this.props, callbacks);
      this.createSocketConnectionWithChannelId(id);
    } else {
      this.createSocketConnectionWithChannelId(id);
    }
  };

  handleEndCampaign = () => {
    const { bids, actions, ownId } = this.props;
    const { currentChannel } = this.state;
    console.log("LET SEE");
    sendMessage(
      "END_CAMPAIGN",
      {
        userId: ownId,
        bidId:
          this.props.channels.filter((item) => item._id == currentChannel)[0]?.offer[0]
            ?.parentBidId || null,
      },
      (res) => {
        console.log("CHECK THISSSS!!", res, {
          userId: ownId,
          bidId:
            this.props.channels.filter((item) => item._id == currentChannel)[0]?.offer[0]
              ?.parentBidId || null,
        });
        if (!res.error) {
          const newLiveBids = [...bids];

          const bidIndex = newLiveBids.findIndex((bid) => bid._id === currentChannel);
          if (bidIndex >= 0) {
            newLiveBids[bidIndex].isClosed = true;
            const offersArr = newLiveBids[bidIndex].responses;
            if (offersArr && offersArr.length)
              offersArr.forEach((offer) => {
                offer.isClosed = true;
                actions.removeUnread({ id: offer._id });
              });
          }
          actions.setBids(newLiveBids);
          actions.getChannel({ email: this.props.decodedJWT.email });
        }
      }
    );
  };

  send = (text, type, formDate) => {
    const { ownId, decodedJWT, userData, isDealer } = this.props;
    const { currentChannel } = this.state;
    const channel = this.props.channels.filter((item) => item._id == currentChannel)[0];

    let message = {
      type: type,
      text,
      formDate,
      userId: ownId,
      email: decodedJWT.email,
      name: isDealer ? userData?.user?.name || "dealer" : "customer",
      date: moment().format("X"),
    };
    console.log(userData);
    console.log("THE USER", this.props.decodedJWT);
    console.log("HEREEEE");
    let myMessage = {
      channelId: currentChannel,
      text: text,
      email: this.props.decodedJWT.email,
      name: isDealer ? userData?.user?.name || "dealer" : channel?.buyerName,
      role: this.props.decodedJWT.role,
      isFile: false,
    };

    this.props.actions.sendChat(myMessage);
  };

  requestOtd = () => {
    const {bids, actions, ownId} = this.props
    const {currentChannel} = this.state
    const {decodedJWT, userData, isDealer} = this.props
    const channel = this.props.channels.filter((item) => item._id == currentChannel)[0];

    console.log('LET SEE')
     console.log(actions)  
     console.log(currentChannel+"Heyy")
     let data = {
        channelId: currentChannel,
        email: this.props.decodedJWT.email,
        name: isDealer ? userData ?. user ?. name || 'dealer' : channel ?. buyerName,
        role: this.props.decodedJWT.role,
    }     
    this.setState({otdRequest:true});
    actions.requestOtd(data);
    actions.getChannel({ email: decodedJWT.email })

}
sendOtd = (OfferPrice, Vin) => {
    const {bids, actions, ownId} = this.props
    const {currentChannel} = this.state
    const {decodedJWT, userData, isDealer} = this.props
    const channel = this.props.channels.filter((item) => item._id == currentChannel)[0];

    console.log('LET SEE')
     console.log(actions)  
     console.log(currentChannel+"Heyy")
     let data = {
        channelId: currentChannel,
        otdPrice: OfferPrice,
        vin: Vin,
        email: this.props.decodedJWT.email,
        name: isDealer ? userData ?. user ?. name || 'dealer' : channel ?. buyerName,
        role: this.props.decodedJWT.role,
    }     
    this.setState({otdPost: true});
    actions.sendOtd(data);
    actions.getChannel({ email: decodedJWT.email })


}
  addUser = (userId) => {
    const { currentChannel } = this.state;
    const channel = this.props.channels.filter((item) => item._id == currentChannel)[0];
    const offerId = channel.offerRef;
    console.log(channel.offerRef);
    sendMessage(
      "ADD_MEMBER_REQUEST",
      {
        userId,
        offerId,
      },
      (status) => message.info(status)
    );
  };

  clickRedirectToOffers = () => {
    this.props.history.push("/dash");
  };

  clickRedirectToChat = () => {
    this.props.history.push("/dash/chat");
    this.props.history.go(0); // this is to help with the refresh issue by manually calling it after pushing - BH
  };
  getCount = (array) => {
    let count = 0;
    for (let [key, value] of Object.entries(array)) {
      count += value;
    }
    return count;
  };

  sendFile = async (event) => {
    const fileObj = event;
    if (!fileObj) {
      return;
    }
    const chat = makeApi().chat;
    let api = await chat.getFileUrl({
      channel: this.state.currentChannel,
      contentType: fileObj.type,
      fileName: fileObj.name,
      email: this.props.decodedJWT.email,
    });
    console.log("LET ME CHECK WHAT I GOT", api);
    if (api.status == 200) {
      let { PutUrl, data } = api.data;
      let fileType = fileObj.type;
      let fileContents = fileObj;
      const filePath = await uploadToS3({ presignedPostUrl: PutUrl, fileType, fileContents });
      const { ownId, decodedJWT, userData, isDealer } = this.props;
      const { currentChannel } = this.state;
      const channel = this.props.channels.filter((item) => item._id == currentChannel)[0];

      console.log("THE USER", this.props.decodedJWT);
      let myMessage = {
        channelId: currentChannel,
        email: this.props.decodedJWT.email,
        name: isDealer ? userData?.user?.name || "dealer" : channel?.buyerName,
        role: this.props.decodedJWT.role,
        isFile: true,
        fileName: fileContents.name,
        fileURL: data,
      };

      this.props.actions.sendChat(myMessage);
      // setS3FileUrl(`${S3_BUCKET_URL}/${filePath}`)
    }
  };

  downLoadFile = (id, name) => {
    // FileSaver(id, name);
    console.log(name);
    axios.get(id, { responseType: "blob" }).then((res) => {
      fileDownload(res.data, name);
    });
  };

  render() {
    const {
      ownId,
      decodedJWT,
      isDealer,
      offers,
      isLoading,
      unreadLiveBids,
      history,

      userData,
    } = this.props;

    const { currentChannel, unreadCounts, messages } = this.state;

    if (currentChannel && currentChannel._id) {
      this.pubnub.fetchMessages(
        {
          channels: [currentChannel._id],
        },
        (status, response) => {
          if (response.channels)
            this.setState({
              messages: Object.values(response.channels)[0],
            });
        }
      );
    }

    let user = {
      id: ownId,
      avatar: "",
      name: decodedJWT.email,
      lastMessage: "Gooo",
    };
    let totalChatCount = this.getCount(unreadCounts);
    console.log(this.props.channels);
    return (
      <div className="chat-wrapper">
        <section className="chat">
          <div className="chat-top-buttons">
            {userData?.user?.type != "Finance" ? (
              <BigButton
                text="Offers"
                unreadCount={unreadLiveBids.length}
                clickRedirect={this.clickRedirectToOffers}
                isSelected={history.location.pathname === "/dash"}
              />
            ) : (
              ""
            )}
            <BigButton
              text="Chatting"
              unreadCount={totalChatCount}
              clickRedirect={this.clickRedirectToChat}
              isSelected={history.location.pathname === "/dash/chat"}
            />
          </div>
          <div className="message-container">
            <span className="message-container-title">Chat</span>
            {isLoading ? (
              <div className="live-bids-spinner">
                <Spin size="large" />
              </div>
            ) : // ) : offers && offers.length ? (
            this.state.channels && this.state.channels.length ? (
              <div className="message-container-area">
                <div className="chatlist">
                  {this.props.channels
                    .sort((a, b) => -a.lastActive + b.lastActive)
                    .map((item) => (
                      <ChatListItem
                        isDealer={isDealer}
                        key={item._id}
                        {...user}
                        offer={item}
                        unreadCount={item.unRead}
                        isCurrent={currentChannel === item._id}
                        // isClosed={item.isClosed}

                        send={this.send}
                        onChangeChannel={(channel) => {
                          
                          this.setState({currentChannelInfo: channel, otdRequest: channel?.otdRequest, otdPost: channel?.otdPost});
console.log("otdPost"+channel?.otdPost);
console.log("otdRequest"+channel?.otdRequest);

                          this.props.actions.getChat({
                            channel: channel._id,
                            email: this?.props?.decodedJWT?.email,
                          });
                          this.leaveChannel(channel._id);
                          // this.setState({ currentChannel:  });
                        }}
                      />
                    ))}{" "}
                </div>

                <div
                  className={
                    "chat-area" + (currentChannel && currentChannel.isClosed ? " closed" : "")
                  }
                >
                  <ChatArea
                    currentChannel={this.state.currentChannelInfo}
                    userData={userData}
                    addUser={this.addUser}
                    toUser={user}
                    send={this.send}
                    sendFile={this.sendFile}
                    downLoadFile={this.downLoadFile}
                    messages={this.state.messages || []}
                    selfID={ownId}
                    otdRequest={this.state.otdRequest}
                    otdPost={this.state.otdPost}
                    requestOtd ={this.requestOtd}
                    sendOtd ={this.sendOtd}
                    recipientName={
                      currentChannel &&
                      (isDealer ? currentChannel.customerName : currentChannel.dealerName)
                    }
                    disabled={!currentChannel}
                    isClosed={
                      (currentChannel &&
                        this.props?.channels?.filter((item) => item._id == currentChannel)[0]
                          ?.offer[0]?.isClosed) ||
                      null
                    }
                    isDealer={isDealer}
                    endCampaign={this.handleEndCampaign}
                  />
                </div>
              </div>
            ) : (
              <Empty
                description={
                  isDealer
                    ? "Sorry no chatting is available right now, please check back later!"
                    : "Sorry no offers are available right now, please check back later!"
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}{" "}
          </div>
        </section>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const { decodedJWT } = state.loginForm;
  const { bids = [], loading } = state.bids;
  const { roomId, channels, isLoading, messages } = state.chat;
  const { unreadLiveBids, userData } = state.user;
  const offers = [];
  bids.forEach((bid) => offers.push(...bid.responses.filter((offer) => offer.isAccepted)));
  offers.forEach((offer) => {
    const parentBid = bids.find((bid) => bid._id === offer.parentBidId);
    if (parentBid && parentBid.name) offer.customerName = parentBid.name;
  });

  return {
    isDealer: decodedJWT && decodedJWT.role === "dealer",
    ownId: decodedJWT && decodedJWT.id,
    decodedJWT,
    roomId,
    bids,
    offers,
    messages,
    channels,
    isLoading: loading,
    myLoading: isLoading,
    unreadLiveBids,
    userData,
  };
}

// function mapDispatchToProps(dispatch) {
// return {
//     actions: bindActionCreators(
//       {
//         ...bidsActions,
//         ...userActions,
//         ...chatActions,
//       },
//       dispatch
//     ),
// };
// }

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...bidsActions,  
      ...userActions,
      ...chatActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(PageChat);