import { 
  InstitutionalReportSummary, 
  AtRiskStudentItem, 
  LecturerComplianceItem 
} from '../types/reporting';
import { learningService } from './learningService';
import { assignmentService } from './assignmentService';
import { quizService } from './quizService';
import { progressService } from './progressService';
import { CourseMeeting } from '../types/learning';

class ReportingService {
  /**
   * MENGUMPULKAN DATA LAPORAN INSTITUSIONAL UNTUK PIMPINAN & KAPRODI
   */
  public getInstitutionalReport(riskThresholdPercentage = 50): InstitutionalReportSummary {
    const classId = 'cls-pai301-a';
    const meetings: CourseMeeting[] = learningService.getMeetingsByClass(classId);
    const submissions = assignmentService.getSubmissions();
    const attempts = quizService.getAttempts();
    const studentProgressList = progressService.getClassProgressList(classId);

    // 1. Identifikasi Mahasiswa Berisiko Tertinggal
    const atRiskStudents: AtRiskStudentItem[] = studentProgressList
      .filter((s) => s.overallPercentage < riskThresholdPercentage)
      .map((s) => ({
        studentId: s.studentId,
        studentNim: s.studentNim,
        studentName: s.studentName,
        courseCode: 'PAI-301',
        courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
        progressPercentage: s.overallPercentage,
        uncompletedActivitiesCount: s.totalActivities - s.completedActivities,
        riskFactor: 'PROGRES_RENDAH',
        lastActivityAt: s.lastActiveAt
      }));

    // 2. Evaluasi Keterlaksanaan & Kepatuhan Dosen (Lecturer Compliance)
    const publishedCount = meetings.filter((m: CourseMeeting) => m.status === 'DITERBITKAN').length;
    const draftCount = meetings.filter((m: CourseMeeting) => m.status === 'DRAF').length;
    const pendingAsg = submissions.filter((sub) => sub.status !== 'SUDAH_DINILAI').length;
    const pendingQz = attempts.filter((att) => att.needsManualGrading).length;

    const complianceRate = meetings.length > 0 ? Math.round((publishedCount / meetings.length) * 100) : 0;

    const lecturerCompliances: LecturerComplianceItem[] = [
      {
        lecturerId: 'usr-dsn-01',
        lecturerName: 'Dr. H. M. Ridwan, M.Ag',
        courseCode: 'PAI-301',
        courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)',
        totalMeetings: meetings.length,
        publishedMeetings: publishedCount,
        draftMeetings: draftCount,
        pendingAssignmentGradingCount: pendingAsg,
        pendingQuizGradingCount: pendingQz,
        complianceRate
      },
      {
        lecturerId: 'usr-dsn-02',
        lecturerName: 'Dr. Ahmad Subagja, M.Pd',
        courseCode: 'PAI-204',
        courseName: 'Studi Naskah Tafsir Tarbawi (Kelas B)',
        totalMeetings: 16,
        publishedMeetings: 12,
        draftMeetings: 4,
        pendingAssignmentGradingCount: 1,
        pendingQuizGradingCount: 0,
        complianceRate: 75
      }
    ];

    const totalStudents = studentProgressList.length;
    const avgProgress = totalStudents > 0 
      ? Math.round(studentProgressList.reduce((a, b) => a + b.overallPercentage, 0) / totalStudents)
      : 0;

    return {
      academicYear: 'Semester Ganjil 2026/2027',
      totalActiveClasses: 2,
      totalEnrolledStudents: totalStudents,
      totalActiveLecturers: 2,
      averageStudentProgress: avgProgress,
      totalAtRiskStudents: atRiskStudents.length,
      totalPendingGrading: pendingAsg + pendingQz,
      atRiskStudents,
      lecturerCompliances,
      syncHealth: {
        lastSyncAt: '2026-09-02T08:30:00Z',
        overallStatus: 'SEHAT',
        totalSyncedEntities: 142,
        successRate: 98.6,
        conflictsCount: 0,
        recentSyncRunsCount: 12
      }
    };
  }

  /**
   * GENERASI EKSPOR CSV REKAPITULASI PROGRES & NILAI KELAS
   */
  public generateProgressCsv(classId = 'cls-pai301-a'): string {
    const list = progressService.getClassProgressList(classId);
    let csv = 'NIM,Nama Mahasiswa,Aktivitas Selesai,Total Aktivitas,Persentase Ketercapaian,Status Belajar\n';
    list.forEach((s) => {
      csv += `"${s.studentNim}","${s.studentName}",${s.completedActivities},${s.totalActivities},${s.overallPercentage}%,"${s.status}"\n`;
    });
    return csv;
  }
}

export const reportingService = new ReportingService();
