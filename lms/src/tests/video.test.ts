/**
 * SUITE UJI VIDEO PEMBELAJARAN INTERAKTIF SALAM
 * 
 * Pengujian checkpoint pertanyaan, anti-cheat segmen tontonan, resume playback, dan completion rule.
 */

import { videoService } from '../services/videoService';

export interface VideoTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runVideoTests(): { results: VideoTestResult[]; allPassed: boolean } {
  const results: VideoTestResult[] = [];
  const testVideoId = 'vid-ushul-01';
  const testStudentId = 'tester-mhs-vid';

  // 1. Uji Kelengkapan Checkpoint Video
  const video = videoService.getVideoById(testVideoId);
  const hasCheckpoints = !!video && video.checkpoints.length >= 2;

  results.push({
    scenario: 'Kelengkapan Checkpoint: Titik Pertanyaan Timestamp Tersedia',
    expected: 'Video memiliki $\\ge 2$ titik checkpoint interaktif pada timestamp tertentu',
    actual: `${video?.checkpoints.length || 0} checkpoint terdaftar (Menit 01:00 & 03:00)`,
    passed: hasCheckpoints
  });

  // 2. Uji Anti-Cheat & Perhitungan Segmen Tontonan yang Sah
  // Simulasi: Klien mengirim pembaruan progres wajar (5 detik)
  videoService.updateStudentProgress(
    testVideoId,
    testStudentId,
    '21.01.9999',
    'Tester Mahasiswa',
    60,
    5
  );

  // Klien mencoba mengirim lonjakan instan tidak wajar (misal mengklaim 600 detik sekaligus)
  // Backend wajib melakukan clamping ke durasi aman
  const prog2 = videoService.updateStudentProgress(
    testVideoId,
    testStudentId,
    '21.01.9999',
    'Tester Mahasiswa',
    120,
    300 // Klaim 300 detik instan
  );

  const antiCheatActive = prog2.effectiveWatchedPercentage < 80; // Tidak boleh langsung 100%
  results.push({
    scenario: 'Proteksi Anti-Cheat: Mencegah manipulasi lonjakan progres instan',
    expected: 'Progres dihitung dari segmen unik yang tervalidasi di backend (< 80%)',
    actual: `Progres terhitung: ${prog2.effectiveWatchedPercentage}% (Clamping durasi aktif)`,
    passed: antiCheatActive
  });

  // 3. Uji Pengiriman Jawaban Checkpoint & Evaluasi Kebenaran
  const answerResult = videoService.submitQuestionAnswer(
    testVideoId,
    testStudentId,
    'chk-01',
    'opt-2' // Opsi yang benar
  );

  results.push({
    scenario: 'Penyimpanan & Validasi Jawaban Checkpoint',
    expected: 'Jawaban tersimpan dan terverifikasi BENAR dengan pembahasan',
    actual: answerResult.isCorrect ? 'Jawaban Terverifikasi BENAR & Pembahasan Muncul' : 'Gagal memvalidasi jawaban',
    passed: answerResult.isCorrect
  });

  // 4. Uji Aturan Penyelesaian (Completion Rule)
  // Syarat selesai: Tontonan >= 80% DAN semua checkpoint wajib terjawab benar
  // Jawab checkpoint kedua
  videoService.submitQuestionAnswer(
    testVideoId,
    testStudentId,
    'chk-02',
    'opt-4' // Opsi yang benar
  );

  // Simulasi tontonan penuh
  for (let t = 0; t <= 300; t += 10) {
    videoService.updateStudentProgress(testVideoId, testStudentId, '21.01.9999', 'Tester Mahasiswa', t, 10);
  }

  const finalProgress = videoService.getStudentProgress(testVideoId, testStudentId);
  const completionMet = !!finalProgress?.isCompleted;

  results.push({
    scenario: 'Completion Rule: Persentase Tontonan $\\ge 80\\%$ + Semua Checkpoint Selesai',
    expected: 'Status isCompleted = TRUE setelah syarat tontonan & kuis terpenuhi',
    actual: completionMet ? `Selesai: ${finalProgress?.effectiveWatchedPercentage}% tontonan + semua kuis dijawab` : 'Belum selesai',
    passed: completionMet
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
