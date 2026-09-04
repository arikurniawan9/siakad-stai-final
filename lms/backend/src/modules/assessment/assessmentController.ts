import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';
import { logger } from '../../config/logger.js';

// =========================================================================
// KUIS DARING & BANK SOAL
// =========================================================================

export async function getQuizzes(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const isStudent = user.role === 'mahasiswa';
    const { classId } = req.query;

    let query = `
      SELECT 
        q.id,
        q.class_id as "classId",
        q.meeting_id as "meetingId",
        q.title,
        q.description,
        q.start_date as "startDate",
        q.end_date as "endDate",
        q.duration_minutes as "durationMinutes",
        q.max_attempts as "maxAttempts",
        q.passing_score as "passingScore",
        q.status,
        c.name as "courseName",
        cm.meeting_number as "meetingNumber",
        jsonb_array_length(q.questions) as "questionsCount"
      FROM quizzes q
      JOIN course_classes cc ON cc.id = q.class_id
      JOIN courses c ON c.id = cc.course_id
      JOIN course_meetings cm ON cm.id = q.meeting_id
      WHERE 1=1
    `;

    const params: any[] = [];
    if (classId) {
      params.push(classId);
      query += ` AND q.class_id = $${params.length}`;
    }

    if (isStudent) {
      query += ` AND q.status = 'DITERBITKAN'`;
    }

    query += ` ORDER BY q.start_date ASC`;

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getQuizById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = req.params;
    const user = req.user!;
    const isStudent = user.role === 'mahasiswa';

    const result = await db.query(`
      SELECT 
        q.id,
        q.class_id as "classId",
        q.meeting_id as "meetingId",
        q.title,
        q.description,
        q.start_date as "startDate",
        q.end_date as "endDate",
        q.duration_minutes as "durationMinutes",
        q.max_attempts as "maxAttempts",
        q.passing_score as "passingScore",
        q.status,
        q.questions,
        c.name as "courseName",
        cm.meeting_number as "meetingNumber"
      FROM quizzes q
      JOIN course_classes cc ON cc.id = q.class_id
      JOIN courses c ON c.id = cc.course_id
      JOIN course_meetings cm ON cm.id = q.meeting_id
      WHERE q.id = $1
    `, [quizId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'QUIZ_NOT_FOUND', message: 'Kuis tidak ditemukan.' } });
      return;
    }

    const quiz = result.rows[0];

    // Keamanan: Jika mahasiswa dan kuis sedang berlangsung, jangan kirim isCorrect atau correctAnswerText
    if (isStudent) {
      quiz.questions = (quiz.questions || []).map((q: any) => ({
        id: q.id,
        type: q.type,
        title: q.title,
        questionText: q.questionText,
        points: q.points,
        options: (q.options || []).map((o: any) => ({ id: o.id, text: o.text }))
      }));
    }

    res.json({ data: quiz });
  } catch (err) {
    next(err);
  }
}

