import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Upload, 
  Search, 
  X, 
  Download,
  Edit,
  Trash2,
  Folder,
  Layers,
  Eye,
  CheckCircle2,
  FileQuestion,
  Image as ImageIcon
} from 'lucide-react';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { BankQuestion, QuestionType, QuestionDifficulty, ImportQuestionInput } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { QUESTION_BANK_IMPORT_SCHEMA } from '../../constants/exportImportSchemas';
import { exportQuestionBankExcelTemplate } from '../../utils/excelUtils';

export interface BankSoalPageProps {
  onBack: () => void;
}

const COURSES_INFO: Record<string, string> = {
  'PAI-301': 'Ushul Fiqih & Qawaid Fiqhiyyah',
  'PAI-204': 'Ulumul Qur\'an & Tafsir Tematik',
  'PAI-205': 'Ulumul Hadits & Kritik Sanad',
  'PAI-302': 'Pengembangan Kurikulum PAI',
  'PAI-102': 'Ilmu Pendidikan Islam',
  'TAR-204': 'Sejarah Peradaban Islam',
  'TBI-201': 'Bahasa Arab Komunikatif & Qira\'ah',
  'MPI-101': 'Manajemen Pendidikan Islam',
  'EKS-201': 'Fiqih Muamalah & Ekonomi Syariah',
};

