import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  BookOpen,
  Settings,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Eye,
  Shuffle,
  ShieldCheck,
  Clock,
  Award,
  Save,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { QuizQuestionItem, QuestionType, QuestionDifficulty, BankQuestion } from '../../types/quiz';
import { quizService } from '../../services/quizService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';

export interface QuizCreatePageProps {
  onBack: () => void;
  onCreated: (quizId: string) => void;
}

// =========================================================================
// CONSTANTS
// =========================================================================
const AVAILABLE_COURSES = [
  { classId: 'cls-pai301-a', code: 'PAI-301', name: 'Ushul Fiqih & Qawaid Fiqhiyyah' },
  { classId: 'cls-tbi201-a', code: 'TBI-201', name: 'Bahasa Arab Komunikatif & Qira\'ah' },
  { classId: 'cls-mpi101-a', code: 'MPI-101', name: 'Manajemen Pendidikan Islam' },
  { classId: 'cls-pai402-a', code: 'PAI-402', name: 'Metodologi Penelitian PAI' },
  { classId: 'cls-eks201-a', code: 'EKS-201', name: 'Fiqih Muamalah & Ekonomi Syariah' },
];

const WIZARD_STEPS = [
  { id: 1, label: 'Info Kuis', icon: FileText, desc: 'Judul, mata kuliah, durasi' },
  { id: 2, label: 'Butir Soal', icon: HelpCircle, desc: 'Tambah & susun soal' },
  { id: 3, label: 'Pengaturan', icon: Settings, desc: 'CBT, pengacakan, jadwal' },
  { id: 4, label: 'Pratinjau', icon: Eye, desc: 'Review & terbitkan' },
];

// =========================================================================
// TYPES
// =========================================================================
interface DraftQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  questionText: string;
  arabicText: string;
  imageUrl: string;
  points: number;
  explanation: string;
  topic: string;
  tags: string;
  optA: string;
  optB: string;
  optC: string;
  optD: string;
  optE: string;
  correctOptIndex: number;
  shortAnswer: string;
  essayRubric: string;
  isExpanded: boolean;
  fromBank: boolean;
}

function createBlankQuestion(idx: number): DraftQuestion {
  return {
    id: `draft-q-${Date.now()}-${idx}`,
    type: 'PILIHAN_GANDA',
    difficulty: 'SEDANG',
    questionText: '',
    arabicText: '',
    imageUrl: '',
    points: 20,
    explanation: '',
    topic: '',
    tags: '',
    optA: '', optB: '', optC: '', optD: '', optE: '',
    correctOptIndex: 0,
    shortAnswer: '',
    essayRubric: '',
    isExpanded: true,
    fromBank: false,
  };
}

function bankQuestionToDraft(bq: BankQuestion): DraftQuestion {
  const optTexts = bq.options?.map((o) => o.text) ?? [];
  const correctIdx = bq.options?.findIndex((o) => o.isCorrect) ?? 0;
  return {
    id: `draft-bq-${bq.id}-${Date.now()}`,
    type: bq.type,
    difficulty: bq.difficulty,
    questionText: bq.questionText,
    arabicText: bq.arabicText || '',
    imageUrl: bq.imageUrl || '',
    points: bq.defaultPoints,
    explanation: bq.explanation || '',
    topic: bq.topic,
    tags: bq.tags?.join(', ') || '',
    optA: optTexts[0] || '',
    optB: optTexts[1] || '',
    optC: optTexts[2] || '',
    optD: optTexts[3] || '',
    optE: optTexts[4] || '',
    correctOptIndex: correctIdx >= 0 ? correctIdx : 0,
    shortAnswer: bq.correctShortAnswer || '',
    essayRubric: bq.essayRubric || '',
    isExpanded: false,
    fromBank: true,
  };
}

function draftToQuizQuestionItem(dq: DraftQuestion, idx: number): QuizQuestionItem {
  let options;
  if (dq.type === 'PILIHAN_GANDA') {
    const raw = [
      { text: dq.optA, key: 0 },
      { text: dq.optB, key: 1 },
      { text: dq.optC, key: 2 },
      { text: dq.optD, key: 3 },
      { text: dq.optE, key: 4 },
    ].filter((o) => o.text.trim() !== '');
    options = raw.map((o, i) => ({
      id: `opt-${dq.id}-${i}`,
      text: o.text.trim(),
      isCorrect: o.key === dq.correctOptIndex,
    }));
    if (options.length > 0 && !options.some((o) => o.isCorrect)) {
      options[0].isCorrect = true;
    }
  } else if (dq.type === 'BENAR_SALAH') {
    options = [
      { id: `opt-${dq.id}-0`, text: 'Benar', isCorrect: dq.correctOptIndex === 0 },
      { id: `opt-${dq.id}-1`, text: 'Salah', isCorrect: dq.correctOptIndex === 1 },
    ];
  }

  return {
    id: `qz-q-temp-${idx + 1}`,
    quizId: '',
    questionNumber: idx + 1,
    type: dq.type,
    questionText: dq.questionText.trim(),
    arabicText: dq.arabicText.trim() || undefined,
    imageUrl: dq.imageUrl.trim() || undefined,
    options,
    correctShortAnswer: dq.type === 'JAWABAN_SINGKAT' ? dq.shortAnswer.trim() : undefined,
    essayRubric: dq.type === 'ESAI' ? dq.essayRubric.trim() : undefined,
    points: dq.points,
    explanation: dq.explanation.trim() || undefined,
  };
}

