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
 * Set the base URL for all API requests with environment-aware configuration.
 * This supports both development and production deployment patterns:
 * 
 * Development: Uses Vite environment variables (import.meta.env.VITE_API_URL)
 * Production: Uses runtime placeholder replacement (__VITE_API_URL__)
 * 
 * The placeholder __VITE_API_URL__ gets replaced with the actual API URL
 * when the container starts, allowing the same Docker image to be used
 * across different environments (dev, staging, prod) with different API endpoints.
 */

// Check if we're in development mode or if the placeholder hasn't been replaced
const isDevelopment = import.meta.env.DEV;

let API_BASE_URL;

if (isDevelopment) {
  // Development mode - use Vite environment variables
  API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
} else {
  // Production mode - check if we should use proxy or direct calls
  const placeholder = "__VITE_API_URL__";
  
  // If placeholder is replaced, use the provided URL
  // If not replaced, use relative URLs (proxy mode)
  if (placeholder !== "__VITE_API_URL__") {
    API_BASE_URL = placeholder;
  } else {
    // Use relative URLs for nginx proxy
    API_BASE_URL = "/api";
  }
}

// Debug log to verify correct API URL is being used
console.log("Environment:", isDevelopment ? "Development" : "Production");
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
 * User Registration
 * 
 * Register a new user account with username, name, email, and password.
 * No authentication required as this creates a new user account.
 * 
 * @param {Object} userData - User registration data
 * @param {string} userData.username - Unique username (min 3 chars, alphanumeric + underscore)
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address (must be valid email format)
 * @param {string} userData.password - User's password (min 3 characters)
 * @returns {Promise} Axios promise with created user object
 */
export const register = ({ username, name, email, password }) => {
  return axios.post(`${API_BASE_URL}/users`, { username, name, email, password });
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

export default { getAll, login, register, addBlog, updateLike, deleteBlog };
