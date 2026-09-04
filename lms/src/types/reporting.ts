export interface AtRiskStudentItem {
  studentId: string;
  studentNim: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  progressPercentage: number;
  uncompletedActivitiesCount: number;
  riskFactor: 'PROGRES_RENDAH' | 'TUGAS_TERLEWAT' | 'KUIS_BELUM_LULUS';
  lastActivityAt?: string;
}

export interface LecturerComplianceItem {
  lecturerId: string;
  lecturerName: string;
  courseCode: string;
  courseName: string;
  totalMeetings: number;
  publishedMeetings: number;
  draftMeetings: number;
  pendingAssignmentGradingCount: number;
  pendingQuizGradingCount: number;
  complianceRate: number; // Persentase keterlaksanaan RPS
}

export interface AcademicSyncHealthSummary {
  lastSyncAt: string;
  overallStatus: 'SEHAT' | 'PERLU_PERHATIAN' | 'GAGAL';
  totalSyncedEntities: number;
  successRate: number;
  conflictsCount: number;
  recentSyncRunsCount: number;
}

export interface InstitutionalReportSummary {
  academicYear: string;
  totalActiveClasses: number;
  totalEnrolledStudents: number;
  totalActiveLecturers: number;
  averageStudentProgress: number;
  totalAtRiskStudents: number;
  totalPendingGrading: number;
  atRiskStudents: AtRiskStudentItem[];
  lecturerCompliances: LecturerComplianceItem[];
  syncHealth: AcademicSyncHealthSummary;
}
