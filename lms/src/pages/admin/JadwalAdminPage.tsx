import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Search, 
  RefreshCw, 
  Edit3, 
  Trash2, 
  Clock, 
  Building, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  ShieldCheck, 
  Grid, 
  List,
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
  CampusRoom, 
  ClassSchedule, 
  ScheduleSummaryStats, 
  ScheduleMatrixData, 
  RoomType, 
  CreateScheduleInput, 
  CreateRoomInput 
} from '../../types/scheduleAdmin';
import { CourseClassItem } from '../../types/courseAdmin';
import { StudyProgram } from '../../types/studyProgram';
import { scheduleAdminService } from '../../services/scheduleAdminService';
import { courseAdminService } from '../../services/courseAdminService';
import { studyProgramService } from '../../services/studyProgramService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { SCHEDULE_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';

type TabView = 'schedule_list' | 'timetable_grid' | 'room_master';

export const JadwalAdminPage: React.FC = () => {
  const { success, warning, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('schedule_list');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<ScheduleSummaryStats | null>(null);
  const [schedules, setSchedules] = useState<ClassSchedule[]>([]);
  const [rooms, setRooms] = useState<CampusRoom[]>([]);
  const [classes, setClasses] = useState<CourseClassItem[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [matrixData, setMatrixData] = useState<ScheduleMatrixData | null>(null);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDay, setFilterDay] = useState<string>('SEMUA');
  const [filterRoom, setFilterRoom] = useState<string>('SEMUA');
  const [filterProdi, setFilterProdi] = useState<string>('SEMUA');
  const [filterDeliveryMode, setFilterDeliveryMode] = useState<string>('SEMUA');

  // Pagination States
  const [currentPageSchedules, setCurrentPageSchedules] = useState<number>(1);
  const [pageSizeSchedules, setPageSizeSchedules] = useState<number>(10);
  const [currentPageRooms, setCurrentPageRooms] = useState<number>(1);
  const [pageSizeRooms, setPageSizeRooms] = useState<number>(10);

  // Auto reset page when filter changes
  useEffect(() => {
    setCurrentPageSchedules(1);
  }, [searchQuery, filterDay, filterRoom, filterProdi, filterDeliveryMode]);

  const hasActiveFilters = searchQuery !== '' || filterDay !== 'SEMUA' || filterRoom !== 'SEMUA' || filterProdi !== 'SEMUA' || filterDeliveryMode !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterDay('SEMUA');
    setFilterRoom('SEMUA');
    setFilterProdi('SEMUA');
    setFilterDeliveryMode('SEMUA');
    setCurrentPageSchedules(1);
  };

  // Modal State
  const [modalType, setModalType] = useState<
    'create_schedule' | 'edit_schedule' | 'create_room' | 'edit_room' | 'confirm_delete_schedule' | 'confirm_room_status' | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ClassSchedule | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<CampusRoom | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Form State Jadwal
  const [scheduleForm, setScheduleForm] = useState<CreateScheduleInput>({
    classId: '',
    roomId: '',
    lecturerId: 'usr-dsn-01',
    dayOfWeek: 'Senin',
    startTime: '08:00:00',
    endTime: '10:30:00',
    deliveryMode: 'HYBRID'
  });

  // Form State Ruangan
  const [roomForm, setRoomForm] = useState<CreateRoomInput>({
    code: '',
    name: '',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 1,
    capacity: 40,
    roomType: 'TEORI',
    facilities: ['Pendingin Udara (AC)', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat']
  });

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, schedRes, roomsRes, classesRes, prodiRes, matrixRes] = await Promise.all([
        scheduleAdminService.getSummaryStats(),
        scheduleAdminService.getSchedules(),
        scheduleAdminService.getRooms(),
        courseAdminService.getAllClasses(),
        studyProgramService.getStudyPrograms(),
        scheduleAdminService.getScheduleMatrix()
      ]);

      setSummaryStats(statsRes);
      setSchedules(schedRes);
      setRooms(roomsRes);
      setClasses(classesRes);
      setStudyPrograms(prodiRes);
      setMatrixData(matrixRes);

      if (classesRes.length > 0 && !scheduleForm.classId) {
        setScheduleForm((prev) => ({ ...prev, classId: classesRes[0].id, roomId: roomsRes[0]?.id || '' }));
      }
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data ruangan dan jadwal perkuliahan.');
    } finally {
      setLoading(false);
    }
  }, [danger, scheduleForm.classId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchSearch = 
        s.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roomName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDay = filterDay === 'SEMUA' || s.dayOfWeek === filterDay;
      const matchRoom = filterRoom === 'SEMUA' || s.roomId === filterRoom;
      const matchProdi = 
        filterProdi === 'SEMUA' || 
        (filterProdi === 'MKDU' && !s.studyProgramId) || 
        s.studyProgramId === filterProdi;
      const matchDelivery = filterDeliveryMode === 'SEMUA' || s.deliveryMode === filterDeliveryMode;

      return matchSearch && matchDay && matchRoom && matchProdi && matchDelivery;
    });
  }, [schedules, searchQuery, filterDay, filterRoom, filterProdi, filterDeliveryMode]);

  // Paginated Schedules
  const totalPagesSchedules = Math.ceil(filteredSchedules.length / pageSizeSchedules) || 1;
  const paginatedSchedules = useMemo(() => {
    const start = (currentPageSchedules - 1) * pageSizeSchedules;
    return filteredSchedules.slice(start, start + pageSizeSchedules);
  }, [filteredSchedules, currentPageSchedules, pageSizeSchedules]);

  // Paginated Rooms
  const totalPagesRooms = Math.ceil(rooms.length / pageSizeRooms) || 1;
  const paginatedRooms = useMemo(() => {
    const start = (currentPageRooms - 1) * pageSizeRooms;
    return rooms.slice(start, start + pageSizeRooms);
  }, [rooms, currentPageRooms, pageSizeRooms]);

  // Handler: Buka Modal Plot Jadwal
  const handleOpenCreateSchedule = () => {
    setScheduleForm({
      classId: classes[0]?.id || '',
      roomId: rooms[0]?.id || '',
      lecturerId: 'usr-dsn-01',
      dayOfWeek: 'Senin',
      startTime: '08:00:00',
      endTime: '10:30:00',
      deliveryMode: 'HYBRID'
    });
    setModalType('create_schedule');
  };

  // Handler: Buka Modal Ubah Jadwal
  const handleOpenEditSchedule = (s: ClassSchedule) => {
    setSelectedSchedule(s);
    setScheduleForm({
      classId: s.classId,
      roomId: s.roomId || '',
      lecturerId: s.lecturerId || 'usr-dsn-01',
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime.substring(0, 8),
      endTime: s.endTime.substring(0, 8),
      deliveryMode: s.deliveryMode
    });
    setModalType('edit_schedule');
  };

  // Handler: Buka Modal Tambah Ruangan
  const handleOpenCreateRoom = () => {
    setRoomForm({
      code: '',
      name: '',
      building: 'Gedung A (Kulliyyah Tarbiyah)',
      floor: 1,
      capacity: 40,
      roomType: 'TEORI',
      facilities: ['Pendingin Udara (AC)', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat']
    });
    setModalType('create_room');
  };

  // Handler: Buka Modal Ubah Ruangan
  const handleOpenEditRoom = (r: CampusRoom) => {
    setSelectedRoom(r);
    setRoomForm({
      code: r.code,
      name: r.name,
      building: r.building,
      floor: r.floor,
      capacity: r.capacity,
      roomType: r.roomType,
      facilities: r.facilities
    });
    setModalType('edit_room');
  };

  // Handler: Simpan Jadwal (Tambah / Ubah)
  const handleSaveSchedule = async () => {
    if (!scheduleForm.classId || !scheduleForm.dayOfWeek || !scheduleForm.startTime || !scheduleForm.endTime) {
      warning('Formulir Belum Lengkap', 'Rombel Kelas, Hari, Jam Mulai, dan Jam Selesai wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (modalType === 'create_schedule') {
        const res = await scheduleAdminService.createSchedule(scheduleForm);
        success('Jadwal Berhasil Di-Plot', res.message || 'Plot jadwal perkuliahan berhasil ditambahkan.');
      } else if (modalType === 'edit_schedule' && selectedSchedule) {
        await scheduleAdminService.updateSchedule(selectedSchedule.id, scheduleForm);
        success('Jadwal Diperbarui', 'Perubahan jadwal perkuliahan berhasil disimpan.');
      }

      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menyimpan Jadwal', err.message || 'Terjadi bentrok jadwal atau kesalahan server.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Hapus Jadwal
  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;

    try {
      setSaving(true);
      await scheduleAdminService.deleteSchedule(selectedSchedule.id);
      success('Jadwal Dihapus', `Plot jadwal untuk kelas ${selectedSchedule.className} berhasil dihapus.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Menghapus Jadwal', 'Tidak dapat menghapus plot jadwal perkuliahan.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Simpan Ruangan (Tambah / Ubah)
  const handleSaveRoom = async () => {
    if (!roomForm.code.trim() || !roomForm.name.trim() || !roomForm.building.trim()) {
      warning('Formulir Belum Lengkap', 'Kode Ruangan, Nama Ruangan, dan Gedung wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      if (modalType === 'create_room') {
        await scheduleAdminService.createRoom(roomForm);
        success('Ruangan Ditambahkan', `Ruangan ${roomForm.name} (${roomForm.code.toUpperCase()}) berhasil didaftarkan.`);
      } else if (modalType === 'edit_room' && selectedRoom) {
        await scheduleAdminService.updateRoom(selectedRoom.id, roomForm);
        success('Data Ruangan Diperbarui', `Perubahan ruangan ${roomForm.name} berhasil disimpan.`);
      }

      setModalType(null);
      await loadData();
    } catch (err: any) {
      danger('Gagal Menyimpan Ruangan', err.message || 'Terjadi kesalahan saat menyimpan data ruangan.');
    } finally {
      setSaving(false);
    }
  };

  // Handler: Toggle Ketersediaan Ruangan
  const handleToggleRoomStatus = async () => {
    if (!selectedRoom) return;

    try {
      setSaving(true);
      await scheduleAdminService.toggleRoomStatus(selectedRoom.id);
      success('Status Ruangan Berubah', `Ruangan ${selectedRoom.name} telah di-${selectedRoom.isAvailable ? 'tutup untuk perawatan' : 'buka untuk perkuliahan'}.`);
      setModalType(null);
      await loadData();
    } catch {
      danger('Gagal Mengubah Status', 'Tidak dapat memperbarui status ketersediaan ruangan.');
    } finally {
      setSaving(false);
    }
  };

  // Konfigurasi Ekspor Profesional Jadwal Perkuliahan
  const scheduleExportConfig: ExportConfig<ClassSchedule> = useMemo(() => ({
    filename: 'SALAM_Jadwal_Perkuliahan',
    title: 'MASTER JADWAL PERKULIAHAN & PEMETAAN RUANGAN KAMPUS',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredSchedules,
    columns: [
      { key: 'dayOfWeek', header: 'Hari', width: '90px' },
      { key: 'startTime', header: 'Waktu Kuliah', width: '130px', format: (_, s) => `${s.startTime.substring(0, 5)} - ${s.endTime.substring(0, 5)} WIB` },
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Mata Kuliah', width: '220px' },
      { key: 'className', header: 'Kelas', width: '100px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'studyProgramName', header: 'Program Studi', width: '180px' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '200px' },
      { key: 'roomName', header: 'Ruangan', width: '160px' },
      { key: 'building', header: 'Gedung', width: '160px' },
      { key: 'deliveryMode', header: 'Metode', width: '90px', align: 'center' }
    ],
    metadata: {
      'Total Jadwal': `${filteredSchedules.length} Sesi Perkuliahan`,
      'Filter Hari': filterDay,
      'Filter Ruangan': filterRoom,
      'Filter Prodi': filterProdi,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredSchedules, filterDay, filterRoom, filterProdi]);

  // Handler Impor Massal Jadwal
  const handleBulkImportSchedules = async (data: CreateScheduleInput[], summary: BulkImportResult) => {
    try {
      await scheduleAdminService.bulkCreateSchedules(data);
      success('Impor Berhasil', `Sebanyak ${summary.inserted} jadwal perkuliahan berhasil ditambahkan.`);
      await loadData();
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor jadwal ke server.');
    }
  };

  // Definisi Kolom Tabel Jadwal
  const scheduleColumns: Column<ClassSchedule>[] = [
    {
      header: 'Waktu & Hari',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-1">
            <Calendar size={13} color="var(--color-primary-700)" />
            <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
              {row.dayOfWeek}
            </span>
          </div>
          <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            <Clock size={12} />
            <span>{row.startTime.substring(0, 5)} - {row.endTime.substring(0, 5)} WIB</span>
          </div>
        </div>
      )
    },
    {
      header: 'Mata Kuliah & Rombel',
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
            <Badge variant="default" style={{ fontSize: '0.625rem' }}>
              {row.credits} SKS
            </Badge>
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', marginTop: '2px' }}>
            {row.courseName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.studyProgramName}
          </span>
        </div>
      )
    },
    {
      header: 'Dosen Pengampu',
      width: '220px',
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
      header: 'Ruangan & Gedung',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="flex items-center gap-1">
            <Building size={13} color="var(--color-primary-700)" />
            <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
              {row.roomName}
            </span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.building}
          </span>
        </div>
      )
    },
    {
      header: 'Metode',
      width: '110px',
      render: (row) => (
        <Badge variant={row.deliveryMode === 'HYBRID' ? 'primary' : row.deliveryMode === 'DARING' ? 'warning' : 'default'}>
          {row.deliveryMode}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditSchedule(row)}
            title="Ubah Waktu / Ruangan"
          >
            <Edit3 size={14} />
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedSchedule(row);
              setModalType('confirm_delete_schedule');
            }}
            title="Hapus Plot Jadwal"
            style={{ color: 'var(--color-danger-main)' }}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  // Definisi Kolom Tabel Ruangan
  const roomColumns: Column<CampusRoom>[] = [
    {
      header: 'Kode & Nama Ruangan',
      width: '260px',
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
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Lantai {row.floor} • {row.building}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Kapasitas & Tipe',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
            <Users size={14} color="var(--color-primary-700)" />
            <span><strong>{row.capacity}</strong> Kursi Mahasiswa</span>
          </div>
          <Badge variant="default" style={{ width: 'fit-content', marginTop: '4px', fontSize: '0.625rem' }}>
            {row.roomType}
          </Badge>
        </div>
      )
    },
    {
      header: 'Fasilitas Terpasang',
      width: '300px',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.facilities && row.facilities.map((fac, idx) => (
            <span 
              key={idx}
              style={{
                fontSize: '0.625rem',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-slate-100)',
                color: 'var(--text-secondary)'
              }}
            >
              {fac}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      width: '120px',
      render: (row) => (
        <Badge variant={row.isAvailable ? 'success' : 'danger'}>
          {row.isAvailable ? 'TERSEDIA' : 'PERAWATAN'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      width: '140px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleOpenEditRoom(row)}
            title="Ubah Data Ruangan"
          >
            <Edit3 size={14} />
            <span style={{ fontSize: 'var(--text-xs)' }}>Ubah</span>
          </Button>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedRoom(row);
              setModalType('confirm_room_status');
            }}
            title={row.isAvailable ? 'Tutup Ruangan (Perawatan)' : 'Buka Ruangan'}
            style={{ color: row.isAvailable ? 'var(--color-warning-dark)' : 'var(--color-success-main)' }}
          >
            <Sliders size={14} />
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
            Manajemen Ruangan & Jadwal Perkuliahan
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pengelolaan pemetaan jadwal perkuliahan mingguan, alokasi ruangan kampus, pencegahan bentrok dosen/ruang, dan kalender timetable.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={scheduleExportConfig} 
            buttonLabel="Ekspor Jadwal Kuliah" 
          />
          <Button 
            variant="outline" 
            size="sm" 
            icon={UploadCloud}
            onClick={() => setIsImportModalOpen(true)}
          >
            + Impor Massal Jadwal
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            icon={Building}
            onClick={handleOpenCreateRoom}
          >
            + Tambah Ruangan
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus}
            onClick={handleOpenCreateSchedule}
          >
            + Plot Jadwal Baru
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
                  JADWAL KULIAH TERPLOT
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalSchedules || schedules.length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Sesi Perkuliahan
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Total {summaryStats?.totalScheduledCredits || 17} SKS Terjadwal</span>
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
                <Calendar size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  RUANGAN OPERASIONAL
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalActiveRooms || rooms.filter((r) => r.isAvailable).length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    dari {rooms.length} Ruangan
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <Building size={13} />
                  <span>Gedung A, B, C & Rektorat</span>
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
                  UTILISASI RUANGAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.utilizationRatePercent || 12}%
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Kapasitas Terpakai
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <Clock size={13} />
                  <span>Slot Tersedia Masih Cukup Luas</span>
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
                <Clock size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  INTEGRITAS JADWAL
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-dark)', marginTop: '4px' }}>
                  0 Bentrok
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <ShieldCheck size={13} />
                  <span>Validasi Anti-Bentrok Aktif</span>
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
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'schedule_list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('schedule_list')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <List size={16} />
          <span>Tabel Penjadwalan Mingguan ({schedules.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'timetable_grid' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('timetable_grid')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Grid size={16} />
          <span>Matriks Timetable Kalender</span>
        </button>

        <button
          className={`btn ${activeTab === 'room_master' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('room_master')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Building size={16} />
          <span>Master Ruangan & Fasilitas ({rooms.length})</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Tabel Penjadwalan Mingguan */}
      {activeTab === 'schedule_list' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Daftar Plot Jadwal Perkuliahan</CardTitle>
                <CardSubtitle>Daftar alokasi waktu perkuliahan, ruangan, dosen pengampu, dan rombongan belajar.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '200px' }}>
                  <Input
                    placeholder="Cari MK, dosen, ruang..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterDay}
                  onChange={(e) => setFilterDay(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Hari</option>
                  <option value="Senin">Senin</option>
                  <option value="Selasa">Selasa</option>
                  <option value="Rabu">Rabu</option>
                  <option value="Kamis">Kamis</option>
                  <option value="Jumat">Jumat</option>
                  <option value="Sabtu">Sabtu</option>
                </select>

                <select
                  value={filterRoom}
                  onChange={(e) => setFilterRoom(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Ruangan</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>{r.code} - {r.name}</option>
                  ))}
                </select>

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
                  value={filterDeliveryMode}
                  onChange={(e) => setFilterDeliveryMode(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Mode</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="TATAP_MUKA">Tatap Muka</option>
                  <option value="DARING">Daring</option>
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
              columns={scheduleColumns}
              data={paginatedSchedules}
              keyExtractor={(row) => row.id}
              emptyMessage="Tidak ada jadwal perkuliahan yang sesuai dengan kriteria filter."
            />
            <Pagination
              currentPage={currentPageSchedules}
              totalPages={totalPagesSchedules}
              totalItems={filteredSchedules.length}
              pageSize={pageSizeSchedules}
              onPageChange={setCurrentPageSchedules}
              onPageSizeChange={setPageSizeSchedules}
              itemLabel="jadwal perkuliahan"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Matriks Timetable Kalender */}
      {activeTab === 'timetable_grid' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matrixData?.days.map((day) => {
              const dayItems = matrixData.matrix[day] || [];

              return (
                <Card key={day}>
                  <CardHeader>
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} color="var(--color-primary-700)" />
                        <CardTitle style={{ fontSize: 'var(--text-base)' }}>{day}</CardTitle>
                      </div>
                      <Badge variant={dayItems.length > 0 ? 'primary' : 'default'}>
                        {dayItems.length} Sesi Kuliah
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardBody>
                    {dayItems.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {dayItems.map((item) => (
                          <div 
                            key={item.id}
                            style={{
                              padding: 'var(--space-3)',
                              backgroundColor: 'var(--color-slate-50)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-default)',
                              borderLeft: '4px solid var(--color-primary-600)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
                                {item.courseName}
                              </span>
                              <Badge variant={item.deliveryMode === 'DARING' ? 'warning' : 'primary'}>
                                {item.deliveryMode}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              <span>{item.className}</span>
                              <span>•</span>
                              <span>{item.lecturerName}</span>
                            </div>
                            <div className="flex items-center justify-between" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-800)', marginTop: '2px', fontWeight: 'var(--font-weight-semibold)' }}>
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                <span>{item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)} WIB</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building size={11} />
                                <span>{item.roomName}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        Tidak ada perkuliahan yang terjadwal di hari {day}.
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Konten Tab 3: Master Ruangan & Fasilitas */}
      {activeTab === 'room_master' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Master Ruangan Kampus STAI AL-ITTIHAD</CardTitle>
                <CardSubtitle>Daftar seluruh ruangan kuliah, kapasitas kursi, lantai gedung, fasilitas multimedia, dan status operasional.</CardSubtitle>
              </div>

              <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreateRoom}>
                + Tambah Ruangan Baru
              </Button>
            </div>
          </CardHeader>

          <CardBody>
            <Table
              columns={roomColumns}
              data={paginatedRooms}
              keyExtractor={(row) => row.id}
              emptyMessage="Belum ada data master ruangan."
            />
            <Pagination
              currentPage={currentPageRooms}
              totalPages={totalPagesRooms}
              totalItems={rooms.length}
              pageSize={pageSizeRooms}
              onPageChange={setCurrentPageRooms}
              onPageSizeChange={setPageSizeRooms}
              itemLabel="ruangan kampus"
            />
          </CardBody>
        </Card>
      )}

      {/* =====================================================================
          MODAL 1: PLOT JADWAL PERKULIAHAN (TAMBAH / UBAH)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_schedule' || modalType === 'edit_schedule'}
        onClose={() => setModalType(null)}
        title={modalType === 'create_schedule' ? 'Plot Jadwal Perkuliahan Baru' : `Ubah Jadwal: ${selectedSchedule?.courseName}`}
        maxWidth="680px"
      >
        <div className="flex flex-col gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="sched-class-select">Rombongan Belajar (Kelas MK)</label>
            <select
              id="sched-class-select"
              className="form-select"
              value={scheduleForm.classId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })}
              disabled={modalType === 'edit_schedule'}
              required
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.courseCode} - {cls.courseName} ({cls.className} • {cls.academicYear})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="sched-room-select">Ruangan Perkuliahan</label>
              <select
                id="sched-room-select"
                className="form-select"
                value={scheduleForm.roomId}
                onChange={(e) => setScheduleForm({ ...scheduleForm, roomId: e.target.value })}
              >
                <option value="">Tanpa Ruangan Fisik (Khusus Daring)</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} - {r.name} ({r.building})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sched-mode-select">Metode Pembelajaran</label>
              <select
                id="sched-mode-select"
                className="form-select"
                value={scheduleForm.deliveryMode}
                onChange={(e) => setScheduleForm({ ...scheduleForm, deliveryMode: e.target.value as any })}
              >
                <option value="HYBRID">Hybrid (Tatap Muka & Daring)</option>
                <option value="TATAP_MUKA">Tatap Muka Penuh</option>
                <option value="DARING">Daring Penuh (Online)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="sched-day-select">Hari Kuliah</label>
              <select
                id="sched-day-select"
                className="form-select"
                value={scheduleForm.dayOfWeek}
                onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                required
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
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
              required
            />

            <Input
              label="Jam Selesai"
              type="time"
              value={scheduleForm.endTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-primary-50 rounded-md border border-primary-200" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)' }}>
            <ShieldCheck size={18} color="var(--color-primary-700)" />
            <span>Sistem akan otomatis mengecek ketersediaan ruangan dan dosen pengampu untuk mencegah bentrok jadwal.</span>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveSchedule} isLoading={saving}>
              {modalType === 'create_schedule' ? 'Plot Jadwal Perkuliahan' : 'Simpan Perubahan Jadwal'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 2: FORMULIR MASTER RUANGAN (TAMBAH / UBAH)
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'create_room' || modalType === 'edit_room'}
        onClose={() => setModalType(null)}
        title={modalType === 'create_room' ? 'Tambah Ruangan Kampus Baru' : `Ubah Ruangan: ${selectedRoom?.name}`}
        maxWidth="640px"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Kode Ruangan"
              placeholder="Contoh: A-201, B-101, AUD-01"
              value={roomForm.code}
              onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
              disabled={modalType === 'edit_room'}
              required
            />

            <div className="form-group">
              <label className="form-label" htmlFor="room-type-select">Tipe Ruangan</label>
              <select
                id="room-type-select"
                className="form-select"
                value={roomForm.roomType}
                onChange={(e) => setRoomForm({ ...roomForm, roomType: e.target.value as RoomType })}
              >
                <option value="TEORI">Ruang Kelas Teori</option>
                <option value="SMART_CLASS">Smart Classroom Hybrid</option>
                <option value="LABORATORIUM">Laboratorium Komputer/Syariah</option>
                <option value="STUDIO">Studio Multimedia / Microteaching</option>
                <option value="AUDITORIUM">Auditorium Konferensi</option>
              </select>
            </div>
          </div>

          <Input
            label="Nama Lengkap Ruangan"
            placeholder="Contoh: Ruang Al-Ghazali, Laboratorium Mini Bank"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Nama Gedung"
              placeholder="Contoh: Gedung A"
              value={roomForm.building}
              onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
              required
            />

            <Input
              label="Lantai"
              type="number"
              value={roomForm.floor}
              onChange={(e) => setRoomForm({ ...roomForm, floor: parseInt(e.target.value, 10) || 1 })}
            />

            <Input
              label="Kapasitas Kursi"
              type="number"
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value, 10) || 40 })}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="primary" onClick={handleSaveRoom} isLoading={saving}>
              {modalType === 'create_room' ? 'Simpan Ruangan' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 3: KONFIRMASI HAPUS JADWAL
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_delete_schedule'}
        onClose={() => setModalType(null)}
        title="Hapus Plot Jadwal Perkuliahan"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-danger-surface rounded-md border border-danger">
            <AlertCircle size={24} color="var(--color-danger-main)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-main)', margin: 0 }}>
              Apakah Anda yakin ingin menghapus plot jadwal <strong>{selectedSchedule?.courseName} ({selectedSchedule?.className})</strong> pada hari <strong>{selectedSchedule?.dayOfWeek}</strong>?
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDeleteSchedule} isLoading={saving}>
              Ya, Hapus Jadwal
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 4: KONFIRMASI STATUS OPERASIONAL RUANGAN
          ===================================================================== */}
      <Modal
        isOpen={modalType === 'confirm_room_status'}
        onClose={() => setModalType(null)}
        title="Ubah Status Ketersediaan Ruangan"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 p-3 bg-warning-surface rounded-md border border-warning">
            <AlertCircle size={24} color="var(--color-warning-dark)" />
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-warning-dark)', margin: 0 }}>
              Apakah Anda yakin ingin <strong>{selectedRoom?.isAvailable ? 'menonaktifkan' : 'mengaktifkan'}</strong> Ruangan <strong>{selectedRoom?.name}</strong>?
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setModalType(null)} disabled={saving}>
              Batal
            </Button>
            <Button 
              variant={selectedRoom?.isAvailable ? 'danger' : 'primary'} 
              onClick={handleToggleRoomStatus} 
              isLoading={saving}
            >
              Ya, {selectedRoom?.isAvailable ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL 5: WIZARD IMPOR MASSAL JADWAL PERKULIAHAN
          ===================================================================== */}
      {isImportModalOpen && (
        <DataImportModal<CreateScheduleInput>
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          schema={SCHEDULE_IMPORT_SCHEMA}
          onImport={handleBulkImportSchedules}
          customTitle="Pusat Impor Master Jadwal Perkuliahan"
        />
      )}
    </div>
  );
};
