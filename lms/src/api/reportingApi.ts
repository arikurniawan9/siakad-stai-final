import { apiClient } from './client';

export const reportingApi = {
  async getInstitutionalReport(riskThreshold = 50) {
    return apiClient.get(`/reports/institutional?riskThreshold=${riskThreshold}`);
  },

  async getAuditLogs(action?: string, limit = 50) {
    return apiClient.get(action ? `/audit-logs?action=${action}&limit=${limit}` : `/audit-logs?limit=${limit}`);
  }
};
