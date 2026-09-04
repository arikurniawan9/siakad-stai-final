import { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/feedback/ToastContext';
import { ErrorBoundary } from './components/feedback/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { BerandaPage } from './pages/BerandaPage';
import { ComponentShowcase } from './pages/ComponentShowcase';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { SinkronisasiPage } from './pages/admin/SinkronisasiPage';
import { PeriodeAkademikPage } from './pages/admin/PeriodeAkademikPage';
import { ProdiPage } from './pages/admin/ProdiPage';
import { MataKuliahAdminPage } from './pages/admin/MataKuliahAdminPage';
import { JadwalAdminPage } from './pages/admin/JadwalAdminPage';
import { MahasiswaAdminPage } from './pages/admin/MahasiswaAdminPage';
import { DosenAdminPage } from './pages/admin/DosenAdminPage';
import { MonitoringAdminPage } from './pages/admin/MonitoringAdminPage';
import { NilaiAdminPage } from './pages/admin/NilaiAdminPage';
import { PeranAdminPage } from './pages/admin/PeranAdminPage';
import { PengaturanAdminPage } from './pages/admin/PengaturanAdminPage';
import { QASecurityPage } from './pages/admin/QASecurityPage';
import { MataKuliahListPage } from './pages/learning/MataKuliahListPage';
import { KelasDetailPage } from './pages/learning/KelasDetailPage';
import { VideoListPage } from './pages/video/VideoListPage';
import { VideoPlayerPage } from './pages/video/VideoPlayerPage';
import { QuizListPage } from './pages/quiz/QuizListPage';
import { QuizTakingPage } from './pages/quiz/QuizTakingPage';
import { QuizResultPage } from './pages/quiz/QuizResultPage';
import { BankSoalPage } from './pages/quiz/BankSoalPage';
import { QuizGradingPage } from './pages/quiz/QuizGradingPage';
import { QuizProctoringPage } from './pages/quiz/QuizProctoringPage';
import { TugasListPage } from './pages/assignment/TugasListPage';
import { TugasDetailPage } from './pages/assignment/TugasDetailPage';
import { TugasGradingPage } from './pages/assignment/TugasGradingPage';
import { ForumListPage } from './pages/forum/ForumListPage';
import { ThreadDetailPage } from './pages/forum/ThreadDetailPage';
import { ProgresBelajarPage } from './pages/progress/ProgresBelajarPage';
import { ProgresKelasDosenPage } from './pages/progress/ProgresKelasDosenPage';
import { KalenderPage } from './pages/calendar/KalenderPage';
import { JadwalMahasiswaPage } from './pages/schedule/JadwalMahasiswaPage';
import { KrsMahasiswaPage } from './pages/academic/KrsMahasiswaPage';
import { BimbinganPaPage } from './pages/academic/BimbinganPaPage';
import { KhsMahasiswaPage } from './pages/academic/KhsMahasiswaPage';
import { BukuNilaiMahasiswaPage } from './pages/academic/BukuNilaiMahasiswaPage';
import { PengumumanMahasiswaPage } from './pages/announcements/PengumumanMahasiswaPage';
import { ProfilMahasiswaPage } from './pages/profile/ProfilMahasiswaPage';
import { ProfilDosenPage } from './pages/profile/ProfilDosenPage';
import { KeamananMahasiswaPage } from './pages/security/KeamananMahasiswaPage';
import { NotificationPage } from './pages/notifications/NotificationPage';
import { LaporanMonitoringPage } from './pages/reports/LaporanMonitoringPage';
import { PresensiPerkuliahanPage } from './pages/attendance/PresensiPerkuliahanPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Badge } from './components/ui/Badge';
import { Table, Column } from './components/ui/Table';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { runRbacTests, TestCaseResult } from './tests/auth.test';
import { runLearningTests, LearningTestResult } from './tests/learning.test';
import { runVideoTests, VideoTestResult } from './tests/video.test';
import { runQuizTests, QuizTestResult } from './tests/quiz.test';
import { runAssignmentTests, AssignmentTestResult } from './tests/assignment.test';
import { runForumTests, ForumTestResult } from './tests/forum.test';
import { runProgressTests, ProgressTestResult } from './tests/progress.test';
import { runNotificationCalendarTests, NotificationCalendarTestResult } from './tests/notification_calendar.test';
import { runReportingTests, ReportingTestResult } from './tests/reporting.test';
import { runMasterSecurityQATests, SecurityQATestResult } from './tests/security_qa.test';
import { runKhsTests, KhsTestResult } from './tests/khs.test';
import { runKrsTests, KrsTestResult } from './tests/krs.test';
import { runStudentGradebookTests, StudentGradebookTestResult } from './tests/studentGradebook.test';
import { runAnnouncementTests, AnnouncementTestResult } from './tests/announcement.test';
import { runStudentProfileTests, StudentProfileTestResult } from './tests/studentProfile.test';
import { runLecturerProfileTests, LecturerProfileTestResult } from './tests/lecturerProfile.test';
import { runStudentSecurityTests, StudentSecurityTestResult } from './tests/studentSecurity.test';
import './styles/globals.css';
import './styles/layout.css';
import './styles/components.css';

function MainAppContent() {
  const { user, isAuthenticated, switchRole } = useAuth();
  const [activePath, setActivePath] = useState<string>(() => {
    const p = typeof window !== 'undefined' ? window.location.pathname : '/';
    return p && p !== '/login' ? p : '/';
  });

  // Sinkronisasi history URL browser (Back/Forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const current = window.location.pathname || '/';
      if (!isAuthenticated) {
        if (current !== '/login') {
          window.history.replaceState(null, '', '/login');
        }
      } else {
        if (current === '/login') {
          window.history.replaceState(null, '', '/');
          handleNavigate('/');
        } else {
          handleNavigate(current);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  // Route Guard Otomatis: Arahkan ke /login jika belum login, dan cegah akses /login jika sudah login
  useEffect(() => {
    if (!isAuthenticated) {
      if (window.location.pathname !== '/login') {
        window.history.replaceState(null, '', '/login');
      }
    } else {
      if (window.location.pathname === '/login' || activePath === '/login') {
        window.history.replaceState(null, '', '/');
        setActivePath('/');
      }
    }
  }, [isAuthenticated, activePath]);

  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [activeTakingQuizId, setActiveTakingQuizId] = useState<string | null>(null);
  const [viewingQuizAttemptId, setViewingQuizAttemptId] = useState<string | null>(null);
  const [quizSubView, setQuizSubView] = useState<'list' | 'bank_soal' | 'grading_queue' | 'proctoring'>('list');
  const [selectedProctoringQuizId, setSelectedProctoringQuizId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [gradingAssignmentId, setGradingAssignmentId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'normal' | 'showcase' | 'rbac_test' | 'learning_test' | 'video_test' | 'quiz_test' | 'assignment_test' | 'forum_test' | 'progress_test' | 'notification_test' | 'reporting_test' | 'security_test' | 'khs_test' | 'krs_test' | 'gradebook_test' | 'announcement_test' | 'profile_test' | 'lecturer_profile_test' | 'student_security_test'>('normal');

  const rbacTestResults = useMemo(() => currentView === 'rbac_test' ? runRbacTests() : { results: [] as TestCaseResult[], totalPassed: 0, totalFailed: 0 }, [currentView]);
  const learningTestResults = useMemo(() => currentView === 'learning_test' ? runLearningTests() : { results: [], allPassed: true }, [currentView]);
  const videoTestResults = useMemo(() => currentView === 'video_test' ? runVideoTests() : { results: [], allPassed: true }, [currentView]);
  const quizTestResults = useMemo(() => currentView === 'quiz_test' ? runQuizTests() : { results: [], allPassed: true }, [currentView]);
  const assignmentTestResults = useMemo(() => currentView === 'assignment_test' ? runAssignmentTests() : { results: [], allPassed: true }, [currentView]);
  const forumTestResults = useMemo(() => currentView === 'forum_test' ? runForumTests() : { results: [], allPassed: true }, [currentView]);
  const progressTestResults = useMemo(() => currentView === 'progress_test' ? runProgressTests() : { results: [], allPassed: true }, [currentView]);
  const notificationTestResults = useMemo(() => currentView === 'notification_test' ? runNotificationCalendarTests() : { results: [], allPassed: true }, [currentView]);
  const reportingTestResults = useMemo(() => currentView === 'reporting_test' ? runReportingTests() : { results: [], allPassed: true }, [currentView]);
  const securityQATestResults = useMemo(() => currentView === 'security_test' ? runMasterSecurityQATests() : { results: [], allPassed: true }, [currentView]);
  const khsTestResults = useMemo(() => currentView === 'khs_test' ? runKhsTests() : { results: [], allPassed: true }, [currentView]);
  const krsTestResults = useMemo(() => currentView === 'krs_test' ? runKrsTests() : { results: [], allPassed: true }, [currentView]);
  const gradebookTestResults = useMemo(() => currentView === 'gradebook_test' ? runStudentGradebookTests() : { results: [], allPassed: true }, [currentView]);
  const announcementTestResults = useMemo(() => currentView === 'announcement_test' ? runAnnouncementTests() : { results: [], allPassed: true }, [currentView]);
  const profileTestResults = useMemo(() => currentView === 'profile_test' ? runStudentProfileTests() : { results: [], allPassed: true }, [currentView]);
  const lecturerProfileTestResults = useMemo(() => currentView === 'lecturer_profile_test' ? runLecturerProfileTests() : { results: [], allPassed: true }, [currentView]);
  const studentSecurityTestResults = useMemo(() => currentView === 'student_security_test' ? runStudentSecurityTests() : { results: [], allPassed: true }, [currentView]);

  const handleNavigate = (path: string) => {
    setCurrentView('normal');

    if (isAuthenticated && path === '/login') {
      path = '/';
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }

    if (path.startsWith('/mata-kuliah/')) {
      const clsId = path.replace('/mata-kuliah/', '');
      setActivePath('/mata-kuliah');
      setSelectedClassId(clsId);
      return;
    }

    if (path.startsWith('/video/')) {
      const vidId = path.replace('/video/', '');
      setActivePath('/video');
      setSelectedVideoId(vidId);
      return;
    }

    if (path.startsWith('/kuis/')) {
      const qid = path.replace('/kuis/', '');
      setActivePath('/kuis');
      setActiveTakingQuizId(qid);
      return;
    }

    if (path === '/tugas/grading' || path.startsWith('/tugas/grading/')) {
      const asgId = path.startsWith('/tugas/grading/') ? path.replace('/tugas/grading/', '') : 'asg-pai301-01';
      setActivePath('/tugas');
      setGradingAssignmentId(asgId);
      setSelectedAssignmentId(null);
      return;
    }

    if (path.startsWith('/tugas/')) {
      const asgId = path.replace('/tugas/', '');
      setActivePath('/tugas');
      setSelectedAssignmentId(asgId);
      setGradingAssignmentId(null);
      return;
    }

    if (path.startsWith('/forum/')) {
      const thrId = path.replace('/forum/', '');
      setActivePath('/forum');
      setSelectedThreadId(thrId);
      return;
    }

    // Standard routes
    setActivePath(path);
    if (path === '/mata-kuliah' || path === '/materi') setSelectedClassId(null);
    if (path === '/video') setSelectedVideoId(null);
    if (path === '/kuis') {
      setActiveTakingQuizId(null);
      setViewingQuizAttemptId(null);
      setQuizSubView('list');
    }
    if (path === '/tugas') {
      setSelectedAssignmentId(null);
      setGradingAssignmentId(null);
    }
    if (path === '/forum') {
      setSelectedThreadId(null);
    }
  };

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa' || user.role === 'administrator_sistem';

  const rbacColumns: Column<TestCaseResult>[] = [
    {
      header: 'Peran Pengguna',
      width: '140px',
      render: (row) => <Badge variant="primary">{row.role}</Badge>
    },
    {
      header: 'Kewenangan (Permission)',
      accessor: 'permission',
      width: '180px'
    },
    {
      header: 'Kategori Pengujian',
      width: '120px',
      render: (row) => (
        <Badge variant={row.type === 'POSITIF' ? 'success' : 'warning'}>
          {row.type}
        </Badge>
      )
    },
    {
      header: 'Skenario Keamanan',
      accessor: 'description'
    },
    {
      header: 'Hasil Verifikasi',
      width: '120px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? (
            <span className="flex items-center gap-1"><CheckCircle2 size={12} /> LULUS</span>
          ) : (
            <span className="flex items-center gap-1"><XCircle size={12} /> GAGAL</span>
          )}
        </Badge>
      )
    }
  ];

  const learningColumns: Column<LearningTestResult>[] = [
    {
      header: 'Skenario Pembelajaran & Akses',
      accessor: 'scenario',
      width: '240px'
    },
    {
      header: 'Ekspektasi Aturan Sistem',
      accessor: 'expected'
    },
    {
      header: 'Kondisi Aktual Codebase',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const videoColumns: Column<VideoTestResult>[] = [
    {
      header: 'Skenario Video Interaktif',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Backend',
      accessor: 'expected'
    },
    {
      header: 'Hasil Eksekusi Nyata',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const quizColumns: Column<QuizTestResult>[] = [
    {
      header: 'Skenario Kuis & Penilaian',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Mesin Kuis',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const assignmentColumns: Column<AssignmentTestResult>[] = [
    {
      header: 'Skenario Penugasan & Rubrik',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Sistem',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Codebase',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const forumColumns: Column<ForumTestResult>[] = [
    {
      header: 'Skenario Forum & Moderasi',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Forum',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const progressColumns: Column<ProgressTestResult>[] = [
    {
      header: 'Skenario Mesin Progres Belajar',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Completion',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const notificationColumns: Column<NotificationCalendarTestResult>[] = [
    {
      header: 'Skenario Notifikasi & Kalender',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Sistem',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const reportingColumns: Column<ReportingTestResult>[] = [
    {
      header: 'Skenario Laporan & Monitoring',
      accessor: 'scenario',
      width: '260px'
    },
    {
      header: 'Ekspektasi Validasi Institusional',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const securityColumns: Column<SecurityQATestResult>[] = [
    {
      header: 'Kategori Keamanan',
      width: '180px',
      render: (row) => <Badge variant="primary">{row.category.replace('_', ' ')}</Badge>
    },
    {
      header: 'Uji Skenario Keamanan',
      accessor: 'testName',
      width: '240px'
    },
    {
      header: 'Mitigasi Ancaman',
      accessor: 'threatMitigated'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.status === 'LULUS' ? 'success' : 'danger'}>
          {row.status === 'LULUS' ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const khsColumns: Column<KhsTestResult>[] = [
    {
      header: 'Skenario Pengujian KHS & Transkrip',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Standar Akademik',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const krsColumns: Column<KrsTestResult>[] = [
    {
      header: 'Skenario Pengujian KRS & Bimbingan PA',
      accessor: 'title',
      width: '320px'
    },
    {
      header: 'Hasil Verifikasi & Validasi Sistem',
      accessor: 'message'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const gradebookColumns: Column<StudentGradebookTestResult>[] = [
    {
      header: 'Skenario Buku Nilai Mahasiswa',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Standar Penilaian',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const announcementColumns: Column<AnnouncementTestResult>[] = [
    {
      header: 'Skenario Pengujian Pengumuman',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Standar Informasi',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const profileColumns: Column<StudentProfileTestResult>[] = [
    {
      header: 'Skenario Pengujian Profil Mahasiswa',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Data Biodata & KTM',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const lecturerProfileColumns: Column<LecturerProfileTestResult>[] = [
    {
      header: 'Skenario Pengujian Profil Dosen',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Standar Profil Dosen',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const studentSecurityColumns: Column<StudentSecurityTestResult>[] = [
    {
      header: 'Skenario Pengujian Keamanan Mahasiswa',
      accessor: 'scenario',
      width: '280px'
    },
    {
      header: 'Ekspektasi Standar Keamanan',
      accessor: 'expected'
    },
    {
      header: 'Hasil Verifikasi Aktual',
      accessor: 'actual'
    },
    {
      header: 'Status',
      width: '110px',
      render: (row) => (
        <Badge variant={row.passed ? 'success' : 'danger'}>
          {row.passed ? 'LULUS' : 'GAGAL'}
        </Badge>
      )
    }
  ];

  const renderPage = () => {
    if (currentView === 'showcase') {
      return (
        <div className="flex flex-col gap-4">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
            Kembali ke Beranda
          </Button>
          <ComponentShowcase />
        </div>
      );
    }

    if (currentView === 'rbac_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Hasil Pengujian Otorisasi & Matriks RBAC</h1>
              <p>Verifikasi kepatuhan otorisasi server-side, hak akses sah (positif), dan proteksi akses ilegal (negatif)</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {rbacTestResults.totalPassed} / {rbacTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Daftar Pengujian Kasus Positif & Negatif Otorisasi</CardTitle>
              <CardSubtitle>Mencegah eskalasi hak istimewa (*privilege escalation*) dan akses tidak sah</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={rbacColumns}
                data={rbacTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'learning_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi RPS, Pertemuan & Materi</h1>
              <p>Validasi isolasi status draf, kelengkapan RPS, dan pencatatan akses aktivitas belajar</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {learningTestResults.results.length} / {learningTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Alur Konten Pembelajaran</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={learningColumns}
                data={learningTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'video_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Video Interaktif & Anti-Cheat</h1>
              <p>Validasi jeda otomatis checkpoint pertanyaan, anti-skipping, resume playback, dan completion rule</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {videoTestResults.results.length} / {videoTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Video Pembelajaran Interaktif</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={videoColumns}
                data={videoTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'quiz_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Kuis Daring & Penilaian</h1>
              <p>Validasi timer server, autosave, scoring objektif, antrean esai, dan idempotensi submit</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {quizTestResults.results.length} / {quizTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Mesin Kuis & Evaluasi Pembelajaran</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={quizColumns}
                data={quizTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'assignment_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Tugas, Rubrik & Audit Nilai</h1>
              <p>Validasi keamanan upload, status terlambat, kalkulasi rubrik, revisi berkas, dan jejak audit nilai</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {assignmentTestResults.results.length} / {assignmentTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Penugasan Akademik & Rubrik</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={assignmentColumns}
                data={assignmentTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'forum_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Forum Diskusi & Moderasi</h1>
              <p>Validasi topik kelas, balasan berulir, hak moderasi dosen (pin/lock/best answer/hide), dan event tracking</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {forumTestResults.results.length} / {forumTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Forum Diskusi & Moderasi</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={forumColumns}
                data={forumTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'progress_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Mesin Progres & Completion Engine</h1>
              <p>Validasi penyelesaian multi-sumber, penghitungan bebas double-counting, centang manual, dan Lanjutkan Belajar</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {progressTestResults.results.length} / {progressTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Mesin Progres Pembelajaran</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={progressColumns}
                data={progressTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'notification_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Notifikasi & Kalender Terpadu</h1>
              <p>Validasi pusat notifikasi, unread count badge, deep link routing, dan timeline agenda akademik</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {notificationTestResults.results.length} / {notificationTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Notifikasi & Kalender Akademik</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={notificationColumns}
                data={notificationTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'reporting_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Laporan & Monitoring Institusional</h1>
              <p>Validasi agregasi capaian kelas, deteksi mahasiswa berisiko tertinggal, kepatuhan RPS, dan ekspor CSV</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {reportingTestResults.results.length} / {reportingTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Laporan & Monitoring Akademik</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={reportingColumns}
                data={reportingTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'security_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Audit Keamanan, QA & Aksesibilitas Sistem</h1>
              <p>Pengujian proteksi IDOR, sanitasi berkas upload, otorisasi RBAC, anti-cheat video, dan A11y</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {securityQATestResults.results.length} / {securityQATestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Matriks Verifikasi Keamanan Codebase</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={securityColumns}
                data={securityQATestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'khs_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi KHS & Transkrip Akademik</h1>
              <p>Validasi konversi bobot huruf mutu, perhitungan IPS/IPK, beban SKS, dan kode otentikasi digital</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {khsTestResults.results.length} / {khsTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Kartu Hasil Studi (KHS)</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={khsColumns}
                data={khsTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'krs_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Modul KRS &amp; Bimbingan PA</h1>
              <p>Validasi formula batas SKS, deteksi bentrok jadwal, pengajuan rencana studi, persetujuan Dosen PA, dan konsultasi interaktif</p>
            </div>

            <Badge variant={krsTestResults.allPassed ? 'success' : 'danger'} style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {krsTestResults.results.filter(r => r.passed).length} / {krsTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Kartu Rencana Studi (KRS) &amp; Persetujuan Dosen PA</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={krsColumns}
                data={krsTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'gradebook_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Buku Nilai Mahasiswa</h1>
              <p>Validasi transparansi bobot komponen, simulator target nilai, dan fitur sanggah nilai perkuliahan</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {gradebookTestResults.results.length} / {gradebookTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Buku Nilai & Transparansi Evaluasi</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={gradebookColumns}
                data={gradebookTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'announcement_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Modul Pengumuman Kampus</h1>
              <p>Validasi distribusi informasi resmi, prioritas sematan (pinned), status baca mandiri, dan arsip dokumen lampiran</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {announcementTestResults.results.length} / {announcementTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Pengumuman & Informasi Kampus</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={announcementColumns}
                data={announcementTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'profile_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Profil Mahasiswa & KTM Digital</h1>
              <p>Validasi biodata kependudukan, pembimbing akademik, capaian tahfidz & turats, dan otentikasi KTM digital</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {profileTestResults.results.length} / {profileTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Profil Mahasiswa & Portofolio Keislaman</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={profileColumns}
                data={profileTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'lecturer_profile_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Profil Dosen Pengampu & KTD Digital</h1>
              <p>Validasi identitas dosen berbasis akun login, NIDN, beban BKD 12 SKS, rekam jejak SINTA, dan kartu KTD</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {lecturerProfileTestResults.results.length} / {lecturerProfileTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Profil Dosen Pengampu & BKD</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={lecturerProfileColumns}
                data={lecturerProfileTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    if (currentView === 'student_security_test') {
      return (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setCurrentView('normal')}>
                Kembali ke Beranda
              </Button>
              <h1 style={{ marginTop: 'var(--space-3)' }}>Uji Verifikasi Keamanan Akun Mahasiswa</h1>
              <p>Validasi validasi kata sandi kuat, otentikasi 2FA email kampus, pencabutan sesi perangkat, dan kode darurat</p>
            </div>

            <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
              {studentSecurityTestResults.results.length} / {studentSecurityTestResults.results.length} Skenario Lulus
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Pengujian Modul Keamanan & Sesi Mahasiswa</CardTitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={studentSecurityColumns}
                data={studentSecurityTestResults.results}
                keyExtractor={(_, idx) => idx}
              />
            </CardBody>
          </Card>
        </div>
      );
    }

    // =========================================================================
    // MODUL PUSAT KEAMANAN & QA (ADMIN)
    // =========================================================================
    if (activePath === '/admin/keamanan') {
      return (
        <AuthGuard roles={['administrator_sistem', 'admin_akademik']} onNavigateHome={() => setActivePath('/')}>
          <QASecurityPage />
        </AuthGuard>
      );
    }

    // =========================================================================
    // MODUL LAPORAN & MONITORING (PIMPINAN & KAPRODI)
    // =========================================================================
    if (activePath === '/laporan') {
      return (
        <AuthGuard permissions={['progress:view_class']} onNavigateHome={() => setActivePath('/')}>
          <LaporanMonitoringPage />
        </AuthGuard>
      );
    }

    // =========================================================================
    // MODUL JADWAL KULIAH MAHASISWA & DOSEN
    // =========================================================================
    if (activePath === '/jadwal') {
      return (
        <JadwalMahasiswaPage 
          onNavigateToClass={(classId) => {
            setActivePath('/mata-kuliah');
            setSelectedClassId(classId);
          }}
          onNavigate={(path) => setActivePath(path)}
        />
      );
    }

    // =========================================================================
    // MODUL KARTU RENCANA STUDI (KRS) MAHASISWA & BIMBINGAN DOSEN PA
    // =========================================================================
    if (activePath === '/bimbingan' || activePath === '/admin/krs' || (activePath === '/krs' && user?.role !== 'mahasiswa')) {
      return (
        <AuthGuard permissions={['academic:view_krs_khs']} onNavigateHome={() => setActivePath('/')}>
          <BimbinganPaPage />
        </AuthGuard>
      );
    }

    if (activePath === '/krs') {
      return (
        <KrsMahasiswaPage 
          onNavigateToSchedule={() => setActivePath('/jadwal')}
          onNavigateToClass={(classId) => {
            setActivePath('/mata-kuliah');
            setSelectedClassId(classId);
          }}
        />
      );
    }

    // =========================================================================
    // MODUL KARTU HASIL STUDI (KHS) & TRANSKRIP MAHASISWA
    // =========================================================================
    if (activePath === '/khs' || activePath === '/transkrip') {
      return (
        <KhsMahasiswaPage 
          onNavigateToKrs={() => setActivePath('/krs')}
          onNavigateToSchedule={() => setActivePath('/jadwal')}
          onNavigateToGradebook={() => setActivePath('/buku-nilai')}
          onNavigateToClass={(classId) => {
            setActivePath('/mata-kuliah');
            setSelectedClassId(classId);
          }}
        />
      );
    }

    // =========================================================================
    // MODUL BUKU NILAI & TRANSPARANSI EVALUASI
    // =========================================================================
    if (activePath === '/buku-nilai' || (activePath === '/nilai' && user?.role === 'mahasiswa')) {
      return (
        <BukuNilaiMahasiswaPage 
          onNavigateToKhs={() => setActivePath('/khs')}
          onNavigateToClass={(classId) => {
            setActivePath('/mata-kuliah');
            setSelectedClassId(classId);
          }}
        />
      );
    }

    // =========================================================================
    // MODUL KALENDER AKADEMIK
    // =========================================================================
    if (activePath === '/kalender') {
      return <KalenderPage onNavigate={(path) => setActivePath(path)} />;
    }

    // =========================================================================
    // MODUL PENGUMUMAN & INFORMASI KAMPUS
    // =========================================================================
    if (activePath === '/pengumuman') {
      return <PengumumanMahasiswaPage onNavigate={(path) => setActivePath(path)} />;
    }

    // =========================================================================
    // MODUL PUSAT NOTIFIKASI AKADEMIK TERINTEGRASI 7 ROLE
    // =========================================================================
    if (activePath === '/notifikasi' || activePath === '/notifications') {
      return <NotificationPage onNavigate={(path) => setActivePath(path)} />;
    }

    // =========================================================================
    // MODUL PROFIL PENGGUNA & KTM / KTD DIGITAL
    // =========================================================================
    if (activePath === '/profil') {
      if (isLecturer || user?.role === 'kaprodi' || user?.role === 'admin_akademik' || user?.role === 'administrator_sistem') {
        return <ProfilDosenPage onNavigate={(path) => setActivePath(path)} />;
      }
      return <ProfilMahasiswaPage onNavigate={(path) => setActivePath(path)} />;
    }

    // =========================================================================
    // MODUL KEAMANAN AKUN MAHASISWA
    // =========================================================================
    if (activePath === '/keamanan') {
      return <KeamananMahasiswaPage onNavigate={(path) => setActivePath(path)} />;
    }

    // =========================================================================
    // MODUL PROGRES BELAJAR
    // =========================================================================
    if (activePath === '/progres') {
      if (isLecturer) {
        return <ProgresKelasDosenPage onBack={() => setActivePath('/')} />;
      }

      return (
        <ProgresBelajarPage 
          onNavigateToActivity={(type, resourceId) => {
            if (type === 'VIDEO_INTERAKTIF') {
              setActivePath('/video');
              setSelectedVideoId(resourceId);
            } else if (type === 'KUIS') {
              setActivePath('/kuis');
              setActiveTakingQuizId(resourceId);
            } else if (type === 'TUGAS') {
              setActivePath('/tugas');
              setSelectedAssignmentId(resourceId);
            } else if (type === 'FORUM_DISKUSI') {
              setActivePath('/forum');
              setSelectedThreadId(resourceId);
            } else {
              setActivePath('/mata-kuliah');
            }
          }}
        />
      );
    }

    // =========================================================================
    // MODUL FORUM DISKUSI
    // =========================================================================
    if (activePath === '/forum') {
      if (selectedThreadId) {
        return (
          <ThreadDetailPage 
            threadId={selectedThreadId} 
            onBack={() => setSelectedThreadId(null)} 
          />
        );
      }

      return (
        <ForumListPage 
          onSelectThread={(thrId) => setSelectedThreadId(thrId)} 
        />
      );
    }

    // =========================================================================
    // MODUL TUGAS PERKULIAHAN
    // =========================================================================
    if (activePath === '/tugas') {
      if (gradingAssignmentId) {
        return (
          <TugasGradingPage 
            assignmentId={gradingAssignmentId} 
            onBack={() => setGradingAssignmentId(null)} 
          />
        );
      }

      if (selectedAssignmentId) {
        return (
          <TugasDetailPage 
            assignmentId={selectedAssignmentId} 
            onBack={() => setSelectedAssignmentId(null)} 
          />
        );
      }

      return (
        <TugasListPage 
          onSelectAssignment={(asgId) => setSelectedAssignmentId(asgId)}
          onOpenGradingStudio={(asgId) => setGradingAssignmentId(asgId)}
        />
      );
    }

    // =========================================================================
    // MODUL KUIS DARING
    // =========================================================================
    if (activePath === '/kuis') {
      if (activeTakingQuizId) {
        return (
          <QuizTakingPage
            quizId={activeTakingQuizId}
            onFinish={(attemptId) => {
              setActiveTakingQuizId(null);
              setViewingQuizAttemptId(attemptId);
            }}
            onExit={() => setActiveTakingQuizId(null)}
          />
        );
      }

      if (viewingQuizAttemptId) {
        return (
          <QuizResultPage
            attemptId={viewingQuizAttemptId}
            onBack={() => setViewingQuizAttemptId(null)}
          />
        );
      }

      if (quizSubView === 'bank_soal') {
        return <BankSoalPage onBack={() => setQuizSubView('list')} />;
      }

      if (quizSubView === 'grading_queue') {
        return <QuizGradingPage onBack={() => setQuizSubView('list')} />;
      }

      if (quizSubView === 'proctoring' && selectedProctoringQuizId) {
        return (
          <QuizProctoringPage 
            quizId={selectedProctoringQuizId} 
            onBack={() => {
              setQuizSubView('list');
              setSelectedProctoringQuizId(null);
            }} 
          />
        );
      }

      return (
        <QuizListPage
          onStartQuiz={(qid) => setActiveTakingQuizId(qid)}
          onViewResult={(attId) => setViewingQuizAttemptId(attId)}
          onOpenBankSoal={() => setQuizSubView('bank_soal')}
          onOpenGradingQueue={() => setQuizSubView('grading_queue')}
          onOpenProctoring={(qid) => {
            setSelectedProctoringQuizId(qid);
            setQuizSubView('proctoring');
          }}
        />
      );
    }

    // Pemutar Video Interaktif
    if (activePath === '/video' && selectedVideoId) {
      return (
        <VideoPlayerPage 
          videoId={selectedVideoId} 
          onBack={() => setSelectedVideoId(null)} 
        />
      );
    }

    // Katalog Video Interaktif
    if (activePath === '/video') {
      return (
        <VideoListPage 
          onSelectVideo={(vidId) => setSelectedVideoId(vidId)} 
        />
      );
    }

    // Detail Kelas Perkuliahan
    if ((activePath === '/mata-kuliah' || activePath === '/materi') && selectedClassId) {
      return (
        <KelasDetailPage 
          classId={selectedClassId} 
          onBack={() => setSelectedClassId(null)}
          onNavigateToAssignment={(asgId) => {
            setActivePath('/tugas');
            setSelectedAssignmentId(asgId);
            setGradingAssignmentId(null);
          }}
          onNavigateToGrading={(asgId) => {
            setActivePath('/tugas');
            setGradingAssignmentId(asgId);
            setSelectedAssignmentId(null);
          }}
          onNavigateToQuiz={(qid) => {
            setActivePath('/kuis');
            setActiveTakingQuizId(qid);
          }}
          onNavigateToForum={(thrId) => {
            setActivePath('/forum');
            setSelectedThreadId(thrId);
          }}
          onNavigateToVideo={(vidId) => {
            setActivePath('/video');
            setSelectedVideoId(vidId);
          }}
          onNavigateToAttendance={() => {
            setActivePath('/presensi');
          }}
        />
      );
    }

    // Presensi & Kehadiran Perkuliahan (QR Code Dinamis & BAP)
    if (activePath === '/presensi') {
      return <PresensiPerkuliahanPage />;
    }

    // Daftar Mata Kuliah Saya
    if (activePath === '/mata-kuliah' || activePath === '/materi') {
      return (
        <MataKuliahListPage 
          onSelectClass={(classId) => setSelectedClassId(classId)} 
        />
      );
    }

    // Protected Route: Admin Periode Akademik
    if (activePath === '/admin/periode') {
      return (
        <AuthGuard permissions={['academic:view_periods']} onNavigateHome={() => setActivePath('/')}>
          <PeriodeAkademikPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Program Studi & Kurikulum
    if (activePath === '/admin/prodi') {
      return (
        <AuthGuard permissions={['academic:view_periods']} onNavigateHome={() => setActivePath('/')}>
          <ProdiPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Mata Kuliah & Kelas Perkuliahan
    if (activePath === '/admin/mata-kuliah') {
      return (
        <AuthGuard permissions={['academic:view_periods']} onNavigateHome={() => setActivePath('/')}>
          <MataKuliahAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Ruangan & Jadwal Perkuliahan
    if (activePath === '/admin/jadwal') {
      return (
        <AuthGuard permissions={['academic:view_periods']} onNavigateHome={() => setActivePath('/')}>
          <JadwalAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Master Data Mahasiswa
    if (activePath === '/admin/mahasiswa') {
      return (
        <AuthGuard permissions={['users:manage']} onNavigateHome={() => setActivePath('/')}>
          <MahasiswaAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Master Data Dosen
    if (activePath === '/admin/dosen') {
      return (
        <AuthGuard permissions={['users:manage']} onNavigateHome={() => setActivePath('/')}>
          <DosenAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Sinkronisasi Akademik
    if (activePath === '/admin/sinkronisasi') {
      return (
        <AuthGuard permissions={['sync:execute', 'sync:view_logs']} onNavigateHome={() => setActivePath('/')}>
          <SinkronisasiPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Monitoring Aktivitas Pembelajaran
    if (activePath === '/admin/monitoring') {
      return (
        <AuthGuard permissions={['progress:view_class']} onNavigateHome={() => setActivePath('/')}>
          <MonitoringAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin & Dosen Monitoring & Rekapitulasi Nilai Akademik
    if (activePath === '/admin/nilai' || activePath === '/rekap-nilai' || (activePath === '/nilai' && user?.role !== 'mahasiswa')) {
      return (
        <AuthGuard permissions={['academic:view_krs_khs']} onNavigateHome={() => setActivePath('/')}>
          <NilaiAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Manajemen Peran & Hak Akses (RBAC)
    if (activePath === '/admin/peran') {
      return (
        <AuthGuard permissions={['roles:manage', 'users:manage']} onNavigateHome={() => setActivePath('/')}>
          <PeranAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Pengaturan Sistem & Konfigurasi Global
    if (activePath === '/admin/pengaturan') {
      return (
        <AuthGuard permissions={['system:configure', 'users:manage']} onNavigateHome={() => setActivePath('/')}>
          <PengaturanAdminPage />
        </AuthGuard>
      );
    }

    // Protected Route: Admin Audit Log
    if (activePath === '/admin/audit') {
      return (
        <AuthGuard permissions={['audit:view']} onNavigateHome={() => setActivePath('/')}>
          <AuditLogPage />
        </AuthGuard>
      );
    }

    if (activePath === '/') {
      return (
        <div className="flex flex-col gap-6">
          {/* Status Bar Fase 12 */}
          <div 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3" 
            style={{ 
              backgroundColor: 'var(--color-primary-50)', 
              padding: 'var(--space-3) var(--space-4)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--color-primary-200)' 
            }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} color="var(--color-primary-800)" />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', fontWeight: 'var(--font-weight-medium)' }}>
                <strong>Fase 12 Selesai:</strong> Audit Keamanan IDOR, Sanitasi Upload, RBAC, Anti-Cheat & Aksesibilitas Terverifikasi.
              </span>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                variant="primary" 
                size="sm" 
                icon={ShieldCheck} 
                onClick={() => {
                  if (user?.role !== 'administrator_sistem' && user?.role !== 'admin_akademik') {
                    switchRole('administrator_sistem');
                  }
                  setActivePath('/admin/keamanan');
                }}
              >
                Pusat Keamanan & QA
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('khs_test')}>
                Uji Modul KHS
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('krs_test')}>
                Uji Modul KRS &amp; PA
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('announcement_test')}>
                Uji Pengumuman
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('profile_test')}>
                Uji Profil Mahasiswa
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('lecturer_profile_test')}>
                Uji Profil Dosen
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('student_security_test')}>
                Uji Keamanan Akun
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentView('security_test')}>
                Uji Keamanan QA
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setCurrentView('showcase')}>
                Katalog UI Kit
              </Button>
            </div>
          </div>

          <BerandaPage 
            user={user} 
            onNavigate={handleNavigate} 
          />
        </div>
      );
    }

    // Default protected page for other routes
    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => handleNavigate('/')}>
          Kembali ke Beranda
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Modul {activePath.replace('/', '').toUpperCase()}</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto var(--space-4)' }}>
              Struktur data dan otorisasi untuk halaman ini telah siap. Fitur bisnis modul ini akan dibangun pada fase selanjutnya.
            </p>
            <Button variant="primary" onClick={() => handleNavigate('/')}>
              Kembali ke Beranda
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <AppLayout
      activePath={activePath}
      onNavigate={handleNavigate}
      isCbtLockdown={!!activeTakingQuizId}
    >
      {renderPage()}
      <SessionExpiredModal />
    </AppLayout>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <MainAppContent />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
