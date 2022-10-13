import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { createSocket, disconnect } from "../App/ws.js";

import { actions as authActions } from "../../store/auth";
import { actions as bidsActions } from "../../store/bids";
import { actions as settingsActions } from "../../store/settings";
import { actions as userActions } from "../../store/user";
import { sendMessage } from "../App/ws";
import { message } from "antd";

class SocketManager extends React.Component {
  constructor(props) {
    console.log("constructor props >>>>>>>>>>>", props);

    super(props);
    props.actions.getJwtDecoded({ decodedJWT: localStorage.getItem("token") });
  }

  componentDidMount() {
    const { userId, actions, email } = this.props;

    console.log("this.props >>>>>>>>>", this.props);

    if (userId) {
      this.startWS();
      actions.getUserData({ email });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { userId, actions, email, isLoading } = this.props;
    if (prevProps.userId !== userId) {
      if (userId) {
        this.startWS();
        actions.getUserData({ email });
      } else disconnect();
    }
    if (isLoading !== prevProps.isLoading && userId)
      this.createSavedOffer(userId);
  }

  componentWillUnmount() {
    disconnect();
  }

  createSavedOffer = (userId) => {
    const { actions, bids } = this.props;
    const offerRequestProgressJSON = localStorage.getItem(
      "offerRequestProgress"
    );
    let preparedObj = offerRequestProgressJSON
      ? JSON.parse(offerRequestProgressJSON)
      : null;
    if (preparedObj) {
      preparedObj.userId = userId;
      sendMessage(
        "OFFER_REQUEST_CREATED",
        preparedObj,
        (code, offerRequest) => {
          if (code === 200 && offerRequest) {
            actions.setBids([...bids, offerRequest]);
            message.success(
              `Offer request created (${preparedObj.manufacturer} ${preparedObj.car})`,
              10
            );
            localStorage.removeItem("offerRequestProgress");
          } else if (code === 400) {
            message.info(
              "Sorry, we are not in your area yet. Sign up to be notified when we are",
              10
            );
            localStorage.removeItem("offerRequestProgress");
          } else if (code === 409) {
            message.error("Limited to 3 bids in a time", 10);
            localStorage.removeItem("offerRequestProgress");
          } else
            message.error("Error during saving offer. Try to refresh page", 10);
        }
      );
    }
  };

  startWS = () => {
    const { actions } = this.props;
    const callbacks = {
      get_userId: () => this.props.userId,
      get_isDealer: () => this.props.isDealer,
      get_props: () => this.props,
      set_bids: actions.setBids,
    };

    createSocket(this.props, callbacks);
  };

  render() {
    return <React.Fragment>{this.props.children}</React.Fragment>;
  }
}

const mapStateToProps = (state) => {
  const { decodedJWT } = state.loginForm;
  const { bids = [], loading } = state.bids;
  const { isLoading: isLoadingUserData, unreadLiveBids, userData } = state.user;
  return {
    isDealer: decodedJWT && decodedJWT.role === "dealer",
    userId: decodedJWT ? decodedJWT.id : null,
    email: decodedJWT && decodedJWT.email,
    bids: bids,
    isLoading: loading,
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
      ...settingsActions,
      ...userActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(SocketManager);
