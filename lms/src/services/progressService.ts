import { 
  LearningActivityItem, 
  StudentActivityProgress, 
  CourseProgressSummary, 
  MeetingProgressSummary,
  StudentClassProgressSummary
} from '../types/progress';
import { learningService } from './learningService';
import { videoService } from './videoService';
import { quizService } from './quizService';
import { assignmentService } from './assignmentService';
import { forumService } from './forumService';
import { auditService } from './auditService';

const MANUAL_PROGRESS_STORAGE_KEY = 'salam_manual_activity_progress';

// Standar Daftar Aktivitas Pembelajaran untuk Kelas PAI-301-A
export const CLASS_ACTIVITIES: LearningActivityItem[] = [
  // Sesi 1
  {
    id: 'act-pai301-01',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-01',
    meetingNumber: 1,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Materi RPS & Pengantar Ilmu Ushul Fiqih',
    type: 'MATERI',
    resourceId: 'mat-01',
    isMandatory: true,
    rule: { type: 'MATERI', allowManualOverride: true }
  },
  {
    id: 'act-pai301-02',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-01',
    meetingNumber: 1,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Video Interaktif: Pengantar Kaidah Ushuliyah',
    type: 'VIDEO_INTERAKTIF',
    resourceId: 'vid-ushul-01',
    isMandatory: true,
    rule: { type: 'VIDEO_INTERAKTIF', minWatchedPercentage: 80, requiresAllCheckpoints: true }
  },
  {
    id: 'act-pai301-03',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-01',
    meetingNumber: 1,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Forum Diskusi: Relevansi Kaidah Ushul Fiqih dalam Isu Kontemporer',
    type: 'FORUM_DISKUSI',
    resourceId: 'thr-01',
    isMandatory: true,
    rule: { type: 'FORUM_DISKUSI', requiresDiscussionPost: true }
  },

  // Sesi 2
  {
    id: 'act-pai301-04',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-02',
    meetingNumber: 2,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Materi: Kaidah Lughawiyah (\'Am, Khas, Musytarak)',
    type: 'MATERI',
    resourceId: 'mat-02',
    isMandatory: true,
    rule: { type: 'MATERI', allowManualOverride: true }
  },
  {
    id: 'act-pai301-05',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-02',
    meetingNumber: 2,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Kuis Daring: Evaluasi Kaidah Lughawiyah & Sumber Hukum',
    type: 'KUIS',
    resourceId: 'qz-pai301-01',
    isMandatory: true,
    rule: { type: 'KUIS', requiresScore: true, minScore: 75 }
  },

  // Sesi 3
  {
    id: 'act-pai301-06',
    classId: 'cls-pai301-a',
    meetingId: 'mtg-pai301a-03',
    meetingNumber: 3,
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    title: 'Tugas Makalah: Analisis Kasus Fatwa DSN-MUI',
    type: 'TUGAS',
    resourceId: 'asg-pai301-01',
    isMandatory: true,
    rule: { type: 'TUGAS', requiresSubmission: true }
  }
];

class ProgressService {
  private getManualProgressMap(): Record<string, boolean> {
    try {
      const raw = localStorage.getItem(MANUAL_PROGRESS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveManualProgressMap(map: Record<string, boolean>): void {
    localStorage.setItem(MANUAL_PROGRESS_STORAGE_KEY, JSON.stringify(map));
  }

  /**
   * EVALUASI OTOMATIS STATUS AKTIVITAS BELAJAR SISWA
   */
  public evaluateActivityProgress(
    activity: LearningActivityItem,
    studentId: string
  ): StudentActivityProgress {
    const manualMap = this.getManualProgressMap();
    const manualKey = `${studentId}_${activity.id}`;

    // 1. Cek jika ada centang manual
    if (manualMap[manualKey]) {
      return {
        activityId: activity.id,
        studentId,
        isCompleted: true,
        completionType: 'MANUAL',
        progressPercentage: 100,
        details: 'Ditandai selesai secara mandiri oleh mahasiswa.'
      };
    }

    // 2. Evaluasi Berdasarkan Tipe Aktivitas
    switch (activity.type) {
      case 'MATERI': {
        const logs = learningService.getMaterialAccessLogs(studentId, activity.classId);
        const matLog = logs.find((l) => l.materialId === activity.resourceId);
        const hasAccessed = !!matLog;
        return {
          activityId: activity.id,
          studentId,
          isCompleted: hasAccessed,
          completedAt: matLog ? matLog.lastAccessedAt : undefined,
          completionType: 'OTOMATIS',
          progressPercentage: hasAccessed ? 100 : 0,
          details: hasAccessed 
            ? `Dokumen materi telah dibuka pada ${new Date(matLog.lastAccessedAt).toLocaleTimeString('id-ID')}.`
            : 'Materi pembelajaran belum dibuka.'
        };
      }

      case 'VIDEO_INTERAKTIF': {
        const vidProgress = videoService.getStudentProgress(activity.resourceId, studentId);
        if (!vidProgress) {
          return {
            activityId: activity.id,
            studentId,
            isCompleted: false,
            completionType: 'OTOMATIS',
            progressPercentage: 0,
            details: 'Video interaktif belum ditonton.'
          };
        }
        return {
          activityId: activity.id,
          studentId,
          isCompleted: vidProgress.isCompleted,
          completedAt: vidProgress.completedAt || vidProgress.lastSyncedAt,
          completionType: 'OTOMATIS',
          progressPercentage: vidProgress.effectiveWatchedPercentage,
          details: vidProgress.isCompleted 
            ? `Tuntas ditonton (${vidProgress.effectiveWatchedPercentage}%) & seluruh pertanyaan checkpoint terjawab.`
            : `Progres tontonan: ${vidProgress.effectiveWatchedPercentage}%. Selesaikan video dan checkpoint pertanyaan.`
        };
      }

      case 'KUIS': {
        const attempts = quizService.getStudentAttempts(activity.resourceId, studentId);
        const submittedAttempt = attempts.find(
          (a) => a.status === 'DINILAI' || a.status === 'DIKUMPULKAN'
        );

        if (!submittedAttempt) {
          return {
            activityId: activity.id,
            studentId,
            isCompleted: false,
            completionType: 'OTOMATIS',
            progressPercentage: 0,
            details: 'Kuis daring belum dikerjakan.'
          };
        }

        const isPassed = submittedAttempt.status === 'DINILAI' 
          ? (submittedAttempt.finalScore >= (activity.rule.minScore || 75))
          : true; // Jika menunggu penilaian esai dianggap terkumpul

        return {
          activityId: activity.id,
          studentId,
          isCompleted: isPassed,
          completedAt: submittedAttempt.submittedAt,
          completionType: 'OTOMATIS',
          progressPercentage: isPassed ? 100 : 50,
          details: submittedAttempt.status === 'DINILAI'
            ? `Kuis diselesaikan dengan Nilai Akhir: ${submittedAttempt.finalScore} / 100 (${isPassed ? 'Lulus KKM' : 'Belum Lulus KKM'}).`
            : 'Kuis telah dikumpulkan, menunggu penilaian esai oleh dosen.'
        };
      }

      case 'TUGAS': {
        const sub = assignmentService.getStudentSubmission(activity.resourceId, studentId);
        const hasSubmitted = !!sub && (sub.status === 'SUDAH_DIKUMPULKAN' || sub.status === 'TERLAMBAT' || sub.status === 'SUDAH_DINILAI');

        return {
          activityId: activity.id,
          studentId,
          isCompleted: hasSubmitted,
          completedAt: sub?.submittedAt,
          completionType: 'OTOMATIS',
          progressPercentage: hasSubmitted ? 100 : 0,
          details: hasSubmitted
            ? `Tugas telah dikumpulkan (Versi ${sub.version}${sub.finalScore !== undefined ? `, Nilai: ${sub.finalScore}` : ''}).`
            : 'Tugas perkuliahan belum dikumpulkan.'
        };
      }

      case 'FORUM_DISKUSI': {
        const events = forumService.getParticipationEvents(studentId, activity.classId);
        const threadEvent = events.find((e) => e.threadId === activity.resourceId);
        const hasParticipated = !!threadEvent || events.length > 0;

        return {
          activityId: activity.id,
          studentId,
          isCompleted: hasParticipated,
          completedAt: threadEvent?.timestamp,
          completionType: 'OTOMATIS',
          progressPercentage: hasParticipated ? 100 : 0,
          details: hasParticipated
            ? 'Mahasiswa telah aktif berpartisipasi menyampaikan tanggapan pada forum diskusi.'
            : 'Belum ada tanggapan atau partisipasi diskusi pada sesi ini.'
        };
      }

      default:
        return {
          activityId: activity.id,
          studentId,
          isCompleted: false,
          completionType: 'OTOMATIS',
          progressPercentage: 0,
          details: 'Aktivitas belum diselesaikan.'
        };
    }
  }

  /**
   * TOGGLE CENTANG MANUAL OLEH MAHASISWA
   */
  public toggleManualProgress(
    activityId: string,
    studentId: string,
    studentName: string
  ): boolean {
    const activity = CLASS_ACTIVITIES.find((a) => a.id === activityId);
    if (!activity || !activity.rule.allowManualOverride) {
      throw new Error('Aktivitas ini memerlukan penyelesaian otomatis oleh sistem dan tidak dapat dicentang manual.');
    }

    const map = this.getManualProgressMap();
    const key = `${studentId}_${activityId}`;
    const nextState = !map[key];
    map[key] = nextState;
    this.saveManualProgressMap(map);

    auditService.record(
      studentId,
      studentName,
      'mahasiswa',
      'CENTANG_PROGRES_MANUAL',
      'PROGRES_BELAJAR',
      `Mahasiswa mengubah status centang manual aktivitas "${activity.title}" menjadi ${nextState ? 'SELESAI' : 'BELUM SELESAI'}.`,
      'SUKSES'
    );

    return nextState;
  }

  /**
   * HITUNG RINGKASAN PROGRES MAHASISWA PER MATA KULIAH
   */
  public getCourseProgress(
    classId: string,
    studentId: string,
    studentNim: string,
    studentName: string
  ): CourseProgressSummary {
    const activities = CLASS_ACTIVITIES.filter((a) => a.classId === classId);
    const meetingMap: Record<number, LearningActivityItem[]> = {};

    activities.forEach((act) => {
      if (!meetingMap[act.meetingNumber]) meetingMap[act.meetingNumber] = [];
      meetingMap[act.meetingNumber].push(act);
    });

    const meetings: MeetingProgressSummary[] = Object.keys(meetingMap).map((mtgNumStr) => {
      const mtgNum = parseInt(mtgNumStr);
      const mtgActivities = meetingMap[mtgNum];
      let completedCount = 0;

      const actWithProgress = mtgActivities.map((act) => {
        const progress = this.evaluateActivityProgress(act, studentId);
        if (progress.isCompleted) completedCount += 1;
        return { ...act, progress };
      });

      const total = mtgActivities.length;
      const pct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        meetingId: `mtg-pai301a-0${mtgNum}`,
        meetingNumber: mtgNum,
        title: `Pertemuan ${mtgNum}: ${mtgNum === 1 ? 'Pengantar Ushul Fiqih' : mtgNum === 2 ? 'Kaidah Lughawiyah' : 'Sumber Hukum & Fatwa DSN'}`,
        totalActivities: total,
        completedActivities: completedCount,
        progressPercentage: pct,
        isCompleted: completedCount === total,
        activities: actWithProgress
      };
    });

    const totalActivities = activities.length;
    let totalCompleted = 0;
    let nextActivity: LearningActivityItem | undefined = undefined;

    meetings.forEach((m) => {
      totalCompleted += m.completedActivities;
      if (!nextActivity) {
        const firstUnfinished = m.activities.find((a) => !a.progress?.isCompleted);
        if (firstUnfinished) {
          nextActivity = firstUnfinished;
        }
      }
    });

    const overallPercentage = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;

    return {
      classId,
      courseCode: 'PAI-301',
      courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)',
      studentId,
      studentNim,
      studentName,
      totalActivities,
      completedActivities: totalCompleted,
      overallPercentage,
      meetings,
      nextActivity
    };
  }

  /**
   * HITUNG RINGKASAN KELAS KESELURUHAN UNTUK DOSEN
   */
  public getClassProgressList(classId: string): StudentClassProgressSummary[] {
    const students = [
      { id: 'usr-mhs-01', nim: '21.01.0042', name: 'Ahmad Fauzi' },
      { id: 'usr-mhs-02', nim: '21.01.0043', name: 'Siti Nurhaliza' },
      { id: 'usr-mhs-03', nim: '21.01.0044', name: 'Muhammad Rizki' },
      { id: 'usr-mhs-04', nim: '21.01.0045', name: 'Dewi Lestari' },
      { id: 'usr-mhs-05', nim: '21.01.0046', name: 'Bambang Sudarsono' },
    ];

    return students.map((s) => {
      const prog = this.getCourseProgress(classId, s.id, s.nim, s.name);
      let status: 'TERTINGGAL' | 'BERJALAN_NORMAL' | 'SELESAI' = 'BERJALAN_NORMAL';
      if (prog.overallPercentage >= 80) status = 'SELESAI';
      else if (prog.overallPercentage < 50) status = 'TERTINGGAL';

      return {
        studentId: s.id,
        studentNim: s.nim,
        studentName: s.name,
        totalActivities: prog.totalActivities,
        completedActivities: prog.completedActivities,
        overallPercentage: prog.overallPercentage,
        status,
        lastActiveAt: '2026-09-02T10:00:00Z'
      };
    });
  }
}

export const progressService = new ProgressService();
