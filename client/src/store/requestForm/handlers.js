const initialState = {
  error: null,
  manufacturers: null,
  vehicles: null,
  years: null,
};

export const getManufacturers = () => ({
  ...initialState,
});

export const getManufacturersSuccess = (state, { payload }) => ({
  ...state,
  manufacturers: payload.manufacturers,
});

export const getManufacturersFailure = (state, { payload }) => ({
  ...state,
  error: payload.error,
});

export const getVehicles = (state) => ({
  ...state,
  error: undefined,
  vehicles: null,
});

export const getVehiclesSuccess = (state, { payload }) => ({
  ...state,
  vehicles: payload.vehicles,
});

export const getVehiclesFailure = (state, { payload }) => ({
  ...state,
  error: payload.error,
});

export const getYears = (state) => ({
  ...state,
  error: undefined,
  years: null,
});

export const getYearsSuccess = (state, { payload }) => ({
  ...state,
  years: payload.years,
});

export const getYearsFailure = (state, { payload }) => ({
  ...state,
  error: payload.error,
});

export const getRequests = (state, { payload }) => ({
  ...state,
  requests: payload.requests,
});

export default initialState;
