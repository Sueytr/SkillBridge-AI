import API from './api';

export const preparationService = {
  getPreparationPlan: async () => {
    const response = await API.get('/preparation');
    return response.data;
  },

  getPlan: async () => {
    const response = await API.get('/preparation');
    return response.data;
  },

  updateItemStatus: async (itemId, status) => {
    const response = await API.put(`/preparation/items/${itemId}/status`, { status });
    return response.data;
  }
};

export default preparationService;
