import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Key, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Sliders,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UploadCloud,
  Trash2,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  StudentProfileItem, 
  StudentDetail, 
  StudentSummaryStats, 
  AcademicStatus, 
  CreateStudentInput, 
  UpdateStudentInput 
} from '../../types/studentAdmin';
import { StudyProgram } from '../../types/studyProgram';
import { studentAdminService } from '../../services/studentAdminService';
import { studyProgramService } from '../../services/studyProgramService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { STUDENT_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';

type TabView = 'student_directory' | 'cohort_distribution' | 'advisor_mapping';

export const MahasiswaAdminPage: React.FC = () => {
  const { success, warning, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('student_directory');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<StudentSummaryStats | null>(null);
  const [students, setStudents] = useState<StudentProfileItem[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProdi, setFilterProdi] = useState<string>('SEMUA');
  const [filterYear, setFilterYear] = useState<string>('SEMUA');
  const [filterSemester, setFilterSemester] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProdi, filterYear, filterSemester, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterProdi !== 'SEMUA' || filterYear !== 'SEMUA' || filterSemester !== 'SEMUA' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProdi('SEMUA');
    setFilterYear('SEMUA');
    setFilterSemester('SEMUA');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  const [modalType, setModalType] = useState<
    'create_student' | 'edit_student' | 'detail_student' | 'change_status' | 'reset_password' | 'delete_student' | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfileItem | null>(null);
  const [studentDetail, setStudentDetail] = useState<StudentDetail | null>(null);
  const [newStatus, setNewStatus] = useState<AcademicStatus>('AKTIF');
  const [saving, setSaving] = useState<boolean>(false);

  // Form State Mahasiswa Baru
  const [studentForm, setStudentForm] = useState<CreateStudentInput>({
    nim: '',
    name: '',
    email: '',
    username: '',
    password: 'salam2026!',
    studyProgramId: 'prodi-pai',
    academicAdvisorId: 'usr-dsn-pa',
    entryYear: 2024,
    entrySemester: 'Ganjil',
    currentSemester: 1,
    gender: 'Laki-laki',
    birthPlace: 'Cianjur',
    birthDate: '2005-01-01',
    phoneNumber: '081234567890',
    address: 'Jl. Raya Cianjur-Bandung, Jawa Barat',
    guardianName: 'Orang Tua / Wali'
  });

  // Form State Ubah Mahasiswa
  const [editForm, setEditForm] = useState<UpdateStudentInput>({});

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, studentsRes, prodiRes] = await Promise.all([
        studentAdminService.getSummaryStats(),
        studentAdminService.getStudents(),
        studyProgramService.getStudyPrograms()
      ]);

      setSummaryStats(statsRes);
      setStudents(studentsRes);
      setStudyPrograms(prodiRes);

      if (prodiRes.length > 0 && !studentForm.studyProgramId) {
        setStudentForm((prev) => ({ ...prev, studyProgramId: prodiRes[0].id }));
      }
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data direktori mahasiswa dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger, studentForm.studyProgramId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studyProgramName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.advisorName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProdi = filterProdi === 'SEMUA' || s.studyProgramId === filterProdi;
      const matchYear = filterYear === 'SEMUA' || String(s.entryYear) === filterYear;
      const matchSemester = filterSemester === 'SEMUA' || String(s.currentSemester) === filterSemester;
      const matchStatus = filterStatus === 'SEMUA' || s.academicStatus === filterStatus;

      return matchSearch && matchProdi && matchYear && matchSemester && matchStatus;
    });
  }, [students, searchQuery, filterProdi, filterYear, filterSemester, filterStatus]);

  // Paginated Students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  // Handler: Buka Modal Tambah Mahasiswa
  const handleOpenCreateStudent = () => {
    setStudentForm({
      nim: '',
      name: '',
      email: '',
      username: '',
      password: 'salam2026!',
      studyProgramId: studyPrograms[0]?.id || 'prodi-pai',
      academicAdvisorId: 'usr-dsn-pa',
      entryYear: 2024,
      entrySemester: 'Ganjil',
      currentSemester: 1,
      gender: 'Laki-laki',
      birthPlace: 'Cianjur',
      birthDate: '2005-01-01',
      phoneNumber: '081234567890',
      address: 'Jl. Raya Cianjur-Bandung, Jawa Barat',
      guardianName: 'Orang Tua / Wali'
    });
    setModalType('create_student');
  };

  // Handler: Buka Modal Ubah Mahasiswa
  const handleOpenEditStudent = (s: StudentProfileItem) => {
    setSelectedStudent(s);
    setEditForm({
      name: s.name,
      email: s.email,
      studyProgramId: s.studyProgramId || '',
      academicAdvisorId: s.academicAdvisorId || 'usr-dsn-pa',
      entryYear: s.entryYear,
      currentSemester: s.currentSemester,
      academicStatus: s.academicStatus,
      gpa: s.gpa,
      totalCreditsEarned: s.totalCreditsEarned,
      gender: s.gender,
      birthPlace: s.birthPlace,
      birthDate: s.birthDate ? s.birthDate.substring(0, 10) : '',
      phoneNumber: s.phoneNumber || '',
      address: s.address || '',
      guardianName: s.guardianName || ''
    });
    setModalType('edit_student');
  };

  // Handler: Buka Detail Mahasiswa
  const handleOpenDetailStudent = async (s: StudentProfileItem) => {
    setSelectedStudent(s);
    try {
      const detail = await studentAdminService.getStudentById(s.profileId);
      setStudentDetail(detail);
      setModalType('detail_student');
    } catch {
      danger('Galat Detail', 'Gagal memuat rincian profil mahasiswa.');
    }
  };

  // Handler: Simpan Mahasiswa Baru
  const handleSaveStudent = async () => {
    if (!studentForm.nim.trim() || !studentForm.name.trim() || !studentForm.email.trim()) {
      warning('Formulir Belum Lengkap', 'NIM, Nama Lengkap, dan Email resmi mahasiswa wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await studentAdminService.createStudent(studentForm);
      success('Mahasiswa Ditambahkan', `Mahasiswa ${studentForm.name} (${studentForm.nim}) berhasil didaftarkan.`);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Mendaftarkan Mahasiswa', err.message || 'Terjadi galat saat menyimpan data mahasiswa.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan Perubahan Mahasiswa
  const handleSaveEditStudent = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      await studentAdminService.updateStudent(selectedStudent.profileId, editForm);
      success('Data Mahasiswa Diperbarui', `Perubahan data pada ${editForm.name || selectedStudent.name} berhasil disimpan.`);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Memperbarui Data', err.message || 'Terjadi galat saat memperbarui data mahasiswa.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Ubah Status Akademik
  const handleSaveStatus = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      await studentAdminService.updateStudentStatus(selectedStudent.profileId, newStatus);
      success('Status Akademik Diperbarui', `Status mahasiswa ${selectedStudent.name} berhasil diubah menjadi ${newStatus}.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Mengubah Status', 'Tidak dapat memperbarui status akademik mahasiswa.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Reset Kata Sandi
  const handleResetPassword = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      const res = await studentAdminService.resetStudentPassword(selectedStudent.userId);
      success('Kata Sandi Di-Reset', res.message || `Kata sandi akun ${selectedStudent.name} berhasil di-reset ke default.`);
      setModalType(null);
    } catch {
      danger('Gagal Reset Kata Sandi', 'Tidak dapat mereset kata sandi akun mahasiswa.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Hapus Mahasiswa Permanen
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      const res = await studentAdminService.deleteStudent(selectedStudent.userId || selectedStudent.profileId);
      success('Mahasiswa Dihapus', res.message || `Data mahasiswa ${selectedStudent.name} (${selectedStudent.nim}) berhasil dihapus.`);
      setModalType(null);
      setSelectedStudent(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menghapus Mahasiswa', err.message || 'Terjadi kesalahan saat menghapus data mahasiswa.');
    } finally {
      setSaving(false);
    }
  };

  // Konfigurasi Ekspor Profesional Mahasiswa
  const studentExportConfig: ExportConfig<StudentProfileItem> = useMemo(() => ({
    filename: 'SALAM_Master_Data_Mahasiswa',
    title: 'BUKU INDUK & DIREKTORI MASTER DATA MAHASISWA',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredStudents,
    columns: [
      { key: 'nim', header: 'NIM', width: '120px' },
      { key: 'name', header: 'Nama Lengkap Mahasiswa', width: '220px' },
      { key: 'email', header: 'Email Institusi', width: '200px' },
      { key: 'studyProgramName', header: 'Program Studi', width: '180px' },
      { key: 'entryYear', header: 'Angkatan', width: '80px', align: 'center' },
      { key: 'currentSemester', header: 'Semester', width: '80px', align: 'center' },
      { key: 'academicStatus', header: 'Status', width: '90px', align: 'center' },
      { key: 'gpa', header: 'IPK', width: '70px', align: 'center', format: (val) => Number(val || 0).toFixed(2) },
      { key: 'totalCreditsEarned', header: 'SKS Lulus', width: '80px', align: 'center' },
      { key: 'advisorName', header: 'Dosen Pembimbing Akademik (PA)', width: '200px' },
      { key: 'gender', header: 'Jenis Kelamin', width: '100px' },
      { key: 'phoneNumber', header: 'No Telepon / WA', width: '130px', format: (val) => val || '-' }
    ],
    metadata: {
      'Total Mahasiswa Ditampilkan': `${filteredStudents.length} Mahasiswa`,
      'Filter Program Studi': filterProdi === 'SEMUA' ? 'Semua Prodi' : filterProdi,
      'Filter Angkatan': filterYear,
      'Filter Status': filterStatus,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredStudents, filterProdi, filterYear, filterStatus]);

  // Handler Impor Massal Mahasiswa
  const handleBulkImportStudents = async (data: CreateStudentInput[], summary: BulkImportResult) => {
    try {
      await studentAdminService.bulkCreateStudents(data);
      success('Impor Berhasil', `Sebanyak ${summary.inserted} mahasiswa berhasil ditambahkan.`);
      await loadData();
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor mahasiswa ke server.');
    }
  };

  // Definisi Kolom Tabel Mahasiswa
  const studentColumns: Column<StudentProfileItem>[] = [
    {
      header: 'Mahasiswa & NIM',
      width: '280px',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-100)',
              color: 'var(--color-primary-800)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--text-xs)',
              flexShrink: 0
            }}
          >
            {row.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              {row.name}
            </span>
            <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                {row.nim}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                • Angkatan {row.entryYear}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Program Studi & Semester',
      width: '230px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.studyProgramName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Semester {row.currentSemester} ({row.studyProgramCode})
          </span>
        </div>
      )
    },
    {
      header: 'Prestasi Akademik',
      width: '170px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="flex items-center gap-1">
            <Award size={13} color="var(--color-primary-700)" />
            <span style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              IPK: {Number(row.gpa).toFixed(2)}
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Total {row.totalCreditsEarned} SKS Lulus
          </span>
        </div>
      )
    },
    {
      header: 'Dosen Pembimbing (PA)',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.advisorName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.advisorNidn ? `NIDN: ${row.advisorNidn}` : 'Dosen PA'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => {
        let variant: 'success' | 'warning' | 'primary' | 'danger' | 'default' = 'success';
        if (row.academicStatus === 'CUTI') variant = 'warning';
        if (row.academicStatus === 'LULUS') variant = 'primary';
        if (row.academicStatus === 'DROP_OUT' || row.academicStatus === 'NONAKTIF') variant = 'danger';

        return (
          <Badge variant={variant}>
            {row.academicStatus}
          </Badge>
        );
      }
    },
    {
      header: 'Aksi',
      width: '220px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenDetailStudent(row)}
            title="Lihat Profil & Transkrip"
          >
            <FileText size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Detail</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditStudent(row)}
            title="Ubah Data Mahasiswa"
          >
            <Edit3 size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedStudent(row);
              setNewStatus(row.academicStatus);
              setModalType('change_status');
            }}
            title="Ubah Status Akademik"
          >
            <Sliders size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedStudent(row);
              setModalType('reset_password');
            }}
            title="Reset Kata Sandi Akun"
            style={{ color: 'var(--color-warning-dark)' }}
          >
            <Key size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedStudent(row);
              setModalType('delete_student');
            }}
            title="Hapus Data Mahasiswa"
            style={{ color: 'var(--color-danger-main)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Administrasi Akademik
            </Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              • STAI AL-ITTIHAD (WIB / Asia-Jakarta)
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Manajemen Master Data Mahasiswa
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Direktori data induk mahasiswa, penugasan Dosen Pembimbing Akademik (PA), rekapitulasi IPK kumulatif, sebaran angkatan, dan status keaktifan kuliah.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={studentExportConfig} 
            buttonLabel="Ekspor Data Mahasiswa" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={UploadCloud}
            onClick={() => setIsImportModalOpen(true)}
          >
            + Impor Massal Mahasiswa
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={handleOpenCreateStudent}
          >
            + Tambah Mahasiswa Baru
          </Button>
        </div>
      </div>

      {/* 2. Kartu Metrik Ringkasan (Executive Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TOTAL MAHASISWA
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalStudents || students.length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa Terdaftar
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>5 Program Studi Jenjang S1</span>
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
                <Users size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  MAHASISWA AKTIF KULIAH
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalActiveStudents || students.filter((s) => s.academicStatus === 'AKTIF').length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa (100%)
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <BookOpen size={13} />
                  <span>KRS Terverifikasi Aktif</span>
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
                <BookOpen size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  RATA-RATA IPK INSTITUSI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.averageGPA || 3.75}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / 4.00
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <Award size={13} />
                  <span>Kategori Prestasi: Sangat Baik</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-warning-surface)', 
                  color: 'var(--color-warning-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DOSEN PA HOMEBASE
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  100%
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Terpetakan
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <GraduationCap size={13} />
                  <span>Setiap Mahasiswa Memiliki PA</span>
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
                <GraduationCap size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'student_directory' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('student_directory')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Users size={16} />
          <span>Direktori Mahasiswa ({students.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'cohort_distribution' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('cohort_distribution')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Calendar size={16} />
          <span>Sebaran Angkatan & Program Studi</span>
        </button>

        <button
          className={`btn ${activeTab === 'advisor_mapping' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('advisor_mapping')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <GraduationCap size={16} />
          <span>Bimbingan Akademik (Dosen PA)</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Direktori Mahasiswa */}
      {activeTab === 'student_directory' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Direktori Data Induk Mahasiswa</CardTitle>
                <CardSubtitle>Daftar lengkap seluruh mahasiswa terdaftar, nomor induk (NIM), capaian IPK, dan Dosen Pembimbing Akademik.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari NIM, nama, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterProdi}
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Program Studi</option>
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>

                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Angkatan</option>
                  <option value="2024">Angkatan 2024</option>
                  <option value="2023">Angkatan 2023</option>
                  <option value="2022">Angkatan 2022</option>
                  <option value="2021">Angkatan 2021</option>
                </select>

                <select
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>Semester {s}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="AKTIF">Aktif</option>
                  <option value="CUTI">Cuti</option>
                  <option value="LULUS">Lulus</option>
                  <option value="NONAKTIF">Nonaktif</option>
                </select>

                {hasActiveFilters && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={X} 
                    onClick={handleResetFilters}
                    title="Reset Semua Filter"
                  >
                    Reset Filter
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={loadData} title="Segarkan Data">
                  <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <Table
              columns={studentColumns}
              data={paginatedStudents}
              keyExtractor={(row) => row.profileId}
              emptyMessage="Tidak ada data mahasiswa yang sesuai dengan kriteria pencarian dan filter."
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStudents.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="mahasiswa"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Sebaran Angkatan & Prodi */}
      {activeTab === 'cohort_distribution' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sebaran Berdasarkan Program Studi */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Mahasiswa per Program Studi</CardTitle>
              <CardSubtitle>Komposisi mahasiswa pada 5 Program Studi STAI AL-ITTIHAD</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3">
                {summaryStats?.prodiBreakdown.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--color-slate-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">{item.prodiCode}</Badge>
                      <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                        {item.prodiName}
                      </span>
                    </div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-primary-900)' }}>
                      {item.count} Mahasiswa
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Sebaran Berdasarkan Tahun Masuk (Angkatan) */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Mahasiswa per Angkatan (Tahun Masuk)</CardTitle>
              <CardSubtitle>Jumlah civitas mahasiswa per kohor angkatan akademik</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3">
                {summaryStats?.entryYearBreakdown.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--color-slate-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-primary-100)',
                          color: 'var(--color-primary-800)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: 'var(--text-xs)'
                        }}
                      >
                        {item.entryYear}
                      </div>
                      <div>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          Angkatan Tahun {item.entryYear}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Jenjang Sarjana S1
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-primary-900)' }}>
                      {item.count} Mahasiswa
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 6. Konten Tab 3: Bimbingan Akademik (Dosen PA) */}
      {activeTab === 'advisor_mapping' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['Dr. Siti Maryam, M.Pd.I', 'Dr. H. M. Ridwan, M.Ag'].map((advisor, idx) => {
            const advStudents = students.filter((s) => s.advisorName.includes(advisor.split(' ')[1]));

            return (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div 
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--color-primary-100)',
                        color: 'var(--color-primary-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                      }}
                    >
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <CardTitle style={{ fontSize: 'var(--text-sm)' }}>{advisor}</CardTitle>
                      <CardSubtitle>Dosen Pembimbing Akademik (PA)</CardSubtitle>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex justify-between items-center mb-3 p-2 bg-primary-50 rounded-md border border-primary-200">
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', fontWeight: 'var(--font-weight-medium)' }}>
                      Total Mahasiswa Bimbingan:
                    </span>
                    <Badge variant="primary">{advStudents.length} Mahasiswa</Badge>
                  </div>

                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                    {advStudents.map((s) => (
                      <div 
                        key={s.profileId}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          backgroundColor: 'var(--color-slate-50)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-default)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                            {s.name}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                            {s.nim} • {s.studyProgramCode} (Smt {s.currentSemester})
                          </span>
                        </div>
                        <Badge variant="primary" style={{ fontSize: '0.625rem' }}>
                          IPK {Number(s.gpa).toFixed(2)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: REGISTRASI MAHASISWA BARU
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_student'}
        onClose={() => setModalType(null)}
        title="Registrasi Mahasiswa Baru"
        maxWidth="740px"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identitas Akademik & Akun
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nomor Induk Mahasiswa (NIM)"
                placeholder="Contoh: 24.01.0055"
                value={studentForm.nim}
                onChange={(e) => setStudentForm({ ...studentForm, nim: e.target.value })}
                required
              />

              <div className="form-group">
                <label className="form-label" htmlFor="mhs-prodi-select">Program Studi</label>
                <select
                  id="mhs-prodi-select"
                  className="form-select"
                  value={studentForm.studyProgramId}
                  onChange={(e) => setStudentForm({ ...studentForm, studyProgramId: e.target.value })}
                  required
                >
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="mhs-pa-select">Dosen PA</label>
                <select
                  id="mhs-pa-select"
                  className="form-select"
                  value={studentForm.academicAdvisorId}
                  onChange={(e) => setStudentForm({ ...studentForm, academicAdvisorId: e.target.value })}
                >
                  <option value="usr-dsn-pa">Dr. Siti Maryam, M.Pd.I</option>
                  <option value="usr-dsn-01">Dr. H. M. Ridwan, M.Ag</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap Mahasiswa"
                placeholder="Contoh: Muhammad Ihsan Kamil"
                value={studentForm.name}
                onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                required
              />

              <Input
                label="Email Resmi Institusi"
                type="email"
                placeholder="Contoh: ihsan.kamil@student.stai-alittihad.ac.id"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Tahun Angkatan"
                type="number"
                value={studentForm.entryYear}
                onChange={(e) => setStudentForm({ ...studentForm, entryYear: parseInt(e.target.value, 10) || 2024 })}
              />

              <Input
                label="Semester Masuk"
                value={studentForm.entrySemester}
                onChange={(e) => setStudentForm({ ...studentForm, entrySemester: e.target.value })}
              />

              <Input
                label="Semester Berjalan"
                type="number"
                value={studentForm.currentSemester}
                onChange={(e) => setStudentForm({ ...studentForm, currentSemester: parseInt(e.target.value, 10) || 1 })}
              />
            </div>
          </div>

          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Biodata Pribadi & Kontak
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="mhs-gender-select">Jenis Kelamin</label>
                <select
                  id="mhs-gender-select"
                  className="form-select"
                  value={studentForm.gender}
                  onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <Input
                label="Tempat Lahir"
                placeholder="Contoh: Cianjur"
                value={studentForm.birthPlace}
                onChange={(e) => setStudentForm({ ...studentForm, birthPlace: e.target.value })}
              />

              <Input
                label="Tanggal Lahir"
                type="date"
                value={studentForm.birthDate}
                onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nomor WhatsApp / HP"
                placeholder="Contoh: 081234567890"
                value={studentForm.phoneNumber}
                onChange={(e) => setStudentForm({ ...studentForm, phoneNumber: e.target.value })}
              />

              <Input
                label="Nama Orang Tua / Wali"
                placeholder="Contoh: H. Abdul Rahman"
                value={studentForm.guardianName}
                onChange={(e) => setStudentForm({ ...studentForm, guardianName: e.target.value })}
              />
            </div>

            <Input
              label="Alamat Tempat Tinggal"
              placeholder="Alamat lengkap domisili..."
              value={studentForm.address}
              onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveStudent} isLoading={saving}>
              Daftarkan Mahasiswa
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: UBAH DATA MAHASISWA
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'edit_student'}
        onClose={() => setModalType(null)}
        title={`Ubah Data Mahasiswa: ${selectedStudent?.name} (${selectedStudent?.nim})`}
        maxWidth="720px"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Mahasiswa"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />

            <Input
              label="Email Resmi Mahasiswa"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-prodi-select">Program Studi</label>
              <select
                id="edit-prodi-select"
                className="form-select"
                value={editForm.studyProgramId}
                onChange={(e) => setEditForm({ ...editForm, studyProgramId: e.target.value })}
              >
                {studyPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-pa-select">Dosen PA</label>
              <select
                id="edit-pa-select"
                className="form-select"
                value={editForm.academicAdvisorId}
                onChange={(e) => setEditForm({ ...editForm, academicAdvisorId: e.target.value })}
              >
                <option value="usr-dsn-pa">Dr. Siti Maryam, M.Pd.I</option>
                <option value="usr-dsn-01">Dr. H. M. Ridwan, M.Ag</option>
              </select>
            </div>

            <Input
              label="Semester Berjalan"
              type="number"
              value={editForm.currentSemester}
              onChange={(e) => setEditForm({ ...editForm, currentSemester: parseInt(e.target.value, 10) || 1 })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Indeks Prestasi Kumulatif (IPK)"
              type="number"
              step="0.01"
              value={editForm.gpa}
              onChange={(e) => setEditForm({ ...editForm, gpa: parseFloat(e.target.value) || 0.00 })}
            />

            <Input
              label="Total SKS Lulus"
              type="number"
              value={editForm.totalCreditsEarned}
              onChange={(e) => setEditForm({ ...editForm, totalCreditsEarned: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nomor WhatsApp"
              value={editForm.phoneNumber || ''}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
            />

            <Input
              label="Nama Orang Tua / Wali"
              value={editForm.guardianName || ''}
              onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveEditStudent} isLoading={saving}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 3: DETAIL PROFIL LENGKAP MAHASISWA
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'detail_student'}
        onClose={() => setModalType(null)}
        title={`Profil Mahasiswa: ${selectedStudent?.name}`}
        maxWidth="760px"
      >
        {studentDetail ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-md border border-primary-200">
              <div className="flex items-center gap-3">
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: 'var(--radius-full)', 
                    backgroundColor: 'var(--color-primary-700)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  {studentDetail.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    {studentDetail.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    NIM: {studentDetail.nim} • {studentDetail.studyProgramName} ({studentDetail.studyProgramCode})
                  </p>
                </div>
              </div>
              <Badge variant={studentDetail.academicStatus === 'AKTIF' ? 'success' : 'warning'}>
                Status: {studentDetail.academicStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>ANGKATAN</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Tahun {studentDetail.entryYear}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SEMESTER</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Semester {studentDetail.currentSemester}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>IPK KUMULATIF</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                  {Number(studentDetail.gpa).toFixed(2)}
                </div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>SKS LULUS</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{studentDetail.totalCreditsEarned} SKS</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <GraduationCap size={14} color="var(--text-muted)" />
                <span>Dosen PA: <strong>{studentDetail.advisorName}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} color="var(--text-muted)" />
                <span>Email: {studentDetail.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} color="var(--text-muted)" />
                <span>Telepon: {studentDetail.phoneNumber || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} color="var(--text-muted)" />
                <span>Alamat: {studentDetail.address || '-'}</span>
              </div>
            </div>

            {/* Riwayat Kelas yang Diambil */}
            <div>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Riwayat Kelas Terdaftar ({studentDetail.enrolledClasses.length})
              </h4>
              <div className="max-h-40 overflow-y-auto border border-default rounded-md">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Mata Kuliah</th>
                      <th>Kelas</th>
                      <th>SKS</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDetail.enrolledClasses.length > 0 ? (
                      studentDetail.enrolledClasses.map((cls) => (
                        <tr key={cls.enrollmentId}>
                          <td><strong>{cls.courseCode}</strong></td>
                          <td>{cls.courseName}</td>
                          <td>{cls.className}</td>
                          <td>{cls.credits} SKS</td>
                          <td><Badge variant="success">{cls.status}</Badge></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>
                          Belum ada riwayat kelas yang diambil.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={() => setModalType(null)}>
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Memuat profil...</div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL 4: UBAH STATUS AKADEMIK
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'change_status'}
        onClose={() => setModalType(null)}
        title={`Ubah Status Akademik: ${selectedStudent?.name}`}
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 0 }}>
            Pilih status akademik terbaru untuk mahasiswa <strong>{selectedStudent?.name} ({selectedStudent?.nim})</strong>:
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="status-select">Status Akademik</label>
            <select
              id="status-select"
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as AcademicStatus)}
            >
              <option value="AKTIF">AKTIF (Mengikuti Perkuliahan)</option>
              <option value="CUTI">CUTI (Izin Cuti Akademik)</option>
              <option value="LULUS">LULUS (Telah Menyelesaikan Studi)</option>
              <option value="DROP_OUT">DROP OUT (Mengundurkan Diri / DO)</option>
              <option value="NONAKTIF">NONAKTIF (Akun Dinonaktifkan)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveStatus} isLoading={saving}>
              Simpan Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 5: RESET KATA SANDI
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'reset_password'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Reset Kata Sandi"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-warning-surface rounded-md border border-warning">
            <AlertCircle size={24} color="var(--color-warning-dark)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-dark)', margin: 0 }}>
              Apakah Anda yakin ingin mereset kata sandi akun mahasiswa <strong>{selectedStudent?.name} ({selectedStudent?.nim})</strong>?
            </p>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Kata sandi akan di-reset menjadi default <code>salam2026!</code>. Mahasiswa diwajibkan mengganti kata sandi setelah masuk.
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleResetPassword} isLoading={saving}>
              Ya, Reset Kata Sandi
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 6: KONFIRMASI HAPUS MAHASISWA PERMANEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'delete_student'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Hapus Mahasiswa"
        maxWidth="500px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3 bg-danger-surface rounded-md border border-danger">
            <AlertCircle size={24} color="var(--color-danger-main)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-dark)', fontWeight: 'bold', margin: 0 }}>
                Peringatan Penghapusan Data!
              </p>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-dark)', marginTop: '4px', margin: 0 }}>
                Apakah Anda yakin ingin menghapus data mahasiswa <strong>{selectedStudent?.name} (NIM: {selectedStudent?.nim})</strong>? Akun login dan data riwayat akademik mahasiswa ini akan dihapus dari sistem.
              </p>
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>NIM:</strong> {selectedStudent?.nim}</div>
            <div><strong>Nama Lengkap:</strong> {selectedStudent?.name}</div>
            <div><strong>Program Studi:</strong> {selectedStudent?.studyProgramName || selectedStudent?.studyProgramCode}</div>
            <div><strong>Angkatan / Semester:</strong> {selectedStudent?.entryYear} (Semester {selectedStudent?.currentSemester})</div>
            <div><strong>Status Akademik:</strong> {selectedStudent?.academicStatus}</div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2}
              onClick={handleDeleteStudent} 
              isLoading={saving}
            >
              Ya, Hapus Mahasiswa
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 7: WIZARD IMPOR MASSAL DATA MAHASISWA
          ===================================================================== */}
      {isImportModalOpen && (
        <DataImportModal<CreateStudentInput>
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          schema={STUDENT_IMPORT_SCHEMA}
          onImport={handleBulkImportStudents}
          customTitle="Pusat Impor Data Induk Mahasiswa"
        />
      )}
    </div>
  );
};
