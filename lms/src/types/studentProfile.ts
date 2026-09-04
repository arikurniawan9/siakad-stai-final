/**
 * Tipe Data untuk Modul Profil Mahasiswa & KTM Digital
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export interface StudentEmergencyContact {
  name: string;
  relationship: 'AYAH' | 'IBU' | 'WALI' | 'SAUDARA_KANDUNG';
  phone: string;
  address: string;
}

export interface IslamicAchievement {
  id: string;
  title: string;
  category: 'TAHFIDZ' | 'KITAB_KUNING' | 'KARYA_TULIS' | 'ORGANISASI';
  detail: string;
  completedJuz?: number;
  examinerName: string;
  dateEarned: string;
  certificateNumber: string;
}

export interface StudentFullProfile {
  id: string;
  userId: string;
  nim: string;
  name: string;
  arabicName?: string;
  nik: string;
  email: string;
  personalEmail?: string;
  phoneNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  bloodType: 'A' | 'B' | 'AB' | 'O' | 'TIDAK_DIKETAHUI';
  religion: string;
  avatarUrl: string;
  
  // Alamat & Tempat Tinggal
  streetAddress: string;
  rtRw: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;
  residenceType: 'ASRAMA_PESANTREN' | 'RUMAH_ORANG_TUA' | 'KOS_MANDIRI';
  dormitoryName?: string;

  // Data Akademik
  studyProgram: string;
  studyProgramCode: string;
  faculty: string;
  degree: string;
  entryYear: string;
  currentSemester: number;
  academicStatus: 'AKTIF' | 'CUTI' | 'LULUS' | 'NON_AKTIF';
  academicAdvisorName: string;
  academicAdvisorNidn: string;
  previousSchool: string;
  pesantrenOrigin?: string;

  // Metrik Prestasi
  cumulativeGpa: number;
  totalCreditsEarned: number;
  maxCreditsNextSemester: number;

  // Kontak Darurat & Capaian
  emergencyContact: StudentEmergencyContact;
  islamicAchievements: IslamicAchievement[];

  // KTM Digital
  ktmVerificationCode: string;
  ktmValidUntil: string;
}

export interface UpdateProfilePayload {
  personalEmail?: string;
  phoneNumber?: string;
  streetAddress?: string;
  residenceType?: 'ASRAMA_PESANTREN' | 'RUMAH_ORANG_TUA' | 'KOS_MANDIRI';
  dormitoryName?: string;
  emergencyContact?: StudentEmergencyContact;
}