export async function startQuizAttempt(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { quizId } = req.params;
    const user = req.user!;

    const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);
    if (quizResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'QUIZ_NOT_FOUND', message: 'Kuis tidak ditemukan.' } });
      return;
    }

    const quiz = quizResult.rows[0];
    const durationMinutes = quiz.duration_minutes || 30;

    // Cek attempt aktif
    const existing = await db.query(`
      SELECT * FROM quiz_attempts 
      WHERE quiz_id = $1 AND student_id = $2 
      ORDER BY attempt_number DESC
    `, [quizId, user.id]);

    const active = existing.rows.find((a: any) => a.status === 'SEDANG_DIKERJAKAN');
    if (active) {
      res.json({ data: active });
      return;
    }

    if (existing.rows.length >= (quiz.max_attempts || 1)) {
      res.status(400).json({
        error: {
          code: 'MAX_ATTEMPTS_EXCEEDED',
          message: `Anda telah mencapai batas maksimum percobaan (${quiz.max_attempts}x) untuk kuis ini.`
        }
      });
      return;
    }

    const attemptNumber = existing.rows.length + 1;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60000).toISOString();
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newAttempt = await db.query(`
      INSERT INTO quiz_attempts (
        id, quiz_id, student_id, attempt_number, status, started_at, expires_at, answers
      )
      VALUES ($1, $2, $3, $4, 'SEDANG_DIKERJAKAN', NOW(), $5, '{}'::jsonb)
      RETURNING *
    `, [attemptId, quizId, user.id, attemptNumber, expiresAt]);

    res.json({ data: newAttempt.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function autosaveQuizAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptionId, shortAnswerText, essayAnswerText, isDoubtful } = req.body;
    const user = req.user!;

    const attemptResult = await db.query('SELECT * FROM quiz_attempts WHERE id = $1', [attemptId]);
    if (attemptResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'ATTEMPT_NOT_FOUND', message: 'Percobaan kuis tidak ditemukan.' } });
      return;
    }

    const attempt = attemptResult.rows[0];

    // IDOR Protection
    if (attempt.student_id !== user.id) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Akses Ditolak: Lembar kuis ini bukan milik Anda.' } });
      return;
    }

    if (attempt.status !== 'SEDANG_DIKERJAKAN') {
      res.status(400).json({ error: { code: 'ATTEMPT_CLOSED', message: 'Kuis telah dikumpulkan, jawaban tidak dapat diubah.' } });
      return;
    }

    const answers = attempt.answers || {};
    answers[questionId] = {
      questionId,
      selectedOptionId,
      shortAnswerText,
      essayAnswerText,
      isDoubtful,
      lastSavedAt: new Date().toISOString()
    };

    await db.query('UPDATE quiz_attempts SET answers = $1 WHERE id = $2', [JSON.stringify(answers), attemptId]);

    res.json({ data: { message: 'Jawaban tersimpan otomatis.', answers } });
  } catch (err) {
    next(err);
  }
}

export async function submitQuizAttempt(req: AuthenticatedRequest, res: Response, _next: NextFunction): Promise<void> {
  try {
    const { attemptId } = req.params;
    const user = req.user!;

    const result = await db.transaction(async (client) => {
      const attResult = await client.query('SELECT * FROM quiz_attempts WHERE id = $1 FOR UPDATE', [attemptId]);
      if (attResult.rows.length === 0) {
        throw new Error('Percobaan kuis tidak ditemukan.');
      }

      const attempt = attResult.rows[0];

      // IDOR Check
      if (attempt.student_id !== user.id && user.role !== 'administrator_sistem') {
        throw new Error('Akses Ditolak: Anda tidak dapat mengumpulkan kuis milik pengguna lain.');
      }

      // Idempotency: Jika sudah dikumpulkan/dinilai, return langsung
      if (attempt.status === 'DIKUMPULKAN' || attempt.status === 'DINILAI') {
        return attempt;
      }

      const quizResult = await client.query('SELECT * FROM quizzes WHERE id = $1', [attempt.quiz_id]);
      const quiz = quizResult.rows[0];
      const questions = quiz.questions || [];

      let totalEarned = 0;
      let totalMaxPoints = 0;
      let hasEssay = false;
      const userAnswers = attempt.answers || {};

      for (const q of questions) {
        totalMaxPoints += q.points || 10;
        const ans = userAnswers[q.id];

        if (q.type === 'PILIHAN_GANDA' || q.type === 'BENAR_SALAH') {
          const correctOpt = (q.options || []).find((o: any) => o.isCorrect);
          if (ans && ans.selectedOptionId === correctOpt?.id) {
            totalEarned += q.points || 10;
            if (ans) ans.earnedPoints = q.points || 10;
          }
        } else if (q.type === 'JAWABAN_SINGKAT') {
          const expected = (q.correctAnswerText || '').trim().toLowerCase();
          const actual = (ans?.shortAnswerText || '').trim().toLowerCase();
          if (expected && actual && expected === actual) {
            totalEarned += q.points || 10;
            if (ans) ans.earnedPoints = q.points || 10;
          }
        } else if (q.type === 'ESAI') {
          hasEssay = true;
        }
      }

      const finalScore = totalMaxPoints > 0 ? Math.round((totalEarned / totalMaxPoints) * 100) : 0;
      const isPassed = finalScore >= (quiz.passing_score || 75);
      const nextStatus = hasEssay ? 'DIKUMPULKAN' : 'DINILAI';

      const updated = await client.query(`
        UPDATE quiz_attempts SET
          status = $1,
          submitted_at = NOW(),
          total_earned_points = $2,
          final_score = $3,
          is_passed = $4,
          needs_manual_grading = $5,
          answers = $6
        WHERE id = $7
        RETURNING *
      `, [
        nextStatus,
        totalEarned,
        finalScore,
        isPassed,
        hasEssay,
        JSON.stringify(userAnswers),
        attemptId
      ]);

      return updated.rows[0];
    });

    res.json({ data: result });
  } catch (err: any) {
    res.status(400).json({ error: { code: 'SUBMIT_QUIZ_FAILED', message: err.message } });
  }
}

