import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getVideos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.query;
    let query = `
      SELECT 
        v.id,
        v.class_id as "classId",
        v.meeting_id as "meetingId",
        v.title,
        v.description,
        v.video_url as "videoUrl",
        v.poster_url as "posterUrl",
        v.duration_seconds as "durationSeconds",
        v.min_watched_percentage as "minWatchedPercentage",
        v.status,
        cm.meeting_number as "meetingNumber",
        c.name as "courseName"
      FROM interactive_videos v
      JOIN course_meetings cm ON cm.id = v.meeting_id
      JOIN course_classes cc ON cc.id = v.class_id
      JOIN courses c ON c.id = cc.course_id
    `;
    const params: any[] = [];

    if (classId) {
      query += ` WHERE v.class_id = $1`;
      params.push(classId);
    }

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getVideoById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { videoId } = req.params;

    const vidResult = await db.query(`
      SELECT 
        v.id,
        v.class_id as "classId",
        v.meeting_id as "meetingId",
        v.title,
        v.description,
        v.video_url as "videoUrl",
        v.poster_url as "posterUrl",
        v.duration_seconds as "durationSeconds",
        v.min_watched_percentage as "minWatchedPercentage",
        v.allow_fast_forward as "allowFastForward",
        v.status,
        cm.meeting_number as "meetingNumber",
        c.name as "courseName"
      FROM interactive_videos v
      JOIN course_meetings cm ON cm.id = v.meeting_id
      JOIN course_classes cc ON cc.id = v.class_id
      JOIN courses c ON c.id = cc.course_id
      WHERE v.id = $1
    `, [videoId]);

    if (vidResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'VIDEO_NOT_FOUND', message: 'Video tidak ditemukan.' } });
      return;
    }

    const video = vidResult.rows[0];

    // Ambil Checkpoints
    const chkResult = await db.query(`
      SELECT 
        id,
        video_id as "videoId",
        timestamp_seconds as "timestampSeconds",
        title,
        question_text as "questionText",
        type,
        options,
        correct_answer_text as "correctAnswerText",
        explanation,
        is_required as "isRequired",
        allow_retry as "allowRetry"
      FROM video_checkpoints
      WHERE video_id = $1
      ORDER BY timestamp_seconds ASC
    `, [videoId]);

    video.checkpoints = chkResult.rows;

    res.json({ data: video });
  } catch (err) {
    next(err);
  }
}

