import React from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  TrendingUp, 
  HelpCircle,
  ClipboardList,
  Bell,
  Pin,
  CheckSquare,
  QrCode,
  ExternalLink,
  Layers,
  Users,
  UserCheck,
  RefreshCw,
  Settings,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { SIAKAD_PORTAL_URL } from '../constants/navigation';
import { UserAuthProfile } from '../types/auth';
import { progressService } from '../services/progressService';
import { calendarService } from '../services/calendarService';
import { assignmentService } from '../services/assignmentService';
import { quizService } from '../services/quizService';
import { announcementService } from '../services/announcementService';
import { academicService, AcademicClass } from '../services/academicService';
import { KAMUS_UI } from '../constants/dictionary';

export interface BerandaPageProps {
  user: UserAuthProfile;
  onNavigate: (path: string) => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({ user, onNavigate }) => {
  const isStudent = user.role === 'mahasiswa';
  const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa';
  const isAdmin = user.role === 'admin_akademik' || user.role === 'administrator_sistem' || user.role === 'kaprodi' || user.role === 'pimpinan';

  // Data Progres Mahasiswa
  const courseProgress = isStudent ? progressService.getCourseProgress('cls-pai301-a', user.id, user.identityNumber || '21.01.0042', user.name) : null;

  // Data Urgent Dosen
  const unsubmittedAssignments = assignmentService.getSubmissions().filter((s) => s.status !== 'SUDAH_DINILAI').length;
  const uncorrectedQuizzes = quizService.getAttempts().filter((a) => a.needsManualGrading).length;

  // Data Rombel Kelas Dosen (Tersinkronisasi Real Time dengan SIAKAD)
  const [lecturerClasses, setLecturerClasses] = React.useState<AcademicClass[]>(() => {
    const allClasses = academicService.getClasses();
    if (!isLecturer) return allClasses;
    return allClasses.filter((c) => academicService.isLecturerAssignedToClass(c, user));
  });

  React.useEffect(() => {
    if (isLecturer) {
      academicService.fetchClassesFromBackend().then((classes) => {
        const myClasses = classes.filter((c) => academicService.isLecturerAssignedToClass(c, user));
        setLecturerClasses(myClasses);
      });
    }
  }, [isLecturer, user]);

  // Batas Waktu Terdekat
  const upcomingEvents = calendarService.getUpcomingDeadlines().slice(0, 3);

  // Pengumuman Terbaru
  const latestAnnouncements = isStudent ? announcementService.getAnnouncements(user.id).slice(0, 2) : [];

  const getNextActivityLink = () => {
    if (!courseProgress?.nextActivity) return '/mata-kuliah';
    const act = courseProgress.nextActivity;
    if (act.type === 'VIDEO_INTERAKTIF') return `/video/${act.resourceId}`;
    if (act.type === 'KUIS') return `/kuis/${act.resourceId}`;
    if (act.type === 'TUGAS') return `/tugas/${act.resourceId}`;
    if (act.type === 'FORUM_DISKUSI') return `/forum/${act.resourceId}`;
    return `/mata-kuliah/${act.classId}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', color: 'white', border: 'none' }}>
        <CardBody className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-2)' }}>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  Semester Ganjil 2026/2027
                </Badge>
                <Badge variant="primary" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'transparent' }}>
                  {user.roleLabel || (isStudent ? 'Mahasiswa Aktif' : isLecturer ? 'Dosen Pengampu' : 'Administrator Sistem')}
                </Badge>
              </div>

              <h1 style={{ color: 'white', fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>
                Selamat Datang di SALAM LMS, {user.name}
              </h1>
              <p style={{ color: '#d1fae5', fontSize: 'var(--text-sm)' }}>
                Sistem Pembelajaran Daring STAI AL-ITTIHAD CIANJUR
              </p>
            </div>

            <div className="text-left md:text-right">
              <div style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0' }}>
                {isStudent ? 'NIM:' : isLecturer ? 'NIDN:' : 'ID Pengguna:'}
              </div>
              <strong style={{ fontSize: 'var(--text-lg)', color: 'white' }}>{user.identityNumber || user.id}</strong>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Banner Informasi Sinkronisasi LMS & SIAKAD (Khusus Akses Administrator) */}
      {isAdmin && (
        <div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-lg"
          style={{
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#1e3a8a'
          }}
        >
          <div className="flex items-start gap-3">
            <div style={{ padding: '6px', borderRadius: '8px', backgroundColor: '#dbeafe', color: '#1d4ed8', marginTop: '2px', flexShrink: 0 }}>
              <Layers size={20} />
            </div>
            <div>
              <strong style={{ fontSize: 'var(--text-sm)', display: 'block', color: '#1e3a8a' }}>
                Status Integrasi &amp; Sinkronisasi SIAKAD
              </strong>
              <p style={{ fontSize: 'var(--text-xs)', color: '#3b82f6', margin: '2px 0 0' }}>
                LMS terhubung dengan server induk SALAM SIAKAD untuk sinkronisasi master data mahasiswa, dosen, kurikulum, dan jadwal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => onNavigate('/admin/sync')}
              style={{ backgroundColor: 'white' }}
            >
              Sinkronisasi Data
            </Button>
            <a
              href={SIAKAD_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm inline-flex items-center gap-1.5"
              style={{
                backgroundColor: '#1d4ed8',
                color: 'white',
                fontWeight: 'var(--font-weight-semibold)',
                fontSize: 'var(--text-xs)',
                padding: '7px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none'
              }}
              title="Buka Sistem Informasi Akademik (SIAKAD)"
            >
              <ExternalLink size={14} />
              <span>Portal SIAKAD</span>
            </a>
          </div>
        </div>
      )}

      {/* =========================================================================
          MAHASISWA DASHBOARD
          ========================================================================= */}
      {isStudent && (
        <div className="flex flex-col gap-6">
          {/* Kartu Aktivitas Belajar Daring Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Mata Kuliah Daring Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid var(--color-primary-600)' }}
              onClick={() => onNavigate('/mata-kuliah')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mata Kuliah Daring</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                      5 Kelas Daring
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '4px' }}>
                      Materi &amp; RPS Sesi 1-16
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                    <BookOpen size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Tugas & Asesmen Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #f59e0b' }}
              onClick={() => onNavigate('/tugas')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tugas &amp; Asesmen</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#d97706', marginTop: '2px' }}>
                      2 Tugas Daring
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#b45309', marginTop: '4px' }}>
                      1 Mendekati Batas Waktu
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#d97706' }}>
                    <CheckSquare size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Kuis & CBT Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #8b5cf6' }}
              onClick={() => onNavigate('/kuis')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Kuis &amp; CBT Online</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                      1 Kuis Terjadwal
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#6d28d9', marginTop: '4px' }}>
                      Ujian Berbatas Waktu
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                    <HelpCircle size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Presensi Pertemuan Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #0284c7' }}
              onClick={() => onNavigate('/presensi')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Presensi Pertemuan</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                      100% Kehadiran
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#0284c7', marginTop: '4px' }}>
                      Scan QR &amp; Passcode Sesi
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                    <QrCode size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>


          {/* Top 2 Columns: Lanjutkan Belajar + Ringkasan Progres */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Lanjutkan Belajar Card */}
            <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
              <CardHeader>
                <div>
                  <CardTitle>{KAMUS_UI.LANJUTKAN_BELAJAR}</CardTitle>
                  <CardSubtitle>Langkah berikutnya yang perlu Anda selesaikan</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody>
                {courseProgress?.nextActivity ? (
                  <div className="flex flex-col gap-3">
                    <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '2px' }}>
                        <Badge variant="primary" style={{ fontSize: '0.6875rem' }}>
                          Pertemuan {courseProgress.nextActivity.meetingNumber}
                        </Badge>
                        <Badge variant="default" style={{ fontSize: '0.6875rem' }}>
                          {courseProgress.nextActivity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                        {courseProgress.nextActivity.title}
                      </strong>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Mata Kuliah: {courseProgress.courseName}
                      </div>
                    </div>

                    <Button 
                      variant="primary" 
                      size="md" 
                      icon={ArrowRight}
                      onClick={() => onNavigate(getNextActivityLink())}
                      className="w-full"
                    >
                      Buka Aktivitas Ini
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-md">
                    <CheckCircle2 size={24} color="var(--color-success-main)" />
                    <div>
                      <strong>Semua Aktivitas Selesai</strong>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                        Anda telah menyelesaikan seluruh modul dan kuis pada minggu ini.
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Ringkasan Progres Belajar */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{KAMUS_UI.PROGRES_BELAJAR}</CardTitle>
                  <CardSubtitle>Ushul Fiqih & Qawaid Fiqhiyyah (PAI-301)</CardSubtitle>
                </div>
                {courseProgress && (
                  <Badge variant={courseProgress.overallPercentage < 50 ? 'warning' : 'success'}>
                    {courseProgress.overallPercentage}% Selesai
                  </Badge>
                )}
              </CardHeader>
              <CardBody>
                {courseProgress && (
                  <div className="flex flex-col gap-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs text-muted" style={{ marginBottom: '4px' }}>
                        <span>Capaian Kumulatif</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{courseProgress.overallPercentage}%</strong>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${courseProgress.overallPercentage}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--color-primary-600)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>

                    {/* Progres Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
                      <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Aktivitas Selesai</div>
                        <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                          {courseProgress.completedActivities} / {courseProgress.totalActivities}
                        </strong>
                      </div>

                      <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Pertemuan</div>
                        <strong style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                          {courseProgress.meetings.length} Sesi
                        </strong>
                      </div>

                      <div className="col-span-2 sm:col-span-1" style={{ padding: 'var(--space-2)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Status</div>
                        <strong style={{ fontSize: 'var(--text-base)', color: 'var(--color-primary-700)' }}>
                          {courseProgress.overallPercentage >= 80 ? 'Sangat Baik' : 'Berjalan'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/progres')}>
                  Lihat Rincian Progres Lengkap
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Jadwal Kuliah Hari Ini & Batas Tugas Terdekat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Jadwal Kuliah Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar size={18} color="var(--color-primary-800)" />
                  <CardTitle>Jadwal Kuliah Hari Ini</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
                  <div className="flex justify-between items-start sm:items-center gap-2 flex-col sm:flex-row" style={{ marginBottom: '2px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                      Ushul Fiqih & Qawaid Fiqhiyyah (PAI-301)
                    </strong>
                    <Badge variant="primary">08:00 - 10:30 WIB</Badge>
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', margin: 0 }}>
                    Dr. H. M. Ridwan, M.Ag • Ruang Kuliah 204 / SALAM Daring
                  </p>
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/kalender')}>
                  Buka Kalender Akademik
                </Button>
              </CardFooter>
            </Card>

            {/* Batas Tugas & Kuis Terdekat */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock size={18} color="#d97706" />
                  <CardTitle>Tenggat Waktu Terdekat</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 'var(--text-xs)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '4px' }}>
                    <div style={{ minWidth: 0 }}>
                      <strong style={{ wordBreak: 'break-word' }}>{evt.title}</strong>
                      <div style={{ color: 'var(--text-muted)' }}>{evt.courseName}</div>
                    </div>
                    <Badge variant="warning">{new Date(evt.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</Badge>
                  </div>
                ))}
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/tugas')}>
                  Lihat Semua Tugas
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Pengumuman Resmi Kampus */}
          {latestAnnouncements.length > 0 && (
            <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Bell size={18} color="var(--color-primary-800)" />
                    <CardTitle>Pengumuman & Informasi Terkini</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('/pengumuman')}>
                    Lihat Semua ({announcementService.getAnnouncementStats(user.id).total})
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {latestAnnouncements.map((item) => (
                  <div 
                    key={item.id}
                    className="flex flex-col gap-1 p-3 rounded-md transition-colors"
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer'
                    }}
                    onClick={() => onNavigate('/pengumuman')}
                  >
                    <div className="flex justify-between items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {item.isPinned && (
                          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--color-primary-800)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <Pin size={10} /> PENTING
                          </span>
                        )}
                        <Badge variant="primary" style={{ fontSize: '10px' }}>{item.category}</Badge>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {new Date(item.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {item.title}
                    </strong>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                      {item.summary}
                    </p>
                  </div>
                ))}
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* =========================================================================
          DOSEN DASHBOARD
          ========================================================================= */}
      {isLecturer && (
        <div className="flex flex-col gap-6">
          {/* Action Needed Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-main)', flexShrink: 0 }}>
                  <ClipboardList size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tugas Mahasiswa Belum Dinilai</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{unsubmittedAssignments} Berkas</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning-main)', flexShrink: 0 }}>
                  <HelpCircle size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Antrean Koreksi Esai Kuis</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{uncorrectedQuizzes} Lembar</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-800)', flexShrink: 0 }}>
                  <BookOpen size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Kelas Kuliah Aktif</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{lecturerClasses.length} Kelas</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-info-main)', flexShrink: 0 }}>
                  <TrendingUp size={24} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Rata-Rata Progres Belajar</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>78%</div>
                </div>
              </CardBody>
            </Card>
          </div>


          {/* Dosen Action Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Urgent Grading Card */}
            <Card style={{ borderLeft: '4px solid var(--color-danger-main)' }}>
              <CardHeader>
                <div>
                  <CardTitle>Tindakan Diperlukan: Penilaian Tugas</CardTitle>
                  <CardSubtitle>Pengumpulan tugas mahasiswa menunggu verifikasi dan umpan balik</CardSubtitle>
                </div>
                <Badge variant="danger">{unsubmittedAssignments} Menunggu</Badge>
              </CardHeader>
              <CardBody>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: 0 }}>
                  Ada <strong>{unsubmittedAssignments} berkas tugas</strong> mahasiswa yang telah diserahkan dan membutuhkan penilaian nilai angka serta catatan dosen.
                </p>
              </CardBody>
              <CardFooter>
                <Button variant="primary" size="sm" onClick={() => onNavigate('/tugas/grading')}>
                  Buka Lembar Penilaian Tugas
                </Button>
              </CardFooter>
            </Card>

            {/* Kelas Dosen Card */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Rombel Kelas yang Diampu</CardTitle>
                  <CardSubtitle>Semester Ganjil 2026/2027</CardSubtitle>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {lecturerClasses.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <BookOpen size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Belum Ada Kelas yang Diampu</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Anda belum memiliki rombel kelas aktif yang diplotkan untuk semester ini. Plotting mata kuliah dapat diatur melalui SIAKAD oleh Bagian Akademik (BAAK) atau Kaprodi.
                    </p>
                  </div>
                ) : (
                  lecturerClasses.map((cls) => (
                    <div 
                      key={cls.id} 
                      style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                      onClick={() => onNavigate(`/mata-kuliah/${cls.id}`)}
                    >
                      <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-1" style={{ marginBottom: '2px' }}>
                        <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          {cls.courseCode}: {cls.courseName} ({cls.name})
                        </strong>
                        <Badge variant="primary">{cls.studentCount} Mahasiswa</Badge>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Prodi {cls.studyProgramCode || 'PAI'} • {cls.credits} SKS • {cls.schedules?.[0]?.dayOfWeek || 'Jadwal Teratur'} {cls.schedules?.[0]?.startTime ? `${cls.schedules[0].startTime} - ${cls.schedules[0].endTime}` : ''}
                      </div>
                    </div>
                  ))
                )}
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" onClick={() => onNavigate('/mata-kuliah')}>
                  Kelola Modul & RPS Kelas
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADMINISTRATOR DASHBOARD (KHUSUS ADMIN / PIMPINAN)
          ========================================================================= */}
      {isAdmin && (
        <div className="flex flex-col gap-6">
          {/* Admin Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              style={{ cursor: 'pointer', borderLeft: '4px solid var(--color-primary-600)' }}
              onClick={() => onNavigate('/admin/mahasiswa')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mahasiswa Terdaftar</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                      120+ Mahasiswa
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '4px' }}>
                      Sinkron dari SIAKAD
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                    <Users size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card 
              style={{ cursor: 'pointer', borderLeft: '4px solid #0284c7' }}
              onClick={() => onNavigate('/admin/dosen')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dosen Pengampu</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                      18 Dosen
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#0284c7', marginTop: '4px' }}>
                      Aktif Mengajar
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                    <UserCheck size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card 
              style={{ cursor: 'pointer', borderLeft: '4px solid #8b5cf6' }}
              onClick={() => onNavigate('/mata-kuliah')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Kelas Daring Aktif</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                      24 Rombel
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#6d28d9', marginTop: '4px' }}>
                      Semester Ganjil
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                    <BookOpen size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card 
              style={{ cursor: 'pointer', borderLeft: '4px solid #10b981' }}
              onClick={() => onNavigate('/admin/monitoring')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Status Sistem LMS</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#059669', marginTop: '2px' }}>
                      Normal / Stabil
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: '#047857', marginTop: '4px' }}>
                      100% Layanan Online
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#059669' }}>
                    <Activity size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Admin Navigation Grid */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Menu Utama Manajemen Administrator</CardTitle>
                <CardSubtitle>Kelola data akademik, integrasi server SIAKAD, dan konfigurasi LMS</CardSubtitle>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <Button 
                  variant="outline" 
                  icon={RefreshCw} 
                  onClick={() => onNavigate('/admin/sync')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Sinkronisasi SIAKAD</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tarik data master dari portal resmi</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  icon={Users} 
                  onClick={() => onNavigate('/admin/mahasiswa')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Manajemen Mahasiswa</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Daftar akun &amp; status akademik</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  icon={UserCheck} 
                  onClick={() => onNavigate('/admin/dosen')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Manajemen Dosen</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Homebase &amp; penugasan mengajar</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  icon={TrendingUp} 
                  onClick={() => onNavigate('/admin/monitoring')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Monitoring Pembelajaran</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Capaian &amp; aktivitas perkuliahan</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  icon={ShieldCheck} 
                  onClick={() => onNavigate('/admin/audit')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Audit Log Aktivitas</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Catatan akses &amp; rekam jejak pengguna</div>
                  </div>
                </Button>

                <Button 
                  variant="outline" 
                  icon={Settings} 
                  onClick={() => onNavigate('/admin/pengaturan')}
                  className="justify-start p-3 h-auto"
                >
                  <div className="text-left">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Pengaturan Sistem</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Konfigurasi parameter &amp; gateway API</div>
                  </div>
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};