// =========================================================================
// TUGAS, RUBRIK & PENGUMPULAN (END-TO-END ASSIGNMENTS & RUBRICS)
// =========================================================================

/**
 * 1. Mendapatkan daftar seluruh tugas (dengan filter peran, kelas, dan status)
 */
export async function getAssignments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const isStudent = user.role === 'mahasiswa';
    const { classId, meetingId } = req.query;

    let query = `
      SELECT 
        a.id,
        a.class_id as "classId",
        a.meeting_id as "meetingId",
        a.title,
        COALESCE(a.description, '') as "description",
        a.instructions,
        a.attachment_name as "attachmentName",
        a.attachment_url as "attachmentUrl",
        COALESCE(a.open_date, a.created_at) as "openDate",
        a.due_date as "dueDate",
        a.max_score as "maxScore",
        a.allow_late_submission as "allowLateSubmission",
        COALESCE(a.late_penalty_percentage, 10) as "latePenaltyPercentage",
        COALESCE(a.allow_resubmission, true) as "allowResubmission",
        COALESCE(a.max_resubmissions, 2) as "maxResubmissions",
        COALESCE(a.submission_type, 'BERKAS_UNGGAHAN') as "submissionType",
        a.allowed_file_extensions as "allowedFileExtensions",
        COALESCE(a.max_file_size_bytes, 10485760) as "maxFileSizeBytes",
        a.status,
        a.rubric,
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        c.name as "courseName",
        cc.class_name as "className",
        cm.meeting_number as "meetingNumber"
    `;

    // Jika mahasiswa, sertakan status pengumpulan miliknya
    if (isStudent) {
      query += `
        , sub.id as "submissionId",
        sub.status as "submissionStatus",
        sub.final_score as "studentFinalScore",
        sub.is_late as "isLateSubmission",
        sub.submitted_at as "studentSubmittedAt"
      `;
    } else {
      // Jika dosen / admin, sertakan ringkasan agregat submission
      query += `
        , (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id) as "totalSubmissionsCount",
        (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status = 'SUDAH_DINILAI') as "gradedSubmissionsCount",
        (SELECT COUNT(*)::int FROM class_enrollments ce WHERE ce.class_id = a.class_id AND ce.status = 'AKTIF') as "totalStudentsCount"
      `;
    }

    query += `
      FROM assignments a
      JOIN course_classes cc ON cc.id = a.class_id
      JOIN courses c ON c.id = cc.course_id
      JOIN course_meetings cm ON cm.id = a.meeting_id
    `;

    if (isStudent) {
      query += `
        LEFT JOIN assignment_submissions sub ON sub.assignment_id = a.id AND sub.student_id = $1
      `;
    }

    query += ` WHERE 1=1 `;
    const params: any[] = [];

    if (isStudent) {
      params.push(user.id);
      query += ` AND a.status = 'DITERBITKAN'`;
    }

    if (classId) {
      params.push(classId);
      query += ` AND a.class_id = $${params.length}`;
    }

    if (meetingId) {
      params.push(meetingId);
      query += ` AND a.meeting_id = $${params.length}`;
    }

    query += ` ORDER BY a.due_date ASC`;

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * 2. Mengambil detail satu tugas
 */
