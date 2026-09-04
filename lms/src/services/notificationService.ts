import { InAppNotification, NotificationFilter } from '../types/notification';
import { UserRole } from '../types/roles';

const NOTIFICATIONS_STORAGE_KEY = 'salam_in_app_notifications';

export const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  // =========================================================================
  // 1. ROLE: MAHASISWA
  // =========================================================================
  {
    id: 'notif-mhs-01',
    userId: 'usr-mhs-01',
    targetRoles: ['mahasiswa'],
    title: 'Nilai Tugas Telah Diterbitkan',
    message: 'Dosen Dr. H. M. Ridwan telah menerbitkan nilai Tugas Makalah Ushul Fiqih. Skor: 94 / 100.',
    category: 'NILAI',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/buku-nilai',
    actionLabel: 'Lihat Buku Nilai',
    senderName: 'Dr. H. M. Ridwan, M.Ag',
    senderRole: 'Dosen Pengampu',
    createdAt: '2026-09-02T10:30:00Z'
  },
  {
    id: 'notif-mhs-02',
    userId: 'usr-mhs-01',
    targetRoles: ['mahasiswa'],
    title: 'Persetujuan KRS Akademik',
    message: 'Dosen Pembimbing Akademik telah menyetujui paket 22 SKS KRS Semester Ganjil 2026/2027.',
    category: 'KRS',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/krs',
    actionLabel: 'Cetak Lembar KRS',
    senderName: 'Dr. Siti Maryam, M.Pd.I',
    senderRole: 'Dosen Pembimbing Akademik',
    createdAt: '2026-09-02T09:00:00Z'
  },
  {
    id: 'notif-mhs-03',
    userId: 'usr-mhs-01',
    targetRoles: ['mahasiswa'],
    title: 'Pengingat Batas Waktu Kuis Daring',
    message: 'Kuis Evaluasi Sesi 2: Kaidah Lughawiyah akan berakhir dalam 48 jam ke depan.',
    category: 'TUGAS',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/kuis',
    actionLabel: 'Mulai Kuis',
    senderName: 'Sistem Kuis SALAM',
    createdAt: '2026-09-02T08:00:00Z'
  },
  {
    id: 'notif-mhs-04',
    userId: 'usr-mhs-01',
    targetRoles: ['mahasiswa'],
    title: 'Jawaban Terbaik di Forum Diskusi',
    message: 'Tanggapan Anda pada topik "Kaidah Fiqhiyyah Kontemporer" ditandai sebagai Jawaban Terbaik oleh Dosen.',
    category: 'DISKUSI',
    priority: 'RENDAH',
    isRead: true,
    deepLinkPath: '/forum',
    actionLabel: 'Buka Forum',
    senderName: 'Dr. H. M. Ridwan, M.Ag',
    createdAt: '2026-09-01T11:00:00Z'
  },
  {
    id: 'notif-mhs-05',
    userId: 'usr-mhs-01',
    targetRoles: ['mahasiswa'],
    title: 'Pembaruan Jadwal Perkuliahan',
    message: 'Mata Kuliah Ushul Fiqih dialokasikan ke Ruang Al-Ghazali (Gedung A-201) setiap Senin pukul 08:00 WIB.',
    category: 'PERKULIAHAN',
    priority: 'SEDANG',
    isRead: true,
    deepLinkPath: '/jadwal',
    actionLabel: 'Cek Jadwal Kuliah',
    senderName: 'Bagian Akademik STAI',
    createdAt: '2026-08-30T14:20:00Z'
  },

  // =========================================================================
  // 2. ROLE: DOSEN
  // =========================================================================
  {
    id: 'notif-dsn-01',
    userId: 'usr-dsn-01',
    targetRoles: ['dosen'],
    title: 'Pengumpulan Tugas Mahasiswa Baru',
    message: 'Mahasiswa Ahmad Fauzi Rahman mengumpulkan revisi berkas Tugas Analisis Literatur Fatwa.',
    category: 'TUGAS',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/tugas',
    actionLabel: 'Buka Portal Penilaian',
    senderName: 'Ahmad Fauzi Rahman',
    senderRole: 'Mahasiswa',
    createdAt: '2026-09-02T09:15:00Z'
  },
  {
    id: 'notif-dsn-02',
    userId: 'usr-dsn-01',
    targetRoles: ['dosen'],
    title: 'Antrean Koreksi Soal Esai Kuis',
    message: 'Terdapat 4 lembar pengerjaan kuis baru yang membutuhkan penilaian esai subjektif dosen.',
    category: 'PERKULIAHAN',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/kuis/grading',
    actionLabel: 'Koreksi Soal Esai',
    senderName: 'Sistem Ujian Online',
    createdAt: '2026-09-02T07:45:00Z'
  },
  {
    id: 'notif-dsn-03',
    userId: 'usr-dsn-01',
    targetRoles: ['dosen'],
    title: 'Pengingat Batas Akhir Input Nilai Semester',
    message: 'Batas pengisian nilai akhir semester (Gradebook Deadline) tersisa 5 hari kalender akademik.',
    category: 'NILAI',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/nilai',
    actionLabel: 'Kelola Gradebook',
    senderName: 'Biro Administrasi Akademik',
    createdAt: '2026-09-01T16:00:00Z'
  },
  {
    id: 'notif-dsn-04',
    userId: 'usr-dsn-01',
    targetRoles: ['dosen'],
    title: 'Pertanyaan Baru di Forum Diskusi',
    message: 'Fatimah Az-Zahra mengajukan pertanyaan pada materi Sesi 3: Metodologi Istinbath.',
    category: 'DISKUSI',
    priority: 'RENDAH',
    isRead: true,
    deepLinkPath: '/forum',
    actionLabel: 'Tanggapi Pertanyaan',
    senderName: 'Fatimah Az-Zahra',
    createdAt: '2026-08-31T10:10:00Z'
  },

  // =========================================================================
  // 3. ROLE: DOSEN PA (PEMBIMBING AKADEMIK)
  // =========================================================================
  {
    id: 'notif-pa-01',
    userId: 'usr-dsn-pa',
    targetRoles: ['dosen_pa'],
    title: 'Pengajuan Rencana Studi (KRS) Baru',
    message: 'Mahasiswa bimbingan Ahmad Fauzi Rahman (NIM: 21.01.0042) mengajukan persetujuan 22 SKS.',
    category: 'KRS',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/krs',
    actionLabel: 'Verifikasi & Setujui KRS',
    senderName: 'Ahmad Fauzi Rahman',
    senderRole: 'Mahasiswa Bimbingan',
    createdAt: '2026-09-02T08:30:00Z'
  },
  {
    id: 'notif-pa-02',
    userId: 'usr-dsn-pa',
    targetRoles: ['dosen_pa'],
    title: 'Peringatan EWS: Mahasiswa Bimbingan Berisiko',
    message: 'Early Warning System mendeteksi 2 mahasiswa bimbingan dengan presensi di bawah 75% pada pekan ke-4.',
    category: 'EWS',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/laporan-monitoring',
    actionLabel: 'Lihat Laporan EWS',
    senderName: 'Sistem Pemantauan EWS',
    createdAt: '2026-09-01T14:00:00Z'
  },
  {
    id: 'notif-pa-03',
    userId: 'usr-dsn-pa',
    targetRoles: ['dosen_pa'],
    title: 'Permohonan Bimbingan Akademik Online',
    message: 'Mahasiswa Siti Khodijah mengajukan sesi konsultasi rencana proposal skripsi.',
    category: 'BIMBINGAN',
    priority: 'SEDANG',
    isRead: true,
    deepLinkPath: '/pesan',
    actionLabel: 'Buka Jadwal Bimbingan',
    senderName: 'Siti Khodijah',
    createdAt: '2026-08-30T15:30:00Z'
  },

  // =========================================================================
  // 4. ROLE: KAPRODI (KETUA PROGRAM STUDI)
  // =========================================================================
  {
    id: 'notif-kpr-01',
    userId: 'usr-kpr-01',
    targetRoles: ['kaprodi'],
    title: 'Validasi Kurikulum & RPS Mata Kuliah',
    message: 'Terdapat 3 RPS mata kuliah baru Program Studi PAI yang menunggu validasi Kaprodi.',
    category: 'AKADEMIK',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/mata-kuliah',
    actionLabel: 'Tinjau Kurikulum & RPS',
    senderName: 'Tim Kurikulum Tarbiyah',
    createdAt: '2026-09-02T07:15:00Z'
  },
  {
    id: 'notif-kpr-02',
    userId: 'usr-kpr-01',
    targetRoles: ['kaprodi'],
    title: 'Laporan Capaian Pembelajaran Lulusan (CPL)',
    message: 'Matriks pengukuran CPL Prodi PAI Semester Genap telah dikompilasi (Tingkat Ketercapaian: 88.4%).',
    category: 'AKADEMIK',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/prodi',
    actionLabel: 'Evaluasi Matriks CPL',
    senderName: 'Unit Penjaminan Mutu Internal',
    createdAt: '2026-09-01T11:45:00Z'
  },
  {
    id: 'notif-kpr-03',
    userId: 'usr-kpr-01',
    targetRoles: ['kaprodi'],
    title: 'Audit Kepatuhan Dosen Pengampu Prodi',
    message: 'Monitoring perkuliahan mencatat 100% dosen pengampu telah mengunggah bahan ajar Sesi 1 s.d Sesi 4.',
    category: 'PERKULIAHAN',
    priority: 'RENDAH',
    isRead: true,
    deepLinkPath: '/progres-kelas',
    actionLabel: 'Lihat Rekapitulasi Sesi',
    senderName: 'Biro Akademik',
    createdAt: '2026-08-31T09:00:00Z'
  },

  // =========================================================================
  // 5. ROLE: ADMIN AKADEMIK (BAAK)
  // =========================================================================
  {
    id: 'notif-adm-01',
    userId: 'usr-adm-01',
    targetRoles: ['admin_akademik'],
    title: 'Pembukaan Periode KRS Online',
    message: 'Periode KRS daring Semester Ganjil 2026/2027 telah aktif di sistem. 35 mahasiswa telah mengisi.',
    category: 'AKADEMIK',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/admin/periode',
    actionLabel: 'Kelola Linimasa Periode',
    senderName: 'Sistem Kalender Akademik',
    createdAt: '2026-09-02T06:00:00Z'
  },
  {
    id: 'notif-adm-02',
    userId: 'usr-adm-01',
    targetRoles: ['admin_akademik'],
    title: 'Permohonan Cuti Akademik Baru',
    message: 'Terdapat 1 berkas pengajuan cuti akademik mahasiswa menunggu verifikasi kelengkapan berkas BAAK.',
    category: 'AKADEMIK',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/admin/mahasiswa',
    actionLabel: 'Verifikasi Berkas Mahasiswa',
    senderName: 'Layanan Mandiri Mahasiswa',
    createdAt: '2026-09-01T15:20:00Z'
  },
  {
    id: 'notif-adm-03',
    userId: 'usr-adm-01',
    targetRoles: ['admin_akademik'],
    title: 'Deteksi Bentrok Alokasi Ruang Perkuliahan',
    message: 'Pengecekan otomatis mendeteksi potensi tumpang tindih penggunaan Ruang B-102 pada hari Rabu.',
    category: 'PERKULIAHAN',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/admin/jadwal',
    actionLabel: 'Sesuaikan Jadwal Ruang',
    senderName: 'Mesin Penjadwalan Cerdas',
    createdAt: '2026-08-31T13:40:00Z'
  },

  // =========================================================================
  // 6. ROLE: ADMINISTRATOR SISTEM (SUPERADMIN IT)
  // =========================================================================
  {
    id: 'notif-sys-01',
    userId: 'usr-sys-01',
    targetRoles: ['administrator_sistem'],
    title: 'Peringatan Keamanan: Anomali Otentikasi',
    message: 'Audit log mendeteksi 3x percobaan login gagal berturut-turut pada akun operator dari IP eksternal.',
    category: 'KEAMANAN',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/admin/audit-logs',
    actionLabel: 'Investigasi Jejak Audit',
    senderName: 'Security Sentinel AI',
    createdAt: '2026-09-02T02:15:00Z'
  },
  {
    id: 'notif-sys-02',
    userId: 'usr-sys-01',
    targetRoles: ['administrator_sistem'],
    title: 'Pencadangan Otomatis Basis Data Berhasil',
    message: 'Backup PostgreSQL snapshot harian berhasil disimpan ke cold storage MinIO (Ukuran: 18.4 MB).',
    category: 'SISTEM',
    priority: 'RENDAH',
    isRead: false,
    deepLinkPath: '/admin/pengaturan',
    actionLabel: 'Cek Status Backup',
    senderName: 'Cron Backup Manager',
    createdAt: '2026-09-02T01:00:00Z'
  },
  {
    id: 'notif-sys-03',
    userId: 'usr-sys-01',
    targetRoles: ['administrator_sistem'],
    title: 'Kesehatan Container & Tunnel Ngrok Stabil',
    message: 'Seluruh 5 container Docker berstatus HEALTHY dengan latensi rata-rata API 42ms.',
    category: 'SISTEM',
    priority: 'RENDAH',
    isRead: true,
    deepLinkPath: '/admin/pengaturan',
    actionLabel: 'Lihat Metrik Server',
    senderName: 'Docker Health Monitor',
    createdAt: '2026-09-01T08:00:00Z'
  },

  // =========================================================================
  // 7. ROLE: PIMPINAN (KETUA / WAKIL KETUA STAI)
  // =========================================================================
  {
    id: 'notif-pim-01',
    userId: 'usr-pimpinan',
    targetRoles: ['pimpinan'],
    title: 'Laporan Eksekutif Capaian Kinerja Akademik',
    message: 'Laporan Semester Ganjil STAI AL-ITTIHAD telah siap: 96.2% mahasiswa aktif, IPK rata-rata kampus 3.54.',
    category: 'AKADEMIK',
    priority: 'TINGGI',
    isRead: false,
    deepLinkPath: '/laporan-monitoring',
    actionLabel: 'Buka Dashboard Eksekutif',
    senderName: 'Biro Penjaminan Mutu & Akademik',
    createdAt: '2026-09-02T07:00:00Z'
  },
  {
    id: 'notif-pim-02',
    userId: 'usr-pimpinan',
    targetRoles: ['pimpinan'],
    title: 'Ringkasan Evaluasi Kinerja Dosen Semester',
    message: 'Indeks kepuasan mahasiswa (IKM) terhadap kinerja dosen mencapai rata-rata 4.62 dari skala 5.0.',
    category: 'PERKULIAHAN',
    priority: 'SEDANG',
    isRead: false,
    deepLinkPath: '/laporan-monitoring',
    actionLabel: 'Tinjau Rekapitulasi IKM',
    senderName: 'Unit Evaluasi Pembelajaran',
    createdAt: '2026-09-01T10:30:00Z'
  }
];

