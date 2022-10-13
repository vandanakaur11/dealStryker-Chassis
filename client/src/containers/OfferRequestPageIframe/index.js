import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import OfferRequestForm from "../../components/OfferRequestForm";
import { actions as bidsActions } from "../../store/bids";
import { actions as requestActions } from "../../store/requestForm/index";
import InjectMedia from "../../components/media-detail";

const OfferRequestPage = (props) => {
  return <InjectMedia Component={OfferRequestForm} {...props}></InjectMedia>;
};

const mapStateToProps = (state) => {
  const {
    isLoading,
    error,
    manufacturers,
    vehicles,
    years,
  } = state.requestForm;
  const { bids = [] } = state.bids;
  return {
    id: state.loginForm.decodedJWT && state.loginForm.decodedJWT.id,
    isLoading,
    error,
    manufacturers,
    years,
    vehicles,
    bids,
  };
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(
    {
      ...bidsActions,
      ...requestActions,
    },
    dispatch
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(OfferRequestPage);
