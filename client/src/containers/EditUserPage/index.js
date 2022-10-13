import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import EditForm from "../../components/EditForm";
import { actions as authActions } from "../../store/auth/index";
import { actions as requestActions } from "../../store/requestForm";
import { Header } from "../LandingPage/common";
import Footer from "../../components/Footer";
import "./style.css";



class EditUserPage extends React.Component {
  render() {
    const  user  = this.props.location.state.user;
      
    const { history, actions, isLoading, error,manufacturers } = this.props;
    return (
      <React.Fragment>
        
         <section className="addUser">
           
          <EditForm
            manufacturers={manufacturers}    
            user={user}
            history={history}
            actions={actions}
            editUser={actions.editUser}
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
  const { manufacturers } = state.requestForm;
  return {
    manufacturers,
    isLoading,
    error,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...authActions,
      ...requestActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(EditUserPage);
