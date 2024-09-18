import axios from "axios";
const baseUrl = "http://localhost:3003/api/blogs";
const loginUrl = "http://localhost:3003/api/login";

export const getAll = () => {
  return axios.get(baseUrl);
};

export const login = ({ username, password }) => {
  return axios.post(loginUrl, { username, password });
};

export const addBlog = (newBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.post(baseUrl, newBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateLike = (id, updateBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.put(`${baseUrl}/${id}`, updateBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteBlog = (id) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.delete(`${baseUrl}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default { getAll, login, addBlog, updateLike, deleteBlog };
