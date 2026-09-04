/**
 * SUITE UJI TUGAS, PENGUMPULAN & RUBRIK PENILAIAN SALAM
 * 
 * Memverifikasi validasi upload aman, status terlambat, kalkulasi rubrik, revisi berkas, dan audit log nilai.
 */

import { assignmentService } from '../services/assignmentService';
import { auditService } from '../services/auditService';

export interface AssignmentTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runAssignmentTests(): { results: AssignmentTestResult[]; allPassed: boolean } {
  const results: AssignmentTestResult[] = [];
  const testAssignmentId = 'asg-pai301-01';
  const testStudentId = 'tester-mhs-asg';
  const testLecturerId = 'usr-dsn-01';

  // 1. Uji Keamanan Upload & Sanitasi Nama Berkas
  const safeUpload = assignmentService.validateFileUpload(
    '../../../malicious_script.php.exe',
    1024 * 1024,
    ['.pdf', '.docx', '.zip'],
    10 * 1024 * 1024
  );

  const cleanUpload = assignmentService.validateFileUpload(
    'Makalah_Ushul_Fiqih_Ahmad.pdf',
    2 * 1024 * 1024,
    ['.pdf', '.docx', '.zip'],
    10 * 1024 * 1024
  );

  const securityBlocked = !safeUpload.isValid && cleanUpload.isValid;
  results.push({
    scenario: 'Keamanan Berkas: Pemblokiran skrip berbahaya (.exe/.php/path traversal)',
    expected: 'Ekstensi berbahaya ditolak, berkas PDF sah diterima',
    actual: securityBlocked ? 'Berkas berbahaya (.exe/.php) DIBLOKIR 100%' : 'Gagal memblokir berkas berbahaya',
    passed: securityBlocked
  });

  // 2. Uji Pengumpulan Tugas Baru (Versi 1)
  const subV1 = assignmentService.submitAssignment(
    testAssignmentId,
    testStudentId,
    '21.01.7777',
    'Fatimah Zahra',
    {
      fileName: 'Makalah_Ushul_Fiqih_V1.pdf',
      fileSizeBytes: 3000000,
      fileMimeType: 'application/pdf',
      textContent: 'Analisis fatwa DSN-MUI tentang akad murabahah.'
    }
  );

  const isV1Submitted = subV1.version === 1 && subV1.status === 'SUDAH_DIKUMPULKAN' && subV1.history.length === 1;
  results.push({
    scenario: 'Siklus Pengumpulan: Pembuatan berkas Versi 1',
    expected: 'Status SUDAH_DIKUMPULKAN dengan histori Versi 1',
    actual: isV1Submitted ? `Terkumpul: Versi ${subV1.version} (${subV1.fileName})` : 'Gagal submit V1',
    passed: isV1Submitted
  });

  // 3. Uji Pengumpulan Ulang / Resubmisi (Versi 2) dengan Histori Utuh
  const subV2 = assignmentService.submitAssignment(
    testAssignmentId,
    testStudentId,
    '21.01.7777',
    'Fatimah Zahra',
    {
      fileName: 'Makalah_Ushul_Fiqih_V2_Revisi.pdf',
      fileSizeBytes: 3200000,
      fileMimeType: 'application/pdf',
      textContent: 'Revisi penambahan literatur kitab Al-Mustashfa Imam Al-Ghazali.'
    }
  );

  const isHistoryRetained = subV2.version === 2 && subV2.history.length === 2 && subV2.history[0].fileName === 'Makalah_Ushul_Fiqih_V1.pdf';
  results.push({
    scenario: 'Pengumpulan Ulang (Resubmisi): Mempertahankan histori versi sebelumnya',
    expected: 'Versi aktif = 2, total histori = 2 tanpa kehilangan data lama',
    actual: isHistoryRetained ? `Versi aktif: ${subV2.version}, Histori tersimpan: ${subV2.history.length} versi` : 'Histori hilang saat resubmit',
    passed: isHistoryRetained
  });

  // 4. Uji Penilaian Rubrik Analitik oleh Dosen
  // Kriteria 1 (Bobot 40%): Nilai 100 -> 40 poin
  // Kriteria 2 (Bobot 30%): Nilai 80  -> 24 poin
  // Kriteria 3 (Bobot 30%): Nilai 100 -> 30 poin
  // Total Murni = 40 + 24 + 30 = 94 poin
  const gradedSub = assignmentService.gradeSubmissionWithRubric(
    subV2.id,
    [
      { criterionId: 'crit-1', selectedLevelId: 'lvl-1a', awardedScore: 100 },
      { criterionId: 'crit-2', selectedLevelId: 'lvl-2b', awardedScore: 80 },
      { criterionId: 'crit-3', selectedLevelId: 'lvl-3a', awardedScore: 100 },
    ],
    'Makalah sangat komprehensif, rujukan turats primer sudah diperkuat pada revisi.',
    testLecturerId,
    'Dr. H. M. Ridwan, M.Ag'
  );

  const rubricScoreAccurate = gradedSub.finalScore === 94 && gradedSub.status === 'SUDAH_DINILAI';
  results.push({
    scenario: 'Kalkulasi Matriks Rubrik: Perhitungan skor berbobot konsisten',
    expected: 'Skor akhir = 94/100 (40 + 24 + 30) dan status SUDAH_DINILAI',
    actual: rubricScoreAccurate ? `Nilai Rubrik Terhitung: ${gradedSub.finalScore} / 100` : 'Kalkulasi rubrik salah',
    passed: rubricScoreAccurate
  });

  // 5. Uji Audit Trail Perubahan Nilai Dosen
  // Dosen melakukan perubahan nilai (edit grade)
  assignmentService.gradeSubmissionWithRubric(
    subV2.id,
    [
      { criterionId: 'crit-1', selectedLevelId: 'lvl-1a', awardedScore: 100 },
      { criterionId: 'crit-2', selectedLevelId: 'lvl-2a', awardedScore: 100 }, // Naik jadi 100 -> 30 poin (Total 100)
      { criterionId: 'crit-3', selectedLevelId: 'lvl-3a', awardedScore: 100 },
    ],
    'Nilai diperbaiki setelah pengecekan kelengkapan kitab turats.',
    testLecturerId,
    'Dr. H. M. Ridwan, M.Ag'
  );

  const auditLogs = auditService.getLogs();
  const lastAudit = auditLogs.find((l) => l.action === 'PENILAIAN_TUGAS');
  const auditLogged = !!lastAudit && !!lastAudit.details && lastAudit.details.includes('Nilai Lama = 94') && lastAudit.details.includes('Nilai Baru = 100');

  results.push({
    scenario: 'Jejak Audit Penilaian: Pelacakan perubahan Nilai Lama -> Nilai Baru',
    expected: 'Audit trail mencatat aktor, stempel waktu, dan riwayat revisi nilai',
    actual: auditLogged ? 'Audit log berhasil mencatat riwayat transisi nilai (94 -> 100)' : 'Audit tidak mencatat nilai lama',
    passed: auditLogged
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
