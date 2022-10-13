import axios from "axios";

const http = axios.create({
  baseURL: "https://www.dealstryker.com",
});

const makeFuelApi = ({ client, headersManager }) => ({
  getManufacturers: () => http.get(`/manu`),
  getYears: () => http.get(`/years`),
  getVehicles: (year) => http.get(`/turbo/${year}`),
});

export default makeFuelApi;
