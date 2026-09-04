import { PublishStatus } from './learning';

export type VideoQuestionType = 'PILIHAN_GANDA' | 'BENAR_SALAH' | 'JAWABAN_SINGKAT';

export interface VideoQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface VideoQuestionCheckpoint {
  id: string;
  videoId: string;
  timestampSeconds: number; // Detik kemunculan pertanyaan (misal: 120 = 02:00)
  title: string;
  questionText: string;
  type: VideoQuestionType;
  options: VideoQuestionOption[];
  correctAnswerText?: string; // Untuk jawaban singkat
  explanation?: string; // Pembahasan/penjelasan
  isRequired: boolean; // Wajib dijawab untuk lanjut
  allowRetry: boolean; // Boleh mencoba lagi bila salah
}

export interface InteractiveVideo {
  id: string;
  classId: string;
  meetingId: string;
  courseName: string;
  meetingNumber: number;
  title: string;
  description: string;
  videoUrl: string;
  posterUrl?: string;
  durationSeconds: number;
  minWatchedPercentage: number; // Default 80%
  allowFastForward: boolean; // Dilarang lompat maju sebelum ditonton
  status: PublishStatus;
  checkpoints: VideoQuestionCheckpoint[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswerRecord {
  checkpointId: string;
  selectedOptionId?: string;
  textAnswer?: string;
  isCorrect: boolean;
  answeredAt: string;
  attemptsCount: number;
}

export interface WatchedTimeSegment {
  startSeconds: number;
  endSeconds: number;
}

export interface StudentVideoProgress {
  id: string;
  videoId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  lastPositionSeconds: number;
  maxWatchedPositionSeconds: number;
  watchedSegments: WatchedTimeSegment[];
  effectiveWatchedPercentage: number;
  answeredQuestions: QuestionAnswerRecord[];
  isCompleted: boolean;
  completedAt?: string;
  lastSyncedAt: string;
}
