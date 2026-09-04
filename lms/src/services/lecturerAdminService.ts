import { 
  LecturerProfileItem, 
  LecturerDetail, 
  LecturerSummaryStats, 
  CreateLecturerInput, 
  UpdateLecturerInput 
} from '../types/lecturerAdmin';
import { apiClient } from '../api/client';

const STORAGE_KEY = 'salam_lecturers_admin_v1';

const INITIAL_LECTURERS: LecturerProfileItem[] = [
  {
    profileId: 'prof-dsn-01',
    userId: 'usr-dsn-01',
    nidn: '2108198501',
    nuptk: '98765432101',
    titlePrefix: 'Dr. H.',
    titleSuffix: 'M.Ag',
    name: 'Dr. H. M. Ridwan, M.Ag',
    username: 'dosen',
    email: 'm.ridwan@stai-alittihad.ac.id',
    role: 'dosen',
    isUserActive: true,
    academicRank: 'Lektor Kepala',
    highestEducation: 'S3',
    employmentStatus: 'TETAP',
    homebaseProdiId: 'prodi-pai',
    homebaseProdiName: 'Pendidikan Agama Islam',
    homebaseProdiCode: 'PAI',
    isAcademicAdvisor: true,
    maxAdvisoryQuota: 30,
    specialization: 'Studi Al-Qur\'an & Tafsir Tarbawi',
    phoneNumber: '081234567001',
    address: 'Jl. Raya Cianjur-Bandung',
    createdAt: '2024-01-01T00:00:00Z',
    teachingClassesCount: 4,
    teachingCredits: 12,
    adviseesCount: 5
  },
  {
    profileId: 'prof-dsn-02',
    userId: 'usr-dsn-02',
    nidn: '2112198002',
    nuptk: '98765432102',
    titlePrefix: 'Dr.',
    titleSuffix: 'M.Pd.I',
    name: 'Dr. Siti Maryam, M.Pd.I',
    username: 'dsn.maryam',
    email: 'siti.maryam@stai-alittihad.ac.id',
    role: 'dosen_pa',
    isUserActive: true,
    academicRank: 'Lektor Kepala',
    highestEducation: 'S3',
    employmentStatus: 'TETAP',
    homebaseProdiId: 'prodi-pai',
    homebaseProdiName: 'Pendidikan Agama Islam',
    homebaseProdiCode: 'PAI',
    isAcademicAdvisor: true,
    maxAdvisoryQuota: 35,
    specialization: 'Manajemen Kurikulum & Supervisi Pendidikan',
    phoneNumber: '081234567002',
    address: 'Jl. Pasirhayam No. 45, Cianjur',
    createdAt: '2024-01-01T00:00:00Z',
    teachingClassesCount: 3,
    teachingCredits: 9,
    adviseesCount: 12
  }
];

