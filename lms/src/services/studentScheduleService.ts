import { 
  StudentScheduleItem, 
  StudentScheduleSummary, 
  StudentTimetableDay,
  ClassScheduleStatus 
} from '../types/studentSchedule';

export const STUDENT_SCHEDULES_MOCK: StudentScheduleItem[] = [
  {
    id: 'sch-std-01',
    classId: 'cls-pai301-a',
    courseCode: 'PAI-301',
    courseName: 'Ushul Fiqih & Qawaid Fiqhiyyah',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_PRODI',
    dayOfWeek: 'Senin',
    dayIndex: 1,
    startTime: '08:00',
    endTime: '10:30',
    durationMinutes: 150,
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 'Lantai 2',
    roomType: 'TEORI',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    lecturerEmail: 'm.ridwan@stai-alittihad.ac.id',
    lecturerPhone: '+62 812-3456-7801',
    deliveryMode: 'HYBRID',
    onlineMeetingUrl: 'https://meet.staialittihad.ac.id/salam-pai301a',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Kaidah Ushuliyah: Amar, Nahi, Mutlaq, dan Muqayyad',
    nextMeetingNumber: 3,
    activeAssignmentCount: 1,
    activeQuizCount: 1,
    enrolledCount: 38,
    syllabusUrl: '/docs/rps/PAI-301-RPS.pdf'
  },
  {
    id: 'sch-std-02',
    classId: 'cls-pai204-a',
    courseCode: 'PAI-204',
    courseName: "Ulumul Qur'an & Studi Tafsir Tematik",
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_PRODI',
    dayOfWeek: 'Selasa',
    dayIndex: 2,
    startTime: '08:00',
    endTime: '10:30',
    durationMinutes: 150,
    roomId: 'rm-a203',
    roomName: 'Ruang Asy-Syafii (Tarbiyah 203)',
    roomCode: 'A-203',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 'Lantai 2',
    roomType: 'TEORI',
    lecturerId: 'usr-dsn-02',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    lecturerEmail: 'siti.aminah@stai-alittihad.ac.id',
    lecturerPhone: '+62 813-8899-7711',
    deliveryMode: 'TATAP_MUKA',
    status: 'AKAN_DATANG',
    nextTopicTitle: "Asbabun Nuzul dan Kaidah Makkiyah Madaniyah",
    nextMeetingNumber: 3,
    activeAssignmentCount: 1,
    activeQuizCount: 0,
    enrolledCount: 36,
    syllabusUrl: '/docs/rps/PAI-204-RPS.pdf'
  },
  {
    id: 'sch-std-03',
    classId: 'cls-pai205-a',
    courseCode: 'PAI-205',
    courseName: 'Ulumul Hadits & Studi Sanad Matan',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_PRODI',
    dayOfWeek: 'Rabu',
    dayIndex: 3,
    startTime: '10:45',
    endTime: '13:15',
    durationMinutes: 150,
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 'Lantai 2',
    roomType: 'TEORI',
    lecturerId: 'usr-dsn-03',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    lecturerEmail: 'ahmad.fauzi@stai-alittihad.ac.id',
    lecturerPhone: '+62 812-9988-6655',
    deliveryMode: 'HYBRID',
    onlineMeetingUrl: 'https://meet.staialittihad.ac.id/salam-pai205a',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Klasifikasi Hadits Shahih, Hasan, dan Dhaif',
    nextMeetingNumber: 2,
    activeAssignmentCount: 0,
    activeQuizCount: 1,
    enrolledCount: 35,
    syllabusUrl: '/docs/rps/PAI-205-RPS.pdf'
  },
  {
    id: 'sch-std-04',
    classId: 'cls-pai302-a',
    courseCode: 'PAI-302',
    courseName: 'Pengembangan Kurikulum PAI Berbasis Karakter',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_PRODI',
    dayOfWeek: 'Kamis',
    dayIndex: 4,
    startTime: '08:00',
    endTime: '10:30',
    durationMinutes: 150,
    roomId: 'rm-b102',
    roomName: 'Smart Classroom Ibnu Sina',
    roomCode: 'B-102',
    building: 'Gedung B (Pusat Pembelajaran Digital)',
    floor: 'Lantai 1',
    roomType: 'SMART_CLASS',
    lecturerId: 'usr-dsn-01',
    lecturerName: 'Dr. H. M. Ridwan, M.Ag',
    lecturerNidn: '2112087501',
    lecturerEmail: 'm.ridwan@stai-alittihad.ac.id',
    lecturerPhone: '+62 812-3456-7801',
    deliveryMode: 'HYBRID',
    onlineMeetingUrl: 'https://meet.staialittihad.ac.id/salam-pai302a',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Analisis Capaian Pembelajaran Lulusan (CPL) Kurikulum Merdeka',
    nextMeetingNumber: 3,
    activeAssignmentCount: 1,
    activeQuizCount: 0,
    enrolledCount: 38,
    syllabusUrl: '/docs/rps/PAI-302-RPS.pdf'
  },
  {
    id: 'sch-std-05',
    classId: 'cls-pai305-a',
    courseCode: 'PAI-305',
    courseName: 'Metode Penelitian Pendidikan Agama Islam',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_PRODI',
    dayOfWeek: 'Kamis',
    dayIndex: 4,
    startTime: '13:00',
    endTime: '15:30',
    durationMinutes: 150,
    roomId: 'rm-a202',
    roomName: 'Ruang Ibnu Khaldun (Tarbiyah 202)',
    roomCode: 'A-202',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 'Lantai 2',
    roomType: 'TEORI',
    lecturerId: 'usr-dsn-03',
    lecturerName: 'Dr. H. Ahmad Fauzi, M.Pd.I',
    lecturerNidn: '2105088201',
    lecturerEmail: 'ahmad.fauzi@stai-alittihad.ac.id',
    lecturerPhone: '+62 812-9988-6655',
    deliveryMode: 'TATAP_MUKA',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Perumusan Masalah dan Studi Kepustakaan Kualitatif',
    nextMeetingNumber: 2,
    activeAssignmentCount: 0,
    activeQuizCount: 0,
    enrolledCount: 34,
    syllabusUrl: '/docs/rps/PAI-305-RPS.pdf'
  },
  {
    id: 'sch-std-06',
    classId: 'cls-ins101-a',
    courseCode: 'INS-101',
    courseName: 'Bahasa Arab Akademik & Turats',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_INSTITUSI',
    dayOfWeek: 'Jumat',
    dayIndex: 5,
    startTime: '07:30',
    endTime: '10:00',
    durationMinutes: 150,
    roomId: 'rm-a201',
    roomName: 'Ruang Al-Ghazali (Tarbiyah 201)',
    roomCode: 'A-201',
    building: 'Gedung A (Kulliyyah Tarbiyah)',
    floor: 'Lantai 2',
    roomType: 'TEORI',
    lecturerId: 'usr-dsn-04',
    lecturerName: 'Ust. Muhammad Ilyas, M.Hum',
    lecturerNidn: '2120018603',
    lecturerEmail: 'm.ilyas@stai-alittihad.ac.id',
    lecturerPhone: '+62 856-1122-3344',
    deliveryMode: 'TATAP_MUKA',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Tarkib Nahwu Lanjutan: Isim Fa’il & Maf’ul dalam Teks Fiqih',
    nextMeetingNumber: 3,
    activeAssignmentCount: 1,
    activeQuizCount: 1,
    enrolledCount: 40,
    syllabusUrl: '/docs/rps/INS-101-RPS.pdf'
  },
  {
    id: 'sch-std-07',
    classId: 'cls-ins102-a',
    courseCode: 'INS-102',
    courseName: 'Bahasa Inggris Akademik & Islamic Studies',
    className: 'Kelas A',
    credits: 3,
    courseType: 'WAJIB_INSTITUSI',
    dayOfWeek: 'Jumat',
    dayIndex: 5,
    startTime: '13:30',
    endTime: '16:00',
    durationMinutes: 150,
    roomId: 'rm-b204',
    roomName: 'Laboratorium Bahasa & Multimedia',
    roomCode: 'B-204',
    building: 'Gedung B (Pusat Pembelajaran Digital)',
    floor: 'Lantai 2',
    roomType: 'LABORATORIUM',
    lecturerId: 'usr-dsn-02',
    lecturerName: 'Dra. Hj. Siti Aminah, M.Pd.I',
    lecturerNidn: '2115047802',
    lecturerEmail: 'siti.aminah@stai-alittihad.ac.id',
    lecturerPhone: '+62 813-8899-7711',
    deliveryMode: 'HYBRID',
    onlineMeetingUrl: 'https://meet.staialittihad.ac.id/salam-ins102a',
    status: 'AKAN_DATANG',
    nextTopicTitle: 'Reading Academic Texts on Islamic Education Philosophy',
    nextMeetingNumber: 2,
    activeAssignmentCount: 0,
    activeQuizCount: 0,
    enrolledCount: 39,
    syllabusUrl: '/docs/rps/INS-102-RPS.pdf'
  }
];

