/**
 * Layanan Modul Keamanan Mahasiswa
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { 
  StudentSecuritySettings, 
  DeviceSession, 
  SecurityActivityLog, 
  ChangePasswordPayload 
} from '../types/studentSecurity';
import { auditService } from './auditService';

const STORAGE_KEY_SECURITY = 'salam_student_security_settings';

const INITIAL_SESSIONS: DeviceSession[] = [
  {
    id: 'ses-01',
    deviceName: 'Laptop ThinkPad T14 (Windows 11)',
    deviceType: 'DESKTOP',
    browser: 'Google Chrome 128.0',
    os: 'Windows 11 Pro 64-bit',
    ipAddress: '127.0.0.1',
    location: 'Cianjur, Jawa Barat (Jaringan Kampus)',
    lastActive: new Date().toISOString(),
    isCurrent: true
  },
  {
    id: 'ses-02',
    deviceName: 'Samsung Galaxy A54 5G',
    deviceType: 'MOBILE',
    browser: 'Samsung Internet 24.0',
    os: 'Android 14 (One UI 6.1)',
    ipAddress: '180.252.164.88',
    location: 'Cianjur, Jawa Barat (Telkomsel Seluler)',
    lastActive: new Date(Date.now() - 3600000 * 5).toISOString(),
    isCurrent: false
  },
  {
    id: 'ses-03',
    deviceName: 'iPad Air Generasi ke-5',
    deviceType: 'TABLET',
    browser: 'Safari Mobile 17.4',
    os: 'iPadOS 17.5.1',
    ipAddress: '114.122.38.19',
    location: 'Bandung, Jawa Barat (Wi-Fi Perpustakaan)',
    lastActive: new Date(Date.now() - 3600000 * 48).toISOString(),
    isCurrent: false
  }
];

const INITIAL_LOGS: SecurityActivityLog[] = [
  {
    id: 'sec-log-01',
    timestamp: new Date().toISOString(),
    action: 'LOGIN_BERHASIL',
    actionCategory: 'AUTENTIKASI',
    deviceInfo: 'Laptop ThinkPad T14 (Windows 11)',
    ipAddress: '127.0.0.1',
    status: 'BERHASIL',
    detail: 'Login sesi aktif menggunakan NIM 21.01.0042'
  },
  {
    id: 'sec-log-02',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    action: 'PENGUMPULAN_TUGAS',
    actionCategory: 'AKADEMIK',
    deviceInfo: 'Laptop ThinkPad T14 (Windows 11)',
    ipAddress: '127.0.0.1',
    status: 'BERHASIL',
    detail: 'Mengunggah berkas tugas Makalah Ushul Fiqih Pertemuan 4'
  },
  {
    id: 'sec-log-03',
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString(),
    action: 'VERIFIKASI_2FA',
    actionCategory: 'KREDENSIAL',
    deviceInfo: 'Samsung Galaxy A54 5G',
    ipAddress: '180.252.164.88',
    status: 'BERHASIL',
    detail: 'Kode OTP email kampus terverifikasi saat login'
  },
  {
    id: 'sec-log-04',
    timestamp: new Date(Date.now() - 3600000 * 120).toISOString(),
    action: 'PERCOBAAN_LOGIN_GAGAL',
    actionCategory: 'AUTENTIKASI',
    deviceInfo: 'Peramban Tidak Dikenal',
    ipAddress: '103.245.38.10',
    status: 'DITOLAK',
    detail: 'Kata sandi salah sebanyak 1 kali (Percobaan ditolak sistem)'
  }
];

const INITIAL_SETTINGS: StudentSecuritySettings = {
  twoFactorEnabled: true,
  twoFactorMethod: 'EMAIL_KAMPUS',
  twoFactorEmail: 'ahmad.fauzi@staialittihad.ac.id',
  lastPasswordChange: '2026-07-15T10:30:00.000Z',
  activeSessions: INITIAL_SESSIONS,
  securityLogs: INITIAL_LOGS,
  backupCodes: [
    'SALAM-8842-1904',
    'SALAM-3319-5820',
    'SALAM-7721-9041',
    'SALAM-6549-1123',
    'SALAM-9902-3481'
  ]
};

class StudentSecurityService {
  /**
   * Mengambil data pengaturan keamanan mahasiswa
   */
  public getSettings(studentId: string = 'usr-mhs-01'): StudentSecuritySettings {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_SECURITY}_${studentId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  }

  /**
   * Menyimpan data pengaturan keamanan mahasiswa
   */
  private saveSettings(studentId: string, settings: StudentSecuritySettings) {
    try {
      localStorage.setItem(`${STORAGE_KEY_SECURITY}_${studentId}`, JSON.stringify(settings));
    } catch (e) {
      console.warn('Gagal menyimpan setelan keamanan:', e);
    }
  }

  /**
   * Mengubah kata sandi mahasiswa
   */
  public changePassword(
    studentId: string, 
    payload: ChangePasswordPayload,
    studentName: string = 'Ahmad Fauzi Rahman'
  ): { success: boolean; message: string } {
    const settings = this.getSettings(studentId);

    // Validasi kata sandi lama
    if (!payload.oldPassword || payload.oldPassword.trim().length < 4) {
      return { success: false, message: 'Kata sandi lama yang Anda masukkan tidak sesuai.' };
    }

    // Validasi kompleksitas kata sandi baru
    if (payload.newPassword.length < 8) {
      return { success: false, message: 'Kata sandi baru minimal harus terdiri dari 8 karakter.' };
    }

    if (payload.newPassword !== payload.confirmPassword) {
      return { success: false, message: 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru.' };
    }

    if (payload.oldPassword === payload.newPassword) {
      return { success: false, message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.' };
    }

    // Update settings
    settings.lastPasswordChange = new Date().toISOString();

    // Tambahkan log keamanan
    const newLog: SecurityActivityLog = {
      id: `sec-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'UBAH_KATA_SANDI',
      actionCategory: 'KREDENSIAL',
      deviceInfo: 'Laptop ThinkPad T14 (Windows 11)',
      ipAddress: '127.0.0.1',
      status: 'BERHASIL',
      detail: 'Kata sandi akun portal SALAM berhasil diperbarui secara mandiri.'
    };

    settings.securityLogs = [newLog, ...settings.securityLogs];
    this.saveSettings(studentId, settings);

    // Catat ke audit log institusi
    auditService.record(
      studentId,
      studentName,
      'mahasiswa',
      'UBAH_KATA_SANDI',
      'AUTENTIKASI',
      'Pembaruan kata sandi mandiri berhasil',
      'SUKSES'
    );

    return { success: true, message: 'Kata sandi akun Anda berhasil diperbarui.' };
  }

  /**
   * Mengaktifkan / Menonaktifkan 2FA
   */
  public toggleTwoFactor(studentId: string, enabled: boolean): StudentSecuritySettings {
    const settings = this.getSettings(studentId);
    settings.twoFactorEnabled = enabled;

    const newLog: SecurityActivityLog = {
      id: `sec-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: enabled ? 'AKTIVASI_2FA' : 'DEAKTIVASI_2FA',
      actionCategory: 'KREDENSIAL',
      deviceInfo: 'Laptop ThinkPad T14 (Windows 11)',
      ipAddress: '127.0.0.1',
      status: 'BERHASIL',
      detail: enabled 
        ? 'Otentikasi Dua Faktor (2FA) diaktifkan via email resmi kampus.'
        : 'Otentikasi Dua Faktor (2FA) dinonaktifkan oleh mahasiswa.'
    };

    settings.securityLogs = [newLog, ...settings.securityLogs];
    this.saveSettings(studentId, settings);
    return settings;
  }

  /**
   * Mencabut satu sesi perangkat
   */
  public revokeSession(studentId: string, sessionId: string): StudentSecuritySettings {
    const settings = this.getSettings(studentId);
    const targetSession = settings.activeSessions.find((s) => s.id === sessionId);

    settings.activeSessions = settings.activeSessions.filter((s) => s.id !== sessionId);

    const newLog: SecurityActivityLog = {
      id: `sec-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CABUT_SESI_PERANGKAT',
      actionCategory: 'PERANGKAT',
      deviceInfo: targetSession?.deviceName || 'Perangkat Eksternal',
      ipAddress: targetSession?.ipAddress || '127.0.0.1',
      status: 'BERHASIL',
      detail: `Sesi login pada perangkat "${targetSession?.deviceName || sessionId}" telah dicabut.`
    };

    settings.securityLogs = [newLog, ...settings.securityLogs];
    this.saveSettings(studentId, settings);
    return settings;
  }

  /**
   * Mencabut seluruh sesi perangkat lain
   */
  public revokeAllOtherSessions(studentId: string): StudentSecuritySettings {
    const settings = this.getSettings(studentId);
    const count = settings.activeSessions.filter((s) => !s.isCurrent).length;

    settings.activeSessions = settings.activeSessions.filter((s) => s.isCurrent);

    const newLog: SecurityActivityLog = {
      id: `sec-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'CABUT_SEMUA_SESI_LAIN',
      actionCategory: 'PERANGKAT',
      deviceInfo: 'Sesi Sekarang (Localhost)',
      ipAddress: '127.0.0.1',
      status: 'BERHASIL',
      detail: `Sebanyak ${count} sesi login pada perangkat lain telah dikeluarkan dari sistem.`
    };

    settings.securityLogs = [newLog, ...settings.securityLogs];
    this.saveSettings(studentId, settings);
    return settings;
  }

  /**
   * Membuat ulang kode cadangan 2FA
   */
  public regenerateBackupCodes(studentId: string): string[] {
    const settings = this.getSettings(studentId);
    const newCodes = Array.from({ length: 5 }, () => {
      const p1 = Math.floor(1000 + Math.random() * 9000);
      const p2 = Math.floor(1000 + Math.random() * 9000);
      return `SALAM-${p1}-${p2}`;
    });

    settings.backupCodes = newCodes;
    this.saveSettings(studentId, settings);
    return newCodes;
  }
}

export const studentSecurityService = new StudentSecurityService();
