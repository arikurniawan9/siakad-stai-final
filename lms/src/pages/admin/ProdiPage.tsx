import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Award, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Compass, 
  Building, 
  Mail, 
  Sliders, 
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
  StudyProgram, 
  StudyProgramsSummaryStats, 
  StudyProgramDetail, 
  Curriculum, 
  CPLItem, 
  CPLCategory,
  CreateStudyProgramInput, 
  CreateCurriculumInput,
  CreateCPLInput
} from '../../types/studyProgram';
import { studyProgramService } from '../../services/studyProgramService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { STUDY_PROGRAM_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';

type TabView = 'prodi_list' | 'curriculum_cpl' | 'faculty_ratio';

export const ProdiPage: React.FC = () => {
  const { success, warning, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('prodi_list');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<StudyProgramsSummaryStats | null>(null);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [cplList, setCplList] = useState<CPLItem[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDegree, setFilterDegree] = useState<string>('SEMUA');
  const [filterAccreditation, setFilterAccreditation] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [selectedProdiForCurriculum, setSelectedProdiForCurriculum] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDegree, filterAccreditation, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterDegree !== 'SEMUA' || filterAccreditation !== 'SEMUA' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDegree('SEMUA');
    setFilterAccreditation('SEMUA');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  // Modal State
  const [modalType, setModalType] = useState<
    'create_prodi' | 'edit_prodi' | 'detail_prodi' | 'delete_prodi' | 'create_curriculum' | 'create_cpl' | 'confirm_status' | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedProdi, setSelectedProdi] = useState<StudyProgram | null>(null);
  const [prodiDetail, setProdiDetail] = useState<StudyProgramDetail | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State Program Studi
  const [prodiForm, setProdiForm] = useState<CreateStudyProgramInput>({
    code: '',
    name: '',
    degree: 'S1',
    headOfProgram: '',
    headNidn: '',
    accreditation: 'Baik Sekali',
    skNumber: '',
    skDate: '',
    degreeTitle: 'Sarjana Pendidikan (S.Pd.)',
    totalCreditsRequired: 144,
    description: '',
    email: ''
  });

  // Form State Kurikulum
  const [curriculumForm, setCurriculumForm] = useState<CreateCurriculumInput>({
    studyProgramId: '',
    code: '',
    name: '',
    year: new Date().getFullYear(),
    totalCredits: 144,
    mandatoryCredits: 130,
    electiveCredits: 14,
    description: ''
  });

  // Form State CPL
  const [cplForm, setCplForm] = useState<CreateCPLInput>({
    studyProgramId: '',
    curriculumId: '',
    code: '',
    category: 'PENGETAHUAN',
    description: ''
  });

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, prodiRes, currRes, cplRes] = await Promise.all([
        studyProgramService.getSummaryStats(),
        studyProgramService.getStudyPrograms(),
        studyProgramService.getCurriculums(),
        studyProgramService.getCPLList()
      ]);

      setSummaryStats(statsRes);
      setStudyPrograms(prodiRes);
      setCurriculums(currRes);
      setCplList(cplRes);

      if (prodiRes.length > 0 && !selectedProdiForCurriculum) {
        setSelectedProdiForCurriculum(prodiRes[0].id);
      }
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data program studi dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger, selectedProdiForCurriculum]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Study Programs
  const filteredPrograms = useMemo(() => {
    return studyPrograms.filter((p) => {
      const matchSearch = 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.headOfProgram && p.headOfProgram.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchDegree = filterDegree === 'SEMUA' || p.degree === filterDegree;
      const matchAccreditation = filterAccreditation === 'SEMUA' || p.accreditation === filterAccreditation;
      const matchStatus = 
        filterStatus === 'SEMUA' || 
        (filterStatus === 'AKTIF' && p.isActive) || 
        (filterStatus === 'NONAKTIF' && !p.isActive);

      return matchSearch && matchDegree && matchAccreditation && matchStatus;
    });
  }, [studyPrograms, searchQuery, filterDegree, filterAccreditation, filterStatus]);

  // Paginated Programs
  const totalPages = Math.ceil(filteredPrograms.length / pageSize) || 1;
  const paginatedPrograms = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPrograms.slice(start, start + pageSize);
  }, [filteredPrograms, currentPage, pageSize]);

  // Selected Program Detail for Tab 2
  const currentProdiForCurriculum = useMemo(() => {
    return studyPrograms.find((p) => p.id === selectedProdiForCurriculum) || studyPrograms[0];
  }, [studyPrograms, selectedProdiForCurriculum]);

  const currentCurriculumsForSelected = useMemo(() => {
    return curriculums.filter((c) => c.studyProgramId === selectedProdiForCurriculum);
  }, [curriculums, selectedProdiForCurriculum]);

  const currentCplForSelected = useMemo(() => {
    return cplList.filter((c) => c.studyProgramId === selectedProdiForCurriculum);
  }, [cplList, selectedProdiForCurriculum]);

  // Handler: Buka Modal Tambah Prodi
  const handleOpenCreateProdi = () => {
    setProdiForm({
      code: '',
      name: '',
      degree: 'S1',
      headOfProgram: '',
      headNidn: '',
      accreditation: 'Baik Sekali',
      skNumber: '',
      skDate: '',
      degreeTitle: 'Sarjana Pendidikan (S.Pd.)',
      totalCreditsRequired: 144,
      description: '',
      email: ''
    });
    setModalType('create_prodi');
  };

  // Handler: Buka Modal Ubah Prodi
  const handleOpenEditProdi = (p: StudyProgram) => {
    setSelectedProdi(p);
    setProdiForm({
      code: p.code,
      name: p.name,
      degree: p.degree,
      headOfProgram: p.headOfProgram || '',
      headNidn: p.headNidn || '',
      accreditation: p.accreditation || 'Baik',
      skNumber: p.skNumber || '',
      skDate: p.skDate ? p.skDate.substring(0, 10) : '',
      degreeTitle: p.degreeTitle || 'Sarjana Pendidikan (S.Pd.)',
      totalCreditsRequired: p.totalCreditsRequired || 144,
      description: p.description || '',
      email: p.email || ''
    });
    setModalType('edit_prodi');
  };

  // Handler: Buka Detail Prodi
  const handleOpenDetailProdi = async (p: StudyProgram) => {
    setSelectedProdi(p);
    try {
      const detail = await studyProgramService.getStudyProgramById(p.id);
      setProdiDetail(detail);
      setModalType('detail_prodi');
    } catch {
      danger('Galat Detail', 'Gagal memuat rincian program studi.');
    }
  };

  // Handler: Simpan Program Studi (Tambah / Ubah)
  const handleSaveProdi = async () => {
    if (!prodiForm.code.trim() || !prodiForm.name.trim()) {
      warning('Formulir Belum Lengkap', 'Kode Program Studi dan Nama Program Studi wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (modalType === 'create_prodi') {
        await studyProgramService.createStudyProgram(prodiForm);
        success('Program Studi Ditambahkan', `Program Studi ${prodiForm.name} (${prodiForm.code.toUpperCase()}) berhasil didaftarkan.`);
      } else if (modalType === 'edit_prodi' && selectedProdi) {
        await studyProgramService.updateStudyProgram(selectedProdi.id, prodiForm);
        success('Data Program Studi Diperbarui', `Perubahan data pada ${prodiForm.name} berhasil disimpan.`);
      }

      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menyimpan Data', err.message || 'Terjadi kesalahan pada server saat menyimpan program studi.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Ubah Status Aktif / Nonaktif
  const handleToggleStatus = async () => {
    if (!selectedProdi) return;

    try {
      setSaving(true);
      await studyProgramService.toggleStudyProgramStatus(selectedProdi.id);
      success('Status Program Studi Berubah', `Program Studi ${selectedProdi.name} telah di-${selectedProdi.isActive ? 'nonaktifkan' : 'aktifkan'}.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Mengubah Status', 'Tidak dapat memperbarui status program studi.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Hapus Program Studi Permanen
  const handleDeleteProdi = async () => {
    if (!selectedProdi) return;

    try {
      setSaving(true);
      await studyProgramService.deleteStudyProgram(selectedProdi.id);
      success('Program Studi Dihapus', `Program Studi ${selectedProdi.name} (${selectedProdi.code}) berhasil dihapus permanen.`);
      setModalType(null);
      setSelectedProdi(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus program studi.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan Kurikulum Baru
  const handleSaveCurriculum = async () => {
    if (!curriculumForm.studyProgramId || !curriculumForm.code.trim() || !curriculumForm.name.trim()) {
      warning('Formulir Belum Lengkap', 'Program Studi, Kode Kurikulum, dan Nama Kurikulum wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await studyProgramService.createCurriculum(curriculumForm);
      success('Kurikulum Berhasil Ditambahkan', `Kurikulum ${curriculumForm.name} telah didaftarkan untuk program studi terpilih.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Menambah Kurikulum', 'Terjadi galat saat menyimpan kurikulum baru.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan CPL Baru
  const handleSaveCPL = async () => {
    if (!cplForm.studyProgramId || !cplForm.code.trim() || !cplForm.description.trim()) {
      warning('Formulir Belum Lengkap', 'Program Studi, Kode CPL, dan Deskripsi Capaian wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await studyProgramService.createCPL(cplForm);
      success('Capaian Pembelajaran Ditambahkan', `CPL ${cplForm.code} berhasil ditambahkan.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Menambah CPL', 'Terjadi galat saat menyimpan CPL.');
    } finally {
      setSaving(false);
    }
  };

  // Konfigurasi Ekspor Profesional Program Studi
  const prodiExportConfig: ExportConfig<StudyProgram> = useMemo(() => ({
    filename: 'SALAM_Master_Program_Studi',
    title: 'MASTER DATA PROGRAM STUDI & STATUS AKREDITASI',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredPrograms,
    columns: [
      { key: 'code', header: 'Kode', width: '80px', align: 'center' },
      { key: 'name', header: 'Nama Program Studi', width: '250px' },
      { key: 'degree', header: 'Jenjang', width: '80px', align: 'center' },
      { key: 'degreeTitle', header: 'Gelar Lulusan', width: '120px' },
      { key: 'headOfProgram', header: 'Ketua Program Studi (Kaprodi)', width: '200px', format: (val) => val || '-' },
      { key: 'headNidn', header: 'NIDN Kaprodi', width: '120px', format: (val) => val || '-' },
      { key: 'accreditation', header: 'Akreditasi', width: '110px', align: 'center' },
      { key: 'skNumber', header: 'Nomor SK Akreditasi', width: '160px', format: (val) => val || '-' },
      { key: 'totalCreditsRequired', header: 'Beban SKS', width: '80px', align: 'center' },
      { key: 'isActive', header: 'Status', width: '90px', align: 'center', format: (val) => val ? 'Aktif' : 'Nonaktif' }
    ],
    metadata: {
      'Total Program Studi': `${filteredPrograms.length} Program Studi`,
      'Filter Jenjang': filterDegree,
      'Filter Akreditasi': filterAccreditation,
      'Filter Status': filterStatus,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredPrograms, filterDegree, filterAccreditation, filterStatus]);

  // Handler Impor Massal Program Studi
  const handleBulkImportProdi = async (data: any[], summary: BulkImportResult) => {
    try {
      await studyProgramService.bulkCreateStudyPrograms(data);
      success('Impor Berhasil', `Sebanyak ${summary.inserted} program studi berhasil ditambahkan.`);
      await loadData();
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor program studi ke server.');
    }
  };

  // Definisi Kolom Tabel Program Studi
  const prodiColumns: Column<StudyProgram>[] = [
    {
      header: 'Program Studi & Jenjang',
      width: '280px',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
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
            {row.code}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              {row.name}
            </span>
            <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
              <Badge variant="primary" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                {row.degree}
              </Badge>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                {row.degreeTitle}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Ketua Program Studi (Kaprodi)',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.headOfProgram || 'Belum Ditetapkan'}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.headNidn ? `NIDN: ${row.headNidn}` : 'NIDN: -'}
          </span>
        </div>
      )
    },
    {
      header: 'Akreditasi Institusi',
      width: '180px',
      render: (row) => {
        let badgeVariant: 'success' | 'primary' | 'warning' = 'primary';
        if (row.accreditation === 'Unggul' || row.accreditation === 'A') badgeVariant = 'success';
        if (row.accreditation === 'Baik Sekali' || row.accreditation === 'B') badgeVariant = 'primary';
        if (row.accreditation === 'Baik' || row.accreditation === 'C') badgeVariant = 'warning';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Badge variant={badgeVariant} style={{ width: 'fit-content' }}>
              <Award size={12} style={{ marginRight: '4px' }} />
              {row.accreditation}
            </Badge>
            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
              {row.skNumber || 'SK Dalam Proses'}
            </span>
          </div>
        );
      }
    },
    {
      header: 'Statistik Civitas',
      width: '180px',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div title="Jumlah Mahasiswa Aktif" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <Users size={14} color="var(--color-primary-700)" />
            <span>{row.totalStudents || 0} Mhs</span>
          </div>
          <div title="Jumlah Dosen Pengampu" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            <GraduationCap size={14} color="var(--color-warning-main)" />
            <span>{row.totalLecturers || 0} Dosen</span>
          </div>
        </div>
      )
    },
    {
      header: 'Status',
      width: '100px',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'AKTIF' : 'NONAKTIF'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      width: '230px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenDetailProdi(row)}
            title="Lihat Detail & Kurikulum"
          >
            <FileText size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Detail</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditProdi(row)}
            title="Ubah Profil Program Studi"
          >
            <Edit3 size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Ubah</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedProdi(row);
              setModalType('confirm_status');
            }}
            title={row.isActive ? 'Nonaktifkan Program Studi' : 'Aktifkan Program Studi'}
            style={{ color: row.isActive ? 'var(--color-warning-dark)' : 'var(--color-success-main)' }}
          >
            <Sliders size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedProdi(row);
              setModalType('delete_prodi');
            }}
            title="Hapus Program Studi"
            style={{ color: 'var(--color-danger-main)' }}
          >
            <Trash2 size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Hapus</span>
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
            Manajemen Program Studi & Kurikulum
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pengelolaan profil program studi, penugasan Kaprodi, akreditasi BAN-PT/LAMDIK, kurikulum OBE, serta capaian pembelajaran lulusan (CPL).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={prodiExportConfig} 
            buttonLabel="Ekspor Master Prodi" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={UploadCloud}
            onClick={() => setIsImportModalOpen(true)}
          >
            + Impor Massal Prodi
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={BookOpen}
            onClick={() => {
              if (studyPrograms.length > 0) {
                setCurriculumForm({
                  studyProgramId: studyPrograms[0].id,
                  code: '',
                  name: '',
                  year: new Date().getFullYear(),
                  totalCredits: 144,
                  mandatoryCredits: 130,
                  electiveCredits: 14,
                  description: ''
                });
                setModalType('create_curriculum');
              }
            }}
          >
            + Tambah Kurikulum
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={handleOpenCreateProdi}
          >
            + Tambah Program Studi
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
                  PROGRAM STUDI AKTIF
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalActivePrograms || studyPrograms.filter((p) => p.isActive).length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    dari {summaryStats?.totalAllPrograms || studyPrograms.length} Jurusan
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Jenjang Sarjana (S1) STAI AL-ITTIHAD</span>
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
                <Building size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  MAHASISWA TERDAFTAR
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalStudents || 35}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <Users size={13} />
                  <span>Tersebar di 5 Program Studi</span>
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
                  DOSEN PENGAJAR
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalLecturers || 12}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Dosen Homebase
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <GraduationCap size={13} />
                  <span>Kualifikasi Magister & Doktor</span>
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
                <GraduationCap size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KURIKULUM AKTIF
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalCurriculums || curriculums.length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Kurikulum OBE
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <Award size={13} />
                  <span>1 Unggul • 2 Baik Sekali • 2 Baik</span>
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
                <Award size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'prodi_list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('prodi_list')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Building size={16} />
          <span>Daftar Program Studi ({studyPrograms.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'curriculum_cpl' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('curriculum_cpl')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <BookOpen size={16} />
          <span>Struktur Kurikulum & CPL</span>
        </button>

        <button
          className={`btn ${activeTab === 'faculty_ratio' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('faculty_ratio')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Users size={16} />
          <span>Distribusi Dosen & Mahasiswa</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Daftar Program Studi */}
      {activeTab === 'prodi_list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Master Program Studi STAI AL-ITTIHAD</CardTitle>
                <CardSubtitle>Daftar resmi seluruh program studi, SK akreditasi, data pimpinan, dan statistik akademik.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari kode, nama, kaprodi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterDegree}
                  onChange={(e) => setFilterDegree(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Jenjang</option>
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                </select>

                <select
                  value={filterAccreditation}
                  onChange={(e) => setFilterAccreditation(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Akreditasi</option>
                  <option value="Unggul">Unggul</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                  <option value="Baik">Baik</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="AKTIF">Hanya Aktif</option>
                  <option value="NONAKTIF">Hanya Nonaktif</option>
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
              columns={prodiColumns}
              data={paginatedPrograms}
              keyExtractor={(row) => row.id}
              emptyMessage="Tidak ada program studi yang sesuai dengan kriteria pencarian dan filter."
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPrograms.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="program studi"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Struktur Kurikulum & CPL */}
      {activeTab === 'curriculum_cpl' && (
        <div className="flex flex-col gap-6">
          {/* Pemilih Program Studi */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <Compass size={24} color="var(--color-primary-700)" />
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                      Pilih Program Studi Kurikulum
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Tampilkan kurikulum, sebaran beban SKS, dan Capaian Pembelajaran Lulusan (CPL).
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={selectedProdiForCurriculum}
                    onChange={(e) => setSelectedProdiForCurriculum(e.target.value)}
                    className="form-select"
                    style={{ minWidth: '280px' }}
                  >
                    {studyPrograms.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} ({p.degree})
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => {
                      setCplForm({
                        studyProgramId: selectedProdiForCurriculum,
                        curriculumId: currentCurriculumsForSelected[0]?.id || '',
                        code: '',
                        category: 'PENGETAHUAN',
                        description: ''
                      });
                      setModalType('create_cpl');
                    }}
                  >
                    + Tambah CPL
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Rincian Kurikulum Aktif */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Kolom Kiri: Kartu Profil Kurikulum */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Kurikulum Program Studi</CardTitle>
                <CardSubtitle>{currentProdiForCurriculum?.name}</CardSubtitle>
              </CardHeader>
              <CardBody>
                {currentCurriculumsForSelected.length > 0 ? (
                  currentCurriculumsForSelected.map((curr) => (
                    <div 
                      key={curr.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: curr.isActive ? 'var(--color-primary-50)' : 'var(--color-slate-50)',
                        marginBottom: 'var(--space-3)'
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {curr.name}
                        </span>
                        <Badge variant={curr.isActive ? 'success' : 'default'}>
                          {curr.status}
                        </Badge>
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Kode: <strong>{curr.code}</strong> • Tahun: <strong>{curr.year}</strong>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-default" style={{ textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total SKS</div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                            {curr.totalCredits}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>SKS Wajib</div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-primary-800)' }}>
                            {curr.mandatoryCredits}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>SKS Pilihan</div>
                          <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-warning-dark)' }}>
                            {curr.electiveCredits}
                          </div>
                        </div>
                      </div>

                      {curr.description && (
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                          {curr.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}>
                    Belum ada kurikulum khusus yang didaftarkan.
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Kolom Kanan: Matriks Capaian Pembelajaran Lulusan (CPL) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center w-full">
                  <div>
                    <CardTitle>Capaian Pembelajaran Lulusan (CPL / PLO)</CardTitle>
                    <CardSubtitle>Standar kompetensi lulusan berbasis Outcome-Based Education (OBE)</CardSubtitle>
                  </div>
                  <Badge variant="primary">
                    {currentCplForSelected.length} Capaian Terdaftar
                  </Badge>
                </div>
              </CardHeader>

              <CardBody>
                {currentCplForSelected.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {currentCplForSelected.map((cpl) => {
                      let catBadge: 'success' | 'primary' | 'warning' | 'default' = 'primary';
                      let catLabel = 'Pengetahuan';

                      if (cpl.category === 'SIKAP') {
                        catBadge = 'success';
                        catLabel = 'Sikap & Karakter';
                      } else if (cpl.category === 'KETERAMPILAN_UMUM') {
                        catBadge = 'warning';
                        catLabel = 'Keterampilan Umum';
                      } else if (cpl.category === 'KETERAMPILAN_KHUSUS') {
                        catBadge = 'primary';
                        catLabel = 'Keterampilan Khusus';
                      }

                      return (
                        <div 
                          key={cpl.id}
                          style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-default)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)' }}>
                                {cpl.code}
                              </span>
                              <Badge variant={catBadge} style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
                                {catLabel}
                              </Badge>
                            </div>
                          </div>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: '4px 0 0' }}>
                            {cpl.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                    <AlertCircle size={32} style={{ margin: '0 auto var(--space-2)', opacity: 0.4 }} />
                    <div>Belum ada Capaian Pembelajaran Lulusan (CPL) untuk program studi ini.</div>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      style={{ marginTop: 'var(--space-3)' }}
                      onClick={() => {
                        setCplForm({
                          studyProgramId: selectedProdiForCurriculum,
                          curriculumId: currentCurriculumsForSelected[0]?.id || '',
                          code: 'CPL-01',
                          category: 'PENGETAHUAN',
                          description: ''
                        });
                        setModalType('create_cpl');
                      }}
                    >
                      + Tambah CPL Pertama
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* 6. Konten Tab 3: Distribusi Dosen & Mahasiswa */}
      {activeTab === 'faculty_ratio' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studyPrograms.map((prodi) => {
            const studentCount = Number(prodi.totalStudents) || 0;
            const lecturerCount = Number(prodi.totalLecturers) || 1;
            const ratio = lecturerCount > 0 ? (studentCount / lecturerCount).toFixed(1) : '0';

            return (
              <Card key={prodi.id}>
                <CardHeader>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="primary">{prodi.code}</Badge>
                        <Badge variant="default">{prodi.degree}</Badge>
                      </div>
                      <CardTitle style={{ marginTop: '6px' }}>{prodi.name}</CardTitle>
                    </div>
                    <Badge variant={prodi.accreditation === 'Unggul' ? 'success' : 'primary'}>
                      {prodi.accreditation}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    {/* Ringkasan Rasio */}
                    <div 
                      style={{ 
                        padding: 'var(--space-3)', 
                        backgroundColor: 'var(--color-primary-50)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--color-primary-200)',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', fontWeight: 'var(--font-weight-medium)' }}>
                        Rasio Dosen : Mahasiswa
                      </div>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                        1 : {ratio}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Standar Nasional Pendidikan Tinggi (Maks. 1:30 IPS)
                      </div>
                    </div>

                    {/* Kaprodi info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Ketua Program Studi:</span>
                      <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                        {prodi.headOfProgram || 'Belum Ditetapkan'}
                      </span>
                      {prodi.headNidn && (
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>NIDN: {prodi.headNidn}</span>
                      )}
                    </div>

                    {/* Kontak & Email */}
                    {prodi.email && (
                      <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <Mail size={14} color="var(--text-muted)" />
                        <span>{prodi.email}</span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-default flex justify-between items-center">
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Total SKS: {prodi.totalCreditsRequired} SKS
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDetailProdi(prodi)}>
                        Rincian Civitas
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: FORMULIR PROGRAM STUDI (TAMBAH / UBAH)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_prodi' || modalType === 'edit_prodi'}
        onClose={() => setModalType(null)}
        title={modalType === 'create_prodi' ? 'Tambah Program Studi Baru' : `Ubah Data Program Studi: ${selectedProdi?.name}`}
        maxWidth="720px"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kode Program Studi"
              placeholder="Contoh: PAI, MPI, HES"
              value={prodiForm.code}
              onChange={(e) => setProdiForm({ ...prodiForm, code: e.target.value })}
              disabled={modalType === 'edit_prodi'}
              required
              helperText="Kode unik program studi (3-5 huruf kapital)"
            />

            <div className="form-group">
              <label className="form-label" htmlFor="prodi-degree-select">Jenjang Pendidikan</label>
              <select
                id="prodi-degree-select"
                className="form-select"
                value={prodiForm.degree}
                onChange={(e) => setProdiForm({ ...prodiForm, degree: e.target.value as any })}
                required
              >
                <option value="S1">Sarjana (S1)</option>
                <option value="S2">Magister (S2)</option>
                <option value="D3">Diploma Tiga (D3)</option>
              </select>
            </div>
          </div>

          <Input
            label="Nama Lengkap Program Studi"
            placeholder="Contoh: Pendidikan Agama Islam"
            value={prodiForm.name}
            onChange={(e) => setProdiForm({ ...prodiForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Gelar Akademik Kelulusan"
              placeholder="Contoh: Sarjana Pendidikan (S.Pd.)"
              value={prodiForm.degreeTitle}
              onChange={(e) => setProdiForm({ ...prodiForm, degreeTitle: e.target.value })}
            />

            <Input
              label="Beban SKS Kelulusan"
              type="number"
              value={prodiForm.totalCreditsRequired}
              onChange={(e) => setProdiForm({ ...prodiForm, totalCreditsRequired: parseInt(e.target.value, 10) || 144 })}
              helperText="Standar kelulusan sarjana adalah 144 SKS"
            />
          </div>

          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Data Pimpinan (Ketua Program Studi)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap Kaprodi & Gelar"
                placeholder="Contoh: Dr. H. Ahmad Fauzi, M.Pd.I."
                value={prodiForm.headOfProgram}
                onChange={(e) => setProdiForm({ ...prodiForm, headOfProgram: e.target.value })}
              />

              <Input
                label="NIDN / NIP Kaprodi"
                placeholder="Contoh: 2105088201"
                value={prodiForm.headNidn}
                onChange={(e) => setProdiForm({ ...prodiForm, headNidn: e.target.value })}
              />
            </div>
          </div>

          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Akreditasi & Legalitas Institusi
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="prodi-accred-select">Peringkat Akreditasi</label>
                <select
                  id="prodi-accred-select"
                  className="form-select"
                  value={prodiForm.accreditation}
                  onChange={(e) => setProdiForm({ ...prodiForm, accreditation: e.target.value })}
                >
                  <option value="Unggul">Unggul</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                  <option value="Baik">Baik</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <Input
                label="Nomor SK Akreditasi"
                placeholder="Contoh: SK BAN-PT No. 1234/SK/..."
                value={prodiForm.skNumber}
                onChange={(e) => setProdiForm({ ...prodiForm, skNumber: e.target.value })}
              />

              <Input
                label="Tanggal Berlaku SK"
                type="date"
                value={prodiForm.skDate}
                onChange={(e) => setProdiForm({ ...prodiForm, skDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Resmi Program Studi"
              type="email"
              placeholder="Contoh: pai@stai-alittihad.ac.id"
              value={prodiForm.email}
              onChange={(e) => setProdiForm({ ...prodiForm, email: e.target.value })}
            />

            <Input
              label="Deskripsi / Visi Keilmuan"
              placeholder="Visi keilmuan dan profil lulusan..."
              value={prodiForm.description}
              onChange={(e) => setProdiForm({ ...prodiForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveProdi} isLoading={saving}>
              {modalType === 'create_prodi' ? 'Simpan Program Studi' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: DETAIL LENGKAP PROGRAM STUDI
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'detail_prodi'}
        onClose={() => setModalType(null)}
        title={`Rincian Institusional: ${selectedProdi?.name} (${selectedProdi?.code})`}
        maxWidth="760px"
      >
        {prodiDetail ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-md border border-primary-200">
              <div className="flex items-center gap-3">
                <div 
                  style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: 'var(--radius-md)', 
                    backgroundColor: 'var(--color-primary-700)', 
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 'var(--text-base)'
                  }}
                >
                  {prodiDetail.code}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    {prodiDetail.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    Jenjang {prodiDetail.degree} • {prodiDetail.degreeTitle}
                  </p>
                </div>
              </div>
              <Badge variant={prodiDetail.accreditation === 'Unggul' ? 'success' : 'primary'}>
                Akreditasi: {prodiDetail.accreditation}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>KAPRODI</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{prodiDetail.headOfProgram || '-'}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>NIDN</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{prodiDetail.headNidn || '-'}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>BEBAN SKS</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{prodiDetail.totalCreditsRequired} SKS</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>STATUS</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: prodiDetail.isActive ? 'green' : 'gray' }}>
                  {prodiDetail.isActive ? 'Aktif' : 'Nonaktif'}
                </div>
              </div>
            </div>

            {prodiDetail.description && (
              <div>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Visi & Profil Keilmuan
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {prodiDetail.description}
                </p>
              </div>
            )}

            {/* Daftar Mata Kuliah Kurikulum */}
            <div>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mata Kuliah Terdaftar ({prodiDetail.courses.length})
              </h4>
              <div className="max-h-48 overflow-y-auto border border-default rounded-md">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama Mata Kuliah</th>
                      <th>SKS</th>
                      <th>Semester</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prodiDetail.courses.length > 0 ? (
                      prodiDetail.courses.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.code}</strong></td>
                          <td>{c.name}</td>
                          <td>{c.credits} SKS</td>
                          <td>Semester {c.semester}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>
                          Belum ada mata kuliah terkait pada program studi ini.
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
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Memuat data...</div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL 3: TAMBAH KURIKULUM
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_curriculum'}
        onClose={() => setModalType(null)}
        title="Tambah Kurikulum Program Studi"
        maxWidth="600px"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="curr-prodi-select">Program Studi</label>
            <select
              id="curr-prodi-select"
              className="form-select"
              value={curriculumForm.studyProgramId}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, studyProgramId: e.target.value })}
              required
            >
              <option value="">Pilih Program Studi...</option>
              {studyPrograms.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kode Kurikulum"
              placeholder="Contoh: KUR-PAI-2024"
              value={curriculumForm.code}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, code: e.target.value })}
              required
            />
            <Input
              label="Tahun Pemberlakuan"
              type="number"
              value={curriculumForm.year}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, year: parseInt(e.target.value, 10) || new Date().getFullYear() })}
              required
            />
          </div>

          <Input
            label="Nama Kurikulum"
            placeholder="Contoh: Kurikulum OBE Berbasis Karakter 2024"
            value={curriculumForm.name}
            onChange={(e) => setCurriculumForm({ ...curriculumForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Total SKS"
              type="number"
              value={curriculumForm.totalCredits}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, totalCredits: parseInt(e.target.value, 10) || 144 })}
            />
            <Input
              label="SKS Wajib"
              type="number"
              value={curriculumForm.mandatoryCredits}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, mandatoryCredits: parseInt(e.target.value, 10) || 130 })}
            />
            <Input
              label="SKS Pilihan"
              type="number"
              value={curriculumForm.electiveCredits}
              onChange={(e) => setCurriculumForm({ ...curriculumForm, electiveCredits: parseInt(e.target.value, 10) || 14 })}
            />
          </div>

          <Input
            label="Deskripsi Kurikulum"
            placeholder="Keterangan fokus capaian dan integrasi kurikulum..."
            value={curriculumForm.description}
            onChange={(e) => setCurriculumForm({ ...curriculumForm, description: e.target.value })}
          />

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveCurriculum} isLoading={saving}>
              Simpan Kurikulum
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 4: TAMBAH CAPAIAN PEMBELAJARAN (CPL)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_cpl'}
        onClose={() => setModalType(null)}
        title="Tambah Capaian Pembelajaran Lulusan (CPL)"
        maxWidth="600px"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="cpl-prodi-select">Program Studi</label>
            <select
              id="cpl-prodi-select"
              className="form-select"
              value={cplForm.studyProgramId}
              onChange={(e) => setCplForm({ ...cplForm, studyProgramId: e.target.value })}
              required
            >
              <option value="">Pilih Program Studi...</option>
              {studyPrograms.map((p) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kode CPL"
              placeholder="Contoh: CPL-S-01, CPL-P-02"
              value={cplForm.code}
              onChange={(e) => setCplForm({ ...cplForm, code: e.target.value })}
              required
            />

            <div className="form-group">
              <label className="form-label" htmlFor="cpl-category-select">Kategori Capaian</label>
              <select
                id="cpl-category-select"
                className="form-select"
                value={cplForm.category}
                onChange={(e) => setCplForm({ ...cplForm, category: e.target.value as CPLCategory })}
                required
              >
                <option value="SIKAP">Sikap & Nilai Karakter</option>
                <option value="PENGETAHUAN">Penguasaan Pengetahuan</option>
                <option value="KETERAMPILAN_UMUM">Keterampilan Umum</option>
                <option value="KETERAMPILAN_KHUSUS">Keterampilan Khusus</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="cpl-desc-input">Deskripsi Capaian Pembelajaran</label>
            <textarea
              id="cpl-desc-input"
              className="form-input"
              rows={3}
              placeholder="Rumusan kompetensi yang harus dicapai mahasiswa..."
              value={cplForm.description}
              onChange={(e) => setCplForm({ ...cplForm, description: e.target.value })}
              required
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveCPL} isLoading={saving}>
              Simpan CPL
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 5: KONFIRMASI UBAH STATUS PROGRAM STUDI
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_status'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Status Program Studi"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-warning-surface rounded-md border border-warning">
            <AlertCircle size={24} color="var(--color-warning-dark)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-dark)', margin: 0 }}>
              Apakah Anda yakin ingin <strong>{selectedProdi?.isActive ? 'menonaktifkan' : 'mengaktifkan'}</strong> Program Studi <strong>{selectedProdi?.name}</strong>?
            </p>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Program studi yang dinonaktifkan tidak akan menerima pendaftaran mahasiswa baru atau penjadwalan kelas baru pada semester mendatang.
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant={selectedProdi?.isActive ? 'danger' : 'primary'} 
              onClick={handleToggleStatus} 
              isLoading={saving}
            >
              Ya, {selectedProdi?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 6: KONFIRMASI HAPUS PROGRAM STUDI PERMANEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'delete_prodi'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Hapus Program Studi"
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
                Apakah Anda yakin ingin menghapus Program Studi <strong>{selectedProdi?.name} ({selectedProdi?.code})</strong>? Data kurikulum dan capaian pembelajaran terkait akan ikut dibersihkan.
              </p>
            </div>
          </div>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div><strong>Kode Program Studi:</strong> {selectedProdi?.code}</div>
            <div><strong>Nama Program Studi:</strong> {selectedProdi?.name} ({selectedProdi?.degree})</div>
            <div><strong>Ketua Program Studi:</strong> {selectedProdi?.headOfProgram || 'Belum Ditetapkan'}</div>
            <div><strong>Akreditasi:</strong> {selectedProdi?.accreditation}</div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2}
              onClick={handleDeleteProdi} 
              isLoading={saving}
            >
              Ya, Hapus Program Studi
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 7: WIZARD IMPOR MASSAL DATA PROGRAM STUDI
          ===================================================================== */}
      {isImportModalOpen && (
        <DataImportModal<StudyProgram>
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          schema={STUDY_PROGRAM_IMPORT_SCHEMA}
          onImport={handleBulkImportProdi}
          customTitle="Pusat Impor Master Data Program Studi"
        />
      )}
    </div>
  );
};
