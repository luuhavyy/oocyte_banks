import axios from "./axiosConfig";

export const createAppointment = (data) =>
  axios.post("/appointments/", data).then(res => res.data);

export const getMyAppointments = (params = {}) =>
  axios.get("/appointments/my", { params }).then(res => res.data);

export const updateAppointment = (appId, data) =>
  axios.patch(`/appointments/${appId}`, data).then(res => res.data);

