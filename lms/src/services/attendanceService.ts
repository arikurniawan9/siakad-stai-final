import { attendanceApi } from '../api/attendanceApi';
import { 
  MeetingAttendanceData, 
  ClassAttendanceSummaryData, 
  StudentCourseAttendanceHistory,
  LearningDeliveryMode,
  AttendanceStatus,
  AttendanceRecordMethod
} from '../types/attendance';

export const attendanceService = {
  getMeetingSession: async (meetingId: string): Promise<MeetingAttendanceData> => {
    return await attendanceApi.getMeetingSession(meetingId);
  },

  openSession: async (meetingId: string, payload: { deliveryMode?: LearningDeliveryMode; teachingJournal?: string }) => {
    return await attendanceApi.openSession(meetingId, payload);
  },

  refreshQrToken: async (meetingId: string) => {
    return await attendanceApi.refreshQrToken(meetingId);
  },

  closeSession: async (meetingId: string, payload?: { teachingJournal?: string; journalNotes?: string }) => {
    return await attendanceApi.closeSession(meetingId, payload);
  },

  recordStudentAttendance: async (
    meetingId: string,
    payload: {
      qrToken?: string;
      passcode?: string;
      method?: AttendanceRecordMethod;
      status?: AttendanceStatus;
      notes?: string;
      attachmentUrl?: string;
    }
  ) => {
    return await attendanceApi.recordStudentAttendance(meetingId, payload);
  },

  updateStudentManual: async (meetingId: string, studentId: string, payload: { status: AttendanceStatus; notes?: string }) => {
    return await attendanceApi.updateStudentManual(meetingId, studentId, payload);
  },

  getClassSummary: async (classId: string): Promise<ClassAttendanceSummaryData> => {
    return await attendanceApi.getClassSummary(classId);
  },

  getStudentHistory: async (): Promise<StudentCourseAttendanceHistory[]> => {
    return await attendanceApi.getStudentHistory();
  }
};
