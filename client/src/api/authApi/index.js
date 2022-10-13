import {URL} from "../index";
import axios from "axios";

const http = axios.create({ // baseURL: "https://www.dealstryker.com", // staging
    baseURL: process.env.ServerAddress, // prod
});

const makeAuthApi = ({client, headersManager}) => ({
    logIn: (data) => http.post(`${URL}/users/login`, {
        user: {
            ...data
        }
    }),
    registerCustomer: (data) => http.post(`${URL}/users/registerCustomer`, {
        user: {
            ...data
        }
    }),
    registerDealer: (data) => http.post(`${URL}/users/registerDealer`, {
        user: {
            ...data
        }
    }),
    registerSubUser: (data) => http.post(`${URL}/users/registerSubUser`, {
        user: {
            ...data
        }
    }),
    deleteSubuser: (data) => http.post(`${URL}/users/deleteSubUser`, {
        user: {
            ...data
        }
    }),
    editUser: (data) => http.post(`${URL}/users/editUser`, {
        user: {
            ...data
        }
    }),
    editManufacturers: (data) => http.post(`${URL}/users/editManu`, {
        user: {
            ...data
        }
    }),
    changePassword: (data) => http.post(`${URL}/users/changePassword`, {
        ...data
    }, {headers: headersManager.getHeaders()}),
    resetPasswordRequest: (data) => http.post(`${URL}/users/resetPasswordReq`, {
        ...data
    }),
    resetPassword: (data) => http.post(`${URL}/users/resetPassword`, {
        ...data
    }),
    google: (data) => http.post(`${URL}/api/users/oauth/google`, {
        ...data
    }),
    facebook: (data) => http.post(`${URL}/users/oauth/facebook`, {
        ...data
    }),
    getUserData: (data) => http.post(`${URL}/users/getUserData`, {
        ...data
    }, {headers: headersManager.getHeaders()}),
    setNotificationsType: (data) => http.post(`${URL}/users/setNotificationsType`, {
        ...data
    }, {headers: headersManager.getHeaders()})
});
export default makeAuthApi;
