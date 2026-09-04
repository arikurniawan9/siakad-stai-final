export type ActivityType = 
  | 'MATERI' 
  | 'VIDEO_INTERAKTIF' 
  | 'KUIS' 
  | 'TUGAS' 
  | 'FORUM_DISKUSI';

export type CompletionType = 'OTOMATIS' | 'MANUAL';

export interface CompletionRule {
  type: ActivityType;
  requiresScore?: boolean;
  minScore?: number;
  minWatchedPercentage?: number;
  requiresAllCheckpoints?: boolean;
  requiresSubmission?: boolean;
  requiresDiscussionPost?: boolean;
  allowManualOverride?: boolean;
}

export interface LearningActivityItem {
  id: string;
  classId: string;
  meetingId: string;
  meetingNumber: number;
  courseName: string;
  title: string;
  type: ActivityType;
  resourceId: string; // ID of material / video / quiz / assignment / thread
  isMandatory: boolean;
  rule: CompletionRule;
}

export interface StudentActivityProgress {
  activityId: string;
  studentId: string;
  isCompleted: boolean;
  completedAt?: string;
  completionType: CompletionType;
  progressPercentage: number; // 0 - 100%
  details: string; // Keterangan sumber kelulusan (misal: "Kuis Lulus dengan Nilai 95")
}

export interface MeetingProgressSummary {
  meetingId: string;
  meetingNumber: number;
  title: string;
  totalActivities: number;
  completedActivities: number;
  progressPercentage: number;
  isCompleted: boolean;
  activities: (LearningActivityItem & { progress?: StudentActivityProgress })[];
}

export interface CourseProgressSummary {
  classId: string;
  courseCode: string;
  courseName: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  totalActivities: number;
  completedActivities: number;
  overallPercentage: number;
  meetings: MeetingProgressSummary[];
  nextActivity?: LearningActivityItem; // Aktivitas berikutnya untuk "Lanjutkan Belajar"
  lastActivityAt?: string;
}

export interface StudentClassProgressSummary {
  studentId: string;
  studentNim: string;
  studentName: string;
  totalActivities: number;
  completedActivities: number;
  overallPercentage: number;
  status: 'TERTINGGAL' | 'BERJALAN_NORMAL' | 'SELESAI';
  lastActiveAt?: string;
}
