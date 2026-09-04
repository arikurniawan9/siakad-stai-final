import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  FileText, 
  Video, 
  HelpCircle, 
  ClipboardList, 
  MessageSquare
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CourseProgressSummary, LearningActivityItem, ActivityType } from '../../types/progress';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface ProgresBelajarPageProps {
  onNavigateToActivity?: (type: ActivityType, resourceId: string) => void;
}

export const ProgresBelajarPage: React.FC<ProgresBelajarPageProps> = ({ onNavigateToActivity }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [courseProgress, setCourseProgress] = useState<CourseProgressSummary | null>(null);

  const loadProgress = () => {
    if (!user) return;
    const summary = progressService.getCourseProgress(
      'cls-pai301-a',
      user.id,
      user.identityNumber || '21.01.0042',
      user.name
    );
    setCourseProgress(summary);
  };

  useEffect(() => {
    loadProgress();
  }, [user]);

  // Konfigurasi Ekspor Rekap Capaian Belajar Mahasiswa
  const flatActivityList = useMemo(() => {
    if (!courseProgress) return [];
    const rows: any[] = [];
    courseProgress.meetings.forEach((m) => {
      m.activities.forEach((act) => {
        rows.push({
          meetingNumber: m.meetingNumber,
          meetingTitle: m.title,
          activityTitle: act.title,
          activityType: act.type,
          isCompleted: act.progress?.isCompleted ? 'Selesai' : 'Belum Selesai',
          completionType: act.progress?.completionType || '-',
          details: act.progress?.details || '-'
        });
      });
    });
    return rows;
  }, [courseProgress]);

  const studentProgressExportConfig: ExportConfig<any> = useMemo(() => ({
    filename: `SALAM_Portofolio_Progres_${user?.identityNumber || 'Mahasiswa'}`,
    title: 'LEMBAR PORTOFOLIO & CHECKLIST KETERCAPAIAN PEMBELAJARAN',
    subtitle: `Mata Kuliah: ${courseProgress?.courseName || 'Ushul Fiqih'} | Mahasiswa: ${user?.name} (${user?.identityNumber || '21.01.0042'})`,
    data: flatActivityList,
    columns: [
      { key: 'meetingNumber', header: 'Sesi', width: '60px', align: 'center' },
      { key: 'meetingTitle', header: 'Topik Pertemuan', width: '200px' },
      { key: 'activityTitle', header: 'Aktivitas Belajar', width: '220px' },
      { key: 'activityType', header: 'Tipe Modul', width: '130px', align: 'center' },
      { key: 'isCompleted', header: 'Status Penyelesaian', width: '140px', align: 'center' },
      { key: 'details', header: 'Keterangan Capaian', width: '220px' }
    ],
    metadata: {
      'Nama Mahasiswa': user?.name || '-',
      'NIM': user?.identityNumber || '-',
      'Mata Kuliah': courseProgress?.courseName || '-',
      'Total Ketercapaian': `${courseProgress?.overallPercentage || 0}%`,
      'Aktivitas Selesai': `${courseProgress?.completedActivities || 0} dari ${courseProgress?.totalActivities || 0} Aktivitas`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [flatActivityList, courseProgress, user]);

  if (!courseProgress) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <p className="text-muted">{KAMUS_UI.MEMUAT_DATA}</p>
      </div>
    );
  }

  const handleToggleManual = (activity: LearningActivityItem) => {
    if (!user) return;
    try {
      const newState = progressService.toggleManualProgress(activity.id, user.id, user.name);
      loadProgress();
      toast.success(
        'Progres Diperbarui',
        newState ? `Aktivitas "${activity.title}" ditandai selesai.` : `Aktivitas "${activity.title}" ditandai belum selesai.`
      );
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'MATERI': return <FileText size={16} color="var(--color-primary-700)" />;
      case 'VIDEO_INTERAKTIF': return <Video size={16} color="#d97706" />;
      case 'KUIS': return <HelpCircle size={16} color="#2563eb" />;
      case 'TUGAS': return <ClipboardList size={16} color="#7c3aed" />;
      case 'FORUM_DISKUSI': return <MessageSquare size={16} color="#059669" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>{KAMUS_UI.PROGRES_BELAJAR} Saya</h1>
          <p>Pantau ketercapaian aktivitas pembelajaran, modul materi, kuis, tugas, dan diskusi kelas</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
            {courseProgress.courseName}
          </Badge>
          <ExportDropdown
            config={studentProgressExportConfig}
            buttonLabel="Ekspor Portofolio"
          />
        </div>
      </div>

      {/* Overall Progress & Lanjutkan Belajar Card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
        {/* Progress Card */}
        <Card style={{ background: 'linear-gradient(135deg, #065f46, #047857)', color: 'white', border: 'none' }}>
          <CardBody style={{ padding: 'var(--space-6)' }}>
            <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-4)' }}>
              <div>
                <span style={{ fontSize: 'var(--text-xs)', color: '#a7f3d0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ketercapaian Pembelajaran
                </span>
                <h2 style={{ color: 'white', fontSize: 'var(--text-2xl)', marginTop: '2px' }}>
                  {courseProgress.overallPercentage}% Selesai
                </h2>
              </div>

              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={24} color="white" />
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '4px', overflow: 'hidden', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: `${courseProgress.overallPercentage}%`, height: '100%', backgroundColor: '#34d399', transition: 'width 0.5s ease' }} />
            </div>

            <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)', color: '#d1fae5' }}>
              <span>Total Selesai: <strong>{courseProgress.completedActivities}</strong> dari <strong>{courseProgress.totalActivities}</strong> Aktivitas</span>
              <span>{courseProgress.totalActivities - courseProgress.completedActivities} Belum Selesai</span>
            </div>
          </CardBody>
        </Card>

        {/* Lanjutkan Belajar Card */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{KAMUS_UI.LANJUTKAN_BELAJAR}</CardTitle>
              <CardSubtitle>Rekomendasi aktivitas berikutnya yang harus Anda selesaikan</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody>
            {courseProgress.nextActivity ? (
              <div className="flex flex-col gap-3">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
                    {getActivityIcon(courseProgress.nextActivity.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="primary" style={{ fontSize: '0.6875rem' }}>
                        Pertemuan {courseProgress.nextActivity.meetingNumber}
                      </Badge>
                      <Badge variant="default" style={{ fontSize: '0.6875rem' }}>
                        {courseProgress.nextActivity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <strong style={{ fontSize: 'var(--text-sm)', display: 'block', marginTop: '2px' }}>
                      {courseProgress.nextActivity.title}
                    </strong>
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  icon={ArrowRight} 
                  iconPosition="right"
                  onClick={() => onNavigateToActivity && onNavigateToActivity(courseProgress.nextActivity!.type, courseProgress.nextActivity!.resourceId)}
                >
                  Buka Aktivitas Ini
                </Button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-success-main)' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto var(--space-2)' }} />
                <strong>Alhamdulillah! Seluruh aktivitas pembelajaran telah selesai.</strong>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Breakdown per Sesi Pertemuan */}
      <div className="flex flex-col gap-6">
        <h2 style={{ fontSize: 'var(--text-lg)' }}>Daftar Pertemuan & Checklist Aktivitas</h2>

        {courseProgress.meetings.map((meeting) => (
          <Card key={meeting.meetingId}>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 w-full">
                <div className="flex items-center gap-3">
                  <Badge variant={meeting.isCompleted ? 'success' : 'primary'} style={{ padding: '4px 8px' }}>
                    Sesi {meeting.meetingNumber}
                  </Badge>
                  <span style={{ fontWeight: 'bold', fontSize: 'var(--text-base)' }}>{meeting.title}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {meeting.completedActivities} / {meeting.totalActivities} Aktivitas Selesai
                  </span>
                  <Badge variant={meeting.isCompleted ? 'success' : 'default'}>
                    {meeting.progressPercentage}%
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-3">
              {meeting.activities.map((act) => {
                const isCompleted = !!act.progress?.isCompleted;
                const isManual = act.progress?.completionType === 'MANUAL';

                return (
                  <div 
                    key={act.id}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isCompleted ? 'var(--color-slate-50)' : 'var(--bg-surface)',
                      border: `1px solid ${isCompleted ? 'var(--border-subtle)' : 'var(--border-default)'}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)'
                    }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3">
                        {/* Check Icon / Button */}
                        {act.rule.allowManualOverride ? (
                          <button
                            type="button"
                            onClick={() => handleToggleManual(act)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            title="Klik untuk mengubah status penyelesaian mandiri"
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={20} color="var(--color-success-main)" />
                            ) : (
                              <Circle size={20} color="var(--text-muted)" />
                            )}
                          </button>
                        ) : (
                          <div>
                            {isCompleted ? (
                              <CheckCircle2 size={20} color="var(--color-success-main)" />
                            ) : (
                              <Circle size={20} color="var(--text-muted)" />
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          {getActivityIcon(act.type)}
                          <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: isCompleted ? 'var(--text-primary)' : 'var(--text-primary)' }}>
                            {act.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={isCompleted ? 'success' : 'default'} style={{ fontSize: '0.6875rem' }}>
                          {isCompleted ? (isManual ? 'Selesai (Mandiri)' : 'Selesai (Otomatis)') : 'Belum Selesai'}
                        </Badge>
                      </div>
                    </div>

                    {/* Source description */}
                    {act.progress && (
                      <div style={{ paddingLeft: '32px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        {act.progress.details}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};
