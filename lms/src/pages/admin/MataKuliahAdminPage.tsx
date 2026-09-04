import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2,
  Calendar, 
  Users, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Sliders,
  Award,
  Layers,
  UploadCloud,
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
  Course, 
  CourseClassItem, 
  CourseDetail, 
  CourseSummaryStats, 
  CourseType, 
  CreateCourseInput, 
  CreateClassInput 
} from '../../types/courseAdmin';
import { StudyProgram } from '../../types/studyProgram';
import { Semester } from '../../types/period';
import { courseAdminService } from '../../services/courseAdminService';
import { studyProgramService } from '../../services/studyProgramService';
import { periodService } from '../../services/periodService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { COURSE_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';

type TabView = 'course_list' | 'class_list' | 'semester_distribution';

export const MataKuliahAdminPage: React.FC = () => {
  const { success, warning, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('course_list');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<CourseSummaryStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<CourseClassItem[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProdi, setFilterProdi] = useState<string>('SEMUA');
  const [filterSemester, setFilterSemester] = useState<string>('SEMUA');
  const [filterCourseType, setFilterCourseType] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  // Pagination States
  const [currentPageCourses, setCurrentPageCourses] = useState<number>(1);
  const [pageSizeCourses, setPageSizeCourses] = useState<number>(10);
  const [currentPageClasses, setCurrentPageClasses] = useState<number>(1);
  const [pageSizeClasses, setPageSizeClasses] = useState<number>(10);

  // Auto reset page when filter changes
  useEffect(() => {
    setCurrentPageCourses(1);
    setCurrentPageClasses(1);
  }, [searchQuery, filterProdi, filterSemester, filterCourseType, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterProdi !== 'SEMUA' || filterSemester !== 'SEMUA' || filterCourseType !== 'SEMUA' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProdi('SEMUA');
    setFilterSemester('SEMUA');
    setFilterCourseType('SEMUA');
    setFilterStatus('SEMUA');
    setCurrentPageCourses(1);
    setCurrentPageClasses(1);
  };

  // Modal State
  const [modalType, setModalType] = useState<
    'create_course' | 'edit_course' | 'detail_course' | 'create_class' | 'edit_class' | 'confirm_course_status' | 'confirm_class_status' | 'confirm_delete_course' | 'confirm_delete_class' | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [selectedClass, setSelectedClass] = useState<CourseClassItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State Mata Kuliah
  const [courseForm, setCourseForm] = useState<CreateCourseInput>({
    code: '',
    name: '',
    credits: 3,
    theoryCredits: 2,
    practicalCredits: 1,
    studyProgramId: 'prodi-pai',
    semesterRecommended: 1,
    courseType: 'WAJIB_PRODI',
    description: ''
  });

  // Form State Kelas Perkuliahan
  const [classForm, setClassForm] = useState<CreateClassInput>({
    courseId: '',
    semesterId: 'sem-2026-ganjil',
    className: 'Kelas A',
    lecturerId: 'usr-dsn-01',
    capacity: 40,
    room: 'Ruang Al-Ghazali (Gedung A-201)',
    dayOfWeek: 'Senin',
    startTime: '08:00:00',
    endTime: '10:30:00',
    deliveryMode: 'HYBRID'
  });

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes, classesRes, prodiRes, semRes] = await Promise.all([
        courseAdminService.getSummaryStats(),
        courseAdminService.getCourses(),
        courseAdminService.getAllClasses(),
        studyProgramService.getStudyPrograms(),
        periodService.getSemesters()
      ]);

      setSummaryStats(statsRes);
      setCourses(coursesRes);
      setClasses(classesRes);
      setStudyPrograms(prodiRes);
      setSemesters(semRes);
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data mata kuliah dan kelas dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger]);

  // Initial Load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch = searchQuery === '' || 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studyProgramName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProdi = filterProdi === 'SEMUA' || 
        (filterProdi === 'MKDU' ? c.studyProgramId === null : c.studyProgramId === filterProdi);

      const matchSemester = filterSemester === 'SEMUA' || 
        c.semesterRecommended === parseInt(filterSemester, 10);

      const matchType = filterCourseType === 'SEMUA' || 
        c.courseType === filterCourseType;

      const matchStatus = filterStatus === 'SEMUA' || 
        (filterStatus === 'AKTIF' ? c.isActive : !c.isActive);

      return matchSearch && matchProdi && matchSemester && matchType && matchStatus;
    });
  }, [courses, searchQuery, filterProdi, filterSemester, filterCourseType, filterStatus]);

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchSearch = searchQuery === '' || 
        cls.className.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProdi = filterProdi === 'SEMUA' || 
        (filterProdi === 'MKDU' ? cls.studyProgramId === null : cls.studyProgramId === filterProdi);

      const matchStatus = filterStatus === 'SEMUA' || 
        (filterStatus === 'AKTIF' ? cls.isActive : !cls.isActive);

      return matchSearch && matchProdi && matchStatus;
    });
  }, [classes, searchQuery, filterProdi, filterStatus]);

  // Paginated Courses
  const totalPagesCourses = Math.ceil(filteredCourses.length / pageSizeCourses) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPageCourses - 1) * pageSizeCourses;
    return filteredCourses.slice(start, start + pageSizeCourses);
  }, [filteredCourses, currentPageCourses, pageSizeCourses]);

  // Paginated Classes
  const totalPagesClasses = Math.ceil(filteredClasses.length / pageSizeClasses) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPageClasses - 1) * pageSizeClasses;
    return filteredClasses.slice(start, start + pageSizeClasses);
  }, [filteredClasses, currentPageClasses, pageSizeClasses]);

  // Handler: Buka Modal Tambah MK
  const handleOpenCreateCourse = () => {
    setCourseForm({
      code: '',
      name: '',
      credits: 3,
      theoryCredits: 2,
      practicalCredits: 1,
      studyProgramId: studyPrograms[0]?.id || 'prodi-pai',
      semesterRecommended: 1,
      courseType: 'WAJIB_PRODI',
      description: ''
    });
    setModalType('create_course');
  };

  // Handler: Buka Modal Ubah MK
  const handleOpenEditCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseForm({
      code: c.code,
      name: c.name,
      credits: c.credits,
      theoryCredits: c.theoryCredits || 2,
      practicalCredits: c.practicalCredits || 1,
      studyProgramId: c.studyProgramId || 'MKDU',
      semesterRecommended: c.semesterRecommended,
      courseType: c.courseType,
      description: c.description || ''
    });
    setModalType('edit_course');
  };

  // Handler: Buka Detail MK
  const handleOpenDetailCourse = async (c: Course) => {
    setSelectedCourse(c);
    try {
      const detail = await courseAdminService.getCourseById(c.id);
      setCourseDetail(detail);
      setModalType('detail_course');
    } catch {
      danger('Galat Detail', 'Gagal memuat rincian mata kuliah.');
    }
  };

  // Handler: Buka Modal Buka Kelas Baru
  const handleOpenCreateClass = (preselectedCourseId?: string) => {
    const activeSem = semesters.find((s) => s.isCurrent) || semesters[0];
    setClassForm({
      courseId: preselectedCourseId || (courses[0]?.id || 'crs-pai301'),
      semesterId: activeSem?.id || 'sem-2026-ganjil',
      className: 'Kelas A',
      lecturerId: 'usr-dsn-01',
      capacity: 40,
      room: 'Ruang Al-Ghazali (Gedung A-201)',
      dayOfWeek: 'Senin',
      startTime: '08:00:00',
      endTime: '10:30:00',
      deliveryMode: 'HYBRID'
    });
    setSelectedClass(null);
    setModalType('create_class');
  };

  // Handler: Buka Modal Ubah Kelas
  const handleOpenEditClass = (cls: CourseClassItem) => {
    setSelectedClass(cls);
    setClassForm({
      courseId: cls.courseId,
      semesterId: cls.semesterId,
      className: cls.className,
      lecturerId: cls.lecturerId || 'usr-dsn-01',
      capacity: cls.capacity,
      room: cls.room,
      dayOfWeek: cls.dayOfWeek,
      startTime: cls.startTime,
      endTime: cls.endTime,
      deliveryMode: cls.deliveryMode
    });
    setModalType('edit_class');
  };

  // Handler: Simpan Mata Kuliah (Tambah / Ubah)
  const handleSaveCourse = async () => {
    if (!courseForm.code.trim() || !courseForm.name.trim()) {
      warning('Formulir Belum Lengkap', 'Kode Mata Kuliah dan Nama Mata Kuliah wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (modalType === 'create_course') {
        await courseAdminService.createCourse(courseForm);
        success('Mata Kuliah Ditambahkan', `Mata Kuliah ${courseForm.name} (${courseForm.code.toUpperCase()}) berhasil didaftarkan.`);
      } else if (modalType === 'edit_course' && selectedCourse) {
        await courseAdminService.updateCourse(selectedCourse.id, courseForm);
        success('Mata Kuliah Diperbarui', `Perubahan data pada ${courseForm.name} berhasil disimpan.`);
      }

      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menyimpan Data', err.message || 'Terjadi kesalahan saat menyimpan mata kuliah.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan Kelas Perkuliahan (Tambah / Ubah)
  const handleSaveClass = async () => {
    if (!classForm.courseId || !classForm.semesterId || !classForm.className.trim()) {
      warning('Formulir Belum Lengkap', 'Mata Kuliah, Semester, dan Nama Kelas wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (modalType === 'create_class') {
        await courseAdminService.createClass(classForm);
        success('Kelas Perkuliahan Dibuka', `Rombel ${classForm.className} berhasil dibuka untuk semester terpilih.`);
      } else if (modalType === 'edit_class' && selectedClass) {
        await courseAdminService.updateClass(selectedClass.id, classForm);
        success('Kelas Diperbarui', `Informasi kelas ${classForm.className} berhasil diperbarui.`);
      }
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menyimpan Kelas', err.message || 'Terjadi galat saat menyimpan kelas perkuliahan.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Hapus Mata Kuliah Permanen
  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      setSaving(true);
      const res = await courseAdminService.deleteCourse(selectedCourse.id);
      success('Mata Kuliah Dihapus', res.message || `Mata Kuliah ${selectedCourse.name} berhasil dihapus.`);
      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menghapus Mata Kuliah', err.message || 'Terjadi kesalahan saat menghapus mata kuliah.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Hapus Kelas Perkuliahan Permanen
  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      setSaving(true);
      const res = await courseAdminService.deleteClass(selectedClass.id);
      success('Kelas Perkuliahan Dihapus', res.message || `Kelas ${selectedClass.className} berhasil dihapus.`);
      setModalType(null);
      await loadData();
      // Jika sedang membuka modal detail mata kuliah, refresh juga detailnya
      if (selectedCourse) {
        try {
          const detail = await courseAdminService.getCourseById(selectedCourse.id);
          setCourseDetail(detail);
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      danger('Gagal Menghapus Kelas', err.message || 'Terjadi kesalahan saat menghapus kelas perkuliahan.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Toggle Status MK
  const handleToggleCourseStatus = async () => {
    if (!selectedCourse) return;

    try {
      setSaving(true);
      await courseAdminService.toggleCourseStatus(selectedCourse.id);
      success('Status Mata Kuliah Berubah', `Mata Kuliah ${selectedCourse.name} telah di-${selectedCourse.isActive ? 'nonaktifkan' : 'aktifkan'}.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Mengubah Status', 'Tidak dapat memperbarui status mata kuliah.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Toggle Status Kelas
  const handleToggleClassStatus = async () => {
    if (!selectedClass) return;

    try {
      setSaving(true);
      await courseAdminService.toggleClassStatus(selectedClass.id);
      success('Status Kelas Berubah', `Kelas ${selectedClass.courseName} - ${selectedClass.className} telah di-${selectedClass.isActive ? 'nonaktifkan' : 'aktifkan'}.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Mengubah Status', 'Tidak dapat memperbarui status kelas perkuliahan.');
    } finally {
      setSaving(false);
    }
  };

  // Konfigurasi Ekspor Profesional Mata Kuliah & Katalog Kurikulum
  const courseExportConfig: ExportConfig<Course> = useMemo(() => ({
    filename: 'SALAM_Katalog_Mata_Kuliah',
    title: 'KATALOG KURIKULUM & MASTER DATA MATA KULIAH',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredCourses,
    columns: [
      { key: 'code', header: 'Kode MK', width: '110px' },
      { key: 'name', header: 'Nama Mata Kuliah', width: '250px' },
      { key: 'credits', header: 'Total SKS', width: '80px', align: 'center' },
      { key: 'theoryCredits', header: 'SKS Teori', width: '80px', align: 'center' },
      { key: 'practicalCredits', header: 'SKS Praktik', width: '80px', align: 'center' },
      { key: 'studyProgramName', header: 'Program Studi Pengampu', width: '180px' },
      { key: 'semesterRecommended', header: 'Semester Paket', width: '90px', align: 'center' },
      { key: 'courseType', header: 'Jenis / Kelompok MK', width: '140px' },
      { key: 'isActive', header: 'Status', width: '90px', align: 'center', format: (val) => val ? 'Aktif' : 'Nonaktif' }
    ],
    metadata: {
      'Total Mata Kuliah': `${filteredCourses.length} Mata Kuliah`,
      'Filter Program Studi': filterProdi === 'SEMUA' ? 'Semua Prodi' : filterProdi,
      'Filter Semester': filterSemester,
      'Filter Jenis MK': filterCourseType,
      'Filter Status': filterStatus,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredCourses, filterProdi, filterSemester, filterCourseType, filterStatus]);

  // Handler Impor Massal Mata Kuliah
  const handleBulkImportCourses = async (data: CreateCourseInput[], summary: BulkImportResult) => {
    try {
      await courseAdminService.bulkCreateCourses(data);
      success('Impor Berhasil', `Sebanyak ${summary.inserted} mata kuliah berhasil ditambahkan ke katalog.`);
      await loadData();
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor mata kuliah ke server.');
    }
  };

  // Definisi Kolom Tabel Mata Kuliah
  const courseColumns: Column<Course>[] = [
    {
      header: 'Mata Kuliah & Kode',
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
            {row.code.split('-')[0] || 'MK'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              {row.name}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Kode: <strong>{row.code}</strong> • Semester {row.semesterRecommended}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Program Studi / Afiliasi',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.studyProgramName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.studyProgramCode === 'MKDU' ? 'Mata Kuliah Wajib Umum' : `Homebase ${row.studyProgramCode}`}
          </span>
        </div>
      )
    },
    {
      header: 'Bobot SKS',
      width: '140px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-1">
            <Badge variant="primary" style={{ fontWeight: 'bold' }}>
              {row.credits} SKS
            </Badge>
          </div>
          <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {row.theoryCredits} Teori / {row.practicalCredits} Praktik
          </span>
        </div>
      )
    },
    {
      header: 'Jenis Mata Kuliah',
      width: '160px',
      render: (row) => {
        let variant: 'primary' | 'success' | 'warning' | 'default' = 'primary';
        let label = 'Wajib Prodi';

        if (row.courseType === 'WAJIB_INSTITUSI') {
          variant = 'success';
          label = 'Wajib Institusi';
        } else if (row.courseType === 'PILIHAN') {
          variant = 'warning';
          label = 'Pilihan';
        }

        return (
          <Badge variant={variant}>
            {label}
          </Badge>
        );
      }
    },
    {
      header: 'Rombel Kelas',
      width: '130px',
      render: (row) => (
        <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          <Building size={14} color="var(--color-primary-700)" />
          <span>{row.activeClassesCount || 0} Kelas Aktif</span>
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
      width: '240px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenDetailCourse(row)}
            title="Lihat Detail & Kelas"
          >
            <FileText size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Detail</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenCreateClass(row.id)}
            title="Buka Kelas Perkuliahan untuk MK Ini"
          >
            <Plus size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditCourse(row)}
            title="Ubah Data Mata Kuliah"
          >
            <Edit3 size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedCourse(row);
              setModalType('confirm_course_status');
            }}
            title={row.isActive ? 'Nonaktifkan Mata Kuliah' : 'Aktifkan Mata Kuliah'}
            style={{ color: row.isActive ? 'var(--color-warning-dark)' : 'var(--color-success-main)' }}
          >
            <Sliders size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedCourse(row);
              setModalType('confirm_delete_course');
            }}
            title="Hapus Mata Kuliah Permanen"
            style={{ color: 'var(--color-danger-main)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  // Definisi Kolom Tabel Kelas Perkuliahan
  const classColumns: Column<CourseClassItem>[] = [
    {
      header: 'Kelas & Mata Kuliah',
      width: '280px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-2">
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-900)', fontSize: 'var(--text-sm)' }}>
              {row.className}
            </span>
            <Badge variant="primary" style={{ fontSize: '0.625rem', padding: '1px 6px' }}>
              {row.courseCode}
            </Badge>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', marginTop: '2px' }}>
            {row.courseName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.academicYear} • {row.credits} SKS
          </span>
        </div>
      )
    },
    {
      header: 'Dosen Pengampu Utama',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.lecturerName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.lecturerNidn ? `NIDN: ${row.lecturerNidn}` : 'Dosen Belum Ditugaskan'}
          </span>
        </div>
      )
    },
    {
      header: 'Jadwal & Ruangan',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
            <Calendar size={13} color="var(--color-primary-700)" />
            <span>{row.dayOfWeek}, {row.startTime.substring(0, 5)} - {row.endTime.substring(0, 5)} WIB</span>
          </div>
          <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <Building size={12} />
            <span>{row.room}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Kapasitas & Peserta',
      width: '160px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
            <Users size={14} color="var(--color-primary-700)" />
            <span><strong>{row.enrolledCount}</strong> / {row.capacity} Mhs</span>
          </div>
          <Badge 
            variant={row.deliveryMode === 'HYBRID' ? 'primary' : row.deliveryMode === 'DARING' ? 'warning' : 'default'}
            style={{ width: 'fit-content', marginTop: '4px', fontSize: '0.625rem' }}
          >
            {row.deliveryMode}
          </Badge>
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
      width: '160px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditClass(row)}
            title="Ubah Rincian Kelas"
          >
            <Edit3 size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedClass(row);
              setModalType('confirm_class_status');
            }}
            title={row.isActive ? 'Nonaktifkan Kelas' : 'Aktifkan Kelas'}
            style={{ color: row.isActive ? 'var(--color-warning-dark)' : 'var(--color-success-main)' }}
          >
            <Sliders size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedClass(row);
              setModalType('confirm_delete_class');
            }}
            title="Hapus Kelas Perkuliahan Permanen"
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
            Manajemen Master Mata Kuliah & Kelas Perkuliahan
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pengelolaan katalog kurikulum mata kuliah, sebaran SKS Teori/Praktik, pembukaan rombongan belajar (kelas), ruangan, dan penugasan dosen pengampu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={courseExportConfig} 
            buttonLabel="Ekspor Katalog MK" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={UploadCloud}
            onClick={() => setIsImportModalOpen(true)}
          >
            + Impor Massal MK
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Building}
            onClick={() => handleOpenCreateClass()}
          >
            + Buka Kelas Baru
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={handleOpenCreateCourse}
          >
            + Tambah Mata Kuliah
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
                  MATA KULIAH TERDAFTAR
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalActiveCourses || courses.filter((c) => c.isActive).length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mata Kuliah
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Total {summaryStats?.totalCredits || 50} SKS Kurikulum</span>
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
                  KELAS PERKULIAHAN AKTIF
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalActiveClasses || classes.filter((cls) => cls.isActive).length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Rombel Aktif
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <Building size={13} />
                  <span>Semester Ganjil 2026/2027</span>
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
                  {summaryStats?.totalStudentsEnrolled || 35}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Peserta Kelas
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <Users size={13} />
                  <span>Hasil Sinkronisasi KRS SIAKAD</span>
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
                  SEBARAN PROGRAM STUDI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  5
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Prodi + MKDU
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <Award size={13} />
                  <span>PAI • MPI • HES • PGMI • ESY</span>
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
          className={`btn ${activeTab === 'course_list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('course_list')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <BookOpen size={16} />
          <span>Katalog Mata Kuliah Master ({courses.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'class_list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('class_list')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Building size={16} />
          <span>Manajemen Kelas Perkuliahan ({classes.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'semester_distribution' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('semester_distribution')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Layers size={16} />
          <span>Distribusi SKS & Struktur Semester</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Katalog Mata Kuliah Master */}
      {activeTab === 'course_list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Master Katalog Mata Kuliah</CardTitle>
                <CardSubtitle>Daftar seluruh kurikulum mata kuliah, pembagian SKS teori/praktik, dan status aktif.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari kode, nama mata kuliah..."
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
                  <option value="MKDU">Mata Kuliah Umum (MKDU)</option>
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
                  value={filterCourseType}
                  onChange={(e) => setFilterCourseType(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Jenis</option>
                  <option value="WAJIB_PRODI">Wajib Prodi</option>
                  <option value="WAJIB_INSTITUSI">Wajib Institusi</option>
                  <option value="PILIHAN">Pilihan</option>
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
              columns={courseColumns}
              data={paginatedCourses}
              keyExtractor={(row) => row.id}
              emptyMessage="Tidak ada mata kuliah yang sesuai dengan kriteria pencarian dan filter."
            />
            <Pagination
              currentPage={currentPageCourses}
              totalPages={totalPagesCourses}
              totalItems={filteredCourses.length}
              pageSize={pageSizeCourses}
              onPageChange={setCurrentPageCourses}
              onPageSizeChange={setPageSizeCourses}
              itemLabel="mata kuliah"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Manajemen Kelas Perkuliahan */}
      {activeTab === 'class_list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Rombongan Belajar & Kelas Perkuliahan</CardTitle>
                <CardSubtitle>Daftar kelas aktif, penugasan dosen pengampu, jadwal perkuliahan mingguan, ruangan, dan kuota mahasiswa.</CardSubtitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari kelas, mata kuliah, dosen..."
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
                  <option value="MKDU">Mata Kuliah Umum (MKDU)</option>
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

                <Button variant="primary" size="sm" icon={Plus} onClick={() => handleOpenCreateClass()}>
                  + Buka Kelas Baru
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <Table
              columns={classColumns}
              data={paginatedClasses}
              keyExtractor={(row) => row.id}
              emptyMessage="Belum ada kelas perkuliahan yang dibuka untuk kriteria filter ini."
            />
            <Pagination
              currentPage={currentPageClasses}
              totalPages={totalPagesClasses}
              totalItems={filteredClasses.length}
              pageSize={pageSizeClasses}
              onPageChange={setCurrentPageClasses}
              onPageSizeChange={setPageSizeClasses}
              itemLabel="kelas perkuliahan"
            />
          </CardBody>
        </Card>
      )}

      {/* 6. Konten Tab 3: Distribusi SKS & Struktur Semester */}
      {activeTab === 'semester_distribution' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
              const semCourses = courses.filter((c) => c.semesterRecommended === semNum);
              const totalSemCredits = semCourses.reduce((acc, curr) => acc + curr.credits, 0);

              return (
                <Card key={semNum}>
                  <CardHeader>
                    <div className="flex justify-between items-center w-full">
                      <CardTitle style={{ fontSize: 'var(--text-sm)' }}>Semester {semNum}</CardTitle>
                      <Badge variant="primary">{totalSemCredits} SKS</Badge>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {semCourses.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {semCourses.map((c) => (
                          <div 
                            key={c.id}
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
                            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {c.name}
                              </span>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                {c.code} • {c.studyProgramCode}
                              </span>
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-800)', flexShrink: 0, marginLeft: '6px' }}>
                              {c.credits} SKS
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        Belum ada MK terdaftar pada semester ini.
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL 1: FORMULIR MATA KULIAH (TAMBAH / UBAH)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_course' || modalType === 'edit_course'}
        onClose={() => setModalType(null)}
        title={modalType === 'create_course' ? 'Tambah Mata Kuliah Baru' : `Ubah Mata Kuliah: ${selectedCourse?.name}`}
        maxWidth="720px"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kode Mata Kuliah"
              placeholder="Contoh: PAI-101, MPI-201, MKU-101"
              value={courseForm.code}
              onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
              disabled={modalType === 'edit_course'}
              required
              helperText="Kode unik mata kuliah standar akademik"
            />

            <div className="form-group">
              <label className="form-label" htmlFor="course-prodi-select">Program Studi Homebase</label>
              <select
                id="course-prodi-select"
                className="form-select"
                value={courseForm.studyProgramId}
                onChange={(e) => setCourseForm({ ...courseForm, studyProgramId: e.target.value })}
                required
              >
                <option value="MKDU">Mata Kuliah Umum Institusi (MKDU)</option>
                {studyPrograms.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Nama Lengkap Mata Kuliah"
            placeholder="Contoh: Metodologi Pembelajaran PAI Interaktif"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Total SKS"
              type="number"
              value={courseForm.credits}
              onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value, 10) || 3 })}
              required
            />

            <Input
              label="SKS Teori"
              type="number"
              value={courseForm.theoryCredits}
              onChange={(e) => setCourseForm({ ...courseForm, theoryCredits: parseInt(e.target.value, 10) || 2 })}
            />

            <Input
              label="SKS Praktik"
              type="number"
              value={courseForm.practicalCredits}
              onChange={(e) => setCourseForm({ ...courseForm, practicalCredits: parseInt(e.target.value, 10) || 1 })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="course-sem-select">Semester Rekomendasi</label>
              <select
                id="course-sem-select"
                className="form-select"
                value={String(courseForm.semesterRecommended)}
                onChange={(e) => setCourseForm({ ...courseForm, semesterRecommended: parseInt(e.target.value, 10) || 1 })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={String(s)}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course-type-select">Jenis Mata Kuliah</label>
              <select
                id="course-type-select"
                className="form-select"
                value={courseForm.courseType}
                onChange={(e) => setCourseForm({ ...courseForm, courseType: e.target.value as CourseType })}
              >
                <option value="WAJIB_PRODI">Wajib Program Studi</option>
                <option value="WAJIB_INSTITUSI">Wajib Institusi</option>
                <option value="PILIHAN">Pilihan Keahlian</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="course-desc-input">Deskripsi & Silabus Ringkas</label>
            <textarea
              id="course-desc-input"
              className="form-input"
              rows={3}
              placeholder="Cakupan pokok bahasan, kompetensi, dan capaian pembelajaran..."
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveCourse} isLoading={saving}>
              {modalType === 'create_course' ? 'Simpan Mata Kuliah' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: BUKA / UBAH KELAS PERKULIAHAN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_class' || modalType === 'edit_class'}
        onClose={() => setModalType(null)}
        title={modalType === 'create_class' ? 'Buka Rombongan Belajar (Kelas) Baru' : `Ubah Rombel Kelas: ${selectedClass?.className}`}
        maxWidth="680px"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="class-course-select">Mata Kuliah</label>
            <select
              id="class-course-select"
              className="form-select"
              value={classForm.courseId}
              onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
              disabled={modalType === 'edit_class'}
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name} ({c.credits} SKS • {c.studyProgramCode})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="class-semester-select">Semester Akademik</label>
              <select
                id="class-semester-select"
                className="form-select"
                value={classForm.semesterId}
                onChange={(e) => setClassForm({ ...classForm, semesterId: e.target.value })}
                required
              >
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.isCurrent ? '(Semester Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Nama Kelas / Rombel"
              placeholder="Contoh: Kelas A, Kelas B, Kelas Eksekutif"
              value={classForm.className}
              onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="class-lecturer-select">Dosen Pengampu Utama</label>
              <select
                id="class-lecturer-select"
                className="form-select"
                value={classForm.lecturerId}
                onChange={(e) => setClassForm({ ...classForm, lecturerId: e.target.value })}
              >
                <option value="usr-dsn-01">Dr. H. Ahmad Fauzi, M.Pd.I. (2105088201)</option>
              </select>
            </div>

            <Input
              label="Kapasitas Mahasiswa"
              type="number"
              value={classForm.capacity}
              onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) || 40 })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ruang Perkuliahan"
              placeholder="Contoh: Ruang Al-Ghazali (Gedung A-201)"
              value={classForm.room}
              onChange={(e) => setClassForm({ ...classForm, room: e.target.value })}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="class-mode-select">Metode Pembelajaran</label>
              <select
                id="class-mode-select"
                className="form-select"
                value={classForm.deliveryMode}
                onChange={(e) => setClassForm({ ...classForm, deliveryMode: e.target.value as any })}
              >
                <option value="HYBRID">Hybrid (Tatap Muka & Daring LMS)</option>
                <option value="TATAP_MUKA">Tatap Muka Penuh</option>
                <option value="DARING">Daring Penuh (Online)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="class-day-select">Hari Kuliah</label>
              <select
                id="class-day-select"
                className="form-select"
                value={classForm.dayOfWeek}
                onChange={(e) => setClassForm({ ...classForm, dayOfWeek: e.target.value })}
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
              label="Jam Mulai"
              type="time"
              value={classForm.startTime}
              onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
            />

            <Input
              label="Jam Selesai"
              type="time"
              value={classForm.endTime}
              onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveClass} isLoading={saving}>
              {modalType === 'create_class' ? 'Buka Kelas Perkuliahan' : 'Simpan Perubahan Kelas'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 3: DETAIL MATA KULIAH
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'detail_course'}
        onClose={() => setModalType(null)}
        title={`Detail Kurikulum: ${selectedCourse?.name} (${selectedCourse?.code})`}
        maxWidth="760px"
      >
        {courseDetail ? (
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
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {courseDetail.code}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                    {courseDetail.name}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                    {courseDetail.studyProgramName} • Semester {courseDetail.semesterRecommended}
                  </p>
                </div>
              </div>
              <Badge variant="primary" style={{ fontSize: 'var(--text-sm)' }}>
                {courseDetail.credits} SKS ({courseDetail.theoryCredits}T / {courseDetail.practicalCredits}P)
              </Badge>
            </div>

            {courseDetail.description && (
              <div>
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Deskripsi & Capaian Pembelajaran
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {courseDetail.description}
                </p>
              </div>
            )}

            {/* Daftar Kelas yang Dibuka */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h4 style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0 }}>
                  Rombel Kelas Terbuka ({courseDetail.classes.length})
                </h4>
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={Plus} 
                  onClick={() => handleOpenCreateClass(courseDetail.id)}
                >
                  Buka Kelas Baru
                </Button>
              </div>
              <div className="max-h-56 overflow-y-auto border border-default rounded-md">
                <table className="table" style={{ width: '100%', fontSize: 'var(--text-xs)' }}>
                  <thead>
                    <tr>
                      <th>Kelas</th>
                      <th>Dosen Pengampu</th>
                      <th>Jadwal & Ruang</th>
                      <th>Peserta</th>
                      <th style={{ width: '80px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseDetail.classes.length > 0 ? (
                      courseDetail.classes.map((cls) => (
                        <tr key={cls.id}>
                          <td><strong>{cls.className}</strong></td>
                          <td>{cls.lecturerName}</td>
                          <td>{cls.dayOfWeek}, {cls.startTime.substring(0, 5)} ({cls.room})</td>
                          <td>{cls.enrolledCount} / {cls.capacity} Mhs</td>
                          <td style={{ textAlign: 'center' }}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                setSelectedClass(cls as any);
                                setModalType('confirm_delete_class');
                              }}
                              title="Hapus Kelas Ini"
                              style={{ color: 'var(--color-danger-main)' }}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>
                          Belum ada rombel kelas yang dibuka untuk mata kuliah ini.
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
          MODAL 4: KONFIRMASI STATUS MATA KULIAH
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_course_status'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Status Mata Kuliah"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-warning-surface rounded-md border border-warning">
            <AlertCircle size={24} color="var(--color-warning-dark)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-dark)', margin: 0 }}>
              Apakah Anda yakin ingin <strong>{selectedCourse?.isActive ? 'menonaktifkan' : 'mengaktifkan'}</strong> Mata Kuliah <strong>{selectedCourse?.name}</strong>?
            </p>
          </div>

          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Mata kuliah yang dinonaktifkan tidak akan muncul pada daftar pemilihan KRS mahasiswa semester mendatang.
          </p>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant={selectedCourse?.isActive ? 'danger' : 'primary'} 
              onClick={handleToggleCourseStatus} 
              isLoading={saving}
            >
              Ya, {selectedCourse?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 5: KONFIRMASI STATUS KELAS
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_class_status'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Status Kelas Perkuliahan"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-warning-surface rounded-md border border-warning">
            <AlertCircle size={24} color="var(--color-warning-dark)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-dark)', margin: 0 }}>
              Apakah Anda yakin ingin <strong>{selectedClass?.isActive ? 'menonaktifkan' : 'mengaktifkan'}</strong> Kelas <strong>{selectedClass?.courseName ? `${selectedClass.courseName} - ` : ''}{selectedClass?.className}</strong>?
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant={selectedClass?.isActive ? 'danger' : 'primary'} 
              onClick={handleToggleClassStatus} 
              isLoading={saving}
            >
              Ya, {selectedClass?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 6: KONFIRMASI HAPUS MATA KULIAH PERMANEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_delete_course'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Hapus Mata Kuliah"
        maxWidth="500px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-danger-surface rounded-md border border-danger">
            <AlertCircle size={26} color="var(--color-danger-main)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-danger-main)', margin: 0 }}>
                Peringatan: Tindakan Ini Bersifat Permanen!
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                Anda akan menghapus mata kuliah <strong>{selectedCourse?.name} ({selectedCourse?.code})</strong> dari katalog kurikulum institusi.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-slate-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: 'var(--text-xs)' }}>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Kode & Nama:</span>
              <strong>{selectedCourse?.code} - {selectedCourse?.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Bobot SKS:</span>
              <span>{selectedCourse?.credits} SKS ({selectedCourse?.studyProgramName})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Jumlah Rombel Kelas:</span>
              <span style={{ color: selectedCourse?.activeClassesCount ? 'var(--color-danger-main)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                {selectedCourse?.activeClassesCount || 0} Kelas Terdaftar
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span style={{ color: 'var(--text-muted)' }}>Mahasiswa Terdaftar:</span>
              <span style={{ color: selectedCourse?.enrolledStudentsCount ? 'var(--color-danger-main)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                {selectedCourse?.enrolledStudentsCount || 0} Mahasiswa
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.6875rem', color: 'var(--color-danger-main)', margin: 0 }}>
            * Seluruh rombel kelas, jadwal, RPS, modul, tugas, kuis, dan data nilai perkuliahan yang bernaung di bawah mata kuliah ini akan dibersihkan secara permanen.
          </p>

          <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2}
              onClick={handleDeleteCourse} 
              isLoading={saving}
            >
              Hapus Mata Kuliah Permanen
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 7: KONFIRMASI HAPUS KELAS PERKULIAHAN PERMANEN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_delete_class'}
        onClose={() => setModalType(null)}
        title="Konfirmasi Hapus Kelas Perkuliahan"
        maxWidth="500px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-4 bg-danger-surface rounded-md border border-danger">
            <AlertCircle size={26} color="var(--color-danger-main)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-danger-main)', margin: 0 }}>
                Hapus Rombongan Belajar / Kelas
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                Anda akan menghapus kelas <strong>{selectedClass?.className}</strong> ({selectedClass?.courseName || 'Mata Kuliah'}).
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-slate-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', fontSize: 'var(--text-xs)' }}>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Mata Kuliah & Kelas:</span>
              <strong>{selectedClass?.courseCode || ''} {selectedClass?.className}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Dosen Pengampu:</span>
              <span>{selectedClass?.lecturerName || 'Belum Ditugaskan'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-default">
              <span style={{ color: 'var(--text-muted)' }}>Jadwal & Ruang:</span>
              <span>{selectedClass?.dayOfWeek || '-'}, {selectedClass?.startTime?.substring(0, 5) || ''} ({selectedClass?.room || '-'})</span>
            </div>
            <div className="flex justify-between py-1">
              <span style={{ color: 'var(--text-muted)' }}>Peserta Terdaftar:</span>
              <span style={{ color: selectedClass?.enrolledCount ? 'var(--color-danger-main)' : 'var(--text-primary)', fontWeight: 'bold' }}>
                {selectedClass?.enrolledCount || 0} / {selectedClass?.capacity || 40} Mahasiswa
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.6875rem', color: 'var(--color-danger-main)', margin: 0 }}>
            * Riwayat materi, presensi, pengumpulan tugas, kuis, dan nilai yang melekat pada rombel kelas ini akan dihapus permanen.
          </p>

          <div className="flex justify-end gap-3 mt-2 pt-3 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant="danger" 
              icon={Trash2}
              onClick={handleDeleteClass} 
              isLoading={saving}
            >
              Hapus Kelas Permanen
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 8: WIZARD IMPOR MASSAL DATA MATA KULIAH
          ===================================================================== */}
      {isImportModalOpen && (
        <DataImportModal<CreateCourseInput>
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          schema={COURSE_IMPORT_SCHEMA}
          onImport={handleBulkImportCourses}
          customTitle="Pusat Impor Master Data & Katalog Mata Kuliah"
        />
      )}
    </div>
  );
};
