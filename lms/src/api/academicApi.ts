import { apiClient } from './client';

export const academicApi = {
  async getClasses() {
    return apiClient.get('/academic/classes');
  },

  async syncAcademicData(payload: { syncClasses?: any[]; syncStudents?: any[]; syncLecturers?: any[] }) {
    return apiClient.post('/academic/sync', payload);
  },

  async getSyncLogs() {
    return apiClient.get('/academic/sync-logs');
  }
};