export async function getStudentVideoProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { videoId } = req.params;
    const user = req.user!;

    const result = await db.query(`
      SELECT 
        id,
        video_id as "videoId",
        student_id as "studentId",
        last_position_seconds as "lastPositionSeconds",
        max_watched_position_seconds as "maxWatchedPositionSeconds",
        watched_segments as "watchedSegments",
        effective_watched_percentage as "effectiveWatchedPercentage",
        answered_questions as "answeredQuestions",
        is_completed as "isCompleted",
        completed_at as "completedAt",
        last_synced_at as "lastSyncedAt"
      FROM student_video_progress
      WHERE video_id = $1 AND student_id = $2
    `, [videoId, user.id]);

    if (result.rows.length === 0) {
      res.json({
        data: {
          videoId,
          studentId: user.id,
          lastPositionSeconds: 0,
          maxWatchedPositionSeconds: 0,
          effectiveWatchedPercentage: 0,
          isCompleted: false,
          answeredQuestions: []
        }
      });
      return;
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function updateVideoProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { videoId } = req.params;
    const user = req.user!;
    const { currentPlaybackTime, segmentDuration = 5 } = req.body;

    const vidResult = await db.query('SELECT duration_seconds, min_watched_percentage FROM interactive_videos WHERE id = $1', [videoId]);
    if (vidResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'VIDEO_NOT_FOUND', message: 'Video tidak ditemukan.' } });
      return;
    }

    const video = vidResult.rows[0];
    const totalDuration = video.duration_seconds || 300;
    const minPercentage = video.min_watched_percentage || 80;

    // Server-side calculation: clamp watched duration to prevent skipping cheat
    const segStart = Math.max(0, currentPlaybackTime - segmentDuration);
    const segEnd = Math.min(totalDuration, currentPlaybackTime);

    // Ambil data progress lama
    const progResult = await db.query(`
      SELECT * FROM student_video_progress WHERE video_id = $1 AND student_id = $2
    `, [videoId, user.id]);

    let segments: { startSeconds: number; endSeconds: number }[] = [];
    let answered: any[] = [];
    let isCompleted = false;

    if (progResult.rows.length > 0) {
      segments = progResult.rows[0].watched_segments || [];
      answered = progResult.rows[0].answered_questions || [];
      isCompleted = progResult.rows[0].is_completed;
    }

    // Tambah segmen baru dan merge
    segments.push({ startSeconds: segStart, endSeconds: segEnd });
    segments.sort((a, b) => a.startSeconds - b.startSeconds);

    const merged: { startSeconds: number; endSeconds: number }[] = [segments[0]];
    for (let i = 1; i < segments.length; i++) {
      const cur = segments[i];
      const last = merged[merged.length - 1];
      if (cur.startSeconds <= last.endSeconds) {
        last.endSeconds = Math.max(last.endSeconds, cur.endSeconds);
      } else {
        merged.push(cur);
      }
    }

    const totalWatchedSeconds = merged.reduce((acc, s) => acc + (s.endSeconds - s.startSeconds), 0);
    const calculatedPercentage = Math.min(100, Math.round((totalWatchedSeconds / totalDuration) * 100));

    if (calculatedPercentage >= minPercentage && !isCompleted) {
      isCompleted = true;
    }

    const query = `
      INSERT INTO student_video_progress (
        id, video_id, student_id, last_position_seconds, max_watched_position_seconds,
        watched_segments, effective_watched_percentage, answered_questions, is_completed, completed_at, last_synced_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (video_id, student_id) DO UPDATE SET
        last_position_seconds = EXCLUDED.last_position_seconds,
        max_watched_position_seconds = GREATEST(student_video_progress.max_watched_position_seconds, EXCLUDED.max_watched_position_seconds),
        watched_segments = EXCLUDED.watched_segments,
        effective_watched_percentage = EXCLUDED.effective_watched_percentage,
        is_completed = EXCLUDED.is_completed,
        completed_at = COALESCE(student_video_progress.completed_at, EXCLUDED.completed_at),
        last_synced_at = NOW()
      RETURNING *
    `;

    await db.query(query, [
      `svp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      videoId,
      user.id,
      currentPlaybackTime,
      currentPlaybackTime,
      JSON.stringify(merged),
      calculatedPercentage,
      JSON.stringify(answered),
      isCompleted,
      isCompleted ? new Date().toISOString() : null
    ]);

    res.json({
      data: {
        effectiveWatchedPercentage: calculatedPercentage,
        isCompleted,
        lastPositionSeconds: currentPlaybackTime
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function submitCheckpointAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { videoId, checkpointId } = req.params;
    const { selectedOptionId, textAnswer } = req.body;

    const chkResult = await db.query(`
      SELECT * FROM video_checkpoints WHERE id = $1 AND video_id = $2
    `, [checkpointId, videoId]);

    if (chkResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'CHECKPOINT_NOT_FOUND', message: 'Titik pertanyaan tidak ditemukan.' } });
      return;
    }

    const chk = chkResult.rows[0];
    let isCorrect = false;

    if (chk.type === 'PILIHAN_GANDA' || chk.type === 'BENAR_SALAH') {
      const options = chk.options || [];
      const chosen = options.find((o: any) => o.id === selectedOptionId);
      isCorrect = !!chosen?.isCorrect;
    } else if (chk.type === 'JAWABAN_SINGKAT') {
      const expected = (chk.correct_answer_text || '').trim().toLowerCase();
      const actual = (textAnswer || '').trim().toLowerCase();
      isCorrect = expected === actual;
    }

    res.json({
      data: {
        isCorrect,
        explanation: chk.explanation
      }
    });
  } catch (err) {
    next(err);
  }
}
