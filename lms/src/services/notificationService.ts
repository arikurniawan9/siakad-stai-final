import { InAppNotification, NotificationFilter } from '../types/notification';
import { UserRole } from '../types/roles';
import { apiClient } from '../api/client';

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

  // =========================================================================
  // 6. ROLE: ADMINISTRATOR SISTEM (SUPERADMIN IT)
  // =========================================================================
  {
    id: 'notif-sys-01',
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
  }
];

class NotificationService {
  private pollingTimer: any = null;
  private lastFetchTime = 0;
  private isFetching = false;

  constructor() {
    this.initAutoPolling();
  }

  /**
   * Inisialisasi polling berkala (setiap 15 detik) untuk sinkronisasi realtime dengan database
   */
  private initAutoPolling(): void {
    if (typeof window === 'undefined') return;

    // Mulai polling berkala
    if (!this.pollingTimer) {
      this.pollingTimer = setInterval(() => {
        this.fetchNotificationsFromApi().catch(() => {});
      }, 15000);
    }
  }

  /**
   * Mengambil notifikasi langsung dari endpoint backend REST API (/api/v1/notifications)
   * Menyimpan ke cache lokal dan membroadcast perubahan data ke seluruh subscriber UI
   */
  public async fetchNotificationsFromApi(): Promise<InAppNotification[]> {
    if (this.isFetching) {
      return this.getCachedNotifications();
    }

    try {
      this.isFetching = true;
      const response = await apiClient.get<any>('/notifications');
      const rows: InAppNotification[] = Array.isArray(response) 
        ? response 
        : (response?.data && Array.isArray(response.data) ? response.data : []);

      if (rows && rows.length >= 0) {
        // Gabungkan notifikasi server dengan notifikasi lokal yang dibuat secara runtime
        const currentLocal = this.getCachedNotifications();
        const customLocalNotifs = currentLocal.filter((n) => n.id.startsWith('notif-local-') || n.id.startsWith('notif-bc-'));

        // Gabungkan tanpa duplikasi ID
        const mergedMap = new Map<string, InAppNotification>();
        rows.forEach((r) => mergedMap.set(r.id, r));
        customLocalNotifs.forEach((c) => {
          if (!mergedMap.has(c.id)) {
            mergedMap.set(c.id, c);
          }
        });

        const mergedList = Array.from(mergedMap.values());
        this.setCachedNotifications(mergedList);
        this.lastFetchTime = Date.now();
        this.broadcastUpdate();
        return mergedList;
      }

      return this.getCachedNotifications();
    } catch {
      // Jika request API gagal (misal koneksi jaringan atau mode offline), fallback ke local storage
      return this.getCachedNotifications();
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Mengambil daftar notifikasi dari local cache
   */
  private getCachedNotifications(): InAppNotification[] {
    try {
      if (typeof window === 'undefined') return [];
      const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Menyimpan daftar notifikasi ke local cache
   */
  private setCachedNotifications(list: InAppNotification[]): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(list));
      }
    } catch {
      // Abaikan jika storage penuh
    }
  }

