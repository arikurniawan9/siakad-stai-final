import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

export async function getCourseProgress(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;
    const user = req.user!;
    const studentId = req.query.studentId ? String(req.query.studentId) : user.id;

    // Evaluasi aktivitas per pertemuan
    const meetingsResult = await db.query(`
      SELECT id, meeting_number as "meetingNumber", title, status
      FROM course_meetings
      WHERE class_id = $1 AND status = 'DITERBITKAN'
      ORDER BY meeting_number ASC
    `, [classId]);

    const meetings = meetingsResult.rows;
    let totalActivities = 0;
    let completedActivities = 0;
    let nextActivity: any = null;

    const meetingsProgress = [];

    for (const mtg of meetings) {
      // Materi
      const matResult = await db.query(`
        SELECT m.id, m.title, 'MATERI' as type,
          EXISTS(SELECT 1 FROM material_access_logs WHERE material_id = m.id AND student_id = $1) as is_completed
        FROM materials m WHERE m.meeting_id = $2 AND m.status = 'DITERBITKAN'
      `, [studentId, mtg.id]);

      // Video
      const vidResult = await db.query(`
        SELECT v.id, v.title, 'VIDEO_INTERAKTIF' as type,
          COALESCE((SELECT is_completed FROM student_video_progress WHERE video_id = v.id AND student_id = $1), FALSE) as is_completed
        FROM interactive_videos v WHERE v.meeting_id = $2 AND v.status = 'DITERBITKAN'
      `, [studentId, mtg.id]);

      // Kuis
      const qzResult = await db.query(`
        SELECT q.id, q.title, 'KUIS' as type,
          EXISTS(SELECT 1 FROM quiz_attempts WHERE quiz_id = q.id AND student_id = $1 AND (status = 'DIKUMPULKAN' OR status = 'DINILAI')) as is_completed
        FROM quizzes q WHERE q.meeting_id = $2 AND q.status = 'DITERBITKAN'
      `, [studentId, mtg.id]);

      // Tugas
      const asgResult = await db.query(`
        SELECT a.id, a.title, 'TUGAS' as type,
          EXISTS(SELECT 1 FROM assignment_submissions WHERE assignment_id = a.id AND student_id = $1) as is_completed
        FROM assignments a WHERE a.meeting_id = $2 AND a.status = 'DITERBITKAN'
      `, [studentId, mtg.id]);

      const activities = [
        ...matResult.rows.map((r: any) => ({ ...r, meetingNumber: mtg.meetingNumber })),
        ...vidResult.rows.map((r: any) => ({ ...r, meetingNumber: mtg.meetingNumber })),
        ...qzResult.rows.map((r: any) => ({ ...r, meetingNumber: mtg.meetingNumber })),
        ...asgResult.rows.map((r: any) => ({ ...r, meetingNumber: mtg.meetingNumber }))
      ];

      const mtgTotal = activities.length;
      const mtgCompleted = activities.filter((a) => a.is_completed).length;
      const mtgPct = mtgTotal > 0 ? Math.round((mtgCompleted / mtgTotal) * 100) : 0;

      totalActivities += mtgTotal;
      completedActivities += mtgCompleted;

      if (!nextActivity) {
        const firstUnfinished = activities.find((a) => !a.is_completed);
        if (firstUnfinished) nextActivity = firstUnfinished;
      }

      meetingsProgress.push({
        meetingId: mtg.id,
        meetingNumber: mtg.meetingNumber,
        title: mtg.title,
        totalActivities: mtgTotal,
        completedActivities: mtgCompleted,
        progressPercentage: mtgPct,
        isCompleted: mtgCompleted === mtgTotal && mtgTotal > 0,
        activities: activities.map((a) => ({
          id: `act-${a.type.toLowerCase()}-${a.id}`,
          title: a.title,
          type: a.type,
          resourceId: a.id,
          isMandatory: true,
          progress: {
            isCompleted: a.is_completed,
            completionType: 'OTOMATIS',
            progressPercentage: a.is_completed ? 100 : 0
          }
        }))
      });
    }

    const overallPercentage = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    res.json({
      data: {
        classId,
        courseCode: 'PAI-301',
        courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)',
        totalActivities,
        completedActivities,
        overallPercentage,
        meetings: meetingsProgress,
        nextActivity: nextActivity ? {
          id: `act-${nextActivity.type.toLowerCase()}-${nextActivity.id}`,
          meetingNumber: nextActivity.meetingNumber,
          title: nextActivity.title,
          type: nextActivity.type,
          resourceId: nextActivity.id
        } : undefined
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getClassProgressList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { classId } = req.params;

    const studentsResult = await db.query(`
      SELECT u.id as "studentId", u.identity_number as "studentNim", u.name as "studentName"
      FROM class_enrollments ce
      JOIN users u ON u.id = ce.student_id
      WHERE ce.class_id = $1
    `, [classId || 'cls-pai301-a']);

    const students = studentsResult.rows;
    const progressList = [];

    for (const s of students) {
      // Simulasikan perhitungan per mahasiswa
      progressList.push({
        studentId: s.studentId,
        studentNim: s.studentNim,
        studentName: s.studentName,
        totalActivities: 6,
        completedActivities: 3,
        overallPercentage: 50,
        status: 'BERJALAN_NORMAL',
        lastActiveAt: new Date().toISOString()
      });
    }

    res.json({ data: progressList });
  } catch (err) {
    next(err);
  }
}
