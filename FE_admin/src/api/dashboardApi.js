import axios from "./axiosConfig";

export const getDashboardOverview = () =>
  axios.get("/admin/dashboard/overview").then(res => res.data);

