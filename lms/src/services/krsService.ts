import { 
  StudentKrsData, 
  KrsCourseItem, 
  KrsHistoryItem, 
  KrsConsultationMessage,
  AdviseeKrsOverview,
  KrsAdvisorStats
} from '../types/krs';

// Data Induk Seluruh Mata Kuliah yang Ditawarkan pada Semester Aktif (Ganjil 2026/2027)
export const MASTER_COURSE_CATALOG: KrsCourseItem[] = [
  {
    id: 'krs-c-01',
    classId: 'cls-pai301-a',
    courseId: 'crs-pai301',
    courseCode: 'PAI-301',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Senin',
    startTime: '08:00',
    endTime: '10:30',
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    courseType: 'WAJIB_PRODI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 38
  },
  {
    id: 'krs-c-02',
    classId: 'cls-pai204-a',
    courseId: 'crs-pai204',
    courseCode: 'PAI-204',
    courseName: "Ulumul Qur'an & Studi Tafsir Tematik",
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Selasa',
    startTime: '08:00',
    endTime: '10:30',
    roomId: 'rm-a203',
    roomName: 'Ruang Asy-Syafii (Tarbiyah 203)',
    roomCode: 'A-203',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-02',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    courseType: 'WAJIB_PRODI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 36
  },
  {
    id: 'krs-c-03',
    classId: 'cls-pai205-a',
    courseId: 'crs-pai205',
    courseCode: 'PAI-205',
    courseName: 'Ulumul Hadits & Studi Sanad Matan',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Rabu',
    startTime: '10:45',
    endTime: '13:15',
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-03',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    courseType: 'WAJIB_PRODI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 35
  },
  {
    id: 'krs-c-04',
    classId: 'cls-pai302-a',
    courseId: 'crs-pai302',
    courseCode: 'PAI-302',
    courseName: 'Pengembangan Kurikulum PAI Berbasis Karakter',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Kamis',
    startTime: '08:00',
    endTime: '10:30',
    roomId: 'rm-b102',
    roomName: 'Smart Classroom Ibnu Sina',
    roomCode: 'B-102',
    building: 'Gedung B',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    courseType: 'WAJIB_PRODI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 38
  },
  {
    id: 'krs-c-05',
    classId: 'cls-pai305-a',
    courseId: 'crs-pai305',
    courseCode: 'PAI-305',
    courseName: 'Metode Penelitian Pendidikan Agama Islam',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Kamis',
    startTime: '13:00',
    endTime: '15:30',
    roomId: 'rm-a202',
    roomName: 'Ruang Ibnu Khaldun (Tarbiyah 202)',
    roomCode: 'A-202',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-03',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    courseType: 'WAJIB_PRODI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 34
  },
  {
    id: 'krs-c-06',
    classId: 'cls-ins101-a',
    courseId: 'crs-ins101',
    courseCode: 'INS-101',
    courseName: 'Bahasa Arab Akademik & Turats',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Jumat',
    startTime: '07:30',
    endTime: '10:00',
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-04',
    lecturerName: 'Ust. Muhammad Ilyas, M.Hum',
    lecturerNidn: '2120018603',
    courseType: 'WAJIB_INSTITUSI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 40
  },
  {
    id: 'krs-c-07',
    classId: 'cls-ins102-a',
    courseId: 'crs-ins102',
    courseCode: 'INS-102',
    courseName: 'Bahasa Inggris Akademik & Islamic Studies',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Jumat',
    startTime: '13:30',
    endTime: '16:00',
    roomId: 'rm-b204',
    roomName: 'Laboratorium Bahasa & Multimedia',
    roomCode: 'B-204',
    building: 'Gedung B',
    lecturerId: 'usr-dsn-02',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    courseType: 'WAJIB_INSTITUSI',
    isSelected: true,
    isLocked: false,
    prerequisiteMet: true,
    quota: 40,
    enrolledCount: 39
  },
  {
    id: 'krs-opt-01',
    classId: 'cls-pai308-a',
    courseId: 'crs-pai308',
    courseCode: 'PAI-308',
    courseName: 'Evaluasi & Asesmen Pembelajaran PAI',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Rabu',
    startTime: '08:00',
    endTime: '10:30',
    roomId: 'rm-a202',
    roomName: 'Ruang Ibnu Khaldun',
    roomCode: 'A-202',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-02',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    courseType: 'PILIHAN',
    isSelected: false,
    isLocked: false,
    prerequisiteMet: true,
    quota: 35,
    enrolledCount: 22
  },
  {
    id: 'krs-opt-02',
    classId: 'cls-pai310-a',
    courseId: 'crs-pai310',
    courseCode: 'PAI-310',
    courseName: 'Fiqih Ibadah & Muamalah Praktis',
    credits: 2,
    className: 'Kelas A',
    dayOfWeek: 'Selasa',
    startTime: '13:30',
    endTime: '15:10',
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali',
    roomCode: 'A-201',
    building: 'Gedung A',
    lecturerId: 'usr-dsn-04',
    lecturerName: 'Ust. Muhammad Ilyas, M.Hum',
    lecturerNidn: '2120018603',
    courseType: 'PILIHAN',
    isSelected: false,
    isLocked: false,
    prerequisiteMet: true,
    quota: 35,
    enrolledCount: 18
  },
  {
    id: 'krs-opt-03',
    classId: 'cls-pai312-a',
    courseId: 'crs-pai312',
    courseCode: 'PAI-312',
    courseName: 'Kewirausahaan Berbasis Pesantren (Santripreneur)',
    credits: 2,
    className: 'Kelas A',
    dayOfWeek: 'Senin',
    startTime: '13:00',
    endTime: '14:40',
    roomId: 'rm-b102',
    roomName: 'Smart Classroom Ibnu Sina',
    roomCode: 'B-102',
    building: 'Gedung B',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    courseType: 'PILIHAN',
    isSelected: false,
    isLocked: false,
    prerequisiteMet: true,
    quota: 30,
    enrolledCount: 15
  },
  {
    id: 'krs-opt-04',
    classId: 'cls-pai315-a',
    courseId: 'crs-pai315',
    courseCode: 'PAI-315',
    courseName: 'Microteaching & Praktik Mengajar Terbimbing',
    credits: 3,
    className: 'Kelas A',
    dayOfWeek: 'Senin',
    startTime: '08:00',
    endTime: '10:30', // Sengaja bentrok jam dengan PAI-301 untuk pengujian conflict detection!
    roomId: 'rm-b101',
    roomName: 'Laboratorium Microteaching',
    roomCode: 'B-101',
    building: 'Gedung B',
    lecturerId: 'usr-dsn-03',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    courseType: 'PILIHAN',
    isSelected: false,
    isLocked: false,
    prerequisiteMet: false,
    prerequisiteInfo: 'Memerlukan kelulusan minimal Nilai B pada mata kuliah Perencanaan Pembelajaran PAI',
    quota: 25,
    enrolledCount: 10
  }
];

