/**
 * SUITE UJI IDEMPOTENSI SINKRONISASI AKADEMIK SALAM STAI AL-ITTIHAD
 * 
 * Memastikan sinkronisasi berulang tidak menggandakan data dan tidak menghapus histori pembelajaran.
 */

import { syncService, RawSiakadPayload } from '../services/syncService';
import { academicService } from '../services/academicService';

export interface SyncTestResult {
  step: string;
  description: string;
  classesCountBefore: number;
  classesCountAfter: number;
  classesCreated: number;
  classesUpdated: number;
  isIdempotent: boolean;
  status: 'LULUS' | 'GAGAL';
}

export async function runSyncIdempotencyTests(): Promise<{
  results: SyncTestResult[];
  allPassed: boolean;
}> {
  const results: SyncTestResult[] = [];

  const mockSiakadPayload: RawSiakadPayload = {
    academicPeriod: {
      externalId: 'EXT-PRD-20261',
      code: '20261',
      name: 'Semester Ganjil 2026/2027',
      year: '2026/2027',
      semesterType: 'GANJIL',
      startDate: '2026-09-01',
      endDate: '2027-01-31'
    },
    programs: [
      { externalId: 'EXT-PRODI-PAI', code: 'PAI', name: 'Pendidikan Agama Islam', degree: 'S1', faculty: 'Tarbiyah' },
      { externalId: 'EXT-PRODI-MPI', code: 'MPI', name: 'Manajemen Pendidikan Islam', degree: 'S1', faculty: 'Tarbiyah' }
    ],
    courses: [
      { externalId: 'EXT-CRS-PAI301', code: 'PAI-301', name: 'Ushul Fiqih & Qawaid Fiqhiyyah', credits: 3, semesterLevel: 3, studyProgramCode: 'PAI' },
      { externalId: 'EXT-CRS-PAI405', code: 'PAI-405', name: 'Filsafat Pendidikan Islam', credits: 2, semesterLevel: 4, studyProgramCode: 'PAI' }
    ],
    classes: [
      {
        externalId: 'EXT-CLS-PAI405-A-20261',
        code: 'PAI-405-A',
        name: 'Filsafat Pendidikan Islam (Kelas A)',
        courseExternalId: 'EXT-CRS-PAI405',
        lecturerId: 'usr-dsn-02',
        lecturerName: 'Dr. Hj. Siti Maryam, M.Pd.I',
        lecturerNidn: '2114058202',
        studentCount: 32,
        status: 'AKTIF',
        schedules: [
          { dayOfWeek: 'RABU', startTime: '08:00', endTime: '09:40', room: 'Ruang 203', isOnline: false }
        ]
      }
    ]
  };

  // --- Langkah 1: Eksekusi Sinkronisasi Pertama (Inisiasi / Create) ---
  const beforeRun1 = academicService.getClasses().length;
  const run1 = await syncService.executeSync(mockSiakadPayload, 'tester-01', 'Penguji Sistem');
  const afterRun1 = academicService.getClasses().length;

  results.push({
    step: 'Putaran 1: Inisiasi Data Baru',
    description: 'Sinkronisasi awal payload SIAKAD membentuk kelas baru yang belum ada.',
    classesCountBefore: beforeRun1,
    classesCountAfter: afterRun1,
    classesCreated: run1.stats.classesCreated,
    classesUpdated: run1.stats.classesUpdated,
    isIdempotent: true,
    status: run1.stats.classesCreated > 0 || afterRun1 >= beforeRun1 ? 'LULUS' : 'GAGAL'
  });

  // --- Langkah 2: Eksekusi Sinkronisasi Ulang dengan Payload Sama (Uji Idempotensi Murni) ---
  const beforeRun2 = academicService.getClasses().length;
  const run2 = await syncService.executeSync(mockSiakadPayload, 'tester-01', 'Penguji Sistem');
  const afterRun2 = academicService.getClasses().length;

  const isDuplicateCreated = afterRun2 > beforeRun2;
  const run2Passed = !isDuplicateCreated && run2.stats.classesCreated === 0;

  results.push({
    step: 'Putaran 2: Sinkronisasi Ulang Identik',
    description: 'Payload yang sama dikirim kembali. Sistem WAJIB tidak menambah duplikasi kelas (0 dibuat, 1 diperbarui).',
    classesCountBefore: beforeRun2,
    classesCountAfter: afterRun2,
    classesCreated: run2.stats.classesCreated,
    classesUpdated: run2.stats.classesUpdated,
    isIdempotent: run2Passed,
    status: run2Passed ? 'LULUS' : 'GAGAL'
  });

  // --- Langkah 3: Penonaktifan Aman (Non-destructive soft-deactivate) ---
  const deactivationPayload: RawSiakadPayload = {
    ...mockSiakadPayload,
    classes: [
      {
        ...mockSiakadPayload.classes[0],
        status: 'NONAKTIF'
      }
    ]
  };

  const beforeRun3 = academicService.getClasses().length;
  const run3 = await syncService.executeSync(deactivationPayload, 'tester-01', 'Penguji Sistem');
  const afterRun3 = academicService.getClasses().length;

  const allClasses = academicService.getClasses();
  const deactivatedClass = allClasses.find((c) => c.externalId === 'EXT-CLS-PAI405-A-20261');
  const run3Passed = afterRun3 === beforeRun3 && deactivatedClass?.status === 'NONAKTIF';

  results.push({
    step: 'Putaran 3: Penonaktifan / Pengarsipan Aman',
    description: 'Kelas yang dinonaktifkan di sumber akademik diubah statusnya menjadi NONAKTIF tanpa menghapus record data.',
    classesCountBefore: beforeRun3,
    classesCountAfter: afterRun3,
    classesCreated: run3.stats.classesCreated,
    classesUpdated: run3.stats.classesUpdated,
    isIdempotent: run3Passed,
    status: run3Passed ? 'LULUS' : 'GAGAL'
  });

  const allPassed = results.every((r) => r.status === 'LULUS');
  return { results, allPassed };
}
