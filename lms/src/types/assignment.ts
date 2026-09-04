import { PublishStatus } from './learning';

export type SubmissionType = 'BERKAS_UNGGAHAN' | 'TEKS_DARING' | 'KEDUANYA';

export type SubmissionStatus = 
  | 'BELUM_DIKUMPULKAN' 
  | 'SUDAH_DIKUMPULKAN' 
  | 'TERLAMBAT' 
  | 'PERLU_REVISI' 
  | 'SUDAH_DINILAI';

export interface RubricLevel {
  id: string;
  title: string; // Misal: "Sangat Baik", "Baik", "Cukup", "Kurang"
  points: number; // Misal: 100, 80, 60, 40
  description: string;
}

export interface RubricCriterion {
  id: string;
  title: string; // Misal: "Ketepatan Analisis Hukum", "Kelengkapan Rujukan"
  description: string;
  weightPercentage: number; // Misal: 40%, 30%, 30% (Total = 100%)
  maxPoints: number; // Misal: 100
  levels: RubricLevel[];
}

export interface AssignmentRubric {
  id: string;
  title: string;
  description?: string;
  criteria: RubricCriterion[];
}

export interface Assignment {
  id: string;
  classId: string;
  meetingId: string;
  courseName: string;
  className?: string;
  meetingNumber: number;
  title: string;
  description: string;
  instructions: string;
  attachmentUrl?: string;
  attachmentName?: string;
  openDate: string;
  dueDate: string; // Batas Waktu Pengumpulan
  maxScore: number; // Default 100
  allowLateSubmission: boolean; // Boleh kumpul terlambat
  latePenaltyPercentage: number; // Misal potong 10% jika terlambat
  allowResubmission: boolean; // Boleh kumpul ulang (revisi)
  maxResubmissions: number; // Misal 2x revisi
  submissionType: SubmissionType;
  allowedFileExtensions: string[]; // ['.pdf', '.docx', '.pptx', '.zip']
  maxFileSizeBytes: number; // Misal: 10485760 (10MB)
  status: PublishStatus;
  rubric?: AssignmentRubric;
  createdAt: string;
  updatedAt: string;
  
  // Aggregate stats (dari backend)
  totalSubmissionsCount?: number;
  gradedSubmissionsCount?: number;
  totalStudentsCount?: number;
  averageScore?: number;

  // Student specific view fields
  submissionId?: string;
  submissionStatus?: SubmissionStatus;
  studentFinalScore?: number;
  isLateSubmission?: boolean;
  studentSubmittedAt?: string;
}

export interface RubricEvaluationItem {
  criterionId: string;
  selectedLevelId: string;
  awardedScore: number;
  note?: string;
}

export interface SubmissionVersionHistory {
  version: number;
  submittedAt: string;
  fileName?: string;
  fileSizeBytes?: number;
  fileMimeType?: string;
  fileUrl?: string;
  fileDataUrl?: string;
  textContent?: string;
  studentNotes?: string;
  note?: string;
  status?: SubmissionStatus;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  classId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  version: number;
  submittedAt: string;
  isLate: boolean;
  status: SubmissionStatus;
  fileName?: string;
  fileSizeBytes?: number;
  fileMimeType?: string;
  fileUrl?: string;
  fileDataUrl?: string;
  textContent?: string;
  studentNotes?: string;
  rubricEvaluations?: RubricEvaluationItem[];
  finalScore?: number; // Skala 0 - 100
  rawScore?: number; // Skor sebelum penalti terlambat
  penaltyDeduction?: number; // Pengurangan nilai terlambat
  feedbackNotes?: string;
  lecturerFeedback?: string;
  gradedAt?: string;
  gradedByLecturerName?: string;
  history: SubmissionVersionHistory[];
}

export interface CreateAssignmentInput {
  classId: string;
  meetingId: string;
  title: string;
  description?: string;
  instructions: string;
  attachmentName?: string;
  attachmentUrl?: string;
  openDate?: string;
  dueDate: string;
  maxScore?: number;
  allowLateSubmission?: boolean;
  latePenaltyPercentage?: number;
  allowResubmission?: boolean;
  maxResubmissions?: number;
  submissionType?: SubmissionType;
  allowedFileExtensions?: string[];
  maxFileSizeBytes?: number;
  status?: PublishStatus;
  rubric?: AssignmentRubric;
}
