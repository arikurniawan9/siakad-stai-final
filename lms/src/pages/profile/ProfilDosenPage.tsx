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
  Building2, 
  GraduationCap, 
  Save, 
  Users, 
  QrCode 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { LecturerFullProfile, UpdateLecturerProfilePayload } from '../../types/lecturerProfile';
import { lecturerProfileService } from '../../services/lecturerProfileService';

export interface ProfilDosenPageProps {
  onNavigate?: (path: string) => void;
}

type LecturerProfileTab = 'biodata_kepegawaian' | 'jabatan_kinerja' | 'mata_kuliah_diampu' | 'riwayat_pendidikan' | 'publikasi_karya' | 'ktd_digital';

export const ProfilDosenPage: React.FC<ProfilDosenPageProps> = ({
  onNavigate
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<LecturerProfileTab>('biodata_kepegawaian');
  const [profile, setProfile] = useState<LecturerFullProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isKtdPrintModalOpen, setIsKtdPrintModalOpen] = useState<boolean>(false);

  // Edit Form State
  const [editForm, setEditForm] = useState<UpdateLecturerProfilePayload>({
    personalEmail: '',
    phoneNumber: '',
    streetAddress: '',
    sintaId: '',
    googleScholarId: ''
  });

  const loadProfile = () => {
    if (!user) return;
    const data = lecturerProfileService.getProfile(user);
    setProfile(data);
    setEditForm({
      personalEmail: data.personalEmail || '',
      phoneNumber: data.phoneNumber || '',
      streetAddress: data.streetAddress || '',
      sintaId: data.sintaId || '',
      googleScholarId: data.googleScholarId || ''
    });
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const updated = lecturerProfileService.updateProfile(user, editForm);
    setProfile(updated);
    setIsEditModalOpen(false);
    toast.success('Profil Diperbarui', 'Perubahan informasi kontak dosen berhasil disimpan.');
  };

  const handlePrintKtd = () => {
    window.print();
  };

  if (!profile) {
    return (
      <div className="flex justify-center items-center p-12">
        <span>Memuat data profil dosen pengampu...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Profile Banner */}
      <Card style={{ borderTop: '4px solid var(--color-primary-600)' }}>
        <CardBody style={{ padding: 'var(--space-6)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Foto Profil Dosen */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div 
                style={{ 
                  width: '112px', 
                  height: '112px', 
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
                  width: '26px', 
                  height: '26px', 
                  borderRadius: 'var(--radius-full)', 
                  border: '2px solid white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
                title="Status Dosen Aktif Mengajar"
              >
                <CheckCircle2 size={16} />
              </div>
            </div>

            {/* Identitas Singkat Dosen */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
                <Badge variant="primary">NIDN: {profile.nidn}</Badge>
                {profile.nip && <Badge variant="default">NIP: {profile.nip}</Badge>}
                <Badge variant="success">{profile.academicPosition}</Badge>
                {profile.isSerdos && <Badge variant="primary">Tersertifikasi Pendidik (Serdos)</Badge>}
              </div>

              <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)', margin: '4px 0' }}>
                {profile.titleWithDegree}
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
                Fakultas {profile.faculty} • Homebase: {profile.studyProgram} • STAI AL-ITTIHAD CIANJUR
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto justify-center">
              <Button 
                variant="primary" 
                icon={CreditCard}
                onClick={() => setActiveTab('ktd_digital')}
              >
                KTD Digital
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

      {/* 2. 4 Kartu Metrik BKD & Kinerja Cepat */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* Beban Mengajar */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Beban Mengajar Semester Ini</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                  {profile.totalTeachingCredits} SKS
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '4px' }}>
              Memenuhi Standar BKD (12-16 SKS)
            </div>
          </CardBody>
        </Card>

        {/* Mahasiswa Bimbingan PA */}
        <Card style={{ borderLeft: '4px solid #0284c7' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Bimbingan Akademik (PA)</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                  {profile.mentoredStudentsCount} Mahasiswa
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Persetujuan KRS & Evaluasi Studi
            </div>
          </CardBody>
        </Card>

        {/* Bimbingan Skripsi */}
        <Card style={{ borderLeft: '4px solid #8b5cf6' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Bimbingan Tugas Akhir / Skripsi</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                  {profile.thesisStudentsCount} Mahasiswa
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <GraduationCap size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: '#7c3aed', marginTop: '4px' }}>
              Munaqasyah & Ujian Proposal
            </div>
          </CardBody>
        </Card>

        {/* Publikasi & Riset */}
        <Card style={{ borderLeft: '4px solid var(--color-success-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Karya Ilmiah & Publikasi</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-success-700)', marginTop: '2px' }}>
                  {profile.publications.length} Karya
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
                <Award size={20} />
              </div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--color-success-700)', marginTop: '4px' }}>
              Jurnal SINTA & Buku Ajar
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi Profil Dosen */}
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
              variant={activeTab === 'biodata_kepegawaian' ? 'primary' : 'ghost'}
              size="sm"
              icon={User}
              onClick={() => setActiveTab('biodata_kepegawaian')}
            >
              Biodata & Kontak
            </Button>
            <Button
              variant={activeTab === 'jabatan_kinerja' ? 'primary' : 'ghost'}
              size="sm"
              icon={Building2}
              onClick={() => setActiveTab('jabatan_kinerja')}
            >
              Jabatan & Status BKD
            </Button>
            <Button
              variant={activeTab === 'mata_kuliah_diampu' ? 'primary' : 'ghost'}
              size="sm"
              icon={BookOpen}
              onClick={() => setActiveTab('mata_kuliah_diampu')}
            >
              Mata Kuliah Diampu ({profile.teachingCourses.length})
            </Button>
            <Button
              variant={activeTab === 'riwayat_pendidikan' ? 'primary' : 'ghost'}
              size="sm"
              icon={GraduationCap}
              onClick={() => setActiveTab('riwayat_pendidikan')}
            >
              Riwayat Pendidikan & Pesantren
            </Button>
            <Button
              variant={activeTab === 'publikasi_karya' ? 'primary' : 'ghost'}
              size="sm"
              icon={Award}
              onClick={() => setActiveTab('publikasi_karya')}
            >
              Karya Ilmiah & Riset ({profile.publications.length})
            </Button>
            <Button
              variant={activeTab === 'ktd_digital' ? 'primary' : 'ghost'}
              size="sm"
              icon={CreditCard}
              onClick={() => setActiveTab('ktd_digital')}
            >
              KTD Digital
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* TAB 1: BIODATA & KONTAK */}
      {activeTab === 'biodata_kepegawaian' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Identitas Resmi Dosen</CardTitle>
              <CardSubtitle>Data resmi terdaftar pada Pangkalan Data DIKTI & EMIS Kemenag</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-subtle">
                  <span style={{ color: 'var(--text-muted)' }}>Nomor Induk Dosen Nasional (NIDN)</span>
                  <strong style={{ color: 'var(--color-primary-800)' }}>{profile.nidn}</strong>
                </div>
                {profile.nip && (
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Nomor Induk Pegawai (NIP / NPK)</span>
                    <strong>{profile.nip}</strong>
                  </div>
                )}
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
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--text-muted)' }}>Agama</span>
                  <strong>{profile.religion}</strong>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kontak & Tempat Tinggal</CardTitle>
              <CardSubtitle>Komunikasi resmi dan alamat korespondensi akademik</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Mail size={14} />
                    <span>Email Resmi Kampus</span>
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
                    <span>Nomor WhatsApp / Seluler</span>
                  </div>
                  <strong>{profile.phoneNumber}</strong>
                </div>
                <div className="flex justify-between py-2 border-b border-subtle items-center">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <MapPin size={14} />
                    <span>Kota Domisili</span>
                  </div>
                  <strong>{profile.regency}</strong>
                </div>
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--text-muted)' }}>Alamat Lengkap</span>
                  <strong style={{ textAlign: 'right', maxWidth: '280px' }}>
                    {profile.streetAddress}, {profile.village}, {profile.district}, {profile.regency}, {profile.province} {profile.postalCode}
                  </strong>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: JABATAN & STATUS BKD */}
      {activeTab === 'jabatan_kinerja' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Jabatan Fungsional & Kualifikasi Dosen</CardTitle>
              <CardSubtitle>Kepangkatan akademik, sertifikasi dosen, dan homebase program studi</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Jabatan Fungsional Akademik</span>
                    <strong style={{ color: 'var(--color-primary-800)' }}>{profile.academicPosition}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Pangkat & Golongan Ruang</span>
                    <strong>{profile.rankAndGrade}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Fakultas</span>
                    <strong>{profile.faculty}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Program Studi Homebase</span>
                    <strong>{profile.studyProgram}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: 'var(--text-muted)' }}>Status Ikatan Kerja</span>
                    <Badge variant="success">{profile.employmentStatus.replace('_', ' ')}</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Sertifikasi Dosen (Serdos)</span>
                    <Badge variant="primary">{profile.isSerdos ? 'Lulus / Tersertifikasi' : 'Belum Tersertifikasi'}</Badge>
                  </div>
                  {profile.serdosNumber && (
                    <div className="flex justify-between py-2 border-b border-subtle">
                      <span style={{ color: 'var(--text-muted)' }}>Nomor Registrasi Serdos</span>
                      <strong>{profile.serdosNumber}</strong>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>ID SINTA Kemendiktisaintek</span>
                    <strong>{profile.sintaId || '-'}</strong>
                  </div>
                  <div className="flex justify-between py-2 border-b border-subtle">
                    <span style={{ color: 'var(--text-muted)' }}>Google Scholar ID</span>
                    <strong>{profile.googleScholarId || '-'}</strong>
                  </div>
                  <div className="flex justify-between py-2">
                    <span style={{ color: 'var(--text-muted)' }}>Status Keaktifan Mengajar</span>
                    <Badge variant="success">Aktif Melaksanakan Tridharma</Badge>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: MATA KULIAH DIAMPU */}
      {activeTab === 'mata_kuliah_diampu' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <div>
                  <CardTitle>Mata Kuliah Diampu Semester Ganjil 2026/2027</CardTitle>
                  <CardSubtitle>Penugasan kurikulum pengajaran berdasarkan Surat Keputusan Ketua STAI AL-ITTIHAD</CardSubtitle>
                </div>
                {onNavigate && (
                  <Button variant="outline" size="sm" icon={BookOpen} onClick={() => onNavigate('/mata-kuliah')}>
                    Buka Kelas Perkuliahan
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3">
                {profile.teachingCourses.map((c) => (
                  <div 
                    key={c.code}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-md"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid var(--color-primary-600)'
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="primary">{c.code}</Badge>
                        <Badge variant="default">{c.credits} SKS</Badge>
                        {c.classes.map((cls, idx) => (
                          <Badge key={idx} variant="success">{cls}</Badge>
                        ))}
                      </div>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                        {c.name}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Mahasiswa Terdaftar:</span>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--color-primary-800)' }}>
                        {c.totalStudents} Mahasiswa
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: RIWAYAT PENDIDIKAN & PESANTREN */}
      {activeTab === 'riwayat_pendidikan' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Pendidikan Formal & Kepesantrenan</CardTitle>
              <CardSubtitle>Jejak sanad keilmuan, almamater perguruan tinggi, dan kajian kitab turats</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                {profile.educationHistory.map((edu, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col gap-1 p-4 rounded-md"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)',
                      borderLeft: edu.degree === 'PESANTREN' ? '4px solid #8b5cf6' : '4px solid var(--color-primary-600)'
                    }}
                  >
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant={edu.degree === 'PESANTREN' ? 'warning' : 'primary'}>
                          {edu.degree}
                        </Badge>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {edu.degreeName}
                        </strong>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Lulus Tahun {edu.graduationYear}
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', marginTop: '2px' }}>
                      {edu.institution}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Bidang Keilmuan / Konsentrasi: {edu.major}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 5: PUBLIKASI KARYA ILMIAH & RISET */}
      {activeTab === 'publikasi_karya' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Karya Tulis Ilmiah, Riset, & Buku Ajar</CardTitle>
              <CardSubtitle>Daftar luaran tridharma penelitian dan publikasi ilmiah terindeks</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                {profile.publications.map((pub) => (
                  <div 
                    key={pub.id}
                    className="flex flex-col gap-2 p-4 rounded-md"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)',
                      borderLeft: '4px solid var(--color-success-600)'
                    }}
                  >
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Badge variant="success">{pub.type.replace(/_/g, ' ')}</Badge>
                        {pub.sintaIndex && <Badge variant="primary">{pub.sintaIndex}</Badge>}
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Tahun Terbit: {pub.year}
                      </span>
                    </div>

                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      {pub.title}
                    </strong>

                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Penerbit / Jurnal: {pub.publisher}
                    </div>

                    {pub.doiLink && (
                      <div style={{ fontSize: '10px', color: 'var(--color-primary-700)' }}>
                        DOI: <code>{pub.doiLink}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 6: KARTU TANDA DOSEN (KTD DIGITAL) */}
      {activeTab === 'ktd_digital' && (
        <div className="flex flex-col gap-6 items-center">
          {/* KTD Card Container */}
          <div 
            style={{ 
              width: '100%', 
              maxWidth: '540px', 
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #065f46 100%)', 
              color: 'white', 
              borderRadius: 'var(--radius-lg)', 
              padding: 'var(--space-6)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Header KTD */}
            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 'var(--space-3)' }}>
              <div>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>
                  Sekolah Tinggi Agama Islam
                </div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  STAI AL-ITTIHAD CIANJUR
                </div>
                <div style={{ fontSize: '9px', opacity: '0.75' }}>
                  KARTU TANDA DOSEN & NIDN ELEKTRONIK
                </div>
              </div>

              <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <QrCode size={36} color="white" />
              </div>
            </div>

            {/* Body KTD */}
            <div className="flex gap-4 items-center" style={{ marginTop: 'var(--space-4)' }}>
              {/* Foto KTD */}
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

              {/* Rincian Identitas Dosen */}
              <div className="flex flex-col gap-1 text-xs" style={{ flex: 1 }}>
                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>NAMA LENGKAP & GELAR:</span>
                  <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: '#ecfdf5' }}>
                    {profile.titleWithDegree}
                  </div>
                </div>

                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>NOMOR INDUK DOSEN NASIONAL (NIDN):</span>
                  <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', letterSpacing: '0.5px' }}>
                    {profile.nidn}
                  </div>
                </div>

                <div>
                  <span style={{ opacity: 0.7, fontSize: '10px' }}>JABATAN FUNGSIONAL:</span>
                  <div style={{ fontWeight: '600' }}>
                    {profile.academicPosition}
                  </div>
                </div>

                <div className="flex justify-between items-center" style={{ marginTop: '4px' }}>
                  <div>
                    <span style={{ opacity: 0.7, fontSize: '9px' }}>BERLAKU HINGGA:</span>
                    <div style={{ fontWeight: 'bold', fontSize: '10px' }}>{profile.ktdValidUntil}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ opacity: 0.7, fontSize: '9px' }}>STATUS:</span>
                    <div style={{ fontWeight: 'bold', color: '#a7f3d0', fontSize: '10px' }}>DOSEN TETAP</div>
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
              <span>KODE OTENTIKASI: {profile.ktdVerificationCode}</span>
              <span>PORTAL SALAM LMS</span>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="primary" 
              icon={Printer}
              onClick={() => setIsKtdPrintModalOpen(true)}
            >
              Cetak / Pratinjau KTD
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 1: UBAH KONTAK DOSEN */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Ubah Kontak & Informasi Dosen"
          maxWidth="600px"
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
                  Nomor WhatsApp / Seluler
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
                Alamat Domisili / Rumah
              </label>
              <input
                type="text"
                value={editForm.streetAddress}
                onChange={(e) => setEditForm({ ...editForm, streetAddress: e.target.value })}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                  ID SINTA
                </label>
                <input
                  type="text"
                  value={editForm.sintaId}
                  onChange={(e) => setEditForm({ ...editForm, sintaId: e.target.value })}
                  placeholder="Contoh: 6012488"
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
                  Google Scholar ID
                </label>
                <input
                  type="text"
                  value={editForm.googleScholarId}
                  onChange={(e) => setEditForm({ ...editForm, googleScholarId: e.target.value })}
                  placeholder="Contoh: ridwan_staialittihad"
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

      {/* MODAL 2: PRATINJAU CETAK KTD */}
      {isKtdPrintModalOpen && (
        <Modal
          isOpen={isKtdPrintModalOpen}
          onClose={() => setIsKtdPrintModalOpen(false)}
          title="Pratinjau Cetak Kartu Tanda Dosen (KTD)"
          maxWidth="600px"
        >
          <div className="flex flex-col gap-5 items-center">
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
              Dokumen KTD ini merupakan kartu identitas resmi dosen tetap STAI Al-Ittihad Cianjur yang sah secara digital.
            </p>

            <div 
              style={{ 
                width: '100%', 
                maxWidth: '460px', 
                background: '#065f46', 
                color: 'white', 
                borderRadius: '8px', 
                padding: '16px',
                border: '1px solid #064e3b'
              }}
            >
              <div className="flex justify-between items-center border-b border-green-700 pb-2">
                <div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase' }}>STAI AL-ITTIHAD CIANJUR</div>
                  <strong style={{ fontSize: '13px' }}>KARTU TANDA DOSEN (KTD)</strong>
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
                  <div><strong>{profile.titleWithDegree}</strong></div>
                  <div>NIDN: {profile.nidn}</div>
                  <div>Jabatan: {profile.academicPosition}</div>
                  <div>Berlaku s.d: {profile.ktdValidUntil}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 w-full">
              <Button variant="primary" icon={Printer} onClick={handlePrintKtd}>
                Cetak Dokumen
              </Button>
              <Button variant="secondary" onClick={() => setIsKtdPrintModalOpen(false)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
