import { 
  StudentProfileItem, 
  StudentDetail, 
  StudentSummaryStats, 
  AcademicStatus, 
  CreateStudentInput, 
  UpdateStudentInput 
} from '../types/studentAdmin';
import { apiClient } from '../api/client';

const STORAGE_KEY = 'salam_students_admin_v1';

const INITIAL_STUDENTS: StudentProfileItem[] = [
  {
    profileId: 'prof-mhs-01',
    userId: 'usr-mhs-01',
    nim: '21.01.0042',
    name: 'Ahmad Fauzi',
    username: 'mahasiswa',
    email: 'ahmad.fauzi@student.stai-alittihad.ac.id',
    isUserActive: true,
    studyProgramId: 'prodi-pai',
    studyProgramName: 'Pendidikan Agama Islam',
    studyProgramCode: 'PAI',
    academicAdvisorId: 'usr-dsn-pa',
    advisorName: 'Dr. Siti Maryam, M.Pd.I',
    advisorNidn: '2112198002',
    entryYear: 2022,
    entrySemester: 'Ganjil',
    currentSemester: 5,
    academicStatus: 'AKTIF',
    gpa: 3.78,
    totalCreditsEarned: 88,
    gender: 'Laki-laki',
    birthPlace: 'Cianjur',
    birthDate: '2004-03-15',
    phoneNumber: '081234567801',
    address: 'Jl. Raya Cianjur-Bandung',
    guardianName: 'H. Muhammad Yusuf',
    createdAt: '2024-01-01T00:00:00Z',
    enrolledClassesCount: 1
  },
  {
    profileId: 'prof-mhs-02',
    userId: 'usr-mhs-02',
    nim: '22.01.0015',
    name: 'Siti Fatimah Zahra',
    username: 'mhs.fatimah',
    email: 'fatimah.zahra@student.stai-alittihad.ac.id',
    isUserActive: true,
    studyProgramId: 'prodi-pai',
    studyProgramName: 'Pendidikan Agama Islam',
    studyProgramCode: 'PAI',
    academicAdvisorId: 'usr-dsn-pa',
    advisorName: 'Dr. Siti Maryam, M.Pd.I',
    advisorNidn: '2112198002',
    entryYear: 2022,
    entrySemester: 'Ganjil',
    currentSemester: 5,
    academicStatus: 'AKTIF',
    gpa: 3.85,
    totalCreditsEarned: 92,
    gender: 'Perempuan',
    birthPlace: 'Bandung',
    birthDate: '2004-06-20',
    phoneNumber: '081234567802',
    address: 'Jl. Pasirhayam No. 12, Cianjur',
    guardianName: 'Drs. H. Syarif Hidayat',
    createdAt: '2024-01-01T00:00:00Z',
    enrolledClassesCount: 1
  }
];

