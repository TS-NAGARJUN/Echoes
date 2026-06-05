/**
 * @file utils/api.js
 * @description API utility for backend communication
 */

import axios from 'axios';

// Ensure the configured VITE_API_URL includes the `/api` prefix.
// Vite env vars are baked at build time; if someone sets VITE_API_URL
// to a root domain (e.g. https://example.com) we append /api.
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let API_URL = rawApiUrl;
if (!/\/api(?:\/)?$/i.test(API_URL)) {
  API_URL = API_URL.replace(/\/+$/g, '') + '/api';
}

/**
 * Create axios instance with default config
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Add token to requests
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Handle response errors
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      return Promise.reject(new Error(error.response.data.message || 'Something went wrong'));
    }
    return Promise.reject(error);
  }
);

export default api;
