import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const result = await db.query(`
      SELECT 
        id,
        user_id as "userId",
        title,
        message,
        category,
        is_read as "isRead",
        deep_link_path as "deepLinkPath",
        action_label as "actionLabel",
        created_at as "createdAt"
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 50
    `, [user.id]);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { notificationId } = req.params;
    const user = req.user!;

    await db.query(`
      UPDATE notifications SET is_read = TRUE
      WHERE id = $1 AND user_id = $2
    `, [notificationId, user.id]);

    res.json({ data: { message: 'Notifikasi ditandai dibaca.' } });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    await db.query(`
      UPDATE notifications SET is_read = TRUE
      WHERE user_id = $1
    `, [user.id]);

    res.json({ data: { message: 'Seluruh notifikasi ditandai dibaca.' } });
  } catch (err) {
    next(err);
  }
}

export async function getCalendarEvents(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await db.query(`
      SELECT 
        id,
        title,
        course_name as "courseName",
        type,
        date,
        start_time as "startTime",
        end_time as "endTime",
        location,
        description,
        deep_link_path as "deepLinkPath",
        is_urgent as "isUrgent"
      FROM campus_calendar_events
      ORDER BY date ASC
    `);

    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}
