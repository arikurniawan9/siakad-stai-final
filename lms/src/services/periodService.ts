import { 
  AcademicYear, 
  Semester, 
  PeriodSummaryStats, 
  CreateAcademicYearPayload, 
  CreateSemesterPayload, 
  UpdateSemesterPayload 
} from '../types/period';
import { apiClient } from '../api/client';

const STORAGE_KEY_YEARS = 'salam_academic_years_v1';
const STORAGE_KEY_SEMESTERS = 'salam_semesters_v1';

const INITIAL_YEARS: AcademicYear[] = [
  {
    id: 'ay-2026-2027',
    name: 'Tahun Akademik 2026/2027',
    startDate: '2026-09-01',
    endDate: '2027-08-31',
    isActive: true,
    status: 'AKTIF',
    description: 'Tahun Akademik Reguler STAI AL-ITTIHAD 2026/2027',
    semestersCount: 2
  },
  {
    id: 'ay-2025-2026',
    name: 'Tahun Akademik 2025/2026',
    startDate: '2025-09-01',
    endDate: '2026-08-31',
    isActive: false,
    status: 'SELESAI',
    description: 'Tahun Akademik Reguler STAI AL-ITTIHAD 2025/2026',
    semestersCount: 2
  }
];

const INITIAL_SEMESTERS: Semester[] = [
  {
    id: 'sem-2026-ganjil',
    academicYearId: 'ay-2026-2027',
    academicYearName: 'Tahun Akademik 2026/2027',
    semesterType: 'GANJIL',
    name: 'Semester Ganjil 2026/2027',
    startDate: '2026-09-01',
    endDate: '2027-01-31',
    krsStartDate: '2026-08-15',
    krsEndDate: '2026-08-31',
    utsStartDate: '2026-10-26',
    utsEndDate: '2026-11-06',
    uasStartDate: '2027-01-04',
    uasEndDate: '2027-01-15',
    gradeDeadline: '2027-01-29',
    isActive: true,
    isCurrent: true,
    status: 'AKTIF',
    totalClassesCount: 2,
    totalStudentsCount: 35
  },
  {
    id: 'sem-2026-genap',
    academicYearId: 'ay-2026-2027',
    academicYearName: 'Tahun Akademik 2026/2027',
    semesterType: 'GENAP',
    name: 'Semester Genap 2026/2027',
    startDate: '2027-02-15',
    endDate: '2027-07-31',
    krsStartDate: '2027-02-01',
    krsEndDate: '2027-02-14',
    utsStartDate: '2027-04-12',
    utsEndDate: '2027-04-23',
    uasStartDate: '2027-06-21',
    uasEndDate: '2027-07-02',
    gradeDeadline: '2027-07-16',
    isActive: false,
    isCurrent: false,
    status: 'DRAF',
    totalClassesCount: 0,
    totalStudentsCount: 0
  },
  {
    id: 'sem-2025-genap',
    academicYearId: 'ay-2025-2026',
    academicYearName: 'Tahun Akademik 2025/2026',
    semesterType: 'GENAP',
    name: 'Semester Genap 2025/2026',
    startDate: '2026-02-16',
    endDate: '2026-07-31',
    krsStartDate: '2026-02-01',
    krsEndDate: '2026-02-14',
    utsStartDate: '2026-04-13',
    utsEndDate: '2026-04-24',
    uasStartDate: '2026-06-22',
    uasEndDate: '2026-07-03',
    gradeDeadline: '2026-07-17',
    isActive: false,
    isCurrent: false,
    status: 'SELESAI',
    totalClassesCount: 18,
    totalStudentsCount: 480
  }
];

