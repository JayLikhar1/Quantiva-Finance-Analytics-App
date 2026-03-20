import api from './axios';

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data),
  getBudgets: () => api.get('/auth/budgets'),
  saveBudgets: (budgets) => api.put('/auth/budgets', { budgets }),
};

export const transactionsAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  create: (data) => api.post('/transactions', data),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
};

export const analyticsAPI = {
  getSummary: () => api.get('/analytics/summary'),
  getCategories: (params) => api.get('/analytics/categories', { params }),
  getMonthly: (params) => api.get('/analytics/monthly', { params }),
  getMoM: () => api.get('/analytics/mom'),
  getForecast: () => api.get('/analytics/forecast'),
  getBehavioral: () => api.get('/analytics/behavioral'),
  getHealth: () => api.get('/analytics/health'),
  getInsights: () => api.get('/analytics/insights'),
  getHeatmap: () => api.get('/analytics/heatmap'),
  getCategorySpend: (params) => api.get('/analytics/categories', { params }),
};