export class StudentAdminService {
  private getLocalStudents(): StudentProfileItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
    return INITIAL_STUDENTS;
  }

  private saveLocalStudents(students: StudentProfileItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    } catch {
      // ignore
    }
  }

  /**
   * Mengambil statistik ringkasan data mahasiswa
   */
  async getSummaryStats(): Promise<StudentSummaryStats> {
    try {
      const res = await apiClient.get<StudentSummaryStats>('/academic/students/summary');
      if (res && res.totalStudents !== undefined) return res;
    } catch {
      // fallback to local calculation
    }

    const list = this.getLocalStudents();
    const active = list.filter((s) => s.academicStatus === 'AKTIF');
    const onLeave = list.filter((s) => s.academicStatus === 'CUTI');
    const graduated = list.filter((s) => s.academicStatus === 'LULUS');
    const totalGpa = list.reduce((acc, s) => acc + (Number(s.gpa) || 0), 0);

    const prodiMap: Record<string, { prodiName: string; prodiCode: string; count: number }> = {};
    const yearMap: Record<number, number> = {};

    list.forEach((s) => {
      const code = s.studyProgramCode || 'UMUM';
      if (!prodiMap[code]) {
        prodiMap[code] = {
          prodiCode: code,
          prodiName: s.studyProgramName || code,
          count: 0
        };
      }
      prodiMap[code].count++;

      const y = s.entryYear || 2024;
      yearMap[y] = (yearMap[y] || 0) + 1;
    });

    return {
      totalStudents: list.length,
      totalActiveStudents: active.length,
      totalOnLeave: onLeave.length,
      totalGraduated: graduated.length,
      averageGPA: list.length > 0 ? parseFloat((totalGpa / list.length).toFixed(2)) : 0,
      prodiBreakdown: Object.values(prodiMap),
      entryYearBreakdown: Object.entries(yearMap).map(([year, count]) => ({
        entryYear: parseInt(year, 10),
        count
      }))
    };
  }

  /**
   * Mengambil daftar seluruh mahasiswa dengan filter
   */
  async getStudents(filters?: {
    prodiId?: string;
    entryYear?: string;
    currentSemester?: string;
    academicStatus?: string;
    advisorId?: string;
    gender?: string;
    search?: string;
  }): Promise<StudentProfileItem[]> {
    let list = this.getLocalStudents();

    try {
      const params = new URLSearchParams();
      if (filters?.prodiId) params.append('prodiId', filters.prodiId);
      if (filters?.entryYear) params.append('entryYear', filters.entryYear);
      if (filters?.currentSemester) params.append('currentSemester', filters.currentSemester);
      if (filters?.academicStatus) params.append('academicStatus', filters.academicStatus);
      if (filters?.advisorId) params.append('advisorId', filters.advisorId);
      if (filters?.gender) params.append('gender', filters.gender);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      const apiList = await apiClient.get<StudentProfileItem[]>(`/academic/students${qs ? `?${qs}` : ''}`);
      if (Array.isArray(apiList) && apiList.length > 0) {
        list = apiList;
        this.saveLocalStudents(list);
      }
    } catch {
      // fallback to local list
    }

    if (!filters) return list;

    return list.filter((s) => {
      const matchProdi = !filters.prodiId || filters.prodiId === 'SEMUA' || s.studyProgramId === filters.prodiId;
      const matchYear = !filters.entryYear || filters.entryYear === 'SEMUA' || String(s.entryYear) === filters.entryYear;
      const matchSemester = !filters.currentSemester || filters.currentSemester === 'SEMUA' || String(s.currentSemester) === filters.currentSemester;
      const matchStatus = !filters.academicStatus || filters.academicStatus === 'SEMUA' || s.academicStatus === filters.academicStatus;
      const matchAdvisor = !filters.advisorId || filters.advisorId === 'SEMUA' || s.academicAdvisorId === filters.advisorId;
      const matchGender = !filters.gender || filters.gender === 'SEMUA' || s.gender === filters.gender;

      const query = filters.search?.toLowerCase().trim() || '';
      const matchSearch = !query ||
        s.name.toLowerCase().includes(query) ||
        s.nim.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query);

      return matchProdi && matchYear && matchSemester && matchStatus && matchAdvisor && matchGender && matchSearch;
    });
  }

  /**
   * Mengambil detail lengkap profil mahasiswa
   */
  async getStudentById(id: string): Promise<StudentDetail> {
    try {
      const res = await apiClient.get<StudentDetail>(`/academic/students/${id}`);
      if (res && res.profileId) return res;
    } catch {
      // fallback
    }

    const list = this.getLocalStudents();
    const s = list.find((item) => item.userId === id || item.profileId === id) || list[0];

    return {
      ...s,
      enrolledClasses: [
        {
          enrollmentId: 'enr-01',
          className: 'PAI 3A',
          academicYear: '2026/2027 Ganjil',
          courseCode: 'PAI101',
          courseName: 'Ilmu Pendidikan Islam',
          credits: 3,
          status: 'AKTIF',
          enrolledAt: '2026-08-15'
        }
      ]
    };
  }

  /**
   * Registrasi mahasiswa baru
   */
  async createStudent(payload: CreateStudentInput): Promise<{ userId: string; profileId: string; nim: string; name: string }> {
    const list = this.getLocalStudents();
    const userId = `usr-mhs-${Date.now()}`;
    const profileId = `prof-mhs-${Date.now()}`;

    const newStudent: StudentProfileItem = {
      profileId,
      userId,
      nim: payload.nim.trim(),
      name: payload.name.trim(),
      username: payload.username ? payload.username.trim() : `mhs.${payload.nim.replace(/[^a-zA-Z0-9]/g, '')}`,
      email: payload.email.trim(),
      isUserActive: true,
      studyProgramId: payload.studyProgramId || 'prodi-pai',
      studyProgramName: payload.studyProgramId === 'prodi-pai' ? 'Pendidikan Agama Islam' : 'Program Studi',
      studyProgramCode: payload.studyProgramId === 'prodi-pai' ? 'PAI' : 'PRODI',
      academicAdvisorId: payload.academicAdvisorId || null,
      advisorName: 'Belum Ditetapkan',
      advisorNidn: '',
      entryYear: Number(payload.entryYear) || 2024,
      entrySemester: payload.entrySemester || 'Ganjil',
      currentSemester: Number(payload.currentSemester) || 1,
      academicStatus: 'AKTIF',
      gpa: 0,
      totalCreditsEarned: 0,
      gender: payload.gender || 'Laki-laki',
      birthPlace: payload.birthPlace || '',
      birthDate: payload.birthDate || '',
      phoneNumber: payload.phoneNumber || '',
      address: payload.address || '',
      guardianName: payload.guardianName || '',
      createdAt: new Date().toISOString(),
      enrolledClassesCount: 0
    };

    try {
      const apiRes = await apiClient.post<{ userId: string; profileId: string; nim: string; name: string }>('/academic/students', payload);
      if (apiRes) {
        newStudent.userId = apiRes.userId || userId;
        newStudent.profileId = apiRes.profileId || profileId;
      }
    } catch {
      // fallback
    }

    this.saveLocalStudents([newStudent, ...list]);
    return { userId: newStudent.userId, profileId: newStudent.profileId, nim: newStudent.nim, name: newStudent.name };
  }

  /**
   * Memperbarui profil mahasiswa
   */
  async updateStudent(id: string, payload: UpdateStudentInput): Promise<{ profileId: string }> {
    const list = this.getLocalStudents();
    const index = list.findIndex((s) => s.profileId === id || s.userId === id);
    if (index >= 0) {
      list[index] = {
        ...list[index],
        name: payload.name !== undefined ? payload.name.trim() : list[index].name,
        email: payload.email !== undefined ? payload.email.trim() : list[index].email,
        studyProgramId: payload.studyProgramId !== undefined ? payload.studyProgramId : list[index].studyProgramId,
        academicAdvisorId: payload.academicAdvisorId !== undefined ? payload.academicAdvisorId : list[index].academicAdvisorId,
        entryYear: payload.entryYear !== undefined ? Number(payload.entryYear) : list[index].entryYear,
        currentSemester: payload.currentSemester !== undefined ? Number(payload.currentSemester) : list[index].currentSemester,
        academicStatus: payload.academicStatus || list[index].academicStatus,
        gpa: payload.gpa !== undefined ? Number(payload.gpa) : list[index].gpa,
        totalCreditsEarned: payload.totalCreditsEarned !== undefined ? Number(payload.totalCreditsEarned) : list[index].totalCreditsEarned,
        gender: payload.gender || list[index].gender,
        birthPlace: payload.birthPlace !== undefined ? payload.birthPlace : list[index].birthPlace,
        birthDate: payload.birthDate !== undefined ? payload.birthDate : list[index].birthDate,
        phoneNumber: payload.phoneNumber !== undefined ? payload.phoneNumber : list[index].phoneNumber,
        address: payload.address !== undefined ? payload.address : list[index].address,
        guardianName: payload.guardianName !== undefined ? payload.guardianName : list[index].guardianName
      };
      this.saveLocalStudents(list);
    }

    try {
      return await apiClient.put<{ profileId: string }>(`/academic/students/${id}`, payload);
    } catch {
      return { profileId: id };
    }
  }

  /**
   * Mengubah status akademik mahasiswa
   */
  async updateStudentStatus(id: string, status: AcademicStatus): Promise<{ profileId: string; status: AcademicStatus }> {
    const list = this.getLocalStudents();
    const s = list.find((item) => item.profileId === id || item.userId === id);
    if (s) {
      s.academicStatus = status;
      this.saveLocalStudents(list);
    }

    try {
      return await apiClient.patch<{ profileId: string; status: AcademicStatus }>(`/academic/students/${id}/status`, { status });
    } catch {
      return { profileId: id, status };
    }
  }

  /**
   * Reset kata sandi mahasiswa ke default
   */
  async resetStudentPassword(id: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/academic/students/${id}/reset-password`, {});
  }

  /**
   * Hapus / Nonaktifkan mahasiswa secara permanen dari sistem
   */
  async deleteStudent(id: string): Promise<{ message: string }> {
    try {
      await apiClient.delete<{ message: string }>(`/academic/students/${id}`);
    } catch {
      // ignore
    }

    const list = this.getLocalStudents();
    const filtered = list.filter((s) => s.userId !== id && s.profileId !== id);
    this.saveLocalStudents(filtered);

    return { message: 'Data mahasiswa berhasil dihapus dari sistem.' };
  }

  /**
   * Impor massal data mahasiswa
   */
  async bulkCreateStudents(students: CreateStudentInput[]): Promise<{ count: number; items: any[] }> {
    try {
      return await apiClient.post<{ count: number; items: any[] }>('/academic/students/bulk', { students });
    } catch {
      const list = this.getLocalStudents();
      const newItems: StudentProfileItem[] = [];

      for (const s of students) {
        if (!s.nim || !s.name) continue;
        const profileId = `prof-mhs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        const userId = `usr-mhs-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        const item: StudentProfileItem = {
          profileId,
          userId,
          nim: s.nim.trim(),
          name: s.name.trim(),
          username: s.username?.trim() || `mhs.${s.nim.replace(/[^a-zA-Z0-9]/g, '')}`,
          email: s.email?.trim() || `${s.nim.replace(/[^a-zA-Z0-9]/g, '')}@student.stai-alittihad.ac.id`,
          isUserActive: true,
          studyProgramId: s.studyProgramId || 'prodi-pai',
          studyProgramName: 'Program Studi',
          studyProgramCode: 'PRODI',
          academicAdvisorId: s.academicAdvisorId || null,
          advisorName: 'Belum Ditetapkan',
          advisorNidn: '',
          entryYear: Number(s.entryYear) || 2024,
          entrySemester: s.entrySemester || 'Ganjil',
          currentSemester: Number(s.currentSemester) || 1,
          academicStatus: 'AKTIF',
          gpa: 0,
          totalCreditsEarned: 0,
          gender: s.gender || 'Laki-laki',
          birthPlace: s.birthPlace || '',
          birthDate: s.birthDate || '',
          phoneNumber: s.phoneNumber || '',
          address: s.address || '',
          guardianName: s.guardianName || '',
          createdAt: new Date().toISOString(),
          enrolledClassesCount: 0
        };

        newItems.push(item);
      }

      this.saveLocalStudents([...newItems, ...list]);
      return { count: newItems.length, items: newItems };
    }
  }
}

export const studentAdminService = new StudentAdminService();
