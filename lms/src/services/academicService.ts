import { 
  AcademicPeriod, 
  StudyProgram, 
  Course, 
  AcademicClass, 
  ClassMember 
} from '../types/academic';

const PERIODS_KEY = 'salam_academic_periods';
const PROGRAMS_KEY = 'salam_study_programs';
const COURSES_KEY = 'salam_courses';
const CLASSES_KEY = 'salam_classes';
const MEMBERS_KEY = 'salam_class_members';

export const INITIAL_PERIODS: AcademicPeriod[] = [
  {
    id: 'prd-20261',
    externalId: 'EXT-PRD-20261',
    code: '20261',
    name: 'Semester Ganjil 2026/2027',
    year: '2026/2027',
    semesterType: 'GANJIL',
    startDate: '2026-09-01',
    endDate: '2027-01-31',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_PROGRAMS: StudyProgram[] = [
  {
    id: 'prodi-pai',
    externalId: 'EXT-PRODI-PAI',
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-mpi',
    externalId: 'EXT-PRODI-MPI',
    code: 'MPI',
    name: 'Manajemen Pendidikan Islam',
    degree: 'S1',
    faculty: 'Fakultas Tarbiyah',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'prodi-es',
    externalId: 'EXT-PRODI-ES',
    code: 'ES',
    name: 'Ekonomi Syariah',
    degree: 'S1',
    faculty: 'Fakultas Syariah & Ekonomi',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'crs-pai301',
    externalId: 'EXT-CRS-PAI301',
    code: 'PAI-301',
    name: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    credits: 3,
    semesterLevel: 3,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: 'Kajian komprehensif kaidah metodologi hukum Islam dan ushuliyah.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-pai302',
    externalId: 'EXT-CRS-PAI302',
    code: 'PAI-302',
    name: 'Hadits Tarbawi',
    credits: 2,
    semesterLevel: 3,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: 'Kajian hadits-hadits tematik mengenai pendidikan dan akhlak.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  },
  {
    id: 'crs-pai303',
    externalId: 'EXT-CRS-PAI303',
    code: 'PAI-303',
    name: 'Pengembangan Kurikulum PAI',
    credits: 3,
    semesterLevel: 3,
    studyProgramId: 'prodi-pai',
    studyProgramCode: 'PAI',
    description: 'Desain, perancangan, dan implementasi kurikulum pendidikan Islam.',
    isActive: true,
    sourceSystem: 'SIAKAD_STAI'
  }
];

export const INITIAL_CLASSES: AcademicClass[] = [
  {
    id: 'cls-pai301-a',
    externalId: 'EXT-CLS-PAI301-A-20261',
    code: 'PAI-301-A',
    name: 'Ushul Fiqih (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai301',
    courseCode: 'PAI-301',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    credits: 3,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 38,
    schedules: [
      {
        id: 'sch-01',
        dayOfWeek: 'SENIN',
        startTime: '08:00',
        endTime: '10:30',
        room: 'Ruang Kuliah Tarbiyah 201',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-pai301-b',
    externalId: 'EXT-CLS-PAI301-B-20261',
    code: 'PAI-301-B',
    name: 'Ushul Fiqih (Kelas B)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai301',
    courseCode: 'PAI-301',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    credits: 3,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 36,
    schedules: [
      {
        id: 'sch-02',
        dayOfWeek: 'SELASA',
        startTime: '10:45',
        endTime: '13:15',
        room: 'Ruang Kuliah Tarbiyah 202',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-pai302-a',
    externalId: 'EXT-CLS-PAI302-A-20261',
    code: 'PAI-302-A',
    name: 'Hadits Tarbawi (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai302',
    courseCode: 'PAI-302',
    courseName: 'Hadits Tarbawi',
    credits: 2,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 34,
    schedules: [
      {
        id: 'sch-03',
        dayOfWeek: 'RABU',
        startTime: '08:00',
        endTime: '09:40',
        room: 'Ruang Kuliah Tarbiyah 203',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cls-pai303-a',
    externalId: 'EXT-CLS-PAI303-A-20261',
    code: 'PAI-303-A',
    name: 'Pengembangan Kurikulum PAI (Kelas A)',
    academicPeriodId: 'prd-20261',
    academicPeriodName: 'Semester Ganjil 2026/2027',
    courseId: 'crs-pai303',
    courseCode: 'PAI-303',
    courseName: 'Pengembangan Kurikulum PAI',
    credits: 3,
    studyProgramCode: 'PAI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    studentCount: 35,
    schedules: [
      {
        id: 'sch-04',
        dayOfWeek: 'KAMIS',
        startTime: '13:30',
        endTime: '16:00',
        room: 'Ruang Kuliah Tarbiyah 201',
        isOnline: false
      }
    ],
    status: 'AKTIF',
    sourceSystem: 'SIAKAD_STAI',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_MEMBERS: ClassMember[] = [
  {
    id: 'mbr-001',
    externalId: 'EXT-MBR-PAI301A-21010042',
    classId: 'cls-pai301-a',
    studentId: 'usr-mhs-01',
    studentNim: '21.01.0042',
    studentName: 'Ahmad Fauzi Rahman',
    enrollmentDate: '2026-08-20',
    status: 'TERDAFTAR',
    sourceSystem: 'SIAKAD_STAI'
  }
];

class AcademicService {
  public getPeriods(): AcademicPeriod[] {
    return this.getItem(PERIODS_KEY, INITIAL_PERIODS);
  }

  public getStudyPrograms(): StudyProgram[] {
    return this.getItem(PROGRAMS_KEY, INITIAL_PROGRAMS);
  }

  public getCourses(): Course[] {
    return this.getItem(COURSES_KEY, INITIAL_COURSES);
  }

  public getClasses(periodId?: string): AcademicClass[] {
    const classes = this.getItem(CLASSES_KEY, INITIAL_CLASSES);
    if (periodId) {
      return classes.filter((c) => c.academicPeriodId === periodId);
    }
    return classes;
  }

  public async fetchClassesFromBackend(): Promise<AcademicClass[]> {
    try {
      const stored = localStorage.getItem('salam_auth_session');
      let token = null;
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed.session?.token || parsed.token;
      }
      if (!token) return this.getClasses();

      const res = await fetch('/api/v1/academic/classes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) return this.getClasses();

      const json = await res.json();
      const rows = json.data || [];

      if (rows.length > 0) {
        const mapped: AcademicClass[] = rows.map((r: any) => ({
          id: String(r.id),
          externalId: `EXT-CLS-${r.id}`,
          code: r.courseCode || `CLS-${r.id}`,
          name: r.className || r.courseName,
          academicPeriodId: 'prd-20261',
          academicPeriodName: r.academicYear || 'Semester Ganjil 2026/2027',
          courseId: `crs-${r.courseCode || r.id}`,
          courseCode: r.courseCode || '',
          courseName: r.courseName || '',
          credits: Number(r.credits) || 2,
          studyProgramCode: 'PAI',
          lecturerId: 'usr-dsn-01',
          lecturerName: r.lecturerName || 'Dr. H. M. Ridwan, M.Ag',
          lecturerNidn: r.lecturerNidn || '2112087501',
          studentCount: Number(r.enrolledCount) || 1,
          schedules: [
            {
              id: `sch-${r.id}`,
              dayOfWeek: 'SENIN',
              startTime: '08:00',
              endTime: '10:30',
              room: 'Ruang Kuliah Tarbiyah 201',
              isOnline: false
            }
          ],
          status: 'AKTIF',
          sourceSystem: 'SIAKAD_STAI',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        this.saveClasses(mapped);
        return mapped;
      }
    } catch {
      // Abaikan jika offline
    }
    return this.getClasses();
  }

  public getClassMembers(classId: string): ClassMember[] {
    const members = this.getItem(MEMBERS_KEY, INITIAL_MEMBERS);
    return members.filter((m) => m.classId === classId);
  }

  public savePeriods(periods: AcademicPeriod[]): void {
    this.setItem(PERIODS_KEY, periods);
  }

  public savePrograms(programs: StudyProgram[]): void {
    this.setItem(PROGRAMS_KEY, programs);
  }

  public saveCourses(courses: Course[]): void {
    this.setItem(COURSES_KEY, courses);
  }

  public saveClasses(classes: AcademicClass[]): void {
    this.setItem(CLASSES_KEY, classes);
  }

  public saveMembers(members: ClassMember[]): void {
    this.setItem(MEMBERS_KEY, members);
  }

  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) {
        localStorage.setItem(key, JSON.stringify(defaultVal));
        return defaultVal;
      }
      return JSON.parse(data);
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn(`Gagal menyimpan ${key}:`, e);
    }
  }
}

export const academicService = new AcademicService();
