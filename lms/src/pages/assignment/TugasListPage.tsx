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
  Check,
  GraduationCap
} from 'lucide-react';
import { Card, CardBody, CardHeader, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { PremiumSelect, PremiumSelectOption } from '../../components/ui/PremiumSelect';
import { 
  Assignment, 
  CreateAssignmentInput, 
  AssignmentRubric, 
  RubricCriterion,
  SubmissionType 
} from '../../types/assignment';
import { assignmentService, RUBRIC_PRESETS } from '../../services/assignmentService';
import { academicService, AcademicClass } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { PublishStatus } from '../../types/learning';

export interface TugasListPageProps {
  onSelectAssignment: (assignmentId: string) => void;
  onOpenGradingStudio?: (assignmentId: string) => void;
}

type TabFilter = 'semua' | 'perlu_dikerjakan' | 'sudah_dikumpulkan' | 'sudah_dinilai' | 'perlu_dinilai_dosen' | 'draf';

function getDeadlineUrgency(dueDate: string) {
  const now = new Date().getTime();
  const due = new Date(dueDate).getTime();
  const diffMs = due - now;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    return { text: 'Terlewat', variant: 'danger' as const, isPastDue: true };
  } else if (diffHours < 24) {
    return { text: `Sisa ${diffHours} Jam`, variant: 'warning' as const, isPastDue: false };
  } else if (diffDays <= 2) {
    return { text: `Sisa ${diffDays} Hari`, variant: 'warning' as const, isPastDue: false };
  } else {
    return { text: `Sisa ${diffDays} Hari`, variant: 'success' as const, isPastDue: false };
  }
}

