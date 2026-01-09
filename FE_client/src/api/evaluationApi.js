import axios from "./axiosConfig";

export const getEvaluationHistory = (patientId) =>
  axios.get(`/patients/${patientId}/evaluation-history`).then(res => res.data);

