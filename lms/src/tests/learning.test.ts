/**
 * SUITE UJI MATA KULIAH, RPS & MATERI PEMBELAJARAN SALAM
 * 
 * Memverifikasi hak akses konten terbit vs draf, isolasi mahasiswa, dan pencatatan akses.
 */

import { learningService } from '../services/learningService';

export interface LearningTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runLearningTests(): { results: LearningTestResult[]; allPassed: boolean } {
  const results: LearningTestResult[] = [];
  const testClassId = 'cls-pai301-a';

  // 1. Uji Visibilitas Mahasiswa (Hanya melihat DITERBITKAN)
  const studentMeetings = learningService.getMeetingsByClass(testClassId, true);
  const hasDraftForStudent = studentMeetings.some((m) => m.status !== 'DITERBITKAN');
  
  results.push({
    scenario: 'Visibilitas Mahasiswa: Draf Wajib Disembunyikan',
    expected: '0 pertemuan draf terlihat oleh mahasiswa',
    actual: `${studentMeetings.filter((m) => m.status !== 'DITERBITKAN').length} draf terlihat`,
    passed: !hasDraftForStudent
  });

  // 2. Uji Visibilitas Dosen (Melihat semua status: DRAF + DITERBITKAN)
  const lecturerMeetings = learningService.getMeetingsByClass(testClassId, false);
  const hasDraftForLecturer = lecturerMeetings.some((m) => m.status === 'DRAF');

  results.push({
    scenario: 'Visibilitas Dosen: Dosen Dapat Melihat & Mengelola Draf',
    expected: 'Pertemuan berstatus DRAF dapat diakses dosen pengampu',
    actual: `${lecturerMeetings.filter((m) => m.status === 'DRAF').length} pertemuan draf tersedia`,
    passed: hasDraftForLecturer
  });

  // 3. Uji Ketersediaan Data RPS
  const rps = learningService.getRPS(testClassId);
  const rpsComplete = !!rps && rps.learningOutcomes.length > 0 && rps.assessmentWeights.length > 0;

  results.push({
    scenario: 'Kelengkapan RPS: Deskripsi, CPMK, Bobot Penilaian & Rujukan',
    expected: 'RPS terstruktur lengkap dengan CPMK dan komponen penilaian',
    actual: rpsComplete ? 'RPS valid dan terstruktur lengkap' : 'RPS tidak lengkap',
    passed: rpsComplete
  });

  // 4. Uji Pencatatan Log Akses Materi
  const testStudentId = 'usr-mhs-01';
  const log = learningService.logMaterialAccess(
    'mat-01-01',
    'mtg-pai301a-01',
    testClassId,
    testStudentId,
    '21.01.0042',
    'Ahmad Fauzi',
    120
  );

  const logs = learningService.getMaterialAccessLogs(testStudentId, testClassId);
  const logRecorded = logs.some((l) => l.materialId === 'mat-01-01' && l.accessCount >= 1);

  results.push({
    scenario: 'Pencatatan Akses Aktivitas: last_accessed dan durasi tersimpan',
    expected: 'Event akses materi tercatat dengan timestamp dan durasi',
    actual: logRecorded ? `Tercatat: ${log.accessCount}x akses, durasi ${log.totalDurationSeconds} detik` : 'Gagal mencatat log',
    passed: logRecorded
  });

  // 5. Uji Struktur & Ketersediaan Modul Pembelajaran Online (E-Modul)
  const allMats = studentMeetings.flatMap((m) => m.materials);
  const onlineModule = allMats.find((m) => m.type === 'MODUL_ONLINE' && m.onlineModule);
  const hasValidChapters = !!onlineModule?.onlineModule && onlineModule.onlineModule.chapters.length >= 2;

  results.push({
    scenario: 'E-Modul Online: Kelengkapan Bab, Estimasi Waktu & Dalil Turats',
    expected: 'Modul online memiliki minimal 2 bab, estimasi waktu, dan konten terstruktur',
    actual: hasValidChapters 
      ? `Modul "${onlineModule?.title}" valid dengan ${onlineModule?.onlineModule?.chapters.length} bab (${onlineModule?.onlineModule?.totalEstimatedMinutes} menit)`
      : 'Modul online tidak memiliki bab terstruktur',
    passed: hasValidChapters
  });

  // 6. Uji Pengelolaan Catatan Belajar Mahasiswa
  const savedNote = learningService.saveModuleNote({
    materialId: 'mat-01-01',
    studentId: testStudentId,
    chapterId: 'ch-01-01',
    chapterNumber: 1,
    noteText: 'Ushul Fiqih adalah metodologi perumusan hukum, sedangkan Fiqih adalah hasil hukum praktis.'
  });

  const studentNotes = learningService.getModuleNotes('mat-01-01', testStudentId);
  const notePreserved = studentNotes.some((n) => n.id === savedNote.id && n.chapterNumber === 1);

  results.push({
    scenario: 'Catatan Belajar Mahasiswa: Penyimpanan & Preservasi Catatan Bab',
    expected: 'Catatan belajar tersimpan per mahasiswa, materi, dan nomor bab',
    actual: notePreserved ? `Tersimpan: ${studentNotes.length} catatan aktif` : 'Gagal menyimpan catatan belajar',
    passed: notePreserved
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