export const INITIAL_KRS_HISTORY: KrsHistoryItem[] = [
  {
    id: 'krs-hist-01',
    semesterNumber: 1,
    academicPeriodName: 'Semester Ganjil 2024/2025',
    academicYear: '2024/2025',
    totalCredits: 20,
    semesterGpa: 3.70,
    cumulativeGpa: 3.70,
    courseCount: 7,
    krsStatus: 'DISETUJUI',
    approvedDate: '2024-08-25',
    advisorName: 'Dr. H. M. Ridwan, M.Ag'
  },
  {
    id: 'krs-hist-02',
    semesterNumber: 2,
    academicPeriodName: 'Semester Genap 2024/2025',
    academicYear: '2024/2025',
    totalCredits: 21,
    semesterGpa: 3.75,
    cumulativeGpa: 3.73,
    courseCount: 7,
    krsStatus: 'DISETUJUI',
    approvedDate: '2025-02-12',
    advisorName: 'Dr. H. M. Ridwan, M.Ag'
  },
  {
    id: 'krs-hist-03',
    semesterNumber: 3,
    academicPeriodName: 'Semester Ganjil 2025/2026',
    academicYear: '2025/2026',
    totalCredits: 22,
    semesterGpa: 3.80,
    cumulativeGpa: 3.75,
    courseCount: 8,
    krsStatus: 'DISETUJUI',
    approvedDate: '2025-08-20',
    advisorName: 'Dr. H. M. Ridwan, M.Ag'
  },
  {
    id: 'krs-hist-04',
    semesterNumber: 4,
    academicPeriodName: 'Semester Genap 2025/2026',
    academicYear: '2025/2026',
    totalCredits: 22,
    semesterGpa: 3.85,
    cumulativeGpa: 3.78,
    courseCount: 8,
    krsStatus: 'DISETUJUI',
    approvedDate: '2026-02-10',
    advisorName: 'Dr. H. M. Ridwan, M.Ag'
  }
];

