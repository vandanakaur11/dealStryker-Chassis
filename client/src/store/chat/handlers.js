const initialState = {
  roomId: "",
  isLoading: false,
  error: null,
  channels: [],
  messages: [],
};

export const setRecipient = (state, { payload }) => {
  return {
    ...state,
    roomId: payload.offerId,
  };
};

export const getChannel = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});

export const getChannelSuccess = (state, { payload }) => {
  return { ...state, isLoading: false, channels: payload.channels };
};

export const getChannelFailure = (state, { payload }) => {
  return { ...state, isLoading: false, error: payload.error };
};
export const addChannel = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});
export const selectChannel = (state) => ({
  ...state,
});
export const selectChannelSuccess = (state, { payload }) => ({
  ...state,
  channels: payload.channels,
});

export const addChannelSuccess = (state, { payload }) => {
  return { ...state, isLoading: false };
};

export const addChannelFailure = (state, { payload }) => {
  return { ...state, isLoading: false, error: payload.error };
};
export const sendChat = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});

export const requestOTD = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});

export const sendOTD = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});

export const sendChatSuccess = (state, { payload }) => {
  return { ...state, isLoading: false };
};

export const sendChatFailure = (state, { payload }) => {
  return { ...state, isLoading: false, error: payload.error };
};
export const getChat = (state, { payload }) => ({
  ...state,
  isLoading: true,
  error: undefined,
});

export const getChatSuccess = (state, { payload }) => {
  return { ...state, isLoading: false, messages: payload.messages };
};

export const getChatFailure = (state, { payload }) => {
  return { ...state, isLoading: false, error: payload.error };
};

export default initialState;
