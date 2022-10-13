import { actions as types } from "./index";
import { history } from "./../../history";
import { all, put, call, take, takeEvery, takeLatest, select } from "redux-saga/effects";
import makeApi from "../../api";
function* setRecipientSaga({ payload }) {
  history.push("/dash/chat");
}

function* getChannelSaga({ payload }) {
  console.log("getChannelSaga");
  try {
    const chat = makeApi().chat;
    const { email } = payload;
    let response;
    response = yield call([chat, chat.getChannel], email);
    console.log("chat response:  response", response);
    if (response.data) {
      const data = [...response.data];

      yield put(types.getChannelSuccess({ channels: data }));
    } else throw "No response data";
  } catch (error) {
    console.log("getChannelSaga", error);
    yield put(types.getChannelFailure({ error }));
  }
}
function* getChatSaga({ payload }) {
  console.log("getChatSaga");
  try {
    const chat = makeApi().chat;
    const { channel } = payload;

    let response;
    response = yield call([chat, chat.getChat], payload);
    console.log("chat response:  response", response);
    if (response.data) {
      const data = [...response.data];

      yield put(types.getChatSuccess({ messages: data }));
      yield put(types.selectChannel({ id: channel }));
    } else throw "No response data";
  } catch (error) {
    console.log("getChatSaga", error);
    yield put(types.getChatFailure({ error }));
  }
}

function* addChannelSaga({ payload }) {
  console.log("addChannelSaga");
  try {
    const chat = makeApi().chat;
    const { email, offerId, name } = payload;
    let response;
    response = yield call([chat, chat.addChannel], { email, offerId, name });
    console.log("chat response:  response", response);
    if (response.data) {
      const user = { ...response.data };
      yield put(types.addChannelSuccess({ channels: user }));
    } else throw "No response data";
  } catch (error) {
    console.log("addChannelSaga", error);
    yield put(types.addChannelFailure({ error }));
  }
}
function* sendChatSaga({ payload }) {
  console.log("sendChatSaga");
  try {
    const chat = makeApi().chat;
    let response;
    response = yield call([chat, chat.sendChat], payload);
    console.log("chat response:  response", response);
    if (response.data) {
      const user = { ...response.data };
      yield put(types.sendChatSuccess({ channels: user }));
      const channelCall = yield call([chat, chat.getChannel], payload?.email);
      if (channelCall.data) {
        const data = [...channelCall.data];
        yield put(types.getChannelSuccess({ channels: data }));
      }
    } else throw "No response data";
  } catch (error) {
    console.log("sendChatSaga", error);
    yield put(types.sendChatFailure({ error }));
  }
}
function* getImageUrl({ payload }) {
  console.log("getImageUrl");
  try {
    const chat = makeApi().chat;
    let response;
    response = yield call([chat, chat.getFileUrl], payload);
    console.log("chat response:  response", response);
    if (response.data) {
      const user = { ...response.data };
      return user;
    } else return false;
  } catch (error) {
    // console.log('sendChatSaga', error)
    return error;
    // yield put(types.sendChatFailure({ error }))
  }
}

function* requestOtdSaga({ payload }) {
  console.log(payload)
  try {
    const chat = makeApi().chat;
    let response
    response = yield call([chat, chat.requestOTD], payload)
    console.log('chat response:  response', response)
    if (response.data) {
      const user = { ...response.data }
      yield put(types.sendChatSuccess({ channels: user }))
    } else throw 'No response data'
  } catch (error) {
    console.log('sendChatSaga', error)
    yield put(types.sendChatFailure({ error }))
  }
}

function* sendOtdSaga({ payload }) {
  console.log(payload)
  try {
    const chat = makeApi().chat;
    let response
    response = yield call([chat, chat.sendOTD], payload)
    console.log('chat response:  response', response)
    if (response.data) {
      const user = { ...response.data }
      yield put(types.sendChatSuccess({ channels: user }))
    } else throw 'No response data'
  } catch (error) {
    console.log('sendChatSaga', error)
    yield put(types.sendChatFailure({ error }))
  }
}

function* selectChannelSaga({ payload }) {
  try {
    const { channels } = yield select((state) => state.chat);
    let updatedChannels = channels.map((val) => {
      if (val._id == payload.id) {
        return { ...val, unRead: 0 };
      } else {
        return val;
      }
    });
    console.log("channel is there", payload, updatedChannels);
    yield put(types.selectChannelSuccess({ channels: updatedChannels }));
    // history.push("/dash");
  } catch (error) {
    console.log("error", error);
  }
}

const chatSagas = [
  takeEvery(types.setRecipient, setRecipientSaga),
  takeLatest(types.getChannel, getChannelSaga),
  takeLatest(types.addChannel, addChannelSaga),
  takeLatest(types.requestOtd, requestOtdSaga),
  takeLatest(types.sendOtd, sendOtdSaga),
  takeLatest(types.sendChat, sendChatSaga),
  takeLatest(types.getChat, getChatSaga),
  takeLatest(types.selectChannel, selectChannelSaga),
  // takeEvery(types.getChannelSuccess, getChannelSuccessSaga),
];

export default chatSagas;
