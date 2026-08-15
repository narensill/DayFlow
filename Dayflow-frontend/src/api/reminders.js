import { api } from './client';

export const remindersApi = {
  list: () => api.get('/reminders'),
  due: () => api.get('/reminders/due'),
  get: (id) => api.get(`/reminders/${id}`),
  create: (payload) => api.post('/reminders', payload),
  update: (id, payload) => api.put(`/reminders/${id}`, payload),
  remove: (id) => api.delete(`/reminders/${id}`),
  trigger: (id) => api.patch(`/reminders/${id}/trigger`),
};
