import { 
  CampusRoom, 
  ClassSchedule, 
  ScheduleSummaryStats, 
  ScheduleMatrixData, 
  CreateScheduleInput, 
  CreateRoomInput 
} from '../types/scheduleAdmin';
import { apiClient } from '../api/client';

export class ScheduleAdminService {
  /**
   * Mengambil statistik ringkasan jadwal dan utilisasi ruangan
   */
  async getSummaryStats(): Promise<ScheduleSummaryStats> {
    try {
      return await apiClient.get<ScheduleSummaryStats>('/academic/schedules/summary');
    } catch {
      return {
        totalSchedules: 6,
        totalRooms: 6,
        totalActiveRooms: 6,
        totalScheduledCredits: 17,
        utilizationRatePercent: 12,
        conflictsCount: 0,
        dayDistribution: [
          { dayOfWeek: 'Senin', count: 2 },
          { dayOfWeek: 'Selasa', count: 1 },
          { dayOfWeek: 'Rabu', count: 1 },
          { dayOfWeek: 'Kamis', count: 1 },
          { dayOfWeek: 'Jumat', count: 1 }
        ],
        roomTypeDistribution: [
          { roomType: 'TEORI', count: 2 },
          { roomType: 'SMART_CLASS', count: 1 },
          { roomType: 'LABORATORIUM', count: 1 },
          { roomType: 'STUDIO', count: 1 },
          { roomType: 'AUDITORIUM', count: 1 }
        ]
      };
    }
  }

  /**
   * Mengambil daftar jadwal perkuliahan dengan filter
   */
  async getSchedules(filters?: {
    dayOfWeek?: string;
    roomId?: string;
    prodiId?: string;
    semesterId?: string;
    deliveryMode?: string;
    search?: string;
  }): Promise<ClassSchedule[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.dayOfWeek) params.append('dayOfWeek', filters.dayOfWeek);
      if (filters?.roomId) params.append('roomId', filters.roomId);
      if (filters?.prodiId) params.append('prodiId', filters.prodiId);
      if (filters?.semesterId) params.append('semesterId', filters.semesterId);
      if (filters?.deliveryMode) params.append('deliveryMode', filters.deliveryMode);
      if (filters?.search) params.append('search', filters.search);

