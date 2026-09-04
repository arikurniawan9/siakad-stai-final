import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, 
  Calendar, 
  FileText, 
  Printer, 
  Edit3, 
  Search, 
  Award,
  FileSpreadsheet,
  BookOpen,
  Users,
  UserCheck,
  HeartPulse,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  GraduationCap,
  Layers,
  Percent,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { academicService } from '../../services/academicService';
import { learningService } from '../../services/learningService';
import { attendanceService } from '../../services/attendanceService';
import { exportAttendanceMeetingExcel, exportSemesterRecapMatrixExcel } from '../../utils/excelUtils';
import { DynamicQrModal } from '../../components/attendance/DynamicQrModal';
import { StudentAttendanceModal } from '../../components/attendance/StudentAttendanceModal';
import { 
  MeetingAttendanceData, 
  ClassAttendanceSummaryData, 
  StudentCourseAttendanceHistory,
  AttendanceStatus,
  LearningDeliveryMode
} from '../../types/attendance';
import { AcademicClass } from '../../types/academic';
import { CourseMeeting } from '../../types/learning';

// Helper: Generate Avatar Color from Name
function getAvatarGradient(name: string): string {
  const gradients = [
    'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
    'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
    'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)',
    'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)'
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// Helper: Get Initials
function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const PresensiPerkuliahanPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';

  // Classes & Meetings state
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [meetings, setMeetings] = useState<CourseMeeting[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');

  // Active Meeting Attendance Data
  const [sessionData, setSessionData] = useState<MeetingAttendanceData | null>(null);
  const [classSummary, setClassSummary] = useState<ClassAttendanceSummaryData | null>(null);
  const [studentHistory, setStudentHistory] = useState<StudentCourseAttendanceHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active View Tabs
  const [activeTab, setActiveTab] = useState<'pertemuan' | 'rekap' | 'riwayat'>('pertemuan');

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isStudentScanModalOpen, setIsStudentScanModalOpen] = useState<boolean>(false);
  const [isBapModalOpen, setIsBapModalOpen] = useState<boolean>(false);
  const [isManualEditModalOpen, setIsManualEditModalOpen] = useState<boolean>(false);
  const [isPrintBapModalOpen, setIsPrintBapModalOpen] = useState<boolean>(false);
  const [isPrintRecapModalOpen, setIsPrintRecapModalOpen] = useState<boolean>(false);

  // Form States
  const [bapJournalText, setBapJournalText] = useState<string>('');
  const [bapNotesText, setBapNotesText] = useState<string>('');
  const [deliveryMode, setDeliveryMode] = useState<LearningDeliveryMode>('TATAP_MUKA');
  
  // Selected Student for manual edit
  const [editingStudent, setEditingStudent] = useState<{
    studentId: string;
    studentName: string;
    studentNim: string;
    status: AttendanceStatus;
    notes: string;
  } | null>(null);

  // Search & Filters in Meeting Attendance table (Tab 1)
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');

  // Search & Filters in Semester Recap table (Tab 2)
  const [recapSearch, setRecapSearch] = useState<string>('');
  const [recapEligibilityFilter, setRecapEligibilityFilter] = useState<'SEMUA' | 'LAYAK' | 'DISPENSASI'>('SEMUA');

  // Load Initial Data
  useEffect(() => {
    loadClasses();
    if (isStudent) {
      loadStudentHistory();
    }
  }, [user]);

  const loadClasses = () => {
    const clsList = academicService.getClasses();
    setClasses(clsList);
    if (clsList.length > 0 && !selectedClassId) {
      setSelectedClassId(clsList[0].id);
    }
  };

  const loadStudentHistory = async () => {
    try {
      const hist = await attendanceService.getStudentHistory();
      setStudentHistory(hist);
    } catch {
      // Fallback
    }
  };

  // When selected class changes, load its meetings
  useEffect(() => {
    if (!selectedClassId) return;

    const mtgs = learningService.getMeetingsByClass(selectedClassId, isStudent);
    setMeetings(mtgs);

    if (mtgs.length > 0) {
      setSelectedMeetingId(mtgs[0].id);
    } else {
      setSelectedMeetingId('');
      setSessionData(null);
    }

    loadClassSummary(selectedClassId);
  }, [selectedClassId]);

  // When selected meeting changes, load its attendance session
  useEffect(() => {
    if (!selectedMeetingId) return;
    loadMeetingSession(selectedMeetingId);
  }, [selectedMeetingId]);

  const loadMeetingSession = async (meetingId: string) => {
    try {
      setIsLoading(true);
      const data = await attendanceService.getMeetingSession(meetingId);
      setSessionData(data);
      setBapJournalText(data.session.teachingJournal || data.meeting.topic || '');
      setBapNotesText(data.session.journalNotes || '');
      setDeliveryMode(data.session.deliveryMode || 'TATAP_MUKA');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClassSummary = async (classId: string) => {
    try {
      const summary = await attendanceService.getClassSummary(classId);
      setClassSummary(summary);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Meeting Navigation Helpers
  const currentMeetingIndex = meetings.findIndex(m => m.id === selectedMeetingId);
  const handlePrevMeeting = () => {
    if (currentMeetingIndex > 0) {
      setSelectedMeetingId(meetings[currentMeetingIndex - 1].id);
    }
  };
  const handleNextMeeting = () => {
    if (currentMeetingIndex < meetings.length - 1) {
      setSelectedMeetingId(meetings[currentMeetingIndex + 1].id);
    }
  };

  // =========================================================================
  // HANDLERS: DOSEN ACTIONS
  // =========================================================================

  const handleOpenQrSession = async () => {
    if (!selectedMeetingId) return;
    try {
      await attendanceService.openSession(selectedMeetingId, {
        deliveryMode,
        teachingJournal: bapJournalText
      });
      toast.success('Sesi Presensi Berhasil Dibuka', 'QR Code dinamis dan kode presensi 6-digit kini aktif.');
      await loadMeetingSession(selectedMeetingId);
      setIsQrModalOpen(true);
    } catch (err: any) {
      toast.danger('Gagal Membuka Sesi', err.message);
    }
  };

  const handleRefreshQrToken = async () => {
    if (!selectedMeetingId) return;
    try {
      await attendanceService.refreshQrToken(selectedMeetingId);
      await loadMeetingSession(selectedMeetingId);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCloseSession = async () => {
    if (!selectedMeetingId) return;
    try {
      await attendanceService.closeSession(selectedMeetingId, {
        teachingJournal: bapJournalText,
        journalNotes: bapNotesText
      });
      toast.success('Sesi Presensi Ditutup', 'Rekapitulasi kehadiran telah dikunci dan BAP tersimpan.');
      setIsQrModalOpen(false);
      await loadMeetingSession(selectedMeetingId);
      await loadClassSummary(selectedClassId);
    } catch (err: any) {
      toast.danger('Gagal Menutup Sesi', err.message);
    }
  };

  const handleSaveBap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingId) return;
    try {
      await attendanceService.closeSession(selectedMeetingId, {
        teachingJournal: bapJournalText,
        journalNotes: bapNotesText
      });
      toast.success('BAP Tersimpan', 'Berita Acara Perkuliahan dan catatan sesi berhasil diperbarui.');
      setIsBapModalOpen(false);
      await loadMeetingSession(selectedMeetingId);
    } catch (err: any) {
      toast.danger('Gagal Menyimpan BAP', err.message);
    }
  };

  const handleOpenManualEdit = (student: any) => {
    setEditingStudent({
      studentId: student.studentId,
      studentName: student.studentName,
      studentNim: student.studentNim,
      status: student.status,
      notes: student.notes || ''
    });
    setIsManualEditModalOpen(true);
  };

  const handleSaveManualEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !selectedMeetingId) return;

    try {
      await attendanceService.updateStudentManual(selectedMeetingId, editingStudent.studentId, {
        status: editingStudent.status,
        notes: editingStudent.notes
      });
      toast.success('Presensi Diperbarui', `Status ${editingStudent.studentName} diubah menjadi ${editingStudent.status}.`);
      setIsManualEditModalOpen(false);
      setEditingStudent(null);
      await loadMeetingSession(selectedMeetingId);
      await loadClassSummary(selectedClassId);
    } catch (err: any) {
      toast.danger('Gagal Memperbarui', err.message);
    }
  };

  // Quick Action: Mark All as HADIR
  const handleMarkAllPresent = async () => {
    if (!sessionData || !selectedMeetingId) return;
    try {
      setIsLoading(true);
      const unpresentStudents = sessionData.students.filter(s => s.status === 'ALPA');
      for (const st of unpresentStudents) {
        await attendanceService.updateStudentManual(selectedMeetingId, st.studentId, {
          status: 'HADIR',
          notes: 'Dispensasi Hadir Keseluruhan'
        });
      }
      toast.success('Semua Hadir', `${unpresentStudents.length} mahasiswa berstatus Alpa telah ditandai Hadir.`);
      await loadMeetingSession(selectedMeetingId);
      await loadClassSummary(selectedClassId);
    } catch (err: any) {
      toast.danger('Gagal Menandai Hadir', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Export Excel (.xlsx) for Sesi Pertemuan (Tab 1)
  const handleExportExcel = () => {
    if (!sessionData) return;
    try {
      exportAttendanceMeetingExcel(sessionData, filteredStudents);
      toast.success('Ekspor Excel Berhasil', `Berkas Excel presensi pertemuan #${sessionData.meeting.meetingNumber} berhasil diunduh.`);
    } catch (err: any) {
      toast.danger('Gagal Ekspor Excel', err.message);
    }
  };

  // Export Excel (.xlsx) for Semester Recap Matrix (Tab 2)
  const handleExportRecapExcel = () => {
    if (!classSummary) return;
    try {
      exportSemesterRecapMatrixExcel(classSummary, filteredRecapRows, recapStats);
      toast.success('Ekspor Excel Berhasil', `Berkas Excel matriks rekapitulasi semester kelas ${classSummary.classInfo.name} berhasil diunduh.`);
    } catch (err: any) {
      toast.danger('Gagal Ekspor Excel', err.message);
    }
  };

  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

  // Filtered Students list (Tab 1)
  const filteredStudents = useMemo(() => {
    if (!sessionData?.students) return [];
    return sessionData.students.filter(s => {
      const matchSearch = s.studentName.toLowerCase().includes(studentSearch.toLowerCase()) || s.studentNim.includes(studentSearch);
      const matchStatus = statusFilter === 'SEMUA' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sessionData?.students, studentSearch, statusFilter]);

  // Status Badge Counts (Tab 1)
  const statusCounts = useMemo(() => {
    if (!sessionData?.students) return { total: 0, hadir: 0, sakit: 0, izin: 0, alpa: 0 };
    return {
      total: sessionData.students.length,
      hadir: sessionData.students.filter(s => s.status === 'HADIR').length,
      sakit: sessionData.students.filter(s => s.status === 'SAKIT').length,
      izin: sessionData.students.filter(s => s.status === 'IZIN').length,
      alpa: sessionData.students.filter(s => s.status === 'ALPA').length
    };
  }, [sessionData?.students]);

  // Filtered Recap Rows & Stats (Tab 2)
  const filteredRecapRows = useMemo(() => {
    if (!classSummary?.recap) return [];
    return classSummary.recap.filter(r => {
      const matchSearch = r.studentName.toLowerCase().includes(recapSearch.toLowerCase()) || r.studentNim.includes(recapSearch);
      const matchEligibility = 
        recapEligibilityFilter === 'SEMUA' ||
        (recapEligibilityFilter === 'LAYAK' && r.isEligibleForExam) ||
        (recapEligibilityFilter === 'DISPENSASI' && !r.isEligibleForExam);
      return matchSearch && matchEligibility;
    });
  }, [classSummary?.recap, recapSearch, recapEligibilityFilter]);

  const recapStats = useMemo(() => {
    if (!classSummary?.recap || classSummary.recap.length === 0) {
      return { totalStudents: 0, eligibleCount: 0, dispensationCount: 0, avgPercentage: 0, eligibleRate: 0 };
    }
    const total = classSummary.recap.length;
    const eligible = classSummary.recap.filter(r => r.isEligibleForExam).length;
    const dispensation = total - eligible;
    const avg = Math.round(classSummary.recap.reduce((acc, r) => acc + r.percentage, 0) / total);
    const eligibleRate = Math.round((eligible / total) * 100);

    return {
      totalStudents: total,
      eligibleCount: eligible,
      dispensationCount: dispensation,
      avgPercentage: avg,
      eligibleRate
    };
  }, [classSummary?.recap]);

  return (
    <div className="flex flex-col gap-6">
      {/* =====================================================================
          HERO & CONTEXT HEADER
          ===================================================================== */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          color: 'white',
          boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background watermark */}
        <div 
          style={{
            position: 'absolute',
            right: '-20px',
            bottom: '-30px',
            opacity: 0.08,
            pointerEvents: 'none',
            transform: 'rotate(-10deg)'
          }}
        >
          <GraduationCap size={240} color="#ffffff" />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <ShieldCheck size={13} />
                STAI Al-Ittihad Cianjur
              </span>
              <span 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500
                }}
              >
                T.A. 2026/2027 Ganjil
              </span>
            </div>

            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
              Presensi & Kehadiran Perkuliahan
            </h1>
            <p style={{ fontSize: 'var(--text-sm)', color: '#d1fae5', marginTop: '4px', maxWidth: '650px', lineHeight: 1.5 }}>
              {isStudent 
                ? 'Pindai QR code dinamis proyektor, masukkan 6-digit passcode sesi, atau ajukan surat izin/sakit resmi.' 
                : 'Pencatatan kehadiran presisi dengan dynamic rotating QR code, passcode proyektor, validasi kelayakan UAS 75%, dan Berita Acara Perkuliahan (BAP).'}
            </p>
          </div>

          {/* Action Hub in Hero */}
          <div className="flex flex-wrap items-center gap-3">
            {isStudent && selectedMeeting && (
              <Button
                variant="primary"
                size="lg"
                icon={QrCode}
                onClick={() => setIsStudentScanModalOpen(true)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#065f46',
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}
              >
                Presensi Sekarang
              </Button>
            )}

            {isLecturer && sessionData && (
              <>
                {sessionData.session.sessionStatus === 'DIBUKA' ? (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={QrCode}
                    onClick={() => setIsQrModalOpen(true)}
                    style={{
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      fontWeight: 700,
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                    }}
                  >
                    Buka Layar QR Proyektor
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    icon={QrCode}
                    onClick={handleOpenQrSession}
                    style={{
                      backgroundColor: '#ffffff',
                      color: '#065f46',
                      fontWeight: 700,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                  >
                    Buka Sesi Presensi
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="md"
                  icon={Printer}
                  onClick={() => setIsPrintBapModalOpen(true)}
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  Cetak BAP
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================================
          COURSE & MEETING SELECTOR BAR
          ===================================================================== */}
      <Card style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* 1. Pilih Kelas (5 Cols) */}
            <div className="lg:col-span-5">
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <BookOpen size={14} color="var(--color-primary-600)" />
                Mata Kuliah & Rombel Kelas:
              </label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.courseName || c.name} — Kelas {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pilih Pertemuan dengan Navigasi Cepat (4 Cols) */}
            <div className="lg:col-span-4">
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={14} color="var(--color-primary-600)" />
                Sesi Pertemuan Perkuliahan:
              </label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronLeft}
                  onClick={handlePrevMeeting}
                  disabled={currentMeetingIndex <= 0}
                  title="Pertemuan Sebelumnya"
                  style={{ padding: '8px' }}
                />
                <select
                  className="form-select"
                  value={selectedMeetingId}
                  onChange={(e) => setSelectedMeetingId(e.target.value)}
                  disabled={meetings.length === 0}
                  style={{ fontWeight: 500, fontSize: 'var(--text-sm)', flex: 1 }}
                >
                  {meetings.length === 0 ? (
                    <option value="">Belum ada pertemuan perkuliahan</option>
                  ) : (
                    meetings.map(m => (
                      <option key={m.id} value={m.id}>
                        Pertemuan #{m.meetingNumber} — {m.title} ({m.scheduledDate})
                      </option>
                    ))
                  )}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  icon={ChevronRight}
                  onClick={handleNextMeeting}
                  disabled={currentMeetingIndex >= meetings.length - 1}
                  title="Pertemuan Berikutnya"
                  style={{ padding: '8px' }}
                />
              </div>
            </div>

            {/* 3. Status Sesi Presensi Live Indicator (3 Cols) */}
            <div className="lg:col-span-3 flex lg:justify-end items-center">
              {sessionData && (
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 
                      sessionData.session.sessionStatus === 'DIBUKA' ? 'var(--color-success-bg)' :
                      sessionData.session.sessionStatus === 'DITUTUP' ? 'var(--color-slate-100)' : 'var(--color-warning-bg)',
                    border: `1px solid ${
                      sessionData.session.sessionStatus === 'DIBUKA' ? 'var(--color-success-border)' :
                      sessionData.session.sessionStatus === 'DITUTUP' ? 'var(--border-default)' : 'var(--color-warning-border)'
                    }`,
                    width: '100%'
                  }}
                >
                  <div 
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 
                        sessionData.session.sessionStatus === 'DIBUKA' ? 'var(--color-success-main)' :
                        sessionData.session.sessionStatus === 'DITUTUP' ? 'var(--color-slate-500)' : 'var(--color-warning-main)',
                      boxShadow: sessionData.session.sessionStatus === 'DIBUKA' ? '0 0 0 3px rgba(22, 163, 74, 0.25)' : 'none'
                    }}
                  />
                  <div className="flex flex-col">
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                      Status Sesi
                    </span>
                    <span 
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        color: 
                          sessionData.session.sessionStatus === 'DIBUKA' ? 'var(--color-success-dark)' :
                          sessionData.session.sessionStatus === 'DITUTUP' ? 'var(--color-slate-700)' : 'var(--color-warning-dark)'
                      }}
                    >
                      {sessionData.session.sessionStatus === 'DIBUKA' ? '🟢 Sesi Aktif / Dibuka' :
                       sessionData.session.sessionStatus === 'DITUTUP' ? '🔒 Sesi Ditutup' : '⏳ Belum Dibuka'}
                    </span>
                  </div>
                  {sessionData.session.passcode && (
                    <div className="ml-auto text-right">
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Passcode</span>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)' }}>
                        {sessionData.session.passcode}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =====================================================================
          NAVIGATION TABS
          ===================================================================== */}
      <div className="tabs-nav-container" style={{ borderBottom: '2px solid var(--border-subtle)', paddingBottom: '2px' }}>
        <Button
          variant={activeTab === 'pertemuan' ? 'primary' : 'ghost'}
          size="sm"
          icon={Calendar}
          onClick={() => setActiveTab('pertemuan')}
          style={{ fontWeight: activeTab === 'pertemuan' ? 700 : 500 }}
        >
          Presensi Sesi Pertemuan
        </Button>
        <Button
          variant={activeTab === 'rekap' ? 'primary' : 'ghost'}
          size="sm"
          icon={FileSpreadsheet}
          onClick={() => setActiveTab('rekap')}
          style={{ fontWeight: activeTab === 'rekap' ? 700 : 500 }}
        >
          Rekapitulasi Semester & Kelayakan UAS (75%)
        </Button>
        {isStudent && (
          <Button
            variant={activeTab === 'riwayat' ? 'primary' : 'ghost'}
            size="sm"
            icon={Award}
            onClick={() => setActiveTab('riwayat')}
            style={{ fontWeight: activeTab === 'riwayat' ? 700 : 500 }}
          >
            Riwayat Presensi Semua MK
          </Button>
        )}
      </div>

      {/* =====================================================================
          TAB 1: PRESENSI SESI PERTEMUAN
          ===================================================================== */}
      {activeTab === 'pertemuan' && sessionData && (
        <div className="flex flex-col gap-6">
          {/* METRIC KPI DASHBOARD CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Hadir */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserCheck size={26} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Mahasiswa Hadir
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                    {sessionData.summary.countHadir}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    / {sessionData.summary.totalStudents} Mhs
                  </span>
                </div>
                <div style={{ height: '4px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', marginTop: '6px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${sessionData.summary.attendancePercentage}%`, 
                      backgroundColor: 'var(--color-primary-600)',
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease'
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Sakit & Izin */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-info-bg)',
                  color: 'var(--color-info-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <HeartPulse size={26} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Izin & Sakit Resmi
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-info-dark)' }}>
                    {sessionData.summary.countSakit + sessionData.summary.countIzin}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    ({sessionData.summary.countSakit} Sakit • {sessionData.summary.countIzin} Izin)
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Disertai surat / berkas keterangan
                </div>
              </div>
            </div>

            {/* Card 3: Alpa / Belum Absen */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-danger-bg)',
                  color: 'var(--color-danger-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserX size={26} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Alpa / Belum Hadir
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-danger-dark)' }}>
                    {sessionData.summary.countAlpa}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Mahasiswa
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-danger-main)', marginTop: '4px' }}>
                  Tanpa konfirmasi kehadiran
                </div>
              </div>
            </div>

            {/* Card 4: Persentase Kehadiran */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: sessionData.summary.attendancePercentage >= 75 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                  color: sessionData.summary.attendancePercentage >= 75 ? 'var(--color-success-main)' : 'var(--color-warning-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={26} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Tingkat Partisipasi
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span 
                    style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 800, 
                      color: sessionData.summary.attendancePercentage >= 75 ? 'var(--color-success-dark)' : 'var(--color-warning-dark)' 
                    }}
                  >
                    {sessionData.summary.attendancePercentage}%
                  </span>
                  <Badge 
                    variant={sessionData.summary.attendancePercentage >= 75 ? 'success' : 'warning'}
                    style={{ fontSize: '10px' }}
                  >
                    {sessionData.summary.attendancePercentage >= 75 ? 'Optimal' : 'Di Bawah 75%'}
                  </Badge>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Ambang batas kelayakan UAS: 75%
                </div>
              </div>
            </div>
          </div>

          {/* REALISASI MATERI / BAP JOURNAL BANNER */}
          {sessionData.session.teachingJournal && (
            <div 
              style={{
                backgroundColor: 'var(--color-primary-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-primary-200)',
                padding: 'var(--space-4)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div 
                style={{
                  padding: '6px',
                  backgroundColor: 'var(--color-primary-100)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-primary-800)',
                  marginTop: '2px'
                }}
              >
                <BookOpen size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-primary-900)', textTransform: 'uppercase' }}>
                    Realisasi Pokok Bahasan & Berita Acara Perkuliahan:
                  </span>
                  {isLecturer && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Edit3}
                      onClick={() => setIsBapModalOpen(true)}
                      style={{ fontSize: 'var(--text-xs)', height: '26px' }}
                    >
                      Ubah BAP
                    </Button>
                  )}
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-950)', margin: '4px 0 0', lineHeight: 1.5 }}>
                  {sessionData.session.teachingJournal}
                </p>
                {sessionData.session.journalNotes && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', marginTop: '4px', fontStyle: 'italic' }}>
                    Catatan Khusus: {sessionData.session.journalNotes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DAFTAR PRESENSI MAHASISWA TABLE */}
          <Card style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <CardHeader style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                      Daftar Presensi Mahasiswa
                    </CardTitle>
                    <span 
                      style={{
                        backgroundColor: 'var(--color-primary-100)',
                        color: 'var(--color-primary-800)',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {filteredStudents.length} Mahasiswa
                    </span>
                  </div>
                  <CardSubtitle style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Pertemuan #{sessionData.meeting.meetingNumber} — {sessionData.meeting.title} ({sessionData.meeting.scheduledDate})
                  </CardSubtitle>
                </div>

                {isLecturer && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Check}
                      isLoading={isLoading}
                      onClick={handleMarkAllPresent}
                      title="Tandai semua mahasiswa Alpa menjadi Hadir"
                    >
                      Tandai Semua Hadir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileSpreadsheet}
                      onClick={handleExportExcel}
                      title="Unduh daftar presensi resmi dalam format Excel (.xlsx)"
                    >
                      Ekspor Excel (.xlsx)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FileText}
                      onClick={() => setIsBapModalOpen(true)}
                    >
                      Isi BAP
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            {/* Filter & Search Bar */}
            <div 
              style={{
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: 'var(--color-slate-50)',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { key: 'SEMUA', label: 'Semua', count: statusCounts.total, color: 'var(--text-secondary)' },
                  { key: 'HADIR', label: 'Hadir', count: statusCounts.hadir, color: 'var(--color-success-main)' },
                  { key: 'SAKIT', label: 'Sakit', count: statusCounts.sakit, color: '#0284c7' },
                  { key: 'IZIN', label: 'Izin', count: statusCounts.izin, color: '#d97706' },
                  { key: 'ALPA', label: 'Alpa', count: statusCounts.alpa, color: 'var(--color-danger-main)' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStatusFilter(tab.key)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: statusFilter === tab.key ? 700 : 500,
                      backgroundColor: statusFilter === tab.key ? 'var(--bg-surface)' : 'transparent',
                      color: statusFilter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: statusFilter === tab.key ? '1px solid var(--border-strong)' : '1px solid transparent',
                      boxShadow: statusFilter === tab.key ? 'var(--shadow-xs)' : 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{tab.label}</span>
                    <span 
                      style={{
                        backgroundColor: statusFilter === tab.key ? 'var(--color-slate-100)' : 'rgba(0,0,0,0.05)',
                        color: tab.color,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', width: '260px' }}>
                <Search 
                  size={14} 
                  style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} 
                />
                <input
                  type="text"
                  placeholder="Cari nama mahasiswa / NIM..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 28px 6px 32px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none'
                  }}
                />
                {studentSearch && (
                  <button
                    type="button"
                    onClick={() => setStudentSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* TABLE BODY */}
            <CardBody style={{ padding: 0 }}>
              <div className="table-container" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-slate-50)', borderBottom: '1px solid var(--border-default)' }}>
                      <th style={{ width: '45px', textAlign: 'center', fontSize: 'var(--text-xs)', padding: '10px 8px' }}>No</th>
                      <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px' }}>Mahasiswa & NIM</th>
                      <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px', textAlign: 'center', width: '130px' }}>Status Kehadiran</th>
                      <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px', width: '140px' }}>Metode Rekam</th>
                      <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px', width: '120px' }}>Waktu Presensi</th>
                      <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px' }}>Catatan & Keterangan</th>
                      {isLecturer && (
                        <th style={{ fontSize: 'var(--text-xs)', padding: '10px 12px', textAlign: 'center', width: '80px' }}>
                          Aksi
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td 
                          colSpan={isLecturer ? 7 : 6} 
                          style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users size={36} color="var(--text-disabled)" />
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              Tidak ada data presensi yang sesuai.
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                              Coba ubah kata kunci pencarian atau filter status kehadiran.
                            </p>
                            {(studentSearch || statusFilter !== 'SEMUA') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setStudentSearch(''); setStatusFilter('SEMUA'); }}
                                style={{ marginTop: '8px' }}
                              >
                                Reset Filter
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st, idx) => {
                        const avatarBg = getAvatarGradient(st.studentName);
                        const initials = getInitials(st.studentName);

                        return (
                          <tr 
                            key={st.studentId}
                            style={{
                              borderBottom: '1px solid var(--border-subtle)',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <td style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {idx + 1}
                            </td>

                            <td style={{ padding: '10px 12px' }}>
                              <div className="flex items-center gap-3">
                                <div 
                                  style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: avatarBg,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    flexShrink: 0,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                  }}
                                >
                                  {initials}
                                </div>
                                <div className="flex flex-col">
                                  <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                    {st.studentName}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span 
                                      style={{ 
                                        fontFamily: 'monospace', 
                                        fontSize: '11px', 
                                        fontWeight: 600, 
                                        color: 'var(--color-primary-800)',
                                        backgroundColor: 'var(--color-primary-50)',
                                        padding: '1px 5px',
                                        borderRadius: 'var(--radius-sm)'
                                      }}
                                    >
                                      {st.studentNim}
                                    </span>
                                    {st.studentEmail && (
                                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                        • {st.studentEmail}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                              {st.status === 'HADIR' && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    backgroundColor: 'var(--color-success-bg)',
                                    color: 'var(--color-success-text)',
                                    border: '1px solid var(--color-success-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                >
                                  <CheckCircle2 size={13} color="var(--color-success-main)" />
                                  HADIR
                                </span>
                              )}
                              {st.status === 'SAKIT' && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    backgroundColor: 'var(--color-info-bg)',
                                    color: 'var(--color-info-text)',
                                    border: '1px solid var(--color-info-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                >
                                  <Stethoscope size={13} color="var(--color-info-main)" />
                                  SAKIT
                                </span>
                              )}
                              {st.status === 'IZIN' && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    backgroundColor: 'var(--color-warning-bg)',
                                    color: 'var(--color-warning-text)',
                                    border: '1px solid var(--color-warning-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                >
                                  <Clock size={13} color="var(--color-warning-main)" />
                                  IZIN
                                </span>
                              )}
                              {st.status === 'ALPA' && (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    backgroundColor: 'var(--color-danger-bg)',
                                    color: 'var(--color-danger-text)',
                                    border: '1px solid var(--color-danger-border)',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                >
                                  <AlertCircle size={13} color="var(--color-danger-main)" />
                                  ALPA
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)' }}>
                              {st.method === 'QR_SCAN' ? (
                                <span className="flex items-center gap-1.5" style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
                                  <QrCode size={13} />
                                  QR Proyektor
                                </span>
                              ) : st.method === 'PASSCODE' ? (
                                <span className="flex items-center gap-1.5" style={{ color: '#0284c7', fontWeight: 600 }}>
                                  <Layers size={13} />
                                  Passcode 6-Digit
                                </span>
                              ) : st.method === 'MANUAL_DOSEN' ? (
                                <span className="flex items-center gap-1.5" style={{ color: '#6366f1', fontWeight: 600 }}>
                                  <ShieldCheck size={13} />
                                  Manual Dosen
                                </span>
                              ) : st.method === 'SURAT_IZIN' ? (
                                <span className="flex items-center gap-1.5" style={{ color: '#d97706', fontWeight: 600 }}>
                                  <FileText size={13} />
                                  Surat Izin Resmi
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-disabled)' }}>-</span>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                              {st.recordedAt ? (
                                <div className="flex flex-col">
                                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {new Date(st.recordedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                  </span>
                                  <span style={{ fontSize: '10px' }}>
                                    {new Date(st.recordedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-disabled)' }}>-</span>
                              )}
                            </td>

                            <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)' }}>
                              <div className="flex flex-col gap-1">
                                {st.notes ? (
                                  <span style={{ color: 'var(--text-secondary)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={st.notes}>
                                    {st.notes}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-disabled)' }}>-</span>
                                )}

                                {st.attachmentUrl && (
                                  <a 
                                    href={st.attachmentUrl} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      color: 'var(--color-primary-700)',
                                      backgroundColor: 'var(--color-primary-50)',
                                      padding: '2px 6px',
                                      borderRadius: 'var(--radius-sm)',
                                      width: 'fit-content',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    <ExternalLink size={11} />
                                    Lihat Surat Dokter
                                  </a>
                                )}
                              </div>
                            </td>

                            {isLecturer && (
                              <td style={{ textAlign: 'center', padding: '10px 12px' }}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  icon={Edit3}
                                  onClick={() => handleOpenManualEdit(st)}
                                  title="Ubah Status Kehadiran"
                                  style={{ padding: '6px' }}
                                >
                                  Edit
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>

            <div 
              style={{
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: 'var(--color-slate-50)',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)'
              }}
            >
              <div>
                Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{sessionData.summary.totalStudents}</strong> total mahasiswa
              </div>
              <div className="flex items-center gap-4">
                <span>Persentase Hadir: <strong>{sessionData.summary.attendancePercentage}%</strong></span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 2: REKAPITULASI SEMESTER KELAS & KELAYAKAN UAS (PROFESSIONAL MATRIX)
          ===================================================================== */}
      {activeTab === 'rekap' && classSummary && (
        <div className="flex flex-col gap-6">
          {/* SEMESTER KPI SUMMARY TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tile 1: Total Mahasiswa */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users size={24} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Total Mahasiswa
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-primary-900)' }}>
                    {recapStats.totalStudents}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Terdaftar di Rombel
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {classSummary.meetings.length} Pertemuan Terjadwal
                </div>
              </div>
            </div>

            {/* Tile 2: Rata-Rata Kehadiran Semester */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: recapStats.avgPercentage >= 75 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                  color: recapStats.avgPercentage >= 75 ? 'var(--color-success-main)' : 'var(--color-warning-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Percent size={24} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Rata-Rata Kehadiran
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span 
                    style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 800, 
                      color: recapStats.avgPercentage >= 75 ? 'var(--color-success-dark)' : 'var(--color-warning-dark)' 
                    }}
                  >
                    {recapStats.avgPercentage}%
                  </span>
                  <Badge variant={recapStats.avgPercentage >= 75 ? 'success' : 'warning'} style={{ fontSize: '10px' }}>
                    {recapStats.avgPercentage >= 75 ? 'Memenuhi Standar' : 'Perlu Perhatian'}
                  </Badge>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Akumulasi seluruh mahasiswa
                </div>
              </div>
            </div>

            {/* Tile 3: Layak UAS (>=75%) */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle size={24} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Layak Ujian (UAS)
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--color-success-dark)' }}>
                    {recapStats.eligibleCount}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    ({recapStats.eligibleRate}%)
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-success-main)', marginTop: '4px', fontWeight: 600 }}>
                  Presensi ≥ 75% Statuta STAI
                </div>
              </div>
            </div>

            {/* Tile 4: Perlu Dispensasi (<75%) */}
            <div 
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}
            >
              <div 
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: recapStats.dispensationCount > 0 ? 'var(--color-danger-bg)' : 'var(--color-slate-100)',
                  color: recapStats.dispensationCount > 0 ? 'var(--color-danger-main)' : 'var(--text-disabled)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Perlu Dispensasi
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span 
                    style={{ 
                      fontSize: 'var(--text-2xl)', 
                      fontWeight: 800, 
                      color: recapStats.dispensationCount > 0 ? 'var(--color-danger-dark)' : 'var(--text-muted)' 
                    }}
                  >
                    {recapStats.dispensationCount}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Mahasiswa
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: recapStats.dispensationCount > 0 ? 'var(--color-danger-main)' : 'var(--text-muted)', marginTop: '4px' }}>
                  {recapStats.dispensationCount > 0 ? 'Kehadiran di bawah 75%' : 'Seluruh mahasiswa lolos'}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN MATRIX CARD */}
          <Card style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <CardHeader style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}>
              <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 w-full">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle style={{ fontSize: 'var(--text-lg)', fontWeight: 700, margin: 0 }}>
                      Matriks Rekapitulasi Kehadiran & Kelayakan UAS
                    </CardTitle>
                    <Badge variant="primary" style={{ fontSize: '10px' }}>
                      Syarat UAS: ≥ 75%
                    </Badge>
                  </div>
                  <CardSubtitle style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {classSummary.classInfo.name} — {classSummary.classInfo.courseName} ({classSummary.classInfo.code}) • Dosen: {classSummary.classInfo.lecturerName}
                  </CardSubtitle>
                </div>

                {/* Top Action Buttons for Recap */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={FileSpreadsheet}
                    onClick={handleExportRecapExcel}
                    title="Unduh seluruh matriks semester resmi dalam format Excel (.xlsx)"
                  >
                    Ekspor Excel Matriks (.xlsx)
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Printer}
                    onClick={() => setIsPrintRecapModalOpen(true)}
                    title="Cetak Dokumen Resmi Rekapitulasi Presensi Semester"
                  >
                    Cetak Rekap Resmi
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Filter & Search Bar for Recap */}
            <div 
              style={{
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: 'var(--color-slate-50)',
                borderBottom: '1px solid var(--border-default)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {/* Eligibility Segmented Tabs */}
              <div className="flex flex-wrap items-center gap-1">
                {[
                  { key: 'SEMUA', label: 'Semua Mahasiswa', count: recapStats.totalStudents, color: 'var(--text-secondary)' },
                  { key: 'LAYAK', label: 'Layak UAS (≥75%)', count: recapStats.eligibleCount, color: 'var(--color-success-main)' },
                  { key: 'DISPENSASI', label: 'Perlu Dispensasi (<75%)', count: recapStats.dispensationCount, color: 'var(--color-danger-main)' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setRecapEligibilityFilter(tab.key as any)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)',
                      fontWeight: recapEligibilityFilter === tab.key ? 700 : 500,
                      backgroundColor: recapEligibilityFilter === tab.key ? 'var(--bg-surface)' : 'transparent',
                      color: recapEligibilityFilter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                      border: recapEligibilityFilter === tab.key ? '1px solid var(--border-strong)' : '1px solid transparent',
                      boxShadow: recapEligibilityFilter === tab.key ? 'var(--shadow-xs)' : 'none',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{tab.label}</span>
                    <span 
                      style={{
                        backgroundColor: recapEligibilityFilter === tab.key ? 'var(--color-slate-100)' : 'rgba(0,0,0,0.05)',
                        color: tab.color,
                        padding: '1px 6px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10px',
                        fontWeight: 700
                      }}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search Bar with Clear Button */}
              <div style={{ position: 'relative', width: '260px' }}>
                <Search 
                  size={14} 
                  style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} 
                />
                <input
                  type="text"
                  placeholder="Cari nama / NIM di matriks..."
                  value={recapSearch}
                  onChange={(e) => setRecapSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 28px 6px 32px',
                    fontSize: 'var(--text-xs)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-strong)',
                    backgroundColor: 'var(--bg-surface)',
                    outline: 'none'
                  }}
                />
                {recapSearch && (
                  <button
                    type="button"
                    onClick={() => setRecapSearch('')}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '8px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 0
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* MATRIX TABLE BODY */}
            <CardBody style={{ padding: 0 }}>
              <div className="table-container" style={{ margin: 0, border: 'none', overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: 'var(--text-xs)', width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-slate-50)', borderBottom: '2px solid var(--border-default)' }}>
                      <th style={{ width: '40px', textAlign: 'center', padding: '10px 4px' }}>No</th>
                      <th style={{ width: '100px', padding: '10px 8px' }}>NIM</th>
                      <th style={{ minWidth: '180px', padding: '10px 8px' }}>Nama Mahasiswa</th>
                      
                      {/* Meetings P1 s.d. P16 */}
                      {classSummary.meetings.map(m => (
                        <th 
                          key={m.id} 
                          style={{ 
                            textAlign: 'center', 
                            width: '36px', 
                            padding: '8px 2px',
                            borderLeft: '1px solid var(--border-subtle)',
                            fontWeight: 700,
                            color: 'var(--text-primary)'
                          }} 
                          title={`Pertemuan #${m.meetingNumber}: ${m.title} (${m.scheduledDate})`}
                        >
                          P{m.meetingNumber}
                        </th>
                      ))}

                      {/* Summary Aggregations */}
                      <th style={{ textAlign: 'center', backgroundColor: '#f0fdf4', color: '#166534', fontWeight: 800, width: '38px', borderLeft: '2px solid #bbf7d0' }} title="Total Kehadiran">
                        H
                      </th>
                      <th style={{ textAlign: 'center', backgroundColor: '#f0f9ff', color: '#075985', fontWeight: 800, width: '38px' }} title="Total Sakit">
                        S
                      </th>
                      <th style={{ textAlign: 'center', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 800, width: '38px' }} title="Total Izin">
                        I
                      </th>
                      <th style={{ textAlign: 'center', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 800, width: '38px' }} title="Total Alpa">
                        A
                      </th>

                      {/* Kehadiran & Status UAS */}
                      <th style={{ textAlign: 'center', fontWeight: 800, minWidth: '110px', padding: '10px 8px' }}>
                        % Kehadiran
                      </th>
                      <th style={{ textAlign: 'center', width: '140px', padding: '10px 8px' }}>
                        Kelayakan UAS
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecapRows.length === 0 ? (
                      <tr>
                        <td 
                          colSpan={classSummary.meetings.length + 8} 
                          style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}
                        >
                          <div className="flex flex-col items-center justify-center gap-2">
                            <FileSpreadsheet size={36} color="var(--text-disabled)" />
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                              Tidak ada data rekapitulasi yang sesuai kriteria.
                            </div>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                              Silakan reset filter kelayakan atau kata kunci pencarian.
                            </p>
                            {(recapSearch || recapEligibilityFilter !== 'SEMUA') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setRecapSearch(''); setRecapEligibilityFilter('SEMUA'); }}
                                style={{ marginTop: '8px' }}
                              >
                                Reset Filter
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRecapRows.map((row, idx) => {
                        const avatarBg = getAvatarGradient(row.studentName);
                        const initials = getInitials(row.studentName);

                        return (
                          <tr 
                            key={row.studentId} 
                            style={{ 
                              borderBottom: '1px solid var(--border-subtle)',
                              backgroundColor: !row.isEligibleForExam ? 'rgba(254, 242, 242, 0.4)' : 'transparent',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500 }}>
                              {idx + 1}
                            </td>
                            <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-900)', fontSize: '11px' }}>
                              {row.studentNim}
                            </td>
                            <td style={{ padding: '8px 10px' }}>
                              <div className="flex items-center gap-2">
                                <div 
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    background: avatarBg,
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 700,
                                    flexShrink: 0
                                  }}
                                >
                                  {initials}
                                </div>
                                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
                                  {row.studentName}
                                </span>
                              </div>
                            </td>

                            {/* Meeting Statuses */}
                            {classSummary.meetings.map(m => {
                              const st = row.meetingStatuses[m.meetingNumber];
                              return (
                                <td 
                                  key={m.id} 
                                  style={{ 
                                    textAlign: 'center', 
                                    padding: '4px 2px',
                                    borderLeft: '1px solid var(--border-subtle)'
                                  }}
                                  title={`P#${m.meetingNumber}: ${st || 'ALPA'}`}
                                >
                                  {st === 'HADIR' ? (
                                    <span 
                                      style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: '#dcfce7',
                                        color: '#15803d', 
                                        fontWeight: 800,
                                        fontSize: '11px'
                                      }}
                                    >
                                      ✓
                                    </span>
                                  ) : st === 'SAKIT' ? (
                                    <span 
                                      style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: '#e0f2fe',
                                        color: '#0369a1', 
                                        fontWeight: 800,
                                        fontSize: '11px'
                                      }}
                                    >
                                      S
                                    </span>
                                  ) : st === 'IZIN' ? (
                                    <span 
                                      style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: '#fef3c7',
                                        color: '#b45309', 
                                        fontWeight: 800,
                                        fontSize: '11px'
                                      }}
                                    >
                                      I
                                    </span>
                                  ) : (
                                    <span 
                                      style={{ 
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: 'var(--radius-sm)',
                                        backgroundColor: '#fee2e2',
                                        color: '#b91c1c', 
                                        fontWeight: 800,
                                        fontSize: '11px'
                                      }}
                                    >
                                      ✗
                                    </span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Summary Columns */}
                            <td style={{ textAlign: 'center', fontWeight: 800, backgroundColor: '#f0fdf4', color: '#166534', borderLeft: '2px solid #bbf7d0' }}>
                              {row.hadir}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, backgroundColor: '#f0f9ff', color: '#075985' }}>
                              {row.sakit}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, backgroundColor: '#fffbeb', color: '#92400e' }}>
                              {row.izin}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: '#991b1b', backgroundColor: '#fef2f2' }}>
                              {row.alpa}
                            </td>

                            {/* % Kehadiran with Progress Bar */}
                            <td style={{ padding: '8px 10px' }}>
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center">
                                  <span 
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      color: row.percentage >= 75 ? 'var(--color-success-dark)' : 'var(--color-danger-dark)'
                                    }}
                                  >
                                    {row.percentage}%
                                  </span>
                                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    {row.hadir}/{row.totalMeetings} P
                                  </span>
                                </div>
                                <div style={{ height: '4px', backgroundColor: 'var(--color-slate-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                                  <div 
                                    style={{
                                      height: '100%',
                                      width: `${row.percentage}%`,
                                      backgroundColor: row.percentage >= 75 ? 'var(--color-success-main)' : 'var(--color-danger-main)',
                                      borderRadius: 'var(--radius-full)'
                                    }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Kelayakan UAS Badge */}
                            <td style={{ textAlign: 'center', padding: '8px 10px' }}>
                              {row.isEligibleForExam ? (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: 'var(--color-success-bg)',
                                    color: 'var(--color-success-text)',
                                    border: '1px solid var(--color-success-border)',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '10px',
                                    fontWeight: 700
                                  }}
                                >
                                  <CheckCircle2 size={12} color="var(--color-success-main)" />
                                  LAYAK UAS
                                </span>
                              ) : (
                                <span 
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    backgroundColor: 'var(--color-danger-bg)',
                                    color: 'var(--color-danger-text)',
                                    border: '1px solid var(--color-danger-border)',
                                    padding: '3px 8px',
                                    borderRadius: 'var(--radius-full)',
                                    fontSize: '10px',
                                    fontWeight: 700
                                  }}
                                  title="Kehadiran kurang dari ambang batas 75%"
                                >
                                  <AlertCircle size={12} color="var(--color-danger-main)" />
                                  DISPENSASI
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>

            {/* Matrix Table Footer */}
            <div 
              style={{
                padding: 'var(--space-3) var(--space-5)',
                backgroundColor: 'var(--color-slate-50)',
                borderTop: '1px solid var(--border-default)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                gap: '8px'
              }}
            >
              <div>
                Menampilkan <strong>{filteredRecapRows.length}</strong> dari <strong>{recapStats.totalStudents}</strong> mahasiswa terdaftar
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-main)' }} />
                  Layak UAS: <strong>{recapStats.eligibleCount} ({recapStats.eligibleRate}%)</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-danger-main)' }} />
                  Perlu Dispensasi: <strong>{recapStats.dispensationCount}</strong>
                </span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: RIWAYAT PRESENSI MAHASISWA (STUDENT ONLY)
          ===================================================================== */}
      {activeTab === 'riwayat' && isStudent && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentHistory.map(course => (
            <Card key={course.classId} style={{ border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}>
              <CardHeader style={{ padding: 'var(--space-4)' }}>
                <div>
                  <Badge variant="primary" style={{ marginBottom: '6px', fontSize: '10px' }}>
                    {course.courseCode} • {course.credits} SKS
                  </Badge>
                  <CardTitle style={{ fontSize: 'var(--text-base)', fontWeight: 700 }}>
                    {course.courseName}
                  </CardTitle>
                  <CardSubtitle style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    Kelas {course.className} • Dosen: {course.lecturerName}
                  </CardSubtitle>
                </div>
              </CardHeader>
              <CardBody style={{ padding: '0 var(--space-4) var(--space-4)' }}>
                <div className="flex justify-between items-center mb-3">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Persentase Kehadiran:
                  </span>
                  <Badge 
                    variant={course.percentage >= 75 ? 'success' : 'warning'} 
                    style={{ fontSize: '13px', fontWeight: 800 }}
                  >
                    {course.percentage}%
                  </Badge>
                </div>

                <div 
                  className="grid grid-cols-4 gap-2 text-center" 
                  style={{ 
                    backgroundColor: 'var(--color-slate-50)', 
                    padding: 'var(--space-3)', 
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hadir</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-success-main)', fontSize: 'var(--text-sm)' }}>{course.hadir}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sakit</div>
                    <div style={{ fontWeight: 800, color: '#0284c7', fontSize: 'var(--text-sm)' }}>{course.sakit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Izin</div>
                    <div style={{ fontWeight: 800, color: '#d97706', fontSize: 'var(--text-sm)' }}>{course.izin}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Alpa</div>
                    <div style={{ fontWeight: 800, color: 'var(--color-danger-main)', fontSize: 'var(--text-sm)' }}>{course.alpa}</div>
                  </div>
                </div>

                <div className="flex justify-between items-center w-full mt-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Status Kelayakan UAS:
                  </span>
                  {course.isEligibleForExam ? (
                    <Badge variant="success" icon={CheckCircle2}>Layak Ujian</Badge>
                  ) : (
                    <Badge variant="danger" icon={AlertCircle}>Butuh Dispensasi</Badge>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* =====================================================================
          DYNAMIC QR MODAL (PROJECTOR / FULLSCREEN)
          ===================================================================== */}
      {sessionData && (
        <DynamicQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          meetingNumber={sessionData.meeting.meetingNumber}
          meetingTitle={sessionData.meeting.title}
          courseName={sessionData.meeting.courseName}
          className={sessionData.meeting.className}
          qrToken={sessionData.session.qrToken || ''}
          passcode={sessionData.session.passcode || '849201'}
          attendancePercentage={sessionData.summary.attendancePercentage}
          presentCount={sessionData.summary.countHadir}
          totalStudents={sessionData.summary.totalStudents}
          onRefreshQr={handleRefreshQrToken}
          onCloseSession={handleCloseSession}
        />
      )}

      {/* =====================================================================
          STUDENT ATTENDANCE SCAN / PASSCODE MODAL
          ===================================================================== */}
      {(sessionData?.meeting || selectedMeeting) && (
        <StudentAttendanceModal
          isOpen={isStudentScanModalOpen}
          onClose={() => setIsStudentScanModalOpen(false)}
          meetingId={sessionData?.meeting.id || selectedMeeting?.id || ''}
          meetingNumber={sessionData?.meeting.meetingNumber || selectedMeeting?.meetingNumber || 1}
          meetingTitle={sessionData?.meeting.title || selectedMeeting?.title || ''}
          courseName={sessionData?.meeting.courseName || selectedClass?.courseName || selectedClass?.name || 'Mata Kuliah'}
          className={sessionData?.meeting.className || selectedClass?.name || 'Kelas'}
          sessionStatus={sessionData?.session.sessionStatus || 'BELUM_DIBUKA'}
          onSuccess={() => {
            if (selectedMeetingId) loadMeetingSession(selectedMeetingId);
            if (isStudent) loadStudentHistory();
          }}
        />
      )}

      {/* =====================================================================
          MODAL: EDIT BERITA ACARA PERKULIAHAN (BAP)
          ===================================================================== */}
      <Modal
        isOpen={isBapModalOpen}
        onClose={() => setIsBapModalOpen(false)}
        title="Berita Acara Perkuliahan (BAP) Dosen"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveBap} className="flex flex-col gap-4">
          <Select
            label="Metode / Moda Perkuliahan"
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value as LearningDeliveryMode)}
            options={[
              { value: 'TATAP_MUKA', label: 'Tatap Muka di Ruang Kelas' },
              { value: 'DARING', label: 'Daring / Online Synchronous (Zoom/GMeet)' },
              { value: 'HYBRID', label: 'Hybrid (Sebagian di Kelas, Sebagian Daring)' }
            ]}
          />

          <div className="form-group">
            <label className="form-label">Materi / Bahasan yang Terealisasi</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Rincikan pokok bahasan materi yang telah diajarkan pada sesi pertemuan ini..."
              value={bapJournalText}
              onChange={(e) => setBapJournalText(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Catatan Khusus / Kendala Perkuliahan (Opsional)</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Catatan keaktifan mahasiswa, kendala teknis, atau penugasan lanjutan..."
              value={bapNotesText}
              onChange={(e) => setBapNotesText(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setIsBapModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Simpan Berita Acara
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: MANUAL ATTENDANCE OVERRIDE BY LECTURER
          ===================================================================== */}
      <Modal
        isOpen={isManualEditModalOpen}
        onClose={() => setIsManualEditModalOpen(false)}
        title="Ubah Status Kehadiran Mahasiswa"
        maxWidth="480px"
      >
        {editingStudent && (
          <form onSubmit={handleSaveManualEdit} className="flex flex-col gap-4">
            <div 
              style={{ 
                padding: 'var(--space-3)', 
                backgroundColor: 'var(--color-primary-50)', 
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-primary-200)'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                {editingStudent.studentName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontFamily: 'monospace', marginTop: '2px' }}>
                NIM: {editingStudent.studentNim}
              </div>
            </div>

            <Select
              label="Status Kehadiran"
              value={editingStudent.status}
              onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value as AttendanceStatus })}
              options={[
                { value: 'HADIR', label: 'HADIR' },
                { value: 'SAKIT', label: 'SAKIT' },
                { value: 'IZIN', label: 'IZIN' },
                { value: 'ALPA', label: 'ALPA (Tanpa Keterangan)' }
              ]}
            />

            <Input
              label="Catatan Dosen"
              placeholder="Keterangan dispensasi / verifikasi izin..."
              value={editingStudent.notes}
              onChange={(e) => setEditingStudent({ ...editingStudent, notes: e.target.value })}
            />

            <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              <Button variant="secondary" type="button" onClick={() => setIsManualEditModalOpen(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* =====================================================================
          MODAL: CETAK BAP & DAFTAR HADIR SESI PERTEMUAN (RESMI)
          ===================================================================== */}
      <Modal
        isOpen={isPrintBapModalOpen}
        onClose={() => setIsPrintBapModalOpen(false)}
        title="Pratinjau Cetak Berita Acara Presensi (BAP)"
        maxWidth="820px"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="secondary" onClick={() => setIsPrintBapModalOpen(false)}>
              Tutup
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Cetak Dokumen BAP
            </Button>
          </div>
        }
      >
        {sessionData && (
          <div className="flex flex-col gap-6" style={{ padding: 'var(--space-4)', backgroundColor: 'white', color: '#1f2937' }}>
            <div style={{ textAlign: 'center', borderBottom: '3px double #1f2937', paddingBottom: 'var(--space-3)' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '0.05em', color: '#064e3b' }}>
                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: '#4b5563', fontWeight: 600 }}>
                PUSAT PENJAMINAN MUTU AKADEMIK & PEMBELAJARAN
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#6b7280' }}>
                Jl. Raya Bandung No. 123, Ciranjang, Cianjur, Jawa Barat 43282
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-base)', textTransform: 'uppercase', fontWeight: 800, textDecoration: 'underline', margin: 0 }}>
                BERITA ACARA & DAFTAR HADIR PERKULIAHAN
              </h3>
              <div style={{ fontSize: 'var(--text-xs)', color: '#4b5563', marginTop: '4px' }}>
                Tahun Akademik: 2026/2027 — Semester Ganjil
              </div>
            </div>

            <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700, width: '25%' }}>Mata Kuliah</td>
                  <td style={{ padding: '6px 8px', width: '75%' }}>{sessionData.meeting.courseName} ({sessionData.meeting.classCode})</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700 }}>Pertemuan Ke- / Tanggal</td>
                  <td style={{ padding: '6px 8px' }}>Pertemuan #{sessionData.meeting.meetingNumber} — {sessionData.meeting.scheduledDate} ({sessionData.meeting.startTime}–{sessionData.meeting.endTime} WIB)</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700 }}>Dosen Pengampu</td>
                  <td style={{ padding: '6px 8px' }}>{sessionData.meeting.lecturerName}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700 }}>Pokok Bahasan Materi</td>
                  <td style={{ padding: '6px 8px' }}>{sessionData.session.teachingJournal || sessionData.meeting.topic}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 700 }}>Kehadiran Mahasiswa</td>
                  <td style={{ padding: '6px 8px' }}>{sessionData.summary.countHadir} dari {sessionData.summary.totalStudents} Mahasiswa ({sessionData.summary.attendancePercentage}%)</td>
                </tr>
              </tbody>
            </table>

            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-xs)', marginBottom: '6px' }}>Daftar Presensi Mahasiswa:</div>
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 4px', width: '30px', textAlign: 'center' }}>No</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left', width: '100px' }}>NIM</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Nama Mahasiswa</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'center', width: '80px' }}>Status</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px 8px', textAlign: 'left' }}>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionData.students.map((st, i) => (
                    <tr key={st.studentId}>
                      <td style={{ border: '1px solid #d1d5db', padding: '5px 4px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', fontFamily: 'monospace' }}>{st.studentNim}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', fontWeight: 600 }}>{st.studentName}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '5px 8px', textAlign: 'center', fontWeight: 700 }}>{st.status}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '5px 8px' }}>{st.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', textAlign: 'center' }}>
              <div>
                <div>Mengetahui,</div>
                <div style={{ fontWeight: 700 }}>Ketua Program Studi</div>
                <div style={{ height: '55px' }}></div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>Dr. H. Ahmad Fauzi, M.Pd.I</div>
                <div>NIDN: 21098501</div>
              </div>
              <div>
                <div>Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div style={{ fontWeight: 700 }}>Dosen Pengampu Perkuliahan</div>
                <div style={{ height: '55px' }}></div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{sessionData.meeting.lecturerName}</div>
                <div>NIDN: 21107901</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* =====================================================================
          MODAL: CETAK REKAPITULASI MATRIKS SEMESTER RESMI
          ===================================================================== */}
      <Modal
        isOpen={isPrintRecapModalOpen}
        onClose={() => setIsPrintRecapModalOpen(false)}
        title="Pratinjau Cetak Rekapitulasi Presensi Semester"
        maxWidth="950px"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="secondary" onClick={() => setIsPrintRecapModalOpen(false)}>
              Tutup
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Cetak Rekapitulasi Semester
            </Button>
          </div>
        }
      >
        {classSummary && (
          <div className="flex flex-col gap-5" style={{ padding: 'var(--space-4)', backgroundColor: 'white', color: '#1f2937' }}>
            {/* Kop Surat Institusi */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #1f2937', paddingBottom: 'var(--space-3)' }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', letterSpacing: '0.05em', color: '#064e3b' }}>
                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: '#4b5563', fontWeight: 600 }}>
                BAGIAN ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK)
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#6b7280' }}>
                Jl. Raya Bandung No. 123, Ciranjang, Cianjur, Jawa Barat 43282
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: 'var(--text-base)', textTransform: 'uppercase', fontWeight: 800, textDecoration: 'underline', margin: 0 }}>
                REKAPITULASI PRESENSI & KELAYAKAN UJIAN AKHIR SEMESTER (UAS)
              </h3>
              <div style={{ fontSize: 'var(--text-xs)', color: '#4b5563', marginTop: '4px' }}>
                Tahun Akademik: 2026/2027 — Semester Ganjil • Ambang Batas Minimal: 75%
              </div>
            </div>

            {/* Metadata Matriks */}
            <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700, width: '20%' }}>Mata Kuliah / SKS</td>
                  <td style={{ padding: '5px 8px', width: '40%' }}>{classSummary.classInfo.courseName} ({classSummary.classInfo.code}) • {classSummary.classInfo.credits} SKS</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700, width: '20%' }}>Rombel Kelas</td>
                  <td style={{ padding: '5px 8px', width: '20%' }}>Kelas {classSummary.classInfo.name}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Dosen Pengampu</td>
                  <td style={{ padding: '5px 8px' }}>{classSummary.classInfo.lecturerName}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Total Pertemuan</td>
                  <td style={{ padding: '5px 8px' }}>{classSummary.meetings.length} Sesi Pertemuan</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '5px 8px', fontWeight: 700 }}>Ringkasan Kelayakan</td>
                  <td colSpan={3} style={{ padding: '5px 8px' }}>
                    <strong>{recapStats.eligibleCount}</strong> Layak UAS ({recapStats.eligibleRate}%) • <strong>{recapStats.dispensationCount}</strong> Perlu Dispensasi • Rata-rata Kehadiran: <strong>{recapStats.avgPercentage}%</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Matriks Hadir Full */}
            <div>
              <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 2px', width: '24px', textAlign: 'center' }}>No</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 6px', textAlign: 'left', width: '75px' }}>NIM</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 6px', textAlign: 'left', minWidth: '120px' }}>Nama Mahasiswa</th>
                    {classSummary.meetings.map(m => (
                      <th key={m.id} style={{ border: '1px solid #d1d5db', padding: '4px 1px', textAlign: 'center', width: '22px' }}>
                        P{m.meetingNumber}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 2px', textAlign: 'center', backgroundColor: '#e2fbe8', width: '24px' }}>H</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 2px', textAlign: 'center', backgroundColor: '#e0f2fe', width: '24px' }}>S</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 2px', textAlign: 'center', backgroundColor: '#fef3c7', width: '24px' }}>I</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 2px', textAlign: 'center', backgroundColor: '#fee2e2', width: '24px' }}>A</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 4px', textAlign: 'center', width: '45px' }}>% Hadir</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '4px 6px', textAlign: 'center', width: '80px' }}>Status UAS</th>
                  </tr>
                </thead>
                <tbody>
                  {classSummary.recap.map((row, idx) => (
                    <tr key={row.studentId}>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 2px', textAlign: 'center' }}>{idx + 1}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 6px', fontFamily: 'monospace' }}>{row.studentNim}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 6px', fontWeight: 600 }}>{row.studentName}</td>
                      {classSummary.meetings.map(m => {
                        const st = row.meetingStatuses[m.meetingNumber];
                        return (
                          <td key={m.id} style={{ border: '1px solid #d1d5db', padding: '3px 1px', textAlign: 'center', fontWeight: 700 }}>
                            {st === 'HADIR' ? '✓' : st === 'SAKIT' ? 'S' : st === 'IZIN' ? 'I' : '✗'}
                          </td>
                        );
                      })}
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 2px', textAlign: 'center', fontWeight: 700, backgroundColor: '#f0fdf4' }}>{row.hadir}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 2px', textAlign: 'center', backgroundColor: '#f0f9ff' }}>{row.sakit}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 2px', textAlign: 'center', backgroundColor: '#fffbeb' }}>{row.izin}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 2px', textAlign: 'center', color: '#991b1b', backgroundColor: '#fef2f2' }}>{row.alpa}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 4px', textAlign: 'center', fontWeight: 700 }}>{row.percentage}%</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '3px 6px', textAlign: 'center', fontWeight: 700, color: row.isEligibleForExam ? '#166534' : '#991b1b' }}>
                        {row.isEligibleForExam ? 'LAYAK' : 'DISPENSASI'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signature Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', textAlign: 'center' }}>
              <div>
                <div>Mengetahui,</div>
                <div style={{ fontWeight: 700 }}>Kepala BAAK</div>
                <div style={{ height: '50px' }}></div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>H. Ridwan Malik, M.M.</div>
                <div>NIP: 197805122005011002</div>
              </div>
              <div>
                <div>Menyetujui,</div>
                <div style={{ fontWeight: 700 }}>Ketua Program Studi</div>
                <div style={{ height: '50px' }}></div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>Dr. H. Ahmad Fauzi, M.Pd.I</div>
                <div>NIDN: 21098501</div>
              </div>
              <div>
                <div>Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                <div style={{ fontWeight: 700 }}>Dosen Pengampu Perkuliahan</div>
                <div style={{ height: '50px' }}></div>
                <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{classSummary.classInfo.lecturerName}</div>
                <div>NIDN: 21107901</div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
