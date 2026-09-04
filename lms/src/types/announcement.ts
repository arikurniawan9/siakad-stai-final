/**
 * Tipe Data untuk Modul Pengumuman & Informasi Kampus
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export type AnnouncementCategory = 
  | 'AKADEMIK' 
  | 'PERKULIAHAN' 
  | 'KEMAHASISWAAN' 
  | 'KEISLAMAN' 
  | 'KEUANGAN' 
  | 'DARURAT_PENTING';

export type AnnouncementUrgency = 'PENTING' | 'MENENGAH' | 'NORMAL';

export type TargetAudience = 
  | 'SEMUA_MAHASISWA' 
  | 'MAHASISWA_PAI' 
  | 'MAHASISWA_MPI' 
  | 'MAHASISWA_HES' 
  | 'MAHASISWA_SEMESTER_AKHIR';

export interface AnnouncementAttachment {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  downloadUrl: string;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  slug: string;
  category: AnnouncementCategory;
  urgency: AnnouncementUrgency;
  isPinned: boolean;
  publishedAt: string;
  expiresAt?: string;
  publisherName: string;
  publisherRole: string;
  targetAudience: TargetAudience;
  summary: string;
  contentHtml: string;
  attachments?: AnnouncementAttachment[];
  actionLink?: {
    label: string;
    path: string;
  };
  tags: string[];
}

export interface StudentAnnouncementState {
  announcementId: string;
  isRead: boolean;
  readAt?: string;
  isBookmarked: boolean;
}
