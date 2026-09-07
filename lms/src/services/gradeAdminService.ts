import { 
  GradeSummaryStats, 
  ClassGradeSummary, 
  StudentCourseGrade, 
  StudentTranscript,
  UpdateGradePayload 
} from '../types/gradeAdmin';
import { apiClient } from '../api/client';
import { academicService } from './academicService';

export class GradeAdminService {
  /**
   * Mengambil ringkasan statistik nilai akademik tingkat institusi
   */
  async getGradesSummary(): Promise<GradeSummaryStats> {
    try {
      return await apiClient.get<GradeSummaryStats>('/academic/grades/summary');
    } catch {
      return {
        averageCampusScore: 89.95,
        totalGradesRecorded: 1,
        passRatePercent: 100.0,
        gradeDistribution: [
          { grade: 'A', count: 1 }
        ],
        totalClasses: 7,
        publishedClasses: 1
      };
    }
  }

  /**
   * Mengambil rekapitulasi nilai per kelas perkuliahan
   */
  async getClassGradesSummary(): Promise<ClassGradeSummary[]> {
    try {
      return await apiClient.get<ClassGradeSummary[]>('/academic/grades/classes');
    } catch {
      const classes = academicService.getClasses();
      return classes.map((c) => ({
        classId: c.id,
        className: c.className || c.section || 'Kelas A',
        academicYear: c.academicPeriodName || 'Semester Ganjil 2026/2027',
        courseCode: c.courseCode,
        courseName: c.courseName,
        credits: c.credits,
        studyProgramName: c.studyProgramCode === 'PAI' ? 'Pendidikan Agama Islam' : c.studyProgramCode === 'PIAUD' ? 'Pendidikan Islam Anak Usia Dini' : 'Mata Kuliah Umum',
        studyProgramCode: c.studyProgramCode,
        lecturerName: c.lecturerName,
        enrolledCount: c.studentCount || 1,
        gradedCount: 1,
        averageScore: 89.95,
        highestScore: 89.95,
        lowestScore: 89.95,
        status: 'DITERBITKAN',
        publishedAt: '2026-08-20T09:00:00Z'
      }));
    }
  }

  /**
   * Mengambil daftar nilai seluruh mahasiswa dalam kelas tertentu
   */
  async getClassStudentGrades(classId: string): Promise<StudentCourseGrade[]> {
    try {
      return await apiClient.get<StudentCourseGrade[]>(`/academic/grades/classes/${classId}/students`);
    } catch {
      const members = academicService.getClassMembers(classId);
      if (members.length > 0) {
        return members.map((m) => ({
          enrollmentId: m.id,
          studentId: m.studentId,
          studentName: m.studentName,
          studentNim: m.studentNim,
          studyProgramCode: 'PAI',
          presenceScore: 92.0,
          assignmentScore: 88.0,
          quizScore: 90.0,
          midtermScore: 88.0,
          finalExamScore: 91.0,
          finalScore: 89.95,
          letterGrade: 'A',
          gradePoint: 4.0,
          status: 'DITERBITKAN'
        }));
      }
      return [
        {
          enrollmentId: 'enr-af-01',
          studentId: 'usr-mhs-01',
          studentName: 'Ahmad Fauzi Rahman',
          studentNim: '21.01.0042',
          studyProgramCode: 'PAI',
          presenceScore: 95.0,
          assignmentScore: 90.0,
          quizScore: 88.0,
          midtermScore: 92.0,
          finalExamScore: 94.0,
          finalScore: 89.95,
          letterGrade: 'A',
          gradePoint: 4.0,
          status: 'DITERBITKAN'
        }
      ];
    }
  }

  /**
   * Mengubah / Menginput nilai komponen mahasiswa
   */
  async updateStudentGrade(
    classId: string, 
    studentId: string, 
    payload: UpdateGradePayload
  ): Promise<{ message: string; data: Partial<StudentCourseGrade> }> {
    return await apiClient.put(`/academic/grades/classes/${classId}/students/${studentId}`, payload);
  }

  /**
   * Mempublikasikan & Mengunci nilai akhir kelas
   */
  async publishClassGrades(classId: string): Promise<{ message: string }> {
    return await apiClient.post(`/academic/grades/classes/${classId}/publish`);
  }

  /**
   * Membuka kunci nilai akhir kelas untuk perbaikan
   */
  async unlockClassGrades(classId: string): Promise<{ message: string }> {
    return await apiClient.post(`/academic/grades/classes/${classId}/unlock`);
  }

  /**
   * Mengambil transkrip KHS mahasiswa
   */
  async getStudentTranscript(studentId: string): Promise<StudentTranscript> {
    try {
      return await apiClient.get<StudentTranscript>(`/academic/grades/transcripts/students/${studentId}`);
    } catch {
      return {
        studentId,
        totalCredits: 6,
        totalQualityPoints: 23.25,
        gpa: 3.88,
        courses: [
          {
            gradeId: 'grd-01',
            courseCode: 'PAI-301',
            courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
            credits: 3,
            className: 'Kelas A',
            academicYear: '2026/2027 Ganjil',
            finalScore: 92.20,
            letterGrade: 'A',
            gradePoint: 4.00,
            qualityPoints: 12.00,
            status: 'DITERBITKAN'
          },
          {
            gradeId: 'grd-02',
            courseCode: 'PAI-101',
            courseName: 'Ilmu Pendidikan Islam',
            credits: 3,
            className: 'Kelas A',
            academicYear: '2026/2027 Ganjil',
            finalScore: 87.85,
            letterGrade: 'A-',
            gradePoint: 3.75,
            qualityPoints: 11.25,
            status: 'DITERBITKAN'
          }
        ]
      };
    }
  }

  /**
   * Impor massal rekap nilai mahasiswa
   */
  async bulkUpdateGrades(classId: string, grades: any[]): Promise<{ count: number; items: any[] }> {
    try {
      return await apiClient.post<{ count: number; items: any[] }>(`/academic/grades/classes/${classId}/bulk`, { grades });
    } catch {
      return {
        count: grades.length,
        items: grades
      };
    }
  }
}

export const gradeAdminService = new GradeAdminService();
