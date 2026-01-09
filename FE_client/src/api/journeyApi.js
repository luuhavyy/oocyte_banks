import axios from "./axiosConfig";

export const getMyJourney = () =>
  axios.get("/journey/me").then(res => res.data);

