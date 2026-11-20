import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('skillbridge_token');
    if (
      token &&
      typeof token === 'string' &&
      token !== 'undefined' &&
      token !== 'null' &&
      token.trim() !== ''
    ) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response interceptor for handling auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired auth session
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');

      // Dispatch event to notify AuthContext to clear in-memory state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('skillbridge:auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default API;
