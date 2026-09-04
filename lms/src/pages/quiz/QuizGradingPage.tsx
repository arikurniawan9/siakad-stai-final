import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Save,
  RefreshCw,
  Search,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Quiz, QuizAttempt } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface QuizGradingPageProps {
  onBack: () => void;
}

export const QuizGradingPage: React.FC<QuizGradingPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  // Search & Filter & Pagination States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form penilaian per soal esai
  const [gradingPoints, setGradingPoints] = useState<Record<string, number>>({});
  const [gradingFeedback, setGradingFeedback] = useState<Record<string, string>>({});

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  const loadAttempts = () => {
    const all = quizService.getAttempts();
    setAttempts(all);
  };

  useEffect(() => {
    loadAttempts();
  }, []);

  const handleOpenGrading = (attempt: QuizAttempt) => {
    const qz = quizService.getQuizById(attempt.quizId);
    if (!qz) return;
    setSelectedQuiz(qz);
    setSelectedAttempt(attempt);

    // Inisialisasi poin yang sudah ada
    const pts: Record<string, number> = {};
    const fdb: Record<string, string> = {};
    qz.questions.forEach((q) => {
      if (q.type === 'ESAI') {
        const ans = attempt.answers[q.id];
        pts[q.id] = ans?.earnedPoints || 0;
        fdb[q.id] = ans?.lecturerFeedback || '';
      }
    });
    setGradingPoints(pts);
    setGradingFeedback(fdb);
  };

  const handleSaveGrading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAttempt || !selectedQuiz || !user) return;

    try {
      const essayQuestions = selectedQuiz.questions.filter((q) => q.type === 'ESAI');
      let updatedAtt = selectedAttempt;

      essayQuestions.forEach((eq) => {
        const p = gradingPoints[eq.id] || 0;
        const f = gradingFeedback[eq.id] || '';
        updatedAtt = quizService.gradeEssayAnswer(selectedAttempt.id, eq.id, p, f, user.name);
      });

      loadAttempts();
      setSelectedAttempt(null);
      setSelectedQuiz(null);
      toast.success(
        'Penilaian Berhasil Disimpan',
        `Nilai akhir ${updatedAtt.studentName} kini: ${updatedAtt.finalScore} / 100 (${updatedAtt.isPassed ? 'Lulus' : 'Belum Lulus'}).`
      );
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Penilaian', err.message);
    }
  };

  const columns: Column<QuizAttempt>[] = [
    {
      header: 'Mahasiswa',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{row.studentName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>NIM: {row.studentNim}</div>
        </div>
      )
    },
    {
      header: 'Judul Kuis',
      accessor: 'quizTitle'
    },
    {
      header: 'Percobaan',
      width: '100px',
      render: (row) => <Badge variant="default">Ke-{row.attemptNumber}</Badge>
    },
    {
      header: 'Status Penilaian',
      width: '180px',
      render: (row) => (
        <Badge variant={row.status === 'DINILAI' ? 'success' : row.needsManualGrading ? 'warning' : 'default'}>
          {row.status === 'DINILAI' ? `Dinilai (Skor: ${row.finalScore})` : row.needsManualGrading ? 'Menunggu Koreksi Esai' : 'Selesai'}
        </Badge>
      )
    },
    {
      header: 'Waktu Pengumpulan',
      width: '160px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)' }}>
          {row.submittedAt ? new Date(row.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
        </span>
      )
    },
    {
      header: 'Aksi',
      width: '110px',
      render: (row) => (
        <Button 
          variant={row.needsManualGrading ? 'primary' : 'outline'} 
          size="sm" 
          onClick={() => handleOpenGrading(row)}
        >
          {row.needsManualGrading ? 'Koreksi Esai' : 'Ubah Nilai'}
        </Button>
      )
    }
  ];

  // Filtered Attempts Memo
  const filteredAttempts = useMemo(() => {
    return attempts.filter((att) => {
      const matchSearch = 
        att.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        att.quizTitle.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStatus = true;
      if (filterStatus === 'KOREKSI_ESAI') {
        matchStatus = att.needsManualGrading;
      } else if (filterStatus === 'DINILAI') {
        matchStatus = att.status === 'DINILAI' && !att.needsManualGrading;
      } else if (filterStatus === 'LULUS') {
        matchStatus = att.isPassed;
      } else if (filterStatus === 'BELUM_LULUS') {
        matchStatus = !att.isPassed;
      }

      return matchSearch && matchStatus;
    });
  }, [attempts, searchQuery, filterStatus]);

  // Paginated Attempts Memo
  const totalPages = Math.ceil(filteredAttempts.length / pageSize) || 1;
  const paginatedAttempts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAttempts.slice(start, start + pageSize);
  }, [filteredAttempts, currentPage, pageSize]);

  // Konfigurasi Ekspor Rekap Nilai Kuis Mahasiswa
  const quizExportConfig: ExportConfig<QuizAttempt> = useMemo(() => ({
    filename: 'SALAM_Rekap_Nilai_Kuis',
    title: 'REKAPITULASI HASIL & PENILAIAN KUIS MAHASISWA',
    subtitle: 'Sistem Aplikasi Layanan Akademik dan Mahasiswa (SALAM) — STAI Al-Ittihad',
    data: filteredAttempts,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Mahasiswa', width: '220px' },
      { key: 'quizTitle', header: 'Judul Kuis', width: '200px' },
      { key: 'attemptNumber', header: 'Percobaan', width: '80px', align: 'center', format: (val) => `Ke-${val}` },
      { 
        key: 'submittedAt', 
        header: 'Waktu Pengumpulan', 
        width: '160px', 
        format: (val) => val ? new Date(val).toLocaleString('id-ID') : '-' 
      },
      { key: 'finalScore', header: 'Nilai Akhir', width: '90px', align: 'center' },
      { 
        key: 'isPassed', 
        header: 'Status Kelulusan', 
        width: '120px', 
        align: 'center',
        format: (val) => val ? 'Lulus' : 'Belum Lulus'
      },
      { 
        key: 'needsManualGrading', 
        header: 'Koreksi Esai', 
        width: '130px', 
        align: 'center',
        format: (val) => val ? 'Perlu Koreksi' : 'Selesai Dinilai'
      }
    ],
    metadata: {
      'Total Pengumpulan': `${filteredAttempts.length} Lembar Jawaban`,
      'Menunggu Koreksi': `${filteredAttempts.filter((a) => a.needsManualGrading).length} Lembar`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredAttempts]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
            Kembali ke Kuis
          </Button>
          <div>
            <h1>Antrean Penilaian & Koreksi Esai Kuis</h1>
            <p>Periksa jawaban uraian/esai mahasiswa dan berikan skor serta umpan balik edukatif</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
            {attempts.filter((a) => a.needsManualGrading).length} Menunggu Koreksi
          </Badge>
          <ExportDropdown<QuizAttempt>
            config={quizExportConfig}
            buttonLabel="Ekspor Rekap Kuis"
          />
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadAttempts}>
            Segarkan
          </Button>
        </div>
      </div>

      {/* Attempts Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle>Daftar Pengumpulan Lembar Jawaban Kuis Mahasiswa</CardTitle>
              <CardSubtitle>Hasil pengerjaan kuis yang memerlukan penilaian esai maupun yang telah dinilai otomatis</CardSubtitle>
            </div>

            {/* Filter & Pencarian */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Input
                  placeholder="Cari NIM, nama, judul kuis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              </div>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="SEMUA">Semua Status</option>
                <option value="KOREKSI_ESAI">Perlu Koreksi Esai</option>
                <option value="DINILAI">Sudah Dinilai</option>
                <option value="LULUS">Lulus Kuis</option>
                <option value="BELUM_LULUS">Belum Lulus</option>
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
            columns={columns}
            data={paginatedAttempts}
            keyExtractor={(row) => row.id}
            emptyMessage="Belum ada mahasiswa yang mengumpulkan kuis sesuai filter."
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAttempts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="lembar kuis"
          />
        </CardBody>
      </Card>

      {/* MODAL: Formulir Penilaian Esai Dosen */}
      <Modal
        isOpen={!!selectedAttempt && !!selectedQuiz}
        onClose={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}
        title={`Koreksi Esai: ${selectedAttempt?.studentName} (${selectedAttempt?.studentNim})`}
        maxWidth="680px"
      >
        {selectedAttempt && selectedQuiz && (
          <form onSubmit={handleSaveGrading} className="flex flex-col gap-5">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <div><strong>Kuis:</strong> {selectedQuiz.title}</div>
              <div><strong>Skor Objektif Terkumpul:</strong> {selectedAttempt.totalEarnedPoints} Poin (dari {selectedQuiz.totalPoints} Poin Maks)</div>
            </div>

            {selectedQuiz.questions.filter((q) => q.type === 'ESAI').map((eq, idx) => {
              const ans = selectedAttempt.answers[eq.id];

              return (
                <div 
                  key={eq.id}
                  style={{
                    padding: 'var(--space-4)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                      Soal Esai #{idx + 1} ({eq.points} Poin Maksimal)
                    </span>
                    <Badge variant="primary">Poin Maks: {eq.points}</Badge>
                  </div>

                  <p style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--space-2)' }}>
                    {eq.questionText}
                  </p>

                  {eq.essayRubric && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>
                      <strong>Rubrik Penilaian:</strong> {eq.essayRubric}
                    </div>
                  )}

                  {/* Jawaban Mahasiswa */}
                  <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: 'var(--space-3)' }}>
                    <strong>Jawaban Mahasiswa:</strong><br />
                    {ans?.essayAnswerText || 'Tidak ada jawaban tertulis.'}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 'var(--space-3)' }}>
                    <Input
                      label="Nilai Poin (0–"
                      type="number"
                      min={0}
                      max={eq.points}
                      value={gradingPoints[eq.id] ?? 0}
                      onChange={(e) => setGradingPoints({ ...gradingPoints, [eq.id]: parseInt(e.target.value) || 0 })}
                      required
                    />
                    <Input
                      label="Catatan Umpan Balik Dosen"
                      placeholder="Contoh: Analisis argumentasi sudah tepat, tingkatkan rujukan..."
                      value={gradingFeedback[eq.id] || ''}
                      onChange={(e) => setGradingFeedback({ ...gradingFeedback, [eq.id]: e.target.value })}
                    />
                  </div>
                </div>
              );
            })}

            <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              <Button variant="secondary" type="button" onClick={() => { setSelectedAttempt(null); setSelectedQuiz(null); }}>
                {KAMUS_UI.BATAL}
              </Button>
              <Button variant="primary" type="submit" icon={Save}>
                Simpan Penilaian & Terbitkan Nilai Akhir
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
