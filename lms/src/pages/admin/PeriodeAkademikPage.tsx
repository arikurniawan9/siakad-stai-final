import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  AlertCircle, 
  Archive, 
  Edit3, 
  Layers, 
  Users, 
  BookOpen, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  Building2, 
  CalendarDays, 
  Info,
  Check,
  Trash2,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { ExportDropdown, ExportConfig } from '../../components/export-import';
import { 
  AcademicYear, 
  Semester, 
  PeriodSummaryStats, 
  SemesterType 
} from '../../types/period';
import { periodService } from '../../services/periodService';

type ActiveTab = 'SEMESTER' | 'TAHUN_AKADEMIK' | 'LINIMASA';

export const PeriodeAkademikPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('SEMESTER');
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<PeriodSummaryStats | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  // Pagination States
  const [currentPageSemesters, setCurrentPageSemesters] = useState<number>(1);
  const [pageSizeSemesters, setPageSizeSemesters] = useState<number>(10);
  const [currentPageYears, setCurrentPageYears] = useState<number>(1);
  const [pageSizeYears, setPageSizeYears] = useState<number>(10);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPageSemesters(1);
    setCurrentPageYears(1);
  }, [searchQuery, selectedYearFilter, selectedStatusFilter]);

  const hasActiveFilters = searchQuery !== '' || selectedYearFilter !== 'ALL' || selectedStatusFilter !== 'ALL';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedYearFilter('ALL');
    setSelectedStatusFilter('ALL');
    setCurrentPageSemesters(1);
    setCurrentPageYears(1);
  };

  // Modal states
  const [showAddYearModal, setShowAddYearModal] = useState(false);
  const [showAddSemesterModal, setShowAddSemesterModal] = useState(false);
  const [showEditSemesterModal, setShowEditSemesterModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showDeleteYearModal, setShowDeleteYearModal] = useState(false);
  const [selectedYearToDelete, setSelectedYearToDelete] = useState<AcademicYear | null>(null);
  const [showDeleteSemesterModal, setShowDeleteSemesterModal] = useState(false);
  const [selectedSemesterToDelete, setSelectedSemesterToDelete] = useState<Semester | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSemesterToEdit, setSelectedSemesterToEdit] = useState<Semester | null>(null);
  const [selectedSemesterToActivate, setSelectedSemesterToActivate] = useState<Semester | null>(null);

  // Form states: Tahun Akademik
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('');
  const [yearEndDate, setYearEndDate] = useState('');
  const [yearDescription, setYearDescription] = useState('');

  // Form states: Semester
  const [semAcademicYearId, setSemAcademicYearId] = useState('');
  const [semType, setSemType] = useState<SemesterType>('GANJIL');
  const [semName, setSemName] = useState('');
  const [semStartDate, setSemStartDate] = useState('');
  const [semEndDate, setSemEndDate] = useState('');
  const [semKrsStart, setSemKrsStart] = useState('');
  const [semKrsEnd, setSemKrsEnd] = useState('');
  const [semUtsStart, setSemUtsStart] = useState('');
  const [semUtsEnd, setSemUtsEnd] = useState('');
  const [semUasStart, setSemUasStart] = useState('');
  const [semUasEnd, setSemUasEnd] = useState('');
  const [semGradeDeadline, setSemGradeDeadline] = useState('');

  const isReadOnly = user?.role === 'pimpinan';

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summary, years, sems] = await Promise.all([
        periodService.getSummaryStats(),
        periodService.getAcademicYears(),
        periodService.getSemesters()
      ]);
      setSummaryData(summary);
      setAcademicYears(years);
      setSemesters(sems);
    } catch {
      toast.danger('Gagal Memuat Data', 'Tidak dapat mengambil data periode akademik dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler: Tambah Tahun Akademik
  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim() || !yearStartDate || !yearEndDate) {
      toast.warning('Form Belum Lengkap', 'Nama tahun akademik, tanggal mulai, dan tanggal selesai wajib diisi.');
      return;
    }

    if (new Date(yearStartDate) >= new Date(yearEndDate)) {
      toast.warning('Validasi Tanggal', 'Tanggal selesai harus lebih besar dari tanggal mulai.');
      return;
    }

    try {
      await periodService.createAcademicYear({
        name: yearName.trim(),
        startDate: yearStartDate,
        endDate: yearEndDate,
        description: yearDescription.trim()
      });
      toast.success('Tahun Akademik Ditambahkan', `Tahun akademik "${yearName}" berhasil didaftarkan.`);
      setShowAddYearModal(false);
      setYearName('');
      setYearStartDate('');
      setYearEndDate('');
      setYearDescription('');
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Menambah Tahun Akademik', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handler: Tambah Semester Baru
  const handleCreateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semAcademicYearId || !semStartDate || !semEndDate) {
      toast.warning('Form Belum Lengkap', 'Pilih tahun akademik serta tentukan tanggal mulai dan selesai perkuliahan.');
      return;
    }

    if (new Date(semStartDate) >= new Date(semEndDate)) {
      toast.warning('Validasi Tanggal', 'Tanggal akhir perkuliahan harus sesudah tanggal mulai perkuliahan.');
      return;
    }

    try {
      await periodService.createSemester({
        academicYearId: semAcademicYearId,
        semesterType: semType,
        name: semName.trim() || undefined,
        startDate: semStartDate,
        endDate: semEndDate,
        krsStartDate: semKrsStart || undefined,
        krsEndDate: semKrsEnd || undefined,
        utsStartDate: semUtsStart || undefined,
        utsEndDate: semUtsEnd || undefined,
        uasStartDate: semUasStart || undefined,
        uasEndDate: semUasEnd || undefined,
        gradeDeadline: semGradeDeadline || undefined
      });
      toast.success('Semester Berhasil Dibuat', 'Linimasa semester baru berhasil ditambahkan.');
      setShowAddSemesterModal(false);
      resetSemesterForm();
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Membuat Semester', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handler: Buka Modal Edit Semester
  const openEditModal = (sem: Semester) => {
    setSelectedSemesterToEdit(sem);
    setSemName(sem.name);
    setSemStartDate(sem.startDate ? sem.startDate.split('T')[0] : '');
    setSemEndDate(sem.endDate ? sem.endDate.split('T')[0] : '');
    setSemKrsStart(sem.krsStartDate ? sem.krsStartDate.split('T')[0] : '');
    setSemKrsEnd(sem.krsEndDate ? sem.krsEndDate.split('T')[0] : '');
    setSemUtsStart(sem.utsStartDate ? sem.utsStartDate.split('T')[0] : '');
    setSemUtsEnd(sem.utsEndDate ? sem.utsEndDate.split('T')[0] : '');
    setSemUasStart(sem.uasStartDate ? sem.uasStartDate.split('T')[0] : '');
    setSemUasEnd(sem.uasEndDate ? sem.uasEndDate.split('T')[0] : '');
    setSemGradeDeadline(sem.gradeDeadline ? sem.gradeDeadline.split('T')[0] : '');
    setShowEditSemesterModal(true);
  };

  // Handler: Simpan Perubahan Semester
  const handleUpdateSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSemesterToEdit) return;

    if (semStartDate && semEndDate && new Date(semStartDate) >= new Date(semEndDate)) {
      toast.warning('Validasi Tanggal', 'Tanggal akhir perkuliahan harus sesudah tanggal mulai perkuliahan.');
      return;
    }

    try {
      await periodService.updateSemester(selectedSemesterToEdit.id, {
        name: semName.trim(),
        startDate: semStartDate,
        endDate: semEndDate,
        krsStartDate: semKrsStart || undefined,
        krsEndDate: semKrsEnd || undefined,
        utsStartDate: semUtsStart || undefined,
        utsEndDate: semUtsEnd || undefined,
        uasStartDate: semUasStart || undefined,
        uasEndDate: semUasEnd || undefined,
        gradeDeadline: semGradeDeadline || undefined
      });
      toast.success('Perubahan Disimpan', `Linimasa "${semName}" berhasil diperbarui.`);
      setShowEditSemesterModal(false);
      setSelectedSemesterToEdit(null);
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Perubahan', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handler: Aktifkan Semester
  const handleActivateSemester = async () => {
    if (!selectedSemesterToActivate) return;
    try {
      await periodService.activateSemester(selectedSemesterToActivate.id);
      toast.success('Periode Aktif Diperbarui', `Periode aktif sistem berhasil dialihkan ke ${selectedSemesterToActivate.name}.`);
      setShowActivateModal(false);
      setSelectedSemesterToActivate(null);
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Mengaktifkan Periode', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handler: Arsipkan Semester
  const handleArchiveSemester = async (semesterId: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin mengarsipkan ${name}? Data perkuliahan akan dibekukan.`)) return;
    try {
      await periodService.archiveSemester(semesterId);
      toast.success('Periode Diarsipkan', `${name} telah dipindahkan ke arsip.`);
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Mengarsipkan', err.message || 'Terjadi kesalahan sistem.');
    }
  };

  // Handler: Hapus Tahun Akademik
  const handleDeleteYear = async () => {
    if (!selectedYearToDelete) return;
    try {
      setIsDeleting(true);
      await periodService.deleteAcademicYear(selectedYearToDelete.id);
      toast.success('Tahun Akademik Dihapus', `Tahun akademik "${selectedYearToDelete.name}" beserta semester terkait berhasil dihapus.`);
      setShowDeleteYearModal(false);
      setSelectedYearToDelete(null);
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus tahun akademik.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler: Hapus Semester
  const handleDeleteSemester = async () => {
    if (!selectedSemesterToDelete) return;
    try {
      setIsDeleting(true);
      await periodService.deleteSemester(selectedSemesterToDelete.id);
      toast.success('Semester Dihapus', `Semester "${selectedSemesterToDelete.name}" berhasil dihapus.`);
      setShowDeleteSemesterModal(false);
      setSelectedSemesterToDelete(null);
      loadData();
    } catch (err: any) {
      toast.danger('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus semester.');
    } finally {
      setIsDeleting(false);
    }
  };

  const resetSemesterForm = () => {
    setSemAcademicYearId(academicYears[0]?.id || '');
    setSemType('GANJIL');
    setSemName('');
    setSemStartDate('');
    setSemEndDate('');
    setSemKrsStart('');
    setSemKrsEnd('');
    setSemUtsStart('');
    setSemUtsEnd('');
    setSemUasStart('');
    setSemUasEnd('');
    setSemGradeDeadline('');
  };

  // Filter & Search Logic
  const filteredSemesters = useMemo(() => {
    return semesters.filter(s => {
      const matchYear = selectedYearFilter === 'ALL' || s.academicYearId === selectedYearFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;
      const matchQuery = !searchQuery.trim() || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.academicYearName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchYear && matchStatus && matchQuery;
    });
  }, [semesters, selectedYearFilter, selectedStatusFilter, searchQuery]);

  const filteredYears = useMemo(() => {
    return academicYears.filter(y => {
      const matchQuery = !searchQuery.trim() || 
        y.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (y.description && y.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchQuery;
    });
  }, [academicYears, searchQuery]);

  // Paginated Semesters
  const totalPagesSemesters = Math.ceil(filteredSemesters.length / pageSizeSemesters) || 1;
  const paginatedSemesters = useMemo(() => {
    const start = (currentPageSemesters - 1) * pageSizeSemesters;
    return filteredSemesters.slice(start, start + pageSizeSemesters);
  }, [filteredSemesters, currentPageSemesters, pageSizeSemesters]);

  // Paginated Years
  const totalPagesYears = Math.ceil(filteredYears.length / pageSizeYears) || 1;
  const paginatedYears = useMemo(() => {
    const start = (currentPageYears - 1) * pageSizeYears;
    return filteredYears.slice(start, start + pageSizeYears);
  }, [filteredYears, currentPageYears, pageSizeYears]);

  const formatDate = (dStr?: string) => {
    if (!dStr) return '-';
    try {
      return new Date(dStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dStr;
    }
  };

  const getStatusBadge = (status: string, isCurrent: boolean) => {
    if (isCurrent || status === 'AKTIF') {
      return <Badge variant="success">Periode Aktif</Badge>;
    }
    if (status === 'SELESAI') {
      return <Badge variant="primary">Selesai</Badge>;
    }
    if (status === 'DIARSIPKAN') {
      return <Badge variant="warning">Diarsipkan</Badge>;
    }
    return <Badge variant="default">Draf</Badge>;
  };

  const getSemesterTypeBadge = (type: SemesterType) => {
    switch (type) {
      case 'GANJIL':
        return <Badge variant="primary">Ganjil</Badge>;
      case 'GENAP':
        return <Badge variant="info">Genap</Badge>;
      case 'PENDEK':
        return <Badge variant="warning">Pendek</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  // Columns: Semester Table
  const semesterColumns: Column<Semester>[] = [
    {
      header: 'Nama Semester',
      width: '260px',
      render: (row) => (
        <div>
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
              {row.name}
            </span>
            {row.isCurrent && (
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 'var(--font-weight-bold)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-800)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                Aktif
              </span>
            )}
          </div>
          <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            <Building2 size={12} />
            <span>{row.academicYearName}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Tipe',
      width: '100px',
      render: (row) => getSemesterTypeBadge(row.semesterType)
    },
    {
      header: 'Rentang Perkuliahan',
      width: '220px',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <div className="flex items-center gap-1" style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)' }}>
            <CalendarDays size={13} style={{ color: 'var(--text-muted)' }} />
            <span>{formatDate(row.startDate)} – {formatDate(row.endDate)}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem', marginTop: '2px' }}>
            Durasi: 16 Pekan / Pertemuan
          </div>
        </div>
      )
    },
    {
      header: 'Jadwal KRS & Ujian',
      width: '210px',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div>
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-secondary)' }}>KRS:</span>{' '}
            <span style={{ color: 'var(--text-primary)' }}>
              {row.krsStartDate ? `${formatDate(row.krsStartDate)} – ${formatDate(row.krsEndDate)}` : '-'}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>
            UTS: {row.utsStartDate ? formatDate(row.utsStartDate) : '-'} • UAS: {row.uasStartDate ? formatDate(row.uasStartDate) : '-'}
          </div>
        </div>
      )
    },
    {
      header: 'Batas Nilai Dosen',
      width: '150px',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          {row.gradeDeadline ? (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-warning-bg)',
              color: 'var(--color-warning-text)',
              fontWeight: 'var(--font-weight-semibold)',
              border: '1px solid var(--color-warning-border)'
            }}>
              <Clock size={11} />
              {formatDate(row.gradeDeadline)}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>-</span>
          )}
        </div>
      )
    },
    {
      header: 'Kelas / Mahasiswa',
      width: '140px',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
            {row.totalClassesCount || 0} Kelas
          </span>
          <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            {row.totalStudentsCount || 0} Mhs
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      width: '120px',
      render: (row) => getStatusBadge(row.status, row.isCurrent)
    },
    {
      header: 'Tindakan',
      width: '160px',
      render: (row) => (
        <div className="flex items-center gap-1">
          {!isReadOnly && (
            <>
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Edit3}
                onClick={() => openEditModal(row)}
                title="Ubah Linimasa Semester"
              >
                Ubah
              </Button>
              {!row.isCurrent && row.status !== 'DIARSIPKAN' && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={Sparkles}
                  onClick={() => {
                    setSelectedSemesterToActivate(row);
                    setShowActivateModal(true);
                  }}
                  title="Jadikan Semester Aktif"
                >
                  Aktifkan
                </Button>
              )}
              {row.status === 'SELESAI' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  icon={Archive}
                  onClick={() => handleArchiveSemester(row.id, row.name)}
                  title="Arsipkan Semester"
                >
                  Arsip
                </Button>
              )}
              {!row.isActive && !row.isCurrent && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedSemesterToDelete(row);
                    setShowDeleteSemesterModal(true);
                  }}
                  title="Hapus Semester"
                  style={{ color: 'var(--color-danger-main)' }}
                >
                  <Trash2 size={14} />
                  <span style={{ fontSize: 'var(--text-xs)' }}>Hapus</span>
                </Button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  // Columns: Master Tahun Akademik Table
  const yearColumns: Column<AcademicYear>[] = [
    {
      header: 'Nama Tahun Akademik',
      width: '260px',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
            {row.name}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            {row.description || 'Tahun akademik kurikulum reguler'}
          </div>
        </div>
      )
    },
    {
      header: 'Rentang Periode',
      width: '220px',
      render: (row) => (
        <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <CalendarDays size={13} style={{ color: 'var(--text-muted)' }} />
          <span>{formatDate(row.startDate)} – {formatDate(row.endDate)}</span>
        </div>
      )
    },
    {
      header: 'Total Semester',
      width: '150px',
      render: (row) => {
        const count = semesters.filter(s => s.academicYearId === row.id).length;
        return (
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
            {count} Semester
          </div>
        );
      }
    },
    {
      header: 'Status',
      width: '120px',
      render: (row) => (
        row.isActive ? (
          <Badge variant="success">Aktif</Badge>
        ) : (
          <Badge variant="default">Non-Aktif</Badge>
        )
      )
    },
    {
      header: 'Aksi',
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-1">
          {!isReadOnly && !row.isActive && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSelectedYearToDelete(row);
                setShowDeleteYearModal(true);
              }}
              title="Hapus Tahun Akademik"
              style={{ color: 'var(--color-danger-main)' }}
            >
              <Trash2 size={14} />
              <span style={{ fontSize: 'var(--text-xs)' }}>Hapus</span>
            </Button>
          )}
        </div>
      )
    }
  ];

  // Konfigurasi Ekspor Linimasa Semester Akademik
  const semesterExportConfig: ExportConfig<Semester> = useMemo(() => ({
    filename: 'SALAM_Linimasa_Semester_Akademik',
    title: 'MASTER DATA SEMESTER & KALENDER AKADEMIK',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredSemesters,
    columns: [
      { key: 'name', header: 'Nama Semester', width: '220px' },
      { key: 'academicYearName', header: 'Tahun Akademik', width: '150px' },
      { key: 'semesterType', header: 'Tipe Semester', width: '110px', align: 'center' },
      { key: 'startDate', header: 'Awal Perkuliahan', width: '130px', align: 'center', format: (val) => formatDate(val) },
      { key: 'endDate', header: 'Akhir Perkuliahan', width: '130px', align: 'center', format: (val) => formatDate(val) },
      { key: 'krsStartDate', header: 'Awal KRS', width: '120px', align: 'center', format: (val) => formatDate(val) },
      { key: 'krsEndDate', header: 'Batas KRS', width: '120px', align: 'center', format: (val) => formatDate(val) },
      { key: 'utsStartDate', header: 'Jadwal UTS', width: '120px', align: 'center', format: (val) => formatDate(val) },
      { key: 'uasStartDate', header: 'Jadwal UAS', width: '120px', align: 'center', format: (val) => formatDate(val) },
      { key: 'gradeDeadline', header: 'Batas Nilai Dosen', width: '130px', align: 'center', format: (val) => formatDate(val) },
      { key: 'status', header: 'Status Periode', width: '110px', align: 'center' },
      { key: 'isCurrent', header: 'Periode Aktif', width: '100px', align: 'center', format: (val) => val ? 'AKTIF' : 'TIDAK' }
    ],
    metadata: {
      'Total Semester': `${filteredSemesters.length} Semester`,
      'Filter Tahun': selectedYearFilter,
      'Filter Status': selectedStatusFilter,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredSemesters, selectedYearFilter, selectedStatusFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Administrasi Akademik</Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Zona Waktu: Asia/Jakarta (WIB)
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
            Pengelolaan Periode & Semester Akademik
          </h1>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pusat konfigurasi tahun akademik, semester perkuliahan, rentang pengisian KRS daring, jadwal ujian, dan batas akhir penilaian dosen STAI AL-ITTIHAD.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown<Semester>
            config={semesterExportConfig}
            buttonLabel="Ekspor Kalender"
          />

          {!isReadOnly && (
            <>
              <Button 
                variant="secondary" 
                icon={Plus}
                onClick={() => setShowAddYearModal(true)}
              >
                Tambah Tahun
              </Button>
              <Button 
                variant="primary" 
                icon={Plus}
                onClick={() => {
                  if (academicYears.length > 0) setSemAcademicYearId(academicYears[0].id);
                  setShowAddSemesterModal(true);
                }}
              >
                Tambah Semester
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2. Kartu Statistik Ringkasan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Card 1: Periode Aktif */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-700)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Periode Aktif Sistem
              </div>
              <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {summaryData?.activeSemester?.name || 'Semester Ganjil 2026/2027'}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Card 2: Kelas Berjalan */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-info-bg)',
              color: 'var(--color-info-main)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Layers size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Kelas Aktif Berjalan
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                {summaryData?.stats.activeSemesterClassesCount || 0}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Card 3: Mahasiswa Terdaftar */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: '#ede9fe',
              color: '#6d28d9',
              borderRadius: 'var(--radius-lg)'
            }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mahasiswa Terdaftar
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                {summaryData?.stats.activeSemesterStudentsCount || 0}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Card 4: Dosen Pengampu */}
        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warning-bg)',
              color: 'var(--color-warning-main)',
              borderRadius: 'var(--radius-lg)'
            }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dosen Pengampu
              </div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                {summaryData?.stats.activeSemesterLecturersCount || 0}
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tombol Navigasi Tab */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={activeTab === 'SEMESTER' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('SEMESTER')}
        >
          Semester & Linimasa ({semesters.length})
        </Button>
        <Button 
          variant={activeTab === 'TAHUN_AKADEMIK' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('TAHUN_AKADEMIK')}
        >
          Master Tahun Akademik ({academicYears.length})
        </Button>
        <Button 
          variant={activeTab === 'LINIMASA' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('LINIMASA')}
        >
          Agenda & Kalender Visual
        </Button>
      </div>

      {/* 4. Tab Content 1: Semester & Linimasa */}
      {activeTab === 'SEMESTER' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daftar Semester & Linimasa Perkuliahan</CardTitle>
              <CardSubtitle>Kelola jadwal kuliah, batas pengisian KRS, dan batas akhir penilaian dosen</CardSubtitle>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Search */}
              <input
                type="text"
                placeholder="Cari semester..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '180px', padding: 'var(--space-1-5) var(--space-3)', fontSize: 'var(--text-xs)' }}
              />

              {/* Filter Tahun */}
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: 'var(--space-1-5) var(--space-3)', fontSize: 'var(--text-xs)' }}
              >
                <option value="ALL">Semua Tahun Akademik</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>

              {/* Filter Status */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="form-select"
                style={{ width: 'auto', padding: 'var(--space-1-5) var(--space-3)', fontSize: 'var(--text-xs)' }}
              >
                <option value="ALL">Semua Status</option>
                <option value="AKTIF">Aktif</option>
                <option value="DRAF">Draf</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIARSIPKAN">Diarsipkan</option>
              </select>

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                >
                  Reset
                </Button>
              )}

              <Button variant="secondary" size="sm" icon={RotateCcw} onClick={loadData}>
                Segarkan
              </Button>
            </div>
          </CardHeader>

          <CardBody style={{ padding: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Memuat data linimasa akademik...
              </div>
            ) : filteredSemesters.length === 0 ? (
              <div style={{ padding: 'var(--space-6)' }}>
                <EmptyState
                  title="Tidak Ada Semester"
                  description="Tidak ditemukan semester yang sesuai dengan filter atau kata kunci pencarian Anda."
                />
              </div>
            ) : (
              <>
                <Table 
                  columns={semesterColumns} 
                  data={paginatedSemesters} 
                  keyExtractor={(row) => row.id} 
                  emptyMessage="Belum ada semester akademik yang terdaftar."
                />
                <div style={{ padding: 'var(--space-2) var(--space-4)' }}>
                  <Pagination
                    currentPage={currentPageSemesters}
                    totalPages={totalPagesSemesters}
                    totalItems={filteredSemesters.length}
                    pageSize={pageSizeSemesters}
                    onPageChange={setCurrentPageSemesters}
                    onPageSizeChange={setPageSizeSemesters}
                    itemLabel="semester akademik"
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* 4. Tab Content 2: Master Tahun Akademik */}
      {activeTab === 'TAHUN_AKADEMIK' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daftar Induk Tahun Akademik</CardTitle>
              <CardSubtitle>Struktur induk periode kalender akademik institusi STAI AL-ITTIHAD</CardSubtitle>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Cari tahun akademik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ width: '220px', padding: 'var(--space-1-5) var(--space-3)', fontSize: 'var(--text-xs)' }}
              />

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                >
                  Reset
                </Button>
              )}

              {!isReadOnly && (
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={Plus} 
                  onClick={() => setShowAddYearModal(true)}
                >
                  Tambah Tahun
                </Button>
              )}
            </div>
          </CardHeader>

          <CardBody style={{ padding: 0 }}>
            {isLoading ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                Memuat data tahun akademik...
              </div>
            ) : filteredYears.length === 0 ? (
              <div style={{ padding: 'var(--space-6)' }}>
                <EmptyState
                  title="Tidak Ada Tahun Akademik"
                  description="Tidak ditemukan data tahun akademik yang sesuai dengan kriteria pencarian."
                />
              </div>
            ) : (
              <>
                <Table 
                  columns={yearColumns} 
                  data={paginatedYears} 
                  keyExtractor={(row) => row.id} 
                  emptyMessage="Belum ada tahun akademik yang terdaftar."
                />
                <div style={{ padding: 'var(--space-2) var(--space-4)' }}>
                  <Pagination
                    currentPage={currentPageYears}
                    totalPages={totalPagesYears}
                    totalItems={filteredYears.length}
                    pageSize={pageSizeYears}
                    onPageChange={setCurrentPageYears}
                    onPageSizeChange={setPageSizeYears}
                    itemLabel="tahun akademik"
                  />
                </div>
              </>
            )}
          </CardBody>
        </Card>
      )}

      {/* 4. Tab Content 3: Agenda & Kalender Visual */}
      {activeTab === 'LINIMASA' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Linimasa Tahapan Semester Aktif</CardTitle>
              <CardSubtitle>
                {summaryData?.activeSemester?.name || 'Semester Ganjil 2026/2027'} ({summaryData?.activeSemester?.academicYearName})
              </CardSubtitle>
            </div>
            <Badge variant="success">Semester Berjalan</Badge>
          </CardHeader>
          <CardBody>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
              {/* Step 1: KRS */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-100)',
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-2)'
                }}>
                  1
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  Pengisian KRS Daring
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {formatDate(summaryData?.activeSemester?.krsStartDate)} – {formatDate(summaryData?.activeSemester?.krsEndDate)}
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-success-text)' }}>
                  ✓ Selesai
                </div>
              </div>

              {/* Step 2: Perkuliahan */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-primary-50)',
                border: '1px solid var(--color-primary-300)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-700)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-2)'
                }}>
                  2
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)', textTransform: 'uppercase' }}>
                  Masa Perkuliahan
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', marginTop: '4px', fontWeight: 'var(--font-weight-medium)' }}>
                  {formatDate(summaryData?.activeSemester?.startDate)} – {formatDate(summaryData?.activeSemester?.endDate)}
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)' }}>
                  ● Sedang Berlangsung
                </div>
              </div>

              {/* Step 3: UTS */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-info-bg)',
                  color: 'var(--color-info-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-2)'
                }}>
                  3
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  Ujian Tengah Semester (UTS)
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {formatDate(summaryData?.activeSemester?.utsStartDate)} – {formatDate(summaryData?.activeSemester?.utsEndDate)}
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Pertemuan ke-8
                </div>
              </div>

              {/* Step 4: UAS */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-slate-50)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: '#ede9fe',
                  color: '#6d28d9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-2)'
                }}>
                  4
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', textTransform: 'uppercase' }}>
                  Ujian Akhir Semester (UAS)
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {formatDate(summaryData?.activeSemester?.uasStartDate)} – {formatDate(summaryData?.activeSemester?.uasEndDate)}
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  Pertemuan ke-16
                </div>
              </div>

              {/* Step 5: Batas Nilai */}
              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-warning-bg)',
                border: '1px solid var(--color-warning-border)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-warning-border)',
                  color: 'var(--color-warning-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-2)'
                }}>
                  5
                </div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-warning-text)', textTransform: 'uppercase' }}>
                  Batas Akhir Nilai Dosen
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning-text)', fontWeight: 'var(--font-weight-semibold)', marginTop: '4px' }}>
                  {formatDate(summaryData?.activeSemester?.gradeDeadline)}
                </div>
                <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--color-warning-text)' }}>
                  Penutupan KHS
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* 5. MODAL: Tambah Tahun Akademik */}
      <Modal
        isOpen={showAddYearModal}
        onClose={() => setShowAddYearModal(false)}
        title="Tambah Tahun Akademik Baru"
      >
        <form onSubmit={handleCreateYear} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-info-bg)',
            border: '1px solid var(--color-info-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-info-text)'
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-info-main)' }} />
            <div>
              Tahun akademik merupakan payung induk yang memuat Semester Ganjil, Semester Genap, dan Semester Pendek.
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Nama Tahun Akademik <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <input 
              type="text" 
              placeholder="Contoh: 2027/2028"
              className="form-input"
              value={yearName}
              onChange={(e) => setYearName(e.target.value)}
              required
            />
            <span className="form-helper">Format baku penamaan tahun akademik kampus.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Tanggal Mulai <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-input"
                value={yearStartDate}
                onChange={(e) => setYearStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Tanggal Selesai <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <input 
                type="date" 
                className="form-input"
                value={yearEndDate}
                onChange={(e) => setYearEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Keterangan / Catatan Kebijakan
            </label>
            <textarea 
              rows={2}
              placeholder="Catatan SK Rektor atau kebijakan akademik terkait..."
              className="form-input"
              style={{ resize: 'none' }}
              value={yearDescription}
              onChange={(e) => setYearDescription(e.target.value)}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddYearModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Simpan Tahun Akademik
            </Button>
          </div>
        </form>
      </Modal>

      {/* 6. MODAL: Tambah Semester Baru */}
      <Modal
        isOpen={showAddSemesterModal}
        onClose={() => setShowAddSemesterModal(false)}
        title="Tambah Semester Perkuliahan Baru"
        maxWidth="680px"
      >
        <form onSubmit={handleCreateSemester} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Bagian 1: Identitas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Tahun Akademik Induk <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={semAcademicYearId}
                onChange={(e) => setSemAcademicYearId(e.target.value)}
                required
              >
                <option value="">-- Pilih Tahun Akademik --</option>
                {academicYears.map(y => (
                  <option key={y.id} value={y.id}>{y.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Tipe Semester <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <select
                className="form-select"
                value={semType}
                onChange={(e) => setSemType(e.target.value as SemesterType)}
                required
              >
                <option value="GANJIL">Semester Ganjil</option>
                <option value="GENAP">Semester Genap</option>
                <option value="PENDEK">Semester Pendek</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nama Label Semester (Opsional)</label>
            <input 
              type="text" 
              placeholder="Contoh: Semester Ganjil 2027/2028 (Dibuat otomatis bila kosong)"
              className="form-input"
              value={semName}
              onChange={(e) => setSemName(e.target.value)}
            />
          </div>

          {/* Bagian 2: Linimasa Perkuliahan */}
          <div style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--space-3)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)'
            }}>
              1. Linimasa Utama Perkuliahan
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Mulai Kuliah <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                </label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semStartDate}
                  onChange={(e) => setSemStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Selesai Kuliah <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                </label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semEndDate}
                  onChange={(e) => setSemEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Bagian 3: Jadwal KRS & Ujian */}
          <div style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--space-3)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)'
            }}>
              2. Jadwal KRS & Evaluasi
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai Pengisian KRS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semKrsStart}
                  onChange={(e) => setSemKrsStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Batas Akhir KRS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semKrsEnd}
                  onChange={(e) => setSemKrsEnd(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai UTS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUtsStart}
                  onChange={(e) => setSemUtsStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selesai UTS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUtsEnd}
                  onChange={(e) => setSemUtsEnd(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai UAS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUasStart}
                  onChange={(e) => setSemUasStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selesai UAS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUasEnd}
                  onChange={(e) => setSemUasEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Bagian 4: Batas Penilaian Dosen */}
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <label className="form-label" style={{ color: 'var(--color-warning-text)', fontWeight: 'var(--font-weight-bold)' }}>
              Batas Akhir Penyerahan Nilai Dosen
            </label>
            <input 
              type="date" 
              className="form-input"
              style={{ backgroundColor: 'var(--bg-surface)' }}
              value={semGradeDeadline}
              onChange={(e) => setSemGradeDeadline(e.target.value)}
            />
            <span className="form-helper" style={{ color: 'var(--color-warning-text)', marginTop: '4px', display: 'block' }}>
              Setelah tanggal ini, sistem akan otomatis mengunci akses penginputan nilai akhir dosen.
            </span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button type="button" variant="secondary" onClick={() => setShowAddSemesterModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Simpan Semester
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL: Ubah Semester */}
      <Modal
        isOpen={showEditSemesterModal}
        onClose={() => setShowEditSemesterModal(false)}
        title="Ubah Linimasa Semester Akademik"
        maxWidth="680px"
      >
        <form onSubmit={handleUpdateSemester} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Nama Semester <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <input 
              type="text" 
              className="form-input"
              value={semName}
              onChange={(e) => setSemName(e.target.value)}
              required
            />
          </div>

          <div style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--space-3)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)'
            }}>
              Linimasa Perkuliahan
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Mulai Kuliah</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semStartDate}
                  onChange={(e) => setSemStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Tanggal Selesai Kuliah</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semEndDate}
                  onChange={(e) => setSemEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-default)',
            paddingTop: 'var(--space-3)'
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-2)'
            }}>
              Jadwal KRS & Ujian
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai KRS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semKrsStart}
                  onChange={(e) => setSemKrsStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Batas Akhir KRS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semKrsEnd}
                  onChange={(e) => setSemKrsEnd(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai UTS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUtsStart}
                  onChange={(e) => setSemUtsStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selesai UTS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUtsEnd}
                  onChange={(e) => setSemUtsEnd(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mulai UAS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUasStart}
                  onChange={(e) => setSemUasStart(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Selesai UAS</label>
                <input 
                  type="date" 
                  className="form-input"
                  value={semUasEnd}
                  onChange={(e) => setSemUasEnd(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            <label className="form-label" style={{ color: 'var(--color-warning-text)', fontWeight: 'var(--font-weight-bold)' }}>
              Batas Akhir Penyerahan Nilai Dosen
            </label>
            <input 
              type="date" 
              className="form-input"
              style={{ backgroundColor: 'var(--bg-surface)' }}
              value={semGradeDeadline}
              onChange={(e) => setSemGradeDeadline(e.target.value)}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button type="button" variant="secondary" onClick={() => setShowEditSemesterModal(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" icon={Check}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. MODAL: Konfirmasi Aktivasi Semester */}
      <Modal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        title="Konfirmasi Pengalihan Periode Aktif"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-border)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2-5)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-warning-text)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-warning-main)' }} />
            <div>
              <strong>Perhatian Penting:</strong> Mengaktifkan <strong>{selectedSemesterToActivate?.name}</strong> akan otomatis mengakhiri periode aktif saat ini. Seluruh jadwal kelas, presensi mahasiswa, dan evaluasi LMS akan otomatis dialihkan ke periode yang baru.
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Semester Target Aktivasi
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '2px' }}>
              {selectedSemesterToActivate?.name}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {selectedSemesterToActivate?.academicYearName}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button variant="secondary" onClick={() => setShowActivateModal(false)}>
              Batal
            </Button>
            <Button variant="primary" icon={Sparkles} onClick={handleActivateSemester}>
              Aktifkan Periode Ini
            </Button>
          </div>
        </div>
      </Modal>

      {/* 9. MODAL: Konfirmasi Hapus Tahun Akademik */}
      <Modal
        isOpen={showDeleteYearModal}
        onClose={() => setShowDeleteYearModal(false)}
        title="Konfirmasi Hapus Tahun Akademik"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2-5)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger-text, #991b1b)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-danger-main)' }} />
            <div>
              <strong>Peringatan Penghapusan:</strong> Anda akan menghapus tahun akademik <strong>{selectedYearToDelete?.name}</strong>. Seluruh semester yang terdaftar di bawah tahun akademik ini akan ikut dihapus.
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}>
            <div><strong>Tahun Akademik:</strong> {selectedYearToDelete?.name}</div>
            <div><strong>Periode:</strong> {formatDate(selectedYearToDelete?.startDate)} – {formatDate(selectedYearToDelete?.endDate)}</div>
            <div><strong>Status:</strong> {selectedYearToDelete?.status}</div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button variant="secondary" onClick={() => setShowDeleteYearModal(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2} 
              onClick={handleDeleteYear}
              isLoading={isDeleting}
            >
              Ya, Hapus Tahun Akademik
            </Button>
          </div>
        </div>
      </Modal>

      {/* 10. MODAL: Konfirmasi Hapus Semester */}
      <Modal
        isOpen={showDeleteSemesterModal}
        onClose={() => setShowDeleteSemesterModal(false)}
        title="Konfirmasi Hapus Semester"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-danger-bg, #fef2f2)',
            border: '1px solid var(--color-danger-border, #fecaca)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2-5)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-danger-text, #991b1b)'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2, color: 'var(--color-danger-main)' }} />
            <div>
              <strong>Peringatan Penghapusan:</strong> Apakah Anda yakin ingin menghapus semester <strong>{selectedSemesterToDelete?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>

          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-1)'
          }}>
            <div><strong>Semester:</strong> {selectedSemesterToDelete?.name}</div>
            <div><strong>Tahun Akademik:</strong> {selectedSemesterToDelete?.academicYearName}</div>
            <div><strong>Rentang Waktu:</strong> {formatDate(selectedSemesterToDelete?.startDate)} – {formatDate(selectedSemesterToDelete?.endDate)}</div>
            <div><strong>Status:</strong> {selectedSemesterToDelete?.status}</div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button variant="secondary" onClick={() => setShowDeleteSemesterModal(false)} disabled={isDeleting}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2} 
              onClick={handleDeleteSemester}
              isLoading={isDeleting}
            >
              Ya, Hapus Semester
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
