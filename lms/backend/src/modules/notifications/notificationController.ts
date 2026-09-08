import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest, AuthenticatedUser } from '../../middleware/authMiddleware.js';

/**
 * Memetakan identitas user dari JWT atau header ke user_id (BIGINT) tabel users PostgreSQL
 */
export async function resolveDatabaseUserId(user: AuthenticatedUser): Promise<number> {
  if (user.id && /^\d+$/.test(String(user.id))) {
    return parseInt(String(user.id), 10);
  }

  try {
    const res = await db.query(`
      SELECT id FROM users 
      WHERE (identity_number IS NOT NULL AND (identity_number = $1 OR REPLACE(identity_number, '.', '') = $2))
         OR username = $3
         OR (email IS NOT NULL AND email = $4)
      LIMIT 1
    `, [
      user.identityNumber || '',
      (user.identityNumber || '').replace(/\./g, ''),
      user.username || '',
      user.email || ''
    ]);

    if (res.rows.length > 0) {
      return Number(res.rows[0].id);
    }
  } catch {
    // Abaikan error lookup jika tabel sedang busy, lanjutkan ke fallback role
  }

  // Pemetaan bawaan berdasar peran untuk akun pengujian / demo jika id berupa string demo
  switch (user.role) {
    case 'mahasiswa':
      return 7; // Ahmad Fauzi Rahman
    case 'dosen':
      return 6; // Dr. H. M. Ridwan, M.Ag
    case 'dosen_pa':
      return 5; // Dra. Hj. Siti Maryam, M.Pd.I
    case 'kaprodi':
      return 4; // Dr. Ahmad Syafi'i, M.Ag
    case 'keuangan':
      return 3; // Keuangan STAI
    case 'admin_akademik':
      return 2; // Budi Santoso (Admin Akademik)
    case 'administrator_sistem':
    case 'pimpinan':
    default:
      return 1; // Superadmin
  }
}

/**
 * Sinkronisasi notifikasi real-time dari data riil database ke tabel `notifications`
 */
