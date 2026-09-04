import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  BookmarkCheck,
  Sun, 
  Moon, 
  Coffee, 
  Maximize2, 
  Minimize2, 
  Award,
  Sparkles,
  Trash2,
  Save,
  Download,
  Search,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
  Info,
  Menu,
  X,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import { LearningMaterial, ModuleChapter, ModuleNote } from '../../types/learning';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { learningService } from '../../services/learningService';
import { progressService, CLASS_ACTIVITIES } from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface OnlineModuleReaderProps {
  material: LearningMaterial;
  classId: string;
  meetingId: string;
  courseName?: string;
  meetingNumber?: number;
  onClose: () => void;
  onComplete?: () => void;
}

type ReaderTheme = 'light' | 'sepia' | 'dark';
type FontSize = 'sm' | 'md' | 'lg' | 'xl';

export const OnlineModuleReader: React.FC<OnlineModuleReaderProps> = ({
  material,
  classId,
  meetingId,
  courseName = 'Ushul Fiqih & Qawaid Fiqhiyyah',
  meetingNumber = 1,
  onClose,
  onComplete
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const moduleData = material.onlineModule;

  const getInitialChapters = (): ModuleChapter[] => {
    if (material.onlineModule?.chapters && material.onlineModule.chapters.length > 0) {
      return material.onlineModule.chapters;
    }

    if (material.type === 'BUKU_ELEKTRONIK' || material.type === 'DOKUMEN_PDF') {
      return [
        {
          id: `ch-${material.id}-01`,
          chapterNumber: 1,
          title: `Pengantar & Rangkuman Eksekutif: ${material.title}`,
          estimatedMinutes: 8,
          content: `${material.description || 'Buku ajar dan diktat referensi perkuliahan resmi STAI AL-ITTIHAD.'}\n\nDokumen ini menyajikan kerangka teoritis, kajian komparatif ulama madzhab, dan pedoman implementasi praktis yang dirancang untuk mendukung capaian pembelajaran mahasiswa pada sesi ke-${meetingNumber}.\n\nSilakan gunakan daftar isi di sebelah kiri untuk menavigasi setiap bagian pokok bahasan, menambahkan catatan pribadi, atau mendengarkan narasi audio pembaca otomatis.`,
          keyTakeaways: [
            'Pahami struktur konsep dan definisi kunci yang diuraikan dalam naskah ini.',
            'Hubungkan kajian literatur dengan rujukan kitab turats primer pada silabus RPS.'
          ]
        },
        {
          id: `ch-${material.id}-02`,
          chapterNumber: 2,
          title: 'Pembahasan Utama & Analisis Kaidah',
          estimatedMinutes: 12,
          content: `Naskah Buku Ajar: ${material.title}\n\nKajian mendalam mencakup:\n1. Landasan normatif dan dalil syar'i rujukan (Al-Qur'an dan As-Sunnah as-Shahihah).\n2. Kaidah-kaidah analisis metodologis (Manhaj al-Istinbath).\n3. Pendekatan kontekstual dalam menjawab problematika hukum dan pendidikan kontemporer.\n\nMahasiswa diharapkan membaca secara seksama dan menandai istilah-istilah penting menggunakan fitur Catatan Belajar.`,
          arabicQuotes: [
            {
              arabicText: 'طَلَبُ العِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
              translation: 'Menuntut ilmu itu adalah kewajiban bagi setiap muslim.',
              source: 'HR. Ibnu Majah No. 224 (Shahih)'
            }
          ],
          keyTakeaways: [
            'Kuasai metodologi istinbath hukum dan dalil-dalil penguatnya.',
            'Gunakan fitur pencarian untuk menemukan kata kunci penting dalam naskah.'
          ]
        },
        {
          id: `ch-${material.id}-03`,
          chapterNumber: 3,
          title: 'Kesimpulan, Diskusi Akademik & Rujukan Lanjutan',
          estimatedMinutes: 6,
          content: `Rangkuman Akhir Dokumen:\n\nPembelajaran modul ini menekankan integrasi antara keilmuan Islam klasik (turats) dengan tuntutan zaman modern secara moderat dan berkeadaban.\n\nTugas Tindak Lanjut:\n• Buat catatan intisari materi di panel samping.\n• Diskusikan topik ini pada forum diskusi kelas.\n• Unduh berkas dokumen asli jika ingin menyimpan salinan offline.`,
          keyTakeaways: [
            'Selesaikan evaluasi membaca untuk mencatat progres belajar di Buku Nilai.',
            'Konsultasikan pertanyaan materi kepada dosen pengampu di forum diskusi.'
          ]
        }
      ];
    }

    return [
      {
        id: 'ch-default-1',
        chapterNumber: 1,
        title: material.title,
        estimatedMinutes: 10,
        content: material.textContent || material.description || 'Konten dokumen pembelajaran daring.',
        keyTakeaways: ['Pahami konsep utama materi perkuliahan dengan saksama.']
      }
    ];
  };

  const chapters: ModuleChapter[] = getInitialChapters();

  // Reader State
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [readChapters, setReadChapters] = useState<Record<string, boolean>>({});
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [theme, setTheme] = useState<ReaderTheme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('md');
  const [zoomScale, setZoomScale] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf_embed'>('interactive');
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Responsive device state
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState<boolean>(false);

  // Active Reading Timer
  const [activeDurationSeconds, setActiveDurationSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Mobile Touch Swipe Handling
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Student Notes
  const [notesModalOpen, setNotesModalOpen] = useState<boolean>(false);
  const [bookmarksModalOpen, setBookmarksModalOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<ModuleNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>('');

  const currentChapter = chapters[currentChapterIndex] || chapters[0];
  const isStudent = user?.role === 'mahasiswa';
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Window Resize Listener for Responsive Adaptation
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load existing notes and initial state
  useEffect(() => {
    if (user) {
      const savedNotes = learningService.getModuleNotes(material.id, user.id);
      setNotes(savedNotes);
    }

    if (currentChapter) {
      setReadChapters((prev) => ({ ...prev, [currentChapter.id]: true }));
    }
  }, [material.id, user]);

  // Active reading timer effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActiveDurationSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  // Sync reading log periodically every 30s
  useEffect(() => {
    if (activeDurationSeconds > 0 && activeDurationSeconds % 30 === 0 && user && isStudent) {
      learningService.logMaterialAccess(
        material.id,
        meetingId,
        classId,
        user.id,
        user.identityNumber,
        user.name,
        30
      );
    }
  }, [activeDurationSeconds, material.id, meetingId, classId, user, isStudent]);

  // Text-To-Speech (Audio Reader)
  const toggleAudioNarration = () => {
    if (!('speechSynthesis' in window)) {
      toast.warning('Fitur Tidak Didukung', 'Browser Anda tidak mendukung Web Speech Synthesis.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      toast.info('Audio Dijeda', 'Narasi audio pembaca dihentikan.');
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${currentChapter.title}. ${currentChapter.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      toast.success('Audio Pembaca Aktif', `Membacakan Bab ${currentChapter.chapterNumber}: ${currentChapter.title}`);
    }
  };

  const toggleBookmark = (chapterId: string) => {
    setBookmarks((prev) => {
      const next = { ...prev, [chapterId]: !prev[chapterId] };
      if (next[chapterId]) {
        toast.success('Penanda Disimpan', 'Halaman ini telah ditandai ke daftar penanda bacaan Anda.');
      } else {
        toast.info('Penanda Dihapus', 'Halaman ini dihapus dari daftar penanda bacaan.');
      }
      return next;
    });
  };

  // Calculate Progress Percentage
  const completedChaptersCount = Object.values(readChapters).filter(Boolean).length;
  const progressPercentage = Math.round((completedChaptersCount / chapters.length) * 100);

  const handleSelectChapter = (index: number) => {
    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setCurrentChapterIndex(index);
    const targetChapter = chapters[index];
    if (targetChapter) {
      setReadChapters((prev) => ({ ...prev, [targetChapter.id]: true }));
    }
    const readerElement = document.getElementById('module-reader-content');
    if (readerElement) {
      readerElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      handleSelectChapter(currentChapterIndex + 1);
    }
  };

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      handleSelectChapter(currentChapterIndex - 1);
    }
  };

  // Zoom scale controls
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 15, 70));
  };

  const handleResetZoom = () => {
    setZoomScale(100);
  };

  // Mobile Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    touchEndXRef.current = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndXRef.current;

    // Minimum swipe threshold 60px
    if (diffX > 60) {
      handleNextChapter();
    } else if (diffX < -60) {
      handlePrevChapter();
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleMarkAsCompleted = () => {
    setIsCompleted(true);
    const allRead: Record<string, boolean> = {};
    chapters.forEach((c) => { allRead[c.id] = true; });
    setReadChapters(allRead);

    if (user && isStudent) {
      // 1. Log access duration
      learningService.logMaterialAccess(
        material.id,
        meetingId,
        classId,
        user.id,
        user.identityNumber,
        user.name,
        Math.max(120, activeDurationSeconds)
      );

      // 2. Synchronize with Progress Service (Fase 9 Rule)
      try {
        const currentActivity = CLASS_ACTIVITIES.find(
          (a) => a.resourceId === material.id || (a.meetingId === meetingId && a.type === 'MATERI')
        );
        if (currentActivity && currentActivity.rule.allowManualOverride) {
          progressService.toggleManualProgress(currentActivity.id, user.id, user.name);
        }
      } catch (e) {
        console.warn('Progress sync warning:', e);
      }
    }

    toast.success(
      'Materi Selesai Dipelajari',
      `Alhamdulillah! Anda telah menuntaskan pembelajaran "${material.title}". Progres belajar telah diperbarui di sistem.`
    );

    if (onComplete) {
      onComplete();
    }
  };

  const handleSaveNote = () => {
    if (!newNoteText.trim() || !user) return;

    const newNote = learningService.saveModuleNote({
      materialId: material.id,
      studentId: user.id,
      chapterId: currentChapter.id,
      chapterNumber: currentChapter.chapterNumber,
      noteText: newNoteText.trim()
    });

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteText('');
    toast.success('Catatan Tersimpan', 'Catatan pembelajaran berhasil disimpan.');
  };

  const handleDeleteNote = (noteId: string) => {
    learningService.deleteModuleNote(noteId);
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    toast.info('Catatan Dihapus', 'Catatan belajar telah dihapus.');
  };

  const handleExportNotes = () => {
    if (notes.length === 0) {
      toast.warning('Belum Ada Catatan', 'Anda belum memiliki catatan belajar untuk materi ini.');
      return;
    }
    const content = `SALAM LMS - STAI AL-ITTIHAD\nRINGKASAN CATATAN BELAJAR MAHASISWA\n\nMata Kuliah: ${courseName}\nMateri: ${material.title}\nMahasiswa: ${user?.name || 'Mahasiswa'} (${user?.identityNumber || '-'})\nWaktu Ekspor: ${new Date().toLocaleString('id-ID')}\n\n=========================================\n\n` + 
      notes.map((n, i) => `[${i + 1}] Bab ${n.chapterNumber} (${new Date(n.createdAt).toLocaleDateString('id-ID')}):\n${n.noteText}\n`).join('\n-----------------------------------------\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Catatan_${material.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Unduh Ringkasan', 'Berkas catatan belajar berhasil diunduh.');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getThemeStyles = () => {
    switch (theme) {
      case 'sepia':
        return {
          backgroundColor: '#fbf0d9',
          color: '#433422',
          borderColor: '#e6d5b8',
          sidebarBg: '#f4e5c8',
          cardBg: '#fffaf0',
          arabicBg: '#f7edd7',
          quoteBorder: '#c29b38'
        };
      case 'dark':
        return {
          backgroundColor: '#0f172a',
          color: '#e2e8f0',
          borderColor: '#1e293b',
          sidebarBg: '#0b1120',
          cardBg: '#1e293b',
          arabicBg: '#162238',
          quoteBorder: '#059669'
        };
      case 'light':
      default:
        return {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          borderColor: '#e2e8f0',
          sidebarBg: '#f8fafc',
          cardBg: '#ffffff',
          arabicBg: '#ecfdf5',
          quoteBorder: '#059669'
        };
    }
  };

  const getFontSizeStyles = () => {
    switch (fontSize) {
      case 'sm': return { fontSize: '0.875rem', lineHeight: '1.6' };
      case 'lg': return { fontSize: '1.125rem', lineHeight: '1.8' };
      case 'xl': return { fontSize: '1.25rem', lineHeight: '1.9' };
      case 'md':
      default: return { fontSize: '1rem', lineHeight: '1.75' };
    }
  };

  const themeStyles = getThemeStyles();
  const fontStyles = getFontSizeStyles();

  const filteredChapters = chapters.filter(c => 
    !searchQuery.trim() || 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="online-module-reader-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: '88vh',
        backgroundColor: themeStyles.backgroundColor,
        color: themeStyles.color,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-xl)',
        border: `1px solid ${themeStyles.borderColor}`,
        transition: 'background-color 0.25s ease, color 0.25s ease'
      }}
    >
      {/* =========================================================================
          RESPONSIVE HEADER TOOLBAR
          ========================================================================= */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          padding: isMobile ? 'var(--space-3)' : 'var(--space-3) var(--space-5)',
          backgroundColor: themeStyles.sidebarBg,
          borderBottom: `1px solid ${themeStyles.borderColor}`,
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        {/* Top Row: Navigation, Title & Primary Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div className="flex items-center gap-2" style={{ minWidth: 0, flex: 1 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              icon={ArrowLeft} 
              onClick={onClose}
              style={{ color: themeStyles.color, padding: isMobile ? '6px 8px' : undefined }}
            >
              {!isMobile && KAMUS_UI.KEMBALI}
            </Button>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Badge variant="primary" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  Pertemuan #{meetingNumber}
                </Badge>
                <Badge variant="default" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  {material.type === 'BUKU_ELEKTRONIK' ? 'Buku Ajar' : material.type === 'DOKUMEN_PDF' ? 'PDF' : material.type === 'PRESENTASI' ? 'Slide' : 'Modul'}
                </Badge>
                {!isMobile && (
                  <span style={{ fontSize: 'var(--text-xs)', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {courseName}
                  </span>
                )}
              </div>
              <h2 
                style={{ 
                  fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-base)', 
                  fontWeight: 'bold', 
                  margin: '2px 0 0 0', 
                  color: themeStyles.color,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                title={material.title}
              >
                {material.title}
              </h2>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Mobile View: Quick Tools Settings Button */}
            {isMobile ? (
              <Button
                variant="outline"
                size="sm"
                icon={SlidersHorizontal}
                onClick={() => setIsToolsModalOpen(true)}
                style={{ color: themeStyles.color, borderColor: themeStyles.borderColor, padding: '6px 10px' }}
                title="Pengaturan Tampilan & Alat Baca"
              >
                Alat
              </Button>
            ) : (
              /* Desktop View: Full Inline Toolbar Controls */
              <>
                {/* View Mode Toggle for PDF/Book */}
                {(material.type === 'DOKUMEN_PDF' || material.type === 'BUKU_ELEKTRONIK') && (
                  <div 
                    className="flex items-center" 
                    style={{ 
                      backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(0,0,0,0.05)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '2px' 
                    }}
                  >
                    <button
                      onClick={() => setViewMode('interactive')}
                      style={{
                        background: viewMode === 'interactive' ? 'var(--color-primary-600)' : 'transparent',
                        color: viewMode === 'interactive' ? '#ffffff' : 'inherit',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title="Tampilan Pembaca E-Book Interaktif"
                    >
                      E-Book
                    </button>
                    <button
                      onClick={() => setViewMode('pdf_embed')}
                      style={{
                        background: viewMode === 'pdf_embed' ? 'var(--color-primary-600)' : 'transparent',
                        color: viewMode === 'pdf_embed' ? '#ffffff' : 'inherit',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                      title="Tampilan Pratinjau Dokumen Asli"
                    >
                      Dokumen Asli
                    </button>
                  </div>
                )}

                {/* Audio Narrator Button */}
                <Button
                  variant={isSpeaking ? 'primary' : 'outline'}
                  size="sm"
                  icon={isSpeaking ? VolumeX : Volume2}
                  onClick={toggleAudioNarration}
                  style={{ color: isSpeaking ? '#ffffff' : themeStyles.color, borderColor: themeStyles.borderColor }}
                  title={isSpeaking ? 'Hentikan Suara Audio' : 'Dengarkan Audio Pembaca Otomatis'}
                >
                  {isSpeaking ? 'Jeda Audio' : 'Dengar Audio'}
                </Button>

                {/* Bookmarks Quick Button */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={BookmarkCheck}
                  onClick={() => setBookmarksModalOpen(true)}
                  style={{ color: themeStyles.color, borderColor: themeStyles.borderColor }}
                  title="Daftar Halaman Ditandai"
                >
                  Penanda ({Object.values(bookmarks).filter(Boolean).length})
                </Button>

                {/* Notes Quick Button */}
                <Button
                  variant="outline"
                  size="sm"
                  icon={Bookmark}
                  onClick={() => setNotesModalOpen(true)}
                  style={{ color: themeStyles.color, borderColor: themeStyles.borderColor }}
                  title="Catatan Belajar & Ringkasan"
                >
                  Catatan ({notes.length})
                </Button>

                {/* Download Document Button */}
                {material.allowDownload && material.fileName && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => toast.success('Unduh Berkas', `Mengunduh berkas asli: ${material.fileName}`)}
                    style={{ color: themeStyles.color, borderColor: themeStyles.borderColor }}
                    title="Unduh Berkas Asli Dokumen"
                  >
                    Unduh
                  </Button>
                )}

                {/* Themes Selector */}
                <div 
                  className="flex items-center"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(0,0,0,0.05)', 
                    borderRadius: 'var(--radius-md)',
                    padding: '2px'
                  }}
                >
                  <button
                    onClick={() => setTheme('light')}
                    style={{
                      background: theme === 'light' ? '#ffffff' : 'transparent',
                      color: theme === 'light' ? '#0f172a' : 'inherit',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Mode Terang"
                  >
                    <Sun size={14} />
                  </button>
                  <button
                    onClick={() => setTheme('sepia')}
                    style={{
                      background: theme === 'sepia' ? '#c29b38' : 'transparent',
                      color: theme === 'sepia' ? '#ffffff' : 'inherit',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Mode Sepia (Kertas Turats)"
                  >
                    <Coffee size={14} />
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    style={{
                      background: theme === 'dark' ? '#334155' : 'transparent',
                      color: theme === 'dark' ? '#ffffff' : 'inherit',
                      border: 'none',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Mode Gelap"
                  >
                    <Moon size={14} />
                  </button>
                </div>

                {/* Font Size Selector */}
                <div 
                  className="flex items-center"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(0,0,0,0.05)', 
                    borderRadius: 'var(--radius-md)',
                    padding: '2px'
                  }}
                >
                  <button
                    onClick={() => setFontSize('sm')}
                    style={{
                      background: fontSize === 'sm' ? (theme === 'dark' ? '#334155' : '#ffffff') : 'transparent',
                      color: 'inherit',
                      border: 'none',
                      padding: '3px 7px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Ukuran Teks Kecil"
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setFontSize('md')}
                    style={{
                      background: fontSize === 'md' ? (theme === 'dark' ? '#334155' : '#ffffff') : 'transparent',
                      color: 'inherit',
                      border: 'none',
                      padding: '3px 7px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Ukuran Teks Sedang"
                  >
                    A
                  </button>
                  <button
                    onClick={() => setFontSize('lg')}
                    style={{
                      background: fontSize === 'lg' ? (theme === 'dark' ? '#334155' : '#ffffff') : 'transparent',
                      color: 'inherit',
                      border: 'none',
                      padding: '3px 7px',
                      fontSize: '15px',
                      fontWeight: 'bold',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Ukuran Teks Besar"
                  >
                    A+
                  </button>
                </div>

                {/* Zoom In & Zoom Out Controls */}
                <div 
                  className="flex items-center"
                  style={{ 
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(0,0,0,0.05)', 
                    borderRadius: 'var(--radius-md)',
                    padding: '2px'
                  }}
                >
                  <button
                    onClick={handleZoomOut}
                    style={{
                      background: 'transparent',
                      color: 'inherit',
                      border: 'none',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Perkecil Ukuran Halaman (-15%)"
                  >
                    <ZoomOut size={14} />
                  </button>
                  <span 
                    onClick={handleResetZoom}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      padding: '0 4px', 
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                    title="Klik untuk Mereset Skala ke 100%"
                  >
                    {zoomScale}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    style={{
                      background: 'transparent',
                      color: 'inherit',
                      border: 'none',
                      padding: '4px 6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                    title="Perbesar Ukuran Halaman (+15%)"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>

                {/* Fullscreen / Focus Mode */}
                <Button
                  variant="ghost"
                  size="sm"
                  icon={isFocusMode ? Minimize2 : Maximize2}
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  style={{ color: themeStyles.color }}
                  title={isFocusMode ? 'Keluar Mode Fokus' : 'Mode Layar Penuh Fokus'}
                >
                  {isFocusMode ? 'Normal' : 'Fokus'}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Second Row for Mobile / Compact bar: Chapter Drawer Trigger & Progress Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <div className="flex items-center gap-2">
            {/* Mobile / Tablet: Button to Open Chapter Drawer */}
            {(isMobile || isTablet) && (
              <Button
                variant="outline"
                size="sm"
                icon={Menu}
                onClick={() => setIsMobileSidebarOpen(true)}
                style={{ 
                  color: themeStyles.color, 
                  borderColor: themeStyles.borderColor,
                  fontSize: '11px',
                  padding: '4px 10px'
                }}
              >
                Daftar Isi ({currentChapterIndex + 1}/{chapters.length})
              </Button>
            )}

            <div 
              className="flex items-center gap-1.5"
              style={{
                padding: '3px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: theme === 'dark' ? '#1e293b' : 'rgba(0,0,0,0.05)',
                fontSize: '11px',
                fontWeight: 600
              }}
              title="Waktu aktif membaca materi sesi ini"
            >
              <Clock size={12} color="var(--color-primary-600)" />
              <span>Waktu: {formatTimer(activeDurationSeconds)}</span>
            </div>
          </div>

          {/* Reading Progress Indicator */}
          <div className="flex items-center gap-2" style={{ minWidth: isMobile ? '110px' : '150px', flex: isMobile ? 1 : 'none', justifyContent: 'flex-end' }}>
            <div 
              style={{ 
                flex: 1, 
                maxWidth: isMobile ? '100px' : '120px',
                height: '6px', 
                backgroundColor: theme === 'dark' ? '#334155' : '#cbd5e1', 
                borderRadius: '3px',
                overflow: 'hidden' 
              }}
            >
              <div 
                style={{ 
                  width: `${progressPercentage}%`, 
                  height: '100%', 
                  backgroundColor: 'var(--color-success-main)',
                  transition: 'width 0.3s ease'
                }} 
              />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 'bold', minWidth: '32px', textAlign: 'right' }}>
              {progressPercentage}%
            </span>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN READER BODY (SIDEBAR DAFTAR ISI + KONTEN BACA)
          ========================================================================= */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* DESKTOP SIDEBAR: DAFTAR ISI / BAB */}
        {!isFocusMode && !isMobile && (
          <aside
            style={{
              width: '300px',
              minWidth: '260px',
              backgroundColor: themeStyles.sidebarBg,
              borderRight: `1px solid ${themeStyles.borderColor}`,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              padding: 'var(--space-4)'
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Daftar Isi & Struktur
              </span>
              <span style={{ fontSize: 'var(--text-xs)', opacity: 0.7 }}>
                {chapters.length} Bab
              </span>
            </div>

            {/* In-Document Search Bar */}
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  style={{
                    paddingLeft: '32px',
                    fontSize: 'var(--text-xs)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    color: themeStyles.color,
                    borderColor: themeStyles.borderColor
                  }}
                  placeholder="Cari kata kunci dalam materi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', opacity: 0.5 }} />
              </div>
              {searchQuery && (
                <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Ditemukan pada {filteredChapters.length} bagian</span>
                  <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setSearchQuery('')}>Reset</span>
                </div>
              )}
            </div>

            {/* Author / Edition Info */}
            {moduleData?.author && (
              <div 
                style={{ 
                  padding: 'var(--space-2) var(--space-3)', 
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff', 
                  borderRadius: 'var(--radius-md)', 
                  border: `1px solid ${themeStyles.borderColor}`,
                  fontSize: 'var(--text-xs)',
                  marginBottom: 'var(--space-3)'
                }}
              >
                <div style={{ fontWeight: 'bold', color: themeStyles.color }}>Penyusun / Referensi:</div>
                <div style={{ opacity: 0.85 }}>{moduleData.author}</div>
                {moduleData.totalEstimatedMinutes && (
                  <div style={{ marginTop: '4px', color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} /> Est. {moduleData.totalEstimatedMinutes} Menit Baca
                  </div>
                )}
              </div>
            )}

            {/* Chapters List */}
            <div className="flex flex-col gap-2" style={{ flex: 1 }}>
              {filteredChapters.map((ch) => {
                const originalIndex = chapters.findIndex(c => c.id === ch.id);
                const isActive = originalIndex === currentChapterIndex;
                const isRead = !!readChapters[ch.id];
                const isBookmarked = !!bookmarks[ch.id];

                return (
                  <div
                    key={ch.id}
                    onClick={() => handleSelectChapter(originalIndex)}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer',
                      backgroundColor: isActive 
                        ? (theme === 'dark' ? '#1e293b' : (theme === 'sepia' ? '#eed6ad' : '#ecfdf5'))
                        : 'transparent',
                      border: `1px solid ${isActive ? 'var(--color-primary-600)' : 'transparent'}`,
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div style={{ marginTop: '2px', color: isRead ? 'var(--color-success-main)' : 'var(--text-muted)' }}>
                      {isRead ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div className="flex justify-between items-center" style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.7 }}>
                        <span>BAB {ch.chapterNumber}</span>
                        {isBookmarked && (
                          <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Bookmark size={11} fill="#d97706" /> Ditandai
                          </span>
                        )}
                      </div>
                      <div 
                        style={{ 
                          fontSize: 'var(--text-xs)', 
                          fontWeight: isActive ? 'bold' : 'normal',
                          color: isActive ? 'var(--color-primary-700)' : 'inherit',
                          lineHeight: 1.4
                        }}
                      >
                        {ch.title}
                      </div>
                      <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
                        {ch.estimatedMinutes} menit
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Completion Button in Sidebar */}
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: `1px solid ${themeStyles.borderColor}` }}>
              <Button
                variant={isCompleted ? 'secondary' : 'primary'}
                size="sm"
                icon={CheckCircle2}
                onClick={handleMarkAsCompleted}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isCompleted ? 'Materi Telah Tuntas' : 'Tandai Selesai Membaca'}
              </Button>
            </div>
          </aside>
        )}

        {/* MOBILE SLIDE-OVER DRAWER (DAFTAR ISI UNTUK SMARTPHONE/TABLET) */}
        {isMobileSidebarOpen && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(0,0,0,0.6)',
              display: 'flex',
              backdropFilter: 'blur(4px)'
            }}
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <div
              style={{
                width: '85%',
                maxWidth: '340px',
                height: '100%',
                backgroundColor: themeStyles.sidebarBg,
                color: themeStyles.color,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-2xl)',
                padding: 'var(--space-4)',
                overflowY: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-2)', borderBottom: `1px solid ${themeStyles.borderColor}` }}>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} color="var(--color-primary-600)" />
                  <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>Daftar Isi Modul</span>
                </div>
                <Button variant="ghost" size="sm" icon={X} onClick={() => setIsMobileSidebarOpen(false)}>
                  Tutup
                </Button>
              </div>

              {/* Mobile Search */}
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <input
                  className="form-input"
                  style={{
                    fontSize: 'var(--text-xs)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
                    color: themeStyles.color,
                    borderColor: themeStyles.borderColor,
                    width: '100%'
                  }}
                  placeholder="Cari kata kunci materi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Chapter Items */}
              <div className="flex flex-col gap-2" style={{ flex: 1 }}>
                {filteredChapters.map((ch) => {
                  const originalIndex = chapters.findIndex(c => c.id === ch.id);
                  const isActive = originalIndex === currentChapterIndex;
                  const isRead = !!readChapters[ch.id];
                  const isBookmarked = !!bookmarks[ch.id];

                  return (
                    <div
                      key={ch.id}
                      onClick={() => {
                        handleSelectChapter(originalIndex);
                        setIsMobileSidebarOpen(false);
                      }}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        backgroundColor: isActive 
                          ? (theme === 'dark' ? '#1e293b' : '#ecfdf5')
                          : 'transparent',
                        border: `1px solid ${isActive ? 'var(--color-primary-600)' : 'transparent'}`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 'var(--space-2)'
                      }}
                    >
                      <div style={{ marginTop: '2px', color: isRead ? 'var(--color-success-main)' : 'var(--text-muted)' }}>
                        {isRead ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div className="flex justify-between items-center" style={{ fontSize: '11px', fontWeight: 'bold', opacity: 0.7 }}>
                          <span>BAB {ch.chapterNumber}</span>
                          {isBookmarked && (
                            <span style={{ color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Bookmark size={11} fill="#d97706" /> Ditandai
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: isActive ? 'bold' : 'normal', color: isActive ? 'var(--color-primary-700)' : 'inherit' }}>
                          {ch.title}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: `1px solid ${themeStyles.borderColor}` }}>
                <Button
                  variant={isCompleted ? 'secondary' : 'primary'}
                  size="sm"
                  icon={CheckCircle2}
                  onClick={() => {
                    handleMarkAsCompleted();
                    setIsMobileSidebarOpen(false);
                  }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isCompleted ? 'Materi Selesai' : 'Tandai Selesai Membaca'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main
          id="module-reader-content"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile 
              ? 'var(--space-4) var(--space-4) var(--space-16) var(--space-4)' 
              : isFocusMode 
                ? 'var(--space-8) var(--space-12)' 
                : 'var(--space-6) var(--space-8)',
            maxWidth: isFocusMode ? '960px' : '900px',
            margin: '0 auto',
            width: '100%',
            transform: `scale(${zoomScale / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            ...fontStyles
          }}
        >
          {viewMode === 'pdf_embed' ? (
            /* Mode Dokumen PDF Langsung */
            <div className="flex flex-col gap-4" style={{ height: '100%', minHeight: '560px' }}>
              <div 
                style={{ 
                  padding: 'var(--space-4)', 
                  backgroundColor: themeStyles.cardBg, 
                  borderRadius: 'var(--radius-lg)', 
                  border: `1px solid ${themeStyles.borderColor}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 'var(--space-2)'
                }}
              >
                <div>
                  <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', margin: 0 }}>
                    {material.fileName || `${material.title}.pdf`}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Pratinjau Dokumen Asli Resmi STAI AL-ITTIHAD (Aman & Terenkripsi)
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('interactive')}
                >
                  Beralih ke Tampilan E-Book
                </Button>
              </div>

              <div 
                style={{ 
                  flex: 1, 
                  minHeight: '480px', 
                  backgroundColor: theme === 'dark' ? '#0f172a' : '#475569', 
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-6)',
                  color: '#ffffff',
                  textAlign: 'center'
                }}
              >
                <div style={{ maxWidth: '460px' }} className="flex flex-col items-center gap-3">
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', margin: 0 }}>
                    Penampil Dokumen Asli Terintegrasi
                  </h4>
                  <p style={{ fontSize: 'var(--text-xs)', opacity: 0.9, lineHeight: 1.6 }}>
                    Dokumen siap dibaca secara langsung tanpa mengunduh berkas ke perangkat Anda. Gunakan mode <strong>E-Book Interaktif</strong> untuk navigasi per bab dengan tata letak optimal di layar smartphone dan tablet.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setViewMode('interactive')}
                  >
                    Buka Versi E-Book Interaktif
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Chapter Header Card */}
              <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: `2px solid ${themeStyles.borderColor}` }}>
                <div className="flex items-center justify-between flex-wrap gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">
                      BAB {currentChapter.chapterNumber} DARI {chapters.length}
                    </Badge>
                    {bookmarks[currentChapter.id] && (
                      <Badge variant="warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Bookmark size={11} fill="currentColor" /> Halaman Ditandai
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Bookmark}
                      onClick={() => toggleBookmark(currentChapter.id)}
                      style={{ color: bookmarks[currentChapter.id] ? '#d97706' : 'inherit' }}
                    >
                      {bookmarks[currentChapter.id] ? 'Hapus Penanda' : 'Tandai Halaman'}
                    </Button>

                    <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', opacity: 0.8 }}>
                      <Clock size={13} />
                      <span>{currentChapter.estimatedMinutes} menit baca</span>
                    </div>
                  </div>
                </div>

                <h1 
                  style={{ 
                    fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)', 
                    fontWeight: 'bold', 
                    color: theme === 'dark' ? '#38bdf8' : (theme === 'sepia' ? '#78350f' : 'var(--color-primary-800)'),
                    margin: 'var(--space-2) 0',
                    lineHeight: 1.3
                  }}
                >
                  {currentChapter.title}
                </h1>
              </div>

              {/* Key Takeaways Box (if available) */}
              {currentChapter.keyTakeaways && currentChapter.keyTakeaways.length > 0 && (
                <div
                  style={{
                    padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-4) var(--space-5)',
                    backgroundColor: theme === 'dark' ? '#162032' : (theme === 'sepia' ? '#f4e5c8' : '#f0fdf4'),
                    borderLeft: `4px solid ${themeStyles.quoteBorder}`,
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--space-6)'
                  }}
                >
                  <div className="flex items-center gap-2" style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--color-primary-700)' }}>
                    <Sparkles size={16} />
                    <span>Poin Kunci Capaian Pembelajaran Bab Ini:</span>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                    {currentChapter.keyTakeaways.map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Chapter Main Formatted Text */}
              <div 
                className="module-text-body"
                style={{ 
                  whiteSpace: 'pre-line', 
                  marginBottom: 'var(--space-6)',
                  textAlign: 'justify',
                  fontFamily: theme === 'sepia' ? "'Georgia', 'Merriweather', 'Cambria', serif" : 'inherit'
                }}
              >
                {currentChapter.content}
              </div>

              {/* Arabic Quotes & Turats Box (if available) */}
              {currentChapter.arabicQuotes && currentChapter.arabicQuotes.length > 0 && (
                <div className="flex flex-col gap-4" style={{ marginBottom: 'var(--space-6)' }}>
                  {currentChapter.arabicQuotes.map((q, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
                        backgroundColor: themeStyles.arabicBg,
                        border: `1px solid ${themeStyles.borderColor}`,
                        borderRight: `4px solid ${themeStyles.quoteBorder}`,
                        borderRadius: 'var(--radius-lg)'
                      }}
                    >
                      <div 
                        style={{ 
                          fontSize: isMobile ? '1.25rem' : '1.45rem', 
                          fontFamily: "'Traditional Arabic', 'Scheherazade New', 'Amiri', serif",
                          direction: 'rtl',
                          textAlign: 'right',
                          lineHeight: '2.3',
                          marginBottom: 'var(--space-3)',
                          color: theme === 'dark' ? '#a7f3d0' : '#065f46'
                        }}
                      >
                        {q.arabicText}
                      </div>

                      <div style={{ fontSize: 'var(--text-sm)', fontStyle: 'italic', marginBottom: 'var(--space-2)', opacity: 0.9 }}>
                        "{q.translation}"
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-600)', textAlign: 'right' }}>
                        — {q.source}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Case Study / Analisis Kasus Fiqih Kontemporer (if available) */}
              {currentChapter.caseStudy && (
                <div
                  style={{
                    padding: isMobile ? 'var(--space-4)' : 'var(--space-5)',
                    backgroundColor: theme === 'dark' ? '#1e293b' : (theme === 'sepia' ? '#fffaf0' : '#f8fafc'),
                    border: `1px solid ${themeStyles.borderColor}`,
                    borderRadius: 'var(--radius-xl)',
                    marginBottom: 'var(--space-6)'
                  }}
                >
                  <div className="flex items-center gap-2" style={{ color: '#d97706', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>
                    <Award size={18} />
                    <span>Studi Kasus & Aplikasi Kontemporer: {currentChapter.caseStudy.title}</span>
                  </div>

                  <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>
                    {currentChapter.caseStudy.scenario}
                  </p>

                  <div 
                    style={{ 
                      padding: 'var(--space-3)', 
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#f1f5f9', 
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-xs)'
                    }}
                  >
                    <strong>Panduan Analisis Mahasiswa:</strong> {currentChapter.caseStudy.analysisGuide}
                  </div>
                </div>
              )}

              {/* In-page Chapter Bottom Navigation for Desktop & Tablet */}
              {!isMobile && (
                <div 
                  style={{ 
                    marginTop: 'var(--space-8)', 
                    paddingTop: 'var(--space-6)', 
                    borderTop: `1px solid ${themeStyles.borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 'var(--space-3)'
                  }}
                >
                  <Button
                    variant="outline"
                    icon={ChevronLeft}
                    disabled={currentChapterIndex === 0}
                    onClick={handlePrevChapter}
                    style={{ color: themeStyles.color, borderColor: themeStyles.borderColor }}
                  >
                    Bab Sebelumnya
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={isCompleted ? 'secondary' : 'primary'}
                      icon={CheckCircle2}
                      onClick={handleMarkAsCompleted}
                    >
                      {isCompleted ? 'Telah Diselesaikan' : 'Tandai Selesai Membaca'}
                    </Button>

                    {currentChapterIndex < chapters.length - 1 ? (
                      <Button
                        variant="primary"
                        icon={ChevronRight}
                        onClick={handleNextChapter}
                      >
                        Bab Berikutnya
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        icon={CheckCircle2}
                        onClick={onClose}
                      >
                        Selesai & Tutup Pembaca
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =========================================================================
          STICKY MOBILE BOTTOM NAVIGATION BAR (KHUSUS SMARTPHONE)
          ========================================================================= */}
      {isMobile && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            padding: 'var(--space-2) var(--space-3)',
            backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: `1px solid ${themeStyles.borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)'
          }}
        >
          <Button
            variant="outline"
            size="sm"
            icon={ChevronLeft}
            disabled={currentChapterIndex === 0}
            onClick={handlePrevChapter}
            style={{ padding: '6px 8px', fontSize: '11px', color: themeStyles.color }}
            title="Bab Sebelumnya"
          >
            Prev
          </Button>

          <Button
            variant={isCompleted ? 'secondary' : 'primary'}
            size="sm"
            icon={CheckCircle2}
            onClick={handleMarkAsCompleted}
            style={{ fontSize: '11px', padding: '6px 10px', flex: 1, justifyContent: 'center' }}
          >
            {isCompleted ? 'Tuntas' : 'Selesai Baca'}
          </Button>

          {currentChapterIndex < chapters.length - 1 ? (
            <Button
              variant="primary"
              size="sm"
              icon={ChevronRight}
              onClick={handleNextChapter}
              style={{ padding: '6px 8px', fontSize: '11px' }}
              title="Bab Berikutnya"
            >
              Next
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              onClick={onClose}
              style={{ padding: '6px 8px', fontSize: '11px' }}
            >
              Tutup
            </Button>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL PENGATURAN & ALAT BACA LENGKAP (MOBILE & DESKTOP TOOLS)
          ========================================================================= */}
      <Modal
        isOpen={isToolsModalOpen}
        onClose={() => setIsToolsModalOpen(false)}
        title="Pengaturan & Alat Membaca"
        maxWidth="500px"
        footer={
          <Button variant="primary" onClick={() => setIsToolsModalOpen(false)}>
            Selesai & Lanjut Membaca
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          {/* View Mode */}
          {(material.type === 'DOKUMEN_PDF' || material.type === 'BUKU_ELEKTRONIK') && (
            <div>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                Mode Tampilan Dokumen
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={viewMode === 'interactive' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('interactive')}
                >
                  E-Book Interaktif
                </Button>
                <Button
                  variant={viewMode === 'pdf_embed' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('pdf_embed')}
                >
                  Dokumen PDF Asli
                </Button>
              </div>
            </div>
          )}

          {/* Theme Selector */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Tema Warna Kertas / Layar
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={theme === 'light' ? 'primary' : 'outline'}
                size="sm"
                icon={Sun}
                onClick={() => setTheme('light')}
              >
                Terang
              </Button>
              <Button
                variant={theme === 'sepia' ? 'primary' : 'outline'}
                size="sm"
                icon={Coffee}
                onClick={() => setTheme('sepia')}
              >
                Sepia
              </Button>
              <Button
                variant={theme === 'dark' ? 'primary' : 'outline'}
                size="sm"
                icon={Moon}
                onClick={() => setTheme('dark')}
              >
                Gelap
              </Button>
            </div>
          </div>

          {/* Font Size Selector */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Ukuran Huruf Teks
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['sm', 'md', 'lg', 'xl'] as FontSize[]).map((sz) => (
                <Button
                  key={sz}
                  variant={fontSize === sz ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFontSize(sz)}
                >
                  {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Sedang' : sz === 'lg' ? 'Besar' : 'Sangat Besar'}
                </Button>
              ))}
            </div>
          </div>

          {/* Zoom Scaling */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Skala Halaman ({zoomScale}%)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" icon={ZoomOut} onClick={handleZoomOut}>
                Perkecil
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom}>
                100%
              </Button>
              <Button variant="outline" size="sm" icon={ZoomIn} onClick={handleZoomIn}>
                Perbesar
              </Button>
            </div>
          </div>

          {/* Audio Narrator */}
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Pembaca Suara Otomatis (Text-to-Speech)
            </label>
            <Button
              variant={isSpeaking ? 'primary' : 'outline'}
              size="sm"
              icon={isSpeaking ? VolumeX : Volume2}
              onClick={toggleAudioNarration}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSpeaking ? 'Hentikan Narasi Suara' : 'Dengarkan Bacaan Bab Ini'}
            </Button>
          </div>

          {/* Quick Shortcuts to Notes & Bookmarks */}
          <div className="grid grid-cols-2 gap-2" style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-default)' }}>
            <Button
              variant="outline"
              size="sm"
              icon={BookmarkCheck}
              onClick={() => {
                setIsToolsModalOpen(false);
                setBookmarksModalOpen(true);
              }}
            >
              Penanda ({Object.values(bookmarks).filter(Boolean).length})
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Bookmark}
              onClick={() => {
                setIsToolsModalOpen(false);
                setNotesModalOpen(true);
              }}
            >
              Catatan ({notes.length})
            </Button>
          </div>

          {/* Download Original File */}
          {material.allowDownload && material.fileName && (
            <Button
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => {
                toast.success('Unduh Berkas', `Mengunduh berkas asli: ${material.fileName}`);
                setIsToolsModalOpen(false);
              }}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Unduh Berkas Asli Dokumen
            </Button>
          )}
        </div>
      </Modal>

      {/* =========================================================================
          MODAL CATATAN BELAJAR & RINGKASAN MAHASISWA
          ========================================================================= */}
      <Modal
        isOpen={notesModalOpen}
        onClose={() => setNotesModalOpen(false)}
        title={`Catatan Belajar: ${material.title}`}
        maxWidth="650px"
        footer={
          <Button variant="secondary" onClick={() => setNotesModalOpen(false)}>
            {KAMUS_UI.TUTUP}
          </Button>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-muted" style={{ fontSize: 'var(--text-xs)' }}>
            <div className="flex items-center gap-2">
              <Info size={14} />
              <span>Catatan ini disimpan secara privat di akun Anda untuk membantu reviu pembelajaran.</span>
            </div>
            {notes.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={handleExportNotes}
                title="Unduh semua catatan sebagai berkas teks"
              >
                Unduh Catatan (.txt)
              </Button>
            )}
          </div>

          {/* New Note Form */}
          <div 
            style={{ 
              padding: 'var(--space-4)', 
              backgroundColor: 'var(--color-slate-50)', 
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                Tulis Catatan untuk Bab {currentChapter.chapterNumber}: {currentChapter.title}
              </span>
            </div>

            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Tuliskan poin penting, pemahaman, atau pertanyaan telaah kitab yang Anda dapatkan..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              style={{ width: '100%', marginBottom: 'var(--space-2)' }}
            />

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                disabled={!newNoteText.trim()}
                onClick={handleSaveNote}
              >
                Simpan Catatan
              </Button>
            </div>
          </div>

          {/* Saved Notes List */}
          <div>
            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: 'var(--space-2)' }}>
              Catatan Tersimpan ({notes.length})
            </h4>

            {notes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                Belum ada catatan yang ditulis untuk materi ini.
              </div>
            ) : (
              <div className="flex flex-col gap-2" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div className="flex justify-between items-center" style={{ marginBottom: '4px' }}>
                      <Badge variant="primary" style={{ fontSize: '10px' }}>
                        Bab #{note.chapterNumber}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          {new Date(note.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          onClick={() => handleDeleteNote(note.id)}
                          style={{ padding: '2px 6px', color: 'var(--color-danger-main)' }}
                          title="Hapus Catatan"
                        >
                          Hapus
                        </Button>
                      </div>
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
                      {note.noteText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL DAFTAR PENANDA HALAMAN (BOOKMARKS)
          ========================================================================= */}
      <Modal
        isOpen={bookmarksModalOpen}
        onClose={() => setBookmarksModalOpen(false)}
        title="Daftar Halaman / Bab Ditandai (Bookmarks)"
        maxWidth="560px"
        footer={
          <Button variant="secondary" onClick={() => setBookmarksModalOpen(false)}>
            {KAMUS_UI.TUTUP}
          </Button>
        }
      >
        <div className="flex flex-col gap-3">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Klik pada salah satu bagian yang ditandai untuk langsung berpindah ke bab tersebut.
          </p>

          {Object.entries(bookmarks).filter(([_, isMarked]) => isMarked).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
              Belum ada halaman atau bab yang Anda tandai. Klik tombol "Tandai Halaman" saat membaca untuk menyimpan ke daftar ini.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {chapters
                .map((ch, idx) => ({ ch, idx }))
                .filter(({ ch }) => bookmarks[ch.id])
                .map(({ ch, idx }) => (
                  <div
                    key={ch.id}
                    onClick={() => {
                      handleSelectChapter(idx);
                      setBookmarksModalOpen(false);
                    }}
                    style={{
                      padding: 'var(--space-3)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Bookmark size={16} color="#d97706" fill="#d97706" />
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>
                          Bab {ch.chapterNumber}: {ch.title}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Estimasi {ch.estimatedMinutes} menit
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Trash2}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(ch.id);
                      }}
                      title="Hapus Penanda"
                    >
                      Hapus
                    </Button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
