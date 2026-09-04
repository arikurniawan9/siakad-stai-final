import { 
  Course, 
  CourseClassItem, 
  CourseDetail, 
  CourseSummaryStats, 
  CreateCourseInput, 
  CreateClassInput 
} from '../types/courseAdmin';
import { apiClient } from '../api/client';

export class CourseAdminService {
  /**
   * Mengambil ringkasan statistik mata kuliah & kelas
   */
  async getSummaryStats(): Promise<CourseSummaryStats> {
    try {
      return await apiClient.get<CourseSummaryStats>('/academic/courses/summary');
    } catch {
      return {
        totalActiveCourses: 18,
        totalAllCourses: 18,
        totalCredits: 50,
        totalActiveClasses: 6,
        totalStudentsEnrolled: 35,
        courseTypeBreakdown: [
          { courseType: 'WAJIB_PRODI', count: 15 },
          { courseType: 'WAJIB_INSTITUSI', count: 3 }
        ],
        prodiBreakdown: [
          { prodiName: 'Pendidikan Agama Islam', count: 5 },
          { prodiName: 'Manajemen Pendidikan Islam', count: 3 },
          { prodiName: 'Hukum Ekonomi Syariah (Muamalah)', count: 3 },
          { prodiName: 'Pendidikan Guru Madrasah Ibtidaiyah', count: 2 },
          { prodiName: 'Ekonomi Syariah', count: 2 },
          { prodiName: 'Mata Kuliah Umum (MKDU)', count: 3 }
        ]
      };
    }
  }

  /**
   * Mengambil daftar mata kuliah master dengan filter
   */
  async getCourses(filters?: { 
    prodiId?: string; 
    semester?: string; 
    courseType?: string; 
    status?: string; 
    search?: string 
  }): Promise<Course[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.prodiId) params.append('prodiId', filters.prodiId);
      if (filters?.semester) params.append('semester', filters.semester);
      if (filters?.courseType) params.append('courseType', filters.courseType);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      return await apiClient.get<Course[]>(`/academic/courses${qs ? `?${qs}` : ''}`);
    } catch {
      return [
        {
          id: 'crs-pai101',
          code: 'PAI-101',
          name: 'Ilmu Pendidikan Islam',
          credits: 3,
          theoryCredits: 2,
          practicalCredits: 1,
          studyProgramId: 'prodi-pai',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          semesterRecommended: 1,
          courseType: 'WAJIB_PRODI',
          description: 'Landasan filosofis, ontologis, dan epistemologis pendidikan Islam dalam kurikulum madrasah.',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          activeClassesCount: 1,
          enrolledStudentsCount: 35
        },
        {
          id: 'crs-pai301',
          code: 'PAI-301',
          name: 'Ushul Fiqih & Qawaid Fiqhiyyah',
          credits: 3,
          theoryCredits: 2,
          practicalCredits: 1,
          studyProgramId: 'prodi-pai',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          semesterRecommended: 5,
          courseType: 'WAJIB_PRODI',
          description: 'Kaidah-kaidah hukum Islam dan istinbath hukum dalam merespons persoalan kontemporer.',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          activeClassesCount: 2,
          enrolledStudentsCount: 35
        },
        {
          id: 'crs-mku101',
          code: 'MKU-101',
          name: 'Pancasila & Kewarganegaraan',
          credits: 2,
          theoryCredits: 2,
          practicalCredits: 0,
          studyProgramId: null,
          studyProgramName: 'Mata Kuliah Umum Institusi',
          studyProgramCode: 'MKDU',
          semesterRecommended: 1,
          courseType: 'WAJIB_INSTITUSI',
          description: 'Pendidikan nilai kebangsaan, moderasi beragama, dan integritas konstitusi Republik Indonesia.',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          activeClassesCount: 1,
          enrolledStudentsCount: 35
        }
      ];
    }
  }

  /**
   * Mengambil detail mata kuliah beserta daftar kelas
   */
  async getCourseById(id: string): Promise<CourseDetail> {
    return await apiClient.get<CourseDetail>(`/academic/courses/${id}`);
  }

  /**
   * Menambah mata kuliah master baru
   */
  async createCourse(payload: CreateCourseInput): Promise<Course> {
    return await apiClient.post<Course>('/academic/courses', payload);
  }

  /**
   * Memperbarui mata kuliah
   */
  async updateCourse(id: string, payload: Partial<CreateCourseInput & { isActive?: boolean }>): Promise<Course> {
    return await apiClient.put<Course>(`/academic/courses/${id}`, payload);
  }

  /**
   * Mengubah status aktif/nonaktif mata kuliah
   */
  async toggleCourseStatus(id: string): Promise<{ id: string; isActive: boolean }> {
    return await apiClient.patch<{ id: string; isActive: boolean }>(`/academic/courses/${id}/toggle-status`, {});
  }

  /**
   * Mengambil seluruh kelas perkuliahan
   */
  async getAllClasses(filters?: { semesterId?: string; prodiId?: string; search?: string }): Promise<CourseClassItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.semesterId) params.append('semesterId', filters.semesterId);
      if (filters?.prodiId) params.append('prodiId', filters.prodiId);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      return await apiClient.get<CourseClassItem[]>(`/academic/classes/all${qs ? `?${qs}` : ''}`);
    } catch {
      return [
        {
          id: 'cls-pai301-a',
          courseId: 'crs-pai301',
          courseCode: 'PAI-301',
          courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
          credits: 3,
          courseType: 'WAJIB_PRODI',
          studyProgramId: 'prodi-pai',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          semesterId: 'sem-2026-ganjil',
          semesterName: 'Semester Ganjil 2026/2027',
          isCurrentSemester: true,
          className: 'Kelas A',
          academicYear: '2026/2027 Ganjil',
          capacity: 40,
          room: 'Ruang Al-Ghazali (Gedung A-201)',
          dayOfWeek: 'Senin',
          startTime: '08:00:00',
          endTime: '10:30:00',
          deliveryMode: 'HYBRID',
          isActive: true,
          status: 'AKTIF',
          lecturerId: 'usr-dsn-01',
          lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
          lecturerNidn: '2105088201',
          enrolledCount: 35
        }
      ];
    }
  }

  /**
   * Membuka kelas perkuliahan baru
   */
  async createClass(payload: CreateClassInput): Promise<{ id: string; className: string }> {
    return await apiClient.post<{ id: string; className: string }>('/academic/classes', payload);
  }

  /**
   * Memperbarui kelas perkuliahan
   */
  async updateClass(id: string, payload: Partial<CreateClassInput & { status?: string; isActive?: boolean }>): Promise<{ id: string }> {
    return await apiClient.put<{ id: string }>(`/academic/classes/${id}`, payload);
  }

  /**
   * Mengubah status aktif/nonaktif kelas
   */
  async toggleClassStatus(id: string): Promise<{ id: string; isActive: boolean }> {
    return await apiClient.patch<{ id: string; isActive: boolean }>(`/academic/classes/${id}/toggle-status`, {});
  }

  /**
   * Menghapus mata kuliah master secara permanen beserta seluruh kelas terkait
   */
  async deleteCourse(id: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/academic/courses/${id}`);
  }

  /**
   * Menghapus rombel kelas perkuliahan secara permanen
   */
  async deleteClass(id: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/academic/classes/${id}`);
  }

  /**
   * Impor massal data mata kuliah
   */
  async bulkCreateCourses(courses: CreateCourseInput[]): Promise<{ count: number; items: any[] }> {
    return await apiClient.post<{ count: number; items: any[] }>('/academic/courses/bulk', { courses });
  }
}

export const courseAdminService = new CourseAdminService();
