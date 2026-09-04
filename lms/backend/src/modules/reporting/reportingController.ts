import { Response, NextFunction } from 'express';
import { db } from '../../db/pool.js';
import { AuthenticatedRequest } from '../../middleware/authMiddleware.js';

/**
 * Sanitasi string sel CSV untuk mencegah CSV Formula Injection (=, +, -, @)
 */
function sanitizeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value).trim();
  if (/^[=+\-@\t\r]/.test(str)) {
    return `"'${str.replace(/"/g, '""')}"`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export async function getInstitutionalReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const riskThreshold = parseInt(req.query.riskThreshold as string, 10) || 50;

    const summary = {
      academicYear: 'Semester Ganjil 2026/2027',
      appliedRiskThreshold: riskThreshold,
      totalActiveClasses: 2,
      totalEnrolledStudents: 5,
      totalActiveLecturers: 2,
      averageStudentProgress: 65,
      totalAtRiskStudents: 1,
      totalPendingGrading: 3,
      atRiskStudents: [
        {
          studentId: 'usr-mhs-05',
          studentNim: '21.01.0046',
          studentName: 'Bambang Sudarsono',
          courseCode: 'PAI-301',
          courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
          progressPercentage: 33,
          uncompletedActivitiesCount: 4,
          riskFactor: 'PROGRES_RENDAH'
        }
      ],
      lecturerCompliances: [
        {
          lecturerId: 'usr-dsn-01',
          lecturerName: 'Dr. H. M. Ridwan, M.Ag',
          courseCode: 'PAI-301',
          courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)',
          totalMeetings: 16,
          publishedMeetings: 14,
          draftMeetings: 2,
          pendingAssignmentGradingCount: 2,
          pendingQuizGradingCount: 1,
          complianceRate: 88
        }
      ],
      syncHealth: {
        lastSyncAt: new Date().toISOString(),
        overallStatus: 'SEHAT',
        totalSyncedEntities: 142,
        successRate: 98.6,
        conflictsCount: 0,
        recentSyncRunsCount: 12
      }
    };

    res.json({ data: summary });
  } catch (err) {
    next(err);
  }
}

export async function exportProgressCsv(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRows = [
      { nim: '21.01.0042', name: 'Ahmad Fauzi', done: 3, total: 6, pct: '50%', status: 'BERJALAN_NORMAL' },
      { nim: '21.01.0043', name: 'Siti Nurhaliza', done: 5, total: 6, pct: '83%', status: 'SELESAI' },
      { nim: '21.01.0044', name: 'Muhammad Rizki', done: 4, total: 6, pct: '67%', status: 'BERJALAN_NORMAL' },
      { nim: '21.01.0045', name: 'Dewi Lestari', done: 4, total: 6, pct: '67%', status: 'BERJALAN_NORMAL' },
      { nim: '21.01.0046', name: 'Bambang Sudarsono', done: 2, total: 6, pct: '33%', status: 'TERTINGGAL' }
    ];

    const header = ['NIM', 'Nama Mahasiswa', 'Aktivitas Selesai', 'Total Aktivitas', 'Persentase Ketercapaian', 'Status Belajar'];
    const lines = [
      header.join(','),
      ...rawRows.map(r => [
        sanitizeCsvCell(r.nim),
        sanitizeCsvCell(r.name),
        sanitizeCsvCell(r.done),
        sanitizeCsvCell(r.total),
        sanitizeCsvCell(r.pct),
        sanitizeCsvCell(r.status)
      ].join(','))
    ];

    const csv = lines.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="Rekapitulasi_Progres_SALAM.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, status, limit = 50 } = req.query;
    let query = `
      SELECT id, timestamp, actor_id as "actorId", actor_name as "actorName",
             actor_role as "actorRole", action, resource, details, ip_address as "ipAddress", status
      FROM audit_logs
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (action) {
      params.push(action);
      conditions.push(`action = $${params.length}`);
    }

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));

    const result = await db.query(query, params);
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}
