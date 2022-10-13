import createReducer from "./utils";
import { ActionTypes } from "../actions/auth";

export const initialState = {
  isLoading: false,
  error: undefined,
};

export default createReducer(
  {
    [ActionTypes.GET_CHANNEL]: (state) => ({
      ...state,
      isLoading: true,
      error: undefined,
    }),
    [ActionTypes.GET_CHANNEL_SUCCESS]: (state) => ({
      ...state,
      isLoading: false,
    }),
    [ActionTypes.GET_CHANNEL_FAILURE]: (state, action) => ({
      ...state,
      error: action.error,
      isLoading: false,
    }),
  },
  initialState
);
