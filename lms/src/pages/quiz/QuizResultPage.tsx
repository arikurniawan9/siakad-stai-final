import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface QuizResultPageProps {
  attemptId: string;
  onBack: () => void;
}

export const QuizResultPage: React.FC<QuizResultPageProps> = ({ attemptId, onBack }) => {
  const { user } = useAuth();
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    if (!user) return;
    try {
      const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa' || user.role === 'administrator_sistem';
      const att = quizService.getAttemptById(attemptId, user.id, isLecturer);
      setAttempt(att);
      const qz = quizService.getQuizById(att.quizId);
      if (qz) setQuiz(qz);
    } catch (e) {
      console.warn('Gagal memuat hasil kuis:', e);
    }
  }, [attemptId, user]);

  if (!attempt || !quiz) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Kuis
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Hasil kuis tidak ditemukan atau Anda tidak memiliki hak akses.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke {KAMUS_UI.KUIS_DARING}
        </Button>
      </div>

      {/* Score Summary Banner */}
      <Card 
        style={{ 
          background: attempt.status === 'DINILAI' 
            ? (attempt.isPassed ? 'linear-gradient(135deg, #047857, #065f46)' : 'linear-gradient(135deg, #b91c1c, #991b1b)')
            : 'linear-gradient(135deg, #1e293b, #334155)', 
          color: 'white', 
          border: 'none' 
        }}
      >
        <CardBody style={{ padding: 'var(--space-8)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  Percobaan #{attempt.attemptNumber}
                </Badge>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  {attempt.status === 'DINILAI' ? (attempt.isPassed ? 'LULUS KKM' : 'BELUM LULUS') : 'MENUNGGU PENILAIAN ESAI'}
                </Badge>
              </div>

              <h1 style={{ color: 'white', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>
                {quiz.title}
              </h1>
              <p style={{ color: '#d1fae5', fontSize: 'var(--text-sm)' }}>
                Peserta: <strong>{attempt.studentName}</strong> (NIM: {attempt.studentNim}) • Dikumpulkan pada: {new Date(attempt.submittedAt || '').toLocaleString('id-ID')}
              </p>
            </div>

            {/* Score Big Display */}
            <div style={{ textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.15)', padding: 'var(--space-4) var(--space-8)', borderRadius: 'var(--radius-xl)', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: '#d1fae5', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Nilai Akhir
              </div>
              <div style={{ fontSize: '3.5rem', fontWeight: 'bold', lineHeight: 1.1, color: 'white' }}>
                {attempt.finalScore}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0' }}>
                Batas Kelulusan (KKM): {quiz.passingScore}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Breakdown per Question */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Rincian Jawaban & Pembahasan ({quiz.questions.length} Butir Soal)</CardTitle>
            <CardSubtitle>Evaluasi ketepatan jawaban, perolehan poin, dan catatan umpan balik dosen</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-5">
          {quiz.questions.map((q, idx) => {
            const ans = attempt.answers[q.id];
            const isObjCorrect = ans?.earnedPoints === q.points;
            const isEssay = q.type === 'ESAI';

            return (
              <div 
                key={q.id}
                style={{
                  padding: 'var(--space-4) var(--space-5)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                <div className="flex justify-between items-start gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 'bold', fontSize: 'var(--text-base)' }}>Soal #{idx + 1}</span>
                    <Badge variant="default">{q.type.replace('_', ' ')}</Badge>
                  </div>

                  <div>
                    {isEssay ? (
                      <Badge variant={ans?.isGraded ? 'success' : 'warning'}>
                        {ans?.isGraded ? `${ans.earnedPoints}/${q.points} Poin (Telah Dinilai)` : `0/${q.points} Poin (Menunggu Koreksi)`}
                      </Badge>
                    ) : (
                      <Badge variant={isObjCorrect ? 'success' : 'danger'}>
                        {ans?.earnedPoints || 0} / {q.points} Poin
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Teks Pertanyaan */}
                <p style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
                  {q.questionText}
                </p>

                {/* Teks Arab / Matan / Hadits / Ayat */}
                {q.arabicText && (
                  <div 
                    style={{
                      direction: 'rtl',
                      fontFamily: "'Amiri', 'Traditional Arabic', serif",
                      fontSize: '1.25rem',
                      lineHeight: 2.1,
                      textAlign: 'right',
                      backgroundColor: '#fdfbf7',
                      color: '#1e293b',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #fde68a',
                      borderRight: '4px solid var(--color-primary-700)',
                      marginBottom: 'var(--space-3)'
                    }}
                  >
                    {q.arabicText}
                  </div>
                )}

                {/* Gambar Ilustrasi / Diagram Pendukung */}
                {q.imageUrl && (
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <img 
                      src={q.imageUrl} 
                      alt="Ilustrasi Soal" 
                      style={{ 
                        maxHeight: '180px', 
                        maxWidth: '100%', 
                        objectFit: 'contain', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-default)' 
                      }} 
                    />
                  </div>
                )}

                {/* Jawaban Mahasiswa */}
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Jawaban Anda:</div>
                  {q.type === 'PILIHAN_GANDA' || q.type === 'BENAR_SALAH' ? (
                    <div style={{ fontWeight: 'bold' }}>
                      {q.options?.find((o) => o.id === ans?.selectedOptionId)?.text || 'Tidak dijawab'}
                    </div>
                  ) : q.type === 'JAWABAN_SINGKAT' ? (
                    <div style={{ fontWeight: 'bold' }}>
                      {ans?.shortAnswerText || 'Tidak dijawab'}
                    </div>
                  ) : (
                    <div style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                      {ans?.essayAnswerText || 'Tidak ada jawaban tertulis.'}
                    </div>
                  )}
                </div>

                {/* Feedback Dosen untuk Esai */}
                {isEssay && ans?.lecturerFeedback && (
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', border: '1px solid var(--color-info-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-info-main)', marginBottom: 'var(--space-2)' }}>
                    <strong>Umpan Balik Dosen:</strong> {ans.lecturerFeedback}
                  </div>
                )}

                {/* Pembahasan / Kunci Jawaban Resmi */}
                {q.explanation && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    <strong>Pembahasan Materi:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
};
