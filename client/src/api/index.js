import makeChatApi from "./chatApi";
import makeAuthApi from "./authApi";
import makeFuelApi from "./fuelApi";

export const URL = process.env.NODE_ENV === "production" ? "/api" : "/api";

export const makeApi = (dependencies = {}) => ({
  auth: makeAuthApi(dependencies),
  fuel: makeFuelApi(dependencies),
  chat: makeChatApi(dependencies),
});

export default makeApi;
