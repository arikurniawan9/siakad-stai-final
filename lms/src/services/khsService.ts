import { 
  KhsSemesterData, 
  KhsGradeItem, 
  KhsPerformanceTrend, 
  StudentTranscriptSummary,
  KhsTranscriptGroup,
  LetterGrade
} from '../types/khs';

/**
 * Konversi Nilai Angka ke Huruf Mutu & Bobot Nilai Standar BAN-PT / STAI AL-ITTIHAD
 */
export function calculateLetterGradeAndPoint(score: number): { letter: LetterGrade; point: number } {
  if (score >= 88.0) return { letter: 'A', point: 4.00 };
  if (score >= 84.0) return { letter: 'A-', point: 3.75 };
  if (score >= 80.0) return { letter: 'B+', point: 3.50 };
  if (score >= 75.0) return { letter: 'B', point: 3.00 };
  if (score >= 70.0) return { letter: 'B-', point: 2.75 };
  if (score >= 65.0) return { letter: 'C+', point: 2.25 };
  if (score >= 60.0) return { letter: 'C', point: 2.00 };
  if (score >= 50.0) return { letter: 'D', point: 1.00 };
  return { letter: 'E', point: 0.00 };
}

/**
 * Menghitung Beban SKS Maksimum Semester Berikutnya Berdasarkan IPS
 * Standar Akademik STAI AL-ITTIHAD:
 * - IPS >= 3.50 : 24 SKS
 * - 3.00 <= IPS < 3.50 : 22 SKS
 * - 2.50 <= IPS < 3.00 : 20 SKS
 * - 2.00 <= IPS < 2.50 : 18 SKS
 * - IPS < 2.00 : 15 SKS
 */
export function calculateMaxCreditsByGpa(ips: number): number {
  if (ips >= 3.50) return 24;
  if (ips >= 3.00) return 22;
  if (ips >= 2.50) return 20;
  if (ips >= 2.00) return 18;
  return 15;
}

/**
 * Menghitung Predikat Akademik Kelulusan / Prestasi
 */
export function getAcademicStanding(gpa: number): string {
  if (gpa >= 3.75) return 'Dengan Pujian (Cumlaude)';
  if (gpa >= 3.50) return 'Sangat Memuaskan (A)';
  if (gpa >= 3.00) return 'Memuaskan (B+)';
  if (gpa >= 2.75) return 'Cukup Memuaskan (B)';
  return 'Cukup';
}

// Data Mock Detail Mata Kuliah Semester 5 (Aktif)
const SEMESTER_5_GRADES: KhsGradeItem[] = [
  {
    id: 'grd-501',
    courseId: 'crs-pai301',
    courseCode: 'PAI-301',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 92.0,
    finalExamScore: 94.0,
    finalScore: 92.20,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Analisis dalil hukum dan penguasaan kaidah fiqhiyyah sangat mendalam dan tajam.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-502',
    courseId: 'crs-pai204',
    courseCode: 'PAI-204',
    courseName: "Ulumul Qur'an & Studi Tafsir Tematik",
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    presenceScore: 100.0,
    assignmentScore: 92.0,
    quizScore: 90.0,
    midtermScore: 88.0,
    finalExamScore: 90.0,
    finalScore: 91.10,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Tugas makalah tafsir tematik disusun sistematis dengan rujukan kitab mutabar.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-503',
    courseId: 'crs-pai205',
    courseCode: 'PAI-205',
    courseName: 'Ulumul Hadits & Studi Sanad Matan',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 85.0,
    quizScore: 86.0,
    midtermScore: 88.0,
    finalExamScore: 89.0,
    finalScore: 87.60,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Takhrij hadits dipahami dengan baik, pertahankan ketelitian sanad.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-504',
    courseId: 'crs-pai302',
    courseCode: 'PAI-302',
    courseName: 'Pengembangan Kurikulum PAI Berbasis Karakter',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 94.0,
    quizScore: 90.0,
    midtermScore: 92.0,
    finalExamScore: 95.0,
    finalScore: 93.80,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Rancangan modul ajar berbasis karakter sangat aplikatif dan inovatif.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-505',
    courseId: 'crs-pai303',
    courseCode: 'PAI-303',
    courseName: 'Metodologi Pembelajaran PAI Abad 21',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
    lecturerNidn: '2108117901',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 85.0,
    midtermScore: 86.0,
    finalExamScore: 88.0,
    finalScore: 87.25,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Microteaching interaktif memanfaatkan teknologi digital dengan sangat baik.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-506',
    courseId: 'crs-pai304',
    courseCode: 'PAI-304',
    courseName: 'Evaluasi & Asesmen Pembelajaran PAI',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 95.0,
    assignmentScore: 89.0,
    quizScore: 88.0,
    midtermScore: 90.0,
    finalExamScore: 91.0,
    finalScore: 90.30,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Penyusunan instrumen tes HOTS dan rubrik asesmen autentik memuaskan.',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-507',
    courseId: 'crs-mku201',
    courseCode: 'MKU-201',
    courseName: 'Metodologi Penelitian Kualitatif & Kuantitatif',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Prof. Dr. H. Maksum, M.A',
    lecturerNidn: '2101016501',
    presenceScore: 90.0,
    assignmentScore: 86.0,
    quizScore: 84.0,
    midtermScore: 85.0,
    finalExamScore: 88.0,
    finalScore: 86.45,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    feedback: 'Draft proposal skripsi sudah memiliki novelty dan metodologi yang kokoh.',
    courseCategory: 'WAJIB_INSTITUSI'
  }
];

