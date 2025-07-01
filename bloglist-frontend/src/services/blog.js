/**
 * Blog API Service Module
 * 
 * This module provides all HTTP client functions for communicating with the backend API.
 * It uses Axios for making HTTP requests and handles authentication tokens automatically.
 * 
 * Features:
 * - Environment-based API URL configuration
 * - Automatic JWT token handling for authenticated requests
 * - RESTful API operations (GET, POST, PUT, DELETE)
 * - Error handling and response processing
 * - Local storage integration for user session management
 * 
 * API Endpoints:
 * - GET /blogs: Fetch all blog posts
 * - POST /login: User authentication
 * - POST /blogs: Create new blog post (authenticated)
 * - PUT /blogs/:id: Update blog post (authenticated)
 * - DELETE /blogs/:id: Delete blog post (authenticated)
 */

import axios from "axios";

/**
 * API Configuration
 * 
 * Set the base URL for all API requests using a runtime placeholder.
 * The placeholder __VITE_API_URL__ gets replaced with the actual API URL
 * when the container starts, allowing the same Docker image to be used
 * across different environments (dev, staging, prod) with different API endpoints.
 */
const API_BASE_URL = "__VITE_API_URL__";

// Debug log to verify correct API URL is being used
console.log("API Base URL:", API_BASE_URL);

/**
 * Get All Blogs
 * 
 * Fetches all blog posts from the server.
 * This is a public endpoint that doesn't require authentication.
 * 
 * @returns {Promise} Axios promise with array of blog objects
 */
export const getAll = () => {
  return axios.get(`${API_BASE_URL}/blogs`);
};

/**
 * User Login
 * 
 * Authenticates user credentials and returns JWT token.
 * The token is used for subsequent authenticated requests.
 * 
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.username - User's username
 * @param {string} credentials.password - User's password
 * @returns {Promise} Axios promise with user data and JWT token
 */
export const login = ({ username, password }) => {
  return axios.post(`${API_BASE_URL}/login`, { username, password });
};

/**
 * Add New Blog Post
 * 
 * Creates a new blog post. Requires authentication.
 * Automatically includes JWT token from localStorage in request headers.
 * 
 * @param {Object} newBlog - Blog post data
 * @param {string} newBlog.title - Blog post title
 * @param {string} newBlog.author - Blog post author
 * @param {string} newBlog.url - Blog post URL
 * @returns {Promise} Axios promise with created blog object
 */
export const addBlog = (newBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.post(`${API_BASE_URL}/blogs`, newBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Update Blog Likes
 * 
 * Updates the like count for a specific blog post. Requires authentication.
 * Typically used when users click the "like" button.
 * 
 * @param {string} id - Blog post ID
 * @param {Object} updateBlog - Updated blog data (usually just incremented likes)
 * @returns {Promise} Axios promise with updated blog object
 */
export const updateLike = (id, updateBlog) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.put(`${API_BASE_URL}/blogs/${id}`, updateBlog, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/**
 * Delete Blog Post
 * 
 * Deletes a specific blog post. Requires authentication.
 * Only the blog post creator can delete their own posts.
 * 
 * @param {string} id - Blog post ID to delete
 * @returns {Promise} Axios promise with deletion confirmation
 */

export const deleteBlog = (id) => {
  const token = JSON.parse(window.localStorage.getItem("userData")).token;
  return axios.delete(`${API_BASE_URL}/blogs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export default { getAll, login, addBlog, updateLike, deleteBlog };
