import React from "react";
import { Input, Modal, Icon, Button, Upload, Select, message } from "antd";
import { FilePicker } from "react-file-picker";
import moment from "moment";
import "./style.css";
import { URL } from "../../api";
import makeAuthManager from "../../managers/auth";
import { FileIcon, defaultStyles } from "react-file-icon";
import CurrencyInput from "react-currency-input-field";
import ReactHtmlParser from "react-html-parser";

class ChatArea extends React.Component {
  constructor(props) {
    super(props);
    this.chatAreaRef = React.createRef();
    this.outTheDoorPriceRef = React.createRef();
  }

  state = {
    value: "",
    visible: false,
    messagesPrev: [],
    uploadedFile: "",
    uploadedName: "",
    isUploading: false,
    price: "",
    VIN: "",
    selectedUser: "",
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { messages } = this.props;
    if (
      this.chatAreaRef.current &&
      messages &&
      messages.length !== prevState.messagesPrev.length
    ) {
      this.chatAreaRef.current.scrollTop = this.chatAreaRef.current.scrollHeight;
      this.setState({ messagesPrev: [...messages] });
    }
  }

  renderForm = (msg) => {
    const { isDealer, messages, send } = this.props;
    let price;
    if (messages) {
      const foundedPriceResponse = messages.find(
        (message) => message.formDate && message.formDate === msg.date
      );
      if (foundedPriceResponse) price = foundedPriceResponse.text;
    }

    return (
      <div>
        <p className="area-item-block-message-form">
          {isDealer
            ? "The potential buyer is requesting the full out the door price. This price includes taxes, titles and other fees that are associated with purchasing the vehicle"
            : "Requested Out The Door Price"}
        </p>
        {isDealer && !price ? (
          <Input
            ref={this.outTheDoorPriceRef}
            placeholder="Price"
            addonAfter={
              <Icon
                type="arrow-right"
                onClick={() =>
                  send(
                    this.outTheDoorPriceRef.current.input.value,
                    "outTheDoorResponse",
                    msg.date
                  )
                }
              />
            }
          />
        ) : (
          price
        )}
      </div>
    );
  };

  renderAreaIterm = () => {
    const { selfID, messages, unreadCount } = this.props;

    return messages.map((msg, i) => {
      if (msg.type !== "outTheDoorResponse")
        return (
          <div
            key={i}
            className={
              "area-item" +
              (msg.userId === selfID ? " self" : " notSelf") +
              (unreadCount && i >= messages.length - unreadCount
                ? " new"
                : "") +
              (msg.otd ? " otd" : "")
            }
          >
            <div className="area-avatar" />
            <div
              className={"area-item-block" + (msg.file ? " handpointer" : "")}
              onClick={() => {
                if (msg.file) this.onDownload(msg.file, msg.text);
              }}
              style={msg.otd ? { backgroundColor: "#4FB477" } : {}}
            >
              <b>{msg.displayName}</b>
              {msg.type}
              {!msg.type ? (
                msg?.file ? (
                  msg.text.split(".")[1] == "png" ||
                  msg.text.split(".")[1] == "jpg" ||
                  msg.text.split(".")[1] == "jpeg" ? (
                    <div style={{ paddingBottom: 10 }}>
                      <img
                        src={msg.file}
                        style={{ maxHeight: 200, maxWidth: "100%" }}
                      />
                    </div>
                  ) : (
                    <FileIcon
                      extension={msg.text.split(".")[1]}
                      {...defaultStyles[msg.text.split(".")[1]]}
                    />
                  )
                ) : (
                  <p className="area-item-block-message">
                    {ReactHtmlParser(msg.text)}
                  </p>
                )
              ) : null}
              {msg.type === "outTheDoorPrice" ? this.renderForm(msg) : null}
              {msg.file ? (
                <b className="area-item-block-message">
                  {/* {` Download ${msg.text}`} */}
                  {` Download `}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-download"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" />
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" />
                  </svg>
                </b>
              ) : null}
              <div className="area-item-block-clock">
                <span className="area-item-block-clock-text">
                  {msg.file
                    ? moment(msg.createdAt).format("h:mm a")
                    : moment(msg.createdAt).format("h:mm a")}
                </span>
              </div>
            </div>
          </div>
        );
      else return null;
    });
  };

  onClear = () => {
    const { uploadedFile } = this.state;
    if (uploadedFile) {
      this.setState({ uploadedFile: "" });
    }
  };

  customAction = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  onSubmit = () => {
    const { value, uploadedFile } = this.state;
    if (value) {
      this.props.send(value);
      this.setState({ value: "" });
    } else if (uploadedFile) {
      this.props.sendFile(uploadedFile);
      this.setState({ uploadedFile: "" });
    }
  };

  onChange = (e) => {
    this.setState({ value: e.target.value });
  };

  beforeUpload = (file) => {
    const isLt2M = file.size <= 2 * 1024 * 1024;
    if (!isLt2M) message.error("File must smaller than 2MB!");
    else this.setState({ isUploading: true });
    return isLt2M;
  };

  getFileNameFromPath = (path) => {
    let fileName;
    const lastSlash = path.lastIndexOf("/");
    if (lastSlash !== -1) fileName = path.slice(lastSlash + 1);
    const firstUnderline = fileName.indexOf("_");
    if (firstUnderline !== -1) fileName = fileName.slice(firstUnderline + 1);
    return fileName;
  };