// Data Mock Semester 4
const SEMESTER_4_GRADES: KhsGradeItem[] = [
  {
    id: 'grd-401',
    courseId: 'crs-pai201',
    courseCode: 'PAI-201',
    courseName: 'Fiqih Ibadah & Muamalah Kontemporer',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 90.0,
    midtermScore: 92.0,
    finalExamScore: 93.0,
    finalScore: 91.90,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-402',
    courseId: 'crs-pai202',
    courseCode: 'PAI-202',
    courseName: 'Psikologi Pendidikan & Perkembangan Peserta Didik',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
    lecturerNidn: '2108117901',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 85.0,
    midtermScore: 88.0,
    finalExamScore: 90.0,
    finalScore: 88.35,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-403',
    courseId: 'crs-pai203',
    courseCode: 'PAI-203',
    courseName: 'Media & Teknologi Pembelajaran PAI',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'M. Syarifuddin, M.Kom',
    lecturerNidn: '2120028601',
    presenceScore: 100.0,
    assignmentScore: 95.0,
    quizScore: 92.0,
    midtermScore: 94.0,
    finalExamScore: 96.0,
    finalScore: 95.10,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-404',
    courseId: 'crs-mku202',
    courseCode: 'MKU-202',
    courseName: 'Bahasa Arab Akademik & Turats',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 85.0,
    quizScore: 82.0,
    midtermScore: 84.0,
    finalExamScore: 86.0,
    finalScore: 85.10,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-405',
    courseId: 'crs-mku203',
    courseCode: 'MKU-203',
    courseName: 'Statistik Pendidikan Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Prof. Dr. H. Maksum, M.A',
    lecturerNidn: '2101016501',
    presenceScore: 85.0,
    assignmentScore: 82.0,
    quizScore: 80.0,
    midtermScore: 82.0,
    finalExamScore: 85.0,
    finalScore: 82.90,
    letterGrade: 'B+',
    gradePoint: 3.50,
    qualityPoints: 10.50,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-406',
    courseId: 'crs-pil101',
    courseCode: 'PIL-101',
    courseName: 'Kewirausahaan Berbasis Syariah',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Lukman Hakim, M.E.Sy',
    lecturerNidn: '2110107701',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 92.0,
    finalExamScore: 92.0,
    finalScore: 91.30,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'PILIHAN'
  },
  {
    id: 'grd-407',
    courseId: 'crs-pai206',
    courseCode: 'PAI-206',
    courseName: 'Sosiologi & Antropologi Pendidikan Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 85.0,
    midtermScore: 86.0,
    finalExamScore: 88.0,
    finalScore: 87.25,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  }
];

