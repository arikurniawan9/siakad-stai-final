import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Smartphone, 
  Laptop, 
  Tablet, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Activity, 
  Send
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  StudentSecuritySettings, 
  ChangePasswordPayload, 
  SecurityActivityLog 
} from '../../types/studentSecurity';
import { studentSecurityService } from '../../services/studentSecurityService';

export interface KeamananMahasiswaPageProps {
  onNavigate?: (path: string) => void;
}

type SecurityTab = 'ubah_sandi' | 'otentikasi_2fa' | 'sesi_perangkat' | 'log_aktivitas';

export const KeamananMahasiswaPage: React.FC<KeamananMahasiswaPageProps> = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<SecurityTab>('ubah_sandi');
  const [settings, setSettings] = useState<StudentSecuritySettings | null>(null);

  // Form Ubah Sandi
  const [passwordForm, setPasswordForm] = useState<ChangePasswordPayload>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  // Modal Lapor Insiden
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportIssue, setReportIssue] = useState({
    issueType: 'LOGIN_TIDAK_DIKENAL',
    description: '',
    revokeOthers: true
  });

  const loadSettings = () => {
    const studentId = user?.id || 'usr-mhs-01';
    const data = studentSecurityService.getSettings(studentId);
    setSettings(data);
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  // Evaluasi Kekuatan Sandi
  const passwordStrength = useMemo(() => {
    const pwd = passwordForm.newPassword;
    if (!pwd) return { score: 0, label: 'Belum Diisi', color: 'var(--text-muted)' };
    
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (pwd.length >= 12) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 2) return { score: 1, label: 'Lemah', color: 'var(--color-danger-main)' };
    if (score <= 4) return { score: 2, label: 'Sedang', color: '#d97706' };
    return { score: 3, label: 'Sangat Kuat', color: 'var(--color-success-700)' };
  }, [passwordForm.newPassword]);

  // Handle Ubah Sandi
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = user?.id || 'usr-mhs-01';
    const res = studentSecurityService.changePassword(studentId, passwordForm, user?.name);

    if (res.success) {
      toast.success('Kata Sandi Diperbarui', res.message);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      loadSettings();
    } else {
      toast.danger('Gagal Memperbarui Kata Sandi', res.message);
    }
  };

  // Handle Toggle 2FA
  const handleToggle2FA = (enabled: boolean) => {
    const studentId = user?.id || 'usr-mhs-01';
    const updated = studentSecurityService.toggleTwoFactor(studentId, enabled);
    setSettings(updated);
    toast.success(
      enabled ? '2FA Diaktifkan' : '2FA Dinonaktifkan',
      enabled 
        ? 'Otentikasi Dua Faktor aktif. Kode verifikasi akan dikirimkan ke email kampus setiap kali login.'
        : 'Otentikasi Dua Faktor telah dinonaktifkan.'
    );
  };

  // Handle Revoke Single Session
  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    const studentId = user?.id || 'usr-mhs-01';
    const updated = studentSecurityService.revokeSession(studentId, sessionId);
    setSettings(updated);
    toast.success('Sesi Dicabut', `Perangkat "${deviceName}" telah berhasil dikeluarkan.`);
  };

  // Handle Revoke All Other Sessions
  const handleRevokeAllOtherSessions = () => {
    const studentId = user?.id || 'usr-mhs-01';
    const updated = studentSecurityService.revokeAllOtherSessions(studentId);
    setSettings(updated);
    toast.success('Semua Sesi Lain Dikeluarkan', 'Seluruh sesi perangkat lain telah berhasil dicabut.');
  };

  // Handle Regenerate Backup Codes
  const handleRegenerateBackupCodes = () => {
    const studentId = user?.id || 'usr-mhs-01';
    const newCodes = studentSecurityService.regenerateBackupCodes(studentId);
    setSettings({ ...settings!, backupCodes: newCodes });
    toast.success('Kode Cadangan Diperbarui', '5 kode cadangan baru telah dibuat. Simpan di tempat yang aman.');
  };

  // Copy Backup Codes
  const handleCopyBackupCodes = () => {
    if (!settings) return;
    navigator.clipboard.writeText(settings.backupCodes.join('\n'));
    toast.success('Kode Disalin', 'Seluruh kode cadangan telah disalin ke papan klip.');
  };

  // Handle Submit Security Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = user?.id || 'usr-mhs-01';
    if (reportIssue.revokeOthers) {
      studentSecurityService.revokeAllOtherSessions(studentId);
    }
    setIsReportModalOpen(false);
    toast.success(
      'Laporan Terkirim ke PTIPD',
      'Tim Keamanan IT STAI AL-ITTIHAD telah menerima laporan Anda dan sedang meninjau aktivitas akun.'
    );
    loadSettings();
  };

  // Columns Log Aktivitas
  const logColumns: Column<SecurityActivityLog>[] = [
    {
      header: 'Waktu Aktivitas',
      width: '180px',
      render: (row) => (
        <div>
          <strong style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
            {new Date(row.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </strong>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            {new Date(row.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
          </div>
        </div>
      )
    },
    {
      header: 'Kategori & Tindakan',
      width: '200px',
      render: (row) => (
        <div>
          <Badge variant="primary" style={{ fontSize: '10px' }}>
            {row.actionCategory}
          </Badge>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', marginTop: '2px', color: 'var(--text-primary)' }}>
            {row.action.replace(/_/g, ' ')}
          </div>
        </div>
      )
    },
    {
      header: 'Perangkat & Alamat IP',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
            {row.deviceInfo}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            IP: {row.ipAddress}
          </div>
        </div>
      )
    },
    {
      header: 'Rincian Catatan',
      accessor: 'detail'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.status === 'BERHASIL' ? 'success' : row.status === 'DITOLAK' ? 'danger' : 'warning'}>
          {row.status}
        </Badge>
      )
    }
  ];

  if (!settings) {
    return (
      <div className="flex justify-center items-center p-12">
        <span>Memuat pusat keamanan akun...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Banner & Security Score */}
      <Card style={{ borderTop: '4px solid var(--color-primary-600)' }}>
        <CardBody style={{ padding: 'var(--space-6)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div 
                style={{ 
                  padding: '16px', 
                  borderRadius: 'var(--radius-lg)', 
                  backgroundColor: 'var(--color-success-50)', 
                  color: 'var(--color-success-700)',
                  flexShrink: 0 
                }}
              >
                <ShieldCheck size={36} />
              </div>

              <div>
                <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                  <Badge variant="success">Tingkat Keamanan: Sangat Baik</Badge>
                  <Badge variant="primary">NIM: {user?.identityNumber || '21.01.0042'}</Badge>
                </div>
                <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', margin: 0 }}>
                  Pusat Keamanan & Privasi Akun Mahasiswa
                </h1>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  Kelola kredensial login, perlindungan 2FA, sesi perangkat aktif, dan audit aktivitas portal SALAM
                </p>
              </div>
            </div>

            <Button 
              variant="outline" 
              icon={ShieldAlert}
              onClick={() => setIsReportModalOpen(true)}
              style={{ color: '#d97706', borderColor: '#fde68a' }}
            >
              Lapor Aktivitas Mencurigakan
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 2. 4 Kartu Metrik Keamanan Cepat */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* Status 2FA */}
        <Card style={{ borderLeft: settings.twoFactorEnabled ? '4px solid var(--color-success-600)' : '4px solid var(--color-danger-main)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Otentikasi Dua Faktor</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: settings.twoFactorEnabled ? 'var(--color-success-700)' : 'var(--color-danger-main)', marginTop: '2px' }}>
                  {settings.twoFactorEnabled ? 'Aktif Terlindungi' : 'Nonaktif'}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: settings.twoFactorEnabled ? 'var(--color-success-50)' : 'var(--color-danger-bg)', color: settings.twoFactorEnabled ? 'var(--color-success-700)' : 'var(--color-danger-main)' }}>
                <KeyRound size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Metode: Email Resmi Kampus
            </div>
          </CardBody>
        </Card>

        {/* Pembaruan Kata Sandi */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Ubah Kata Sandi Terakhir</div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                  {new Date(settings.lastPasswordChange).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <Lock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-success-700)', marginTop: '4px' }}>
              Status: Kredensial Segar
            </div>
          </CardBody>
        </Card>

        {/* Sesi Perangkat Aktif */}
        <Card style={{ borderLeft: '4px solid #0284c7' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Sesi Perangkat Terhubung</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                  {settings.activeSessions.length} Perangkat
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <Laptop size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              1 Sesi Saat Ini • {settings.activeSessions.length - 1} Perangkat Lain
            </div>
          </CardBody>
        </Card>

        {/* Audit Log Aktivitas */}
        <Card style={{ borderLeft: '4px solid #8b5cf6' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Riwayat Audit Keamanan</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                  {settings.securityLogs.length} Rekaman
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <Activity size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#7c3aed', marginTop: '4px' }}>
              Log Tersinkronisasi Otomatis
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi Modul Keamanan */}
      <Card>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          <div 
            className="flex items-center gap-2 overflow-x-auto" 
            style={{ 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: 'var(--space-3)' 
            }}
          >
            <Button
              variant={activeTab === 'ubah_sandi' ? 'primary' : 'ghost'}
              size="sm"
              icon={Lock}
              onClick={() => setActiveTab('ubah_sandi')}
            >
              Ubah Kata Sandi
            </Button>
            <Button
              variant={activeTab === 'otentikasi_2fa' ? 'primary' : 'ghost'}
              size="sm"
              icon={KeyRound}
              onClick={() => setActiveTab('otentikasi_2fa')}
            >
              Otentikasi Dua Faktor (2FA)
            </Button>
            <Button
              variant={activeTab === 'sesi_perangkat' ? 'primary' : 'ghost'}
              size="sm"
              icon={Laptop}
              onClick={() => setActiveTab('sesi_perangkat')}
            >
              Sesi Perangkat Aktif ({settings.activeSessions.length})
            </Button>
            <Button
              variant={activeTab === 'log_aktivitas' ? 'primary' : 'ghost'}
              size="sm"
              icon={Activity}
              onClick={() => setActiveTab('log_aktivitas')}
            >
              Log Riwayat Aktivitas ({settings.securityLogs.length})
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* TAB 1: UBAH KATA SANDI */}
      {activeTab === 'ubah_sandi' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Ubah Sandi */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Perbarui Kata Sandi Akun SALAM</CardTitle>
                <CardSubtitle>Gunakan kombinasi kata sandi yang kuat dan belum pernah digunakan sebelumnya</CardSubtitle>
              </CardHeader>
              <CardBody>
                <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                  {/* Kata Sandi Lama */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      Kata Sandi Saat Ini
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan kata sandi lama Anda"
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: 'var(--text-sm)',
                          backgroundColor: 'var(--bg-default)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Kata Sandi Baru */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      Kata Sandi Baru
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Minimal 8 karakter kombinasi huruf & angka"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: 'var(--text-sm)',
                          backgroundColor: 'var(--bg-default)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>

                    {/* Kekuatan Sandi Bar */}
                    {passwordForm.newPassword && (
                      <div style={{ marginTop: '6px' }}>
                        <div className="flex justify-between items-center text-xs" style={{ marginBottom: '2px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Kekuatan Kata Sandi:</span>
                          <strong style={{ color: passwordStrength.color }}>{passwordStrength.label}</strong>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div 
                            style={{ 
                              width: `${(passwordStrength.score / 3) * 100}%`, 
                              height: '100%', 
                              backgroundColor: passwordStrength.color,
                              transition: 'width 0.3s ease'
                            }} 
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Konfirmasi Kata Sandi Baru */}
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                      Konfirmasi Kata Sandi Baru
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Ketik ulang kata sandi baru Anda"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 40px 10px 12px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          fontSize: 'var(--text-sm)',
                          backgroundColor: 'var(--bg-default)',
                          color: 'var(--text-primary)'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-2)' }}>
                    <Button variant="primary" type="submit" icon={Lock}>
                      Simpan Kata Sandi Baru
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          </div>

          {/* Panduan Kebijakan Sandi */}
          <div>
            <Card style={{ backgroundColor: 'var(--bg-subtle)' }}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} color="var(--color-primary-800)" />
                  <CardTitle>Standar Keamanan Kata Sandi</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} color="var(--color-success-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Minimal 8 karakter huruf dan angka.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} color="var(--color-success-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Kombinasi huruf besar (A-Z) dan kecil (a-z).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} color="var(--color-success-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Hindari menggunakan tanggal lahir atau NIM sebagai kata sandi.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} color="var(--color-success-600)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>Jangan pernah membagikan kata sandi kepada orang lain termasuk dosen atau staf.</span>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: OTENTIKASI DUA FAKTOR (2FA) */}
      {activeTab === 'otentikasi_2fa' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pengaturan 2FA */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Otentikasi Dua Faktor (2FA)</CardTitle>
              <CardSubtitle>Lapisan proteksi kedua untuk mengamankan data akademik dan nilai Anda</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div 
                className="flex justify-between items-center p-4 rounded-md"
                style={{ 
                  backgroundColor: settings.twoFactorEnabled ? 'var(--color-success-50)' : 'var(--bg-subtle)',
                  border: settings.twoFactorEnabled ? '1px solid var(--color-success-200)' : '1px solid var(--border-color)'
                }}
              >
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    Status 2FA Akun Mahasiswa
                  </strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    {settings.twoFactorEnabled 
                      ? 'Aktif: Kode verifikasi 6 digit dikirim ke email resmi kampus setiap login baru.'
                      : 'Nonaktif: Akun hanya dilindungi oleh satu lapis kata sandi biasa.'}
                  </p>
                </div>

                <Button
                  variant={settings.twoFactorEnabled ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleToggle2FA(!settings.twoFactorEnabled)}
                >
                  {settings.twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA'}
                </Button>
              </div>

              {/* Email Tujuan OTP */}
              <div className="flex flex-col gap-2 text-sm pt-2">
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Metode Verifikasi</span>
                  <strong>Email Resmi Kampus (@staialittihad.ac.id)</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Alamat Pengiriman OTP</span>
                  <strong>{settings.twoFactorEmail}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Kode Cadangan Darurat */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <CardTitle>Kode Cadangan Darurat (Backup Codes)</CardTitle>
                  <CardSubtitle>Gunakan jika Anda tidak dapat mengakses email kampus saat verifikasi</CardSubtitle>
                </div>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-md font-mono text-center text-xs"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}
              >
                {settings.backupCodes.map((code, idx) => (
                  <div key={idx} style={{ padding: '6px', backgroundColor: 'var(--bg-default)', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    {code}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 flex-wrap">
                <Button variant="outline" size="sm" icon={Copy} onClick={handleCopyBackupCodes}>
                  Salin Semua Kode
                </Button>
                <Button variant="secondary" size="sm" icon={RefreshCw} onClick={handleRegenerateBackupCodes}>
                  Buat Ulang Kode
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: SESI PERANGKAT AKTIF */}
      {activeTab === 'sesi_perangkat' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                <div>
                  <CardTitle>Daftar Perangkat yang Terhubung</CardTitle>
                  <CardSubtitle>Perangkat yang sedang login ke akun SALAM Anda</CardSubtitle>
                </div>

                {settings.activeSessions.length > 1 && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    icon={LogOut}
                    onClick={handleRevokeAllOtherSessions}
                  >
                    Keluarkan Dari Seluruh Perangkat Lain
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                {settings.activeSessions.map((session) => (
                  <div 
                    key={session.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-md"
                    style={{ 
                      backgroundColor: session.isCurrent ? 'var(--color-primary-50)' : 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      border: session.isCurrent ? '1px solid var(--color-primary-300)' : '1px solid var(--border-color)' 
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div 
                        style={{ 
                          padding: '10px', 
                          borderRadius: 'var(--radius-md)', 
                          backgroundColor: session.isCurrent ? 'var(--color-primary-100)' : 'var(--color-slate-100)',
                          color: session.isCurrent ? 'var(--color-primary-800)' : 'var(--text-muted)'
                        }}
                      >
                        {session.deviceType === 'MOBILE' ? (
                          <Smartphone size={24} />
                        ) : session.deviceType === 'TABLET' ? (
                          <Tablet size={24} />
                        ) : (
                          <Laptop size={24} />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                            {session.deviceName}
                          </strong>
                          {session.isCurrent && (
                            <Badge variant="success">Perangkat Ini (Sesi Saat Ini)</Badge>
                          )}
                        </div>

                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {session.browser} • {session.os}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          IP: {session.ipAddress} • Lokasi: {session.location}
                        </div>

                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Aktivitas Terakhir: {new Date(session.lastActive).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} pukul {new Date(session.lastActive).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </div>
                      </div>
                    </div>

                    {!session.isCurrent && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        icon={LogOut}
                        onClick={() => handleRevokeSession(session.id, session.deviceName)}
                        style={{ color: 'var(--color-danger-main)', borderColor: 'var(--color-danger-border)' }}
                      >
                        Cabut Sesi
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: LOG RIWAYAT AKTIVITAS */}
      {activeTab === 'log_aktivitas' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <CardTitle>Catatan Audit & Riwayat Keamanan Akun</CardTitle>
                  <CardSubtitle>Transparansi aktivitas masuk, perubahan kredensial, dan interaksi portal mahasiswa</CardSubtitle>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Table
                columns={logColumns}
                data={settings.securityLogs}
                keyExtractor={(item) => item.id}
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* MODAL LAPOR AKTIVITAS MENCURIGAKAN */}
      {isReportModalOpen && (
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          title="Laporkan Dugaan Insiden Keamanan ke PTIPD"
          maxWidth="600px"
        >
          <form onSubmit={handleSubmitReport} className="flex flex-col gap-4">
            <div 
              style={{ 
                padding: 'var(--space-3)', 
                backgroundColor: '#fffbeb', 
                border: '1px solid #fef3c7', 
                borderRadius: 'var(--radius-md)',
                color: '#b45309',
                fontSize: 'var(--text-xs)'
              }}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  Laporan Anda akan langsung diteruskan ke Tim Pusat Teknologi Informasi & Pangkalan Data (PTIPD) STAI AL-ITTIHAD untuk investigasi audit akun.
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Jenis Dugaan Insiden
              </label>
              <select
                value={reportIssue.issueType}
                onChange={(e) => setReportIssue({ ...reportIssue, issueType: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--bg-default)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="LOGIN_TIDAK_DIKENAL">Ada perangkat tak dikenal yang login ke akun saya</option>
                <option value="KATA_SANDI_BERUBAH">Kata sandi berubah tanpa sepengetahuan saya</option>
                <option value="DATA_AKADEMIK_BERUBAH">Nilai / Tugas / KRS berubah tanpa izin</option>
                <option value="DUGAAN_PHISHING">Menerima tautan mencurigakan mengatasnamakan kampus</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Keterangan & Rincian Kronologi Kejadian
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan perkiraan waktu, perangkat, atau indikasi aneh yang Anda temukan..."
                value={reportIssue.description}
                onChange={(e) => setReportIssue({ ...reportIssue, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--text-sm)',
                  backgroundColor: 'var(--bg-default)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="revokeOthers"
                checked={reportIssue.revokeOthers}
                onChange={(e) => setReportIssue({ ...reportIssue, revokeOthers: e.target.checked })}
              />
              <label htmlFor="revokeOthers" style={{ fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                <strong>Tindakan Darurat:</strong> Otomatis cabut seluruh sesi login di perangkat lain saat laporan dikirim.
              </label>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-3)' }}>
              <Button variant="secondary" type="button" onClick={() => setIsReportModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" icon={Send}>
                Kirim Laporan Darurat
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
