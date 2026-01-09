import axios from "./axiosConfig";

export const getAllPatients = (params = {}) =>
  axios.get("/patients/", { params }).then(res => {
    // Handle both { items: [...] } and direct array responses
    const data = res.data;
    return data.items || data || [];
  });

// Alias for compatibility with patientSlice
export const getPatientList = (params = {}) => getAllPatients(params);

export const getPatientById = (patientId) =>
  axios.get(`/patients/${patientId}`).then(res => res.data);

export const updatePatient = (patientId, data) =>
  axios.patch(`/patients/${patientId}`, data).then(res => res.data);

export const deletePatient = (patientId) =>
  axios.delete(`/patients/${patientId}`).then(res => res.data);
