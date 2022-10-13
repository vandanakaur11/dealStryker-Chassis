import React, { useEffect, useState } from "react";
import Iframe from "../../components/Iframe";
import OfferRequestPageIframe from "../OfferRequestPageIframe";

const OfferRequestPage = (props) => {
  const [height, setHeight] = useState(0);
  return (
    // <Iframe height={height}>
    <OfferRequestPageIframe {...props} changeHeight={setHeight} />
    // </Iframe>
  );
};

export default OfferRequestPage;
