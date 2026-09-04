import { CalendarEvent } from '../types/calendar';
import { assignmentService } from './assignmentService';
import { quizService } from './quizService';

export const CAMPUS_ACADEMIC_EVENTS: CalendarEvent[] = [
  {
    id: 'acad-01',
    title: 'Awal Perkuliahan Semester Ganjil 2026/2027',
    type: 'AGENDA_AKADEMIK',
    date: '2026-09-07',
    startTime: '08:00',
    description: 'Hari pertama perkuliahan aktif seluruh Program Studi STAI AL-ITTIHAD.',
    location: 'Kampus Terpadu STAI AL-ITTIHAD'
  },
  {
    id: 'acad-02',
    title: 'Ujian Tengah Semester (UTS) Ganjil',
    type: 'AGENDA_AKADEMIK',
    date: '2026-10-26',
    startTime: '08:00',
    endTime: '16:00',
    description: 'Pekan Ujian Tengah Semester terjadwal berbasis SALAM LMS.',
    location: 'Daring / Laboratorium Komputer'
  },
  {
    id: 'acad-03',
    title: 'Batas Akhir Input Nilai UTS Dosen',
    type: 'AGENDA_AKADEMIK',
    date: '2026-11-06',
    description: 'Batas akhir penyerahan dan input nilai UTS ke sistem akademik.'
  }
];

class CalendarService {
  public getAllEvents(): CalendarEvent[] {
    const events: CalendarEvent[] = [...CAMPUS_ACADEMIC_EVENTS];

    // 1. Jadwal Kuliah Rutin
    events.push({
      id: 'cls-sch-01',
      title: 'Kuliah: Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)',
      courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
      type: 'JADWAL_KULIAH',
      date: '2026-09-07',
      startTime: '08:00',
      endTime: '10:30',
      location: 'Ruang Kuliah 204 / SALAM Daring',
      deepLinkPath: '/mata-kuliah'
    });
    events.push({
      id: 'cls-sch-02',
      title: 'Kuliah: Studi Naskah Tafsir Tarbawi (Kelas B)',
      courseName: 'Studi Naskah Tafsir Tarbawi',
      type: 'JADWAL_KULIAH',
      date: '2026-09-08',
      startTime: '10:45',
      endTime: '13:15',
      location: 'Ruang Kuliah 102',
      deepLinkPath: '/mata-kuliah'
    });

    // 2. Batas Pengumpulan Tugas dari assignmentService
    const assignments = assignmentService.getAssignments();
    assignments.forEach((asg) => {
      const dueDateObj = new Date(asg.dueDate);
      const dateStr = asg.dueDate.split('T')[0];
      const timeStr = dueDateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

      events.push({
        id: `event-asg-${asg.id}`,
        title: `Batas Tugas: ${asg.title}`,
        courseName: asg.courseName,
        type: 'BATAS_TUGAS',
        date: dateStr,
        startTime: timeStr,
        description: `Batas waktu pengumpulan tugas (${asg.allowedFileExtensions.join(', ')}).`,
        deepLinkPath: '/tugas',
        isUrgent: true
      });
    });

    // 3. Batas Kuis Daring dari quizService
    const quizzes = quizService.getQuizzes();
    quizzes.forEach((qz) => {
      const dateStr = qz.endDate.split('T')[0];
      events.push({
        id: `event-qz-${qz.id}`,
        title: `Kuis Daring: ${qz.title}`,
        courseName: qz.courseName,
        type: 'KUIS_DARING',
        date: dateStr,
        description: `Kuis berbatas waktu (${qz.durationMinutes} menit, KKM ${qz.passingScore}).`,
        deepLinkPath: '/kuis',
        isUrgent: true
      });
    });

    // Sort kronologis
    return events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  public getUpcomingDeadlines(): CalendarEvent[] {
    return this.getAllEvents().filter(
      (e) => e.type === 'BATAS_TUGAS' || e.type === 'KUIS_DARING'
    );
  }
}

export const calendarService = new CalendarService();
