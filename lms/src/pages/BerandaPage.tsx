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
  FileSpreadsheet,
  FileText,
  Award,
  Bell,
  Pin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { UserAuthProfile } from '../types/auth';
import { progressService } from '../services/progressService';
import { calendarService } from '../services/calendarService';
import { assignmentService } from '../services/assignmentService';
import { quizService } from '../services/quizService';
import { announcementService } from '../services/announcementService';
import { KAMUS_UI } from '../constants/dictionary';

export interface BerandaPageProps {
  user: UserAuthProfile;
  onNavigate: (path: string) => void;
}

export const BerandaPage: React.FC<BerandaPageProps> = ({ user, onNavigate }) => {
  const isStudent = user.role === 'mahasiswa';
  const isLecturer = user.role === 'dosen' || user.role === 'dosen_pa' || user.role === 'administrator_sistem';

  // Data Progres Mahasiswa
  const courseProgress = isStudent ? progressService.getCourseProgress('cls-pai301-a', user.id, user.identityNumber || '21.01.0042', user.name) : null;

  // Data Urgent Dosen
  const unsubmittedAssignments = assignmentService.getSubmissions().filter((s) => s.status !== 'SUDAH_DINILAI').length;
  const uncorrectedQuizzes = quizService.getAttempts().filter((a) => a.needsManualGrading).length;

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
                  {user.role === 'mahasiswa' ? 'Mahasiswa Aktif' : 'Dosen Pengampu'}
                </Badge>
              </div>

              <h1 style={{ color: 'white', fontSize: 'var(--text-2xl)', marginBottom: '4px' }}>
                Selamat Datang di SALAM LMS, {user.name}
              </h1>
              <p style={{ color: '#d1fae5', fontSize: 'var(--text-sm)' }}>
                Sistem Aplikasi Layanan Akademik dan Mahasiswa STAI AL-ITTIHAD
              </p>
            </div>

            <div className="text-left md:text-right">
              <div style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0' }}>NIM / NIDN:</div>
              <strong style={{ fontSize: 'var(--text-lg)', color: 'white' }}>{user.identityNumber}</strong>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* =========================================================================
          MAHASISWA DASHBOARD
          ========================================================================= */}
      {isStudent && (
        <div className="flex flex-col gap-6">
          {/* Pintasan Layanan Akademik Mahasiswa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KHS Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid var(--color-primary-600)' }}
              onClick={() => onNavigate('/khs')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Hasil Studi & Transkrip</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                      IPS: 3.89 • IPK: 3.91
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '4px' }}>
                      Maksimal 24 SKS Semester Depan
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                    <FileSpreadsheet size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Buku Nilai Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #8b5cf6' }}
              onClick={() => onNavigate('/buku-nilai')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Buku Nilai Perkuliahan</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#7c3aed', marginTop: '2px' }}>
                      Rata-rata: 92.20 (A)
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                      5 Mata Kuliah Dinilai Formatif
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                    <Award size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* KRS Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid var(--color-success-600)' }}
              onClick={() => onNavigate('/krs')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Rencana Studi (KRS)</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-700)', marginTop: '2px' }}>
                      21 SKS (7 Mata Kuliah)
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Status: Disetujui Dosen PA
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
                    <FileText size={20} />
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Jadwal Card */}
            <Card 
              style={{ cursor: 'pointer', transition: 'transform 0.2s', borderLeft: '4px solid #0284c7' }}
              onClick={() => onNavigate('/jadwal')}
            >
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Jadwal Perkuliahan</div>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: '#0369a1', marginTop: '2px' }}>
                      Senin s.d. Jumat
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Ruang Al-Ghazali & Smart Class
                    </div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                    <Calendar size={20} />
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
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>2 Kelas</div>
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
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>65%</div>
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
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-1" style={{ marginBottom: '2px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      PAI-301: Ushul Fiqih & Qawaid Fiqhiyyah (Kelas A)
                    </strong>
                    <Badge variant="primary">28 Mahasiswa</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Prodi Pendidikan Agama Islam • 3 SKS
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-1" style={{ marginBottom: '2px' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      HES-202: Fiqih Muamalah Kontemporer (Kelas B)
                    </strong>
                    <Badge variant="primary">24 Mahasiswa</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Prodi Hukum Ekonomi Syariah • 3 SKS
                  </div>
                </div>
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
    </div>
  );
};
