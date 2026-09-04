import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, 
  Clock, 
  HelpCircle, 
  ArrowRight,
  Plus
} from 'lucide-react';
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { InteractiveVideo } from '../../types/video';
import { videoService } from '../../services/videoService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface VideoListPageProps {
  onSelectVideo: (videoId: string) => void;
}

export const VideoListPage: React.FC<VideoListPageProps> = ({ onSelectVideo }) => {
  const { user } = useAuth();
  const toast = useToast();
  const [videos, setVideos] = useState<InteractiveVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Create Video Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCourseName, setNewCourseName] = useState('Ushul Fiqih & Qawaid Fiqhiyyah');
  const [newClassId, setNewClassId] = useState('cls-pai301-a');
  const [newMeetingNumber, setNewMeetingNumber] = useState(1);
  const [newDescription, setNewDescription] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
  const [newDurationMinutes, setNewDurationMinutes] = useState(5);
  const [newMinPercentage, setNewMinPercentage] = useState(80);
  const [newAllowFastForward, setNewAllowFastForward] = useState(false);

  const isStudent = user?.role === 'mahasiswa';
  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'kaprodi' || user?.role === 'administrator_sistem';

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

    try {
      const padMeeting = newMeetingNumber < 10 ? `0${newMeetingNumber}` : `${newMeetingNumber}`;
      const mtgId = newClassId === 'cls-pai301-a' ? `mtg-pai301a-${padMeeting}` : `mtg-${newClassId}-${padMeeting}`;

      const created = videoService.createVideo({
        classId: newClassId,
        meetingId: mtgId,
        courseName: newCourseName,
        meetingNumber: newMeetingNumber,
        title: newTitle,
        description: newDescription || 'Video materi pembelajaran interaktif perkuliahan.',
        videoUrl: newVideoUrl,
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

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1>{KAMUS_UI.VIDEO_INTERAKTIF}</h1>
          <p>
            {isStudent 
              ? 'Tonton video pembelajaran interaktif dan jawab pertanyaan reflektif untuk melengkapi progres'
              : 'Kelola media video pembelajaran dan konfigurasi titik checkpoint pertanyaan'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="primary" style={{ padding: '6px 14px', fontSize: 'var(--text-xs)' }}>
            {videos.length} Video Tersedia
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

      {/* Filter Bar */}
      <Card>
        <CardBody>
          <Input
            placeholder="Cari video pembelajaran atau mata kuliah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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

            return (
              <Card key={vid.id} interactive onClick={() => onSelectVideo(vid.id)}>
                <div 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    backgroundColor: 'var(--color-slate-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <PlayCircle size={48} color="rgba(255,255,255,0.85)" />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      bottom: '8px', 
                      right: '8px', 
                      backgroundColor: 'rgba(0,0,0,0.75)', 
                      padding: '2px 8px', 
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {formatDuration(vid.durationSeconds)}
                  </div>
                </div>

                <CardHeader>
                  <Badge variant="primary">Pertemuan {vid.meetingNumber}</Badge>
                  <Badge variant={isCompleted ? 'success' : studentProg ? 'warning' : 'default'}>
                    {isCompleted ? KAMUS_UI.STATUS_SELESAI : studentProg ? KAMUS_UI.STATUS_SEDANG_DIPELAJARI : KAMUS_UI.STATUS_BELUM_DIMULAI}
                  </Badge>
                </CardHeader>

                <CardBody>
                  <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-1)', color: 'var(--text-primary)' }}>
                    {vid.title}
                  </h3>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                    {vid.courseName}
                  </p>

                  <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div className="flex items-center gap-2">
                      <HelpCircle size={14} color="var(--color-primary-700)" />
                      <span><strong>{vid.checkpoints.length}</strong> Titik Pertanyaan Interaktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} color="var(--color-primary-700)" />
                      <span>Syarat Tontonan: Minimal {vid.minWatchedPercentage}%</span>
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
                            backgroundColor: studentProg.isCompleted ? 'var(--color-success-main)' : 'var(--color-primary-600)' 
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </CardBody>

                <CardFooter>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {vid.status}
                  </span>
                  <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
                    Putar Video
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
        title="Tambah Video Pembelajaran Interaktif"
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
                options={[
                  { value: 'cls-pai301-a', label: 'Ushul Fiqih & Qawaid Fiqhiyyah (PAI-301-A)' },
                  { value: 'cls-pai101-b', label: 'Ulumul Qur\'an & Studi Kitab (PAI-101-B)' }
                ]}
                onChange={(e) => {
                  setNewClassId(e.target.value);
                  if (e.target.value === 'cls-pai301-a') {
                    setNewCourseName('Ushul Fiqih & Qawaid Fiqhiyyah');
                  } else {
                    setNewCourseName('Ulumul Qur\'an & Studi Kitab Turats');
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
              Tautan Berkas Video (MP4 / Web Video URL) <span style={{ color: 'var(--color-danger-main)' }}>*</span>
            </label>
            <Input
              placeholder="https://domain.ac.id/videos/materi-ushul-fiqih.mp4"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              required
            />
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Mendukung URL video langsung (.mp4, .webm, storage S3/MinIO, atau CDN).
            </span>
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
              Deskripsi Materi Video
            </label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Jelaskan ringkasan materi, capaian pembelajaran, atau instruksi bagi mahasiswa..."
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