export async function getAssignmentById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const user = req.user!;
    const isStudent = user.role === 'mahasiswa';

    let query = `
      SELECT 
        a.id,
        a.class_id as "classId",
        a.meeting_id as "meetingId",
        a.title,
        COALESCE(a.description, '') as "description",
        a.instructions,
        a.attachment_name as "attachmentName",
        a.attachment_url as "attachmentUrl",
        COALESCE(a.open_date, a.created_at) as "openDate",
        a.due_date as "dueDate",
        a.max_score as "maxScore",
        a.allow_late_submission as "allowLateSubmission",
        COALESCE(a.late_penalty_percentage, 10) as "latePenaltyPercentage",
        COALESCE(a.allow_resubmission, true) as "allowResubmission",
        COALESCE(a.max_resubmissions, 2) as "maxResubmissions",
        COALESCE(a.submission_type, 'BERKAS_UNGGAHAN') as "submissionType",
        a.allowed_file_extensions as "allowedFileExtensions",
        COALESCE(a.max_file_size_bytes, 10485760) as "maxFileSizeBytes",
        a.status,
        a.rubric,
        a.created_at as "createdAt",
        a.updated_at as "updatedAt",
        c.name as "courseName",
        cc.class_name as "className",
        cm.meeting_number as "meetingNumber",
        (SELECT COUNT(*)::int FROM class_enrollments ce WHERE ce.class_id = a.class_id AND ce.status = 'AKTIF') as "totalStudentsCount",
        (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id) as "totalSubmissionsCount",
        (SELECT COUNT(*)::int FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status = 'SUDAH_DINILAI') as "gradedSubmissionsCount",
        (SELECT AVG(final_score)::numeric(5,2) FROM assignment_submissions s WHERE s.assignment_id = a.id AND s.status = 'SUDAH_DINILAI') as "averageScore"
      FROM assignments a
      JOIN course_classes cc ON cc.id = a.class_id
      JOIN courses c ON c.id = cc.course_id
      JOIN course_meetings cm ON cm.id = a.meeting_id
      WHERE a.id = $1
    `;

    const result = await db.query(query, [assignmentId]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Tugas perkuliahan tidak ditemukan.' } });
      return;
    }

    const assignment = result.rows[0];

    // Jika mahasiswa dan status draf, blokir akses
    if (isStudent && assignment.status === 'DRAF') {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Tugas ini belum diterbitkan oleh dosen pengampu.' } });
      return;
    }

    res.json({ data: assignment });
  } catch (err) {
    next(err);
  }
}

/**
 * 3. Membuat Tugas Perkuliahan Baru (Dosen / Admin)
 */
export async function createAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const {
      classId,
      meetingId,
      title,
      description,
      instructions,
      attachmentName,
      attachmentUrl,
      openDate,
      dueDate,
      maxScore = 100,
      allowLateSubmission = true,
      latePenaltyPercentage = 10,
      allowResubmission = true,
      maxResubmissions = 2,
      submissionType = 'BERKAS_UNGGAHAN',
      allowedFileExtensions = ['pdf', 'docx', 'zip'],
      maxFileSizeBytes = 10485760,
      status = 'DITERBITKAN',
      rubric
    } = req.body;

    if (!classId || !meetingId || !title || !instructions || !dueDate) {
      res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Kelas, pertemuan, judul, petunjuk, dan tenggat waktu wajib diisi.' } });
      return;
    }

    const assignmentId = `asg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const result = await db.query(`
      INSERT INTO assignments (
        id, class_id, meeting_id, title, description, instructions, attachment_name, attachment_url,
        open_date, due_date, max_score, allow_late_submission, late_penalty_percentage,
        allow_resubmission, max_resubmissions, submission_type, allowed_file_extensions,
        max_file_size_bytes, status, rubric, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, NOW(), NOW()
      )
      RETURNING *
    `, [
      assignmentId,
      classId,
      meetingId,
      title,
      description || '',
      instructions,
      attachmentName || null,
      attachmentUrl || null,
      openDate || new Date().toISOString(),
      dueDate,
      maxScore,
      allowLateSubmission,
      latePenaltyPercentage,
      allowResubmission,
      maxResubmissions,
      submissionType,
      JSON.stringify(allowedFileExtensions),
      maxFileSizeBytes,
      status,
      rubric ? JSON.stringify(rubric) : null
    ]);

    // Audit log
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'CREATE_ASSIGNMENT', 'ASSIGNMENTS', $5, '127.0.0.1', 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Dosen membuat tugas baru: "${title}" pada kelas: ${classId}`
    ]);

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * 4. Memperbarui Tugas Perkuliahan & Rubrik (Dosen / Admin)
 */
