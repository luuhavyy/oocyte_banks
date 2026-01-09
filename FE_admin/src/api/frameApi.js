import axios from "./axiosConfig";

/**
 * Upload a frame image to a batch
 * @param {string} batchId - Batch ID
 * @param {File} file - Image file
 * @returns {Promise}
 */
export const uploadFrame = (batchId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  
  return axios.post(`/frames/${batchId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then(res => res.data);
};

/**
 * Get all frames for a batch
 * @param {string} batchId - Batch ID
 * @returns {Promise}
 */
export const getFramesByBatch = (batchId) =>
  axios.get(`/frames/batch/${batchId}`).then(res => res.data);

/**
 * Update frame data
 * @param {string} frameId - Frame ID
 * @param {object} data - Update data
 * @returns {Promise}
 */
export const updateFrame = (frameId, data) =>
  axios.patch(`/frames/${frameId}`, data).then(res => res.data);

/**
 * Delete a frame
 * @param {string} frameId - Frame ID
 * @returns {Promise}
 */
export const deleteFrame = (frameId) =>
  axios.delete(`/frames/${frameId}`).then(res => res.data);

