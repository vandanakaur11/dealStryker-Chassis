import React from "react";
import qs from "qs";
import { Form, Input, Button, Radio, Spin, message } from "antd";
import Carousel from "nuka-carousel";
import cn from "classnames";
import carLogos from "../../assets/img/car_companies_logos";
import logo from "../../assets/img/logo.png";
import { sendMessage } from "./../../containers/App/ws";
import { getNextSlideIndex } from "./utils-detail";
import "./style.css";

const baseURL = "https://d2axpdwbeki0bf.cloudfront.net/";

const getRGBstring = (rgb) => {
  if (!rgb) return `rgb(255,255,255)`;
  const values = rgb.split(",");
  if (!values || !values.length) return `rgb(255,255,255)`;
  return `rgb(${values[0]},${values[1]},${values[2]})`;
};
const getImageFromItem = (item, alt, final = null) => {
  if (!item) return <div></div>;
  const colorDiv = (
    <div
      className={"colorDiv"}
      style={{
        display: "inline-block",
        position: "relative",
        height: "calc(15vh - 40px)",
        width: "calc(15vh - 40px)",
      }}
    >
      <div
        style={{
          marginTop: "100%",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: "0",
          width: "100%",
          height: "100%",
          maxHeight: "180px",
          maxWidth: "180px",
          border: "1px solid black",
          borderRadius: "100%",
          backgroundColor: getRGBstring(item.rgb),
        }}
      ></div>
    </div>
  );
  if (alt === "rgb") return colorDiv;
  if (item.image && item.image !== "NA")
    return (
      <div className="imgWrapper">
        <img src={`${baseURL + item.image}`} alt={item[alt]} />
      </div>
    );

  if (final) {
    const {
      vehicles,
      selectedYear,
      selectedCar,
      selectedModel,
      selectedColor,
    } = final;

    const model = vehicles.filter((v) => v.model === selectedCar);
    const backupModel = model && model.find((v) => v.image !== "NA");
    if (!model || !model.length || !backupModel) return colorDiv;

    const trim = model.filter((v) => v.trim === selectedModel);
    const backupTrim = trim && trim.find((v) => v.image !== "NA");

    if (!trim || !backupTrim)
      return (
        <div className="imgWrapper">
          <img src={`${baseURL + backupModel.image}`} alt={backupModel[alt]} />
        </div>
      );
    return (
      <div className="imgWrapper">
        <img src={`${baseURL + backupTrim.image}`} alt={backupTrim[alt]} />
      </div>
    );
  }
  return colorDiv;
};

class OfferRequestForm extends React.Component {
  constructor(props) {
    super(props);
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }

