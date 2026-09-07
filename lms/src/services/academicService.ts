import { 
  AcademicPeriod, 
  StudyProgram, 
  Course, 
  AcademicClass, 
  ClassMember 
} from '../types/academic';

export type { AcademicClass, ClassMember };

const PERIODS_KEY = 'salam_academic_periods';
const PROGRAMS_KEY = 'salam_study_programs';
const COURSES_KEY = 'salam_courses';
const CLASSES_KEY = 'salam_classes';
const MEMBERS_KEY = 'salam_class_members';
const SCHEMA_VERSION_KEY = 'salam_siakad_db_synced_v3';

export const INITIAL_PERIODS: AcademicPeriod[] = [
  {
    id: 'prd-20261',
    externalId: 'EXT-PRD-1',
    code: '20261',
    name: 'Semester Ganjil 2026/2027',
    year: '2026/2027',
    semesterType: 'GANJIL',
    startDate: '2026-09-01',
    endDate: '2027-01-31',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PROGRAMS: StudyProgram[] = [
  {
    id: 'prodi-pai',
    externalId: 'EXT-PRODI-PAI',
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-piaud',
    externalId: 'EXT-PRODI-PIAUD',
    code: 'PIAUD',
    name: 'Pendidikan Islam Anak Usia Dini',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-mpi',
    externalId: 'EXT-PRODI-MPI',
    code: 'MPI',
    name: 'Manajemen Pendidikan Islam',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-es',
    externalId: 'EXT-PRODI-ES',
    code: 'ES',
    name: 'Ekonomi Syariah',
    degree: 'S1',
    faculty: 'Fakultas Syariah & Ekonomi',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-bki',
    externalId: 'EXT-PRODI-BKI',
    code: 'BKI',
    name: 'Bimbingan Konseling Islam',
    degree: 'S1',
    faculty: 'Fakultas Dakwah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-mku',
    externalId: 'EXT-PRODI-MKU',
    code: 'MKU',
    name: 'Mata Kuliah Umum',
    degree: 'S1',
    faculty: 'Institut',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-pai301',
    externalId: 'EXT-CRS-1',
    code: 'PAI-301',
    name: 'Fiqih Mawaris',
    credits: 3,
    semesterLevel: 3,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: 'Kajian komprehensif hukum waris Islam, kaidah pembagian harta tirkah, ashabul furudh, dan ashabah.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-pai101',
    externalId: 'EXT-CRS-2',
    code: 'PAI-101',
    name: "Ulumul Qur'an",
    credits: 2,
    semesterLevel: 1,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: "Kajian ilmu-ilmu Al-Qur'an, asbabun nuzul, makkiyyah-madaniyyah, nasikh-mansukh, dan kaidah penafsiran.",
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-mku101',
    externalId: 'EXT-CRS-3',
    code: 'MKU-101',
    name: 'Bahasa Arab Dasar',
    credits: 2,
    semesterLevel: 1,
    studyProgramId: 'prodi-mku',
    studyProgramCode: 'MKU',
    description: 'Penguasaan tata bahasa Arab dasar, kaidah nahwu, sharaf, kosa kata (mufrodat), dan percakapan kontekstual.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-pai202',
    externalId: 'EXT-CRS-4',
    code: 'PAI-202',
    name: 'Fiqih Ibadah & Muamalah',
    credits: 3,
    semesterLevel: 2,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: 'Pendalaman tata cara ibadah mahdhah dan prinsip-prinsip transaksi muamalah kontemporer.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd213',
    externalId: 'EXT-CRS-33',
    code: 'STAIPD213',
    name: 'Bahasa Arab II',
    credits: 2,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Pengembangan kemampuan bahasa Arab lanjutan bagi pendidik anak usia dini.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd214',
    externalId: 'EXT-CRS-34',
    code: 'STAIPD214',
    name: 'Bahasa Inggris II',
    credits: 2,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Bahasa Inggris komunikatif dan pengenalan kosa kata pengajaran anak usia dini.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd215',
    externalId: 'EXT-CRS-35',
    code: 'STAIPD215',
    name: 'Statistika',
    credits: 2,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Metodologi statistika deskriptif dan inferensial untuk riset pendidikan anak usia dini.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd216',
    externalId: 'EXT-CRS-36',
    code: 'STAIPD216',
    name: 'Teknik Penulisan KTI',
    credits: 2,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Tata cara penyusunan karya tulis ilmiah, sitasi, referensi, dan publikasi akademik.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd217',
    externalId: 'EXT-CRS-37',
    code: 'STAIPD217',
    name: 'Psikologi Perkembangan Anak Usia Dini',
    credits: 3,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Karakteristik tumbuh kembang fisik, kognitif, sosio-emosional, dan moral anak usia dini.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-staipd218',
    externalId: 'EXT-CRS-38',
    code: 'STAIPD218',
    name: 'Konsep Dasar PAUD & Kurikulum Merdeka',
    credits: 3,
    semesterLevel: 2,
    studyProgramId: 'prodi-piaud',
    studyProgramCode: 'PIAUD',
    description: 'Landasan filosofis, yuridis, dan implementasi kurikulum merdeka pada jenjang PAUD/RA.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  }
];

export const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: 'cls-20261-pai301-a',
    externalId: 'EXT-CLS-1',
    code: 'cls-20261-pai301-a',
    name: 'PAI-301 (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai301',
    courseCode: 'PAI-301',
    courseName: 'Fiqih Mawaris',
    credits: 3,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-01',
        dayOfWeek: 'SENIN',
        startTime: '08:00',
        endTime: '09:40',
        room: 'Ruang Kuliah 101 (Teori)',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-20261-pai101-a',
    externalId: 'EXT-CLS-2',
    code: 'cls-20261-pai101-a',
    name: 'PAI-101 (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai101',
    courseCode: 'PAI-101',
    courseName: "Ulumul Qur'an",
    credits: 2,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-kpr-01',
    lecturerName: "Dr. Ahmad Syafi'i, M.Ag",
    lecturerNidn: '2118097201',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-02',
        dayOfWeek: 'SENIN',
        startTime: '10:00',
        endTime: '11:40',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-20261-mku101-a',
    externalId: 'EXT-CLS-3',
    code: 'cls-20261-mku101-a',
    name: 'MKU-101 (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-mku101',
    courseCode: 'MKU-101',
    courseName: 'Bahasa Arab Dasar',
    credits: 2,
    studyProgramCode: 'MKU',
    lecturerId: 'usr-dsn-pa',
    lecturerName: 'Dra. Hj. Siti Maryam, M.Pd.I',
    lecturerNidn: '2115047802',
    studentCount: 2,
    schedules: [
      {
        id: 'sch-03',
        dayOfWeek: 'SELASA',
        startTime: '08:00',
        endTime: '09:40',
        room: 'Ruang Kuliah 101 (Teori)',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-20261-pai202-a',
    externalId: 'EXT-CLS-4',
    code: 'cls-20261-pai202-a',
    name: 'PAI-202 (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai202',
    courseCode: 'PAI-202',
    courseName: 'Fiqih Ibadah & Muamalah',
    credits: 3,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-04',
        dayOfWeek: 'RABU',
        startTime: '13:00',
        endTime: '15:30',
        room: 'Laboratorium Komputer & CBT Center',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd213-pd2',
    externalId: 'EXT-CLS-5',
    code: 'cls-staipd213-pd2',
    name: 'STAIPD213 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd213',
    courseCode: 'STAIPD213',
    courseName: 'Bahasa Arab II',
    credits: 2,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-09',
    lecturerName: 'MUHAMMAD RIZAL ZAENULLOH, M.Pd.',
    lecturerNidn: '3203040910960002',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-05',
        dayOfWeek: 'JUMAT',
        startTime: '14:00',
        endTime: '15:00',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd214-pd2',
    externalId: 'EXT-CLS-6',
    code: 'cls-staipd214-pd2',
    name: 'STAIPD214 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd214',
    courseCode: 'STAIPD214',
    courseName: 'Bahasa Inggris II',
    credits: 2,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-10',
    lecturerName: 'WAHYUDIN, M.Pd.',
    lecturerNidn: '3203072705890003',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-06',
        dayOfWeek: 'SABTU',
        startTime: '11:00',
        endTime: '12:00',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd215-pd2',
    externalId: 'EXT-CLS-7',
    code: 'cls-staipd215-pd2',
    name: 'STAIPD215 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd215',
    courseCode: 'STAIPD215',
    courseName: 'Statistika',
    credits: 2,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-11',
    lecturerName: 'DEDE SULAEMAN, M.Pd.',
    lecturerNidn: '2118097202',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-07',
        dayOfWeek: 'SABTU',
        startTime: '08:00',
        endTime: '09:00',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd216-pd2',
    externalId: 'EXT-CLS-8',
    code: 'cls-staipd216-pd2',
    name: 'STAIPD216 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd216',
    courseCode: 'STAIPD216',
    courseName: 'Teknik Penulisan KTI',
    credits: 2,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-12',
    lecturerName: 'SITI RODIAH, M.Pd.',
    lecturerNidn: '2115047803',
    studentCount: 1,
    schedules: [
      {
        id: 'sch-08',
        dayOfWeek: 'SABTU',
        startTime: '11:00',
        endTime: '12:00',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd217-pd2',
    externalId: 'EXT-CLS-9',
    code: 'cls-staipd217-pd2',
    name: 'STAIPD217 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd217',
    courseCode: 'STAIPD217',
    courseName: 'Psikologi Perkembangan Anak Usia Dini',
    credits: 3,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-12',
    lecturerName: 'SITI RODIAH, M.Pd.',
    lecturerNidn: '2115047803',
    studentCount: 0,
    schedules: [
      {
        id: 'sch-09',
        dayOfWeek: 'KAMIS',
        startTime: '08:30',
        endTime: '10:30',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-staipd218-pd2',
    externalId: 'EXT-CLS-10',
    code: 'cls-staipd218-pd2',
    name: 'STAIPD218 (Kelas PD2)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-staipd218',
    courseCode: 'STAIPD218',
    courseName: 'Konsep Dasar PAUD & Kurikulum Merdeka',
    credits: 3,
    studyProgramCode: 'PIAUD',
    lecturerId: 'usr-dsn-11',
    lecturerName: 'DEDE SULAEMAN, M.Pd.',
    lecturerNidn: '2118097202',
    studentCount: 0,
    schedules: [
      {
        id: 'sch-10',
        dayOfWeek: 'KAMIS',
        startTime: '10:30',
        endTime: '12:30',
        room: '02 - Ruang 2 [Gedung A: Lantai 1]',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_MEMBERS: ClassMember[] = [
  // 1. Ahmad Fauzi Rahman (NIM: 21.01.0042)
  {
    id: 'mbr-af-01',
    externalId: 'EXT-MBR-1-AF',
    classId: 'cls-20261-pai301-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi Rahman',
    enrollmentDate: '2026-08-20',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-af-02',
    externalId: 'EXT-MBR-2-AF',
    classId: 'cls-20261-pai101-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi Rahman',
    enrollmentDate: '2026-08-20',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-af-03',
    externalId: 'EXT-MBR-3-AF',
    classId: 'cls-20261-mku101-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi Rahman',
    enrollmentDate: '2026-08-20',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-af-04',
    externalId: 'EXT-MBR-4-AF',
    classId: 'cls-20261-pai202-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi Rahman',
    enrollmentDate: '2026-08-20',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  // 2. Cantika Siti Samsiah (NIM: 25893604)
  {
    id: 'mbr-cs-01',
    externalId: 'EXT-MBR-3-CS',
    classId: 'cls-20261-mku101-a',
    studentId: 'usr-mhs-13',
    studentNim: '25893604',
    studentName: 'Cantika Siti Samsiah',
    enrollmentDate: '2026-08-22',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  // 3. Alleisya Hani Pasyala (NIM: 25893601)
  {
    id: 'mbr-ah-01',
    externalId: 'EXT-MBR-5-AH',
    classId: 'cls-staipd213-pd2',
    studentId: 'usr-mhs-14',
    studentNim: '25893601',
    studentName: 'Alleisya Hani Pasyala',
    enrollmentDate: '2026-08-25',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-ah-02',
    externalId: 'EXT-MBR-6-AH',
    classId: 'cls-staipd214-pd2',
    studentId: 'usr-mhs-14',
    studentNim: '25893601',
    studentName: 'Alleisya Hani Pasyala',
    enrollmentDate: '2026-08-25',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-ah-03',
    externalId: 'EXT-MBR-7-AH',
    classId: 'cls-staipd215-pd2',
    studentId: 'usr-mhs-14',
    studentNim: '25893601',
    studentName: 'Alleisya Hani Pasyala',
    enrollmentDate: '2026-08-25',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'mbr-ah-04',
    externalId: 'EXT-MBR-8-AH',
    classId: 'cls-staipd216-pd2',
    studentId: 'usr-mhs-14',
    studentNim: '25893601',
    studentName: 'Alleisya Hani Pasyala',
    enrollmentDate: '2026-08-25',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  }
];

class AcademicService {
  constructor() {
    this.ensureSchemaVersion();
  }

  /**
   * Memastikan cache di browser sinkron dengan data database SIAKAD terkini
   */
  private ensureSchemaVersion(): void {
    try {
      const isSynced = localStorage.getItem(SCHEMA_VERSION_KEY);
      if (isSynced !== 'true') {
        localStorage.setItem(CLASSES_KEY, JSON.stringify(INITIAL_CLASSES));
        localStorage.setItem(COURSES_KEY, JSON.stringify(INITIAL_COURSES));
        localStorage.setItem(PROGRAMS_KEY, JSON.stringify(INITIAL_PROGRAMS));
        localStorage.setItem(MEMBERS_KEY, JSON.stringify(INITIAL_MEMBERS));
        localStorage.setItem(SCHEMA_VERSION_KEY, 'true');
      }
    } catch {
      // Abaikan jika SSR / LocalStorage tidak tersedia
    }
  }

  public getPeriods(): AcademicPeriod[] {
    return this.getItem(PERIODS_KEY, INITIAL_PERIODS);
  }

  public getStudyPrograms(): StudyProgram[] {
    return this.getItem(PROGRAMS_KEY, INITIAL_PROGRAMS);
  }

  public getCourses(): Course[] {
    return this.getItem(COURSES_KEY, INITIAL_COURSES);
  }

  public getClasses(periodId?: string): AcademicClass[] {
    const classes = this.getItem(CLASSES_KEY, INITIAL_CLASSES);
    if (periodId) {
      return classes.filter((c) => c.academicPeriodId === periodId);
    }
    return classes;
  }

  public getClassById(classIdentifier: string): AcademicClass | undefined {
    const classes = this.getClasses();
    return classes.find(c => 
      c.id === classIdentifier || 
      c.code === classIdentifier || 
      c.externalId === classIdentifier ||
      (classIdentifier === 'cls-pai301-a' && (c.id === 'cls-20261-pai301-a' || c.code === 'cls-20261-pai301-a')) ||
      (classIdentifier === '1' && (c.id === 'cls-20261-pai301-a' || c.code === 'cls-20261-pai301-a'))
    );
  }

  public isStudentEnrolledInClass(classIdentifier: string, studentNim: string, studentId?: string): boolean {
    const cleanNim = studentNim.replace(/[^0-9]/g, '');
    const members = this.getItem(MEMBERS_KEY, INITIAL_MEMBERS);
    const classes = this.getClasses();
    
    // Temukan class terkait
    const targetClass = classes.find(c => 
      c.id === classIdentifier || 
      c.code === classIdentifier || 
      c.externalId === classIdentifier ||
      (classIdentifier === 'cls-pai301-a' && c.code === 'cls-20261-pai301-a') ||
      (classIdentifier === '1' && c.code === 'cls-20261-pai301-a')
    );

    const validClassIds = new Set<string>();
    validClassIds.add(classIdentifier);
    if (targetClass) {
      validClassIds.add(targetClass.id);
      validClassIds.add(targetClass.code);
      validClassIds.add(targetClass.externalId);
      if (targetClass.code === 'cls-20261-pai301-a') {
        validClassIds.add('cls-pai301-a');
        validClassIds.add('1');
      }
    }

    return members.some(m => {
      const mNim = m.studentNim.replace(/[^0-9]/g, '');
      const isUserMatch = (cleanNim && mNim === cleanNim) || (studentId && m.studentId === studentId);
      const isClassMatch = validClassIds.has(m.classId);
      return isUserMatch && isClassMatch;
    });
  }

  public async fetchClassesFromBackend(): Promise<AcademicClass[]> {
    try {
      const stored = localStorage.getItem('salam_auth_session');
      let token = null;
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.session?.token || parsed.token;
      }
      if (!token) return this.getClasses();

      const res = await fetch('/api/v1/academic/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) return this.getClasses();

      const json = await res.json();
      const rows = json.data || [];

      if (rows.length > 0) {
        const mapped: AcademicClass[] = rows.map((r: any) => {
          const classIdentifier = r.classCode || `cls-${r.id}`;
          const rawDay = r.dayOfWeek ? String(r.dayOfWeek).toUpperCase() : 'SENIN';
          const validDay = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'].includes(rawDay) ? rawDay : 'SENIN';

          return {
            id: classIdentifier,
            externalId: `EXT-CLS-${r.id}`,
            code: r.classCode || `cls-${r.id}`,
            name: r.className || r.courseName,
            academicPeriodId: 'prd-20261',
            academicPeriodName: r.academicYear || 'Semester Ganjil 2026/2027',
            courseId: `crs-${(r.courseCode || r.id).toLowerCase()}`,
            courseCode: r.courseCode || '',
            courseName: r.courseName || '',
            credits: Number(r.credits) || 2,
            studyProgramCode: r.studyProgramCode || (r.courseCode?.startsWith('PAI') ? 'PAI' : r.courseCode?.startsWith('STAIPD') ? 'PIAUD' : 'MKU'),
            lecturerId: r.lecturerId ? `usr-dsn-${r.lecturerId}` : 'usr-dsn-01',
            lecturerName: r.lecturerName || 'Dr. H. M. Ridwan, M.Ag',
            lecturerNidn: r.lecturerNidn || '2112087501',
            studentCount: Number(r.enrolledCount) || 0,
            schedules: r.dayOfWeek ? [
              {
                id: `sch-${r.id}`,
                dayOfWeek: validDay as any,
                startTime: r.startTime ? r.startTime.substring(0, 5) : '08:00',
                endTime: r.endTime ? r.endTime.substring(0, 5) : '09:40',
                room: r.roomName || 'Ruang Kuliah',
                isOnline: false
              }
            ] : [],
            status: 'AKTIF',
            sourceSystem: 'SIAKAD_STAI',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        });

        this.saveClasses(mapped);
        return mapped;
      }
    } catch {
      // Abaikan jika offline
    }
    return this.getClasses();
  }

  public getClassMembers(classId: string): ClassMember[] {
    const members = this.getItem(MEMBERS_KEY, INITIAL_MEMBERS);
    const targetClass = this.getClassById(classId);
    const validIds = new Set<string>([classId]);
    if (targetClass) {
      validIds.add(targetClass.id);
      validIds.add(targetClass.code);
      validIds.add(targetClass.externalId);
    }
    if (classId === 'cls-pai301-a' || classId === '1' || classId === 'cls-20261-pai301-a') {
      validIds.add('cls-20261-pai301-a');
      validIds.add('cls-pai301-a');
      validIds.add('1');
    }
    return members.filter((m) => validIds.has(m.classId));
  }

  public savePeriods(periods: AcademicPeriod[]): void {
    this.setItem(PERIODS_KEY, periods);
  }

  public savePrograms(programs: StudyProgram[]): void {
    this.setItem(PROGRAMS_KEY, programs);
  }

  public saveCourses(courses: Course[]): void {
    this.setItem(COURSES_KEY, courses);
  }

  public saveClasses(classes: AcademicClass[]): void {
    this.setItem(CLASSES_KEY, classes);
  }

  public saveMembers(members: ClassMember[]): void {
    this.setItem(MEMBERS_KEY, members);
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(data);
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Gagal menyimpan ${key}:`, e);
    }
  }
}

export const academicService = new AcademicService();
