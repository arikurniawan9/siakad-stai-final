import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. STATISTIK RINGKASAN MATA KULIAH & KELAS PERKULIAHAN
// =========================================================================
export async function getCoursesSummary(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalCoursesRes = await db.query('SELECT COUNT(*) as count, COALESCE(SUM(credits), 0) as "totalCredits" FROM courses WHERE is_active = TRUE');
    const totalAllCoursesRes = await db.query('SELECT COUNT(*) as count FROM courses');
    const totalClassesRes = await db.query('SELECT COUNT(*) as count FROM course_classes WHERE is_active = TRUE');
    const totalStudentsEnrolledRes = await db.query('SELECT COUNT(DISTINCT student_id) as count FROM class_enrollments');
    const courseTypeRes = await db.query(`
      SELECT course_type as "courseType", COUNT(*) as count 
      FROM courses 
      GROUP BY course_type 
      ORDER BY count DESC
    `);
    const prodiBreakdownRes = await db.query(`
      SELECT COALESCE(sp.name, 'Mata Kuliah Umum (MKDU)') as "prodiName", COUNT(c.id) as count
      FROM courses c
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      GROUP BY sp.name
      ORDER BY count DESC
    `);

    res.json({
      data: {
        totalActiveCourses: parseInt(totalCoursesRes.rows[0]?.count || '0', 10),
        totalAllCourses: parseInt(totalAllCoursesRes.rows[0]?.count || '0', 10),
        totalCredits: parseInt(totalCoursesRes.rows[0]?.totalCredits || '0', 10),
        totalActiveClasses: parseInt(totalClassesRes.rows[0]?.count || '0', 10),
        totalStudentsEnrolled: parseInt(totalStudentsEnrolledRes.rows[0]?.count || '0', 10),
        courseTypeBreakdown: courseTypeRes.rows,
        prodiBreakdown: prodiBreakdownRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. DAFTAR MATA KULIAH MASTER (DENGAN FILTER LENGKAP)
// =========================================================================
export async function getCourses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { prodiId, semester, courseType, status, search } = req.query;

    let query = `
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits,
        c.theory_credits as "theoryCredits",
        c.practical_credits as "practicalCredits",
        c.study_program_id as "studyProgramId",
        COALESCE(sp.name, 'Mata Kuliah Umum Institusi') as "studyProgramName",
        COALESCE(sp.code, 'MKDU') as "studyProgramCode",
        c.semester_recommended as "semesterRecommended",
        c.course_type as "courseType",
        c.description,
        c.is_active as "isActive",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt",
        (SELECT COUNT(*) FROM course_classes cc WHERE cc.course_id = c.id AND cc.is_active = TRUE) as "activeClassesCount",
        (SELECT COUNT(ce.id) FROM class_enrollments ce JOIN course_classes cc ON cc.id = ce.class_id WHERE cc.course_id = c.id) as "enrolledStudentsCount"
      FROM courses c
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (prodiId && prodiId !== 'SEMUA') {
      if (prodiId === 'MKDU') {
        query += ` AND c.study_program_id IS NULL`;
      } else {
        params.push(prodiId);
        query += ` AND c.study_program_id = $${params.length}`;
      }
    }

    if (semester && semester !== 'SEMUA') {
      params.push(parseInt(semester as string, 10));
      query += ` AND c.semester_recommended = $${params.length}`;
    }

    if (courseType && courseType !== 'SEMUA') {
      params.push(courseType);
      query += ` AND c.course_type = $${params.length}`;
    }

    if (status === 'AKTIF') {
      query += ` AND c.is_active = TRUE`;
    } else if (status === 'NONAKTIF') {
      query += ` AND c.is_active = FALSE`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (c.name ILIKE $${params.length} OR c.code ILIKE $${params.length} OR sp.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY c.semester_recommended ASC, c.code ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. DETAIL MATA KULIAH LENGKAP BESERTA ROMBEL KELAS
// =========================================================================
export async function getCourseById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const courseRes = await db.query(`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits,
        c.theory_credits as "theoryCredits",
        c.practical_credits as "practicalCredits",
        c.study_program_id as "studyProgramId",
        COALESCE(sp.name, 'Mata Kuliah Umum Institusi') as "studyProgramName",
        COALESCE(sp.code, 'MKDU') as "studyProgramCode",
        c.semester_recommended as "semesterRecommended",
        c.course_type as "courseType",
        c.description,
        c.is_active as "isActive",
        c.created_at as "createdAt",
        c.updated_at as "updatedAt"
      FROM courses c
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      WHERE c.id = $1
    `, [id]);

    if (courseRes.rows.length === 0) {
      res.status(404).json({ error: 'Mata Kuliah tidak ditemukan.' });
      return;
    }

    const course = courseRes.rows[0];

    // Ambil rombel kelas yang dibuka
    const classesRes = await db.query(`
      SELECT 
        cc.id,
        cc.class_name as "className",
        cc.academic_year as "academicYear",
        cc.semester_id as "semesterId",
        s.name as "semesterName",
        cc.capacity,
        cc.room,
        cc.day_of_week as "dayOfWeek",
        cc.start_time as "startTime",
        cc.end_time as "endTime",
        cc.delivery_mode as "deliveryMode",
        cc.is_active as "isActive",
        cc.status,
        COALESCE(u.name, 'Belum Ditugaskan') as "lecturerName",
        COALESCE(u.identity_number, '') as "lecturerNidn",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = cc.id) as "enrolledCount"
      FROM course_classes cc
      JOIN semesters s ON s.id = cc.semester_id
      LEFT JOIN class_lecturers cl ON cl.class_id = cc.id AND cl.is_primary = TRUE
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE cc.course_id = $1
      ORDER BY cc.is_active DESC, cc.class_name ASC
    `, [id]);

    res.json({
      data: {
        ...course,
        classes: classesRes.rows
      }
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. TAMBAH MATA KULIAH BARU
// =========================================================================
export async function createCourse(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      code,
      name,
      credits = 3,
      theoryCredits = 2,
      practicalCredits = 1,
      studyProgramId,
      semesterRecommended = 1,
      courseType = 'WAJIB_PRODI',
      description
    } = req.body;

    if (!code || !name) {
      res.status(400).json({ error: 'Kode Mata Kuliah dan Nama Mata Kuliah wajib diisi.' });
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const cleanId = `crs-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Cek duplikasi kode
    const existing = await db.query('SELECT id FROM courses WHERE code = $1 OR id = $2', [cleanCode, cleanId]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: `Mata Kuliah dengan kode '${cleanCode}' sudah terdaftar.` });
      return;
    }

    const insertRes = await db.query(`
      INSERT INTO courses (
        id, code, name, credits, theory_credits, practical_credits, 
        study_program_id, semester_recommended, course_type, is_active, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE, $10)
      RETURNING *
    `, [
      cleanId,
      cleanCode,
      name.trim(),
      parseInt(credits, 10) || 3,
      parseInt(theoryCredits, 10) || 2,
      parseInt(practicalCredits, 10) || 1,
      studyProgramId && studyProgramId !== 'MKDU' ? studyProgramId : null,
      parseInt(semesterRecommended, 10) || 1,
      courseType,
      description?.trim() || null
    ]);

    res.status(201).json({
      data: insertRes.rows[0],
      message: `Mata Kuliah ${name} (${cleanCode}) berhasil ditambahkan ke kurikulum.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 5. PERBARUI MATA KULIAH
// =========================================================================
export async function updateCourse(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      name,
      credits,
      theoryCredits,
      practicalCredits,
      studyProgramId,
      semesterRecommended,
      courseType,
      description,
      isActive
    } = req.body;

    const check = await db.query('SELECT id, name FROM courses WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Mata Kuliah tidak ditemukan.' });
      return;
    }

    const updateRes = await db.query(`
      UPDATE courses
      SET 
        name = COALESCE($1, name),
        credits = COALESCE($2, credits),
        theory_credits = COALESCE($3, theory_credits),
        practical_credits = COALESCE($4, practical_credits),
        study_program_id = $5,
        semester_recommended = COALESCE($6, semester_recommended),
        course_type = COALESCE($7, course_type),
        description = COALESCE($8, description),
        is_active = COALESCE($9, is_active),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `, [
      name?.trim(),
      credits !== undefined ? parseInt(credits, 10) : undefined,
      theoryCredits !== undefined ? parseInt(theoryCredits, 10) : undefined,
      practicalCredits !== undefined ? parseInt(practicalCredits, 10) : undefined,
      studyProgramId && studyProgramId !== 'MKDU' ? studyProgramId : null,
      semesterRecommended !== undefined ? parseInt(semesterRecommended, 10) : undefined,
      courseType,
      description?.trim(),
      isActive !== undefined ? Boolean(isActive) : undefined,
      id
    ]);

    res.json({
      data: updateRes.rows[0],
      message: `Data Mata Kuliah ${updateRes.rows[0].name} berhasil diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 6. TOGGLE STATUS MATA KULIAH
// =========================================================================
export async function toggleCourseStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query('SELECT id, name, is_active FROM courses WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Mata Kuliah tidak ditemukan.' });
      return;
    }

    const nextState = !current.rows[0].is_active;

    await db.query(`
      UPDATE courses
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [nextState, id]);

    res.json({
      data: {
        id,
        isActive: nextState
      },
      message: `Status Mata Kuliah ${current.rows[0].name} berhasil diubah menjadi ${nextState ? 'Aktif' : 'Nonaktif'}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 7. DAFTAR SELURUH KELAS PERKULIAHAN
// =========================================================================
export async function getAllClasses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { semesterId, prodiId, search } = req.query;

    let query = `
      SELECT 
        cc.id,
        cc.class_name as "className",
        cc.academic_year as "academicYear",
        cc.semester_id as "semesterId",
        s.name as "semesterName",
        s.is_current as "isCurrentSemester",
        c.id as "courseId",
        c.code as "courseCode",
        c.name as "courseName",
        c.credits,
        c.course_type as "courseType",
        sp.id as "studyProgramId",
        COALESCE(sp.name, 'Mata Kuliah Umum Institusi') as "studyProgramName",
        COALESCE(sp.code, 'MKDU') as "studyProgramCode",
        cc.capacity,
        cc.room,
        cc.day_of_week as "dayOfWeek",
        cc.start_time as "startTime",
        cc.end_time as "endTime",
        cc.delivery_mode as "deliveryMode",
        cc.is_active as "isActive",
        cc.status,
        cl.lecturer_id as "lecturerId",
        COALESCE(u.name, 'Belum Ditugaskan') as "lecturerName",
        COALESCE(u.identity_number, '') as "lecturerNidn",
        (SELECT COUNT(*) FROM class_enrollments ce WHERE ce.class_id = cc.id) as "enrolledCount"
      FROM course_classes cc
      JOIN courses c ON c.id = cc.course_id
      JOIN semesters s ON s.id = cc.semester_id
      LEFT JOIN study_programs sp ON sp.id = c.study_program_id
      LEFT JOIN class_lecturers cl ON cl.class_id = cc.id AND cl.is_primary = TRUE
      LEFT JOIN users u ON u.id = cl.lecturer_id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (semesterId && semesterId !== 'SEMUA') {
      params.push(semesterId);
      query += ` AND cc.semester_id = $${params.length}`;
    }

    if (prodiId && prodiId !== 'SEMUA') {
      if (prodiId === 'MKDU') {
        query += ` AND c.study_program_id IS NULL`;
      } else {
        params.push(prodiId);
        query += ` AND c.study_program_id = $${params.length}`;
      }
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      params.push(`%${search.trim()}%`);
      query += ` AND (cc.class_name ILIKE $${params.length} OR c.name ILIKE $${params.length} OR c.code ILIKE $${params.length} OR u.name ILIKE $${params.length})`;
    }

    query += ` ORDER BY s.is_current DESC, c.code ASC, cc.class_name ASC`;

    const result = await db.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 8. BUKA KELAS PERKULIAHAN BARU
// =========================================================================
export async function createClass(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      courseId,
      semesterId,
      className,
      lecturerId,
      capacity = 40,
      room = 'Ruang Kuliah Gedung A',
      dayOfWeek = 'Senin',
      startTime = '08:00:00',
      endTime = '10:30:00',
      deliveryMode = 'HYBRID'
    } = req.body;

    if (!courseId || !semesterId || !className) {
      res.status(400).json({ error: 'Mata Kuliah, Semester, dan Nama Kelas wajib diisi.' });
      return;
    }

    // Ambil data semester
    const semRes = await db.query('SELECT name, academic_year_id FROM semesters WHERE id = $1', [semesterId]);
    const semName = semRes.rows[0]?.name || '2026/2027 Ganjil';

    const id = `cls-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const externalId = `EXT-${id.toUpperCase()}`;

    await db.transaction(async (client) => {
      await client.query(`
        INSERT INTO course_classes (
          id, course_id, semester_id, class_name, academic_year, 
          source_system, external_id, capacity, room, day_of_week, 
          start_time, end_time, delivery_mode, is_active, status
        )
        VALUES ($1, $2, $3, $4, $5, 'SIAKAD_ALITTIHAD', $6, $7, $8, $9, $10, $11, $12, TRUE, 'AKTIF')
      `, [
        id,
        courseId,
        semesterId,
        className.trim(),
        semName,
        externalId,
        parseInt(capacity, 10) || 40,
        room?.trim() || 'Ruang Kuliah Gedung A',
        dayOfWeek,
        startTime,
        endTime,
        deliveryMode
      ]);

      // Tugaskan dosen pengampu jika dipilih
      if (lecturerId) {
        await client.query(`
          INSERT INTO class_lecturers (id, class_id, lecturer_id, is_primary)
          VALUES ($1, $2, $3, TRUE)
          ON CONFLICT (class_id, lecturer_id) DO UPDATE SET is_primary = TRUE
        `, [`cl-${id}`, id, lecturerId]);
      }
    });

    res.status(201).json({
      data: { id, className, courseId, semesterId },
      message: `Kelas perkuliahan ${className} berhasil dibuka.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 9. PERBARUI KELAS PERKULIAHAN
// =========================================================================
export async function updateClass(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const {
      className,
      lecturerId,
      capacity,
      room,
      dayOfWeek,
      startTime,
      endTime,
      deliveryMode,
      status,
      isActive
    } = req.body;

    const check = await db.query('SELECT id, class_name FROM course_classes WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Kelas perkuliahan tidak ditemukan.' });
      return;
    }

    await db.transaction(async (client) => {
      await client.query(`
        UPDATE course_classes
        SET 
          class_name = COALESCE($1, class_name),
          capacity = COALESCE($2, capacity),
          room = COALESCE($3, room),
          day_of_week = COALESCE($4, day_of_week),
          start_time = COALESCE($5, start_time),
          end_time = COALESCE($6, end_time),
          delivery_mode = COALESCE($7, delivery_mode),
          status = COALESCE($8, status),
          is_active = COALESCE($9, is_active),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $10
      `, [
        className?.trim(),
        capacity !== undefined ? parseInt(capacity, 10) : undefined,
        room?.trim(),
        dayOfWeek,
        startTime,
        endTime,
        deliveryMode,
        status,
        isActive !== undefined ? Boolean(isActive) : undefined,
        id
      ]);

      if (lecturerId) {
        // Reset primary lecturer
        await client.query('DELETE FROM class_lecturers WHERE class_id = $1', [id]);
        await client.query(`
          INSERT INTO class_lecturers (id, class_id, lecturer_id, is_primary)
          VALUES ($1, $2, $3, TRUE)
          ON CONFLICT (class_id, lecturer_id) DO UPDATE SET is_primary = TRUE
        `, [`cl-${id}`, id, lecturerId]);
      }
    });

    res.json({
      data: { id },
      message: `Informasi kelas perkuliahan berhasil diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 10. TOGGLE STATUS KELAS PERKULIAHAN
// =========================================================================
export async function toggleClassStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const current = await db.query('SELECT id, class_name, is_active FROM course_classes WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      res.status(404).json({ error: 'Kelas perkuliahan tidak ditemukan.' });
      return;
    }

    const nextState = !current.rows[0].is_active;

    await db.query(`
      UPDATE course_classes
      SET is_active = $1, status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `, [nextState, nextState ? 'AKTIF' : 'SELESAI', id]);

    res.json({
      data: { id, isActive: nextState },
      message: `Status kelas ${current.rows[0].class_name} berhasil diubah menjadi ${nextState ? 'Aktif' : 'Nonaktif'}.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 11. IMPOR MASSAL MATA KULIAH (BULK CREATE)
// =========================================================================
export async function bulkCreateCourses(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { courses } = req.body;

    if (!Array.isArray(courses) || courses.length === 0) {
      res.status(400).json({ error: 'Daftar mata kuliah tidak boleh kosong.' });
      return;
    }

    const prodiRes = await db.query('SELECT id, code, name FROM study_programs');
    const prodis = prodiRes.rows;

    let insertedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];
    const createdItems: any[] = [];

    await db.transaction(async (client) => {
      for (let i = 0; i < courses.length; i++) {
        const c = courses[i];
        if (!c.code || !c.name) {
          errors.push(`Baris #${i + 1}: Kode dan Nama Mata Kuliah wajib diisi.`);
          continue;
        }

        const cleanCode = String(c.code).trim().toUpperCase();
        const cleanName = String(c.name).trim();

        let matchedProdi = prodis.find(p => p.id === c.studyProgramId || p.code?.toLowerCase() === String(c.studyProgramId).toLowerCase());
        if (!matchedProdi) {
          const prodiQuery = String(c.studyProgramId || c.studyProgramName || '').toLowerCase();
          matchedProdi = prodis.find(p => p.name?.toLowerCase().includes(prodiQuery) || p.code?.toLowerCase().includes(prodiQuery));
        }
        const studyProgramId = matchedProdi ? matchedProdi.id : (prodis[0]?.id || 'prodi-pai');

        const existing = await client.query('SELECT id FROM courses WHERE code = $1', [cleanCode]);

        if (existing.rows.length > 0) {
          const courseId = existing.rows[0].id;
          await client.query(`
            UPDATE courses
            SET 
              name = $1,
              study_program_id = $2,
              credits = COALESCE($3, credits),
              semester_default = COALESCE($4, semester_default),
              course_type = COALESCE($5, course_type),
              updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
          `, [
            cleanName,
            studyProgramId,
            parseInt(c.credits, 10) || 2,
            parseInt(c.semesterDefault || c.semester, 10) || 1,
            c.courseType || 'WAJIB_PRODI',
            courseId
          ]);
          updatedCount++;
          createdItems.push({ id: courseId, code: cleanCode, name: cleanName });
        } else {
          const courseId = `mk-${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
          await client.query(`
            INSERT INTO courses (
              id, code, name, name_en, credits, semester_default, course_type, 
              study_program_id, curriculum_id, passing_grade, is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)
          `, [
            courseId,
            cleanCode,
            cleanName,
            c.nameEn || cleanName,
            parseInt(c.credits, 10) || 2,
            parseInt(c.semesterDefault || c.semester, 10) || 1,
            c.courseType || 'WAJIB_PRODI',
            studyProgramId,
            c.curriculumId || 'kur-2024-pai',
            c.passingGrade || 'C'
          ]);
          insertedCount++;
          createdItems.push({ id: courseId, code: cleanCode, name: cleanName });
        }
      }
    });

    res.status(201).json({
      data: {
        total: courses.length,
        inserted: insertedCount,
        updated: updatedCount,
        skipped: errors.length,
        errors,
        items: createdItems
      },
      message: `Impor massal berhasil: ${insertedCount} mata kuliah baru ditambahkan, ${updatedCount} diperbarui.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 12. HELPER PENGHAPUSAN KELAS KASKADE BERSIH
// =========================================================================
async function deleteClassCascade(client: any, classId: string): Promise<void> {
  // 1. Learning activities & progress
  await client.query(`
    DELETE FROM student_activity_progress 
    WHERE activity_id IN (SELECT id FROM learning_activities WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM learning_activities WHERE class_id = $1', [classId]);

  // 2. Discussions
  await client.query(`
    DELETE FROM discussion_posts 
    WHERE thread_id IN (SELECT id FROM discussion_threads WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM discussion_threads WHERE class_id = $1', [classId]);

  // 3. Assignments & submissions
  await client.query(`
    DELETE FROM assignment_submissions 
    WHERE assignment_id IN (SELECT id FROM assignments WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM assignments WHERE class_id = $1', [classId]);

  // 4. Quizzes & attempts
  await client.query(`
    DELETE FROM quiz_attempts 
    WHERE quiz_id IN (SELECT id FROM quizzes WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM quizzes WHERE class_id = $1', [classId]);

  // 5. Interactive videos & progress
  await client.query(`
    DELETE FROM student_video_progress 
    WHERE video_id IN (SELECT id FROM interactive_videos WHERE class_id = $1)
  `, [classId]);
  await client.query(`
    DELETE FROM video_checkpoints 
    WHERE video_id IN (SELECT id FROM interactive_videos WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM interactive_videos WHERE class_id = $1', [classId]);

  // 6. Materials & access logs
  await client.query(`
    DELETE FROM material_access_logs 
    WHERE material_id IN (SELECT id FROM materials WHERE class_id = $1)
  `, [classId]);
  await client.query('DELETE FROM materials WHERE class_id = $1', [classId]);

  // 7. Attendances & Sesi Presensi
  try {
    await client.query('DELETE FROM student_attendances WHERE class_id = $1', [classId]);
    await client.query('DELETE FROM lecturer_attendances WHERE class_id = $1', [classId]);
    await client.query('DELETE FROM meeting_attendance_sessions WHERE class_id = $1', [classId]);
  } catch {
    // Ignore if table does not exist
  }

  // 8. Meetings
  await client.query('DELETE FROM course_meetings WHERE class_id = $1', [classId]);

  // 8. RPS
  await client.query('DELETE FROM course_rps WHERE class_id = $1', [classId]);

  // 9. Schedules
  await client.query('DELETE FROM schedules WHERE class_id = $1', [classId]);

  // 10. Grades (if exists)
  try {
    await client.query('DELETE FROM course_grades WHERE class_id = $1', [classId]);
  } catch {
    // Ignore if table doesn't exist yet
  }

  // 11. Enrollments & Lecturers
  await client.query('DELETE FROM class_enrollments WHERE class_id = $1', [classId]);
  await client.query('DELETE FROM class_lecturers WHERE class_id = $1', [classId]);

  // 12. Course class itself
  await client.query('DELETE FROM course_classes WHERE id = $1', [classId]);
}

// =========================================================================
// 13. HAPUS KELAS PERKULIAHAN PERMANEN
// =========================================================================
export async function deleteClass(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);

    const check = await db.query('SELECT id, class_name, course_id FROM course_classes WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Kelas perkuliahan tidak ditemukan.' });
      return;
    }

    const className = check.rows[0].class_name;

    await db.transaction(async (client) => {
      await deleteClassCascade(client, id);
    });

    res.json({
      message: `Kelas perkuliahan '${className}' berhasil dihapus permanen beserta seluruh data terkait.`
    });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 14. HAPUS MATA KULIAH PERMANEN
// =========================================================================
export async function deleteCourse(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = String(req.params.id);

    const check = await db.query('SELECT id, code, name FROM courses WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      res.status(404).json({ error: 'Mata Kuliah tidak ditemukan.' });
      return;
    }

    const course = check.rows[0];

    await db.transaction(async (client) => {
      // 1. Cari seluruh kelas dari mata kuliah ini
      const classesRes = await client.query('SELECT id FROM course_classes WHERE course_id = $1', [id]);
      for (const row of classesRes.rows) {
        await deleteClassCascade(client, row.id);
      }

      // 2. Hapus mata kuliah
      await client.query('DELETE FROM courses WHERE id = $1', [id]);
    });

    res.json({
      message: `Mata Kuliah '${course.name}' (${course.code}) berhasil dihapus permanen dari kurikulum.`
    });
  } catch (err) {
    next(err);
  }
}

