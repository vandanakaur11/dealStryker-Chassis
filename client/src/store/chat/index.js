import { handleActions, createActions } from "redux-actions";

import initialState, * as handlers from "./handlers";

export const actions = createActions({
  SET_RECIPIENT: undefined,
  GET_CHANNEL: undefined,
  GET_CHANNEL_SUCCESS: undefined,
  GET_CHANNEL_FAILURE: undefined,
  ADD_CHANNEL: undefined,
  ADD_CHANNEL_SUCCESS: undefined,
  ADD_CHANNEL_FAILURE: undefined,
  SEND_CHAT: undefined,
  SEND_CHAT_SUCCESS: undefined,
  SEND_CHAT_FAILURE: undefined,
  GET_CHAT: undefined,
  GET_CHAT_SUCCESS: undefined,
  GET_CHAT_FAILURE: undefined,
  SELECT_CHANNEL: undefined,
  SELECT_CHANNEL_SUCCESS: undefined,
  REQUEST_OTD: undefined,
  SEND_OTD: undefined,
});
const reducer = handleActions(
  new Map([
    [actions.setRecipient, handlers.setRecipient],
    [actions.requestOtd, handlers.requestOTD],
    [actions.sendOtd, handlers.sendOTD],
    [actions.getChannel, handlers.getChannel],
    [actions.getChannelSuccess, handlers.getChannelSuccess],
    [actions.getChannelFailure, handlers.getChannelFailure],
    [actions.addChannel, handlers.addChannel],
    [actions.addChannelSuccess, handlers.addChannelSuccess],
    [actions.addChannelFailure, handlers.addChannelFailure],
    [actions.sendChat, handlers.sendChat],
    [actions.sendChatSuccess, handlers.sendChatSuccess],
    [actions.sendChatFailure, handlers.sendChatFailure],
    [actions.getChat, handlers.getChat],
    [actions.getChatSuccess, handlers.getChatSuccess],
    [actions.getChatFailure, handlers.getChatFailure],
    [actions.selectChannel, handlers.selectChannel],
    [actions.selectChannelSuccess, handlers.selectChannelSuccess],
  ]),
  initialState
);

export default reducer;
