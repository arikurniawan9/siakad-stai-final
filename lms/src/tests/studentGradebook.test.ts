import { studentGradebookService } from '../services/studentGradebookService';

export interface StudentGradebookTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runStudentGradebookTests(): { results: StudentGradebookTestResult[]; allPassed: boolean } {
  const results: StudentGradebookTestResult[] = [];

  // Test 1: Mengambil Buku Nilai Mahasiswa Semester Aktif
  const gradebook = studentGradebookService.getStudentGradebook('usr-mhs-01');
  results.push({
    scenario: 'Kelengkapan Buku Nilai Mata Kuliah Terdaftar Mahasiswa Aktif',
    expected: 'Memiliki minimal 7 mata kuliah aktif dengan rincian komponen',
    actual: `${gradebook.length} Mata Kuliah Terdaftar`,
    passed: gradebook.length >= 7
  });

  // Test 2: Formula Kalkulasi Skor Berjalan PAI-301
  const paiCourse = gradebook.find((c) => c.courseCode === 'PAI-301');
  const expectedPaiScore = 92.20;
  const isPaiScoreCorrect = paiCourse ? Math.abs(paiCourse.currentCalculatedScore - expectedPaiScore) < 0.05 : false;
  results.push({
    scenario: 'Kalkulasi Skor Berjalan PAI-301 (Presensi 10% + Tugas 20% + Kuis 15% + UTS 25% + UAS 30%)',
    expected: `Skor ${expectedPaiScore} (Huruf Mutu A)`,
    actual: `Skor ${paiCourse?.currentCalculatedScore} (Huruf Mutu ${paiCourse?.projectedLetterGrade})`,
    passed: isPaiScoreCorrect && paiCourse?.projectedLetterGrade === 'A'
  });

  // Test 3: Simulator Target Nilai What-If Analysis (Target Huruf Mutu A)
  if (paiCourse) {
    const simA = studentGradebookService.simulateTargetGrade(paiCourse, 'A');
    results.push({
      scenario: 'Simulator Target Nilai (What-If): Perhitungan Skor UAS untuk Target Nilai A',
      expected: 'Skor UAS yang dibutuhkan dapat dihitung dan bernilai realistis (<= 100)',
      actual: `Skor UAS diperlukan: ${simA.requiredFinalExamScore}, Status Tercapai: ${simA.isAchievable}`,
      passed: simA.requiredFinalExamScore >= 0 && simA.requiredFinalExamScore <= 100 && simA.isAchievable
    });
  }

  // Test 4: Simulasi Target Nilai yang Membutuhkan Skor Melebihi 100
  if (paiCourse) {
    // Buat simulasi dengan skor tugas dan UTS rendah
    const lowScoresCourse = { ...paiCourse, presenceScore: 60, assignmentScore: 60, quizScore: 60, midtermScore: 60 };
    const simImpossible = studentGradebookService.simulateTargetGrade(lowScoresCourse, 'A');
    results.push({
      scenario: 'Simulator Target Nilai: Deteksi Target Tidak Realistis (Skor UAS > 100)',
      expected: 'isAchievable = false saat skor UAS yang dibutuhkan melebihi 100',
      actual: `Skor UAS diperlukan: ${simImpossible.requiredFinalExamScore}, isAchievable: ${simImpossible.isAchievable}`,
      passed: !simImpossible.isAchievable && simImpossible.requiredFinalExamScore > 100
    });
  }

  // Test 5: Pengajuan Permohonan Klarifikasi / Sanggah Nilai
  const newInquiry = studentGradebookService.submitGradeInquiry({
    classId: 'cls-pai301-a',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    assessmentItemId: 'asg-01',
    assessmentTitle: 'Makalah Analisis Kaidah',
    studentId: 'usr-mhs-01',
    studentName: 'Ahmad Fauzi',
    studentNim: '21.01.0042',
    currentScore: 92.0,
    reasonCategory: 'KETIDAKSESUAIAN_RUBRIK',
    inquiryMessage: 'Uji integrasi sistem klarifikasi nilai otomatis'
  });

  results.push({
    scenario: 'Pengajuan Tiket Sanggahan & Klarifikasi Nilai Mahasiswa ke Dosen',
    expected: 'Tiket berhasil dibuat dengan status MENUNGGU_TINJAUAN',
    actual: `ID: ${newInquiry.id}, Status: ${newInquiry.status}`,
    passed: newInquiry.id.startsWith('inq-') && newInquiry.status === 'MENUNGGU_TINJAUAN'
  });

  // Test 6: Agregasi Umpan Balik Kualitatif Dosen Pengampu
  const feedbackList = studentGradebookService.getAllLecturerFeedback('usr-mhs-01');
  results.push({
    scenario: 'Agregasi Terpusat Seluruh Catatan & Umpan Balik Kualitatif Dosen',
    expected: 'Memuat kumpulan catatan umpan balik dari berbagai aktivitas',
    actual: `${feedbackList.length} Catatan Umpan Balik Dosen Ditemukan`,
    passed: feedbackList.length > 0
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