      const qs = params.toString();
      return await apiClient.get<ClassSchedule[]>(`/academic/schedules${qs ? `?${qs}` : ''}`);
    } catch {
      return [
        {
          id: 'sch-01',
          classId: 'cls-pai301-a',
          className: 'Kelas A',
          academicYear: '2026/2027 Ganjil',
          semesterId: 'sem-2026-ganjil',
          semesterName: 'Semester Ganjil 2026/2027',
          isCurrentSemester: true,
          courseId: 'crs-pai301',
          courseCode: 'PAI-301',
          courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
          credits: 3,
          courseType: 'WAJIB_PRODI',
          studyProgramId: 'prodi-pai',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          roomId: 'rm-a201',
          roomName: 'Ruang Al-Ghazali',
          roomCode: 'A-201',
          building: 'Gedung A (Kulliyyah Tarbiyah)',
          roomCapacity: 40,
          lecturerId: 'usr-dsn-01',
          lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
          lecturerNidn: '2105088201',
          dayOfWeek: 'Senin',
          startTime: '08:00:00',
          endTime: '10:30:00',
          isOnline: false,
          deliveryMode: 'HYBRID',
          isActive: true,
          enrolledCount: 35
        },
        {
          id: 'sch-02',
          classId: 'cls-pai301-b',
          className: 'Kelas B',
          academicYear: '2026/2027 Ganjil',
          semesterId: 'sem-2026-ganjil',
          semesterName: 'Semester Ganjil 2026/2027',
          isCurrentSemester: true,
          courseId: 'crs-pai301',
          courseCode: 'PAI-301',
          courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
          credits: 3,
          courseType: 'WAJIB_PRODI',
          studyProgramId: 'prodi-pai',
          studyProgramName: 'Pendidikan Agama Islam',
          studyProgramCode: 'PAI',
          roomId: 'rm-a202',
          roomName: 'Ruang Ibnu Khaldun',
          roomCode: 'A-202',
          building: 'Gedung A (Kulliyyah Tarbiyah)',
          roomCapacity: 40,
          lecturerId: 'usr-dsn-01',
          lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
          lecturerNidn: '2105088201',
          dayOfWeek: 'Senin',
          startTime: '13:00:00',
          endTime: '15:30:00',
          isOnline: false,
          deliveryMode: 'HYBRID',
          isActive: true,
          enrolledCount: 30
        }
      ];
    }
  }

  /**
   * Mengambil matriks jadwal mingguan untuk kalender timetable
   */
  async getScheduleMatrix(): Promise<ScheduleMatrixData> {
    try {
      return await apiClient.get<ScheduleMatrixData>('/academic/schedules/matrix');
    } catch {
      return {
        days: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
        matrix: {
          Senin: [
            {
              id: 'sch-01',
              classId: 'cls-pai301-a',
              className: 'Kelas A',
              courseCode: 'PAI-301',
              courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
              credits: 3,
              studyProgramCode: 'PAI',
              roomId: 'rm-a201',
              roomCode: 'A-201',
              roomName: 'Ruang Al-Ghazali',
              lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
              dayOfWeek: 'Senin',
              startTime: '08:00:00',
              endTime: '10:30:00',
              deliveryMode: 'HYBRID'
            },
            {
              id: 'sch-02',
              classId: 'cls-pai301-b',
              className: 'Kelas B',
              courseCode: 'PAI-301',
              courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
              credits: 3,
              studyProgramCode: 'PAI',
              roomId: 'rm-a202',
              roomCode: 'A-202',
              roomName: 'Ruang Ibnu Khaldun',
              lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
              dayOfWeek: 'Senin',
              startTime: '13:00:00',
              endTime: '15:30:00',
              deliveryMode: 'HYBRID'
            }
          ],
          Selasa: [
            {
              id: 'sch-03',
              classId: 'cls-pai101-a',
              className: 'Kelas A',
              courseCode: 'PAI-101',
              courseName: 'Ilmu Pendidikan Islam',
              credits: 3,
              studyProgramCode: 'PAI',
              roomId: 'rm-aud01',
              roomCode: 'AUD-01',
              roomName: 'Auditorium Utama',
              lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
              dayOfWeek: 'Selasa',
              startTime: '08:00:00',
              endTime: '10:30:00',
              deliveryMode: 'TATAP_MUKA'
            }
          ],
          Rabu: [
            {
              id: 'sch-04',
              classId: 'cls-mpi101-a',
              className: 'Kelas A',
              courseCode: 'MPI-101',
              courseName: 'Dasar-Dasar Manajemen Pendidikan',
              credits: 3,
              studyProgramCode: 'MPI',
              roomId: 'rm-b101',
              roomCode: 'B-101',
              roomName: 'Ruang Smart Classroom',
              lecturerName: 'Dr. Hj. Siti Maryam, M.M.Pd.',
              dayOfWeek: 'Rabu',
              startTime: '09:30:00',
              endTime: '12:00:00',
              deliveryMode: 'HYBRID'
            }
          ],
          Kamis: [
            {
              id: 'sch-05',
              classId: 'cls-hes101-a',
              className: 'Kelas A',
              courseCode: 'HES-101',
              courseName: 'Pengantar Fiqh Muamalah Kontemporer',
              credits: 3,
              studyProgramCode: 'HES',
              roomId: 'rm-b102',
              roomCode: 'B-102',
              roomName: 'Laboratorium Syariah',
              lecturerName: 'H. Ridwan Malik, M.H.I.',
              dayOfWeek: 'Kamis',
              startTime: '08:00:00',
              endTime: '10:30:00',
              deliveryMode: 'TATAP_MUKA'
            }
          ],
          Jumat: [
            {
              id: 'sch-06',
              classId: 'cls-mku101-a',
              className: 'Kelas A Reguler',
              courseCode: 'MKU-101',
              courseName: 'Pancasila & Kewarganegaraan',
              credits: 2,
              studyProgramCode: 'MKDU',
              roomId: 'rm-c301',
              roomCode: 'C-301',
              roomName: 'Ruang Multimedia',
              lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I.',
              dayOfWeek: 'Jumat',
              startTime: '08:00:00',
              endTime: '09:40:00',
              deliveryMode: 'DARING'
            }
          ],
          Sabtu: []
        }
      };
    }
  }

  /**
   * Plot jadwal baru dengan conflict prevention
   */
  async createSchedule(payload: CreateScheduleInput): Promise<{ id: string; message: string }> {
    return await apiClient.post<{ id: string; message: string }>('/academic/schedules', payload);
  }

  /**
   * Ubah jadwal perkuliahan
   */
  async updateSchedule(id: string, payload: Partial<CreateScheduleInput>): Promise<{ id: string }> {
    return await apiClient.put<{ id: string }>(`/academic/schedules/${id}`, payload);
  }

  /**
   * Hapus plot jadwal
   */
  async deleteSchedule(id: string): Promise<void> {
    await apiClient.delete(`/academic/schedules/${id}`);
  }

  /**
   * Mengambil master ruangan kampus
   */
  async getRooms(): Promise<CampusRoom[]> {
    try {
      return await apiClient.get<CampusRoom[]>('/academic/rooms');
    } catch {
      return [
        {
          id: 'rm-a201',
          code: 'A-201',
          name: 'Ruang Al-Ghazali',
          building: 'Gedung A (Kulliyyah Tarbiyah)',
          floor: 2,
          capacity: 40,
          roomType: 'TEORI',
          facilities: ['AC', 'Proyektor HD', 'Sound System', 'Wi-Fi Cepat'],
          isAvailable: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          activeSchedulesCount: 1
        },
        {
          id: 'rm-b101',
          code: 'B-101',
          name: 'Ruang Smart Classroom',
          building: 'Gedung B (Pusat Studi Islam & Manajemen)',
          floor: 1,
          capacity: 35,
          roomType: 'SMART_CLASS',
          facilities: ['Interactive Smart Screen 75"', 'Kamera PTZ Hybrid', 'AC', 'Wi-Fi 6'],
          isAvailable: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2026-08-17T00:00:00Z',
          activeSchedulesCount: 1
        }
      ];
    }
  }

  /**
   * Tambah master ruangan baru
   */
  async createRoom(payload: CreateRoomInput): Promise<CampusRoom> {
    return await apiClient.post<CampusRoom>('/academic/rooms', payload);
  }

  /**
   * Ubah data ruangan
   */
  async updateRoom(id: string, payload: Partial<CreateRoomInput & { isAvailable?: boolean }>): Promise<CampusRoom> {
    return await apiClient.put<CampusRoom>(`/academic/rooms/${id}`, payload);
  }

  /**
   * Ubah status ketersediaan ruangan
   */
  async toggleRoomStatus(id: string): Promise<{ id: string; isAvailable: boolean }> {
    return await apiClient.patch<{ id: string; isAvailable: boolean }>(`/academic/rooms/${id}/toggle-status`, {});
  }

  /**
   * Impor massal jadwal perkuliahan
   */
  async bulkCreateSchedules(schedules: CreateScheduleInput[]): Promise<{ count: number; items: any[] }> {
    return await apiClient.post<{ count: number; items: any[] }>('/academic/schedules/bulk', { schedules });
  }
}

export const scheduleAdminService = new ScheduleAdminService();
