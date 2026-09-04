import { apiClient } from './client';
import { CourseMeeting, LearningMaterial, RPSSection } from '../types/learning';

export const learningApi = {
  // 1. RPS
  async getRPS(classId: string) {
    return apiClient.get<RPSSection>(`/classes/${classId}/rps`);
  },

  async updateRPS(classId: string, rpsData: Partial<RPSSection>) {
    return apiClient.put<{ message: string; rps: RPSSection }>(`/classes/${classId}/rps`, rpsData);
  },

  async deleteRPS(classId: string) {
    return apiClient.delete<{ message: string }>(`/classes/${classId}/rps`);
  },

  // 2. Pertemuan (Meetings)
  async getMeetings(classId: string) {
    return apiClient.get<CourseMeeting[]>(`/classes/${classId}/meetings`);
  },

  async createMeeting(classId: string, meetingData: Partial<CourseMeeting>) {
    return apiClient.post<{ message: string; meeting: CourseMeeting }>(`/classes/${classId}/meetings`, meetingData);
  },

  async updateMeeting(classId: string, meetingId: string, meetingData: Partial<CourseMeeting>) {
    return apiClient.put<{ message: string; meeting: CourseMeeting }>(`/classes/${classId}/meetings/${meetingId}`, meetingData);
  },

  async deleteMeeting(classId: string, meetingId: string) {
    return apiClient.delete<{ message: string }>(`/classes/${classId}/meetings/${meetingId}`);
  },

  // 3. Materi Pembelajaran (Materials)
  async createMaterial(classId: string, meetingId: string, materialData: Partial<LearningMaterial>) {
    return apiClient.post<{ message: string; material: LearningMaterial }>(`/classes/${classId}/meetings/${meetingId}/materials`, materialData);
  },

  async updateMaterial(classId: string, meetingId: string, materialId: string, materialData: Partial<LearningMaterial>) {
    return apiClient.put<{ message: string; material: LearningMaterial }>(`/classes/${classId}/meetings/${meetingId}/materials/${materialId}`, materialData);
  },

  async deleteMaterial(classId: string, meetingId: string, materialId: string) {
    return apiClient.delete<{ message: string }>(`/classes/${classId}/meetings/${meetingId}/materials/${materialId}`);
  },

  // 4. Akses Logging
  async logMaterialAccess(materialId: string, durationSeconds = 60) {
    return apiClient.post(`/materials/${materialId}/access-log`, { durationSeconds });
  }
};
