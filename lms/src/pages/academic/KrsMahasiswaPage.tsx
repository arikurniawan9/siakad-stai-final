import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  User, 
  Printer, 
  MessageSquare, 
  BookOpen, 
  Layers, 
  TrendingUp, 
  Send, 
  ShieldCheck, 
  Calendar, 
  QrCode, 
  Search, 
  Check,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  StudentKrsData, 
  KrsCourseItem, 
  KrsHistoryItem, 
  KrsConsultationMessage 
} from '../../types/krs';
import { krsService } from '../../services/krsService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface KrsMahasiswaPageProps {
  onNavigateToSchedule?: () => void;
  onNavigateToClass?: (classId: string) => void;
}

type KrsTabView = 'krs_active' | 'course_catalog' | 'krs_history' | 'advisor_consultation';

export const KrsMahasiswaPage: React.FC<KrsMahasiswaPageProps> = ({
  onNavigateToSchedule,
  onNavigateToClass
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<KrsTabView>('krs_active');
  const [krsData, setKrsData] = useState<StudentKrsData | null>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return krsService.getStudentKrs(studentId);
  });
  const [catalogCourses, setCatalogCourses] = useState<KrsCourseItem[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return krsService.getCatalogCourses(studentId);
  });
  const [historyList, setHistoryList] = useState<KrsHistoryItem[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return krsService.getKrsHistory(studentId);
  });
  const [messages, setMessages] = useState<KrsConsultationMessage[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return krsService.getConsultationMessages(studentId);
  });
  const [newMessageText, setNewMessageText] = useState<string>('');
  
  // Filter & Search Catalog
  const [catalogFilter, setCatalogFilter] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination State for Catalog
  const [currentPageCatalog, setCurrentPageCatalog] = useState<number>(1);
  const [pageSizeCatalog, setPageSizeCatalog] = useState<number>(6);

  // Modals
  const [printPreviewModal, setPrintPreviewModal] = useState<boolean>(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<KrsCourseItem | null>(null);
  const [confirmSubmitModal, setConfirmSubmitModal] = useState<boolean>(false);
  const [dropCourseTarget, setDropCourseTarget] = useState<KrsCourseItem | null>(null);

  // Load Data
  const loadKrsData = useCallback(() => {
    const studentId = user?.id || 'usr-mhs-01';
    const data = krsService.getStudentKrs(studentId);
    const catalog = krsService.getCatalogCourses(studentId);
    const hist = krsService.getKrsHistory(studentId);
    const msgs = krsService.getConsultationMessages(studentId);

    setKrsData(data);
    setCatalogCourses(catalog);
    setHistoryList(hist);
    setMessages(msgs);

    krsService.markMessagesAsRead(studentId, 'MAHASISWA');
  }, [user]);

  useEffect(() => {
    loadKrsData();
  }, [loadKrsData]);

  // Auto reset page on catalog filter change
  useEffect(() => {
    setCurrentPageCatalog(1);
  }, [catalogFilter, searchQuery]);

  const hasActiveCatalogFilters = searchQuery !== '' || catalogFilter !== 'SEMUA';

  const handleResetCatalogFilters = () => {
    setSearchQuery('');
    setCatalogFilter('SEMUA');
    setCurrentPageCatalog(1);
  };

  // Filter Catalog
  const filteredCatalog = useMemo(() => {
    return catalogCourses.filter((course) => {
      const matchSearch = 
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;

      if (catalogFilter === 'SEMUA') return true;
      if (catalogFilter === 'WAJIB_PRODI') return course.courseType === 'WAJIB_PRODI';
      if (catalogFilter === 'WAJIB_INSTITUSI') return course.courseType === 'WAJIB_INSTITUSI';
      if (catalogFilter === 'PILIHAN') return course.courseType === 'PILIHAN';
      return true;
    });
  }, [catalogCourses, catalogFilter, searchQuery]);

  // Paginated Catalog
  const totalPagesCatalog = Math.ceil(filteredCatalog.length / pageSizeCatalog) || 1;
  const paginatedCatalog = useMemo(() => {
    const start = (currentPageCatalog - 1) * pageSizeCatalog;
    return filteredCatalog.slice(start, start + pageSizeCatalog);
  }, [filteredCatalog, currentPageCatalog, pageSizeCatalog]);

  // Handler: Tambah Mata Kuliah dari Katalog
  const handleAddCourse = (course: KrsCourseItem) => {
    if (!krsData) return;
    const studentId = user?.id || 'usr-mhs-01';

    const res = krsService.addCourseToKrs(studentId, course.courseId);
    if (res.success) {
      toast.success('Mata Kuliah Ditambahkan', res.message);
      loadKrsData();
    } else {
      toast.danger('Gagal Menambahkan', res.message);
    }
  };

  // Handler: Batalkan / Hapus Mata Kuliah dari KRS
  const handleConfirmDropCourse = () => {
    if (!krsData || !dropCourseTarget) return;
    const studentId = user?.id || 'usr-mhs-01';

    const res = krsService.removeCourseFromKrs(studentId, dropCourseTarget.courseId);
    if (res.success) {
      toast.success('Mata Kuliah Dibatalkan', res.message);
      setDropCourseTarget(null);
      loadKrsData();
    } else {
      toast.danger('Gagal Membatalkan', res.message);
    }
  };

  // Handler: Ajukan KRS ke Dosen PA
  const handleSubmitKrs = () => {
    if (!krsData) return;
    const studentId = user?.id || 'usr-mhs-01';

    const res = krsService.submitKrsForApproval(studentId);
    if (res.success) {
      toast.success('Pengajuan Berhasil', res.message);
      setConfirmSubmitModal(false);
      loadKrsData();
    } else {
      toast.danger('Pengajuan Gagal', res.message);
    }
  };

  // Handler: Batalkan Pengajuan KRS
  const handleCancelSubmission = () => {
    if (!krsData) return;
    const studentId = user?.id || 'usr-mhs-01';

    const res = krsService.cancelKrsSubmission(studentId);
    if (res.success) {
      toast.info('Pengajuan Dibatalkan', res.message);
      loadKrsData();
    } else {
      toast.danger('Gagal Membatalkan', res.message);
    }
  };

  // Handler: Kirim Pesan Konsultasi
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !krsData) return;

    const studentId = user?.id || 'usr-mhs-01';
    const updated = krsService.sendConsultationMessage(
      studentId,
      studentId,
      krsData.studentName,
      'MAHASISWA',
      newMessageText
    );
    setMessages(updated);
    setNewMessageText('');
    toast.success('Pesan Terkirim', 'Pesan konsultasi KRS berhasil disampaikan kepada Dosen Pembimbing Akademik.');
  };

  const handlePrintKrs = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DISETUJUI':
        return <Badge variant="success">Disetujui Dosen PA</Badge>;
      case 'MENUNGGU_PERSETUJUAN':
        return <Badge variant="warning">Menunggu Persetujuan</Badge>;
      case 'DITOLAK_REVISI':
        return <Badge variant="danger">Perlu Revisi</Badge>;
      default:
        return <Badge variant="default">Draf Pengisian</Badge>;
    }
  };

  // Konfigurasi Ekspor Resmi KRS Mahasiswa
  const krsExportConfig: ExportConfig<KrsCourseItem> = useMemo(() => ({
    filename: `SALAM_KRS_${krsData?.studentNim || 'Mahasiswa'}_Semester_${krsData?.semesterNumber || 1}`,
    title: 'KARTU RENCANA STUDI (KRS) MAHASISWA',
    subtitle: `Periode: ${krsData?.academicPeriodName || '-'} | Status: ${krsData?.krsStatus || '-'} | Dosen PA: ${krsData?.academicAdvisorName || '-'}`,
    data: krsData?.courses || [],
    columns: [
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Nama Mata Kuliah', width: '220px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'className', header: 'Kelas', width: '90px', align: 'center' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '180px' },
      { key: 'dayOfWeek', header: 'Hari Kuliah', width: '100px' },
      { key: 'startTime', header: 'Jam Mulai', width: '80px' },
      { key: 'endTime', header: 'Jam Selesai', width: '80px' },
      { key: 'roomName', header: 'Ruangan Kampus', width: '140px' }
    ],
    metadata: {
      'Nama Mahasiswa': krsData?.studentName || '-',
      'NIM': krsData?.studentNim || '-',
      'Program Studi': krsData?.studyProgram || '-',
      'Dosen Pembimbing Akademik': krsData?.academicAdvisorName || '-',
      'Total SKS Diambil': `${krsData?.totalCreditsTaken || 0} / ${krsData?.maxCreditQuota || 24} SKS Maksimal`,
      'Status Pengesahan': krsData?.krsStatus || '-',
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [krsData]);

  if (!krsData) {
    return <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Memuat data Kartu Rencana Studi...</div>;
  }

  // Conflict and check flags
  const hasScheduleConflicts = krsData.courses.some(c => !!c.scheduleConflictWith);
  const isKrsLocked = krsData.krsStatus === 'DISETUJUI';
  const isPending = krsData.krsStatus === 'MENUNGGU_PERSETUJUAN';
  const isRevision = krsData.krsStatus === 'DITOLAK_REVISI';
  const isDraft = krsData.krsStatus === 'DRAF';

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">{krsData.academicPeriodName}</Badge>
            {getStatusBadge(krsData.krsStatus)}
            <Badge variant="default">Semester {krsData.semesterNumber} (Ganjil)</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            Kartu Rencana Studi (KRS)
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Pengelolaan rencana perkuliahan, beban SKS, persetujuan Dosen Pembimbing Akademik, dan rekam kurikulum.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown 
            config={krsExportConfig} 
            buttonLabel="Ekspor Lembar KRS" 
          />
          <Button 
            variant="primary" 
            size="sm" 
            icon={Printer}
            onClick={() => setPrintPreviewModal(true)}
            title="Cetak Lembar KRS Resmi STAI AL-ITTIHAD"
          >
            Cetak Lembar KRS Resmi
          </Button>

          {onNavigateToSchedule && (
            <Button 
              variant="outline" 
              size="sm" 
              icon={Calendar}
              onClick={onNavigateToSchedule}
              title="Buka Jadwal Perkuliahan Mahasiswa"
            >
              Lihat Jadwal Kuliah
            </Button>
          )}
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKS Diambil */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SKS DIAMBIL
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {krsData.totalCreditsTaken}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / {krsData.maxCreditQuota} Maks.
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <BookOpen size={13} />
                  <span>{krsData.courses.length} Mata Kuliah Terdaftar</span>
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
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Layers size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Batas Kuota SKS & IPS Lalu */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  BATAS BEBAN SKS
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {krsData.maxCreditQuota} SKS
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    (Sisa {Math.max(0, krsData.maxCreditQuota - krsData.totalCreditsTaken)} SKS)
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <TrendingUp size={13} />
                  <span>Berdasarkan IPS Lalu: {krsData.previousSemesterGpa.toFixed(2)}</span>
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
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <TrendingUp size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* SKS Kumulatif Lulus */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  SKS KUMULATIF LULUS
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {krsData.totalCumulativeCreditsEarned} SKS
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / 144 SKS
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>IPK Berjalan: {krsData.cumulativeGpa.toFixed(2)}</span>
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
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <ShieldCheck size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Dosen Pembimbing Akademik */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DOSEN PEMBIMBING (PA)
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {krsData.academicAdvisorName}
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: isKrsLocked ? 'var(--color-success-dark)' : 'var(--text-muted)', marginTop: '6px' }}>
                  {isKrsLocked ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                  <span>{isKrsLocked ? 'KRS Telah Disahkan' : isPending ? 'Menunggu Pengesahan' : isRevision ? 'Perlu Perbaikan' : 'Draf Pengisian'}</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: isKrsLocked ? 'var(--color-success-surface)' : 'var(--color-primary-50)', 
                  color: isKrsLocked ? 'var(--color-success-dark)' : 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'krs_active' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('krs_active')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <FileText size={16} />
          <span>KRS Semester Berjalan ({krsData.totalCreditsTaken} SKS)</span>
        </button>

        <button
          className={`btn ${activeTab === 'course_catalog' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('course_catalog')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <BookOpen size={16} />
          <span>Katalog Mata Kuliah &amp; Tambah MK ({catalogCourses.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'krs_history' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('krs_history')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <Clock size={16} />
          <span>Riwayat KRS &amp; SKS Kumulatif ({historyList.length} Semester)</span>
        </button>

        <button
          className={`btn ${activeTab === 'advisor_consultation' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('advisor_consultation')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <MessageSquare size={16} />
          <span>Bimbingan Akademik Dosen PA</span>
        </button>
      </div>

      {/* 4. Tab 1: KRS Semester Berjalan */}
      {activeTab === 'krs_active' && (
        <div className="flex flex-col gap-6">
          {/* Status Alert Banners */}
          {isKrsLocked && (
            <div 
              style={{ 
                padding: 'var(--space-4) var(--space-5)', 
                backgroundColor: 'var(--color-success-bg)', 
                border: '1px solid var(--color-success-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}
            >
              <div className="flex items-center gap-2" style={{ color: 'var(--color-success-text)', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                <CheckCircle2 size={18} />
                <span>Kartu Rencana Studi Telah Diverifikasi &amp; Disahkan Dosen Pembimbing Akademik</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-text)', lineHeight: 1.5, margin: 0 }}>
                <strong>Catatan Dosen PA ({krsData.academicAdvisorName}):</strong> "{krsData.academicAdvisorNotes || 'KRS telah diverifikasi dan disetujui sesuai kurikulum.'}"
              </p>
            </div>
          )}

          {isPending && (
            <div 
              style={{ 
                padding: 'var(--space-4) var(--space-5)', 
                backgroundColor: 'var(--color-warning-surface, #fffbeb)', 
                border: '1px solid var(--color-warning-border, #fef08a)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}
            >
              <div>
                <div className="flex items-center gap-2" style={{ color: '#854d0e', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                  <Clock size={18} />
                  <span>KRS Sedang Menunggu Verifikasi &amp; Pengesahan Dosen Pembimbing Akademik</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: '#854d0e', margin: '4px 0 0 0' }}>
                  Diajukan pada {krsData.submissionDate ? new Date(krsData.submissionDate).toLocaleString('id-ID') : '-'}. Anda dapat membatalkan pengajuan jika ingin mengubah mata kuliah.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSubmission}
              >
                Batalkan Pengajuan (Edit KRS)
              </Button>
            </div>
          )}

          {isRevision && (
            <div 
              style={{ 
                padding: 'var(--space-4) var(--space-5)', 
                backgroundColor: 'var(--color-danger-surface, #fef2f2)', 
                border: '1px solid var(--color-danger-border, #fecaca)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}
            >
              <div className="flex items-center gap-2" style={{ color: '#991b1b', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                <AlertCircle size={18} />
                <span>KRS Perlu Revisi / Perbaikan Sesuai Arahan Dosen PA</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: '#991b1b', lineHeight: 1.5, margin: 0 }}>
                <strong>Catatan Revisi Dosen PA:</strong> "{krsData.academicAdvisorNotes || 'Harap perbaiki pemilihan mata kuliah dan sesuaikan beban SKS.'}"
              </p>
              <div className="flex gap-2" style={{ marginTop: '4px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setActiveTab('course_catalog')}
                >
                  Buka Katalog &amp; Sesuaikan Mata Kuliah
                </Button>
              </div>
            </div>
          )}

          {hasScheduleConflicts && (
            <div 
              style={{ 
                padding: 'var(--space-4) var(--space-5)', 
                backgroundColor: '#fff1f2', 
                border: '1px solid #fda4af',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)'
              }}
            >
              <div className="flex items-center gap-2" style={{ color: '#9f1239', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                <AlertTriangle size={18} />
                <span>Peringatan Deteksi Bentrok Jadwal Kuliah!</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: '#9f1239', margin: 0 }}>
                Terdapat mata kuliah yang memiliki jadwal kuliah pada hari dan jam yang bersamaan. Anda harus membatalkan salah satu mata kuliah yang bentrok sebelum dapat mengajukan KRS ke Dosen PA.
              </p>
            </div>
          )}

          {/* Table of Enrolled Courses */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full flex-wrap gap-2">
                <div>
                  <CardTitle>Daftar Mata Kuliah Terdaftar</CardTitle>
                  <CardSubtitle>Program Studi {krsData.studyProgram} • Semester Ganjil 2026/2027</CardSubtitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="primary">{krsData.courses.length} Mata Kuliah • {krsData.totalCreditsTaken} SKS</Badge>
                  {!isKrsLocked && !isPending && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setActiveTab('course_catalog')}
                    >
                      Tambah Mata Kuliah
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardBody style={{ padding: 0 }}>
              <div className="table-container" style={{ border: 'none', margin: 0 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                      <th style={{ width: '100px' }}>Kode MK</th>
                      <th>Nama Mata Kuliah</th>
                      <th style={{ width: '65px', textAlign: 'center' }}>SKS</th>
                      <th style={{ width: '85px', textAlign: 'center' }}>Kelas</th>
                      <th>Jadwal &amp; Ruangan</th>
                      <th>Dosen Pengampu</th>
                      <th style={{ width: '140px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {krsData.courses.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                          <BookOpen size={32} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                          <div>Belum ada mata kuliah yang dipilih untuk KRS semester ini.</div>
                          <Button
                            variant="primary"
                            size="sm"
                            style={{ marginTop: '12px' }}
                            onClick={() => setActiveTab('course_catalog')}
                          >
                            Pilih Mata Kuliah dari Katalog
                          </Button>
                        </td>
                      </tr>
                    ) : (
                      krsData.courses.map((c, idx) => {
                        const isConflict = !!c.scheduleConflictWith;

                        return (
                          <tr key={c.id} style={{ backgroundColor: isConflict ? '#fff1f2' : undefined }}>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{idx + 1}</td>
                            <td>
                              <Badge variant={isConflict ? 'danger' : 'primary'} style={{ fontFamily: 'var(--font-mono)' }}>
                                {c.courseCode}
                              </Badge>
                            </td>
                            <td>
                              <strong style={{ color: 'var(--text-primary)' }}>{c.courseName}</strong>
                              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                                {c.courseType === 'WAJIB_PRODI' ? 'Wajib Program Studi' : c.courseType === 'WAJIB_INSTITUSI' ? 'Wajib Institusi' : 'Pilihan'}
                              </div>
                              {isConflict && (
                                <div style={{ fontSize: '0.6875rem', color: '#be123c', fontWeight: 'bold', marginTop: '2px' }}>
                                  ⚠️ Bentrok dengan: {c.scheduleConflictWith}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{c.credits}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'semibold', padding: '2px 6px', backgroundColor: 'var(--color-slate-100)', borderRadius: '4px' }}>
                                {c.className}
                              </span>
                            </td>
                            <td style={{ fontSize: 'var(--text-xs)' }}>
                              <div><strong>{c.dayOfWeek}</strong>, {c.startTime} - {c.endTime} WIB</div>
                              <div style={{ color: 'var(--text-muted)' }}>{c.roomName}</div>
                            </td>
                            <td style={{ fontSize: 'var(--text-xs)' }}>
                              <div><strong>{c.lecturerName}</strong></div>
                              <div style={{ color: 'var(--text-muted)' }}>NIDN: {c.lecturerNidn}</div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div className="flex items-center justify-center gap-1">
                                {onNavigateToClass && isKrsLocked && (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onNavigateToClass(c.classId)}
                                    style={{ minHeight: '28px', padding: '2px 8px', fontSize: '0.6875rem' }}
                                  >
                                    LMS
                                  </Button>
                                )}

                                {!isKrsLocked && !isPending && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Trash2}
                                    onClick={() => setDropCourseTarget(c)}
                                    title="Batalkan Mata Kuliah Ini"
                                    style={{ minHeight: '28px', padding: '2px 6px', color: 'var(--color-danger)' }}
                                  >
                                    Batal
                                  </Button>
                                )}

                                {isKrsLocked && !onNavigateToClass && (
                                  <Badge variant="success">Tervalidasi</Badge>
                                )}

                                {isPending && (
                                  <Badge variant="warning">Terkunci Review</Badge>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: 'var(--color-slate-50)', fontWeight: 'bold', borderTop: '2px solid var(--border-default)' }}>
                      <td colSpan={3} style={{ textAlign: 'right', padding: 'var(--space-3) var(--space-4)' }}>
                        Total Beban Studi Semester Ini:
                      </td>
                      <td style={{ textAlign: 'center', padding: 'var(--space-3) var(--space-4)', color: 'var(--color-primary-800)', fontSize: 'var(--text-base)' }}>
                        {krsData.totalCreditsTaken} SKS
                      </td>
                      <td colSpan={4} style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                        Batas Maksimum Kuota: {krsData.maxCreditQuota} SKS (Sisa kuota: {Math.max(0, krsData.maxCreditQuota - krsData.totalCreditsTaken)} SKS)
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Submission Action Bar for Draf / Revisi */}
          {(isDraft || isRevision) && (
            <Card style={{ backgroundColor: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)' }}>
              <CardBody>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--color-primary-950)', margin: 0 }}>
                      Pengajuan Kartu Rencana Studi ke Dosen Pembimbing Akademik
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', margin: '4px 0 0 0' }}>
                      Pastikan seluruh mata kuliah ({krsData.totalCreditsTaken} SKS) telah sesuai rencana studi dan tidak bentrok jadwal sebelum mengajukan.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Send}
                    disabled={krsData.courses.length === 0 || hasScheduleConflicts || krsData.totalCreditsTaken > krsData.maxCreditQuota}
                    onClick={() => setConfirmSubmitModal(true)}
                  >
                    Ajukan KRS ke Dosen PA
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* 5. Tab 2: Katalog & Tambah Mata Kuliah */}
      {activeTab === 'course_catalog' && (
        <div className="flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
              {['SEMUA', 'WAJIB_PRODI', 'WAJIB_INSTITUSI', 'PILIHAN'].map((f) => (
                <button
                  key={f}
                  onClick={() => setCatalogFilter(f)}
                  className={`btn btn-sm ${catalogFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: 'var(--radius-full)', minHeight: '30px', padding: '3px 12px', fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}
                >
                  {f === 'SEMUA' ? 'Semua Kategori' : f === 'WAJIB_PRODI' ? 'Wajib Prodi PAI' : f === 'WAJIB_INSTITUSI' ? 'Wajib Institusi' : 'Mata Kuliah Pilihan'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2" style={{ width: '100%', maxWidth: '360px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Input 
                  placeholder="Cari kode / nama MK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px', minHeight: '34px', fontSize: 'var(--text-xs)' }}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              </div>

              {hasActiveCatalogFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetCatalogFilters}
                  title="Reset Semua Filter"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedCatalog.map((course) => {
              const isEnrolled = krsData.courses.some((c) => c.courseCode === course.courseCode);
              const wouldExceedQuota = !isEnrolled && (krsData.totalCreditsTaken + course.credits > krsData.maxCreditQuota);

              return (
                <Card key={course.id} style={{ border: isEnrolled ? '1.5px solid var(--color-primary-300)' : '1px solid var(--border-default)' }}>
                  <CardHeader style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: isEnrolled ? 'var(--color-primary-50)' : 'var(--color-slate-50)' }}>
                    <div className="flex justify-between items-center w-full">
                      <Badge variant="primary" style={{ fontFamily: 'var(--font-mono)' }}>{course.courseCode}</Badge>
                      <Badge variant={course.courseType === 'WAJIB_PRODI' ? 'default' : course.courseType === 'WAJIB_INSTITUSI' ? 'info' : 'warning'}>
                        {course.courseType === 'WAJIB_PRODI' ? 'Wajib Prodi' : course.courseType === 'WAJIB_INSTITUSI' ? 'Wajib Institusi' : 'Pilihan'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardBody style={{ padding: 'var(--space-4)' }} className="flex flex-col gap-2">
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                      {course.courseName}
                    </strong>

                    <div className="flex items-center justify-between text-xs" style={{ marginTop: '2px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Bobot SKS:</span>
                      <strong style={{ color: 'var(--color-primary-900)' }}>{course.credits} SKS</strong>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Jadwal Kuliah:</span>
                      <span>{course.dayOfWeek}, {course.startTime} - {course.endTime}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Ruangan:</span>
                      <span>{course.roomName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: 'var(--text-muted)' }}>Dosen Pengampu:</span>
                      <span style={{ fontWeight: 'bold' }}>{course.lecturerName}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs" style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Kapasitas Kelas:</span>
                      <span>{course.enrolledCount} / {course.quota} Mahasiswa</span>
                    </div>

                    {/* Action Button */}
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      {isEnrolled ? (
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-success-dark)', padding: '6px', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', flex: 1 }}>
                            <Check size={14} /> Terdaftar ({course.credits} SKS)
                          </div>
                          {!isKrsLocked && !isPending && (
                            <Button
                              variant="danger"
                              size="sm"
                              icon={Trash2}
                              onClick={() => setDropCourseTarget(course)}
                              title="Batalkan dari KRS"
                              style={{ minHeight: '30px', padding: '4px 8px' }}
                            >
                              Batal
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            style={{ flex: 1 }}
                            onClick={() => setSelectedCourseDetail(course)}
                          >
                            Silabus
                          </Button>

                          {!isKrsLocked && !isPending && (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Plus}
                              style={{ flex: 1.5 }}
                              disabled={wouldExceedQuota || !course.prerequisiteMet}
                              onClick={() => handleAddCourse(course)}
                              title={wouldExceedQuota ? 'Melebihi batas kuota SKS' : !course.prerequisiteMet ? 'Belum memenuhi prasyarat' : 'Ambil Mata Kuliah'}
                            >
                              {wouldExceedQuota ? 'Kuota Penuh' : 'Ambil MK'}
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPageCatalog}
                totalPages={totalPagesCatalog}
                totalItems={filteredCatalog.length}
                pageSize={pageSizeCatalog}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPageCatalog}
                onPageSizeChange={setPageSizeCatalog}
                itemLabel="mata kuliah"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* 6. Tab 3: Riwayat KRS & Progres Kumulatif */}
      {activeTab === 'krs_history' && (
        <div className="flex flex-col gap-6">
          {/* Progress Bar SKS Kumulatif */}
          <Card>
            <CardBody style={{ padding: 'var(--space-5)' }}>
              <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginBottom: '8px' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                    Capaian Kelulusan SKS Kumulatif Mahasiswa
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Target Kelulusan Program Studi Sarjana (S-1) Pendidikan Agama Islam: 144 SKS
                  </p>
                </div>
                <strong style={{ fontSize: 'var(--text-lg)', color: 'var(--color-primary-800)' }}>
                  {krsData.totalCumulativeCreditsEarned} / 144 SKS ({((krsData.totalCumulativeCreditsEarned / 144) * 100).toFixed(1)}%)
                </strong>
              </div>

              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${Math.min(100, (krsData.totalCumulativeCreditsEarned / 144) * 100)}%`, 
                    height: '100%', 
                    backgroundColor: 'var(--color-primary-600)', 
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease'
                  }} 
                />
              </div>
            </CardBody>
          </Card>

          {/* History List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyList.map((hist) => (
              <Card key={hist.id}>
                <CardHeader style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div className="flex justify-between items-center w-full">
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      Semester {hist.semesterNumber} ({hist.academicPeriodName})
                    </strong>
                    <Badge variant="success">Lulus Disahkan</Badge>
                  </div>
                </CardHeader>
                <CardBody style={{ padding: 'var(--space-4)' }} className="flex flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 text-center" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Beban SKS</div>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{hist.totalCredits} SKS</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>IPS Semester</div>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-800)' }}>{hist.semesterGpa.toFixed(2)}</strong>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>IPK Kumulatif</div>
                      <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-800)' }}>{hist.cumulativeGpa.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted" style={{ marginTop: 'var(--space-1)' }}>
                    <span>Disahkan oleh: <strong>{hist.advisorName}</strong></span>
                    <span>Tgl: {new Date(hist.approvedDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 7. Tab 4: Bimbingan & Konsultasi Akademik */}
      {activeTab === 'advisor_consultation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Advisor Profile */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Dosen Pembimbing Akademik</CardTitle>
                <CardSubtitle>Dosen Wali Program Studi PAI</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div 
                  style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: 'var(--radius-full)', 
                    backgroundColor: 'var(--color-primary-100)', 
                    color: 'var(--color-primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 'var(--text-lg)'
                  }}
                >
                  R
                </div>
                <div>
                  <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {krsData.academicAdvisorName}
                  </strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    NIDN: {krsData.academicAdvisorNidn}
                  </div>
                  <Badge variant="primary" style={{ marginTop: '4px' }}>Dosen Wali Aktif</Badge>
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Jadwal Konsultasi Tatap Muka:</strong>
                <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Senin &amp; Kamis: 10:30 - 12:00 WIB<br />
                  Ruang Dosen Tarbiyah Lt. 2 (Gedung A)
                </div>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                <strong style={{ color: 'var(--color-primary-950)' }}>Status Terakhir Pengesahan:</strong>
                <div style={{ marginTop: '4px' }}>
                  {getStatusBadge(krsData.krsStatus)}
                </div>
                {krsData.academicAdvisorNotes && (
                  <div style={{ marginTop: '6px', color: 'var(--color-primary-900)' }}>
                    "{krsData.academicAdvisorNotes}"
                  </div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Right: Message Timeline & Form */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Riwayat Bimbingan Kartu Rencana Studi</CardTitle>
                  <CardSubtitle>Komunikasi dan catatan akademik interaktif antara Mahasiswa dan Dosen PA</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4">
                {/* Messages List */}
                <div className="flex flex-col gap-3" style={{ maxHeight: '360px', overflowY: 'auto' }}>
                  {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      Belum ada percakapan konsultasi bimbingan. Tulis pesan di bawah untuk menghubungi Dosen PA.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderRole === 'MAHASISWA';

                      return (
                        <div 
                          key={m.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            padding: 'var(--space-3) var(--space-4)',
                            borderRadius: 'var(--radius-lg)',
                            backgroundColor: isMe ? 'var(--color-primary-50)' : 'var(--color-slate-100)',
                            border: isMe ? '1px solid var(--color-primary-200)' : '1px solid var(--border-default)'
                          }}
                        >
                          <div className="flex justify-between items-center gap-3" style={{ marginBottom: '4px' }}>
                            <strong style={{ fontSize: 'var(--text-xs)', color: isMe ? 'var(--color-primary-900)' : 'var(--text-primary)' }}>
                              {m.senderName} ({isMe ? 'Mahasiswa' : 'Dosen PA'})
                            </strong>
                            <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                              {new Date(m.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                          </div>
                          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                            {m.message}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Send Message Form */}
                <form onSubmit={handleSendMessage} className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
                  <Input
                    placeholder="Tulis pesan konsultasi kepada Dosen PA..."
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={Send}
                    disabled={!newMessageText.trim()}
                  >
                    Kirim
                  </Button>
                </form>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CETAK LEMBAR KRS RESMI MAHASISWA
          ========================================================================= */}
      {printPreviewModal && (
        <Modal
          isOpen={printPreviewModal}
          onClose={() => setPrintPreviewModal(false)}
          title="Pratinjau Lembar Kartu Rencana Studi Resmi"
          maxWidth="840px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setPrintPreviewModal(false)}
              >
                Tutup
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={Printer}
                onClick={handlePrintKrs}
              >
                Cetak Lembar KRS (Print / PDF)
              </Button>
            </div>
          }
        >
          {/* Printable Official Document */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: 'var(--space-6)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-default)',
              fontFamily: 'serif' 
            }}
          >
            {/* Kop Surat STAI AL-ITTIHAD */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                Jl. Raya Bandung KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat 43281
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Website: https://stai-alittihad.ac.id • Email: akademik@stai-alittihad.ac.id
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration: 'underline' }}>
                KARTU RENCANA STUDI (KRS)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                SEMESTER GANJIL TAHUN AKADEMIK 2026/2027
              </div>
            </div>

            {/* Student Info Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>
              <div>
                <div><strong>Nama Mahasiswa:</strong> {krsData.studentName}</div>
                <div><strong>NIM:</strong> {krsData.studentNim}</div>
                <div><strong>Program Studi:</strong> {krsData.studyProgram}</div>
                <div><strong>Jenjang:</strong> {krsData.academicDegree}</div>
              </div>
              <div>
                <div><strong>Semester / Kelas:</strong> {krsData.semesterNumber} (Ganjil) / Kelas A</div>
                <div><strong>IPS Semester Lalu:</strong> {krsData.previousSemesterGpa.toFixed(2)}</div>
                <div><strong>Maksimum Beban SKS:</strong> {krsData.maxCreditQuota} SKS</div>
                <div><strong>Dosen Wali (PA):</strong> {krsData.academicAdvisorName}</div>
              </div>
            </div>

            {/* Table of Enrolled Courses */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem', marginBottom: 'var(--space-6)' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a', borderTop: '1px solid #0f172a' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Kode MK</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Nama Mata Kuliah</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>SKS</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>Kelas</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Hari &amp; Jam</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Dosen Pengampu</th>
                </tr>
              </thead>
              <tbody>
                {krsData.courses.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 8px' }}><strong>{s.courseCode}</strong></td>
                    <td style={{ padding: '6px 8px' }}>{s.courseName}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{s.credits}</td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{s.className}</td>
                    <td style={{ padding: '6px 8px' }}>{s.dayOfWeek}, {s.startTime}-{s.endTime}</td>
                    <td style={{ padding: '6px 8px' }}>{s.lecturerName}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
                  <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>Total Beban Studi:</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>{krsData.totalCreditsTaken} SKS</td>
                  <td colSpan={3} style={{ padding: '6px 8px' }}>{krsData.courses.length} Mata Kuliah</td>
                </tr>
              </tfoot>
            </table>

            {/* Signature & QR Code */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.6875rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div>Mengetahui,</div>
                <div>Mahasiswa Bersangkutan,</div>
                <div style={{ height: '40px' }} />
                <strong>{krsData.studentName}</strong>
                <div>NIM: {krsData.studentNim}</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <QrCode size={48} color="#0f172a" style={{ margin: '0 auto 4px auto' }} />
                <div style={{ color: '#64748b', fontSize: '0.625rem' }}>
                  Status: <strong>{krsData.krsStatus}</strong><br />
                  Tgl Cetak: {new Date().toLocaleDateString('id-ID')}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div>Cianjur, {krsData.approvedDate ? new Date(krsData.approvedDate).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}</div>
                <div>Dosen Pembimbing Akademik,</div>
                <div style={{ height: '40px' }} />
                <strong>{krsData.academicAdvisorName}</strong>
                <div>NIDN: {krsData.academicAdvisorNidn}</div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: RINCIAN SILABUS MATA KULIAH KATALOG
          ========================================================================= */}
      {selectedCourseDetail && (
        <Modal
          isOpen={Boolean(selectedCourseDetail)}
          onClose={() => setSelectedCourseDetail(null)}
          title={`Silabus Mata Kuliah: ${selectedCourseDetail.courseName}`}
          maxWidth="600px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedCourseDetail(null)}
              >
                Tutup
              </Button>
              {!krsData.courses.some(c => c.courseCode === selectedCourseDetail.courseCode) && !isKrsLocked && !isPending && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    handleAddCourse(selectedCourseDetail);
                    setSelectedCourseDetail(null);
                  }}
                >
                  Ambil Mata Kuliah Ini
                </Button>
              )}
            </div>
          }
        >
          <div className="flex flex-col gap-3 text-xs">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-950)' }}>
                [{selectedCourseDetail.courseCode}] {selectedCourseDetail.courseName}
              </strong>
              <div style={{ color: 'var(--color-primary-800)', marginTop: '2px' }}>
                Bobot: {selectedCourseDetail.credits} SKS • Kelas: {selectedCourseDetail.className} • Ruang: {selectedCourseDetail.roomName}
              </div>
            </div>

            <div>
              <strong>Dosen Pengampu:</strong>
              <div>{selectedCourseDetail.lecturerName} (NIDN: {selectedCourseDetail.lecturerNidn})</div>
            </div>

            <div>
              <strong>Jadwal Kuliah:</strong>
              <div>Setiap hari {selectedCourseDetail.dayOfWeek}, pukul {selectedCourseDetail.startTime} - {selectedCourseDetail.endTime} WIB</div>
            </div>

            <div>
              <strong>Prasyarat Mata Kuliah:</strong>
              <div>{selectedCourseDetail.prerequisiteInfo || 'Telah menempuh mata kuliah dasar keilmuan Islam semester 1-4.'}</div>
            </div>

            <div>
              <strong>Kapasitas Kelas:</strong>
              <div>{selectedCourseDetail.enrolledCount} / {selectedCourseDetail.quota} Mahasiswa Terdaftar</div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 3: KONFIRMASI PENGAJUAN KRS KE DOSEN PA
          ========================================================================= */}
      {confirmSubmitModal && (
        <Modal
          isOpen={confirmSubmitModal}
          onClose={() => setConfirmSubmitModal(false)}
          title="Konfirmasi Pengajuan Rencana Studi (KRS)"
          maxWidth="520px"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setConfirmSubmitModal(false)}
              >
                Batal
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={Send}
                onClick={handleSubmitKrs}
              >
                Ya, Ajukan Sekarang
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-3 text-xs">
            <p style={{ margin: 0 }}>
              Apakah Anda yakin ingin mengajukan Kartu Rencana Studi (KRS) Semester {krsData.semesterNumber} ini kepada Dosen Pembimbing Akademik <strong>{krsData.academicAdvisorName}</strong>?
            </p>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div><strong>Jumlah Mata Kuliah:</strong> {krsData.courses.length} MK</div>
              <div><strong>Total Beban Studi:</strong> {krsData.totalCreditsTaken} / {krsData.maxCreditQuota} SKS Maksimal</div>
            </div>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>
              Setelah diajukan, status KRS akan menjadi <em>Menunggu Persetujuan</em> dan Anda dapat berkonsultasi langsung melalui tab Bimbingan Dosen PA.
            </p>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 4: KONFIRMASI BATALKAN / DROP MATA KULIAH
          ========================================================================= */}
      {dropCourseTarget && (
        <Modal
          isOpen={Boolean(dropCourseTarget)}
          onClose={() => setDropCourseTarget(null)}
          title="Konfirmasi Pembatalan Mata Kuliah"
          maxWidth="460px"
          footer={
            <div className="flex justify-end gap-2 w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setDropCourseTarget(null)}
              >
                Batal
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                icon={Trash2}
                onClick={handleConfirmDropCourse}
              >
                Hapus dari KRS
              </Button>
            </div>
          }
        >
          <div className="text-xs">
            Apakah Anda yakin ingin membatalkan mata kuliah <strong>{dropCourseTarget.courseName} ({dropCourseTarget.credits} SKS)</strong> dari rencana studi Anda?
          </div>
        </Modal>
      )}
    </div>
  );
};