export const BankSoalPage: React.FC<BankSoalPageProps> = ({ onBack }) => {
  const toast = useToast();
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('SEMUA');
  const [filterDifficulty, setFilterDifficulty] = useState('SEMUA');
  
  // Modals
  const [editModal, setEditModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState<BankQuestion | null>(null);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewingQuestion, setPreviewingQuestion] = useState<BankQuestion | null>(null);
  const [importModal, setImportModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Form states untuk Tambah/Edit Manual
  const [courseCode, setCourseCode] = useState('PAI-301');
  const [topic, setTopic] = useState('');
  const [qType, setQType] = useState<QuestionType>('PILIHAN_GANDA');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('SEDANG');
  const [questionText, setQuestionText] = useState('');
  const [arabicText, setArabicText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [points, setPoints] = useState(20);
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState('');

  // Pilihan Ganda Form states (5 Opsi A, B, C, D, E)
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [optE, setOptE] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState(0);
  const [shortAnswer, setShortAnswer] = useState('');
  const [essayRubric, setEssayRubric] = useState('');

  const loadQuestions = () => {
    setQuestions(quizService.getBankQuestions());
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterDifficulty, selectedCourse]);

  const hasActiveFilters = searchQuery !== '' || filterType !== 'SEMUA' || filterDifficulty !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('SEMUA');
    setFilterDifficulty('SEMUA');
    setCurrentPage(1);
  };

  // Group questions by course code for summary stats
  const courseStats = useMemo(() => {
    const stats: Record<string, { code: string; name: string; total: number; pg: number; bs: number; js: number; esai: number }> = {};
    
    // Add known courses first
    Object.entries(COURSES_INFO).forEach(([code, name]) => {
      stats[code] = { code, name, total: 0, pg: 0, bs: 0, js: 0, esai: 0 };
    });

    questions.forEach((q) => {
      const code = q.courseCode || 'LAINNYA';
      if (!stats[code]) {
        stats[code] = { code, name: COURSES_INFO[code] || 'Mata Kuliah Pilihan', total: 0, pg: 0, bs: 0, js: 0, esai: 0 };
      }
      stats[code].total += 1;
      if (q.type === 'PILIHAN_GANDA') stats[code].pg += 1;
      if (q.type === 'BENAR_SALAH') stats[code].bs += 1;
      if (q.type === 'JAWABAN_SINGKAT') stats[code].js += 1;
      if (q.type === 'ESAI') stats[code].esai += 1;
    });

    return stats;
  }, [questions]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingQuestionId(null);
    setCourseCode(selectedCourse || 'PAI-301');
    setTopic('');
    setQType('PILIHAN_GANDA');
    setDifficulty('SEDANG');
    setQuestionText('');
    setArabicText('');
    setImageUrl('');
    setPoints(20);
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
    setOptE('');
    setCorrectOptIndex(0);
    setShortAnswer('');
    setEssayRubric('');
    setExplanation('');
    setTags('');
    setEditModal(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (q: BankQuestion) => {
    setEditingQuestionId(q.id);
    setCourseCode(q.courseCode);
    setTopic(q.topic);
    setQType(q.type);
    setDifficulty(q.difficulty);
    setQuestionText(q.questionText);
    setArabicText(q.arabicText || '');
    setImageUrl(q.imageUrl || '');
    setPoints(q.defaultPoints);
    setExplanation(q.explanation || '');
    setTags(q.tags?.join(', ') || '');

    if (q.type === 'PILIHAN_GANDA' || q.type === 'BENAR_SALAH') {
      const opts = q.options || [];
      setOptA(opts[0]?.text || '');
      setOptB(opts[1]?.text || '');
      setOptC(opts[2]?.text || '');
      setOptD(opts[3]?.text || '');
      setOptE(opts[4]?.text || '');
      const correctIdx = opts.findIndex((o) => o.isCorrect);
      setCorrectOptIndex(correctIdx >= 0 ? correctIdx : 0);
    } else {
      setOptA('');
      setOptB('');
      setOptC('');
      setOptD('');
      setOptE('');
      setCorrectOptIndex(0);
    }

    setShortAnswer(q.correctShortAnswer || '');
    setEssayRubric(q.essayRubric || '');
    setEditModal(true);
  };

  // Confirm Delete
  const handleOpenDelete = (q: BankQuestion) => {
    setDeletingQuestion(q);
    setDeleteConfirmModal(true);
  };

  const handleExecuteDelete = () => {
    if (!deletingQuestion) return;
    try {
      quizService.deleteBankQuestion(deletingQuestion.id);
      loadQuestions();
      setDeleteConfirmModal(false);
      setDeletingQuestion(null);
      toast.success('Soal Dihapus', 'Butir soal telah berhasil dihapus dari Bank Soal.');
    } catch (err: any) {
      toast.danger('Gagal Menghapus', err.message);
    }
  };

  // Save (Create or Update) Question
  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (points > 100) {
        toast.warning(
          'Peringatan Bobot Soal',
          `Bobot poin butir soal (${points} poin) melebihi batas standar maksimal 100 poin.`
        );
      }
      if (points < 1) {
        toast.danger('Bobot Tidak Valid', 'Bobot poin butir soal minimal adalah 1 poin.');
        return;
      }

      let options: { id: string; text: string; isCorrect: boolean }[] | undefined;

      if (qType === 'BENAR_SALAH') {
        options = [
          { id: `opt-${Date.now()}-1`, text: 'Benar', isCorrect: correctOptIndex === 0 },
          { id: `opt-${Date.now()}-2`, text: 'Salah', isCorrect: correctOptIndex === 1 },
        ];
      } else if (qType === 'PILIHAN_GANDA') {
        const rawOptions = [
          { id: `opt-${Date.now()}-1`, text: optA.trim(), isCorrect: correctOptIndex === 0 },
          { id: `opt-${Date.now()}-2`, text: optB.trim(), isCorrect: correctOptIndex === 1 },
          { id: `opt-${Date.now()}-3`, text: optC.trim(), isCorrect: correctOptIndex === 2 },
          { id: `opt-${Date.now()}-4`, text: optD.trim(), isCorrect: correctOptIndex === 3 },
          { id: `opt-${Date.now()}-5`, text: optE.trim(), isCorrect: correctOptIndex === 4 },
        ].filter((o) => o.text !== '');

        if (rawOptions.length < 2) {
          toast.warning('Opsi Kurang', 'Soal pilihan ganda minimal harus memiliki 2 opsi jawaban.');
          return;
        }

        options = rawOptions;
      }

      const questionPayload = {
        courseCode,
        topic: topic.trim() || 'Umum',
        type: qType,
        difficulty,
        questionText: questionText.trim(),
        arabicText: arabicText.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        options,
        correctShortAnswer: qType === 'JAWABAN_SINGKAT' ? shortAnswer.trim() : undefined,
        essayRubric: qType === 'ESAI' ? essayRubric.trim() : undefined,
        defaultPoints: points,
        explanation: explanation.trim() || undefined,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
      };

      if (editingQuestionId) {
        quizService.updateBankQuestion(editingQuestionId, questionPayload);
        toast.success('Soal Diperbarui', 'Perubahan butir soal berhasil disimpan.');
      } else {
        quizService.addBankQuestion(questionPayload);
        toast.success('Soal Ditambahkan', 'Butir soal baru berhasil disimpan ke Bank Soal.');
      }

      loadQuestions();
      setEditModal(false);
      setEditingQuestionId(null);
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Soal', err.message);
    }
  };

  // Handler Impor Massal Excel
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

          options = rawOpts.map((opt, oIdx) => ({
            id: `opt-imp-${Date.now()}-${idx}-${oIdx}`,
            text: opt.text,
            isCorrect: opt.key === cleanKey || opt.text.toUpperCase() === cleanKey || String.fromCharCode(65 + oIdx) === cleanKey
          }));
        }

        quizService.addBankQuestion({
          courseCode: row.courseCode || 'PAI-301',
          topic: row.topic || 'Materi Pokok',
          type: row.type || 'PILIHAN_GANDA',
          difficulty: row.difficulty || 'SEDANG',
          questionText: row.questionText,
          arabicText: row.arabicText?.trim() || undefined,
          imageUrl: row.imageUrl?.trim() || undefined,
          options,
          correctShortAnswer: shortAnswer,
          essayRubric,
          defaultPoints: Number(row.defaultPoints) || 20,
          explanation: row.explanation,
          tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : ['Impor Excel']
        });

        successCount += 1;
      } catch (err: any) {
        failedCount += 1;
        errors.push(`Baris #${idx + 1}: ${err.message || 'Galat saat memproses butir soal.'}`);
      }
    });

    const highPointRows = validRows.filter((r) => Number(r.defaultPoints) > 100);
    if (highPointRows.length > 0) {
      toast.warning(
        'Peringatan Bobot Soal',
        `Terdeteksi ${highPointRows.length} butir soal hasil impor dengan bobot melebihi batas 100 poin.`
      );
    }

    loadQuestions();
    return {
      total: validRows.length,
      inserted: successCount,
      updated: 0,
      skipped: failedCount,
      errors
    };
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSearch = 
        q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = filterType === 'SEMUA' || q.type === filterType;
      const matchesDifficulty = filterDifficulty === 'SEMUA' || q.difficulty === filterDifficulty;
      const matchesCourse = !selectedCourse || selectedCourse === 'SEMUA' || q.courseCode === selectedCourse;
      
      return matchesSearch && matchesType && matchesDifficulty && matchesCourse;
    });
  }, [questions, searchQuery, filterType, filterDifficulty, selectedCourse]);

  // Paginated Questions
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage, pageSize]);

  // Konfigurasi Ekspor Profesional Bank Soal
  const bankQuestionExportConfig: ExportConfig<BankQuestion> = useMemo(() => ({
    filename: `SALAM_Bank_Soal_${selectedCourse || 'Semua_MK'}`,
    title: `REPOSITORI & BANK SOAL KURIKULUM — ${selectedCourse ? (COURSES_INFO[selectedCourse] || selectedCourse) : 'SEMUA MATA KULIAH'}`,
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredQuestions,
    columns: [
      { key: 'courseCode', header: 'Kode MK', width: '90px' },
      { key: 'topic', header: 'Topik / Materi', width: '160px' },
      { key: 'type', header: 'Tipe Soal', width: '120px' },
      { key: 'difficulty', header: 'Tingkat', width: '80px', align: 'center' },
      { key: 'questionText', header: 'Teks Pertanyaan', width: '280px' },
      { key: 'arabicText', header: 'Teks Arab / Matan', width: '200px', format: (val: any) => val || '-' },
      { key: 'imageUrl', header: 'Gambar / Ilustrasi', width: '120px', format: (val: any) => val ? 'Ada Gambar' : '-' },
      { key: 'defaultPoints', header: 'Poin', width: '60px', align: 'center' },
      { 
        key: 'options', 
        header: 'Kunci Jawaban', 
        width: '180px',
        format: (_: any, q: BankQuestion) => {
          if (q.type === 'PILIHAN_GANDA' || q.type === 'BENAR_SALAH') {
            const correctIdx = q.options?.findIndex((o) => o.isCorrect);
            const correctOpt = q.options?.find((o) => o.isCorrect);
            if (correctIdx !== undefined && correctIdx >= 0 && correctOpt) {
              return `[${String.fromCharCode(65 + correctIdx)}] ${correctOpt.text}`;
            }
            return '-';
          }
          if (q.type === 'JAWABAN_SINGKAT') return q.correctShortAnswer || '-';
          return 'Rubrik Terlampir';
        }
      },
      { key: 'explanation', header: 'Pembahasan', width: '200px', format: (val: any) => val || '-' }
    ],
    metadata: {
      'Total Butir Soal': `${filteredQuestions.length} Soal`,
      'Mata Kuliah': selectedCourse || 'Semua Mata Kuliah',
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredQuestions, selectedCourse]);

  // Table Columns Definition
  const columns: Column<BankQuestion>[] = [
    {
      header: 'No',
      width: '50px',
      render: (_, index) => (
        <span style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {(currentPage - 1) * pageSize + index + 1}
        </span>
      )
    },
    {
      header: 'Mata Kuliah',
      width: '110px',
      render: (q) => (
        <Badge variant="primary" style={{ fontSize: '11px', fontWeight: 'bold' }}>
          {q.courseCode}
        </Badge>
      )
    },
    {
      header: 'Teks Pertanyaan & Materi',
      render: (q) => (
        <div className="flex flex-col gap-1">
          <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
            {q.questionText}
          </div>
          {q.arabicText && (
            <div 
              style={{
                fontFamily: "'Amiri', 'Traditional Arabic', serif",
                fontSize: '1.05rem',
                color: '#065f46',
                direction: 'rtl',
                textAlign: 'right',
                lineHeight: 1.6
              }}
            >
              {q.arabicText}
            </div>
          )}
          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Topik: <strong>{q.topic}</strong>
            </span>
            {q.imageUrl && (
              <Badge variant="default" className="flex items-center gap-1" style={{ fontSize: '10px' }}>
                <ImageIcon size={10} /> Ada Gambar
              </Badge>
            )}
            {q.tags?.map((t, idx) => (
              <span key={idx} style={{ fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', padding: '1px 6px', borderRadius: '4px' }}>
                #{t}
              </span>
            ))}
          </div>
        </div>
      )
    },
    {
      header: 'Tipe & Tingkat',
      width: '150px',
      render: (q) => (
        <div className="flex flex-col gap-1">
          <Badge variant="default" style={{ fontSize: '11px', width: 'fit-content' }}>
            {q.type.replace('_', ' ')}
          </Badge>
          <Badge 
            variant={q.difficulty === 'MUDAH' ? 'success' : q.difficulty === 'SEDANG' ? 'warning' : 'danger'}
            style={{ fontSize: '10px', width: 'fit-content' }}
          >
            {q.difficulty}
          </Badge>
        </div>
      )
    },
    {
      header: 'Bobot',
      width: '80px',
      render: (q) => (
        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)' }}>
          {q.defaultPoints} Pts
        </div>
      )
    },
    {
      header: 'Aksi',
      width: '130px',
      render: (q) => (
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setPreviewingQuestion(q);
              setPreviewModal(true);
            }}
            title="Pratinjau Butir Soal"
            style={{ padding: '6px', color: 'var(--text-muted)' }}
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleOpenEdit(q)}
            title="Edit Butir Soal"
            style={{ padding: '6px' }}
          >
            <Edit size={14} color="var(--color-primary-700)" />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => handleOpenDelete(q)}
            title="Hapus Butir Soal"
            style={{ padding: '6px', color: 'var(--color-danger-main)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
            Kembali ke Kuis
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 style={{ margin: 0 }}>{KAMUS_UI.BANK_SOAL}</h1>
              <Badge variant="primary">{questions.length} Butir Soal</Badge>
              {selectedCourse && selectedCourse !== 'SEMUA' && (
                <Badge variant="success">MK: {selectedCourse}</Badge>
              )}
            </div>
            <p style={{ margin: 0, marginTop: '2px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Repositori butir soal terstandar kurikulum berdasarkan Capaian Pembelajaran Mata Kuliah (CPMK)
            </p>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            variant="ghost" 
            size="sm"
            icon={Download} 
            onClick={exportQuestionBankExcelTemplate}
            title="Unduh Template Resmi Excel Bank Soal STAI Al-Ittihad"
          >
            Template Excel
          </Button>
          <Button 
            variant="outline" 
            icon={Upload} 
            onClick={() => setImportModal(true)}
          >
            Impor Excel
          </Button>
          <ExportDropdown 
            config={bankQuestionExportConfig} 
            buttonLabel="Ekspor Bank Soal" 
          />
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={handleOpenCreate}
            style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}
          >
            Tambah Soal Baru
          </Button>
        </div>
      </div>

      {/* =========================================================================
          FOLDER / MATA KULIAH CARDS (NAVIGATION DARI TAMPILAN GLOBAL KE SPESIFIK)
          ========================================================================= */}
      <div>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Folder size={16} color="var(--color-primary-700)" />
            Kategori Mata Kuliah Bank Soal:
          </h3>
          {selectedCourse && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedCourse(null)}
              style={{ fontSize: '11px', color: 'var(--color-primary-700)' }}
            >
              Tampilkan Semua Mata Kuliah
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Card Semua */}
          <div
            onClick={() => setSelectedCourse(null)}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${selectedCourse === null ? 'var(--color-primary-600)' : 'var(--border-default)'}`,
              backgroundColor: selectedCourse === null ? 'var(--color-primary-50)' : 'var(--bg-surface)',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: selectedCourse === null ? 'var(--color-primary-800)' : 'var(--text-primary)' }}>
                Semua Soal
              </span>
              <Layers size={14} color={selectedCourse === null ? 'var(--color-primary-700)' : 'var(--text-muted)'} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '4px' }}>
              {questions.length} <span style={{ fontSize: '10px', fontWeight: 'normal', color: 'var(--text-muted)' }}>Butir</span>
            </div>
          </div>

          {/* Cards per Course */}
          {Object.entries(courseStats).filter(([_, st]) => st.total > 0).map(([code, st]) => {
            const isSelected = selectedCourse === code;
            return (
              <div
                key={code}
                onClick={() => setSelectedCourse(isSelected ? null : code)}
                style={{
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-lg)',
                  border: `2px solid ${isSelected ? 'var(--color-primary-600)' : 'var(--border-default)'}`,
                  backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 5px' }}>{code}</Badge>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{st.total} Soal</span>
                </div>
                <div 
                  style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold', 
                    color: isSelected ? 'var(--color-primary-900)' : 'var(--text-primary)', 
                    marginTop: '6px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                  title={st.name}
                >
                  {st.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  PG: {st.pg} • Esai: {st.esai} • B/S: {st.bs}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Cari teks soal, topik, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="SEMUA">Semua Tipe Soal</option>
              <option value="PILIHAN_GANDA">Pilihan Ganda</option>
              <option value="BENAR_SALAH">Benar / Salah</option>
              <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
              <option value="ESAI">Esai / Uraian</option>
            </select>

            <div className="flex items-center gap-2">
              <select
                className="form-select"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="SEMUA">Semua Tingkat</option>
                <option value="MUDAH">Mudah</option>
                <option value="SEDANG">Sedang</option>
                <option value="SULIT">Sulit</option>
              </select>

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Filter"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =========================================================================
          DAFTAR TABEL REPOSITORI BANK SOAL (TABULAR DENGAN AKSI EDIT & HAPUS)
          ========================================================================= */}
      <Card>
        <CardBody style={{ padding: 0 }}>
          {filteredQuestions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
              <FileQuestion size={44} color="var(--text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Tidak Ada Butir Soal Ditemukan</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: '4px', marginBottom: 'var(--space-4)' }}>
                Belum ada butir soal pada kategori ini atau tidak sesuai dengan kata kunci pencarian.
              </p>
              <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
                Tambah Soal Baru
              </Button>
            </div>
          ) : (
            <Table
              data={paginatedQuestions}
              columns={columns}
              keyExtractor={(q) => q.id}
            />
          )}
        </CardBody>
      </Card>

      {/* Pagination Footer */}
      {filteredQuestions.length > 0 && (
        <Card>
          <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredQuestions.length}
              pageSize={pageSize}
              pageSizeOptions={[10, 20, 50]}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="butir soal"
            />
          </CardBody>
        </Card>
      )}

      {/* =========================================================================
          MODAL PREVIEW DETAIL SOAL
          ========================================================================= */}
      {previewModal && previewingQuestion && (
        <Modal
          isOpen={previewModal}
          onClose={() => setPreviewModal(false)}
          title="Pratinjau Butir Soal Bank Soal"
          maxWidth="640px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Edit} 
                onClick={() => {
                  setPreviewModal(false);
                  handleOpenEdit(previewingQuestion);
                }}
              >
                Edit Soal Ini
              </Button>
              <Button variant="primary" size="sm" onClick={() => setPreviewModal(false)}>
                Tutup
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="primary">{previewingQuestion.courseCode}</Badge>
              <Badge variant="default">{previewingQuestion.type.replace('_', ' ')}</Badge>
              <Badge variant={previewingQuestion.difficulty === 'MUDAH' ? 'success' : previewingQuestion.difficulty === 'SEDANG' ? 'warning' : 'danger'}>
                {previewingQuestion.difficulty}
              </Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Topik: {previewingQuestion.topic}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>{previewingQuestion.defaultPoints} Poin</span>
            </div>

            <div>
              <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Pertanyaan:</label>
              <p style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                {previewingQuestion.questionText}
              </p>
            </div>

            {previewingQuestion.arabicText && (
              <div 
                style={{
                  direction: 'rtl',
                  fontFamily: "'Amiri', 'Traditional Arabic', serif",
                  fontSize: '1.3rem',
                  lineHeight: 2.2,
                  textAlign: 'right',
                  backgroundColor: '#fdfbf7',
                  color: '#1e293b',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fde68a',
                  borderRight: '5px solid var(--color-primary-700)'
                }}
              >
                {previewingQuestion.arabicText}
              </div>
            )}

            {previewingQuestion.imageUrl && (
              <div>
                <img 
                  src={previewingQuestion.imageUrl} 
                  alt="Ilustrasi Soal" 
                  style={{ maxHeight: '220px', maxWidth: '100%', objectFit: 'contain', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }} 
                />
              </div>
            )}

            {previewingQuestion.options && (
              <div className="flex flex-col gap-2">
                <label className="form-label" style={{ color: 'var(--text-muted)', fontSize: '11px', margin: 0 }}>Opsi Jawaban & Kunci:</label>
                {previewingQuestion.options.map((opt, oIdx) => (
                  <div
                    key={opt.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: opt.isCorrect ? 'var(--color-success-50)' : 'var(--bg-subtle)',
                      border: `1px solid ${opt.isCorrect ? 'var(--color-success-border)' : 'var(--border-default)'}`,
                      color: opt.isCorrect ? 'var(--color-success-main)' : 'var(--text-primary)',
                      fontWeight: opt.isCorrect ? 'bold' : 'normal',
                      fontSize: 'var(--text-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>{String.fromCharCode(65 + oIdx)}. {opt.text}</span>
                    {opt.isCorrect && <CheckCircle2 size={16} />}
                  </div>
                ))}
              </div>
            )}

            {previewingQuestion.correctShortAnswer && (
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-success-main)' }}>
                <strong>Kunci Jawaban Singkat:</strong> {previewingQuestion.correctShortAnswer}
              </div>
            )}

            {previewingQuestion.essayRubric && (
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                <strong>Rubrik Esai:</strong> {previewingQuestion.essayRubric}
              </div>
            )}

            {previewingQuestion.explanation && (
              <div style={{ padding: '8px 12px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                <strong>Pembahasan:</strong> {previewingQuestion.explanation}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL KONFIRMASI HAPUS SOAL
          ========================================================================= */}
      {deleteConfirmModal && deletingQuestion && (
        <Modal
          isOpen={deleteConfirmModal}
          onClose={() => setDeleteConfirmModal(false)}
          title="Konfirmasi Hapus Butir Soal"
          maxWidth="460px"
          footer={
            <>
              <Button variant="secondary" onClick={() => setDeleteConfirmModal(false)}>
                Batal
              </Button>
              <Button variant="danger" icon={Trash2} onClick={handleExecuteDelete}>
                Ya, Hapus Soal
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              Apakah Anda yakin ingin menghapus butir soal ini dari Bank Soal?
            </p>
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                [{deletingQuestion.courseCode}] {deletingQuestion.questionText}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Tipe: {deletingQuestion.type} • Bobot: {deletingQuestion.defaultPoints} Poin
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--color-danger-main)' }}>
              ⚠️ Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL FORM TAMBAH / EDIT SOAL (UPLOAD GAMBAR, ARABIC RTL, 5 OPSI A-E)
          ========================================================================= */}
      {editModal && (
        <Modal
          isOpen={editModal}
          onClose={() => setEditModal(false)}
          title={editingQuestionId ? "Edit Butir Soal Bank Soal" : "Tambah Butir Soal Baru ke Bank Soal"}
          maxWidth="680px"
        >
          <form onSubmit={handleSaveQuestion} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label font-bold">Mata Kuliah / Kode MK</label>
                <select 
                  className="form-select"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                >
                  {Object.entries(COURSES_INFO).map(([code, name]) => (
                    <option key={code} value={code}>[{code}] {name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label font-bold">Topik / Materi Pokok</label>
                <Input
                  required
                  placeholder="Misal: Kaidah Lughawiyah"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label font-bold">Tipe Soal</label>
                <select
                  className="form-select"
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                >
                  <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                  <option value="BENAR_SALAH">Benar / Salah</option>
                  <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
                  <option value="ESAI">Esai / Uraian</option>
                </select>
              </div>

              <div>
                <label className="form-label font-bold">Tingkat Kesulitan</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
                >
                  <option value="MUDAH">Mudah</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="SULIT">Sulit</option>
                </select>
              </div>

              <div>
                <label className="form-label font-bold">Default Bobot Poin</label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value, 10) || 0)}
                />
              </div>
            </div>

            <div>
              <label className="form-label font-bold">
                Teks Pertanyaan / Soal <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                required
                placeholder="Tuliskan butir soal secara lengkap dan jelas..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </div>

            {/* Teks Arab / Matan Kaidah / Ayat / Hadits */}
            <div className="p-3 rounded-md border" style={{ backgroundColor: '#fdfbf7', borderColor: '#fde68a', borderRight: '4px solid var(--color-primary-700)' }}>
              <label className="form-label" style={{ color: '#92400e', fontWeight: 'bold' }}>
                📖 Teks Arab / Matan / Ayat / Hadits (Opsional untuk Soal Agama/Syariah)
              </label>
              <textarea
                className="form-textarea"
                rows={2}
                dir="rtl"
                placeholder="اكتب النص العربي أو متن الحديث / القاعدة هنا..."
                value={arabicText}
                onChange={(e) => setArabicText(e.target.value)}
                style={{
                  fontFamily: "'Amiri', 'Traditional Arabic', serif",
                  fontSize: '1.25rem',
                  lineHeight: 2,
                  textAlign: 'right',
                  backgroundColor: '#ffffff'
                }}
              />
              {arabicText && (
                <div style={{ marginTop: '6px', fontSize: '11px', color: '#b45309' }}>
                  Pratinjau Tipografi: <span style={{ fontFamily: "'Amiri', serif", fontSize: '1.15rem' }}>{arabicText}</span>
                </div>
              )}
            </div>

            {/* URL / Unggah Gambar Ilustrasi Soal */}
            <div className="p-3 rounded-md border" style={{ backgroundColor: 'var(--color-slate-50)', borderColor: 'var(--border-default)' }}>
              <label className="form-label font-bold">🖼 Gambar Ilustrasi / Diagram Soal (Opsional)</label>
              <div className="flex gap-2">
                <Input
                  placeholder="URL gambar atau unggah dari perangkat..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ flex: 1, fontSize: 'var(--text-xs)' }}
                />
                <label 
                  className="btn btn-secondary"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Upload size={14} /> Unggah File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (loadEv) => {
                          if (typeof loadEv.target?.result === 'string') {
                            setImageUrl(loadEv.target.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {imageUrl && (
                <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={imageUrl} 
                    alt="Pratinjau Soal" 
                    style={{ maxHeight: '100px', maxWidth: '180px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                  />
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm" 
                    onClick={() => setImageUrl('')}
                    style={{ color: 'var(--color-danger-main)', fontSize: '11px' }}
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>

            {/* Opsi Jawaban: Pilihan Ganda (5 Opsi A, B, C, D, E) */}
            {qType === 'PILIHAN_GANDA' && (
              <div className="flex flex-col gap-2 p-3 rounded-md border" style={{ backgroundColor: 'var(--color-slate-50)', borderColor: 'var(--border-default)' }}>
                <div className="flex justify-between items-center">
                  <label className="form-label font-bold" style={{ margin: 0 }}>5 Opsi Jawaban & Kunci Benar (A – E)</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pilih radio untuk menentukan kunci benar</span>
                </div>
                
                {[
                  { key: 'optA', label: 'A', val: optA, set: setOptA, req: true },
                  { key: 'optB', label: 'B', val: optB, set: setOptB, req: true },
                  { key: 'optC', label: 'C', val: optC, set: setOptC, req: false },
                  { key: 'optD', label: 'D', val: optD, set: setOptD, req: false },
                  { key: 'optE', label: 'E', val: optE, set: setOptE, req: false },
                ].map((item, idx) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input 
                      type="radio" 
                      name="correctOptBank" 
                      checked={correctOptIndex === idx} 
                      onChange={() => setCorrectOptIndex(idx)} 
                      title={`Jadikan Kunci Benar ${item.label}`}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-700)', cursor: 'pointer' }}
                    />
                    <Input 
                      placeholder={`Opsi ${item.label}${item.req ? ' (Wajib)' : ' (Opsional)'}`} 
                      required={item.req}
                      value={item.val} 
                      onChange={(e) => item.set(e.target.value)} 
                      style={{
                        borderColor: correctOptIndex === idx ? 'var(--color-success-border)' : undefined,
                        backgroundColor: correctOptIndex === idx ? 'var(--color-success-bg)' : undefined
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Opsi Jawaban: Benar / Salah */}
            {qType === 'BENAR_SALAH' && (
              <div className="flex flex-col gap-2 p-3 rounded-md border" style={{ backgroundColor: 'var(--color-slate-50)', borderColor: 'var(--border-default)' }}>
                <label className="form-label font-bold">Kunci Jawaban yang Benar</label>
                <div className="flex gap-4">
                  {['Benar', 'Salah'].map((opt, li) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="correctBSBank" 
                        checked={correctOptIndex === li} 
                        onChange={() => setCorrectOptIndex(li)} 
                        style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-700)' }}
                      />
                      <span style={{ fontWeight: correctOptIndex === li ? 'bold' : 'normal' }}>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Jawaban Singkat */}
            {qType === 'JAWABAN_SINGKAT' && (
              <div>
                <label className="form-label font-bold">Kunci Kata Kunci Jawaban Singkat</label>
                <Input
                  required
                  placeholder="Ketik kata kunci jawaban yang tepat (tidak sensitif huruf besar/kecil)"
                  value={shortAnswer}
                  onChange={(e) => setShortAnswer(e.target.value)}
                />
              </div>
            )}

            {/* Esai Rubrik */}
            {qType === 'ESAI' && (
              <div>
                <label className="form-label font-bold">Panduan Rubrik Penilaian Dosen</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Kriteria penilaian esai (misal: Bobot definisi 40%, contoh kasus 60%)..."
                  value={essayRubric}
                  onChange={(e) => setEssayRubric(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="form-label">Penjelasan / Pembahasan Soal (Opsional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                placeholder="Penjelasan hukum atau dalil rujukan..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Tagar / Kata Kunci (Pisahkan koma)</label>
              <Input
                placeholder="misal: Fiqih, Ushul, Kaidah Amar"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="secondary" type="button" onClick={() => setEditModal(false)}>
                Batal
              </Button>
              <Button variant="primary" type="submit" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
                {editingQuestionId ? 'Simpan Perubahan' : 'Simpan ke Bank Soal'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================================
          MODAL IMPOR BUTIR SOAL EXCEL
          ========================================================================= */}
      {importModal && (
        <DataImportModal<ImportQuestionInput>
          isOpen={importModal}
          onClose={() => setImportModal(false)}
          schema={QUESTION_BANK_IMPORT_SCHEMA}
          onImport={handleBulkImportQuestions}
          customTitle="Pusat Impor Bank Soal Kurikulum (Format Excel Terstandar)"
        />
      )}
    </div>
  );
};

