import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileCheck, 
  Clock, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw,
  BookOpen,
  Search,
  X,
  Plus,
  ShieldCheck,
  Upload,
  Radio,
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Quiz, ImportQuestionInput } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { DataImportModal, BulkImportResult } from '../../components/export-import';
import { QUESTION_BANK_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';
import { QuizCreatePage } from './QuizCreatePage';

export interface QuizListPageProps {
  onStartQuiz: (quizId: string) => void;
  onViewResult: (attemptId: string) => void;
  onOpenBankSoal?: () => void;
  onOpenGradingQueue?: () => void;
  onOpenProctoring?: (quizId: string) => void;
}

export const QuizListPage: React.FC<QuizListPageProps> = ({ 
  onStartQuiz, 
  onViewResult,
  onOpenBankSoal,
  onOpenGradingQueue,
  onOpenProctoring
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Navigate to full-page create wizard
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'administrator_sistem';

  const loadQuizzes = () => {
    const list = quizService.getQuizzes(undefined, isStudent);
    setQuizzes(list);
  };

  useEffect(() => {
    loadQuizzes();
  }, [isStudent]);

  // Unique courses for filter
  const uniqueCourses = Array.from(new Set(quizzes.map(q => q.courseName)));

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterCourse]);

  const hasActiveFilters = searchQuery !== '' || filterCourse !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterCourse('SEMUA');
    setCurrentPage(1);
  };

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter((q) => {
      const matchesSearch = 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCourse = filterCourse === 'SEMUA' || q.courseName === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [quizzes, searchQuery, filterCourse]);

  // Paginated Quizzes
  const totalPages = Math.ceil(filteredQuizzes.length / pageSize) || 1;
  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuizzes.slice(start, start + pageSize);
  }, [filteredQuizzes, currentPage, pageSize]);

  // Bulk Import Questions Handler
  const handleBulkImportQuestions = async (validRows: ImportQuestionInput[]): Promise<BulkImportResult> => {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    validRows.forEach((row, idx) => {
      try {
        let options: { id: string; text: string; isCorrect: boolean }[] | undefined;
        let shortAnswer: string | undefined;
        let essayRubric: string | undefined;
        const cleanKey = (row.correctKey || '').trim().toUpperCase();

        if (row.type === 'BENAR_SALAH') {
          options = [
            { id: `opt-imp-${Date.now()}-${idx}-1`, text: 'Benar', isCorrect: cleanKey === 'A' || cleanKey === 'BENAR' || cleanKey === 'TRUE' },
            { id: `opt-imp-${Date.now()}-${idx}-2`, text: 'Salah', isCorrect: cleanKey === 'B' || cleanKey === 'SALAH' || cleanKey === 'FALSE' },
          ];
        } else if (row.type === 'JAWABAN_SINGKAT') {
          shortAnswer = row.correctKey || row.optA || '';
        } else if (row.type === 'ESAI') {
          essayRubric = row.correctKey || row.explanation || 'Rubrik penilaian esai terstandar.';
        } else {
          // PILIHAN GANDA (5 Opsi A-E)
          const rawOpts = [
            { text: (row.optA || '').trim(), key: 'A' },
            { text: (row.optB || '').trim(), key: 'B' },
            { text: (row.optC || '').trim(), key: 'C' },
            { text: (row.optD || '').trim(), key: 'D' },
            { text: (row.optE || '').trim(), key: 'E' },
          ].filter((o) => o.text !== '');

          if (rawOpts.length < 2) {
            failedCount += 1;
            errors.push(`Baris #${idx + 1}: Soal pilihan ganda butuh minimal 2 opsi jawaban.`);
            return;
          }

          options = rawOpts.map((ro, oIdx) => ({
            id: `opt-imp-${Date.now()}-${idx}-${oIdx + 1}`,
            text: ro.text,
            isCorrect: cleanKey === ro.key || (cleanKey.length > 1 && cleanKey === ro.text.toUpperCase())
          }));

          if (!options.some((o) => o.isCorrect)) {
            options[0].isCorrect = true;
          }
        }

        quizService.addBankQuestion({
          courseCode: row.courseCode || 'PAI-301',
          topic: row.topic || 'Topik Umum',
          type: row.type || 'PILIHAN_GANDA',
          difficulty: row.difficulty || 'SEDANG',
          questionText: row.questionText,
          arabicText: row.arabicText?.trim() || undefined,
          imageUrl: row.imageUrl?.trim() || undefined,
          options,
          correctShortAnswer: shortAnswer,
          essayRubric: essayRubric,
          defaultPoints: row.defaultPoints || 20,
          explanation: row.explanation,
          tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
        });

        successCount += 1;
      } catch (err: any) {
        failedCount += 1;
        errors.push(`Baris #${idx + 1}: ${err.message}`);
      }
    });

    toast.success('Impor Berhasil', `${successCount} butir soal baru berhasil diimpor ke Bank Soal.`);
    return {
      total: validRows.length,
      inserted: successCount,
      updated: 0,
      skipped: failedCount,
      errors
    };
  };

  // If showing create page, render it
  if (showCreatePage) {
    return (
      <QuizCreatePage
        onBack={() => setShowCreatePage(false)}
        onCreated={(_quizId) => {
          setShowCreatePage(false);
          loadQuizzes();
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>{KAMUS_UI.KUIS_DARING}</h1>
          <p>
            {isStudent 
              ? 'Evaluasi pemahaman pembelajaran daring dengan kuis berbatas waktu, CBT auto-fullscreen, dan penilaian terstruktur'
              : 'Kelola kuis evaluasi berkala, bank soal kurikulum, CBT anti-kecurangan, dan antrean penilaian esai'}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {isLecturer && (
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={() => setShowCreatePage(true)}
              style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
            >
              Buat Kuis Baru
            </Button>
          )}
          {isLecturer && (
            <Button 
              variant="outline" 
              icon={Upload} 
              onClick={() => setShowImportModal(true)}
            >
              Impor Soal Excel
            </Button>
          )}
          {isLecturer && onOpenBankSoal && (
            <Button variant="secondary" icon={BookOpen} onClick={onOpenBankSoal}>
              Bank Soal
            </Button>
          )}
          {isLecturer && onOpenGradingQueue && (
            <Button variant="outline" icon={FileCheck} onClick={onOpenGradingQueue}>
              Antrean Penilaian Esai
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {uniqueCourses.length > 1 && (
              <select
                className="form-select"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ width: 'auto', minWidth: '180px' }}
              >
                <option value="SEMUA">Semua Mata Kuliah</option>
                {uniqueCourses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}

            <div style={{ position: 'relative', flex: 1, width: '100%' }}>
              <Input
                placeholder="Cari judul kuis atau mata kuliah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

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
        </CardBody>
      </Card>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">{KAMUS_UI.TIDAK_ADA_DATA}</p>
            {isLecturer && (
              <div style={{ marginTop: 'var(--space-4)' }}>
                <Button variant="primary" icon={Plus} onClick={() => setShowCreatePage(true)}>
                  Buat Kuis Pertama Anda
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--space-6)' }}>
            {paginatedQuizzes.map((quiz) => {
              const studentAttempts = user ? quizService.getStudentAttempts(quiz.id, user.id) : [];
              const latestAttempt = studentAttempts[studentAttempts.length - 1];
              const hasOngoingAttempt = latestAttempt?.status === 'SEDANG_DIKERJAKAN';
              const attemptsLeft = quiz.maxAttempts - studentAttempts.length;

              return (
                <Card key={quiz.id}>
                  <CardHeader>
                    <Badge variant="primary">Pertemuan {quiz.meetingNumber}</Badge>
                    <Badge variant={quiz.status === 'DITERBITKAN' ? 'success' : 'warning'}>
                      {quiz.status}
                    </Badge>
                  </CardHeader>

                  <CardBody>
                    <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                      {quiz.title}
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                      {quiz.courseName}
                    </p>

                    <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <Clock size={14} color="var(--color-primary-700)" />
                        <span>Durasi: <strong>{quiz.durationMinutes} Menit</strong> • Nilai KKM: <strong>{quiz.passingScore}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HelpCircle size={14} color="var(--color-primary-700)" />
                        <span>Jumlah: <strong>{quiz.questions.length} Butir Soal</strong> (Total {quiz.totalPoints} Poin)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <RotateCcw size={14} color="var(--color-primary-700)" />
                        <span>Batas Percobaan: <strong>{quiz.maxAttempts}x</strong> (Sisa: {Math.max(0, attemptsLeft)}x)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} color="var(--color-success-main)" />
                        <span>Proctoring CBT: <strong>Auto-Fullscreen & Kunci Tab</strong></span>
                      </div>
                    </div>

                    {/* Status Riwayat Pengerjaan Terakhir Mahasiswa */}
                    {latestAttempt && (
                      <div 
                        style={{ 
                          marginTop: 'var(--space-4)', 
                          padding: 'var(--space-3)', 
                          backgroundColor: 'var(--color-slate-50)', 
                          borderRadius: 'var(--radius-md)', 
                          border: '1px solid var(--border-subtle)' 
                        }}
                      >
                        <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)' }}>
                          <span className="text-muted">Hasil Percobaan #{latestAttempt.attemptNumber}:</span>
                          <Badge variant={latestAttempt.status === 'DINILAI' ? (latestAttempt.isPassed ? 'success' : 'danger') : 'warning'}>
                            {latestAttempt.status === 'DINILAI' 
                              ? `Nilai: ${latestAttempt.finalScore} (${latestAttempt.isPassed ? 'Lulus' : 'Belum Lulus'})` 
                              : latestAttempt.status === 'DIKUMPULKAN' ? 'Menunggu Penilaian Esai' : 'Sedang Dikerjakan'}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </CardBody>

                  <CardFooter style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                    {latestAttempt && latestAttempt.status !== 'SEDANG_DIKERJAKAN' ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onViewResult(latestAttempt.id)}
                      >
                        Lihat Hasil & Pembahasan
                      </Button>
                    ) : (
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {hasOngoingAttempt ? 'Lanjutkan pengerjaan' : 'Siap dikerjakan'}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      {isLecturer && onOpenProctoring && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          icon={Radio} 
                          onClick={() => onOpenProctoring(quiz.id)}
                          style={{ borderColor: '#059669', color: '#047857' }}
                        >
                          Pengawasan Live
                        </Button>
                      )}

                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={ArrowRight} 
                        iconPosition="right"
                        disabled={isStudent && !hasOngoingAttempt && attemptsLeft <= 0}
                        onClick={() => onStartQuiz(quiz.id)}
                      >
                        {isLecturer ? 'Pratinjau CBT Ujian' : hasOngoingAttempt ? 'Lanjutkan Kuis' : attemptsLeft > 0 ? 'Mulai Kuis' : 'Kesempatan Habis'}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredQuizzes.length}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="kuis daring"
              />
            </CardBody>
          </Card>
        </>
      )}

      {/* =========================================================================
          MODAL: IMPOR SOAL DARI EXCEL
          ========================================================================= */}
      <DataImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        schema={QUESTION_BANK_IMPORT_SCHEMA}
        onImport={handleBulkImportQuestions}
        customTitle="Impor Butir Soal CBT Terstandar Excel"
      />
    </div>
  );
};
