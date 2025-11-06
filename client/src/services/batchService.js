import axios from "axios";

const API_BASE = "http://localhost:5000/api/batches";

// Patch: skip API call if userId is missing
export const getBatches = (userId) => {
  if (!userId) return Promise.resolve([]); // Don't call API with undefined/null!
  return axios.get(API_BASE, { params: { userId } }).then((res) => res.data);
};

export const addBatch = (data) =>
  axios.post(API_BASE, data).then((res) => res.data);

export const updateBatch = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data).then((res) => res.data);
