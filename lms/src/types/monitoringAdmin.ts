/**
 * TIPE DATA MODUL MONITORING AKTIVITAS PEMBELAJARAN — SALAM LMS
 */

export type ActivityType = 
  | 'AKSES_MATERI' 
  | 'TONTON_VIDEO' 
  | 'PENGUMPULAN_TUGAS' 
  | 'KUIS_UJIAN' 
  | 'FORUM_DISKUSI';

export interface ActivityFeedItem {
  activityId: string;
  activityType: ActivityType;
  studentName: string;
  studentNim: string;
  studyProgramCode: string;
  courseName: string;
  className: string;
  detail: string;
  timestamp: string;
}

export interface ClassEngagementItem {
  classId: string;
  className: string;
  academicYear: string;
  courseCode: string;
  courseName: string;
  credits: number;
  studyProgramName: string;
  studyProgramCode: string;
  lecturerName: string;
  enrolledStudentsCount: number | string;
  totalMaterialsCount: number | string;
  totalAssignmentsCount: number | string;
  totalQuizzesCount: number | string;
  completionRatePercent: number;
  averageQuizScore: number;
  statusHealth: 'SANGAT_BAIK' | 'BAIK' | 'PERLU_PERHATIAN';
}

export interface AtRiskStudentItem {
  profileId: string;
  nim: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studyProgramName: string;
  studyProgramCode: string;
  currentSemester: number;
  gpa: number;
  advisorName: string;
  advisorEmail: string;
  phoneNumber: string;
  riskLevel: 'TINGGI' | 'SEDANG' | 'RENDAH';
  riskFactors: string[];
  lastActiveDaysAgo: number;
  recommendedAction: string;
}

export interface MonitoringSummaryStats {
  totalInteractions: number;
  totalMaterialAccesses: number;
  avgVideoProgressPercent: number;
  totalAssignmentSubmissions: number;
  avgAssignmentScore: number;
  totalQuizAttempts: number;
  avgQuizScore: number;
  totalForumPosts: number;
  averageEngagementRate: number;
  atRiskCount: number;
}
