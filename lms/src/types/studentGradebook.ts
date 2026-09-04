/**
 * Tipe Data untuk Modul Buku Nilai & Penilaian Pembelajaran Mahasiswa (Student Gradebook)
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { LetterGrade } from './khs';

export type AssessmentComponentType = 
  | 'PRESENSI' 
  | 'TUGAS' 
  | 'KUIS' 
  | 'UTS' 
  | 'UAS' 
  | 'PARTISIPASI_FORUM';

export type GradeInquiryStatus = 
  | 'MENUNGGU_TINJAUAN' 
  | 'SEDANG_DIPROSES' 
  | 'DISETUJUI_REVISI' 
  | 'DITOLAK';

export interface AssessmentItemDetail {
  id: string;
  title: string;
  componentType: AssessmentComponentType;
  meetingNumber?: number;
  weightPercentage: number;     // Misal Tugas 1 berbobot 10% dari total 20% tugas
  maxScore: number;             // Default 100
  earnedScore: number | null;   // Null jika belum dinilai
  rawScore?: number;
  penaltyDeduction?: number;
  dueDate?: string;
  submittedAt?: string;
  gradedAt?: string;
  lecturerFeedback?: string;
  rubricSummary?: {
    criterionTitle: string;
    levelTitle: string;
    points: number;
    maxPoints: number;
  }[];
  isGraded: boolean;
}

export interface CourseGradebookSummary {
  classId: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  className: string;
  lecturerName: string;
  lecturerNidn: string;
  academicYear: string;
  
  // Rata-rata & skor komponen
  presenceScore: number;         // 10%
  presenceDetails: {
    totalMeetings: number;
    attendedCount: number;
    excusedCount: number;
    sickCount: number;
    absentCount: number;
    attendancePercentage: number;
  };

  assignmentScore: number;       // 20%
  quizScore: number;             // 15%
  midtermScore: number;          // 25%
  finalExamScore: number;        // 30%
  forumParticipationScore?: number;

  currentCalculatedScore: number; // Skor berjalan (0-100)
  projectedLetterGrade: LetterGrade;
  projectedGradePoint: number;
  gradedComponentsCount: number;
  totalComponentsCount: number;
  isFinalized: boolean;

  items: AssessmentItemDetail[];
  lecturerGeneralNotes?: string;
}

export interface GradeInquiryRequest {
  id: string;
  classId: string;
  courseName: string;
  assessmentItemId: string;
  assessmentTitle: string;
  studentId: string;
  studentName: string;
  studentNim: string;
  currentScore: number;
  reasonCategory: 'REVISI_PENILAIAN' | 'KOREKSI_BERKAS' | 'KETIDAKSESUAIAN_RUBRIK' | 'LAINNYA';
  inquiryMessage: string;
  lecturerResponse?: string;
  revisedScore?: number;
  status: GradeInquiryStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface TargetGradeSimulation {
  classId: string;
  targetLetterGrade: LetterGrade;
  targetScore: number;
  requiredFinalExamScore: number;
  isAchievable: boolean;
  notes: string;
}