export class PeriodService {
  private getLocalYears(): AcademicYear[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_YEARS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY_YEARS, JSON.stringify(INITIAL_YEARS));
    return INITIAL_YEARS;
  }

  private saveLocalYears(years: AcademicYear[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_YEARS, JSON.stringify(years));
    } catch {
      // ignore
    }
  }

  private getLocalSemesters(): Semester[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SEMESTERS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY_SEMESTERS, JSON.stringify(INITIAL_SEMESTERS));
    return INITIAL_SEMESTERS;
  }

  private saveLocalSemesters(semesters: Semester[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_SEMESTERS, JSON.stringify(semesters));
    } catch {
      // ignore
    }
  }

  /**
   * Ambil ringkasan statistik periode aktif
   */
  async getSummaryStats(): Promise<PeriodSummaryStats> {
    try {
      const res = await apiClient.get<PeriodSummaryStats>('/academic/periods/summary');
      if (res && res.stats) return res;
    } catch {
      // fallback to local calculation
    }

    const sems = this.getLocalSemesters();
    const years = this.getLocalYears();
    const active = sems.find((s) => s.isActive || s.isCurrent) || sems[0] || null;

    return {
      activeSemester: active,
      stats: {
        totalAcademicYears: years.length,
        totalSemesters: sems.length,
        activeSemesterClassesCount: active?.totalClassesCount || 2,
        activeSemesterStudentsCount: active?.totalStudentsCount || 35,
        activeSemesterLecturersCount: 2
      }
    };
  }

  /**
   * Ambil daftar seluruh tahun akademik
   */
  async getAcademicYears(): Promise<AcademicYear[]> {
    let years = this.getLocalYears();

    try {
      const apiYears = await apiClient.get<AcademicYear[]>('/academic/periods/years');
      if (Array.isArray(apiYears) && apiYears.length > 0) {
        years = apiYears;
        this.saveLocalYears(years);
      }
    } catch {
      // fallback
    }

    const sems = this.getLocalSemesters();
    return years.map((y) => ({
      ...y,
      semestersCount: sems.filter((s) => s.academicYearId === y.id).length
    }));
  }

  /**
   * Tambah tahun akademik baru
   */
  async createAcademicYear(payload: CreateAcademicYearPayload): Promise<AcademicYear> {
    const years = this.getLocalYears();
    const cleanId = `ay-${payload.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newYear: AcademicYear = {
      id: cleanId,
      name: payload.name.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      isActive: false,
      status: 'DRAF',
      description: payload.description?.trim() || 'Tahun akademik kurikulum reguler',
      semestersCount: 0,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await apiClient.post<AcademicYear>('/academic/periods/years', payload);
      if (res && res.id) {
        newYear.id = res.id;
      }
    } catch {
      // fallback
    }

    const updated = [newYear, ...years];
    this.saveLocalYears(updated);
    return newYear;
  }

  /**
   * Hapus tahun akademik
   */
  async deleteAcademicYear(id: string): Promise<void> {
    try {
      await apiClient.delete(`/academic/periods/years/${id}`);
    } catch {
      // ignore
    }

    const years = this.getLocalYears().filter((y) => y.id !== id);
    this.saveLocalYears(years);

    const sems = this.getLocalSemesters().filter((s) => s.academicYearId !== id);
    this.saveLocalSemesters(sems);
  }

  /**
   * Ambil daftar seluruh semester perkuliahan
   */
  async getSemesters(academicYearId?: string, status?: string): Promise<Semester[]> {
    let list = this.getLocalSemesters();

    try {
      const params = new URLSearchParams();
      if (academicYearId) params.append('academicYearId', academicYearId);
      if (status) params.append('status', status);

      const apiList = await apiClient.get<Semester[]>(`/academic/periods/semesters?${params.toString()}`);
      if (Array.isArray(apiList) && apiList.length > 0) {
        list = apiList;
        this.saveLocalSemesters(list);
      }
    } catch {
      // fallback
    }

    return list.filter((s) => {
      const matchYear = !academicYearId || academicYearId === 'ALL' || s.academicYearId === academicYearId;
      const matchStatus = !status || status === 'ALL' || s.status === status;
      return matchYear && matchStatus;
    });
  }

  /**
   * Tambah semester baru
   */
  async createSemester(payload: CreateSemesterPayload): Promise<Semester> {
    const sems = this.getLocalSemesters();
    const years = this.getLocalYears();
    const y = years.find((item) => item.id === payload.academicYearId);
    const yearName = y ? y.name : 'Tahun Akademik';
    const semName = payload.name || `Semester ${payload.semesterType === 'GANJIL' ? 'Ganjil' : payload.semesterType === 'GENAP' ? 'Genap' : 'Pendek'} ${yearName}`;
    const semId = `sem-${payload.academicYearId.replace('ay-', '')}-${payload.semesterType.toLowerCase()}-${Date.now().toString().slice(-4)}`;

    const newSem: Semester = {
      id: semId,
      academicYearId: payload.academicYearId,
      academicYearName: yearName,
      semesterType: payload.semesterType,
      name: semName,
      startDate: payload.startDate,
      endDate: payload.endDate,
      krsStartDate: payload.krsStartDate,
      krsEndDate: payload.krsEndDate,
      utsStartDate: payload.utsStartDate,
      utsEndDate: payload.utsEndDate,
      uasStartDate: payload.uasStartDate,
      uasEndDate: payload.uasEndDate,
      gradeDeadline: payload.gradeDeadline,
      isActive: false,
      isCurrent: false,
      status: 'DRAF',
      totalClassesCount: 0,
      totalStudentsCount: 0
    };

    try {
      const res = await apiClient.post<Semester>('/academic/periods/semesters', payload);
      if (res && res.id) {
        newSem.id = res.id;
      }
    } catch {
      // fallback
    }

    const updated = [newSem, ...sems];
    this.saveLocalSemesters(updated);
    return newSem;
  }

  /**
   * Perbarui linimasa semester
   */
  async updateSemester(semesterId: string, payload: UpdateSemesterPayload): Promise<Semester> {
    const sems = this.getLocalSemesters();
    const index = sems.findIndex((s) => s.id === semesterId);
    if (index >= 0) {
      sems[index] = {
        ...sems[index],
        name: payload.name || sems[index].name,
        startDate: payload.startDate || sems[index].startDate,
        endDate: payload.endDate || sems[index].endDate,
        krsStartDate: payload.krsStartDate !== undefined ? payload.krsStartDate : sems[index].krsStartDate,
        krsEndDate: payload.krsEndDate !== undefined ? payload.krsEndDate : sems[index].krsEndDate,
        utsStartDate: payload.utsStartDate !== undefined ? payload.utsStartDate : sems[index].utsStartDate,
        utsEndDate: payload.utsEndDate !== undefined ? payload.utsEndDate : sems[index].utsEndDate,
        uasStartDate: payload.uasStartDate !== undefined ? payload.uasStartDate : sems[index].uasStartDate,
        uasEndDate: payload.uasEndDate !== undefined ? payload.uasEndDate : sems[index].uasEndDate,
        gradeDeadline: payload.gradeDeadline !== undefined ? payload.gradeDeadline : sems[index].gradeDeadline,
        status: payload.status || sems[index].status
      };
      this.saveLocalSemesters(sems);
    }

    try {
      return await apiClient.put<Semester>(`/academic/periods/semesters/${semesterId}`, payload);
    } catch {
      return sems[index];
    }
  }

  /**
   * Hapus semester
   */
  async deleteSemester(semesterId: string): Promise<void> {
    try {
      await apiClient.delete(`/academic/periods/semesters/${semesterId}`);
    } catch {
      // ignore
    }

    const sems = this.getLocalSemesters().filter((s) => s.id !== semesterId);
    this.saveLocalSemesters(sems);
  }

  /**
   * Aktifkan semester (Atomic Switch)
   */
  async activateSemester(semesterId: string): Promise<Semester> {
    const sems = this.getLocalSemesters();
    const years = this.getLocalYears();

    const targetSem = sems.find((s) => s.id === semesterId);
    if (!targetSem) throw new Error('Semester tidak ditemukan');

    sems.forEach((s) => {
      s.isActive = s.id === semesterId;
      s.isCurrent = s.id === semesterId;
      if (s.id === semesterId) s.status = 'AKTIF';
    });
    this.saveLocalSemesters(sems);

    years.forEach((y) => {
      y.isActive = y.id === targetSem.academicYearId;
      if (y.id === targetSem.academicYearId) y.status = 'AKTIF';
      else if (y.status === 'AKTIF') y.status = 'SELESAI';
    });
    this.saveLocalYears(years);

    try {
      return await apiClient.post<Semester>(`/academic/periods/semesters/${semesterId}/activate`, {});
    } catch {
      return targetSem;
    }
  }

  /**
   * Arsipkan semester
   */
  async archiveSemester(semesterId: string): Promise<Semester> {
    const sems = this.getLocalSemesters();
    const s = sems.find((item) => item.id === semesterId);
    if (s) {
      s.status = 'DIARSIPKAN';
      s.isActive = false;
      s.isCurrent = false;
      this.saveLocalSemesters(sems);
    }

    try {
      return await apiClient.post<Semester>(`/academic/periods/semesters/${semesterId}/archive`, {});
    } catch {
      if (!s) throw new Error('Semester tidak ditemukan');
      return s;
    }
  }
}

export const periodService = new PeriodService();
