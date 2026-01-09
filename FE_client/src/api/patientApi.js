import axios from "./axiosConfig";

export const getMyInfo = () =>
  axios.get("/patients/me").then(res => res.data);

export const updatePatient = (id, data) =>
  axios.patch(`/patients/${id}`, data).then(res => res.data);