export async function updateAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const {
      title,
      description,
      instructions,
      attachmentName,
      attachmentUrl,
      openDate,
      dueDate,
      maxScore,
      allowLateSubmission,
      latePenaltyPercentage,
      allowResubmission,
      maxResubmissions,
      submissionType,
      allowedFileExtensions,
      maxFileSizeBytes,
      status,
      rubric
    } = req.body;

    const existing = await db.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    if (existing.rows.length === 0) {
      res.status(404).json({ error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Tugas tidak ditemukan.' } });
      return;
    }

    const current = existing.rows[0];

    const result = await db.query(`
      UPDATE assignments SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        instructions = COALESCE($3, instructions),
        attachment_name = $4,
        attachment_url = $5,
        open_date = COALESCE($6, open_date),
        due_date = COALESCE($7, due_date),
        max_score = COALESCE($8, max_score),
        allow_late_submission = COALESCE($9, allow_late_submission),
        late_penalty_percentage = COALESCE($10, late_penalty_percentage),
        allow_resubmission = COALESCE($11, allow_resubmission),
        max_resubmissions = COALESCE($12, max_resubmissions),
        submission_type = COALESCE($13, submission_type),
        allowed_file_extensions = COALESCE($14, allowed_file_extensions),
        max_file_size_bytes = COALESCE($15, max_file_size_bytes),
        status = COALESCE($16, status),
        rubric = COALESCE($17, rubric),
        updated_at = NOW()
      WHERE id = $18
      RETURNING *
    `, [
      title,
      description,
      instructions,
      attachmentName !== undefined ? attachmentName : current.attachment_name,
      attachmentUrl !== undefined ? attachmentUrl : current.attachment_url,
      openDate,
      dueDate,
      maxScore,
      allowLateSubmission,
      latePenaltyPercentage,
      allowResubmission,
      maxResubmissions,
      submissionType,
      allowedFileExtensions ? JSON.stringify(allowedFileExtensions) : null,
      maxFileSizeBytes,
      status,
      rubric ? JSON.stringify(rubric) : null,
      assignmentId
    ]);

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * 5. Menghapus Tugas & Pengumpulan secara Transaksional (Dosen / Admin)
 */
export async function deleteAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const user = req.user!;

    await db.transaction(async (client) => {
      // Hapus data submission terlebih dahulu
      await client.query('DELETE FROM assignment_submissions WHERE assignment_id = $1', [assignmentId]);
      // Hapus data tugas
      await client.query('DELETE FROM assignments WHERE id = $1', [assignmentId]);

      // Audit log
      await client.query(`
        INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
        VALUES ($1, $2, $3, $4, 'DELETE_ASSIGNMENT', 'ASSIGNMENTS', $5, '127.0.0.1', 'SUKSES')
      `, [
        `aud-${Date.now()}`,
        user.id,
        user.name,
        user.role,
        `Tugas ID: ${assignmentId} dan seluruh pengumpulan terkait telah dihapus permanen.`
      ]);
    });

    res.json({ data: { message: 'Tugas perkuliahan dan seluruh pengumpulan mahasiswa berhasil dihapus.' } });
  } catch (err) {
    next(err);
  }
}

/**
 * 6. Mengambil seluruh daftar pengumpulan mahasiswa sekelas untuk Dosen / Grading Studio
 */
