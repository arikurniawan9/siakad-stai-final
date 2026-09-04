import { 
  StudyProgram, 
  StudyProgramsSummaryStats, 
  StudyProgramDetail, 
  Curriculum, 
  CPLItem, 
  CreateStudyProgramInput, 
  CreateCurriculumInput, 
  CreateCPLInput 
} from '../types/studyProgram';
import { apiClient } from '../api/client';

const STORAGE_KEY = 'salam_study_programs_v1';

const INITIAL_STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: 'prodi-pai',
    code: 'PAI',
    name: 'Pendidikan Agama Islam',
    degree: 'S1',
    headOfProgram: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
    headNidn: '2105088201',
    accreditation: 'Unggul',
    skNumber: 'SK BAN-PT No. 4921/SK/BAN-PT/Akred/S/VIII/2024',
    skDate: '2024-08-10',
    degreeTitle: 'Sarjana Pendidikan (S.Pd.)',
    totalCreditsRequired: 144,
    isActive: true,
    description: 'Mencetak sarjana pendidikan Islam yang berakhlak mulia, unggul dalam pedagogik digital dan metodologi pengajaran kontemporer.',
    email: 'pai@stai-alittihad.ac.id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-17T00:00:00Z',
    totalCourses: 6,
    totalStudents: 20,
    totalLecturers: 5,
    activeCurriculumName: 'Kurikulum OBE Berbasis Karakter PAI 2024'
  },
  {
    id: 'prodi-mpi',
    code: 'MPI',
    name: 'Manajemen Pendidikan Islam',
    degree: 'S1',
    headOfProgram: 'Dr. Hj. Siti Maryam, M.M.Pd.',
    headNidn: '2112047802',
    accreditation: 'Baik Sekali',
    skNumber: 'SK LAMDIK No. 1024/SK/LAMDIK/Ak/S/VI/2024',
    skDate: '2024-06-15',
    degreeTitle: 'Sarjana Pendidikan (S.Pd.)',
    totalCreditsRequired: 144,
    isActive: true,
    description: 'Mempersiapkan manajer dan administrator lembaga pendidikan Islam yang profesional, akuntabel, dan berdaya saing global.',
    email: 'mpi@stai-alittihad.ac.id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-17T00:00:00Z',
    totalCourses: 4,
    totalStudents: 8,
    totalLecturers: 3,
    activeCurriculumName: 'Kurikulum Merdeka Manajemen Lembaga Islam 2024'
  },
  {
    id: 'prodi-hes',
    code: 'HES',
    name: 'Hukum Ekonomi Syariah (Muamalah)',
    degree: 'S1',
    headOfProgram: 'H. Ridwan Malik, M.H.I.',
    headNidn: '2123098503',
    accreditation: 'Baik Sekali',
    skNumber: 'SK BAN-PT No. 3120/SK/BAN-PT/Akred/S/V/2024',
    skDate: '2024-05-20',
    degreeTitle: 'Sarjana Hukum (S.H.)',
    totalCreditsRequired: 144,
    isActive: true,
    description: 'Menghasilkan ahli hukum ekonomi Islam, konsultan perbankan syariah, dan praktisi kepatuhan syariah yang berintegritas.',
    email: 'hes@stai-alittihad.ac.id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-17T00:00:00Z',
    totalCourses: 3,
    totalStudents: 4,
    totalLecturers: 2,
    activeCurriculumName: 'Kurikulum Standar Industri Keuangan Syariah 2024'
  },
  {
    id: 'prodi-pgmi',
    code: 'PGMI',
    name: 'Pendidikan Guru Madrasah Ibtidaiyah',
    degree: 'S1',
    headOfProgram: 'Ustadzah Nurul Hidayah, M.Pd.',
    headNidn: '2118018904',
    accreditation: 'Baik',
    skNumber: 'SK LAMDIK No. 892/SK/LAMDIK/Ak/S/IX/2023',
    skDate: '2023-09-12',
    degreeTitle: 'Sarjana Pendidikan (S.Pd.)',
    totalCreditsRequired: 144,
    isActive: true,
    description: 'Mendidik calon guru kelas MI/SD Islam yang kompeten, kreatif, teladan, serta menguasai teknologi pembelajaran interaktif.',
    email: 'pgmi@stai-alittihad.ac.id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-17T00:00:00Z',
    totalCourses: 3,
    totalStudents: 2,
    totalLecturers: 1,
    activeCurriculumName: 'Kurikulum Pedagogik MI Interaktif 2024'
  },
  {
    id: 'prodi-esy',
    code: 'ESY',
    name: 'Ekonomi Syariah',
    degree: 'S1',
    headOfProgram: 'H. Fikri Pratama, S.E., M.E.',
    headNidn: '2107069105',
    accreditation: 'Baik',
    skNumber: 'SK BAN-PT No. 2450/SK/BAN-PT/Akred/S/XI/2023',
    skDate: '2023-11-05',
    degreeTitle: 'Sarjana Ekonomi (S.E.)',
    totalCreditsRequired: 144,
    isActive: true,
    description: 'Mencetak technopreneur dan analis keuangan syariah yang menguasai ekosistem industri halal dan tata kelola bisnis Islam.',
    email: 'esy@stai-alittihad.ac.id',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-08-17T00:00:00Z',
    totalCourses: 2,
    totalStudents: 1,
    totalLecturers: 1,
    activeCurriculumName: 'Kurikulum Bisnis & Halal Value Chain 2024'
  }
];