export class StudentScheduleService {
  private getDayNameId(dayIndex: number): 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu' {
    const days: ('Minggu' | 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
      'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];
    return days[dayIndex] || 'Senin';
  }

  /**
   * Menghitung status dinamis berdasarkan jam & hari sekarang
   */
  private computeRealtimeStatus(schedule: StudentScheduleItem, now = new Date()): ClassScheduleStatus {
    const currentDayName = this.getDayNameId(now.getDay());
    if (schedule.dayOfWeek !== currentDayName) {
      return 'AKAN_DATANG';
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return 'SEDANG_BERLANGSUNG';
    }
    if (currentMinutes > endMinutes) {
      return 'SELESAI';
    }
    return 'AKAN_DATANG';
  }

  /**
   * Mengambil seluruh jadwal mahasiswa dengan status realtime
   */
  getStudentSchedules(_studentId?: string): StudentScheduleItem[] {
    const now = new Date();
    return STUDENT_SCHEDULES_MOCK.map((item) => ({
      ...item,
      status: this.computeRealtimeStatus(item, now)
    }));
  }

  /**
   * Mengambil ringkasan eksekutif jadwal mahasiswa
   */
  getScheduleSummary(studentId = 'usr-mhs-01'): StudentScheduleSummary {
    const schedules = this.getStudentSchedules(studentId);
    const now = new Date();
    const currentDayName = this.getDayNameId(now.getDay());
    const todaySchedules = schedules.filter((s) => s.dayOfWeek === currentDayName);

    const totalCredits = schedules.reduce((sum, item) => sum + item.credits, 0);

    // Cari jadwal terdekat berikutnya
    let upcomingSchedule: StudentScheduleItem | undefined;
    let timeUntilUpcoming: string | undefined;

    const todayUpcoming = todaySchedules.find((s) => s.status === 'AKAN_DATANG' || s.status === 'SEDANG_BERLANGSUNG');
    if (todayUpcoming) {
      upcomingSchedule = todayUpcoming;
      if (todayUpcoming.status === 'SEDANG_BERLANGSUNG') {
        timeUntilUpcoming = 'Sedang Berlangsung Sekarang';
      } else {
        const [startH, startM] = todayUpcoming.startTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const diff = startMinutes - currentMinutes;
        if (diff > 0) {
          const h = Math.floor(diff / 60);
          const m = diff % 60;
          timeUntilUpcoming = h > 0 ? `${h} jam ${m} menit lagi` : `${m} menit lagi`;
        }
      }
    } else {
      // Cari jadwal hari-hari berikutnya
      const nextDays = schedules.filter((s) => s.dayIndex > now.getDay());
      if (nextDays.length > 0) {
        upcomingSchedule = nextDays[0];
        timeUntilUpcoming = `Hari ${upcomingSchedule.dayOfWeek}, pukul ${upcomingSchedule.startTime} WIB`;
      } else {
        upcomingSchedule = schedules[0];
        timeUntilUpcoming = `Hari ${upcomingSchedule.dayOfWeek} depan, pukul ${upcomingSchedule.startTime} WIB`;
      }
    }

    return {
      studentId,
      studentName: 'Ahmad Fauzi Rahman',
      studentNim: '21.01.0042',
      studyProgram: 'Pendidikan Agama Islam (PAI)',
      studyProgramCode: 'PAI',
      academicPeriodName: 'Semester Ganjil 2026/2027',
      academicYear: '2026/2027',
      semesterNumber: 5,
      academicAdvisorName: 'Dr. H. M. Ridwan, M.Ag',
      academicAdvisorNidn: '2112087501',
      totalCredits,
      totalCourses: schedules.length,
      todaySchedules,
      upcomingSchedule,
      timeUntilUpcoming
    };
  }

