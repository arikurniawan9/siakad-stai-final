/**
 * TIPE DATA MODUL MONITORING & REKAPITULASI NILAI AKADEMIK — SALAM LMS
 */

export interface GradeDistributionItem {
  grade: string;
  count: number | string;
}

export interface GradeSummaryStats {
  averageCampusScore: number;
  totalGradesRecorded: number;
  passRatePercent: number;
  gradeDistribution: GradeDistributionItem[];
  totalClasses: number;
  publishedClasses: number;
}

export interface ClassGradeSummary {
  classId: string;
  className: string;
  academicYear: string;
  courseCode: string;
  courseName: string;
  credits: number;
  studyProgramName: string;
  studyProgramCode: string;
  lecturerName: string;
  enrolledCount: number | string;
  gradedCount: number | string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  status: 'DRAF' | 'FINALISASI' | 'DITERBITKAN' | 'DIKUNCI';
  publishedAt?: string | null;
}

export interface StudentCourseGrade {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  studyProgramCode: string;
  gradeId?: string;
  presenceScore: number;
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalExamScore: number;
  finalScore: number;
  letterGrade: string;
  gradePoint: number;
  status: 'DRAF' | 'FINALISASI' | 'DITERBITKAN' | 'DIKUNCI';
  updatedAt?: string;
}

export interface TranscriptCourseItem {
  gradeId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  className: string;
  academicYear: string;
  finalScore: number;
  letterGrade: string;
  gradePoint: number;
  qualityPoints: number;
  status: string;
}

export interface StudentTranscript {
  studentId: string;
  totalCredits: number;
  totalQualityPoints: number;
  gpa: number;
  courses: TranscriptCourseItem[];
}

export interface UpdateGradePayload {
  presenceScore: number;
  assignmentScore: number;
  quizScore: number;
  midtermScore: number;
  finalExamScore: number;
  status?: string;
}
