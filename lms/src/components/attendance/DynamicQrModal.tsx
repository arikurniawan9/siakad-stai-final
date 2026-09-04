import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  Users, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Copy, 
  Check, 
  X
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useToast } from '../feedback/ToastContext';

export interface DynamicQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingNumber: number;
  meetingTitle: string;
  courseName: string;
  className: string;
  qrToken: string;
  passcode: string;
  attendancePercentage: number;
  presentCount: number;
  totalStudents: number;
  onRefreshQr: () => Promise<void>;
  onCloseSession: () => void;
}

export const DynamicQrModal: React.FC<DynamicQrModalProps> = ({
  isOpen,
  onClose,
  meetingNumber,
  meetingTitle,
  courseName,
  className,
  qrToken,
  passcode,
  attendancePercentage,
  presentCount,
  totalStudents,
  onRefreshQr,
  onCloseSession
}) => {
  const toast = useToast();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Countdown timer & auto-refresh token
  useEffect(() => {
    if (!isOpen) return;

    setSecondsRemaining(30);
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          handleAutoRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, qrToken]);

  const handleAutoRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefreshQr();
    } catch {
      // Ignored
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyPasscode = () => {
    navigator.clipboard.writeText(passcode);
    setIsCopied(true);
    toast.success('Kode Disalin', `Kode presensi ${passcode} berhasil disalin ke papan klip.`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generate SVG QR Matrix based on qrToken
  const generateQrSvgMatrix = (text: string) => {
    const size = 21;
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const grid: boolean[][] = [];
    for (let r = 0; r < size; r++) {
      grid[r] = [];
      for (let c = 0; c < size; c++) {
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= size - 7;
        const isBottomLeft = r >= size - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isTopLeft ? r : (isTopRight ? r : r - (size - 7));
          const lc = isTopLeft ? c : (isTopRight ? c - (size - 7) : c);
          const isOuterBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isInnerCenter = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          grid[r][c] = isOuterBorder || isInnerCenter;
        } else {
          const bitIndex = (r * size + c + Math.abs(hash)) % 31;
          grid[r][c] = ((hash >> bitIndex) & 1) === 1 || (r % 2 === 0 && c % 3 === 0);
        }
      }
    }

    return grid;
  };

  const qrGrid = generateQrSvgMatrix(qrToken || 'SALAM_STAI_AL_ITTIHAD_2026');

  const content = (
    <div className={`flex flex-col items-center gap-5 text-center ${isFullscreen ? 'p-8 bg-slate-900 text-white min-h-screen justify-center' : ''}`}>
      {/* Header Info */}
      <div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <Badge variant="primary" style={{ fontSize: '11px' }}>
            Pertemuan #{meetingNumber}
          </Badge>
          <Badge variant="success" style={{ fontSize: '11px' }}>
            SESI PRESENSI AKTIF
          </Badge>
          <span style={{ fontSize: 'var(--text-xs)', color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>
            {className}
          </span>
        </div>
        <h2 style={{ fontSize: isFullscreen ? '28px' : 'var(--text-xl)', fontWeight: 'bold', margin: '4px 0' }}>
          {courseName}
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: isFullscreen ? '#cbd5e1' : 'var(--text-secondary)' }}>
          {meetingTitle}
        </p>
      </div>

      {/* QR Display Card */}
      <div 
        style={{
          position: 'relative',
          padding: isFullscreen ? '28px' : '20px',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-xl)',
          boxShadow: isFullscreen ? '0 20px 40px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.12)',
          border: '3px solid var(--color-primary-600)',
          display: 'inline-block'
        }}
      >
        <svg 
          width={isFullscreen ? "320" : "240"} 
          height={isFullscreen ? "320" : "240"} 
          viewBox="0 0 21 21" 
          style={{ display: 'block' }}
        >
          <rect width="21" height="21" fill="white" />
          {qrGrid.map((row, rIdx) =>
            row.map((cell, cIdx) =>
              cell ? (
                <rect
                  key={`${rIdx}-${cIdx}`}
                  x={cIdx}
                  y={rIdx}
                  width="1.02"
                  height="1.02"
                  fill="#064e3b"
                />
              ) : null
            )
          )}
        </svg>

        {/* Center Logo Badge */}
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'white',
            borderRadius: 'var(--radius-full)',
            padding: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}
        >
          <div 
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: 'var(--color-primary-700)',
              color: 'white',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          >
            S
          </div>
        </div>
      </div>

      {/* Countdown Progress & Refresh */}
      <div className="flex items-center gap-3 w-full max-w-sm">
        <div style={{ flex: 1, height: '6px', backgroundColor: isFullscreen ? '#334155' : 'var(--color-slate-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              backgroundColor: secondsRemaining > 10 ? 'var(--color-primary-500)' : 'var(--color-danger-500)', 
              width: `${(secondsRemaining / 30) * 100}%`,
              transition: 'width 1s linear'
            }} 
          />
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>
          <Clock size={13} />
          <span>{secondsRemaining}s</span>
        </div>
        <button
          type="button"
          onClick={handleAutoRefresh}
          disabled={isRefreshing}
          style={{
            background: 'none',
            border: 'none',
            color: isFullscreen ? '#38bdf8' : 'var(--color-primary-600)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
          title="Perbarui QR Sekarang"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Passcode Backup Box */}
      <div 
        style={{
          padding: '12px 24px',
          backgroundColor: isFullscreen ? '#1e293b' : 'var(--color-slate-50)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <span style={{ fontSize: 'var(--text-xs)', color: isFullscreen ? '#94a3b8' : 'var(--text-muted)' }}>
          Kode Presensi 6-Digit (Alternatif Tanpa Scan):
        </span>
        <div className="flex items-center gap-3">
          <span 
            style={{ 
              fontSize: isFullscreen ? '32px' : '26px', 
              fontWeight: '900', 
              letterSpacing: '6px', 
              color: isFullscreen ? '#38bdf8' : 'var(--color-primary-800)',
              fontFamily: 'monospace'
            }}
          >
            {passcode}
          </span>
          <button
            type="button"
            onClick={handleCopyPasscode}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: isFullscreen ? '#334155' : 'white',
              cursor: 'pointer',
              color: isCopied ? 'var(--color-success-main)' : 'inherit'
            }}
            title="Salin Kode"
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Live Attendees Counter */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          width: '100%', 
          maxWidth: '440px',
          padding: '12px 18px',
          backgroundColor: isFullscreen ? '#1e293b' : 'var(--color-emerald-50)',
          border: '1px solid var(--color-emerald-200)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div className="flex items-center gap-2" style={{ color: isFullscreen ? '#34d399' : 'var(--color-emerald-800)' }}>
          <Users size={18} />
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
            Mahasiswa Hadir:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: isFullscreen ? 'white' : 'var(--color-emerald-900)' }}>
            {presentCount} / {totalStudents} Mahasiswa
          </span>
          <Badge variant={attendancePercentage >= 75 ? 'success' : 'warning'}>
            {attendancePercentage}%
          </Badge>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full" style={{ marginTop: 'var(--space-2)' }}>
        <Button
          variant={isFullscreen ? 'secondary' : 'outline'}
          size="sm"
          icon={isFullscreen ? Minimize2 : Maximize2}
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? 'Keluar Mode Layar Penuh' : 'Mode Layar Proyektor'}
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={onCloseSession}
        >
          Tutup Sesi Presensi
        </Button>

        {isFullscreen && (
          <Button
            variant="secondary"
            size="sm"
            icon={X}
            onClick={() => setIsFullscreen(false)}
          >
            Kembali
          </Button>
        )}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          overflowY: 'auto'
        }}
      >
        {content}
      </div>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="QR Code Presensi Kuliah Interaktif"
      maxWidth="560px"
    >
      {content}
    </Modal>
  );
};