  /**
   * Mengambil matriks jadwal mingguan (Senin - Sabtu)
   */
  getWeeklyTimetable(studentId = 'usr-mhs-01'): StudentTimetableDay[] {
    const schedules = this.getStudentSchedules(studentId);
    const now = new Date();
    const currentDayIndex = now.getDay(); // 0: Min, 1: Sen, 2: Sel, dst.

    const days: ('Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu')[] = [
      'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    ];

    return days.map((dayName, idx) => {
      const dayIdx = idx + 1;
      const daySchedules = schedules
        .filter((s) => s.dayOfWeek === dayName)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

      return {
        dayName,
        dayIndex: dayIdx,
        isToday: currentDayIndex === dayIdx,
        totalCredits: daySchedules.reduce((sum, s) => sum + s.credits, 0),
        schedules: daySchedules
      };
    });
  }

  /**
   * Mengambil rincian 1 jadwal berdasarkan ID
   */
  getScheduleById(scheduleId: string): StudentScheduleItem | undefined {
    return this.getStudentSchedules().find((s) => s.id === scheduleId);
  }

  /**
   * Mengekspor kalender dalam format standar iCalendar (.ics)
   */
  generateIcsCalendar(studentId = 'usr-mhs-01'): string {
    const schedules = this.getStudentSchedules(studentId);
    const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const dayToIcsFreq: Record<string, string> = {
      'Senin': 'MO',
      'Selasa': 'TU',
      'Rabu': 'WE',
      'Kamis': 'TH',
      'Jumat': 'FR',
      'Sabtu': 'SA'
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SALAM LMS//Jadwal Kuliah STAI AL-ITTIHAD//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Jadwal Kuliah SALAM - STAI AL-ITTIHAD',
      'X-WR-TIMEZONE:Asia/Jakarta'
    ];

    schedules.forEach((sch) => {
      const cleanStart = sch.startTime.replace(':', '') + '00';
      const cleanEnd = sch.endTime.replace(':', '') + '00';
      const byDay = dayToIcsFreq[sch.dayOfWeek] || 'MO';

      icsContent.push(
        'BEGIN:VEVENT',
        `UID:${sch.id}-salam-staialittihad`,
        `DTSTAMP:${nowStr}`,
        `SUMMARY:[${sch.courseCode}] ${sch.courseName} (${sch.className})`,
        `DESCRIPTION:Mata Kuliah: ${sch.courseName}\\nSKS: ${sch.credits}\\nDosen Pengampu: ${sch.lecturerName}\\nRuang: ${sch.roomName} (${sch.building})\\nMode: ${sch.deliveryMode}\\nTopik Sesi: ${sch.nextTopicTitle}`,
        `LOCATION:${sch.roomName}\\, ${sch.building}\\, STAI AL-ITTIHAD CIANJUR`,
        `RRULE:FREQ=WEEKLY;BYDAY=${byDay};UNTIL=20270131T235959Z`,
        `DTSTART;TZID=Asia/Jakarta:20260901T${cleanStart}`,
        `DTEND;TZID=Asia/Jakarta:20260901T${cleanEnd}`,
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:Pengingat Kuliah SALAM STAI AL-ITTIHAD',
        'TRIGGER:-PT15M',
        'END:VALARM',
        'END:VEVENT'
      );
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  }

  /**
   * Mengunduh file .ics kalender
   */
  downloadIcsFile(studentId = 'usr-mhs-01'): void {
    const icsData = this.generateIcsCalendar(studentId);
    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `Jadwal_Kuliah_SALAM_${studentId}_2026_2027.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const studentScheduleService = new StudentScheduleService();
