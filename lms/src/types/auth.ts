import { UserRole } from './roles';

export type Permission = 
  // Materi & Pembelajaran
  | 'materials:view'
  | 'materials:manage'
  | 'materials:publish'
  // Video Interaktif
  | 'video:watch'
  | 'video:manage'
  // Kuis & Tugas
  | 'quizzes:attempt'
  | 'quizzes:manage'
  | 'assignments:submit'
  | 'assignments:grade'
  | 'assignments:manage'
  // Forum Diskusi
  | 'discussions:view'
  | 'discussions:post'
  | 'discussions:moderate'
  // Progres Belajar
  | 'progress:view_own'
  | 'progress:view_class'
  | 'progress:export'
  // Akademik & Nilai
  | 'academic:view_schedule'
  | 'academic:view_krs_khs'
  | 'academic:manage_schedule'
  | 'academic:view_periods'
  | 'academic:manage_periods'
  | 'academic:input_final_grades'
  // Sinkronisasi & Admin
  | 'sync:execute'
  | 'sync:view_logs'
  | 'users:manage'
  | 'roles:manage'
  | 'audit:view'
  | 'system:configure';

export interface UserSession {
  token: string;
  expiresAt: number; // Unix timestamp
  createdAt: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserAuthProfile | null;
  session: UserSession | null;
  isLoading: boolean;
}

export interface UserAuthProfile {
  id: string;
  username: string;
  name: string;
  identityNumber: string; // NIM atau NIDN/NIP
  email: string;
  role: UserRole;
  roleLabel: string;
  studyProgram?: string;
  permissions: Permission[];
  avatarUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  resource: string;
  details?: string;
  ipAddress: string;
  status: 'SUKSES' | 'GAGAL' | 'DITOLAK';
}
