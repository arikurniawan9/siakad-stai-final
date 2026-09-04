export type AcademicStatus = 'AKTIF' | 'NONAKTIF' | 'DIARSIPKAN';

export interface AcademicPeriod {
  id: string;
  externalId: string; // Source ID dari SIAKAD
  code: string; // Misal: 20261
  name: string; // Misal: Semester Ganjil 2026/2027
  year: string; // 2026/2027
  semesterType: 'GANJIL' | 'GENAP' | 'PENDEK';
  startDate: string;
  endDate: string;
  isActive: boolean;
  sourceSystem: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyProgram {
  id: string;
  externalId: string;
  code: string; // Misal: PAI, MPI, PGMI, ES
  name: string; // Misal: Pendidikan Agama Islam
  degree: 'S1' | 'S2' | 'D3';
  faculty: string; // Fakultas Tarbiyah
  isActive: boolean;
  sourceSystem: string;
}

export interface Course {
  id: string;
  externalId: string;
  code: string; // Misal: PAI-301
  name: string; // Misal: Ushul Fiqih
  credits: number; // SKS (2 / 3 / 4)
  semesterLevel: number; // Semester 1-8
  studyProgramId: string;
  studyProgramCode: string;
  description?: string;
  isActive: boolean;
  sourceSystem: string;
}

export interface ClassSchedule {
  id: string;
  dayOfWeek: 'SENIN' | 'SELASA' | 'RABU' | 'KAMIS' | 'JUMAT' | 'SABTU';
  startTime: string; // 08:00
  endTime: string; // 09:40
  room: string; // Ruang Kuliah 201 / Lab Komputer
  isOnline: boolean;
}

export interface AcademicClass {
  id: string;
  externalId: string;
  code: string; // Misal: PAI-301-A
  name: string; // Ushul Fiqih (Kelas A)
  academicPeriodId: string;
  academicPeriodName: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  studyProgramCode: string;
  lecturerId: string;
  lecturerName: string;
  lecturerNidn: string;
  studentCount: number;
  schedules: ClassSchedule[];
  status: AcademicStatus;
  sourceSystem: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClassMember {
  id: string;
  externalId: string;
  classId: string;
  studentId: string;
  studentNim: string;
  studentName: string;
  enrollmentDate: string;
  status: 'TERDAFTAR' | 'NONAKTIF' | 'LULUS';
  sourceSystem: string;
}

export interface SyncRunLog {
  id: string;
  startedAt: string;
  finishedAt: string;
  status: 'BERHASIL' | 'BERHASIL_SEBAGIAN' | 'GAGAL';
  sourceSystem: string;
  academicPeriodCode: string;
  stats: {
    periodsProcessed: number;
    programsProcessed: number;
    coursesProcessed: number;
    classesCreated: number;
    classesUpdated: number;
    classesDeactivated: number;
    studentsEnrolled: number;
    totalSkipped: number;
    totalFailed: number;
  };
  itemLogs: SyncItemLog[];
}

export interface SyncItemLog {
  id: string;
  entityType: 'PERIODE' | 'PRODI' | 'MATA_KULIAH' | 'KELAS' | 'PESERTA_KELAS';
  externalId: string;
  identifier: string; // Nama atau kode item
  action: 'DIBUAT' | 'DIPERBARUI' | 'DIARSIPKAN' | 'DILEWATI' | 'GAGAL';
  message: string;
  status: 'SUKSES' | 'PERINGATAN' | 'ERROR';
}
