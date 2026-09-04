import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// Helper: Generate 6-digit Passcode
function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Generate Dynamic QR Token
function generateQrToken(meetingId: string): { token: string; expiresAt: Date } {
  const randomSalt = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const token = `QR_${meetingId}_${timestamp}_${randomSalt}`;
  const expiresAt = new Date(timestamp + 30 * 1000); // Valid 30 detik
  return { token, expiresAt };
}

// =========================================================================
// 1. GET MEETING ATTENDANCE SESSION & STUDENTS LIST
// =========================================================================
export async function getMeetingAttendanceSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;

    // 1. Ambil data meeting & kelas
    const meetingRes = await db.query(`
      SELECT 
        m.id,
        m.class_id as "classId",
        m.meeting_number as "meetingNumber",
        m.title,
        m.topic,
        m.scheduled_date as "scheduledDate",
        m.start_time as "startTime",
        m.end_time as "endTime",
        c.class_name as "className",
        co.code as "classCode",
        co.name as "courseName",
        co.credits,
        COALESCE(u.name, 'Dosen Pengampu') as "lecturerName",
        COALESCE(u.id, cl.lecturer_id) as "lecturerId"
      FROM course_meetings m
      JOIN course_classes c ON c.id = m.class_id
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.class_id = c.id AND cl.is_primary = true
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE m.id = $1
    `, [meetingId]);

    if (meetingRes.rows.length === 0) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meeting = meetingRes.rows[0];

    // 2. Ambil sesi presensi jika ada (atau buat baru jika belum ada)
    let sessionRes = await db.query(`
      SELECT 
        id,
        meeting_id as "meetingId",
        class_id as "classId",
        lecturer_id as "lecturerId",
        session_status as "sessionStatus",
        delivery_mode as "deliveryMode",
        qr_token as "qrToken",
        qr_expires_at as "qrExpiresAt",
        passcode,
        opened_at as "openedAt",
        closed_at as "closedAt",
        teaching_journal as "teachingJournal",
        journal_notes as "journalNotes",
        student_attendance_rate as "studentAttendanceRate",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM meeting_attendance_sessions
      WHERE meeting_id = $1
    `, [meetingId]);

    let session = sessionRes.rows[0] || null;

    if (!session) {
      // Inisialisasi sesi draf awal
      const newSessionId = `ses-${meetingId}`;
      const defaultPasscode = generatePasscode();
      const insertRes = await db.query(`
        INSERT INTO meeting_attendance_sessions (
          id, meeting_id, class_id, lecturer_id, session_status, delivery_mode, passcode
        ) VALUES ($1, $2, $3, $4, 'BELUM_DIBUKA', 'TATAP_MUKA', $5)
        RETURNING 
          id,
          meeting_id as "meetingId",
          class_id as "classId",
          lecturer_id as "lecturerId",
          session_status as "sessionStatus",
          delivery_mode as "deliveryMode",
          qr_token as "qrToken",
          qr_expires_at as "qrExpiresAt",
          passcode,
          opened_at as "openedAt",
          closed_at as "closedAt",
          teaching_journal as "teachingJournal",
          journal_notes as "journalNotes",
          student_attendance_rate as "studentAttendanceRate",
          created_at as "createdAt",
          updated_at as "updatedAt"
      `, [newSessionId, meetingId, meeting.classId, meeting.lecturerId || req.user?.id, defaultPasscode]);
      session = insertRes.rows[0];
    }

    // 3. Ambil daftar mahasiswa terdaftar di kelas beserta status presensinya
    const studentsRes = await db.query(`
      SELECT 
        u.id as "studentId",
        u.name as "studentName",
        u.identity_number as "studentNim",
        u.email as "studentEmail",
        COALESCE(sa.status, 'ALPA') as status,
        sa.method,
        sa.recorded_at as "recordedAt",
        sa.notes,
        sa.attachment_url as "attachmentUrl"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      LEFT JOIN student_attendances sa ON sa.meeting_id = $1 AND sa.student_id = u.id
      WHERE ce.class_id = $2
      ORDER BY u.identity_number ASC
    `, [meetingId, meeting.classId]);

    // 4. Hitung ringkasan statistik
    const totalStudents = studentsRes.rows.length;
    const countHadir = studentsRes.rows.filter(s => s.status === 'HADIR').length;
    const countSakit = studentsRes.rows.filter(s => s.status === 'SAKIT').length;
    const countIzin = studentsRes.rows.filter(s => s.status === 'IZIN').length;
    const countAlpa = studentsRes.rows.filter(s => s.status === 'ALPA').length;
    const attendancePercentage = totalStudents > 0 ? Math.round((countHadir / totalStudents) * 100) : 0;

    res.json({
      data: {
        meeting,
        session,
        students: studentsRes.rows,
        summary: {
          totalStudents,
          countHadir,
          countSakit,
          countIzin,
          countAlpa,
          attendancePercentage
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. OPEN ATTENDANCE SESSION (DOSEN BUKA SESI QR)
// =========================================================================
export async function openAttendanceSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;
    const { deliveryMode, teachingJournal } = req.body;

    const { token, expiresAt } = generateQrToken(meetingId);
    const passcode = generatePasscode();

    const result = await db.query(`
      UPDATE meeting_attendance_sessions
      SET 
        session_status = 'DIBUKA',
        delivery_mode = COALESCE($1, delivery_mode),
        qr_token = $2,
        qr_expires_at = $3,
        passcode = $4,
        opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
        closed_at = NULL,
        teaching_journal = COALESCE($5, teaching_journal),
        updated_at = CURRENT_TIMESTAMP
      WHERE meeting_id = $6
      RETURNING *
    `, [deliveryMode || 'TATAP_MUKA', token, expiresAt, passcode, teachingJournal || null, meetingId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: { message: 'Sesi presensi tidak ditemukan.' } });
      return;
    }

    res.json({
      data: {
        message: 'Sesi presensi berhasil dibuka.',
        session: result.rows[0],
        qrToken: token,
        qrExpiresAt: expiresAt,
        passcode
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. REFRESH DYNAMIC QR TOKEN (AUTO REFRESH TIAP 20-30 DETIK)
// =========================================================================
export async function refreshQrToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;

    const { token, expiresAt } = generateQrToken(meetingId);

    const result = await db.query(`
      UPDATE meeting_attendance_sessions
      SET 
        qr_token = $1,
        qr_expires_at = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE meeting_id = $3 AND session_status = 'DIBUKA'
      RETURNING qr_token as "qrToken", qr_expires_at as "qrExpiresAt", passcode
    `, [token, expiresAt, meetingId]);

    if (result.rows.length === 0) {
      res.status(400).json({ error: { message: 'Sesi presensi tidak aktif atau belum dibuka.' } });
      return;
    }

    res.json({
      data: {
        qrToken: token,
        qrExpiresAt: expiresAt,
        passcode: result.rows[0].passcode
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. CLOSE ATTENDANCE SESSION (DOSEN TUTUP SESI PRESENSI)
// =========================================================================
export async function closeAttendanceSession(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;
    const { teachingJournal, journalNotes } = req.body;

    // Hitung persentase kehadiran akhir
    const statsRes = await db.query(`
      SELECT 
        COUNT(ce.id) as total,
        COUNT(CASE WHEN sa.status = 'HADIR' THEN 1 END) as hadir
      FROM course_meetings m
      JOIN class_enrollments ce ON ce.class_id = m.class_id
      LEFT JOIN student_attendances sa ON sa.meeting_id = m.id AND sa.student_id = ce.student_id
      WHERE m.id = $1
    `, [meetingId]);

    const total = parseInt(statsRes.rows[0]?.total || '0', 10);
    const hadir = parseInt(statsRes.rows[0]?.hadir || '0', 10);
    const finalRate = total > 0 ? (hadir / total) * 100 : 0;

    const result = await db.query(`
      UPDATE meeting_attendance_sessions
      SET 
        session_status = 'DITUTUP',
        closed_at = CURRENT_TIMESTAMP,
        teaching_journal = COALESCE($1, teaching_journal),
        journal_notes = COALESCE($2, journal_notes),
        student_attendance_rate = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE meeting_id = $4
      RETURNING *
    `, [teachingJournal || null, journalNotes || null, finalRate.toFixed(2), meetingId]);

    res.json({
      data: {
        message: 'Sesi presensi perkuliahan berhasil ditutup.',
        session: result.rows[0],
        finalAttendanceRate: finalRate
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. RECORD STUDENT ATTENDANCE (MAHASISWA SCAN QR / INPUT PASSCODE)
// =========================================================================
export async function recordStudentAttendance(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;
    const studentId = req.user?.id;
    const { qrToken, passcode, method, notes, attachmentUrl } = req.body;

    if (!studentId) {
      res.status(401).json({ error: { message: 'Autentikasi diperlukan.' } });
      return;
    }

    // 1. Cek sesi presensi
    const sessionRes = await db.query(`
      SELECT 
        s.*,
        m.class_id as "classId",
        m.meeting_number as "meetingNumber",
        m.title as "meetingTitle"
      FROM meeting_attendance_sessions s
      JOIN course_meetings m ON m.id = s.meeting_id
      WHERE s.meeting_id = $1
    `, [meetingId]);

    if (sessionRes.rows.length === 0) {
      res.status(404).json({ error: { message: 'Sesi presensi tidak ditemukan.' } });
      return;
    }

    const session = sessionRes.rows[0];

    // Jika pengajuan sakit/izin mandiri, tidak harus dalam status DIBUKA
    const isLeaveRequest = method === 'SURAT_IZIN' || req.body.status === 'SAKIT' || req.body.status === 'IZIN';

    if (!isLeaveRequest) {
      if (session.session_status !== 'DIBUKA') {
        res.status(400).json({ error: { message: 'Sesi presensi belum dibuka atau telah ditutup oleh dosen pengampu.' } });
        return;
      }

      // Validasi token QR atau passcode
      if (method === 'QR_SCAN') {
        if (!qrToken || session.qr_token !== qrToken) {
          res.status(400).json({ error: { message: 'QR Code telah kedaluwarsa atau tidak valid. Silakan scan ulang layar proyektor dosen.' } });
          return;
        }
      } else if (method === 'PASSCODE') {
        if (!passcode || session.passcode !== passcode.toString().trim()) {
          res.status(400).json({ error: { message: 'Kode 6-digit presensi salah.' } });
          return;
        }
      }
    }

    // 2. Pastikan mahasiswa terdaftar di kelas tersebut (auto-enroll jika belum)
    const enrollmentRes = await db.query(`
      SELECT id FROM class_enrollments WHERE class_id = $1 AND student_id = $2
    `, [session.classId, studentId]);

    if (enrollmentRes.rows.length === 0) {
      await db.query(`
        INSERT INTO class_enrollments (id, class_id, student_id, status)
        VALUES ($1, $2, $3, 'TERDAFTAR')
        ON CONFLICT (class_id, student_id) DO NOTHING
      `, [`enr-${session.classId}-${studentId}`, session.classId, studentId]);
    }

    // 3. Simpan atau perbarui record kehadiran (Upsert)
    const attId = `att-${meetingId}-${studentId}`;
    const statusVal = isLeaveRequest ? (req.body.status || 'IZIN') : 'HADIR';
    const methodVal = method || 'QR_SCAN';

    const insertRes = await db.query(`
      INSERT INTO student_attendances (
        id, session_id, meeting_id, class_id, student_id, status, method, recorded_at, notes, attachment_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, $8, $9)
      ON CONFLICT (meeting_id, student_id) DO UPDATE
      SET 
        status = EXCLUDED.status,
        method = EXCLUDED.method,
        recorded_at = CURRENT_TIMESTAMP,
        notes = EXCLUDED.notes,
        attachment_url = COALESCE(EXCLUDED.attachment_url, student_attendances.attachment_url),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [attId, session.id, meetingId, session.classId, studentId, statusVal, methodVal, notes || null, attachmentUrl || null]);

    res.json({
      data: {
        message: statusVal === 'HADIR' ? 'Presensi kehadiran berhasil dicatat.' : 'Pengajuan izin/sakit berhasil dikirimkan ke dosen pengampu.',
        attendance: insertRes.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. UPDATE STUDENT ATTENDANCE MANUAL (DOSEN OVERRIDE)
// =========================================================================
export async function updateStudentAttendanceManual(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const meetingId = req.params.meetingId as string;
    const studentId = req.params.studentId as string;
    const { status, notes } = req.body;

    const sessionRes = await db.query(`
      SELECT id, class_id as "classId" FROM meeting_attendance_sessions WHERE meeting_id = $1
    `, [meetingId]);

    if (sessionRes.rows.length === 0) {
      res.status(404).json({ error: { message: 'Sesi presensi tidak ditemukan.' } });
      return;
    }

    const session = sessionRes.rows[0];
    const attId = `att-${meetingId}-${studentId}`;

    const result = await db.query(`
      INSERT INTO student_attendances (
        id, session_id, meeting_id, class_id, student_id, status, method, recorded_at, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, 'MANUAL_DOSEN', CURRENT_TIMESTAMP, $7)
      ON CONFLICT (meeting_id, student_id) DO UPDATE
      SET 
        status = EXCLUDED.status,
        method = 'MANUAL_DOSEN',
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [attId, session.id, meetingId, session.classId, studentId, status, notes || null]);

    res.json({
      data: {
        message: `Status presensi mahasiswa berhasil diubah menjadi ${status}.`,
        attendance: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. GET CLASS ATTENDANCE SUMMARY (REKAPITULASI SEMESTER KELAS)
// =========================================================================
export async function getClassAttendanceSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const classId = req.params.classId as string;

    // 1. Ambil info kelas
    const classRes = await db.query(`
      SELECT 
        c.id,
        c.class_name as name,
        co.code,
        co.name as "courseName",
        co.credits,
        COALESCE(u.name, 'Dosen Pengampu') as "lecturerName",
        u.identity_number as "lecturerNidn"
      FROM course_classes c
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.class_id = c.id AND cl.is_primary = true
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE c.id = $1
    `, [classId]);

    if (classRes.rows.length === 0) {
      res.status(404).json({ error: { message: 'Kelas tidak ditemukan.' } });
      return;
    }

    // 2. Ambil daftar pertemuan
    const meetingsRes = await db.query(`
      SELECT 
        id,
        meeting_number as "meetingNumber",
        title,
        scheduled_date as "scheduledDate",
        status
      FROM course_meetings
      WHERE class_id = $1
      ORDER BY meeting_number ASC
    `, [classId]);

    // 3. Ambil seluruh mahasiswa dan matriks presensinya
    const studentsRes = await db.query(`
      SELECT 
        u.id as "studentId",
        u.name as "studentName",
        u.identity_number as "studentNim"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      WHERE ce.class_id = $1
      ORDER BY u.identity_number ASC
    `, [classId]);

    const attendancesRes = await db.query(`
      SELECT 
        meeting_id as "meetingId",
        student_id as "studentId",
        status,
        method
      FROM student_attendances
      WHERE class_id = $1
    `, [classId]);

    const attMap = new Map<string, string>();
    for (const a of attendancesRes.rows) {
      attMap.set(`${a.meetingId}_${a.studentId}`, a.status);
    }

    const totalMeetings = meetingsRes.rows.length || 1;

    const recap = studentsRes.rows.map(st => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;

      const meetingStatuses: Record<string, string> = {};

      for (const m of meetingsRes.rows) {
        const stKey = `${m.id}_${st.studentId}`;
        const status = attMap.get(stKey) || 'ALPA';
        meetingStatuses[m.meetingNumber] = status;

        if (status === 'HADIR') hadir++;
        else if (status === 'SAKIT') sakit++;
        else if (status === 'IZIN') izin++;
        else alpa++;
      }

      const percentage = Math.round((hadir / totalMeetings) * 100);
      const isEligibleForExam = percentage >= 75; // Standar minimal 75% kehadiran

      return {
        studentId: st.studentId,
        studentName: st.studentName,
        studentNim: st.studentNim,
        hadir,
        sakit,
        izin,
        alpa,
        totalMeetings,
        percentage,
        isEligibleForExam,
        meetingStatuses
      };
    });

    res.json({
      data: {
        classInfo: classRes.rows[0],
        meetings: meetingsRes.rows,
        recap
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. GET STUDENT ATTENDANCE HISTORY (RIWAYAT PRESENSI MAHASISWA LOGIN)
// =========================================================================
export async function getStudentAttendanceHistory(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const studentId = req.user?.id;

    const historyRes = await db.query(`
      SELECT 
        c.id as "classId",
        c.class_name as "className",
        co.name as "courseName",
        co.code as "courseCode",
        co.credits,
        COALESCE(u.name, 'Dosen Pengampu') as "lecturerName",
        COUNT(DISTINCT m.id) as "totalMeetings",
        COUNT(CASE WHEN sa.status = 'HADIR' THEN 1 END) as hadir,
        COUNT(CASE WHEN sa.status = 'SAKIT' THEN 1 END) as sakit,
        COUNT(CASE WHEN sa.status = 'IZIN' THEN 1 END) as izin,
        COUNT(CASE WHEN sa.status = 'ALPA' OR sa.status IS NULL THEN 1 END) as alpa
      FROM class_enrollments ce
      JOIN course_classes c ON c.id = ce.class_id
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.class_id = c.id AND cl.is_primary = true
      LEFT JOIN users u ON u.id = cl.lecturer_id
      LEFT JOIN course_meetings m ON m.class_id = c.id
      LEFT JOIN student_attendances sa ON sa.meeting_id = m.id AND sa.student_id = ce.student_id
      WHERE ce.student_id = $1
      GROUP BY c.id, c.class_name, co.name, co.code, co.credits, u.name
    `, [studentId]);

    const formatted = historyRes.rows.map(row => {
      const total = parseInt(row.totalMeetings, 10) || 1;
      const hadir = parseInt(row.hadir, 10) || 0;
      const percentage = Math.round((hadir / total) * 100);
      return {
        ...row,
        percentage,
        isEligibleForExam: percentage >= 75
      };
    });

    res.json({
      data: formatted
    });
  } catch (err) {
    next(err);
  }
}
