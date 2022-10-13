import React from "react";
import { Header } from ".././common/Header.jsx";
import Footer from "../../.././components/Footer/index.jsx";

var Center = require("react-center");

var styles = {
  topHat: {},
  centreBody: {
    marginRight: "20%",
    marginLeft: "20%",
    marginTop: "5%",
    marginBottom: "5%",
    fontSize: "20px",
  },
  space: {
    marginTop: "10vh",
  },
  ListCenter: {
    width: "35vw",
    marginLeft: "32.5vw",
    marginRight: "32.5vw",
    fontSize: "1.5em",
  },
  firstTitle: {
    color: "#2EA4DB",
    textAlign: "center",
    marginTop: "7vh",
  },
  blueTitles: {
    color: "#2EA4DB",
    textAlign: "center",
  },
  sales: {
    width: "60vw",
    marginLeft: "20vw",
    marginRight: "20vw",
  },
};

export const DealerSales = () => {
  return (
    <div>
      <Header />

      <div style={styles.topHat}>
        <br />
        <br />
        <br />
        <div className="row d-flex justify-content-center">
          <div className="align col-sm-12 col-md-6">
            <a
              href="/signup"
              role="button"
              className="btn btn-lg btn-call-to-action"
              rel="noopener noreferrer"
            >
              Sign Up Now!{" "}
            </a>
          </div>
        </div>

        <br />

        <h4 style={styles.firstTitle}> Want More Quality Leads? </h4>
        <br />

        <ul style={styles.ListCenter}>
          {" "}
          At DealStryker, we understand the importance of leads to the success
          of your dealership.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          Our platform provides leads that are ready to negotiate a purchase
          price.{" "}
        </ul>

        <br />
        <h4 style={styles.blueTitles}>What DealStryker Offers: </h4>
        <br />
        <ul style={styles.ListCenter}>
          {" "}
          A unique sales environment to help dealerships better compete with
          online retailers.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          Dealerships the ability to individually select each lead.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          High-quality leads that are looking to negotiate a price on a specific
          vehicle.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          DealStryker focuses on lead generation rather than car searching.
        </ul>
        <br />
        <h4 style={styles.blueTitles}>Special Features: </h4>
        <br />
        <ul style={styles.ListCenter}>
          {" "}
          Online dashboard helps turn leads into sales.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          Chatting feature provides direct communication with potential buyers.
        </ul>
        <ul style={styles.ListCenter}>
          {" "}
          Can send contracts through our platform.
        </ul>
        <br />
        <h4 style={styles.blueTitles}>How It Works: </h4>
        <img style={styles.sales} src="/assets/sales.svg" />
        <div className="row d-flex justify-content-center">
          <div className="align col-sm-12 col-md-6">
            <a
              href="/signup"
              role="button"
              className="btn btn-lg btn-call-to-action"
              rel="noopener noreferrer"
            >
              Sign Up Now!{" "}
            </a>
          </div>
        </div>

        <br />
        <br />
        <br />
        <h5 style={{ textAlign: "center" }}>
          {" "}
          If you would like to speak to a repersentive email us at:{" "}
          <a href="mailto:contact@dealstryker.com ">
            contact@dealstryker.com
          </a>{" "}
        </h5>
        <br />
        <h5 style={{ textAlign: "center" }}>
          {" "}
          Or message us on Twitter{" "}
          <a href="https://twitter.com/DealStryker"> @DealStryker </a>{" "}
        </h5>
        <br />
      </div>

      <div style={styles.space}>
        {" "}
        <Footer />
      </div>
    </div>
  );
};