export const TugasListPage: React.FC<TugasListPageProps> = ({ 
  onSelectAssignment, 
  onOpenGradingStudio 
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';
  const isLecturerRole = user?.role === 'dosen' || user?.role === 'dosen_pa';

  // Assignment & filter states
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filterProdi, setFilterProdi] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMeeting, setFilterMeeting] = useState<string>('');
  const [activeFilterTab, setActiveFilterTab] = useState<TabFilter>('semua');
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Available Classes from SIAKAD
  const [availableClasses, setAvailableClasses] = useState<AcademicClass[]>(() => {
    const all = academicService.getClasses();
    if (!isLecturerRole || !user) return all;
    const nidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
    const filtered = all.filter((c) => {
      const cNidn = (c.lecturerNidn || '').replace(/[^0-9]/g, '');
      const matchNidn = nidn && cNidn && (nidn === cNidn || cNidn.includes(nidn) || nidn.includes(cNidn));
      const matchId = c.lecturerId === user.id;
      const matchName = user.name && c.lecturerName && c.lecturerName.toLowerCase().includes(user.name.toLowerCase().trim());
      return matchNidn || matchId || matchName;
    });
    return filtered.length > 0 ? filtered : all;
  });

  useEffect(() => {
    academicService.fetchClassesFromBackend().then((classes) => {
      if (classes && classes.length > 0) {
        if (isLecturerRole && user) {
          const nidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
          const filtered = classes.filter((c) => {
            const cNidn = (c.lecturerNidn || '').replace(/[^0-9]/g, '');
            const matchNidn = nidn && cNidn && (nidn === cNidn || cNidn.includes(nidn) || nidn.includes(cNidn));
            const matchId = c.lecturerId === user.id;
            const matchName = user.name && c.lecturerName && c.lecturerName.toLowerCase().includes(user.name.toLowerCase().trim());
            return matchNidn || matchId || matchName;
          });
          if (filtered.length > 0) {
            setAvailableClasses(filtered);
            return;
          }
        }
        setAvailableClasses(classes);
      }
    }).catch(() => {});
  }, [isLecturerRole, user]);

  // Form States
  const [formClassId, setFormClassId] = useState('cls-20261-pai301-a');
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

  // Load Assignments Data directly from Backend API (real data from siakad_stai_db)
  const loadAssignmentsData = async () => {
    setIsLoading(true);
    try {
      const list = await assignmentService.fetchAssignments(selectedClassId || undefined);
      setAssignments(list);
    } catch {
      setAssignments(assignmentService.getAssignments(selectedClassId || undefined, isStudent));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignmentsData();
  }, [selectedClassId, isStudent]);

  // =========================================================================
  // SELECTOR OPTIONS: PROGRAM STUDI & KELAS PERKULIAHAN
  // =========================================================================

  const availableProdis = useMemo(() => {
    const allProdis = academicService.getStudyPrograms();
    const prodiCodesInClasses = Array.from(
      new Set(availableClasses.map((cls) => cls.studyProgramCode).filter(Boolean))
    );

    const fallbackNames: Record<string, string> = {
      PAI: 'Pendidikan Agama Islam',
      PIAUD: 'Pendidikan Islam Anak Usia Dini',
      MPI: 'Manajemen Pendidikan Islam',
      ES: 'Ekonomi Syariah',
      BKI: 'Bimbingan Konseling Islam',
      MKU: 'Mata Kuliah Umum'
    };

    return prodiCodesInClasses.map((code) => {
      const found = allProdis.find((p) => p.code === code);
      if (found) return found;

      return {
        id: `prodi-${code.toLowerCase()}`,
        externalId: `EXT-PRODI-${code}`,
        code,
        name: fallbackNames[code] || code,
        degree: 'S1' as const,
        faculty: 'Fakultas Tarbiyah',
        isActive: true,
        sourceSystem: 'SIAKAD_STAI'
      };
    });
  }, [availableClasses]);

  const prodiOptions: PremiumSelectOption[] = useMemo(() => {
    const list: PremiumSelectOption[] = [
      {
        value: '',
        label: 'Semua Program Studi',
        sublabel: `Menampilkan seluruh ${availableClasses.length} rombel kelas`,
        badge: `${availableClasses.length} Kelas`,
        icon: GraduationCap
      }
    ];

    availableProdis.forEach((prodi) => {
      const count = availableClasses.filter((cls) => cls.studyProgramCode === prodi.code).length;
      list.push({
        value: prodi.code,
        label: `[${prodi.code}] ${prodi.name}`,
        sublabel: `${prodi.degree} • ${prodi.faculty || 'STAI Al-Ittihad'}`,
        badge: `${count} Kelas`,
        icon: GraduationCap
      });
    });

    return list;
  }, [availableProdis, availableClasses]);

  const filteredClasses = useMemo(() => {
    if (!filterProdi || filterProdi === 'SEMUA') return availableClasses;
    return availableClasses.filter(cls => cls.studyProgramCode === filterProdi);
  }, [availableClasses, filterProdi]);

  const classOptions: PremiumSelectOption[] = useMemo(() => {
    const list: PremiumSelectOption[] = [
      {
        value: '',
        label: 'Semua Kelas Perkuliahan',
        sublabel: 'Menampilkan penugasan dari seluruh kelas',
        badge: `${filteredClasses.length} Kelas`,
        icon: BookOpen
      }
    ];

    filteredClasses.forEach((cls) => {
      list.push({
        value: cls.id,
        label: `[${cls.code}] ${cls.name}`,
        sublabel: `${cls.courseName || cls.name} • ${cls.credits} SKS • ${cls.studyProgramCode || 'Prodi'}`,
        badge: `${cls.studentCount || 0} Mhs`,
        icon: BookOpen
      });
    });

    return list;
  }, [filteredClasses]);

  const handleProdiChange = (selectedCode: string) => {
    setFilterProdi(selectedCode);
    setSelectedClassId('');
  };

  const handleClassChange = (selectedId: string) => {
    setSelectedClassId(selectedId);
  };

  // =========================================================================
  // METRICS & STATISTICS (REAL SIAKAD AGGREGATES)
  // =========================================================================

  const stats = useMemo(() => {
    if (isStudent) {
      return assignments.reduce(
        (acc, asg) => {
          const sub = user ? assignmentService.getStudentSubmission(asg.id, user.id) : null;
          const status = (asg as any).submissionStatus || sub?.status;
          if (!status || status === 'BELUM_DIKUMPULKAN') {
            acc.pending += 1;
          } else if (status === 'SUDAH_DINILAI') {
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
      let draftCount = 0;

      assignments.forEach(asg => {
        if (asg.status === 'DRAF') draftCount++;
        const total = (asg as any).totalSubmissionsCount ?? assignmentService.getSubmissions(asg.id).length;
        const graded = (asg as any).gradedSubmissionsCount ?? 0;
        totalSubs += total;
        totalGraded += graded;
        needGrading += Math.max(0, total - graded);
      });

      return { 
        totalAssignments: assignments.length, 
        needGrading, 
        totalSubs, 
        totalGraded,
        draftCount 
      };
    }
  }, [assignments, user, isStudent]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // 1. Prodi Filter
      if (filterProdi) {
        const cls = availableClasses.find(c => c.id === a.classId || c.code === a.classId);
        const matchProdi = (a as any).studyProgramCode === filterProdi || cls?.studyProgramCode === filterProdi;
        if (!matchProdi) return false;
      }

      // 2. Class Filter
      if (selectedClassId) {
        const matchClass = a.classId === selectedClassId || 
          availableClasses.some(c => c.id === selectedClassId && (c.code === a.classId || c.id === a.classId));
        if (!matchClass) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSearch = 
          a.title.toLowerCase().includes(q) ||
          a.courseName.toLowerCase().includes(q) ||
          (a.className && a.className.toLowerCase().includes(q)) ||
          (a.description && a.description.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // 4. Meeting Filter
      if (filterMeeting) {
        if (String(a.meetingNumber) !== filterMeeting) return false;
      }

      // 5. Tab Filter
      if (isStudent) {
        const sub = user ? assignmentService.getStudentSubmission(a.id, user.id) : null;
        const subStatus = (a as any).submissionStatus || sub?.status;
        if (activeFilterTab === 'perlu_dikerjakan') return !subStatus || subStatus === 'BELUM_DIKUMPULKAN';
        if (activeFilterTab === 'sudah_dikumpulkan') return subStatus === 'SUDAH_DIKUMPULKAN' || subStatus === 'TERLAMBAT' || subStatus === 'PERLU_REVISI';
        if (activeFilterTab === 'sudah_dinilai') return subStatus === 'SUDAH_DINILAI';
      } else {
        if (activeFilterTab === 'perlu_dinilai_dosen') {
          const totalSubs = (a as any).totalSubmissionsCount ?? assignmentService.getSubmissions(a.id).length;
          const gradedSubs = (a as any).gradedSubmissionsCount ?? 0;
          return (totalSubs - gradedSubs) > 0;
        }
        if (activeFilterTab === 'sudah_dinilai') {
          const gradedSubs = (a as any).gradedSubmissionsCount ?? 0;
          return gradedSubs > 0;
        }
        if (activeFilterTab === 'draf') {
          return a.status === 'DRAF';
        }
      }

      return true;
    });
  }, [assignments, filterProdi, selectedClassId, filterMeeting, searchQuery, activeFilterTab, isStudent, user, availableClasses]);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilterTab, filterProdi, selectedClassId, filterMeeting]);

  const hasActiveFilters = searchQuery !== '' || activeFilterTab !== 'semua' || filterProdi !== '' || selectedClassId !== '' || filterMeeting !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveFilterTab('semua');
    setFilterProdi('');
    setSelectedClassId('');
    setFilterMeeting('');
    setCurrentPage(1);
  };

  // Open Create Form
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedAssignmentId(null);
    setFormClassId(availableClasses[0]?.id || '1');
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
      meetingId: String(formMeetingNumber),
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
        `Status tugas "${asg.title}" kini ${nextStatus}.`
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
      toast.success('Tugas Dihapus', `Tugas "${assignmentToDelete.title}" beserta pengumpulan mahasiswa berhasil dibersihkan.`);
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
      {/* =====================================================================
          1. HEADER BANNER & QUICK STATS
          ===================================================================== */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList className="text-primary-600" size={26} />
              {KAMUS_UI.TUGAS} Perkuliahan & Rubrik Asesmen
            </h1>
            <Badge variant="primary" style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600 }}>
              Real-time SIAKAD
            </Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
            {isStudent 
              ? 'Pantau penugasan mata kuliah semester aktif, batas waktu pengerjaan, dan rubrik evaluasi dosen.'
              : 'Kelola penugasan perkuliahan terintegrasi SIAKAD STAI Al-Ittihad, rubrik penilaian, dan Studio Grading.'}
          </p>
        </div>

        {/* Quick Stats Banner (mirrors MataKuliahListPage) + Create Button */}
        <div className="flex items-center gap-2 flex-wrap">
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-primary-50)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <BookOpen size={16} color="var(--color-primary-700)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tugas</div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {isStudent ? assignments.length : (stats as any).totalAssignments} Tugas
              </div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-warning-50)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <Clock size={16} color="var(--color-warning-700)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {isStudent ? 'Perlu Dikerjakan' : 'Perlu Dinilai'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-warning-700)' }}>
                {isStudent ? (stats as any).pending : (stats as any).needGrading} {isStudent ? 'Tugas' : 'Berkas'}
              </div>
            </div>
          </div>

          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 14px', 
              backgroundColor: 'var(--bg-surface)', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            <div style={{ backgroundColor: 'var(--color-success-50)', padding: '6px', borderRadius: 'var(--radius-md)' }}>
              <Award size={16} color="var(--color-success-700)" />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                {isStudent ? 'Selesai Dinilai' : 'Submisi Masuk'}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-success-700)' }}>
                {isStudent ? (stats as any).graded : (stats as any).totalSubs} {isStudent ? 'Tugas' : 'Submisi'}
              </div>
            </div>
          </div>

          {isLecturer && (
            <Button 
              variant="primary" 
              icon={Plus} 
              onClick={handleOpenCreateModal}
              style={{ fontWeight: 600, height: '42px', boxShadow: 'var(--shadow-xs)' }}
            >
              Buat Tugas Baru
            </Button>
          )}
        </div>
      </div>

      {/* =====================================================================
          2. FILTER & PENCARIAN INTERAKTIF PREMIUM
          ===================================================================== */}
      <Card 
        style={{ 
          border: '1px solid var(--border-default)', 
          boxShadow: 'var(--shadow-sm)',
          overflow: 'visible',
          position: 'relative',
          zIndex: 20
        }}
      >
        <CardBody style={{ padding: 'var(--space-4) var(--space-5)', overflow: 'visible' }}>
          <div className="flex flex-col gap-4">
            {/* Dua Select Option Premium (Prodi & Kelas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                style={{
                  backgroundColor: 'var(--color-slate-50)',
                  border: filterProdi ? '1.5px solid var(--color-primary-500)' : '1.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 14px',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <PremiumSelect
                  label="1. Pilih Program Studi (SIAKAD)"
                  value={filterProdi}
                  onChange={handleProdiChange}
                  options={prodiOptions}
                  icon={GraduationCap}
                  badgeCount={`${availableProdis.length} Prodi`}
                  placeholder="— Semua Program Studi —"
                />
              </div>

              <div 
                style={{
                  backgroundColor: 'var(--color-primary-50)',
                  border: selectedClassId ? '1.5px solid var(--color-primary-600)' : '1.5px solid var(--color-primary-200)',
                  borderRadius: 'var(--radius-xl)',
                  padding: '12px 14px',
                  boxShadow: '0 2px 6px rgba(4, 120, 87, 0.05)',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <PremiumSelect
                  label="2. Pilih Kelas Perkuliahan (SIAKAD)"
                  value={selectedClassId}
                  onChange={handleClassChange}
                  options={classOptions}
                  icon={BookOpen}
                  badgeCount={filterProdi && filterProdi !== 'SEMUA' ? `${classOptions.length - 1} Kelas` : `${availableClasses.length} Kelas`}
                  placeholder="— Semua Kelas Perkuliahan —"
                />
              </div>
            </div>

            {/* Input Pencarian Multifungsi + Filter Sesi Pertemuan */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search Box dengan Clear Icon */}
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    pointerEvents: 'none'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Cari judul tugas, mata kuliah, topik bahasan, atau rubrik..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    paddingLeft: '40px',
                    paddingRight: searchQuery ? '36px' : '14px',
                    height: '42px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-default)'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'var(--color-slate-200)',
                      border: 'none',
                      borderRadius: 'var(--radius-full)',
                      width: '22px',
                      height: '22px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: 0,
                      transition: 'all var(--transition-fast)'
                    }}
                    title="Hapus kata kunci pencarian"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Sesi Pertemuan Dropdown Filter */}
              <div style={{ position: 'relative', width: '230px', flexShrink: 0 }}>
                <Calendar 
                  size={15} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-muted)',
                    pointerEvents: 'none',
                    zIndex: 2
                  }} 
                />
                <select
                  value={filterMeeting}
                  onChange={(e) => {
                    setFilterMeeting(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="form-select"
                  style={{
                    paddingLeft: '38px',
                    height: '42px',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 500,
                    backgroundColor: filterMeeting ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                    borderColor: filterMeeting ? 'var(--color-primary-400)' : 'var(--border-default)',
                    color: filterMeeting ? 'var(--color-primary-900)' : 'var(--text-primary)',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <option value="">Semua Sesi Pertemuan</option>
                  {Array.from({ length: 16 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={String(m)}>
                      Pertemuan #{m} {m === 8 ? '(UTS)' : m === 16 ? '(UAS)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Menu Tabs Status Tugas & Active Filters Summary */}
            <div 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3"
              style={{ borderTop: '1px solid var(--border-subtle)' }}
            >
              {/* Segmented Filter Pills */}
              <div 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  padding: '4px', 
                  backgroundColor: 'var(--color-slate-100)', 
                  borderRadius: 'var(--radius-lg)',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={() => { setActiveFilterTab('semua'); setCurrentPage(1); }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    fontWeight: activeFilterTab === 'semua' ? 700 : 500,
                    backgroundColor: activeFilterTab === 'semua' ? '#ffffff' : 'transparent',
                    color: activeFilterTab === 'semua' ? 'var(--color-primary-800)' : 'var(--text-secondary)',
                    boxShadow: activeFilterTab === 'semua' ? 'var(--shadow-xs)' : 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  Semua Tugas
                  <span 
                    style={{ 
                      padding: '1px 6px', 
                      borderRadius: 'var(--radius-full)', 
                      fontSize: '10px', 
                      fontWeight: 700,
                      backgroundColor: activeFilterTab === 'semua' ? 'var(--color-primary-100)' : 'var(--color-slate-200)',
                      color: activeFilterTab === 'semua' ? 'var(--color-primary-800)' : 'var(--text-secondary)'
                    }}
                  >
                    {assignments.length}
                  </span>
                </button>

                {isStudent ? (
                  <>
                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('perlu_dikerjakan'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'perlu_dikerjakan' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'perlu_dikerjakan' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'perlu_dikerjakan' ? 'var(--color-warning-700)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'perlu_dikerjakan' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Clock size={12} />
                      Perlu Dikerjakan
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'perlu_dikerjakan' ? 'var(--color-warning-100)' : 'var(--color-slate-200)',
                          color: activeFilterTab === 'perlu_dikerjakan' ? 'var(--color-warning-800)' : 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).pending}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('sudah_dikumpulkan'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'sudah_dikumpulkan' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'sudah_dikumpulkan' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'sudah_dikumpulkan' ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'sudah_dikumpulkan' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Upload size={12} />
                      Sudah Dikumpulkan
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'sudah_dikumpulkan' ? 'var(--color-primary-100)' : 'var(--color-slate-200)',
                          color: activeFilterTab === 'sudah_dikumpulkan' ? 'var(--color-primary-800)' : 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).submitted}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('sudah_dinilai'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'sudah_dinilai' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'sudah_dinilai' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-700)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'sudah_dinilai' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Award size={12} />
                      Sudah Dinilai
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-100)' : 'var(--color-slate-200)',
                          color: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-800)' : 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).graded}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('perlu_dinilai_dosen'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'perlu_dinilai_dosen' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'perlu_dinilai_dosen' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'perlu_dinilai_dosen' ? 'var(--color-warning-700)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'perlu_dinilai_dosen' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Clock size={12} />
                      Perlu Dinilai
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'perlu_dinilai_dosen' ? 'var(--color-warning-100)' : 'var(--color-slate-200)',
                          color: activeFilterTab === 'perlu_dinilai_dosen' ? 'var(--color-warning-800)' : 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).needGrading}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('sudah_dinilai'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'sudah_dinilai' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'sudah_dinilai' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-700)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'sudah_dinilai' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Award size={12} />
                      Selesai Dinilai
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-100)' : 'var(--color-slate-200)',
                          color: activeFilterTab === 'sudah_dinilai' ? 'var(--color-success-800)' : 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).totalGraded}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setActiveFilterTab('draf'); setCurrentPage(1); }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '5px 12px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        fontWeight: activeFilterTab === 'draf' ? 700 : 500,
                        backgroundColor: activeFilterTab === 'draf' ? '#ffffff' : 'transparent',
                        color: activeFilterTab === 'draf' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        boxShadow: activeFilterTab === 'draf' ? 'var(--shadow-xs)' : 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Draf
                      <span 
                        style={{ 
                          padding: '1px 6px', 
                          borderRadius: 'var(--radius-full)', 
                          fontSize: '10px', 
                          fontWeight: 700,
                          backgroundColor: activeFilterTab === 'draf' ? 'var(--color-slate-300)' : 'var(--color-slate-200)',
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {(stats as any).draftCount}
                      </span>
                    </button>
                  </>
                )}
              </div>

              {/* Active Filter Badges & Reset Button */}
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Menampilkan <strong style={{ color: 'var(--color-primary-700)' }}>{filteredAssignments.length}</strong> dari {assignments.length} tugas
                </span>

                {hasActiveFilters && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    icon={X} 
                    onClick={handleResetFilters}
                    style={{ color: 'var(--color-danger-main)', fontSize: '11px', padding: '2px 8px' }}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =====================================================================
          3. ASSIGNMENT CARDS GRID
          ===================================================================== */}
      {isLoading ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-600 border-t-transparent mb-3" />
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Memuat data penugasan perkuliahan terintegrasi SIAKAD...
            </p>
          </CardBody>
        </Card>
      ) : filteredAssignments.length === 0 ? (
        <Card style={{ border: '1px dashed var(--border-default)' }}>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-12) var(--space-6)' }}>
            <div 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--color-slate-100)', 
                color: 'var(--text-muted)', 
                marginBottom: 'var(--space-4)' 
              }}
            >
              <ClipboardList size={26} />
            </div>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
              Tidak Ada Tugas yang Sesuai
            </h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto var(--space-5)', lineHeight: 1.6 }}>
              Tidak ditemukan penugasan perkuliahan pada kriteria filter Program Studi, Kelas, atau Pertemuan yang Anda pilih.
            </p>
            {hasActiveFilters && (
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Bersihkan Semua Filter
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {filteredAssignments
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
            .map((asg) => {
              const studentSub = user ? assignmentService.getStudentSubmission(asg.id, user.id) : null;
              const subStatus = (asg as any).submissionStatus || studentSub?.status;
              const urgency = getDeadlineUrgency(asg.dueDate);
              
              // Aggregates from real database
              const totalSubs = (asg as any).totalSubmissionsCount ?? assignmentService.getSubmissions(asg.id).length;
              const gradedSubs = (asg as any).gradedSubmissionsCount ?? 0;
              const totalStudents = (asg as any).totalStudentsCount || 1;
              const needGradingCount = Math.max(0, totalSubs - gradedSubs);
              const submissionRate = Math.min(100, Math.round((totalSubs / totalStudents) * 100));

              return (
                <Card 
                  key={asg.id} 
                  interactive 
                  onClick={() => onSelectAssignment(asg.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-default)',
                    transition: 'all var(--transition-normal)',
                    overflow: 'hidden'
                  }}
                >
                  <div>
                    {/* Card Header: Pertemuan & Status Pill */}
                    <CardHeader style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span 
                          style={{ 
                            fontSize: '11px', 
                            fontWeight: 700, 
                            padding: '2px 8px', 
                            borderRadius: 'var(--radius-sm)', 
                            backgroundColor: 'var(--color-primary-50)', 
                            color: 'var(--color-primary-800)', 
                            border: '1px solid var(--color-primary-200)' 
                          }}
                        >
                          Pertemuan #{asg.meetingNumber}
                        </span>
                        {asg.rubric && (
                          <span 
                            style={{ 
                              fontSize: '10.5px', 
                              fontWeight: 600, 
                              padding: '2px 7px', 
                              borderRadius: 'var(--radius-sm)', 
                              backgroundColor: 'var(--color-accent-50)', 
                              color: 'var(--color-accent-700)', 
                              border: '1px solid var(--color-accent-200)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}
                          >
                            <Sparkles size={11} /> Rubrik OBE
                          </span>
                        )}
                        {asg.status === 'DRAF' && (
                          <Badge variant="default" style={{ fontSize: '10px' }}>
                            Draf
                          </Badge>
                        )}
                      </div>

                      <Badge 
                        variant={urgency.variant === 'danger' ? 'danger' : urgency.variant === 'warning' ? 'warning' : 'success'}
                        style={{ fontSize: '11px', fontWeight: 600 }}
                      >
                        {urgency.text}
                      </Badge>
                    </CardHeader>

                    {/* Card Body: Info Penugasan */}
                    <CardBody style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <h3 
                          style={{ 
                            fontSize: 'var(--text-base)', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)', 
                            margin: '0 0 4px 0', 
                            lineHeight: 1.35 
                          }} 
                          className="line-clamp-2"
                        >
                          {asg.title}
                        </h3>
                        <div 
                          style={{ 
                            fontSize: 'var(--text-xs)', 
                            color: 'var(--color-primary-700)', 
                            fontWeight: 600, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px' 
                          }} 
                          className="truncate"
                        >
                          <BookOpen size={13} style={{ flexShrink: 0 }} /> 
                          <span className="truncate">{asg.courseName}</span> 
                          {asg.className && <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>• {asg.className}</span>}
                        </div>
                      </div>

                      {/* Excerpt */}
                      <p 
                        style={{ 
                          fontSize: 'var(--text-xs)', 
                          color: 'var(--text-muted)', 
                          margin: 0, 
                          lineHeight: 1.5 
                        }} 
                        className="line-clamp-2"
                      >
                        {asg.description || asg.instructions}
                      </p>

                      {/* Deadline & Format Box */}
                      <div 
                        style={{ 
                          backgroundColor: 'var(--bg-subtle)', 
                          borderRadius: 'var(--radius-md)', 
                          padding: '8px 12px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '4px', 
                          fontSize: '11px' 
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={12} color="var(--color-primary-600)" /> Tenggat Waktu:
                          </span>
                          <span style={{ fontWeight: 600, color: urgency.variant === 'danger' ? 'var(--color-danger-main)' : 'var(--text-primary)' }}>
                            {new Date(asg.dueDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })} WIB
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Format Berkas:</span>
                          <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary-700)', fontSize: '10.5px' }}>
                            {asg.allowedFileExtensions?.join(', ') || '.pdf, .docx'}
                          </span>
                        </div>
                      </div>

                      {/* Submission / Grading Status Indicator */}
                      <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                        {isStudent ? (
                          <div>
                            {subStatus === 'SUDAH_DINILAI' ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: 'var(--color-success-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-success-200)', fontSize: '11.5px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-success-800)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <Award size={13} /> Nilai Akhir:
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '13px', color: 'var(--color-success-800)' }}>
                                  {(asg as any).studentFinalScore ?? studentSub?.finalScore ?? 100} / 100
                                </span>
                              </div>
                            ) : subStatus === 'SUDAH_DIKUMPULKAN' || subStatus === 'TERLAMBAT' ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)', fontSize: '11.5px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <CheckCircle2 size={13} /> Terkumpul
                                </span>
                                <span style={{ color: 'var(--color-primary-700)', fontWeight: 500, fontSize: '10.5px' }}>
                                  Menunggu Penilaian
                                </span>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', backgroundColor: urgency.variant === 'danger' ? 'var(--color-danger-50)' : 'var(--color-warning-50)', borderRadius: 'var(--radius-md)', border: urgency.variant === 'danger' ? '1px solid var(--color-danger-200)' : '1px solid var(--color-warning-200)', fontSize: '11.5px' }}>
                                <span style={{ fontWeight: 600, color: urgency.variant === 'danger' ? 'var(--color-danger-800)' : 'var(--color-warning-800)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <AlertCircle size={13} /> Status:
                                </span>
                                <span style={{ fontWeight: 700, color: urgency.variant === 'danger' ? 'var(--color-danger-700)' : 'var(--color-warning-700)' }}>
                                  {urgency.variant === 'danger' ? 'Terlewat Waktu' : 'Belum Mengumpulkan'}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                              <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users size={12} /> Pengumpulan:
                              </span>
                              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                {totalSubs}/{totalStudents} Mhs ({submissionRate}%)
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div style={{ height: '6px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                              <div 
                                style={{ 
                                  height: '100%', 
                                  width: `${submissionRate}%`, 
                                  backgroundColor: submissionRate === 100 ? 'var(--color-success-600)' : 'var(--color-primary-600)',
                                  borderRadius: 'var(--radius-full)',
                                  transition: 'width 0.3s ease'
                                }} 
                              />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px' }}>
                              {needGradingCount > 0 ? (
                                <span style={{ fontWeight: 600, color: 'var(--color-warning-700)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <Clock size={11} /> {needGradingCount} Perlu Dinilai
                                </span>
                              ) : totalSubs > 0 ? (
                                <span style={{ fontWeight: 600, color: 'var(--color-success-700)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                  <CheckCircle2 size={11} /> Lengkap Dinilai
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)' }}>Belum ada submisi</span>
                              )}
                              <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{gradedSubs} Selesai</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </div>

                  {/* Card Action Footer */}
                  <CardFooter style={{ padding: '10px 16px', backgroundColor: 'var(--bg-subtle)', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    {isLecturer ? (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={Edit3}
                            onClick={(e) => handleOpenEditModal(asg, e)}
                            title="Ubah Tugas & Rubrik"
                            style={{ height: '32px', width: '34px', padding: 0 }}
                          />
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={asg.status === 'DITERBITKAN' ? Eye : EyeOff}
                            onClick={(e) => handleTogglePublish(asg, e)}
                            title={asg.status === 'DITERBITKAN' ? 'Tarik ke Draf' : 'Terbitkan Sekarang'}
                            style={{ height: '32px', width: '34px', padding: 0 }}
                          />
                          <Button 
                            variant="danger" 
                            size="sm" 
                            icon={Trash2}
                            onClick={(e) => handleOpenDeleteModal(asg, e)}
                            title="Hapus Tugas"
                            style={{ height: '32px', width: '34px', padding: 0 }}
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
                            style={{ fontSize: '11.5px', fontWeight: 600, height: '32px' }}
                          >
                            Studio Nilai
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={ArrowRight}
                            style={{ fontSize: '11.5px', height: '32px' }}
                          >
                            Detail
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        icon={ArrowRight} 
                        className="w-full"
                        style={{ height: '34px', fontWeight: 600 }}
                      >
                        {subStatus === 'SUDAH_DINILAI' || subStatus === 'SUDAH_DIKUMPULKAN' 
                          ? 'Lihat Pengumpulan & Nilai' 
                          : 'Kerjakan Tugas Sekarang'}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      )}

      {/* =====================================================================
          4. PAGINATION
          ===================================================================== */}
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
                  {availableClasses.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.courseCode}: {cls.courseName} ({cls.name})
                    </option>
                  ))}
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
