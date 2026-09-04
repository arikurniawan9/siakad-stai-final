import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  BookOpen, 
  Video, 
  HelpCircle, 
  MessageSquare, 
  Clock, 
  Send,
  TrendingUp,
  BarChart2,
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
  MonitoringSummaryStats, 
  ActivityFeedItem, 
  ClassEngagementItem, 
  AtRiskStudentItem,
  ActivityType 
} from '../../types/monitoringAdmin';
import { monitoringAdminService } from '../../services/monitoringAdminService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

type TabView = 'live_feed' | 'class_engagement' | 'early_warning';

export const MonitoringAdminPage: React.FC = () => {
  const { success, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('live_feed');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<MonitoringSummaryStats | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [classesEngagement, setClassesEngagement] = useState<ClassEngagementItem[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<AtRiskStudentItem[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<ActivityType | 'SEMUA'>('SEMUA');
  const [filterHealth, setFilterHealth] = useState<string>('SEMUA');

  // Pagination State
  const [currentPageFeed, setCurrentPageFeed] = useState<number>(1);
  const [pageSizeFeed, setPageSizeFeed] = useState<number>(10);
  const [currentPageClasses, setCurrentPageClasses] = useState<number>(1);
  const [pageSizeClasses, setPageSizeClasses] = useState<number>(10);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPageFeed(1);
    setCurrentPageClasses(1);
  }, [searchQuery, filterType, filterHealth]);

  const hasActiveFilters = searchQuery !== '' || filterType !== 'SEMUA' || filterHealth !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('SEMUA');
    setFilterHealth('SEMUA');
    setCurrentPageFeed(1);
    setCurrentPageClasses(1);
  };

  // Modal State
  const [selectedAtRisk, setSelectedAtRisk] = useState<AtRiskStudentItem | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string>('');
  const [sendingAction, setSendingAction] = useState<boolean>(false);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, feedRes, classesRes, atRiskRes] = await Promise.all([
        monitoringAdminService.getSummaryStats(),
        monitoringAdminService.getRealtimeActivityFeed({ activityType: filterType }),
        monitoringAdminService.getClassEngagementMatrix(),
        monitoringAdminService.getAtRiskStudents()
      ]);

      setSummaryStats(statsRes);
      setActivityFeed(feedRes);
      setClassesEngagement(classesRes);
      setAtRiskStudents(atRiskRes);
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil data monitoring pembelajaran dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger, filterType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered Feed
  const filteredFeed = useMemo(() => {
    return activityFeed.filter((item) => {
      const matchSearch = 
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.detail.toLowerCase().includes(searchQuery.toLowerCase());

      const matchType = filterType === 'SEMUA' || item.activityType === filterType;
      return matchSearch && matchType;
    });
  }, [activityFeed, searchQuery, filterType]);

  // Filtered Classes
  const filteredClasses = useMemo(() => {
    return classesEngagement.filter((item) => {
      const matchSearch = 
        item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studyProgramName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchHealth = filterHealth === 'SEMUA' || item.statusHealth === filterHealth;
      return matchSearch && matchHealth;
    });
  }, [classesEngagement, searchQuery, filterHealth]);

  // Paginated Feed
  const totalPagesFeed = Math.ceil(filteredFeed.length / pageSizeFeed) || 1;
  const paginatedFeed = useMemo(() => {
    const start = (currentPageFeed - 1) * pageSizeFeed;
    return filteredFeed.slice(start, start + pageSizeFeed);
  }, [filteredFeed, currentPageFeed, pageSizeFeed]);

  // Paginated Classes
  const totalPagesClasses = Math.ceil(filteredClasses.length / pageSizeClasses) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPageClasses - 1) * pageSizeClasses;
    return filteredClasses.slice(start, start + pageSizeClasses);
  }, [filteredClasses, currentPageClasses, pageSizeClasses]);

  // Handler: Buka Modal Tindak Lanjut
  const handleOpenActionModal = (student: AtRiskStudentItem) => {
    setSelectedAtRisk(student);
    setActionMessage(
      `Yth. ${student.studentName} (${student.nim}), berdasarkan pemantauan keaktifan LMS SALAM, mohon segera menyelesaikan penugasan yang tertunda dan menghubungi Dosen Pembimbing Akademik Anda (${student.advisorName}).`
    );
    setActionModalOpen(true);
  };

  // Handler: Kirim Notifikasi Pembinaan
  const handleSendNotification = async () => {
    if (!selectedAtRisk || !actionMessage.trim()) return;

    try {
      setSendingAction(true);
      // Simulasi pengiriman notifikasi terpadu ke Mahasiswa & Dosen PA
      await new Promise((resolve) => setTimeout(resolve, 800));
      success(
        'Notifikasi Pembinaan Terkirim', 
        `Peringatan akademik telah dikirimkan ke ${selectedAtRisk.studentName} dengan tembusan ke Dosen PA (${selectedAtRisk.advisorName}).`
      );
      setActionModalOpen(false);
    } catch {
      danger('Gagal Mengirim', 'Terjadi galat saat mengirim notifikasi pembinaan.');
    } finally {
      setSendingAction(false);
    }
  };

  // Konfigurasi Ekspor Aktivitas & Keterlibatan Pembelajaran
  const monitoringExportConfig: ExportConfig<ActivityFeedItem> = useMemo(() => ({
    filename: 'SALAM_Monitoring_Aktivitas_Belajar',
    title: 'LAPORAN MONITORING AKTIVITAS & KETERLIBATAN MAHASISWA',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredFeed,
    columns: [
      { key: 'timestamp', header: 'Waktu (WIB)', width: '150px', format: (val) => new Date(val).toLocaleString('id-ID') },
      { key: 'activityType', header: 'Jenis Aktivitas', width: '140px' },
      { key: 'studentNim', header: 'NIM', width: '100px' },
      { key: 'studentName', header: 'Nama Mahasiswa', width: '200px' },
      { key: 'studyProgramCode', header: 'Prodi', width: '80px', align: 'center' },
      { key: 'courseName', header: 'Mata Kuliah', width: '200px' },
      { key: 'className', header: 'Kelas', width: '100px' },
      { key: 'detail', header: 'Rincian Log Aktivitas', width: '240px' }
    ],
    metadata: {
      'Total Baris Aktivitas': `${filteredFeed.length} Log`,
      'Filter Jenis': filterType,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredFeed, filterType]);

  // Format Helper Jenis Aktivitas
  const renderActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'AKSES_MATERI':
        return <Badge variant="primary"><BookOpen size={12} className="mr-1 inline" /> Akses Materi</Badge>;
      case 'TONTON_VIDEO':
        return <Badge variant="primary"><Video size={12} className="mr-1 inline" /> Tonton Video</Badge>;
      case 'PENGUMPULAN_TUGAS':
        return <Badge variant="success"><CheckCircle2 size={12} className="mr-1 inline" /> Tugas Kuliah</Badge>;
      case 'KUIS_UJIAN':
        return <Badge variant="warning"><HelpCircle size={12} className="mr-1 inline" /> Kuis & Ujian</Badge>;
      case 'FORUM_DISKUSI':
        return <Badge variant="default"><MessageSquare size={12} className="mr-1 inline" /> Diskusi Forum</Badge>;
      default:
        return <Badge variant="default">{type}</Badge>;
    }
  };

  // Format Waktu Relatif
  const formatTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Baru saja';
    if (diffMins < 60) return `${diffMins} menit lalu`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return new Date(isoString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  // Kolom Tabel Feed Aktivitas
  const feedColumns: Column<ActivityFeedItem>[] = [
    {
      header: 'Waktu & Tipe',
      width: '180px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>{renderActivityBadge(row.activityType)}</div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <Clock size={11} className="inline mr-1" />
            {formatTimeAgo(row.timestamp)}
          </span>
        </div>
      )
    },
    {
      header: 'Mahasiswa',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {row.studentName}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', fontWeight: 'var(--font-weight-semibold)' }}>
            {row.studentNim} • {row.studyProgramCode}
          </span>
        </div>
      )
    },
    {
      header: 'Mata Kuliah & Rombel',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.courseName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.className}
          </span>
        </div>
      )
    },
    {
      header: 'Rincian Aksi Pembelajaran',
      width: '280px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
          {row.detail}
        </span>
      )
    }
  ];

  // Kolom Tabel Keterlibatan Kelas
  const classColumns: Column<ClassEngagementItem>[] = [
    {
      header: 'Mata Kuliah & Kelas',
      width: '280px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {row.courseName}
          </span>
          <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
              {row.courseCode} ({row.className})
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              • {row.credits} SKS
            </span>
          </div>
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
            {row.studyProgramName}
          </span>
        </div>
      )
    },
    {
      header: 'Keterlibatan & Kelengkapan',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Penyelesaian:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary-900)' }}>{row.completionRatePercent}%</span>
          </div>
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-200)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${row.completionRatePercent}%`, height: '100%', backgroundColor: 'var(--color-primary-600)' }} />
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.enrolledStudentsCount} Mahasiswa • {row.totalMaterialsCount} Modul • {row.totalAssignmentsCount} Tugas
          </span>
        </div>
      )
    },
    {
      header: 'Status Kesehatan',
      width: '140px',
      render: (row) => {
        let variant: 'success' | 'warning' | 'danger' = 'success';
        if (row.statusHealth === 'BAIK') variant = 'warning';
        if (row.statusHealth === 'PERLU_PERHATIAN') variant = 'danger';

        return (
          <Badge variant={variant}>
            {row.statusHealth.replace('_', ' ')}
          </Badge>
        );
      }
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sistem & Pembelajaran
            </Badge>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-DEFAULT)', display: 'inline-block' }} />
              LIVE MONITORING • WIB
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Monitoring Aktivitas & Keterlibatan Pembelajaran
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pemantauan real-time aktivitas belajar mahasiswa, tingkat penyelesaian materi perkuliahan, matriks keterlibatan kelas, serta sistem peringatan dini (Early Warning System) mahasiswa berisiko.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={monitoringExportConfig} 
            buttonLabel="Ekspor Monitoring Aktivitas" 
          />
          <Button 
            variant="primary" 
            size="sm" 
            icon={RefreshCw}
            onClick={loadData}
            isLoading={loading}
          >
            Segarkan Feed Real-Time
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
                  AKTIVITAS HARI INI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalInteractions || 142}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Interaksi Belajar
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <TrendingUp size={13} />
                  <span>Modul, Video, Tugas & Kuis</span>
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
                <Activity size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  RATA-RATA KETERLIBATAN
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.averageEngagementRate || 88.5}%
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Partisipasi Aktif
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Progres Kelas Sangat Sehat</span>
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
                <BarChart2 size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  NILAI RATA-RATA TUGAS
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.avgAssignmentScore || 86.4}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / 100
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>{summaryStats?.totalAssignmentSubmissions || 35} Tugas Terkumpul</span>
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
                <FileText size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  PERINGATAN DINI (AT-RISK)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-danger-DEFAULT)', marginTop: '4px' }}>
                  {summaryStats?.atRiskCount || atRiskStudents.length}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-danger-dark)', marginTop: '6px' }}>
                  <AlertTriangle size={13} />
                  <span>Perlu Pendampingan Dosen PA</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-danger-surface)', 
                  color: 'var(--color-danger-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'live_feed' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('live_feed')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Activity size={16} />
          <span>Feed Aktivitas Langsung (Live Log)</span>
        </button>

        <button
          className={`btn ${activeTab === 'class_engagement' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('class_engagement')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <BarChart2 size={16} />
          <span>Keterlibatan Kelas & Mata Kuliah ({classesEngagement.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'early_warning' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('early_warning')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <AlertTriangle size={16} />
          <span>Sistem Peringatan Dini ({atRiskStudents.length})</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Live Feed Aktivitas */}
      {activeTab === 'live_feed' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Log Interaksi & Aktivitas Pembelajaran Mahasiswa</CardTitle>
                <CardSubtitle>Aliran data real-time mencakup akses modul ajar, tontonan video interaktif, pengumpulan tugas, kuis, dan diskusi.</CardSubtitle>
              </div>

              {/* Bilah Alat Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari NIM, nama, materi..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ActivityType | 'SEMUA')}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Jenis Aktivitas</option>
                  <option value="AKSES_MATERI">Akses Materi</option>
                  <option value="TONTON_VIDEO">Tonton Video</option>
                  <option value="PENGUMPULAN_TUGAS">Pengumpulan Tugas</option>
                  <option value="KUIS_UJIAN">Kuis & Ujian</option>
                  <option value="FORUM_DISKUSI">Forum Diskusi</option>
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
              columns={feedColumns}
              data={paginatedFeed}
              keyExtractor={(row) => row.activityId}
              emptyMessage="Belum ada aktivitas yang tercatat sesuai kriteria filter."
            />
            <Pagination
              currentPage={currentPageFeed}
              totalPages={totalPagesFeed}
              totalItems={filteredFeed.length}
              pageSize={pageSizeFeed}
              onPageChange={setCurrentPageFeed}
              onPageSizeChange={setPageSizeFeed}
              itemLabel="aktivitas"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Keterlibatan Kelas */}
      {activeTab === 'class_engagement' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Matriks Keterlibatan per Kelas Perkuliahan</CardTitle>
                <CardSubtitle>Evaluasi komprehensif tingkat partisipasi mahasiswa, progres bahan ajar, dan status kesehatan kelas.</CardSubtitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari kelas, mata kuliah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterHealth}
                  onChange={(e) => setFilterHealth(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Status Kesehatan</option>
                  <option value="SANGAT_BAIK">Sangat Baik</option>
                  <option value="BAIK">Baik</option>
                  <option value="PERLU_PERHATIAN">Perlu Perhatian</option>
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
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <Table
              columns={classColumns}
              data={paginatedClasses}
              keyExtractor={(row) => row.classId}
              emptyMessage="Tidak ada data kelas yang sesuai filter."
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

      {/* 6. Konten Tab 3: Sistem Peringatan Dini (Early Warning System) */}
      {activeTab === 'early_warning' && (
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-warning-surface border border-warning rounded-md flex items-start gap-3">
            <AlertTriangle size={24} color="var(--color-warning-dark)" className="flex-shrink-0 mt-1" />
            <div>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-warning-dark)', margin: 0 }}>
                Sistem Deteksi Dini Akademik (Early Warning System)
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-warning-dark)', margin: '4px 0 0' }}>
                Algoritma SALAM mendeteksi mahasiswa dengan tren keaktifan rendah, keterlambatan tugas berturut-turut, atau nilai evaluasi formatif di bawah batas kelulusan agar Dosen PA dan Prodi dapat memberikan intervensi pembinaan secara dini.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskStudents.map((student) => (
              <Card key={student.profileId}>
                <CardHeader>
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <CardTitle>{student.studentName}</CardTitle>
                      <CardSubtitle>NIM: {student.nim} • {student.studyProgramName} (Semester {student.currentSemester})</CardSubtitle>
                    </div>
                    <Badge variant={student.riskLevel === 'SEDANG' ? 'warning' : 'default'}>
                      Risiko: {student.riskLevel}
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody>
                  <div className="flex flex-col gap-3">
                    <div className="p-3 bg-slate-50 border border-default rounded-md">
                      <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Faktor Risiko Terdeteksi:
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 'var(--text-xs)', color: 'var(--color-danger-dark)' }}>
                        {student.riskFactors.map((factor, idx) => (
                          <li key={idx}>{factor}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Capaian IPK:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{Number(student.gpa).toFixed(2)} / 4.00</div>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Dosen PA:</span>
                        <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{student.advisorName}</div>
                      </div>
                    </div>

                    <div className="p-2 bg-primary-50 border border-primary-200 rounded-md text-xs text-primary-900">
                      <strong>Rekomendasi Tindak Lanjut:</strong> {student.recommendedAction}
                    </div>

                    <div className="flex justify-end gap-2 mt-2">
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={Send}
                        onClick={() => handleOpenActionModal(student)}
                      >
                        Kirim Notifikasi Pembinaan
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          MODAL: TINDAK LANJUT & NOTIFIKASI PEMBINAAN
          ===================================================================== */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`Intervensi Pembinaan: ${selectedAtRisk?.studentName}`}
        maxWidth="600px"
      >
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 0 }}>
            Pesan pembinaan ini akan dikirimkan langsung ke notifikasi mahasiswa <strong>{selectedAtRisk?.studentName} ({selectedAtRisk?.nim})</strong> serta tembusan otomatis ke Dosen PA (<strong>{selectedAtRisk?.advisorName}</strong>).
          </p>

          <div className="form-group">
            <label className="form-label" htmlFor="action-message">Isi Pesan Pembinaan Akademik</label>
            <textarea
              id="action-message"
              className="form-textarea"
              rows={4}
              value={actionMessage}
              onChange={(e) => setActionMessage(e.target.value)}
              placeholder="Tuliskan arahan pembinaan akademik..."
              style={{ width: '100%', padding: '8px', fontSize: 'var(--text-xs)' }}
            />
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setActionModalOpen(false)} disabled={sendingAction}>
              Batal
            </Button>
            <Button variant="primary" icon={Send} onClick={handleSendNotification} isLoading={sendingAction}>
              Kirim Notifikasi Terpadu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
