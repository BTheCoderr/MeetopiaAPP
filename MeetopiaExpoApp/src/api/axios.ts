import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Environment-based API configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.225.6.23:3003'  // Development - Use your computer's IP
  : 'https://meetopiaapp.onrender.com';  // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = getAuthToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL }; 