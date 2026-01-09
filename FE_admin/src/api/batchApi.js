import axios from "./axiosConfig";

export const createBatch = (data) =>
  axios.post("/batches/", data).then(res => res.data);

export const getBatch = (batchId) =>
  axios.get(`/batches/${batchId}`).then(res => res.data);

export const getBatchesByPatient = (patientId) =>
  axios.get(`/batches/patient/${patientId}`).then(res => res.data);

export const deleteBatch = (batchId) =>
  axios.delete(`/batches/${batchId}`).then(res => res.data);

export const approveBatchEligibility = (batchId, approved, notes) =>
  axios.post(`/batches/${batchId}/approve-eligibility`, { approved, notes }).then(res => res.data);