// Data Mock Semester 3
const SEMESTER_3_GRADES: KhsGradeItem[] = [
  {
    id: 'grd-301',
    courseId: 'crs-pai105',
    courseCode: 'PAI-105',
    courseName: 'Filsafat Pendidikan Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 90.0,
    assignmentScore: 90.0,
    quizScore: 85.0,
    midtermScore: 90.0,
    finalExamScore: 92.0,
    finalScore: 89.85,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-302',
    courseId: 'crs-pai106',
    courseCode: 'PAI-106',
    courseName: 'Sejarah Peradaban & Pemikiran Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    presenceScore: 95.0,
    assignmentScore: 92.0,
    quizScore: 90.0,
    midtermScore: 90.0,
    finalExamScore: 92.0,
    finalScore: 91.50,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-303',
    courseId: 'crs-pai107',
    courseCode: 'PAI-107',
    courseName: 'Tafsir Ayat-Ayat Tarbawi',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 85.0,
    midtermScore: 88.0,
    finalExamScore: 89.0,
    finalScore: 88.05,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-304',
    courseId: 'crs-pai108',
    courseCode: 'PAI-108',
    courseName: 'Hadits-Hadits Tarbawi',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 86.0,
    quizScore: 84.0,
    midtermScore: 85.0,
    finalExamScore: 88.0,
    finalScore: 86.45,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-305',
    courseId: 'crs-mku104',
    courseCode: 'MKU-104',
    courseName: 'Bahasa Inggris Akademik & Tarbiyah',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
    lecturerNidn: '2108117901',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 90.0,
    finalExamScore: 90.0,
    finalScore: 90.20,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-306',
    courseId: 'crs-mku105',
    courseCode: 'MKU-105',
    courseName: 'Pendidikan Anti Korupsi & Moderasi Beragama',
    credits: 2,
    className: 'Kelas A',
    lecturerName: 'Prof. Dr. H. Maksum, M.A',
    lecturerNidn: '2101016501',
    presenceScore: 100.0,
    assignmentScore: 95.0,
    quizScore: 92.0,
    midtermScore: 95.0,
    finalExamScore: 96.0,
    finalScore: 95.35,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 8.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-307',
    courseId: 'crs-pai109',
    courseCode: 'PAI-109',
    courseName: 'Etika Profesi Keguruan PAI',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 90.0,
    finalExamScore: 92.0,
    finalScore: 90.80,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  }
];

// Data Mock Semester 2
const SEMESTER_2_GRADES: KhsGradeItem[] = [
  {
    id: 'grd-201',
    courseId: 'crs-pai103',
    courseCode: 'PAI-103',
    courseName: 'Ilmu Pendidikan Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 92.0,
    finalExamScore: 92.0,
    finalScore: 91.30,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-202',
    courseId: 'crs-pai104',
    courseCode: 'PAI-104',
    courseName: 'Akhlak Tasawuf & Pembinaan Karakter',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    presenceScore: 100.0,
    assignmentScore: 92.0,
    quizScore: 90.0,
    midtermScore: 94.0,
    finalExamScore: 95.0,
    finalScore: 93.90,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-203',
    courseId: 'crs-mku103',
    courseCode: 'MKU-103',
    courseName: 'Pancasila & Kewarganegaraan',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Prof. Dr. H. Maksum, M.A',
    lecturerNidn: '2101016501',
    presenceScore: 90.0,
    assignmentScore: 86.0,
    quizScore: 84.0,
    midtermScore: 88.0,
    finalExamScore: 89.0,
    finalScore: 87.50,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-204',
    courseId: 'crs-pai110',
    courseCode: 'PAI-110',
    courseName: 'Ilmu Kalam & Teologi Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 86.0,
    midtermScore: 86.0,
    finalExamScore: 90.0,
    finalScore: 88.00,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-205',
    courseId: 'crs-mku102',
    courseCode: 'MKU-102',
    courseName: 'Bahasa Indonesia Akademik',
    credits: 2,
    className: 'Kelas A',
    lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
    lecturerNidn: '2108117901',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 90.0,
    finalExamScore: 92.0,
    finalScore: 90.80,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 8.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-206',
    courseId: 'crs-mku106',
    courseCode: 'MKU-106',
    courseName: 'Literasi Digital & Teknologi Informasi',
    credits: 2,
    className: 'Kelas A',
    lecturerName: 'M. Syarifuddin, M.Kom',
    lecturerNidn: '2120028601',
    presenceScore: 100.0,
    assignmentScore: 95.0,
    quizScore: 92.0,
    midtermScore: 94.0,
    finalExamScore: 95.0,
    finalScore: 94.80,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 8.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-207',
    courseId: 'crs-pai111',
    courseCode: 'PAI-111',
    courseName: 'Pengantar Manajemen Pendidikan Islam',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 90.0,
    assignmentScore: 85.0,
    quizScore: 84.0,
    midtermScore: 86.0,
    finalExamScore: 88.0,
    finalScore: 86.50,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 11.25,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  }
];

