/**
 * utils/api.js — Axios instance pre-configured with the backend base URL.
 * Automatically attaches the JWT token to every request.
 */

import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
});

// ─── Request Interceptor: Attach JWT ──────────────────────────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("chatapp_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor: Handle 401 ─────────────────────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect
      localStorage.removeItem("chatapp_token");
      localStorage.removeItem("chatapp_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
