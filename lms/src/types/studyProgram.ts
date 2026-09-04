/**
 * TIPE DATA MODUL PROGRAM STUDI & KURIKULUM — SALAM LMS
 */

export interface StudyProgram {
  id: string;
  code: string;
  name: string;
  degree: 'S1' | 'S2' | 'D3';
  headOfProgram: string | null;
  headNidn: string | null;
  accreditation: string;
  skNumber: string | null;
  skDate: string | null;
  degreeTitle: string;
  totalCreditsRequired: number;
  isActive: boolean;
  description: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string;
  totalCourses?: number | string;
  totalStudents?: number | string;
  totalLecturers?: number | string;
  activeCurriculumName?: string | null;
}

export interface Curriculum {
  id: string;
  studyProgramId: string;
  studyProgramName?: string;
  studyProgramCode?: string;
  code: string;
  name: string;
  year: number;
  totalCredits: number;
  mandatoryCredits: number;
  electiveCredits: number;
  isActive: boolean;
  status: 'DRAF' | 'AKTIF' | 'DIARSIPKAN';
  description: string | null;
  createdAt: string;
  cplCount?: number | string;
}

export type CPLCategory = 'SIKAP' | 'PENGETAHUAN' | 'KETERAMPILAN_UMUM' | 'KETERAMPILAN_KHUSUS';

export interface CPLItem {
  id: string;
  studyProgramId: string;
  studyProgramName?: string;
  curriculumId: string | null;
  curriculumName?: string | null;
  code: string;
  category: CPLCategory;
  description: string;
  createdAt: string;
}

export interface ProdiCourseItem {
  id: string;
  code: string;
  name: string;
  credits: number;
  semester: number;
  createdAt?: string;
}

export interface StudyProgramDetail extends StudyProgram {
  curriculums: Curriculum[];
  learningOutcomes: CPLItem[];
  courses: ProdiCourseItem[];
}

export interface StudyProgramsSummaryStats {
  totalActivePrograms: number;
  totalAllPrograms: number;
  totalStudents: number;
  totalLecturers: number;
  totalCurriculums: number;
  totalCourses: number;
  accreditationBreakdown: Array<{
    accreditation: string;
    count: number | string;
  }>;
}

export interface CreateStudyProgramInput {
  code: string;
  name: string;
  degree: string;
  headOfProgram?: string;
  headNidn?: string;
  accreditation?: string;
  skNumber?: string;
  skDate?: string;
  degreeTitle?: string;
  totalCreditsRequired?: number;
  description?: string;
  email?: string;
}

export interface CreateCurriculumInput {
  studyProgramId: string;
  code: string;
  name: string;
  year: number;
  totalCredits: number;
  mandatoryCredits: number;
  electiveCredits: number;
  description?: string;
}

export interface CreateCPLInput {
  studyProgramId: string;
  curriculumId?: string;
  code: string;
  category: CPLCategory;
  description: string;
}
