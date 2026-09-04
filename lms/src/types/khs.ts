/**
 * Tipe Data untuk Modul Kartu Hasil Studi (KHS) & Transkrip Akademik Mahasiswa
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export type LetterGrade = 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'D' | 'E';

export type KhsStatus = 'DITERBITKAN' | 'DIKUNCI' | 'FINALISASI' | 'DRAF';

export interface KhsGradeItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  className: string;
  lecturerName: string;
  lecturerNidn: string;
  presenceScore: number;     // Bobot 10%
  assignmentScore: number;   // Bobot 20%
  quizScore: number;         // Bobot 15%
  midtermScore: number;      // Bobot 25%
  finalExamScore: number;    // Bobot 30%
  finalScore: number;        // Nilai Akhir (0 - 100)
  letterGrade: LetterGrade;  // Huruf Mutu (A, A-, B+, dst)
  gradePoint: number;        // Bobot Mutu (4.00, 3.75, 3.50, dst)
  qualityPoints: number;     // SKS x Bobot (Quality Points / SKSN)
  isPassed: boolean;         // Kelulusan (gradePoint >= 2.00)
  status: KhsStatus;
  feedback?: string;         // Umpan balik & catatan evaluasi dosen
  courseCategory: 'WAJIB_PRODI' | 'WAJIB_INSTITUSI' | 'PILIHAN';
}

export interface KhsSemesterData {
  id: string;
  semesterId: string;
  semesterNumber: number;
  academicPeriodName: string;
  academicYear: string;
  semesterType: 'Ganjil' | 'Genap';
  studentId: string;
  studentName: string;
  studentNim: string;
  studyProgram: string;
  studyProgramCode: string;
  academicDegree: string;
  academicAdvisorName: string;
  academicAdvisorNidn: string;
  headOfStudyProgramName: string;
  headOfStudyProgramNidn: string;
  totalCreditsEnrolled: number;
  totalCreditsPassed: number;
  semesterGpa: number;              // Indeks Prestasi Semester (IPS)
  cumulativeGpa: number;            // Indeks Prestasi Kumulatif (IPK)
  totalCumulativeCredits: number;   // Total SKS Kumulatif Lulus
  maxCreditNextSemester: number;    // Beban SKS Maksimum Semester Depan (berdasarkan IPS)
  academicStanding: string;         // Predikat Prestasi: 'Dengan Pujian (Cumlaude)', 'Sangat Memuaskan', 'Memuaskan'
  advisorNotes?: string;            // Catatan pembinaan dari Dosen PA
  verificationCode: string;         // Kode verifikasi & otentikasi digital KHS
  publishedDate: string;
  grades: KhsGradeItem[];
}

export interface KhsTranscriptGroup {
  semesterNumber: number;
  academicPeriodName: string;
  academicYear: string;
  semesterGpa: number;
  cumulativeGpa: number;
  totalCredits: number;
  courses: KhsGradeItem[];
}

export interface KhsPerformanceTrend {
  semester: string;
  semesterNumber: number;
  ips: number;
  ipk: number;
  sksTaken: number;
  sksPassed: number;
}

export interface StudentTranscriptSummary {
  studentId: string;
  studentName: string;
  studentNim: string;
  studyProgram: string;
  studyProgramCode: string;
  academicDegree: string;
  entryYear: string;
  totalCreditsEarned: number;
  totalQualityPoints: number;
  cumulativeGpa: number;
  academicStanding: string;
  verificationCode: string;
  groups: KhsTranscriptGroup[];
}
