import { 
  DiscussionThread, 
  DiscussionPost, 
  ForumParticipationEvent 
} from '../types/forum';
import { auditService } from './auditService';

const THREADS_STORAGE_KEY = 'salam_discussion_threads';
const POSTS_STORAGE_KEY = 'salam_discussion_posts';
const PARTICIPATION_STORAGE_KEY = 'salam_forum_participations';

export const INITIAL_THREADS: DiscussionThread[] = [
  {
    id: 'thr-01',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-01',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 1,
    title: 'Diskusi Sesi 1: Relevansi Kaidah Ushul Fiqih dalam Merespon Isu AI & Finansial',
    content: 'Assalamu\'alaikum wr. wb. Mahasiswa sekalian, silakan sampaikan pandangan Anda mengenai bagaimana metodologi ushul fiqih klasik (seperti istihsan dan maslahah mursalah) mendudukkan keabsahan transaksi otomatis berbasis Artificial Intelligence (AI) dan Smart Contract.',
    authorId: 'usr-dsn-01',
    authorName: 'Dr. H. M. Ridwan, M.Ag',
    authorNimOrNidn: '2112087501',
    authorRole: 'dosen',
    isPinned: true,
    isLocked: false,
    status: 'AKTIF',
    totalRepliesCount: 3,
    viewsCount: 42,
    tags: ['AI', 'Smart Contract', 'Maslahah Mursalah', 'Ushul Fiqih'],
    lastActivityAt: '2026-09-02T10:00:00Z',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'thr-02',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-02',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 2,
    title: 'Perbedaan Konseptual antara Fardhu dan Wajib dalam Mazhab Hanafi vs Jumhur',
    content: 'Bagaimana implikasi hukum praktis dalam ibadah mahdhah (seperti shalat witir dan membaca Al-Fatihah) atas pembedaan dalil Qath\'i dan Zhanni menurut ulama Ahnaf?',
    authorId: 'usr-mhs-01',
    authorName: 'Ahmad Fauzi',
    authorNimOrNidn: '21.01.0042',
    authorRole: 'mahasiswa',
    isPinned: false,
    isLocked: false,
    status: 'AKTIF',
    totalRepliesCount: 2,
    viewsCount: 28,
    tags: ['Hanafi', 'Jumhur', 'Fardhu vs Wajib'],
    lastActivityAt: '2026-09-03T14:30:00Z',
    createdAt: '2026-09-03T09:00:00Z',
    updatedAt: '2026-09-03T09:00:00Z'
  }
];

export const INITIAL_POSTS: DiscussionPost[] = [
  {
    id: 'post-01',
    threadId: 'thr-01',
    authorId: 'usr-mhs-01',
    authorName: 'Ahmad Fauzi',
    authorNimOrNidn: '21.01.0042',
    authorRole: 'mahasiswa',
    content: 'Menurut hemat saya, transaksi smart contract dapat dianalogikan dengan akad salam atau istishna\' modern selama syarat kejelasan obyek (\'adamul gharar) terpenuhi. Prinsip Maslahah Mursalah sangat relevan di sini untuk menjaga efisiensi dan transparansi muamalah.',
    isBestAnswer: true, // Ditandai dosen sebagai jawaban terbaik
    isHidden: false,
    upvotesCount: 5,
    upvotedUserIds: ['usr-dsn-01', 'usr-mhs-02'],
    createdAt: '2026-09-01T09:30:00Z',
    updatedAt: '2026-09-01T09:30:00Z'
  },
  {
    id: 'post-02',
    threadId: 'thr-01',
    parentPostId: 'post-01', // Balasan bersarang (Threaded Reply)
    authorId: 'usr-dsn-01',
    authorName: 'Dr. H. M. Ridwan, M.Ag',
    authorNimOrNidn: '2112087501',
    authorRole: 'dosen',
    content: 'Analisis yang sangat baik, Ahmad. Tepat sekali bahwa ketiadaan unsur gharar dan maysir menjadi \'illat hukum yang krusial sebelum menerapkan prinsip maslahah.',
    isBestAnswer: false,
    isHidden: false,
    upvotesCount: 3,
    upvotedUserIds: ['usr-mhs-01'],
    createdAt: '2026-09-01T10:15:00Z',
    updatedAt: '2026-09-01T10:15:00Z'
  },
  {
    id: 'post-03',
    threadId: 'thr-01',
    authorId: 'usr-mhs-02',
    authorName: 'Siti Nurhaliza',
    authorNimOrNidn: '21.01.0043',
    authorRole: 'mahasiswa',
    content: 'Apakah ada batasan tertentu jika algoritma AI mengambil keputusan otonom dalam menetapkan harga dinamis (dynamic pricing)?',
    isBestAnswer: false,
    isHidden: false,
    upvotesCount: 2,
    upvotedUserIds: [],
    createdAt: '2026-09-02T10:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z'
  }
];

