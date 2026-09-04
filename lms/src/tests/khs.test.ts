import { 
  calculateLetterGradeAndPoint, 
  calculateMaxCreditsByGpa, 
  getAcademicStanding,
  khsService 
} from '../services/khsService';

export interface KhsTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runKhsTests(): { results: KhsTestResult[]; allPassed: boolean } {
  const results: KhsTestResult[] = [];

  // Test 1: Konversi Skor Angka ke Huruf Mutu A (>= 88.0)
  const gradeA = calculateLetterGradeAndPoint(92.5);
  results.push({
    scenario: 'Konversi Nilai Angka 92.5 ke Huruf Mutu Standar STAI Al-Ittihad',
    expected: 'Huruf A, Bobot 4.00',
    actual: `Huruf ${gradeA.letter}, Bobot ${gradeA.point.toFixed(2)}`,
    passed: gradeA.letter === 'A' && gradeA.point === 4.00
  });

  // Test 2: Konversi Skor Angka ke Huruf Mutu B+ (80.0 - 83.99)
  const gradeBPlus = calculateLetterGradeAndPoint(82.0);
  results.push({
    scenario: 'Konversi Nilai Angka 82.0 ke Huruf Mutu B+',
    expected: 'Huruf B+, Bobot 3.50',
    actual: `Huruf ${gradeBPlus.letter}, Bobot ${gradeBPlus.point.toFixed(2)}`,
    passed: gradeBPlus.letter === 'B+' && gradeBPlus.point === 3.50
  });

  // Test 3: Aturan Beban Maksimal SKS Semester Depan (IPS >= 3.50 -> 24 SKS)
  const maxSksCumlaude = calculateMaxCreditsByGpa(3.89);
  results.push({
    scenario: 'Beban Maksimum SKS Semester Berikutnya untuk Mahasiswa IPS 3.89',
    expected: '24 SKS',
    actual: `${maxSksCumlaude} SKS`,
    passed: maxSksCumlaude === 24
  });

  // Test 4: Aturan Beban Maksimal SKS untuk IPS 3.20 (22 SKS)
  const maxSksGood = calculateMaxCreditsByGpa(3.20);
  results.push({
    scenario: 'Beban Maksimum SKS Semester Berikutnya untuk Mahasiswa IPS 3.20',
    expected: '22 SKS',
    actual: `${maxSksGood} SKS`,
    passed: maxSksGood === 22
  });

  // Test 5: Predikat Prestasi Akademik untuk IPK >= 3.75
  const standingCumlaude = getAcademicStanding(3.91);
  results.push({
    scenario: 'Predikat Yudisium / Prestasi Akademik untuk IPK 3.91',
    expected: 'Dengan Pujian (Cumlaude)',
    actual: standingCumlaude,
    passed: standingCumlaude === 'Dengan Pujian (Cumlaude)'
  });

  // Test 6: Perhitungan Akurat KHS Mahasiswa Semester 5 Aktif
  const khsSem5 = khsService.getStudentKhs('usr-mhs-01', 'sem-20261');
  const expectedTotalCredits = 21;
  const isGpaCorrect = khsSem5.semesterGpa >= 3.85 && khsSem5.semesterGpa <= 3.95;
  results.push({
    scenario: 'Perhitungan Otomatis IPS & Beban SKS Semester 5 Aktif Mahasiswa',
    expected: `Total ${expectedTotalCredits} SKS, IPS ~3.89, Lulus 100%`,
    actual: `Total ${khsSem5.totalCreditsEnrolled} SKS, IPS ${khsSem5.semesterGpa.toFixed(2)}, Lulus ${khsSem5.totalCreditsPassed} SKS`,
    passed: khsSem5.totalCreditsEnrolled === expectedTotalCredits && isGpaCorrect && khsSem5.totalCreditsPassed === expectedTotalCredits
  });

  // Test 7: Integritas Transkrip Nilai Kumulatif 5 Semester
  const fullTranscript = khsService.getFullTranscript('usr-mhs-01');
  results.push({
    scenario: 'Integritas Rekapitulasi Transkrip Kumulatif (Semester 1 s.d. 5)',
    expected: '5 Kelompok Semester, Total SKS >= 100 SKS, IPK >= 3.85',
    actual: `${fullTranscript.groups.length} Semester, Total ${fullTranscript.totalCreditsEarned} SKS, IPK ${fullTranscript.cumulativeGpa.toFixed(2)}`,
    passed: fullTranscript.groups.length === 5 && fullTranscript.totalCreditsEarned >= 100 && fullTranscript.cumulativeGpa >= 3.85
  });

  // Test 8: Kode Otentikasi Digital KHS SIAKAD
  const hasDigitalVerification = khsSem5.verificationCode.startsWith('SALAM-KHS-');
  results.push({
    scenario: 'Validasi Format Kode Otentikasi Digital KHS Resmi',
    expected: 'Memiliki prefix SALAM-KHS- dan identifier unik mahasiswa',
    actual: khsSem5.verificationCode,
    passed: hasDigitalVerification
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
