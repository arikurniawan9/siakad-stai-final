import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Flag, 
  Save, 
  Maximize, 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  LayoutGrid 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Quiz, QuizAttempt, QuizQuestionItem } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';

export interface QuizTakingPageProps {
  quizId: string;
  onFinish: (attemptId: string) => void;
  onExit: () => void;
}

const MAX_ALLOWED_VIOLATIONS = 3;

export const QuizTakingPage: React.FC<QuizTakingPageProps> = ({ quizId, onFinish, onExit }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileMapModal, setShowMobileMapModal] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);
  const [existingAttempts, setExistingAttempts] = useState<QuizAttempt[]>([]);

  // =========================================================================
  // CBT SECURE LOCKDOWN & FULLSCREEN STATES
  // =========================================================================
  const [isCbtGateOpen, setIsCbtGateOpen] = useState(true); // Pre-exam gate modal
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenOverlay, setShowFullscreenOverlay] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationReason, setViolationReason] = useState<string>('');
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [violationLogs, setViolationLogs] = useState<Array<{ timestamp: string; reason: string }>>([]);

  const cbtContainerRef = useRef<HTMLDivElement>(null);
  const violationCountRef = useRef(0);
  violationCountRef.current = violationCount;

  const isSubmittingRef = useRef(false);
  isSubmittingRef.current = isSubmitting;

  // =========================================================================
  // BROWSER FULLSCREEN API HELPERS
  // =========================================================================
  const requestBrowserFullscreen = useCallback(async () => {
    try {
      const docEl = document.documentElement as any;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) {
        await docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) {
        await docEl.msRequestFullscreen();
      }
      setIsFullscreen(true);
      setShowFullscreenOverlay(false);
    } catch (err) {
      console.warn('Fullscreen request rejected or requires user gesture:', err);
    }
  }, []);

  const exitBrowserFullscreen = useCallback(async () => {
    try {
      const doc = document as any;
      if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          await doc.msExitFullscreen();
        }
      }
      setIsFullscreen(false);
    } catch {
      // Ignore exit errors
    }
  }, []);

  // Check current fullscreen state
  const checkIsFullscreen = useCallback(() => {
    const doc = document as any;
    return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement);
  }, []);

  // Submit attempt handler (Idempotent)
  const handleSubmitQuiz = useCallback((forceReason?: string) => {
    if (!attempt || !user || isSubmittingRef.current) return;
    setIsSubmitting(true);
    try {
      const finished = quizService.submitQuizAttempt(attempt.id, user.id);
      setAttempt(finished);
      setShowSubmitModal(false);
      setShowMobileMapModal(false);
      exitBrowserFullscreen();

      if (forceReason) {
        toast.danger('Ujian Terkumpul Otomatis', forceReason);
      } else {
        toast.success(
          'Ujian Selesai Dikumpulkan',
          finished.status === 'DINILAI' 
            ? `Nilai Akhir Anda: ${finished.finalScore} / 100 (${finished.isPassed ? 'LULUS' : 'BELUM LULUS'})`
            : 'Jawaban esai Anda telah tersimpan dan menunggu penilaian dosen.'
        );
      }

      setTimeout(() => {
        onFinish(finished.id);
      }, 800);
    } catch (err: any) {
      toast.danger('Gagal Mengumpulkan Ujian', err.message);
      setIsSubmitting(false);
    }
  }, [attempt, user, exitBrowserFullscreen, onFinish, toast]);

  // Handle recorded security violation
  const handleSecurityViolation = useCallback((reason: string) => {
    if (isSubmittingRef.current || isCbtGateOpen) return;

    const newCount = violationCountRef.current + 1;
    setViolationCount(newCount);
    violationCountRef.current = newCount;

    const timeStr = new Date().toLocaleTimeString('id-ID');
    setViolationLogs((prev) => [...prev, { timestamp: timeStr, reason }]);
    setViolationReason(reason);

    if (newCount >= MAX_ALLOWED_VIOLATIONS) {
      setIsDisqualified(true);
      setShowViolationModal(true);
      setTimeout(() => {
        handleSubmitQuiz(`Pelanggaran Keamanan CBT (${MAX_ALLOWED_VIOLATIONS}x): ${reason}`);
      }, 2500);
    } else {
      setShowViolationModal(true);
    }
  }, [isCbtGateOpen, handleSubmitQuiz]);

  // Load Quiz & Attempts on Mount
  useEffect(() => {
    if (!user) return;

    try {
      const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa' || user.role === 'administrator_sistem';
      const qz = quizService.getQuizById(quizId);
      if (!qz) {
        toast.danger('Kuis Tidak Ditemukan', 'Kuis yang diminta tidak tersedia.');
        onExit();
        return;
      }

      const pastAttempts = quizService.getStudentAttempts(quizId, user.id);
      setExistingAttempts(pastAttempts);

      if (!isLecturer && pastAttempts.length >= qz.maxAttempts && !pastAttempts.some((a) => a.status === 'SEDANG_DIKERJAKAN')) {
        setMaxAttemptsReached(true);
        setQuiz(qz);
        return;
      }

      setQuiz(qz);

      // Start or Resume Attempt
      const studentNim = (user as any).nim || user.username || '00000000';
      const currentAttempt = quizService.startQuizAttempt(quizId, user.id, studentNim, user.name);
      setAttempt(currentAttempt);

      // Calculate remaining time
      const startTime = new Date(currentAttempt.startedAt).getTime();
      const durationMs = qz.durationMinutes * 60 * 1000;
      const elapsedMs = Date.now() - startTime;
      const leftSec = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
      setRemainingSeconds(leftSec);

      if (leftSec <= 0 && currentAttempt.status === 'SEDANG_DIKERJAKAN') {
        handleSubmitQuiz('Waktu ujian telah habis.');
      }
    } catch (err: any) {
      toast.danger('Gagal Memulai Kuis', err.message);
      onExit();
    }
  }, [quizId, user]);

  // =========================================================================
  // PROCTORING EVENT LISTENERS (FULLSCREEN, VISIBILITY, BLUR, KEYBOARD)
  // =========================================================================
  useEffect(() => {
    if (isCbtGateOpen || !attempt || attempt.status !== 'SEDANG_DIKERJAKAN' || isSubmitting) {
      return;
    }

    // 1. Fullscreen Change Listener
    const handleFullscreenChange = () => {
      const inFullscreen = checkIsFullscreen();
      setIsFullscreen(inFullscreen);
      if (!inFullscreen) {
        setShowFullscreenOverlay(true);
        handleSecurityViolation('Keluar dari mode Layar Penuh (Fullscreen)');
      } else {
        setShowFullscreenOverlay(false);
      }
    };

    // 2. Tab Switch & Window Focus Loss Listeners
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleSecurityViolation('Berpindah Tab Peramban / Tab Browser Disembunyikan');
      }
    };

    const handleWindowBlur = () => {
      handleSecurityViolation('Fokus Jendela Ujian Terlepas / Membuka Aplikasi Eksternal');
    };

    // 3. Prevent Accidentally Navigating Away
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Ujian CBT sedang berlangsung. Jika Anda keluar, lembar jawaban Anda akan dikumpulkan!';
      return e.returnValue;
    };

    // 4. Block Dangerous Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12 or Inspect shortcuts
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))) {
        e.preventDefault();
        e.stopPropagation();
        handleSecurityViolation('Membuka Developer Tools / Inspect Element');
        return false;
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        handleSecurityViolation('Membuka Sumber Halaman (View Source)');
        return false;
      }
      // F5 or Ctrl+R (Refresh)
      if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        e.stopPropagation();
        toast.warning('Dilarang Me-refresh Halaman', 'Harap lanjutkan pengerjaan tanpa memuat ulang browser.');
        return false;
      }
      // Ctrl+C / Ctrl+V / Ctrl+X / Ctrl+A on question text
      if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'x' || e.key === 'X' || e.key === 'a' || e.key === 'A')) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        if (!isInputField) {
          e.preventDefault();
          e.stopPropagation();
          toast.warning('Anti Copy-Paste', 'Fungsi salin-tempel dinonaktifkan demi keamanan soal.');
          return false;
        }
      }
    };

    // 5. Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.warning('Proteksi Soal', 'Klik kanan dinonaktifkan pada lembar ujian CBT.');
      return false;
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isCbtGateOpen, attempt, isSubmitting, handleSecurityViolation, checkIsFullscreen, toast]);

  // Countdown Timer Interval
  useEffect(() => {
    if (isCbtGateOpen || !attempt || attempt.status !== 'SEDANG_DIKERJAKAN' || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz('Waktu pengerjaan kuis telah habis.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCbtGateOpen, attempt, remainingSeconds, handleSubmitQuiz]);

  // Start CBT Session after agreeing to gate rules
  const handleStartCbtSession = async () => {
    setIsCbtGateOpen(false);
    await requestBrowserFullscreen();
    toast.success('Ujian Dimulai', 'Layar peramban Anda telah dikunci ke mode CBT Layar Penuh.');
  };

  // Handle Answer Changes with Autosave
  const handleAnswerChange = (update: {
    selectedOptionId?: string;
    shortAnswerText?: string;
    essayAnswerText?: string;
    isDoubtful?: boolean;
  }) => {
    if (!attempt || !quiz || !user) return;
    const currentQ = quiz.questions[currentQuestionIndex];
    if (!currentQ) return;

    try {
      const updated = quizService.autosaveAnswer(attempt.id, user.id, currentQ.id, update);
      setAttempt({ ...updated });
      setLastSavedTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Jawaban', err.message);
    }
  };

  // Format Timer HH:MM:SS / MM:SS
  const formatTimer = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Guard: Max Attempts Reached
  if (maxAttemptsReached && quiz) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onExit}>
          Kembali ke Daftar Kuis
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <div 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'var(--color-warning-bg)', 
                color: 'var(--color-warning-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)'
              }}
            >
              <AlertTriangle size={32} />
            </div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Batas Percobaan Habis</h3>
            <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto var(--space-6)' }}>
              Anda telah menggunakan seluruh kuota ({quiz.maxAttempts}x) pengerjaan untuk kuis <strong>{quiz.title}</strong>.
            </p>
            {existingAttempts.length > 0 && (
              <div className="flex justify-center">
                <Button 
                  variant="primary" 
                  onClick={() => onFinish(existingAttempts[existingAttempts.length - 1].id)}
                >
                  Lihat Hasil Ujian Terakhir
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!quiz || !attempt) {
    return (
      <Card>
        <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <div className="flex flex-col items-center gap-3">
            <div className="spinner-border" />
            <p className="text-muted">Mempersiapkan lembar soal & sistem keamanan CBT...</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const currentQ: QuizQuestionItem = quiz.questions[currentQuestionIndex];
  const currentAnswer = attempt.answers[currentQ?.id] || {};
  const totalQuestions = quiz.questions.length;

  const answeredCount = quiz.questions.filter((q) => {
    const ans = attempt.answers[q.id];
    if (!ans) return false;
    return !!ans.selectedOptionId || !!ans.shortAnswerText?.trim() || !!ans.essayAnswerText?.trim();
  }).length;

  const doubtfulCount = quiz.questions.filter((q) => attempt.answers[q.id]?.isDoubtful).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Render question map button grid
  const renderQuestionGrid = () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', gap: '8px' }}>
      {quiz.questions.map((q, idx) => {
        const ans = attempt.answers[q.id];
        const isAnswered = ans && (ans.selectedOptionId || ans.shortAnswerText?.trim() || ans.essayAnswerText?.trim());
        const isDoubtful = ans?.isDoubtful;
        const isCurrent = idx === currentQuestionIndex;

        let bgColor = 'var(--color-slate-100)';
        let textColor = 'var(--text-primary)';
        let borderColor = 'var(--border-default)';

        if (isDoubtful) {
          bgColor = 'var(--color-warning-bg)';
          textColor = 'var(--color-warning-main)';
          borderColor = 'var(--color-warning-border)';
        } else if (isAnswered) {
          bgColor = 'var(--color-success-bg)';
          textColor = 'var(--color-success-main)';
          borderColor = 'var(--color-success-border)';
        }

        if (isCurrent) {
          borderColor = 'var(--color-primary-800)';
        }

        return (
          <button
            key={q.id}
            type="button"
            onClick={() => {
              setCurrentQuestionIndex(idx);
              setShowMobileMapModal(false);
            }}
            style={{
              height: '44px',
              textAlign: 'center',
              borderRadius: 'var(--radius-md)',
              backgroundColor: bgColor,
              color: textColor,
              border: `2px solid ${borderColor}`,
              fontWeight: 'bold',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 100ms ease'
            }}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );

  return (
    <div 
      ref={cbtContainerRef}
      className="cbt-container flex flex-col gap-4 md:gap-6"
    >
      {/* =========================================================================
          PRE-EXAM SECURITY GATE MODAL (TATATERTIB & KUNCI FULLSCREEN)
          ========================================================================= */}
      {isCbtGateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
            overflowY: 'auto'
          }}
        >
          <Card style={{ maxWidth: '640px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', margin: 'auto' }}>
            <CardHeader style={{ backgroundColor: 'var(--color-primary-900)', color: 'white', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
              <div className="flex items-center gap-3">
                <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
                  <Lock size={24} color="#6ee7b7" />
                </div>
                <div>
                  <CardTitle style={{ color: 'white', fontSize: 'var(--text-lg)' }}>
                    Gerbang Keamanan Ujian CBT SALAM
                  </CardTitle>
                  <CardSubtitle style={{ color: '#a7f3d0', fontSize: 'var(--text-xs)' }}>
                    STAI Al-Ittihad Cianjur — Computer-Based Testing Secure System
                  </CardSubtitle>
                </div>
              </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-4" style={{ padding: 'var(--space-5) var(--space-6)' }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded gap-2" style={{ backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', fontWeight: 'bold' }}>MATA KULIAH</div>
                  <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-950)' }}>{quiz.title}</strong>
                </div>
                <Badge variant="primary">Alokasi: {quiz.durationMinutes} Menit</Badge>
              </div>

              <div>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  📜 Pakta Integritas & Protokol Keamanan Ujian:
                </h4>
                <ul className="flex flex-col gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', paddingLeft: '18px', listStyleType: 'disc' }}>
                  <li>
                    <strong>Layar Penuh Otomatis:</strong> Saat menekan tombol mulai, peramban Anda akan dikunci ke mode Layar Penuh (*Fullscreen*).
                  </li>
                  <li>
                    <strong>Larangan Berpindah Tab:</strong> Sistem mendeteksi perpindahan tab, pembukaan aplikasi lain, atau kehilangan fokus jendela.
                  </li>
                  <li>
                    <strong>Batas Toleransi Pelanggaran:</strong> Maksimal <strong>{MAX_ALLOWED_VIOLATIONS} kali</strong> peringatan. Pelanggaran ke-3 akan menyebabkan ujian <strong>dikumpulkan paksa otomatis</strong>.
                  </li>
                  <li>
                    <strong>Perlindungan Soal:</strong> Tombol klik kanan, tombol refresh (<kbd>F5</kbd>), inspect element (<kbd>F12</kbd>), serta fungsi salin-tempel dinonaktifkan.
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded flex items-center gap-3" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 'var(--text-xs)' }}>
                <ShieldAlert size={20} style={{ flexShrink: 0 }} />
                <span>
                  Pastikan koneksi internet stabil dan tutup semua aplikasi pesan atau peramban lainnya sebelum memulai.
                </span>
              </div>
            </CardBody>

            <CardFooter className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3" style={{ backgroundColor: 'var(--color-slate-50)' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                icon={ArrowLeft} 
                onClick={() => {
                  exitBrowserFullscreen();
                  onExit();
                }}
              >
                Batalkan & Keluar
              </Button>

              <Button 
                variant="primary" 
                size="md" 
                icon={Maximize} 
                onClick={handleStartCbtSession}
                style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', boxShadow: '0 4px 12px rgba(6, 95, 70, 0.3)' }}
              >
                Saya Mengerti, Kunci Layar & Mulai
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* =========================================================================
          FULLSCREEN LOCKOUT OVERLAY (MUNCUL JIKA KELUAR DARI FULLSCREEN)
          ========================================================================= */}
      {!isCbtGateOpen && showFullscreenOverlay && !isDisqualified && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 99998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
        >
          <Card style={{ maxWidth: '520px', width: '100%', textAlign: 'center', border: '2px solid var(--color-danger-main)' }}>
            <CardBody className="flex flex-col items-center gap-4" style={{ padding: 'var(--space-6) var(--space-8)' }}>
              <div 
                style={{ 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: 'var(--radius-full)', 
                  backgroundColor: 'var(--color-danger-bg)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--color-danger-main)'
                }}
              >
                <Lock size={32} />
              </div>

              <div>
                <h3 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-danger-main)', fontWeight: 'bold', marginBottom: '6px' }}>
                  Layar Ujian Tidak Terkunci!
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Anda terdeteksi keluar dari mode Layar Penuh (*Fullscreen*). Demi menjaga integritas akademik, Anda wajib mengunci kembali layar untuk melanjutkan ujian.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 rounded" style={{ backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger-main)', fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                <AlertTriangle size={16} />
                <span>Pelanggaran Terdeteksi: {violationCount} / {MAX_ALLOWED_VIOLATIONS} Kali</span>
              </div>

              <Button
                variant="danger"
                size="lg"
                icon={Maximize}
                onClick={requestBrowserFullscreen}
                style={{ width: '100%', marginTop: 'var(--space-2)' }}
              >
                Kembali ke Layar Penuh (Wajib)
              </Button>
            </CardBody>
          </Card>
        </div>
      )}

      {/* =========================================================================
          SECURITY VIOLATION MODAL (PERINGATAN BERPINDAH TAB / APLIKASI LAIN)
          ========================================================================= */}
      <Modal
        isOpen={showViolationModal}
        onClose={() => {
          if (!isDisqualified) {
            setShowViolationModal(false);
            if (!checkIsFullscreen()) {
              requestBrowserFullscreen();
            }
          }
        }}
        title={isDisqualified ? "⛔ Ujian Dibatalkan / Dikumpulkan Otomatis" : "⚠️ Peringatan Pelanggaran Keamanan CBT"}
        maxWidth="520px"
        footer={
          !isDisqualified ? (
            <Button 
              variant="primary" 
              icon={ShieldCheck} 
              onClick={() => {
                setShowViolationModal(false);
                if (!checkIsFullscreen()) {
                  requestBrowserFullscreen();
                }
              }}
            >
              Saya Mengerti & Lanjutkan Ujian
            </Button>
          ) : (
            <Badge variant="danger">Proses Pengumpulan...</Badge>
          )
        }
      >
        <div className="flex flex-col gap-4">
          <div 
            className="p-3 rounded flex items-start gap-3" 
            style={{ 
              backgroundColor: isDisqualified ? 'var(--color-danger-bg)' : '#fffbeb', 
              border: `1px solid ${isDisqualified ? 'var(--color-danger-border)' : '#fde68a'}`,
              color: isDisqualified ? 'var(--color-danger-main)' : '#92400e'
            }}
          >
            <ShieldAlert size={24} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', display: 'block', marginBottom: '2px' }}>
                {isDisqualified ? 'BATAS TOLERANSI PELANGGARAN TERLAMPAUI' : 'AKTIVITAS MENCURIGAKAN TERDETEKSI'}
              </strong>
              <span style={{ fontSize: 'var(--text-xs)' }}>
                {violationReason || 'Sistem mendeteksi perpindahan tab atau hilangnya fokus layar ujian.'}
              </span>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-slate-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
              <span>Status Pelanggaran:</span>
              <Badge variant={violationCount >= MAX_ALLOWED_VIOLATIONS ? 'danger' : 'warning'}>
                {violationCount} dari {MAX_ALLOWED_VIOLATIONS} Toleransi
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Sisa Kesempatan:</span>
              <strong style={{ color: violationCount >= MAX_ALLOWED_VIOLATIONS ? 'var(--color-danger-main)' : 'var(--color-success-main)' }}>
                {Math.max(0, MAX_ALLOWED_VIOLATIONS - violationCount)} Kali
              </strong>
            </div>
          </div>

          {isDisqualified ? (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-main)', fontWeight: 'bold' }}>
              Ujian Anda sedang dikumpulkan otomatis ke server pengawas STAI Al-Ittihad. Seluruh rekaman insiden pelanggaran telah disimpan ke dalam log audit pengawas.
            </p>
          ) : (
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Harap tetap berada di tab lembar ujian ini sampai Anda menyelesaikan dan menekan tombol kumpulkan kuis.
            </p>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          CBT TOP STATUS BAR: PROCTORING STATUS, TIMER & ACTIONS (RESPONSIVE)
          ========================================================================= */}
      <div 
        className="cbt-header-statusbar flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4"
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ width: '100%' }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
            <Badge variant="primary">Percobaan #{attempt.attemptNumber}</Badge>
            <Badge variant={isFullscreen ? 'success' : 'warning'} className="flex items-center gap-1">
              <Lock size={12} />
              <span>{isFullscreen ? 'Layar Penuh Terkunci' : 'Layar Terlepas'}</span>
            </Badge>
            <Badge variant={violationCount === 0 ? 'success' : violationCount < MAX_ALLOWED_VIOLATIONS ? 'warning' : 'danger'}>
              Pelanggaran: {violationCount}/{MAX_ALLOWED_VIOLATIONS}
            </Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'inline-block' }}>
              {quiz.courseName}
            </span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
            {quiz.title}
          </h2>
        </div>

        {/* Floating Timer & Responsive Controls */}
        <div className="cbt-header-actions flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Mobile Question Map Drawer Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={LayoutGrid}
            className="cbt-mobile-map-toggle"
            onClick={() => setShowMobileMapModal(true)}
            title="Buka Peta Soal"
          >
            Peta Soal ({currentQuestionIndex + 1}/{totalQuestions})
          </Button>

          {!isFullscreen && (
            <Button
              variant="outline"
              size="sm"
              icon={Maximize}
              onClick={requestBrowserFullscreen}
              title="Kunci Layar Penuh"
            >
              Kunci Layar
            </Button>
          )}

          <div 
            className="cbt-timer-badge flex items-center gap-2"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              backgroundColor: remainingSeconds < 300 ? 'var(--color-danger-bg)' : 'var(--color-primary-50)',
              color: remainingSeconds < 300 ? 'var(--color-danger-main)' : 'var(--color-primary-800)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${remainingSeconds < 300 ? 'var(--color-danger-border)' : 'var(--color-primary-200)'}`,
              fontWeight: 'bold',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap'
            }}
          >
            <Clock size={16} />
            <span>Sisa Waktu: {formatTimer(remainingSeconds)}</span>
          </div>

          <Button variant="danger" size="sm" icon={Send} onClick={() => setShowSubmitModal(true)}>
            Kumpulkan
          </Button>
        </div>
      </div>

      {/* =========================================================================
          MAIN CBT GRID (DESKTOP 2-COL / MOBILE 1-COL)
          ========================================================================= */}
      <div className="cbt-layout-grid">
        
        {/* =========================================================================
            LEFT COLUMN: LEMBAR SOAL AKTIF
            ========================================================================= */}
        <Card style={{ width: '100%' }}>
          <CardHeader>
            <div className="flex justify-between items-center w-full flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontWeight: 'bold', fontSize: 'var(--text-base)' }}>
                  Soal Nomor {currentQuestionIndex + 1} dari {totalQuestions}
                </span>
                <Badge variant="default">{currentQ.type.replace('_', ' ')}</Badge>
                <Badge variant="primary">{currentQ.points} Poin</Badge>
              </div>

              {/* Ragu-Ragu Toggle */}
              <label 
                className="flex items-center gap-2 cursor-pointer" 
                style={{ 
                  fontSize: 'var(--text-xs)', 
                  fontWeight: 'var(--font-weight-medium)',
                  color: currentAnswer.isDoubtful ? 'var(--color-warning-main)' : 'var(--text-muted)'
                }}
              >
                <input
                  type="checkbox"
                  checked={!!currentAnswer.isDoubtful}
                  onChange={(e) => handleAnswerChange({ isDoubtful: e.target.checked })}
                />
                <Flag size={14} />
                <span>Ragu-Ragu</span>
              </label>
            </div>
          </CardHeader>

          <CardBody className="flex flex-col gap-4 md:gap-5" style={{ padding: 'var(--space-4) var(--space-5)' }}>
            {/* Teks Soal */}
            <div style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.05rem)', lineHeight: 1.7, color: 'var(--text-primary)', fontWeight: 'var(--font-weight-medium)' }}>
              {currentQ.questionText}
            </div>

            {/* Teks Arab / Matan / Hadits / Ayat */}
            {currentQ.arabicText && (
              <div className="cbt-arabic-box">
                {currentQ.arabicText}
              </div>
            )}

            {/* Gambar Ilustrasi / Diagram Pendukung */}
            {currentQ.imageUrl && (
              <div style={{ display: 'inline-block', maxWidth: '100%' }}>
                <img 
                  src={currentQ.imageUrl} 
                  alt="Ilustrasi Soal" 
                  style={{ 
                    maxHeight: '260px', 
                    maxWidth: '100%', 
                    objectFit: 'contain', 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-default)',
                    boxShadow: 'var(--shadow-xs)'
                  }} 
                />
              </div>
            )}

            {/* Input Jawaban Berdasarkan Tipe Soal */}
            {currentQ.type === 'PILIHAN_GANDA' || currentQ.type === 'BENAR_SALAH' ? (
              <div className="flex flex-col gap-2.5">
                {currentQ.options?.map((opt, optIdx) => {
                  const isSelected = currentAnswer.selectedOptionId === opt.id;
                  const labelLetter = String.fromCharCode(65 + optIdx);

                  return (
                    <label
                      key={opt.id}
                      className={`cbt-touch-option ${isSelected ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q-option-${currentQ.id}`}
                        value={opt.id}
                        checked={isSelected}
                        onChange={() => handleAnswerChange({ selectedOptionId: opt.id })}
                        style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--color-primary-700)' }}
                      />
                      <span style={{ fontWeight: 'bold', minWidth: '20px', fontSize: 'var(--text-sm)' }}>{labelLetter}.</span>
                      <span style={{ fontSize: 'var(--text-sm)', color: isSelected ? 'var(--color-primary-950)' : 'var(--text-primary)', lineHeight: 1.4 }}>
                        {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : currentQ.type === 'JAWABAN_SINGKAT' ? (
              <div className="form-group">
                <label className="form-label font-bold">Tuliskan Jawaban Singkat Anda (Satu Kata / Frasa):</label>
                <input
                  className="form-input"
                  style={{ minHeight: '44px', fontSize: 'var(--text-sm)' }}
                  placeholder="Ketik jawaban di sini..."
                  value={currentAnswer.shortAnswerText || ''}
                  onChange={(e) => handleAnswerChange({ shortAnswerText: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label font-bold">Jawaban Uraian / Esai Anda:</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}
                  placeholder="Tuliskan analisis dan penjelasan lengkap Anda di sini..."
                  value={currentAnswer.essayAnswerText || ''}
                  onChange={(e) => handleAnswerChange({ essayAnswerText: e.target.value })}
                />
                {currentQ.essayRubric && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <strong>Rubrik Penilaian:</strong> {currentQ.essayRubric}
                  </div>
                )}
              </div>
            )}
          </CardBody>

          <CardFooter className="cbt-card-footer-nav flex justify-between items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
            >
              Soal Sebelumnya
            </Button>

            <div className="flex items-center justify-center gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
              <Save size={14} color="var(--color-success-main)" />
              <span>{lastSavedTime ? `Tersimpan: ${lastSavedTime}` : 'Autosave Aktif'}</span>
            </div>

            {currentQuestionIndex < totalQuestions - 1 ? (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                iconPosition="right"
                onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              >
                Soal Berikutnya
              </Button>
            ) : (
              <Button
                variant="danger"
                size="sm"
                icon={Send}
                onClick={() => setShowSubmitModal(true)}
              >
                Selesai & Kumpulkan
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* =========================================================================
            RIGHT COLUMN: PETA SOAL & LOG PENGAWAS (DESKTOP SIDEBAR)
            ========================================================================= */}
        <div className="cbt-desktop-sidebar">
          <Card>
            <CardHeader style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <div>
                <CardTitle style={{ fontSize: 'var(--text-sm)' }}>Peta Butir Soal</CardTitle>
                <CardSubtitle style={{ fontSize: 'var(--text-xs)' }}>Klik nomor untuk berpindah soal</CardSubtitle>
              </div>
            </CardHeader>

            <CardBody style={{ padding: 'var(--space-4)' }}>
              {renderQuestionGrid()}

              {/* Legend */}
              <div className="flex flex-col gap-2" style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)' }}>
                <div className="flex items-center gap-2">
                  <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '3px' }} />
                  <span>Dijawab ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: '3px' }} />
                  <span>Ragu-Ragu ({doubtfulCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ width: '14px', height: '14px', backgroundColor: 'var(--color-slate-100)', border: '1px solid var(--border-default)', borderRadius: '3px' }} />
                  <span>Belum Dijawab ({unansweredCount})</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Security Proctoring Status Card */}
          <Card>
            <CardHeader style={{ padding: 'var(--space-3) var(--space-4)' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} color="var(--color-primary-700)" />
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Pengawas CBT Aktif</span>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-xs)' }}>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted">Kunci Layar:</span>
                  <Badge variant={isFullscreen ? 'success' : 'warning'}>
                    {isFullscreen ? 'Aktif' : 'Terlepas'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Toleransi Tab:</span>
                  <span style={{ fontWeight: 'bold', color: violationCount > 0 ? 'var(--color-danger-main)' : 'var(--color-success-main)' }}>
                    {violationCount} / {MAX_ALLOWED_VIOLATIONS}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted">Anti-Inspect:</span>
                  <Badge variant="success">Aktif</Badge>
                </div>

                {violationLogs.length > 0 && (
                  <div style={{ marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-default)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--color-danger-main)', marginBottom: '4px' }}>
                      Catatan Pelanggaran:
                    </div>
                    <ul className="flex flex-col gap-1" style={{ paddingLeft: '12px', listStyleType: 'disc', color: 'var(--color-danger-main)' }}>
                      {violationLogs.map((log, idx) => (
                        <li key={idx}>
                          [{log.timestamp}] {log.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          MODAL: PETA SOAL KHUSUS MOBILE & TABLET (< 1024px)
          ========================================================================= */}
      <Modal
        isOpen={showMobileMapModal}
        onClose={() => setShowMobileMapModal(false)}
        title="Peta Butir Soal CBT"
        maxWidth="480px"
        footer={
          <Button variant="secondary" onClick={() => setShowMobileMapModal(false)}>
            Tutup
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Ketuk nomor butir soal untuk langsung berpindah ke lembar soal terkait:
          </p>
          {renderQuestionGrid()}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-3 border-t" style={{ fontSize: 'var(--text-xs)', borderColor: 'var(--border-default)' }}>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', borderRadius: '2px' }} />
              <span>Dijawab ({answeredCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: '2px' }} />
              <span>Ragu ({doubtfulCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--color-slate-100)', border: '1px solid var(--border-default)', borderRadius: '2px' }} />
              <span>Belum ({unansweredCount})</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: KONFIRMASI PENGUMPULAN KUIS (DOUBLE CONFIRMATION)
          ========================================================================= */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="Konfirmasi Pengumpulan Lembar Kuis"
        maxWidth="500px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowSubmitModal(false)}>
              Periksa Kembali
            </Button>
            <Button 
              variant="danger" 
              icon={Send} 
              isLoading={isSubmitting} 
              onClick={() => handleSubmitQuiz()}
            >
              Ya, Kumpulkan Sekarang
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Apakah Anda yakin ingin mengakhiri dan mengumpulkan lembar jawaban kuis <strong>{quiz.title}</strong>?
          </p>

          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
            <div className="flex justify-between" style={{ marginBottom: '4px' }}>
              <span>Total Butir Soal:</span>
              <strong>{totalQuestions} Soal</strong>
            </div>
            <div className="flex justify-between" style={{ marginBottom: '4px', color: 'var(--color-success-main)' }}>
              <span>Sudah Dijawab:</span>
              <strong>{answeredCount} Soal</strong>
            </div>
            {unansweredCount > 0 && (
              <div className="flex justify-between" style={{ color: 'var(--color-danger-main)' }}>
                <span>Belum Dijawab:</span>
                <strong>{unansweredCount} Soal</strong>
              </div>
            )}
          </div>

          {unansweredCount > 0 && (
            <div className="p-2 rounded flex items-center gap-2" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 'var(--text-xs)' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>Masih terdapat {unansweredCount} butir soal yang belum dijawab. Poin untuk soal yang kosong bernilai 0.</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