class ForumService {
  public getThreads(classId?: string, meetingId?: string): DiscussionThread[] {
    try {
      const raw = localStorage.getItem(THREADS_STORAGE_KEY);
      let list: DiscussionThread[] = raw ? JSON.parse(raw) : INITIAL_THREADS;
      if (classId) {
        list = list.filter((t) => t.classId === classId);
      }
      if (meetingId) {
        list = list.filter((t) => t.meetingId === meetingId);
      }
      // Pinned threads first, then latest activity
      return list.sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      });
    } catch {
      return INITIAL_THREADS;
    }
  }

  public getThreadById(threadId: string): DiscussionThread | undefined {
    return this.getThreads().find((t) => t.id === threadId);
  }

  public saveThreads(threads: DiscussionThread[]): void {
    localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
  }

  public getPostsByThread(threadId: string): DiscussionPost[] {
    try {
      const raw = localStorage.getItem(POSTS_STORAGE_KEY);
      const all: DiscussionPost[] = raw ? JSON.parse(raw) : INITIAL_POSTS;
      const threadPosts = all.filter((p) => p.threadId === threadId);

      // Susun struktur balasan berulir (Nested Threads)
      const rootPosts = threadPosts.filter((p) => !p.parentPostId);
      rootPosts.forEach((root) => {
        root.replies = threadPosts.filter((child) => child.parentPostId === root.id);
      });

      // Best answer first for root posts, then chronological
      return rootPosts.sort((a, b) => {
        if (a.isBestAnswer !== b.isBestAnswer) return a.isBestAnswer ? -1 : 1;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
    } catch {
      return INITIAL_POSTS.filter((p) => p.threadId === threadId && !p.parentPostId);
    }
  }

  public saveAllPosts(posts: DiscussionPost[]): void {
    localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(posts));
  }

  /**
   * MEMBUAT TOPIK DISKUSI BARU
   */
  public createThread(
    threadData: Omit<DiscussionThread, 'id' | 'isPinned' | 'isLocked' | 'status' | 'totalRepliesCount' | 'viewsCount' | 'lastActivityAt' | 'createdAt' | 'updatedAt'>
  ): DiscussionThread {
    const all = this.getThreads();
    const now = new Date().toISOString();
    const newThread: DiscussionThread = {
      ...threadData,
      id: `thr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isPinned: false,
      isLocked: false,
      status: 'AKTIF',
      totalRepliesCount: 0,
      viewsCount: 1,
      lastActivityAt: now,
      createdAt: now,
      updatedAt: now
    };

    all.unshift(newThread);
    this.saveThreads(all);

    // Catat partisipasi event
    this.recordParticipation({
      classId: threadData.classId,
      threadId: newThread.id,
      meetingId: threadData.meetingId,
      studentId: threadData.authorId,
      studentNim: threadData.authorNimOrNidn,
      studentName: threadData.authorName,
      type: 'BUAT_TOPIK'
    });

    return newThread;
  }

  /**
   * MENGIRIM TANGGAPAN / BALASAN DISKUSI
   */
  public createPost(
    postData: Omit<DiscussionPost, 'id' | 'isBestAnswer' | 'isHidden' | 'upvotesCount' | 'upvotedUserIds' | 'createdAt' | 'updatedAt' | 'replies'>
  ): DiscussionPost {
    const thread = this.getThreadById(postData.threadId);
    if (!thread) throw new Error('Topik diskusi tidak ditemukan.');

    if (thread.isLocked) {
      throw new Error('Diskusi ini telah dikunci oleh dosen dan tidak menerima balasan baru.');
    }

    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: DiscussionPost[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const now = new Date().toISOString();
    const newPost: DiscussionPost = {
      ...postData,
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isBestAnswer: false,
      isHidden: false,
      upvotesCount: 0,
      upvotedUserIds: [],
      createdAt: now,
      updatedAt: now
    };

    allPosts.push(newPost);
    this.saveAllPosts(allPosts);

    // Perbarui counter balasan & last activity di topik
    const threads = this.getThreads();
    const thrIdx = threads.findIndex((t) => t.id === postData.threadId);
    if (thrIdx !== -1) {
      threads[thrIdx].totalRepliesCount += 1;
      threads[thrIdx].lastActivityAt = now;
      this.saveThreads(threads);
    }

    // Catat event partisipasi
    this.recordParticipation({
      classId: thread.classId,
      threadId: thread.id,
      meetingId: thread.meetingId,
      studentId: postData.authorId,
      studentNim: postData.authorNimOrNidn,
      studentName: postData.authorName,
      type: postData.parentPostId ? 'BALASAN_DISKUSI' : 'KIRIM_TANGGAPAN'
    });

    return newPost;
  }

  /**
   * MODERASI DOSEN: SEMATKAN TOPIK (PIN / UNPIN)
   */
  public togglePinThread(threadId: string, actorLecturerName: string): DiscussionThread {
    const threads = this.getThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) throw new Error('Topik diskusi tidak ditemukan.');

    thread.isPinned = !thread.isPinned;
    thread.updatedAt = new Date().toISOString();
    this.saveThreads(threads);

    auditService.record(
      'usr-dsn-01',
      actorLecturerName,
      'dosen',
      'MODERASI_FORUM',
      'FORUM_DISKUSI',
      `Dosen mengubah status sematan topik "${thread.title}" menjadi ${thread.isPinned ? 'DISEMATKAN' : 'BIASA'}.`,
      'SUKSES'
    );

    return thread;
  }

  /**
   * MODERASI DOSEN: KUNCI TOPIK (LOCK / UNLOCK)
   */
  public toggleLockThread(threadId: string, actorLecturerName: string): DiscussionThread {
    const threads = this.getThreads();
    const thread = threads.find((t) => t.id === threadId);
    if (!thread) throw new Error('Topik diskusi tidak ditemukan.');

    thread.isLocked = !thread.isLocked;
    thread.status = thread.isLocked ? 'DIKUNCI' : 'AKTIF';
    thread.updatedAt = new Date().toISOString();
    this.saveThreads(threads);

    auditService.record(
      'usr-dsn-01',
      actorLecturerName,
      'dosen',
      'MODERASI_FORUM',
      'FORUM_DISKUSI',
      `Dosen mengubah status kunci topik "${thread.title}" menjadi ${thread.isLocked ? 'DIKUNCI' : 'AKTIF'}.`,
      'SUKSES'
    );

    return thread;
  }

  /**
   * MODERASI DOSEN: TANDAI JAWABAN TERBAIK (BEST ANSWER)
   */
  public toggleBestAnswer(postId: string, actorLecturerName: string): DiscussionPost {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: DiscussionPost[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const post = allPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Komentar tidak ditemukan.');

    post.isBestAnswer = !post.isBestAnswer;
    post.updatedAt = new Date().toISOString();
    this.saveAllPosts(allPosts);

    auditService.record(
      'usr-dsn-01',
      actorLecturerName,
      'dosen',
      'MODERASI_FORUM',
      'FORUM_DISKUSI',
      `Dosen menandai tanggapan dari ${post.authorName} sebagai JAWABAN TERBAIK.`,
      'SUKSES'
    );

    return post;
  }

  /**
   * MODERASI DOSEN: SEMBUNYIKAN KOMENTAR TIDAK PANTAS
   */
  public hidePost(postId: string, reason: string, actorLecturerName: string): DiscussionPost {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: DiscussionPost[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const post = allPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Komentar tidak ditemukan.');

    post.isHidden = true;
    post.moderationReason = reason;
    post.moderatedByLecturerName = actorLecturerName;
    post.updatedAt = new Date().toISOString();
    this.saveAllPosts(allPosts);

    auditService.record(
      'usr-dsn-01',
      actorLecturerName,
      'dosen',
      'MODERASI_FORUM',
      'FORUM_DISKUSI',
      `Dosen menyembunyikan komentar dari ${post.authorName}. Alasan: ${reason}.`,
      'SUKSES'
    );

    return post;
  }

  /**
   * UPVOTE / DUKUNGAN TANGGAPAN
   */
  public toggleUpvote(postId: string, userId: string): DiscussionPost {
    const raw = localStorage.getItem(POSTS_STORAGE_KEY);
    const allPosts: DiscussionPost[] = raw ? JSON.parse(raw) : INITIAL_POSTS;

    const post = allPosts.find((p) => p.id === postId);
    if (!post) throw new Error('Komentar tidak ditemukan.');

    if (!post.upvotedUserIds) post.upvotedUserIds = [];

    const hasUpvoted = post.upvotedUserIds.includes(userId);
    if (hasUpvoted) {
      post.upvotedUserIds = post.upvotedUserIds.filter((id) => id !== userId);
      post.upvotesCount = Math.max(0, post.upvotesCount - 1);
    } else {
      post.upvotedUserIds.push(userId);
      post.upvotesCount += 1;
    }

    this.saveAllPosts(allPosts);
    return post;
  }

  /**
   * PENCATATAN EVENT PARTISIPASI (Untuk dikonsumsi mesin progres Fase 9)
   */
  private recordParticipation(event: Omit<ForumParticipationEvent, 'id' | 'timestamp'>): void {
    try {
      const raw = localStorage.getItem(PARTICIPATION_STORAGE_KEY);
      const list: ForumParticipationEvent[] = raw ? JSON.parse(raw) : [];
      list.push({
        ...event,
        id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(PARTICIPATION_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Gagal mencatat event partisipasi forum:', e);
    }
  }

  public getParticipationEvents(studentId?: string, classId?: string): ForumParticipationEvent[] {
    try {
      const raw = localStorage.getItem(PARTICIPATION_STORAGE_KEY);
      let list: ForumParticipationEvent[] = raw ? JSON.parse(raw) : [];
      if (studentId) list = list.filter((e) => e.studentId === studentId);
      if (classId) list = list.filter((e) => e.classId === classId);
      return list;
    } catch {
      return [];
    }
  }
}

export const forumService = new ForumService();
