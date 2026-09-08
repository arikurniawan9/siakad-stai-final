import React, { useState, useEffect, useMemo } from 'react';
import { 
  PlayCircle, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  Plus,
  Video
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { InteractiveVideo } from '../../types/video';
import { videoService } from '../../services/videoService';
import { academicService, AcademicClass } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { getYouTubeVideoId } from '../../components/video/InteractiveVideoPlayer';

export interface VideoListPageProps {
  onSelectVideo: (videoId: string) => void;
}

export const VideoListPage: React.FC<VideoListPageProps> = ({ onSelectVideo }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [videos, setVideos] = useState<InteractiveVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProdi, setSelectedProdi] = useState<'all' | 'PAI' | 'PIAUD'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'belum' | 'proses' | 'selesai'>('all');

  // Create Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';

  const [availableClasses, setAvailableClasses] = useState<AcademicClass[]>(() => {
    const all = academicService.getClasses();
    if (!isLecturer || !user) return all;
    const nidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
    const filtered = all.filter((c) => {
      const cNidn = (c.lecturerNidn || '').replace(/[^0-9]/g, '');
      const matchNidn = nidn && cNidn && (nidn === cNidn || cNidn.includes(nidn) || nidn.includes(cNidn));
      const matchId = c.lecturerId === user.id;
      const matchName = user.name && c.lecturerName && c.lecturerName.toLowerCase().includes(user.name.toLowerCase().trim());
      return matchNidn || matchId || matchName;
    });
    return filtered.length > 0 ? filtered : all;
  });

  const [newCourseName, setNewCourseName] = useState(() => availableClasses[0]?.courseName || 'Fiqih Mawaris');
  const [newClassId, setNewClassId] = useState(() => availableClasses[0]?.id || 'cls-20261-pai301-a');
  const [newMeetingNumber, setNewMeetingNumber] = useState(1);
  const [newDescription, setNewDescription] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('https://vjs.zencdn.net/v/oceans.mp4');
  const [newDurationMinutes, setNewDurationMinutes] = useState(5);
  const [newMinPercentage, setNewMinPercentage] = useState(80);
  const [newAllowFastForward, setNewAllowFastForward] = useState(false);

  useEffect(() => {
    academicService.fetchClassesFromBackend().then((classes) => {
      if (classes && classes.length > 0) {
        if (isLecturer && user) {
          const nidn = (user.identityNumber || '').replace(/[^0-9]/g, '');
          const filtered = classes.filter((c) => {
            const cNidn = (c.lecturerNidn || '').replace(/[^0-9]/g, '');
            const matchNidn = nidn && cNidn && (nidn === cNidn || cNidn.includes(nidn) || nidn.includes(cNidn));
            const matchId = c.lecturerId === user.id;
            const matchName = user.name && c.lecturerName && c.lecturerName.toLowerCase().includes(user.name.toLowerCase().trim());
            return matchNidn || matchId || matchName;
          });
          if (filtered.length > 0) {
            setAvailableClasses(filtered);
            return;
          }
        }
        setAvailableClasses(classes);
      }
    }).catch(() => {});
  }, [isLecturer, user]);

  const loadVideos = () => {
    const vids = videoService.getAllVideos(undefined, isStudent);
    setVideos(vids);
  };

  useEffect(() => {
    loadVideos();
  }, [user?.role, isStudent]);

  const handleCreateVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.warning('Validasi Gagal', 'Silakan masukkan judul video pembelajaran.');
      return;
    }
    if (!newVideoUrl.trim()) {
      toast.warning('Validasi Gagal', 'Silakan masukkan tautan video (YouTube atau URL MP4).');
      return;
    }

    try {
      const padMeeting = newMeetingNumber < 10 ? `0${newMeetingNumber}` : `${newMeetingNumber}`;
      const mtgId = newClassId === 'cls-pai301-a' ? `mtg-pai301a-${padMeeting}` : `mtg-${newClassId}-${padMeeting}`;

      const created = videoService.createVideo({
        classId: newClassId,
        meetingId: mtgId,
        courseName: newCourseName,
        meetingNumber: newMeetingNumber,
        title: newTitle,
        description: newDescription || 'Video materi pembelajaran interaktif kurikulum perkuliahan STAI Al-Ittihad.',
        videoUrl: newVideoUrl.trim(),
        durationSeconds: newDurationMinutes * 60,
        minWatchedPercentage: newMinPercentage,
        allowFastForward: newAllowFastForward,
        status: 'DITERBITKAN',
        checkpoints: []
      });

      toast.success('Video Dibuat', `Video "${newTitle}" berhasil ditambahkan. Silakan konfigurasikan titik pertanyaan.`);
      setIsAddModalOpen(false);
      loadVideos();
      // Buka video editor langsung untuk menambahkan checkpoint
      onSelectVideo(created.id);
    } catch (err: any) {
      toast.danger('Gagal', err.message || 'Gagal menambahkan video pembelajaran');
    }
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // 1. Search filter
      const q = searchQuery.toLowerCase();
      const matchQuery = 
        v.title.toLowerCase().includes(q) ||
        v.courseName.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q);
      if (!matchQuery) return false;

      // 2. Prodi filter
      if (selectedProdi !== 'all') {
        const isPAI = v.classId.toLowerCase().includes('pai') || v.courseName.toLowerCase().includes('fiqih') || v.courseName.toLowerCase().includes('ulumul');
        const isPIAUD = v.classId.toLowerCase().includes('piaud') || v.courseName.toLowerCase().includes('piaud');
        if (selectedProdi === 'PAI' && !isPAI) return false;
        if (selectedProdi === 'PIAUD' && !isPIAUD) return false;
      }

      // 3. Status filter (jika login sebagai mahasiswa)
      if (user && selectedStatus !== 'all') {
        const prog = videoService.getStudentProgress(v.id, user.id);
        if (selectedStatus === 'selesai' && !prog?.isCompleted) return false;
        if (selectedStatus === 'proses' && (!prog || prog.isCompleted || prog.effectiveWatchedPercentage === 0)) return false;
        if (selectedStatus === 'belum' && prog && prog.effectiveWatchedPercentage > 0) return false;
      }

      return true;
    });
  }, [videos, searchQuery, selectedProdi, selectedStatus, user]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins} menit ${secs > 0 ? `${secs} dtk` : ''}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video size={24} color="var(--color-primary-700)" />
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {KAMUS_UI.VIDEO_INTERAKTIF}
            </h1>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {isStudent 
              ? 'Tonton video perkuliahan kurikulum STAI Al-Ittihad dan jawab pertanyaan checkpoint pemahaman untuk memenuhi syarat tuntas perkuliahan.'
              : 'Kelola video materi perkuliahan interaktif, sematkan titik soal pemahaman konsep, dan pantau progres tontonan mahasiswa.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
            {videos.length} Materi Video Tersedia
          </Badge>
          {isLecturer && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setIsAddModalOpen(true)}
            >
              Tambah Video Baru
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="Cari judul video, mata kuliah, atau materi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Select
              value={selectedProdi}
              options={[
                { value: 'all', label: 'Semua Program Studi' },
                { value: 'PAI', label: 'S1 Pendidikan Agama Islam (PAI)' },
                { value: 'PIAUD', label: 'S1 Pendidikan Islam Anak Usia Dini (PIAUD)' }
              ]}
              onChange={(e) => setSelectedProdi(e.target.value as any)}
            />

            <Select
              value={selectedStatus}
              options={[
                { value: 'all', label: 'Semua Status Progres' },
                { value: 'belum', label: 'Belum Ditonton' },
                { value: 'proses', label: 'Sedang Dipelajari' },
                { value: 'selesai', label: 'Selesai / Tuntas' }
              ]}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
            />
          </div>
        </CardBody>
      </Card>

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">{KAMUS_UI.TIDAK_ADA_DATA}</p>
          </CardBody>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredVideos.map((vid) => {
            const studentProg = user ? videoService.getStudentProgress(vid.id, user.id) : null;
            const isCompleted = studentProg?.isCompleted;
            const isYouTube = !!getYouTubeVideoId(vid.videoUrl);

            return (
              <Card key={vid.id} interactive onClick={() => onSelectVideo(vid.id)}>
                {/* Visual Thumbnail Cover */}
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    background: 'linear-gradient(135deg, #064e3b 0%, #0f172a 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    overflow: 'hidden'
                  }}
                >
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: 0.15,
                      backgroundImage: 'radial-gradient(#10b981 1px, transparent 1px)',
                      backgroundSize: '16px 16px'
                    }} 
                  />

                  <div 
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(4, 120, 87, 0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                      zIndex: 2
                    }}
                  >
                    <PlayCircle size={32} color="white" />
                  </div>

                  {/* Top Badges */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      top: '10px', 
                      left: '10px', 
                      display: 'flex', 
                      gap: '6px',
                      zIndex: 3 
                    }}
                  >
                    <span 
                      style={{ 
                        backgroundColor: 'rgba(4, 120, 87, 0.9)', 
                        color: 'white', 
                        padding: '2px 8px', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}
                    >
                      P#{vid.meetingNumber}
                    </span>
                    {isYouTube && (
                      <span 
                        style={{ 
                          backgroundColor: '#ff0000', 
                          color: 'white', 
                          padding: '2px 6px', 
                          borderRadius: 'var(--radius-sm)', 
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      >
                        YouTube
                      </span>
                    )}
                  </div>

                  {/* Bottom Duration Badge */}
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '8px', 
                      right: '8px', 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      zIndex: 3
                    }}
                  >
                    {formatDuration(vid.durationSeconds)}
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary">Pertemuan {vid.meetingNumber}</Badge>
                    <Badge variant={isCompleted ? 'success' : studentProg && studentProg.effectiveWatchedPercentage > 0 ? 'warning' : 'default'}>
                      {isCompleted ? KAMUS_UI.STATUS_SELESAI : studentProg && studentProg.effectiveWatchedPercentage > 0 ? KAMUS_UI.STATUS_SEDANG_DIPELAJARI : KAMUS_UI.STATUS_BELUM_DIMULAI}
                    </Badge>
                  </div>
                </CardHeader>

                <CardBody>
                  <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', marginBottom: 'var(--space-1)', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {vid.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', fontWeight: '600', marginBottom: 'var(--space-3)' }}>
                    {vid.courseName}
                  </p>

                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', lineClamp: 2, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {vid.description}
                  </p>

                  <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} color="var(--color-primary-700)" />
                      <span><strong>{vid.checkpoints.length}</strong> Titik Pertanyaan Interaktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} color="var(--color-primary-700)" />
                      <span>Syarat Tuntas: Minimal {vid.minWatchedPercentage}% Tontonan Sah</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {studentProg && (
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                        <span className="text-muted">Progres Tontonan</span>
                        <span style={{ fontWeight: 'bold' }}>{studentProg.effectiveWatchedPercentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${studentProg.effectiveWatchedPercentage}%`, 
                            height: '100%', 
                            backgroundColor: studentProg.isCompleted ? 'var(--color-success-main)' : 'var(--color-primary-600)',
                            transition: 'width 300ms ease'
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </CardBody>

                <CardFooter>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    Status: {vid.status}
                  </span>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    {isCompleted ? 'Tinjau Materi' : studentProg ? 'Lanjutkan Belajar' : 'Tonton Video'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL TAMBAH VIDEO PEMBELAJARAN BARU (DOSEN / ADMIN)
          ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Video Pembelajaran Interaktif STAI Al-Ittihad"
        maxWidth="620px"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddModalOpen(false)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" onClick={handleCreateVideo}>
              Simpan & Konfigurasi Soal
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateVideo} className="flex flex-col gap-4">
          <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)' }}>
            <strong>Panduan Format Video:</strong> Sistem mendukung pemutaran langsung melalui tautan YouTube (misal: <code>https://www.youtube.com/watch?v=...</code> atau <code>https://youtu.be/...</code>) maupun URL berkas MP4 langsung pada server/CDN.
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
              Judul Video Pembelajaran <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <Input
              placeholder="Contoh: Kaidah Asasi Fiqhiyyah - Al-Umuru bi Maqashidiha"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                Mata Kuliah
              </label>
              <Select
                value={newClassId}
                options={availableClasses.map((c) => ({
                  value: c.id,
                  label: `${c.courseCode} — ${c.courseName} (${c.name})`
                }))}
                onChange={(e) => {
                  setNewClassId(e.target.value);
                  const found = availableClasses.find((c) => c.id === e.target.value);
                  if (found) {
                    setNewCourseName(found.courseName);
                  }
                }}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                Pertemuan Perkuliahan
              </label>
              <Select
                value={newMeetingNumber.toString()}
                options={Array.from({ length: 16 }, (_, i) => ({
                  value: (i + 1).toString(),
                  label: `Pertemuan #${i + 1}`
                }))}
                onChange={(e) => setNewMeetingNumber(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
              Tautan Video (URL YouTube / MP4 Langsung) <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <Input
              placeholder="https://www.youtube.com/watch?v=... atau https://domain.ac.id/video.mp4"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                Estimasi Durasi Video (Menit)
              </label>
              <Input
                type="number"
                min={1}
                max={180}
                value={newDurationMinutes.toString()}
                onChange={(e) => setNewDurationMinutes(parseInt(e.target.value, 10) || 5)}
              />
            </div>

            <div>
              <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
                Syarat Minimal Tontonan (%)
              </label>
              <Input
                type="number"
                min={10}
                max={100}
                value={newMinPercentage.toString()}
                onChange={(e) => setNewMinPercentage(parseInt(e.target.value, 10) || 80)}
              />
            </div>
          </div>

          <div>
            <label className="form-label" style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>
              Deskripsi Materi Perkuliahan
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Jelaskan ringkasan materi, capaian pembelajaran perkuliahan, atau instruksi bagi mahasiswa..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div 
            style={{ 
              padding: 'var(--space-3)', 
              backgroundColor: 'var(--color-slate-50)', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>Kunci Percepat Video (Anti-Skip)</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Mahasiswa tidak dapat melompati video yang belum ditonton sebelumnya.
              </div>
            </div>
            <input
              type="checkbox"
              checked={!newAllowFastForward}
              onChange={(e) => setNewAllowFastForward(!e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
