/**
 * Layanan Modul Profil Mahasiswa & KTM Digital
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { 
  StudentFullProfile, 
  UpdateProfilePayload 
} from '../types/studentProfile';

const STORAGE_KEY_PROFILE = 'salam_student_full_profile';

const INITIAL_PROFILE: StudentFullProfile = {
  id: 'prf-mhs-01',
  userId: 'usr-mhs-01',
  nim: '21.01.0042',
  name: 'Ahmad Fauzi Rahman',
  arabicName: 'أحمد فوزي رحمن',
  nik: '3203011405030002',
  email: 'ahmad.fauzi@staialittihad.ac.id',
  personalEmail: 'ahmad.fauzi2003@gmail.com',
  phoneNumber: '0812-9876-5432',
  birthPlace: 'Cianjur',
  birthDate: '2003-05-14',
  gender: 'LAKI_LAKI',
  bloodType: 'O',
  religion: 'Islam',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80',
  
  // Alamat & Tempat Tinggal
  streetAddress: 'Jl. Raya Bandung Km. 03, Kp. Rawabango',
  rtRw: 'RT 003 / RW 007',
  village: 'Bojong',
  district: 'Karangtengah',
  regency: 'Kabupaten Cianjur',
  province: 'Jawa Barat',
  postalCode: '43281',
  residenceType: 'ASRAMA_PESANTREN',
  dormitoryName: "Ma'had Ali Al-Ittihad Asrama Ibnu Sina Kamar B-04",

  // Data Akademik
  studyProgram: 'Pendidikan Agama Islam (PAI)',
  studyProgramCode: '86208',
  faculty: 'Tarbiyah & Keguruan',
  degree: 'Strata 1 (S1)',
  entryYear: '2021/2022',
  currentSemester: 5,
  academicStatus: 'AKTIF',
  academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
  academicAdvisorNidn: '2112087501',
  previousSchool: 'Madrasah Aliyah Negeri (MAN) 1 Cianjur',
  pesantrenOrigin: "Pondok Pesantren Al-Ittihad Cianjur (Takhassus Kitab & Tahfidz)",

  // Metrik Prestasi
  cumulativeGpa: 3.91,
  totalCreditsEarned: 100,
  maxCreditsNextSemester: 24,

  // Kontak Darurat
  emergencyContact: {
    name: 'H. Rahman Hidayat (Ayah Kandung)',
    relationship: 'AYAH',
    phone: '0813-2211-4455',
    address: 'Jl. Ir. H. Juanda No. 45, Salakopi, Cianjur'
  },

  // Capaian Keislaman & Tahfidz
  islamicAchievements: [
    {
      id: 'ach-01',
      title: "Tahfidz Al-Qur'an 5 Juz Mutqin (Juz 1, 2, 3, 29, 30)",
      category: 'TAHFIDZ',
      detail: "Lulus Ujian Tasmi' Bil Ghaib dengan predikat Jayyid Jiddan di hadapan Dewan Penguji Ma'had.",
      completedJuz: 5,
      examinerName: 'Ust. M. Fauzan, S.Q., M.Ag',
      dateEarned: '2025-11-20',
      certificateNumber: 'SK-TAH/STAI-ITD/2025/1102'
    },
    {
      id: 'ach-02',
      title: "Khatam Qira'at Matan Fathul Qarib al-Mujib fi Syarh Alfazh at-Taqrib",
      category: 'KITAB_KUNING',
      detail: "Menyelesaikan kajian fiqih mazhab Syafi'i kitab Fathul Qarib bersama mudir ma'had.",
      examinerName: 'KH. Ahmad Syahid, M.Ag',
      dateEarned: '2025-06-15',
      certificateNumber: 'SANAD-FQ/ALITTIHAD/2025/089'
    },
    {
      id: 'ach-03',
      title: 'Juara 1 Musabaqah Qira\'atil Kutub (MQK) Tingkat Mahasiswa Kopertais Wilayah II',
      category: 'ORGANISASI',
      detail: 'Mewakili STAI Al-Ittihad dalam cabang kajian kitab ushul fiqih Ghayah al-Wushul.',
      examinerName: 'Dewan Juri Kopertais Wilayah II Jawa Barat',
      dateEarned: '2025-09-10',
      certificateNumber: 'PIAGAM-MQK/KOP2/IX/2025'
    }
  ],

  // KTM Digital
  ktmVerificationCode: 'KTM-STAI-ITD-2021-21010042-AUTH',
  ktmValidUntil: '31 Agustus 2027'
};

class StudentProfileService {
  /**
   * Mengambil data profil lengkap mahasiswa
   */
  public getProfile(userId: string = 'usr-mhs-01'): StudentFullProfile {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PROFILE}_${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return INITIAL_PROFILE;
  }

  /**
   * Memperbarui informasi kontak & domisili profil mahasiswa
   */
  public updateProfile(userId: string, payload: UpdateProfilePayload): StudentFullProfile {
    const current = this.getProfile(userId);
    const updated: StudentFullProfile = {
      ...current,
      personalEmail: payload.personalEmail !== undefined ? payload.personalEmail : current.personalEmail,
      phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber : current.phoneNumber,
      streetAddress: payload.streetAddress !== undefined ? payload.streetAddress : current.streetAddress,
      residenceType: payload.residenceType !== undefined ? payload.residenceType : current.residenceType,
      dormitoryName: payload.dormitoryName !== undefined ? payload.dormitoryName : current.dormitoryName,
      emergencyContact: payload.emergencyContact !== undefined ? payload.emergencyContact : current.emergencyContact
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_PROFILE}_${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan profil mahasiswa:', e);
    }

    return updated;
  }

  /**
   * Mengambil capaian keislaman & tahfidz
   */
  public getAchievements(userId: string = 'usr-mhs-01') {
    const profile = this.getProfile(userId);
    return profile.islamicAchievements;
  }
}

export const studentProfileService = new StudentProfileService();
