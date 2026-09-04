import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

/**
 * SALAM LMS - PENGELOLAAN PERIODE AKADEMIK & SEMESTER
 * STAI AL-ITTIHAD CIANJUR
 */

/**
 * 1. Ambil Ringkasan Statistik Periode Aktif
 */
export async function getPeriodSummaryStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const activeSemesterRes = await db.query(`
      SELECT s.*, ay.name as "academicYearName"
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE s.is_active = TRUE OR s.is_current = TRUE
      LIMIT 1
    `);

    const activeSemester = activeSemesterRes.rows[0] || null;

    let totalClasses = 0;
    let totalStudents = 0;
    let totalLecturers = 0;

    if (activeSemester) {
      const statsRes = await db.query(`
        SELECT 
          COUNT(DISTINCT cc.id) as "totalClasses",
          COUNT(DISTINCT ce.student_id) as "totalStudents",
          COUNT(DISTINCT cl.lecturer_id) as "totalLecturers"
        FROM course_classes cc
        LEFT JOIN class_enrollments ce ON cc.id = ce.class_id
        LEFT JOIN class_lecturers cl ON cc.id = cl.class_id
        WHERE cc.semester_id = $1 AND cc.is_active = TRUE
      `, [activeSemester.id]);

      if (statsRes.rows.length > 0) {
        totalClasses = parseInt(statsRes.rows[0].totalClasses, 10) || 0;
        totalStudents = parseInt(statsRes.rows[0].totalStudents, 10) || 0;
        totalLecturers = parseInt(statsRes.rows[0].totalLecturers, 10) || 0;
      }
    }

    const totalYearsRes = await db.query('SELECT COUNT(*) as count FROM academic_years');
    const totalSemestersRes = await db.query('SELECT COUNT(*) as count FROM semesters');

    res.json({
      data: {
        activeSemester,
        stats: {
          totalAcademicYears: parseInt(totalYearsRes.rows[0].count, 10) || 0,
          totalSemesters: parseInt(totalSemestersRes.rows[0].count, 10) || 0,
          activeSemesterClassesCount: totalClasses,
          activeSemesterStudentsCount: totalStudents,
          activeSemesterLecturersCount: totalLecturers
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Ambil Daftar Tahun Akademik
 */
export async function getAcademicYears(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        ay.id,
        ay.name,
        ay.start_date as "startDate",
        ay.end_date as "endDate",
        ay.is_active as "isActive",
        ay.status,
        ay.description,
        ay.created_at as "createdAt",
        COUNT(s.id) as "semestersCount"
      FROM academic_years ay
      LEFT JOIN semesters s ON ay.id = s.academic_year_id
      GROUP BY ay.id
      ORDER BY ay.start_date DESC NULLS LAST, ay.created_at DESC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Tambah Tahun Akademik Baru
 */
export async function createAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, startDate, endDate, description } = req.body;
    const user = req.user!;

    if (!name || !startDate || !endDate) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Nama tahun akademik, tanggal mulai, dan tanggal selesai wajib diisi.' }
      });
      return;
    }

    const yearId = `ay-${name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const result = await db.query(`
      INSERT INTO academic_years (id, name, start_date, end_date, is_active, status, description)
      VALUES ($1, $2, $3, $4, FALSE, 'DRAF', $5)
      RETURNING id, name, start_date as "startDate", end_date as "endDate", is_active as "isActive", status, description
    `, [yearId, name, startDate, endDate, description || null]);

    // Catat Audit Trail
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'CREATE_ACADEMIC_YEAR', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Membuat tahun akademik baru: ${name} (${startDate} s.d. ${endDate})`,
      req.ip || '127.0.0.1'
    ]);

    res.status(201).json({ data: result.rows[0], message: 'Tahun akademik baru berhasil ditambahkan.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Ambil Daftar Semester Perkuliahan
 */
export async function getSemesters(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { academicYearId, status } = req.query;

    let query = `
      SELECT 
        s.id,
        s.academic_year_id as "academicYearId",
        ay.name as "academicYearName",
        s.semester_type as "semesterType",
        COALESCE(s.name, CONCAT('Semester ', s.semester_type, ' ', ay.name)) as "name",
        s.start_date as "startDate",
        s.end_date as "endDate",
        s.krs_start_date as "krsStartDate",
        s.krs_end_date as "krsEndDate",
        s.uts_start_date as "utsStartDate",
        s.uts_end_date as "utsEndDate",
        s.uas_start_date as "uasStartDate",
        s.uas_end_date as "uasEndDate",
        s.grade_deadline as "gradeDeadline",
        s.is_active as "isActive",
        s.is_current as "isCurrent",
        s.status,
        COUNT(DISTINCT cc.id) as "totalClassesCount",
        COUNT(DISTINCT ce.student_id) as "totalStudentsCount"
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      LEFT JOIN course_classes cc ON s.id = cc.semester_id
      LEFT JOIN class_enrollments ce ON cc.id = ce.class_id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (academicYearId) {
      params.push(academicYearId);
      conditions.push(`s.academic_year_id = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`s.status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += `
      GROUP BY s.id, ay.id, ay.name
      ORDER BY s.start_date DESC NULLS LAST, s.created_at DESC
    `;

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Tambah Semester Baru
 */
export async function createSemester(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      academicYearId,
      semesterType,
      name,
      startDate,
      endDate,
      krsStartDate,
      krsEndDate,
      utsStartDate,
      utsEndDate,
      uasStartDate,
      uasEndDate,
      gradeDeadline
    } = req.body;

    const user = req.user!;

    if (!academicYearId || !semesterType || !startDate || !endDate) {
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Tahun akademik, tipe semester, tanggal mulai, dan selesai wajib diisi.' }
      });
      return;
    }

    const yearRes = await db.query('SELECT name FROM academic_years WHERE id = $1', [academicYearId]);
    if (yearRes.rows.length === 0) {
      res.status(404).json({ error: { code: 'ACADEMIC_YEAR_NOT_FOUND', message: 'Tahun akademik tidak ditemukan.' } });
      return;
    }

    const yearName = yearRes.rows[0].name;
    const defaultName = name || `Semester ${semesterType === 'GANJIL' ? 'Ganjil' : semesterType === 'GENAP' ? 'Genap' : 'Pendek'} ${yearName}`;
    const semId = `sem-${academicYearId.replace('ay-', '')}-${semesterType.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const result = await db.query(`
      INSERT INTO semesters (
        id, academic_year_id, semester_type, name, start_date, end_date,
        krs_start_date, krs_end_date, uts_start_date, uts_end_date,
        uas_start_date, uas_end_date, grade_deadline, is_active, is_current, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, FALSE, FALSE, 'DRAF')
      RETURNING *
    `, [
      semId, academicYearId, semesterType, defaultName, startDate, endDate,
      krsStartDate || null, krsEndDate || null, utsStartDate || null, utsEndDate || null,
      uasStartDate || null, uasEndDate || null, gradeDeadline || null
    ]);

    // Catat Audit Log
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'CREATE_SEMESTER', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Membuat semester baru: ${defaultName} (${startDate} s.d. ${endDate})`,
      req.ip || '127.0.0.1'
    ]);

    res.status(201).json({ data: result.rows[0], message: 'Semester baru berhasil dibuat.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Perbarui Data Semester & Garis Waktu Akademik
 */
export async function updateSemester(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { semesterId } = req.params;
    const {
      name,
      startDate,
      endDate,
      krsStartDate,
      krsEndDate,
      utsStartDate,
      utsEndDate,
      uasStartDate,
      uasEndDate,
      gradeDeadline,
      status
    } = req.body;

    const user = req.user!;

    const existingRes = await db.query('SELECT * FROM semesters WHERE id = $1', [semesterId]);
    if (existingRes.rows.length === 0) {
      res.status(404).json({ error: { code: 'SEMESTER_NOT_FOUND', message: 'Semester tidak ditemukan.' } });
      return;
    }

    const existing = existingRes.rows[0];

    const result = await db.query(`
      UPDATE semesters SET
        name = COALESCE($1, name),
        start_date = COALESCE($2, start_date),
        end_date = COALESCE($3, end_date),
        krs_start_date = COALESCE($4, krs_start_date),
        krs_end_date = COALESCE($5, krs_end_date),
        uts_start_date = COALESCE($6, uts_start_date),
        uts_end_date = COALESCE($7, uts_end_date),
        uas_start_date = COALESCE($8, uas_start_date),
        uas_end_date = COALESCE($9, uas_end_date),
        grade_deadline = COALESCE($10, grade_deadline),
        status = COALESCE($11, status)
      WHERE id = $12
      RETURNING *
    `, [
      name || null,
      startDate || null,
      endDate || null,
      krsStartDate || null,
      krsEndDate || null,
      utsStartDate || null,
      utsEndDate || null,
      uasStartDate || null,
      uasEndDate || null,
      gradeDeadline || null,
      status || null,
      semesterId
    ]);

    // Catat Audit Log
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'UPDATE_SEMESTER', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Memperbarui linimasa semester ${existing.name || semesterId}. Status: ${status || existing.status}`,
      req.ip || '127.0.0.1'
    ]);

    res.json({ data: result.rows[0], message: 'Linimasa semester berhasil diperbarui.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 7. Aktifkan Periode Semester (Atomic Switch Transaction)
 */
export async function activateSemester(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { semesterId } = req.params;
    const user = req.user!;

    const targetRes = await db.query(`
      SELECT s.*, ay.id as "yearId", ay.name as "yearName"
      FROM semesters s
      JOIN academic_years ay ON s.academic_year_id = ay.id
      WHERE s.id = $1
    `, [semesterId]);

    if (targetRes.rows.length === 0) {
      res.status(404).json({ error: { code: 'SEMESTER_NOT_FOUND', message: 'Semester tidak ditemukan.' } });
      return;
    }

    const target = targetRes.rows[0];

    // Eksekusi Atomic Transaction
    const activatedSemester = await db.transaction(async (client) => {
      // 1. Non-aktifkan semua semester aktif sebelumnya
      await client.query(`
        UPDATE semesters 
        SET is_active = FALSE, is_current = FALSE, status = CASE WHEN status = 'AKTIF' THEN 'SELESAI' ELSE status END
        WHERE is_active = TRUE OR is_current = TRUE
      `);

      // 2. Non-aktifkan semua tahun akademik lain
      await client.query(`
        UPDATE academic_years
        SET is_active = FALSE, status = CASE WHEN status = 'AKTIF' THEN 'SELESAI' ELSE status END
        WHERE id <> $1
      `, [target.yearId]);

      // 3. Aktifkan tahun akademik induk
      await client.query(`
        UPDATE academic_years
        SET is_active = TRUE, status = 'AKTIF'
        WHERE id = $1
      `, [target.yearId]);

      // 4. Aktifkan semester target
      const updateRes = await client.query(`
        UPDATE semesters
        SET is_active = TRUE, is_current = TRUE, status = 'AKTIF'
        WHERE id = $1
        RETURNING *
      `, [semesterId]);

      // 5. Catat log audit di dalam transaksi
      await client.query(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
        VALUES ($1, $2, $3, $4, 'ACTIVATE_ACADEMIC_PERIOD', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
      `, [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.role,
        `Mengaktifkan periode perkuliahan aktif: ${target.name || semesterId} (${target.yearName})`,
        req.ip || '127.0.0.1'
      ]);

      return updateRes.rows[0];
    });

    res.json({
      data: activatedSemester,
      message: `Periode perkuliahan aktif berhasil dialihkan ke ${target.name || semesterId}.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 8. Arsipkan Periode Semester
 */
export async function archiveSemester(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { semesterId } = req.params;
    const user = req.user!;

    const result = await db.query(`
      UPDATE semesters 
      SET status = 'DIARSIPKAN', is_active = FALSE, is_current = FALSE
      WHERE id = $1
      RETURNING *
    `, [semesterId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'SEMESTER_NOT_FOUND', message: 'Semester tidak ditemukan.' } });
      return;
    }

    // Catat Audit Trail
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'ARCHIVE_SEMESTER', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Mengarsipkan periode semester ${result.rows[0].name || semesterId}`,
      req.ip || '127.0.0.1'
    ]);

    res.json({ data: result.rows[0], message: 'Periode semester berhasil diarsipkan.' });
  } catch (err) {
    next(err);
  }
}

/**
 * 9. Hapus Tahun Akademik
 */
export async function deleteAcademicYear(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const user = req.user!;

    const check = await db.query('SELECT id, name, is_active FROM academic_years WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Tahun akademik tidak ditemukan.' } });
      return;
    }

    if (check.rows[0].is_active) {
      res.status(400).json({ error: { code: 'ACTIVE_YEAR_CANNOT_BE_DELETED', message: 'Tahun akademik aktif tidak dapat dihapus. Silakan aktifkan tahun akademik lain terlebih dahulu.' } });
      return;
    }

    const yearName = check.rows[0].name;

    await db.transaction(async (client) => {
      // 1. Unlink kelas perkuliahan dari semester-semester di bawah tahun akademik ini
      await client.query(`
        UPDATE course_classes 
        SET semester_id = NULL 
        WHERE semester_id IN (SELECT id FROM semesters WHERE academic_year_id = $1)
      `, [id]);

      // 2. Hapus seluruh semester di bawah tahun akademik ini
      await client.query('DELETE FROM semesters WHERE academic_year_id = $1', [id]);

      // 3. Hapus tahun akademik
      await client.query('DELETE FROM academic_years WHERE id = $1', [id]);

      // 4. Catat log audit
      await client.query(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
        VALUES ($1, $2, $3, $4, 'DELETE_ACADEMIC_YEAR', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
      `, [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.role,
        `Menghapus tahun akademik ${yearName} (${id})`,
        req.ip || '127.0.0.1'
      ]);
    });

    res.json({ message: `Tahun akademik ${yearName} berhasil dihapus.` });
  } catch (err) {
    next(err);
  }
}

/**
 * 10. Hapus Semester
 */
export async function deleteSemester(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { semesterId } = req.params;
    const user = req.user!;

    const check = await db.query('SELECT id, name, is_active, is_current FROM semesters WHERE id = $1', [semesterId]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Semester tidak ditemukan.' } });
      return;
    }

    if (check.rows[0].is_active || check.rows[0].is_current) {
      res.status(400).json({ error: { code: 'ACTIVE_SEMESTER_CANNOT_BE_DELETED', message: 'Semester aktif tidak dapat dihapus. Silakan aktifkan semester lain terlebih dahulu.' } });
      return;
    }

    const semName = check.rows[0].name;

    await db.transaction(async (client) => {
      // 1. Unlink kelas perkuliahan
      await client.query('UPDATE course_classes SET semester_id = NULL WHERE semester_id = $1', [semesterId]);

      // 2. Hapus semester
      await client.query('DELETE FROM semesters WHERE id = $1', [semesterId]);

      // 3. Catat audit
      await client.query(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
        VALUES ($1, $2, $3, $4, 'DELETE_SEMESTER', 'ACADEMIC_PERIOD', $5, $6, 'SUKSES')
      `, [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.role,
        `Menghapus semester ${semName} (${semesterId})`,
        req.ip || '127.0.0.1'
      ]);
    });

    res.json({ message: `Semester ${semName} berhasil dihapus.` });
  } catch (err) {
    next(err);
  }
}
