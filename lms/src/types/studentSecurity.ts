/**
 * Tipe Data Modul Keamanan Mahasiswa
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

export interface DeviceSession {
  id: string;
  deviceName: string;
  deviceType: 'DESKTOP' | 'MOBILE' | 'TABLET';
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface SecurityActivityLog {
  id: string;
  timestamp: string;
  action: string;
  actionCategory: 'AUTENTIKASI' | 'KREDENSIAL' | 'AKADEMIK' | 'PERANGKAT';
  deviceInfo: string;
  ipAddress: string;
  status: 'BERHASIL' | 'DITOLAK' | 'PERINGATAN';
  detail: string;
}

export interface StudentSecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'EMAIL_KAMPUS' | 'APLIKASI_OTENTIKATOR' | 'SMS_OTP';
  twoFactorEmail: string;
  lastPasswordChange: string;
  activeSessions: DeviceSession[];
  securityLogs: SecurityActivityLog[];
  backupCodes: string[];
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
