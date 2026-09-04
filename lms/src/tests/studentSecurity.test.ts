import { studentSecurityService } from '../services/studentSecurityService';

export interface StudentSecurityTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runStudentSecurityTests(): { results: StudentSecurityTestResult[]; allPassed: boolean } {
  const results: StudentSecurityTestResult[] = [];
  const testStudentId = 'usr-mhs-01';

  // 1. Uji Validasi Kompleksitas Ubah Kata Sandi
  const shortRes = studentSecurityService.changePassword(testStudentId, {
    oldPassword: 'password123',
    newPassword: '123',
    confirmPassword: '123'
  });
  results.push({
    scenario: 'Penolakan Kata Sandi Baru yang Terlalu Pendek (< 8 Karakter)',
    expected: 'Ditolak dengan pesan validasi minimal 8 karakter',
    actual: `Hasil: ${shortRes.success ? 'Diterima' : 'Ditolak'} (${shortRes.message})`,
    passed: !shortRes.success && shortRes.message.includes('minimal')
  });

  // 2. Uji Keberhasilan Pembaruan Kata Sandi Kuat
  const validRes = studentSecurityService.changePassword(testStudentId, {
    oldPassword: 'password123',
    newPassword: 'SalamTarbiyah2026!#',
    confirmPassword: 'SalamTarbiyah2026!#'
  });
  results.push({
    scenario: 'Pembaruan Kata Sandi Mandiri dengan Kombinasi Kuat',
    expected: 'Berhasil diperbarui dan dicatat ke log keamanan',
    actual: `Hasil: ${validRes.message}`,
    passed: validRes.success
  });

  // 3. Uji Aktivasi dan Deaktivasi Otentikasi 2FA
  const settings2FA = studentSecurityService.toggleTwoFactor(testStudentId, true);
  results.push({
    scenario: 'Aktivasi Otentikasi Dua Faktor (2FA) Email Kampus',
    expected: 'Status 2FA aktif dan tercatat pada setelan mahasiswa',
    actual: `2FA Enabled: ${settings2FA.twoFactorEnabled}, Metode: ${settings2FA.twoFactorMethod}`,
    passed: settings2FA.twoFactorEnabled && settings2FA.twoFactorMethod === 'EMAIL_KAMPUS'
  });

  // 4. Uji Pencabutan Sesi Perangkat Lain (Revoke Sessions)
  const settingsAfterRevoke = studentSecurityService.revokeAllOtherSessions(testStudentId);
  const remainingSessions = settingsAfterRevoke.activeSessions;
  results.push({
    scenario: 'Pencabutan Seluruh Sesi Perangkat Login Lainnya',
    expected: 'Menyisakan tepat 1 sesi perangkat yang sedang aktif saat ini',
    actual: `${remainingSessions.length} Sesi Tersisa (Hanya Sesi Saat Ini: ${remainingSessions.every(s => s.isCurrent)})`,
    passed: remainingSessions.length === 1 && remainingSessions[0].isCurrent
  });

  // 5. Uji Pembuatan Ulang Kode Cadangan 2FA
  const newCodes = studentSecurityService.regenerateBackupCodes(testStudentId);
  results.push({
    scenario: 'Pembuatan Ulang Kode Cadangan Darurat (Backup Codes)',
    expected: 'Menghasilkan 5 kode cadangan berformat SALAM-XXXX-XXXX',
    actual: `${newCodes.length} Kode Dibuat (Contoh: ${newCodes[0]})`,
    passed: newCodes.length === 5 && newCodes[0].startsWith('SALAM-')
  });

  // 6. Uji Integritas Log Audit Keamanan Mahasiswa
  const currentSettings = studentSecurityService.getSettings(testStudentId);
  const hasLogs = currentSettings.securityLogs.length > 0;
  results.push({
    scenario: 'Pencatatan Otomatis Jejak Audit & Riwayat Keamanan Mahasiswa',
    expected: 'Log mencatat waktu, jenis aksi, status, dan IP perangkat',
    actual: `${currentSettings.securityLogs.length} Entri Log Tercatat (Aksi Terbaru: ${currentSettings.securityLogs[0]?.action})`,
    passed: hasLogs && !!currentSettings.securityLogs[0]?.timestamp
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
