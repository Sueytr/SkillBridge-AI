import API from './api';

export const resumeService = {
  getResumes: async () => {
    const response = await API.get('/resumes');
    return response.data;
  },

  uploadResume: async (formData) => {
    const response = await API.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getCurrentResume: async () => {
    const response = await API.get('/resumes/current');
    return response.data;
  },

  updateResumeText: async (id, extractedText) => {
    const response = await API.put(`/resumes/${id}/text`, { extractedText });
    return response.data;
  },

  reprocessResume: async (id) => {
    const response = await API.post(`/resumes/${id}/reprocess`);
    return response.data;
  },

  setActiveResume: async (id) => {
    const response = await API.put(`/resumes/${id}/active`);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await API.delete(`/resumes/${id}`);
    return response.data;
  },

  analyzeResume: async (id) => {
    const response = await API.post(`/resumes/${id}/analyze`);
    return response.data;
  },

  getResumeAnalysis: async (id) => {
    const response = await API.get(`/resumes/${id}/analyze`);
    return response.data;
  },

  getLatestAnalysis: async () => {
    const response = await API.get('/analysis/latest');
    return response.data;
  }
};
