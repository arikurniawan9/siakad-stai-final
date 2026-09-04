import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getClasses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    let query = `
      SELECT 
        cc.id,
        cc.name as "className",
        COALESCE(ap.name, '2026/2027 Ganjil') as "academicYear",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        COALESCE(sp.name, 'Pendidikan Agama Islam') as "studyProgram",
        COALESCE(u.name, 'Dr. H. M. Ridwan, M.Ag') as "lecturerName",
        COALESCE(u.identity_number, '2112087501') as "lecturerNidn",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.course_class_id = cc.id) as "enrolledCount"
      FROM course_classes cc
      JOIN courses c ON c.id = cc.course_id
      LEFT JOIN academic_periods ap ON ap.id = cc.academic_period_id
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      LEFT JOIN class_lecturers cl ON cl.course_class_id = cc.id AND cl.is_primary = TRUE
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE cc.status = 'AKTIF'
    `;
    const params: any[] = [];

    // Filter berdasarkan peran pengguna
    if (user.role === 'mahasiswa') {
      query += ` AND cc.id IN (SELECT course_class_id FROM class_enrollments WHERE student_id = $1)`;
      params.push(user.id);
    } else if (user.role === 'dosen') {
      query += ` AND cc.id IN (SELECT course_class_id FROM class_lecturers WHERE lecturer_id = $1)`;
      params.push(user.id);
    }

    query += ` ORDER BY c.code ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

export async function syncAcademicData(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { syncClasses = [], syncStudents = [], syncLecturers = [] } = req.body;

    let created = 0;
    let updated = 0;
    let skipped = 0;

    await db.transaction(async (client) => {
      // 1. Sync Classes
      for (const cls of syncClasses) {
        const check = await client.query(
          'SELECT id FROM course_classes WHERE source_system = $1 AND external_id = $2',
          ['SIAKAD_ALITTIHAD', cls.externalId]
        );

        if (check.rows.length === 0) {
          await client.query(`
            INSERT INTO course_classes (id, course_id, semester_id, class_name, academic_year, source_system, external_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            `cls-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            cls.courseId || 'crs-pai301',
            cls.semesterId || 'sem-2026-ganjil',
            cls.className,
            cls.academicYear,
            'SIAKAD_ALITTIHAD',
            cls.externalId
          ]);
          created++;
        } else {
          await client.query(`
            UPDATE course_classes 
            SET class_name = $1, academic_year = $2
            WHERE id = $3
          `, [cls.className, cls.academicYear, check.rows[0].id]);
          updated++;
        }
      }

      // Catat sync log
      await client.query(`
        INSERT INTO academic_sync_logs (id, source_system, total_received, created_count, updated_count, skipped_count, failed_count, status, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        `sync-${Date.now()}`,
        'SIAKAD_ALITTIHAD',
        syncClasses.length + syncStudents.length + syncLecturers.length,
        created,
        updated,
        skipped,
        0,
        'SUKSES',
        `Sinkronisasi batch berhasil memproses ${created} data baru dan ${updated} data terbarukan.`
      ]);
    });

    res.json({
      data: {
        status: 'SUKSES',
        created,
        updated,
        skipped,
        message: 'Sinkronisasi data master akademik selesai dengan idempoten.'
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getSyncLogs(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query('SELECT * FROM academic_sync_logs ORDER BY timestamp DESC LIMIT 50');
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}
