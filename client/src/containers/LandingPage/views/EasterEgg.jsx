import React from "react";
var Center = require("react-center");

var styles = {
  centreBody: {
    marginRight: "20%",
    marginLeft: "20%",
    marginTop: "5%",
    fontSize: "20px",
  },
  egg: {
    width: "20vw",
    marginLeft: "40vw",
    marginRight: "40vw",
    marginBottom: "10vh",
  },
  blueTitles: {
    color: "#2EA4DB",
    textAlign: "center",
  },
};

export const EasterEgg = () => {
  return (
    <div style={styles.topHat}>
      <div style={styles.centreBody}>
        <h3 style={styles.blueTitles}> Ya ha ha! You found me! </h3>
        <p style={{ textAlign: "center" }}> Click the Egg to go Home. </p>
        <br />
      </div>
      <a href="/">
        {" "}
        <img style={styles.egg} src="/assets/egg.png" />{" "}
      </a>
    </div>
  );
};
