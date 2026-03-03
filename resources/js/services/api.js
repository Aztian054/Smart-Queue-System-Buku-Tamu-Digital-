import axios from 'axios';

const API_BASE = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==================== PUBLIC API ====================

export const publicApi = {
  // Get active services
  getServices: () => api.get('/services'),

  // Register visitor
  registerVisitor: (data) => api.post('/queue/register', data),

  // Get ticket by ID
  getTicket: (id) => api.get(`/ticket/${id}`),

  // Get ticket by code
  getTicketByCode: (code) => api.get(`/ticket/code/${code}`),

  // Get display data
  getDisplayData: () => api.get('/display/current'),
};

// ==================== ADMIN API ====================

export const adminApi = {
  // Auth
  login: (credentials) => api.post('/admin/login', credentials),
  logout: () => api.post('/admin/logout'),
  me: () => api.get('/admin/me'),

  // Queue
  getQueues: (params) => api.get('/admin/queue', { params }),
  getStats: () => api.get('/admin/queue/stats'),
  getQueueHistory: (params) => api.get(`/admin/queue/history?${params}`),
  callQueue: (queueId, counterNumber) => api.post('/admin/queue/call', { queue_id: queueId, counter_number: counterNumber }),
  doneQueue: (id) => api.post(`/admin/queue/${id}/done`),
  skipQueue: (id) => api.post(`/admin/queue/${id}/skip`),
  recallQueue: (id) => api.post(`/admin/queue/${id}/recall`),

  // Services
  getServices: () => api.get('/admin/services'),
  createService: (data) => api.post('/admin/services', data),
  updateService: (id, data) => api.put(`/admin/services/${id}`, data),
  deleteService: (id) => api.delete(`/admin/services/${id}`),

  // Counters
  getCounters: () => api.get('/admin/services/counters'),
  createCounter: (data) => api.post('/admin/services/counters', data),
  updateCounter: (id, data) => api.put(`/admin/services/counters/${id}`, data),
  deleteCounter: (id) => api.delete(`/admin/services/counters/${id}`),
};

export default api;