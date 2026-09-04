/**
 * SUITE UJI FORUM DISKUSI & MODERASI SALAM
 * 
 * Pengujian pembuatan topik, balasan berulir, moderasi dosen (pin/lock/best answer/hide), dan event partisipasi.
 */

import { forumService } from '../services/forumService';

export interface ForumTestResult {
  scenario: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export function runForumTests(): { results: ForumTestResult[]; allPassed: boolean } {
  const results: ForumTestResult[] = [];
  const testStudentId = 'tester-mhs-forum';
  const testLecturerName = 'Dr. H. M. Ridwan, M.Ag';

  // 1. Uji Pembuatan Topik Diskusi Baru Terkait Pertemuan
  const thread = forumService.createThread({
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-03',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    meetingNumber: 3,
    title: 'Kajian Ijtihad: Analisis Kaidah Ad-Dhararu Yuzal dalam Muamalah',
    content: 'Bagaimana penerapan kaidah kemudharatan harus dihilangkan pada sistem denda keterlambatan?',
    authorId: testStudentId,
    authorName: 'Ahmad Mahasiswa Uji',
    authorNimOrNidn: '21.01.9999',
    authorRole: 'mahasiswa',
    tags: ['Ad-Dhararu Yuzal', 'Muamalah']
  });

  const threadCreated = thread.id.startsWith('thr-') && thread.meetingNumber === 3 && thread.status === 'AKTIF';
  results.push({
    scenario: 'Pembuatan Topik Diskusi: Terkait dengan Pertemuan 3',
    expected: 'Topik dibuat dengan ID valid, status AKTIF, dan relasi pertemuan 3',
    actual: threadCreated ? `Topik: "${thread.title}" (ID: ${thread.id})` : 'Gagal membuat topik',
    passed: threadCreated
  });

  // 2. Uji Pengiriman Tanggapan & Balasan Bersarang (Threaded Reply)
  const rootPost = forumService.createPost({
    threadId: thread.id,
    authorId: 'usr-mhs-02',
    authorName: 'Siti Mahasiswi',
    authorNimOrNidn: '21.01.0043',
    authorRole: 'mahasiswa',
    content: 'Denda tidak boleh menjadi keuntungan bank syariah melainkan disalurkan ke dana kebajikan (qardhul hasan).'
  });

  const childReply = forumService.createPost({
    threadId: thread.id,
    parentPostId: rootPost.id,
    authorId: testStudentId,
    authorName: 'Ahmad Mahasiswa Uji',
    authorNimOrNidn: '21.01.9999',
    authorRole: 'mahasiswa',
    content: 'Sepakat, dasar fatwa DSN-MUI No. 17/DSN-MUI/IX/2000 menegaskan ta\'zir finansial untuk dana sosial.'
  });

  const threadedSuccess = !!childReply.parentPostId && childReply.parentPostId === rootPost.id;
  results.push({
    scenario: 'Balasan Berulir (Threaded Comments): Hirarki balasan bertingkat',
    expected: 'Balasan anak terhubung ke parentPostId komentar induk',
    actual: threadedSuccess ? `Balasan anak terikat ke Post ID: ${childReply.parentPostId}` : 'Gagal relasi bersarang',
    passed: threadedSuccess
  });

  // 3. Uji Moderasi Dosen: Tandai Jawaban Terbaik (Best Answer) & Sematkan (Pin)
  const bestAnswerPost = forumService.toggleBestAnswer(rootPost.id, testLecturerName);
  const pinnedThread = forumService.togglePinThread(thread.id, testLecturerName);

  const moderationSuccess = bestAnswerPost.isBestAnswer && pinnedThread.isPinned;
  results.push({
    scenario: 'Moderasi Dosen: Sematkan Topik & Tandai Jawaban Terbaik',
    expected: 'isPinned = TRUE pada topik dan isBestAnswer = TRUE pada tanggapan',
    actual: moderationSuccess ? 'Topik DISEMATKAN di atas & tanggapan ditandai JAWABAN TERBAIK' : 'Moderasi gagal',
    passed: moderationSuccess
  });

  // 4. Uji Moderasi Dosen: Kunci Topik & Pencegahan Balasan Baru
  forumService.toggleLockThread(thread.id, testLecturerName);
  let lockBlocked = false;
  try {
    forumService.createPost({
      threadId: thread.id,
      authorId: 'usr-intruder',
      authorName: 'Mahasiswa Lain',
      authorNimOrNidn: '21.01.0000',
      authorRole: 'mahasiswa',
      content: 'Mencoba mengirim balasan pada thread terkunci'
    });
  } catch {
    lockBlocked = true;
  }

  results.push({
    scenario: 'Proteksi Diskusi Terkunci: Mencegah balasan baru pada thread dikunci',
    expected: 'Pengiriman balasan baru dilempar Exception dan diblokir sistem',
    actual: lockBlocked ? 'Balasan pada topik terkunci DIBLOKIR 100%' : 'Bocor: balasan tetap terkirim',
    passed: lockBlocked
  });

  // 5. Uji Pencatatan Event Partisipasi untuk Mesin Progres
  const events = forumService.getParticipationEvents(testStudentId, 'cls-pai301-a');
  const participationLogged = events.length >= 2; // Buat topik + kirim balasan

  results.push({
    scenario: 'Event Tracking Partisipasi: Sumber data pelacakan progres belajar',
    expected: 'Mencatat minimal 2 event aktivitas (BUAT_TOPIK dan BALASAN_DISKUSI)',
    actual: participationLogged ? `Tercatat ${events.length} event partisipasi mahasiswa` : 'Event gagal tercatat',
    passed: participationLogged
  });

  const allPassed = results.every((r) => r.passed);
  return { results, allPassed };
}
