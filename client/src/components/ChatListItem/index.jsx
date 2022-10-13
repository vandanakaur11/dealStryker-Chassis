import React from "react";
import injectMedia from "../../components/media";
import "./style.css";

class ChatListItem extends React.Component {
  handleClick = () => {
    const {
      offer,
      onChangeChannel,
      isCurrent,
      // unreadCount,
      // onMarkAsRead,
    } = this.props;
    if (!isCurrent) onChangeChannel(offer);

    //  onMarkAsRead();
  };

  render() {
    const {
      offer,
      isCurrent,
      isClosed,
      isDealer,
      unreadCount,
      mobileQueryMatches,
    } = this.props;
    return (
      <div
        className={"component-chat-list-item" + (isCurrent ? " current" : "")}
        onClick={this.handleClick}
      >
        <div className="chat-list-item">
          <div
            className={"chat-list-item-border" + (isClosed ? " closed" : "")}
          >
            <div className="chat-list-item-info">
              {!mobileQueryMatches ? (
                <div className="chat-list-item-avatar" />
              ) : null}
              <p className="chat-name">
                {isDealer ? offer.buyerName : offer.dealerName}
              </p>
              {!isCurrent && unreadCount > 0 ? (
                <div className="chat-list-unreadCount">{unreadCount}</div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default injectMedia(ChatListItem);
