import { apiClient } from './client';

export const notificationApi = {
  async getNotifications() {
    return apiClient.get('/notifications');
  },

  async markAsRead(notificationId: string) {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    return apiClient.post('/notifications/mark-all-read');
  },

  async getCalendarEvents() {
    return apiClient.get('/calendar/events');
  }
};
