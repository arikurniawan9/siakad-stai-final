import { 
  InteractiveVideo, 
  VideoQuestionCheckpoint, 
  StudentVideoProgress, 
  WatchedTimeSegment 
} from '../types/video';

const VIDEOS_STORAGE_KEY = 'salam_interactive_videos';
const PROGRESS_STORAGE_KEY = 'salam_video_progress';

const SCHEMA_VERSION_KEY = 'salam_video_service_v7_real_academic_data';

export const INITIAL_INTERACTIVE_VIDEOS: InteractiveVideo[] = [
  // 1. PAI-301: Fiqih Mawaris (3 SKS)
  {
    id: 'vid-ushul-01',
    classId: 'cls-20261-pai301-a',
    meetingId: 'mtg-pai301a-01',
    courseName: 'Fiqih Mawaris',
    meetingNumber: 1,
    title: 'Hukum Kewarisan Islam: Hakikat Tirkah & Rukun Pokok Mawaris',
    description: 'Kuliah interaktif komprehensif menguraikan rukun pokok mawaris (muwarrits, warits, mauruts), syarat kelayakan penerimaan warisan, dan kewajiban penyelesaian tirkah (tajhiz, utang, wasiat) sebelum pembagian harta waris menurut syariat Islam.',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    durationSeconds: 300,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-01',
        videoId: 'vid-ushul-01',
        timestampSeconds: 60,
        title: 'Pertanyaan Pemahaman 1: Rukun Pokok Mawaris',
        questionText: 'Manakah di bawah ini yang merupakan rukun pokok dalam pembagian kewarisan Islam (ilmu faraidh)?',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-1', text: 'Warits dan Mauruts saja tanpa mensyaratkan wafatnya muwarrits.', isCorrect: false },
          { id: 'opt-2', text: 'Muwarrits (pewaris yang wafat), Warits (ahli waris yang hidup), dan Mauruts (harta tirkah).', isCorrect: true },
          { id: 'opt-3', text: 'Penetapan saksi notaris dan persetujuan seluruh anggota keluarga semata.', isCorrect: false },
        ],
        explanation: 'Rukun mawaris ada tiga: (1) Muwarrits (orang yang meninggal dunia), (2) Warits (orang yang berhak menerima warisan yang masih hidup hakiki/hukmi saat muwarrits wafat), dan (3) Mauruts/Tirkah (harta peninggalan yang sah).',
        isRequired: true,
        allowRetry: true,
      },
      {
        id: 'chk-02',
        videoId: 'vid-ushul-01',
        timestampSeconds: 180,
        title: 'Pertanyaan Pemahaman 2: Penyelesaian Tirkah Sebelum Pembagian',
        questionText: 'Berdasarkan dalil nash "Min ba\'di washiyyatin yushi biha aw dayn" (QS. An-Nisa: 11) dan ijma\' ulama, urutan prioritas penyelesaian hak atas harta tirkah sebelum dibagikan kepada ahli waris adalah:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-4', text: 'Biaya tajhiz jenazah dan pelunasan utang didahulukan, lalu penunaian wasiat (maksimal 1/3), barulah sisa harta dibagikan kepada ahli waris.', isCorrect: true },
          { id: 'opt-5', text: 'Pembagian waris didahulukan tanpa perlu melunasi utang piutang atau menunaikan wasiat almarhum.', isCorrect: false },
          { id: 'opt-6', text: 'Wasiat ditunaikan seluruhnya tanpa batas sepertiga dan mengabaikan hak ahli waris.', isCorrect: false },
        ],
        explanation: 'Urutan penyelesaian hak tirkah menurut syariat Islam: (1) Biaya pengurusan jenazah (tajhiz), (2) Pelunasan utang almarhum (dayn), (3) Pelaksanaan wasiat sah (maksimal 1/3), (4) Pembagian sisa tirkah kepada para ahli waris sesuai ketentuan faraidh.',
        isRequired: true,
        allowRetry: true,
      }
    ]
  },

  // 2. PAI-202: Fiqih Ibadah & Muamalah (3 SKS)
  {
    id: 'vid-muamalah-01',
    classId: 'cls-20261-pai202-a',
    meetingId: 'mtg-pai202a-05',
    courseName: 'Fiqih Ibadah & Muamalah',
    meetingNumber: 5,
    title: 'Fiqih Muamalah Kontemporer: Prinsip Akad Tijariyyah & Batasan Riba',
    description: 'Kajian telaah akad bisnis Islam: perbedaan mendasar riba fadhl dan riba nasi\'ah, rukun keabsahan transaksi jual-beli modern, serta implementasi fatwa DSN-MUI dalam perbankan syariah.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    durationSeconds: 240,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-03T08:00:00Z',
    updatedAt: '2026-09-03T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-mua-01',
        videoId: 'vid-muamalah-01',
        timestampSeconds: 45,
        title: 'Karakteristik Riba Nasi\'ah',
        questionText: 'Tambahan atau kelebihan pembayaran yang disyaratkan atas penangguhan waktu pembayaran utang-piutang disebut:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-m1', text: 'Riba Nasi\'ah (Riba Jahiliyyah)', isCorrect: true },
          { id: 'opt-m2', text: 'Riba Fadhl', isCorrect: false },
          { id: 'opt-m3', text: 'Riba Qardh Halal', isCorrect: false },
        ],
        explanation: 'Riba Nasi\'ah adalah tambahan yang disyaratkan oleh kreditur sebagai kompensasi atas penundaan waktu pembayaran utang.',
        isRequired: true,
        allowRetry: true
      },
      {
        id: 'chk-mua-02',
        videoId: 'vid-muamalah-01',
        timestampSeconds: 150,
        title: 'Rukun Jual Beli Islami',
        questionText: 'Ketiadaan unsur gharar (ketidakjelasan/spekulasi) dan tadlis (penipuan) adalah syarat mutlak keabsahan objek akad muamalah.',
        type: 'BENAR_SALAH',
        options: [
          { id: 'opt-bs-m1', text: 'Benar', isCorrect: true },
          { id: 'opt-bs-m2', text: 'Salah', isCorrect: false }
        ],
        explanation: 'Rasulullah SAW melarang jual-beli gharar sebagaimana diriwayatkan dalam Shahih Muslim dari sahabat Abu Hurairah RA.',
        isRequired: true,
        allowRetry: true
      }
    ]
  },

  // 3. PAI-101: Ulumul Qur'an (2 SKS)
  {
    id: 'vid-ulumul-01',
    classId: 'cls-20261-pai101-a',
    meetingId: 'mtg-pai101a-03',
    courseName: 'Ulumul Qur\'an',
    meetingNumber: 3,
    title: 'Sejarah Kodifikasi Mushaf Al-Qur\'an: Dari Era Kenabian ke Mushaf Utsmani',
    description: 'Dokumentasi ilmiah sejarah pengumpulan mushaf Al-Qur\'an dari era Kenabian, kodifikasi pertama pasca Perang Yamamah pada era Khalifah Abu Bakar Ash-Shiddiq, hingga standarisasi Rasm Utsmani.',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    durationSeconds: 360,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-05T08:00:00Z',
    updatedAt: '2026-09-05T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-ulum-01',
        videoId: 'vid-ulumul-01',
        timestampSeconds: 60,
        title: 'Latar Belakang Kodifikasi Era Abu Bakar',
        questionText: 'Peristiwa krusial yang melatarbelakangi usulan Umar bin Al-Khaththab kepada Abu Bakar untuk mengumpulkan Al-Qur\'an adalah:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-u1', text: 'Gugurnya puluhan sahabat penghafal Al-Qur\'an (huffazh) dalam Perang Yamamah.', isCorrect: true },
          { id: 'opt-u2', text: 'Perbedaan dialek bahasa di kalangan bangsa Romawi dan Persia.', isCorrect: false },
          { id: 'opt-u3', text: 'Permintaan resmi dari Raja Najasyi di Habasyah.', isCorrect: false },
        ],
        explanation: 'Umar RA khawatir Al-Qur\'an akan berkurang seiring syahidnya para penghafal Al-Qur\'an dalam Perang Yamamah.',
        isRequired: true,
        allowRetry: true
      },
      {
        id: 'chk-ulum-02',
        videoId: 'vid-ulumul-01',
        timestampSeconds: 180,
        title: 'Ketua Tim Kodifikasi Mushaf Utsmani',
        questionText: 'Sahabat terkemuka yang dipercaya memimpin penulisan mushaf Al-Qur\'an pada era Abu Bakar maupun Utsman bin Affan adalah:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-u4', text: 'Zaid bin Tsabit radhiyallahu \'anhu', isCorrect: true },
          { id: 'opt-u5', text: 'Abu Hurairah radhiyallahu \'anhu', isCorrect: false },
          { id: 'opt-u6', text: 'Khalid bin Walid radhiyallahu \'anhu', isCorrect: false },
        ],
        explanation: 'Zaid bin Tsabit RA adalah sekretaris wahyu Rasulullah SAW yang memiliki hafalan kuat dan kecermatan tinggi.',
        isRequired: true,
        allowRetry: true
      }
    ]
  },

  // 4. PAI-201: Ushul Fiqih & Qawaid Fiqhiyyah (2 SKS)
  {
    id: 'vid-ushul-02',
    classId: 'cls-20261-pai201-a',
    meetingId: 'mtg-pai201a-07',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 7,
    title: 'Kaidah Asasiyyah 1: Al-Umuru bi Maqashidiha (Segala Urusan Bergantung pada Niatnya)',
    description: 'Pembahasan komprehensif kaidah pertama dari 5 kaidah asasi hukum Islam, mencakup fungsi niat dalam membedakan adat dengan ibadah mahdhah, serta implikasi hukum niat dalam akad muamalah.',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    durationSeconds: 300,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-07T08:00:00Z',
    updatedAt: '2026-09-07T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-ush-01',
        videoId: 'vid-ushul-02',
        timestampSeconds: 60,
        title: 'Fungsi Pokok Niat dalam Ibadah',
        questionText: 'Fungsi utama niat dalam hukum syariat Islam menurut jumhur fuqaha adalah:',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-s1', text: 'Membedakan antara adat (kebiasaan) dengan ibadah, serta membedakan derajat satu ibadah dengan ibadah lainnya.', isCorrect: true },
          { id: 'opt-s2', text: 'Menggugurkan rukun shalat dan membatalkan syarat suci wudhu.', isCorrect: false },
          { id: 'opt-s3', text: 'Menentukan besaran denda kafarat secara sepihak.', isCorrect: false },
        ],
        explanation: 'Dua fungsi niat: Tamyizul \'ibadat \'anil \'adat dan Tamyizul \'ibadat ba\'dhiha \'an ba\'dh.',
        isRequired: true,
        allowRetry: true
      },
      {
        id: 'chk-ush-02',
        videoId: 'vid-ushul-02',
        timestampSeconds: 180,
        title: 'Kaidah Asasi Ushul',
        questionText: 'Kaidah "Al-Umuru bi Maqashidiha" bersumber langsung dari hadits masyhur "Innamal a\'malu bin-niyyat" riwayat Umar bin Al-Khaththab RA.',
        type: 'BENAR_SALAH',
        options: [
          { id: 'opt-bs-s1', text: 'Benar', isCorrect: true },
          { id: 'opt-bs-s2', text: 'Salah', isCorrect: false }
        ],
        explanation: 'Hadits riwayat Bukhari dan Muslim ini menjadi landasan sepertiga ilmu fiqih menurut para imam madzhab.',
        isRequired: true,
        allowRetry: true
      }
    ]
  },

  // 5. PIAUD-101: Konsep Dasar Pendidikan Islam Anak Usia Dini (3 SKS)
  {
    id: 'vid-piaud-01',
    classId: 'cls-20261-piaud101-a',
    meetingId: 'mtg-piaud101a-01',
    courseName: 'Konsep Dasar PIAUD',
    meetingNumber: 1,
    title: 'Paradigma Keilmuan PIAUD & Karakteristik Usia Emas (Golden Age)',
    description: 'Pembekalan bagi calon pendidik PAUD/TK Islam mengenai tahapan perkembangan fitrah keimanan anak, stimulasi sensorik-motorik, dan keteladanan akhlakul karimah.',
    videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
    durationSeconds: 240,
    minWatchedPercentage: 80,
    allowFastForward: false,
    status: 'DITERBITKAN',
    createdAt: '2026-09-07T08:00:00Z',
    updatedAt: '2026-09-07T08:00:00Z',
    checkpoints: [
      {
        id: 'chk-piaud-01',
        videoId: 'vid-piaud-01',
        timestampSeconds: 60,
        title: 'Fase Golden Age Anak Usia Dini',
        questionText: 'Mengapa usia 0 hingga 6 tahun disebut sebagai periode keemasan (golden age) dalam tarbiyatul aulad?',
        type: 'PILIHAN_GANDA',
        options: [
          { id: 'opt-p1', text: 'Karena 80% perkembangan koneksi sinapsis otak dan internalisasi adab dasar terbentuk secara optimal pada fase ini.', isCorrect: true },
          { id: 'opt-p2', text: 'Karena anak sudah memiliki kemampuan penalaran logika formal yang sempurna.', isCorrect: false },
          { id: 'opt-p3', text: 'Karena anak tidak memerlukan pendampingan orang tua atau guru dalam pembiasaan akhlak.', isCorrect: false }
        ],
        explanation: 'Masa golden age adalah masa kritis di mana otak anak berkembang sangat pesat dan fitrah keimanan paling mudah ditanamkan lewat pembiasaan positif.',
        isRequired: true,
        allowRetry: true
      }
    ]
  }
];

