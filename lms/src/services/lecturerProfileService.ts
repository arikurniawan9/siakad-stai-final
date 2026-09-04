/**
 * Layanan Modul Profil Dosen Pengampu & Kartu NIDN Digital
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { 
  LecturerFullProfile, 
  UpdateLecturerProfilePayload 
} from '../types/lecturerProfile';
import { UserAuthProfile } from '../types/auth';

const STORAGE_KEY_LECTURER_PROFILE = 'salam_lecturer_full_profile';

const INITIAL_LECTURER_PROFILES: Record<string, LecturerFullProfile> = {
  'usr-dsn-01': {
    id: 'prf-dsn-01',
    userId: 'usr-dsn-01',
    nidn: '2112087501',
    nip: '197508122005011003',
    nik: '3203011208750001',
    name: 'Dr. H. M. Ridwan, M.Ag',
    titleWithDegree: 'Dr. H. M. Ridwan, M.Ag',
    arabicName: 'الدكتور الحاج محمد رضوان',
    email: 'm.ridwan@staialittihad.ac.id',
    personalEmail: 'm.ridwan.tarbiyah@gmail.com',
    phoneNumber: '0812-3456-7890',
    birthPlace: 'Cianjur',
    birthDate: '1975-08-12',
    gender: 'LAKI_LAKI',
    religion: 'Islam',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80',

    // Alamat
    streetAddress: 'Jl. Dr. Muwardi No. 28, Bypass',
    village: 'Muka',
    district: 'Cianjur',
    regency: 'Kabupaten Cianjur',
    province: 'Jawa Barat',
    postalCode: '43215',

    // Kepegawaian & Jabatan
    faculty: 'Tarbiyah & Keguruan Islam',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    academicPosition: 'Lektor Kepala (550)',
    rankAndGrade: 'Pembina / IV-a',
    employmentStatus: 'DOSEN_TETAP',
    serdosNumber: '2112087501-0982',
    isSerdos: true,
    sintaId: '6012488',
    googleScholarId: 'ridwan_staialittihad',

    // BKD & Pengajaran
    totalTeachingCredits: 12,
    mentoredStudentsCount: 24,
    thesisStudentsCount: 8,

    teachingCourses: [
      { code: 'PAI-301', name: 'Ushul Fiqih & Qawaid Fiqhiyyah', credits: 3, classes: ['Kelas A', 'Kelas B'], totalStudents: 72 },
      { code: 'PAI-405', name: 'Metodologi Penelitian Pendidikan Islam', credits: 3, classes: ['Kelas A'], totalStudents: 38 },
      { code: 'TAR-204', name: 'Sejarah Pemikiran Pendidikan Islam', credits: 2, classes: ['Kelas C'], totalStudents: 35 },
      { code: 'STAI-001', name: 'Studi Naskah Kitab Turats Fiqih', credits: 4, classes: ['Kelas Takhassus'], totalStudents: 22 }
    ],

    educationHistory: [
      { degree: 'S1', degreeName: 'Sarjana Pendidikan Islam (S.Pd.I)', institution: 'UIN Sunan Gunung Djati Bandung', graduationYear: '1998', major: 'Pendidikan Agama Islam' },
      { degree: 'S2', degreeName: 'Magister Agama (M.Ag)', institution: 'UIN Syarif Hidayatullah Jakarta', graduationYear: '2004', major: 'Pemikiran Hukum Islam & Fiqih' },
      { degree: 'S3', degreeName: 'Doktor Pendidikan Islam (Dr.)', institution: 'UIN Sunan Gunung Djati Bandung', graduationYear: '2018', major: 'Pendidikan Agama Islam' },
      { degree: 'PESANTREN', degreeName: 'Santri Mukim Takhassus Kitab', institution: 'Pondok Pesantren Al-Ittihad Cianjur', graduationYear: '1994', major: 'Kajian Fiqih & Ushul Mazhab Syafii' }
    ],

    publications: [
      { id: 'pub-01', title: 'Rekonstruksi Kaidah Lughawiyah dalam Istinbath Hukum Islam Kontemporer', type: 'JURNAL_NASIONAL', publisher: 'Jurnal Al-Tarbawi (SINTA 2)', year: '2025', sintaIndex: 'SINTA 2', doiLink: '10.24252/tarbawi.v10i2.2025' },
      { id: 'pub-02', title: 'Model Pembelajaran Fiqih Berbasis Kitab Turats pada Madrasah Aliyah di Jawa Barat', type: 'JURNAL_NASIONAL', publisher: 'Jurnal Pendidikan Islam STAI Al-Ittihad', year: '2024', sintaIndex: 'SINTA 3' },
      { id: 'pub-03', title: 'Buku Ajar: Pengantar Ushul Fiqih untuk Mahasiswa Tarbiyah & Ilmu Keguruan', type: 'BUKU', publisher: 'Al-Ittihad Press Cianjur (ISBN: 978-623-789-012-3)', year: '2023' }
    ],

    ktdVerificationCode: 'KTD-STAI-ITD-DSN-2112087501-AUTH',
    ktdValidUntil: '31 Agustus 2028'
  },
  'usr-kpr-01': {
    id: 'prf-kpr-01',
    userId: 'usr-kpr-01',
    nidn: '2114058202',
    nip: '198205142008012004',
    nik: '3203015405820003',
    name: 'Hj. Siti Maryam, M.Pd.I',
    titleWithDegree: 'Hj. Siti Maryam, M.Pd.I',
    arabicName: 'الحاجة ستي مريم',
    email: 'siti.maryam@staialittihad.ac.id',
    personalEmail: 'siti.maryam.pai@gmail.com',
    phoneNumber: '0813-8877-6655',
    birthPlace: 'Sukabumi',
    birthDate: '1982-05-14',
    gender: 'PEREMPUAN',
    religion: 'Islam',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80',

    // Alamat
    streetAddress: 'Komplek Griya Maleber Indah Blok C-12',
    village: 'Maleber',
    district: 'Karangtengah',
    regency: 'Kabupaten Cianjur',
    province: 'Jawa Barat',
    postalCode: '43281',

    // Kepegawaian & Jabatan
    faculty: 'Tarbiyah & Keguruan Islam',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    academicPosition: 'Lektor (300) / Ketua Program Studi PAI',
    rankAndGrade: 'Penata Tk. I / III-d',
    employmentStatus: 'DOSEN_TETAP',
    serdosNumber: '2114058202-0741',
    isSerdos: true,
    sintaId: '6018921',
    googleScholarId: 'siti_maryam_staialittihad',

    // BKD & Pengajaran
    totalTeachingCredits: 10,
    mentoredStudentsCount: 30,
    thesisStudentsCount: 12,

    teachingCourses: [
      { code: 'PAI-102', name: 'Ilmu Pendidikan Islam', credits: 3, classes: ['Kelas A', 'Kelas B'], totalStudents: 76 },
      { code: 'PAI-206', name: 'Desain Kurikulum & Perencanaan Pembelajaran PAI', credits: 3, classes: ['Kelas A'], totalStudents: 39 },
      { code: 'TAR-301', name: 'Evaluasi Pembelajaran Berbasis Karakter Santri', credits: 4, classes: ['Kelas C'], totalStudents: 34 }
    ],

    educationHistory: [
      { degree: 'S1', degreeName: 'Sarjana Pendidikan Islam (S.Pd.I)', institution: 'IAIN Sunan Gunung Djati Bandung', graduationYear: '2004', major: 'Pendidikan Agama Islam' },
      { degree: 'S2', degreeName: 'Magister Pendidikan Islam (M.Pd.I)', institution: 'UIN Sunan Gunung Djati Bandung', graduationYear: '2009', major: 'Manajemen Pendidikan Islam' }
    ],

    publications: [
      { id: 'pub-kpr-01', title: 'Implementasi Kurikulum Merdeka Belajar pada Program Studi PAI STAI Al-Ittihad', type: 'JURNAL_NASIONAL', publisher: 'Jurnal Tarbawi (SINTA 3)', year: '2024' },
      { id: 'pub-kpr-02', title: 'Model Supervisi Akademik Kepala Madrasah dalam Peningkatan Kompetensi Guru PAI', type: 'JURNAL_NASIONAL', publisher: 'Jurnal Manajemen Pendidikan Islam', year: '2023' }
    ],

    ktdVerificationCode: 'KTD-STAI-ITD-KPR-2114058202-AUTH',
    ktdValidUntil: '31 Agustus 2028'
  }
};

class LecturerProfileService {
  /**
   * Mengambil data profil lengkap dosen pengampu sesuai akun yang login
   */
  public getProfile(user: UserAuthProfile): LecturerFullProfile {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_LECTURER_PROFILE}_${user.id}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }

    // Cek apakah ada profil predefined untuk ID user
    if (INITIAL_LECTURER_PROFILES[user.id]) {
      return INITIAL_LECTURER_PROFILES[user.id];
    }

    // Default template jika user adalah dosen lain yang login
    const defaultProfile: LecturerFullProfile = {
      id: `prf-dsn-${user.id}`,
      userId: user.id,
      nidn: user.identityNumber || '2112087501',
      nik: '3203011208750001',
      name: user.name,
      titleWithDegree: user.name,
      arabicName: 'الأستاذ المحاضر',
      email: user.email,
      personalEmail: `${user.username}@gmail.com`,
      phoneNumber: '0812-9988-7766',
      birthPlace: 'Cianjur',
      birthDate: '1980-01-01',
      gender: 'LAKI_LAKI',
      religion: 'Islam',
      avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=250&auto=format&fit=crop&q=80',

      streetAddress: 'Jl. Raya Bandung Km. 03, Bojong',
      village: 'Bojong',
      district: 'Karangtengah',
      regency: 'Kabupaten Cianjur',
      province: 'Jawa Barat',
      postalCode: '43281',

      faculty: user.studyProgram?.includes('Fakultas') ? user.studyProgram : 'Tarbiyah & Keguruan Islam',
      studyProgram: user.studyProgram || 'Pendidikan Agama Islam (PAI)',
      academicPosition: 'Lektor (300)',
      rankAndGrade: 'Penata / III-c',
      employmentStatus: 'DOSEN_TETAP',
      isSerdos: true,
      serdosNumber: `${user.identityNumber}-SERDOS`,

      totalTeachingCredits: 12,
      mentoredStudentsCount: 20,
      thesisStudentsCount: 6,

      teachingCourses: [
        { code: 'PAI-301', name: 'Ushul Fiqih & Qawaid Fiqhiyyah', credits: 3, classes: ['Kelas A'], totalStudents: 36 }
      ],

      educationHistory: [
        { degree: 'S1', degreeName: 'Sarjana Pendidikan Islam (S.Pd.I)', institution: 'UIN Bandung', graduationYear: '2002', major: 'Pendidikan Agama Islam' },
        { degree: 'S2', degreeName: 'Magister Agama (M.Ag)', institution: 'UIN Jakarta', graduationYear: '2008', major: 'Studi Islam' }
      ],

      publications: [
        { id: 'pub-def-01', title: 'Metode Pembelajaran Kitab Kuning di Era Transformasi Digital', type: 'JURNAL_NASIONAL', publisher: 'Jurnal STAI Al-Ittihad', year: '2024' }
      ],

      ktdVerificationCode: `KTD-STAI-ITD-${user.identityNumber}-AUTH`,
      ktdValidUntil: '31 Agustus 2028'
    };

    return defaultProfile;
  }

  /**
   * Memperbarui informasi kontak & profil dosen pengampu
   */
  public updateProfile(user: UserAuthProfile, payload: UpdateLecturerProfilePayload): LecturerFullProfile {
    const current = this.getProfile(user);
    const updated: LecturerFullProfile = {
      ...current,
      personalEmail: payload.personalEmail !== undefined ? payload.personalEmail : current.personalEmail,
      phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber : current.phoneNumber,
      streetAddress: payload.streetAddress !== undefined ? payload.streetAddress : current.streetAddress,
      sintaId: payload.sintaId !== undefined ? payload.sintaId : current.sintaId,
      googleScholarId: payload.googleScholarId !== undefined ? payload.googleScholarId : current.googleScholarId
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_LECTURER_PROFILE}_${user.id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan profil dosen:', e);
    }

    return updated;
  }
}

export const lecturerProfileService = new LecturerProfileService();
