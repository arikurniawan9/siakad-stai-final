/**
 * Tipe Data untuk Modul Kartu Rencana Studi (KRS) Mahasiswa & Persetujuan Dosen PA
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export type KrsStatus = 
  | 'DRAF' 
  | 'MENUNGGU_PERSETUJUAN' 
  | 'DISETUJUI' 
  | 'DITOLAK_REVISI';

export interface KrsCourseItem {
  id: string;
  classId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  className: string;
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  startTime: string; // "08:00"
  endTime: string;   // "10:30"
  roomId: string;
  roomName: string;
  roomCode: string;
  building: string;
  lecturerId: string;
  lecturerName: string;
  lecturerNidn: string;
  courseType: 'WAJIB_PRODI' | 'WAJIB_INSTITUSI' | 'PILIHAN';
  isSelected: boolean;
  isLocked: boolean; // True jika sudah disetujui dosen PA
  prerequisiteMet: boolean;
  prerequisiteInfo?: string;
  quota: number;
  enrolledCount: number;
  scheduleConflictWith?: string; // Menyimpan Nama MK / Info jika bentrok
}

export interface StudentKrsData {
  id: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studyProgram: string;
  studyProgramCode: string;
  academicDegree: string;
  semesterNumber: number;
  academicPeriodId: string;
  academicPeriodName: string;
  academicYear: string;
  previousSemesterGpa: number; // Indeks Prestasi Semester Lalu (IPS)
  cumulativeGpa: number; // Indeks Prestasi Kumulatif (IPK)
  maxCreditQuota: number; // Batas Maksimum SKS Berdasarkan IPS (24 SKS)
  totalCreditsTaken: number; // Total SKS Diambil Semester Ini
  totalCumulativeCreditsEarned: number; // Total SKS Kumulatif Lulus
  krsStatus: KrsStatus;
  submissionDate?: string;
  approvedDate?: string;
  academicAdvisorId: string;
  academicAdvisorName: string;
  academicAdvisorNidn: string;
  academicAdvisorNotes?: string;
  courses: KrsCourseItem[];
}

export interface KrsHistoryItem {
  id: string;
  semesterNumber: number;
  academicPeriodName: string;
  academicYear: string;
  totalCredits: number;
  semesterGpa: number;
  cumulativeGpa: number;
  courseCount: number;
  krsStatus: KrsStatus;
  approvedDate: string;
  advisorName: string;
}

export interface KrsConsultationMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'MAHASISWA' | 'DOSEN_PA';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AdviseeKrsOverview {
  studentId: string;
  studentNim: string;
  studentName: string;
  avatarUrl?: string;
  studyProgram: string;
  semesterNumber: number;
  previousSemesterGpa: number;
  cumulativeGpa: number;
  maxCreditQuota: number;
  totalCreditsTaken: number;
  courseCount: number;
  krsStatus: KrsStatus;
  submissionDate?: string;
  approvedDate?: string;
  hasScheduleConflict: boolean;
  hasPrerequisiteIssue: boolean;
  unreadMessagesCount: number;
  academicAdvisorNotes?: string;
}

export interface KrsAdvisorStats {
  totalAdvisees: number;
  pendingApproval: number;
  approved: number;
  revisionNeeded: number;
  draftCount: number;
  totalCreditsAverage: number;
}
