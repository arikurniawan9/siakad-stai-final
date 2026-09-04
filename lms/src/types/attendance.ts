export type AttendanceSessionStatus = 'BELUM_DIBUKA' | 'DIBUKA' | 'DITUTUP';
export type AttendanceStatus = 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA';
export type LearningDeliveryMode = 'TATAP_MUKA' | 'DARING' | 'HYBRID';
export type AttendanceRecordMethod = 'QR_SCAN' | 'PASSCODE' | 'MANUAL_DOSEN' | 'SURAT_IZIN';

export interface MeetingAttendanceSession {
  id: string;
  meetingId: string;
  classId: string;
  lecturerId: string;
  sessionStatus: AttendanceSessionStatus;
  deliveryMode: LearningDeliveryMode;
  qrToken?: string;
  qrExpiresAt?: string;
  passcode?: string;
  openedAt?: string;
  closedAt?: string;
  teachingJournal?: string;
  journalNotes?: string;
  studentAttendanceRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  studentNim: string;
  studentEmail?: string;
  status: AttendanceStatus;
  method?: AttendanceRecordMethod;
  recordedAt?: string;
  notes?: string;
  attachmentUrl?: string;
}

export interface MeetingAttendanceData {
  meeting: {
    id: string;
    classId: string;
    meetingNumber: number;
    title: string;
    topic: string;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    className: string;
    classCode: string;
    courseName: string;
    credits: number;
    lecturerName: string;
    lecturerId: string;
  };
  session: MeetingAttendanceSession;
  students: StudentAttendanceRecord[];
  summary: {
    totalStudents: number;
    countHadir: number;
    countSakit: number;
    countIzin: number;
    countAlpa: number;
    attendancePercentage: number;
  };
}

export interface StudentRecapRow {
  studentId: string;
  studentName: string;
  studentNim: string;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  totalMeetings: number;
  percentage: number;
  isEligibleForExam: boolean;
  meetingStatuses: Record<string | number, AttendanceStatus>;
}

export interface ClassAttendanceSummaryData {
  classInfo: {
    id: string;
    name: string;
    code: string;
    courseName: string;
    credits: number;
    lecturerName: string;
    lecturerNidn?: string;
  };
  meetings: Array<{
    id: string;
    meetingNumber: number;
    title: string;
    scheduledDate: string;
    status: string;
  }>;
  recap: StudentRecapRow[];
}

export interface StudentCourseAttendanceHistory {
  classId: string;
  className: string;
  courseName: string;
  courseCode: string;
  credits: number;
  lecturerName: string;
  totalMeetings: number;
  hadir: number;
  sakit: number;
  izin: number;
  alpa: number;
  percentage: number;
  isEligibleForExam: boolean;
}
