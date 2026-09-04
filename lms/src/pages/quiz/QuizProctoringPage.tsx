import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  RefreshCw, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Radio, 
  Maximize, 
  Send, 
  Lock, 
  Unlock, 
  UserCheck, 
  Eye, 
  Activity,
  Info
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Quiz } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';

export interface QuizProctoringPageProps {
  quizId: string;
  onBack: () => void;
}

interface StudentProctoringState {
  studentId: string;
  studentName: string;
  studentNim: string;
  avatarLetter: string;
  status: 'SEDANG_DIKERJAKAN' | 'SELESAI' | 'TERKUNCI_PELANGGARAN' | 'BELUM_MULAI';
  isFullscreen: boolean;
  violationCount: number; // 0 s.d 3
  answeredCount: number;
  totalQuestions: number;
  remainingSeconds: number;
  lastActiveTime: string;
  lastIncidentReason?: string;
  ipAddress: string;
  browser: string;
}

interface IncidentLogItem {
  id: string;
  timestamp: string;
  studentName: string;
  studentNim: string;
  type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'INSPECT_ATTEMPT' | 'COPY_PASTE' | 'TIMEOUT' | 'FORCE_SUBMIT' | 'RECONNECTED';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
}

export const QuizProctoringPage: React.FC<QuizProctoringPageProps> = ({ quizId, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(5);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Modals state
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<StudentProctoringState | null>(null);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('Peringatan: Harap tetap berada di mode layar penuh dan jangan berpindah tab browser selama ujian.');
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [broadcastMessage, setBroadcastMessage] = useState<string>('Waktu ujian tersisa 15 menit. Pastikan seluruh jawaban telah disimpan sebelum waktu habis.');
  const [showForensicModal, setShowForensicModal] = useState<boolean>(false);

  // Mock initial student proctoring states
  const [studentsData, setStudentsData] = useState<StudentProctoringState[]>([
    {
      studentId: 'usr-21010042',
      studentName: 'Ahmad Fauzi Rahman',
      studentNim: '21010042',
      avatarLetter: 'A',
      status: 'SEDANG_DIKERJAKAN',
      isFullscreen: true,
      violationCount: 0,
      answeredCount: 16,
      totalQuestions: 20,
      remainingSeconds: 1420,
      lastActiveTime: 'Baru saja',
      ipAddress: '192.168.1.45',
      browser: 'Chrome 128 (Windows 11)'
    },
    {
      studentId: 'usr-21010043',
      studentName: 'Siti Nurhaliza',
      studentNim: '21010043',
      avatarLetter: 'S',
      status: 'SEDANG_DIKERJAKAN',
      isFullscreen: false,
      violationCount: 1,
      answeredCount: 12,
      totalQuestions: 20,
      remainingSeconds: 1390,
      lastActiveTime: '2 menit lalu',
      lastIncidentReason: 'Berpindah tab peramban (Window Blur)',
      ipAddress: '192.168.1.48',
      browser: 'Edge 127 (Windows 10)'
    },
    {
      studentId: 'usr-21010044',
      studentName: 'Muhammad Rizky',
      studentNim: '21010044',
      avatarLetter: 'M',
      status: 'SEDANG_DIKERJAKAN',
      isFullscreen: true,
      violationCount: 0,
      answeredCount: 18,
      totalQuestions: 20,
      remainingSeconds: 1250,
      lastActiveTime: 'Baru saja',
      ipAddress: '192.168.1.52',
      browser: 'Chrome 128 (macOS)'
    },
    {
      studentId: 'usr-21010045',
      studentName: 'Fatimah Az-Zahra',
      studentNim: '21010045',
      avatarLetter: 'F',
      status: 'SELESAI',
      isFullscreen: true,
      violationCount: 0,
      answeredCount: 20,
      totalQuestions: 20,
      remainingSeconds: 0,
      lastActiveTime: '5 menit lalu',
      ipAddress: '192.168.1.60',
      browser: 'Chrome 128 (Windows 11)'
    },
    {
      studentId: 'usr-21010046',
      studentName: 'Bilal Al-Habasyi',
      studentNim: '21010046',
      avatarLetter: 'B',
      status: 'TERKUNCI_PELANGGARAN',
      isFullscreen: false,
      violationCount: 3,
      answeredCount: 10,
      totalQuestions: 20,
      remainingSeconds: 0,
      lastActiveTime: '10 menit lalu',
      lastIncidentReason: 'Batas toleransi pelanggaran 3x terlampaui (Auto Force-Submit)',
      ipAddress: '192.168.1.66',
      browser: 'Firefox 129 (Linux)'
    },
    {
      studentId: 'usr-21010047',
      studentName: 'Zainab Binti Ali',
      studentNim: '21010047',
      avatarLetter: 'Z',
      status: 'SEDANG_DIKERJAKAN',
      isFullscreen: true,
      violationCount: 0,
      answeredCount: 14,
      totalQuestions: 20,
      remainingSeconds: 1410,
      lastActiveTime: 'Baru saja',
      ipAddress: '192.168.1.71',
      browser: 'Chrome 128 (Android 14)'
    }
  ]);

  // Initial incident feed
  const [incidents, setIncidents] = useState<IncidentLogItem[]>([
    {
      id: 'inc-101',
      timestamp: '15:28:10',
      studentName: 'Bilal Al-Habasyi',
      studentNim: '21010046',
      type: 'FORCE_SUBMIT',
      severity: 'critical',
      details: 'Sistem melakukan pengumpulan paksa otomatis karena akumulasi 3 pelanggaran layar.'
    },
    {
      id: 'inc-102',
      timestamp: '15:27:45',
      studentName: 'Bilal Al-Habasyi',
      studentNim: '21010046',
      type: 'INSPECT_ATTEMPT',
      severity: 'high',
      details: 'Terdeteksi upaya membuka Developer Tools (Shortcut F12 / Inspect Element).'
    },
    {
      id: 'inc-103',
      timestamp: '15:26:12',
      studentName: 'Siti Nurhaliza',
      studentNim: '21010043',
      type: 'TAB_SWITCH',
      severity: 'medium',
      details: 'Fokus tab browser terlepas (Visibility state: hidden).'
    },
    {
      id: 'inc-104',
      timestamp: '15:25:00',
      studentName: 'Fatimah Az-Zahra',
      studentNim: '21010045',
      type: 'RECONNECTED',
      severity: 'low',
      details: 'Lembar jawaban berhasil diserahkan dengan status selesai.'
    }
  ]);

  useEffect(() => {
    const q = quizService.getQuizById(quizId);
    if (q) setQuiz(q);
  }, [quizId]);

  // Auto-refresh interval simulator
  useEffect(() => {
    if (autoRefreshSec <= 0) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // Sedikit kurangi timer yang sedang berjalan
      setStudentsData(prev => prev.map(s => {
        if (s.status === 'SEDANG_DIKERJAKAN' && s.remainingSeconds > 0) {
          return { ...s, remainingSeconds: Math.max(0, s.remainingSeconds - autoRefreshSec) };
        }
        return s;
      }));
    }, autoRefreshSec * 1000);

    return () => clearInterval(interval);
  }, [autoRefreshSec]);

  // Telemetry metrics
  const totalStudents = studentsData.length;
  const activeTakingCount = studentsData.filter(s => s.status === 'SEDANG_DIKERJAKAN').length;
  const completedCount = studentsData.filter(s => s.status === 'SELESAI').length;
  const violationCountTotal = studentsData.filter(s => s.violationCount > 0 && s.status === 'SEDANG_DIKERJAKAN').length;
  const disqualifiedCount = studentsData.filter(s => s.status === 'TERKUNCI_PELANGGARAN').length;

  const filteredStudents = useMemo(() => {
    return studentsData.filter(s => {
      const matchSearch = 
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNim.includes(searchQuery);
      
      let matchStatus = true;
      if (filterStatus === 'AKTIF') matchStatus = s.status === 'SEDANG_DIKERJAKAN';
      if (filterStatus === 'PERINGATAN') matchStatus = s.violationCount > 0 && s.status === 'SEDANG_DIKERJAKAN';
      if (filterStatus === 'SELESAI') matchStatus = s.status === 'SELESAI';
      if (filterStatus === 'TERKUNCI') matchStatus = s.status === 'TERKUNCI_PELANGGARAN';

      return matchSearch && matchStatus;
    });
  }, [studentsData, searchQuery, filterStatus]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLastUpdated(new Date());
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Data Telemetri Diperbarui', 'Status layar dan aktivitas mahasiswa berhasil disinkronkan.');
    }, 400);
  };

  const handleResetViolation = (student: StudentProctoringState) => {
    setStudentsData(prev => prev.map(s => {
      if (s.studentId === student.studentId) {
        return {
          ...s,
          violationCount: 0,
          isFullscreen: true,
          status: s.status === 'TERKUNCI_PELANGGARAN' ? 'SEDANG_DIKERJAKAN' : s.status,
          remainingSeconds: s.remainingSeconds === 0 ? 900 : s.remainingSeconds
        };
      }
      return s;
    }));

    // Add to incident feed
    const newInc: IncidentLogItem = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      studentName: student.studentName,
      studentNim: student.studentNim,
      type: 'RECONNECTED',
      severity: 'low',
      details: `Dosen pengawas mereset pelanggaran dan membuka kembali akses ujian untuk ${student.studentName}.`
    };
    setIncidents(prev => [newInc, ...prev]);

    setShowResetModal(false);
    setSelectedStudentForAction(null);
    toast.success('Pelanggaran Direset', `Toleransi keamanan untuk ${student.studentName} berhasil dipulihkan.`);
  };

  const handleSendPrivateWarning = () => {
    if (!selectedStudentForAction) return;

    const newInc: IncidentLogItem = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      studentName: selectedStudentForAction.studentName,
      studentNim: selectedStudentForAction.studentNim,
      type: 'TAB_SWITCH',
      severity: 'medium',
      details: `Pesan Peringatan Terkirim: "${warningMessage}"`
    };
    setIncidents(prev => [newInc, ...prev]);

    setShowWarningModal(false);
    setSelectedStudentForAction(null);
    toast.info('Peringatan Terkirim', `Pesan peringatan live berhasil dikirim ke layar mahasiswa.`);
  };

  const handleBroadcastMessage = () => {
    if (!broadcastMessage.trim()) return;

    const newInc: IncidentLogItem = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      studentName: 'Semua Peserta',
      studentNim: 'BROADCAST',
      type: 'RECONNECTED',
      severity: 'low',
      details: `Pengumuman Dosen Pengawas: "${broadcastMessage}"`
    };
    setIncidents(prev => [newInc, ...prev]);

    setShowBroadcastModal(false);
    toast.success('Pengumuman Massal Terkirim', 'Pesan telah disiarkan ke seluruh layar mahasiswa peserta ujian.');
  };

  const handleForceSubmitStudent = (student: StudentProctoringState) => {
    if (!window.confirm(`Yakin ingin mengumpulkan paksa ujian untuk ${student.studentName}? Tindakan ini akan langsung mengakhiri sesi ujian.`)) {
      return;
    }

    setStudentsData(prev => prev.map(s => {
      if (s.studentId === student.studentId) {
        return {
          ...s,
          status: 'SELESAI',
          remainingSeconds: 0
        };
      }
      return s;
    }));

    const newInc: IncidentLogItem = {
      id: `inc-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      studentName: student.studentName,
      studentNim: student.studentNim,
      type: 'FORCE_SUBMIT',
      severity: 'high',
      details: `Ujian dikumpulkan paksa secara manual oleh Dosen Pengawas (${user?.name || 'Dosen'}).`
    };
    setIncidents(prev => [newInc, ...prev]);

    toast.warning('Ujian Dikumpulkan Paksa', `Sesi ujian ${student.studentName} telah diakhiri.`);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col gap-6" style={{ minHeight: '85vh' }}>
      {/* =========================================================================
          TOP ACTION BAR & TITLE
          ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={onBack}>
              Kembali
            </Button>
            <Badge variant="primary" style={{ backgroundColor: '#059669', color: '#ffffff' }}>
              <Radio size={12} className="animate-pulse" /> LIVE TELEMETRI CBT
            </Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Sinkronisasi: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: '#1e293b' }}>
            {quiz ? quiz.title : 'Pengawasan Ujian CBT Waktu Nyata'}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: '#64748b' }}>
            {quiz?.courseName || 'Mata Kuliah'} • Ruang Ujian Online STAI Al-Ittihad Cianjur
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 px-1 font-medium">Auto-refresh:</span>
            {[3, 5, 10, 0].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setAutoRefreshSec(sec)}
                className={`px-2 py-0.5 rounded font-medium transition-all ${
                  autoRefreshSec === sec 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec === 0 ? 'Pause' : `${sec}s`}
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            icon={RefreshCw} 
            onClick={handleManualRefresh}
            className={isRefreshing ? 'animate-spin' : ''}
          >
            Refresh
          </Button>

          <Button 
            variant="primary" 
            size="sm" 
            icon={Send} 
            onClick={() => setShowBroadcastModal(true)}
            style={{ backgroundColor: '#059669' }}
          >
            Siaran Pengumuman
          </Button>
        </div>
      </div>

      {/* =========================================================================
          TELEMETRY METRICS SUMMARY CARDS
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        <Card style={{ borderLeft: '4px solid #3b82f6' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--text-xs)', color: '#64748b', fontWeight: 600 }}>TOTAL PESERTA</span>
              <UserCheck size={18} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e293b', marginTop: '4px' }}>
              {totalStudents}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>Mahasiswa Terdaftar</span>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #10b981' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--text-xs)', color: '#64748b', fontWeight: 600 }}>SEDANG MENGERJAKAN</span>
              <Activity size={18} color="#10b981" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>
              {activeTakingCount}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#10b981' }}>Layar Terkunci Aman</span>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #f59e0b' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--text-xs)', color: '#64748b', fontWeight: 600 }}>TERINDIKASI PERINGATAN</span>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '4px' }}>
              {violationCountTotal}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#f59e0b' }}>1-2x Pelanggaran Layar</span>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #ef4444' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--text-xs)', color: '#64748b', fontWeight: 600 }}>TERKUNCI / FORCE SUBMIT</span>
              <ShieldAlert size={18} color="#ef4444" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>
              {disqualifiedCount}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#ef4444' }}>Mencapai Batas 3x</span>
          </CardBody>
        </Card>

        <Card style={{ borderLeft: '4px solid #6366f1' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-center">
              <span style={{ fontSize: 'var(--text-xs)', color: '#64748b', fontWeight: 600 }}>SELESAI MENGERJAKAN</span>
              <CheckCircle2 size={18} color="#6366f1" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#6366f1', marginTop: '4px' }}>
              {completedCount}
            </div>
            <span style={{ fontSize: '0.6875rem', color: '#6366f1' }}>Telah Dikumpulkan</span>
          </CardBody>
        </Card>
      </div>

      {/* =========================================================================
          MAIN 2-COLUMN VIEW: STUDENT GRID & LIVE INCIDENT FEED
          ========================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)', gap: 'var(--space-6)' }}>
        
        {/* LEFT COLUMN: STUDENT TELEMETRY CARDS */}
        <div className="flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-3 rounded-lg border border-slate-200">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama mahasiswa atau NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {[
                { id: 'SEMUA', label: 'Semua' },
                { id: 'AKTIF', label: 'Sedang Mengerjakan' },
                { id: 'PERINGATAN', label: 'Ada Peringatan' },
                { id: 'TERKUNCI', label: 'Terkunci' },
                { id: 'SELESAI', label: 'Selesai' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1 rounded-md whitespace-nowrap transition-all ${
                    filterStatus === tab.id
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {filteredStudents.map((st) => {
              const progressPct = Math.round((st.answeredCount / st.totalQuestions) * 100);
              const isWarning = st.violationCount > 0 && st.violationCount < 3;
              const isLocked = st.status === 'TERKUNCI_PELANGGARAN' || st.violationCount >= 3;
              const isDone = st.status === 'SELESAI';

              let borderColor = 'border-slate-200';
              if (isLocked) borderColor = 'border-red-400 ring-1 ring-red-400/30';
              else if (isWarning) borderColor = 'border-amber-400 ring-1 ring-amber-400/30';
              else if (st.isFullscreen) borderColor = 'border-emerald-300';

              return (
                <div 
                  key={st.studentId} 
                  className={`bg-white rounded-xl p-4 border ${borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Student Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                            isLocked 
                              ? 'bg-red-100 text-red-700' 
                              : isWarning 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {st.avatarLetter}
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-1">
                            {st.studentName}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            NIM: {st.studentNim}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {isLocked ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                          <Lock size={10} /> TERKUNCI (3/3)
                        </span>
                      ) : isDone ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                          <CheckCircle2 size={10} /> SELESAI
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={10} /> PERINGATAN ({st.violationCount}/3)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <ShieldCheck size={10} /> LAYAR AMAN
                        </span>
                      )}
                    </div>

                    {/* Progress Bar & Questions Answered */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center text-[11px] text-slate-600 mb-1">
                        <span>Jawaban: <strong>{st.answeredCount} / {st.totalQuestions}</strong></span>
                        <span className="font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            isLocked ? 'bg-red-500' : isDone ? 'bg-indigo-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Telemetry Detail Grid */}
                    <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-[11px] text-slate-600 flex flex-col gap-1.5 mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Sisa Waktu:</span>
                        <span className="font-mono font-bold flex items-center gap-1 text-slate-800">
                          <Clock size={11} color="#059669" />
                          {isDone ? 'Selesai' : formatTime(st.remainingSeconds)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Status Layar:</span>
                        <span className={`font-semibold flex items-center gap-1 ${st.isFullscreen ? 'text-emerald-700' : 'text-red-600'}`}>
                          {st.isFullscreen ? <Maximize size={11} /> : <AlertTriangle size={11} />}
                          {st.isFullscreen ? 'Fullscreen Aktif' : 'Keluar Fullscreen'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">IP & Peramban:</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[140px]" title={st.browser}>
                          {st.ipAddress}
                        </span>
                      </div>

                      {st.lastIncidentReason && (
                        <div className="mt-1 pt-1 border-t border-slate-200 text-[10px] text-amber-700 font-medium">
                          ⚠️ {st.lastIncidentReason}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supervisor Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                    {isLocked ? (
                      <Button
                        variant="primary"
                        size="sm"
                        icon={Unlock}
                        onClick={() => {
                          setSelectedStudentForAction(st);
                          setShowResetModal(true);
                        }}
                        className="flex-1 text-[11px] py-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Buka Kunci
                      </Button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedStudentForAction(st);
                            setShowWarningModal(true);
                          }}
                          className="flex-1 text-xs py-1 px-2 rounded font-medium bg-slate-100 hover:bg-amber-100 hover:text-amber-800 text-slate-700 transition-all border border-slate-200"
                        >
                          Peringatan
                        </button>
                        
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => handleForceSubmitStudent(st)}
                            className="text-xs py-1 px-2 rounded font-medium bg-red-50 hover:bg-red-100 text-red-700 transition-all border border-red-200"
                            title="Kumpulkan paksa lembar ujian"
                          >
                            Submit Paksa
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentForAction(st);
                        setShowForensicModal(true);
                      }}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                      title="Lihat Log Forensik Ujian"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE INCIDENT FORENSIC FEED */}
        <div className="flex flex-col gap-4">
          <Card className="sticky top-4">
            <CardHeader className="bg-slate-900 text-white rounded-t-xl py-3 px-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} color="#fbbf24" />
                  <h3 className="font-bold text-xs text-white tracking-wide uppercase">
                    Forensik Pelanggaran Live
                  </h3>
                </div>
                <Badge variant="warning" style={{ fontSize: '10px' }}>
                  {incidents.length} Rekaman
                </Badge>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              <div className="p-3 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-500">
                Memantau perpindahan tab, shortcut terlarang, status fullscreen, dan anomali browser secara real-time.
              </div>

              {/* Feed Stream */}
              <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-100 p-2">
                {incidents.map((inc) => {
                  let badgeBg = 'bg-slate-100 text-slate-700 border-slate-200';
                  let icon = <Info size={12} />;

                  if (inc.severity === 'critical') {
                    badgeBg = 'bg-red-100 text-red-800 border-red-200 font-bold';
                    icon = <Lock size={12} color="#dc2626" />;
                  } else if (inc.severity === 'high') {
                    badgeBg = 'bg-red-50 text-red-700 border-red-200';
                    icon = <ShieldAlert size={12} color="#ef4444" />;
                  } else if (inc.severity === 'medium') {
                    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
                    icon = <AlertTriangle size={12} color="#f59e0b" />;
                  }

                  return (
                    <div key={inc.id} className="p-2.5 hover:bg-slate-50 rounded-lg transition-all text-xs">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 text-[11px]">
                          {inc.studentName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inc.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-1.5">
                        {inc.details}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] border flex items-center gap-1 ${badgeBg}`}>
                          {icon} {inc.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {inc.studentNim}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security Guard Parameter Info */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-b-xl text-[10px] flex flex-col gap-1 border-t border-slate-800">
                <div className="flex justify-between">
                  <span>Maks. Toleransi Layar:</span>
                  <span className="font-bold text-amber-400">3 Kali Pelanggaran</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Force-Submit:</span>
                  <span className="font-bold text-emerald-400">AKTIF (Auto Save & Nilai)</span>
                </div>
                <div className="flex justify-between">
                  <span>Anti-Inspect & Copy Lock:</span>
                  <span className="font-bold text-emerald-400">AKTIF</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: RESET VIOLATION & UNLOCK EXAM
          ========================================================================= */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Buka Kunci Ujian & Reset Toleransi"
        maxWidth="540px"
      >
        {selectedStudentForAction && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-900">
              <div className="flex items-center gap-2 font-bold mb-1">
                <AlertTriangle size={16} /> Konfirmasi Buka Kunci Layar
              </div>
              <p>
                Mahasiswa <strong>{selectedStudentForAction.studentName}</strong> (NIM: {selectedStudentForAction.studentNim}) sebelumnya telah terkunci karena mencapai batas 3x pelanggaran.
              </p>
            </div>

            <p className="text-slate-600 leading-relaxed">
              Mereset pelanggaran akan memulihkan kuota toleransi menjadi <strong>0/3</strong> dan mengizinkan mahasiswa melanjutkan pengerjaan soal ujian dari titik terakhir jawaban tersimpan.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setShowResetModal(false)}>
                Batal
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={Unlock} 
                onClick={() => handleResetViolation(selectedStudentForAction)}
                style={{ backgroundColor: '#059669' }}
              >
                Buka Kunci & Beri Kesempatan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          MODAL 2: SEND PRIVATE WARNING
          ========================================================================= */}
      <Modal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title={`Kirim Peringatan ke ${selectedStudentForAction?.studentName}`}
        maxWidth="540px"
      >
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-slate-600">
            Pesan ini akan muncul seketika sebagai modal dialog interaktif di layar ujian mahasiswa yang bersangkutan.
          </p>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Pesan Peringatan Dosen Pengawas:</label>
            <textarea
              rows={3}
              value={warningMessage}
              onChange={(e) => setWarningMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setShowWarningModal(false)}>
              Batal
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Send} 
              onClick={handleSendPrivateWarning}
              style={{ backgroundColor: '#059669' }}
            >
              Kirim ke Layar Mahasiswa
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 3: BROADCAST ANNOUNCEMENT TO ALL STUDENTS
          ========================================================================= */}
      <Modal
        isOpen={showBroadcastModal}
        onClose={() => setShowBroadcastModal(false)}
        title="Siarkan Pengumuman Massal ke Seluruh Peserta"
        maxWidth="540px"
      >
        <div className="flex flex-col gap-4 text-xs">
          <p className="text-slate-600">
            Pemberitahuan ini akan langsung disiarkan ke <strong>seluruh {totalStudents} mahasiswa</strong> yang sedang aktif membuka lembar CBT ujian.
          </p>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Isi Pengumuman / Peringatan Waktu:</label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button variant="outline" size="sm" onClick={() => setShowBroadcastModal(false)}>
              Batal
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              icon={Send} 
              onClick={handleBroadcastMessage}
              style={{ backgroundColor: '#059669' }}
            >
              Siarkan Sekarang
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL 4: FORENSIC AUDIT DETAIL
          ========================================================================= */}
      <Modal
        isOpen={showForensicModal}
        onClose={() => setShowForensicModal(false)}
        title={`Audit Forensik Ujian: ${selectedStudentForAction?.studentName}`}
        maxWidth="720px"
      >
        {selectedStudentForAction && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px]">NIM:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudentForAction.studentNim}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Alamat IP:</span>
                <span className="font-mono font-bold text-slate-800">{selectedStudentForAction.ipAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Peramban (Browser):</span>
                <span className="font-bold text-slate-800">{selectedStudentForAction.browser}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Status Ujian:</span>
                <Badge variant={selectedStudentForAction.status === 'SEDANG_DIKERJAKAN' ? 'success' : 'warning'}>
                  {selectedStudentForAction.status}
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2">Linimasa Rekaman Audit CBT:</h4>
              <div className="bg-slate-900 text-slate-200 rounded-lg p-3 font-mono text-[11px] max-h-60 overflow-y-auto flex flex-col gap-1.5">
                <div>[15:00:00] Autentikasi sesi ujian berhasil (Token JWT tervalidasi).</div>
                <div>[15:00:05] Pakta Integritas disetujui & Fullscreen API diaktifkan.</div>
                <div>[15:10:22] Jawaban Butir #1 s.d #10 otomatis tersimpan di server.</div>
                {selectedStudentForAction.violationCount > 0 && (
                  <div className="text-amber-400">
                    [15:26:12] PERINGATAN: Peramban kehilangan fokus layar (Blur/Tab switch).
                  </div>
                )}
                {selectedStudentForAction.violationCount >= 3 && (
                  <div className="text-red-400 font-bold">
                    [15:28:10] DISKUALIFIKASI: Akumulasi 3 pelanggaran layar. Sesi dikumpulkan paksa.
                  </div>
                )}
                <div className="text-emerald-400">[15:30:00] Heartbeat koneksi aktif (Latensi: 24 ms).</div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <Button variant="secondary" size="sm" onClick={() => setShowForensicModal(false)}>
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
