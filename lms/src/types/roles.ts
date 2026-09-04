export type UserRole = 
  | 'mahasiswa' 
  | 'dosen' 
  | 'dosen_pa' 
  | 'kaprodi' 
  | 'admin_akademik' 
  | 'pimpinan' 
  | 'administrator_sistem';

export interface UserProfile {
  id: string;
  name: string;
  identityNumber: string; // NIM atau NIDN/NIP
  role: UserRole;
  roleLabel: string;
  studyProgram?: string; // Program Studi
  avatarUrl?: string;
}
