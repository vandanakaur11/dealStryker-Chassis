import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { actions as authActions } from "../../store/auth/index";
import { actions as requestActions } from "../../store/requestForm";
import DealerRegistrationPage from "../../components/DealerRegistrationPage";

const mapStateToProps = (state) => {
  const { manufacturers } = state.requestForm;
  return {
    manufacturers,
    isLoading: state.loginForm.isLoading,
    error: state.loginForm.error,
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

export default connect(mapStateToProps, mapDispatchToProps)(DealerRegistrationPage);