// Data Mock Semester 1
const SEMESTER_1_GRADES: KhsGradeItem[] = [
  {
    id: 'grd-101',
    courseId: 'crs-pai101',
    courseCode: 'PAI-101',
    courseName: 'Studi Al-Quran & Tajwid Terapan',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 90.0,
    midtermScore: 92.0,
    finalExamScore: 94.0,
    finalScore: 92.20,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-102',
    courseId: 'crs-pai102',
    courseCode: 'PAI-102',
    courseName: 'Studi Hadits & Membaca Kitab Kuning',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 90.0,
    assignmentScore: 88.0,
    quizScore: 85.0,
    midtermScore: 88.0,
    finalExamScore: 90.0,
    finalScore: 88.35,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  },
  {
    id: 'grd-103',
    courseId: 'crs-mku101',
    courseCode: 'MKU-101',
    courseName: 'Pengantar Studi Islam & Keittihadan',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 100.0,
    assignmentScore: 94.0,
    quizScore: 92.0,
    midtermScore: 95.0,
    finalExamScore: 96.0,
    finalScore: 95.15,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-104',
    courseId: 'crs-mku107',
    courseCode: 'MKU-107',
    courseName: 'Filsafat Umum & Logika',
    credits: 2,
    className: 'Kelas A',
    lecturerName: 'Prof. Dr. H. Maksum, M.A',
    lecturerNidn: '2101016501',
    presenceScore: 90.0,
    assignmentScore: 85.0,
    quizScore: 82.0,
    midtermScore: 85.0,
    finalExamScore: 88.0,
    finalScore: 85.95,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 7.50,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-105',
    courseId: 'crs-mku108',
    courseCode: 'MKU-108',
    courseName: 'Bahasa Arab Dasar (Nahwu & Sharaf)',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    presenceScore: 95.0,
    assignmentScore: 90.0,
    quizScore: 88.0,
    midtermScore: 90.0,
    finalExamScore: 92.0,
    finalScore: 90.80,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-106',
    courseId: 'crs-mku109',
    courseCode: 'MKU-109',
    courseName: 'Bahasa Inggris Dasar',
    credits: 2,
    className: 'Kelas A',
    lecturerName: 'Dr. Hj. Nurul Hidayati, M.Pd',
    lecturerNidn: '2108117901',
    presenceScore: 90.0,
    assignmentScore: 86.0,
    quizScore: 85.0,
    midtermScore: 88.0,
    finalExamScore: 89.0,
    finalScore: 87.40,
    letterGrade: 'A-',
    gradePoint: 3.75,
    qualityPoints: 7.50,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_INSTITUSI'
  },
  {
    id: 'grd-107',
    courseId: 'crs-pai112',
    courseCode: 'PAI-112',
    courseName: 'Ushul Tarbiyah & Karakter Islami',
    credits: 3,
    className: 'Kelas A',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    presenceScore: 95.0,
    assignmentScore: 92.0,
    quizScore: 90.0,
    midtermScore: 92.0,
    finalExamScore: 94.0,
    finalScore: 92.70,
    letterGrade: 'A',
    gradePoint: 4.00,
    qualityPoints: 12.00,
    isPassed: true,
    status: 'DITERBITKAN',
    courseCategory: 'WAJIB_PRODI'
  }
];

export class KhsService {
  /**
   * Mengambil daftar semester yang telah ditempuh oleh mahasiswa
   */
  getAvailableSemesters(_studentId: string = 'usr-mhs-01'): Array<{
    id: string;
    name: string;
    semesterNumber: number;
    academicYear: string;
    isCurrent: boolean;
  }> {
    return [
      { id: 'sem-20261', name: 'Semester 5 (2026/2027 Ganjil)', semesterNumber: 5, academicYear: '2026/2027 Ganjil', isCurrent: true },
      { id: 'sem-20252', name: 'Semester 4 (2025/2026 Genap)', semesterNumber: 4, academicYear: '2025/2026 Genap', isCurrent: false },
      { id: 'sem-20251', name: 'Semester 3 (2025/2026 Ganjil)', semesterNumber: 3, academicYear: '2025/2026 Ganjil', isCurrent: false },
      { id: 'sem-20242', name: 'Semester 2 (2024/2025 Genap)', semesterNumber: 2, academicYear: '2024/2025 Genap', isCurrent: false },
      { id: 'sem-20241', name: 'Semester 1 (2024/2025 Ganjil)', semesterNumber: 1, academicYear: '2024/2025 Ganjil', isCurrent: false }
    ];
  }

