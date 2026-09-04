import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getThreads(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, meetingId } = req.query;
    let query = `
      SELECT 
        dt.id,
        dt.class_id as "classId",
        dt.meeting_id as "meetingId",
        dt.title,
        dt.content,
        dt.author_id as "authorId",
        dt.is_pinned as "isPinned",
        dt.is_locked as "isLocked",
        dt.view_count as "viewCount",
        dt.created_at as "createdAt",
        u.name as "authorName",
        u.role as "authorRole",
        (SELECT COUNT(*) FROM discussion_posts dp WHERE dp.thread_id = dt.id) as "repliesCount"
      FROM discussion_threads dt
      JOIN users u ON u.id = dt.author_id
      WHERE dt.class_id = $1
    `;
    const params: any[] = [classId || 'cls-pai301-a'];

    if (meetingId) {
      query += ` AND dt.meeting_id = $2`;
      params.push(meetingId);
    }

    query += ` ORDER BY dt.is_pinned DESC, dt.created_at DESC`;

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function getThreadById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { threadId } = req.params;

    const threadResult = await db.query(`
      SELECT 
        dt.id,
        dt.class_id as "classId",
        dt.meeting_id as "meetingId",
        dt.title,
        dt.content,
        dt.author_id as "authorId",
        dt.is_pinned as "isPinned",
        dt.is_locked as "isLocked",
        dt.created_at as "createdAt",
        u.name as "authorName",
        u.role as "authorRole"
      FROM discussion_threads dt
      JOIN users u ON u.id = dt.author_id
      WHERE dt.id = $1
    `, [threadId]);

    if (threadResult.rows.length === 0) {
      res.status(404).json({ error: { code: 'THREAD_NOT_FOUND', message: 'Topik diskusi tidak ditemukan.' } });
      return;
    }

    const thread = threadResult.rows[0];

    const postsResult = await db.query(`
      SELECT 
        dp.id,
        dp.thread_id as "threadId",
        dp.parent_post_id as "parentPostId",
        dp.author_id as "authorId",
        dp.content,
        dp.is_best_answer as "isBestAnswer",
        dp.is_hidden as "isHidden",
        dp.upvotes_count as "upvotesCount",
        dp.created_at as "createdAt",
        u.name as "authorName",
        u.role as "authorRole"
      FROM discussion_posts dp
      JOIN users u ON u.id = dp.author_id
      WHERE dp.thread_id = $1
      ORDER BY dp.is_best_answer DESC, dp.created_at ASC
    `, [threadId]);

    thread.posts = postsResult.rows;

    res.json({ data: thread });
  } catch (err) {
    next(err);
  }
}

export async function createThread(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId, meetingId, title, content } = req.body;
    const user = req.user!;

    const id = `thr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const result = await db.query(`
      INSERT INTO discussion_threads (id, class_id, meeting_id, title, content, author_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, classId || 'cls-pai301-a', meetingId || null, title, content, user.id]);

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { threadId } = req.params;
    const { parentPostId, content } = req.body;
    const user = req.user!;

    const id = `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const result = await db.query(`
      INSERT INTO discussion_posts (id, thread_id, parent_post_id, author_id, content)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [id, threadId, parentPostId || null, user.id, content]);

    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
