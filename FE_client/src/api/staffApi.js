import axios from "./axiosConfig";

// Placeholder for future staff API calls if needed
export const getStaffInfo = () =>
  axios.get("/staffs/me").then(res => res.data);