  /**
   * Mengambil data Kartu Hasil Studi (KHS) spesifik per semester
   */
  getStudentKhs(
    studentId: string = 'usr-mhs-01',
    semesterId: string = 'sem-20261'
  ): KhsSemesterData {
    let grades: KhsGradeItem[] = SEMESTER_5_GRADES;
    let semesterNumber = 5;
    let academicPeriodName = 'Tahun Akademik 2026/2027 Ganjil';
    let academicYear = '2026/2027';
    let semesterType: 'Ganjil' | 'Genap' = 'Ganjil';
    let publishedDate = '17 Agustus 2026';
    let advisorNotes = 'Prestasi akademik sangat membanggakan dengan IPS 3.89. Dipertahankan prestasinya dan dapat mengambil beban maksimal 24 SKS untuk persiapan proposal skripsi pada semester berikutnya.';

    if (semesterId === 'sem-20252') {
      grades = SEMESTER_4_GRADES;
      semesterNumber = 4;
      academicPeriodName = 'Tahun Akademik 2025/2026 Genap';
      academicYear = '2025/2026';
      semesterType = 'Genap';
      publishedDate = '15 Februari 2026';
      advisorNotes = 'Capaian pemahaman teori dan praktikum pendidikan sangat memuaskan.';
    } else if (semesterId === 'sem-20251') {
      grades = SEMESTER_3_GRADES;
      semesterNumber = 3;
      academicPeriodName = 'Tahun Akademik 2025/2026 Ganjil';
      academicYear = '2025/2026';
      semesterType = 'Ganjil';
      publishedDate = '18 Agustus 2025';
      advisorNotes = 'Konsisten aktif dalam diskusi kelas dan penugasan terstruktur.';
    } else if (semesterId === 'sem-20242') {
      grades = SEMESTER_2_GRADES;
      semesterNumber = 2;
      academicPeriodName = 'Tahun Akademik 2024/2025 Genap';
      academicYear = '2024/2025';
      semesterType = 'Genap';
      publishedDate = '20 Februari 2025';
      advisorNotes = 'Kemampuan analisis fikih dan bahasa meningkat secara signifikan.';
    } else if (semesterId === 'sem-20241') {
      grades = SEMESTER_1_GRADES;
      semesterNumber = 1;
      academicPeriodName = 'Tahun Akademik 2024/2025 Ganjil';
      academicYear = '2024/2025';
      semesterType = 'Ganjil';
      publishedDate = '22 Agustus 2024';
      advisorNotes = 'Awal perkuliahan yang sangat baik dan adaptif terhadap iklim akademik kampus.';
    }

    // Perhitungan Total SKS dan IPS
    let totalCreditsEnrolled = 0;
    let totalCreditsPassed = 0;
    let totalQualityPoints = 0;

    grades.forEach((g) => {
      totalCreditsEnrolled += g.credits;
      if (g.isPassed) {
        totalCreditsPassed += g.credits;
      }
      totalQualityPoints += g.qualityPoints;
    });

    const semesterGpa = totalCreditsEnrolled > 0 
      ? parseFloat((totalQualityPoints / totalCreditsEnrolled).toFixed(2)) 
      : 0.00;

    // Nilai Kumulatif
    let cumulativeGpa = 3.91;
    let totalCumulativeCredits = 100;

    if (semesterNumber === 1) {
      cumulativeGpa = semesterGpa;
      totalCumulativeCredits = totalCreditsPassed;
    } else if (semesterNumber === 2) {
      cumulativeGpa = 3.90;
      totalCumulativeCredits = 38;
    } else if (semesterNumber === 3) {
      cumulativeGpa = 3.93;
      totalCumulativeCredits = 58;
    } else if (semesterNumber === 4) {
      cumulativeGpa = 3.90;
      totalCumulativeCredits = 79;
    } else if (semesterNumber === 5) {
      cumulativeGpa = 3.91;
      totalCumulativeCredits = 100;
    }

    const maxCreditNextSemester = calculateMaxCreditsByGpa(semesterGpa);
    const academicStanding = getAcademicStanding(cumulativeGpa);
    const verificationCode = `SALAM-KHS-${studentId.toUpperCase()}-${semesterNumber}-${Date.now().toString(36).toUpperCase()}`;

    return {
      id: `khs-${semesterNumber}-${studentId}`,
      semesterId,
      semesterNumber,
      academicPeriodName,
      academicYear,
      semesterType,
      studentId,
      studentName: 'Ahmad Fauzi',
      studentNim: '21.01.0042',
      studyProgram: 'Pendidikan Agama Islam (PAI)',
      studyProgramCode: 'PAI',
      academicDegree: 'Sarjana Pendidikan (S.Pd.)',
      academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
      academicAdvisorNidn: '2112087501',
      headOfStudyProgramName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
      headOfStudyProgramNidn: '2105088201',
      totalCreditsEnrolled,
      totalCreditsPassed,
      semesterGpa,
      cumulativeGpa,
      totalCumulativeCredits,
      maxCreditNextSemester,
      academicStanding,
      advisorNotes,
      verificationCode,
      publishedDate,
      grades
    };
  }

