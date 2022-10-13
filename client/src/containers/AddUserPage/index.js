import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AddUserForm from "../../components/AddUserForm";
import { actions as authActions } from "../../store/auth/index";
import { Header } from "../LandingPage/common";
import Footer from "../../components/Footer";
import "./style.css";



class AddUserPage extends React.Component {
  render() {
    const  id  = this.props.location.state.id;
      
    const { history, actions, isLoading, error} = this.props;
    return (
      <React.Fragment>
        
         <section className="addUser">
           
          <AddUserForm
            id={id}
            history={history}
            onSignUp={actions.signUp}
            resetPasswordRequest={actions.resetPasswordRequest}
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
  return {
    isLoading,
    error,
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

export default connect(mapStateToProps, mapDispatchToProps)(AddUserPage);