export class LecturerAdminService {
  private getLocalLecturers(): LecturerProfileItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LECTURERS));
    return INITIAL_LECTURERS;
  }

  private saveLocalLecturers(lecturers: LecturerProfileItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lecturers));
    } catch {
      // ignore
    }
  }

  /**
   * Mengambil statistik ringkasan data dosen
   */
  async getSummaryStats(): Promise<LecturerSummaryStats> {
    try {
      const res = await apiClient.get<LecturerSummaryStats>('/academic/lecturers/summary');
      if (res && res.totalLecturers !== undefined) return res;
    } catch {
      // fallback to local calculation
    }

    const list = this.getLocalLecturers();
    const rankMap: Record<string, number> = {};
    const prodiMap: Record<string, { prodiName: string; prodiCode: string; count: number }> = {};

    list.forEach((l) => {
      rankMap[l.academicRank] = (rankMap[l.academicRank] || 0) + 1;
      const code = l.homebaseProdiCode || 'UMUM';
      if (!prodiMap[code]) {
        prodiMap[code] = {
          prodiCode: code,
          prodiName: l.homebaseProdiName || code,
          count: 0
        };
      }
      prodiMap[code].count++;
    });

    return {
      totalLecturers: list.length,
      totalPermanent: list.filter((l) => l.employmentStatus === 'TETAP').length,
      totalAdvisors: list.filter((l) => l.isAcademicAdvisor).length,
      totalDoctorates: list.filter((l) => l.highestEducation === 'S3').length,
      rankBreakdown: Object.entries(rankMap).map(([rank, count]) => ({ rank, count })),
      prodiBreakdown: Object.values(prodiMap)
    };
  }

  /**
   * Mengambil daftar seluruh dosen dengan filter
   */
  async getLecturers(filters?: {
    homebaseProdiId?: string;
    academicRank?: string;
    highestEducation?: string;
    isAdvisor?: string;
    employmentStatus?: string;
    search?: string;
  }): Promise<LecturerProfileItem[]> {
    let list = this.getLocalLecturers();

    try {
      const params = new URLSearchParams();
      if (filters?.homebaseProdiId) params.append('homebaseProdiId', filters.homebaseProdiId);
      if (filters?.academicRank) params.append('academicRank', filters.academicRank);
      if (filters?.highestEducation) params.append('highestEducation', filters.highestEducation);
      if (filters?.isAdvisor) params.append('isAdvisor', filters.isAdvisor);
      if (filters?.employmentStatus) params.append('employmentStatus', filters.employmentStatus);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      const apiList = await apiClient.get<LecturerProfileItem[]>(`/academic/lecturers${qs ? `?${qs}` : ''}`);
      if (Array.isArray(apiList) && apiList.length > 0) {
        list = apiList;
        this.saveLocalLecturers(list);
      }
    } catch {
      // fallback to local
    }

    if (!filters) return list;

    return list.filter((l) => {
      const matchHomebase = !filters.homebaseProdiId || filters.homebaseProdiId === 'SEMUA' || l.homebaseProdiId === filters.homebaseProdiId;
      const matchRank = !filters.academicRank || filters.academicRank === 'SEMUA' || l.academicRank === filters.academicRank;
      const matchEducation = !filters.highestEducation || filters.highestEducation === 'SEMUA' || l.highestEducation === filters.highestEducation;
      const matchAdvisor = !filters.isAdvisor || filters.isAdvisor === 'SEMUA' || (filters.isAdvisor === 'YA' && l.isAcademicAdvisor) || (filters.isAdvisor === 'TIDAK' && !l.isAcademicAdvisor);
      const matchEmployment = !filters.employmentStatus || filters.employmentStatus === 'SEMUA' || l.employmentStatus === filters.employmentStatus;

      const query = filters.search?.toLowerCase().trim() || '';
      const matchSearch = !query ||
        l.name.toLowerCase().includes(query) ||
        l.nidn.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query);

      return matchHomebase && matchRank && matchEducation && matchAdvisor && matchEmployment && matchSearch;
    });
  }

  /**
   * Mengambil detail lengkap dosen beserta kelas ampuan dan mahasiswa bimbingan PA
   */
  async getLecturerById(id: string): Promise<LecturerDetail> {
    try {
      const res = await apiClient.get<LecturerDetail>(`/academic/lecturers/${id}`);
      if (res && res.profileId) return res;
    } catch {
      // fallback
    }

    const list = this.getLocalLecturers();
    const l = list.find((item) => item.userId === id || item.profileId === id) || list[0];

    return {
      ...l,
      teachingClasses: [
        {
          classId: 'cls-01',
          className: 'PAI 3A',
          academicYear: '2026/2027 Ganjil',
          courseCode: 'PAI301',
          courseName: 'Fikih Ibadah & Muamalah',
          credits: 3,
          dayOfWeek: 'Senin',
          startTime: '08:00',
          endTime: '10:30',
          roomName: 'Ruang Tarbiyah 201',
          enrolledStudentsCount: 20
        }
      ],
      advisees: [
        {
          profileId: 'prof-mhs-01',
          nim: '21.01.0042',
          name: 'Ahmad Fauzi',
          email: 'ahmad.fauzi@student.stai-alittihad.ac.id',
          studyProgramCode: 'PAI',
          entryYear: 2022,
          currentSemester: 5,
          academicStatus: 'AKTIF',
          gpa: 3.78,
          totalCreditsEarned: 88
        }
      ]
    };
  }

  /**
   * Registrasi dosen baru
   */
  async createLecturer(payload: CreateLecturerInput): Promise<{ userId: string; profileId: string; nidn: string; name: string }> {
    const list = this.getLocalLecturers();
    const userId = `usr-dsn-${Date.now()}`;
    const profileId = `prof-dsn-${Date.now()}`;

    const newLecturer: LecturerProfileItem = {
      profileId,
      userId,
      nidn: payload.nidn.trim(),
      nuptk: payload.nuptk?.trim() || '',
      titlePrefix: payload.titlePrefix?.trim() || '',
      titleSuffix: payload.titleSuffix?.trim() || '',
      name: payload.name.trim(),
      username: payload.username?.trim() || `dsn.${payload.nidn}`,
      email: payload.email.trim(),
      role: (payload.role as any) || 'dosen',
      isUserActive: true,
      academicRank: payload.academicRank || 'Tenaga Pendidik',
      highestEducation: payload.highestEducation || 'S2',
      employmentStatus: payload.employmentStatus || 'TETAP',
      homebaseProdiId: payload.homebaseProdiId || 'prodi-pai',
      homebaseProdiName: 'Program Studi',
      homebaseProdiCode: 'PRODI',
      isAcademicAdvisor: Boolean(payload.isAcademicAdvisor),
      maxAdvisoryQuota: Number(payload.maxAdvisoryQuota) || 30,
      specialization: payload.specialization?.trim() || '',
      phoneNumber: payload.phoneNumber?.trim() || '',
      address: payload.address?.trim() || '',
      createdAt: new Date().toISOString(),
      teachingClassesCount: 0,
      teachingCredits: 0,
      adviseesCount: 0
    };

    try {
      const apiRes = await apiClient.post<{ userId: string; profileId: string; nidn: string; name: string }>('/academic/lecturers', payload);
      if (apiRes) {
        newLecturer.userId = apiRes.userId || userId;
        newLecturer.profileId = apiRes.profileId || profileId;
      }
    } catch {
      // fallback
    }

    this.saveLocalLecturers([newLecturer, ...list]);
    return { userId: newLecturer.userId, profileId: newLecturer.profileId, nidn: newLecturer.nidn, name: newLecturer.name };
  }

  /**
   * Memperbarui profil dosen
   */
  async updateLecturer(id: string, payload: UpdateLecturerInput): Promise<{ profileId: string }> {
    const list = this.getLocalLecturers();
    const index = list.findIndex((l) => l.profileId === id || l.userId === id);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        name: payload.name !== undefined ? payload.name.trim() : list[index].name,
        email: payload.email !== undefined ? payload.email.trim() : list[index].email,
        titlePrefix: payload.titlePrefix !== undefined ? payload.titlePrefix.trim() : list[index].titlePrefix,
        titleSuffix: payload.titleSuffix !== undefined ? payload.titleSuffix.trim() : list[index].titleSuffix,
        academicRank: payload.academicRank || list[index].academicRank,
        highestEducation: payload.highestEducation || list[index].highestEducation,
        employmentStatus: payload.employmentStatus || list[index].employmentStatus,
        homebaseProdiId: payload.homebaseProdiId || list[index].homebaseProdiId,
        isAcademicAdvisor: payload.isAcademicAdvisor !== undefined ? payload.isAcademicAdvisor : list[index].isAcademicAdvisor,
        maxAdvisoryQuota: payload.maxAdvisoryQuota !== undefined ? Number(payload.maxAdvisoryQuota) : list[index].maxAdvisoryQuota,
        specialization: payload.specialization !== undefined ? payload.specialization.trim() : list[index].specialization,
        phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber.trim() : list[index].phoneNumber,
        address: payload.address !== undefined ? payload.address.trim() : list[index].address
      };
      this.saveLocalLecturers(list);
    }

    try {
      return await apiClient.put<{ profileId: string }>(`/academic/lecturers/${id}`, payload);
    } catch {
      return { profileId: id };
    }
  }

  /**
   * Toggle status / hak akses Dosen Pembimbing Akademik (PA)
   */
  async toggleAcademicAdvisor(id: string): Promise<{ profileId: string; isAcademicAdvisor: boolean }> {
    const list = this.getLocalLecturers();
    const l = list.find((item) => item.profileId === id || item.userId === id);
    if (l) {
      l.isAcademicAdvisor = !l.isAcademicAdvisor;
      this.saveLocalLecturers(list);
    }

    try {
      return await apiClient.patch<{ profileId: string; isAcademicAdvisor: boolean }>(`/academic/lecturers/${id}/toggle-advisor`, {});
    } catch {
      return { profileId: id, isAcademicAdvisor: l ? l.isAcademicAdvisor : true };
    }
  }

  /**
   * Reset kata sandi akun dosen ke default
   */
  async resetLecturerPassword(id: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/academic/lecturers/${id}/reset-password`, {});
  }

  /**
   * Hapus / Nonaktifkan akun dosen
   */
  async deleteLecturer(id: string): Promise<{ message: string }> {
    try {
      await apiClient.delete<{ message: string }>(`/academic/lecturers/${id}`);
    } catch {
      // ignore
    }

    const list = this.getLocalLecturers();
    const filtered = list.filter((l) => l.userId !== id && l.profileId !== id);
    this.saveLocalLecturers(filtered);

    return { message: 'Akun dosen berhasil dihapus dari sistem.' };
  }

  /**
   * Impor massal data dosen
   */
  async bulkCreateLecturers(lecturers: CreateLecturerInput[]): Promise<{ count: number; items: any[] }> {
    try {
      return await apiClient.post<{ count: number; items: any[] }>('/academic/lecturers/bulk', { lecturers });
    } catch {
      const list = this.getLocalLecturers();
      const newItems: LecturerProfileItem[] = [];

      for (const payload of lecturers) {
        if (!payload.nidn || !payload.name) continue;
        const profileId = `prof-dsn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const userId = `usr-dsn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        const item: LecturerProfileItem = {
          profileId,
          userId,
          nidn: payload.nidn.trim(),
          nuptk: payload.nuptk?.trim() || '',
          titlePrefix: payload.titlePrefix?.trim() || '',
          titleSuffix: payload.titleSuffix?.trim() || '',
          name: payload.name.trim(),
          username: payload.username?.trim() || `dsn.${payload.nidn}`,
          email: payload.email?.trim() || `${payload.nidn}@stai-alittihad.ac.id`,
          role: (payload.role as any) || 'dosen',
          isUserActive: true,
          academicRank: payload.academicRank || 'Tenaga Pendidik',
          highestEducation: payload.highestEducation || 'S2',
          employmentStatus: payload.employmentStatus || 'TETAP',
          homebaseProdiId: payload.homebaseProdiId || 'prodi-pai',
          homebaseProdiName: 'Program Studi',
          homebaseProdiCode: 'PRODI',
          isAcademicAdvisor: Boolean(payload.isAcademicAdvisor),
          maxAdvisoryQuota: Number(payload.maxAdvisoryQuota) || 30,
          specialization: payload.specialization?.trim() || '',
          phoneNumber: payload.phoneNumber?.trim() || '',
          address: payload.address?.trim() || '',
          createdAt: new Date().toISOString(),
          teachingClassesCount: 0,
          teachingCredits: 0,
          adviseesCount: 0
        };

        newItems.push(item);
      }

      this.saveLocalLecturers([...newItems, ...list]);
      return { count: newItems.length, items: newItems };
    }
  }
}

export const lecturerAdminService = new LecturerAdminService();
