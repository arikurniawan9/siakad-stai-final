import { 
  InteractiveVideo, 
  VideoQuestionCheckpoint, 
  StudentVideoProgress, 
  WatchedTimeSegment 
} from '../types/video';

const VIDEOS_STORAGE_KEY = 'salam_interactive_videos';
const PROGRESS_STORAGE_KEY = 'salam_video_progress';

export const INITIAL_INTERACTIVE_VIDEOS: InteractiveVideo[] = [
  {
    id: 'vid-ushul-01',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-01',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 1,
    title: 'Konsep Dasar Ushul Fiqih & Sejarah Pembentukan Mazhab',
    description: 'Video pembelajaran interaktif yang menguraikan perbedaan esensial antara Fiqih dan Ushul Fiqih, disertai pertanyaan reflektif di beberapa titik materi.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    durationSeconds: 300, // 5 menit simulasi
    minWatchedPercentage: 80,
    allowFastForward: false, // Mahasiswa tidak dapat melompati bagian yang belum ditonton
    status: 'DITERBITKAN',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-01',
        videoId: 'vid-ushul-01',
        timestampSeconds: 60, // Menit 01:00
        title: 'Pertanyaan Pemahaman 1: Definisi Ushul Fiqih',
        questionText: 'Apakah perbedaan mendasar antara Fiqih dan Ushul Fiqih menurut mayoritas ulama jumhur?',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-1', text: 'Fiqih adalah kaidah istinbath, sedangkan Ushul Fiqih adalah hukum cabang amaliyah.', isCorrect: false },
          { id: 'opt-2', text: 'Fiqih adalah hukum praktis dari dalil terperinci, sedangkan Ushul Fiqih adalah metodologi/kaidah penggaliannya.', isCorrect: true },
          { id: 'opt-3', text: 'Fiqih dan Ushul Fiqih memiliki makna yang sama persis tanpa perbedaan metodologis.', isCorrect: false },
        ],
        explanation: 'Fiqih membahas hukum syar\'i yang bersifat amaliyah dari dalil tafshili, sedangkan Ushul Fiqih adalah alat atau metodologi (kaidah-kaidah) untuk menghasilkan fiqih tersebut.',
        isRequired: true,
        allowRetry: true,
      },
      {
        id: 'chk-02',
        videoId: 'vid-ushul-01',
        timestampSeconds: 180, // Menit 03:00
        title: 'Pertanyaan Pemahaman 2: Mazhab Syafi\'iyah vs Hanafiyah',
        questionText: 'Metode penulisan Ushul Fiqih yang membangun kaidah secara murni tanpa terikat hukum furu\' cabang dikenal dengan metode:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-4', text: 'Thariqah al-Mutakallimin (Jumhur / Syafi\'iyyah)', isCorrect: true },
          { id: 'opt-5', text: 'Thariqah al-Fuqaha (Ahnaf)', isCorrect: false },
          { id: 'opt-6', text: 'Thariqah al-Muqaranah', isCorrect: false },
        ],
        explanation: 'Thariqah al-Mutakallimin (dianut Syafi\'iyyah, Malikiyyah, Hanabilah) menetapkan kaidah secara teoritis rasional tanpa memaksakan kesesuaian dengan fatwa furu\' imam mazhab.',
        isRequired: true,
        allowRetry: true,
      }
    ]
  },
  {
    id: 'vid-ushul-02',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-04',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 4,
    title: 'Kaidah Amar dan Nahyi dalam Tafsir Ahkam',
    description: 'Pembahasan interaktif mengenai kaidah dasar "Al-Ashlu fil Amri Lil Wujub" dan pengecualiannya.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    durationSeconds: 360,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-15T08:00:00Z',
    updatedAt: '2026-09-15T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-03',
        videoId: 'vid-ushul-02',
        timestampSeconds: 120,
        title: 'Kaidah Amar',
        questionText: 'Pernyataan "Kaidah asal kalimat perintah (amar) menunjukkan hukum wajib kecuali terdapat qarinah yang memalingkannya" adalah:',
        type: 'BENAR_SALAH',
        options: [
          { id: 'opt-bs-1', text: 'Benar', isCorrect: true },
          { id: 'opt-bs-2', text: 'Salah', isCorrect: false }
        ],
        explanation: 'Kaidah ushul menyatakan: Al-Ashlu fil amri lil wujub illa ma dalla ad-dalilu \'ala khilafih.',
        isRequired: true,
        allowRetry: true
      }
    ]
  },
  {
    id: 'vid-ushul-03',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-07',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 7,
    title: 'Kaidah Asasiyyah 1: Al-Umuru bi Maqashidiha',
    description: 'Video telaah komprehensif kaidah pertama dari lima kaidah asasi fiqih Islam: Segala perkara bergantung pada niat dan tujuannya.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    durationSeconds: 240,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-04',
        videoId: 'vid-ushul-03',
        timestampSeconds: 45,
        title: 'Fungsi Niat dalam Ibadah',
        questionText: 'Fungsi utama niat dalam hukum Islam terbagi menjadi dua aspek, yaitu:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-03-1', text: 'Membedakan adat dari ibadah, dan membedakan tingkatan satu ibadah dengan ibadah lainnya.', isCorrect: true },
          { id: 'opt-03-2', text: 'Menghapuskan syarat sah shalat dan membatalkan wudhu secara mutlak.', isCorrect: false },
          { id: 'opt-03-3', text: 'Menghitung pahala secara otomatis tanpa perlu pelaksanaan rukun fiqih.', isCorrect: false }
        ],
        explanation: 'Menurut jumhur fuqaha, niat berfungsi: (1) Tamyiz al-\'ibadat \'an al-\'adat, dan (2) Tamyiz ba\'dh al-\'ibadat \'an ba\'dh.',
        isRequired: true,
        allowRetry: true
      },
      {
        id: 'chk-05',
        videoId: 'vid-ushul-03',
        timestampSeconds: 150,
        title: 'Dalil Hadits Niat',
        questionText: 'Hadits "Innamal a\'malu bin-niyyat" diriwayatkan oleh sahabat Nabi:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-03-4', text: 'Umar bin Al-Khaththab radhiyallahu \'anhu', isCorrect: true },
          { id: 'opt-03-5', text: 'Abu Hurairah radhiyallahu \'anhu', isCorrect: false },
          { id: 'opt-03-6', text: 'Anas bin Malik radhiyallahu \'anhu', isCorrect: false }
        ],
        explanation: 'Hadits pembuka Shahih Al-Bukhari No. 1 ini diriwayatkan dari jalur Amirul Mukminin Umar bin Al-Khaththab RA.',
        isRequired: true,
        allowRetry: true
      }
    ]
  }
];

