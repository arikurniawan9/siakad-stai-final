import { apiClient } from './client';
import { 
  MeetingAttendanceData, 
  ClassAttendanceSummaryData, 
  StudentCourseAttendanceHistory,
  LearningDeliveryMode,
  AttendanceStatus,
  AttendanceRecordMethod
} from '../types/attendance';

export const attendanceApi = {
  // 1. Ambil data sesi presensi pertemuan & daftar mahasiswa
  async getMeetingSession(meetingId: string) {
    return apiClient.get<MeetingAttendanceData>(`/attendance/meetings/${meetingId}/session`);
  },

  // 2. Buka sesi presensi (Dosen)
  async openSession(meetingId: string, payload: { deliveryMode?: LearningDeliveryMode; teachingJournal?: string }) {
    return apiClient.post<{ session: any; qrToken: string; qrExpiresAt: string; passcode: string }>(
      `/attendance/meetings/${meetingId}/open`,
      payload
    );
  },

  // 3. Refresh QR Token dinamis
  async refreshQrToken(meetingId: string) {
    return apiClient.post<{ qrToken: string; qrExpiresAt: string; passcode: string }>(
      `/attendance/meetings/${meetingId}/refresh-qr`
    );
  },

  // 4. Tutup sesi presensi (Dosen)
  async closeSession(meetingId: string, payload?: { teachingJournal?: string; journalNotes?: string }) {
    return apiClient.post<{ session: any; finalAttendanceRate: number }>(
      `/attendance/meetings/${meetingId}/close`,
      payload || {}
    );
  },

  // 5. Submit presensi mahasiswa (QR Scan / Passcode / Izin)
  async recordStudentAttendance(
    meetingId: string, 
    payload: { 
      qrToken?: string; 
      passcode?: string; 
      method?: AttendanceRecordMethod; 
      status?: AttendanceStatus;
      notes?: string; 
      attachmentUrl?: string; 
    }
  ) {
    return apiClient.post<{ message: string; attendance: any }>(
      `/attendance/meetings/${meetingId}/record`,
      payload
    );
  },

  // 6. Update manual status presensi mahasiswa oleh dosen
  async updateStudentManual(meetingId: string, studentId: string, payload: { status: AttendanceStatus; notes?: string }) {
    return apiClient.put<{ message: string; attendance: any }>(
      `/attendance/meetings/${meetingId}/students/${studentId}`,
      payload
    );
  },

  // 7. Ambil rekap kehadiran kelas (Seluruh 16 pertemuan)
  async getClassSummary(classId: string) {
    return apiClient.get<ClassAttendanceSummaryData>(`/attendance/classes/${classId}/summary`);
  },

  // 8. Ambil riwayat presensi mahasiswa login
  async getStudentHistory() {
    return apiClient.get<StudentCourseAttendanceHistory[]>(`/attendance/students/history`);
  }
};
