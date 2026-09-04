/**
 * TIPE DATA MODUL MASTER MATA KULIAH & KELAS PERKULIAHAN — SALAM LMS
 */

export type CourseType = 'WAJIB_INSTITUSI' | 'WAJIB_PRODI' | 'PILIHAN' | 'MKDU';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  theoryCredits: number;
  practicalCredits: number;
  studyProgramId: string | null;
  studyProgramName: string;
  studyProgramCode: string;
  semesterRecommended: number;
  courseType: CourseType;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activeClassesCount?: number | string;
  enrolledStudentsCount?: number | string;
}

export interface CourseClassItem {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: CourseType;
  studyProgramId: string | null;
  studyProgramName: string;
  studyProgramCode: string;
  semesterId: string;
  semesterName: string;
  isCurrentSemester?: boolean;
  className: string;
  academicYear: string;
  capacity: number;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  deliveryMode: 'TATAP_MUKA' | 'DARING' | 'HYBRID';
  isActive: boolean;
  status: 'DRAF' | 'AKTIF' | 'SELESAI' | 'DIARSIPKAN';
  lecturerId: string | null;
  lecturerName: string;
  lecturerNidn: string;
  enrolledCount: number | string;
}

export interface CourseDetail extends Course {
  classes: CourseClassItem[];
}

export interface CourseSummaryStats {
  totalActiveCourses: number;
  totalAllCourses: number;
  totalCredits: number;
  totalActiveClasses: number;
  totalStudentsEnrolled: number;
  courseTypeBreakdown: Array<{
    courseType: string;
    count: number | string;
  }>;
  prodiBreakdown: Array<{
    prodiName: string;
    count: number | string;
  }>;
}

export interface CreateCourseInput {
  code: string;
  name: string;
  credits: number;
  theoryCredits: number;
  practicalCredits: number;
  studyProgramId?: string;
  semesterRecommended: number;
  courseType: CourseType;
  description?: string;
}

export interface CreateClassInput {
  courseId: string;
  semesterId: string;
  className: string;
  lecturerId?: string;
  capacity: number;
  room: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  deliveryMode: 'TATAP_MUKA' | 'DARING' | 'HYBRID';
}
