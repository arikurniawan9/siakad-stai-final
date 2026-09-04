import { apiClient } from './client';

export const progressApi = {
  async getCourseProgress(classId: string, studentId?: string) {
    return apiClient.get(studentId ? `/progress/classes/${classId}?studentId=${studentId}` : `/progress/classes/${classId}`);
  },

  async getClassProgressList(classId: string) {
    return apiClient.get(`/progress/classes/${classId}/students`);
  }
};
