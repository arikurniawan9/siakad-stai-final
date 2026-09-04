/**
 * Tipe Data untuk Modul Jadwal Perkuliahan Sisi Mahasiswa (SALAM LMS STAI AL-ITTIHAD)
 */

export type DeliveryMode = 'TATAP_MUKA' | 'DARING' | 'HYBRID';
export type ClassScheduleStatus = 'AKAN_DATANG' | 'SEDANG_BERLANGSUNG' | 'SELESAI';

export interface StudentScheduleItem {
  id: string;
  classId: string;
  courseCode: string;
  courseName: string;
  className: string;
  credits: number;
  courseType: 'WAJIB_PRODI' | 'WAJIB_INSTITUSI' | 'PILIHAN';
  dayOfWeek: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  dayIndex: number; // 1: Senin, 2: Selasa, 3: Rabu, 4: Kamis, 5: Jumat, 6: Sabtu
  startTime: string; // "08:00"
  endTime: string; // "10:30"
  durationMinutes: number;
  roomId: string;
  roomName: string;
  roomCode: string;
  building: string;
  floor: string;
  roomType: 'TEORI' | 'SMART_CLASS' | 'LABORATORIUM' | 'STUDIO' | 'AUDITORIUM';
  lecturerId: string;
  lecturerName: string;
  lecturerNidn: string;
  lecturerEmail?: string;
  lecturerPhone?: string;
  deliveryMode: DeliveryMode;
  onlineMeetingUrl?: string;
  status: ClassScheduleStatus;
  nextTopicTitle: string;
  nextMeetingNumber: number;
  activeAssignmentCount: number;
  activeQuizCount: number;
  enrolledCount: number;
  syllabusUrl?: string;
}

export interface StudentScheduleSummary {
  studentId: string;
  studentName: string;
  studentNim: string;
  studyProgram: string;
  studyProgramCode: string;
  academicPeriodName: string;
  academicYear: string;
  semesterNumber: number;
  academicAdvisorName: string;
  academicAdvisorNidn: string;
  totalCredits: number;
  totalCourses: number;
  todaySchedules: StudentScheduleItem[];
  upcomingSchedule?: StudentScheduleItem;
  timeUntilUpcoming?: string;
}

export interface StudentTimetableDay {
  dayName: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  dayIndex: number;
  isToday: boolean;
  totalCredits: number;
  schedules: StudentScheduleItem[];
}
