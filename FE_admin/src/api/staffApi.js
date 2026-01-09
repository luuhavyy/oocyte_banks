import axios from "./axiosConfig";

export const getStaffList = () =>
  axios.get("/staffs").then(res => res.data);

export const getStaffById = (staffId) =>
  axios.get(`/staffs/${staffId}`).then(res => res.data);

export const createStaff = (data) =>
  axios.post("/staffs", data).then(res => res.data);

export const updateStaff = (staffId, data) =>
  axios.patch(`/staffs/${staffId}`, data).then(res => res.data);

export const deleteStaff = (staffId) =>
  axios.delete(`/staffs/${staffId}`).then(res => res.data);

