import axios from "axios";

const API_BASE = "http://localhost:5000/api/batches";

export const getBatches = (userId) =>
  axios.get(API_BASE, { params: { userId } }).then((res) => res.data);

export const addBatch = (data) =>
  axios.post(API_BASE, data).then((res) => res.data);

export const updateBatch = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data).then((res) => res.data);
