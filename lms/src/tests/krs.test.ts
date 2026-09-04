import { krsService } from '../services/krsService';
import { KrsCourseItem } from '../types/krs';

export interface KrsTestResult {
  title: string;
  passed: boolean;
  message: string;
  details?: any;
}

export function runKrsTests(): { results: KrsTestResult[]; allPassed: boolean } {
  const results: KrsTestResult[] = [];

  // Reset data ke default sebelum pengujian
  krsService.resetToDefault();

  // Test 1: Formula Batas Beban SKS Berdasarkan IPS (SN-Dikti)
  const quota385 = krsService.calculateMaxCreditQuota(3.85);
  const quota280 = krsService.calculateMaxCreditQuota(2.80);
  const quota220 = krsService.calculateMaxCreditQuota(2.20);
  const quota150 = krsService.calculateMaxCreditQuota(1.50);

  const test1Passed = quota385 === 24 && quota280 === 21 && quota220 === 18 && quota150 === 15;
  results.push({
    title: 'Validasi Formula Kuota Maksimal SKS Berdasarkan IPS',
    passed: test1Passed,
    message: test1Passed 
      ? 'Perhitungan batas kuota SKS (IPS >= 3.0: 24 SKS, 2.5-2.99: 21 SKS, 2.0-2.49: 18 SKS, <2.0: 15 SKS) akurat.' 
      : 'Gagal memvalidasi batas kuota SKS.',
    details: { quota385, quota280, quota220, quota150 }
  });

  // Test 2: Deteksi Bentrok Jadwal Kuliah (Schedule Conflict Detection)
  const conflictingCourses: KrsCourseItem[] = [
    {
      id: 'test-c1',
      classId: 'cls-1',
      courseId: 'crs-1',
      courseCode: 'TEST-101',
      courseName: 'Mata Kuliah Pagi A',
      credits: 3,
      className: 'Kelas A',
      dayOfWeek: 'Senin',
      startTime: '08:00',
      endTime: '10:30',
      roomId: 'rm-1',
      roomName: 'Ruang 1',
      roomCode: 'R-1',
      building: 'Gedung A',
      lecturerId: 'l-1',
      lecturerName: 'Dosen 1',
      lecturerNidn: '123',
      courseType: 'WAJIB_PRODI',
      isSelected: true,
      isLocked: false,
      prerequisiteMet: true,
      quota: 30,
      enrolledCount: 10
    },
    {
      id: 'test-c2',
      classId: 'cls-2',
      courseId: 'crs-2',
      courseCode: 'TEST-102',
      courseName: 'Mata Kuliah Pagi B (Bentrok)',
      credits: 3,
      className: 'Kelas B',
      dayOfWeek: 'Senin',
      startTime: '09:00', // Tumpang tindih dengan 08:00 - 10:30
      endTime: '11:30',
      roomId: 'rm-2',
      roomName: 'Ruang 2',
      roomCode: 'R-2',
      building: 'Gedung A',
      lecturerId: 'l-2',
      lecturerName: 'Dosen 2',
      lecturerNidn: '456',
      courseType: 'PILIHAN',
      isSelected: true,
      isLocked: false,
      prerequisiteMet: true,
      quota: 30,
      enrolledCount: 10
    }
  ];

  const conflictChecked = krsService.detectScheduleConflicts(conflictingCourses);
  const test2Passed = Boolean(conflictChecked[0].scheduleConflictWith && conflictChecked[1].scheduleConflictWith);
  results.push({
    title: 'Algoritma Deteksi Tumpang Tindih / Bentrok Jadwal Kuliah',
    passed: test2Passed,
    message: test2Passed
      ? 'Sistem berhasil mendeteksi bentrok jadwal pada hari dan interval jam yang bersinggungan.'
      : 'Gagal mendeteksi bentrok jadwal.',
    details: { conflict0: conflictChecked[0].scheduleConflictWith, conflict1: conflictChecked[1].scheduleConflictWith }
  });

  // Test 3: Pengambilan dan Manipulasi KRS Mahasiswa (Tambah & Drop MK)
  const studentKrs = krsService.getStudentKrs('usr-mhs-03'); // Draf 18 SKS
  const addRes = krsService.addCourseToKrs('usr-mhs-03', 'crs-pai308'); // Tambah 3 SKS -> Total 21 SKS
  const updatedStudent = krsService.getStudentKrs('usr-mhs-03');
  const test3Passed = addRes.success && updatedStudent.totalCreditsTaken === 21;

  results.push({
    title: 'Pengisian KRS Dinamis (Tambah Mata Kuliah dari Katalog)',
    passed: test3Passed,
    message: test3Passed
      ? 'Penambahan mata kuliah dari katalog berhasil memperbarui akumulasi SKS rencana studi.'
      : 'Gagal menambahkan mata kuliah ke KRS mahasiswa.',
    details: { before: studentKrs.totalCreditsTaken, after: updatedStudent.totalCreditsTaken }
  });

  // Test 4: Pembatalan Mata Kuliah (Drop Course)
  const dropRes = krsService.removeCourseFromKrs('usr-mhs-03', 'crs-pai308');
  const studentAfterDrop = krsService.getStudentKrs('usr-mhs-03');
  const test4Passed = dropRes.success && studentAfterDrop.totalCreditsTaken === 18;

  results.push({
    title: 'Pembatalan Mata Kuliah (Drop Course dari KRS)',
    passed: test4Passed,
    message: test4Passed
      ? 'Mata kuliah berhasil dibatalkan dan total SKS kembali dikurangi dengan tepat.'
      : 'Gagal membatalkan mata kuliah dari KRS.',
    details: { afterDropCredits: studentAfterDrop.totalCreditsTaken }
  });

  // Test 5: Pengajuan KRS ke Dosen Pembimbing Akademik
  const submitRes = krsService.submitKrsForApproval('usr-mhs-03');
  const studentAfterSubmit = krsService.getStudentKrs('usr-mhs-03');
  const test5Passed = submitRes.success && studentAfterSubmit.krsStatus === 'MENUNGGU_PERSETUJUAN';

  results.push({
    title: 'Pengajuan Kartu Rencana Studi (KRS) ke Dosen PA',
    passed: test5Passed,
    message: test5Passed
      ? 'KRS berhasil diajukan dengan transisi status MENUNGGU_PERSETUJUAN dan notifikasi tercatat.'
      : 'Gagal mengajukan KRS ke Dosen PA.',
    details: { status: studentAfterSubmit.krsStatus }
  });

  // Test 6: Persetujuan dan Pengesahan KRS oleh Dosen PA
  const approveRes = krsService.approveAdviseeKrs('usr-dsn-01', 'usr-mhs-03', 'Disetujui penuh.');
  const studentAfterApprove = krsService.getStudentKrs('usr-mhs-03');
  const test6Passed = approveRes.success && studentAfterApprove.krsStatus === 'DISETUJUI' && studentAfterApprove.courses.every(c => c.isLocked);

  results.push({
    title: 'Verifikasi & Pengesahan KRS Resmi oleh Dosen PA',
    passed: test6Passed,
    message: test6Passed
      ? 'Dosen PA berhasil mengesahkan KRS, status berubah ke DISETUJUI dan seluruh mata kuliah terkunci.'
      : 'Gagal mengesahkan KRS mahasiswa bimbingan.',
    details: { status: studentAfterApprove.krsStatus, allLocked: studentAfterApprove.courses.every(c => c.isLocked) }
  });

  // Test 7: Pembukaan Kunci KRS dan Permintaan Revisi
  const unlockRes = krsService.unlockAdviseeKrs('usr-dsn-01', 'usr-mhs-03', 'Izin ubah mata kuliah');
  const studentAfterUnlock = krsService.getStudentKrs('usr-mhs-03');
  const rejectRes = krsService.rejectAdviseeKrs('usr-dsn-01', 'usr-mhs-03', 'Kurangi beban SKS');
  const studentAfterReject = krsService.getStudentKrs('usr-mhs-03');

  const test7Passed = unlockRes.success && studentAfterUnlock.krsStatus === 'DRAF' && rejectRes.success && studentAfterReject.krsStatus === 'DITOLAK_REVISI';

  results.push({
    title: 'Alur Buka Kunci KRS & Permintaan Revisi Rencana Studi',
    passed: test7Passed,
    message: test7Passed
      ? 'Fitur Buka Kunci dan Permintaan Revisi dengan catatan instruktif berfungsi sebagaimana mestinya.'
      : 'Gagal menjalankan alur revisi/buka kunci KRS.',
    details: { unlockStatus: studentAfterUnlock.krsStatus, rejectStatus: studentAfterReject.krsStatus }
  });

  // Test 8: Konsultasi Bimbingan & Chat Interaktif
  const msgRes = krsService.sendConsultationMessage('usr-mhs-03', 'usr-mhs-03', 'Muhammad Rizky', 'MAHASISWA', 'Uji coba bimbingan');
  const test8Passed = msgRes.length > 0 && msgRes[msgRes.length - 1].message === 'Uji coba bimbingan';

  results.push({
    title: 'Kanal Konsultasi Bimbingan Daring Dua Arah Mahasiswa & Dosen PA',
    passed: test8Passed,
    message: test8Passed
      ? 'Pengiriman pesan konsultasi dan sinkronisasi log komunikasi bimbingan berjalan lancar.'
      : 'Gagal mengirim pesan konsultasi bimbingan.',
    details: { totalMessages: msgRes.length }
  });

  // Reset kembali ke default
  krsService.resetToDefault();

  const allPassed = results.every(r => r.passed);
  return { results, allPassed };
}
