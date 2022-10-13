import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import ManagerUsersTable from "../../components/ManagerUsersTable";
import { actions as authActions } from "../../store/auth/index";
import { Header } from "../LandingPage/common";
import Footer from "../../components/Footer";
import "./style.css";



class ManageUsers extends React.Component {
  render() {
      
    const { history, actions, isLoading, error, userData } = this.props;
    return (
      <React.Fragment>
        
         <section className="addUser">
           
          <ManagerUsersTable
            userData={userData}
            history={history}
            actions={actions}
            isLoading={isLoading}
            error={error}
          />
        </section>
      
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { isLoading, error } = state.loginForm;
  const {userData} = state.user;
  return {
    isLoading,
    error,
    userData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...authActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ManageUsers);
