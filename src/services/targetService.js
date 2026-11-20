import API from './api';

export const targetService = {
  getTarget: async () => {
    const response = await API.get('/targets');
    return response.data;
  },

  saveTarget: async (targetData) => {
    const response = await API.post('/targets', targetData);
    return response.data;
  }
};