  state = {
    isSending: false,
    isCompleted: false,
    step: 0,
    selectedManufacturer: null,
    selectedCar: null,
    selectedModel: null,
    selectedColor: null,
    selectedVehicleId: null,
    selectedYear: null,
    RollCall: 0,
    width: 0,
    height: 0,
  };

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }
  componentDidMount(prevProps, prevState, snapshot) {
    const { actions } = this.props;
    actions.getManufacturers();
    actions.getYears();
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.isSending !== prevState.isSending && !this.state.isSending) {
      this.setState({ isCompleted: true });
    }
    // if (this.state.height === height) {
    //   this.setState({ height });
    //   this.props.changeHeight(height);
    // }
  }

  handleSubmit = (e, notAuthorized = false) => {
    const { history, form, id, bids, actions } = this.props;
    const {
      selectedManufacturer,
      selectedCar,
      selectedModel,
      selectedColor,
      selectedVehicleId,
      selectedYear,
    } = this.state;
    e && e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log("...values", ...values);

        this.setState({ isSending: true });
        const preparedObj = {
          ...values,
          manufacturer: selectedManufacturer,
          year: selectedYear,
          car: selectedCar,
          model: selectedModel,
          color: selectedColor,
          vehicleId: selectedVehicleId,
          userId: id,
        };

        console.log("preparedObj >>>>>>>>", preparedObj);

        if (notAuthorized) {
          localStorage.setItem(
            "offerRequestProgress",
            JSON.stringify(preparedObj)
          );
          if (this.isInPublicWidget()) {
            window.parent.location.href = this.getPublicSignupUrl();
          } else {
            history.push("/signup");
          }
        } else {
          sendMessage(
            "OFFER_REQUEST_CREATED",
            preparedObj,
            (code, offerRequest) => {
              if (code === 200 && offerRequest) {
                actions.setBids([...bids, offerRequest]);
                this.navigateToMainSite(0);
              } else if (code === 400) {
                message.info(
                  "Sorry, we are not in your area yet. Sign up to be notified when we are",
                  5
                );
                this.navigateToMainSite(1.5);
              } else if (code === 409) {
                message.error("Limited to 3 bids at a time", 5);
                this.navigateToMainSite(1.5);
              }
              this.setState({ isSending: false });
            }
          );
        }
      }
    });
    history.push("/dash");
  };

  isInPublicWidget = () => {
    return window.location && window.location.pathname === "/carousel";
  };
  getPublicDashboardUrl = () => {
    const location = String(window.location);
    return location.replace("/carousel", "/dash");
  };
  getPublicSignupUrl = () => {
    const location = String(window.location);
    return location.replace("/carousel", "/signup");
  };
  navigateToMainSite = (seconds) => {
    setTimeout(() => {
      if (this.isInPublicWidget()) {
        window.parent.location.href = this.getPublicDashboardUrl();
      }
    }, seconds * 1000);
  };

  handleReturnBack = () => {
    const { history } = this.props;
    if (this.isInPublicWidget()) {
      window.parent.location.href = this.getPublicDashboardUrl();
    } else {
      history.push("/dash");
    }
  };

  // getVehicles = (manufacturerName) => {
  // const { actions, manufacturers } = this.props;
  //const manufacturer = manufacturers.find(
  //  (item) => item.name === manufacturerName
  // );
  // actions.getVehicles(manufacturer);
  // };

  setManufacturer = (manufacturer) => {
    const { selectedManufacturer, RollCall } = this.state;
    if (!selectedManufacturer)
      this.setState({
        selectedManufacturer: manufacturer,
        RollCall: 1,
      });
  };

  setYear = ({ value }) => {
    const { actions } = this.props;
    const { selectedYear, RollCall } = this.state;
    if (!selectedYear && value) {
      this.setState({
        selectedYear: value,
        RollCall: 2,
      });
      actions.getVehicles(value);
    }
  };

  setCar = (vehicle) => {
    const { selectedCar, RollCall } = this.state;
    if (!selectedCar)
      this.setState({
        selectedCar: vehicle.model,
        RollCall: 3,
      });
  };

  setColor = (colorName) => {
    const { selectedColor, step, RollCall } = this.state;
    if (!selectedColor)
      this.setState({
        selectedColor: colorName,
        step: step + 1,
        RollCall: 5,
      });
  };

  setModel = (model) => {
    const { selectedModel, RollCall } = this.state;
    if (!selectedModel)
      this.setState({
        selectedModel: model.trim,
        selectedVehicleId: model.trim,
        RollCall: 4,
      });
  };

  clearCarousel = () => {
    this.handleRollCall([], 0);
  };

  renderMobileGrids = (content) => {
    if (content && content.length > 0 && content.length <= 1) {
      const height = `25vh`;

      return content.map((c, i) => (
        <div style={{ height }} key={i} className="wrapper-card">
          {c}
        </div>
      ));
    }
    const grids = [];
    if (content && content.length) {
      const step = Math.min(Math.ceil(content.length / 2), 3);
      for (let i = 0; i < content.length; i = i + step) {
        const paddingHeight = 5 * content.slice(i, i + step).length;
        const heightStep = this.state.RollCall === 1 ? 25 : 15;
        const contentHeight =
          heightStep * content.slice(i, i + step).length + "vh";
        const height = `calc(${contentHeight} + ${paddingHeight}px)`;
        grids.push(
          <div style={{ height }} className="wrapper-card" key={i}>
            {content.slice(i, i + step)}
          </div>
        );
      }
    }
    return grids;
  };
  renderTabletGrids = (content) => {
    if (content && content.length > 0 && content.length <= 2) {
      const height = `25vh`;

      return content.map((c, i) => (
        <div style={{ height }} key={i} className="wrapper-card">
          {c}
        </div>
      ));
    }
    const grids = [];
    if (content && content.length) {
      const step = Math.min(Math.ceil(content.length / 2), 3);
      for (let i = 0; i < content.length; i = i + step) {
        const paddingHeight = 5 * content.slice(i, i + step).length;
        const heightStep = this.state.RollCall === 1 ? 25 : 15;
        const contentHeight =
          heightStep * content.slice(i, i + step).length + "vh";
        const height = `calc(${contentHeight} + ${paddingHeight}px)`;
        grids.push(
          <div style={{ height }} className="wrapper-card" key={i}>
            {content.slice(i, i + step)}
          </div>
        );
      }
    }
    return grids;
  };
  renderDesktopGrids = (content) => {
    if (content && content.length > 0 && content.length <= 4)
      return content.map((c, i) => (
        <div key={i} className="wrapper-card" style={{ height: "70vh" }}>
          {c}
        </div>
      ));
    const grids = [];
    if (content && content.length) {
      for (let i = 0; i < content.length; i = i + 2)
        grids.push(
          <div className="wrapper-card" style={{ height: "70vh" }} key={i}>
            {content[i] ? content[i] : <div style={{ flex: 1 }}></div>}
            {content[i + 1] ? (
              content[i + 1]
            ) : (
              <div className="cardC" style={{ flex: 1 }}></div>
            )}
          </div>
        );
    }
    return grids;
  };
  findItem = (arr = [], key, value) => {
    return arr.find((item) => item === key) ? value : null;
  };
  handleRollCall = (arr = [], RollCall = 0) => {
    const {
      selectedCar,
      selectedManufacturer,
      selectedYear,
      selectedModel,
      selectedColor,
      step,
    } = this.state;
    this.setState({
      RollCall,
      selectedManufacturer: this.findItem(
        arr,
        "selectedManufacturer",
        selectedManufacturer
      ),
      selectedYear: this.findItem(arr, "selectedYear", selectedYear),
      selectedCar: this.findItem(arr, "selectedCar", selectedCar),
      selectedModel: this.findItem(arr, "selectedModel", selectedModel),
      selectedColor: this.findItem(arr, "selectedColor", selectedColor),
      step: 0,
    });
  };
  handleRollCallManu = () => {
    this.handleRollCall([], 0);
  };
  handleRollCallYear = () => {
    this.handleRollCall(["selectedManufacturer"], 1);
  };

  handleRollCallCar = () => {
    this.handleRollCall(["selectedManufacturer", "selectedYear"], 2);
  };
  handleRollCallModel = () => {
    this.handleRollCall(
      ["selectedManufacturer", "selectedYear", "selectedCar"],
      3
    );
  };

  handleRollCallColor = () => {
    this.handleRollCall(
      ["selectedManufacturer", "selectedYear", "selectedCar", "selectedModel"],
      4
    );
  };
  renderCarouselContent = () => {
    const {
      vehicles,
      selectedManufacturer,
      selectedCar,
      selectedModel,
      selectedYear,
      selectedVehicleId,
    } = this.state;
    const { manufacturers, mobileQueryMatches } = this.props;
    if (!selectedManufacturer) {
      return manufacturers
        ? manufacturers.map((item, index) => (
            <div
              className={"cardC"}
              key={index}
              onClick={() => this.setManufacturer(item)}
            >
              <div className="imgWrapper">
                <img
                  src={carLogos[item.replace(" ", "").replace("-", "")]}
                  alt={item}
                  style={{
                    ...(mobileQueryMatches.small
                      ? {
                          width: "15vh",
                          height: "15vh",
                          maxWidth: "none",
                          maxHeight: "none",
                        }
                      : {}),
                  }}
                />
              </div>
            </div>
          ))
        : [];
    } else if (!selectedYear) {
      const { years: propsYears } = this.props;
      const years = propsYears
        ? propsYears.map((year) => ({ title: year, value: year }))
        : [];
      return years ? (
        [""].map(() => (
          <div className={"cardC cursor-auto"} key={1}>
            {years.map((item, index) => (
              <div className="year-card" key={index}>
                <div
                  className={"year-select hoverable"}
                  onClick={() => {
                    this.setYear(item);
                  }}
                  style={{
                    position: "absolute",
                    top: "5px",
                    left: "5px",
                    height: "calc(100% - 10px)",
                    borderRadius: "10px",
                  }}
                >
                  <span>{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        ))
      ) : (
        <></>
      );
    } else if (!selectedCar) {
      const carModels = [];
      vehicles &&
        vehicles.forEach((v) => {
          const exist = carModels.find((c) => c.model === v.model);
          !exist && carModels.push(v);
        });
      return carModels
        ? carModels
            .filter((item) => item.image !== "NA")
            .map((item, index) => (
              <div
                className={"cardC"}
                key={index}
                onClick={() => this.setCar(item)}
              >
                {getImageFromItem(item, "model")}
                <span>{item.model}</span>
              </div>
            ))
        : [];
    } else if (!selectedModel) {
      const _carTrims = vehicles
        ? vehicles.filter((vehicle) => vehicle.model === selectedCar)
        : [];
      const carTrims = [];
      _carTrims &&
        _carTrims.forEach((v) => {
          const exist = carTrims.find((c) => c.trim === v.trim);
          !exist && carTrims.push(v);
        });
      return carTrims
        ? carTrims.map((item) => (
            <div
              className={"cardC"}
              key={item.trim}
              onClick={() => this.setModel(item)}
            >
              {getImageFromItem(item, "trim")}
              <span>{item.trim}</span>
            </div>
          ))
        : [];
    } else {
      const _carColors = vehicles
        ? vehicles.filter((vehicle) => {
            return (
              vehicle.model === selectedCar &&
              vehicle.trim === selectedVehicleId
            );
          })[0]
        : [];
      const carColors = [];
      _carColors &&
        _carColors.exteriors_colors &&
        _carColors.exteriors_colors.forEach((v) => {
          const exist = carColors.find((c) => c.name === v.name);
          !exist && carColors.push(v);
        });
      return carColors
        ? carColors.map((item, index) => (
            <div
              className={"cardC"}
              key={index}
              onClick={() => this.setColor(item.name)}
            >
              {getImageFromItem(item, "rgb")}
              <span>{item.name}</span>
            </div>
          ))
        : [];
    }
  };

  getSlidesToShowCount = (items) => {
    const { isLoading, mobileQueryMatches } = this.props;
    if (isLoading) return 1;
    if (mobileQueryMatches.small || mobileQueryMatches.medium) {
      if (items && items.length > 0 && items.length <= 2) return items.length;
      else return 2;
    }

    if (items && items.length > 0 && items.length <= 4) return items.length;
    else return 6;
    // if (items && items.length > 0) {
    //   if (items.length == 3 || items.length == 1) return 3;
    //   else return 4;
    // }
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    const state = { search: nextProps.history.location.search };
    if (nextProps.vehicles !== prevState.vehicles) {
      const vehicles_org =
        prevState.selectedManufacturer && nextProps.vehicles
          ? nextProps.vehicles[prevState.selectedManufacturer.toLowerCase()]
          : {};
      const vehicles = Object.values(vehicles_org ? vehicles_org : {})[0];
      state.vehicles = vehicles;
    }
    if (nextProps.history.location.search !== prevState.search) {
      const params = qs.parse(nextProps.history.location.search, {
        ignoreQueryPrefix: true,
      });
      const { manu, year, car, trim, color } = params;
      if (manu) {
        state.selectedManufacturer = manu;
        state.RollCall = 1;
      } else return state;
      if (year) {
        state.selectedYear = year;
        state.RollCall = 2;
        nextProps.actions.getVehicles(year);
      } else return state;
      if (car) {
        state.selectedCar = car;
        state.RollCall = 3;
      } else return state;
      if (trim) {
        state.selectedModel = trim;
        state.selectedVehicleId = trim;
        state.RollCall = 4;
      } else return state;
      if (color) {
        state.selectedColor = color;
        state.step = (prevState.step ? prevState.step : 0) + 1;
        state.RollCall = 5;
      } else return state;
    }
    return state;
  }
  render() {
    const { isLoading, form, id, history, mobileQueryMatches } = this.props;
    const { getFieldDecorator } = form;
    const {
      vehicles,
      isSending,
      isCompleted,
      step,
      selectedManufacturer,
      selectedCar,
      selectedModel,
      selectedVehicleId,
      selectedYear,
      selectedColor,
      RollCall,
    } = this.state;
    const carouselItems = mobileQueryMatches.small
      ? this.renderMobileGrids(this.renderCarouselContent())
      : mobileQueryMatches.medium
      ? this.renderTabletGrids(this.renderCarouselContent())
      : this.renderDesktopGrids(this.renderCarouselContent());
    const getSelectedCar = () => {
      const sv = vehicles
        ? vehicles.find((vehicle) => {
            return (
              vehicle.model === selectedCar &&
              vehicle.trim === selectedVehicleId
            );
          })
        : null;
      return sv
        ? sv.exteriors_colors.find((item) => item.name === selectedColor)
        : null;
    };
    const isNotCarousel =
      history.location.pathname !== "/dash/requestOffer" &&
      history.location.pathname !== "/carousel";

    return (
      <section
        className="offer"
        ref={(divElement) => {
          this.divElement = divElement;
        }}
        style={{
          height: isNotCarousel ? "calc(90vh + 3rem + 27.5vw)" : "100vh",
        }}
      >
        <div className="ant-col-md-8 offer-wrapper">
          <div className="offer-info">
            {isNotCarousel ? <div className="home-section-1" /> : null}
          </div>
          <Form
            onSubmit={(e) => this.handleSubmit(e, id ? false : true)}
            className={
              "OfferPage" +
              (RollCall === 5 && mobileQueryMatches.large
                ? " display-row"
                : " display-column")
            }
          >
            {RollCall === 0 && (
              <div>
                {" "}
                <h4 className="align">
                  Select Manufacturer to Get Started
                </h4>{" "}
              </div>
            )}
            {RollCall === 1 && (
              <div>
                {" "}
                <h4 className="align">Select Year to Continue</h4>{" "}
              </div>
            )}
            {RollCall === 2 && (
              <div>
                {" "}
                <h4 className="align">Select Model to Continue</h4>{" "}
              </div>
            )}
            {RollCall === 3 && (
              <div>
                {" "}
                <h4 className="align">Select Trim to Continue</h4>{" "}
              </div>
            )}
            {RollCall === 4 && (
              <div>
                {" "}
                <h4 className="align">Select Color to Continue</h4>{" "}
              </div>
            )}
            {/* {RollCall == 5 && (
              <div>
                {" "}
                {" "}
                <h4 className="align">Fill Out to Submit Your Request</h4>{" "}
                {" "}
              </div>
            )} */}
            <div
              className={
                "indicators" +
                (RollCall === 5 ? " submit-form-indicators " : " ") +
                (mobileQueryMatches.small ||
                mobileQueryMatches.medium ||
                RollCall === 5
                  ? " display-column"
                  : " display-row")
              }
            >
              <div className="selectedOptions">
                {selectedManufacturer ? (
                  <div onClick={this.handleRollCallManu}>
                    {selectedManufacturer}
                  </div>
                ) : null}
                {selectedYear ? (
                  <div onClick={this.handleRollCallYear}>{selectedYear}</div>
                ) : null}
                {selectedCar ? (
                  <div onClick={this.handleRollCallCar}>{selectedCar}</div>
                ) : null}
                {selectedModel ? (
                  <div onClick={this.handleRollCallModel}>{selectedModel}</div>
                ) : null}
                {selectedColor ? (
                  <div onClick={this.handleRollCallColor}>{selectedColor}</div>
                ) : null}
              </div>
              {selectedColor ? (
                <>
                  {getSelectedCar() ? (
                    <div className="selected-car-image">
                      {getImageFromItem(getSelectedCar(), "final", {
                        vehicles,
                        selectedYear,
                        selectedCar,
                        selectedModel,
                        selectedColor,
                      })}
                      <span className="glow">
                        Your future <b>{selectedManufacturer}</b>{" "}
                        <b>{selectedCar}!</b>
                      </span>
                    </div>
                  ) : (
                    <h1 style={{ marginTop: "20px" }}>Please select</h1>
                  )}
                </>
              ) : null}
              {selectedManufacturer ? (
                <Button
                  type={"danger desktop-button"}
                  onClick={this.clearCarousel}
                  style={{ marginBottom: "10px" }}
                >
                  Start Over
                </Button>
              ) : null}
            </div>
            <div className={cn("OfferPage", step > 0 ? "carSelected" : "")}>
              <Carousel
                className={step !== 0 ? " hidden" : ""}
                slidesToShow={this.getSlidesToShowCount(carouselItems)}
                slidesToScroll={1}
                renderBottomCenterControls={() => false}
                // heightMode="max"
                // slideWidth={0.8}
                wrapAround={false}
                renderCenterLeftControls={({
                  currentSlide,
                  goToSlide,
                  slideCount,
                }) => (
                  <button
                    className="carousel-controller"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLoading)
                        goToSlide(
                          getNextSlideIndex(
                            currentSlide,
                            "prev",
                            mobileQueryMatches,
                            slideCount
                          )
                        );
                    }}
                  >
                    {/* ← */}

                    <img src={require("../../assets/img/LeftArrow.png")} />
                  </button>
                )}
                renderCenterRightControls={({
                  currentSlide,
                  goToSlide,
                  slideCount,
                }) => (
                  <button
                    className="carousel-controller"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!isLoading)
                        goToSlide(
                          getNextSlideIndex(
                            currentSlide,
                            "next",
                            mobileQueryMatches,
                            slideCount
                          )
                        );
                    }}
                  >
                    {/* → */}
                    <img src={require("../../assets/img/RightArrow.png")} />
                  </button>
                )}
              >
                {/* {mobileQueryMatches
                  ? carouselItems
                  : carouselItems.length == 2 || carouselItems.length == 1
                  ? [<div></div>, ...carouselItems, <div></div>]
                  : carouselItems} */}
                {carouselItems}
              </Carousel>
            </div>
            <div className={"submit-form" + (step !== 1 ? " hidden" : "")}>
              <Form.Item className={"name"}>
                {getFieldDecorator("name", {
                  rules: [
                    { required: true, message: "Please input your nickname" },
                  ],
                })(
                  <div className={"BuySubmitForm"}>
                    <Input
                      type="text"
                      placeholder="Your Preferred Name"
                      maxLength={10}
                    />
                  </div>
                )}
              </Form.Item>
              <Form.Item className={"zip"}>
                {getFieldDecorator("zip", {
                  rules: [
                    { required: true, message: "Please input your zip code" },
                    {
                      pattern: /^[0-9\b]+$/,
                      message:
                        "Passwords should have at least 8 characters, a capitalized letter, number as well as special character.",
                    },
                  ],
                })(
                  <div className={"BuySubmitForm"}>
                    <Input type="text" placeholder="Your Zip Code" />{" "}
                  </div>
                )}
              </Form.Item>
              <Form.Item
                label="Travel Radius"
                className={"distance"}
                required={false}
              >
                {getFieldDecorator("distance", {
                  rules: [
                    { required: true, message: "Please select travel radius" },
                  ],
                  initialValue: "30mil",
                })(
                  <Radio.Group>
                    <Radio value="30mil">30 Miles</Radio>
                    <Radio value="50mil">50 Miles</Radio>
                    <Radio value="100mil">100 Miles</Radio>
                  </Radio.Group>
                )}
              </Form.Item>

              <Form.Item
                label="Financing Preference"
                className={"financing"}
                required={false}
              >
                {getFieldDecorator("financing", {
                  rules: [
                    {
                      required: true,
                      message: "Please select your financing preference",
                    },
                  ],
                  initialValue: "Dealer",
                })(
                  <Radio.Group>
                    <Radio value="Dealer">Dealership</Radio>
                    <Radio value="Outside">Outside</Radio>
                    <Radio value="None">None</Radio>
                  </Radio.Group>
                )}
              </Form.Item>

              {!isCompleted && getSelectedCar() ? (
                id ? (
                  <Button
                    loading={isSending}
                    type="primary"
                    htmlType="submit"
                    className={"OfferPage-btn"}
                  >
                    Submit
                  </Button>
                ) : (
                  <Button
                    loading={isSending}
                    type="primary"
                    onClick={(e) => this.handleSubmit(e, true)}
                    className={"OfferPage-btn"}
                  >
                    Submit
                  </Button>
                )
              ) : (
                <Button
                  type="primary"
                  className={"OfferPage-btn"}
                  onClick={this.handleReturnBack}
                >
                  Go to the main page
                </Button>
              )}
            </div>
            {selectedManufacturer ? (
              <div style={{ marginTop: "auto" }}>
                <Button
                  type={"danger mobile-button"}
                  style={{ marginTop: 10 }}
                  onClick={this.clearCarousel}
                >
                  Start Over
                </Button>
              </div>
            ) : null}
            <div
              className={
                "sm-logo-image" +
                (mobileQueryMatches.large && RollCall === 5
                  ? " absolute-logo"
                  : "")
              }
              style={{
                ...(mobileQueryMatches.small
                  ? {
                      height: "10vh",
                      maxWidth: "none",
                      maxHeight: "none",
                    }
                  : {}),
              }}
            >
              <img src={logo} style={{ width: "100%" }} />
            </div>
          </Form>
          {history.location.pathname === "/dash/requestOffer" && step !== 1 ? (
            <Button type="ghost" onClick={this.handleReturnBack}>
              Back to Live bids
            </Button>
          ) : null}
        </div>
      </section>
    );
  }
}

export default Form.create({ name: "createOfferRequest" })(OfferRequestForm);
