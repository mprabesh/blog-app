import axios from "axios";

// Use environment variable with fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api";

console.log("API Base URL:", API_BASE_URL); // Debug log

export const getAll = () => {
  return axios.get(`${API_BASE_URL}/blogs`);
};

export const login = ({ username, password }) => {
  return axios.post(`${API_BASE_URL}/login`, { username, password });
};

export const addBlog = (newBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.post(`${API_BASE_URL}/blogs`, newBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateLike = (id, updateBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.put(`${API_BASE_URL}/blogs/${id}`, updateBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteBlog = (id) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.delete(`${API_BASE_URL}/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default { getAll, login, addBlog, updateLike, deleteBlog };
