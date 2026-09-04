import { UserRole } from './roles';

export interface DiscussionAttachment {
  fileName: string;
  fileSizeBytes: number;
  fileUrl: string;
}

export interface DiscussionPost {
  id: string;
  threadId: string;
  parentPostId?: string; // Untuk balasan berulir (threaded reply)
  authorId: string;
  authorName: string;
  authorNimOrNidn: string;
  authorRole: UserRole;
  content: string;
  attachment?: DiscussionAttachment;
  isBestAnswer: boolean; // Ditandai dosen sebagai jawaban terbaik
  isHidden: boolean; // Disembunyikan oleh moderator/dosen
  moderationReason?: string;
  moderatedByLecturerName?: string;
  upvotesCount: number;
  upvotedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  replies?: DiscussionPost[];
}

export interface DiscussionThread {
  id: string;
  classId: string;
  meetingId?: string; // Terkait dengan pertemuan tertentu atau umum
  courseName: string;
  meetingNumber?: number;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorNimOrNidn: string;
  authorRole: UserRole;
  attachment?: DiscussionAttachment;
  isPinned: boolean; // Disematkan di atas
  isLocked: boolean; // Dikunci (tidak menerima balasan baru)
  status: 'AKTIF' | 'DIKUNCI' | 'DISEMBUNYIKAN';
  totalRepliesCount: number;
  viewsCount: number;
  tags: string[];
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForumParticipationEvent {
  id: string;
  classId: string;
  threadId: string;
  meetingId?: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  type: 'BUAT_TOPIK' | 'KIRIM_TANGGAPAN' | 'BALASAN_DISKUSI';
  timestamp: string;
}
