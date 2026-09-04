import { apiClient } from './client';

export const authApi = {
  async login(username: string, password: string) {
    return apiClient.post('/auth/login', { username, password });
  },

  async getMe() {
    return apiClient.get('/auth/me');
  },

  async switchRole(targetRole: string) {
    return apiClient.post('/auth/switch-role', { targetRole });
  }
};