class NotificationService {
  /**
   * Mengambil seluruh notifikasi yang relevan dengan user dan perannya
   */
  public getNotifications(userId: string, userRole?: UserRole, filter?: NotificationFilter): InAppNotification[] {
    try {
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      let list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;

      // Filter berdasarkan userId langsung ATAU targetRoles
      let filtered = list.filter((n) => {
        if (n.userId && n.userId === userId) return true;
        if (userRole && n.targetRoles && n.targetRoles.includes(userRole)) return true;
        // Default match untuk akun demo berdasarkan awalan id atau role
        if (userId.startsWith('usr-') && n.userId === userId) return true;
        return false;
      });

      // Filter tambahan jika disediakan
      if (filter) {
        if (filter.category && filter.category !== 'SEMUA') {
          filtered = filtered.filter((n) => n.category === filter.category);
        }
        if (filter.unreadOnly) {
          filtered = filtered.filter((n) => !n.isRead);
        }
        if (filter.priority) {
          filtered = filtered.filter((n) => n.priority === filter.priority);
        }
        if (filter.search && filter.search.trim()) {
          const q = filter.search.toLowerCase();
          filtered = filtered.filter((n) => 
            n.title.toLowerCase().includes(q) || 
            n.message.toLowerCase().includes(q) ||
            (n.senderName && n.senderName.toLowerCase().includes(q))
          );
        }
      }

      return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return INITIAL_NOTIFICATIONS.filter((n) => n.userId === userId);
    }
  }