export async function getClassAssignmentSubmissions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;

    const asgRes = await db.query('SELECT class_id FROM assignments WHERE id = $1', [assignmentId]);
    if (asgRes.rows.length === 0) {
      res.status(404).json({ error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Tugas tidak ditemukan.' } });
      return;
    }

    const classId = asgRes.rows[0].class_id;

    // Ambil seluruh mahasiswa terdaftar di kelas dan pasangkan dengan data submission-nya
    const query = `
      SELECT 
        u.id as "studentId",
        u.identity_number as "studentNim",
        u.name as "studentName",
        sub.id as "id",
        sub.assignment_id as "assignmentId",
        $2 as "classId",
        COALESCE(sub.version, 0) as "version",
        sub.submitted_at as "submittedAt",
        COALESCE(sub.is_late, false) as "isLate",
        COALESCE(sub.status, 'BELUM_DIKUMPULKAN') as "status",
        sub.file_name as "fileName",
        sub.file_size_bytes as "fileSizeBytes",
        sub.file_mime_type as "fileMimeType",
        sub.file_url as "fileUrl",
        sub.text_content as "textContent",
        sub.student_notes as "studentNotes",
        sub.rubric_evaluations as "rubricEvaluations",
        sub.final_score as "finalScore",
        sub.raw_score as "rawScore",
        sub.penalty_deduction as "penaltyDeduction",
        sub.feedback_notes as "feedbackNotes",
        sub.feedback_notes as "lecturerFeedback",
        sub.graded_at as "gradedAt",
        sub.version_history as "history",
        grader.name as "gradedByLecturerName"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      LEFT JOIN assignment_submissions sub ON sub.assignment_id = $1 AND sub.student_id = u.id
      LEFT JOIN users grader ON grader.id = sub.grader_id
      WHERE ce.class_id = $2 AND ce.status = 'AKTIF'
      ORDER BY u.name ASC
    `;

    const result = await db.query(query, [assignmentId, classId]);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

/**
 * 7. Mengambil detail pengumpulan milik mahasiswa spesifik
 */
export async function getStudentSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const user = req.user!;
    const studentId = req.query.studentId ? String(req.query.studentId) : user.id;

    // IDOR Protection
    if (user.role === 'mahasiswa' && studentId !== user.id) {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Akses Ditolak: Anda tidak dapat melihat pengumpulan tugas mahasiswa lain.' } });
      return;
    }

    const result = await db.query(`
      SELECT 
        sub.id,
        sub.assignment_id as "assignmentId",
        sub.student_id as "studentId",
        sub.file_url as "fileUrl",
        sub.file_name as "fileName",
        sub.file_size_bytes as "fileSizeBytes",
        sub.file_mime_type as "fileMimeType",
        sub.text_content as "textContent",
        sub.student_notes as "studentNotes",
        sub.version,
        sub.status,
        sub.is_late as "isLate",
        sub.submitted_at as "submittedAt",
        sub.final_score as "finalScore",
        sub.raw_score as "rawScore",
        sub.penalty_deduction as "penaltyDeduction",
        sub.feedback_notes as "feedbackNotes",
        sub.feedback_notes as "lecturerFeedback",
        sub.rubric_evaluations as "rubricEvaluations",
        sub.version_history as "history",
        sub.graded_at as "gradedAt",
        grader.name as "gradedByLecturerName",
        u.name as "studentName",
        u.identity_number as "studentNim"
      FROM assignment_submissions sub
      JOIN users u ON u.id = sub.student_id
      LEFT JOIN users grader ON grader.id = sub.grader_id
      WHERE sub.assignment_id = $1 AND sub.student_id = $2
    `, [assignmentId, studentId]);

    if (result.rows.length === 0) {
      res.json({ data: null });
      return;
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * 8. Pengumpulan Tugas oleh Mahasiswa (Submit / Resubmit)
 */
export async function submitAssignment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { assignmentId } = req.params;
    const { fileUrl, fileName, fileSizeBytes, fileMimeType, textContent, studentNotes } = req.body;
    const user = req.user!;

    const asgResult = await db.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    if (asgResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Tugas tidak ditemukan.' } });
      return;
    }

    const asg = asgResult.rows[0];
    const now = new Date();
    const isLate = now > new Date(asg.due_date);

    if (isLate && !asg.allow_late_submission) {
      res.status(400).json({ error: { code: 'LATE_SUBMISSION_FORBIDDEN', message: 'Batas waktu pengumpulan telah berakhir dan tugas ini tidak mengizinkan pengumpulan terlambat.' } });
      return;
    }

    const existingSub = await db.query('SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND student_id = $2', [assignmentId, user.id]);

    let version = 1;
    let history: any[] = [];

    if (existingSub.rows.length > 0) {
      const current = existingSub.rows[0];
      if (!asg.allow_resubmission) {
        res.status(400).json({ error: { code: 'RESUBMISSION_FORBIDDEN', message: 'Tugas ini tidak mengizinkan pengumpulan ulang (revisi).' } });
        return;
      }

      if (current.version >= ((asg.max_resubmissions || 2) + 1)) {
        res.status(400).json({ error: { code: 'MAX_RESUBMISSIONS_EXCEEDED', message: `Anda telah mencapai batas maksimum pengumpulan ulang (${asg.max_resubmissions}x revisi).` } });
        return;
      }

      version = current.version + 1;
      history = Array.isArray(current.version_history) ? current.version_history : [];
      // Tambahkan riwayat sebelumnya
      history.push({
        version: current.version,
        submittedAt: current.submitted_at,
        fileName: current.file_name,
        fileSizeBytes: current.file_size_bytes,
        fileUrl: current.file_url,
        textContent: current.text_content,
        studentNotes: current.student_notes,
        status: current.status
      });
    }

    const status = isLate ? 'TERLAMBAT' : 'SUDAH_DIKUMPULKAN';
    const subId = existingSub.rows.length > 0 ? existingSub.rows[0].id : `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const saved = await db.query(`
      INSERT INTO assignment_submissions (
        id, assignment_id, student_id, file_url, file_name, file_size_bytes, file_mime_type,
        text_content, student_notes, version, status, is_late, submitted_at, version_history
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
      ON CONFLICT (assignment_id, student_id) DO UPDATE SET
        file_url = EXCLUDED.file_url,
        file_name = EXCLUDED.file_name,
        file_size_bytes = EXCLUDED.file_size_bytes,
        file_mime_type = EXCLUDED.file_mime_type,
        text_content = EXCLUDED.text_content,
        student_notes = EXCLUDED.student_notes,
        version = EXCLUDED.version,
        status = EXCLUDED.status,
        is_late = EXCLUDED.is_late,
        submitted_at = NOW(),
        version_history = EXCLUDED.version_history,
        final_score = NULL,
        raw_score = NULL,
        penalty_deduction = 0,
        rubric_evaluations = NULL
      RETURNING *
    `, [
      subId,
      assignmentId,
      user.id,
      fileUrl || null,
      fileName || null,
      fileSizeBytes || null,
      fileMimeType || 'application/pdf',
      textContent || null,
      studentNotes || null,
      version,
      status,
      isLate,
      JSON.stringify(history)
    ]);

    // Audit Logging
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'SUBMIT_ASSIGNMENT', 'ASSIGNMENTS', $5, '127.0.0.1', 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Mahasiswa mengumpulkan tugas ${asg.title} (Versi: ${version}, Status: ${status}).`
    ]);

    res.status(201).json({ data: saved.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * 9. Penilaian Berbasis Rubrik oleh Dosen & Sinkronisasi Gradebook
 */
export async function gradeSubmission(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { submissionId } = req.params;
    const { rubricEvaluations, feedbackNotes, manualRawScore } = req.body;
    const user = req.user!;

    const subRes = await db.query(`
      SELECT sub.*, a.rubric, a.late_penalty_percentage, a.class_id, a.title as "assignmentTitle"
      FROM assignment_submissions sub
      JOIN assignments a ON a.id = sub.assignment_id
      WHERE sub.id = $1
    `, [submissionId]);

    if (subRes.rows.length === 0) {
      res.status(404).json({ error: { code: 'SUBMISSION_NOT_FOUND', message: 'Data pengumpulan tugas tidak ditemukan.' } });
      return;
    }

    const sub = subRes.rows[0];
    const rubric = sub.rubric;

    let rawScore = 0;

    // 1. Kalkulasi Rubrik Berbobot
    if (rubric && Array.isArray(rubric.criteria) && Array.isArray(rubricEvaluations)) {
      rubric.criteria.forEach((crit: any) => {
        const evalItem = rubricEvaluations.find((e: any) => e.criterionId === crit.id);
        if (evalItem) {
          const awarded = evalItem.awardedScore ?? evalItem.score ?? 0;
          const weightPart = (awarded / (crit.maxPoints || 100)) * (crit.weightPercentage || 0);
          rawScore += weightPart;
        }
      });
      rawScore = Math.round(rawScore);
    } else if (manualRawScore !== undefined) {
      rawScore = Number(manualRawScore);
    } else if (Array.isArray(rubricEvaluations) && rubricEvaluations.length > 0) {
      rawScore = Number(rubricEvaluations[0].awardedScore ?? rubricEvaluations[0].score ?? 0);
    }

    rawScore = Math.min(100, Math.max(0, rawScore));

    // 2. Kalkulasi Penalti Keterlambatan
    let penaltyDeduction = 0;
    const penaltyPct = sub.late_penalty_percentage ?? 10;
    if (sub.is_late && penaltyPct > 0) {
      penaltyDeduction = Math.round((rawScore * penaltyPct) / 100);
    }

    const finalScore = Math.max(0, rawScore - penaltyDeduction);

    const updated = await db.query(`
      UPDATE assignment_submissions SET
        status = 'SUDAH_DINILAI',
        graded_at = NOW(),
        grader_id = $1,
        raw_score = $2,
        penalty_deduction = $3,
        final_score = $4,
        feedback_notes = $5,
        rubric_evaluations = $6
      WHERE id = $7
      RETURNING *
    `, [
      user.id,
      rawScore,
      penaltyDeduction,
      finalScore,
      feedbackNotes || '',
      JSON.stringify(rubricEvaluations || []),
      submissionId
    ]);

    // 3. Sinkronisasi Otomatis ke Gradebook Kelas (course_grades jika ada)
    try {
      await db.query(`
        INSERT INTO course_grades (
          id, class_id, student_id, assignment_score, updated_at
        ) VALUES (
          $1, $2, $3, $4, NOW()
        )
        ON CONFLICT (class_id, student_id) DO UPDATE SET
          assignment_score = EXCLUDED.assignment_score,
          updated_at = NOW()
      `, [
        `cgr-${sub.class_id}-${sub.student_id}`,
        sub.class_id,
        sub.student_id,
        finalScore
      ]);
    } catch (gradeErr: any) {
      logger.warn('Gradebook auto-sync skipped (table/relation variation)', { message: gradeErr?.message });
    }

    // 4. Audit Trail
    await db.query(`
      INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, resource, details, ip_address, status)
      VALUES ($1, $2, $3, $4, 'GRADE_ASSIGNMENT', 'ASSIGNMENTS', $5, '127.0.0.1', 'SUKSES')
    `, [
      `aud-${Date.now()}`,
      user.id,
      user.name,
      user.role,
      `Dosen menilai tugas ${sub.assignmentTitle}: Nilai Akhir = ${finalScore}/100 (Skor Murni: ${rawScore}, Potongan Terlambat: ${penaltyDeduction}) pada student ID: ${sub.student_id}`
    ]);

    res.json({ data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
}

/**
 * 10. Meminta Revisi Tugas ke Mahasiswa (Dosen)
 */
export async function requestSubmissionRevision(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { submissionId } = req.params;
    const { feedbackNotes } = req.body;
    const user = req.user!;

    const updated = await db.query(`
      UPDATE assignment_submissions SET
        status = 'PERLU_REVISI',
        graded_at = NOW(),
        grader_id = $1,
        feedback_notes = $2
      WHERE id = $3
      RETURNING *
    `, [
      user.id,
      feedbackNotes || 'Silakan lakukan perbaikan tugas sesuai instruksi dan kumpulkan kembali.',
      submissionId
    ]);

    if (updated.rows.length === 0) {
      res.status(404).json({ error: { code: 'SUBMISSION_NOT_FOUND', message: 'Data pengumpulan tugas tidak ditemukan.' } });
      return;
    }

    res.json({ data: updated.rows[0] });
  } catch (err) {
    next(err);
  }
}
