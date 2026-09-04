import { PublishStatus } from './learning';

export type QuestionType = 
  | 'PILIHAN_GANDA' 
  | 'BENAR_SALAH' 
  | 'JAWABAN_SINGKAT' 
  | 'ESAI';

export type QuestionDifficulty = 'MUDAH' | 'SEDANG' | 'SULIT';

export type ResultVisibility = 'LANGSUNG' | 'SETELAH_DITUTUP' | 'TIDAK_DITAMPILKAN';

export type AttemptStatus = 
  | 'BELUM_MULAI' 
  | 'SEDANG_DIKERJAKAN' 
  | 'DIKUMPULKAN' 
  | 'DINILAI';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ImportQuestionInput {
  courseCode: string;
  topic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  arabicText?: string;
  imageUrl?: string;
  optA?: string;
  optB?: string;
  optC?: string;
  optD?: string;
  optE?: string;
  correctKey: string;
  defaultPoints?: number;
  explanation?: string;
  tags?: string;
}

export interface BankQuestion {
  id: string;
  classId?: string;
  courseCode: string;
  topic: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  arabicText?: string; // Teks Arab / Matan / Ayat Al-Qur'an / Hadits
  imageUrl?: string; // URL / Base64 gambar pendukung soal
  options?: QuizOption[];
  correctShortAnswer?: string; // Untuk jawaban singkat
  essayRubric?: string; // Panduan rubrik penilaian esai
  defaultPoints: number;
  explanation?: string;
  tags: string[];
  createdAt: string;
}

export interface QuizQuestionItem {
  id: string;
  quizId: string;
  bankQuestionId?: string;
  questionNumber: number;
  type: QuestionType;
  questionText: string;
  arabicText?: string; // Teks Arab / Matan / Ayat Al-Qur'an / Hadits
  imageUrl?: string; // URL / Base64 gambar pendukung soal
  options?: QuizOption[];
  correctShortAnswer?: string;
  essayRubric?: string;
  points: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  classId: string;
  meetingId: string;
  courseName: string;
  meetingNumber: number;
  title: string;
  description: string;
  instructions: string;
  durationMinutes: number; // Misal 30 menit
  passingScore: number; // KKM, misal 75
  maxAttempts: number; // Misal 1 atau 2 kali
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  resultVisibility: ResultVisibility;
  startDate: string;
  endDate: string;
  status: PublishStatus;
  questions: QuizQuestionItem[];
  totalPoints: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudentQuizAnswer {
  questionId: string;
  selectedOptionId?: string;
  shortAnswerText?: string;
  essayAnswerText?: string;
  isDoubtful?: boolean; // Tanda ragu-ragu
  earnedPoints?: number;
  isGraded: boolean;
  lecturerFeedback?: string;
  lastSavedAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  classId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  attemptNumber: number;
  status: AttemptStatus;
  startedAt: string;
  expiresAt: string; // Waktu kedaluwarsa berbasis server
  submittedAt?: string;
  answers: Record<string, StudentQuizAnswer>; // Key = questionId
  totalEarnedPoints: number;
  finalScore: number; // Skala 0-100
  isPassed: boolean;
  needsManualGrading: boolean; // True jika memiliki esai yang belum dinilai
  gradedAt?: string;
  gradedByLecturerName?: string;
}