  /**
   * Mengambil total notifikasi yang belum dibaca
   */
  public getUnreadCount(userId: string, userRole?: UserRole): number {
    return this.getNotifications(userId, userRole, { unreadOnly: true }).length;
  }

  /**
   * Menandai satu notifikasi sebagai telah dibaca
   */
  public markAsRead(notificationId: string): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      this.broadcastUpdate();
    }
  }

  /**
   * Menandai satu notifikasi sebagai belum dibaca
   */
  public markAsUnread(notificationId: string): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = false;
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      this.broadcastUpdate();
    }
  }

  /**
   * Menandai seluruh notifikasi user/role sebagai telah dibaca
   */
  public markAllAsRead(userId: string, userRole?: UserRole): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    list.forEach((n) => {
      if (n.userId === userId || (userRole && n.targetRoles?.includes(userRole))) {
        n.isRead = true;
      }
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    this.broadcastUpdate();
  }

  /**
   * Menghapus satu notifikasi
   */
  public deleteNotification(notificationId: string): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const updated = list.filter((n) => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    this.broadcastUpdate();
  }

  /**
   * Menghapus seluruh notifikasi yang telah dibaca
   */
  public clearReadNotifications(userId: string, userRole?: UserRole): void {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const updated = list.filter((n) => {
      const isTarget = n.userId === userId || (userRole && n.targetRoles?.includes(userRole));
      return !(isTarget && n.isRead);
    });
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    this.broadcastUpdate();
  }

  /**
   * Membuat notifikasi baru secara dinamis
   */
  public createNotification(notification: Omit<InAppNotification, 'id' | 'isRead' | 'createdAt'>): InAppNotification {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const list: InAppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    const newNotif: InAppNotification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
    this.broadcastUpdate();
    return newNotif;
  }

  // =========================================================================
  // HELPER METODE REAKTIF UNTUK EVENT SISTEM
  // =========================================================================

  public notifyAssignmentGraded(studentId: string, assignmentTitle: string, score: number, lecturerName: string): InAppNotification {
    return this.createNotification({
      userId: studentId,
      targetRoles: ['mahasiswa'],
      title: 'Tugas Selesai Dinilai',
      message: `${lecturerName} telah menerbitkan nilai untuk "${assignmentTitle}". Nilai Anda: ${score}/100.`,
      category: 'NILAI',
      priority: 'TINGGI',
      deepLinkPath: '/buku-nilai',
      actionLabel: 'Lihat Lembar Nilai',
      senderName: lecturerName,
      senderRole: 'Dosen Pengampu'
    });
  }

  public notifyAssignmentSubmitted(lecturerId: string, studentName: string, assignmentTitle: string): InAppNotification {
    return this.createNotification({
      userId: lecturerId,
      targetRoles: ['dosen'],
      title: 'Pengumpulan Tugas Baru',
      message: `${studentName} telah mengumpulkan berkas tugas pada "${assignmentTitle}".`,
      category: 'TUGAS',
      priority: 'SEDANG',
      deepLinkPath: '/tugas',
      actionLabel: 'Buka Lembar Penilaian',
      senderName: studentName,
      senderRole: 'Mahasiswa'
    });
  }

  public notifyKrsSubmitted(advisorId: string, studentName: string, totalSks: number): InAppNotification {
    return this.createNotification({
      userId: advisorId,
      targetRoles: ['dosen_pa'],
      title: 'Pengajuan KRS Mahasiswa Bimbingan',
      message: `${studentName} mengajukan persetujuan paket rencana studi (${totalSks} SKS).`,
      category: 'KRS',
      priority: 'TINGGI',
      deepLinkPath: '/krs',
      actionLabel: 'Tinjau & Setujui KRS',
      senderName: studentName,
      senderRole: 'Mahasiswa'
    });
  }

  public notifyKrsApproved(studentId: string, advisorName: string): InAppNotification {
    return this.createNotification({
      userId: studentId,
      targetRoles: ['mahasiswa'],
      title: 'KRS Akademik Disetujui',
      message: `Dosen Pembimbing Akademik (${advisorName}) telah menyetujui dan mengesahkan KRS Anda.`,
      category: 'KRS',
      priority: 'TINGGI',
      deepLinkPath: '/krs',
      actionLabel: 'Cetak Lembar KRS',
      senderName: advisorName,
      senderRole: 'Dosen Pembimbing Akademik'
    });
  }

  public notifyEwsAlert(targetUserId: string, targetRole: UserRole, studentName: string, issue: string): InAppNotification {
    return this.createNotification({
      userId: targetUserId,
      targetRoles: [targetRole],
      title: 'Peringatan Dini Akademik (EWS)',
      message: `Sistem EWS mendeteksi indikator risiko pada mahasiswa ${studentName}: ${issue}.`,
      category: 'EWS',
      priority: 'TINGGI',
      deepLinkPath: '/laporan-monitoring',
      actionLabel: 'Buka Monitoring EWS',
      senderName: 'Early Warning System'
    });
  }

  public notifySecurityAlert(title: string, message: string): InAppNotification {
    return this.createNotification({
      targetRoles: ['administrator_sistem'],
      title,
      message,
      category: 'KEAMANAN',
      priority: 'TINGGI',
      deepLinkPath: '/admin/audit-logs',
      actionLabel: 'Buka Audit Logs',
      senderName: 'Sistem Keamanan SALAM'
    });
  }

  public notifySystemBroadcast(title: string, message: string, targetRoles: UserRole[], deepLinkPath = '/'): InAppNotification {
    return this.createNotification({
      targetRoles,
      title,
      message,
      category: 'PENGUMUMAN',
      priority: 'SEDANG',
      deepLinkPath,
      actionLabel: 'Buka Pengumuman',
      senderName: 'Pusat Informasi STAI AL-ITTIHAD'
    });
  }

  private broadcastUpdate(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('salam_notification_updated'));
    }
  }
}

export const notificationService = new NotificationService();