export const INITIAL_CONSULTATION_MESSAGES: Record<string, KrsConsultationMessage[]> = {
  'usr-mhs-01': [
    {
      id: 'msg-01',
      senderId: 'usr-mhs-01',
      senderName: 'Ahmad Fauzi Rahman',
      senderRole: 'MAHASISWA',
      message: 'Assalamu’alaikum Warahmatullahi Wabarakatuh. Mohon izin Bapak Dr. H. M. Ridwan, M.Ag selaku Dosen Pembimbing Akademik, saya telah mengisi rencana studi semester 5 dengan total 21 SKS (7 Mata Kuliah wajib prodi & institusi). Mohon arahan dan persetujuannya. Terima kasih.',
      timestamp: '2026-08-20T09:15:00+07:00',
      isRead: true
    },
    {
      id: 'msg-02',
      senderId: 'usr-dsn-01',
      senderName: 'Dr. H. M. Ridwan, M.Ag',
      senderRole: 'DOSEN_PA',
      message: 'Wa’alaikumsalam Warahmatullahi Wabarakatuh. Rencana studi Semester 5 Anda telah saya periksa. Seluruh mata kuliah telah memenuhi prasyarat kurikulum PAI dan distribusi jadwal tidak ada yang bentrok. KRS resmi telah siap disetujui.',
      timestamp: '2026-08-21T10:30:00+07:00',
      isRead: true
    }
  ],
  'usr-mhs-04': [
    {
      id: 'msg-04-1',
      senderId: 'usr-dsn-01',
      senderName: 'Dr. H. M. Ridwan, M.Ag',
      senderRole: 'DOSEN_PA',
      message: 'Assalamu’alaikum Fatimah. KRS Anda perlu disesuaikan. Berdasarkan IPS Semester lalu (2.80), batas beban SKS maksimal Anda adalah 21 SKS. Harap batalkan 1 mata kuliah pilihan agar sesuai ketentuan akademik.',
      timestamp: '2026-08-20T14:00:00+07:00',
      isRead: false
    }
  ]
};

// Data Inisial Mahasiswa Bimbingan
export const INITIAL_STUDENTS_KRS: Record<string, StudentKrsData> = {
  'usr-mhs-01': {
    id: 'krs-20261-21010042',
    studentId: 'usr-mhs-01',
    studentName: 'Ahmad Fauzi Rahman',
    studentNim: '21.01.0042',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 5,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 3.85,
    cumulativeGpa: 3.78,
    maxCreditQuota: 24, // IPS 3.85 -> kuota max 24 SKS
    totalCreditsTaken: 21,
    totalCumulativeCreditsEarned: 85,
    krsStatus: 'MENUNGGU_PERSETUJUAN',
    submissionDate: '2026-08-20T09:15:00+07:00',
    approvedDate: undefined,
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: '',
    courses: MASTER_COURSE_CATALOG.slice(0, 7) // 7 MK = 21 SKS
  },
  'usr-mhs-02': {
    id: 'krs-20261-21010055',
    studentId: 'usr-mhs-02',
    studentName: 'Siti Nurhaliza',
    studentNim: '21.01.0055',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 5,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 3.92,
    cumulativeGpa: 3.88,
    maxCreditQuota: 24,
    totalCreditsTaken: 24,
    totalCumulativeCreditsEarned: 88,
    krsStatus: 'DISETUJUI',
    submissionDate: '2026-08-19T11:00:00+07:00',
    approvedDate: '2026-08-20T08:30:00+07:00',
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: 'KRS disetujui penuh dengan 24 SKS. Pertahankan prestasi akademik.',
    courses: [...MASTER_COURSE_CATALOG.slice(0, 7), MASTER_COURSE_CATALOG[7]] // 21 + 3 = 24 SKS
  },
  'usr-mhs-03': {
    id: 'krs-20261-22010019',
    studentId: 'usr-mhs-03',
    studentName: 'Muhammad Rizky Pratama',
    studentNim: '22.01.0019',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 3,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 3.45,
    cumulativeGpa: 3.50,
    maxCreditQuota: 24,
    totalCreditsTaken: 18,
    totalCumulativeCreditsEarned: 42,
    krsStatus: 'DRAF',
    submissionDate: undefined,
    approvedDate: undefined,
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: '',
    courses: MASTER_COURSE_CATALOG.slice(0, 6) // 18 SKS
  },
  'usr-mhs-04': {
    id: 'krs-20261-22010034',
    studentId: 'usr-mhs-04',
    studentName: 'Fatimah Az-Zahra',
    studentNim: '22.01.0034',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 3,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 2.80,
    cumulativeGpa: 2.95,
    maxCreditQuota: 21,
    totalCreditsTaken: 23,
    totalCumulativeCreditsEarned: 40,
    krsStatus: 'DITOLAK_REVISI',
    submissionDate: '2026-08-19T15:20:00+07:00',
    approvedDate: undefined,
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: 'Beban SKS melebihi batas kuota IPS 2.80 (Maks 21 SKS). Harap batalkan 1 mata kuliah pilihan.',
    courses: [...MASTER_COURSE_CATALOG.slice(0, 7), MASTER_COURSE_CATALOG[8]] // 21 + 2 = 23 SKS (Melebihi kuota 21)
  },
  'usr-mhs-05': {
    id: 'krs-20261-23010011',
    studentId: 'usr-mhs-05',
    studentName: 'Zulkifli Harahap',
    studentNim: '23.01.0011',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 1,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 0,
    cumulativeGpa: 0,
    maxCreditQuota: 20,
    totalCreditsTaken: 20,
    totalCumulativeCreditsEarned: 0,
    krsStatus: 'DISETUJUI',
    submissionDate: '2026-08-18T10:00:00+07:00',
    approvedDate: '2026-08-18T14:30:00+07:00',
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: 'Paket Semester 1 disetujui otomatis sesuai kurikulum.',
    courses: MASTER_COURSE_CATALOG.slice(0, 6)
  },
  'usr-mhs-06': {
    id: 'krs-20261-21010089',
    studentId: 'usr-mhs-06',
    studentName: 'Nurul Hidayah',
    studentNim: '21.01.0089',
    studyProgram: 'Pendidikan Agama Islam (PAI)',
    studyProgramCode: 'PAI',
    academicDegree: 'Strata Satu (S-1)',
    semesterNumber: 5,
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    academicYear: '2026/2027',
    previousSemesterGpa: 3.65,
    cumulativeGpa: 3.60,
    maxCreditQuota: 24,
    totalCreditsTaken: 21,
    totalCumulativeCreditsEarned: 84,
    krsStatus: 'MENUNGGU_PERSETUJUAN',
    submissionDate: '2026-08-20T14:30:00+07:00',
    approvedDate: undefined,
    academicAdvisorId: 'usr-dsn-01',
    academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
    academicAdvisorNidn: '2112087501',
    academicAdvisorNotes: '',
    courses: MASTER_COURSE_CATALOG.slice(0, 7)
  }
};

