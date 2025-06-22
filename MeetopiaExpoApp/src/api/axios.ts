import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Environment-based API configuration
const getApiBaseUrl = () => {
  if (__DEV__) {
    // Use Expo's manifest to get the correct development URL
    const debuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
    return debuggerHost ? `http://${debuggerHost}:3003` : 'http://localhost:3003';
  }
  return 'https://meetopiaapp.onrender.com'; // Production
};

const API_BASE_URL = getApiBaseUrl();

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