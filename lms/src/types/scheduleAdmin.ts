/**
 * TIPE DATA MODUL RUANGAN & JADWAL KULIAH — SALAM LMS
 */

export type RoomType = 'TEORI' | 'LABORATORIUM' | 'SMART_CLASS' | 'AUDITORIUM' | 'STUDIO';

export interface CampusRoom {
  id: string;
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
  facilities: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  activeSchedulesCount?: number | string;
}

export interface ClassSchedule {
  id: string;
  classId: string;
  className: string;
  academicYear: string;
  semesterId: string;
  semesterName: string;
  isCurrentSemester?: boolean;
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  courseType: string;
  studyProgramId: string | null;
  studyProgramName: string;
  studyProgramCode: string;
  roomId: string | null;
  roomName: string;
  roomCode: string;
  building: string;
  roomCapacity: number;
  lecturerId: string | null;
  lecturerName: string;
  lecturerNidn: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  deliveryMode: 'TATAP_MUKA' | 'DARING' | 'HYBRID';
  isActive: boolean;
  enrolledCount: number | string;
}

export interface ScheduleSummaryStats {
  totalSchedules: number;
  totalRooms: number;
  totalActiveRooms: number;
  totalScheduledCredits: number;
  utilizationRatePercent: number;
  conflictsCount: number;
  dayDistribution: Array<{
    dayOfWeek: string;
    count: number | string;
  }>;
  roomTypeDistribution: Array<{
    roomType: string;
    count: number | string;
  }>;
}

export interface ScheduleMatrixData {
  days: string[];
  matrix: Record<string, Array<{
    id: string;
    classId: string;
    className: string;
    courseCode: string;
    courseName: string;
    credits: number;
    studyProgramCode: string;
    roomId: string | null;
    roomCode: string;
    roomName: string;
    lecturerName: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    deliveryMode: string;
  }>>;
}

export interface CreateScheduleInput {
  classId: string;
  roomId?: string;
  lecturerId?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  deliveryMode: 'TATAP_MUKA' | 'DARING' | 'HYBRID';
}

export interface CreateRoomInput {
  code: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  roomType: RoomType;
  facilities: string[];
}
