import { api } from './client';

export const eventsApi = {
  list: () => api.get('/events'),
  get: (id) => api.get(`/events/${id}`),
  byDate: (date) => api.get(`/events/date/${date}`),
  upcoming: (days = 7) => api.get('/events/upcoming', { days }),
  create: (payload) => api.post('/events', payload),
  update: (id, payload) => api.put(`/events/${id}`, payload),
  remove: (id) => api.delete(`/events/${id}`),
};
