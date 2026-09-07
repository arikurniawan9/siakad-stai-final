import { Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// Helper: Generate 6-digit Passcode
function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper: Generate Dynamic QR Token
function generateQrToken(meetingId: string | number): { token: string; expiresAt: Date } {
  const randomSalt = crypto.randomBytes(8).toString('hex');
  const timestamp = Date.now();
  const token = `QR_${meetingId}_${timestamp}_${randomSalt}`;
  const expiresAt = new Date(timestamp + 45 * 1000); // Valid 45 detik
  return { token, expiresAt };
}

/**
 * Helper: Resolve class meeting by ID (numeric DB ID or frontend string like 'mtg-cls-20261-pai301-a-01' or 'mtg-1-01')
 */
async function resolveClassMeeting(meetingId: string): Promise<any | null> {
  // 1. If pure numeric ID
  if (/^\d+$/.test(meetingId)) {
    const res = await db.query(`SELECT * FROM class_meetings WHERE id = $1`, [parseInt(meetingId, 10)]);
    if (res.rows.length > 0) return res.rows[0];
  }

  // 2. If starts with mtg- (e.g. mtg-cls-20261-pai301-a-01 or mtg-1-01)
  if (meetingId.startsWith('mtg-')) {
    const parts = meetingId.replace('mtg-', '').split('-');
    const meetingNumber = parseInt(parts[parts.length - 1], 10);
    const classKey = parts.slice(0, -1).join('-');

    const queryRes = await db.query(`
      SELECT cm.* 
      FROM class_meetings cm
      JOIN course_classes cc ON cc.id = cm.course_class_id
      WHERE (cc.code = $1 OR cc.id::text = $1) AND cm.meeting_number = $2
    `, [classKey, meetingNumber]);

    if (queryRes.rows.length > 0) return queryRes.rows[0];
  }

  // 3. Fallback: try finding by ID cast to text
  const directRes = await db.query(`SELECT * FROM class_meetings WHERE id::text = $1`, [meetingId]);
  if (directRes.rows.length > 0) return directRes.rows[0];

  return null;
}

/**
 * Helper: Resolve course class by ID or Code
 */
async function resolveCourseClass(classId: string): Promise<any | null> {
  const res = await db.query(`
    SELECT * FROM course_classes 
    WHERE id::text = $1 OR code = $1
  `, [classId]);
  return res.rows[0] || null;
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
    const rawMeetingId = req.params.meetingId as string;
    const meetingRow = await resolveClassMeeting(rawMeetingId);

    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan dalam database SIAKAD.' } });
      return;
    }

    const meetingDbId = meetingRow.id;

    // 1. Ambil data meeting & kelas terperinci
    const meetingRes = await db.query(`
      SELECT 
        m.id,
        m.course_class_id as "classId",
        m.meeting_number as "meetingNumber",
        m.topic as title,
        m.topic,
        m.meeting_date as "scheduledDate",
        '08:00' as "startTime",
        '09:40' as "endTime",
        c.name as "className",
        co.code as "classCode",
        co.name as "courseName",
        co.credits,
        COALESCE(u.name, 'Dr. H. M. Ridwan, M.Ag') as "lecturerName",
        COALESCE(u.id, cl.lecturer_id, 2) as "lecturerId"
      FROM class_meetings m
      JOIN course_classes c ON c.id = m.course_class_id
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.course_class_id = c.id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE m.id = $1
    `, [meetingDbId]);

    const meeting = meetingRes.rows[0];

    // 2. Data Sesi Presensi
    const session = {
      id: `ses-${meetingDbId}`,
      meetingId: rawMeetingId,
      classId: meeting.classId,
      lecturerId: meeting.lecturerId,
      sessionStatus: meetingRow.session_status || 'BELUM_DIBUKA',
      deliveryMode: meetingRow.delivery_mode || 'TATAP_MUKA',
      qrToken: meetingRow.qr_token || `QR_${meetingDbId}_${Date.now()}`,
      qrExpiresAt: meetingRow.qr_expires_at || new Date(Date.now() + 60000).toISOString(),
      passcode: meetingRow.passcode || '829415',
      openedAt: meetingRow.opened_at,
      closedAt: meetingRow.closed_at,
      teachingJournal: meetingRow.topic || meeting.topic,
      journalNotes: meetingRow.journal_notes || 'Perkuliahan berjalan kondusif sesuai RPS.',
      studentAttendanceRate: Number(meetingRow.student_attendance_rate || 0),
      createdAt: meetingRow.created_at,
      updatedAt: meetingRow.updated_at
    };

    // 3. Ambil daftar mahasiswa terdaftar & status presensinya di pertemuan ini
    const studentsRes = await db.query(`
      SELECT 
        u.id as "studentId",
        u.name as "studentName",
        u.identity_number as "studentNim",
        u.email as "studentEmail",
        COALESCE(sa.status, 'ALPA') as status,
        COALESCE(sa.method, 'MANUAL_DOSEN') as method,
        sa.recorded_at as "recordedAt",
        sa.notes,
        sa.attachment_url as "attachmentUrl"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      LEFT JOIN student_attendances sa ON sa.class_meeting_id = $1 AND sa.student_id = u.id
      WHERE ce.course_class_id = $2
      ORDER BY u.identity_number ASC
    `, [meetingDbId, meeting.classId]);

    // 4. Hitung ringkasan statistik
    const totalStudents = studentsRes.rows.length;
    const countHadir = studentsRes.rows.filter(s => s.status === 'HADIR').length;
    const countSakit = studentsRes.rows.filter(s => s.status === 'SAKIT').length;
    const countIzin = studentsRes.rows.filter(s => s.status === 'IZIN').length;
    const countAlpa = studentsRes.rows.filter(s => s.status === 'ALPA').length;
    const attendancePercentage = totalStudents > 0 ? Math.round((countHadir / totalStudents) * 100) : 0;

    res.json({
      data: {
        meeting: {
          ...meeting,
          id: rawMeetingId // Keep request ID format for frontend matching
        },
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
    const rawMeetingId = req.params.meetingId as string;
    const { deliveryMode, teachingJournal } = req.body;

    const meetingRow = await resolveClassMeeting(rawMeetingId);
    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meetingDbId = meetingRow.id;
    const { token, expiresAt } = generateQrToken(meetingDbId);
    const passcode = generatePasscode();

    const result = await db.query(`
      UPDATE class_meetings
      SET 
        session_status = 'DIBUKA',
        delivery_mode = COALESCE($1, delivery_mode),
        qr_token = $2,
        qr_expires_at = $3,
        passcode = $4,
        opened_at = COALESCE(opened_at, CURRENT_TIMESTAMP),
        closed_at = NULL,
        topic = COALESCE($5, topic),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [deliveryMode || 'TATAP_MUKA', token, expiresAt, passcode, teachingJournal || null, meetingDbId]);

    res.json({
      data: {
        message: 'Sesi presensi perkuliahan berhasil dibuka.',
        session: {
          ...result.rows[0],
          id: `ses-${meetingDbId}`,
          meetingId: rawMeetingId,
          sessionStatus: 'DIBUKA',
          qrToken: token,
          qrExpiresAt: expiresAt.toISOString(),
          passcode
        },
        qrToken: token,
        qrExpiresAt: expiresAt.toISOString(),
        passcode
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. REFRESH DYNAMIC QR TOKEN (AUTO REFRESH TIAP 20-40 DETIK)
// =========================================================================
export async function refreshQrToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawMeetingId = req.params.meetingId as string;
    const meetingRow = await resolveClassMeeting(rawMeetingId);

    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meetingDbId = meetingRow.id;
    const { token, expiresAt } = generateQrToken(meetingDbId);

    const result = await db.query(`
      UPDATE class_meetings
      SET 
        qr_token = $1,
        qr_expires_at = $2,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING qr_token as "qrToken", qr_expires_at as "qrExpiresAt", passcode
    `, [token, expiresAt, meetingDbId]);

    res.json({
      data: {
        qrToken: token,
        qrExpiresAt: expiresAt.toISOString(),
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
    const rawMeetingId = req.params.meetingId as string;
    const { teachingJournal, journalNotes } = req.body;

    const meetingRow = await resolveClassMeeting(rawMeetingId);
    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meetingDbId = meetingRow.id;

    // Hitung persentase kehadiran
    const statsRes = await db.query(`
      SELECT 
        COUNT(ce.id) as total,
        COUNT(CASE WHEN sa.status = 'HADIR' THEN 1 END) as hadir
      FROM class_enrollments ce
      LEFT JOIN student_attendances sa ON sa.class_meeting_id = $1 AND sa.student_id = ce.student_id
      WHERE ce.course_class_id = $2
    `, [meetingDbId, meetingRow.course_class_id]);

    const total = parseInt(statsRes.rows[0]?.total || '0', 10);
    const hadir = parseInt(statsRes.rows[0]?.hadir || '0', 10);
    const finalRate = total > 0 ? (hadir / total) * 100 : 0;

    const result = await db.query(`
      UPDATE class_meetings
      SET 
        session_status = 'DITUTUP',
        closed_at = CURRENT_TIMESTAMP,
        topic = COALESCE($1, topic),
        journal_notes = COALESCE($2, journal_notes),
        student_attendance_rate = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [teachingJournal || null, journalNotes || null, finalRate.toFixed(2), meetingDbId]);

    res.json({
      data: {
        message: 'Sesi presensi perkuliahan berhasil ditutup.',
        session: {
          ...result.rows[0],
          id: `ses-${meetingDbId}`,
          meetingId: rawMeetingId,
          sessionStatus: 'DITUTUP'
        },
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
    const rawMeetingId = req.params.meetingId as string;
    const studentId = req.user?.id;
    const { qrToken, passcode, method, notes, attachmentUrl } = req.body;

    if (!studentId) {
      res.status(401).json({ error: { message: 'Autentikasi diperlukan.' } });
      return;
    }

    const meetingRow = await resolveClassMeeting(rawMeetingId);
    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meetingDbId = meetingRow.id;
    const isLeaveRequest = method === 'SURAT_IZIN' || req.body.status === 'SAKIT' || req.body.status === 'IZIN';

    if (!isLeaveRequest) {
      if (meetingRow.session_status !== 'DIBUKA') {
        res.status(400).json({ error: { message: 'Sesi presensi belum dibuka atau telah ditutup oleh dosen pengampu.' } });
        return;
      }

      // Validasi token QR atau passcode
      if (method === 'QR_SCAN') {
        if (!qrToken || (meetingRow.qr_token && meetingRow.qr_token !== qrToken)) {
          res.status(400).json({ error: { message: 'QR Code telah kedaluwarsa atau tidak valid. Silakan scan ulang layar proyektor dosen.' } });
          return;
        }
      } else if (method === 'PASSCODE') {
        if (!passcode || (meetingRow.passcode && meetingRow.passcode !== passcode.toString().trim())) {
          res.status(400).json({ error: { message: 'Kode 6-digit presensi salah.' } });
          return;
        }
      }
    }

    // Pastikan mahasiswa terdaftar di kelas (auto-enroll jika belum)
    const enrollmentRes = await db.query(`
      SELECT id FROM class_enrollments WHERE course_class_id = $1 AND student_id = $2
    `, [meetingRow.course_class_id, studentId]);

    if (enrollmentRes.rows.length === 0) {
      await db.query(`
        INSERT INTO class_enrollments (course_class_id, student_id, status, created_at, updated_at)
        VALUES ($1, $2, 'TERDAFTAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT DO NOTHING
      `, [meetingRow.course_class_id, studentId]);
    }

    // Upsert student_attendances
    const statusVal = isLeaveRequest ? (req.body.status || 'IZIN') : 'HADIR';
    const methodVal = method || 'QR_SCAN';

    const insertRes = await db.query(`
      INSERT INTO student_attendances (
        class_meeting_id, student_id, status, method, recorded_at, notes, attachment_url, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (class_meeting_id, student_id) DO UPDATE
      SET 
        status = EXCLUDED.status,
        method = EXCLUDED.method,
        recorded_at = CURRENT_TIMESTAMP,
        notes = EXCLUDED.notes,
        attachment_url = COALESCE(EXCLUDED.attachment_url, student_attendances.attachment_url),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [meetingDbId, studentId, statusVal, methodVal, notes || null, attachmentUrl || null]);

    res.json({
      data: {
        message: statusVal === 'HADIR' ? 'Presensi kehadiran berhasil dicatat ke database SIAKAD.' : 'Pengajuan izin/sakit berhasil dikirimkan.',
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
    const rawMeetingId = req.params.meetingId as string;
    const rawStudentId = req.params.studentId as string;
    const { status, notes } = req.body;

    const meetingRow = await resolveClassMeeting(rawMeetingId);
    if (!meetingRow) {
      res.status(404).json({ error: { message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    const meetingDbId = meetingRow.id;

    // Resolve student numeric ID
    let studentDbId = rawStudentId;
    if (!/^\d+$/.test(rawStudentId)) {
      // Find user by externalId or identityNumber
      const uRes = await db.query(`SELECT id FROM users WHERE id::text = $1 OR identity_number = $1 LIMIT 1`, [rawStudentId]);
      if (uRes.rows.length > 0) studentDbId = uRes.rows[0].id;
    }

    const result = await db.query(`
      INSERT INTO student_attendances (
        class_meeting_id, student_id, status, method, recorded_at, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, 'MANUAL_DOSEN', CURRENT_TIMESTAMP, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (class_meeting_id, student_id) DO UPDATE
      SET 
        status = EXCLUDED.status,
        method = 'MANUAL_DOSEN',
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [meetingDbId, studentDbId, status, notes || null]);

    res.json({
      data: {
        message: `Status presensi mahasiswa berhasil diperbarui di database SIAKAD menjadi ${status}.`,
        attendance: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. GET CLASS ATTENDANCE SUMMARY (REKAPITULASI SEMESTER KELAS 16 PERTEMUAN)
// =========================================================================
export async function getClassAttendanceSummary(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawClassId = req.params.classId as string;
    const classRow = await resolveCourseClass(rawClassId);

    if (!classRow) {
      res.status(404).json({ error: { message: 'Kelas perkuliahan tidak ditemukan.' } });
      return;
    }

    const classDbId = classRow.id;

    // 1. Ambil info kelas
    const classRes = await db.query(`
      SELECT 
        c.id,
        c.name,
        co.code,
        co.name as "courseName",
        co.credits,
        COALESCE(u.name, 'Dr. H. M. Ridwan, M.Ag') as "lecturerName",
        u.identity_number as "lecturerNidn"
      FROM course_classes c
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.course_class_id = c.id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE c.id = $1
    `, [classDbId]);

    // 2. Ambil 16 pertemuan kelas
    const meetingsRes = await db.query(`
      SELECT 
        id,
        meeting_number as "meetingNumber",
        topic as title,
        meeting_date as "scheduledDate",
        'DITERBITKAN' as status
      FROM class_meetings
      WHERE course_class_id = $1
      ORDER BY meeting_number ASC
    `, [classDbId]);

    // 3. Ambil mahasiswa terdaftar
    const studentsRes = await db.query(`
      SELECT 
        u.id as "studentId",
        u.name as "studentName",
        u.identity_number as "studentNim"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      WHERE ce.course_class_id = $1
      ORDER BY u.identity_number ASC
    `, [classDbId]);

    // 4. Ambil seluruh record presensi untuk kelas ini
    const attendancesRes = await db.query(`
      SELECT 
        sa.class_meeting_id as "meetingId",
        cm.meeting_number as "meetingNumber",
        sa.student_id as "studentId",
        sa.status,
        sa.method
      FROM student_attendances sa
      JOIN class_meetings cm ON cm.id = sa.class_meeting_id
      WHERE cm.course_class_id = $1
    `, [classDbId]);

    const attMap = new Map<string, string>();
    for (const a of attendancesRes.rows) {
      attMap.set(`${a.meetingNumber}_${a.studentId}`, a.status);
    }

    const totalMeetings = 16;

    const recap = studentsRes.rows.map(st => {
      let hadir = 0;
      let sakit = 0;
      let izin = 0;
      let alpa = 0;

      const meetingStatuses: Record<string, string> = {};

      for (let m = 1; m <= totalMeetings; m++) {
        const stKey = `${m}_${st.studentId}`;
        const status = attMap.get(stKey) || (m === 1 ? 'HADIR' : '-');
        meetingStatuses[m] = status;

        if (status === 'HADIR') hadir++;
        else if (status === 'SAKIT') sakit++;
        else if (status === 'IZIN') izin++;
        else if (status === 'ALPA') alpa++;
      }

      const calculatedMeetings = hadir + sakit + izin + alpa || 1;
      const percentage = Math.round((hadir / calculatedMeetings) * 100);
      const isEligibleForExam = percentage >= 75;

      return {
        studentId: st.studentId,
        studentName: st.studentName,
        studentNim: st.studentNim,
        hadir,
        sakit,
        izin,
        alpa,
        totalMeetings: calculatedMeetings,
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
        c.name as "className",
        co.name as "courseName",
        co.code as "courseCode",
        co.credits,
        COALESCE(u.name, 'Dosen Pengampu') as "lecturerName",
        COUNT(DISTINCT m.id) as "totalMeetings",
        COUNT(CASE WHEN sa.status = 'HADIR' THEN 1 END) as hadir,
        COUNT(CASE WHEN sa.status = 'SAKIT' THEN 1 END) as sakit,
        COUNT(CASE WHEN sa.status = 'IZIN' THEN 1 END) as izin,
        COUNT(CASE WHEN sa.status = 'ALPA' THEN 1 END) as alpa
      FROM class_enrollments ce
      JOIN course_classes c ON c.id = ce.course_class_id
      JOIN courses co ON co.id = c.course_id
      LEFT JOIN class_lecturers cl ON cl.course_class_id = c.id
      LEFT JOIN users u ON u.id = cl.lecturer_id
      LEFT JOIN class_meetings m ON m.course_class_id = c.id
      LEFT JOIN student_attendances sa ON sa.class_meeting_id = m.id AND sa.student_id = ce.student_id
      WHERE ce.student_id = $1
      GROUP BY c.id, c.name, co.name, co.code, co.credits, u.name
    `, [studentId]);

    const formatted = historyRes.rows.map(row => {
      const total = parseInt(row.totalMeetings, 10) || 16;
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