  getHeaders = () => {
    const authManager = makeAuthManager({ storage: localStorage });
    const credentials = authManager.getCredentials();
    if (credentials) {
      return {
        authorization: `Token ${credentials}`,
      };
    }
    return {};
  };

  onDownload = (id, name) => {
    this.props.downLoadFile(id, name);
  };

  onChangeFile(event) {
    event.stopPropagation();
    event.preventDefault();
    var files = event.target.files;
    var path = files[0].webkitRelativePath;
    var Folder = path.split("/");
  }
  onCancel = () => {
    this.setState({ visible: false });
  };
  render() {
    const {
      disabled,
      recipientName,
      endCampaign,
      isClosed,
      isDealer,
      onMarkAsRead,
      userData,
      addUser,
      currentChannel,
      otdRequest,
      otdPost,
    } = this.props;
    console.log(currentChannel);
    const { value, uploadedFile, isUploading } = this.state;

    return (
      <div className="chat-message">
        <div className="row">
          <b>Car Info: </b> {currentChannel?.requestInfo}
        </div>
        <br />
        <div className="row">
          <b>Price: </b> {currentChannel?.offerInfo}
        </div>
        <div className={"chat-list-item" + (!recipientName ? " hidden" : "")}>
          <div className="chat-list-item-info">
            <div className="chat-list-item-avatar" />
            <p className="chat-name">
              {recipientName} {isClosed ? <span>Closed</span> : null}
            </p>
          </div>
        </div>
        <div ref={this.chatAreaRef} className="area">
          {this.renderAreaIterm()}
        </div>
        <div className="chat-controls">
          {!isDealer ? (
            <React.Fragment>
              <Button
                type="danger"
                disabled={disabled || isClosed}
                onClick={endCampaign}
              >
                End Campaign
              </Button>
              <Button
                type="primary"
                disabled={isClosed || otdRequest}
                onClick={() => this.props.requestOtd()}
              >
                Request Out The Door Price
              </Button>
            </React.Fragment>
          ) : null}
          {isDealer ? (
            <React.Fragment>
              <Select
                className="select"
                placeholder="User"
                onChange={(value) => {
                  this.setState({ selectedUser: value });
                }}
              >
                {userData?.user?.Dealership?.subuser?.map((user, index) => (
                  <Select.Option value={user._id} key={user._id}>
                    {user.name}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                disabled={disabled || isClosed}
                onClick={() => addUser(this.state.selectedUser)}
              >
                Add Team Member
              </Button>
              <Button
                type="primary"
                disabled={isClosed || otdPost}
                onClick={() =>
                  !otdPost ? this.setState({ visible: true }) : ""
                }
              >
                OTD Price
              </Button>
            </React.Fragment>
          ) : null}
          <FilePicker
            onChange={(FileObject, file) => {
              if (FileObject) {
                console.log("I HAVE FILE OBKEFY", FileObject, file);
                this.setState({
                  uploadedFile: FileObject,
                  isUploading: false,
                });
              }
            }}
            onError={(error) => console.log("ERROR IS THERE", error)}
          >
            <Button type="default" disabled={disabled || isClosed}>
              <Icon type="upload" onClick={this.onSubmit} />
            </Button>
          </FilePicker>
        </div>
        <Modal
          title="Send Otd Price"
          className="centre BindOnLeadModal"
          visible={this.state.visible}
          onCancel={this.onCancel}
          footer={[
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                const reg = /[A-HJ-NPR-Z0-9]{17}/;

                if (reg.test(this.state.VIN))
                  this.props.sendOtd(this.state.price, this.state.VIN);
                else {
                  message.error(
                    "VIN format appears to be incorrect, please double check your input"
                  );
                }
              }}
            >
              Submit
            </Button>,
          ]}
        >
          <CurrencyInput
            id="InputOffer"
            name="input-name"
            defaultValue={1000}
            prefix="$"
            decimalsLimit={2}
            ref={this.priceInput}
            className={`form-control`}
            style={{ width: "100%" }}
            placeholder="Offer Price"
            onValueChange={(value, name) => {
              this.setState({ price: value });
              console.log(value, name);
            }}
          />
          <Input
            placeholder="VIN"
            rules={[
              { required: true, message: "Please input a VIN number!" },

              {
                pattern: /[A-HJ-NPR-Z0-9]{17}/,
                message: `Password Pattern`,
              },
            ]}
            onChange={(e) => {
              const { value } = e.target;

              this.setState({ VIN: e.target.value });
              console.log(e.target.value);
            }}
          />

          {/* <Input ref={this.priceInput} placeholder="Offer Price" /> */}
        </Modal>
        <Input
          placeholder="Send a message"
          onChange={this.onChange}
          value={uploadedFile ? `File: ${uploadedFile.name}` : value}
          onPressEnter={this.onSubmit}
          disabled={disabled || isClosed || isUploading || !!uploadedFile}
          addonAfter={
            <React.Fragment>
              {uploadedFile ? (
                <Icon type="close" onClick={this.onClear} />
              ) : null}
              <Icon
                type={isUploading ? "loading" : "arrow-right"}
                onClick={this.onSubmit}
              />
            </React.Fragment>
          }
        />
      </div>
    );
  }
}

ChatArea.propTypes = {};

export default ChatArea;
