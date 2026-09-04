/**
 * SUITE UJI PROFIL DOSEN PENGAMPU & KTD DIGITAL SALAM
 * 
 * Pengujian resolusi profil dosen berdasarkan sesi login,
 * validasi NIDN, perhitungan beban BKD, serta pembaruan kontak mandiri.
 */

import { lecturerProfileService } from '../services/lecturerProfileService';
import { UserAuthProfile } from '../types/auth';
import { ROLE_PERMISSIONS, ROLE_LABELS } from '../constants/permissions';

export interface LecturerProfileTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runLecturerProfileTests(): { results: LecturerProfileTestResult[]; allPassed: boolean } {
  const results: LecturerProfileTestResult[] = [];

  // Mock Dosen User (Dr. H. M. Ridwan, M.Ag)
  const lecturerUser: UserAuthProfile = {
    id: 'usr-dsn-01',
    username: '2112087501',
    name: 'Dr. H. M. Ridwan, M.Ag',
    identityNumber: '2112087501',
    email: 'm.ridwan@staialittihad.ac.id',
    role: 'dosen',
    roleLabel: ROLE_LABELS.dosen,
    studyProgram: 'Fakultas Tarbiyah',
    permissions: ROLE_PERMISSIONS.dosen,
  };

  // Mock Kaprodi User (Hj. Siti Maryam, M.Pd.I)
  const kaprodiUser: UserAuthProfile = {
    id: 'usr-kpr-01',
    username: '2114058202',
    name: 'Hj. Siti Maryam, M.Pd.I',
    identityNumber: '2114058202',
    email: 'siti.maryam@staialittihad.ac.id',
    role: 'kaprodi',
    roleLabel: ROLE_LABELS.kaprodi,
    studyProgram: 'Program Studi PAI',
    permissions: ROLE_PERMISSIONS.kaprodi,
  };

  // 1. Uji Resolusi Profil Dosen Dr. H. M. Ridwan, M.Ag
  const dsnProfile = lecturerProfileService.getProfile(lecturerUser);
  const dsnMatch = dsnProfile.nidn === '2112087501' && dsnProfile.name === 'Dr. H. M. Ridwan, M.Ag' && dsnProfile.academicPosition.includes('Lektor Kepala');

  results.push({
    scenario: 'Resolusi Profil Dosen Sesuai Akun Login (Dr. H. M. Ridwan)',
    expected: 'Menampilkan NIDN 2112087501, Jabatan Lektor Kepala, dan Email Kampus m.ridwan@staialittihad.ac.id',
    actual: dsnMatch ? `Nama: ${dsnProfile.name} | NIDN: ${dsnProfile.nidn} | Jabatan: ${dsnProfile.academicPosition}` : 'Profil tidak cocok',
    passed: dsnMatch
  });

  // 2. Uji Resolusi Profil Kaprodi Hj. Siti Maryam, M.Pd.I
  const kprProfile = lecturerProfileService.getProfile(kaprodiUser);
  const kprMatch = kprProfile.nidn === '2114058202' && kprProfile.name === 'Hj. Siti Maryam, M.Pd.I' && kprProfile.studyProgram.includes('PAI');

  results.push({
    scenario: 'Resolusi Profil Dosen/Kaprodi (Hj. Siti Maryam)',
    expected: 'Menampilkan NIDN 2114058202 dan Homebase Program Studi PAI',
    actual: kprMatch ? `Nama: ${kprProfile.name} | NIDN: ${kprProfile.nidn} | Homebase: ${kprProfile.studyProgram}` : 'Profil kaprodi tidak cocok',
    passed: kprMatch
  });

  // 3. Uji Beban Kinerja Dosen (BKD Standar 12-16 SKS)
  const bkdValid = dsnProfile.totalTeachingCredits >= 12 && dsnProfile.teachingCourses.length >= 3;
  results.push({
    scenario: 'Validasi Beban Mengajar & BKD Semester Ganjil',
    expected: 'Beban mengajar memenuhi standar Ditjen Pendis Kemenag (minimal 12 SKS)',
    actual: bkdValid ? `Total Beban: ${dsnProfile.totalTeachingCredits} SKS (${dsnProfile.teachingCourses.length} Mata Kuliah)` : 'BKD di bawah standar',
    passed: bkdValid
  });

  // 4. Uji Rekam Jejak Publikasi Ilmiah & SINTA
  const pubValid = dsnProfile.publications.length > 0 && !!dsnProfile.sintaId;
  results.push({
    scenario: 'Portofolio Publikasi & Indeksasi SINTA Dosen',
    expected: 'Memuat artikel jurnal terakreditasi SINTA dan buku ajar ber-ISBN',
    actual: pubValid ? `ID SINTA: ${dsnProfile.sintaId} | Total Publikasi: ${dsnProfile.publications.length} Karya` : 'Publikasi kosong',
    passed: pubValid
  });

  // 5. Uji Pembaruan Kontak Mandiri Dosen
  const newPhone = '0812-9999-0000';
  const updated = lecturerProfileService.updateProfile(lecturerUser, {
    phoneNumber: newPhone,
    personalEmail: 'ridwan.updated@gmail.com'
  });
  const updateValid = updated.phoneNumber === newPhone && updated.personalEmail === 'ridwan.updated@gmail.com';

  results.push({
    scenario: 'Pembaruan Kontak Mandiri & Domisili Dosen',
    expected: 'Nomor WhatsApp dan email pribadi berhasil diperbarui',
    actual: updateValid ? `No HP Baru: ${updated.phoneNumber} | Email Baru: ${updated.personalEmail}` : 'Pembaruan kontak gagal',
    passed: updateValid
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
