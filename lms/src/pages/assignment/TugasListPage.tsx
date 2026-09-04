import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Calendar, 
  ArrowRight, 
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  X,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Upload,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Users,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { 
  Assignment, 
  CreateAssignmentInput, 
  AssignmentRubric, 
  RubricCriterion,
  SubmissionType 
} from '../../types/assignment';
import { assignmentService, RUBRIC_PRESETS } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { PublishStatus } from '../../types/learning';

export interface TugasListPageProps {
  onSelectAssignment: (assignmentId: string) => void;
  onOpenGradingStudio?: (assignmentId: string) => void;
}

type TabFilter = 'semua' | 'perlu_dikerjakan' | 'sudah_dikumpulkan' | 'sudah_dinilai' | 'perlu_dinilai_dosen';

export const TugasListPage: React.FC<TugasListPageProps> = ({ 
  onSelectAssignment, 
  onOpenGradingStudio 
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterTab, setActiveFilterTab] = useState<TabFilter>('semua');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Modal Create / Edit State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  // Modal Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);

  // Form States
  const [formClassId, setFormClassId] = useState('cls-pai301-a');
  const [formMeetingNumber, setFormMeetingNumber] = useState(3);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [formOpenDate, setFormOpenDate] = useState(new Date().toISOString().substring(0, 16));
  const [formDueDate, setFormDueDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16)
  );
  const [formMaxScore, setFormMaxScore] = useState(100);
  const [formAllowLate, setFormAllowLate] = useState(true);
  const [formLatePenalty, setFormLatePenalty] = useState(10);
  const [formAllowResubmit, setFormAllowResubmit] = useState(true);
  const [formMaxResubmit, setFormMaxResubmit] = useState(2);
  const [formSubmissionType, setFormSubmissionType] = useState<SubmissionType>('BERKAS_UNGGAHAN');
  const [formAllowedExts, setFormAllowedExts] = useState<string[]>(['.pdf', '.docx', '.zip']);
  const [formMaxMb, setFormMaxMb] = useState(10);
  const [formStatus, setFormStatus] = useState<PublishStatus>('DITERBITKAN');

  // Rubric Builder State
  const [rubricMode, setRubricMode] = useState<'tanpa' | 'preset' | 'kustom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(RUBRIC_PRESETS[0].id);
  const [customCriteria, setCustomCriteria] = useState<RubricCriterion[]>([
    {
      id: 'crit-c1',
      title: 'Ketepatan Penguasaan Materi',
      description: 'Menjawab butir tugas secara terstruktur dan tepat sasaran.',
      weightPercentage: 50,
      maxPoints: 100,
      levels: [
        { id: 'lvl-c1a', title: 'Sangat Baik (100)', points: 100, description: 'Sangat mendalam dan tepat.' },
        { id: 'lvl-c1b', title: 'Baik (80)', points: 80, description: 'Tepat dengan sedikit kekurangan.' },
        { id: 'lvl-c1c', title: 'Cukup (60)', points: 60, description: 'Cukup namun belum mendalam.' },
        { id: 'lvl-c1d', title: 'Kurang (40)', points: 40, description: 'Kurang tepat atau keliru.' }
      ]
    },
    {
      id: 'crit-c2',
      title: 'Kerapian & Kualitas Rujukan',
      description: 'Format penulisan ilmiah dan validitas daftar pustaka.',
      weightPercentage: 50,
      maxPoints: 100,
      levels: [
        { id: 'lvl-c2a', title: 'Sangat Baik (100)', points: 100, description: 'Sangat rapi dan rujukan otoritatif.' },
        { id: 'lvl-c2b', title: 'Baik (80)', points: 80, description: 'Rapi dengan rujukan standar.' },
        { id: 'lvl-c2c', title: 'Cukup (60)', points: 60, description: 'Kurang rapi atau rujukan minim.' },
        { id: 'lvl-c2d', title: 'Kurang (40)', points: 40, description: 'Tidak menyertakan rujukan valid.' }
      ]
    }
  ]);

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';

  // Load Assignments Data
  const loadAssignmentsData = async () => {
    try {
      const list = await assignmentService.fetchAssignments(undefined);
      setAssignments(list);
    } catch {
      setAssignments(assignmentService.getAssignments(undefined, isStudent));
    }
  };

  useEffect(() => {
    loadAssignmentsData();
  }, [isStudent]);

  // Extract unique courses for filter dropdown
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName)));

  // Calculate statistics
  const stats = useMemo(() => {
    if (isStudent) {
      return assignments.reduce(
        (acc, asg) => {
          const sub = user ? assignmentService.getStudentSubmission(asg.id, user.id) : null;
          if (!sub) {
            acc.pending += 1;
          } else if (sub.status === 'SUDAH_DINILAI') {
            acc.graded += 1;
          } else {
            acc.submitted += 1;
          }
          return acc;
        },
        { pending: 0, submitted: 0, graded: 0 }
      );
    } else {
      let needGrading = 0;
      let totalSubs = 0;
      let totalGraded = 0;
      assignments.forEach(asg => {
        const subs = assignmentService.getSubmissions(asg.id);
        totalSubs += subs.length;
        subs.forEach(s => {
          if (s.status === 'SUDAH_DIKUMPULKAN' || s.status === 'TERLAMBAT') needGrading += 1;
          if (s.status === 'SUDAH_DINILAI') totalGraded += 1;
        });
      });
      return { totalAssignments: assignments.length, needGrading, totalSubs, totalGraded };
    }
  }, [assignments, user, isStudent]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch = 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCourse = selectedCourse === 'all' || a.courseName === selectedCourse;

      if (!matchesSearch || !matchesCourse) return false;

      if (isStudent) {
        const sub = user ? assignmentService.getStudentSubmission(a.id, user.id) : null;
        if (activeFilterTab === 'perlu_dikerjakan') return !sub;
        if (activeFilterTab === 'sudah_dikumpulkan') return !!sub && sub.status !== 'SUDAH_DINILAI';
        if (activeFilterTab === 'sudah_dinilai') return sub?.status === 'SUDAH_DINILAI';
      } else {
        if (activeFilterTab === 'perlu_dinilai_dosen') {
          const subs = assignmentService.getSubmissions(a.id);
          return subs.some(s => s.status === 'SUDAH_DIKUMPULKAN' || s.status === 'TERLAMBAT');
        }
      }

      return true;
    });
  }, [assignments, searchQuery, selectedCourse, activeFilterTab, isStudent, user]);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilterTab, selectedCourse]);

  const hasActiveFilters = searchQuery !== '' || activeFilterTab !== 'semua' || selectedCourse !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilterTab('semua');
    setSelectedCourse('all');
    setCurrentPage(1);
  };

  // Open Create Form
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedAssignmentId(null);
    setFormClassId('cls-pai301-a');
    setFormMeetingNumber(3);
    setFormTitle('');
    setFormDescription('');
    setFormInstructions('');
    setFormAttachmentName('');
    setFormAttachmentUrl('');
    setFormOpenDate(new Date().toISOString().substring(0, 16));
    setFormDueDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().substring(0, 16));
    setFormMaxScore(100);
    setFormAllowLate(true);
    setFormLatePenalty(10);
    setFormAllowResubmit(true);
    setFormMaxResubmit(2);
    setFormSubmissionType('BERKAS_UNGGAHAN');
    setFormAllowedExts(['.pdf', '.docx', '.zip']);
    setFormMaxMb(10);
    setFormStatus('DITERBITKAN');
    setRubricMode('preset');
    setSelectedPresetId(RUBRIC_PRESETS[0].id);
    setIsFormModalOpen(true);
  };

  // Open Edit Form
  const handleOpenEditModal = (asg: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setSelectedAssignmentId(asg.id);
    setFormClassId(asg.classId);
    setFormMeetingNumber(asg.meetingNumber);
    setFormTitle(asg.title);
    setFormDescription(asg.description || '');
    setFormInstructions(asg.instructions);
    setFormAttachmentName(asg.attachmentName || '');
    setFormAttachmentUrl(asg.attachmentUrl || '');
    setFormOpenDate(asg.openDate ? new Date(asg.openDate).toISOString().substring(0, 16) : new Date().toISOString().substring(0, 16));
    setFormDueDate(new Date(asg.dueDate).toISOString().substring(0, 16));
    setFormMaxScore(asg.maxScore || 100);
    setFormAllowLate(asg.allowLateSubmission);
    setFormLatePenalty(asg.latePenaltyPercentage || 10);
    setFormAllowResubmit(asg.allowResubmission);
    setFormMaxResubmit(asg.maxResubmissions || 2);
    setFormSubmissionType(asg.submissionType || 'BERKAS_UNGGAHAN');
    setFormAllowedExts(asg.allowedFileExtensions || ['.pdf', '.docx', '.zip']);
    setFormMaxMb(Math.round((asg.maxFileSizeBytes || 10485760) / (1024 * 1024)));
    setFormStatus(asg.status);

    if (asg.rubric) {
      setRubricMode('kustom');
      setCustomCriteria(asg.rubric.criteria);
    } else {
      setRubricMode('tanpa');
    }
    setIsFormModalOpen(true);
  };

  // Save Assignment (Create / Edit)
  const handleSaveAssignment = async () => {
    if (!formTitle.trim()) {
      toast.danger('Validasi Gagal', 'Judul tugas wajib diisi.');
      return;
    }
    if (!formInstructions.trim()) {
      toast.danger('Validasi Gagal', 'Petunjuk pengerjaan tugas wajib diisi.');
      return;
    }
    if (!formDueDate) {
      toast.danger('Validasi Gagal', 'Batas waktu (Due Date) wajib ditentukan.');
      return;
    }

    let finalRubric: AssignmentRubric | undefined = undefined;
    if (rubricMode === 'preset') {
      const preset = RUBRIC_PRESETS.find(p => p.id === selectedPresetId);
      if (preset) finalRubric = preset.rubric;
    } else if (rubricMode === 'kustom') {
      const totalWeight = customCriteria.reduce((sum, c) => sum + (c.weightPercentage || 0), 0);
      if (totalWeight !== 100) {
        toast.danger('Bobot Rubrik Belum Pas', `Total bobot persentase rubrik harus pas 100% (Saat ini: ${totalWeight}%).`);
        return;
      }
      finalRubric = {
        id: `rbk-cust-${Date.now()}`,
        title: `Rubrik Penilaian - ${formTitle}`,
        criteria: customCriteria
      };
    }

    const payload: CreateAssignmentInput = {
      classId: formClassId,
      meetingId: `mtg-${formClassId.replace('cls-', '')}-0${formMeetingNumber}`,
      title: formTitle,
      description: formDescription,
      instructions: formInstructions,
      attachmentName: formAttachmentName || undefined,
      attachmentUrl: formAttachmentUrl || undefined,
      openDate: new Date(formOpenDate).toISOString(),
      dueDate: new Date(formDueDate).toISOString(),
      maxScore: formMaxScore,
      allowLateSubmission: formAllowLate,
      latePenaltyPercentage: formLatePenalty,
      allowResubmission: formAllowResubmit,
      maxResubmissions: formMaxResubmit,
      submissionType: formSubmissionType,
      allowedFileExtensions: formAllowedExts,
      maxFileSizeBytes: formMaxMb * 1024 * 1024,
      status: formStatus,
      rubric: finalRubric
    };

    try {
      if (isEditing && selectedAssignmentId) {
        await assignmentService.updateAssignment(selectedAssignmentId, payload as any);
        toast.success('Tugas Diperbarui', `Tugas "${formTitle}" berhasil disimpan.`);
      } else {
        await assignmentService.createAssignment(payload);
        toast.success('Tugas Dibuat', `Tugas baru "${formTitle}" berhasil diterbitkan.`);
      }
      setIsFormModalOpen(false);
      loadAssignmentsData();
    } catch (err: any) {
      toast.danger('Gagal Menyimpan', err?.message || 'Terjadi kendala saat menyimpan tugas.');
    }
  };

  // Toggle Publish Status
  const handleTogglePublish = async (asg: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: PublishStatus = asg.status === 'DITERBITKAN' ? 'DRAF' : 'DITERBITKAN';
    try {
      await assignmentService.updateAssignment(asg.id, { status: nextStatus });
      toast.success(
        nextStatus === 'DITERBITKAN' ? 'Tugas Diterbitkan' : 'Tugas Disimpan sebagai Draf',
        `Status tugas ${asg.title} kini ${nextStatus}.`
      );
      loadAssignmentsData();
    } catch {
      toast.danger('Gagal', 'Tidak dapat mengubah status publikasi.');
    }
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (asg: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssignmentToDelete(asg);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    try {
      await assignmentService.deleteAssignment(assignmentToDelete.id);
      toast.success('Tugas Dihapus', `Tugas "${assignmentToDelete.title}" beserta berkas pengumpulan berhasil dibersihkan.`);
      setIsDeleteModalOpen(false);
      setAssignmentToDelete(null);
      loadAssignmentsData();
    } catch (err: any) {
      toast.danger('Gagal Menghapus', err?.message || 'Gagal menghapus tugas.');
    }
  };

  // Handle Extension Checkbox Toggle
  const toggleExtension = (ext: string) => {
    if (formAllowedExts.includes(ext)) {
      if (formAllowedExts.length > 1) {
        setFormAllowedExts(formAllowedExts.filter(e => e !== ext));
      } else {
        toast.warning('Peringatan', 'Minimal harus ada 1 ekstensi berkas yang diizinkan.');
      }
    } else {
      setFormAllowedExts([...formAllowedExts, ext]);
    }
  };

  // Add Custom Rubric Criterion
  const handleAddCriterion = () => {
    const newId = `crit-c${customCriteria.length + 1}`;
    setCustomCriteria([
      ...customCriteria,
      {
        id: newId,
        title: 'Kriteria Penilaian Baru',
        description: 'Deskripsi indikator capaian pengerjaan tugas.',
        weightPercentage: 20,
        maxPoints: 100,
        levels: [
          { id: `${newId}-l1`, title: 'Sangat Baik (100)', points: 100, description: 'Sangat memuaskan dan sempurna.' },
          { id: `${newId}-l2`, title: 'Baik (80)', points: 80, description: 'Memenuhi standar dengan baik.' },
          { id: `${newId}-l3`, title: 'Cukup (60)', points: 60, description: 'Cukup namun terdapat kekurangan.' },
          { id: `${newId}-l4`, title: 'Kurang (40)', points: 40, description: 'Belum memenuhi kriteria minimum.' }
        ]
      }
    ]);
  };

  // Remove Custom Rubric Criterion
  const handleRemoveCriterion = (idx: number) => {
    if (customCriteria.length <= 1) {
      toast.warning('Peringatan', 'Rubrik analitik harus memiliki minimal 1 kriteria.');
      return;
    }
    setCustomCriteria(customCriteria.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      {/* 1. Header Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ClipboardList className="text-primary-600" size={28} />
            {KAMUS_UI.TUGAS} Perkuliahan & Rubrik OBE
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isStudent 
              ? 'Pantau penugasan mata kuliah, batas waktu pengerjaan, unggah berkas, dan periksa rubrik evaluasi dosen.'
              : 'Kelola penugasan perkuliahan, integrasi rubrik penilaian analitik/holistik, dan Studio Grading Dosen.'}
          </p>
        </div>

        {isLecturer && (
          <Button 
            variant="primary" 
            icon={Plus} 
            onClick={handleOpenCreateModal}
            style={{ fontWeight: 600 }}
          >
            Buat Tugas Baru
          </Button>
        )}
      </div>

      {/* 2. Statistics Card Overview */}
      {isStudent ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-warning-50)', borderRadius: 'var(--radius-lg)' }}>
                <Clock className="text-warning-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Perlu Dikerjakan</p>
                <h3 className="text-2xl font-bold text-warning-600">{(stats as any).pending} Tugas</h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-lg)' }}>
                <CheckCircle2 className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Sudah Dikumpulkan</p>
                <h3 className="text-2xl font-bold text-primary-600">{(stats as any).submitted} Tugas</h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', borderRadius: 'var(--radius-lg)' }}>
                <Award className="text-success-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Sudah Dinilai Dosen</p>
                <h3 className="text-2xl font-bold text-success-600">{(stats as any).graded} Tugas</h3>
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', borderRadius: 'var(--radius-lg)' }}>
                <BookOpen className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Total Tugas Aktif</p>
                <h3 className="text-2xl font-bold text-primary-600">{(stats as any).totalAssignments} Tugas</h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-warning-50)', borderRadius: 'var(--radius-lg)' }}>
                <Clock className="text-warning-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Perlu Dikoreksi / Dinilai</p>
                <h3 className="text-2xl font-bold text-warning-600">{(stats as any).needGrading} Berkas</h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-info-50)', borderRadius: 'var(--radius-lg)' }}>
                <Upload className="text-info-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Total Pengumpulan Masuk</p>
                <h3 className="text-2xl font-bold text-info-600">{(stats as any).totalSubs} Submisi</h3>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="flex items-center gap-4 py-4">
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', borderRadius: 'var(--radius-lg)' }}>
                <Award className="text-success-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted">Selesai Dinilai</p>
                <h3 className="text-2xl font-bold text-success-600">{(stats as any).totalGraded} Berkas</h3>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 3. Filter Tabs & Search Bar */}
      <Card>
        <CardBody className="flex flex-col gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-3" style={{ borderColor: 'var(--border-light)' }}>
            <button
              onClick={() => setActiveFilterTab('semua')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                activeFilterTab === 'semua'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Semua Tugas ({assignments.length})
            </button>

            {isStudent ? (
              <>
                <button
                  onClick={() => setActiveFilterTab('perlu_dikerjakan')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeFilterTab === 'perlu_dikerjakan'
                      ? 'bg-warning-600 text-white shadow-sm'
                      : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  ⏳ Perlu Dikerjakan ({(stats as any).pending})
                </button>
                <button
                  onClick={() => setActiveFilterTab('sudah_dikumpulkan')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeFilterTab === 'sudah_dikumpulkan'
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  📤 Sudah Dikumpulkan ({(stats as any).submitted})
                </button>
                <button
                  onClick={() => setActiveFilterTab('sudah_dinilai')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    activeFilterTab === 'sudah_dinilai'
                      ? 'bg-success-600 text-white shadow-sm'
                      : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  🎯 Sudah Dinilai ({(stats as any).graded})
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveFilterTab('perlu_dinilai_dosen')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilterTab === 'perlu_dinilai_dosen'
                    ? 'bg-warning-600 text-white shadow-sm'
                    : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                ⚠️ Perlu Dikoreksi Segera ({(stats as any).needGrading})
              </button>
            )}
          </div>

          {/* Search and Course Dropdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                <Search size={16} />
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-md border"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)' }}
                placeholder="Cari judul tugas, mata kuliah, atau topik bahasan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <select
                className="form-select w-full text-xs"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="all">Semua Mata Kuliah</option>
                {uniqueCourses.map((crs) => (
                  <option key={crs} value={crs}>{crs}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between text-xs pt-1" style={{ color: 'var(--text-muted)' }}>
              <span>Menampilkan {filteredAssignments.length} dari {assignments.length} penugasan</span>
              <button 
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-primary-600 hover:underline font-medium"
              >
                <X size={13} /> Reset Filter
              </button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* 4. Assignment Cards Grid */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <ClipboardList size={48} className="text-muted" style={{ margin: '0 auto var(--space-4)' }} />
            <h3 className="text-base font-semibold">Tidak Ada Tugas yang Sesuai</h3>
            <p className="text-sm text-muted mt-1">
              Tidak ditemukan penugasan pada kriteria filter yang Anda pilih.
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleResetFilters} className="mt-4">
                Bersihkan Filter
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssignments
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((asg) => {
              const studentSub = user ? assignmentService.getStudentSubmission(asg.id, user.id) : null;
              const isPastDue = new Date() > new Date(asg.dueDate);
              const submissionsCount = assignmentService.getSubmissions(asg.id).length;
              const unreadGradingCount = assignmentService.getSubmissions(asg.id).filter(
                s => s.status === 'SUDAH_DIKUMPULKAN' || s.status === 'TERLAMBAT'
              ).length;

              return (
                <Card 
                  key={asg.id} 
                  className="flex flex-col justify-between hover:shadow-md transition-all cursor-pointer"
                  onClick={() => onSelectAssignment(asg.id)}
                  style={{ borderTop: `4px solid ${asg.status === 'DITERBITKAN' ? 'var(--color-primary-600)' : 'var(--color-neutral-400)'}` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <Badge variant="primary">
                        Pertemuan #{asg.meetingNumber}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        {asg.status === 'DRAF' && (
                          <Badge variant="default">Draf Dosen</Badge>
                        )}
                        {asg.rubric && (
                          <Badge variant="info" icon={Sparkles}>
                            Rubrik OBE
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold mt-2 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                      {asg.title}
                    </h3>
                    <p className="text-xs font-medium text-primary-700 dark:text-primary-400">
                      {asg.courseName}
                    </p>
                  </CardHeader>

                  <CardBody className="py-2 flex flex-col gap-3">
                    <p className="text-xs text-muted line-clamp-2">
                      {asg.description || asg.instructions}
                    </p>

                    {/* Due Date & Submission Type Info */}
                    <div className="p-2.5 rounded-md text-xs flex flex-col gap-1.5" style={{ background: 'var(--bg-subtle)' }}>
                      <div className="flex items-center justify-between">
                        <span className="text-muted flex items-center gap-1">
                          <Calendar size={13} /> Tenggat Waktu:
                        </span>
                        <span className={`font-semibold ${isPastDue ? 'text-danger-600' : 'text-primary-700'}`}>
                          {new Date(asg.dueDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-muted">
                        <span>Format Berkas:</span>
                        <span className="font-mono text-[11px] font-medium text-primary-700">
                          {asg.allowedFileExtensions?.join(', ') || 'PDF, DOCX'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge Footer (Mahasiswa vs Dosen) */}
                    {isStudent ? (
                      <div className="pt-1">
                        {studentSub ? (
                          studentSub.status === 'SUDAH_DINILAI' ? (
                            <div className="flex items-center justify-between p-2 rounded bg-success-50 dark:bg-success-950/30 text-success-700 dark:text-success-300">
                              <span className="text-xs font-semibold flex items-center gap-1">
                                <Award size={14} /> Nilai Akhir:
                              </span>
                              <span className="text-sm font-extrabold">{studentSub.finalScore} / 100</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between p-2 rounded bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300">
                              <span className="text-xs font-semibold flex items-center gap-1">
                                <CheckCircle2 size={14} /> Terkumpul (v{studentSub.version})
                              </span>
                              <span className="text-[11px] text-muted">Menunggu Nilai</span>
                            </div>
                          )
                        ) : (
                          <div className={`flex items-center justify-between p-2 rounded ${
                            isPastDue ? 'bg-danger-50 text-danger-700' : 'bg-warning-50 text-warning-800'
                          }`}>
                            <span className="text-xs font-semibold flex items-center gap-1">
                              <AlertCircle size={14} /> {isPastDue ? 'Terlewat Tenggat' : 'Belum Dikumpulkan'}
                            </span>
                            <span className="text-[11px] font-medium">{isPastDue ? 'Terlambat' : 'Segera Kerjakan'}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center justify-between text-xs">
                        <span className="text-muted flex items-center gap-1">
                          <Users size={13} /> Terkumpul:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">{submissionsCount} Mahasiswa</span>
                          {unreadGradingCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-500 text-white animate-pulse">
                              {unreadGradingCount} Perlu Dinilai
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardBody>

                  <CardFooter className="pt-2 border-t flex items-center justify-between gap-2" style={{ borderColor: 'var(--border-light)' }}>
                    {isLecturer ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={Edit3}
                            onClick={(e) => handleOpenEditModal(asg, e)}
                            title="Edit Tugas & Rubrik"
                          />
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={asg.status === 'DITERBITKAN' ? Eye : EyeOff}
                            onClick={(e) => handleTogglePublish(asg, e)}
                            title={asg.status === 'DITERBITKAN' ? 'Tarik ke Draf' : 'Terbitkan Sekarang'}
                          />
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={Trash2}
                            onClick={(e) => handleOpenDeleteModal(asg, e)}
                            title="Hapus Tugas"
                            className="text-danger-600 hover:text-danger-700"
                          />
                        </div>

                        {onOpenGradingStudio ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Award}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenGradingStudio(asg.id);
                            }}
                          >
                            Studio Penilaian
                          </Button>
                        ) : (
                          <Button variant="secondary" size="sm" icon={ArrowRight}>
                            Detail
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button variant="primary" size="sm" icon={ArrowRight} className="w-full">
                        {studentSub ? 'Lihat Pengumpulan & Nilai' : 'Kerjakan Tugas Sekarang'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      )}

      {/* Pagination */}
      {filteredAssignments.length > pageSize && (
        <div className="flex justify-center mt-2">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredAssignments.length / pageSize)}
            totalItems={filteredAssignments.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL BUAT / EDIT TUGAS LENGKAP (DOSEN & ADMIN) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? 'Ubah Penugasan Perkuliahan & Rubrik' : 'Buat Penugasan Perkuliahan Baru'}
        maxWidth="780px"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" icon={Check} onClick={handleSaveAssignment}>
              {isEditing ? 'Simpan Perubahan' : 'Terbitkan Penugasan'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1">
          {/* A. Info Kelas & Pertemuan */}
          <div className="p-3 rounded-lg border flex flex-col gap-3" style={{ background: 'var(--bg-subtle)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <BookOpen size={14} className="text-primary-600" /> 1. Sasaran Kelas & Pertemuan RPS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Rombel Kelas Perkuliahan</label>
                <select 
                  className="form-select w-full text-xs"
                  value={formClassId} 
                  onChange={(e) => setFormClassId(e.target.value)}
                >
                  <option value="cls-pai301-a">PAI-3A — Ushul Fiqih (Reguler Pagi)</option>
                  <option value="cls-pai302-a">PAI-3B — Hadits Tarbawi (Reguler Pagi)</option>
                  <option value="cls-pai303-a">PAI-5A — Kurikulum PAI (Reguler Siang)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Pertemuan Sesi RPS</label>
                <select 
                  className="form-select w-full text-xs"
                  value={String(formMeetingNumber)} 
                  onChange={(e) => setFormMeetingNumber(Number(e.target.value))}
                >
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={String(num)}>Pertemuan #{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* B. Judul & Petunjuk Pengerjaan */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText size={14} className="text-primary-600" /> 2. Rincian & Petunjuk Pengerjaan
            </h4>

            <div>
              <label className="text-xs font-semibold block mb-1">Judul Tugas Perkuliahan *</label>
              <Input
                placeholder="Contoh: Tugas Analisis Literatur: Studi Kasus Istinbath Fatwa DSN-MUI"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Ringkasan Singkat / Capaian Pembelajaran</label>
              <Input
                placeholder="Deskripsi singkat ruang lingkup penugasan..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Petunjuk Lengkap Pengerjaan Tugas *</label>
              <textarea
                className="w-full p-2.5 text-xs rounded-md border font-sans"
                style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)', minHeight: '90px' }}
                placeholder="1. Makalah ditulis minimal 5 halaman...\n2. Format berkas PDF/DOCX...\n3. Sertakan minimal 3 rujukan kitab turats..."
                value={formInstructions}
                onChange={(e) => setFormInstructions(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Nama Lampiran Panduan / Template</label>
                <Input
                  placeholder="Panduan_Makalah_PAI.pdf"
                  value={formAttachmentName}
                  onChange={(e) => setFormAttachmentName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">URL Berkas Lampiran / Template Dosen</label>
                <Input
                  placeholder="/api/v1/storage/files/templates/Panduan.pdf"
                  value={formAttachmentUrl}
                  onChange={(e) => setFormAttachmentUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* C. Jadwal & Kebijakan Batas Waktu */}
          <div className="p-3 rounded-lg border flex flex-col gap-3" style={{ background: 'var(--bg-subtle)' }}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Calendar size={14} className="text-primary-600" /> 3. Waktu Pengerjaan & Kebijakan Keterlambatan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Waktu Dibuka (Open Date)</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 text-xs rounded-md border"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)' }}
                  value={formOpenDate}
                  onChange={(e) => setFormOpenDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Batas Waktu Pengumpulan (Due Date) *</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 text-xs rounded-md border"
                  style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)' }}
                  value={formDueDate}
                  onChange={(e) => setFormDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowLate"
                  checked={formAllowLate}
                  onChange={(e) => setFormAllowLate(e.target.checked)}
                />
                <label htmlFor="allowLate" className="text-xs font-medium cursor-pointer">
                  Toleransi Pengumpulan Terlambat
                </label>
              </div>

              {formAllowLate && (
                <div>
                  <label className="text-xs font-semibold block mb-1">Potongan Penalti Terlambat (%)</label>
                  <select
                    className="form-select w-full text-xs"
                    value={String(formLatePenalty)}
                    onChange={(e) => setFormLatePenalty(Number(e.target.value))}
                  >
                    <option value="0">0% (Tanpa Potongan)</option>
                    <option value="5">5% Pemotongan Nilai</option>
                    <option value="10">10% Pemotongan Nilai</option>
                    <option value="20">20% Pemotongan Nilai</option>
                    <option value="30">30% Pemotongan Nilai</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold block mb-1">Izin Revisi / Resubmit</label>
                <select
                  className="form-select w-full text-xs"
                  value={String(formMaxResubmit)}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormMaxResubmit(val);
                    setFormAllowResubmit(val > 0);
                  }}
                >
                  <option value="0">Tidak Boleh Revisi (1x Final)</option>
                  <option value="1">Maksimal 1x Resubmit (Revisi)</option>
                  <option value="2">Maksimal 2x Resubmit (Revisi)</option>
                  <option value="3">Maksimal 3x Resubmit (Revisi)</option>
                </select>
              </div>
            </div>
          </div>

          {/* D. Format Berkas & Batas Ukuran */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Upload size={14} className="text-primary-600" /> 4. Konfigurasi Format Berkas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold block mb-1">Metode Pengumpulan Mahasiswa</label>
                <select
                  className="form-select w-full text-xs"
                  value={formSubmissionType}
                  onChange={(e) => setFormSubmissionType(e.target.value as SubmissionType)}
                >
                  <option value="BERKAS_UNGGAHAN">Berkas Unggahan (Dokumen/PDF/ZIP)</option>
                  <option value="TEKS_DARING">Teks Daring (Editor Tulisan Langsung)</option>
                  <option value="KEDUANYA">Keduanya (Unggah Berkas + Catatan Teks)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Batas Ukuran Maksimum Berkas</label>
                <select
                  className="form-select w-full text-xs"
                  value={String(formMaxMb)}
                  onChange={(e) => setFormMaxMb(Number(e.target.value))}
                >
                  <option value="5">5 Megabytes (MB)</option>
                  <option value="10">10 Megabytes (MB) — Rekomendasi</option>
                  <option value="25">25 Megabytes (MB)</option>
                  <option value="50">50 Megabytes (MB)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Format Ekstensi Berkas yang Diterima:</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { ext: '.pdf', label: 'PDF (.pdf)' },
                  { ext: '.docx', label: 'Word (.docx)' },
                  { ext: '.pptx', label: 'PowerPoint (.pptx)' },
                  { ext: '.xlsx', label: 'Excel (.xlsx)' },
                  { ext: '.zip', label: 'Arsip ZIP (.zip)' },
                  { ext: '.jpg', label: 'Gambar JPG/PNG' }
                ].map((item) => (
                  <label 
                    key={item.ext}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs border cursor-pointer font-medium transition-all ${
                      formAllowedExts.includes(item.ext)
                        ? 'bg-primary-50 border-primary-600 text-primary-700 dark:bg-primary-950/40'
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600 dark:bg-neutral-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formAllowedExts.includes(item.ext)}
                      onChange={() => toggleExtension(item.ext)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* E. Konfigurasi Rubrik Penilaian OBE */}
          <div className="p-3 rounded-lg border flex flex-col gap-3" style={{ background: 'var(--bg-subtle)' }}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Sparkles size={14} className="text-primary-600" /> 5. Rubrik Penilaian Capaian Pembelajaran (OBE)
              </h4>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRubricMode('tanpa')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    rubricMode === 'tanpa' ? 'bg-neutral-700 text-white' : 'bg-neutral-100 text-muted'
                  }`}
                >
                  Tanpa Rubrik
                </button>
                <button
                  type="button"
                  onClick={() => setRubricMode('preset')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    rubricMode === 'preset' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-muted'
                  }`}
                >
                  Template Preset
                </button>
                <button
                  type="button"
                  onClick={() => setRubricMode('kustom')}
                  className={`px-2.5 py-1 rounded font-medium ${
                    rubricMode === 'kustom' ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-muted'
                  }`}
                >
                  Kustom Builder
                </button>
              </div>
            </div>

            {rubricMode === 'preset' && (
              <div className="flex flex-col gap-2 pt-1">
                <label className="text-xs font-semibold">Pilih Template Rubrik STAI Al-Ittihad:</label>
                <select
                  className="form-select w-full text-xs"
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                >
                  {RUBRIC_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                {/* Pratinjau Kriteria Preset */}
                {(() => {
                  const currPreset = RUBRIC_PRESETS.find(p => p.id === selectedPresetId);
                  if (!currPreset) return null;
                  return (
                    <div className="mt-2 p-2.5 rounded bg-white dark:bg-neutral-900 border text-xs flex flex-col gap-2">
                      <p className="font-semibold text-primary-700">{currPreset.rubric.title}</p>
                      <p className="text-muted text-[11px]">{currPreset.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                        {currPreset.rubric.criteria.map((crit, idx) => (
                          <div key={crit.id} className="p-2 rounded border border-dashed flex flex-col justify-between">
                            <div>
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                {idx + 1}. {crit.title}
                              </span>
                              <p className="text-[11px] text-muted line-clamp-2 mt-0.5">{crit.description}</p>
                            </div>
                            <span className="text-[11px] font-bold text-primary-600 mt-2">
                              Bobot: {crit.weightPercentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {rubricMode === 'kustom' && (
              <div className="flex flex-col gap-3 pt-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold">Total Bobot Persentase:</span>
                    {(() => {
                      const total = customCriteria.reduce((sum, c) => sum + (c.weightPercentage || 0), 0);
                      return (
                        <Badge variant={total === 100 ? 'success' : 'danger'}>
                          {total}% {total === 100 ? '(Valid 100%)' : '(Wajib 100%)'}
                        </Badge>
                      );
                    })()}
                  </div>
                  <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddCriterion}>
                    Tambah Kriteria
                  </Button>
                </div>

                <div className="flex flex-col gap-2.5">
                  {customCriteria.map((crit, idx) => (
                    <div key={crit.id} className="p-3 rounded-md bg-white dark:bg-neutral-900 border flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-muted">Kriteria #{idx + 1}</label>
                          <Input
                            value={crit.title}
                            onChange={(e) => {
                              const updated = [...customCriteria];
                              updated[idx].title = e.target.value;
                              setCustomCriteria(updated);
                            }}
                            placeholder="Judul Kriteria Penilaian"
                          />
                        </div>
                        <div style={{ width: '110px' }}>
                          <label className="text-[11px] font-semibold text-muted">Bobot (%)</label>
                          <Input
                            type="number"
                            value={String(crit.weightPercentage)}
                            onChange={(e) => {
                              const updated = [...customCriteria];
                              updated[idx].weightPercentage = Number(e.target.value);
                              setCustomCriteria(updated);
                            }}
                          />
                        </div>
                        <div className="pt-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Trash2}
                            onClick={() => handleRemoveCriterion(idx)}
                            className="text-danger-600"
                          />
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          className="w-full p-1.5 text-xs rounded border text-muted"
                          placeholder="Deskripsi indikator capaian kriteria..."
                          value={crit.description}
                          onChange={(e) => {
                            const updated = [...customCriteria];
                            updated[idx].description = e.target.value;
                            setCustomCriteria(updated);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* F. Status Publikasi */}
          <div className="flex items-center justify-between p-3 rounded-lg border" style={{ background: 'var(--bg-subtle)' }}>
            <div>
              <span className="text-xs font-bold block">Status Publikasi</span>
              <span className="text-[11px] text-muted">
                {formStatus === 'DITERBITKAN' 
                  ? 'Tugas langsung tampil di beranda & halaman tugas mahasiswa.' 
                  : 'Tugas disimpan sebagai draf rahasia dosen.'}
              </span>
            </div>
            <select
              className="form-select text-xs"
              style={{ width: '170px' }}
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as PublishStatus)}
            >
              <option value="DITERBITKAN">DITERBITKAN (Aktif)</option>
              <option value="DRAF">DRAF (Dosen Saja)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. MODAL KONFIRMASI HAPUS TUGAS */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Penugasan Perkuliahan"
        maxWidth="480px"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" icon={Trash2} onClick={handleConfirmDelete}>
              Hapus Permanen
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 py-2 text-xs">
          <p>
            Apakah Anda yakin ingin menghapus penugasan <strong>"{assignmentToDelete?.title}"</strong>?
          </p>
          <div className="p-3 rounded bg-danger-50 text-danger-800 border border-danger-200">
            <p className="font-semibold flex items-center gap-1">
              <AlertCircle size={14} /> Tindakan Destruktif:
            </p>
            <p className="mt-1">
              Seluruh berkas jawaban mahasiswa yang sudah mengumpulkan tugas ini akan turut dibersihkan dari penyimpanan.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
