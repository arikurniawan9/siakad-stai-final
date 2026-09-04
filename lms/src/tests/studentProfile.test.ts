import { studentProfileService } from '../services/studentProfileService';

export interface StudentProfileTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runStudentProfileTests(): { results: StudentProfileTestResult[]; allPassed: boolean } {
  const results: StudentProfileTestResult[] = [];
  const testStudentId = 'usr-mhs-01';

  // 1. Uji Kelengkapan Biodata Mahasiswa Aktif
  const profile = studentProfileService.getProfile(testStudentId);
  const hasBasicBio = !!(profile.nim && profile.name && profile.nik && profile.studyProgram);
  results.push({
    scenario: 'Kelengkapan Biodata Kependudukan & Akademik Mahasiswa',
    expected: 'Memiliki NIM, NIK, Nama Lengkap, dan Program Studi PAI',
    actual: `${profile.name} (NIM: ${profile.nim}, NIK: ${profile.nik})`,
    passed: hasBasicBio && profile.nim === '21.01.0042'
  });

  // 2. Uji Integrasi Data Pembimbing Akademik & SKS
  const hasAdvisor = !!profile.academicAdvisorName && !!profile.academicAdvisorNidn;
  results.push({
    scenario: 'Integritas Pembimbing Akademik & Riwayat SKS Kumulatif',
    expected: 'Dosen PA valid dengan NIDN, Total 100 SKS, IPK 3.91',
    actual: `PA: ${profile.academicAdvisorName} (NIDN: ${profile.academicAdvisorNidn}) - ${profile.totalCreditsEarned} SKS, IPK ${profile.cumulativeGpa}`,
    passed: hasAdvisor && profile.totalCreditsEarned === 100 && profile.cumulativeGpa === 3.91
  });

  // 3. Uji Capaian Tahfidz & Sertifikasi Kitab Kuning
  const achievements = studentProfileService.getAchievements(testStudentId);
  const hasTahfidz = achievements.some((a) => a.category === 'TAHFIDZ');
  const hasKitab = achievements.some((a) => a.category === 'KITAB_KUNING');
  results.push({
    scenario: 'Portofolio Prestasi Tahfidz Al-Quran & Kajian Kitab Turats',
    expected: 'Memiliki minimal sertifikasi Tahfidz dan Sanad Kitab Kuning',
    actual: `${achievements.length} Sertifikat Terverifikasi (Tahfidz: ${hasTahfidz}, Kitab: ${hasKitab})`,
    passed: hasTahfidz && hasKitab && achievements.length >= 3
  });

  // 4. Uji Pembaruan Kontak & Domisili Mandiri
  const newPhone = '0812-9988-7766';
  const updatedProfile = studentProfileService.updateProfile(testStudentId, {
    phoneNumber: newPhone,
    dormitoryName: "Asrama Ibnu Sina Kamar B-04"
  });
  results.push({
    scenario: 'Pembaruan Informasi Kontak & Domisili Mahasiswa Mandiri',
    expected: `Nomor telepon terbarui menjadi ${newPhone}`,
    actual: `No Telepon: ${updatedProfile.phoneNumber}, Asrama: ${updatedProfile.dormitoryName}`,
    passed: updatedProfile.phoneNumber === newPhone
  });

  // 5. Uji Validitas Kode Otentikasi KTM Digital
  const isKtmValid = profile.ktmVerificationCode.startsWith('KTM-STAI-ITD-');
  results.push({
    scenario: 'Validasi Format Kode Otentikasi Kartu Tanda Mahasiswa (KTM) Digital',
    expected: 'Memiliki prefix KTM-STAI-ITD- dan masa berlaku aktif',
    actual: `${profile.ktmVerificationCode} (Berlaku s.d: ${profile.ktmValidUntil})`,
    passed: isKtmValid && !!profile.ktmValidUntil
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
