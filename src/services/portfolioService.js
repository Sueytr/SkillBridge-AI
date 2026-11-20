import API from './api';

export const portfolioService = {
  getPortfolioData: async () => {
    const response = await API.get('/portfolio');
    return response.data;
  }
};
