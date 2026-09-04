/**
 * Tipe Data untuk Modul Profil Dosen Pengampu & Kartu NIDN Digital
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export interface LecturerEducation {
  degree: 'S1' | 'S2' | 'S3' | 'PESANTREN';
  degreeName: string;
  institution: string;
  graduationYear: string;
  major: string;
}

export interface LecturerPublication {
  id: string;
  title: string;
  type: 'JURNAL_NASIONAL' | 'JURNAL_INTERNASIONAL' | 'BUKU' | 'PROSIDING';
  publisher: string;
  year: string;
  sintaIndex?: string;
  doiLink?: string;
}

export interface LecturerTeachingCourse {
  code: string;
  name: string;
  credits: number;
  classes: string[];
  totalStudents: number;
}

export interface LecturerFullProfile {
  id: string;
  userId: string;
  nidn: string;
  nip?: string;
  nik: string;
  name: string;
  titleWithDegree: string;
  arabicName?: string;
  email: string;
  personalEmail?: string;
  phoneNumber: string;
  birthPlace: string;
  birthDate: string;
  gender: 'LAKI_LAKI' | 'PEREMPUAN';
  religion: string;
  avatarUrl: string;
  
  // Alamat & Tempat Tinggal
  streetAddress: string;
  village: string;
  district: string;
  regency: string;
  province: string;
  postalCode: string;

  // Kepegawaian & Jabatan Akademik
  faculty: string;
  studyProgram: string;
  academicPosition: string; // Misal: Lektor Kepala (550)
  rankAndGrade: string; // Misal: Pembina / IV-a
  employmentStatus: 'DOSEN_TETAP' | 'DOSEN_DPK' | 'DOSEN_TIDAK_TETAP';
  serdosNumber?: string; // Nomor Sertifikat Pendidik
  isSerdos: boolean;
  sintaId?: string;
  googleScholarId?: string;

  // Beban Kinerja Dosen (BKD)
  totalTeachingCredits: number;
  mentoredStudentsCount: number; // Mahasiswa Bimbingan PA
  thesisStudentsCount: number; // Mahasiswa Bimbingan Skripsi

  // Riwayat & Portofolio
  educationHistory: LecturerEducation[];
  publications: LecturerPublication[];
  teachingCourses: LecturerTeachingCourse[];

  // Kartu Digital
  ktdVerificationCode: string;
  ktdValidUntil: string;
}

export interface UpdateLecturerProfilePayload {
  personalEmail?: string;
  phoneNumber?: string;
  streetAddress?: string;
  sintaId?: string;
  googleScholarId?: string;
}