class VideoService {
  private inMemoryVideos: InteractiveVideo[] = JSON.parse(JSON.stringify(INITIAL_INTERACTIVE_VIDEOS));
  private inMemoryProgress: StudentVideoProgress[] = [];

  private getVideos(): InteractiveVideo[] {
    try {
      if (typeof localStorage === 'undefined') return this.inMemoryVideos;

      const version = localStorage.getItem(SCHEMA_VERSION_KEY);
      if (version !== 'true') {
        // MIGRASI TOTAL: Bersihkan data dummy lama (kartun/BigBuckBunny) dan terapkan kurikulum riil STAI
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_INTERACTIVE_VIDEOS));
        localStorage.setItem(SCHEMA_VERSION_KEY, 'true');
        return INITIAL_INTERACTIVE_VIDEOS;
      }

      const raw = localStorage.getItem(VIDEOS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(INITIAL_INTERACTIVE_VIDEOS));
        return INITIAL_INTERACTIVE_VIDEOS;
      }
      const parsed: InteractiveVideo[] = JSON.parse(raw);
      return parsed.length > 0 ? parsed : INITIAL_INTERACTIVE_VIDEOS;
    } catch {
      return this.inMemoryVideos;
    }
  }

  private saveVideos(videos: InteractiveVideo[]): void {
    this.inMemoryVideos = videos;
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
      return this.inMemoryProgress;
    } catch {
      return this.inMemoryProgress;
    }
  }

  private saveProgressList(list: StudentVideoProgress[]): void {
    this.inMemoryProgress = list;
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
      videos = videos.filter((v) => 
        v.classId === classId || 
        (classId === 'cls-20261-pai301-a' && v.classId === 'cls-pai301-a') ||
        (classId === 'cls-pai301-a' && v.classId === 'cls-20261-pai301-a')
      );
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
      if (classId && meetingNumber !== undefined && (v.classId === classId || (classId === 'cls-20261-pai301-a' && v.classId === 'cls-pai301-a')) && v.meetingNumber === meetingNumber) return true;
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
