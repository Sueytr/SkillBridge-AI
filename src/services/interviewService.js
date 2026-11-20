import API from './api';

export const interviewService = {
  getInterviews: async () => {
    const response = await API.get('/interviews');
    return response.data;
  },

  listSessions: async () => {
    const response = await API.get('/interviews');
    return response.data;
  },

  createSession: async (sessionData) => {
    const response = await API.post('/interviews', sessionData);
    return response.data;
  },

  getSession: async (id) => {
    const response = await API.get(`/interviews/${id}`);
    return response.data;
  },

  submitAnswer: async (sessionId, questionIdOrData, maybeAnswer) => {
    let payload = {};
    if (typeof questionIdOrData === 'object' && questionIdOrData !== null) {
      payload = {
        questionId: questionIdOrData.questionId,
        answer: questionIdOrData.answer || questionIdOrData.userAnswer
      };
    } else {
      payload = {
        questionId: questionIdOrData,
        answer: maybeAnswer
      };
    }
    const response = await API.post(`/interviews/${sessionId}/answer`, payload);
    return response.data;
  },

  completeSession: async (sessionId) => {
    const response = await API.post(`/interviews/${sessionId}/complete`);
    return response.data;
  }
};
