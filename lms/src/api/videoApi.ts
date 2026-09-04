import { apiClient } from './client';

export const videoApi = {
  async getVideos(classId?: string) {
    return apiClient.get(classId ? `/videos?classId=${classId}` : '/videos');
  },

  async getVideoById(videoId: string) {
    return apiClient.get(`/videos/${videoId}`);
  },

  async getVideoProgress(videoId: string) {
    return apiClient.get(`/videos/${videoId}/progress`);
  },

  async updateVideoProgress(videoId: string, currentPlaybackTime: number, segmentDuration = 5) {
    return apiClient.post(`/videos/${videoId}/progress`, { currentPlaybackTime, segmentDuration });
  },

  async submitCheckpointAnswer(videoId: string, checkpointId: string, payload: { selectedOptionId?: string; textAnswer?: string }) {
    return apiClient.post(`/videos/${videoId}/checkpoints/${checkpointId}/answer`, payload);
  }
};
