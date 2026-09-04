/**
 * TIPE DATA MODUL MASTER DOSEN — SALAM LMS
 */

export type AcademicRank = 'Tenaga Pengajar' | 'Asisten Ahli' | 'Lektor' | 'Lektor Kepala' | 'Guru Besar';
export type HighestEducation = 'S2' | 'S3' | 'Profesi';
export type EmploymentStatus = 'TETAP' | 'LB' | 'KONTRAK';

export interface LecturerProfileItem {
  profileId: string;
  userId: string;
  nidn: string;
  nuptk: string | null;
  titlePrefix: string | null;
  titleSuffix: string | null;
  name: string;
  username: string;
  email: string;
  role: string;
  isUserActive: boolean;
  academicRank: AcademicRank;
  highestEducation: HighestEducation;
  employmentStatus: EmploymentStatus;
  homebaseProdiId: string | null;
  homebaseProdiName: string;
  homebaseProdiCode: string;
  isAcademicAdvisor: boolean;
  maxAdvisoryQuota: number;
  specialization: string;
  phoneNumber: string;
  address: string;
  createdAt: string;
  teachingClassesCount: number | string;
  teachingCredits: number | string;
  adviseesCount: number | string;
}

export interface LecturerDetail extends LecturerProfileItem {
  teachingClasses: Array<{
    classId: string;
    className: string;
    academicYear: string;
    courseCode: string;
    courseName: string;
    credits: number;
    dayOfWeek: string | null;
    startTime: string | null;
    endTime: string | null;
    roomName: string | null;
    enrolledStudentsCount: number | string;
  }>;
  advisees: Array<{
    profileId: string;
    nim: string;
    name: string;
    email: string;
    studyProgramCode: string;
    entryYear: number;
    currentSemester: number;
    academicStatus: string;
    gpa: number;
    totalCreditsEarned: number;
  }>;
}

export interface LecturerSummaryStats {
  totalLecturers: number;
  totalPermanent: number;
  totalAdvisors: number;
  totalDoctorates: number;
  rankBreakdown: Array<{
    rank: string;
    count: number | string;
  }>;
  prodiBreakdown: Array<{
    prodiName: string;
    prodiCode: string;
    count: number | string;
  }>;
}

export interface CreateLecturerInput {
  nidn: string;
  nuptk?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role?: string;
  academicRank: AcademicRank;
  highestEducation: HighestEducation;
  employmentStatus: EmploymentStatus;
  homebaseProdiId?: string;
  isAcademicAdvisor?: boolean;
  maxAdvisoryQuota?: number;
  specialization?: string;
  phoneNumber?: string;
  address?: string;
}

export interface UpdateLecturerInput {
  name?: string;
  email?: string;
  role?: string;
  titlePrefix?: string;
  titleSuffix?: string;
  academicRank?: AcademicRank;
  highestEducation?: HighestEducation;
  employmentStatus?: EmploymentStatus;
  homebaseProdiId?: string;
  isAcademicAdvisor?: boolean;
  maxAdvisoryQuota?: number;
  specialization?: string;
  phoneNumber?: string;
  address?: string;
  isUserActive?: boolean;
}