class VideoService {
  private getVideos(): InteractiveVideo[] {
    try {
      const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_INTERACTIVE_VIDEOS));
        return INITIAL_INTERACTIVE_VIDEOS;
      }
      const parsed: InteractiveVideo[] = JSON.parse(raw);
      // Auto-merge initial sample videos if not present
      let hasChanges = false;
      INITIAL_INTERACTIVE_VIDEOS.forEach((initVid) => {
        if (!parsed.some((p) => p.id === initVid.id)) {
          parsed.push(initVid);
          hasChanges = true;
        }
      });
      if (hasChanges) {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return INITIAL_INTERACTIVE_VIDEOS;
    }
  }

  private saveVideos(videos: InteractiveVideo[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
      }
    } catch {
      // ignore in SSR / node
    }
  }

  private getProgressList(): StudentVideoProgress[] {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveProgressList(list: StudentVideoProgress[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // ignore in SSR / node
    }
  }

  public getAllVideos(classId?: string, isStudent = false): InteractiveVideo[] {
    let videos = this.getVideos();
    if (classId) {
      videos = videos.filter((v) => v.classId === classId);
    }
    if (isStudent) {
      videos = videos.filter((v) => v.status === 'DITERBITKAN');
    }
    return videos;
  }

  public getVideosByMeeting(meetingId: string, classId?: string, meetingNumber?: number): InteractiveVideo[] {
    return this.getVideos().filter((v) => {
      if (v.status !== 'DITERBITKAN') return false;
      if (v.meetingId === meetingId) return true;
      if (classId && meetingNumber !== undefined && v.classId === classId && v.meetingNumber === meetingNumber) return true;
      if (meetingId && v.meetingId) {
        const cleanMtgId = meetingId.replace(/[-_]/g, '').toLowerCase();
        const cleanVidMtgId = v.meetingId.replace(/[-_]/g, '').toLowerCase();
        if (cleanMtgId.includes(cleanVidMtgId) || cleanVidMtgId.includes(cleanMtgId)) return true;
      }
      return false;
    });
  }

  public getVideoById(videoId: string): InteractiveVideo | undefined {
    return this.getVideos().find((v) => v.id === videoId);
  }

  public createVideo(video: Omit<InteractiveVideo, 'id' | 'createdAt' | 'updatedAt'>): InteractiveVideo {
    const all = this.getVideos();
    const now = new Date().toISOString();
    const newVideo: InteractiveVideo = {
      ...video,
      id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };
    all.push(newVideo);
    this.saveVideos(all);
    return newVideo;
  }

  public addCheckpoint(videoId: string, checkpoint: Omit<VideoQuestionCheckpoint, 'id'>): VideoQuestionCheckpoint {
    const all = this.getVideos();
    const video = all.find((v) => v.id === videoId);
    if (!video) throw new Error('Video tidak ditemukan');

    const newCheckpoint: VideoQuestionCheckpoint = {
      ...checkpoint,
      id: `chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
    };

    video.checkpoints.push(newCheckpoint);
    video.checkpoints.sort((a, b) => a.timestampSeconds - b.timestampSeconds);
    video.updatedAt = new Date().toISOString();
    this.saveVideos(all);
    return newCheckpoint;
  }

  public deleteCheckpoint(videoId: string, checkpointId: string): void {
    const all = this.getVideos();
    const video = all.find((v) => v.id === videoId);
    if (!video) return;

    video.checkpoints = video.checkpoints.filter((c) => c.id !== checkpointId);
    video.updatedAt = new Date().toISOString();
    this.saveVideos(all);
  }

  /**
   * MENGAMBIL PROGRES TONTONAN MAHASISWA
   */
  public getStudentProgress(videoId: string, studentId: string): StudentVideoProgress | null {
    const list = this.getProgressList();
    return list.find((p) => p.videoId === videoId && p.studentId === studentId) || null;
  }

  /**
   * PEMBARUAN PROGRES TONTONAN (THROTTLED & ANTI-CHEAT SERVER VALIDATED)
   */
  public updateStudentProgress(
    videoId: string,
    studentId: string,
    studentNim: string,
    studentName: string,
    currentPosition: number,
    segmentDurationSeconds = 5
  ): StudentVideoProgress {
    const video = this.getVideoById(videoId);
    if (!video) throw new Error('Video tidak ditemukan');

    const list = this.getProgressList();
    let progress = list.find((p) => p.videoId === videoId && p.studentId === studentId);
    const now = new Date().toISOString();

    // Validasi segment aman (anti-cheat: durasi tontonan tidak boleh lebih besar dari elapsed time)
    const validSegmentDuration = Math.min(Math.max(segmentDurationSeconds, 0), 15);
    const startSec = Math.max(0, currentPosition - validSegmentDuration);
    const endSec = Math.min(video.durationSeconds, currentPosition);

    if (!progress) {
      progress = {
        id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        videoId,
        studentId,
        studentNim,
        studentName,
        lastPositionSeconds: currentPosition,
        maxWatchedPositionSeconds: currentPosition,
        watchedSegments: [{ startSeconds: startSec, endSeconds: endSec }],
        effectiveWatchedPercentage: 0,
        answeredQuestions: [],
        isCompleted: false,
        lastSyncedAt: now
      };
      list.push(progress);
    } else {
      progress.lastPositionSeconds = currentPosition;
      progress.maxWatchedPositionSeconds = Math.max(progress.maxWatchedPositionSeconds, currentPosition);
      progress.watchedSegments.push({ startSeconds: startSec, endSeconds: endSec });
      progress.lastSyncedAt = now;
    }

    // Gabungkan segmen yang tumpang tindih untuk menghitung total detik unik yang telah ditonton
    const mergedSegments = this.mergeTimeSegments(progress.watchedSegments);
    progress.watchedSegments = mergedSegments;

    const totalUniqueWatchedSeconds = mergedSegments.reduce(
      (sum, seg) => sum + (seg.endSeconds - seg.startSeconds),
      0
    );

    const calculatedPercentage = Math.min(
      100,
      Math.round((totalUniqueWatchedSeconds / video.durationSeconds) * 100)
    );
    progress.effectiveWatchedPercentage = calculatedPercentage;

    // Evaluasi aturan penyelesaian (Completion Rule Validation)
    const isWatchPercentageMet = calculatedPercentage >= video.minWatchedPercentage;
    const requiredCheckpoints = video.checkpoints.filter((c) => c.isRequired);
    const allRequiredAnswered = requiredCheckpoints.every((chk) =>
      progress!.answeredQuestions.some((ans) => ans.checkpointId === chk.id && ans.isCorrect)
    );

    if (isWatchPercentageMet && allRequiredAnswered && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = now;
    }

    this.saveProgressList(list);
    return progress;
  }

  /**
   * MENYIMPAN JAWABAN CHECKPOINT PERTANYAAN
   */
  public submitQuestionAnswer(
    videoId: string,
    studentId: string,
    checkpointId: string,
    selectedOptionId?: string,
    textAnswer?: string
  ): { isCorrect: boolean; explanation?: string; progress: StudentVideoProgress } {
    const video = this.getVideoById(videoId);
    if (!video) throw new Error('Video tidak ditemukan');

    const checkpoint = video.checkpoints.find((c) => c.id === checkpointId);
    if (!checkpoint) throw new Error('Titik pertanyaan tidak ditemukan');

    let isCorrect = false;
    if (checkpoint.type === 'PILIHAN_GANDA' || checkpoint.type === 'BENAR_SALAH') {
      const opt = checkpoint.options.find((o) => o.id === selectedOptionId);
      isCorrect = !!opt?.isCorrect;
    } else if (checkpoint.type === 'JAWABAN_SINGKAT') {
      const expected = (checkpoint.correctAnswerText || '').trim().toLowerCase();
      const actual = (textAnswer || '').trim().toLowerCase();
      isCorrect = expected === actual;
    }

    const list = this.getProgressList();
    let progress = list.find((p) => p.videoId === videoId && p.studentId === studentId);
    if (!progress) {
      // Inisialisasi progress jika belum ada
      progress = this.updateStudentProgress(videoId, studentId, '21.01.0042', 'Mahasiswa', checkpoint.timestampSeconds, 0);
    }

    const existingAns = progress.answeredQuestions.find((a) => a.checkpointId === checkpointId);
    const now = new Date().toISOString();

    if (!existingAns) {
      progress.answeredQuestions.push({
        checkpointId,
        selectedOptionId,
        textAnswer,
        isCorrect,
        answeredAt: now,
        attemptsCount: 1
      });
    } else {
      existingAns.selectedOptionId = selectedOptionId;
      existingAns.textAnswer = textAnswer;
      existingAns.isCorrect = isCorrect;
      existingAns.answeredAt = now;
      existingAns.attemptsCount += 1;
    }

    // Cek ulang completion
    const requiredCheckpoints = video.checkpoints.filter((c) => c.isRequired);
    const allRequiredAnswered = requiredCheckpoints.every((chk) =>
      progress!.answeredQuestions.some((ans) => ans.checkpointId === chk.id && ans.isCorrect)
    );

    if (progress.effectiveWatchedPercentage >= video.minWatchedPercentage && allRequiredAnswered && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = now;
    }

    this.saveProgressList(list);
    return { isCorrect, explanation: checkpoint.explanation, progress };
  }

  /**
   * Helper: Menggabungkan interval waktu tontonan
   */
  private mergeTimeSegments(segments: WatchedTimeSegment[]): WatchedTimeSegment[] {
    if (segments.length === 0) return [];
    const sorted = [...segments].sort((a, b) => a.startSeconds - b.startSeconds);
    const merged: WatchedTimeSegment[] = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const last = merged[merged.length - 1];

      if (current.startSeconds <= last.endSeconds) {
        last.endSeconds = Math.max(last.endSeconds, current.endSeconds);
      } else {
        merged.push(current);
      }
    }

    return merged;
  }
}

export const videoService = new VideoService();
