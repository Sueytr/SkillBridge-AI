import API from './api';

export const assistantService = {
  getHistory: async () => {
    const response = await API.get('/assistant/history');
    return response.data;
  },

  sendMessage: async (messageText) => {
    const response = await API.post('/assistant/message', { message: messageText });
    return response.data;
  },

  clearHistory: async () => {
    const response = await API.delete('/assistant/history');
    return response.data;
  }
};