  /**
   * Mengambil seluruh notifikasi yang relevan dengan user dan perannya
   * (Sinkron langsung untuk respon UI instan, dan memicu sync latar belakang)
   */
  public getNotifications(userId: string, userRole?: UserRole, filter?: NotificationFilter): InAppNotification[] {
    // Picu sinkronisasi API jika sudah lewat lebih dari 10 detik sejak fetch terakhir
    if (Date.now() - this.lastFetchTime > 10000) {
      this.fetchNotificationsFromApi().catch(() => {});
    }

    try {
      const list = this.getCachedNotifications();

      // Filter berdasarkan userId langsung ATAU targetRoles ATAU kecocokan user demo
      let filtered = list.filter((n) => {
        if (n.userId && (n.userId === userId || String(n.userId) === String(userId))) return true;
        if (userRole && n.targetRoles && n.targetRoles.includes(userRole)) return true;
        // Default match untuk akun demo
        if (userId.startsWith('usr-') && n.userId === userId) return true;
        // Jika notifikasi dari database memiliki id berupa "notif-ann-X-USERID"
        if (n.id.includes(`-${userId}`)) return true;
        return false;
      });

      // Jika filter kustom tidak menemukan apa pun dan userRole ada, tampilkan notifikasi yang relevan dengan role tersebut
      if (filtered.length === 0 && userRole) {
        filtered = list.filter((n) => !n.userId || n.targetRoles?.includes(userRole));
      }

      // Filter kriteria tambahan
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
      return [];
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
    const list = this.getCachedNotifications();
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = true;
      this.setCachedNotifications(list);
      this.broadcastUpdate();
    }

    // Panggil API backend di background
    apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/read`).catch(() => {});
  }

  /**
   * Menandai satu notifikasi sebagai belum dibaca
   */
  public markAsUnread(notificationId: string): void {
    const list = this.getCachedNotifications();
    const item = list.find((n) => n.id === notificationId);
    if (item) {
      item.isRead = false;
      this.setCachedNotifications(list);
      this.broadcastUpdate();
    }

    // Panggil API backend di background
    apiClient.patch(`/notifications/${encodeURIComponent(notificationId)}/unread`).catch(() => {});
  }

  /**
   * Menandai seluruh notifikasi user/role sebagai telah dibaca
   */
  public markAllAsRead(userId: string, userRole?: UserRole): void {
    const list = this.getCachedNotifications();
    list.forEach((n) => {
      if (
        n.userId === userId || 
        String(n.userId) === String(userId) ||
        (userRole && n.targetRoles?.includes(userRole)) ||
        n.id.includes(`-${userId}`)
      ) {
        n.isRead = true;
      }
    });
    this.setCachedNotifications(list);
    this.broadcastUpdate();

    // Panggil API backend di background
    apiClient.post('/notifications/mark-all-read').catch(() => {});
  }

  /**
   * Menghapus satu notifikasi
   */
  public deleteNotification(notificationId: string): void {
    const list = this.getCachedNotifications();
    const updated = list.filter((n) => n.id !== notificationId);
    this.setCachedNotifications(updated);
    this.broadcastUpdate();

    // Panggil API backend di background
    apiClient.delete(`/notifications/${encodeURIComponent(notificationId)}`).catch(() => {});
  }

  /**
   * Menghapus seluruh notifikasi yang telah dibaca (Clean up)
   */
  public clearReadNotifications(userId: string, userRole?: UserRole): void {
    const list = this.getCachedNotifications();
    const updated = list.filter((n) => {
      const isTarget = 
        n.userId === userId || 
        String(n.userId) === String(userId) ||
        (userRole && n.targetRoles?.includes(userRole)) ||
        n.id.includes(`-${userId}`);
      return !(isTarget && n.isRead);
    });
    this.setCachedNotifications(updated);
    this.broadcastUpdate();

    // Panggil API backend di background
    apiClient.delete('/notifications/clear-read').catch(() => {});
  }

  /**
   * Membuat notifikasi baru secara dinamis / broadcast
   */
  public createNotification(notification: Omit<InAppNotification, 'id' | 'isRead' | 'createdAt'>): InAppNotification {
    const list = this.getCachedNotifications();
    const newNotif: InAppNotification = {
      ...notification,
      id: `notif-local-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    list.unshift(newNotif);
    this.setCachedNotifications(list);
    this.broadcastUpdate();

    // Jika notifikasi memiliki target roles broad, kirimkan juga ke API broadcast backend
    if (notification.targetRoles && notification.targetRoles.length > 0) {
      apiClient.post('/notifications/broadcast', {
        title: notification.title,
        message: notification.message,
        category: notification.category,
        priority: notification.priority || 'SEDANG',
        targetRoles: notification.targetRoles,
        deepLinkPath: notification.deepLinkPath || '/',
        actionLabel: notification.actionLabel || 'Lihat Informasi'
      }).then(() => {
        // Refresh dari server setelah broadcast berhasil
        this.fetchNotificationsFromApi().catch(() => {});
      }).catch(() => {});
    }

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