// =========================================================================
// QUESTION EDITOR SUB-COMPONENT
// =========================================================================
interface QuestionEditorProps {
  dq: DraftQuestion;
  idx: number;
  total: number;
  onChange: (id: string, patch: Partial<DraftQuestion>) => void;
  onRemove: (id: string) => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({
  dq, idx, total, onChange, onRemove, onMoveUp, onMoveDown,
}) => {
  const typeLabel: Record<QuestionType, string> = {
    PILIHAN_GANDA: 'Pilihan Ganda',
    BENAR_SALAH: 'Benar / Salah',
    JAWABAN_SINGKAT: 'Jawaban Singkat',
    ESAI: 'Esai / Uraian',
  };

  const diffVariant: Record<QuestionDifficulty, 'success' | 'warning' | 'danger'> = {
    MUDAH: 'success', SEDANG: 'warning', SULIT: 'danger',
  };

  const isIncomplete = !dq.questionText.trim() ||
    (dq.type === 'PILIHAN_GANDA' && (!dq.optA.trim() || !dq.optB.trim())) ||
    (dq.type === 'JAWABAN_SINGKAT' && !dq.shortAnswer.trim());

  return (
    <div style={{
      border: `2px solid ${isIncomplete && !dq.isExpanded
        ? 'var(--color-warning-border)'
        : dq.isExpanded
          ? 'var(--color-primary-300)'
          : 'var(--border-default)'}`,
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--bg-surface)',
      overflow: 'hidden',
      transition: 'border-color 200ms'
    }}>
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: dq.isExpanded ? 'var(--color-primary-50)' : 'var(--bg-surface)',
          display: 'flex', alignItems: 'center', gap: '12px',
          cursor: 'pointer',
          borderBottom: dq.isExpanded ? '1px solid var(--border-default)' : 'none',
        }}
        onClick={() => onChange(dq.id, { isExpanded: !dq.isExpanded })}
      >
        <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
          <GripVertical size={16} color="var(--text-muted)" />
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
            backgroundColor: isIncomplete ? 'var(--color-warning-bg)' : 'var(--color-primary-100)',
            color: isIncomplete ? 'var(--color-warning-main)' : 'var(--color-primary-800)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 'bold', fontSize: 'var(--text-sm)', flexShrink: 0
          }}>
            {isIncomplete ? <AlertTriangle size={16} /> : idx + 1}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '2px' }}>
            <Badge variant={diffVariant[dq.difficulty]}>{dq.difficulty}</Badge>
            <Badge variant="default">{typeLabel[dq.type]}</Badge>
            <Badge variant="primary">{dq.points} Poin</Badge>
            {dq.fromBank && <Badge variant="success">Dari Bank Soal</Badge>}
            {isIncomplete && <Badge variant="warning">Belum Lengkap</Badge>}
          </div>
          <p style={{
            fontSize: 'var(--text-sm)', color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            margin: 0
          }}>
            {dq.questionText.trim() || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Soal belum diisi...</span>}
          </p>
        </div>

        <div className="flex items-center gap-1" style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button type="button" onClick={() => onMoveUp(idx)} disabled={idx === 0}
            style={{ padding: '6px', border: 'none', background: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, borderRadius: 'var(--radius-sm)', display: 'flex' }}>
            <ChevronUp size={16} color="var(--text-muted)" />
          </button>
          <button type="button" onClick={() => onMoveDown(idx)} disabled={idx >= total - 1}
            style={{ padding: '6px', border: 'none', background: 'none', cursor: idx >= total - 1 ? 'not-allowed' : 'pointer', opacity: idx >= total - 1 ? 0.3 : 1, borderRadius: 'var(--radius-sm)', display: 'flex' }}>
            <ChevronDown size={16} color="var(--text-muted)" />
          </button>
          <button type="button" onClick={() => onRemove(dq.id)}
            style={{ padding: '6px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
            <Trash2 size={16} color="var(--color-danger-main)" />
          </button>
          <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {dq.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </div>
      </div>

      {/* Expanded Editor Body */}
      {dq.isExpanded && (
        <div style={{ padding: 'var(--space-4) var(--space-5)' }} className="flex flex-col gap-4">

          {/* Row 1: Type, Difficulty, Points, Topic */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tipe Soal</label>
              <select className="form-select" value={dq.type}
                onChange={(e) => onChange(dq.id, { type: e.target.value as QuestionType, correctOptIndex: 0 })}>
                <option value="PILIHAN_GANDA">Pilihan Ganda</option>
                <option value="BENAR_SALAH">Benar / Salah</option>
                <option value="JAWABAN_SINGKAT">Jawaban Singkat</option>
                <option value="ESAI">Esai / Uraian</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tingkat Kesulitan</label>
              <select className="form-select" value={dq.difficulty}
                onChange={(e) => onChange(dq.id, { difficulty: e.target.value as QuestionDifficulty })}>
                <option value="MUDAH">Mudah</option>
                <option value="SEDANG">Sedang</option>
                <option value="SULIT">Sulit</option>
              </select>
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Bobot Poin</label>
              <input type="number" className="form-input" min={1} max={100}
                value={dq.points}
                onChange={(e) => onChange(dq.id, { points: parseInt(e.target.value, 10) || 1 })} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Topik / Materi</label>
              <Input placeholder="Misal: Kaidah Ushuliyah" value={dq.topic}
                onChange={(e) => onChange(dq.id, { topic: e.target.value })} />
            </div>
          </div>

          {/* Question Text */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label font-bold">
              Teks Pertanyaan / Soal <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <textarea className="form-textarea" rows={3}
              placeholder="Tuliskan butir soal secara lengkap dan jelas..."
              value={dq.questionText}
              onChange={(e) => onChange(dq.id, { questionText: e.target.value })}
              style={{ fontSize: 'var(--text-sm)', resize: 'vertical' }} />
          </div>

          {/* Arabic Text */}
          <div style={{
            padding: 'var(--space-3)', backgroundColor: '#fdfbf7',
            border: '1px solid #fde68a', borderRadius: 'var(--radius-md)',
            borderRight: '4px solid var(--color-primary-700)'
          }} className="flex flex-col gap-2">
            <label className="form-label" style={{ color: '#92400e', fontWeight: 'bold', marginBottom: 0 }}>
              📖 Teks Arab / Matan / Ayat / Hadits&nbsp;
              <span style={{ fontWeight: 'normal', color: '#b45309' }}>(Opsional)</span>
            </label>
            <textarea className="form-textarea" rows={2} dir="rtl"
              placeholder="اكتب النص العربي أو متن الحديث / القاعدة هنا..."
              value={dq.arabicText}
              onChange={(e) => onChange(dq.id, { arabicText: e.target.value })}
              style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif", fontSize: '1.2rem', lineHeight: 2, textAlign: 'right', backgroundColor: '#ffffff', border: '1px solid #fde68a' }} />
            {dq.arabicText.trim() && (
              <div style={{ fontSize: 'var(--text-xs)', color: '#b45309' }}>
                Pratinjau: <span style={{ fontFamily: "'Amiri', serif", fontSize: '1.1rem' }}>{dq.arabicText}</span>
              </div>
            )}
          </div>

          {/* Image */}
          <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }} className="flex flex-col gap-2">
            <label className="form-label" style={{ marginBottom: 0 }}>
              🖼 Gambar Ilustrasi / Diagram Soal&nbsp;
              <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>(Opsional)</span>
            </label>
            <div className="flex gap-2">
              <Input placeholder="URL gambar atau unggah dari perangkat..." value={dq.imageUrl}
                onChange={(e) => onChange(dq.id, { imageUrl: e.target.value })}
                style={{ flex: 1, fontSize: 'var(--text-xs)' }} />
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0 12px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-default)', cursor: 'pointer',
                fontSize: 'var(--text-xs)', whiteSpace: 'nowrap', backgroundColor: 'var(--bg-surface)'
              }}>
                <Upload size={14} /><span>Unggah</span>
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        if (typeof ev.target?.result === 'string') onChange(dq.id, { imageUrl: ev.target.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }} />
              </label>
            </div>
            {dq.imageUrl.trim() && (
              <div className="flex items-center gap-3">
                <img src={dq.imageUrl} alt="Pratinjau"
                  style={{ maxHeight: '100px', maxWidth: '160px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }} />
                <button type="button"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-main)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  onClick={() => onChange(dq.id, { imageUrl: '' })}>
                  <X size={14} /> Hapus Gambar
                </button>
              </div>
            )}
          </div>

          {/* Pilihan Ganda Options */}
          {dq.type === 'PILIHAN_GANDA' && (
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }} className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="form-label" style={{ margin: 0, fontWeight: 'bold' }}>
                  Opsi Jawaban (A – E) <span style={{ color: 'var(--color-danger-main)' }}>*</span>
                </label>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Klik ✓ untuk menetapkan kunci jawaban</span>
              </div>
              {(['A', 'B', 'C', 'D', 'E'] as const).map((letter, li) => {
                const valKey = `opt${letter}` as keyof DraftQuestion;
                const val = dq[valKey] as string;
                const isCorrect = dq.correctOptIndex === li;
                return (
                  <div key={letter} className="flex items-center gap-2">
                    <button type="button" onClick={() => onChange(dq.id, { correctOptIndex: li })}
                      title={`Kunci jawaban: Opsi ${letter}`}
                      style={{
                        width: '34px', height: '34px', flexShrink: 0,
                        borderRadius: 'var(--radius-full)',
                        border: `2px solid ${isCorrect ? 'var(--color-success-main)' : 'var(--border-default)'}`,
                        backgroundColor: isCorrect ? 'var(--color-success-bg)' : 'var(--bg-surface)',
                        color: isCorrect ? 'var(--color-success-main)' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: 'var(--text-xs)', transition: 'all 150ms'
                      }}>
                      {isCorrect ? <Check size={14} /> : letter}
                    </button>
                    <Input
                      placeholder={`Opsi ${letter}${li < 2 ? ' (Wajib)' : ' (Opsional)'}`}
                      value={val}
                      onChange={(e) => onChange(dq.id, { [valKey]: e.target.value } as any)}
                      style={{
                        flex: 1,
                        borderColor: isCorrect ? 'var(--color-success-border)' : undefined,
                        backgroundColor: isCorrect ? 'var(--color-success-bg)' : undefined,
                        fontSize: 'var(--text-sm)'
                      }} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Benar / Salah */}
          {dq.type === 'BENAR_SALAH' && (
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
              <label className="form-label" style={{ fontWeight: 'bold' }}>Kunci Jawaban yang Benar</label>
              <div className="flex gap-4">
                {['Benar', 'Salah'].map((opt, li) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-sm)' }}>
                    <input type="radio" name={`bs-${dq.id}`} checked={dq.correctOptIndex === li}
                      onChange={() => onChange(dq.id, { correctOptIndex: li })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-700)' }} />
                    <span style={{ fontWeight: dq.correctOptIndex === li ? 'bold' : 'normal' }}>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Jawaban Singkat */}
          {dq.type === 'JAWABAN_SINGKAT' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label font-bold">
                Kunci Jawaban Singkat <span style={{ color: 'var(--color-danger-main)' }}>*</span>
              </label>
              <Input placeholder="Kata kunci / jawaban yang tepat (tidak case-sensitive)"
                value={dq.shortAnswer} onChange={(e) => onChange(dq.id, { shortAnswer: e.target.value })} />
            </div>
          )}

          {/* Esai */}
          {dq.type === 'ESAI' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label font-bold">Panduan Rubrik Penilaian Dosen</label>
              <textarea className="form-textarea" rows={2}
                placeholder="Kriteria penilaian esai (misal: Definisi 40%, Contoh kasus 40%, Dalil 20%)..."
                value={dq.essayRubric}
                onChange={(e) => onChange(dq.id, { essayRubric: e.target.value })}
                style={{ fontSize: 'var(--text-sm)' }} />
            </div>
          )}

          {/* Explanation & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Penjelasan / Pembahasan (Opsional)</label>
              <textarea className="form-textarea" rows={2}
                placeholder="Pembahasan atau dalil rujukan jawaban..."
                value={dq.explanation}
                onChange={(e) => onChange(dq.id, { explanation: e.target.value })}
                style={{ fontSize: 'var(--text-sm)' }} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Tagar / Kata Kunci (Pisahkan koma)</label>
              <Input placeholder="Misal: Fiqih, Ushul, Kaidah"
                value={dq.tags} onChange={(e) => onChange(dq.id, { tags: e.target.value })} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MAIN COMPONENT: QuizCreatePage
// =========================================================================
export const QuizCreatePage: React.FC<QuizCreatePageProps> = ({ onBack, onCreated }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---- Step 1 ----
  const [title, setTitle] = useState('');
  const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);
  const [meetingNumber, setMeetingNumber] = useState(1);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(
    'Kerjakan seluruh soal dengan jujur dan mandiri. Sistem menerapkan auto-fullscreen dan anti-pindah tab.'
  );

  // ---- Step 2 ----
  const [questions, setQuestions] = useState<DraftQuestion[]>([createBlankQuestion(0)]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankQuestions, setBankQuestions] = useState<BankQuestion[]>([]);
  const [bankSearch, setBankSearch] = useState('');
  const [bankSelectedIds, setBankSelectedIds] = useState<string[]>([]);

  // ---- Step 3 ----
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingScore, setPassingScore] = useState(75);
  const [maxAttempts, setMaxAttempts] = useState(2);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [status, setStatus] = useState<'DITERBITKAN' | 'DRAF'>('DITERBITKAN');
  const [resultVisibility, setResultVisibility] = useState<'LANGSUNG' | 'SETELAH_DITUTUP' | 'TIDAK_DITAMPILKAN'>('LANGSUNG');
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 16));

  const totalPoints = questions.reduce((s, q) => s + q.points, 0);
  const course = AVAILABLE_COURSES[selectedCourseIdx];
  const incompleteCount = questions.filter(
    (q) => !q.questionText.trim() ||
      (q.type === 'PILIHAN_GANDA' && (!q.optA.trim() || !q.optB.trim())) ||
      (q.type === 'JAWABAN_SINGKAT' && !q.shortAnswer.trim())
  ).length;

  useEffect(() => { setBankQuestions(quizService.getBankQuestions()); }, []);

  const handleQuestionChange = useCallback((id: string, patch: Partial<DraftQuestion>) => {
    setQuestions((prev) => prev.map((q) => q.id === id ? { ...q, ...patch } : q));
  }, []);

  const handleAddBlank = () => {
    const newQ = createBlankQuestion(Date.now());
    setQuestions((prev) => [...prev.map((q) => ({ ...q, isExpanded: false })), { ...newQ, isExpanded: true }]);
    setTimeout(() => {
      document.getElementById('question-list-end')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleRemoveQuestion = useCallback((id: string) => {
    setQuestions((prev) => {
      if (prev.length <= 1) {
        toast.warning('Minimal 1 Soal', 'Kuis harus memiliki minimal satu butir soal.');
        return prev;
      }
      return prev.filter((q) => q.id !== id);
    });
  }, [toast]);

  const handleMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    setQuestions((prev) => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  }, []);

  const handleMoveDown = useCallback((idx: number) => {
    setQuestions((prev) => {
      if (idx >= prev.length - 1) return prev;
      const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
    });
  }, []);

  const filteredBank = bankQuestions.filter((bq) =>
    bq.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
    bq.topic.toLowerCase().includes(bankSearch.toLowerCase()) ||
    bq.courseCode.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const handleInsertFromBank = () => {
    const drafts = bankQuestions.filter((bq) => bankSelectedIds.includes(bq.id)).map(bankQuestionToDraft);
    setQuestions((prev) => [...prev.map((q) => ({ ...q, isExpanded: false })), ...drafts]);
    setShowBankModal(false);
    setBankSelectedIds([]);
    toast.success(`${drafts.length} Soal Ditambahkan`, 'Soal dari Bank Soal berhasil dimasukkan ke kuis.');
  };

  const validateStep1 = () => {
    if (!title.trim()) {
      toast.warning('Judul Kuis Wajib Diisi', 'Silakan masukkan judul kuis.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (questions.length === 0) {
      toast.warning('Minimal 1 Soal', 'Tambahkan minimal satu butir soal.');
      return false;
    }
    if (incompleteCount > 0) {
      toast.warning(`${incompleteCount} Soal Belum Lengkap`, 'Pastikan semua soal sudah diisi sebelum melanjutkan.');
      return false;
    }
    return true;
  };

  const goToStep = (step: number) => {
    if (step > currentStep) {
      if (currentStep === 1 && !validateStep1()) return;
      if (currentStep === 2 && !validateStep2()) return;
    }
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep1() || !validateStep2() || !user) return;
    setIsSubmitting(true);
    try {
      const quizQuestions = questions.map((dq, idx) => draftToQuizQuestionItem(dq, idx));
      const created = quizService.createQuiz({
        classId: course.classId,
        meetingId: `mtg-${course.code.toLowerCase().replace('-', '')}-${String(meetingNumber).padStart(2, '0')}`,
        courseName: course.name,
        meetingNumber,
        title: title.trim(),
        description: description.trim() || `Evaluasi pertemuan ${meetingNumber}.`,
        instructions: instructions.trim(),
        durationMinutes: Number(durationMinutes) || 30,
        passingScore: Number(passingScore) || 75,
        maxAttempts: Number(maxAttempts) || 2,
        shuffleQuestions, shuffleOptions, resultVisibility,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        status,
        questions: quizQuestions,
        totalPoints: quizQuestions.reduce((s, q) => s + q.points, 0),
      });
      toast.success('Kuis Berhasil Diterbitkan! 🎉',
        `"${created.title}" — ${created.questions.length} butir soal, ${created.totalPoints} total poin.`);
      setTimeout(() => onCreated(created.id), 500);
    } catch (err: any) {
      toast.danger('Gagal Membuat Kuis', err.message);
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // RENDER: Step Indicator
  // =========================================================================
  const renderStepIndicator = () => (
    <div style={{
      backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-xl)', padding: 'var(--space-4) var(--space-5)', boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {WIZARD_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;
          const canClick = step.id <= currentStep + 1;
          return (
            <button key={step.id} type="button" onClick={() => canClick ? goToStep(step.id) : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
                border: `2px solid ${isActive ? 'var(--color-primary-500)' : isDone ? 'var(--color-success-border)' : 'var(--border-subtle)'}`,
                backgroundColor: isActive ? 'var(--color-primary-50)' : isDone ? 'var(--color-success-bg)' : 'var(--bg-subtle)',
                cursor: canClick ? 'pointer' : 'default',
                opacity: !canClick && step.id > currentStep + 1 ? 0.5 : 1,
                transition: 'all 200ms'
              }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: 'var(--radius-full)',
                backgroundColor: isActive ? 'var(--color-primary-600)' : isDone ? 'var(--color-success-main)' : 'var(--color-slate-300)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0
              }}>
                {isDone ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: 'clamp(0.65rem, 1.5vw, 0.8rem)', fontWeight: 'bold',
                  color: isActive ? 'var(--color-primary-800)' : isDone ? 'var(--color-success-main)' : 'var(--text-muted)'
                }}>{step.label}</div>
                <div style={{ fontSize: 'clamp(0.55rem, 1.2vw, 0.65rem)', color: 'var(--text-muted)' }}>{step.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // =========================================================================
  // RENDER: Step 1 — Info Kuis
  // =========================================================================
  const renderStep1 = () => (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Dasar Kuis / Evaluasi Daring</CardTitle>
        <CardSubtitle>Isi judul, mata kuliah, dan instruksi pengerjaan untuk mahasiswa</CardSubtitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-5">
        <div className="form-group">
          <label className="form-label font-bold">
            Judul Kuis / Evaluasi Daring <span style={{ color: 'var(--color-danger-main)' }}>*</span>
          </label>
          <Input
            placeholder="Contoh: Kuis Formatif Pertemuan 4 — Kaidah Ushuliyah 'Am wa Khas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label font-bold">
              Mata Kuliah & Kelas <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <select className="form-select" value={selectedCourseIdx}
              onChange={(e) => setSelectedCourseIdx(Number(e.target.value))}>
              {AVAILABLE_COURSES.map((c, idx) => (
                <option key={c.classId} value={idx}>[{c.code}] {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label font-bold">Pertemuan RPS</label>
            <select className="form-select" value={meetingNumber}
              onChange={(e) => setMeetingNumber(Number(e.target.value))}>
              {Array.from({ length: 16 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Pertemuan ke-{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Deskripsi Singkat Kuis (Opsional)</label>
          <textarea className="form-textarea" rows={2}
            placeholder="Misal: Evaluasi formatif untuk mengukur pemahaman materi Kaidah Amar dan Nahi..."
            value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label font-bold">Instruksi / Petunjuk Pengerjaan untuk Mahasiswa</label>
          <textarea className="form-textarea" rows={3}
            placeholder="Petunjuk pengerjaan yang akan ditampilkan di halaman awal kuis..."
            value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>

        {title.trim() && (
          <div style={{
            padding: 'var(--space-4)', backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)', borderRadius: 'var(--radius-lg)',
            borderLeft: '4px solid var(--color-primary-600)'
          }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', fontWeight: 'bold', marginBottom: '4px' }}>
              ✅ Pratinjau Identitas Kuis
            </div>
            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--color-primary-950)' }}>{title}</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', marginTop: '4px' }}>
              {course.name} • Pertemuan ke-{meetingNumber}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );

  // =========================================================================
  // RENDER: Step 2 — Butir Soal
  // =========================================================================
  const renderStep2 = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)' }}>Butir Soal Kuis</h3>
                <Badge variant="primary">{questions.length} Soal</Badge>
                <Badge variant={totalPoints > 0 ? 'success' : 'default'}>{totalPoints} Poin Total</Badge>
                {incompleteCount > 0 && <Badge variant="warning">{incompleteCount} Belum Lengkap</Badge>}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Susun butir soal secara manual atau impor dari Bank Soal kurikulum
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="secondary" size="sm" icon={BookOpen} onClick={() => { setBankSelectedIds([]); setShowBankModal(true); }}>
                Ambil dari Bank Soal
              </Button>
              <Button variant="primary" size="sm" icon={Plus} onClick={handleAddBlank}
                style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
                Tambah Soal Baru
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {questions.length > 1 && (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={() => setQuestions((p) => p.map((q) => ({ ...q, isExpanded: true })))}>
            Buka Semua
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setQuestions((p) => p.map((q) => ({ ...q, isExpanded: false })))}>
            Lipat Semua
          </Button>
        </div>
      )}

      {questions.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <HelpCircle size={48} color="var(--text-muted)" style={{ margin: '0 auto var(--space-3)' }} />
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              Belum ada butir soal. Mulai tambah soal baru atau impor dari Bank Soal.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" icon={BookOpen} onClick={() => setShowBankModal(true)}>Ambil dari Bank Soal</Button>
              <Button variant="primary" icon={Plus} onClick={handleAddBlank}>Tambah Soal Baru</Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((dq, idx) => (
            <QuestionEditor key={dq.id} dq={dq} idx={idx} total={questions.length}
              onChange={handleQuestionChange} onRemove={handleRemoveQuestion}
              onMoveUp={handleMoveUp} onMoveDown={handleMoveDown} />
          ))}
          <div id="question-list-end" />
        </div>
      )}

      {questions.length > 0 && (
        <div className="flex justify-center">
          <Button variant="outline" icon={Plus} onClick={handleAddBlank}
            style={{ width: '100%', maxWidth: '480px', borderStyle: 'dashed' }}>
            + Tambah Butir Soal Baru
          </Button>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // RENDER: Step 3 — Pengaturan
  // =========================================================================
  const renderStep3 = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock size={18} color="var(--color-primary-700)" />
            <div>
              <CardTitle>Waktu & Standar Kelulusan</CardTitle>
              <CardSubtitle>Atur durasi pengerjaan dan nilai KKM</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label font-bold">Durasi Pengerjaan (Menit)</label>
              <input type="number" className="form-input" min={5} max={240}
                value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                ⏱ {Math.floor(durationMinutes / 60) > 0 ? `${Math.floor(durationMinutes / 60)} jam ` : ''}{durationMinutes % 60} menit
              </div>
            </div>
            <div className="form-group">
              <label className="form-label font-bold">Nilai KKM / Passing Score (0-100)</label>
              <input type="number" className="form-input" min={0} max={100}
                value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} />
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                Nilai ≥ {passingScore} → Lulus
              </div>
            </div>
            <div className="form-group">
              <label className="form-label font-bold">Batas Percobaan Pengerjaan</label>
              <select className="form-select" value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))}>
                <option value={1}>1x — Ujian Resmi</option>
                <option value={2}>2x — Standar (ada remedial)</option>
                <option value={3}>3x — Latihan intensif</option>
                <option value={5}>5x — Remedial penuh</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} color="var(--color-success-main)" />
            <div>
              <CardTitle>Fitur Keamanan CBT & Pengacakan</CardTitle>
              <CardSubtitle>Konfigurasi anti-kecurangan dan pengacakan soal</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'shuffleQuestions', label: 'Acak Urutan Butir Soal', desc: 'Setiap mahasiswa mendapat urutan soal berbeda', val: shuffleQuestions, set: setShuffleQuestions },
              { key: 'shuffleOptions', label: 'Acak Opsi Jawaban Pilihan Ganda', desc: 'Posisi opsi A-E diacak untuk setiap mahasiswa', val: shuffleOptions, set: setShuffleOptions },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-3 p-4 rounded-lg cursor-pointer"
                style={{
                  border: `2px solid ${item.val ? 'var(--color-primary-300)' : 'var(--border-default)'}`,
                  backgroundColor: item.val ? 'var(--color-primary-50)' : 'var(--bg-subtle)',
                }}>
                <input type="checkbox" checked={item.val} onChange={(e) => item.set(e.target.checked)}
                  style={{ marginTop: '2px', width: '18px', height: '18px', accentColor: 'var(--color-primary-700)' }} />
                <div>
                  <div className="flex items-center gap-2">
                    <Shuffle size={16} color={item.val ? 'var(--color-primary-700)' : 'var(--text-muted)'} />
                    <strong style={{ fontSize: 'var(--text-sm)' }}>{item.label}</strong>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0' }}>{item.desc}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-start gap-3 mt-4 p-3 rounded-lg"
            style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)' }}>
            <ShieldCheck size={20} color="var(--color-success-main)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-main)' }}>
              <strong>Fitur Keamanan CBT Aktif Otomatis:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: '16px', lineHeight: 1.8 }}>
                <li>Auto-Fullscreen saat ujian dimulai</li>
                <li>Blokir perpindahan tab/aplikasi (max. 3x pelanggaran)</li>
                <li>Nonaktifkan F12, Inspect, Copy-Paste, View Source</li>
                <li>Auto-submit saat waktu habis atau batas pelanggaran terlampaui</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award size={18} color="var(--color-primary-700)" />
            <div>
              <CardTitle>Jadwal & Status Penerbitan</CardTitle>
              <CardSubtitle>Atur visibilitas hasil, status, dan periode aktif kuis</CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label font-bold">Status Kuis</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="DITERBITKAN">✅ Diterbitkan (Aktif & bisa diakses mahasiswa)</option>
                <option value="DRAF">📝 Draf (Hanya terlihat oleh dosen)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label font-bold">Visibilitas Hasil Ujian</label>
              <select className="form-select" value={resultVisibility} onChange={(e) => setResultVisibility(e.target.value as any)}>
                <option value="LANGSUNG">Langsung setelah dikumpulkan</option>
                <option value="SETELAH_DITUTUP">Setelah periode kuis ditutup</option>
                <option value="TIDAK_DITAMPILKAN">Tidak ditampilkan ke mahasiswa</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal & Waktu Mulai</label>
              <input type="datetime-local" className="form-input" value={startDate}
                onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal & Waktu Selesai</label>
              <input type="datetime-local" className="form-input" value={endDate}
                onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  // =========================================================================
  // RENDER: Step 4 — Pratinjau
  // =========================================================================
  const renderStep4 = () => (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader style={{
          backgroundColor: 'var(--color-primary-900)',
          borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div className="flex items-center gap-3">
            <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: 'var(--radius-md)' }}>
              <Eye size={22} color="#6ee7b7" />
            </div>
            <div>
              <CardTitle style={{ color: 'white', fontSize: 'var(--text-lg)' }}>Pratinjau Akhir Kuis — Siap Diterbitkan</CardTitle>
              <CardSubtitle style={{ color: '#a7f3d0', fontSize: 'var(--text-xs)' }}>
                Periksa kembali semua detail sebelum menerbitkan ke mahasiswa
              </CardSubtitle>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ marginBottom: 'var(--space-5)' }}>
            {[
              { label: 'Total Soal', value: `${questions.length} Butir`, color: 'var(--color-primary-700)' },
              { label: 'Total Poin', value: `${totalPoints} Poin`, color: 'var(--color-warning-main)' },
              { label: 'Durasi Ujian', value: `${durationMinutes} Menit`, color: 'var(--color-success-main)' },
              { label: 'Nilai KKM', value: `≥ ${passingScore}`, color: 'var(--color-danger-main)' },
            ].map((item) => (
              <div key={item.label} style={{
                padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', textAlign: 'center'
              }}>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: item.color }}>{item.value}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
            {[
              { k: 'Judul Kuis', v: title },
              { k: 'Mata Kuliah', v: `[${course.code}] ${course.name}` },
              { k: 'Pertemuan', v: `Ke-${meetingNumber}` },
              { k: 'Status', v: status === 'DITERBITKAN' ? '✅ Diterbitkan' : '📝 Draf' },
              { k: 'Batas Percobaan', v: `${maxAttempts}x` },
              { k: 'Acak Soal', v: shuffleQuestions ? 'Aktif ✓' : 'Nonaktif' },
              { k: 'Acak Opsi', v: shuffleOptions ? 'Aktif ✓' : 'Nonaktif' },
              { k: 'Hasil Ujian', v: resultVisibility === 'LANGSUNG' ? 'Langsung tampil' : resultVisibility === 'SETELAH_DITUTUP' ? 'Setelah ditutup' : 'Disembunyikan' },
            ].map((item) => (
              <div key={item.k} className="flex items-start gap-2" style={{ fontSize: 'var(--text-xs)' }}>
                <span style={{ color: 'var(--text-muted)', minWidth: '120px', flexShrink: 0 }}>{item.k}:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.v}</strong>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Butir Soal ({questions.length})</CardTitle>
        </CardHeader>
        <CardBody style={{ padding: 0 }}>
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {questions.map((dq, idx) => {
              const tl: Record<QuestionType, string> = { PILIHAN_GANDA: 'PG', BENAR_SALAH: 'B/S', JAWABAN_SINGKAT: 'JS', ESAI: 'ESAI' };
              const dv: Record<QuestionDifficulty, 'success' | 'warning' | 'danger'> = { MUDAH: 'success', SEDANG: 'warning', SULIT: 'danger' };
              return (
                <div key={dq.id} style={{
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: idx < questions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: '12px'
                }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: 'var(--text-xs)', flexShrink: 0
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                      <Badge variant="default">{tl[dq.type]}</Badge>
                      <Badge variant={dv[dq.difficulty]}>{dq.difficulty}</Badge>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontWeight: 'bold' }}>{dq.points} poin</span>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                      {dq.questionText.trim() || <em style={{ color: 'var(--text-muted)' }}>Soal belum diisi</em>}
                    </p>
                    {dq.arabicText.trim() && (
                      <div style={{ fontFamily: "'Amiri', serif", fontSize: '1rem', color: '#065f46', marginTop: '4px' }}>
                        {dq.arabicText}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {incompleteCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg"
          style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', color: 'var(--color-warning-main)' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 'var(--text-sm)' }}>
            <strong>Perhatian:</strong> Masih terdapat {incompleteCount} butir soal yang belum lengkap.
            Kembali ke langkah 2 untuk memperbaikinya sebelum menerbitkan.
          </div>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // MAIN RENDER
  // =========================================================================
  return (
    <div className="flex flex-col gap-5">
      {/* Top Bar */}
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Kuis
        </Button>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 'clamp(1.05rem, 2.5vw, 1.4rem)' }}>Buat Kuis / Evaluasi Daring Baru</h1>
          <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            STAI Al-Ittihad Cianjur — Sistem CBT Terstandar
          </p>
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', minWidth: '80px', textAlign: 'right' }}>
          Langkah {currentStep} / {WIZARD_STEPS.length}
        </span>
      </div>

      {renderStepIndicator()}

      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}

      {/* Bottom Nav */}
      <Card>
        <CardBody style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <div className="flex justify-between items-center gap-3">
            <div>
              {currentStep > 1 && (
                <Button variant="secondary" icon={ArrowLeft} onClick={() => goToStep(currentStep - 1)}>
                  Kembali
                </Button>
              )}
            </div>
            <div className="flex items-center gap-3">
              {questions.length > 0 && (
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {questions.length} soal • {totalPoints} poin • {durationMinutes} mnt
                </span>
              )}
              {currentStep < 4 ? (
                <Button variant="primary" icon={ArrowRight} iconPosition="right"
                  onClick={() => goToStep(currentStep + 1)}
                  style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)' }}>
                  Lanjut: {WIZARD_STEPS[currentStep]?.label}
                </Button>
              ) : (
                <Button variant="primary"
                  icon={isSubmitting ? Save : CheckCircle}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                  disabled={incompleteCount > 0 || isSubmitting}
                  style={{
                    background: incompleteCount > 0 ? undefined : 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                    boxShadow: incompleteCount > 0 ? 'none' : '0 4px 12px rgba(6, 95, 70, 0.3)'
                  }}>
                  {incompleteCount > 0 ? `${incompleteCount} Soal Belum Lengkap` : '✅ Terbitkan Kuis Sekarang'}
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal: Pilih dari Bank Soal */}
      <Modal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        title={`Pilih dari Bank Soal (${bankSelectedIds.length} dipilih)`}
        maxWidth="720px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowBankModal(false)}>Batal</Button>
            <Button variant="primary" icon={Plus} onClick={handleInsertFromBank} disabled={bankSelectedIds.length === 0}>
              Tambahkan {bankSelectedIds.length > 0 ? `(${bankSelectedIds.length}) ` : ''}ke Kuis
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <div style={{ position: 'relative' }}>
            <Input placeholder="Cari teks soal, topik, kode mata kuliah..." value={bankSearch}
              onChange={(e) => setBankSearch(e.target.value)}
              style={{ paddingLeft: '32px' }} />
            <BookOpen size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
          </div>

          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {filteredBank.length} soal ditemukan
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm"
                onClick={() => setBankSelectedIds(filteredBank.map((b) => b.id))}>Pilih Semua</Button>
              {bankSelectedIds.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setBankSelectedIds([])}>Hapus Pilihan</Button>
              )}
            </div>
          </div>

          {filteredBank.length === 0 ? (
            <div style={{
              padding: 'var(--space-6)', textAlign: 'center', backgroundColor: 'var(--color-slate-50)',
              borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-default)',
              color: 'var(--text-muted)', fontSize: 'var(--text-sm)'
            }}>
              Tidak ada soal di Bank Soal yang sesuai pencarian.
            </div>
          ) : (
            <div style={{
              maxHeight: '400px', overflowY: 'auto',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)'
            }}>
              {filteredBank.map((bq, idx) => {
                const isSelected = bankSelectedIds.includes(bq.id);
                const tl: Record<QuestionType, string> = { PILIHAN_GANDA: 'Pilihan Ganda', BENAR_SALAH: 'Benar/Salah', JAWABAN_SINGKAT: 'Jwb Singkat', ESAI: 'Esai' };
                const dv: Record<QuestionDifficulty, 'success' | 'warning' | 'danger'> = { MUDAH: 'success', SEDANG: 'warning', SULIT: 'danger' };
                return (
                  <label key={bq.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: isSelected ? 'var(--color-primary-50)' : idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-subtle)',
                    borderBottom: idx < filteredBank.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    cursor: 'pointer', transition: 'background-color 150ms'
                  }}>
                    <input type="checkbox" checked={isSelected}
                      onChange={() => setBankSelectedIds((prev) => prev.includes(bq.id) ? prev.filter((i) => i !== bq.id) : [...prev, bq.id])}
                      style={{ marginTop: '3px', width: '18px', height: '18px', accentColor: 'var(--color-primary-700)', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                        <Badge variant="primary">{bq.courseCode}</Badge>
                        <Badge variant="default">{tl[bq.type]}</Badge>
                        <Badge variant={dv[bq.difficulty]}>{bq.difficulty}</Badge>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{bq.topic}</span>
                        <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--color-primary-800)', fontSize: 'var(--text-xs)' }}>
                          {bq.defaultPoints} Poin
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', margin: 0, lineHeight: 1.4 }}>
                        {bq.questionText}
                      </p>
                      {bq.arabicText && (
                        <div style={{ direction: 'rtl', fontFamily: "'Amiri', serif", fontSize: '1.1rem', color: '#065f46', marginTop: '4px' }}>
                          {bq.arabicText}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
