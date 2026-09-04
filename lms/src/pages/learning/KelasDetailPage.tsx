import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  Download, 
  ExternalLink, 
  Plus, 
  Eye, 
  EyeOff, 
  Calendar, 
  Layers, 
  Upload, 
  File, 
  Globe,
  PlayCircle,
  Edit3,
  Trash2,
  Printer,
  AlertTriangle,
  Check,
  Award,
  BookMarked,
  Search,
  X,
  QrCode,
  CheckSquare,
  HelpCircle,
  MessageSquare,
  Clock,
  Sparkles
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { OnlineModuleReader } from '../../components/learning/OnlineModuleReader';
import { InteractiveVideoPlayer } from '../../components/video/InteractiveVideoPlayer';
import { DynamicQrModal } from '../../components/attendance/DynamicQrModal';
import { StudentAttendanceModal } from '../../components/attendance/StudentAttendanceModal';
import { AcademicClass } from '../../types/academic';
import { CourseMeeting, LearningMaterial, RPSSection, MaterialType, PublishStatus } from '../../types/learning';
import { InteractiveVideo } from '../../types/video';
import { academicService } from '../../services/academicService';
import { learningService } from '../../services/learningService';
import { videoService } from '../../services/videoService';
import { attendanceService } from '../../services/attendanceService';
import { assignmentService } from '../../services/assignmentService';
import { quizService } from '../../services/quizService';
import { forumService } from '../../services/forumService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface KelasDetailPageProps {
  classId: string;
  onBack: () => void;
  onNavigateToAssignment?: (assignmentId: string) => void;
  onNavigateToGrading?: (assignmentId: string) => void;
  onNavigateToQuiz?: (quizId: string) => void;
  onNavigateToForum?: (threadId: string) => void;
  onNavigateToVideo?: (videoId: string) => void;
  onNavigateToAttendance?: () => void;
}

const PRESET_TEACHING_METHODS = [
  'Kuliah Interaktif & Diskusi Kelas',
  'Pembelajaran Berbasis Video Interaktif',
  'Studi Kasus Fiqih Kontemporer (Case-Based Learning)',
  'Problem-Based Learning (PBL)',
  'Tugas Analisis Literatur Kitab Turats',
  'Praktikum & Simulasi Peradilan/Bisnis',
  'Presentasi Kelompok & Peer Review',
  'Blended Learning (Daring & Tatap Muka)'
];

