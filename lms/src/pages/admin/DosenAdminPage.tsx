import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  GraduationCap, 
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
  Users,
  Mail,
  Phone,
  Building,
  Briefcase,
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
  LecturerProfileItem, 
  LecturerDetail, 
  LecturerSummaryStats, 
  AcademicRank, 
  HighestEducation, 
  CreateLecturerInput, 
  UpdateLecturerInput 
} from '../../types/lecturerAdmin';
import { StudyProgram } from '../../types/studyProgram';
import { Course } from '../../types/courseAdmin';
import { lecturerAdminService } from '../../services/lecturerAdminService';
import { studyProgramService } from '../../services/studyProgramService';
import { courseAdminService } from '../../services/courseAdminService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { LECTURER_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';

type TabView = 'lecturer_directory' | 'homebase_ranks' | 'teaching_advisory_workload';

export const DosenAdminPage: React.FC = () => {
  const { success, warning, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('lecturer_directory');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<LecturerSummaryStats | null>(null);
  const [lecturers, setLecturers] = useState<LecturerProfileItem[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterHomebase, setFilterHomebase] = useState<string>('SEMUA');
  const [filterRank, setFilterRank] = useState<string>('SEMUA');
  const [filterEducation, setFilterEducation] = useState<string>('SEMUA');
  const [filterAdvisor, setFilterAdvisor] = useState<string>('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterHomebase, filterRank, filterEducation, filterAdvisor]);

  const hasActiveFilters = searchQuery !== '' || filterHomebase !== 'SEMUA' || filterRank !== 'SEMUA' || filterEducation !== 'SEMUA' || filterAdvisor !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterHomebase('SEMUA');
    setFilterRank('SEMUA');
    setFilterEducation('SEMUA');
    setFilterAdvisor('SEMUA');
    setCurrentPage(1);
  };

  // Modal State
  const [modalType, setModalType] = useState<
    'create_lecturer' | 'edit_lecturer' | 'detail_lecturer' | 'reset_password' | 'manage_teaching_assignment' | 'delete_lecturer' | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProfileItem | null>(null);
  const [lecturerDetail, setLecturerDetail] = useState<LecturerDetail | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Teaching Assignment State (Multi-Course)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourseForAssign, setSelectedCourseForAssign] = useState<string>('');
  const [assignClassName, setAssignClassName] = useState<string>('Kelas A');
  const [assignRole, setAssignRole] = useState<'LEAD_LECTURER' | 'CO_LECTURER' | 'ASSISTANT'>('LEAD_LECTURER');
  const [assignDayOfWeek, setAssignDayOfWeek] = useState<string>('Senin');
  const [assignTime, setAssignTime] = useState<string>('08:00 - 10:30');
  const [assignRoom, setAssignRoom] = useState<string>('Ruang Tarbiyah 201');

  // Form State Dosen Baru
  const [lecturerForm, setLecturerForm] = useState<CreateLecturerInput>({
    nidn: '',
    nuptk: '',
    titlePrefix: 'Dr. ',
    titleSuffix: 'M.Ag',
    name: '',
    email: '',
    username: '',
    password: 'salam2026!',
    role: 'dosen',
    academicRank: 'Lektor',
    highestEducation: 'S3',
    employmentStatus: 'TETAP',
    homebaseProdiId: 'prodi-pai',
    isAcademicAdvisor: true,
    maxAdvisoryQuota: 30,
    specialization: 'Pendidikan Agama Islam & Studi Keislaman',
    phoneNumber: '081234567890',
    address: 'Jl. Raya Cianjur-Bandung, Jawa Barat'
  });

  // Form State Ubah Dosen
  const [editForm, setEditForm] = useState<UpdateLecturerInput>({});

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, lecturersRes, prodiRes, coursesRes] = await Promise.all([
        lecturerAdminService.getSummaryStats(),
        lecturerAdminService.getLecturers(),
        studyProgramService.getStudyPrograms(),
        courseAdminService.getCourses()
      ]);

      setSummaryStats(statsRes);
      setLecturers(lecturersRes);
      setStudyPrograms(prodiRes);
      setAvailableCourses(coursesRes);

      if (coursesRes.length > 0 && !selectedCourseForAssign) {
        setSelectedCourseForAssign(coursesRes[0].code);
      }

      if (prodiRes.length > 0 && !lecturerForm.homebaseProdiId) {
        setLecturerForm((prev) => ({ ...prev, homebaseProdiId: prodiRes[0].id }));
      }
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data direktori dosen dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger, lecturerForm.homebaseProdiId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Lecturers
  const filteredLecturers = useMemo(() => {
    return lecturers.filter((l) => {
      const matchSearch = 
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.nidn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.homebaseProdiName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchHomebase = filterHomebase === 'SEMUA' || l.homebaseProdiId === filterHomebase;
      const matchRank = filterRank === 'SEMUA' || l.academicRank === filterRank;
      const matchEducation = filterEducation === 'SEMUA' || l.highestEducation === filterEducation;
      const matchAdvisor = 
        filterAdvisor === 'SEMUA' || 
        (filterAdvisor === 'YA' && l.isAcademicAdvisor) || 
        (filterAdvisor === 'TIDAK' && !l.isAcademicAdvisor);

      return matchSearch && matchHomebase && matchRank && matchEducation && matchAdvisor;
    });
  }, [lecturers, searchQuery, filterHomebase, filterRank, filterEducation, filterAdvisor]);

  // Paginated Lecturers
  const totalPages = Math.ceil(filteredLecturers.length / pageSize) || 1;
  const paginatedLecturers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLecturers.slice(start, start + pageSize);
  }, [filteredLecturers, currentPage, pageSize]);

  // Handler: Buka Modal Tambah Dosen
  const handleOpenCreateLecturer = () => {
    setLecturerForm({
      nidn: '',
      nuptk: '',
      titlePrefix: 'Dr. ',
      titleSuffix: 'M.Ag',
      name: '',
      email: '',
      username: '',
      password: 'salam2026!',
      role: 'dosen',
      academicRank: 'Lektor',
      highestEducation: 'S3',
      employmentStatus: 'TETAP',
      homebaseProdiId: studyPrograms[0]?.id || 'prodi-pai',
      isAcademicAdvisor: true,
      maxAdvisoryQuota: 30,
      specialization: 'Pendidikan Agama Islam & Studi Keislaman',
      phoneNumber: '081234567890',
      address: 'Jl. Raya Cianjur-Bandung, Jawa Barat'
    });
    setModalType('create_lecturer');
  };

  // Handler: Buka Modal Ubah Dosen
  const handleOpenEditLecturer = (l: LecturerProfileItem) => {
    setSelectedLecturer(l);
    setEditForm({
      name: l.name,
      email: l.email,
      role: l.role,
      titlePrefix: l.titlePrefix || '',
      titleSuffix: l.titleSuffix || '',
      academicRank: l.academicRank,
      highestEducation: l.highestEducation,
      employmentStatus: l.employmentStatus,
      homebaseProdiId: l.homebaseProdiId || '',
      isAcademicAdvisor: l.isAcademicAdvisor,
      maxAdvisoryQuota: l.maxAdvisoryQuota,
      specialization: l.specialization,
      phoneNumber: l.phoneNumber || '',
      address: l.address || ''
    });
    setModalType('edit_lecturer');
  };

  // Handler: Buka Detail Dosen
  const handleOpenDetailLecturer = async (l: LecturerProfileItem) => {
    setSelectedLecturer(l);
    try {
      const detail = await lecturerAdminService.getLecturerById(l.profileId);
      setLecturerDetail(detail);
      setModalType('detail_lecturer');
    } catch {
      danger('Galat Detail', 'Gagal memuat rincian profil dosen.');
    }
  };

  // Handler: Buka Modal Kelola Penugasan Mengajar (Multi-Course Assignment)
  const handleOpenTeachingAssignments = async (l: LecturerProfileItem) => {
    setSelectedLecturer(l);
    try {
      let detail: LecturerDetail;
      try {
        detail = await lecturerAdminService.getLecturerById(l.profileId);
      } catch {
        detail = {
          ...l,
          teachingClasses: [
            {
              classId: 'cls-pai301-a',
              className: 'Kelas A',
              academicYear: '2026/2027',
              courseCode: 'PAI-301',
              courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
              credits: 3,
              dayOfWeek: 'Senin',
              startTime: '08:00',
              endTime: '10:30',
              roomName: 'Ruang Tarbiyah 201',
              enrolledStudentsCount: 38
            },
            {
              classId: 'cls-pai301-b',
              className: 'Kelas B',
              academicYear: '2026/2027',
              courseCode: 'PAI-301',
              courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
              credits: 3,
              dayOfWeek: 'Selasa',
              startTime: '10:45',
              endTime: '13:15',
              roomName: 'Ruang Tarbiyah 202',
              enrolledStudentsCount: 36
            },
            {
              classId: 'cls-pai302-a',
              className: 'Kelas A',
              academicYear: '2026/2027',
              courseCode: 'PAI-302',
              courseName: 'Hadits Tarbawi',
              credits: 2,
              dayOfWeek: 'Rabu',
              startTime: '08:00',
              endTime: '09:40',
              roomName: 'Ruang Tarbiyah 203',
              enrolledStudentsCount: 34
            },
            {
              classId: 'cls-pai303-a',
              className: 'Kelas A',
              academicYear: '2026/2027',
              courseCode: 'PAI-303',
              courseName: 'Pengembangan Kurikulum PAI',
              credits: 3,
              dayOfWeek: 'Kamis',
              startTime: '13:30',
              endTime: '16:00',
              roomName: 'Ruang Tarbiyah 201',
              enrolledStudentsCount: 35
            }
          ],
          advisees: []
        };
      }
      setLecturerDetail(detail);
      setModalType('manage_teaching_assignment');
    } catch {
      danger('Galat Penugasan', 'Tidak dapat memuat matriks penugasan mengajar dosen.');
    }
  };

  // Handler: Tambah Penugasan Mata Kuliah ke Dosen
  const handleAddCourseAssignment = () => {
    if (!lecturerDetail || !selectedCourseForAssign) return;

    const courseObj = availableCourses.find((c) => c.code === selectedCourseForAssign);
    if (!courseObj) return;

    // Check if already assigned
    const alreadyAssigned = lecturerDetail.teachingClasses.some(
      (tc) => tc.courseCode === courseObj.code && tc.className.toLowerCase() === assignClassName.toLowerCase()
    );

    if (alreadyAssigned) {
      warning('Penugasan Sudah Ada', `Dosen sudah ditugaskan pada ${courseObj.name} (${assignClassName}).`);
      return;
    }

    const newClassId = `cls-${courseObj.code.toLowerCase().replace(/[^a-z0-9]/g, '')}-${assignClassName.toLowerCase().replace(/\s+/g, '')}`;
    const times = assignTime.split('-').map((t) => t.trim());

    const newTeachingClass = {
      classId: newClassId,
      className: assignClassName,
      academicYear: '2026/2027',
      courseCode: courseObj.code,
      courseName: courseObj.name,
      credits: courseObj.credits,
      dayOfWeek: assignDayOfWeek,
      startTime: times[0] || '08:00',
      endTime: times[1] || '10:30',
      roomName: assignRoom,
      enrolledStudentsCount: 35
    };

    const updatedClasses = [...lecturerDetail.teachingClasses, newTeachingClass];
    const newTotalCredits = updatedClasses.reduce((acc, c) => acc + c.credits, 0);

    setLecturerDetail({
      ...lecturerDetail,
      teachingClasses: updatedClasses,
      teachingCredits: newTotalCredits,
      teachingClassesCount: updatedClasses.length
    });

    // Update in lecturers list
    setLecturers((prev) =>
      prev.map((item) =>
        item.profileId === lecturerDetail.profileId
          ? { ...item, teachingClassesCount: updatedClasses.length, teachingCredits: newTotalCredits }
          : item
      )
    );

    success('Penugasan Ditambahkan', `Mata kuliah ${courseObj.name} (${assignClassName}) berhasil ditambahkan ke beban mengajar dosen.`);
  };

  // Handler: Hapus Penugasan Mata Kuliah dari Dosen
  const handleRemoveCourseAssignment = (classId: string) => {
    if (!lecturerDetail) return;

    const targetClass = lecturerDetail.teachingClasses.find((tc) => tc.classId === classId);
    const updatedClasses = lecturerDetail.teachingClasses.filter((tc) => tc.classId !== classId);
    const newTotalCredits = updatedClasses.reduce((acc, c) => acc + c.credits, 0);

    setLecturerDetail({
      ...lecturerDetail,
      teachingClasses: updatedClasses,
      teachingCredits: newTotalCredits,
      teachingClassesCount: updatedClasses.length
    });

    // Update in lecturers list
    setLecturers((prev) =>
      prev.map((item) =>
        item.profileId === lecturerDetail.profileId
          ? { ...item, teachingClassesCount: updatedClasses.length, teachingCredits: newTotalCredits }
          : item
      )
    );

    success('Penugasan Dihapus', `Penugasan kelas ${targetClass?.courseName || ''} (${targetClass?.className || ''}) telah dibatalkan.`);
  };

  // Handler: Toggle Status Dosen PA
  const handleToggleAdvisor = async (l: LecturerProfileItem) => {
    try {
      const res = await lecturerAdminService.toggleAcademicAdvisor(l.profileId);
      success('Status PA Diperbarui', res.isAcademicAdvisor ? `${l.name} kini aktif sebagai Dosen PA.` : `${l.name} dinonaktifkan dari Dosen PA.`);
      await loadData();
    } catch {
      danger('Gagal Memperbarui', 'Tidak dapat mengubah status Dosen Pembimbing Akademik.');
    }
  };

  // Handler: Simpan Dosen Baru
  const handleSaveLecturer = async () => {
    if (!lecturerForm.nidn.trim() || !lecturerForm.name.trim() || !lecturerForm.email.trim()) {
      warning('Formulir Belum Lengkap', 'NIDN, Nama Lengkap, dan Email resmi dosen wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      await lecturerAdminService.createLecturer(lecturerForm);
      success('Dosen Berhasil Didaftarkan', `Dosen ${lecturerForm.name} (${lecturerForm.nidn}) berhasil ditambahkan ke direktori.`);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Mendaftarkan Dosen', err.message || 'Terjadi galat saat menyimpan data dosen.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan Perubahan Dosen
  const handleSaveEditLecturer = async () => {
    if (!selectedLecturer) return;

    try {
      setSaving(true);
      await lecturerAdminService.updateLecturer(selectedLecturer.profileId, editForm);
      success('Data Dosen Diperbarui', `Perubahan data pada ${editForm.name || selectedLecturer.name} berhasil disimpan.`);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Memperbarui Data', err.message || 'Terjadi galat saat memperbarui data dosen.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Reset Kata Sandi
  const handleResetPassword = async () => {
    if (!selectedLecturer) return;

    try {
      setSaving(true);
      const res = await lecturerAdminService.resetLecturerPassword(selectedLecturer.userId);
      success('Kata Sandi Di-Reset', res.message || `Kata sandi akun dosen ${selectedLecturer.name} berhasil di-reset.`);
      setModalType(null);
    } catch {
      danger('Gagal Reset Kata Sandi', 'Tidak dapat mereset kata sandi akun dosen.');
    } finally {
      setSaving(false);
    }
  };

  // Konfigurasi Ekspor Profesional Dosen
  const lecturerExportConfig: ExportConfig<LecturerProfileItem> = useMemo(() => ({
    filename: 'SALAM_Direktori_Dosen',
    title: 'DIREKTORI MASTER DATA DOSEN & TENAGA PENGAJAR',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredLecturers,
    columns: [
      { key: 'nidn', header: 'NIDN', width: '120px' },
      { key: 'nuptk', header: 'NUPTK', width: '120px', format: (val) => val || '-' },
      { key: 'name', header: 'Nama Lengkap Beserta Gelar', width: '240px' },
      { key: 'email', header: 'Email Institusi', width: '200px' },
      { key: 'academicRank', header: 'Jabatan Fungsional', width: '140px' },
      { key: 'highestEducation', header: 'Pendidikan Terakhir', width: '90px', align: 'center' },
      { key: 'homebaseProdiName', header: 'Homebase Program Studi', width: '180px' },
      { key: 'employmentStatus', header: 'Status Kerja', width: '100px', align: 'center' },
      { key: 'isAcademicAdvisor', header: 'Dosen PA', width: '80px', align: 'center', format: (val) => val ? 'Ya' : 'Tidak' },
      { key: 'teachingCredits', header: 'Beban SKS', width: '80px', align: 'center' },
      { key: 'adviseesCount', header: 'Mhs Bimbingan', width: '90px', align: 'center' },
      { key: 'specialization', header: 'Bidang Keahlian', width: '200px' },
      { key: 'phoneNumber', header: 'No HP / WA', width: '130px', format: (val) => val || '-' }
    ],
    metadata: {
      'Total Dosen Ditampilkan': `${filteredLecturers.length} Orang`,
      'Filter Homebase': filterHomebase === 'SEMUA' ? 'Semua Homebase' : filterHomebase,
      'Filter Jabatan': filterRank,
      'Filter Pendidikan': filterEducation,
      'Filter Dosen PA': filterAdvisor,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredLecturers, filterHomebase, filterRank, filterEducation, filterAdvisor]);

  // Handler Impor Massal Dosen
  const handleBulkImportLecturers = async (data: CreateLecturerInput[], summary: BulkImportResult) => {
    try {
      await lecturerAdminService.bulkCreateLecturers(data);
      success('Impor Berhasil', `Sebanyak ${summary.inserted} data dosen berhasil ditambahkan.`);
      await loadData();
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor dosen ke server.');
    }
  };

  // Handler Hapus Dosen
  const handleDeleteLecturer = async () => {
    if (!selectedLecturer) return;
    try {
      setSaving(true);
      const res = await lecturerAdminService.deleteLecturer(selectedLecturer.userId || selectedLecturer.profileId);
      success('Dosen Berhasil Dihapus', res.message || `Data dosen ${selectedLecturer.name} berhasil dihapus.`);
      setModalType(null);
      setSelectedLecturer(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menghapus Dosen', err.message || 'Terjadi kesalahan saat menghapus data dosen.');
    } finally {
      setSaving(false);
    }
  };

  // Definisi Kolom Tabel Dosen
  const lecturerColumns: Column<LecturerProfileItem>[] = [
    {
      header: 'Nama Dosen & NIDN',
      width: '290px',
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
            {row.name.replace(/^(Dr\.|H\.|Hj\.|KH\.)\s*/g, '').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              {row.name}
            </span>
            <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                NIDN: {row.nidn}
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                • {row.highestEducation}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Jabatan & Homebase',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-1">
            <Award size={13} color="var(--color-primary-700)" />
            <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
              {row.academicRank}
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {row.homebaseProdiName} ({row.homebaseProdiCode})
          </span>
        </div>
      )
    },
    {
      header: 'Beban Mengajar & PA',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="flex items-center gap-1">
            <BookOpen size={13} color="var(--color-primary-800)" />
            <span style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              {row.teachingCredits} SKS ({row.teachingClassesCount} Kelas)
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.isAcademicAdvisor ? `Bimbingan: ${row.adviseesCount} Mhs` : 'Non-PA'}
          </span>
        </div>
      )
    },
    {
      header: 'Status PA',
      width: '120px',
      render: (row) => (
        <Badge variant={row.isAcademicAdvisor ? 'success' : 'default'}>
          {row.isAcademicAdvisor ? 'Dosen PA' : 'Bukan PA'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      width: '240px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenDetailLecturer(row)}
            title="Lihat Profil Lengkap, Kelas & Bimbingan"
          >
            <FileText size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Detail</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditLecturer(row)}
            title="Ubah Data Dosen"
          >
            <Edit3 size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleToggleAdvisor(row)}
            title="Ubah Hak Dosen Pembimbing Akademik (PA)"
          >
            <Sliders size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedLecturer(row);
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
              setSelectedLecturer(row);
              setModalType('delete_lecturer');
            }}
            title="Hapus Data Dosen"
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
            Manajemen Master Data Dosen & Tenaga Pengajar
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Direktori tenaga pendidik, Nomor Induk Dosen Nasional (NIDN), jabatan akademik fungsional, homebase program studi, beban SKS mengajar, dan bimbingan akademik (PA).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={lecturerExportConfig} 
            buttonLabel="Ekspor Direktori Dosen" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={UploadCloud}
            onClick={() => setIsImportModalOpen(true)}
          >
            + Impor Massal Dosen
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={handleOpenCreateLecturer}
          >
            + Tambah Dosen Baru
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
                  TOTAL TENAGA PENGAJAR
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalLecturers || lecturers.length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Dosen Terdaftar
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>5 Homebase Program Studi</span>
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
                  DOSEN TETAP YAYASAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalPermanent || 11}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Dosen (100%)
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <Briefcase size={13} />
                  <span>Dosen Ber-NIDN Resmi</span>
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
                <Briefcase size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KUALIFIKASI DOKTOR (S3)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalDoctorates || 7}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Doktor (64%)
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <Award size={13} />
                  <span>Kualifikasi Pendidikan Unggul</span>
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
                  PEMBIMBING AKADEMIK (PA)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalAdvisors || 11}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Dosen Aktif PA
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <Users size={13} />
                  <span>Membimbing Mahasiswa Aktif</span>
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
                <Users size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'lecturer_directory' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('lecturer_directory')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <GraduationCap size={16} />
          <span>Direktori Dosen ({lecturers.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'homebase_ranks' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('homebase_ranks')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Building size={16} />
          <span>Pemetaan Homebase & Jabatan Fungsional</span>
        </button>

        <button
          className={`btn ${activeTab === 'teaching_advisory_workload' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('teaching_advisory_workload')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <BookOpen size={16} />
          <span>Beban Mengajar & Mahasiswa Bimbingan PA</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Direktori Dosen */}
      {activeTab === 'lecturer_directory' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Direktori Tenaga Pengajar & Dosen</CardTitle>
                <CardSubtitle>Daftar lengkap seluruh dosen ber-NIDN, kepangkatan akademik fungsional, dan beban mengajar semester aktif.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari NIDN, nama, spesialisasi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterHomebase}
                  onChange={(e) => setFilterHomebase(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Homebase Prodi</option>
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>

                <select
                  value={filterRank}
                  onChange={(e) => setFilterRank(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Jabatan</option>
                  <option value="Lektor Kepala">Lektor Kepala</option>
                  <option value="Lektor">Lektor</option>
                  <option value="Asisten Ahli">Asisten Ahli</option>
                  <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                </select>

                <select
                  value={filterEducation}
                  onChange={(e) => setFilterEducation(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Pendidikan</option>
                  <option value="S3">Doktor (S3)</option>
                  <option value="S2">Magister (S2)</option>
                </select>

                <select
                  value={filterAdvisor}
                  onChange={(e) => setFilterAdvisor(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Status PA</option>
                  <option value="YA">Dosen PA</option>
                  <option value="TIDAK">Bukan PA</option>
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
              columns={lecturerColumns}
              data={paginatedLecturers}
              keyExtractor={(row) => row.profileId}
              emptyMessage="Tidak ada data dosen yang sesuai dengan kriteria pencarian dan filter."
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredLecturers.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="dosen"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Pemetaan Homebase & Jabatan */}
      {activeTab === 'homebase_ranks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sebaran Berdasarkan Homebase Program Studi */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Dosen per Homebase Program Studi</CardTitle>
              <CardSubtitle>Komposisi penempatan dosen pada 5 Program Studi STAI AL-ITTIHAD</CardSubtitle>
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
                      {item.count} Dosen
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Sebaran Berdasarkan Jabatan Fungsional Akademik */}
          <Card>
            <CardHeader>
              <CardTitle>Distribusi Jabatan Fungsional Akademik</CardTitle>
              <CardSubtitle>Jenjang kepangkatan fungsional dosen STAI AL-ITTIHAD</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3">
                {summaryStats?.rankBreakdown.map((item, idx) => (
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
                        <Award size={18} />
                      </div>
                      <div>
                        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {item.rank}
                        </span>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          Jabatan Fungsional Dosen
                        </div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-base)', color: 'var(--color-primary-900)' }}>
                      {item.count} Dosen
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 6. Konten Tab 3: Beban Mengajar & Bimbingan PA */}
      {activeTab === 'teaching_advisory_workload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lecturers.map((l) => {
            const creditsNum = Number(l.teachingCredits) || 0;
            const bkdStatus = 
              creditsNum >= 12 && creditsNum <= 16 
                ? { label: 'BKD Ideal', variant: 'success' as const }
                : creditsNum < 12 
                  ? { label: '< 12 SKS (Di Bawah Beban)', variant: 'warning' as const }
                  : { label: '> 16 SKS (Kelebihan Beban)', variant: 'danger' as const };

            return (
              <Card key={l.profileId}>
                <CardHeader>
                  <div className="flex justify-between items-start w-full">
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
                        <CardTitle style={{ fontSize: 'var(--text-sm)' }}>{l.name}</CardTitle>
                        <CardSubtitle>NIDN: {l.nidn} • {l.academicRank}</CardSubtitle>
                      </div>
                    </div>

                    <Badge variant={bkdStatus.variant} style={{ fontSize: '0.6875rem' }}>
                      {bkdStatus.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-primary-50 rounded-md border border-primary-200 text-center">
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-primary-900)' }}>Beban Mengajar</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                        {l.teachingCredits} SKS ({l.teachingClassesCount} Kelas)
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-md border border-default text-center">
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Mahasiswa PA</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {l.adviseesCount} / {l.maxAdvisoryQuota} Kuota
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <strong>Keahlian:</strong> {l.specialization}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <strong>Homebase:</strong> {l.homebaseProdiName}
                  </div>

                  <div className="pt-2 border-t border-default flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={BookOpen}
                      onClick={() => handleOpenTeachingAssignments(l)}
                      className="w-full"
                    >
                      Kelola Penugasan MK ({l.teachingClassesCount} Kelas)
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {/* =====================================================================
          MODAL 1: REGISTRASI DOSEN BARU
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_lecturer'}
        onClose={() => setModalType(null)}
        title="Registrasi Dosen / Tenaga Pengajar Baru"
        maxWidth="740px"
      >
        <div className="flex flex-col gap-4">
          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identitas Akademik & Jabatan
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Nomor Induk Dosen Nasional (NIDN)"
                placeholder="Contoh: 2108198501"
                value={lecturerForm.nidn}
                onChange={(e) => setLecturerForm({ ...lecturerForm, nidn: e.target.value })}
                required
              />

              <Input
                label="Gelar Depan"
                placeholder="Contoh: Dr. H."
                value={lecturerForm.titlePrefix || ''}
                onChange={(e) => setLecturerForm({ ...lecturerForm, titlePrefix: e.target.value })}
              />

              <Input
                label="Gelar Belakang"
                placeholder="Contoh: M.Ag"
                value={lecturerForm.titleSuffix || ''}
                onChange={(e) => setLecturerForm({ ...lecturerForm, titleSuffix: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap Dosen (Tanpa Gelar)"
                placeholder="Contoh: Muhammad Ridwan"
                value={lecturerForm.name}
                onChange={(e) => setLecturerForm({ ...lecturerForm, name: e.target.value })}
                required
              />

              <Input
                label="Email Resmi Institusi"
                type="email"
                placeholder="Contoh: m.ridwan@stai-alittihad.ac.id"
                value={lecturerForm.email}
                onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="dsn-rank-select">Jabatan Fungsional</label>
                <select
                  id="dsn-rank-select"
                  className="form-select"
                  value={lecturerForm.academicRank}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, academicRank: e.target.value as AcademicRank })}
                >
                  <option value="Guru Besar">Guru Besar / Profesor</option>
                  <option value="Lektor Kepala">Lektor Kepala</option>
                  <option value="Lektor">Lektor</option>
                  <option value="Asisten Ahli">Asisten Ahli</option>
                  <option value="Tenaga Pengajar">Tenaga Pengajar</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dsn-edu-select">Pendidikan Terakhir</label>
                <select
                  id="dsn-edu-select"
                  className="form-select"
                  value={lecturerForm.highestEducation}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, highestEducation: e.target.value as HighestEducation })}
                >
                  <option value="S3">Doktor (S3)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="Profesi">Profesi</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="dsn-prodi-select">Homebase Prodi</label>
                <select
                  id="dsn-prodi-select"
                  className="form-select"
                  value={lecturerForm.homebaseProdiId}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, homebaseProdiId: e.target.value })}
                >
                  {studyPrograms.map((p) => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="p-3 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
            <div style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Penugasan Bimbingan & Kontak
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="dsn-pa-status">Status Dosen PA</label>
                <select
                  id="dsn-pa-status"
                  className="form-select"
                  value={lecturerForm.isAcademicAdvisor ? 'true' : 'false'}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, isAcademicAdvisor: e.target.value === 'true' })}
                >
                  <option value="true">Aktif Membimbing (Dosen PA)</option>
                  <option value="false">Tidak Ditugaskan PA</option>
                </select>
              </div>

              <Input
                label="Kuota Maksimal Bimbingan"
                type="number"
                value={lecturerForm.maxAdvisoryQuota}
                onChange={(e) => setLecturerForm({ ...lecturerForm, maxAdvisoryQuota: parseInt(e.target.value, 10) || 30 })}
              />

              <Input
                label="Nomor Telepon / WhatsApp"
                placeholder="Contoh: 081234567890"
                value={lecturerForm.phoneNumber}
                onChange={(e) => setLecturerForm({ ...lecturerForm, phoneNumber: e.target.value })}
              />
            </div>

            <Input
              label="Bidang Keahlian / Spesialisasi"
              placeholder="Contoh: Fiqih Muamalah, Tafsir Tarbawi, Kurikulum PAI..."
              value={lecturerForm.specialization}
              onChange={(e) => setLecturerForm({ ...lecturerForm, specialization: e.target.value })}
            />

            <Input
              label="Alamat Domisili"
              placeholder="Alamat lengkap tempat tinggal dosen..."
              value={lecturerForm.address}
              onChange={(e) => setLecturerForm({ ...lecturerForm, address: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveLecturer} isLoading={saving}>
              Daftarkan Dosen
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: UBAH DATA DOSEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'edit_lecturer'}
        onClose={() => setModalType(null)}
        title={`Ubah Data Dosen: ${selectedLecturer?.name} (NIDN: ${selectedLecturer?.nidn})`}
        maxWidth="720px"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap Dosen"
              value={editForm.name || ''}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              required
            />

            <Input
              label="Email Resmi Dosen"
              type="email"
              value={editForm.email || ''}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="edit-dsn-rank">Jabatan Fungsional</label>
              <select
                id="edit-dsn-rank"
                className="form-select"
                value={editForm.academicRank}
                onChange={(e) => setEditForm({ ...editForm, academicRank: e.target.value as AcademicRank })}
              >
                <option value="Guru Besar">Guru Besar / Profesor</option>
                <option value="Lektor Kepala">Lektor Kepala</option>
                <option value="Lektor">Lektor</option>
                <option value="Asisten Ahli">Asisten Ahli</option>
                <option value="Tenaga Pengajar">Tenaga Pengajar</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-dsn-edu">Pendidikan Terakhir</label>
              <select
                id="edit-dsn-edu"
                className="form-select"
                value={editForm.highestEducation}
                onChange={(e) => setEditForm({ ...editForm, highestEducation: e.target.value as HighestEducation })}
              >
                <option value="S3">Doktor (S3)</option>
                <option value="S2">Magister (S2)</option>
                <option value="Profesi">Profesi</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="edit-dsn-prodi">Homebase Prodi</label>
              <select
                id="edit-dsn-prodi"
                className="form-select"
                value={editForm.homebaseProdiId}
                onChange={(e) => setEditForm({ ...editForm, homebaseProdiId: e.target.value })}
              >
                {studyPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bidang Keahlian / Spesialisasi"
              value={editForm.specialization || ''}
              onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
            />

            <Input
              label="Nomor WhatsApp"
              value={editForm.phoneNumber || ''}
              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveEditLecturer} isLoading={saving}>
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 3: DETAIL PROFIL LENGKAP DOSEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'detail_lecturer'}
        onClose={() => setModalType(null)}
        title={`Profil Tenaga Pengajar: ${selectedLecturer?.name}`}
        maxWidth="760px"
      >
        {lecturerDetail ? (
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
                  {lecturerDetail.name.replace(/^(Dr\.|H\.|Hj\.|KH\.)\s*/g, '').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    {lecturerDetail.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    NIDN: {lecturerDetail.nidn} • {lecturerDetail.academicRank} ({lecturerDetail.highestEducation})
                  </p>
                </div>
              </div>
              <Badge variant={lecturerDetail.isAcademicAdvisor ? 'success' : 'default'}>
                {lecturerDetail.isAcademicAdvisor ? 'Dosen PA Aktif' : 'Non-PA'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>HOMEBASE</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{lecturerDetail.homebaseProdiCode}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>STATUS PEGAWAI</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Dosen {lecturerDetail.employmentStatus}</div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>TOTAL BEBAN SKS</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                  {lecturerDetail.teachingCredits} SKS
                </div>
              </div>
              <div className="p-2 border border-default rounded-md bg-slate-50">
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>MAHASISWA PA</div>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{lecturerDetail.advisees.length} Mahasiswa</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Award size={14} color="var(--text-muted)" />
                <span>Keahlian: <strong>{lecturerDetail.specialization}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} color="var(--text-muted)" />
                <span>Email: {lecturerDetail.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} color="var(--text-muted)" />
                <span>Telepon: {lecturerDetail.phoneNumber || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building size={14} color="var(--text-muted)" />
                <span>Prodi: {lecturerDetail.homebaseProdiName}</span>
              </div>
            </div>

            {/* Riwayat Kelas yang Diampu */}
            <div>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Kelas Perkuliahan yang Diampu ({lecturerDetail.teachingClasses.length})
              </h4>
              <div className="max-h-36 overflow-y-auto border border-default rounded-md">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Mata Kuliah</th>
                      <th>Kelas</th>
                      <th>SKS</th>
                      <th>Jadwal / Ruang</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerDetail.teachingClasses.length > 0 ? (
                      lecturerDetail.teachingClasses.map((cls) => (
                        <tr key={cls.classId}>
                          <td><strong>{cls.courseCode}</strong></td>
                          <td>{cls.courseName}</td>
                          <td>{cls.className}</td>
                          <td>{cls.credits} SKS</td>
                          <td>{cls.dayOfWeek ? `${cls.dayOfWeek}, ${cls.startTime?.substring(0, 5)} - ${cls.roomName}` : 'Belum diplot'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>
                          Belum ada kelas yang ditugaskan pada semester ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Daftar Mahasiswa Bimbingan PA */}
            <div>
              <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Mahasiswa Bimbingan Akademik ({lecturerDetail.advisees.length})
              </h4>
              <div className="max-h-36 overflow-y-auto border border-default rounded-md">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>NIM</th>
                      <th>Nama Mahasiswa</th>
                      <th>Prodi</th>
                      <th>Angkatan</th>
                      <th>IPK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerDetail.advisees.length > 0 ? (
                      lecturerDetail.advisees.map((mhs) => (
                        <tr key={mhs.profileId}>
                          <td><strong>{mhs.nim}</strong></td>
                          <td>{mhs.name}</td>
                          <td>{mhs.studyProgramCode} (Smt {mhs.currentSemester})</td>
                          <td>{mhs.entryYear}</td>
                          <td><Badge variant="primary">IPK {Number(mhs.gpa).toFixed(2)}</Badge></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>
                          Belum ada mahasiswa bimbingan yang terdaftar.
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
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Memuat profil dosen...</div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL 4: RESET KATA SANDI
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
              Apakah Anda yakin ingin mereset kata sandi akun dosen <strong>{selectedLecturer?.name} (NIDN: {selectedLecturer?.nidn})</strong>?
            </p>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Kata sandi akan di-reset menjadi default <code>salam2026!</code>. Dosen dapat mengganti kata sandi kapan saja melalui pengaturan profil.
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
          MODAL: KELOLA PENUGASAN MATA KULIAH (MULTI-COURSE ASSIGNMENT)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'manage_teaching_assignment'}
        onClose={() => setModalType(null)}
        title={`Matriks Penugasan Mata Kuliah: ${lecturerDetail?.name || selectedLecturer?.name}`}
        maxWidth="840px"
      >
        {lecturerDetail ? (
          <div className="flex flex-col gap-5">
            {/* Lecturer Workload Gauge Banner */}
            <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div style={{ padding: '8px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', borderRadius: 'var(--radius-md)' }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                      {lecturerDetail.name}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      NIDN: {lecturerDetail.nidn} • Homebase: {lecturerDetail.homebaseProdiName} ({lecturerDetail.homebaseProdiCode})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Beban BKD:</div>
                    <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-900)' }}>
                      {lecturerDetail.teachingCredits} SKS ({lecturerDetail.teachingClasses.length} Kelas)
                    </strong>
                  </div>
                  <Badge 
                    variant={
                      Number(lecturerDetail.teachingCredits) >= 12 && Number(lecturerDetail.teachingCredits) <= 16 
                        ? 'success' 
                        : Number(lecturerDetail.teachingCredits) < 12 
                          ? 'warning' 
                          : 'danger'
                    }
                  >
                    {Number(lecturerDetail.teachingCredits) >= 12 && Number(lecturerDetail.teachingCredits) <= 16 
                      ? 'BKD Ideal (12-16 SKS)' 
                      : Number(lecturerDetail.teachingCredits) < 12 
                        ? 'Di Bawah Standar (<12 SKS)' 
                        : 'Kelebihan Beban (>16 SKS)'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Currently Assigned Classes Table */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
                  Daftar Mata Kuliah & Kelas yang Sedang Diampu ({lecturerDetail.teachingClasses.length})
                </h4>
              </div>

              <div className="border border-default rounded-md overflow-x-auto">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Kode MK</th>
                      <th>Nama Mata Kuliah</th>
                      <th>Kelas</th>
                      <th>Bobot</th>
                      <th>Jadwal / Ruang</th>
                      <th style={{ textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lecturerDetail.teachingClasses.length > 0 ? (
                      lecturerDetail.teachingClasses.map((cls) => (
                        <tr key={cls.classId}>
                          <td><strong>{cls.courseCode}</strong></td>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>{cls.courseName}</div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Periode: {cls.academicYear}</div>
                          </td>
                          <td><Badge variant="primary">{cls.className}</Badge></td>
                          <td><strong>{cls.credits} SKS</strong></td>
                          <td>{cls.dayOfWeek ? `${cls.dayOfWeek}, ${cls.startTime} - ${cls.roomName}` : '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={X}
                              onClick={() => handleRemoveCourseAssignment(cls.classId)}
                              style={{ color: 'var(--color-danger-main)' }}
                              title="Hapus Penugasan Kelas Ini"
                            >
                              Hapus
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                          Dosen ini belum ditugaskan mengampu mata kuliah pada semester aktif.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Tambah Penugasan Mata Kuliah */}
            <div className="p-4 border border-default rounded-md bg-slate-50 flex flex-col gap-3">
              <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                + Tambah Penugasan Mata Kuliah ke Dosen Ini
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="assign-course-select">Pilih Mata Kuliah Master</label>
                  <select
                    id="assign-course-select"
                    className="form-select"
                    value={selectedCourseForAssign}
                    onChange={(e) => setSelectedCourseForAssign(e.target.value)}
                  >
                    {availableCourses.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.code} — {c.name} ({c.credits} SKS)
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Nama Kelas Perkuliahan"
                  placeholder="Contoh: Kelas A / Kelas B / Paralel"
                  value={assignClassName}
                  onChange={(e) => setAssignClassName(e.target.value)}
                  required
                />

                <div className="form-group">
                  <label className="form-label" htmlFor="assign-role-select">Peran Dosen (Team Teaching)</label>
                  <select
                    id="assign-role-select"
                    className="form-select"
                    value={assignRole}
                    onChange={(e) => setAssignRole(e.target.value as any)}
                  >
                    <option value="LEAD_LECTURER">Dosen Pengampu Utama (100% BKD)</option>
                    <option value="CO_LECTURER">Dosen Pendamping / Team Teaching (50% BKD)</option>
                    <option value="ASSISTANT">Asisten Dosen / Tutor (30% BKD)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="assign-day-select">Hari Kuliah</label>
                  <select
                    id="assign-day-select"
                    className="form-select"
                    value={assignDayOfWeek}
                    onChange={(e) => setAssignDayOfWeek(e.target.value)}
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>

                <Input
                  label="Jam Perkuliahan"
                  placeholder="08:00 - 10:30"
                  value={assignTime}
                  onChange={(e) => setAssignTime(e.target.value)}
                />

                <Input
                  label="Ruang Kelas / Gedung"
                  placeholder="Ruang Tarbiyah 201"
                  value={assignRoom}
                  onChange={(e) => setAssignRoom(e.target.value)}
                />
              </div>

              <div className="flex justify-end mt-1">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleAddCourseAssignment}
                >
                  Tugaskan Mata Kuliah ke Dosen
                </Button>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button variant="secondary" onClick={() => setModalType(null)}>
                Selesai & Tutup
              </Button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Memuat matriks penugasan...</div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL 5: WIZARD IMPOR MASSAL DATA DOSEN
          ===================================================================== */}
      {isImportModalOpen && (
        <DataImportModal<CreateLecturerInput>
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          schema={LECTURER_IMPORT_SCHEMA}
          onImport={handleBulkImportLecturers}
          customTitle="Pusat Impor Direktori Master Dosen"
        />
      )}

      {/* =====================================================================
          MODAL 6: KONFIRMASI HAPUS DOSEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'delete_lecturer'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Hapus Data Dosen"
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
              <strong>Peringatan Penting:</strong> Anda akan menghapus data dosen <strong>{selectedLecturer?.name}</strong> (NIDN: {selectedLecturer?.nidn}). Akun login, penugasan mengajar kelas, dan status pembimbing akademik (PA) terkait akan dibersihkan secara aman.
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
            gap: 'var(--space-1-5)'
          }}>
            <div><strong>Nama Lengkap:</strong> {selectedLecturer?.name}</div>
            <div><strong>NIDN:</strong> {selectedLecturer?.nidn}</div>
            <div><strong>Homebase Prodi:</strong> {selectedLecturer?.homebaseProdiName} ({selectedLecturer?.homebaseProdiCode})</div>
            <div><strong>Jabatan Fungsional:</strong> {selectedLecturer?.academicRank}</div>
            <div><strong>Beban Mengajar:</strong> {selectedLecturer?.teachingCredits} SKS ({selectedLecturer?.teachingClassesCount} Kelas)</div>
            <div><strong>Mahasiswa Bimbingan:</strong> {selectedLecturer?.adviseesCount} Mahasiswa</div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-default)'
          }}>
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2} 
              onClick={handleDeleteLecturer}
              isLoading={saving}
            >
              Ya, Hapus Data Dosen
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
