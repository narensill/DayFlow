import { api } from './client';

export const authApi = {
  register: (payload) => api.publicPost('/auth/register', payload),
  login: (payload) => api.publicPost('/auth/login', payload),
  me: () => api.get('/auth/me'),
  changePassword: (payload) => api.put('/auth/password', payload),
};
