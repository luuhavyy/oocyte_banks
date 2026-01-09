import axios from "./axiosConfig";

export const loginApi = (data) =>
  axios.post("/auth/admin/login", data).then(res => res.data);

export const changePasswordApi = (data) =>
  axios.post("/auth/change-password", data).then(res => res.data);

export const forgotPasswordApi = (email) =>
  axios.post("/auth/forgot-password", { email }).then(res => res.data);
