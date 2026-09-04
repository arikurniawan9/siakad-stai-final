import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { InteractiveVideoPlayer } from '../../components/video/InteractiveVideoPlayer';
import { InteractiveVideo, VideoQuestionType } from '../../types/video';
import { videoService } from '../../services/videoService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface VideoPlayerPageProps {
  videoId: string;
  onBack: () => void;
}

export const VideoPlayerPage: React.FC<VideoPlayerPageProps> = ({ videoId, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [video, setVideo] = useState<InteractiveVideo | null>(null);
  const [addCheckpointModal, setAddCheckpointModal] = useState(false);

  // Checkpoint form state
  const [timestampMinutes, setTimestampMinutes] = useState(1);
  const [timestampSeconds, setTimestampSeconds] = useState(0);
  const [checkpointTitle, setCheckpointTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState<VideoQuestionType>('PILIHAN_GANDA');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctOptIndex, setCorrectOptIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  const isLecturer = user?.role === 'dosen' || user?.role === 'dosen_pa' || user?.role === 'administrator_sistem';

  const loadVideo = () => {
    const v = videoService.getVideoById(videoId);
    if (v) setVideo({ ...v });
  };

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  if (!video) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Video
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Video interaktif tidak ditemukan.</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const handleSaveCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    const totalSec = timestampMinutes * 60 + timestampSeconds;

    try {
      const options = questionType === 'BENAR_SALAH' ? [
        { id: 'opt-bs-1', text: 'Benar', isCorrect: correctOptIndex === 0 },
        { id: 'opt-bs-2', text: 'Salah', isCorrect: correctOptIndex === 1 },
      ] : [
        { id: 'opt-1', text: opt1, isCorrect: correctOptIndex === 0 },
        { id: 'opt-2', text: opt2, isCorrect: correctOptIndex === 1 },
        { id: 'opt-3', text: opt3, isCorrect: correctOptIndex === 2 },
      ];

      videoService.addCheckpoint(video.id, {
        videoId: video.id,
        timestampSeconds: totalSec,
        title: checkpointTitle,
        questionText,
        type: questionType,
        options,
        explanation,
        isRequired: true,
        allowRetry: true
      });

      loadVideo();
      setAddCheckpointModal(false);
      // Reset form
      setCheckpointTitle('');
      setQuestionText('');
      setOpt1('');
      setOpt2('');
      setOpt3('');
      setExplanation('');
      toast.success('Titik Pertanyaan Ditambahkan', `Pertanyaan berhasil disematkan pada menit ${timestampMinutes}:${timestampSeconds.toString().padStart(2, '0')}.`);
    } catch (err: any) {
      toast.danger('Gagal', err.message);
    }
  };

  const handleDeleteCheckpoint = (chkId: string) => {
    videoService.deleteCheckpoint(video.id, chkId);
    loadVideo();
    toast.info('Dihapus', 'Titik pertanyaan telah dihapus dari video.');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Navigation */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke {KAMUS_UI.VIDEO_INTERAKTIF}
        </Button>

        {isLecturer && (
          <Button 
            variant="primary" 
            size="sm" 
            icon={Plus} 
            onClick={() => setAddCheckpointModal(true)}
          >
            Tambah Titik Pertanyaan Baru
          </Button>
        )}
      </div>

      {/* Main Interactive Player Component */}
      <InteractiveVideoPlayer 
        video={video} 
        onCompleted={() => loadVideo()} 
      />

      {/* Checkpoints Overview Timeline */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Daftar Titik Pertanyaan Interaktif ({video.checkpoints.length})</CardTitle>
            <CardSubtitle>Video akan dijeda secara otomatis saat pemutaran mencapai titik waktu di bawah ini</CardSubtitle>
          </div>
        </CardHeader>
        <CardBody>
          {video.checkpoints.length === 0 ? (
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-4)' }}>
              Belum ada pertanyaan interaktif yang disematkan pada video ini.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {video.checkpoints.map((chk, idx) => (
                <div 
                  key={chk.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="primary" style={{ fontFamily: 'var(--font-mono)' }}>
                      {formatTime(chk.timestampSeconds)}
                    </Badge>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                        #{idx + 1} {chk.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {chk.questionText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={chk.isRequired ? 'warning' : 'default'}>
                      {chk.isRequired ? 'Wajib Dijawab' : 'Opsional'}
                    </Badge>
                    {isLecturer && (
                      <button 
                        onClick={() => handleDeleteCheckpoint(chk.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--color-danger-main)', padding: '6px' }}
                        title="Hapus Checkpoint"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* MODAL: Tambah Titik Pertanyaan Baru (Dosen Authoring Studio) */}
      <Modal
        isOpen={addCheckpointModal}
        onClose={() => setAddCheckpointModal(false)}
        title="Tambah Titik Pertanyaan Interaktif"
        maxWidth="600px"
      >
        <form onSubmit={handleSaveCheckpoint} className="flex flex-col gap-4">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Input
              label="Titik Waktu (Menit)"
              type="number"
              min={0}
              max={Math.floor(video.durationSeconds / 60)}
              value={timestampMinutes}
              onChange={(e) => setTimestampMinutes(parseInt(e.target.value) || 0)}
              required
            />
            <Input
              label="Titik Waktu (Detik)"
              type="number"
              min={0}
              max={59}
              value={timestampSeconds}
              onChange={(e) => setTimestampSeconds(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <Input
            label="Judul Pertanyaan"
            placeholder="Contoh: Pemahaman Kaidah Ushul..."
            value={checkpointTitle}
            onChange={(e) => setCheckpointTitle(e.target.value)}
            required
          />

          <div className="form-group">
            <label className="form-label">Teks Pertanyaan</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Tuliskan pertanyaan yang harus dijawab mahasiswa..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
            />
          </div>

          <Select
            label="Tipe Pertanyaan"
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value as VideoQuestionType)}
            options={[
              { value: 'PILIHAN_GANDA', label: 'Pilihan Ganda (3 Opsi)' },
              { value: 'BENAR_SALAH', label: 'Benar / Salah' },
            ]}
          />

          {questionType === 'PILIHAN_GANDA' ? (
            <div className="flex flex-col gap-2">
              <span className="form-label">Pilihan Opsi & Kunci Jawaban Benar:</span>
              
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-opt"
                  checked={correctOptIndex === 0}
                  onChange={() => setCorrectOptIndex(0)}
                />
                <input
                  className="form-input"
                  placeholder="Pilihan A (Ketik teks opsi)..."
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-opt"
                  checked={correctOptIndex === 1}
                  onChange={() => setCorrectOptIndex(1)}
                />
                <input
                  className="form-input"
                  placeholder="Pilihan B (Ketik teks opsi)..."
                  value={opt2}
                  onChange={(e) => setOpt2(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correct-opt"
                  checked={correctOptIndex === 2}
                  onChange={() => setCorrectOptIndex(2)}
                />
                <input
                  className="form-input"
                  placeholder="Pilihan C (Ketik teks opsi)..."
                  value={opt3}
                  onChange={(e) => setOpt3(e.target.value)}
                  required
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="form-label">Kunci Jawaban yang Benar:</span>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="correct-bs"
                  checked={correctOptIndex === 0}
                  onChange={() => setCorrectOptIndex(0)}
                />
                <span>Pernyataan Benar</span>
              </label>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="correct-bs"
                  checked={correctOptIndex === 1}
                  onChange={() => setCorrectOptIndex(1)}
                />
                <span>Pernyataan Salah</span>
              </label>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Penjelasan / Pembahasan Jawaban</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="Berikan penjelasan edukatif yang muncul setelah mahasiswa menjawab..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
            />
          </div>

          <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
            <Button variant="secondary" type="button" onClick={() => setAddCheckpointModal(false)}>
              {KAMUS_UI.BATAL}
            </Button>
            <Button variant="primary" type="submit">
              {KAMUS_UI.SIMPAN} Titik Pertanyaan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
