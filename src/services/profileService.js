import API from './api';

export const profileService = {
  getProfile: async () => {
    const response = await API.get('/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await API.put('/profile', profileData);
    return response.data;
  }
};
