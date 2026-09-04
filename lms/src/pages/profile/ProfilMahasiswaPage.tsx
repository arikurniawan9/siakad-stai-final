import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Award, 
  CreditCard, 
  MapPin, 
  Phone, 
  Mail, 
  Printer, 
  Edit3, 
  CheckCircle2, 
  Sparkles, 
  QrCode, 
  ShieldCheck, 
  Building2, 
  GraduationCap, 
  TrendingUp, 
  Layers, 
  Save, 
  HeartHandshake
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { StudentFullProfile, UpdateProfilePayload } from '../../types/studentProfile';
import { studentProfileService } from '../../services/studentProfileService';

export interface ProfilMahasiswaPageProps {
  onNavigate?: (path: string) => void;
}

type ProfileTab = 'biodata_utama' | 'akademik_kemahasiswaan' | 'capaian_keislaman' | 'ktm_digital' | 'pengaturan_preferensi';

export const ProfilMahasiswaPage: React.FC<ProfilMahasiswaPageProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ProfileTab>('biodata_utama');
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isKtmPrintModalOpen, setIsKtmPrintModalOpen] = useState<boolean>(false);

  // Edit Form State
  const [editForm, setEditForm] = useState<UpdateProfilePayload>({
    personalEmail: '',
    phoneNumber: '',
    streetAddress: '',
    residenceType: 'ASRAMA_PESANTREN',
    dormitoryName: '',
    emergencyContact: {
      name: '',
      relationship: 'AYAH',
      phone: '',
      address: ''
    }
  });

  // Load Profile
  const loadProfile = () => {
    const studentId = user?.id || 'usr-mhs-01';
    const data = studentProfileService.getProfile(studentId);
    setProfile(data);
    setEditForm({
      personalEmail: data.personalEmail || '',
      phoneNumber: data.phoneNumber || '',
      streetAddress: data.streetAddress || '',
      residenceType: data.residenceType || 'ASRAMA_PESANTREN',
      dormitoryName: data.dormitoryName || '',
      emergencyContact: { ...data.emergencyContact }
    });
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  // Handle Update Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const studentId = user?.id || 'usr-mhs-01';
    const updated = studentProfileService.updateProfile(studentId, editForm);
    setProfile(updated);
    setIsEditModalOpen(false);
    toast.success('Profil Diperbarui', 'Perubahan informasi kontak dan domisili berhasil disimpan.');
  };

  const handlePrintKtm = () => {
    window.print();
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center p-12">
        <span>Memuat data profil mahasiswa...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Profile Banner */}
      <Card style={{ borderTop: '4px solid var(--color-primary-600)' }}>
        <CardBody style={{ padding: 'var(--space-6)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Foto Profil & Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div 
                style={{ 
                  width: '108px', 
                  height: '108px', 
                  borderRadius: 'var(--radius-full)', 
                  border: '3px solid var(--color-primary-500)', 
                  overflow: 'hidden',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '0', 
                  right: '0', 
                  backgroundColor: 'var(--color-success-600)', 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: 'var(--radius-full)', 
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
                title="Status Mahasiswa Aktif"
              >
                <CheckCircle2 size={14} />
              </div>
            </div>

            {/* Identitas Singkat */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
                <Badge variant="primary">NIM: {profile.nim}</Badge>
                <Badge variant="success">Mahasiswa Aktif</Badge>
                <Badge variant="default">Semester {profile.currentSemester}</Badge>
              </div>

              <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', margin: '4px 0' }}>
                {profile.name}
              </h1>

              {profile.arabicName && (
                <div 
                  style={{ 
                    fontSize: 'var(--text-lg)', 
                    color: 'var(--color-primary-800)', 
                    fontFamily: 'serif', 
                    direction: 'rtl',
                    marginBottom: '4px' 
                  }}
                >
                  {profile.arabicName}
                </div>
              )}

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                {profile.studyProgram} • Fakultas {profile.faculty} • STAI AL-ITTIHAD CIANJUR
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-center">
              <Button 
                variant="primary" 
                icon={CreditCard}
                onClick={() => setActiveTab('ktm_digital')}
              >
                KTM Digital
              </Button>
              <Button 
                variant="outline" 
                icon={Edit3}
                onClick={() => setIsEditModalOpen(true)}
              >
                Ubah Kontak
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 2. Ringkasan Metrik Akademik Cepat */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* IPK */}
        <Card style={{ borderLeft: '4px solid var(--color-success-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Indeks Prestasi Kumulatif</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-success-700)', marginTop: '2px' }}>
                  {profile.cumulativeGpa.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '4px' }}>
              Dengan Pujian (Cumlaude)
            </div>
          </CardBody>
        </Card>

        {/* SKS Selesai */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total SKS Ditempuh</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                  {profile.totalCreditsEarned} SKS
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
              Beban Depan: Maks. {profile.maxCreditsNextSemester} SKS
            </div>
          </CardBody>
        </Card>

        {/* Dosen PA */}
        <Card style={{ borderLeft: '4px solid #0284c7' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dosen Pembimbing Akademik</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: '#0369a1', marginTop: '4px' }}>
                  {profile.academicAdvisorName}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <GraduationCap size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              NIDN: {profile.academicAdvisorNidn}
            </div>
          </CardBody>
        </Card>

        {/* Capaian Tahfidz */}
        <Card style={{ borderLeft: '4px solid #8b5cf6' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Capaian Tahfidz & Turats</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                  5 Juz
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <Sparkles size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#7c3aed', marginTop: '4px' }}>
              Tasmi' Mutqin & Fathul Qarib
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi Profil */}
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
              variant={activeTab === 'biodata_utama' ? 'primary' : 'ghost'}
              size="sm"
              icon={User}
              onClick={() => setActiveTab('biodata_utama')}
            >
              Biodata Lengkap
            </Button>
            <Button
              variant={activeTab === 'akademik_kemahasiswaan' ? 'primary' : 'ghost'}
              size="sm"
              icon={GraduationCap}
              onClick={() => setActiveTab('akademik_kemahasiswaan')}
            >
              Data Akademik & Kurikulum
            </Button>
            <Button
              variant={activeTab === 'capaian_keislaman' ? 'primary' : 'ghost'}
              size="sm"
              icon={Award}
              onClick={() => setActiveTab('capaian_keislaman')}
            >
              Capaian Tahfidz & Keislaman
            </Button>
            <Button
              variant={activeTab === 'ktm_digital' ? 'primary' : 'ghost'}
              size="sm"
              icon={CreditCard}
              onClick={() => setActiveTab('ktm_digital')}
            >
              KTM Digital
            </Button>
            <Button
              variant={activeTab === 'pengaturan_preferensi' ? 'primary' : 'ghost'}
              size="sm"
              icon={ShieldCheck}
              onClick={() => setActiveTab('pengaturan_preferensi')}
            >
              Keamanan & Sesi
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* TAB 1: BIODATA LENGKAP */}
      {activeTab === 'biodata_utama' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Diri Kependudukan */}
          <Card>
            <CardHeader>
              <CardTitle>Identitas Kependudukan & Pribadi</CardTitle>
              <CardSubtitle>Data resmi yang tercatat pada Pangkalan Data DIKTI & Kemenag</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Nomor Induk Kependudukan (NIK)</span>
                  <strong>{profile.nik}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Tempat, Tanggal Lahir</span>
                  <strong>{profile.birthPlace}, {new Date(profile.birthDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Jenis Kelamin</span>
                  <strong>{profile.gender === 'LAKI_LAKI' ? 'Laki-laki' : 'Perempuan'}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Golongan Darah</span>
                  <strong>{profile.bloodType}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Agama</span>
                  <strong>{profile.religion}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--text-muted)' }}>Asal Sekolah Menengah</span>
                  <strong style={{ textAlign: 'right' }}>{profile.previousSchool}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Kontak & Tempat Tinggal */}
          <Card>
            <CardHeader>
              <CardTitle>Kontak & Domisili Mahasiswa</CardTitle>
              <CardSubtitle>Informasi komunikasi dan tempat tinggal selama masa studi</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={14} />
                    <span>Email Kampus</span>
                  </div>
                  <strong>{profile.email}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={14} />
                    <span>Email Pribadi</span>
                  </div>
                  <strong>{profile.personalEmail || '-'}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Phone size={14} />
                    <span>Nomor WhatsApp</span>
                  </div>
                  <strong>{profile.phoneNumber}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Building2 size={14} />
                    <span>Tipe Domisili</span>
                  </div>
                  <Badge variant="primary">{profile.residenceType.replace('_', ' ')}</Badge>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    <span>Asrama / Kos</span>
                  </div>
                  <strong style={{ textAlign: 'right' }}>{profile.dormitoryName || '-'}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--text-muted)' }}>Alamat KTP</span>
                  <strong style={{ textAlign: 'right', maxWidth: '280px' }}>
                    {profile.streetAddress}, {profile.rtRw}, {profile.village}, {profile.district}, {profile.regency}, {profile.province} {profile.postalCode}
                  </strong>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Kontak Darurat */}
          <Card className="lg:col-span-2" style={{ borderLeft: '4px solid #f59e0b' }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} color="#d97706" />
                <CardTitle>Kontak Darurat Orang Tua / Wali Santri</CardTitle>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nama Lengkap & Hubungan</div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {profile.emergencyContact.name} ({profile.emergencyContact.relationship})
                  </strong>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nomor Telepon Wali</div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-700)' }}>
                    {profile.emergencyContact.phone}
                  </strong>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Alamat Tempat Tinggal Wali</div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    {profile.emergencyContact.address}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: DATA AKADEMIK & KURIKULUM */}
      {activeTab === 'akademik_kemahasiswaan' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Kelembagaan & Riwayat Pendidikan</CardTitle>
              <CardSubtitle>Struktur kurikulum, bimbingan akademik, dan progres studi</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Program Studi</span>
                    <strong>{profile.studyProgram} ({profile.studyProgramCode})</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Jenjang Pendidikan</span>
                    <strong>{profile.degree}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Tahun Masuk / Angkatan</span>
                    <strong>{profile.entryYear}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Semester Berjalan</span>
                    <strong>Semester {profile.currentSemester} (Ganjil 2026/2027)</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: 'var(--text-muted)' }}>Status Akademik</span>
                    <Badge variant="success">{profile.academicStatus}</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Dosen Pembimbing Akademik</span>
                    <strong>{profile.academicAdvisorName}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>NIDN Dosen PA</span>
                    <strong>{profile.academicAdvisorNidn}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Total SKS Kumulatif Lulus</span>
                    <strong style={{ color: 'var(--color-success-700)' }}>{profile.totalCreditsEarned} SKS</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Indeks Prestasi Kumulatif (IPK)</span>
                    <strong style={{ color: 'var(--color-primary-700)' }}>{profile.cumulativeGpa.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: 'var(--text-muted)' }}>Pondok Pesantren Asal</span>
                    <strong style={{ textAlign: 'right' }}>{profile.pesantrenOrigin}</strong>
                  </div>
                </div>
              </div>

              {/* Tautan Pintas Modul Terkait */}
              {onNavigate && (
                <div 
                  className="flex justify-between items-center flex-wrap gap-2" 
                  style={{ 
                    marginTop: 'var(--space-6)', 
                    paddingTop: 'var(--space-4)', 
                    borderTop: '1px solid var(--border-color)' 
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Pintasan Layanan Akademik Mahasiswa Terkait:
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button variant="outline" size="sm" icon={BookOpen} onClick={() => onNavigate('/krs')}>
                      Kartu Rencana Studi (KRS)
                    </Button>
                    <Button variant="outline" size="sm" icon={Award} onClick={() => onNavigate('/khs')}>
                      Kartu Hasil Studi (KHS)
                    </Button>
                    <Button variant="outline" size="sm" icon={Layers} onClick={() => onNavigate('/buku-nilai')}>
                      Buku Nilai Perkuliahan
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: CAPAIAN TAHFIDZ & KEISLAMAN */}
      {activeTab === 'capaian_keislaman' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Portofolio Capaian Tahfidz & Pengkajian Kitab Turats</CardTitle>
              <CardSubtitle>Catatan prestasi keislaman, hafalan Al-Qur'an, dan sertifikasi keilmuan khas STAI AL-ITTIHAD</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                {profile.islamicAchievements.map((ach) => (
                  <div 
                    key={ach.id}
                    className="flex flex-col gap-2 p-4 rounded-md"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid var(--color-primary-600)'
                    }}
                  >
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{ach.category.replace('_', ' ')}</Badge>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          No. Sertifikat: {ach.certificateNumber}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(ach.dateEarned).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>

                    <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                      {ach.title}
                    </strong>

                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                      {ach.detail}
                    </p>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Dewan Penguji / Pembimbing: <strong>{ach.examinerName}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: KARTU TANDA MAHASISWA (KTM) DIGITAL */}
      {activeTab === 'ktm_digital' && (
        <div className="flex flex-col gap-6 items-center">
          {/* KTM Card Container */}
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '540px', 
              background: 'linear-gradient(135deg, #065f46 0%, #047857 60%, #064e3b 100%)', 
              color: 'white', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-6)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header KTM */}
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>
                  Sekolah Tinggi Agama Islam
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  STAI AL-ITTIHAD CIANJUR
                </div>
                <div style={{ fontSize: '9px', opacity: '0.75' }}>
                  KARTU TANDA MAHASISWA (KTM) ELEKTRONIK
                </div>
              </div>

              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <QrCode size={36} color="white" />
              </div>
            </div>

            {/* Body KTM */}
            <div className="flex gap-4 items-center" style={{ marginTop: 'var(--space-4)' }}>
              {/* Foto KTM */}
              <div 
                style={{ 
                  width: '90px', 
                  height: '110px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid white', 
                  overflow: 'hidden', 
                  backgroundColor: 'white',
                  flexShrink: 0 
                }}
              >
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Rincian Identitas */}
              <div className="flex flex-col gap-1 text-xs" style={{ flex: 1 }}>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>NAMA LENGKAP:</span>
                  <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: '#ecfdf5' }}>
                    {profile.name}
                  </div>
                </div>

                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>NOMOR INDUK MAHASISWA (NIM):</span>
                  <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', letterSpacing: '0.5px' }}>
                    {profile.nim}
                  </div>
                </div>

                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>PROGRAM STUDI:</span>
                  <div style={{ fontWeight: '600' }}>
                    {profile.studyProgram}
                  </div>
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '9px' }}>BERLAKU HINGGA:</span>
                    <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{profile.ktmValidUntil}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ opacity: 0.7, fontSize: '9px' }}>STATUS:</span>
                    <div style={{ fontWeight: 'bold', color: '#a7f3d0', fontSize: '10px' }}>AKTIF</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Barcode & Verification */}
            <div 
              className="flex justify-between items-center text-xs" 
              style={{ 
                marginTop: 'var(--space-4)', 
                paddingTop: 'var(--space-2)', 
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: '9px',
                opacity: 0.8
              }}
            >
              <span>KODE OTENTIKASI: {profile.ktmVerificationCode}</span>
              <span>PORTAL SALAM LMS</span>
            </div>
          </div>

          {/* Action Buttons for KTM */}
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="primary" 
              icon={Printer}
              onClick={() => setIsKtmPrintModalOpen(true)}
            >
              Cetak / Pratinjau KTM
            </Button>
          </div>
        </div>
      )}

      {/* TAB 5: PENGATURAN KEAMANAN & SESI */}
      {activeTab === 'pengaturan_preferensi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Keamanan Akun & Kredensial</CardTitle>
              <CardSubtitle>Pengelolaan kata sandi dan otentikasi login SALAM</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-subtle">
                  <div>
                    <strong>Kata Sandi Portal</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Terakhir diubah 30 hari yang lalu</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => onNavigate && onNavigate('/keamanan')}>
                    Ubah Kata Sandi
                  </Button>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-subtle">
                  <div>
                    <strong>Otentikasi Dua Faktor (2FA)</strong>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Proteksi tambahan saat login akun</div>
                  </div>
                  <Badge variant="success">Aktif (Email Kampus)</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sesi Perangkat Aktif</CardTitle>
              <CardSubtitle>Perangkat yang saat ini sedang login ke akun Anda</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3 text-sm">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-center">
                    <strong>Peramban Web Ini (Sesi Aktif)</strong>
                    <Badge variant="success">Sesi Sekarang</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Google Chrome di Windows • IP: 127.0.0.1 (Localhost)
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Login Terakhir: Hari ini, {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* MODAL 1: UBAH KONTAK & DOMISILI */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Ubah Kontak & Domisili Mahasiswa"
          maxWidth="640px"
        >
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Email Pribadi
                </label>
                <input
                  type="email"
                  required
                  value={editForm.personalEmail}
                  onChange={(e) => setEditForm({ ...editForm, personalEmail: e.target.value })}
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

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  type="text"
                  required
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
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
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Tipe Tempat Tinggal / Domisili
              </label>
              <select
                value={editForm.residenceType}
                onChange={(e) => setEditForm({ ...editForm, residenceType: e.target.value as any })}
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
                <option value="ASRAMA_PESANTREN">Asrama Pesantren / Ma'had Al-Ittihad</option>
                <option value="RUMAH_ORANG_TUA">Rumah Orang Tua</option>
                <option value="KOS_MANDIRI">Kos Mandiri Sekitar Kampus</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Nama Asrama / Alamat Kos
              </label>
              <input
                type="text"
                value={editForm.dormitoryName}
                onChange={(e) => setEditForm({ ...editForm, dormitoryName: e.target.value })}
                placeholder="Contoh: Asrama Ibnu Sina Kamar B-04"
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

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary-800)' }}>
                Kontak Darurat Orang Tua / Wali
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact?.name}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      emergencyContact: {
                        ...editForm.emergencyContact!,
                        name: e.target.value
                      }
                    })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--bg-default)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>No. Telepon Wali</label>
                  <input
                    type="text"
                    value={editForm.emergencyContact?.phone}
                    onChange={(e) => setEditForm({
                      ...editForm,
                      emergencyContact: {
                        ...editForm.emergencyContact!,
                        phone: e.target.value
                      }
                    })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: 'var(--text-xs)',
                      backgroundColor: 'var(--bg-default)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-3)' }}>
              <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" icon={Save}>
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: PRATINJAU CETAK KTM RESMI */}
      {isKtmPrintModalOpen && (
        <Modal
          isOpen={isKtmPrintModalOpen}
          onClose={() => setIsKtmPrintModalOpen(false)}
          title="Pratinjau Cetak Kartu Tanda Mahasiswa (KTM)"
          maxWidth="600px"
        >
          <div className="flex flex-col gap-5 items-center">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Dokumen KTM ini merupakan kartu identitas resmi mahasiswa STAI Al-Ittihad Cianjur yang sah secara digital.
            </p>

            {/* Print Card Mock */}
            <div 
              style={{ 
                width: '100%', 
                maxWidth: '460px', 
                background: '#047857', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '16px',
                border: '1px solid #065f46'
              }}
            >
              <div className="flex justify-between items-center border-b border-green-700 pb-2">
                <div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>STAI AL-ITTIHAD CIANJUR</div>
                  <strong style={{ fontSize: '13px' }}>KARTU TANDA MAHASISWA</strong>
                </div>
                <QrCode size={28} />
              </div>

              <div className="flex gap-3 items-center mt-3">
                <img 
                  src={profile.avatarUrl} 
                  alt={profile.name} 
                  style={{ width: '70px', height: '85px', borderRadius: '4px', objectFit: 'cover', border: '1px solid white' }}
                />
                <div className="flex flex-col gap-1 text-xs">
                  <div><strong>{profile.name}</strong></div>
                  <div>NIM: {profile.nim}</div>
                  <div>Prodi: {profile.studyProgram}</div>
                  <div>Berlaku s.d: {profile.ktmValidUntil}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 w-full">
              <Button variant="primary" icon={Printer} onClick={handlePrintKtm}>
                Cetak Dokumen
              </Button>
              <Button variant="secondary" onClick={() => setIsKtmPrintModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
