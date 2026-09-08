import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { InteractiveVideo, VideoQuestionCheckpoint, StudentVideoProgress } from '../../types/video';
import { videoService } from '../../services/videoService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface InteractiveVideoPlayerProps {
  video: InteractiveVideo;
  onCompleted?: () => void;
}

// Utility untuk mengekstrak YouTube ID dari berbagai format URL
export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({ video, onCompleted }) => {
  const { user } = useAuth();
  const toast = useToast();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSeconds || 300);
  const [isMuted, setIsMuted] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);
  const [progress, setProgress] = useState<StudentVideoProgress | null>(null);
  
  // Checkpoint modal state
  const [activeCheckpoint, setActiveCheckpoint] = useState<VideoQuestionCheckpoint | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [answerFeedback, setAnswerFeedback] = useState<{ isCorrect: boolean; explanation?: string } | null>(null);
  const [showResumeDialog, setShowResumeDialog] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<any>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const triggeredCheckpointsRef = useRef<Set<string>>(new Set());

  const youtubeId = getYouTubeVideoId(video.videoUrl);

  // Load existing progress
  useEffect(() => {
    if (!user) return;
    const existing = videoService.getStudentProgress(video.id, user.id);
    if (existing) {
      setProgress(existing);
      // Catat checkpoint yang sudah dijawab
      existing.answeredQuestions.forEach((ans) => {
        if (ans.isCorrect) triggeredCheckpointsRef.current.add(ans.checkpointId);
      });
      if (existing.lastPositionSeconds > 5 && !existing.isCompleted) {
        setShowResumeDialog(true);
      }
    }
    setHasMediaError(false);
  }, [video.id, user]);

  const syncProgress = useCallback((pos: number, durationElapsed = 5) => {
    if (!user) return;
    try {
      const updated = videoService.updateStudentProgress(
        video.id,
        user.id,
        user.identityNumber || '21.01.0042',
        user.name,
        pos,
        durationElapsed
      );
      setProgress(updated);
      if (updated.isCompleted && !progress?.isCompleted) {
        toast.success('Penyelesaian Video Tercapai', 'Selamat! Anda telah memenuhi syarat tontonan minimum dan menjawab semua pertanyaan.');
        if (onCompleted) onCompleted();
      }
    } catch (e) {
      console.warn('Gagal sinkronisasi progres video:', e);
    }
  }, [video.id, user, progress, toast, onCompleted]);

  // Evaluasi checkpoint pada timestamp tertentu
  const checkTimeForCheckpoints = useCallback((curTime: number) => {
    video.checkpoints.forEach((chk) => {
      const isAlreadyAnswered = progress?.answeredQuestions.some(
        (ans) => ans.checkpointId === chk.id && ans.isCorrect
      );

      if (!isAlreadyAnswered && !triggeredCheckpointsRef.current.has(chk.id)) {
        // Toleransi waktu 0.75 detik
        if (Math.abs(curTime - chk.timestampSeconds) < 0.8) {
          if (youtubeId && ytPlayerRef.current?.pauseVideo) {
            ytPlayerRef.current.pauseVideo();
          } else if (videoRef.current) {
            videoRef.current.pause();
          }
          setIsPlaying(false);
          setActiveCheckpoint(chk);
          triggeredCheckpointsRef.current.add(chk.id);
          setSelectedOptionId('');
          setTextAnswer('');
          setAnswerFeedback(null);
        }
      }
    });

    // Throttled sync: setiap 5 detik
    if (Math.abs(curTime - lastSyncTimeRef.current) >= 5) {
      syncProgress(curTime, 5);
      lastSyncTimeRef.current = curTime;
    }
  }, [video.checkpoints, progress, youtubeId, syncProgress]);

  // Inisialisasi YouTube Player jika URL merupakan tautan YouTube
  useEffect(() => {
    if (!youtubeId) return;

    let isSubscribed = true;

    const initYT = () => {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      if (!isSubscribed) return;

      try {
        const container = document.getElementById('salam-yt-player');
        if (!container) return;

        ytPlayerRef.current = new (window as any).YT.Player('salam-yt-player', {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            origin: window.location.origin
          },
          events: {
            onReady: (event: any) => {
              if (!isSubscribed) return;
              const dur = event.target.getDuration();
              if (dur && dur > 0) setDuration(dur);
            },
            onStateChange: (event: any) => {
              if (!isSubscribed) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsPlaying(true);
                if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
                ytIntervalRef.current = setInterval(() => {
                  if (ytPlayerRef.current?.getCurrentTime) {
                    const t = ytPlayerRef.current.getCurrentTime();
                    setCurrentTime(t);
                    checkTimeForCheckpoints(t);
                  }
                }, 500);
              } else if (event.data === 2) {
                setIsPlaying(false);
                if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
              } else if (event.data === 0) {
                setIsPlaying(false);
                if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
                syncProgress(duration, 5);
              }
            }
          }
        });
      } catch (err) {
        console.warn('Gagal memuat YouTube player:', err);
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      const existingTag = document.getElementById('youtube-iframe-api');
      if (!existingTag) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }
      const prevHandler = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevHandler) prevHandler();
        initYT();
      };
    }

    return () => {
      isSubscribed = false;
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [youtubeId, checkTimeForCheckpoints, duration, syncProgress]);

  // Handle Play/Pause HTML5
  const togglePlay = () => {
    if (youtubeId && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setHasMediaError(false);
      }).catch((e) => {
        console.warn('Playback error:', e);
        setHasMediaError(true);
      });
    }
  };

  // Time update loop HTML5
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    setCurrentTime(cur);
    checkTimeForCheckpoints(cur);
  };

  // Resume playback handler
  const handleResumePlayback = () => {
    if (progress) {
      const pos = progress.lastPositionSeconds;
      setCurrentTime(pos);
      setShowResumeDialog(false);

      if (youtubeId && ytPlayerRef.current?.seekTo) {
        ytPlayerRef.current.seekTo(pos, true);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } else if (videoRef.current) {
        videoRef.current.currentTime = pos;
        togglePlay();
      }
      toast.info('Lanjutkan Tontonan', `Melanjutkan dari menit ${formatTime(pos)}.`);
    }
  };

  const handleStartFromBeginning = () => {
    if (youtubeId && ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(0, true);
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      togglePlay();
    }
    setShowResumeDialog(false);
  };

  // Submit answer
  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckpoint || !user) return;

    const result = videoService.submitQuestionAnswer(
      video.id,
      user.id,
      activeCheckpoint.id,
      selectedOptionId || undefined,
      textAnswer || undefined
    );

    setAnswerFeedback(result);
    setProgress(result.progress);

    if (result.isCorrect) {
      toast.success('Jawaban Benar!', 'Luar biasa, Anda dapat melanjutkan video.');
    } else {
      toast.danger('Jawaban Belum Tepat', activeCheckpoint.allowRetry ? 'Silakan pelajari pembahasan atau coba kembali.' : 'Melanjutkan materi.');
    }
  };

  const handleContinueAfterCheckpoint = () => {
    const resumeTargetSec = (activeCheckpoint?.timestampSeconds || currentTime) + 1.2;
    setActiveCheckpoint(null);
    setAnswerFeedback(null);

    if (youtubeId && ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(resumeTargetSec, true);
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } else if (videoRef.current) {
      // Majukan 1.2 detik agar tidak langsung men-trigger ulang checkpoint yang sama
      videoRef.current.currentTime = resumeTargetSec;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Seek bar scrubber
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    
    // Anti-skipping protection
    if (!video.allowFastForward && progress && user?.role === 'mahasiswa') {
      const allowedMax = (progress.maxWatchedPositionSeconds || 0) + 2;
      if (targetSec > allowedMax) {
        toast.warning('Proteksi Pembelajaran', 'Anda belum dapat melompati video yang belum ditonton.');
        return;
      }
    }

    if (youtubeId && ytPlayerRef.current?.seekTo) {
      ytPlayerRef.current.seekTo(targetSec, true);
      setCurrentTime(targetSec);
    } else if (videoRef.current) {
      videoRef.current.currentTime = targetSec;
      setCurrentTime(targetSec);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Video Shell Container */}
      <Card style={{ overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <div 
          style={{ 
            position: 'relative', 
            width: '100%', 
            aspectRatio: '16/9', 
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {youtubeId ? (
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div id="salam-yt-player" style={{ width: '100%', height: '100%' }} />
            </div>
          ) : hasMediaError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white gap-3">
              <AlertTriangle size={48} color="var(--color-warning-main)" />
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Gagal Memuat Aliran Media</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-300)', maxWidth: '420px' }}>
                Sumber video tidak dapat diputar langsung oleh peramban. Pastikan format video berupa MP4 H.264 atau tautan publik YouTube yang valid.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm" 
                  icon={RefreshCw}
                  onClick={() => {
                    setHasMediaError(false);
                    if (videoRef.current) {
                      videoRef.current.load();
                      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setHasMediaError(true));
                    }
                  }}
                >
                  Muat Ulang
                </Button>
                <a 
                  href={video.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm flex items-center gap-1"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={14} /> Buka Sumber Langsung
                </a>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                src={video.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onError={() => setHasMediaError(true)}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration || video.durationSeconds);
                    setHasMediaError(false);
                  }
                }}
                onEnded={() => {
                  setIsPlaying(false);
                  syncProgress(duration, 5);
                }}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                playsInline
              />

              {/* Big Play Overlay if paused */}
              {!isPlaying && !activeCheckpoint && (
                <button
                  onClick={togglePlay}
                  style={{
                    position: 'absolute',
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(4, 120, 87, 0.9)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid white',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    cursor: 'pointer',
                    transition: 'transform 150ms ease',
                    zIndex: 4
                  }}
                  aria-label="Putar video"
                >
                  <Play size={32} style={{ marginLeft: '4px' }} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Custom Player Controls Bar */}
        <div 
          style={{ 
            padding: 'var(--space-3) var(--space-4)', 
            backgroundColor: 'var(--color-slate-900)', 
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)'
          }}
        >
          {/* Progress Scrubber with Checkpoint Markers */}
          <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              style={{
                width: '100%',
                height: '6px',
                accentColor: 'var(--color-primary-500)',
                cursor: 'pointer',
                zIndex: 2
              }}
            />

            {/* Render Checkpoint Dots on Scrubber */}
            {video.checkpoints.map((chk) => {
              const posPercent = Math.min(100, Math.max(0, (chk.timestampSeconds / (duration || 300)) * 100));
              const isAnswered = progress?.answeredQuestions.some(
                (a) => a.checkpointId === chk.id && a.isCorrect
              );

              return (
                <div
                  key={chk.id}
                  title={`Pertanyaan di ${formatTime(chk.timestampSeconds)}: ${chk.title}`}
                  style={{
                    position: 'absolute',
                    left: `${posPercent}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '12px',
                    height: '12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isAnswered ? 'var(--color-success-main)' : 'var(--color-warning-main)',
                    border: '2px solid white',
                    zIndex: 3,
                    pointerEvents: 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Controls Lower Bar */}
          <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)' }}>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={togglePlay}
                style={{ color: 'white', padding: '4px' }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </Button>

              <button 
                onClick={() => {
                  const targetSec = Math.max(0, currentTime - 10);
                  if (youtubeId && ytPlayerRef.current?.seekTo) {
                    ytPlayerRef.current.seekTo(targetSec, true);
                    setCurrentTime(targetSec);
                  } else if (videoRef.current) {
                    videoRef.current.currentTime = targetSec;
                    setCurrentTime(targetSec);
                  }
                }}
                style={{ color: 'var(--color-slate-300)', background: 'none', border: 'none', cursor: 'pointer' }}
                title="Mundur 10 Detik"
              >
                <RotateCcw size={16} />
              </button>

              <span style={{ color: 'var(--color-slate-300)', fontFamily: 'var(--font-mono)' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline" style={{ color: 'var(--color-slate-400)' }}>Pertanyaan:</span>
                <span style={{ fontWeight: 'bold', color: '#a7f3d0' }}>
                  {progress?.answeredQuestions.filter((a) => a.isCorrect).length || 0}/{video.checkpoints.length} Selesai
                </span>
              </div>

              {!youtubeId && (
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Video Info & Real-Time Completion Criteria */}
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" style={{ marginBottom: 'var(--space-3)' }}>
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
                <Badge variant="primary">Pertemuan {video.meetingNumber}</Badge>
                <Badge variant={progress?.isCompleted ? 'success' : 'warning'}>
                  {progress?.isCompleted ? KAMUS_UI.STATUS_SELESAI : KAMUS_UI.STATUS_SEDANG_DIPELAJARI}
                </Badge>
                {youtubeId && (
                  <Badge variant="default" style={{ backgroundColor: '#ff0000', color: 'white', border: 'none' }}>
                    YouTube HD
                  </Badge>
                )}
              </div>
              <h2 style={{ fontSize: 'var(--text-xl)' }}>{video.title}</h2>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{video.courseName}</p>
            </div>

            {/* Watched Percentage Gauge */}
            <div style={{ textAlign: 'right', minWidth: '160px' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Progres Tontonan Sah: <strong>{progress?.effectiveWatchedPercentage || 0}%</strong> (Syarat Min: {video.minWatchedPercentage}%)
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${progress?.effectiveWatchedPercentage || 0}%`, 
                    height: '100%', 
                    backgroundColor: (progress?.effectiveWatchedPercentage || 0) >= video.minWatchedPercentage ? 'var(--color-success-main)' : 'var(--color-primary-600)',
                    transition: 'width 300ms ease'
                  }} 
                />
              </div>
            </div>
          </div>

          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {video.description}
          </p>
        </CardBody>
      </Card>

      {/* MODAL 1: Dialog Pertanyaan Checkpoint (Interactive Question Overlay) */}
      <Modal
        isOpen={!!activeCheckpoint}
        onClose={() => {}} // User MUST answer to proceed if required!
        title={activeCheckpoint?.title || 'Pertanyaan Pemahaman'}
        maxWidth="600px"
      >
        {activeCheckpoint && (
          <form onSubmit={handleSubmitAnswer} className="flex flex-col gap-4">
            <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-primary-200)' }}>
              <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', fontWeight: 'bold' }}>
                <HelpCircle size={14} />
                <span>Titik Waktu: {formatTime(activeCheckpoint.timestampSeconds)}</span>
              </div>
              <p style={{ fontWeight: 'bold', fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginTop: '4px' }}>
                {activeCheckpoint.questionText}
              </p>
            </div>

            {/* Pilihan Jawaban */}
            {!answerFeedback && (
              <div className="flex flex-col gap-2">
                {activeCheckpoint.type === 'PILIHAN_GANDA' || activeCheckpoint.type === 'BENAR_SALAH' ? (
                  activeCheckpoint.options.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-start gap-3"
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        border: `1px solid ${selectedOptionId === opt.id ? 'var(--color-primary-600)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: selectedOptionId === opt.id ? 'var(--color-primary-50)' : 'var(--bg-surface)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)'
                      }}
                    >
                      <input
                        type="radio"
                        name="checkpoint-option"
                        value={opt.id}
                        checked={selectedOptionId === opt.id}
                        onChange={() => setSelectedOptionId(opt.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <span>{opt.text}</span>
                    </label>
                  ))
                ) : (
                  <div className="form-group">
                    <label className="form-label">Jawaban Anda</label>
                    <input
                      className="form-input"
                      placeholder="Ketikkan jawaban singkat Anda di sini..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* Feedback / Pembahasan Box */}
            {answerFeedback && (
              <div 
                className="flex flex-col gap-3" 
                style={{ 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: answerFeedback.isCorrect ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                  border: `1px solid ${answerFeedback.isCorrect ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`
                }}
              >
                <div className="flex items-center gap-2">
                  {answerFeedback.isCorrect ? (
                    <CheckCircle2 size={20} color="var(--color-success-main)" />
                  ) : (
                    <AlertCircle size={20} color="var(--color-danger-main)" />
                  )}
                  <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                    {answerFeedback.isCorrect ? 'Jawaban Anda Benar!' : 'Jawaban Belum Tepat'}
                  </span>
                </div>

                {answerFeedback.explanation && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <strong>Pembahasan Materi:</strong> {answerFeedback.explanation}
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              {!answerFeedback ? (
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={!selectedOptionId && !textAnswer.trim()}
                >
                  Kirim Jawaban
                </Button>
              ) : answerFeedback.isCorrect || !activeCheckpoint.allowRetry ? (
                <Button 
                  variant="primary" 
                  type="button" 
                  onClick={handleContinueAfterCheckpoint}
                >
                  Lanjutkan Video Pembelajaran
                </Button>
              ) : (
                <Button 
                  variant="secondary" 
                  type="button" 
                  onClick={() => setAnswerFeedback(null)}
                >
                  Coba Jawab Lagi
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: Dialog Lanjutkan Tontonan (Resume Playback) */}
      <Modal
        isOpen={showResumeDialog}
        onClose={() => setShowResumeDialog(false)}
        title="Lanjutkan Tontonan Terakhir?"
        maxWidth="460px"
        footer={
          <>
            <Button variant="secondary" onClick={handleStartFromBeginning}>
              Tonton dari Awal
            </Button>
            <Button variant="primary" icon={Play} onClick={handleResumePlayback}>
              Lanjutkan ({progress ? formatTime(progress.lastPositionSeconds) : '00:00'})
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3">
          <Clock size={28} color="var(--color-primary-700)" />
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Anda sebelumnya telah menonton video ini hingga menit <strong>{progress ? formatTime(progress.lastPositionSeconds) : '00:00'}</strong>. 
            Apakah ingin melanjutkan dari posisi tersebut?
          </p>
        </div>
      </Modal>
    </div>
  );
};
