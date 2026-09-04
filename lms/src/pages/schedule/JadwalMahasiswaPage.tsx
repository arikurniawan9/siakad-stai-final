import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Download, 
  Printer, 
  Video, 
  ArrowRight, 
  ExternalLink,
  Layers,
  HelpCircle,
  ClipboardList,
  Sparkles,
  Info,
  QrCode
} from 'lucide-react';
import { ExportDropdown, ExportConfig } from '../../components/export-import';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  StudentScheduleItem, 
  StudentScheduleSummary, 
  StudentTimetableDay 
} from '../../types/studentSchedule';
import { studentScheduleService, STUDENT_SCHEDULES_MOCK } from '../../services/studentScheduleService';
import { KAMUS_UI } from '../../constants/dictionary';

export interface JadwalMahasiswaPageProps {
  onNavigateToClass?: (classId: string) => void;
  onNavigate?: (path: string) => void;
}

type ScheduleTabView = 'weekly_matrix' | 'agenda_list' | 'sync_export';

export const JadwalMahasiswaPage: React.FC<JadwalMahasiswaPageProps> = ({ 
  onNavigateToClass,
  onNavigate 
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ScheduleTabView>('weekly_matrix');
  const [summary, setSummary] = useState<StudentScheduleSummary | null>(null);
  const [timetableDays, setTimetableDays] = useState<StudentTimetableDay[]>([]);
  const [allSchedules, setAllSchedules] = useState<StudentScheduleItem[]>([]);
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('SEMUA');
  
  // Modal states
  const [selectedScheduleDetail, setSelectedScheduleDetail] = useState<StudentScheduleItem | null>(null);
  const [printPreviewModal, setPrintPreviewModal] = useState<boolean>(false);

  // Load data
  useEffect(() => {
    const studentId = user?.id || 'usr-mhs-01';
    const sumData = studentScheduleService.getScheduleSummary(studentId);
    const tableData = studentScheduleService.getWeeklyTimetable(studentId);
    const rawSchedules = studentScheduleService.getStudentSchedules(studentId);
    setSummary(sumData);
    setTimetableDays(tableData);
    setAllSchedules(rawSchedules);
  }, [user]);

  // Filtered timetable for mobile & selector
  const filteredDays = useMemo(() => {
    if (selectedDayFilter === 'SEMUA') {
      return timetableDays;
    }
    if (selectedDayFilter === 'HARI_INI') {
      return timetableDays.filter((d) => d.isToday);
    }
    return timetableDays.filter((d) => d.dayName === selectedDayFilter);
  }, [timetableDays, selectedDayFilter]);

  const handleDownloadIcs = () => {
    try {
      studentScheduleService.downloadIcsFile(user?.id || 'usr-mhs-01');
      toast.success('Kalender Diekspor', 'Berkas kalender .ics berhasil diunduh. Anda dapat membukanya di Google Calendar, Apple Calendar, atau Outlook.');
    } catch {
      toast.danger('Gagal Ekspor', 'Terjadi kendala saat membuat berkas kalender.');
    }
  };

  const handleOpenLmsClass = (classId: string) => {
    if (onNavigateToClass) {
      onNavigateToClass(classId);
    } else if (onNavigate) {
      onNavigate('/mata-kuliah');
    }
  };

  const handlePrintSchedule = () => {
    window.print();
  };

  const getDeliveryBadge = (mode: string) => {
    switch (mode) {
      case 'HYBRID':
        return <Badge variant="primary">Hybrid (Kelas &amp; Daring)</Badge>;
      case 'DARING':
        return <Badge variant="info">Daring SALAM Meet</Badge>;
      default:
        return <Badge variant="default">Tatap Muka Luring</Badge>;
    }
  };

  // Konfigurasi Ekspor Jadwal Kuliah Mahasiswa
  const scheduleExportConfig: ExportConfig<StudentScheduleItem> = useMemo(() => ({
    filename: `SALAM_Jadwal_Kuliah_${user?.identityNumber || 'Mahasiswa'}`,
    title: 'JADWAL KULIAH MAHASISWA — SEMESTER GANJIL 2026/2027',
    subtitle: `Mahasiswa: ${user?.name || 'Mahasiswa'} (${user?.identityNumber || '21.01.0042'}) — STAI AL-ITTIHAD CIANJUR`,
    data: allSchedules,
    columns: [
      { key: 'dayOfWeek', header: 'Hari', width: '90px', align: 'center' },
      { 
        key: 'startTime', 
        header: 'Waktu Kuliah (WIB)', 
        width: '140px', 
        align: 'center',
        format: (_val, row) => `${row.startTime} - ${row.endTime}`
      },
      { key: 'courseCode', header: 'Kode MK', width: '90px', align: 'center' },
      { key: 'courseName', header: 'Nama Mata Kuliah', width: '220px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'className', header: 'Kelas', width: '70px', align: 'center' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '200px' },
      { 
        key: 'roomName', 
        header: 'Ruangan & Gedung', 
        width: '160px',
        format: (_val, row) => `${row.roomName} (${row.building})`
      },
      { key: 'deliveryMode', header: 'Metode Pembelajaran', width: '130px', align: 'center' }
    ],
    metadata: {
      'Nama Mahasiswa': user?.name || '-',
      'NIM': user?.identityNumber || '-',
      'Total SKS': `${summary?.totalCredits || 21} SKS`,
      'Total Mata Kuliah': `${allSchedules.length} MK`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [allSchedules, user, summary]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Semester Ganjil 2026/2027</Badge>
            <Badge variant="default">Tahun Akademik 2026/2027</Badge>
            <Badge variant="success">Status: Aktif Kuliah</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            {KAMUS_UI.JADWAL_KULIAH} Mahasiswa
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Jadwal waktu, alokasi ruangan, dosen pengampu, dan akses pembelajaran LMS STAI AL-ITTIHAD.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown<StudentScheduleItem>
            config={scheduleExportConfig}
            buttonLabel="Ekspor Jadwal"
          />

          <Button 
            variant="secondary" 
            size="sm" 
            icon={Download}
            onClick={handleDownloadIcs}
            title="Ekspor Jadwal ke Google Calendar / Apple Calendar"
          >
            Kalender (.ics)
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            icon={Printer}
            onClick={() => setPrintPreviewModal(true)}
            title="Cetak Lembar Jadwal Kuliah Resmi Mahasiswa"
          >
            Cetak Jadwal
          </Button>
        </div>
      </div>

      {/* 2. Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total SKS */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  BEBAN STUDI SEMESTER
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summary?.totalCredits || 21}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    SKS
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <BookOpen size={13} />
                  <span>{summary?.totalCourses || 7} Mata Kuliah Terdaftar</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Layers size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Kuliah Hari Ini */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  JADWAL HARI INI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summary?.todaySchedules.length || 0}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Sesi Kuliah
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <CalendarIcon size={13} />
                  <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <CalendarIcon size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Kuliah Berikutnya */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  KULIAH BERIKUTNYA
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {summary?.upcomingSchedule?.courseName || 'Tidak Ada Jadwal'}
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-warning-dark)', marginTop: '6px' }}>
                  <Clock size={13} />
                  <span>{summary?.timeUntilUpcoming || 'Selesai untuk hari ini'}</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-warning-surface)', 
                  color: 'var(--color-warning-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Clock size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Dosen Pembimbing Akademik */}
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  DOSEN PEMBIMBING AKADEMIK
                </div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {summary?.academicAdvisorName || 'Dr. H. M. Ridwan, M.Ag'}
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <User size={13} />
                  <span>NIDN: {summary?.academicAdvisorNidn || '2112087501'}</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <User size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'weekly_matrix' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('weekly_matrix')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <CalendarIcon size={16} />
          <span>Matriks Jadwal Mingguan (Timetable)</span>
        </button>

        <button
          className={`btn ${activeTab === 'agenda_list' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('agenda_list')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <Clock size={16} />
          <span>Agenda &amp; Rincian Perkuliahan ({summary?.totalCourses || 7} MK)</span>
        </button>

        <button
          className={`btn ${activeTab === 'sync_export' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('sync_export')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none', whiteSpace: 'nowrap' }}
        >
          <Download size={16} />
          <span>Sinkronisasi Kalender &amp; Panduan Ekspor</span>
        </button>
      </div>

      {/* 4. Tab 1: Matriks Mingguan (Timetable Grid View) */}
      {activeTab === 'weekly_matrix' && (
        <div className="flex flex-col gap-4">
          {/* Day Filter Chips (Useful for Mobile/Tablet) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
              Filter Hari:
            </span>
            {['SEMUA', 'HARI_INI', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDayFilter(day)}
                className={`btn btn-sm ${selectedDayFilter === day ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', whiteSpace: 'nowrap', minHeight: '30px', padding: '3px 10px', fontSize: 'var(--text-xs)' }}
              >
                {day === 'SEMUA' ? 'Semua Hari (Senin–Sabtu)' : day === 'HARI_INI' ? '★ Hari Ini' : day}
              </button>
            ))}
          </div>

          {/* Timetable Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDays.map((dayItem) => (
              <Card 
                key={dayItem.dayName}
                style={{
                  borderTop: dayItem.isToday ? '4px solid var(--color-primary-600)' : '1px solid var(--border-default)',
                  backgroundColor: dayItem.isToday ? '#fcfdfd' : 'var(--bg-surface)'
                }}
              >
                <CardHeader style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: dayItem.isToday ? 'var(--color-primary-50)' : 'var(--color-slate-50)' }}>
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <strong style={{ fontSize: 'var(--text-base)', color: dayItem.isToday ? 'var(--color-primary-900)' : 'var(--text-primary)' }}>
                        {dayItem.dayName}
                      </strong>
                      {dayItem.isToday && (
                        <Badge variant="primary" style={{ fontSize: '0.625rem' }}>
                          Hari Ini
                        </Badge>
                      )}
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      {dayItem.schedules.length} MK • {dayItem.totalCredits} SKS
                    </span>
                  </div>
                </CardHeader>

                <CardBody style={{ padding: 'var(--space-3)' }} className="flex flex-col gap-3">
                  {dayItem.schedules.length === 0 ? (
                    <div style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                      Tidak ada jadwal perkuliahan pada hari ini.
                    </div>
                  ) : (
                    dayItem.schedules.map((sch) => (
                      <div 
                        key={sch.id}
                        style={{
                          padding: 'var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          border: sch.status === 'SEDANG_BERLANGSUNG' ? '1.5px solid var(--color-primary-500)' : '1px solid var(--border-default)',
                          backgroundColor: sch.status === 'SEDANG_BERLANGSUNG' ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                          boxShadow: 'var(--shadow-xs)'
                        }}
                        className="flex flex-col gap-2"
                      >
                        {/* Time & Delivery Mode */}
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <Badge variant="primary" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
                            <Clock size={11} style={{ marginRight: '3px' }} />
                            {sch.startTime} - {sch.endTime} WIB
                          </Badge>
                          {getDeliveryBadge(sch.deliveryMode)}
                        </div>

                        {/* Course Name */}
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
                            {sch.courseCode} ({sch.className}) • {sch.credits} SKS
                          </div>
                          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.3, display: 'block', marginTop: '1px' }}>
                            {sch.courseName}
                          </strong>
                        </div>

                        {/* Room & Building */}
                        <div className="flex items-center gap-1 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                          <MapPin size={13} color="var(--color-primary-700)" style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sch.roomName} ({sch.roomCode})
                          </span>
                        </div>

                        {/* Lecturer */}
                        <div className="flex items-center gap-1 text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                          <User size={13} style={{ flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sch.lecturerName}
                          </span>
                        </div>

                        {/* Tasks / Quiz Badges if active */}
                        {(sch.activeAssignmentCount > 0 || sch.activeQuizCount > 0) && (
                          <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: '2px' }}>
                            {sch.activeAssignmentCount > 0 && (
                              <span style={{ fontSize: '0.625rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <ClipboardList size={10} /> {sch.activeAssignmentCount} Tugas Aktif
                              </span>
                            )}
                            {sch.activeQuizCount > 0 && (
                              <span style={{ fontSize: '0.625rem', backgroundColor: '#ecfdf5', color: '#065f46', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                <HelpCircle size={10} /> {sch.activeQuizCount} Kuis Aktif
                              </span>
                            )}
                          </div>
                        )}

                        {/* Card Action Buttons */}
                        <div className="flex items-center justify-between gap-2" style={{ marginTop: 'var(--space-1)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedScheduleDetail(sch)}
                            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', fontWeight: 'bold', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Info size={13} /> Rincian Ruang
                          </button>

                          <Button
                            variant="primary"
                            size="sm"
                            icon={ArrowRight}
                            onClick={() => handleOpenLmsClass(sch.classId)}
                            style={{ minHeight: '28px', padding: '3px 8px', fontSize: '0.6875rem' }}
                          >
                            Masuk Kelas LMS
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 5. Tab 2: Agenda & Rincian Perkuliahan (List View) */}
      {activeTab === 'agenda_list' && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Menampilkan seluruh mata kuliah terdaftar pada Semester Ganjil 2026/2027
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {allSchedules.map((sch) => (
              <Card key={sch.id}>
                <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Left: Day & Time Highlight */}
                    <div className="flex items-start gap-4">
                      <div 
                        style={{ 
                          minWidth: '80px', 
                          padding: 'var(--space-2) var(--space-3)', 
                          backgroundColor: 'var(--color-primary-50)', 
                          borderRadius: 'var(--radius-md)', 
                          textAlign: 'center',
                          border: '1px solid var(--color-primary-200)'
                        }}
                      >
                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-800)', textTransform: 'uppercase' }}>
                          {sch.dayOfWeek}
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-primary-950)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                          {sch.startTime}
                        </div>
                        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                          s.d. {sch.endTime}
                        </div>
                      </div>

                      {/* Course Details */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                          <Badge variant="primary">{sch.courseCode}</Badge>
                          <Badge variant="default">{sch.credits} SKS</Badge>
                          <Badge variant="default">{sch.className}</Badge>
                          {getDeliveryBadge(sch.deliveryMode)}
                        </div>

                        <h3 style={{ fontSize: 'var(--text-lg)', color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {sch.courseName}
                        </h3>

                        <div className="flex items-center gap-4 flex-wrap text-muted" style={{ fontSize: 'var(--text-xs)' }}>
                          <span className="flex items-center gap-1">
                            <User size={13} color="var(--color-primary-700)" />
                            <strong>{sch.lecturerName}</strong> (NIDN: {sch.lecturerNidn})
                          </span>

                          <span className="flex items-center gap-1">
                            <MapPin size={13} color="var(--color-primary-700)" />
                            {sch.roomName} • {sch.building}
                          </span>
                        </div>

                        {/* Next Meeting Topic */}
                        <div 
                          style={{ 
                            marginTop: 'var(--space-3)', 
                            padding: 'var(--space-2) var(--space-3)', 
                            backgroundColor: 'var(--color-slate-50)', 
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            fontSize: 'var(--text-xs)'
                          }}
                        >
                          <span style={{ color: 'var(--color-primary-800)', fontWeight: 'bold' }}>
                            Pertemuan ke-{sch.nextMeetingNumber}:
                          </span>{' '}
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {sch.nextTopicTitle}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 w-full lg:w-auto" style={{ minWidth: '180px' }}>
                      <Button
                        variant="primary"
                        size="sm"
                        icon={ArrowRight}
                        onClick={() => handleOpenLmsClass(sch.classId)}
                        className="w-full"
                      >
                        Buka Ruang Kuliah
                      </Button>

                      {sch.onlineMeetingUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Video}
                          onClick={() => window.open(sch.onlineMeetingUrl, '_blank')}
                          className="w-full"
                        >
                          SALAM Meet Daring
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Info}
                        onClick={() => setSelectedScheduleDetail(sch)}
                        className="w-full"
                      >
                        Rincian Ruangan
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 6. Tab 3: Sinkronisasi Kalender & Panduan Ekspor */}
      {activeTab === 'sync_export' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Ekspor Berkas .ICS */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Ekspor Kalender Kuliah Standar (.ICS)</CardTitle>
                <CardSubtitle>Sinkronkan seluruh jadwal kuliah Anda ke aplikasi kalender di HP / Laptop</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Berkas standar <code>.ics</code> (iCalendar) berisi seluruh waktu perkuliahan mingguan Anda selama Semester Ganjil 2026/2027 lengkap dengan nama dosen, alokasi ruangan, mode hybrid, dan notifikasi pengingat 15 menit sebelum kuliah dimulai.
              </p>

              <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-primary-900)', fontWeight: 'bold', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                  <Sparkles size={16} /> Fitur Notifikasi Otomatis
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', margin: 0 }}>
                  Kalender akan otomatis berulang setiap minggu (Senin–Jumat) hingga akhir masa perkuliahan semester aktif (31 Januari 2027).
                </p>
              </div>

              <Button 
                variant="primary" 
                size="md" 
                icon={Download}
                onClick={handleDownloadIcs}
                className="w-full"
              >
                Unduh Berkas Kalender (.ics)
              </Button>
            </CardBody>
          </Card>

          {/* Card 2: Panduan Impor */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Panduan Penggunaan di Ponsel &amp; Laptop</CardTitle>
                <CardSubtitle>Langkah mudah menghubungkan jadwal kuliah ke perangkat Anda</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>1. Google Calendar (Android &amp; Web):</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Buka calendar.google.com &gt; Klik tanda (+) di sebelah "Kalender Lain" &gt; Pilih "Impor" &gt; Unggah file <code>.ics</code> yang telah diunduh.
                </p>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>2. Apple Calendar (iPhone / iPad / Mac):</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Klik / ketuk file <code>.ics</code> pada perangkat Apple Anda, lalu pilih "Tambahkan Semua Acara" ke Kalender Kuliah.
                </p>
              </div>

              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>3. Microsoft Outlook:</strong>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                  Buka Outlook &gt; File &gt; Buka &amp; Ekspor &gt; Buka Kalender (.ics) untuk menggabungkan ke jadwal harian Anda.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: RINCIAN RUANGAN & RUTE KAMPUS
          ========================================================================= */}
      {selectedScheduleDetail && (
        <Modal
          isOpen={Boolean(selectedScheduleDetail)}
          onClose={() => setSelectedScheduleDetail(null)}
          title={`Rincian Ruangan: ${selectedScheduleDetail.courseName}`}
          maxWidth="640px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setSelectedScheduleDetail(null)}
              >
                Tutup
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={ArrowRight}
                onClick={() => {
                  const cId = selectedScheduleDetail.classId;
                  setSelectedScheduleDetail(null);
                  handleOpenLmsClass(cId);
                }}
              >
                Buka Kelas Pembelajaran
              </Button>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {/* Room Location Header */}
            <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
              <div className="flex items-center gap-2">
                <MapPin size={20} color="var(--color-primary-800)" />
                <div>
                  <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-950)' }}>
                    {selectedScheduleDetail.roomName} ({selectedScheduleDetail.roomCode})
                  </strong>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)' }}>
                    {selectedScheduleDetail.building} • {selectedScheduleDetail.floor}
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hari &amp; Waktu:</span>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedScheduleDetail.dayOfWeek}, {selectedScheduleDetail.startTime} - {selectedScheduleDetail.endTime} WIB
                </div>
              </div>

              <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mode Perkuliahan:</span>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedScheduleDetail.deliveryMode}
                </div>
              </div>

              <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Dosen Pengampu:</span>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedScheduleDetail.lecturerName}
                </div>
              </div>

              <div style={{ padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kontak Dosen:</span>
                <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedScheduleDetail.lecturerEmail || '-'}
                </div>
              </div>
            </div>

            {/* Online URL if hybrid/daring */}
            {selectedScheduleDetail.onlineMeetingUrl && (
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-info-border)' }}>
                <div className="flex items-center gap-2" style={{ color: 'var(--color-info-dark)', fontWeight: 'bold', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <Video size={14} /> Tautan Ruang Kelas Virtual SALAM Meet:
                </div>
                <a 
                  href={selectedScheduleDetail.onlineMeetingUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', wordBreak: 'break-all', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {selectedScheduleDetail.onlineMeetingUrl} <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Next Meeting Topic Preview */}
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '2px' }}>
                Silabus &amp; Topik Sesi Perkuliahan:
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                Pertemuan ke-{selectedScheduleDetail.nextMeetingNumber}: <strong>{selectedScheduleDetail.nextTopicTitle}</strong>
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================================
          MODAL 2: CETAK LEMBAR JADWAL KULIAH RESMI
          ========================================================================= */}
      {printPreviewModal && (
        <Modal
          isOpen={printPreviewModal}
          onClose={() => setPrintPreviewModal(false)}
          title="Pratinjau Lembar Jadwal Kuliah Resmi Mahasiswa"
          maxWidth="840px"
          footer={
            <div className="flex justify-between items-center w-full">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setPrintPreviewModal(false)}
              >
                Tutup
              </Button>
              <Button 
                variant="primary" 
                size="sm" 
                icon={Printer}
                onClick={handlePrintSchedule}
              >
                Cetak Sekarang (Print / PDF)
              </Button>
            </div>
          }
        >
          {/* Printable Official Schedule Document */}
          <div 
            style={{ 
              backgroundColor: 'white', 
              padding: 'var(--space-6)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-default)',
              fontFamily: 'serif' 
            }}
          >
            {/* Kop Surat STAI AL-ITTIHAD */}
            <div style={{ textAlign: 'center', borderBottom: '3px double #0f172a', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR
              </div>
              <div style={{ fontSize: '0.75rem', color: '#475569' }}>
                Jl. Raya Bandung KM. 03, Bojong, Karangtengah, Cianjur, Jawa Barat 43281
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                Website: https://stai-alittihad.ac.id • Email: akademik@stai-alittihad.ac.id
              </div>
            </div>

            {/* Document Title */}
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textDecoration: 'underline' }}>
                JADWAL PERKULIAHAN MAHASISWA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#334155' }}>
                SEMESTER GANJIL TAHUN AKADEMIK 2026/2027
              </div>
            </div>

            {/* Student Info Table */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', marginBottom: 'var(--space-4)' }}>
              <div>
                <div><strong>Nama Mahasiswa:</strong> Ahmad Fauzi Rahman</div>
                <div><strong>NIM:</strong> 21.01.0042</div>
                <div><strong>Program Studi:</strong> Pendidikan Agama Islam (PAI)</div>
              </div>
              <div>
                <div><strong>Jenjang:</strong> Strata Satu (S-1)</div>
                <div><strong>Semester / Kelas:</strong> V (Lima) / Kelas A</div>
                <div><strong>Dosen Wali (PA):</strong> Dr. H. M. Ridwan, M.Ag</div>
              </div>
            </div>

            {/* Table of Schedules */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.6875rem', marginBottom: 'var(--space-6)' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #0f172a', borderTop: '1px solid #0f172a' }}>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>No</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Hari &amp; Jam</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Kode &amp; Mata Kuliah</th>
                  <th style={{ padding: '6px 8px', textAlign: 'center' }}>SKS</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Ruangan</th>
                  <th style={{ padding: '6px 8px', textAlign: 'left' }}>Dosen Pengampu</th>
                </tr>
              </thead>
              <tbody>
                {STUDENT_SCHEDULES_MOCK.map((s, idx) => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{idx + 1}</td>
                    <td style={{ padding: '6px 8px' }}>
                      <strong>{s.dayOfWeek}</strong><br />{s.startTime} - {s.endTime}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <strong>{s.courseCode}</strong> - {s.courseName}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>{s.credits}</td>
                    <td style={{ padding: '6px 8px' }}>{s.roomName}</td>
                    <td style={{ padding: '6px 8px' }}>{s.lecturerName}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 'bold', borderTop: '2px solid #0f172a' }}>
                  <td colSpan={3} style={{ padding: '6px 8px', textAlign: 'right' }}>Total Beban Studi:</td>
                  <td style={{ padding: '6px 8px', textAlign: 'center' }}>21 SKS</td>
                  <td colSpan={2} style={{ padding: '6px 8px' }}>7 Mata Kuliah</td>
                </tr>
              </tfoot>
            </table>

            {/* Signature & Verification QR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: '0.6875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={48} color="#0f172a" />
                <div style={{ color: '#64748b' }}>
                  Dokumen ini diterbitkan secara sah oleh<br />
                  <strong>SALAM Academic System STAI AL-ITTIHAD</strong><br />
                  Verifikasi: salam.stai-alittihad.ac.id/verify/sch-21010042
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div>Cianjur, 17 Agustus 2026</div>
                <div>Ketua Program Studi PAI,</div>
                <div style={{ height: '40px' }} />
                <strong>Dr. H. M. Ridwan, M.Ag</strong>
                <div>NIDN: 2112087501</div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
