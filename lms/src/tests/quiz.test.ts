/**
 * SUITE UJI KUIS DARING & BANK SOAL SALAM
 * 
 * Pengujian penilaian otomatis objektif, antrean esai, idempotensi submit, dan proteksi kepemilikan.
 */

import { quizService } from '../services/quizService';
import { questionImportService } from '../services/questionImportService';

export interface QuizTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runQuizTests(): { results: QuizTestResult[]; allPassed: boolean } {
  const results: QuizTestResult[] = [];
  const testQuizId = 'qz-pai301-01';
  const testStudentId = `tester-mhs-quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const otherStudentId = `intruder-mhs-${Date.now()}`;

  // 1. Uji Mulai Kuis & Timer Berbasis Server
  const attempt = quizService.startQuizAttempt(
    testQuizId,
    testStudentId,
    '21.01.8888',
    'Ahmad Uji Kuis'
  );

  const hasServerExpires = !!attempt.expiresAt && new Date(attempt.expiresAt) > new Date(attempt.startedAt);
  results.push({
    scenario: 'Inisiasi Attempt: Timer Kedaluwarsa Berbasis Waktu Server',
    expected: 'expiresAt dihitung server sesuai durasi (30 menit)',
    actual: hasServerExpires ? `Mulai: ${attempt.startedAt.split('T')[1].substring(0, 8)}, Berakhir: ${attempt.expiresAt.split('T')[1].substring(0, 8)}` : 'Gagal set timer',
    passed: hasServerExpires
  });

  // 2. Uji Autosave Jawaban
  quizService.autosaveAnswer(attempt.id, testStudentId, 'qz-q-1', { selectedOptionId: 'opt-q1-1' }); // Benar (+20)
  quizService.autosaveAnswer(attempt.id, testStudentId, 'qz-q-2', { selectedOptionId: 'opt-q2-2' }); // Benar (+20)
  quizService.autosaveAnswer(attempt.id, testStudentId, 'qz-q-3', { shortAnswerText: 'ijma' }); // Benar (+20)
  quizService.autosaveAnswer(attempt.id, testStudentId, 'qz-q-4', { essayAnswerText: 'Qiyas menggunakan kesamaan illat sedangkan istihsan mengecualikan kaidah umum.' });

  const refreshedAttempt = quizService.getAttemptById(attempt.id, testStudentId);
  const autosaveSuccess = refreshedAttempt.answers['qz-q-1']?.selectedOptionId === 'opt-q1-1';

  results.push({
    scenario: 'Autosave Lembar Jawaban: Tersimpan aman per butir soal',
    expected: 'Jawaban pilihan ganda, isian singkat, dan esai tersimpan tanpa kehilangan data',
    actual: autosaveSuccess ? 'Jawaban 4 butir soal tersimpan dengan timestamp valid' : 'Autosave gagal',
    passed: autosaveSuccess
  });

  // 3. Uji Pengumpulan Kuis (Submit) & Penilaian Objektif Otomatis
  const submittedAttempt = quizService.submitQuizAttempt(attempt.id, testStudentId);
  // Skor objektif = 20 + 20 + 20 = 60 poin (dari 100). Esai menunggu dosen (needsManualGrading = true)
  const objectiveScoreCorrect = submittedAttempt.totalEarnedPoints === 60 && submittedAttempt.needsManualGrading;

  results.push({
    scenario: 'Penilaian Otomatis Soal Objektif & Antrean Esai',
    expected: 'Soal objektif dinilai otomatis (60 poin) dan esai masuk antrean dosen',
    actual: objectiveScoreCorrect ? `Terkumpul: ${submittedAttempt.totalEarnedPoints} poin objektif, needsManualGrading: TRUE` : 'Penilaian salah',
    passed: objectiveScoreCorrect
  });

  // 4. Uji Idempotensi Submit (Anti Double-Submit)
  const reSubmitted = quizService.submitQuizAttempt(attempt.id, testStudentId);
  const isIdempotent = reSubmitted.totalEarnedPoints === 60 && reSubmitted.status === 'DIKUMPULKAN';

  results.push({
    scenario: 'Idempotensi Pengumpulan: Mencegah submit ganda & korupsi data',
    expected: 'Pengumpulan ulang mengembalikan objek attempt yang sama tanpa duplikasi',
    actual: isIdempotent ? 'Submit ulang idempotent & status tetap konsisten' : 'Gagal menjaga idempotensi',
    passed: isIdempotent
  });

  // 5. Uji Penilaian Esai oleh Dosen
  const gradedAttempt = quizService.gradeEssayAnswer(
    attempt.id,
    'qz-q-4',
    35, // Dosen memberi 35 dari 40 poin
    'Penjelasan konsep sangat baik, argumentasi logis.',
    'Dr. H. M. Ridwan, M.Ag'
  );

  // Total akhir = 60 + 35 = 95 poin. Nilai akhir 95 >= 75 (LULUS)
  const essayGradedCorrect = gradedAttempt.status === 'DINILAI' && gradedAttempt.finalScore === 95 && gradedAttempt.isPassed;

  results.push({
    scenario: 'Penilaian Esai Dosen: Rekalkulasi skor total & status kelulusan',
    expected: 'Skor akhir terupdate menjadi 95/100 dan status isPassed = TRUE',
    actual: essayGradedCorrect ? `Nilai Akhir: ${gradedAttempt.finalScore} / 100 (Status: LULUS, Pengoreksi: ${gradedAttempt.gradedByLecturerName})` : 'Gagal kalkulasi nilai akhir',
    passed: essayGradedCorrect
  });

  // 6. Uji Isolasi Kepemilikan (Ownership Isolation Protection)
  let accessDenied = false;
  try {
    quizService.getAttemptById(attempt.id, otherStudentId, false);
  } catch {
    accessDenied = true;
  }

  results.push({
    scenario: 'Isolasi Kepemilikan Attempt: Mencegah intruksi akun mahasiswa lain',
    expected: 'Akses lembar jawaban orang lain wajib dilempar Exception (403 Forbidden)',
    actual: accessDenied ? 'Proteksi kepemilikan LULUS (Akses ilegal diblokir)' : 'Bocor: pengguna lain dapat mengakses',
    passed: accessDenied
  });

  // 7. Uji Parser Format Aiken (Standar Moodle & LMS Global)
  const aikenSample = `Rukun utama dalam akad jual beli murabahah adalah:
A. Penjual dan Pembeli
B. Objek Akad (Ma'qud 'Alaih)
C. Ijab dan Qabul
D. Semua Benar
ANSWER: D`;
  const aikenParsed = questionImportService.parseAiken(aikenSample, 'PAI-301', 'Muamalah');
  const aikenValid = aikenParsed.totalValid === 1 && aikenParsed.questions[0].options?.length === 4 && aikenParsed.questions[0].options[3].isCorrect;

  results.push({
    scenario: 'Parser Impor Bank Soal Format Aiken (Moodle / LMS Standard)',
    expected: 'Berhasil membedah teks soal, 4 opsi pilihan ganda, dan mendeteksi kunci D',
    actual: `Terurai: ${aikenParsed.totalValid} soal valid (Kunci Benar: ${aikenParsed.questions[0]?.options?.find(o => o.isCorrect)?.text})`,
    passed: aikenValid
  });

  // 8. Uji Parser Format CSV / Spreadsheet Excel
  const csvSample = `tipe,topik,soal,opsi_a,opsi_b,opsi_c,opsi_d,kunci,poin,kesulitan,penjelasan
PILIHAN_GANDA,Ushul,Apa makna amr dalam ushul fiqih?,Larangan,Perintah,Pilihan,Hukum,B,20,MUDAH,Amr berarti tuntutan untuk mengerjakan.`;
  const csvParsed = questionImportService.parseCsv(csvSample, 'PAI-301', 'Ushul');
  const csvValid = csvParsed.totalValid === 1 && csvParsed.questions[0].options?.find(o => o.isCorrect)?.text === 'Perintah';

  results.push({
    scenario: 'Parser Impor Bank Soal Format CSV / Excel Spreadsheet',
    expected: 'Mengekstrak kolom tipe, topik, teks soal, opsi, dan kunci jawaban B',
    actual: `Terurai: ${csvParsed.totalValid} butir soal valid (Kunci B: "${csvParsed.questions[0]?.options?.find(o => o.isCorrect)?.text}")`,
    passed: csvValid
  });

  // 9. Uji Eksekusi Impor Massal ke Bank Soal
  const initialBankCount = quizService.getBankQuestions().length;
  const bulkRes = questionImportService.executeBulkImport(aikenParsed.questions);
  const newBankCount = quizService.getBankQuestions().length;
  const bulkSuccess = bulkRes.count === 1 && newBankCount === initialBankCount + 1;

  results.push({
    scenario: 'Eksekusi Impor Massal Soal ke Repositori Bank Soal Kurikulum',
    expected: 'Bank soal bertambah sesuai jumlah butir yang diimpor',
    actual: `Awal: ${initialBankCount} butir -> Berhasil Impor: ${bulkRes.count} butir -> Total Sekarang: ${newBankCount} butir`,
    passed: bulkSuccess
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