/**
 * Helper mengonversi string jam ("08:00") ke menit total dari 00:00
 */
function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Memeriksa apakah dua interval waktu tumpang tindih
 */
function isTimeOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const sA = timeToMinutes(startA);
  const eA = timeToMinutes(endA);
  const sB = timeToMinutes(startB);
  const eB = timeToMinutes(endB);
  return Math.max(sA, sB) < Math.min(eA, eB);
}

/**
 * Service Utama Modul KRS Mahasiswa dan Verifikasi Dosen PA
 */
export class KrsService {
  private studentsStorageKey = 'salam_krs_students_v1';
  private catalogStorageKey = 'salam_krs_catalog_v1';
  private messagesStorageKey = 'salam_krs_consultations_v1';

  /**
   * Helper internal mengambil data mahasiswa dari LocalStorage atau default
   */
  private getStoredStudents(): Record<string, StudentKrsData> {
    try {
      const raw = localStorage.getItem(this.studentsStorageKey);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    // Set initial
    this.saveStoredStudents(INITIAL_STUDENTS_KRS);
    return INITIAL_STUDENTS_KRS;
  }

  /**
   * Helper internal menyimpan data mahasiswa
   */
  private saveStoredStudents(data: Record<string, StudentKrsData>): void {
    try {
      localStorage.setItem(this.studentsStorageKey, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  /**
   * Menghitung batas kuota SKS berdasarkan nilai IPS semester sebelumnya
   * Sesuai regulasi Standar Nasional Pendidikan Tinggi (SN-Dikti)
   */
  calculateMaxCreditQuota(ips: number): number {
    if (ips >= 3.00) return 24;
    if (ips >= 2.50) return 21;
    if (ips >= 2.00) return 18;
    return 15;
  }

  /**
   * Mendeteksi bentrok jadwal antar mata kuliah dalam daftar
   */
  detectScheduleConflicts(courses: KrsCourseItem[]): KrsCourseItem[] {
    const checked: KrsCourseItem[] = courses.map(c => ({ ...c, scheduleConflictWith: undefined }));

    for (let i = 0; i < checked.length; i++) {
      for (let j = i + 1; j < checked.length; j++) {
        const a = checked[i];
        const b = checked[j];

        if (a.dayOfWeek === b.dayOfWeek) {
          if (isTimeOverlap(a.startTime, a.endTime, b.startTime, b.endTime)) {
            a.scheduleConflictWith = `${b.courseName} (${b.dayOfWeek} ${b.startTime}-${b.endTime})`;
            b.scheduleConflictWith = `${a.courseName} (${a.dayOfWeek} ${a.startTime}-${a.endTime})`;
          }
        }
      }
    }

    return checked;
  }

  /**
   * Mengambil data lengkap KRS mahasiswa semester aktif
   */
  getStudentKrs(studentId = 'usr-mhs-01'): StudentKrsData {
    const students = this.getStoredStudents();
    let data = students[studentId];

    if (!data) {
      // Buat data default jika baru
      data = {
        id: `krs-20261-${studentId}`,
        studentId,
        studentName: 'Mahasiswa STAI Al-Ittihad',
        studentNim: '21.01.0099',
        studyProgram: 'Pendidikan Agama Islam (PAI)',
        studyProgramCode: 'PAI',
        academicDegree: 'Strata Satu (S-1)',
        semesterNumber: 5,
        academicPeriodId: 'prd-20261',
        academicPeriodName: 'Semester Ganjil 2026/2027',
        academicYear: '2026/2027',
        previousSemesterGpa: 3.50,
        cumulativeGpa: 3.50,
        maxCreditQuota: 24,
        totalCreditsTaken: 21,
        totalCumulativeCreditsEarned: 80,
        krsStatus: 'DRAF',
        academicAdvisorId: 'usr-dsn-01',
        academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
        academicAdvisorNidn: '2112087501',
        courses: MASTER_COURSE_CATALOG.slice(0, 7)
      };
      students[studentId] = data;
      this.saveStoredStudents(students);
    }

    // Pastikan deteksi jadwal bentrok di-refresh
    data.courses = this.detectScheduleConflicts(data.courses);
    data.totalCreditsTaken = data.courses.reduce((sum, c) => sum + c.credits, 0);

    return data;
  }

  /**
   * Mengambil katalog seluruh mata kuliah yang ditawarkan
   */
  getCatalogCourses(studentId = 'usr-mhs-01'): KrsCourseItem[] {
    const studentKrs = this.getStudentKrs(studentId);
    const selectedIds = new Set(studentKrs.courses.map(c => c.courseId));

    return MASTER_COURSE_CATALOG.map(c => {
      const isSelected = selectedIds.has(c.courseId);
      return {
        ...c,
        isSelected,
        isLocked: isSelected && studentKrs.krsStatus === 'DISETUJUI'
      };
    });
  }

  /**
   * Menambahkan mata kuliah dari katalog ke rencana studi mahasiswa
   */
  addCourseToKrs(studentId: string, courseId: string): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId] || this.getStudentKrs(studentId);

    if (student.krsStatus === 'DISETUJUI') {
      return {
        success: false,
        message: 'KRS sudah disahkan dan terkunci. Hubungi Dosen PA jika memerlukan pembukaan kunci revisi.'
      };
    }

    const courseToAdd = MASTER_COURSE_CATALOG.find(c => c.courseId === courseId || c.id === courseId);
    if (!courseToAdd) {
      return { success: false, message: 'Mata kuliah tidak ditemukan dalam katalog kurikulum aktif.' };
    }

    const alreadyExists = student.courses.some(c => c.courseId === courseToAdd.courseId);
    if (alreadyExists) {
      return { success: false, message: 'Mata kuliah sudah terdaftar di KRS Anda.' };
    }

    // Hitung proyeksi total SKS
    const currentCredits = student.courses.reduce((sum, c) => sum + c.credits, 0);
    const newTotal = currentCredits + courseToAdd.credits;

    if (newTotal > student.maxCreditQuota) {
      return {
        success: false,
        message: `Total SKS (${newTotal} SKS) melebihi batas kuota maksimal Anda (${student.maxCreditQuota} SKS berdasarkan IPS ${student.previousSemesterGpa.toFixed(2)}).`
      };
    }

    const updatedCourses = [...student.courses, { ...courseToAdd, isSelected: true, isLocked: false }];
    student.courses = this.detectScheduleConflicts(updatedCourses);
    student.totalCreditsTaken = newTotal;
    
    // Jika sebelumnya ditolak revisi, kembalikan ke DRAF saat diubah
    if (student.krsStatus === 'DITOLAK_REVISI') {
      student.krsStatus = 'DRAF';
    }

    students[studentId] = student;
    this.saveStoredStudents(students);

    return {
      success: true,
      message: `Mata kuliah ${courseToAdd.courseName} (${courseToAdd.credits} SKS) berhasil ditambahkan ke KRS.`,
      krs: student
    };
  }

  /**
   * Menghapus mata kuliah dari rencana studi mahasiswa
   */
  removeCourseFromKrs(studentId: string, courseId: string): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId] || this.getStudentKrs(studentId);

    if (student.krsStatus === 'DISETUJUI') {
      return {
        success: false,
        message: 'KRS sudah disahkan dan terkunci. Tidak dapat membatalkan mata kuliah tanpa persetujuan Dosen PA.'
      };
    }

    const removedCourse = student.courses.find(c => c.courseId === courseId || c.id === courseId);
    if (!removedCourse) {
      return { success: false, message: 'Mata kuliah tidak ditemukan dalam daftar KRS Anda.' };
    }

    const remaining = student.courses.filter(c => c.courseId !== courseId && c.id !== courseId);
    student.courses = this.detectScheduleConflicts(remaining);
    student.totalCreditsTaken = remaining.reduce((sum, c) => sum + c.credits, 0);

    if (student.krsStatus === 'DITOLAK_REVISI') {
      student.krsStatus = 'DRAF';
    }

    students[studentId] = student;
    this.saveStoredStudents(students);

    return {
      success: true,
      message: `Mata kuliah ${removedCourse.courseName} berhasil dibatalkan dari KRS.`,
      krs: student
    };
  }

