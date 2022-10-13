import io from "socket.io-client";
// import { SOCKET_URI } from "../LiveBidsPage/config";
let SOCKET_URI = process.env.Alternator || "https://alternator-staging.herokuapp.com";
// "https://dealstryker-alternator.herokuapp.com/";
// "https://alternator-staging.herokuapp.com"
let callbacks = {
  user_connected: () => {},
};
export let socket;

export const getStatusSocket = function () {
  return !!socket;
};

export const sendMessage = function (type, message, callback) {
  socket.emit(type, message, callback);
};

export const setCallbacks = function (_callbacks) {
  callbacks = {
    ...callbacks,
    ..._callbacks,
  };
};

export function createSocketAlternator(props, _callbacks) {
  socket = io(SOCKET_URI);
  _callbacks && setCallbacks(_callbacks);
  socket.on("connect", () => {
    log();
  });
  socket.on("HEY", () => {
    console.log("WOHOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    _callbacks();
  });
}

export const joinChannel = (props, _callbacks) => {
  if (socket) {
    _callbacks && setCallbacks(_callbacks);
    console.log("CONNECTED WITH THE ROOM", callbacks);
    socket.emit("join", callbacks.user_connected(), (s) => {
      console.log("CONNECTED WITH THE ROOM", s);
    });
  }
};
export const getChatWithChannel = (data, callbacks) => {
  if (socket) {
    socket.off("MESSAGES___");
    socket.on("MESSAGES___", (s) => {
      callbacks(s);
      console.log("MESSAGE RECIEVE", s);
      socket.emit("readMessage", data);
    });
  }
};
export const leaveChannel = (props, _callbacks) => {
  if (socket) {
    _callbacks && setCallbacks(_callbacks);
    socket.emit("leave", callbacks.user_connected(), (s) => {
      console.log("LEAVE WITH THE ROOM", s);
    });
  }
};
export const disconnectAlternator = () => {
  if (socket) socket.close();

  console.log("disconnect socket");
};

function log() {
  console.log(`CHAT CHANnEL socket connected`);
}