/**
 * TIPE DATA MODUL MASTER MAHASISWA — SALAM LMS
 */

export type AcademicStatus = 'AKTIF' | 'CUTI' | 'LULUS' | 'DROP_OUT' | 'NONAKTIF';

export interface StudentProfileItem {
  profileId: string;
  userId: string;
  nim: string;
  name: string;
  username: string;
  email: string;
  isUserActive: boolean;
  studyProgramId: string | null;
  studyProgramName: string;
  studyProgramCode: string;
  academicAdvisorId: string | null;
  advisorName: string;
  advisorNidn: string;
  entryYear: number;
  entrySemester: string;
  currentSemester: number;
  academicStatus: AcademicStatus;
  gpa: number;
  totalCreditsEarned: number;
  gender: string;
  birthPlace: string;
  birthDate: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  createdAt: string;
  enrolledClassesCount?: number | string;
}

export interface StudentDetail extends StudentProfileItem {
  enrolledClasses: Array<{
    enrollmentId: string;
    className: string;
    academicYear: string;
    courseCode: string;
    courseName: string;
    credits: number;
    status: string;
    enrolledAt: string;
  }>;
}

export interface StudentSummaryStats {
  totalStudents: number;
  totalActiveStudents: number;
  totalOnLeave: number;
  totalGraduated: number;
  averageGPA: number;
  prodiBreakdown: Array<{
    prodiName: string;
    prodiCode: string;
    count: number | string;
  }>;
  entryYearBreakdown: Array<{
    entryYear: number | string;
    count: number | string;
  }>;
}

export interface CreateStudentInput {
  nim: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  studyProgramId?: string;
  academicAdvisorId?: string;
  entryYear: number;
  entrySemester: string;
  currentSemester: number;
  gender: string;
  birthPlace?: string;
  birthDate?: string;
  phoneNumber?: string;
  address?: string;
  guardianName?: string;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
  studyProgramId?: string;
  academicAdvisorId?: string;
  entryYear?: number;
  currentSemester?: number;
  academicStatus?: AcademicStatus;
  gpa?: number;
  totalCreditsEarned?: number;
  gender?: string;
  birthPlace?: string;
  birthDate?: string;
  phoneNumber?: string;
  address?: string;
  guardianName?: string;
  isUserActive?: boolean;
}