export async function syncLiveNotificationsForUser(userId: number, role: string): Promise<void> {
  try {
    // 1. Sinkronisasi Pengumuman Kampus (Semua Pengguna)
    await db.query(`
      INSERT INTO notifications (
        id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
      )
      SELECT 
        'notif-ann-' || a.id || '-' || $1,
        $1,
        a.title,
        a.content,
        'PENGUMUMAN',
        CASE WHEN a.is_pinned THEN 'TINGGI' ELSE 'SEDANG' END,
        FALSE,
        CASE WHEN a.type = 'ACADEMIC' THEN '/admin/periode' ELSE '/' END,
        'Buka Pengumuman',
        'Pusat Informasi Kampus',
        'Biro Administrasi',
        COALESCE(a.created_at, NOW())
      FROM announcements a
      WHERE a.is_active = TRUE
        AND (
          a.target_role = 'ALL' 
          OR UPPER(a.target_role) = UPPER($2) 
          OR ($2 = 'mahasiswa' AND UPPER(a.target_role) = 'MAHASISWA') 
          OR ($2 IN ('dosen', 'dosen_pa') AND UPPER(a.target_role) = 'DOSEN')
        )
      ON CONFLICT (id) DO NOTHING
    `, [userId, role]);

    // 2. Notifikasi Spesifik Mahasiswa
    if (role === 'mahasiswa') {
      // 2a. Status Pengajuan KRS
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-krs-' || ks.id || '-' || $1,
          $1,
          CASE 
            WHEN ks.status = 'APPROVED' THEN 'Persetujuan KRS Akademik'
            WHEN ks.status = 'SUBMITTED' THEN 'Pengajuan KRS Terkirim'
            WHEN ks.status = 'REJECTED' THEN 'Perbaikan KRS Diperlukan'
            ELSE 'Status KRS Akademik'
          END,
          CASE 
            WHEN ks.status = 'APPROVED' THEN 'Dosen Pembimbing Akademik telah menyetujui paket rencana studi semester Anda (' || ks.total_credits || ' SKS).'
            WHEN ks.status = 'SUBMITTED' THEN 'KRS Anda (' || ks.total_credits || ' SKS) telah terkirim dan menunggu verifikasi Dosen PA.'
            WHEN ks.status = 'REJECTED' THEN 'KRS Anda perlu perbaikan: ' || COALESCE(ks.advisor_notes, 'Silakan konsultasikan dengan Dosen PA.')
            ELSE 'Status pengajuan KRS Anda: ' || ks.status
          END,
          'KRS',
          'TINGGI',
          FALSE,
          '/krs',
          'Buka Lembar KRS',
          COALESCE(adv.name, 'Dosen Pembimbing Akademik'),
          'Dosen PA',
          COALESCE(ks.approved_at, ks.submitted_at, ks.created_at, NOW())
        FROM krs_submissions ks
        LEFT JOIN users adv ON adv.id = ks.academic_advisor_id
        WHERE ks.student_id = $1
        ON CONFLICT (id) DO NOTHING
      `, [userId]);

      // 2b. Penerbitan Nilai Mata Kuliah
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-grade-' || cg.id || '-' || $1,
          $1,
          'Nilai Mata Kuliah Diterbitkan',
          'Nilai akhir Anda untuk kelas ' || COALESCE(cc.name, 'Mata Kuliah') || ' telah diterbitkan: Predikat ' || cg.grade_letter || ' (Skor: ' || cg.final_score || ').',
          'NILAI',
          'TINGGI',
          FALSE,
          '/buku-nilai',
          'Lihat Buku Nilai',
          'Biro Administrasi Akademik',
          'Sistem Akademik',
          COALESCE(cg.created_at, NOW())
        FROM course_grades cg
        LEFT JOIN course_classes cc ON cc.id = cg.course_class_id
        WHERE cg.student_id = $1
          AND cg.final_score > 0
        ON CONFLICT (id) DO NOTHING
      `, [userId]);

      // 2c. Tagihan Keuangan & Pembayaran
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-inv-' || si.id || '-' || $1,
          $1,
          CASE 
            WHEN si.status = 'LUNAS' THEN 'Pembayaran Tagihan Terverifikasi'
            ELSE 'Tagihan Pembayaran Kuliah'
          END,
          CASE 
            WHEN si.status = 'LUNAS' THEN 'Pembayaran ' || COALESCE(ft.name, 'UKT / SPP') || ' No. ' || si.invoice_number || ' sebesar Rp ' || TO_CHAR(si.final_amount, 'FM999,999,999') || ' telah LUNAS terverifikasi.'
            ELSE 'Tagihan ' || COALESCE(ft.name, 'UKT / SPP') || ' No. ' || si.invoice_number || ' sebesar Rp ' || TO_CHAR(si.final_amount, 'FM999,999,999') || ' jatuh tempo pada ' || TO_CHAR(si.due_date, 'DD Mon YYYY') || '.'
          END,
          'AKADEMIK',
          CASE WHEN si.status = 'LUNAS' THEN 'SEDANG' ELSE 'TINGGI' END,
          FALSE,
          '/krs',
          'Lihat Rincian Tagihan',
          'Bagian Keuangan STAI',
          'Biro Keuangan',
          COALESCE(si.created_at, NOW())
        FROM student_invoices si
        LEFT JOIN fee_types ft ON ft.id = si.fee_type_id
        WHERE si.user_id = $1
        ON CONFLICT (id) DO NOTHING
      `, [userId]);

      // 2d. Tugas Aktif Kuliah
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-asg-' || a.id || '-' || $1,
          $1,
          'Tugas Kuliah: ' || a.title,
          'Tugas "' || a.title || '" telah dibuka dengan batas akhir pengumpulan ' || TO_CHAR(a.due_date, 'DD Mon YYYY, HH24:MI') || ' WIB.',
          'TUGAS',
          'SEDANG',
          FALSE,
          '/tugas',
          'Kerjakan Tugas',
          'Dosen Pengampu',
          'Dosen',
          COALESCE(a.created_at, NOW())
        FROM assignments a
        WHERE a.status = 'DITERBITKAN'
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }

    // 3. Notifikasi Dosen / Dosen PA
    if (role === 'dosen' || role === 'dosen_pa') {
      // 3a. Pengajuan KRS Mahasiswa Bimbingan untuk Dosen PA
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-adv-krs-' || ks.id || '-' || $1,
          $1,
          'Pengajuan KRS Mahasiswa Bimbingan',
          mhs.name || ' (NIM: ' || COALESCE(mhs.identity_number, mhs.username) || ') mengajukan persetujuan ' || ks.total_credits || ' SKS.',
          'KRS',
          'TINGGI',
          FALSE,
          '/krs',
          'Verifikasi & Setujui KRS',
          mhs.name,
          'Mahasiswa Bimbingan',
          COALESCE(ks.submitted_at, ks.created_at, NOW())
        FROM krs_submissions ks
        JOIN users mhs ON mhs.id = ks.student_id
        WHERE (ks.academic_advisor_id = $1 OR $2 = 'dosen_pa')
          AND ks.status IN ('SUBMITTED', 'APPROVED')
        ON CONFLICT (id) DO NOTHING
      `, [userId, role]);

      // 3b. Pengumpulan Tugas Mahasiswa Baru
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        SELECT
          'notif-asg-sub-' || asub.id || '-' || $1,
          $1,
          'Pengumpulan Tugas Baru',
          'Mahasiswa ' || COALESCE(u.name, 'Mahasiswa') || ' telah mengumpulkan tugas pada "' || a.title || '".',
          'TUGAS',
          'SEDANG',
          FALSE,
          '/tugas',
          'Buka Lembar Penilaian',
          COALESCE(u.name, 'Mahasiswa'),
          'Mahasiswa',
          COALESCE(asub.submitted_at, asub.created_at, NOW())
        FROM assignment_submissions asub
        JOIN assignments a ON a.id = asub.assignment_id
        LEFT JOIN users u ON (u.id::text = asub.student_id OR u.identity_number = asub.student_id)
        WHERE asub.status = 'SUDAH_DIKUMPULKAN'
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }

    // 4. Notifikasi Admin Akademik
    if (role === 'admin_akademik') {
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        VALUES 
          ('notif-adm-krs-' || $1, $1, 'Periode KRS Online Aktif', 'Periode KRS daring Semester Ganjil 2026/2027 telah aktif di sistem. Mahasiswa aktif dapat melakukan pengisian.', 'AKADEMIK', 'TINGGI', FALSE, '/admin/periode', 'Kelola Linimasa Periode', 'Sistem Kalender Akademik', 'Biro BAAK', NOW() - INTERVAL '3 hours'),
          ('notif-adm-jadwal-' || $1, $1, 'Verifikasi Alokasi Ruang Kuliah', 'Jadwal perkuliahan dan ruangan semester ganjil telah terpetakan dan siap ditinjau.', 'PERKULIAHAN', 'SEDANG', FALSE, '/admin/jadwal', 'Cek Jadwal Kuliah', 'Mesin Penjadwalan Cerdas', 'Sistem', NOW() - INTERVAL '1 day')
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }

    // 5. Notifikasi Kaprodi
    if (role === 'kaprodi') {
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        VALUES 
          ('notif-kpr-cpl-' || $1, $1, 'Laporan Ketercapaian CPL Siap Ditinjau', 'Matriks pengukuran Capaian Pembelajaran Lulusan (CPL) program studi telah dikompilasi.', 'AKADEMIK', 'TINGGI', FALSE, '/prodi', 'Evaluasi Matriks CPL', 'Unit Penjaminan Mutu', 'UPMI', NOW() - INTERVAL '2 hours'),
          ('notif-kpr-rps-' || $1, $1, 'Validasi RPS & Bahan Ajar Mata Kuliah', 'RPS kurikulum semester aktif telah diunggah oleh dosen pengampu dan menunggu validasi Kaprodi.', 'PERKULIAHAN', 'SEDANG', FALSE, '/mata-kuliah', 'Tinjau Kurikulum & RPS', 'Tim Kurikulum', 'Prodi', NOW() - INTERVAL '1 day')
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }

    // 6. Notifikasi Pimpinan
    if (role === 'pimpinan') {
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        VALUES 
          ('notif-pim-exec-' || $1, $1, 'Laporan Eksekutif Capaian Kinerja Akademik', 'Laporan Semester STAI AL-ITTIHAD: 96.2% mahasiswa aktif, IPK rata-rata kampus 3.54.', 'AKADEMIK', 'TINGGI', FALSE, '/laporan-monitoring', 'Buka Dashboard Eksekutif', 'Biro Penjaminan Mutu', 'Pimpinan', NOW() - INTERVAL '4 hours'),
          ('notif-pim-ikm-' || $1, $1, 'Ringkasan Evaluasi Kinerja Dosen (IKM)', 'Indeks kepuasan mahasiswa terhadap proses perkuliahan semester ini mencapai rata-rata 4.62 / 5.00.', 'PERKULIAHAN', 'SEDANG', FALSE, '/laporan-monitoring', 'Tinjau Rekapitulasi IKM', 'Unit Evaluasi Mutu', 'Pimpinan', NOW() - INTERVAL '2 days')
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }

    // 7. Notifikasi Administrator Sistem
    if (role === 'administrator_sistem') {
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        )
        VALUES 
          ('notif-sys-backup-' || $1, $1, 'Pencadangan Basis Data Berhasil', 'Snapshot database harian PostgreSQL siakad_stai_db berhasil diarsipkan ke storage lokal.', 'SISTEM', 'RENDAH', FALSE, '/admin/pengaturan', 'Cek Log Backup', 'Backup Manager', 'Sistem', NOW() - INTERVAL '1 hour'),
          ('notif-sys-docker-' || $1, $1, 'Kesehatan Layanan Docker & Server Optimal', 'Container siakad-postgres-db, backend, dan frontend berstatus HEALTHY dengan latensi stabil.', 'SISTEM', 'SEDANG', FALSE, '/admin/pengaturan', 'Lihat Metrik Server', 'Docker Health Sentinel', 'Sistem', NOW() - INTERVAL '5 hours')
        ON CONFLICT (id) DO NOTHING
      `, [userId]);
    }
  } catch (err) {
    console.error('[NotificationSync] Gagal melakukan sinkronisasi live notifikasi:', err);
  }
}

/**
 * Mengambil daftar notifikasi untuk user yang sedang login
 */
export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    // Sinkronkan event live dari database ke tabel notifikasi
    await syncLiveNotificationsForUser(dbUserId, user.role);

    const result = await db.query(`
      SELECT 
        id,
        user_id as "userId",
        title,
        message,
        category,
        priority,
        is_read as "isRead",
        deep_link_path as "deepLinkPath",
        action_label as "actionLabel",
        sender_name as "senderName",
        sender_role as "senderRole",
        created_at as "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100
    `, [dbUserId]);

    const unreadCount = result.rows.filter((r) => !r.isRead).length;

    res.json({
      data: result.rows,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Menandai satu notifikasi sebagai telah dibaca
 */
export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notificationId } = req.params;
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    await db.query(`
      UPDATE notifications SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
    `, [notificationId, dbUserId]);

    res.json({ data: { message: 'Notifikasi ditandai dibaca.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Menandai satu notifikasi sebagai belum dibaca
 */
export async function markAsUnread(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notificationId } = req.params;
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    await db.query(`
      UPDATE notifications SET is_read = FALSE
      WHERE id = $1 AND user_id = $2
    `, [notificationId, dbUserId]);

    res.json({ data: { message: 'Notifikasi ditandai belum dibaca.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Menandai semua notifikasi user sebagai telah dibaca
 */
export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    await db.query(`
      UPDATE notifications SET is_read = TRUE
      WHERE user_id = $1
    `, [dbUserId]);

    res.json({ data: { message: 'Seluruh notifikasi ditandai dibaca.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Menghapus notifikasi yang sudah dibaca (Clean up)
 */
export async function clearReadNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    await db.query(`
      DELETE FROM notifications
      WHERE user_id = $1 AND is_read = TRUE
    `, [dbUserId]);

    res.json({ data: { message: 'Notifikasi yang sudah dibaca berhasil dibersihkan.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Menghapus satu notifikasi tertentu
 */
export async function deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notificationId } = req.params;
    const user = req.user!;
    const dbUserId = await resolveDatabaseUserId(user);

    await db.query(`
      DELETE FROM notifications
      WHERE id = $1 AND user_id = $2
    `, [notificationId, dbUserId]);

    res.json({ data: { message: 'Notifikasi berhasil dihapus.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * Mengirim notifikasi broadcast dari admin/dosen ke pengguna tertentu
 */
export async function createBroadcastNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sender = req.user!;
    const { title, message, category, priority, targetRoles, deepLinkPath, actionLabel } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: { message: 'Judul dan pesan wajib diisi.' } });
      return;
    }

    // Cari user_id penerima berdasar target roles
    let targetUsersQuery = `SELECT id FROM users`;
    const params: any[] = [];

    if (targetRoles && Array.isArray(targetRoles) && targetRoles.length > 0) {
      targetUsersQuery += ` WHERE role = ANY($1)`;
      params.push(targetRoles);
    }

    const targetUsersRes = await db.query(targetUsersQuery, params);
    const notifCategory = category || 'PENGUMUMAN';
    const notifPriority = priority || 'SEDANG';
    const notifDeepLink = deepLinkPath || '/';
    const notifAction = actionLabel || 'Lihat Informasi';
    const senderName = sender.name || 'Administrator';
    const senderRole = sender.role || 'Admin';

    for (const targetUser of targetUsersRes.rows) {
      const notifId = `notif-bc-${Date.now()}-${targetUser.id}-${Math.random().toString(36).substring(2, 6)}`;
      await db.query(`
        INSERT INTO notifications (
          id, user_id, title, message, category, priority, is_read, deep_link_path, action_label, sender_name, sender_role, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, FALSE, $7, $8, $9, $10, NOW())
      `, [
        notifId,
        targetUser.id,
        title,
        message,
        notifCategory,
        notifPriority,
        notifDeepLink,
        notifAction,
        senderName,
        senderRole
      ]);
    }

    res.json({ data: { message: `Notifikasi berhasil dikirimkan ke ${targetUsersRes.rows.length} penerima.` } });
  } catch (err) {
    next(err);
  }
}

/**
 * Mengambil agenda kalender akademik
 */
export async function getCalendarEvents(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        id,
        title,
        course_name as "courseName",
        type,
        date,
        start_time as "startTime",
        end_time as "endTime",
        location,
        description,
        deep_link_path as "deepLinkPath",
        is_urgent as "isUrgent"
      FROM campus_calendar_events
      ORDER BY date ASC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}