export class StudyProgramService {
  private getLocalPrograms(): StudyProgram[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDY_PROGRAMS));
    return INITIAL_STUDY_PROGRAMS;
  }

  private saveLocalPrograms(programs: StudyProgram[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
    } catch {
      // ignore
    }
  }

  /**
   * Mengambil ringkasan statistik program studi & kurikulum
   */
  async getSummaryStats(): Promise<StudyProgramsSummaryStats> {
    try {
      const res = await apiClient.get<StudyProgramsSummaryStats>('/academic/study-programs/summary');
      if (res && res.totalAllPrograms) return res;
    } catch {
      // fallback to local calculation
    }

    const list = this.getLocalPrograms();
    const active = list.filter((p) => p.isActive);
    const accMap: Record<string, number> = {};
    list.forEach((p) => {
      accMap[p.accreditation] = (accMap[p.accreditation] || 0) + 1;
    });

    const breakdown = Object.entries(accMap).map(([accreditation, count]) => ({
      accreditation,
      count
    }));

    return {
      totalActivePrograms: active.length,
      totalAllPrograms: list.length,
      totalStudents: list.reduce((acc, p) => acc + (Number(p.totalStudents) || 0), 0),
      totalLecturers: list.reduce((acc, p) => acc + (Number(p.totalLecturers) || 0), 0),
      totalCurriculums: list.length,
      totalCourses: list.reduce((acc, p) => acc + (Number(p.totalCourses) || 0), 0),
      accreditationBreakdown: breakdown
    };
  }

  /**
   * Mengambil daftar program studi dengan filter
   */
  async getStudyPrograms(filters?: { degree?: string; status?: string; search?: string }): Promise<StudyProgram[]> {
    let list = this.getLocalPrograms();

    try {
      const params = new URLSearchParams();
      if (filters?.degree) params.append('degree', filters.degree);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      const url = `/academic/study-programs${qs ? `?${qs}` : ''}`;
      const apiList = await apiClient.get<StudyProgram[]>(url);
      if (Array.isArray(apiList) && apiList.length > 0) {
        list = apiList;
        this.saveLocalPrograms(list);
      }
    } catch {
      // fallback to local list
    }

    if (!filters) return list;

    return list.filter((p) => {
      const matchDegree = !filters.degree || filters.degree === 'SEMUA' || p.degree === filters.degree;
      const matchStatus = 
        !filters.status || 
        filters.status === 'SEMUA' || 
        (filters.status === 'AKTIF' && p.isActive) || 
        (filters.status === 'NONAKTIF' && !p.isActive);

      const query = filters.search?.toLowerCase().trim() || '';
      const matchSearch = !query || 
        p.name.toLowerCase().includes(query) || 
        p.code.toLowerCase().includes(query) || 
        (p.headOfProgram && p.headOfProgram.toLowerCase().includes(query));

      return matchDegree && matchStatus && matchSearch;
    });
  }

  /**
   * Mengambil detail lengkap program studi beserta kurikulum & CPL
   */
  async getStudyProgramById(id: string): Promise<StudyProgramDetail> {
    try {
      const res = await apiClient.get<StudyProgramDetail>(`/academic/study-programs/${id}`);
      if (res && res.id) return res;
    } catch {
      // fallback
    }

    const programs = this.getLocalPrograms();
    const p = programs.find((item) => item.id === id) || programs[0];

    return {
      ...p,
      curriculums: [
        {
          id: `cur-${p.code.toLowerCase()}-2024`,
          studyProgramId: p.id,
          code: `KUR-${p.code}-2024`,
          name: `Kurikulum OBE ${p.name} 2024`,
          year: 2024,
          totalCredits: p.totalCreditsRequired || 144,
          mandatoryCredits: 130,
          electiveCredits: 14,
          isActive: true,
          status: 'AKTIF',
          description: `Kurikulum baku program studi ${p.name}.`,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      learningOutcomes: [
        {
          id: 'cpl-01',
          studyProgramId: p.id,
          curriculumId: `cur-${p.code.toLowerCase()}-2024`,
          code: 'CPL-S-01',
          category: 'SIKAP',
          description: 'Bertaqwa kepada Allah SWT dan mampu menunjukkan sikap religius serta menjunjung tinggi nilai kemanusiaan.',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'cpl-02',
          studyProgramId: p.id,
          curriculumId: `cur-${p.code.toLowerCase()}-2024`,
          code: 'CPL-P-01',
          category: 'PENGETAHUAN',
          description: `Menguasai konsep teoretis keilmuan ${p.name} secara mendalam dan berwawasan kontemporer.`,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'cpl-03',
          studyProgramId: p.id,
          curriculumId: `cur-${p.code.toLowerCase()}-2024`,
          code: 'CPL-KU-01',
          category: 'KETERAMPILAN_UMUM',
          description: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan IPTEK.',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'cpl-04',
          studyProgramId: p.id,
          curriculumId: `cur-${p.code.toLowerCase()}-2024`,
          code: 'CPL-KK-01',
          category: 'KETERAMPILAN_KHUSUS',
          description: `Mampu merancang dan mengevaluasi implementasi profesional di bidang ${p.name}.`,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ],
      courses: [
        { id: 'crs-01', code: `${p.code}101`, name: 'Pengantar Keilmuan & Metodologi', credits: 3, semester: 1 },
        { id: 'crs-02', code: `${p.code}102`, name: 'Studi Naskah & Sumber Primer', credits: 3, semester: 1 },
        { id: 'crs-03', code: `${p.code}201`, name: 'Kajian Lanjutan & Aplikasi Praktis', credits: 3, semester: 2 },
        { id: 'crs-04', code: `${p.code}301`, name: 'Seminar Proposal & Kapita Selekta', credits: 3, semester: 3 }
      ]
    };
  }

  /**
   * Menambah program studi baru
   */
  async createStudyProgram(payload: CreateStudyProgramInput): Promise<StudyProgram> {
    const cleanCode = payload.code.trim().toUpperCase();
    const cleanId = `prodi-${cleanCode.toLowerCase()}`;
    const list = this.getLocalPrograms();

    const existing = list.find((p) => p.code === cleanCode || p.id === cleanId);
    if (existing) {
      throw new Error(`Program Studi dengan kode '${cleanCode}' sudah terdaftar.`);
    }

    const newProdi: StudyProgram = {
      id: cleanId,
      code: cleanCode,
      name: payload.name.trim(),
      degree: (payload.degree as any) || 'S1',
      headOfProgram: payload.headOfProgram?.trim() || 'Belum Ditetapkan',
      headNidn: payload.headNidn?.trim() || null,
      accreditation: payload.accreditation || 'Baik',
      skNumber: payload.skNumber?.trim() || null,
      skDate: payload.skDate || null,
      degreeTitle: payload.degreeTitle?.trim() || 'Sarjana Pendidikan (S.Pd.)',
      totalCreditsRequired: Number(payload.totalCreditsRequired) || 144,
      isActive: true,
      description: payload.description?.trim() || null,
      email: payload.email?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalCourses: 0,
      totalStudents: 0,
      totalLecturers: 0,
      activeCurriculumName: `Kurikulum OBE ${cleanCode} 2024`
    };

    try {
      await apiClient.post<StudyProgram>('/academic/study-programs', payload);
    } catch {
      // ignore api error, fallback local
    }

    const updatedList = [newProdi, ...list];
    this.saveLocalPrograms(updatedList);
    return newProdi;
  }

  /**
   * Memperbarui program studi
   */
  async updateStudyProgram(id: string, payload: Partial<CreateStudyProgramInput & { isActive?: boolean }>): Promise<StudyProgram> {
    const list = this.getLocalPrograms();
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('Program Studi tidak ditemukan.');
    }

    const updated: StudyProgram = {
      ...list[index],
      name: payload.name !== undefined ? payload.name.trim() : list[index].name,
      degree: payload.degree !== undefined ? (payload.degree as any) : list[index].degree,
      headOfProgram: payload.headOfProgram !== undefined ? payload.headOfProgram.trim() : list[index].headOfProgram,
      headNidn: payload.headNidn !== undefined ? payload.headNidn.trim() : list[index].headNidn,
      accreditation: payload.accreditation !== undefined ? payload.accreditation : list[index].accreditation,
      skNumber: payload.skNumber !== undefined ? payload.skNumber.trim() : list[index].skNumber,
      skDate: payload.skDate !== undefined ? payload.skDate : list[index].skDate,
      degreeTitle: payload.degreeTitle !== undefined ? payload.degreeTitle.trim() : list[index].degreeTitle,
      totalCreditsRequired: payload.totalCreditsRequired !== undefined ? Number(payload.totalCreditsRequired) : list[index].totalCreditsRequired,
      description: payload.description !== undefined ? payload.description.trim() : list[index].description,
      email: payload.email !== undefined ? payload.email.trim() : list[index].email,
      isActive: payload.isActive !== undefined ? payload.isActive : list[index].isActive,
      updatedAt: new Date().toISOString()
    };

    try {
      await apiClient.put<StudyProgram>(`/academic/study-programs/${id}`, payload);
    } catch {
      // ignore
    }

    list[index] = updated;
    this.saveLocalPrograms(list);
    return updated;
  }

  /**
   * Menghapus program studi secara permanen
   */
  async deleteStudyProgram(id: string): Promise<void> {
    try {
      await apiClient.delete(`/academic/study-programs/${id}`);
    } catch {
      // ignore
    }

    const list = this.getLocalPrograms();
    const filtered = list.filter((p) => p.id !== id);
    this.saveLocalPrograms(filtered);
  }

  /**
   * Mengubah status aktif/nonaktif program studi
   */
  async toggleStudyProgramStatus(id: string): Promise<{ id: string; isActive: boolean }> {
    const list = this.getLocalPrograms();
    const p = list.find((item) => item.id === id);
    if (!p) {
      throw new Error('Program Studi tidak ditemukan.');
    }

    const nextState = !p.isActive;
    p.isActive = nextState;
    p.updatedAt = new Date().toISOString();

    try {
      await apiClient.patch<{ id: string; isActive: boolean }>(`/academic/study-programs/${id}/toggle-status`, {});
    } catch {
      // ignore
    }

    this.saveLocalPrograms(list);
    return { id, isActive: nextState };
  }

  /**
   * Mengambil daftar kurikulum
   */
  async getCurriculums(prodiId?: string): Promise<Curriculum[]> {
    try {
      const url = prodiId ? `/academic/curriculums?prodiId=${prodiId}` : '/academic/curriculums';
      return await apiClient.get<Curriculum[]>(url);
    } catch {
      return [];
    }
  }

  /**
   * Menambah kurikulum baru
   */
  async createCurriculum(payload: CreateCurriculumInput): Promise<Curriculum> {
    return await apiClient.post<Curriculum>('/academic/curriculums', payload);
  }

  /**
   * Mengambil daftar CPL
   */
  async getCPLList(prodiId?: string, curriculumId?: string): Promise<CPLItem[]> {
    try {
      const params = new URLSearchParams();
      if (prodiId) params.append('prodiId', prodiId);
      if (curriculumId) params.append('curriculumId', curriculumId);
      const qs = params.toString();
      return await apiClient.get<CPLItem[]>(`/academic/cpl${qs ? `?${qs}` : ''}`);
    } catch {
      return [];
    }
  }

  /**
   * Menambah CPL baru
   */
  async createCPL(payload: CreateCPLInput): Promise<CPLItem> {
    return await apiClient.post<CPLItem>('/academic/cpl', payload);
  }

  /**
   * Impor massal data program studi
   */
  async bulkCreateStudyPrograms(programs: CreateStudyProgramInput[]): Promise<{ count: number; items: any[] }> {
    try {
      return await apiClient.post<{ count: number; items: any[] }>('/academic/study-programs/bulk', { programs });
    } catch {
      const list = this.getLocalPrograms();
      const inserted: StudyProgram[] = [];

      for (const p of programs) {
        if (!p.code || !p.name) continue;
        const cleanCode = p.code.trim().toUpperCase();
        const cleanId = `prodi-${cleanCode.toLowerCase()}`;

        const existingIdx = list.findIndex((item) => item.code === cleanCode || item.id === cleanId);
        const prodiObj: StudyProgram = {
          id: cleanId,
          code: cleanCode,
          name: p.name.trim(),
          degree: (p.degree as any) || 'S1',
          headOfProgram: p.headOfProgram?.trim() || 'Belum Ditetapkan',
          headNidn: p.headNidn?.trim() || null,
          accreditation: p.accreditation || 'Baik',
          skNumber: p.skNumber?.trim() || null,
          skDate: p.skDate || null,
          degreeTitle: p.degreeTitle?.trim() || 'Sarjana Pendidikan (S.Pd.)',
          totalCreditsRequired: Number(p.totalCreditsRequired) || 144,
          isActive: true,
          description: p.description?.trim() || null,
          email: p.email?.trim() || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalCourses: 0,
          totalStudents: 0,
          totalLecturers: 0,
          activeCurriculumName: `Kurikulum OBE ${cleanCode} 2024`
        };

        if (existingIdx >= 0) {
          list[existingIdx] = { ...list[existingIdx], ...prodiObj };
          inserted.push(list[existingIdx]);
        } else {
          list.unshift(prodiObj);
          inserted.push(prodiObj);
        }
      }

      this.saveLocalPrograms(list);
      return {
        count: inserted.length,
        items: inserted
      };
    }
  }
}

export const studyProgramService = new StudyProgramService();
