import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import Header from "../../components/Header";
import { Route, Switch, Redirect } from "react-router-dom";
import { dealerRoutes, customerRoutes } from "../../routes";
import "./style.css";

import { actions as authActions } from "../../store/auth";
import { actions as bidsActions } from "../../store/bids";
import { actions as settingsActions } from "../../store/settings";
import { actions as userActions } from "../../store/user";
import Footer from "../../components/Footer";

const renderRoutes = ({ path, component, exact }) => (
  <Route key={path} exact={exact} path={path} component={component} />
);

class App extends React.Component {
  constructor(props) {
    super(props);
    props.actions.getJwtDecoded({ decodedJWT: localStorage.getItem("token") });
  }

  render() {
    const { history, isDealer, actions, userData } = this.props;
    
    const token = localStorage.getItem("token");

    return token ? (
      <React.Fragment>
        <Header
          history={history}
          isDealer={isDealer}
          actions={actions}
          userData={userData}
          onOpenSettings={() => actions.setSettingsVisibility(true)}
        />
        <section className="main">
          <div className="main-content">
            <Switch>
              {
              isDealer
                ? dealerRoutes.map((route) => renderRoutes(route))
                : customerRoutes.map((route) => renderRoutes(route))
                }
            </Switch>
          </div>
        </section>
        <Footer />
      </React.Fragment>
    ) : (
      <Redirect to="/login" />
    );
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
    userData
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

export default connect(mapStateToProps, mapDispatchToProps)(App);
