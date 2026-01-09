import axios from "./axiosConfig";

export const getAllAppointments = (params = {}) =>
  axios.get("/appointments/", { params }).then(res => res.data);

export const updateAppointment = (appId, data) =>
  axios.patch(`/appointments/${appId}`, data).then(res => res.data);