  /**
   * Mengajukan rencana studi (KRS) ke Dosen Pembimbing Akademik
   */
  submitKrsForApproval(studentId: string): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId] || this.getStudentKrs(studentId);

    if (student.courses.length === 0) {
      return { success: false, message: 'KRS tidak dapat diajukan karena belum ada mata kuliah yang dipilih.' };
    }

    const totalCredits = student.courses.reduce((sum, c) => sum + c.credits, 0);
    if (totalCredits > student.maxCreditQuota) {
      return {
        success: false,
        message: `Total SKS (${totalCredits} SKS) melampaui batas kuota maksimal (${student.maxCreditQuota} SKS). Harap sesuaikan beban studi Anda.`
      };
    }

    // Deteksi apakah ada jadwal bentrok
    student.courses = this.detectScheduleConflicts(student.courses);
    const hasConflict = student.courses.some(c => !!c.scheduleConflictWith);
    if (hasConflict) {
      return {
        success: false,
        message: 'Terdapat bentrok jadwal antar mata kuliah pilihan. Silakan atur kembali jadwal sebelum mengajukan ke Dosen PA.'
      };
    }

    student.krsStatus = 'MENUNGGU_PERSETUJUAN';
    student.submissionDate = new Date().toISOString();
    student.totalCreditsTaken = totalCredits;

    students[studentId] = student;
    this.saveStoredStudents(students);

    // Otomatis kirim pesan notifikasi konsultasi
    this.sendConsultationMessage(
      studentId,
      student.studentId,
      student.studentName,
      'MAHASISWA',
      `Assalamu’alaikum. Saya telah mengajukan pengesahan Kartu Rencana Studi (KRS) Semester ${student.semesterNumber} dengan total ${totalCredits} SKS (${student.courses.length} Mata Kuliah). Mohon verifikasi dan persetujuannya, Bapak/Ibu Dosen Pembimbing Akademik.`
    );

    return {
      success: true,
      message: 'KRS berhasil diajukan ke Dosen Pembimbing Akademik untuk verifikasi dan pengesahan.',
      krs: student
    };
  }

  /**
   * Membatalkan pengajuan KRS (Kembali ke status DRAF)
   */
  cancelKrsSubmission(studentId: string): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId] || this.getStudentKrs(studentId);

    if (student.krsStatus === 'DISETUJUI') {
      return {
        success: false,
        message: 'KRS sudah disahkan oleh Dosen PA. Pengajuan tidak dapat dibatalkan mandiri.'
      };
    }

    student.krsStatus = 'DRAF';
    student.submissionDate = undefined;

    students[studentId] = student;
    this.saveStoredStudents(students);

    return {
      success: true,
      message: 'Pengajuan KRS dibatalkan. Status dikembalikan ke DRAF untuk pengeditan.',
      krs: student
    };
  }

  /**
   * Mengambil daftar ringkasan seluruh mahasiswa bimbingan Dosen PA
   */
  getAdviseesKrsOverview(_advisorId = 'usr-dsn-01'): AdviseeKrsOverview[] {
    const students = this.getStoredStudents();
    const result: AdviseeKrsOverview[] = [];

    Object.values(students).forEach(st => {
      const conflicts = this.detectScheduleConflicts(st.courses);
      const hasScheduleConflict = conflicts.some(c => !!c.scheduleConflictWith);
      const hasPrerequisiteIssue = st.courses.some(c => !c.prerequisiteMet);
      const msgs = this.getConsultationMessages(st.studentId);
      const unreadCount = msgs.filter(m => !m.isRead && m.senderRole === 'MAHASISWA').length;

      result.push({
        studentId: st.studentId,
        studentNim: st.studentNim,
        studentName: st.studentName,
        studyProgram: st.studyProgram,
        semesterNumber: st.semesterNumber,
        previousSemesterGpa: st.previousSemesterGpa,
        cumulativeGpa: st.cumulativeGpa,
        maxCreditQuota: st.maxCreditQuota,
        totalCreditsTaken: st.totalCreditsTaken,
        courseCount: st.courses.length,
        krsStatus: st.krsStatus,
        submissionDate: st.submissionDate,
        approvedDate: st.approvedDate,
        hasScheduleConflict,
        hasPrerequisiteIssue,
        unreadMessagesCount: unreadCount,
        academicAdvisorNotes: st.academicAdvisorNotes
      });
    });

    return result;
  }

  /**
   * Mengambil statistik ringkasan Dosen PA
   */
  getAdvisorStats(advisorId = 'usr-dsn-01'): KrsAdvisorStats {
    const advisees = this.getAdviseesKrsOverview(advisorId);
    const totalAdvisees = advisees.length;
    const pendingApproval = advisees.filter(a => a.krsStatus === 'MENUNGGU_PERSETUJUAN').length;
    const approved = advisees.filter(a => a.krsStatus === 'DISETUJUI').length;
    const revisionNeeded = advisees.filter(a => a.krsStatus === 'DITOLAK_REVISI').length;
    const draftCount = advisees.filter(a => a.krsStatus === 'DRAF').length;
    const totalCreditsSum = advisees.reduce((sum, a) => sum + a.totalCreditsTaken, 0);
    const totalCreditsAverage = totalAdvisees > 0 ? Math.round(totalCreditsSum / totalAdvisees) : 0;

    return {
      totalAdvisees,
      pendingApproval,
      approved,
      revisionNeeded,
      draftCount,
      totalCreditsAverage
    };
  }

  /**
   * Aksi Dosen PA: Menyetujui dan Mengesahkan KRS Mahasiswa
   */
  approveAdviseeKrs(
    advisorId: string, 
    studentId: string, 
    advisorNotes = 'KRS telah diverifikasi dan disetujui sesuai kurikulum STAI Al-Ittihad.'
  ): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId];

    if (!student) {
      return { success: false, message: 'Data mahasiswa tidak ditemukan.' };
    }

    student.krsStatus = 'DISETUJUI';
    student.approvedDate = new Date().toISOString();
    student.academicAdvisorNotes = advisorNotes;
    student.courses = student.courses.map(c => ({ ...c, isLocked: true }));

    students[studentId] = student;
    this.saveStoredStudents(students);

    // Kirim pesan feedback otomatis ke chat bimbingan
    this.sendConsultationMessage(
      studentId,
      advisorId,
      student.academicAdvisorName,
      'DOSEN_PA',
      `Wa’alaikumsalam Warahmatullahi Wabarakatuh. Rencana studi Anda telah disetujui dan disahkan secara resmi (${student.totalCreditsTaken} SKS). Catatan: ${advisorNotes}. Selamat belajar dan sukses selalu!`
    );

    return {
      success: true,
      message: `KRS mahasiswa ${student.studentName} (${student.studentNim}) berhasil disetujui dan disahkan.`,
      krs: student
    };
  }

  /**
   * Aksi Dosen PA: Menolak KRS dan Meminta Revisi Rencana Studi
   */
  rejectAdviseeKrs(
    advisorId: string, 
    studentId: string, 
    revisionNotes: string
  ): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId];

    if (!student) {
      return { success: false, message: 'Data mahasiswa tidak ditemukan.' };
    }

    if (!revisionNotes || !revisionNotes.trim()) {
      return { success: false, message: 'Harap berikan catatan revisi yang jelas untuk mahasiswa.' };
    }

    student.krsStatus = 'DITOLAK_REVISI';
    student.approvedDate = undefined;
    student.academicAdvisorNotes = revisionNotes;
    student.courses = student.courses.map(c => ({ ...c, isLocked: false }));

    students[studentId] = student;
    this.saveStoredStudents(students);

    // Kirim pesan revisi ke chat bimbingan
    this.sendConsultationMessage(
      studentId,
      advisorId,
      student.academicAdvisorName,
      'DOSEN_PA',
      `Catatan Evaluasi KRS: Rencana studi Anda memerlukan perbaikan/revisi dengan alasan: "${revisionNotes}". Silakan sesuaikan kembali mata kuliah Anda lalu ajukan ulang.`
    );

    return {
      success: true,
      message: `Permintaan revisi KRS telah disampaikan kepada mahasiswa ${student.studentName}.`,
      krs: student
    };
  }

  /**
   * Aksi Dosen PA: Membuka Kunci KRS Mahasiswa yang Sudah Disetujui
   */
  unlockAdviseeKrs(
    advisorId: string, 
    studentId: string, 
    unlockReason = 'Pembukaan kunci atas permohonan penyesuaian jadwal mahasiswa'
  ): { success: boolean; message: string; krs?: StudentKrsData } {
    const students = this.getStoredStudents();
    const student = students[studentId];

    if (!student) {
      return { success: false, message: 'Data mahasiswa tidak ditemukan.' };
    }

    student.krsStatus = 'DRAF';
    student.approvedDate = undefined;
    student.academicAdvisorNotes = `Kunci KRS dibuka: ${unlockReason}`;
    student.courses = student.courses.map(c => ({ ...c, isLocked: false }));

    students[studentId] = student;
    this.saveStoredStudents(students);

    this.sendConsultationMessage(
      studentId,
      advisorId,
      student.academicAdvisorName,
      'DOSEN_PA',
      `Kunci pengisian KRS Anda telah dibuka untuk perbaikan (${unlockReason}). Silakan ubah mata kuliah dan ajukan kembali setelah selesai.`
    );

    return {
      success: true,
      message: `Kunci KRS mahasiswa ${student.studentName} berhasil dibuka. Mahasiswa dapat mengubah rencana studi.`,
      krs: student
    };
  }

  /**
   * Mengambil riwayat KRS semester sebelumnya
   */
  getKrsHistory(_studentId = 'usr-mhs-01'): KrsHistoryItem[] {
    return INITIAL_KRS_HISTORY;
  }

  /**
   * Mengambil riwayat pesan bimbingan KRS
   */
  getConsultationMessages(studentId = 'usr-mhs-01'): KrsConsultationMessage[] {
    try {
      const stored = localStorage.getItem(this.messagesStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[studentId]) {
          return parsed[studentId];
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CONSULTATION_MESSAGES[studentId] || [];
  }

  /**
   * Mengirim pesan konsultasi bimbingan KRS
   */
  sendConsultationMessage(
    studentId: string, 
    senderId: string,
    senderName: string, 
    senderRole: 'MAHASISWA' | 'DOSEN_PA',
    text: string
  ): KrsConsultationMessage[] {
    let allMessages: Record<string, KrsConsultationMessage[]> = {};
    try {
      const stored = localStorage.getItem(this.messagesStorageKey);
      if (stored) {
        allMessages = JSON.parse(stored);
      }
    } catch {
      allMessages = {};
    }

    const current = allMessages[studentId] || INITIAL_CONSULTATION_MESSAGES[studentId] || [];
    const newMsg: KrsConsultationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      senderId,
      senderName,
      senderRole,
      message: text.trim(),
      timestamp: new Date().toISOString(),
      isRead: false
    };

    const updated = [...current, newMsg];
    allMessages[studentId] = updated;

    try {
      localStorage.setItem(this.messagesStorageKey, JSON.stringify(allMessages));
    } catch {
      // ignore
    }

    return updated;
  }

  /**
   * Menandai seluruh pesan konsultasi mahasiswa sebagai telah dibaca
   */
  markMessagesAsRead(studentId: string, viewerRole: 'MAHASISWA' | 'DOSEN_PA'): void {
    try {
      const stored = localStorage.getItem(this.messagesStorageKey);
      if (!stored) return;
      const allMessages = JSON.parse(stored);
      if (!allMessages[studentId]) return;

      const targetRoleToMark = viewerRole === 'DOSEN_PA' ? 'MAHASISWA' : 'DOSEN_PA';
      allMessages[studentId] = allMessages[studentId].map((m: KrsConsultationMessage) => {
        if (m.senderRole === targetRoleToMark) {
          return { ...m, isRead: true };
        }
        return m;
      });

      localStorage.setItem(this.messagesStorageKey, JSON.stringify(allMessages));
    } catch {
      // ignore
    }
  }

  /**
   * Reset seluruh data KRS ke konfigurasi pabrik / default
   */
  resetToDefault(): void {
    try {
      localStorage.removeItem(this.studentsStorageKey);
      localStorage.removeItem(this.catalogStorageKey);
      localStorage.removeItem(this.messagesStorageKey);
    } catch {
      // ignore
    }
  }
}

export const krsService = new KrsService();
