import { apiClient } from './client';

export const assessmentApi = {
  // Kuis
  async getQuizzes() {
    return apiClient.get('/quizzes');
  },

  async getQuizById(quizId: string) {
    return apiClient.get(`/quizzes/${quizId}`);
  },

  async startQuizAttempt(quizId: string) {
    return apiClient.post(`/quizzes/${quizId}/start`);
  },

  async autosaveQuizAnswer(attemptId: string, payload: { questionId: string; selectedOptionId?: string; shortAnswerText?: string; essayAnswerText?: string; isDoubtful?: boolean }) {
    return apiClient.post(`/quizzes/attempts/${attemptId}/autosave`, payload);
  },

  async submitQuizAttempt(attemptId: string) {
    return apiClient.post(`/quizzes/attempts/${attemptId}/submit`);
  },

  // Tugas
  async getAssignments() {
    return apiClient.get('/assignments');
  },

  async getStudentSubmission(assignmentId: string, studentId?: string) {
    return apiClient.get(studentId ? `/assignments/${assignmentId}/submission?studentId=${studentId}` : `/assignments/${assignmentId}/submission`);
  },

  async submitAssignment(assignmentId: string, payload: { fileUrl: string; fileName: string; fileSizeBytes: number; studentNotes?: string }) {
    return apiClient.post(`/assignments/${assignmentId}/submit`, payload);
  },

  async gradeSubmission(submissionId: string, payload: { rubricEvaluations: any[]; feedbackNotes?: string }) {
    return apiClient.post(`/assignments/submissions/${submissionId}/grade`, payload);
  }
};
