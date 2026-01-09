import axios from "./axiosConfig";

/**
 * Start evaluation for a batch
 * @param {string} batchId - Batch ID
 * @returns {Promise}
 */
export const startBatchEvaluation = (batchId) =>
  axios.post(`/evaluation/batch/${batchId}/start`).then(res => res.data);

/**
 * Re-evaluate a batch (overwrite existing results)
 * @param {string} batchId - Batch ID
 * @returns {Promise}
 */
export const reEvaluateBatch = (batchId) =>
  axios.post(`/evaluation/batch/${batchId}/re-evaluate`).then(res => res.data);

/**
 * Get evaluation status for a batch
 * @param {string} batchId - Batch ID
 * @returns {Promise}
 */
export const getEvaluationStatus = (batchId) =>
  axios.get(`/evaluation/batch/${batchId}/status`).then(res => res.data);

