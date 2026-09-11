import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getClasses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    let query = `
      SELECT 
        cc.id,
        cc.code as "classCode",
        cc.name as "className",
        COALESCE(ap.name, 'Semester Ganjil 2026/2027') as "academicYear",
        c.id as "courseId",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        COALESCE(sp.code, CASE 
          WHEN c.code LIKE 'PAI%' THEN 'PAI'
          WHEN c.code LIKE 'STAIPD%' THEN 'PIAUD'
          WHEN c.code LIKE 'MKU%' THEN 'MKU'
          ELSE 'PAI'
        END) as "studyProgramCode",
        COALESCE(sp.name, CASE 
          WHEN c.code LIKE 'PAI%' THEN 'Pendidikan Agama Islam'
          WHEN c.code LIKE 'STAIPD%' THEN 'Pendidikan Islam Anak Usia Dini'
          WHEN c.code LIKE 'MKU%' THEN 'Mata Kuliah Umum'
          ELSE 'Pendidikan Agama Islam'
        END) as "studyProgram",
        COALESCE(cl_primary.lecturer_id, cl_any.lecturer_id) as "lecturerId",
        COALESCE(u_primary.name, u_any.name, 'Dosen Belum Ditentukan') as "lecturerName",
        COALESCE(u_primary.identity_number, u_any.identity_number, '-') as "lecturerNidn",
        COALESCE(
          (SELECT STRING_AGG(DISTINCT lu_sub.name, ', ')
           FROM class_lecturers cl_sub
           JOIN users lu_sub ON lu_sub.id = cl_sub.lecturer_id
           WHERE cl_sub.course_class_id = cc.id),
          u_primary.name,
          u_any.name,
          'Dosen Belum Ditentukan'
        ) as "allLecturerNames",
        (SELECT ARRAY_TO_JSON(ARRAY_AGG(DISTINCT cl_sub.lecturer_id::text))
         FROM class_lecturers cl_sub
         WHERE cl_sub.course_class_id = cc.id) as "allLecturerIds",
        cs.day_of_week as "dayOfWeek",
        cs.start_time as "startTime",
        cs.end_time as "endTime",
        r.name as "roomName",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.course_class_id = cc.id) as "enrolledCount"
      FROM course_classes cc
      JOIN courses c ON c.id = cc.course_id
      LEFT JOIN academic_periods ap ON ap.id = cc.academic_period_id
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      LEFT JOIN class_lecturers cl_primary ON cl_primary.course_class_id = cc.id AND cl_primary.is_primary = TRUE
      LEFT JOIN users u_primary ON u_primary.id = cl_primary.lecturer_id
      LEFT JOIN LATERAL (
        SELECT cl_first.lecturer_id
        FROM class_lecturers cl_first
        WHERE cl_first.course_class_id = cc.id
        LIMIT 1
      ) cl_any ON TRUE
      LEFT JOIN users u_any ON u_any.id = cl_any.lecturer_id
      LEFT JOIN class_schedules cs ON cs.course_class_id = cc.id
      LEFT JOIN rooms r ON r.id = cs.room_id
      WHERE cc.status = 'AKTIF'
    `;
    const params: any[] = [];

    // Filter berdasarkan peran pengguna
    if (user.role === 'mahasiswa') {
      const cleanNim = (user.identityNumber || user.username || '').replace(/[^0-9]/g, '');
      const parsedId = /^\d+$/.test(String(user.id)) ? parseInt(String(user.id), 10) : null;

      query += ` AND (
        cc.id IN (
          SELECT ce.course_class_id 
          FROM class_enrollments ce
          JOIN users su ON su.id = ce.student_id
          WHERE ($1::bigint IS NOT NULL AND ce.student_id = $1::bigint)
             OR (NULLIF($2, '') IS NOT NULL AND (
                  su.identity_number = $2 
                  OR REPLACE(su.identity_number, '.', '') = $2 
                  OR su.username = $2
                ))
        )
        OR cc.id IN (
          SELECT ki.course_class_id 
          FROM krs_items ki 
          JOIN krs_submissions ks ON ks.id = ki.krs_submission_id 
          JOIN users ku ON ku.id = ks.student_id
          WHERE (($1::bigint IS NOT NULL AND ks.student_id = $1::bigint)
             OR (NULLIF($2, '') IS NOT NULL AND (
                  ku.identity_number = $2 
                  OR REPLACE(ku.identity_number, '.', '') = $2 
                  OR ku.username = $2
                )))
            AND ki.status = 'DISETUJUI'
        )
      )`;
      params.push(parsedId, cleanNim);
    } else if (user.role === 'dosen' || user.role === 'dosen_pa') {
      const cleanIdent = (user.identityNumber || user.username || '').replace(/[^0-9]/g, '');
      const parsedId = /^\d+$/.test(String(user.id)) ? parseInt(String(user.id), 10) : null;
      const userEmail = user.email ? user.email.trim().toLowerCase() : null;
      const userName = user.name ? user.name.trim().toLowerCase() : null;

      query += ` AND cc.id IN (
        SELECT cl.course_class_id 
        FROM class_lecturers cl
        JOIN users lu ON lu.id = cl.lecturer_id
        WHERE ($1::bigint IS NOT NULL AND cl.lecturer_id = $1::bigint)
           OR (NULLIF($2, '') IS NOT NULL AND (
                lu.identity_number = $2 
                OR REPLACE(lu.identity_number, '.', '') = $2 
                OR lu.username = $2
              ))
           OR (NULLIF($3, '') IS NOT NULL AND LOWER(lu.email) = $3)
           OR (NULLIF($4, '') IS NOT NULL AND LOWER(lu.name) = $4)
      )`;
      params.push(parsedId, cleanIdent, userEmail, userName);
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
