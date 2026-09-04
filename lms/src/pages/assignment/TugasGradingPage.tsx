import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Save, 
  RotateCcw,
  Search,
  FileText,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Pagination } from '../../components/ui/Pagination';
import { Assignment, AssignmentSubmission, RubricEvaluationItem } from '../../types/assignment';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface TugasGradingPageProps {
  assignmentId: string;
  onBack: () => void;
}

export const TugasGradingPage: React.FC<TugasGradingPageProps> = ({ assignmentId, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedSub, setSelectedSub] = useState<AssignmentSubmission | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Filter & Search & Pagination States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Rubric evaluation state for active grading modal
  const [evaluations, setEvaluations] = useState<Record<string, { levelId: string; score: number; note?: string }>>({});
  const [manualRawScore, setManualRawScore] = useState<number>(85);
  const [feedback, setFeedback] = useState<string>('');
  const [previewTab, setPreviewTab] = useState<'berkas' | 'teks' | 'riwayat'>('berkas');

  const loadData = async () => {
    try {
      const asg = await assignmentService.fetchAssignmentById(assignmentId);
      if (asg) setAssignment(asg);
      const subs = await assignmentService.fetchClassSubmissions(assignmentId);
      setSubmissions(subs);
    } catch {
      const asg = assignmentService.getAssignmentById(assignmentId);
      if (asg) setAssignment(asg);
      const subs = assignmentService.getSubmissions(assignmentId);
      setSubmissions(subs);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  // Auto reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // Calculate scores with rubric & late penalty
  const currentScores = useMemo(() => {
    if (!selectedSub || !assignment) return { raw: 0, penalty: 0, final: 0 };

    let raw = 0;
    if (assignment.rubric && assignment.rubric.criteria.length > 0) {
      assignment.rubric.criteria.forEach((crit) => {
        const selected = evaluations[crit.id];
        if (selected) {
          raw += (selected.score / (crit.maxPoints || 100)) * (crit.weightPercentage || 0);
        }
      });
      raw = Math.round(raw);
    } else {
      raw = manualRawScore;
    }

    raw = Math.min(100, Math.max(0, raw));

    let penalty = 0;
    const penaltyPct = assignment.latePenaltyPercentage || 10;
    if (selectedSub.isLate && penaltyPct > 0) {
      penalty = Math.round((raw * penaltyPct) / 100);
    }

    const final = Math.max(0, raw - penalty);
    return { raw, penalty, final };
  }, [selectedSub, assignment, evaluations, manualRawScore]);

  // Filtered Submissions Memo
  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchSearch = 
        sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.studentNim.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.fileName && sub.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchStatus = true;
      if (filterStatus === 'DINILAI') {
        matchStatus = sub.status === 'SUDAH_DINILAI';
      } else if (filterStatus === 'MENUNGGU') {
        matchStatus = sub.status === 'SUDAH_DIKUMPULKAN';
      } else if (filterStatus === 'TERLAMBAT') {
        matchStatus = sub.isLate || sub.status === 'TERLAMBAT';
      } else if (filterStatus === 'BELUM') {
        matchStatus = sub.status === 'BELUM_DIKUMPULKAN';
      }

      return matchSearch && matchStatus;
    });
  }, [submissions, searchQuery, filterStatus]);

  // Paginated Submissions Memo
  const totalPages = Math.ceil(filteredSubmissions.length / pageSize) || 1;
  const paginatedSubmissions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSubmissions.slice(start, start + pageSize);
  }, [filteredSubmissions, currentPage, pageSize]);

  // Summary statistics
  const stats = useMemo(() => {
    const totalEnrolled = submissions.length || 1;
    const submittedCount = submissions.filter(s => s.status !== 'BELUM_DIKUMPULKAN').length;
    const gradedCount = submissions.filter(s => s.status === 'SUDAH_DINILAI').length;
    const pendingGradingCount = submissions.filter(s => s.status === 'SUDAH_DIKUMPULKAN' || s.status === 'TERLAMBAT').length;
    
    let sumScore = 0;
    let gradedValid = 0;
    submissions.forEach(s => {
      if (s.status === 'SUDAH_DINILAI' && s.finalScore !== undefined) {
        sumScore += s.finalScore;
        gradedValid += 1;
      }
    });

    const averageScore = gradedValid > 0 ? (sumScore / gradedValid).toFixed(1) : '0';

    return { totalEnrolled, submittedCount, gradedCount, pendingGradingCount, averageScore };
  }, [submissions]);

  // Open Grading Studio for a specific submission
  const handleOpenGrading = (sub: AssignmentSubmission) => {
    setSelectedSub(sub);
    setFeedback(sub.feedbackNotes || sub.lecturerFeedback || '');
    setManualRawScore(sub.rawScore ?? sub.finalScore ?? 85);
    setPreviewTab(sub.fileUrl || sub.fileName ? 'berkas' : 'teks');

    const evals: Record<string, { levelId: string; score: number; note?: string }> = {};
    if (sub.rubricEvaluations && sub.rubricEvaluations.length > 0) {
      sub.rubricEvaluations.forEach((item) => {
        evals[item.criterionId] = { 
          levelId: item.selectedLevelId, 
          score: item.awardedScore,
          note: item.note 
        };
      });
    } else if (assignment?.rubric) {
      assignment.rubric.criteria.forEach((crit) => {
        const defaultLevel = crit.levels[0] || { id: 'lvl-def', points: 100 };
        evals[crit.id] = { levelId: defaultLevel.id, score: defaultLevel.points };
      });
    }
    setEvaluations(evals);
  };

  // Switch to Next / Previous Student in Grading Studio
  const handleNavigateStudent = (direction: 'next' | 'prev') => {
    if (!selectedSub) return;
    const currentIndex = filteredSubmissions.findIndex(s => s.studentId === selectedSub.studentId);
    if (currentIndex === -1) return;

    let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex < 0) targetIndex = filteredSubmissions.length - 1;
    if (targetIndex >= filteredSubmissions.length) targetIndex = 0;

    const nextStudent = filteredSubmissions[targetIndex];
    if (nextStudent) {
      handleOpenGrading(nextStudent);
    }
  };

  // Save Grading Action
  const handleSaveGrading = async (isRevision = false) => {
    if (!selectedSub || !user || !assignment) return;

    setIsSaving(true);
    try {
      const evalArray: RubricEvaluationItem[] = Object.keys(evaluations).map((critId) => ({
        criterionId: critId,
        selectedLevelId: evaluations[critId].levelId,
        awardedScore: evaluations[critId].score,
        note: evaluations[critId].note
      }));

      const updated = assignmentService.gradeSubmissionWithRubric(
        selectedSub.id,
        evalArray,
        feedback,
        user.id,
        user.name,
        isRevision,
        manualRawScore
      );

      await loadData();
      setSelectedSub(null);

      toast.success(
        isRevision ? 'Permintaan Revisi Terkirim' : 'Penilaian Berhasil Disimpan & Terintegrasi',
        isRevision 
          ? `Status tugas ${updated.studentName} diubah menjadi PERLU REVISI.`
          : `Nilai akhir ${updated.studentName}: ${updated.finalScore} / 100 (Sinkron ke Gradebook).`
      );
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Nilai', err?.message || 'Terjadi kendala saat menyimpan nilai.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick feedback phrases
  const insertQuickFeedback = (phrase: string) => {
    setFeedback(prev => prev ? `${prev} ${phrase}` : phrase);
  };

  // Columns definition for Table
  const columns: Column<AssignmentSubmission>[] = [
    {
      header: 'Mahasiswa',
      render: (row) => (
        <div>
          <div className="font-bold text-neutral-900 dark:text-neutral-100">{row.studentName}</div>
          <div className="text-xs text-muted font-mono">NIM: {row.studentNim}</div>
        </div>
      )
    },
    {
      header: 'Berkas / Jawaban',
      render: (row) => (
        <div>
          <div className="text-xs font-medium line-clamp-1">{row.fileName || row.textContent ? 'Teks Daring' : 'Belum Ada Berkas'}</div>
          {row.version > 0 && (
            <Badge variant="primary" style={{ fontSize: '0.65rem' }}>Versi {row.version}</Badge>
          )}
        </div>
      )
    },
    {
      header: 'Waktu Pengumpulan',
      render: (row) => (
        <div className="text-xs">
          {row.submittedAt ? (
            <>
              <div>{new Date(row.submittedAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</div>
              {row.isLate ? (
                <span className="text-danger-600 font-bold flex items-center gap-0.5">
                  <AlertTriangle size={11} /> Terlambat
                </span>
              ) : (
                <span className="text-success-600 font-semibold">Tepat Waktu</span>
              )}
            </>
          ) : (
            <span className="text-muted italic">Belum Mengumpulkan</span>
          )}
        </div>
      )
    },
    {
      header: 'Status & Nilai',
      width: '190px',
      render: (row) => {
        if (row.status === 'SUDAH_DINILAI') {
          return (
            <div className="flex items-center gap-2">
              <Badge variant="success">Nilai: {row.finalScore} / 100</Badge>
              {row.penaltyDeduction && row.penaltyDeduction > 0 ? (
                <span className="text-[10px] text-danger-600">(-{row.penaltyDeduction})</span>
              ) : null}
            </div>
          );
        }
        if (row.status === 'PERLU_REVISI') {
          return <Badge variant="danger">Perlu Revisi</Badge>;
        }
        if (row.status === 'SUDAH_DIKUMPULKAN' || row.status === 'TERLAMBAT') {
          return <Badge variant="warning">Perlu Dinilai</Badge>;
        }
        return <Badge variant="default">Belum Mengumpulkan</Badge>;
      }
    },
    {
      header: 'Aksi',
      width: '120px',
      render: (row) => (
        <Button 
          variant={row.status === 'SUDAH_DINILAI' ? 'secondary' : 'primary'} 
          size="sm" 
          onClick={() => handleOpenGrading(row)}
        >
          {row.status === 'SUDAH_DINILAI' ? 'Ubah Nilai' : 'Beri Nilai'}
        </Button>
      )
    }
  ];

  // Export Config
  const submissionExportConfig: ExportConfig<AssignmentSubmission> = useMemo(() => ({
    filename: `SALAM_Rekap_Nilai_${assignment?.title?.replace(/\s+/g, '_') || 'Tugas'}`,
    title: `LEMBAR REKAPITULASI PENILAIAN TUGAS TERSTRUKTUR`,
    subtitle: `Tugas: ${assignment?.title || '-'} | Kelas: ${assignment?.courseName || '-'} | Batas Waktu: ${assignment ? new Date(assignment.dueDate).toLocaleString('id-ID') : '-'}`,
    data: filteredSubmissions,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Lengkap Mahasiswa', width: '220px' },
      { key: 'fileName', header: 'Berkas / Pengumpulan', width: '200px', format: (val) => val || 'Teks Daring' },
      { key: 'version', header: 'Versi', width: '70px', align: 'center' },
      { key: 'submittedAt', header: 'Waktu Pengumpulan', width: '160px', format: (val) => val ? new Date(val).toLocaleString('id-ID') : '-' },
      { key: 'isLate', header: 'Keterlambatan', width: '100px', align: 'center', format: (val) => val ? 'Terlambat' : 'Tepat Waktu' },
      { key: 'rawScore', header: 'Skor Murni', width: '80px', align: 'center', format: (val) => val !== undefined ? String(val) : '-' },
      { key: 'penaltyDeduction', header: 'Penalti', width: '80px', align: 'center', format: (val) => val ? String(val) : '0' },
      { key: 'finalScore', header: 'Nilai Akhir', width: '90px', align: 'center', format: (val) => val !== undefined ? String(val) : 'Belum Dinilai' },
      { key: 'feedbackNotes', header: 'Catatan Feedback Dosen', width: '250px' },
      { key: 'status', header: 'Status', width: '120px', align: 'center' }
    ]
  }), [assignment, filteredSubmissions]);

  // If assignment is not yet loaded or not found, render fallback JSX AFTER all hooks
  if (!assignment) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Tugas
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Data tugas tidak ditemukan atau sedang dimuat...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      {/* 1. Header Navigation & Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack} className="mb-2">
            Kembali ke Daftar Tugas
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award className="text-primary-600" size={26} />
            Studio Penilaian & Grading Dosen
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Mata Kuliah: <strong>{assignment.courseName}</strong> • Pertemuan #{assignment.meetingNumber} • {assignment.title}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ExportDropdown
            config={submissionExportConfig}
            buttonLabel="Ekspor Rekap Nilai"
          />
        </div>
      </div>

      {/* 2. Statistical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card>
          <CardBody className="py-3 px-4">
            <span className="text-xs text-muted block">Total Mahasiswa</span>
            <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100">{stats.totalEnrolled} Mhs</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-3 px-4">
            <span className="text-xs text-muted block">Sudah Mengumpulkan</span>
            <span className="text-xl font-bold text-primary-600">{stats.submittedCount} Berkas</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-3 px-4">
            <span className="text-xs text-muted block">Perlu Dinilai Segera</span>
            <span className="text-xl font-bold text-warning-600">{stats.pendingGradingCount} Berkas</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-3 px-4">
            <span className="text-xs text-muted block">Selesai Dinilai</span>
            <span className="text-xl font-bold text-success-600">{stats.gradedCount} Berkas</span>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="py-3 px-4">
            <span className="text-xs text-muted block">Rata-Rata Nilai Kelas</span>
            <span className="text-xl font-extrabold text-primary-700">{stats.averageScore} / 100</span>
          </CardBody>
        </Card>
      </div>

      {/* 3. Filter & Table Card */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          {/* Filter Tabs & Search */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'SEMUA', label: `Semua (${submissions.length})` },
                { id: 'MENUNGGU', label: `Perlu Dinilai (${stats.pendingGradingCount})` },
                { id: 'DINILAI', label: `Sudah Dinilai (${stats.gradedCount})` },
                { id: 'TERLAMBAT', label: `Terlambat (${submissions.filter(s => s.isLate).length})` },
                { id: 'BELUM', label: `Belum Kumpul (${submissions.filter(s => s.status === 'BELUM_DIKUMPULKAN').length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
                    filterStatus === tab.id
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-muted hover:bg-neutral-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative" style={{ minWidth: '260px' }}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md border"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)' }}
                placeholder="Cari nama mahasiswa / NIM..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table List */}
          <Table
            data={paginatedSubmissions}
            columns={columns}
            keyExtractor={(row) => row.studentId}
            emptyMessage="Tidak ada data pengumpulan mahasiswa yang sesuai kriteria filter."
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center text-xs text-muted pt-2 border-t" style={{ borderColor: 'var(--border-light)' }}>
              <span>Menampilkan {paginatedSubmissions.length} dari {filteredSubmissions.length} mahasiswa</span>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredSubmissions.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardBody>
      </Card>

      {/* ========================================================================= */}
      {/* 4. MODAL STUDIO PENILAIAN TERPADU & RUBRIK OBE (FULL MODAL) */}
      {/* ========================================================================= */}
      {selectedSub && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedSub(null)}
          title={`Studio Penilaian: ${selectedSub.studentName} (${selectedSub.studentNim})`}
          maxWidth="920px"
          footer={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={ChevronLeft}
                  onClick={() => handleNavigateStudent('prev')}
                >
                  Sebelumnya
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={ChevronRight}
                  onClick={() => handleNavigateStudent('next')}
                >
                  Selanjutnya
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  icon={RotateCcw}
                  onClick={() => handleSaveGrading(true)}
                  disabled={isSaving}
                >
                  Minta Revisi
                </Button>

                <Button 
                  variant="primary" 
                  size="sm"
                  icon={Save}
                  onClick={() => handleSaveGrading(false)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Nilai & Publikasikan'}
                </Button>
              </div>
            </div>
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-h-[76vh] overflow-y-auto pr-1">
            {/* PANEL KIRI: BERKAS & DETAIL SUBMISI (5 Kolom) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              {/* Header Info Mahasiswa */}
              <div className="p-3 rounded-lg border bg-neutral-50 dark:bg-neutral-800/60 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-primary-700 dark:text-primary-400">{selectedSub.studentName}</span>
                  <Badge variant={selectedSub.isLate ? 'danger' : 'success'}>
                    {selectedSub.isLate ? 'Terlambat' : 'Tepat Waktu'}
                  </Badge>
                </div>
                <span className="text-muted font-mono">NIM: {selectedSub.studentNim} • Versi: {selectedSub.version}</span>
                <span className="text-muted">
                  Waktu Kirim: {selectedSub.submittedAt ? new Date(selectedSub.submittedAt).toLocaleString('id-ID') : '-'}
                </span>
                {selectedSub.studentNotes && (
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 border text-[11px] mt-1 text-neutral-700 dark:text-neutral-300">
                    <strong>Catatan Mahasiswa:</strong> "{selectedSub.studentNotes}"
                  </div>
                )}
              </div>

              {/* Tab Selector Pratinjau */}
              <div className="flex gap-1 border-b pb-1">
                <button
                  onClick={() => setPreviewTab('berkas')}
                  className={`px-3 py-1 text-xs font-semibold rounded ${
                    previewTab === 'berkas' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-muted'
                  }`}
                >
                  Berkas Dokumen
                </button>
                {selectedSub.textContent && (
                  <button
                    onClick={() => setPreviewTab('teks')}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      previewTab === 'teks' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-muted'
                    }`}
                  >
                    Teks Jawaban
                  </button>
                )}
                {selectedSub.history && selectedSub.history.length > 1 && (
                  <button
                    onClick={() => setPreviewTab('riwayat')}
                    className={`px-3 py-1 text-xs font-semibold rounded ${
                      previewTab === 'riwayat' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-muted'
                    }`}
                  >
                    Riwayat ({selectedSub.history.length})
                  </button>
                )}
              </div>

              {/* Pratinjau Berkas Dokumen */}
              {previewTab === 'berkas' && (
                <div className="flex flex-col gap-2">
                  {selectedSub.fileName ? (
                    <div className="p-3.5 rounded-lg border bg-white dark:bg-neutral-900 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="text-primary-600" size={20} />
                          <div>
                            <p className="font-bold line-clamp-1">{selectedSub.fileName}</p>
                            <p className="text-[11px] text-muted">
                              {selectedSub.fileSizeBytes ? assignmentService.formatFileSize(selectedSub.fileSizeBytes) : 'Dokumen Mahasiswa'}
                            </p>
                          </div>
                        </div>
                        {selectedSub.fileUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Download}
                            onClick={() => window.open(selectedSub.fileUrl, '_blank')}
                          >
                            Unduh
                          </Button>
                        )}
                      </div>

                      {/* PDF / Image Viewer iframe preview jika URL valid */}
                      {selectedSub.fileUrl && selectedSub.fileUrl.startsWith('/api/') ? (
                        <div className="rounded border overflow-hidden bg-neutral-100" style={{ height: '240px' }}>
                          <iframe
                            src={selectedSub.fileUrl}
                            className="w-full h-full border-none"
                            title="Pratinjau Dokumen"
                          />
                        </div>
                      ) : (
                        <div className="p-6 text-center border border-dashed rounded bg-neutral-50 dark:bg-neutral-800 text-xs text-muted">
                          <FileText size={32} className="mx-auto mb-2 text-primary-400" />
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                            Berkas siap diunduh dan dinilai
                          </p>
                          <p className="text-[11px] mt-1">
                            Klik tombol "Unduh" di atas untuk memeriksa berkas secara lengkap.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center border rounded bg-neutral-50 text-xs text-muted">
                      Mahasiswa belum mengunggah berkas.
                    </div>
                  )}
                </div>
              )}

              {/* Teks Jawaban Mahasiswa */}
              {previewTab === 'teks' && (
                <div className="p-3.5 rounded-lg border bg-white dark:bg-neutral-900 text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                  <span className="font-bold text-muted block mb-1 uppercase tracking-wider text-[10px]">
                    Teks Jawaban Mahasiswa:
                  </span>
                  <div className="whitespace-pre-line text-neutral-800 dark:text-neutral-200">
                    {selectedSub.textContent || 'Tidak ada teks jawaban.'}
                  </div>
                </div>
              )}

              {/* Riwayat Versi */}
              {previewTab === 'riwayat' && (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                  {selectedSub.history?.map((h) => (
                    <div key={h.version} className="p-2.5 rounded border text-xs bg-white dark:bg-neutral-900 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-primary-700">Versi {h.version}</span>
                        <p className="text-[11px] text-muted">{new Date(h.submittedAt).toLocaleString('id-ID')}</p>
                      </div>
                      {h.fileUrl && (
                        <Button variant="secondary" size="sm" icon={Download} onClick={() => window.open(h.fileUrl, '_blank')}>
                          Unduh
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PANEL KANAN: RUBRIK OBE & FEEDBACK (7 Kolom) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Score Bar Banner */}
              <div className="p-3.5 rounded-lg border bg-primary-50 dark:bg-primary-950/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted block">Perhitungan Nilai Akhir:</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-2xl font-black text-primary-700 dark:text-primary-300">
                      {currentScores.final}
                    </span>
                    <span className="text-xs text-muted">/ 100 Poin</span>
                    {currentScores.penalty > 0 && (
                      <Badge variant="danger">
                        Penalti Terlambat: -{currentScores.penalty}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-muted text-[11px] block">Skor Murni Rubrik:</span>
                  <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {currentScores.raw} / 100
                  </span>
                </div>
              </div>

              {/* Rubrik Penilaian Interaktif */}
              {assignment.rubric && assignment.rubric.criteria.length > 0 ? (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary-600" /> Kriteria Rubrik Capaian Pembelajaran
                  </h4>

                  {assignment.rubric.criteria.map((crit, idx) => {
                    const currentSelected = evaluations[crit.id] || { levelId: '', score: 0 };

                    return (
                      <div key={crit.id} className="p-3 rounded-lg border bg-white dark:bg-neutral-900 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-neutral-800 dark:text-neutral-100">
                              {idx + 1}. {crit.title}
                            </span>
                            <span className="text-muted text-[11px] ml-1.5">(Bobot: {crit.weightPercentage}%)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] font-semibold">Skor:</span>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              className="w-16 p-1 text-xs text-center font-bold rounded border"
                              value={currentSelected.score}
                              onChange={(e) => {
                                const val = Math.min(100, Math.max(0, Number(e.target.value)));
                                setEvaluations({
                                  ...evaluations,
                                  [crit.id]: { ...currentSelected, score: val }
                                });
                              }}
                            />
                          </div>
                        </div>

                        {/* Level Buttons Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                          {crit.levels.map((lvl) => {
                            const isChosen = currentSelected.levelId === lvl.id;
                            return (
                              <button
                                key={lvl.id}
                                type="button"
                                onClick={() => {
                                  setEvaluations({
                                    ...evaluations,
                                    [crit.id]: { levelId: lvl.id, score: lvl.points }
                                  });
                                }}
                                className={`p-2 rounded text-left text-xs border transition-all flex flex-col justify-between ${
                                  isChosen
                                    ? 'bg-primary-600 text-white border-primary-600 shadow-sm font-semibold'
                                    : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 hover:border-primary-400'
                                }`}
                              >
                                <span className="font-bold text-[11px]">{lvl.title}</span>
                                <span className={`text-[10px] mt-1 ${isChosen ? 'text-primary-100' : 'text-muted'}`}>
                                  {lvl.points} Poin
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-lg border bg-white dark:bg-neutral-900 flex flex-col gap-2">
                  <label className="text-xs font-bold">Input Nilai Angka Manual (0 - 100):</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={String(manualRawScore)}
                    onChange={(e) => setManualRawScore(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Feedback Notes Dosen */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-primary-600" /> Catatan Masukan & Koreksi Dosen:
                  </label>
                </div>

                <textarea
                  className="w-full p-2.5 text-xs rounded-md border"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)', minHeight: '80px' }}
                  placeholder="Berikan catatan evaluasi, poin apresiasi, atau petunjuk perbaikan bagi mahasiswa..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />

                {/* Quick Phrases */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-muted font-semibold self-center">Template Cepat:</span>
                  {[
                    'Makalah disusun sangat runtut & analisis kaidah tajam.',
                    'Rujukan turats primer sangat lengkap.',
                    'Perbaiki sitasi dan daftar pustaka.',
                    'Silakan lakukan perbaikan format sesuai template.'
                  ].map((phrase, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertQuickFeedback(phrase)}
                      className="px-2 py-0.5 text-[10px] rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 hover:bg-primary-100 hover:text-primary-700 transition-all"
                    >
                      + {phrase}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
