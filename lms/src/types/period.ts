export type PeriodStatus = 'DRAF' | 'AKTIF' | 'SELESAI' | 'DIARSIPKAN';
export type SemesterType = 'GANJIL' | 'GENAP' | 'PENDEK';

export interface AcademicYear {
  id: string;
  name: string; // e.g. "Tahun Akademik 2026/2027"
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  status: PeriodStatus;
  description?: string;
  createdAt?: string;
  semestersCount?: number;
}

export interface Semester {
  id: string;
  academicYearId: string;
  academicYearName: string;
  semesterType: SemesterType;
  name: string; // e.g. "Semester Ganjil 2026/2027"
  startDate: string;
  endDate: string;
  krsStartDate?: string;
  krsEndDate?: string;
  utsStartDate?: string;
  utsEndDate?: string;
  uasStartDate?: string;
  uasEndDate?: string;
  gradeDeadline?: string;
  isActive: boolean;
  isCurrent: boolean;
  status: PeriodStatus;
  totalClassesCount?: number;
  totalStudentsCount?: number;
}

export interface PeriodSummaryStats {
  activeSemester: Semester | null;
  stats: {
    totalAcademicYears: number;
    totalSemesters: number;
    activeSemesterClassesCount: number;
    activeSemesterStudentsCount: number;
    activeSemesterLecturersCount: number;
  };
}

export interface CreateAcademicYearPayload {
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface CreateSemesterPayload {
  academicYearId: string;
  semesterType: SemesterType;
  name?: string;
  startDate: string;
  endDate: string;
  krsStartDate?: string;
  krsEndDate?: string;
  utsStartDate?: string;
  utsEndDate?: string;
  uasStartDate?: string;
  uasEndDate?: string;
  gradeDeadline?: string;
}

export interface UpdateSemesterPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  krsStartDate?: string;
  krsEndDate?: string;
  utsStartDate?: string;
  utsEndDate?: string;
  uasStartDate?: string;
  uasEndDate?: string;
  gradeDeadline?: string;
  status?: PeriodStatus;
}
