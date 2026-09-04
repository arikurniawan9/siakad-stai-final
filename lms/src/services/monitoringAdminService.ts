import { 
  MonitoringSummaryStats, 
  ActivityFeedItem, 
  ClassEngagementItem, 
  AtRiskStudentItem,
  ActivityType 
} from '../types/monitoringAdmin';
import { apiClient } from '../api/client';

export class MonitoringAdminService {
  /**
   * Mengambil statistik ringkasan monitoring pembelajaran
   */
  async getSummaryStats(): Promise<MonitoringSummaryStats> {
    try {
      return await apiClient.get<MonitoringSummaryStats>('/monitoring/summary');
    } catch {
      return {
        totalInteractions: 142,
        totalMaterialAccesses: 48,
        avgVideoProgressPercent: 82.5,
        totalAssignmentSubmissions: 35,
        avgAssignmentScore: 86.4,
        totalQuizAttempts: 42,
        avgQuizScore: 84.8,
        totalForumPosts: 17,
        averageEngagementRate: 88.5,
        atRiskCount: 2
      };
    }
  }

  /**
   * Mengambil live feed log aktivitas mahasiswa
   */
  async getRealtimeActivityFeed(filters?: {
    activityType?: ActivityType | 'SEMUA';
    limit?: number;
  }): Promise<ActivityFeedItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.activityType && filters.activityType !== 'SEMUA') {
        params.append('activityType', filters.activityType);
      }
      if (filters?.limit) {
        params.append('limit', String(filters.limit));
      }

      const qs = params.toString();
      return await apiClient.get<ActivityFeedItem[]>(`/monitoring/realtime-feed${qs ? `?${qs}` : ''}`);
    } catch {
      const now = new Date();
      return [
        {
          activityId: 'act-01',
          activityType: 'AKSES_MATERI',
          studentName: 'Ahmad Fauzi',
          studentNim: '21.01.0042',
          studyProgramCode: 'PAI',
          courseName: 'Metodologi Studi Islam & Epistemologi',
          className: 'Kelas A Reguler',
          detail: 'Membaca E-Book Bab 3: Hermeneutika Al-Qur\'an',
          timestamp: new Date(now.getTime() - 4 * 60 * 1000).toISOString()
        },
        {
          activityId: 'act-02',
          activityType: 'KUIS_UJIAN',
          studentName: 'Siti Fatimah Zahra',
          studentNim: '22.01.0015',
          studyProgramCode: 'PAI',
          courseName: 'Tafsir Ayat Tarbawi',
          className: 'Kelas B',
          detail: 'Menyelesaikan Kuis Formatif 1 (Skor: 95/100)',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString()
        },
        {
          activityId: 'act-03',
          activityType: 'PENGUMPULAN_TUGAS',
          studentName: 'Muhammad Ridwan Nur',
          studentNim: '22.02.0008',
          studyProgramCode: 'MPI',
          courseName: 'Kepemimpinan & Tata Kelola Lembaga',
          className: 'Kelas A',
          detail: 'Mengumpulkan Makalah Studi Kasus Manajemen Mutu',
          timestamp: new Date(now.getTime() - 32 * 60 * 1000).toISOString()
        },
        {
          activityId: 'act-04',
          activityType: 'TONTON_VIDEO',
          studentName: 'Ali Haidar Rasyid',
          studentNim: '22.03.0012',
          studyProgramCode: 'HES',
          courseName: 'Pengantar Fiqih Muamalah & Hukum Kontrak',
          className: 'Kelas A',
          detail: 'Menyelesaikan Video Interaktif: Akad Mudharabah (100%)',
          timestamp: new Date(now.getTime() - 50 * 60 * 1000).toISOString()
        }
      ];
    }
  }

  /**
   * Mengambil matriks keterlibatan per kelas perkuliahan
   */
  async getClassEngagementMatrix(): Promise<ClassEngagementItem[]> {
    try {
      return await apiClient.get<ClassEngagementItem[]>('/monitoring/classes-engagement');
    } catch {
      return [
        {
          classId: 'cls-pai-01',
          className: 'Kelas A',
          academicYear: '2026/2027 Ganjil',
          courseCode: 'PAI-101',
          courseName: 'Metodologi Studi Islam & Epistemologi',
          credits: 3,
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          lecturerName: 'Dr. H. M. Ridwan, M.Ag',
          enrolledStudentsCount: 35,
          totalMaterialsCount: 12,
          totalAssignmentsCount: 4,
          totalQuizzesCount: 3,
          completionRatePercent: 92.5,
          averageQuizScore: 86.5,
          statusHealth: 'SANGAT_BAIK'
        },
        {
          classId: 'cls-mpi-01',
          className: 'Kelas A',
          academicYear: '2026/2027 Ganjil',
          courseCode: 'MPI-101',
          courseName: 'Kepemimpinan & Tata Kelola Lembaga',
          credits: 3,
          studyProgramName: 'Manajemen Pendidikan Islam',
          studyProgramCode: 'MPI',
          lecturerName: 'Dr. KH. Dedi Supriyadi, M.Ag',
          enrolledStudentsCount: 30,
          totalMaterialsCount: 10,
          totalAssignmentsCount: 3,
          totalQuizzesCount: 2,
          completionRatePercent: 88.0,
          averageQuizScore: 84.0,
          statusHealth: 'SANGAT_BAIK'
        }
      ];
    }
  }

  /**
   * Mengambil data mahasiswa berisiko (Early Warning System)
   */
  async getAtRiskStudents(): Promise<AtRiskStudentItem[]> {
    try {
      return await apiClient.get<AtRiskStudentItem[]>('/monitoring/at-risk-students');
    } catch {
      return [
        {
          profileId: 'prof-mhs-08',
          nim: '23.04.0005',
          userId: 'usr-mhs-08',
          studentName: 'Zahid Abdul Malik',
          studentEmail: 'zahid.malik@student.stai-alittihad.ac.id',
          studyProgramName: 'Pendidikan Guru Madrasah Ibtidaiyah',
          studyProgramCode: 'PGMI',
          currentSemester: 3,
          gpa: 3.60,
          advisorName: 'Dr. H. M. Ridwan, M.Ag',
          advisorEmail: 'm.ridwan@stai-alittihad.ac.id',
          phoneNumber: '081234567808',
          riskLevel: 'SEDANG',
          riskFactors: ['Keaktifan video < 40%', '1 Tugas belum diserahkan'],
          lastActiveDaysAgo: 5,
          recommendedAction: 'Kirim notifikasi pengingat tugas & info ke Dosen PA'
        },
        {
          profileId: 'prof-mhs-03',
          nim: '23.01.0028',
          userId: 'usr-mhs-03',
          studentName: 'Habibullah Al-Habsyi',
          studentEmail: 'habibullah@student.stai-alittihad.ac.id',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          currentSemester: 3,
          gpa: 3.65,
          advisorName: 'Dr. H. M. Ridwan, M.Ag',
          advisorEmail: 'm.ridwan@stai-alittihad.ac.id',
          phoneNumber: '081234567803',
          riskLevel: 'RENDAH',
          riskFactors: ['Nilai kuis formatif di bawah passing grade (60)'],
          lastActiveDaysAgo: 2,
          recommendedAction: 'Anjurkan sesi bimbingan remedial bersama Dosen Pengampu'
        }
      ];
    }
  }
}

export const monitoringAdminService = new MonitoringAdminService();
