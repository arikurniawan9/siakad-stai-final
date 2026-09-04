import { UserRole } from './roles';

export type NotificationCategory = 
  | 'AKADEMIK' 
  | 'PERKULIAHAN' 
  | 'TUGAS' 
  | 'NILAI' 
  | 'DISKUSI' 
  | 'PENGUMUMAN'
  | 'KRS'
  | 'BIMBINGAN'
  | 'EWS'
  | 'SISTEM'
  | 'KEAMANAN';

export type NotificationPriority = 'TINGGI' | 'SEDANG' | 'RENDAH';

export interface InAppNotification {
  id: string;
  userId?: string;              // Target specific user
  targetRoles?: UserRole[];     // Target broad roles (e.g. ['dosen', 'dosen_pa'])
  title: string;
  message: string;
  category: NotificationCategory;
  priority?: NotificationPriority;
  isRead: boolean;
  deepLinkPath: string;
  actionLabel?: string;
  senderName?: string;
  senderRole?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface NotificationFilter {
  category?: NotificationCategory | 'SEMUA';
  unreadOnly?: boolean;
  priority?: NotificationPriority;
  search?: string;
}
