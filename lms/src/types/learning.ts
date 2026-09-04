export type PublishStatus = 'DRAF' | 'TERJADWAL' | 'DITERBITKAN' | 'DIARSIPKAN';

export type MaterialType = 
  | 'MODUL_ONLINE'
  | 'DOKUMEN_PDF'
  | 'PRESENTASI'
  | 'BUKU_ELEKTRONIK'
  | 'TAUTAN_EKSTERNAL'
  | 'TEKS_KONTEN';

export interface ModuleChapter {
  id: string;
  chapterNumber: number;
  title: string;
  estimatedMinutes: number;
  content: string; // Teks / Markdown terstruktur materi
  keyTakeaways?: string[]; // Poin-poin penting
  arabicQuotes?: {
    arabicText: string;
    translation: string;
    source: string;
  }[];
  caseStudy?: {
    title: string;
    scenario: string;
    analysisGuide: string;
  };
}

export interface ModuleNote {
  id: string;
  materialId: string;
  studentId: string;
  chapterId: string;
  chapterNumber: number;
  noteText: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnlineModuleContent {
  author: string;
  edition?: string;
  totalEstimatedMinutes: number;
  learningOutcomes: string[];
  chapters: ModuleChapter[];
  summary?: string;
  references?: string[];
}

export interface RPSSection {
  description: string;
  learningOutcomes: string[]; // Capaian Pembelajaran Mata Kuliah (CPMK)
  teachingMethods: string[]; // Ceramah interaktif, studi kasus, diskusi
  assessmentWeights: {
    component: string; // Kehadiran & Partisipasi, Tugas, Kuis, UTS, UAS
    weightPercentage: number; // Misal: 15, 20, 15, 25, 25
  }[];
  references: {
    title: string;
    author: string;
    year: number;
    isPrimary: boolean;
  }[];
  documentAttachmentUrl?: string;
  documentAttachmentName?: string;
  updatedAt: string;
}

export interface LearningMaterial {
  id: string;
  classId: string;
  meetingId: string;
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  fileName?: string;
  fileSizeBytes?: number;
  externalUrl?: string;
  textContent?: string;
  onlineModule?: OnlineModuleContent;
  orderIndex: number;
  status: PublishStatus;
  scheduledPublishAt?: string;
  publishedAt?: string;
  allowDownload: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourseMeeting {
  id: string;
  classId: string;
  meetingNumber: number; // Pertemuan ke-1 s.d 16
  title: string; // Misal: "Pengantar & Ruang Lingkup Ushul Fiqih"
  topic: string;
  description: string;
  scheduledDate: string;
  startTime?: string;
  endTime?: string;
  orderIndex: number;
  status: PublishStatus;
  scheduledPublishAt?: string;
  publishedAt?: string;
  materials: LearningMaterial[];
  interactiveVideoCount?: number;
  quizCount?: number;
  assignmentCount?: number;
  discussionCount?: number;
}

export interface MaterialAccessLog {
  id: string;
  materialId: string;
  meetingId: string;
  classId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  firstAccessedAt: string;
  lastAccessedAt: string;
  accessCount: number;
  totalDurationSeconds: number;
}
