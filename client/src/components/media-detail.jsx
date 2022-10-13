import React from "react";
import { useMediaQuery } from "react-responsive";

const InjectMedia = ({ Component, ...other }) => {
  // const small = useMediaQuery({ maxWidth: 767 });
  // const medium = useMediaQuery({ minWidth: 768, maxWidth: 1199 });
  // const large = useMediaQuery({ minWidth: 1200 });
  const small = useMediaQuery({ maxWidth: 425 });
  const medium = useMediaQuery({ minWidth: 426, maxWidth: 768 });
  const large = useMediaQuery({ minWidth: 769 });

  return <Component {...other} mobileQueryMatches={{ small, medium, large }} />;
};

export default InjectMedia;