  /**
   * Mengambil histori tren capaian belajar semester ke semester (Tren IPS & IPK)
   */
  getPerformanceTrend(_studentId: string = 'usr-mhs-01'): KhsPerformanceTrend[] {
    return [
      { semester: 'Sem 1', semesterNumber: 1, ips: 3.93, ipk: 3.93, sksTaken: 19, sksPassed: 19 },
      { semester: 'Sem 2', semesterNumber: 2, ips: 3.88, ipk: 3.90, sksTaken: 19, sksPassed: 19 },
      { semester: 'Sem 3', semesterNumber: 3, ips: 3.96, ipk: 3.93, sksTaken: 20, sksPassed: 20 },
      { semester: 'Sem 4', semesterNumber: 4, ips: 3.86, ipk: 3.90, sksTaken: 21, sksPassed: 21 },
      { semester: 'Sem 5', semesterNumber: 5, ips: 3.89, ipk: 3.91, sksTaken: 21, sksPassed: 21 }
    ];
  }

  /**
   * Mengambil transkrip nilai akademik lengkap dari semester awal sampai akhir
   */
  getFullTranscript(studentId: string = 'usr-mhs-01'): StudentTranscriptSummary {
    const groups: KhsTranscriptGroup[] = [
      {
        semesterNumber: 1,
        academicPeriodName: 'Semester 1 (2024/2025 Ganjil)',
        academicYear: '2024/2025',
        semesterGpa: 3.93,
        cumulativeGpa: 3.93,
        totalCredits: 19,
        courses: SEMESTER_1_GRADES
      },
      {
        semesterNumber: 2,
        academicPeriodName: 'Semester 2 (2024/2025 Genap)',
        academicYear: '2024/2025',
        semesterGpa: 3.88,
        cumulativeGpa: 3.90,
        totalCredits: 19,
        courses: SEMESTER_2_GRADES
      },
      {
        semesterNumber: 3,
        academicPeriodName: 'Semester 3 (2025/2026 Ganjil)',
        academicYear: '2025/2026',
        semesterGpa: 3.96,
        cumulativeGpa: 3.93,
        totalCredits: 20,
        courses: SEMESTER_3_GRADES
      },
      {
        semesterNumber: 4,
        academicPeriodName: 'Semester 4 (2025/2026 Genap)',
        academicYear: '2025/2026',
        semesterGpa: 3.86,
        cumulativeGpa: 3.90,
        totalCredits: 21,
        courses: SEMESTER_4_GRADES
      },
      {
        semesterNumber: 5,
        academicPeriodName: 'Semester 5 (2026/2027 Ganjil)',
        academicYear: '2026/2027',
        semesterGpa: 3.89,
        cumulativeGpa: 3.91,
        totalCredits: 21,
        courses: SEMESTER_5_GRADES
      }
    ];

    let totalCreditsEarned = 0;
    let totalQualityPoints = 0;

    groups.forEach((grp) => {
      grp.courses.forEach((c) => {
        if (c.isPassed) {
          totalCreditsEarned += c.credits;
          totalQualityPoints += c.qualityPoints;
        }
      });
    });

    const cumulativeGpa = totalCreditsEarned > 0 
      ? parseFloat((totalQualityPoints / totalCreditsEarned).toFixed(2)) 
      : 0.00;

    return {
      studentId,
      studentName: 'Ahmad Fauzi',
      studentNim: '21.01.0042',
      studyProgram: 'Pendidikan Agama Islam (PAI)',
      studyProgramCode: 'PAI',
      academicDegree: 'Sarjana Pendidikan (S.Pd.)',
      entryYear: '2024',
      totalCreditsEarned,
      totalQualityPoints: parseFloat(totalQualityPoints.toFixed(2)),
      cumulativeGpa,
      academicStanding: getAcademicStanding(cumulativeGpa),
      verificationCode: `SALAM-TRANSKRIP-${studentId.toUpperCase()}-VERIFIED`,
      groups
    };
  }

  /**
   * Helper untuk mengunduh / memicu pencetakan KHS resmi
   */
  printKhsDocument(): void {
    window.print();
  }
}

export const khsService = new KhsService();
