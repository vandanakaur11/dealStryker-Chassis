import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { bindActionCreators } from "redux";

import { actions as authActions } from "../../store/auth";
import { actions as bidsActions } from "../../store/bids";
import { actions as settingsActions } from "../../store/settings";
import { actions as userActions } from "../../store/user";

import SocketManager from "./SocketManager";
import RegistrationPage from "../RegistrationPage";
import DealerRegistrationPage from "../DealerRegistrationPage";
import LoginPage from "../LoginPage";
import App from "../App";
import ResetPasswordPage from "../ResetPasswordPage";
// import LandingPage from "../LandingPage";
import OfferRequestPageIframe from "../OfferRequestPageIframe";
// import { DealerSales } from ".././LandingPage/views/DealerSales";
import { connect } from "react-redux";
import makeAuthManager from "../../managers/auth";

const Root = ({ history, ...props }) => {
  const authManager = makeAuthManager({ storage: localStorage });
  const JWTcreds = authManager.getCredentials();

  useEffect(() => {
    if (JWTcreds) {
      props.actions.getJwtDecoded({
        decodedJWT: localStorage.getItem("token"),
      });
      localStorage.setItem("token", JWTcreds);
      // history.push("/dash");
    }
  }, [props, JWTcreds]);

  return (
    <SocketManager>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/signup" component={RegistrationPage} />
        <Route path="/signup-dealer" component={DealerRegistrationPage} />
        <Route path="/dash" component={App} />
        <Route path="/resetPassword" component={ResetPasswordPage} />
        <Route path="/carousel" component={OfferRequestPageIframe} />
        <Route path="/" render={() => (<Redirect to="/login" />)}/>
      </Switch>
    </SocketManager>
  );
};

const mapStateToProps = (state) => {
  return {
    isAuthorized: !!state.loginForm.decodedJWT,
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

export default connect(mapStateToProps, mapDispatchToProps)(Root);
