import { api } from './client';

export const weatherApi = {
  current: (city) => api.get('/weather', { city }),
};
