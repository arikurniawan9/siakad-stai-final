import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

// =========================================================================
// 1. RENCANA PEMBELAJARAN SEMESTER (RPS)
// =========================================================================

export async function getRPS(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    const result = await db.query(
      `SELECT 
        description, 
        learning_outcomes as "learningOutcomes", 
        teaching_methods as "teachingMethods", 
        assessment_weights as "assessmentWeights", 
        references_list as "references",
        document_url as "documentAttachmentUrl",
        document_name as "documentAttachmentName",
        updated_at as "updatedAt"
      FROM course_rps WHERE class_id = $1`,
      [classId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'RPS_NOT_FOUND', message: 'RPS belum disusun untuk kelas ini.' } });
      return;
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateRPS(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    const { 
      description, 
      learningOutcomes, 
      teachingMethods, 
      assessmentWeights, 
      references,
      documentAttachmentUrl,
      documentAttachmentName
    } = req.body;

    const result = await db.query(`
      INSERT INTO course_rps (
        id, 
        class_id, 
        description, 
        learning_outcomes, 
        teaching_methods, 
        assessment_weights, 
        references_list, 
        document_url,
        document_name,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (class_id) DO UPDATE SET
        description = EXCLUDED.description,
        learning_outcomes = EXCLUDED.learning_outcomes,
        teaching_methods = EXCLUDED.teaching_methods,
        assessment_weights = EXCLUDED.assessment_weights,
        references_list = EXCLUDED.references_list,
        document_url = COALESCE(EXCLUDED.document_url, course_rps.document_url),
        document_name = COALESCE(EXCLUDED.document_name, course_rps.document_name),
        updated_at = NOW()
      RETURNING 
        description, 
        learning_outcomes as "learningOutcomes", 
        teaching_methods as "teachingMethods", 
        assessment_weights as "assessmentWeights", 
        references_list as "references",
        document_url as "documentAttachmentUrl",
        document_name as "documentAttachmentName",
        updated_at as "updatedAt"
    `, [
      `rps-${classId}`,
      classId,
      description || '',
      JSON.stringify(learningOutcomes || []),
      JSON.stringify(teachingMethods || []),
      JSON.stringify(assessmentWeights || []),
      JSON.stringify(references || []),
      documentAttachmentUrl || null,
      documentAttachmentName || null
    ]);

    res.json({ 
      data: { 
        message: 'RPS berhasil diperbarui.',
        rps: result.rows[0]
      } 
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteRPS(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    await db.query(`DELETE FROM course_rps WHERE class_id = $1`, [classId]);
    res.json({ data: { message: 'RPS berhasil dihapus/direset.' } });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 2. PERTEMUAN PERKULIAHAN (MEETINGS)
// =========================================================================

export async function getMeetings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    const user = req.user!;
    const isStudent = user.role === 'mahasiswa';

    let meetingQuery = `
      SELECT 
        id, 
        class_id as "classId", 
        meeting_number as "meetingNumber", 
        title, 
        topic, 
        description, 
        scheduled_date as "scheduledDate", 
        start_time as "startTime", 
        end_time as "endTime", 
        order_index as "orderIndex", 
        status, 
        published_at as "publishedAt"
      FROM course_meetings 
      WHERE class_id = $1
    `;

    if (isStudent) {
      meetingQuery += ` AND status = 'DITERBITKAN'`;
    }

    meetingQuery += ` ORDER BY order_index ASC, meeting_number ASC`;

    const meetingsResult = await db.query(meetingQuery, [classId]);
    const meetings = meetingsResult.rows;

    // Ambil materi per pertemuan
    for (const mtg of meetings) {
      let matQuery = `
        SELECT 
          id, 
          meeting_id as "meetingId", 
          class_id as "classId", 
          title, 
          type, 
          description, 
          file_url as "fileUrl", 
          file_name as "fileName", 
          file_size_bytes as "fileSizeBytes", 
          external_url as "externalUrl", 
          text_content as "textContent",
          online_module as "onlineModule",
          status, 
          allow_download as "allowDownload", 
          order_index as "orderIndex",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM materials 
        WHERE meeting_id = $1
      `;
      if (isStudent) {
        matQuery += ` AND status = 'DITERBITKAN'`;
      }
      matQuery += ` ORDER BY order_index ASC, created_at ASC`;

      const matResult = await db.query(matQuery, [mtg.id]);
      mtg.materials = matResult.rows;
    }

    res.json({ data: meetings });
  } catch (err) {
    next(err);
  }
}

export async function createMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    const {
      meetingNumber,
      title,
      topic,
      description,
      scheduledDate,
      startTime = '08:00',
      endTime = '10:30',
      orderIndex,
      status = 'DITERBITKAN',
      publishedAt
    } = req.body;

    const id = `mtg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const actualOrder = orderIndex !== undefined ? orderIndex : meetingNumber;
    const pubDate = status === 'DITERBITKAN' ? (publishedAt || new Date().toISOString()) : null;

    const result = await db.query(`
      INSERT INTO course_meetings (
        id, class_id, meeting_number, title, topic, description, 
        scheduled_date, start_time, end_time, order_index, status, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      RETURNING 
        id, 
        class_id as "classId", 
        meeting_number as "meetingNumber", 
        title, 
        topic, 
        description, 
        scheduled_date as "scheduledDate", 
        start_time as "startTime", 
        end_time as "endTime", 
        order_index as "orderIndex", 
        status, 
        published_at as "publishedAt"
    `, [
      id,
      classId,
      meetingNumber,
      title,
      topic || '',
      description || '',
      scheduledDate,
      startTime,
      endTime,
      actualOrder,
      status,
      pubDate
    ]);

    const created = result.rows[0];
    created.materials = [];

    res.status(201).json({ 
      data: {
        message: 'Pertemuan berhasil ditambahkan.',
        meeting: created
      } 
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, meetingId } = req.params;
    const {
      meetingNumber,
      title,
      topic,
      description,
      scheduledDate,
      startTime,
      endTime,
      orderIndex,
      status,
      publishedAt
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (meetingNumber !== undefined) {
      updates.push(`meeting_number = $${paramIndex++}`);
      values.push(meetingNumber);
    }
    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (topic !== undefined) {
      updates.push(`topic = $${paramIndex++}`);
      values.push(topic);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (scheduledDate !== undefined) {
      updates.push(`scheduled_date = $${paramIndex++}`);
      values.push(scheduledDate);
    }
    if (startTime !== undefined) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(startTime);
    }
    if (endTime !== undefined) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(endTime);
    }
    if (orderIndex !== undefined) {
      updates.push(`order_index = $${paramIndex++}`);
      values.push(orderIndex);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'DITERBITKAN') {
        updates.push(`published_at = COALESCE(published_at, NOW())`);
      } else {
        updates.push(`published_at = NULL`);
      }
    } else if (publishedAt !== undefined) {
      updates.push(`published_at = $${paramIndex++}`);
      values.push(publishedAt);
    }

    updates.push(`updated_at = NOW()`);

    values.push(meetingId);
    values.push(classId);

    const query = `
      UPDATE course_meetings
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND class_id = $${paramIndex++}
      RETURNING 
        id, 
        class_id as "classId", 
        meeting_number as "meetingNumber", 
        title, 
        topic, 
        description, 
        scheduled_date as "scheduledDate", 
        start_time as "startTime", 
        end_time as "endTime", 
        order_index as "orderIndex", 
        status, 
        published_at as "publishedAt"
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'MEETING_NOT_FOUND', message: 'Pertemuan tidak ditemukan.' } });
      return;
    }

    res.json({
      data: {
        message: 'Pertemuan berhasil diperbarui.',
        meeting: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMeeting(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, meetingId } = req.params;

    await db.transaction(async (client) => {
      // 1. Hapus log akses materi di pertemuan ini
      await client.query(`
        DELETE FROM material_access_logs 
        WHERE material_id IN (SELECT id FROM materials WHERE meeting_id = $1)
      `, [meetingId]);

      // 2. Hapus materi pembelajaran
      await client.query(`DELETE FROM materials WHERE meeting_id = $1`, [meetingId]);

      // 3. Hapus video interaktif jika ada
      await client.query(`
        DELETE FROM student_video_progress 
        WHERE video_id IN (SELECT id FROM interactive_videos WHERE meeting_id = $1)
      `, [meetingId]);
      await client.query(`
        DELETE FROM video_checkpoints 
        WHERE video_id IN (SELECT id FROM interactive_videos WHERE meeting_id = $1)
      `, [meetingId]);
      // 4. Hapus attendance sessions & records jika ada
      try {
        await client.query(`DELETE FROM student_attendances WHERE meeting_id = $1`, [meetingId]);
        await client.query(`DELETE FROM lecturer_attendances WHERE meeting_id = $1`, [meetingId]);
        await client.query(`DELETE FROM meeting_attendance_sessions WHERE meeting_id = $1`, [meetingId]);
      } catch {
        // Ignore if table does not exist
      }

      // 5. Hapus tugas dan pengumpulan mahasiswa pada pertemuan ini jika ada
      try {
        await client.query(`
          DELETE FROM assignment_submissions 
          WHERE assignment_id IN (SELECT id FROM assignments WHERE meeting_id = $1)
        `, [meetingId]);
        await client.query(`DELETE FROM assignments WHERE meeting_id = $1`, [meetingId]);
      } catch {
        // Ignore if table does not exist
      }

      // 6. Hapus pertemuan
      await client.query(`DELETE FROM course_meetings WHERE id = $1 AND class_id = $2`, [meetingId, classId]);
    });

    res.json({ data: { message: 'Pertemuan dan seluruh materi terkait berhasil dihapus.' } });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 3. MATERI PEMBELAJARAN (MATERIALS)
// =========================================================================

export async function createMaterial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, meetingId } = req.params;
    const {
      title,
      type,
      description,
      fileUrl,
      fileName,
      fileSizeBytes = 2500000,
      externalUrl,
      textContent,
      onlineModule,
      status = 'DITERBITKAN',
      allowDownload = true,
      orderIndex = 1
    } = req.body;

    const id = `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const pubDate = status === 'DITERBITKAN' ? new Date().toISOString() : null;

    const result = await db.query(`
      INSERT INTO materials (
        id, meeting_id, class_id, title, type, description, 
        file_url, file_name, file_size_bytes, external_url, 
        text_content, online_module, status, allow_download, 
        order_index, published_at, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING 
        id, 
        meeting_id as "meetingId", 
        class_id as "classId", 
        title, 
        type, 
        description, 
        file_url as "fileUrl", 
        file_name as "fileName", 
        file_size_bytes as "fileSizeBytes", 
        external_url as "externalUrl", 
        text_content as "textContent",
        online_module as "onlineModule",
        status, 
        allow_download as "allowDownload", 
        order_index as "orderIndex",
        created_at as "createdAt",
        updated_at as "updatedAt"
    `, [
      id,
      meetingId,
      classId,
      title,
      type,
      description || '',
      fileUrl || null,
      fileName || null,
      fileSizeBytes,
      externalUrl || null,
      textContent || null,
      onlineModule ? JSON.stringify(onlineModule) : null,
      status,
      allowDownload,
      orderIndex || 1,
      pubDate
    ]);

    res.status(201).json({
      data: {
        message: 'Materi pembelajaran berhasil ditambahkan.',
        material: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMaterial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { meetingId, materialId } = req.params;
    const {
      title,
      type,
      description,
      fileUrl,
      fileName,
      fileSizeBytes,
      externalUrl,
      textContent,
      onlineModule,
      status,
      allowDownload
    } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(title);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramIndex++}`);
      values.push(type);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(description);
    }
    if (fileUrl !== undefined) {
      updates.push(`file_url = $${paramIndex++}`);
      values.push(fileUrl);
    }
    if (fileName !== undefined) {
      updates.push(`file_name = $${paramIndex++}`);
      values.push(fileName);
    }
    if (fileSizeBytes !== undefined) {
      updates.push(`file_size_bytes = $${paramIndex++}`);
      values.push(fileSizeBytes);
    }
    if (externalUrl !== undefined) {
      updates.push(`external_url = $${paramIndex++}`);
      values.push(externalUrl);
    }
    if (textContent !== undefined) {
      updates.push(`text_content = $${paramIndex++}`);
      values.push(textContent);
    }
    if (onlineModule !== undefined) {
      updates.push(`online_module = $${paramIndex++}`);
      values.push(onlineModule ? JSON.stringify(onlineModule) : null);
    }
    if (allowDownload !== undefined) {
      updates.push(`allow_download = $${paramIndex++}`);
      values.push(allowDownload);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
      if (status === 'DITERBITKAN') {
        updates.push(`published_at = COALESCE(published_at, NOW())`);
      } else {
        updates.push(`published_at = NULL`);
      }
    }

    updates.push(`updated_at = NOW()`);

    values.push(materialId);
    values.push(meetingId);

    const query = `
      UPDATE materials
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex++} AND meeting_id = $${paramIndex++}
      RETURNING 
        id, 
        meeting_id as "meetingId", 
        class_id as "classId", 
        title, 
        type, 
        description, 
        file_url as "fileUrl", 
        file_name as "fileName", 
        file_size_bytes as "fileSizeBytes", 
        external_url as "externalUrl", 
        text_content as "textContent",
        online_module as "onlineModule",
        status, 
        allow_download as "allowDownload", 
        created_at as "createdAt",
        updated_at as "updatedAt"
    `;

    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).json({ error: { code: 'MATERIAL_NOT_FOUND', message: 'Materi tidak ditemukan.' } });
      return;
    }

    res.json({
      data: {
        message: 'Materi pembelajaran berhasil diperbarui.',
        material: result.rows[0]
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteMaterial(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { meetingId, materialId } = req.params;

    await db.transaction(async (client) => {
      // 1. Hapus log akses materi
      await client.query(`DELETE FROM material_access_logs WHERE material_id = $1`, [materialId]);

      // 2. Hapus materi
      await client.query(`DELETE FROM materials WHERE id = $1 AND meeting_id = $2`, [materialId, meetingId]);
    });

    res.json({ data: { message: 'Materi pembelajaran berhasil dihapus.' } });
  } catch (err) {
    next(err);
  }
}

// =========================================================================
// 4. LOGGING AKSES MATERI
// =========================================================================

export async function logMaterialAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { materialId } = req.params;
    const user = req.user!;
    const { durationSeconds = 60 } = req.body;

    const query = `
      INSERT INTO material_access_logs (id, material_id, student_id, first_accessed_at, last_accessed_at, access_count, total_duration_seconds)
      VALUES ($1, $2, $3, NOW(), NOW(), 1, $4)
      ON CONFLICT (material_id, student_id) DO UPDATE SET
        last_accessed_at = NOW(),
        access_count = material_access_logs.access_count + 1,
        total_duration_seconds = material_access_logs.total_duration_seconds + EXCLUDED.total_duration_seconds
      RETURNING *
    `;

    const result = await db.query(query, [
      `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materialId,
      user.id,
      durationSeconds
    ]);

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