const DEFAULT_EMPTY_RPS: RPSSection = {
  description: 'Rencana Pembelajaran Semester (RPS) belum disusun secara rinci untuk mata kuliah ini. Silakan klik tombol Edit RPS untuk mulai menyusun kurikulum perkuliahan.',
  learningOutcomes: [
    'Mampu memahami konsep dasar dan ruang lingkup mata kuliah.',
    'Mampu menganalisis prinsip-prinsip utama dan aplikasinya dalam disiplin ilmu.',
    'Memiliki integritas keilmuan dan kemampuan memecahkan masalah terkait topik perkuliahan.'
  ],
  teachingMethods: [
    'Kuliah Interaktif & Diskusi Kelas',
    'Studi Kasus Fiqih Kontemporer (Case-Based Learning)'
  ],
  assessmentWeights: [
    { component: 'Kehadiran & Partisipasi Diskusi', weightPercentage: 15 },
    { component: 'Tugas & Analisis Kasus', weightPercentage: 25 },
    { component: 'Kuis & Video Interaktif', weightPercentage: 15 },
    { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
    { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 }
  ],
  references: [
    { title: 'Buku Rujukan Utama Mata Kuliah', author: 'Dosen Pengampu / Tim Pengembang', year: 2026, isPrimary: true }
  ],
  documentAttachmentName: 'RPS_Resmi_STAI_AlIttihad.pdf',
  updatedAt: new Date().toISOString()
};

export const KelasDetailPage: React.FC<KelasDetailPageProps> = ({ 
  classId, 
  onBack,
  onNavigateToAssignment,
  onNavigateToGrading,
  onNavigateToQuiz,
  onNavigateToForum,
  onNavigateToVideo,
  onNavigateToAttendance
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [classInfo, setClassInfo] = useState<AcademicClass | null>(null);
  const [rps, setRps] = useState<RPSSection | null>(null);
  const [meetings, setMeetings] = useState<CourseMeeting[]>([]);
  const [activeTab, setActiveTab] = useState<'pertemuan' | 'rps' | 'materi'>('pertemuan');
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

  // Reader & Player states
  const [selectedMaterialView, setSelectedMaterialView] = useState<LearningMaterial | null>(null);
  const [readingOnlineMaterial, setReadingOnlineMaterial] = useState<{ material: LearningMaterial; meetingId: string; meetingNumber: number } | null>(null);
  const [activePlayingVideo, setActivePlayingVideo] = useState<InteractiveVideo | null>(null);

  // Repositori Search & Filter
  const [materialFilterType, setMaterialFilterType] = useState<string>('SEMUA');
  const [materialSearchQuery, setMaterialSearchQuery] = useState<string>('');

  // =========================================================================
  // MODAL STATES
  // =========================================================================

  // 1. Meeting Modals
  const [meetingModal, setMeetingModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    meetingId?: string;
  }>({ isOpen: false, mode: 'create' });

  const [deleteMeetingConfirm, setDeleteMeetingConfirm] = useState<{
    isOpen: boolean;
    meeting: CourseMeeting | null;
  }>({ isOpen: false, meeting: null });

  // 2. Material Modals
  const [materialModal, setMaterialModal] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit';
    meetingId: string | null;
    materialId?: string;
  }>({ isOpen: false, mode: 'create', meetingId: null });

  const [deleteMaterialConfirm, setDeleteMaterialConfirm] = useState<{
    isOpen: boolean;
    meetingId: string;
    material: LearningMaterial | null;
  }>({ isOpen: false, meetingId: '', material: null });

  // 3. RPS Modals
  const [editRpsModal, setEditRpsModal] = useState<boolean>(false);
  const [editRpsTab, setEditRpsTab] = useState<'deskripsi' | 'cpmk' | 'metode' | 'penilaian' | 'referensi'>('deskripsi');
  const [resetRpsConfirm, setResetRpsConfirm] = useState<boolean>(false);
  const [printRpsModal, setPrintRpsModal] = useState<boolean>(false);

  // 4. Attendance Modals & State
  const [activeAttendanceMeeting, setActiveAttendanceMeeting] = useState<CourseMeeting | null>(null);
  const [attendanceSessionData, setAttendanceSessionData] = useState<any>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isStudentAttendanceModalOpen, setIsStudentAttendanceModalOpen] = useState<boolean>(false);

  // =========================================================================
  // FORM STATES: PERTEMUAN (MEETING)
  // =========================================================================
  const [meetingFormNumber, setMeetingFormNumber] = useState<number>(1);
  const [meetingFormTitle, setMeetingFormTitle] = useState('');
  const [meetingFormTopic, setMeetingFormTopic] = useState('');
  const [meetingFormDesc, setMeetingFormDesc] = useState('');
  const [meetingFormDate, setMeetingFormDate] = useState('');
  const [meetingFormStartTime, setMeetingFormStartTime] = useState('08:00');
  const [meetingFormEndTime, setMeetingFormEndTime] = useState('10:30');
  const [meetingFormStatus, setMeetingFormStatus] = useState<PublishStatus>('DITERBITKAN');

  // =========================================================================
  // FORM STATES: MATERI (MATERIAL)
  // =========================================================================
  const [materialFormMeetingId, setMaterialFormMeetingId] = useState<string>('');
  const [materialFormTitle, setMaterialFormTitle] = useState('');
  const [materialFormDesc, setMaterialFormDesc] = useState('');
  const [materialFormType, setMaterialFormType] = useState<MaterialType>('MODUL_ONLINE');
  const [materialFormExternalUrl, setMaterialFormExternalUrl] = useState('');
  const [materialFormText, setMaterialFormText] = useState('');
  const [materialFormFileName, setMaterialFormFileName] = useState('');
  const [materialFormAllowDownload, setMaterialFormAllowDownload] = useState(true);
  const [materialFormStatus, setMaterialFormStatus] = useState<PublishStatus>('DITERBITKAN');
  
  // Modul Online specific form states
  const [modulAuthor, setModulAuthor] = useState('');
  const [modulEdition, setModulEdition] = useState('Edisi Akademik 2026/2027');
  const [modulEstMinutes, setModulEstMinutes] = useState(20);
  const [modulLearningOutcomes, setModulLearningOutcomes] = useState<string[]>(['']);
  const [modulChapterTitle, setModulChapterTitle] = useState('');
  const [modulChapterContent, setModulChapterContent] = useState('');
  const [modulKeyTakeaways, setModulKeyTakeaways] = useState<string[]>(['']);
  const [modulArabicText, setModulArabicText] = useState('');
  const [modulArabicTranslation, setModulArabicTranslation] = useState('');
  const [modulArabicSource, setModulArabicSource] = useState('');
  const [modulCaseTitle, setModulCaseTitle] = useState('');
  const [modulCaseScenario, setModulCaseScenario] = useState('');
  const [modulCaseAnalysis, setModulCaseAnalysis] = useState('');

  // =========================================================================
  // FORM STATES: RPS
  // =========================================================================
  const [rpsFormDesc, setRpsFormDesc] = useState('');
  const [rpsFormCpmk, setRpsFormCpmk] = useState<string[]>([]);
  const [rpsFormMethods, setRpsFormMethods] = useState<string[]>([]);
  const [rpsFormCustomMethod, setRpsFormCustomMethod] = useState('');
  const [rpsFormWeights, setRpsFormWeights] = useState<{ component: string; weightPercentage: number }[]>([]);
  const [rpsFormReferences, setRpsFormReferences] = useState<{ title: string; author: string; year: number; isPrimary: boolean }[]>([]);
  const [rpsFormDocName, setRpsFormDocName] = useState('');

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';
  const effectiveIsStudent = isStudent || isPreviewMode;

  // =========================================================================
  // HOOKS: USEMEMO & USEEFFECT (HARUS SEBELUM CONDITIONAL RETURN)
  // =========================================================================

  // Calculate RPS Total Weight
  const totalRpsWeight = useMemo(() => {
    return rpsFormWeights.reduce((sum, w) => sum + (Number(w.weightPercentage) || 0), 0);
  }, [rpsFormWeights]);

  // Kumpulkan semua materi untuk tab Repositori
  const allMaterials = useMemo(() => {
    return meetings.flatMap((m) => m.materials.map((mat) => ({ ...mat, meetingNumber: m.meetingNumber, meetingTitle: m.title })));
  }, [meetings]);

  const filteredAllMaterials = useMemo(() => {
    return allMaterials.filter((mat) => {
      const matchType = materialFilterType === 'SEMUA' || mat.type === materialFilterType;
      const matchSearch = 
        mat.title.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
        (mat.description && mat.description.toLowerCase().includes(materialSearchQuery.toLowerCase())) ||
        (mat.fileName && mat.fileName.toLowerCase().includes(materialSearchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [allMaterials, materialFilterType, materialSearchQuery]);

  const loadData = () => {
    const cls = academicService.getClasses().find((c) => c.id === classId);
    if (cls) setClassInfo(cls);
    const existingRps = learningService.getRPS(classId) || DEFAULT_EMPTY_RPS;
    setRps(existingRps);
    setMeetings(learningService.getMeetingsByClass(classId, effectiveIsStudent));
  };

  useEffect(() => {
    loadData();
  }, [classId, effectiveIsStudent]);

  // =========================================================================
  // HANDLERS: PERTEMUAN (MEETING CRUD)
  // =========================================================================

  const handleOpenCreateMeeting = () => {
    setMeetingFormNumber(meetings.length + 1);
    setMeetingFormTitle('');
    setMeetingFormTopic('');
    setMeetingFormDesc('');
    setMeetingFormDate(new Date().toISOString().split('T')[0]);
    setMeetingFormStartTime('08:00');
    setMeetingFormEndTime('10:30');
    setMeetingFormStatus('DITERBITKAN');
    setMeetingModal({ isOpen: true, mode: 'create' });
  };

  const handleOpenEditMeeting = (mtg: CourseMeeting) => {
    setMeetingFormNumber(mtg.meetingNumber);
    setMeetingFormTitle(mtg.title);
    setMeetingFormTopic(mtg.topic);
    setMeetingFormDesc(mtg.description);
    setMeetingFormDate(mtg.scheduledDate || new Date().toISOString().split('T')[0]);
    setMeetingFormStartTime(mtg.startTime || '08:00');
    setMeetingFormEndTime(mtg.endTime || '10:30');
    setMeetingFormStatus(mtg.status);
    setMeetingModal({ isOpen: true, mode: 'edit', meetingId: mtg.id });
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (meetingModal.mode === 'create') {
        learningService.createMeeting({
          classId,
          meetingNumber: meetingFormNumber,
          title: meetingFormTitle,
          topic: meetingFormTopic,
          description: meetingFormDesc,
          scheduledDate: meetingFormDate || new Date().toISOString().split('T')[0],
          startTime: meetingFormStartTime,
          endTime: meetingFormEndTime,
          orderIndex: meetingFormNumber,
          status: meetingFormStatus,
          publishedAt: meetingFormStatus === 'DITERBITKAN' ? new Date().toISOString() : undefined
        });
        toast.success('Pertemuan Dibuat', `Pertemuan ke-${meetingFormNumber} "${meetingFormTitle}" berhasil ditambahkan.`);
      } else if (meetingModal.mode === 'edit' && meetingModal.meetingId) {
        learningService.updateMeeting(meetingModal.meetingId, {
          meetingNumber: meetingFormNumber,
          title: meetingFormTitle,
          topic: meetingFormTopic,
          description: meetingFormDesc,
          scheduledDate: meetingFormDate,
          startTime: meetingFormStartTime,
          endTime: meetingFormEndTime,
          orderIndex: meetingFormNumber,
          status: meetingFormStatus,
          publishedAt: meetingFormStatus === 'DITERBITKAN' ? new Date().toISOString() : undefined
        });
        toast.success('Pertemuan Diperbarui', `Perubahan pertemuan ke-${meetingFormNumber} berhasil disimpan.`);
      }

      loadData();
      setMeetingModal({ isOpen: false, mode: 'create' });
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Pertemuan', err.message);
    }
  };

  const handleDeleteMeeting = () => {
    if (!deleteMeetingConfirm.meeting) return;
    try {
      learningService.deleteMeeting(deleteMeetingConfirm.meeting.id);
      loadData();
      toast.success('Pertemuan Dihapus', `Pertemuan ke-${deleteMeetingConfirm.meeting.meetingNumber} telah berhasil dihapus.`);
      setDeleteMeetingConfirm({ isOpen: false, meeting: null });
    } catch (err: any) {
      toast.danger('Gagal Menghapus Pertemuan', err.message);
    }
  };

  const handleTogglePublishMeeting = (meeting: CourseMeeting) => {
    const newStatus: PublishStatus = meeting.status === 'DITERBITKAN' ? 'DRAF' : 'DITERBITKAN';
    learningService.updateMeeting(meeting.id, {
      status: newStatus,
      publishedAt: newStatus === 'DITERBITKAN' ? new Date().toISOString() : undefined
    });
    loadData();
    toast.info(
      'Status Diperbarui',
      `Pertemuan ${meeting.meetingNumber} kini berstatus: ${newStatus}`
    );
  };

  const handleOpenAttendance = async (mtg: CourseMeeting) => {
    setActiveAttendanceMeeting(mtg);
    if (!isLecturer || isPreviewMode) {
      setIsStudentAttendanceModalOpen(true);
      return;
    }

    try {
      const data = await attendanceService.getMeetingSession(mtg.id);
      setAttendanceSessionData(data);
      if (data.session.sessionStatus !== 'DIBUKA') {
        await attendanceService.openSession(mtg.id, { deliveryMode: 'TATAP_MUKA' });
        const updated = await attendanceService.getMeetingSession(mtg.id);
        setAttendanceSessionData(updated);
      }
      setIsQrModalOpen(true);
    } catch {
      setIsQrModalOpen(true);
    }
  };

  const handleRefreshQrInClass = async () => {
    if (!activeAttendanceMeeting) return;
    try {
      await attendanceService.refreshQrToken(activeAttendanceMeeting.id);
      const updated = await attendanceService.getMeetingSession(activeAttendanceMeeting.id);
      setAttendanceSessionData(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCloseAttendanceInClass = async () => {
    if (!activeAttendanceMeeting) return;
    try {
      await attendanceService.closeSession(activeAttendanceMeeting.id);
      toast.success('Sesi Presensi Ditutup', 'Rekapitulasi kehadiran telah dikunci.');
      setIsQrModalOpen(false);
      const updated = await attendanceService.getMeetingSession(activeAttendanceMeeting.id);
      setAttendanceSessionData(updated);
    } catch (err: any) {
      toast.danger('Gagal Menutup Sesi', err.message);
    }
  };

  // =========================================================================
  // HANDLERS: MATERI (MATERIAL CRUD)
  // =========================================================================

  const handleOpenCreateMaterial = (targetMeetingId?: string) => {
    const defaultMtgId = targetMeetingId || (meetings.length > 0 ? meetings[0].id : '');
    setMaterialFormMeetingId(defaultMtgId);
    setMaterialFormTitle('');
    setMaterialFormDesc('');
    setMaterialFormType('MODUL_ONLINE');
    setMaterialFormExternalUrl('');
    setMaterialFormText('');
    setMaterialFormFileName('');
    setMaterialFormAllowDownload(true);
    setMaterialFormStatus('DITERBITKAN');

    // Modul Online Defaults
    setModulAuthor(user?.name || classInfo?.lecturerName || 'Dosen Pengampu');
    setModulEdition('Edisi Akademik 2026/2027');
    setModulEstMinutes(20);
    setModulLearningOutcomes(['Memahami konsep dan kaidah pokok pembelajaran materi ini.']);
    setModulChapterTitle('');
    setModulChapterContent('');
    setModulKeyTakeaways(['Pahami intisari bahasan utama bab ini secara seksama.']);
    setModulArabicText('');
    setModulArabicTranslation('');
    setModulArabicSource('');
    setModulCaseTitle('');
    setModulCaseScenario('');
    setModulCaseAnalysis('');

    setMaterialModal({ isOpen: true, mode: 'create', meetingId: defaultMtgId });
  };

  const handleOpenEditMaterial = (mat: LearningMaterial, meetingId: string) => {
    setMaterialFormMeetingId(meetingId);
    setMaterialFormTitle(mat.title);
    setMaterialFormDesc(mat.description || '');
    setMaterialFormType(mat.type);
    setMaterialFormExternalUrl(mat.externalUrl || '');
    setMaterialFormText(mat.textContent || '');
    setMaterialFormFileName(mat.fileName || '');
    setMaterialFormAllowDownload(mat.allowDownload);
    setMaterialFormStatus(mat.status);

    if (mat.onlineModule) {
      setModulAuthor(mat.onlineModule.author || user?.name || 'Dosen Pengampu');
      setModulEdition(mat.onlineModule.edition || 'Edisi Akademik 2026/2027');
      setModulEstMinutes(mat.onlineModule.totalEstimatedMinutes || 20);
      setModulLearningOutcomes(mat.onlineModule.learningOutcomes?.length ? mat.onlineModule.learningOutcomes : ['Memahami capaian pembelajaran materi ini.']);
      
      const firstChapter = mat.onlineModule.chapters?.[0];
      if (firstChapter) {
        setModulChapterTitle(firstChapter.title || '');
        setModulChapterContent(firstChapter.content || '');
        setModulKeyTakeaways(firstChapter.keyTakeaways?.length ? firstChapter.keyTakeaways : ['Pahami konsep utama bab ini.']);
        
        const firstQuote = firstChapter.arabicQuotes?.[0];
        setModulArabicText(firstQuote?.arabicText || '');
        setModulArabicTranslation(firstQuote?.translation || '');
        setModulArabicSource(firstQuote?.source || '');

        const cs = firstChapter.caseStudy;
        setModulCaseTitle(cs?.title || '');
        setModulCaseScenario(cs?.scenario || '');
        setModulCaseAnalysis(cs?.analysisGuide || '');
      }
    } else {
      setModulAuthor(user?.name || classInfo?.lecturerName || 'Dosen Pengampu');
      setModulEdition('Edisi Akademik 2026/2027');
      setModulEstMinutes(20);
      setModulLearningOutcomes(['Memahami capaian materi ini.']);
      setModulChapterTitle(mat.title);
      setModulChapterContent(mat.textContent || mat.description || '');
      setModulKeyTakeaways(['Poin penting materi.']);
      setModulArabicText('');
      setModulArabicTranslation('');
      setModulArabicSource('');
      setModulCaseTitle('');
      setModulCaseScenario('');
      setModulCaseAnalysis('');
    }

    setMaterialModal({
      isOpen: true,
      mode: 'edit',
      meetingId,
      materialId: mat.id
    });
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialFormMeetingId) {
      toast.warning('Pilih Pertemuan', 'Silakan pilih pertemuan tujuan materi pembelajaran.');
      return;
    }

    try {
      const isOnlineModule = materialFormType === 'MODUL_ONLINE' || materialFormType === 'BUKU_ELEKTRONIK';
      
      const onlineModulePayload = isOnlineModule ? {
        author: modulAuthor || user?.name || 'Dosen Pengampu',
        edition: modulEdition,
        totalEstimatedMinutes: modulEstMinutes || 15,
        learningOutcomes: modulLearningOutcomes.filter((o) => o.trim().length > 0),
        chapters: [
          {
            id: `ch-${Date.now()}-1`,
            chapterNumber: 1,
            title: modulChapterTitle || materialFormTitle,
            estimatedMinutes: modulEstMinutes || 15,
            content: modulChapterContent || materialFormText || materialFormDesc || 'Konten pembelajaran modul daring.',
            keyTakeaways: modulKeyTakeaways.filter((k) => k.trim().length > 0),
            arabicQuotes: modulArabicText ? [
              {
                arabicText: modulArabicText,
                translation: modulArabicTranslation,
                source: modulArabicSource
              }
            ] : undefined,
            caseStudy: modulCaseTitle ? {
              title: modulCaseTitle,
              scenario: modulCaseScenario,
              analysisGuide: modulCaseAnalysis
            } : undefined
          }
        ]
      } : undefined;

      const generatedFileName = materialFormFileName || (
        materialFormType === 'DOKUMEN_PDF' ? `${materialFormTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf` :
        materialFormType === 'PRESENTASI' ? `${materialFormTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pptx` :
        materialFormType === 'BUKU_ELEKTRONIK' ? `${materialFormTitle.replace(/[^a-zA-Z0-9]/g, '_')}_BukuAjar.pdf` : undefined
      );

      if (materialModal.mode === 'create') {
        learningService.addMaterial(materialFormMeetingId, {
          classId,
          meetingId: materialFormMeetingId,
          title: materialFormTitle,
          description: materialFormDesc,
          type: materialFormType,
          fileName: generatedFileName,
          fileSizeBytes: 2500000,
          externalUrl: materialFormExternalUrl,
          textContent: materialFormText || modulChapterContent,
          onlineModule: onlineModulePayload,
          orderIndex: 1,
          status: materialFormStatus,
          allowDownload: materialFormAllowDownload,
          publishedAt: materialFormStatus === 'DITERBITKAN' ? new Date().toISOString() : undefined
        });
        toast.success('Materi Ditambahkan', `Materi "${materialFormTitle}" berhasil diunggah.`);
      } else if (materialModal.mode === 'edit' && materialModal.materialId) {
        learningService.updateMaterial(materialFormMeetingId, materialModal.materialId, {
          title: materialFormTitle,
          description: materialFormDesc,
          type: materialFormType,
          fileName: generatedFileName,
          externalUrl: materialFormExternalUrl,
          textContent: materialFormText || modulChapterContent,
          onlineModule: onlineModulePayload,
          status: materialFormStatus,
          allowDownload: materialFormAllowDownload
        });
        toast.success('Materi Diperbarui', `Materi "${materialFormTitle}" berhasil diperbarui.`);
      }

      loadData();
      setMaterialModal({ isOpen: false, mode: 'create', meetingId: null });
    } catch (err: any) {
      toast.danger('Gagal Menyimpan Materi', err.message);
    }
  };

  const handleDeleteMaterial = () => {
    if (!deleteMaterialConfirm.material || !deleteMaterialConfirm.meetingId) return;
    try {
      learningService.deleteMaterial(deleteMaterialConfirm.meetingId, deleteMaterialConfirm.material.id);
      loadData();
      toast.success('Materi Dihapus', `Materi "${deleteMaterialConfirm.material.title}" berhasil dihapus.`);
      setDeleteMaterialConfirm({ isOpen: false, meetingId: '', material: null });
    } catch (err: any) {
      toast.danger('Gagal Menghapus Materi', err.message);
    }
  };

  // =========================================================================
  // HANDLERS: RPS (RENCANA PEMBELAJARAN SEMESTER CRUD)
  // =========================================================================

  const handleOpenEditRps = () => {
    const rpsToEdit = rps || DEFAULT_EMPTY_RPS;
    setRpsFormDesc(rpsToEdit.description || '');
    setRpsFormCpmk([...(rpsToEdit.learningOutcomes || [])]);
    setRpsFormMethods([...(rpsToEdit.teachingMethods || [])]);
    setRpsFormCustomMethod('');
    setRpsFormWeights(rpsToEdit.assessmentWeights ? JSON.parse(JSON.stringify(rpsToEdit.assessmentWeights)) : []);
    setRpsFormReferences(rpsToEdit.references ? JSON.parse(JSON.stringify(rpsToEdit.references)) : []);
    setRpsFormDocName(rpsToEdit.documentAttachmentName || `RPS_${classInfo?.code || 'MK'}_${(classInfo?.name || 'MataKuliah').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    setEditRpsTab('deskripsi');
    setEditRpsModal(true);
  };

  const handleSaveRps = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const totalWeight = rpsFormWeights.reduce((sum, w) => sum + (Number(w.weightPercentage) || 0), 0);
      if (totalWeight !== 100) {
        toast.warning(
          'Bobot Penilaian Belum 100%', 
          `Total bobot saat ini ${totalWeight}%. Disarankan menyesuaikan bobot komponen penilaian agar tepat 100%.`
        );
      }

      const updatedRps: RPSSection = {
        description: rpsFormDesc || 'Deskripsi mata kuliah.',
        learningOutcomes: rpsFormCpmk.filter((c) => c.trim().length > 0),
        teachingMethods: rpsFormMethods.filter((m) => m.trim().length > 0),
        assessmentWeights: rpsFormWeights.filter((w) => w.component.trim().length > 0),
        references: rpsFormReferences.filter((r) => r.title.trim().length > 0),
        documentAttachmentName: rpsFormDocName || 'RPS_Resmi_STAI_AlIttihad.pdf',
        documentAttachmentUrl: '#',
        updatedAt: new Date().toISOString()
      };

      learningService.updateRPS(classId, updatedRps);
      setRps(updatedRps);
      toast.success('RPS Diperbarui', 'Rencana Pembelajaran Semester (RPS) berhasil disimpan.');
      setEditRpsModal(false);
    } catch (err: any) {
      toast.danger('Gagal Menyimpan RPS', err.message);
    }
  };

  const handleResetRps = () => {
    try {
      learningService.deleteRPS(classId);
      setRps(DEFAULT_EMPTY_RPS);
      toast.success('RPS Direset', 'Rencana Pembelajaran Semester telah dikembalikan ke template awal.');
      setResetRpsConfirm(false);
    } catch (err: any) {
      toast.danger('Gagal Mereset RPS', err.message);
    }
  };

  // Helper CPMK
  const handleAddCpmk = () => {
    setRpsFormCpmk([...rpsFormCpmk, '']);
  };
  const handleUpdateCpmk = (index: number, val: string) => {
    const updated = [...rpsFormCpmk];
    updated[index] = val;
    setRpsFormCpmk(updated);
  };
  const handleRemoveCpmk = (index: number) => {
    setRpsFormCpmk(rpsFormCpmk.filter((_, i) => i !== index));
  };

  // Helper Methods
  const handleTogglePresetMethod = (method: string) => {
    if (rpsFormMethods.includes(method)) {
      setRpsFormMethods(rpsFormMethods.filter((m) => m !== method));
    } else {
      setRpsFormMethods([...rpsFormMethods, method]);
    }
  };
  const handleAddCustomMethod = () => {
    if (rpsFormCustomMethod.trim() && !rpsFormMethods.includes(rpsFormCustomMethod.trim())) {
      setRpsFormMethods([...rpsFormMethods, rpsFormCustomMethod.trim()]);
      setRpsFormCustomMethod('');
    }
  };

  // Helper Weights
  const handleAddWeight = () => {
    setRpsFormWeights([...rpsFormWeights, { component: 'Komponen Baru', weightPercentage: 10 }]);
  };
  const handleUpdateWeight = (index: number, field: 'component' | 'weightPercentage', value: any) => {
    const updated = [...rpsFormWeights];
    updated[index] = { ...updated[index], [field]: field === 'weightPercentage' ? (parseInt(value) || 0) : value };
    setRpsFormWeights(updated);
  };
  const handleRemoveWeight = (index: number) => {
    setRpsFormWeights(rpsFormWeights.filter((_, i) => i !== index));
  };

  // Helper References
  const handleAddReference = () => {
    setRpsFormReferences([...rpsFormReferences, { title: '', author: '', year: 2026, isPrimary: false }]);
  };
  const handleUpdateReference = (index: number, field: string, value: any) => {
    const updated = [...rpsFormReferences];
    updated[index] = { ...updated[index], [field]: value };
    setRpsFormReferences(updated);
  };
  const handleRemoveReference = (index: number) => {
    setRpsFormReferences(rpsFormReferences.filter((_, i) => i !== index));
  };

  // Reader Open
  const handleOpenMaterial = (mat: LearningMaterial, meetingId: string) => {
    if (mat.type === 'TAUTAN_EKSTERNAL') {
      if (mat.externalUrl) {
        window.open(mat.externalUrl, '_blank');
        toast.info('Tautan Eksternal', `Membuka tautan: ${mat.externalUrl}`);
      } else {
        setSelectedMaterialView(mat);
      }
      return;
    }

    const mtg = meetings.find((m) => m.id === meetingId);
    setReadingOnlineMaterial({
      material: mat,
      meetingId,
      meetingNumber: mtg?.meetingNumber || 1
    });

    if (user && isStudent) {
      learningService.logMaterialAccess(
        mat.id,
        meetingId,
        classId,
        user.id,
        user.identityNumber,
        user.name,
        60
      );
    }
  };

  // =========================================================================
  // CONDITIONAL RENDERING (SETELAH SEMUA HOOK DIEKSEKUSI)
  // =========================================================================

  if (readingOnlineMaterial) {
    return (
      <OnlineModuleReader
        material={readingOnlineMaterial.material}
        classId={classId}
        meetingId={readingOnlineMaterial.meetingId}
        meetingNumber={readingOnlineMaterial.meetingNumber}
        courseName={classInfo?.name || 'Mata Kuliah'}
        onClose={() => setReadingOnlineMaterial(null)}
        onComplete={() => {
          loadData();
          setReadingOnlineMaterial(null);
        }}
      />
    );
  }

  if (activePlayingVideo) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => setActivePlayingVideo(null)}>
            Kembali ke Pertemuan Perkuliahan
          </Button>
          <Badge variant="primary">Video Pembelajaran Interaktif</Badge>
        </div>
        <InteractiveVideoPlayer 
          video={activePlayingVideo} 
          onCompleted={() => {
            loadData();
          }} 
        />
      </div>
    );
  }

  if (!classInfo) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Mata Kuliah
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Data kelas perkuliahan tidak ditemukan.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const currentRps = rps || DEFAULT_EMPTY_RPS;

  return (
    <div className="flex flex-col gap-6">
      {/* =====================================================================
          TOP BREADCRUMB & ACTION BAR
          ===================================================================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke {KAMUS_UI.MATA_KULIAH_SAYA}
        </Button>

        {isLecturer && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={isPreviewMode ? 'primary' : 'outline'}
              size="sm"
              icon={isPreviewMode ? EyeOff : Eye}
              onClick={() => {
                setIsPreviewMode(!isPreviewMode);
                toast.info(
                  'Mode Pratinjau',
                  !isPreviewMode ? 'Melihat tampilan sebagai Mahasiswa' : 'Kembali ke mode Dosen'
                );
              }}
            >
              {isPreviewMode ? 'Keluar Pratinjau' : 'Pratinjau Mahasiswa'}
            </Button>

            {!isPreviewMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  icon={Edit3}
                  onClick={handleOpenEditRps}
                >
                  Kelola RPS
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Plus}
                  onClick={handleOpenCreateMeeting}
                >
                  Tambah Pertemuan
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  icon={Upload}
                  onClick={() => handleOpenCreateMaterial()}
                  title="Unggah Materi ke Pertemuan"
                >
                  Unggah Materi
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* =====================================================================
          HERO CLASS BANNER CARD
          ===================================================================== */}
      <Card style={{ background: 'linear-gradient(135deg, #047857, #065f46)', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(4, 120, 87, 0.25)' }}>
        <CardBody style={{ padding: 'var(--space-6)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent', fontWeight: 'bold' }}>
                  {classInfo.code}
                </Badge>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  {classInfo.credits} SKS
                </Badge>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  Prodi: {classInfo.studyProgramCode}
                </Badge>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  Kelas {classInfo.name}
                </Badge>
              </div>

              <h1 style={{ color: 'white', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)', fontWeight: 'bold' }}>
                {classInfo.courseName || classInfo.name}
              </h1>
              <p style={{ color: '#d1fae5', fontSize: 'var(--text-sm)' }}>
                Dosen Pengampu: <strong>{classInfo.lecturerName}</strong> (NIDN: {classInfo.lecturerNidn || '-'}) • {classInfo.studentCount} Mahasiswa Terdaftar
              </p>
            </div>

            <div style={{ textAlign: 'right' }} className="hidden sm:block">
              <div style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0' }}>Semester Akademik</div>
              <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>{classInfo.academicPeriodName || 'Semester Ganjil 2026/2027'}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0', marginTop: '4px' }}>{meetings.length} Sesi Perkuliahan</div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =====================================================================
          NAVIGATION TABS
          ===================================================================== */}
      <div className="tabs-nav-container pb-2">
        <Button 
          variant={activeTab === 'pertemuan' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('pertemuan')}
        >
          Pertemuan Perkuliahan ({meetings.length})
        </Button>
        <Button 
          variant={activeTab === 'rps' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('rps')}
        >
          Rencana Pembelajaran Semester (RPS)
        </Button>
        <Button 
          variant={activeTab === 'materi' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('materi')}
        >
          Repositori Materi ({allMaterials.length})
        </Button>
      </div>

      {/* =====================================================================
          TAB 1: PERTEMUAN PERKULIAHAN (MEETINGS)
          ===================================================================== */}
      {activeTab === 'pertemuan' && (
        <div className="flex flex-col gap-4">
          {meetings.length === 0 ? (
            <Card>
              <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
                <Layers size={48} style={{ margin: '0 auto var(--space-3)', color: 'var(--text-muted)' }} />
                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-1)' }}>Belum Ada Pertemuan Perkuliahan</h3>
                <p className="text-muted" style={{ marginBottom: 'var(--space-4)', maxWidth: '480px', margin: '0 auto var(--space-4)' }}>
                  {isLecturer && !isPreviewMode 
                    ? 'Buat pertemuan ke-1 untuk mulai mengunggah bahan ajar, modul daring, dan aktivitas belajar mahasiswa.' 
                    : 'Dosen pengampu belum mempublikasikan pertemuan perkuliahan.'}
                </p>
                {isLecturer && !isPreviewMode && (
                  <Button variant="primary" icon={Plus} onClick={handleOpenCreateMeeting}>
                    Tambah Pertemuan Pertama
                  </Button>
                )}
              </CardBody>
            </Card>
          ) : (
            meetings.map((mtg) => (
              <Card key={mtg.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div 
                      style={{ 
                        width: '42px', 
                        height: '42px', 
                        borderRadius: 'var(--radius-md)', 
                        backgroundColor: 'var(--color-primary-50)', 
                        color: 'var(--color-primary-800)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: 'var(--text-sm)',
                        flexShrink: 0
                      }}
                    >
                      #{mtg.meetingNumber}
                    </div>
                    <div>
                      <CardTitle>{mtg.title}</CardTitle>
                      <CardSubtitle>Topik: {mtg.topic || '-'}</CardSubtitle>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={mtg.status === 'DITERBITKAN' ? 'success' : 'warning'}>
                      {mtg.status}
                    </Badge>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={QrCode}
                      onClick={() => onNavigateToAttendance ? onNavigateToAttendance() : handleOpenAttendance(mtg)}
                    >
                      Presensi Sesi
                    </Button>

                    {isLecturer && !isPreviewMode && (
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleTogglePublishMeeting(mtg)}
                          title="Ubah Status Publikasi"
                        >
                          {mtg.status === 'DITERBITKAN' ? 'Tarik ke Draf' : KAMUS_UI.TERBITKAN}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit3}
                          onClick={() => handleOpenEditMeeting(mtg)}
                          title="Edit Pertemuan"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => setDeleteMeetingConfirm({ isOpen: true, meeting: mtg })}
                          title="Hapus Pertemuan"
                          style={{ color: 'var(--color-danger-main)' }}
                        >
                          Hapus
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardBody>
                  {mtg.description && (
                    <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)', color: 'var(--text-secondary)' }}>
                      {mtg.description}
                    </p>
                  )}

                  {/* Attached Materials in this Meeting */}
                  <div>
                    <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        Materi & Bahan Ajar ({mtg.materials.length}):
                      </span>
                      {isLecturer && !isPreviewMode && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          icon={Plus} 
                          onClick={() => handleOpenCreateMaterial(mtg.id)}
                        >
                          Tambah Berkas / Modul
                        </Button>
                      )}
                    </div>

                    {mtg.materials.length === 0 ? (
                      <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Belum ada berkas atau modul untuk sesi ini.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mtg.materials.map((mat) => (
                          <div 
                            key={mat.id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                            style={{
                              padding: 'var(--space-3)',
                              backgroundColor: 'var(--bg-surface)',
                              border: '1px solid var(--border-default)',
                              borderRadius: 'var(--radius-md)',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div style={{ color: 'var(--color-primary-700)', flexShrink: 0 }}>
                                {mat.type === 'MODUL_ONLINE' && <BookOpen size={20} />}
                                {mat.type === 'DOKUMEN_PDF' && <FileText size={20} />}
                                {mat.type === 'PRESENTASI' && <File size={20} />}
                                {mat.type === 'TAUTAN_EKSTERNAL' && <Globe size={20} />}
                                {mat.type === 'TEKS_KONTEN' && <BookOpen size={20} />}
                                {mat.type === 'BUKU_ELEKTRONIK' && <Layers size={20} />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                    {mat.title}
                                  </span>
                                  {mat.type === 'MODUL_ONLINE' && (
                                    <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                      E-Modul Online
                                    </Badge>
                                  )}
                                  {mat.status === 'DRAF' && (
                                    <Badge variant="warning" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                      Draf
                                    </Badge>
                                  )}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                  {mat.type === 'MODUL_ONLINE' ? 'Modul Daring Interaktif' : mat.type.replace('_', ' ')} • {mat.onlineModule ? `Est. ${mat.onlineModule.totalEstimatedMinutes} Menit Baca` : (mat.fileName || mat.externalUrl || 'Teks')}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto justify-end">
                              <Button 
                                variant={mat.type === 'MODUL_ONLINE' || mat.type === 'BUKU_ELEKTRONIK' ? 'primary' : 'outline'} 
                                size="sm" 
                                icon={mat.type === 'BUKU_ELEKTRONIK' ? Layers : (mat.type === 'MODUL_ONLINE' ? BookOpen : Eye)} 
                                onClick={() => handleOpenMaterial(mat, mtg.id)}
                              >
                                {mat.type === 'BUKU_ELEKTRONIK' ? 'Buku Ajar' : (mat.type === 'MODUL_ONLINE' ? 'Baca Modul' : (mat.type === 'DOKUMEN_PDF' ? 'Buka PDF' : (mat.type === 'PRESENTASI' ? 'Buka Slide' : 'Buka')))}
                              </Button>

                              {mat.allowDownload && mat.fileName && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  icon={Download} 
                                  onClick={() => toast.info('Unduh Berkas', `Memulai unduhan: ${mat.fileName}`)}
                                  title={KAMUS_UI.UNDUH}
                                >
                                  Unduh
                                </Button>
                              )}

                              {isLecturer && !isPreviewMode && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Edit3}
                                    onClick={() => handleOpenEditMaterial(mat, mtg.id)}
                                    title="Edit Materi"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    icon={Trash2}
                                    onClick={() => setDeleteMaterialConfirm({ isOpen: true, meetingId: mtg.id, material: mat })}
                                    title="Hapus Materi"
                                    style={{ color: 'var(--color-danger-main)' }}
                                  >
                                    Hapus
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Interactive Videos in this Meeting */}
                  {(() => {
                    const meetingVideos = videoService.getVideosByMeeting(mtg.id, classId, mtg.meetingNumber);
                    if (meetingVideos.length === 0) return null;

                    return (
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            Video Pembelajaran Interaktif ({meetingVideos.length}):
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {meetingVideos.map((vid) => {
                            const studentProg = user ? videoService.getStudentProgress(vid.id, user.id) : null;
                            const isCompleted = studentProg?.isCompleted;

                            return (
                              <div
                                key={vid.id}
                                className="flex justify-between items-center"
                                style={{
                                  padding: 'var(--space-3)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--color-primary-200)',
                                  borderRadius: 'var(--radius-md)',
                                  transition: 'all var(--transition-fast)'
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div style={{ color: 'var(--color-primary-600)' }}>
                                    <PlayCircle size={22} />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                        {vid.title}
                                      </span>
                                      <Badge variant={isCompleted ? 'success' : 'primary'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        {isCompleted ? 'Selesai Ditonton' : 'Video Interaktif'}
                                      </Badge>
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                      Durasi {Math.floor(vid.durationSeconds / 60)} Menit • {vid.checkpoints.length} Titik Pertanyaan • Min. {vid.minWatchedPercentage}% Tontonan
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  variant={isCompleted ? 'secondary' : 'primary'}
                                  size="sm"
                                  icon={PlayCircle}
                                  onClick={() => onNavigateToVideo ? onNavigateToVideo(vid.id) : setActivePlayingVideo(vid)}
                                >
                                  {isCompleted ? 'Tonton Ulang' : 'Tonton Video'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Tugas & Asesmen in this Meeting */}
                  {(() => {
                    const meetingAssignments = assignmentService.getAssignments(classId, effectiveIsStudent)
                      .filter((a) => a.meetingNumber === mtg.meetingNumber);
                    if (meetingAssignments.length === 0) return null;

                    return (
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckSquare size={14} className="text-primary-700" /> Tugas Perkuliahan ({meetingAssignments.length}):
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {meetingAssignments.map((asg) => {
                            const sub = user ? assignmentService.getStudentSubmission(asg.id, user.id) : null;
                            const isDuePassed = new Date() > new Date(asg.dueDate);

                            return (
                              <div
                                key={asg.id}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                                style={{
                                  padding: 'var(--space-3)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-default)',
                                  borderLeft: '4px solid var(--color-primary-600)',
                                  borderRadius: 'var(--radius-md)'
                                }}
                              >
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                      {asg.title}
                                    </span>
                                    {sub ? (
                                      <Badge variant={sub.status === 'SUDAH_DINILAI' ? 'success' : 'primary'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        {sub.status === 'SUDAH_DINILAI' ? `Nilai: ${sub.finalScore}/100` : 'Terkumpul (v' + sub.version + ')'}
                                      </Badge>
                                    ) : (
                                      <Badge variant={isDuePassed ? 'danger' : 'warning'} style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        {isDuePassed ? 'Batas Waktu Lewat' : 'Belum Dikumpulkan'}
                                      </Badge>
                                    )}
                                    {asg.rubric && (
                                      <Badge variant="info" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        Rubrik OBE ({asg.rubric.criteria.length})
                                      </Badge>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span className="flex items-center gap-1">
                                      <Clock size={11} /> Tenggat: {new Date(asg.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} WIB
                                    </span>
                                    <span>• Max Skor: {asg.maxScore}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {isLecturer && !isPreviewMode ? (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      icon={Sparkles}
                                      onClick={() => onNavigateToGrading ? onNavigateToGrading(asg.id) : (onNavigateToAssignment && onNavigateToAssignment(asg.id))}
                                    >
                                      Studio Penilaian
                                    </Button>
                                  ) : (
                                    <Button
                                      variant={sub ? 'secondary' : 'primary'}
                                      size="sm"
                                      icon={CheckSquare}
                                      onClick={() => onNavigateToAssignment && onNavigateToAssignment(asg.id)}
                                    >
                                      {sub ? (sub.status === 'SUDAH_DINILAI' ? 'Lihat Hasil Nilai' : 'Detail Pengumpulan') : 'Kumpulkan Tugas'}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Kuis & Ujian Sesi in this Meeting */}
                  {(() => {
                    const meetingQuizzes = quizService.getQuizzes(classId, effectiveIsStudent)
                      .filter((q) => q.meetingNumber === mtg.meetingNumber);
                    if (meetingQuizzes.length === 0) return null;

                    return (
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <HelpCircle size={14} className="text-warning-600" /> Kuis & Evaluasi Daring ({meetingQuizzes.length}):
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {meetingQuizzes.map((quiz) => {
                            const attempts = user ? quizService.getStudentAttempts(quiz.id, user.id) : [];
                            const lastAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;

                            return (
                              <div
                                key={quiz.id}
                                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                                style={{
                                  padding: 'var(--space-3)',
                                  backgroundColor: 'var(--bg-surface)',
                                  border: '1px solid var(--border-default)',
                                  borderLeft: '4px solid #d97706',
                                  borderRadius: 'var(--radius-md)'
                                }}
                              >
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                      {quiz.title}
                                    </span>
                                    {lastAttempt ? (
                                      <Badge variant="success" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        Skor: {lastAttempt.finalScore}/100 ({lastAttempt.isPassed ? 'Lulus' : 'Belum Lulus'})
                                      </Badge>
                                    ) : (
                                      <Badge variant="warning" style={{ fontSize: '10px', padding: '1px 6px' }}>
                                        {quiz.durationMinutes} Menit ({quiz.questions?.length || 0} Soal)
                                      </Badge>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    KKM Kelulusan: {quiz.passingScore} Poin • Batas Percobaan: {quiz.maxAttempts}x
                                  </div>
                                </div>

                                <Button
                                  variant={lastAttempt ? 'secondary' : 'primary'}
                                  size="sm"
                                  icon={HelpCircle}
                                  onClick={() => onNavigateToQuiz && onNavigateToQuiz(quiz.id)}
                                >
                                  {isLecturer && !isPreviewMode ? 'Kelola Kuis' : lastAttempt ? 'Lihat Hasil Kuis' : 'Mulai Kuis'}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Forum Diskusi in this Meeting */}
                  {(() => {
                    const meetingThreads = forumService.getThreads(classId)
                      .filter((t) => t.meetingNumber === mtg.meetingNumber || t.meetingId === mtg.id);
                    if (meetingThreads.length === 0) return null;

                    return (
                      <div style={{ marginTop: 'var(--space-4)' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MessageSquare size={14} className="text-info-600" /> Forum Diskusi Pertemuan ({meetingThreads.length}):
                          </span>
                        </div>

                        <div className="flex flex-col gap-2">
                          {meetingThreads.map((thr) => (
                            <div
                              key={thr.id}
                              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                              style={{
                                padding: 'var(--space-3)',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-default)',
                                borderLeft: '4px solid #0284c7',
                                borderRadius: 'var(--radius-md)'
                              }}
                            >
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                                    {thr.title}
                                  </span>
                                  {thr.isPinned && <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 6px' }}>Disematkan</Badge>}
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                                  Dimulai oleh {thr.authorName} ({thr.authorRole}) • {thr.totalRepliesCount} Balasan • {thr.viewsCount} Dilihat
                                </div>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                icon={MessageSquare}
                                onClick={() => onNavigateToForum && onNavigateToForum(thr.id)}
                              >
                                Buka Diskusi
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </CardBody>

                <CardFooter>
                  <div className="flex items-center gap-2 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                    <Calendar size={13} />
                    <span>Jadwal: {mtg.scheduledDate || '-'} ({mtg.startTime || '08:00'}–{mtg.endTime || '10:30'} WIB)</span>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* =====================================================================
          TAB 2: RENCANA PEMBELAJARAN SEMESTER (RPS)
          ===================================================================== */}
      {activeTab === 'rps' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Rencana Pembelajaran Semester (RPS)</CardTitle>
                <CardSubtitle>Pedoman kurikulum baku dan panduan pembelajaran terstruktur</CardSubtitle>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => setPrintRpsModal(true)}
                >
                  Cetak / Ekspor RPS
                </Button>

                {currentRps.documentAttachmentName && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    icon={Download} 
                    onClick={() => toast.success('Unduh RPS', `Mengunduh berkas: ${currentRps.documentAttachmentName}`)}
                  >
                    Unduh PDF
                  </Button>
                )}

                {isLecturer && !isPreviewMode && (
                  <>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      icon={Edit3} 
                      onClick={handleOpenEditRps}
                    >
                      Edit RPS
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={() => setResetRpsConfirm(true)}
                      style={{ color: 'var(--color-danger-main)' }}
                      title="Reset RPS"
                    >
                      Reset RPS
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-6">
              {/* 1. Deskripsi Matkul */}
              <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={18} color="var(--color-primary-700)" />
                  1. Deskripsi Mata Kuliah
                </h4>
                <p style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>{currentRps.description}</p>
              </div>

              {/* 2. CPMK */}
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="var(--color-primary-700)" />
                  2. Capaian Pembelajaran Mata Kuliah (CPMK)
                </h4>
                <div className="flex flex-col gap-2">
                  {currentRps.learningOutcomes && currentRps.learningOutcomes.length > 0 ? (
                    currentRps.learningOutcomes.map((cpmk, idx) => (
                      <div 
                        key={idx} 
                        style={{ 
                          padding: 'var(--space-3)', 
                          backgroundColor: 'var(--bg-surface)', 
                          border: '1px solid var(--border-default)', 
                          borderRadius: 'var(--radius-md)', 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '10px' 
                        }}
                      >
                        <Badge variant="primary" style={{ fontSize: '11px', flexShrink: 0 }}>
                          CPMK-{idx + 1}
                        </Badge>
                        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                          {cpmk}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Belum ada butir CPMK yang dirumuskan.</p>
                  )}
                </div>
              </div>

              {/* 3. Metode Pembelajaran */}
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="var(--color-primary-700)" />
                  3. Metode & Pendekatan Pembelajaran
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentRps.teachingMethods && currentRps.teachingMethods.length > 0 ? (
                    currentRps.teachingMethods.map((metode, idx) => (
                      <Badge key={idx} variant="primary" style={{ padding: '6px 12px' }}>{metode}</Badge>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Belum ada metode pembelajaran yang ditentukan.</p>
                  )}
                </div>
              </div>

              {/* 4. Bobot Penilaian */}
              <div>
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                  <h4 style={{ fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} color="var(--color-primary-700)" />
                    4. Komponen & Bobot Penilaian
                  </h4>
                  <Badge variant="success">Total Bobot: 100%</Badge>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                  {currentRps.assessmentWeights && currentRps.assessmentWeights.map((komp, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: 'var(--space-3)', 
                        backgroundColor: 'var(--color-slate-50)', 
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-subtle)' 
                      }}
                    >
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{komp.component}</div>
                      <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
                        {komp.weightPercentage}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Referensi */}
              <div>
                <h4 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookMarked size={18} color="var(--color-primary-700)" />
                  5. Buku Referensi & Kepustakaan
                </h4>
                <div className="flex flex-col gap-2">
                  {currentRps.references && currentRps.references.length > 0 ? (
                    currentRps.references.map((ref, idx) => (
                      <div 
                        key={idx} 
                        className="flex justify-between items-center" 
                        style={{ 
                          fontSize: 'var(--text-sm)', 
                          padding: 'var(--space-3)', 
                          backgroundColor: 'var(--bg-surface)', 
                          border: '1px solid var(--border-default)', 
                          borderRadius: 'var(--radius-md)' 
                        }}
                      >
                        <div>
                          <strong>{ref.title}</strong> — {ref.author} ({ref.year})
                        </div>
                        <Badge variant={ref.isPrimary ? 'primary' : 'default'}>
                          {ref.isPrimary ? 'Rujukan Utama' : 'Pendukung'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Belum ada daftar kepustakaan.</p>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* =====================================================================
          TAB 3: REPOSITORI MATERI (MATERIALS REPOSITORY)
          ===================================================================== */}
      {activeTab === 'materi' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Repositori Materi Perkuliahan</CardTitle>
              <CardSubtitle>Daftar lengkap berkas modul, slide presentasi, buku elektronik, dan rujukan</CardSubtitle>
            </div>

            {isLecturer && !isPreviewMode && (
              <Button variant="primary" size="sm" icon={Plus} onClick={() => handleOpenCreateMaterial()}>
                Unggah Materi Baru
              </Button>
            )}
          </CardHeader>
          <CardBody>
            {/* Filter & Search Repositori */}
            <div className="flex flex-col sm:flex-row gap-3 items-center" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ position: 'relative', flex: 1, width: '100%' }}>
                <Input
                  placeholder="Cari materi berdasarkan judul atau kata kunci..."
                  value={materialSearchQuery}
                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              </div>

              <select
                className="form-select"
                value={materialFilterType}
                onChange={(e) => setMaterialFilterType(e.target.value)}
                style={{ width: 'auto', minWidth: '200px' }}
              >
                <option value="SEMUA">Semua Jenis Materi</option>
                <option value="MODUL_ONLINE">E-Modul Daring</option>
                <option value="DOKUMEN_PDF">Dokumen PDF</option>
                <option value="PRESENTASI">Slide Presentasi</option>
                <option value="BUKU_ELEKTRONIK">Buku Elektronik / Turats</option>
                <option value="TAUTAN_EKSTERNAL">Tautan Eksternal</option>
                <option value="TEKS_KONTEN">Teks Pembelajaran</option>
              </select>

              {(materialSearchQuery || materialFilterType !== 'SEMUA') && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={() => { setMaterialSearchQuery(''); setMaterialFilterType('SEMUA'); }}
                >
                  Reset
                </Button>
              )}
            </div>

            {/* List Materi */}
            <div className="flex flex-col gap-3">
              {filteredAllMaterials.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Tidak ada materi yang sesuai dengan pencarian atau filter.
                </div>
              ) : (
                filteredAllMaterials.map((mat) => (
                  <div 
                    key={mat.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ color: 'var(--color-primary-700)', flexShrink: 0 }}>
                        {mat.type === 'MODUL_ONLINE' && <BookOpen size={22} />}
                        {mat.type === 'DOKUMEN_PDF' && <FileText size={22} />}
                        {mat.type === 'PRESENTASI' && <File size={22} />}
                        {mat.type === 'TAUTAN_EKSTERNAL' && <Globe size={22} />}
                        {mat.type === 'TEKS_KONTEN' && <BookOpen size={22} />}
                        {mat.type === 'BUKU_ELEKTRONIK' && <Layers size={22} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>{mat.title}</span>
                          <Badge variant="default" style={{ fontSize: '10px' }}>
                            Pertemuan #{mat.meetingNumber}
                          </Badge>
                          {mat.type === 'MODUL_ONLINE' && (
                            <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                              E-Modul
                            </Badge>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          {mat.type === 'MODUL_ONLINE' ? 'Modul Daring Interaktif' : (mat.description || mat.type.replace('_', ' '))} • Status: <Badge variant={mat.status === 'DITERBITKAN' ? 'success' : 'warning'}>{mat.status}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1 w-full sm:w-auto justify-end">
                      <Button 
                        variant={mat.type === 'MODUL_ONLINE' || mat.type === 'BUKU_ELEKTRONIK' ? 'primary' : 'outline'} 
                        size="sm" 
                        icon={mat.type === 'BUKU_ELEKTRONIK' ? Layers : (mat.type === 'MODUL_ONLINE' ? BookOpen : Eye)} 
                        onClick={() => handleOpenMaterial(mat, mat.meetingId)}
                      >
                        {mat.type === 'BUKU_ELEKTRONIK' ? 'Buku Ajar' : (mat.type === 'MODUL_ONLINE' ? 'Baca E-Modul' : (mat.type === 'DOKUMEN_PDF' ? 'Buka PDF' : (mat.type === 'PRESENTASI' ? 'Buka Slide' : 'Pelajari')))}
                      </Button>

                      {isLecturer && !isPreviewMode && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Edit3}
                            onClick={() => handleOpenEditMaterial(mat, mat.meetingId)}
                            title="Edit Materi"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Trash2}
                            onClick={() => setDeleteMaterialConfirm({ isOpen: true, meetingId: mat.meetingId, material: mat })}
                            title="Hapus Materi"
                            style={{ color: 'var(--color-danger-main)' }}
                          >
                            Hapus
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>
      )}

      {/* =====================================================================
          MODAL: TAMBAH / EDIT PERTEMUAN
          ===================================================================== */}
      <Modal
        isOpen={meetingModal.isOpen}
        onClose={() => setMeetingModal({ isOpen: false, mode: 'create' })}
        title={meetingModal.mode === 'create' ? 'Tambah Pertemuan Perkuliahan Baru' : 'Edit Sesi Pertemuan Perkuliahan'}
        maxWidth="600px"
      >
        <form onSubmit={handleSaveMeeting} className="flex flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-3)' }}>
            <Input
              label="Pertemuan Ke-"
              type="number"
              value={meetingFormNumber}
              onChange={(e) => setMeetingFormNumber(parseInt(e.target.value) || 1)}
              required
            />
            <Input
              label="Tanggal Pelaksanaan"
              type="date"
              value={meetingFormDate}
              onChange={(e) => setMeetingFormDate(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Jam Mulai"
              type="time"
              value={meetingFormStartTime}
              onChange={(e) => setMeetingFormStartTime(e.target.value)}
            />
            <Input
              label="Jam Selesai"
              type="time"
              value={meetingFormEndTime}
              onChange={(e) => setMeetingFormEndTime(e.target.value)}
            />
          </div>

          <Input
            label="Judul Pertemuan"
            placeholder="Contoh: Kaidah Ushuliyah Istinbath Hukum..."
            value={meetingFormTitle}
            onChange={(e) => setMeetingFormTitle(e.target.value)}
            required
          />

          <Input
            label="Topik Bahasan"
            placeholder="Topik spesifik atau bab pembahasan"
            value={meetingFormTopic}
            onChange={(e) => setMeetingFormTopic(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Deskripsi / Capaian Sesi Perkuliahan</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Jelaskan instruksi belajar, pengantar sesi, dan capaian yang diharapkan..."
              value={meetingFormDesc}
              onChange={(e) => setMeetingFormDesc(e.target.value)}
            />
          </div>

          <Select
            label="Status Publikasi"
            value={meetingFormStatus}
            onChange={(e) => setMeetingFormStatus(e.target.value as PublishStatus)}
            options={[
              { value: 'DITERBITKAN', label: 'Diterbitkan (Langsung terlihat oleh seluruh mahasiswa)' },
              { value: 'DRAF', label: 'Draf (Hanya terlihat oleh dosen pengampu)' },
              { value: 'TERJADWAL', label: 'Terjadwal' },
            ]}
          />

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setMeetingModal({ isOpen: false, mode: 'create' })}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" type="submit">
              {meetingModal.mode === 'create' ? `${KAMUS_UI.SIMPAN} Pertemuan` : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: KONFIRMASI HAPUS PERTEMUAN
          ===================================================================== */}
      <Modal
        isOpen={deleteMeetingConfirm.isOpen}
        onClose={() => setDeleteMeetingConfirm({ isOpen: false, meeting: null })}
        title="Konfirmasi Hapus Pertemuan"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-800)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              Apakah Anda yakin ingin menghapus <strong>Pertemuan #{deleteMeetingConfirm.meeting?.meetingNumber} ({deleteMeetingConfirm.meeting?.title})</strong>?
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Tindakan ini akan menghapus sesi pertemuan beserta seluruh materi pembelajaran dan log aktivitas mahasiswa di dalamnya. Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setDeleteMeetingConfirm({ isOpen: false, meeting: null })}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="danger" type="button" icon={Trash2} onClick={handleDeleteMeeting}>
              Hapus Pertemuan
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: TAMBAH / EDIT MATERI PEMBELAJARAN
          ===================================================================== */}
      <Modal
        isOpen={materialModal.isOpen}
        onClose={() => setMaterialModal({ isOpen: false, mode: 'create', meetingId: null })}
        title={materialModal.mode === 'create' ? 'Unggah / Tambah Materi Pembelajaran' : 'Edit Materi Pembelajaran'}
        maxWidth="680px"
      >
        <form onSubmit={handleSaveMaterial} className="flex flex-col gap-4">
          {meetings.length > 0 && (
            <Select
              label="Pertemuan Target"
              value={materialFormMeetingId}
              onChange={(e) => setMaterialFormMeetingId(e.target.value)}
              options={meetings.map((m) => ({
                value: m.id,
                label: `Pertemuan #${m.meetingNumber} — ${m.title}`
              }))}
            />
          )}

          <Input
            label="Judul Materi"
            placeholder="Contoh: Modul Kaidah Fiqhiyyah & Istinbath Hukum..."
            value={materialFormTitle}
            onChange={(e) => setMaterialFormTitle(e.target.value)}
            required
          />

          <Select
            label="Tipe Materi Pembelajaran"
            value={materialFormType}
            onChange={(e) => setMaterialFormType(e.target.value as MaterialType)}
            options={[
              { value: 'MODUL_ONLINE', label: 'Modul Pembelajaran Daring (E-Modul Interaktif)' },
              { value: 'DOKUMEN_PDF', label: 'Dokumen PDF / E-Book' },
              { value: 'PRESENTASI', label: 'Slide Presentasi (PPT/PPTX)' },
              { value: 'BUKU_ELEKTRONIK', label: 'Buku Ajar / Kitab Turats Elektronik' },
              { value: 'TAUTAN_EKSTERNAL', label: 'Tautan Eksternal (Website / Jurnal / Drive)' },
              { value: 'TEKS_KONTEN', label: 'Teks Pembelajaran Langsung' },
            ]}
          />

          {/* Form Kondisional berdasarkan Tipe Materi */}
          {materialFormType === 'MODUL_ONLINE' ? (
            <div className="flex flex-col gap-3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
                Konfigurasi E-Modul Pembelajaran Daring:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <Input
                  label="Penulis / Penyusun Modul"
                  value={modulAuthor}
                  onChange={(e) => setModulAuthor(e.target.value)}
                />
                <Input
                  label="Estimasi Menit Membaca"
                  type="number"
                  value={modulEstMinutes}
                  onChange={(e) => setModulEstMinutes(parseInt(e.target.value) || 15)}
                />
              </div>

              <Input
                label="Judul Bab 1"
                placeholder="Contoh: Definisi, Rukun, dan Dalil Pokok"
                value={modulChapterTitle}
                onChange={(e) => setModulChapterTitle(e.target.value)}
                required
              />

              <div className="form-group">
                <label className="form-label">Naskah Pembelajaran Bab 1 (Markdown / Teks)</label>
                <textarea
                  className="form-textarea"
                  rows={5}
                  placeholder="Tulis naskah bahan ajar, penjelasan konsep, dalil, dan petunjuk belajar..."
                  value={modulChapterContent}
                  onChange={(e) => setModulChapterContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Poin-Poin Penting (Key Takeaways)</label>
                <Input
                  placeholder="Poin penting pertama..."
                  value={modulKeyTakeaways[0] || ''}
                  onChange={(e) => setModulKeyTakeaways([e.target.value])}
                />
              </div>

              {/* Kutipan Arab & Turats */}
              <div style={{ borderTop: '1px dashed var(--border-default)', paddingTop: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Kutipan Teks Arab / Dalil Syar'i (Opsional):
                </div>
                <Input
                  label="Teks Bahasa Arab"
                  placeholder="Teks Arab..."
                  value={modulArabicText}
                  onChange={(e) => setModulArabicText(e.target.value)}
                  style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'serif' }}
                />
                <Input
                  label="Terjemahan Bahasa Indonesia"
                  placeholder="Arti terjemahan..."
                  value={modulArabicTranslation}
                  onChange={(e) => setModulArabicTranslation(e.target.value)}
                />
                <Input
                  label="Sumber Rujukan Kitab / Hadits"
                  placeholder="Contoh: Kitab Ar-Risalah hal. 45"
                  value={modulArabicSource}
                  onChange={(e) => setModulArabicSource(e.target.value)}
                />
              </div>

              {/* Studi Kasus */}
              <div style={{ borderTop: '1px dashed var(--border-default)', paddingTop: 'var(--space-2)' }}>
                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Studi Kasus Interaktif (Opsional):
                </div>
                <Input
                  label="Judul Studi Kasus"
                  placeholder="Contoh: Transaksi E-Wallet Modern"
                  value={modulCaseTitle}
                  onChange={(e) => setModulCaseTitle(e.target.value)}
                />
                <div className="form-group">
                  <label className="form-label">Skenario Masalah</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Deskripsi skenario masalah..."
                    value={modulCaseScenario}
                    onChange={(e) => setModulCaseScenario(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Panduan Analisis Mahasiswa</label>
                  <textarea
                    className="form-textarea"
                    rows={2}
                    placeholder="Instruksi analisis..."
                    value={modulCaseAnalysis}
                    onChange={(e) => setModulCaseAnalysis(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : materialFormType === 'TAUTAN_EKSTERNAL' ? (
            <Input
              label="URL Tautan Eksternal"
              placeholder="https://..."
              value={materialFormExternalUrl}
              onChange={(e) => setMaterialFormExternalUrl(e.target.value)}
              required
            />
          ) : materialFormType === 'TEKS_KONTEN' ? (
            <div className="form-group">
              <label className="form-label">Isi Teks Pembelajaran</label>
              <textarea
                className="form-textarea"
                rows={6}
                placeholder="Tulis artikel atau materi lengkap di sini..."
                value={materialFormText}
                onChange={(e) => setMaterialFormText(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                label="Nama Berkas Dokumen"
                placeholder={materialFormType === 'PRESENTASI' ? 'Slide_Materi.pptx' : 'Modul_Ajar.pdf'}
                value={materialFormFileName}
                onChange={(e) => setMaterialFormFileName(e.target.value)}
                helperText="Simulasi berkas edukasi: format PDF / PPTX tervalidasi sistem."
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Deskripsi / Petunjuk Belajar</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Petunjuk belajar bagi mahasiswa..."
              value={materialFormDesc}
              onChange={(e) => setMaterialFormDesc(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Select
              label="Status Publikasi"
              value={materialFormStatus}
              onChange={(e) => setMaterialFormStatus(e.target.value as PublishStatus)}
              options={[
                { value: 'DITERBITKAN', label: 'Diterbitkan (Terlihat Mahasiswa)' },
                { value: 'DRAF', label: 'Draf (Hanya Dosen)' },
              ]}
            />

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <label className="form-label" style={{ marginBottom: '8px' }}>Izin Unduh Mahasiswa</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={materialFormAllowDownload}
                  onChange={(e) => setMaterialFormAllowDownload(e.target.checked)}
                />
                <span>Izinkan mahasiswa mengunduh berkas</span>
              </label>
            </div>
          </div>

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setMaterialModal({ isOpen: false, mode: 'create', meetingId: null })}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" type="submit" icon={Upload}>
              {materialModal.mode === 'create' ? `${KAMUS_UI.UNGGAH} Materi` : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: KONFIRMASI HAPUS MATERI
          ===================================================================== */}
      <Modal
        isOpen={deleteMaterialConfirm.isOpen}
        onClose={() => setDeleteMaterialConfirm({ isOpen: false, meetingId: '', material: null })}
        title="Konfirmasi Hapus Materi"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-800)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              Apakah Anda yakin ingin menghapus materi <strong>"{deleteMaterialConfirm.material?.title}"</strong>?
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Materi ini akan dihapus dari repositori perkuliahan dan tidak dapat diakses lagi oleh mahasiswa.
          </p>
          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setDeleteMaterialConfirm({ isOpen: false, meetingId: '', material: null })}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="danger" type="button" icon={Trash2} onClick={handleDeleteMaterial}>
              Hapus Materi
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: KELOLA / EDIT RPS LENGKAP
          ===================================================================== */}
      <Modal
        isOpen={editRpsModal}
        onClose={() => setEditRpsModal(false)}
        title={`Kelola Rencana Pembelajaran Semester (RPS) — ${classInfo.name}`}
        maxWidth="780px"
      >
        <form onSubmit={handleSaveRps} className="flex flex-col gap-4">
          {/* Sub-tabs RPS Editor */}
          <div className="tabs-nav-container pb-1" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <Button
              variant={editRpsTab === 'deskripsi' ? 'primary' : 'ghost'}
              size="sm"
              type="button"
              onClick={() => setEditRpsTab('deskripsi')}
            >
              1. Deskripsi
            </Button>
            <Button
              variant={editRpsTab === 'cpmk' ? 'primary' : 'ghost'}
              size="sm"
              type="button"
              onClick={() => setEditRpsTab('cpmk')}
            >
              2. CPMK ({rpsFormCpmk.length})
            </Button>
            <Button
              variant={editRpsTab === 'metode' ? 'primary' : 'ghost'}
              size="sm"
              type="button"
              onClick={() => setEditRpsTab('metode')}
            >
              3. Metode ({rpsFormMethods.length})
            </Button>
            <Button
              variant={editRpsTab === 'penilaian' ? 'primary' : 'ghost'}
              size="sm"
              type="button"
              onClick={() => setEditRpsTab('penilaian')}
            >
              4. Bobot Penilaian
            </Button>
            <Button
              variant={editRpsTab === 'referensi' ? 'primary' : 'ghost'}
              size="sm"
              type="button"
              onClick={() => setEditRpsTab('referensi')}
            >
              5. Referensi ({rpsFormReferences.length})
            </Button>
          </div>

          {/* TAB 1: DESKRIPSI */}
          {editRpsTab === 'deskripsi' && (
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Deskripsi Lengkap Mata Kuliah</label>
                <textarea
                  className="form-textarea"
                  rows={6}
                  placeholder="Uraikan deskripsi umum, ruang lingkup kajian, dan urgensi mata kuliah..."
                  value={rpsFormDesc}
                  onChange={(e) => setRpsFormDesc(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Nama Lampiran Berkas Dokumen RPS Resmi"
                placeholder="RPS_Ushul_Fiqih_PAI301_2026.pdf"
                value={rpsFormDocName}
                onChange={(e) => setRpsFormDocName(e.target.value)}
                helperText="Nama file dokumen RPS kurikulum standar institusi."
              />
            </div>
          )}

          {/* TAB 2: CPMK */}
          {editRpsTab === 'cpmk' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                  Daftar Capaian Pembelajaran Mata Kuliah (CPMK):
                </span>
                <Button variant="secondary" size="sm" type="button" icon={Plus} onClick={handleAddCpmk}>
                  Tambah CPMK
                </Button>
              </div>

              {rpsFormCpmk.map((cpmkText, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Badge variant="primary" style={{ flexShrink: 0 }}>CPMK-{idx + 1}</Badge>
                  <input
                    className="form-input"
                    placeholder={`Capaian pembelajaran butir ke-${idx + 1}...`}
                    value={cpmkText}
                    onChange={(e) => handleUpdateCpmk(idx, e.target.value)}
                    required
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    icon={Trash2}
                    onClick={() => handleRemoveCpmk(idx)}
                    style={{ color: 'var(--color-danger-main)' }}
                  >
                    Hapus
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: METODE */}
          {editRpsTab === 'metode' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label" style={{ marginBottom: 'var(--space-2)' }}>Pilih Metode & Pendekatan Pembelajaran:</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TEACHING_METHODS.map((method) => {
                    const isSelected = rpsFormMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleTogglePresetMethod(method)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: 'var(--text-xs)',
                          border: isSelected ? '1px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                          backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                          color: isSelected ? 'var(--color-primary-800)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSelected && <Check size={12} />}
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2" style={{ marginTop: 'var(--space-2)' }}>
                <Input
                  placeholder="Tambahkan metode pembelajaran lainnya..."
                  value={rpsFormCustomMethod}
                  onChange={(e) => setRpsFormCustomMethod(e.target.value)}
                />
                <Button variant="secondary" size="sm" type="button" icon={Plus} onClick={handleAddCustomMethod}>
                  Tambah
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: BOBOT PENILAIAN */}
          {editRpsTab === 'penilaian' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                  Komponen & Persentase Bobot Evaluasi:
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={totalRpsWeight === 100 ? 'success' : 'warning'}>
                    Total: {totalRpsWeight}% {totalRpsWeight === 100 ? '(Ideal)' : '(Belum 100%)'}
                  </Badge>
                  <Button variant="secondary" size="sm" type="button" icon={Plus} onClick={handleAddWeight}>
                    Tambah Komponen
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {rpsFormWeights.map((w, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr auto', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <input
                      className="form-input"
                      placeholder="Nama komponen penilaian..."
                      value={w.component}
                      onChange={(e) => handleUpdateWeight(idx, 'component', e.target.value)}
                      required
                    />
                    <div style={{ position: 'relative' }}>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        max="100"
                        placeholder="Bobot %"
                        value={w.weightPercentage}
                        onChange={(e) => handleUpdateWeight(idx, 'weightPercentage', e.target.value)}
                        required
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '10px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      icon={Trash2}
                      onClick={() => handleRemoveWeight(idx)}
                      style={{ color: 'var(--color-danger-main)' }}
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REFERENSI */}
          {editRpsTab === 'referensi' && (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                  Daftar Pustaka & Buku Rujukan:
                </span>
                <Button variant="secondary" size="sm" type="button" icon={Plus} onClick={handleAddReference}>
                  Tambah Referensi
                </Button>
              </div>

              <div className="flex flex-col gap-3">
                {rpsFormReferences.map((ref, idx) => (
                  <div key={idx} style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr auto', gap: 'var(--space-2)' }}>
                      <Input
                        label="Judul Buku / Karya"
                        placeholder="Judul buku..."
                        value={ref.title}
                        onChange={(e) => handleUpdateReference(idx, 'title', e.target.value)}
                        required
                      />
                      <Input
                        label="Penulis / Pengarang"
                        placeholder="Nama pengarang..."
                        value={ref.author}
                        onChange={(e) => handleUpdateReference(idx, 'author', e.target.value)}
                        required
                      />
                      <Input
                        label="Tahun"
                        type="number"
                        value={ref.year}
                        onChange={(e) => handleUpdateReference(idx, 'year', parseInt(e.target.value) || 2026)}
                      />
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          icon={Trash2}
                          onClick={() => handleRemoveReference(idx)}
                          style={{ color: 'var(--color-danger-main)', marginBottom: '8px' }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={ref.isPrimary}
                        onChange={(e) => handleUpdateReference(idx, 'isPrimary', e.target.checked)}
                      />
                      <span>Tandai sebagai Rujukan Utama (Primary Reference)</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setEditRpsModal(false)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" type="submit">
              Simpan Dokumen RPS
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: KONFIRMASI RESET RPS
          ===================================================================== */}
      <Modal
        isOpen={resetRpsConfirm}
        onClose={() => setResetRpsConfirm(false)}
        title="Konfirmasi Reset RPS"
        maxWidth="480px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3" style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-800)' }}>
            <AlertTriangle size={24} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: 'var(--text-sm)' }}>
              Apakah Anda yakin ingin mereset/mengosongkan dokumen RPS kelas <strong>{classInfo.name}</strong>?
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Pengaturan RPS akan dikembalikan ke template awal.
          </p>
          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setResetRpsConfirm(false)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="danger" type="button" icon={Trash2} onClick={handleResetRps}>
              Reset RPS Sekarang
            </Button>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: CETAK / EKSPOR DOKUMEN RPS RESMI
          ===================================================================== */}
      <Modal
        isOpen={printRpsModal}
        onClose={() => setPrintRpsModal(false)}
        title="Pratinjau Cetak RPS Resmi STAI AL-ITTIHAD"
        maxWidth="820px"
        footer={
          <div className="flex justify-between items-center w-full">
            <Button variant="secondary" onClick={() => setPrintRpsModal(false)}>
              Tutup
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Cetak Dokumen RPS
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-6" style={{ padding: 'var(--space-4)', backgroundColor: 'white', color: '#1f2937' }}>
          {/* Official Letterhead */}
          <div style={{ textAlign: 'center', borderBottom: '3px double #1f2937', paddingBottom: 'var(--space-3)' }}>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--text-lg)', letterSpacing: '0.05em' }}>
              SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: '#4b5563' }}>
              PUSAT PENGEMBANGAN KURIKULUM & PEMBELAJARAN DIGITAL (SALAM LMS)
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: '#6b7280' }}>
              Jl. Raya Bandung No. 123, Ciranjang, Cianjur, Jawa Barat 43282
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: 'var(--text-base)', textTransform: 'uppercase', fontWeight: 'bold', textDecoration: 'underline' }}>
              RENCANA PEMBELAJARAN SEMESTER (RPS)
            </h3>
            <div style={{ fontSize: 'var(--text-xs)', color: '#4b5563' }}>
              Tahun Akademik: 2026/2027 — Semester Ganjil
            </div>
          </div>

          {/* Metadata Table */}
          <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 8px', fontWeight: 'bold', width: '25%', backgroundColor: '#f9fafb' }}>Mata Kuliah</td>
                <td style={{ padding: '6px 8px', width: '75%' }}>{classInfo.courseName || classInfo.name} ({classInfo.code})</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Bobot SKS / Prodi</td>
                <td style={{ padding: '6px 8px' }}>{classInfo.credits} SKS / Program Studi {classInfo.studyProgramCode}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '6px 8px', fontWeight: 'bold', backgroundColor: '#f9fafb' }}>Dosen Pengampu</td>
                <td style={{ padding: '6px 8px' }}>{classInfo.lecturerName} (NIDN: {classInfo.lecturerNidn || '-'})</td>
              </tr>
            </tbody>
          </table>

          {/* Deskripsi */}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>A. Deskripsi Mata Kuliah</div>
            <p style={{ fontSize: 'var(--text-xs)', textAlign: 'justify', lineHeight: 1.6 }}>{currentRps.description}</p>
          </div>

          {/* CPMK */}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>B. Capaian Pembelajaran Mata Kuliah (CPMK)</div>
            <ol style={{ paddingLeft: '20px', fontSize: 'var(--text-xs)', lineHeight: 1.6 }}>
              {currentRps.learningOutcomes?.map((cpmk, i) => (
                <li key={i}>{cpmk}</li>
              ))}
            </ol>
          </div>

          {/* Bobot */}
          <div>
            <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>C. Asesmen & Bobot Penilaian</div>
            <table style={{ width: '100%', fontSize: 'var(--text-xs)', borderCollapse: 'collapse', border: '1px solid #d1d5db' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px' }}>No</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'left' }}>Komponen Penilaian</th>
                  <th style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right' }}>Bobot (%)</th>
                </tr>
              </thead>
              <tbody>
                {currentRps.assessmentWeights?.map((w, i) => (
                  <tr key={i}>
                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', width: '40px' }}>{i + 1}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '6px' }}>{w.component}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'right', fontWeight: 'bold' }}>{w.weightPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)', marginTop: 'var(--space-6)', fontSize: 'var(--text-xs)', textAlign: 'center' }}>
            <div>
              <div>Mengetahui,</div>
              <div style={{ fontWeight: 'bold' }}>Ketua Program Studi</div>
              <div style={{ height: '60px' }}></div>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Dr. H. Ahmad Fauzi, M.Pd.I</div>
              <div>NIDN: 21098501</div>
            </div>
            <div>
              <div>Cianjur, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              <div style={{ fontWeight: 'bold' }}>Dosen Pengampu Mata Kuliah</div>
              <div style={{ height: '60px' }}></div>
              <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{classInfo.lecturerName}</div>
              <div>NIDN: {classInfo.lecturerNidn || '-'}</div>
            </div>
          </div>
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: PRATINJAU MATERI (VIEWER)
          ===================================================================== */}
      <Modal
        isOpen={!!selectedMaterialView}
        onClose={() => setSelectedMaterialView(null)}
        title={selectedMaterialView?.title || 'Pratinjau Materi'}
        maxWidth="720px"
        footer={
          <Button variant="primary" onClick={() => setSelectedMaterialView(null)}>
            Tutup Pratinjau
          </Button>
        }
      >
        {selectedMaterialView && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{selectedMaterialView.type.replace('_', ' ')}</Badge>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {selectedMaterialView.fileName || 'Konten Edukasi'}
              </span>
            </div>

            {selectedMaterialView.description && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {selectedMaterialView.description}
              </p>
            )}

            <div 
              style={{ 
                padding: 'var(--space-6)', 
                backgroundColor: 'var(--color-slate-50)', 
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                minHeight: '200px'
              }}
            >
              {selectedMaterialView.type === 'TEKS_KONTEN' ? (
                <div style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
                  {selectedMaterialView.textContent}
                </div>
              ) : selectedMaterialView.type === 'TAUTAN_EKSTERNAL' ? (
                <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ padding: 'var(--space-6)' }}>
                  <Globe size={32} color="var(--color-primary-700)" />
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)' }}>Tautan Sumber Eksternal</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{selectedMaterialView.externalUrl}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    icon={ExternalLink} 
                    onClick={() => window.open(selectedMaterialView.externalUrl, '_blank')}
                  >
                    Buka Tautan di Tab Baru
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ padding: 'var(--space-6)' }}>
                  <FileText size={40} color="var(--color-primary-700)" />
                  <div>
                    <h4 style={{ fontSize: 'var(--text-base)' }}>{selectedMaterialView.fileName}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Dokumen pembelajaran resmi STAI AL-ITTIHAD (Ukuran: 2.5 MB)
                    </p>
                  </div>
                  <Button 
                    variant="primary" 
                    icon={Download} 
                    onClick={() => toast.success('Unduh Berhasil', `Berkas ${selectedMaterialView.fileName} mulai diunduh.`)}
                  >
                    {KAMUS_UI.UNDUH} Berkas Dokumen
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Dynamic QR Modal */}
      {activeAttendanceMeeting && attendanceSessionData && (
        <DynamicQrModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          meetingNumber={activeAttendanceMeeting.meetingNumber}
          meetingTitle={activeAttendanceMeeting.title}
          courseName={classInfo.courseName || classInfo.name}
          className={classInfo.name}
          qrToken={attendanceSessionData.session?.qrToken || ''}
          passcode={attendanceSessionData.session?.passcode || '849201'}
          attendancePercentage={attendanceSessionData.summary?.attendancePercentage || 0}
          presentCount={attendanceSessionData.summary?.countHadir || 0}
          totalStudents={attendanceSessionData.summary?.totalStudents || 0}
          onRefreshQr={handleRefreshQrInClass}
          onCloseSession={handleCloseAttendanceInClass}
        />
      )}

      {/* Student Attendance Modal */}
      {activeAttendanceMeeting && (
        <StudentAttendanceModal
          isOpen={isStudentAttendanceModalOpen}
          onClose={() => setIsStudentAttendanceModalOpen(false)}
          meetingId={activeAttendanceMeeting.id}
          meetingNumber={activeAttendanceMeeting.meetingNumber}
          meetingTitle={activeAttendanceMeeting.title}
          courseName={classInfo.courseName || classInfo.name}
          className={classInfo.name}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
