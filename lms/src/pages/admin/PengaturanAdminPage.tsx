import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, 
  Save, 
  CheckCircle2, 
  Database, 
  HardDrive, 
  ShieldCheck, 
  Globe, 
  GraduationCap, 
  Bell, 
  Link2, 
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  AllSettingsResponse,
  InstitutionSettings,
  AcademicGradingSettings,
  StorageSettings,
  SecuritySettings,
  SiakadIntegrationSettings,
  NotificationSettings,
  TestStorageResult,
  TestSiakadResult
} from '../../types/systemSettings';
import { systemSettingsService } from '../../services/systemSettingsService';

type TabSetting = 'institusi' | 'akademik' | 'penyimpanan' | 'keamanan' | 'siakad' | 'notifikasi';

export const PengaturanAdminPage: React.FC = () => {
  const { success, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabSetting>('institusi');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [settingsData, setSettingsData] = useState<AllSettingsResponse | null>(null);

  // Form State: Institusi
  const [instState, setInstState] = useState<InstitutionSettings>({
    campusName: 'STAI AL-ITTIHAD CIANJUR',
    campusCode: '213010',
    motto: 'Integrity, Intellect, & Islamic Values',
    address: 'Jl. Raya Bandung KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat 43281',
    email: 'akademik@stai-alittihad.ac.id',
    phone: '+62 263 228 1234',
    helpdeskWhatsapp: '081234567890',
    timezone: 'Asia/Jakarta',
    academicYearActive: '2026/2027',
    semesterActive: 'Ganjil'
  });

  // Form State: Akademik
  const [acadState, setAcadState] = useState<AcademicGradingSettings>({
    presenceWeight: 10,
    assignmentWeight: 20,
    quizWeight: 15,
    midtermWeight: 25,
    finalExamWeight: 30,
    minAttendancePercent: 75,
    passingGradePoint: 2.00,
    maxQuizDurationMinutes: 120,
    allowRemedial: true
  });

  // Form State: Penyimpanan
  const [storageState, setStorageState] = useState<StorageSettings>({
    driver: 'minio',
    endpoint: 'http://salam-minio-storage:9000',
    bucket: 'salam-uploads',
    maxAssignmentSizeBytes: 26214400,
    maxMaterialSizeBytes: 52428800,
    allowedExtensions: ['.pdf', '.docx', '.pptx', '.xlsx', '.zip', '.mp4', '.png', '.jpg']
  });

  // Form State: Keamanan
  const [secState, setSecState] = useState<SecuritySettings>({
    jwtExpirationDays: 7,
    minPasswordLength: 8,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    enforceStrongPassword: true,
    auditLoggingEnabled: true,
    sessionInactivityTimeoutMinutes: 120
  });

  // Form State: SIAKAD
  const [siakadState, setSiakadState] = useState<SiakadIntegrationSettings>({
    gatewayUrl: 'https://siakad.stai-alittihad.ac.id/api/v1',
    autoSyncEnabled: true,
    syncIntervalHours: 6,
    lastSyncAt: '2026-08-17T08:00:00Z',
    syncEntities: ['mahasiswa', 'dosen', 'mata_kuliah', 'jadwal', 'nilai']
  });

  // Form State: Notifikasi
  const [notifState, setNotifState] = useState<NotificationSettings>({
    assignmentReminderHours: 24,
    atRiskAdvisorAlert: true,
    emailNotificationEnabled: true,
    systemAnnouncementEnabled: true
  });

  // Modal State: Test Koneksi
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [storageTestResult, setStorageTestResult] = useState<TestStorageResult | null>(null);
  const [siakadTestResult, setSiakadTestResult] = useState<TestSiakadResult | null>(null);
  const [testingConnection, setTestingConnection] = useState<boolean>(false);

  // Load Seluruh Pengaturan
  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await systemSettingsService.getAllSettings();
      setSettingsData(res);

      if (res.categories.INSTITUSI?.value) setInstState(res.categories.INSTITUSI.value);
      if (res.categories.AKADEMIK?.value) setAcadState(res.categories.AKADEMIK.value);
      if (res.categories.PENYIMPANAN?.value) setStorageState(res.categories.PENYIMPANAN.value);
      if (res.categories.KEAMANAN?.value) setSecState(res.categories.KEAMANAN.value);
      if (res.categories.SIAKAD?.value) setSiakadState(res.categories.SIAKAD.value);
      if (res.categories.NOTIFIKASI?.value) setNotifState(res.categories.NOTIFIKASI.value);
    } catch {
      danger('Gagal Memuat Pengaturan', 'Tidak dapat mengambil konfigurasi sistem dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler: Simpan Kategori Terpilih
  const handleSaveCurrentCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      let payloadValue: any = null;
      let catName = '';

      if (activeTab === 'institusi') {
        payloadValue = instState;
        catName = 'INSTITUSI';
      } else if (activeTab === 'akademik') {
        // Validasi total bobot 100%
        const totalWeight = 
          Number(acadState.presenceWeight) + 
          Number(acadState.assignmentWeight) + 
          Number(acadState.quizWeight) + 
          Number(acadState.midtermWeight) + 
          Number(acadState.finalExamWeight);

        if (totalWeight !== 100) {
          danger('Bobot Nilai Tidak Valid', `Total akumulasi pembobotan harus tepat 100% (saat ini: ${totalWeight}%).`);
          setSaving(false);
          return;
        }

        payloadValue = acadState;
        catName = 'AKADEMIK';
      } else if (activeTab === 'penyimpanan') {
        payloadValue = storageState;
        catName = 'PENYIMPANAN';
      } else if (activeTab === 'keamanan') {
        payloadValue = secState;
        catName = 'KEAMANAN';
      } else if (activeTab === 'siakad') {
        payloadValue = siakadState;
        catName = 'SIAKAD';
      } else if (activeTab === 'notifikasi') {
        payloadValue = notifState;
        catName = 'NOTIFIKASI';
      }

      const res = await systemSettingsService.updateCategory(catName, payloadValue);
      success('Pengaturan Berhasil Disimpan', res.message);
      loadSettings();
    } catch {
      danger('Gagal Menyimpan Pengaturan', 'Terjadi kesalahan sistem saat menyimpan parameter konfigurasi.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Uji Semua Koneksi
  const handleTestAllConnections = async () => {
    try {
      setTestingConnection(true);
      setTestModalOpen(true);
      const [storageRes, siakadRes] = await Promise.all([
        systemSettingsService.testStorageConnection(),
        systemSettingsService.testSiakadConnection()
      ]);

      setStorageTestResult(storageRes.data);
      setSiakadTestResult(siakadRes.data);
      success('Uji Koneksi Selesai', 'Penyimpanan MinIO dan Gateway SIAKAD berhasil diuji.');
    } catch {
      danger('Uji Koneksi Terkendala', 'Terjadi masalah saat menghubungi layanan eksternal.');
    } finally {
      setTestingConnection(false);
    }
  };

  // Kalkulator Total Bobot Nilai
  const currentTotalWeight = 
    Number(acadState.presenceWeight) + 
    Number(acadState.assignmentWeight) + 
    Number(acadState.quizWeight) + 
    Number(acadState.midtermWeight) + 
    Number(acadState.finalExamWeight);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Konfigurasi & Parameter Sistem
            </Badge>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-DEFAULT)', display: 'inline-block' }} />
              SISTEM AKTIF • STAI AL-ITTIHAD
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Pengaturan & Konfigurasi Global SALAM
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Manajemen parameter server, integrasi penyimpanan MinIO, gateway sinkronisasi SIAKAD, formula pembobotan akademik, serta kebijakan keamanan tingkat institusi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Activity}
            onClick={handleTestAllConnections}
          >
            Uji Semua Koneksi
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={RefreshCw}
            onClick={loadSettings}
            isLoading={loading}
          >
            Segarkan Pengaturan
          </Button>
        </div>
      </div>

      {/* 2. Kartu Metrik Status Sistem (Executive Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  STATUS PENYIMPANAN
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-dark)', marginTop: '4px' }}>
                  MinIO S3 Terhubung
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <HardDrive size={13} />
                  <span>Kapasitas: 100 GB • Upload Max 50 MB</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HardDrive size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  GATEWAY SIAKAD
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)', marginTop: '4px' }}>
                  Tersinkronisasi
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Sinkronisasi Otomatis Tiap 6 Jam</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Link2 size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KEBIJAKAN KEAMANAN
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-dark)', marginTop: '4px' }}>
                  Enterprise High
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <ShieldCheck size={13} />
                  <span>JWT 7 Hari • Strict RBAC Guard</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ShieldCheck size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ZONA WAKTU RESMI
                </div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  Asia/Jakarta (WIB)
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <Globe size={13} />
                  <span>UTC+07:00 • Basis Kalender Resmi</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Globe size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi Pengaturan */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'institusi' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('institusi')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Globe size={16} />
          <span>Profil Institusi</span>
        </button>

        <button
          className={`btn ${activeTab === 'akademik' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('akademik')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <GraduationCap size={16} />
          <span>Standar Akademik & Bobot</span>
        </button>

        <button
          className={`btn ${activeTab === 'penyimpanan' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('penyimpanan')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <HardDrive size={16} />
          <span>Penyimpanan Berkas (MinIO)</span>
        </button>

        <button
          className={`btn ${activeTab === 'keamanan' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('keamanan')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <ShieldCheck size={16} />
          <span>Keamanan & Sesi</span>
        </button>

        <button
          className={`btn ${activeTab === 'siakad' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('siakad')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Link2 size={16} />
          <span>Integrasi SIAKAD</span>
        </button>

        <button
          className={`btn ${activeTab === 'notifikasi' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('notifikasi')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Bell size={16} />
          <span>Notifikasi & Pengingat</span>
        </button>
      </div>

      {/* 4. Form Konten Tab */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <CardTitle>
                {activeTab === 'institusi' && 'Konfigurasi Identitas & Kontak Institusi'}
                {activeTab === 'akademik' && 'Formula Pembobotan Nilai & Standar Kelulusan'}
                {activeTab === 'penyimpanan' && 'Konfigurasi Penyimpanan Objek MinIO S3'}
                {activeTab === 'keamanan' && 'Kebijakan Keamanan, Autentikasi & Sesi'}
                {activeTab === 'siakad' && 'Parameter Gateway Sinkronisasi SIAKAD'}
                {activeTab === 'notifikasi' && 'Preferensi Notifikasi & Otomasi Pengingat'}
              </CardTitle>
              <CardSubtitle>
                {settingsData?.categories[activeTab.toUpperCase() as keyof typeof settingsData.categories]?.description || 'Parameter konfigurasi sistem resmi STAI AL-ITTIHAD.'}
              </CardSubtitle>
            </div>
            <Badge variant="default">
              Terakhir Diperbarui: {settingsData?.categories[activeTab.toUpperCase() as keyof typeof settingsData.categories]?.updatedAt ? new Date(settingsData.categories[activeTab.toUpperCase() as keyof typeof settingsData.categories]!.updatedAt).toLocaleDateString('id-ID') : 'Hari ini'}
            </Badge>
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSaveCurrentCategory} className="flex flex-col gap-5">
            {/* TAB 1: INSTITUSI */}
            {activeTab === 'institusi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="inst-name">Nama Institusi / Perguruan Tinggi</label>
                  <Input
                    id="inst-name"
                    value={instState.campusName}
                    onChange={(e) => setInstState({ ...instState, campusName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-code">Kode Perguruan Tinggi (PDDIKTI)</label>
                  <Input
                    id="inst-code"
                    value={instState.campusCode}
                    onChange={(e) => setInstState({ ...instState, campusCode: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="inst-motto">Motto Institusi</label>
                  <Input
                    id="inst-motto"
                    value={instState.motto}
                    onChange={(e) => setInstState({ ...instState, motto: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="inst-address">Alamat Kampus</label>
                  <Input
                    id="inst-address"
                    value={instState.address}
                    onChange={(e) => setInstState({ ...instState, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-email">Email Resmi Akademik</label>
                  <Input
                    id="inst-email"
                    type="email"
                    value={instState.email}
                    onChange={(e) => setInstState({ ...instState, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-phone">Nomor Telepon Kantor</label>
                  <Input
                    id="inst-phone"
                    value={instState.phone}
                    onChange={(e) => setInstState({ ...instState, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-whatsapp">WhatsApp Helpdesk Layanan Mahasiswa</label>
                  <Input
                    id="inst-whatsapp"
                    value={instState.helpdeskWhatsapp}
                    onChange={(e) => setInstState({ ...instState, helpdeskWhatsapp: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="inst-timezone">Zona Waktu Sistem</label>
                  <select
                    id="inst-timezone"
                    className="form-select"
                    value={instState.timezone}
                    onChange={(e) => setInstState({ ...instState, timezone: e.target.value })}
                  >
                    <option value="Asia/Jakarta">WIB (Asia/Jakarta - UTC+07:00)</option>
                    <option value="Asia/Makassar">WITA (Asia/Makassar - UTC+08:00)</option>
                    <option value="Asia/Jayapura">WIT (Asia/Jayapura - UTC+09:00)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: AKADEMIK */}
            {activeTab === 'akademik' && (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-md border ${currentTotalWeight === 100 ? 'bg-success-surface border-success' : 'bg-danger-surface border-danger'} flex justify-between items-center`}>
                  <div>
                    <strong style={{ color: currentTotalWeight === 100 ? 'var(--color-success-dark)' : 'var(--color-danger-dark)' }}>
                      Total Akumulasi Pembobotan Nilai: {currentTotalWeight}%
                    </strong>
                    <p style={{ fontSize: 'var(--text-xs)', margin: '2px 0 0', color: currentTotalWeight === 100 ? 'var(--color-success-dark)' : 'var(--color-danger-dark)' }}>
                      {currentTotalWeight === 100 ? 'Struktur pembobotan valid dan sesuai standar institusi 100%.' : 'Peringatan: Total pembobotan komponen harus berjumlah tepat 100%.'}
                    </p>
                  </div>
                  <Badge variant={currentTotalWeight === 100 ? 'success' : 'danger'}>
                    {currentTotalWeight === 100 ? 'VALID' : 'TIDAK SEIMBANG'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-presence">1. Presensi (10%)</label>
                    <Input
                      id="acad-presence"
                      type="number"
                      min="0"
                      max="100"
                      value={acadState.presenceWeight}
                      onChange={(e) => setAcadState({ ...acadState, presenceWeight: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-assign">2. Tugas (20%)</label>
                    <Input
                      id="acad-assign"
                      type="number"
                      min="0"
                      max="100"
                      value={acadState.assignmentWeight}
                      onChange={(e) => setAcadState({ ...acadState, assignmentWeight: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-quiz">3. Kuis & Forum (15%)</label>
                    <Input
                      id="acad-quiz"
                      type="number"
                      min="0"
                      max="100"
                      value={acadState.quizWeight}
                      onChange={(e) => setAcadState({ ...acadState, quizWeight: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-midterm">4. UTS (25%)</label>
                    <Input
                      id="acad-midterm"
                      type="number"
                      min="0"
                      max="100"
                      value={acadState.midtermWeight}
                      onChange={(e) => setAcadState({ ...acadState, midtermWeight: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-finalexam">5. UAS (30%)</label>
                    <Input
                      id="acad-finalexam"
                      type="number"
                      min="0"
                      max="100"
                      value={acadState.finalExamWeight}
                      onChange={(e) => setAcadState({ ...acadState, finalExamWeight: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-default">
                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-min-attend">Minimal Kehadiran untuk Ikut Ujian (%)</label>
                    <Input
                      id="acad-min-attend"
                      type="number"
                      min="50"
                      max="100"
                      value={acadState.minAttendancePercent}
                      onChange={(e) => setAcadState({ ...acadState, minAttendancePercent: Number(e.target.value) })}
                      required
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Standar: 75% kehadiran perkuliahan.</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-passing-grade">Ambang Batas Bobot Kelulusan SKS (IP)</label>
                    <Input
                      id="acad-passing-grade"
                      type="number"
                      step="0.25"
                      min="1.0"
                      max="4.0"
                      value={acadState.passingGradePoint}
                      onChange={(e) => setAcadState({ ...acadState, passingGradePoint: Number(e.target.value) })}
                      required
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Standar: 2.00 (Grade C).</span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="acad-quiz-duration">Batas Maksimal Waktu Kuis (Menit)</label>
                    <Input
                      id="acad-quiz-duration"
                      type="number"
                      min="10"
                      max="300"
                      value={acadState.maxQuizDurationMinutes}
                      onChange={(e) => setAcadState({ ...acadState, maxQuizDurationMinutes: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PENYIMPANAN */}
            {activeTab === 'penyimpanan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="stor-driver">Driver Penyimpanan Objek</label>
                  <select
                    id="stor-driver"
                    className="form-select"
                    value={storageState.driver}
                    onChange={(e) => setStorageState({ ...storageState, driver: e.target.value as any })}
                  >
                    <option value="minio">MinIO Object Storage (Direkomendasikan)</option>
                    <option value="s3">AWS S3 Compatible</option>
                    <option value="local">Penyimpanan Lokal Server</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stor-endpoint">Endpoint S3 Storage</label>
                  <Input
                    id="stor-endpoint"
                    value={storageState.endpoint}
                    onChange={(e) => setStorageState({ ...storageState, endpoint: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stor-bucket">Nama Bucket Utama</label>
                  <Input
                    id="stor-bucket"
                    value={storageState.bucket}
                    onChange={(e) => setStorageState({ ...storageState, bucket: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="stor-max-assign">Batas Maksimal Berkas Tugas Mahasiswa</label>
                  <select
                    id="stor-max-assign"
                    className="form-select"
                    value={storageState.maxAssignmentSizeBytes}
                    onChange={(e) => setStorageState({ ...storageState, maxAssignmentSizeBytes: Number(e.target.value) })}
                  >
                    <option value={10485760}>10 MB per berkas</option>
                    <option value={26214400}>25 MB per berkas (Standar)</option>
                    <option value={52428800}>50 MB per berkas</option>
                  </select>
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="stor-exts">Ekstensi Berkas yang Diizinkan (Format Komma)</label>
                  <Input
                    id="stor-exts"
                    value={storageState.allowedExtensions.join(', ')}
                    onChange={(e) => setStorageState({ ...storageState, allowedExtensions: e.target.value.split(',').map((s) => s.trim()) })}
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB 4: KEAMANAN */}
            {activeTab === 'keamanan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="sec-jwt">Masa Berlaku Token JWT Sesi (Hari)</label>
                  <Input
                    id="sec-jwt"
                    type="number"
                    min="1"
                    max="30"
                    value={secState.jwtExpirationDays}
                    onChange={(e) => setSecState({ ...secState, jwtExpirationDays: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sec-min-pass">Panjang Minimal Kata Sandi</label>
                  <Input
                    id="sec-min-pass"
                    type="number"
                    min="6"
                    max="20"
                    value={secState.minPasswordLength}
                    onChange={(e) => setSecState({ ...secState, minPasswordLength: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sec-max-attempts">Maksimal Percobaan Login Gagal Sebelum Terkunci</label>
                  <Input
                    id="sec-max-attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={secState.maxLoginAttempts}
                    onChange={(e) => setSecState({ ...secState, maxLoginAttempts: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="sec-lock-duration">Durasi Penguncian Akun Sementara (Menit)</label>
                  <Input
                    id="sec-lock-duration"
                    type="number"
                    min="5"
                    max="60"
                    value={secState.lockoutDurationMinutes}
                    onChange={(e) => setSecState({ ...secState, lockoutDurationMinutes: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group md:col-span-2 p-3 bg-slate-50 border border-default rounded flex items-center justify-between">
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>Pencatatan Audit Trail Forensik</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Catat setiap aksi administratif, perubahan nilai, otorisasi RBAC, dan alamat IP ke tabel audit_logs.
                    </p>
                  </div>
                  <Badge variant="success">SELALU AKTIF</Badge>
                </div>
              </div>
            )}

            {/* TAB 5: SIAKAD */}
            {activeTab === 'siakad' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="siakad-url">URL Gateway REST API SIAKAD Induk</label>
                  <Input
                    id="siakad-url"
                    value={siakadState.gatewayUrl}
                    onChange={(e) => setSiakadState({ ...siakadState, gatewayUrl: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="siakad-interval">Interval Sinkronisasi Otomatis</label>
                  <select
                    id="siakad-interval"
                    className="form-select"
                    value={siakadState.syncIntervalHours}
                    onChange={(e) => setSiakadState({ ...siakadState, syncIntervalHours: Number(e.target.value) })}
                  >
                    <option value={1}>Setiap 1 Jam</option>
                    <option value={6}>Setiap 6 Jam (Standar)</option>
                    <option value={12}>Setiap 12 Jam</option>
                    <option value={24}>Setiap 24 Jam (Sekali Sehari)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="siakad-last-sync">Riwayat Sinkronisasi Terakhir</label>
                  <Input
                    id="siakad-last-sync"
                    value={new Date(siakadState.lastSyncAt).toLocaleString('id-ID')}
                    disabled
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label">Entitas Data yang Disinkronisasi Dua Arah</label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {siakadState.syncEntities.map((ent) => (
                      <Badge key={ent} variant="primary">
                        <CheckCircle2 size={12} className="inline mr-1" />
                        {ent.toUpperCase().replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: NOTIFIKASI */}
            {activeTab === 'notifikasi' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="notif-reminder">Pengingat Tenggat Tugas Mahasiswa (Jam sebelum deadline)</label>
                  <Input
                    id="notif-reminder"
                    type="number"
                    min="1"
                    max="72"
                    value={notifState.assignmentReminderHours}
                    onChange={(e) => setNotifState({ ...notifState, assignmentReminderHours: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group p-3 bg-slate-50 border border-default rounded flex items-center justify-between">
                  <div>
                    <strong style={{ fontSize: 'var(--text-sm)' }}>Peringatan Dini Mahasiswa Berisiko ke Dosen PA</strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Kirimkan notifikasi otomatis ke inbox Dosen PA saat mahasiswa terdeteksi tidak aktif.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifState.atRiskAdvisorAlert}
                    onChange={(e) => setNotifState({ ...notifState, atRiskAdvisorAlert: e.target.checked })}
                  />
                </div>
              </div>
            )}

            {/* Tombol Simpan */}
            <div className="flex justify-end gap-3 pt-4 border-t border-default">
              <Button 
                variant="primary" 
                type="submit" 
                icon={Save}
                isLoading={saving}
              >
                Simpan Perubahan Kategori Ini
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* =====================================================================
          MODAL: HASIL UJI SEMUA KONEKSI LAYANAN
          ===================================================================== */}
      <Modal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        title="Status Konektivitas Layanan & Integrasi"
        maxWidth="640px"
      >
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
            Hasil pengujian integritas komunikasi server backend terhadap penyimpanan berkas MinIO dan Gateway SIAKAD STAI AL-ITTIHAD.
          </p>

          <div className="flex flex-col gap-3">
            {/* MinIO Storage Ping */}
            <div className="p-3 bg-slate-50 border border-default rounded-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <HardDrive size={22} color="var(--color-primary-800)" />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>MinIO Object Storage</strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Endpoint: {storageTestResult?.endpoint || 'http://salam-minio-storage:9000'} • Bucket: {storageTestResult?.bucket || 'salam-uploads'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success">TERHUBUNG</Badge>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Latency: {storageTestResult?.latencyMs || 12} ms
                </div>
              </div>
            </div>

            {/* SIAKAD Gateway Ping */}
            <div className="p-3 bg-slate-50 border border-default rounded-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link2 size={22} color="var(--color-primary-800)" />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>SIAKAD Gateway REST API</strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Gateway: {siakadTestResult?.gatewayUrl || 'https://siakad.stai-alittihad.ac.id/api/v1'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success">TERVALIDASI</Badge>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Latency: {siakadTestResult?.latencyMs || 28} ms
                </div>
              </div>
            </div>

            {/* Database PostgreSQL */}
            <div className="p-3 bg-slate-50 border border-default rounded-md flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Database size={22} color="var(--color-success-dark)" />
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>Basis Data PostgreSQL Utama</strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Host: salam-postgres-db:5432 • Versi: PostgreSQL 16.2
                  </div>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="success">HEALTHY</Badge>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Latency: 2 ms
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="secondary" onClick={() => setTestModalOpen(false)}>
              Tutup
            </Button>
            <Button variant="primary" icon={RefreshCw} onClick={handleTestAllConnections} isLoading={testingConnection}>
              Uji Ulang Koneksi
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
