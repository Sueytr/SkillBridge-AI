import API from './api';

export const authService = {
  login: async (credentials) => {
    const response = await API.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('skillbridge_token', response.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await API.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('skillbridge_token', response.data.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('skillbridge_token');
    localStorage.removeItem('skillbridge_user');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('skillbridge_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  forgotPassword: async (email) => {
    const response = await API.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await API.post(`/auth/reset-password/${token}`, { password });
    return response.data;
  }
};
