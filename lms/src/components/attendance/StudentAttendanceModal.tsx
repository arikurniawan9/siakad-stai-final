import React, { useState } from 'react';
import { 
  QrCode, 
  KeyRound, 
  FileText, 
  Upload, 
  Camera,
  AlertCircle
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../feedback/ToastContext';
import { attendanceService } from '../../services/attendanceService';
import { AttendanceStatus, AttendanceSessionStatus } from '../../types/attendance';

export interface StudentAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingNumber: number;
  meetingTitle: string;
  courseName: string;
  className: string;
  sessionStatus?: AttendanceSessionStatus;
  onSuccess: () => void;
}

export const StudentAttendanceModal: React.FC<StudentAttendanceModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  meetingNumber,
  meetingTitle,
  courseName,
  className,
  sessionStatus = 'DIBUKA',
  onSuccess
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'passcode' | 'scan' | 'izin'>('passcode');
  const [passcode, setPasscode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Leave Form States
  const [leaveStatus, setLeaveStatus] = useState<AttendanceStatus>('IZIN');
  const [leaveNotes, setLeaveNotes] = useState<string>('');
  const [attachmentFileName, setAttachmentFileName] = useState<string>('');

  const isSessionOpen = sessionStatus === 'DIBUKA';

  const handleSubmitPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode || passcode.trim().length !== 6) {
      toast.warning('Kode Tidak Valid', 'Silakan masukkan 6-digit kode presensi yang ditampilkan di layar proyektor.');
      return;
    }

    try {
      setIsLoading(true);
      await attendanceService.recordStudentAttendance(meetingId, {
        method: 'PASSCODE',
        passcode: passcode.trim()
      });
      toast.success('Presensi Berhasil', `Kehadiran Anda pada pertemuan #${meetingNumber} berhasil dicatat.`);
      setPasscode('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.danger('Gagal Presensi', err.response?.data?.error?.message || err.message || 'Kode presensi tidak sesuai.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    try {
      setIsLoading(true);
      const sessionData = await attendanceService.getMeetingSession(meetingId);
      const activeQrToken = sessionData.session.qrToken || `QR_${meetingId}_ACTIVE`;

      await attendanceService.recordStudentAttendance(meetingId, {
        method: 'QR_SCAN',
        qrToken: activeQrToken
      });
      toast.success('QR Terpindai', `Presensi via QR Code pada pertemuan #${meetingNumber} sukses tervalidasi.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.danger('Gagal Scan QR', err.response?.data?.error?.message || err.message || 'QR Code kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveNotes.trim()) {
      toast.warning('Alasan Diperlukan', 'Silakan jelaskan alasan permohonan izin/sakit.');
      return;
    }

    try {
      setIsLoading(true);
      await attendanceService.recordStudentAttendance(meetingId, {
        method: 'SURAT_IZIN',
        status: leaveStatus,
        notes: leaveNotes,
        attachmentUrl: attachmentFileName ? `https://storage.stai-alittihad.ac.id/surat-izin/${attachmentFileName}` : undefined
      });
      toast.success(
        'Permohonan Terkirim', 
        `Surat permohonan ${leaveStatus.toLowerCase()} berhasil dikirimkan kepada dosen pengampu.`
      );
      setLeaveNotes('');
      setAttachmentFileName('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.danger('Gagal Mengirim', err.response?.data?.error?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Presensi Kehadiran Perkuliahan"
      maxWidth="520px"
    >
      <div className="flex flex-col gap-4">
        {/* Info Header Card */}
        <div 
          style={{ 
            padding: 'var(--space-4)', 
            backgroundColor: 'var(--color-primary-50)', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--color-primary-200)',
            position: 'relative'
          }}
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span 
                style={{ 
                  backgroundColor: 'var(--color-primary-600)', 
                  color: 'white', 
                  fontSize: '11px', 
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                Pertemuan #{meetingNumber}
              </span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary-800)' }}>
                {className}
              </span>
            </div>

            {/* Session State Badge */}
            <span 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: isSessionOpen ? 'var(--color-success-bg)' : 'var(--color-slate-200)',
                color: isSessionOpen ? 'var(--color-success-dark)' : 'var(--color-slate-700)',
                border: `1px solid ${isSessionOpen ? 'var(--color-success-border)' : 'var(--border-strong)'}`
              }}
            >
              <span 
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: isSessionOpen ? 'var(--color-success-main)' : 'var(--color-slate-500)'
                }} 
              />
              {isSessionOpen ? 'Sesi Aktif' : 'Sesi Ditutup'}
            </span>
          </div>

          <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-primary-950)' }}>
            {courseName}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Topik: {meetingTitle}
          </div>
        </div>

        {/* Warning Banner if Session is NOT Open */}
        {!isSessionOpen && (
          <div 
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-warning-bg)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-warning-border)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-warning-dark)'
            }}
          >
            <AlertCircle size={16} color="var(--color-warning-main)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Catatan:</strong> Sesi presensi belum dibuka atau telah ditutup oleh dosen pengampu. Anda tetap dapat mengajukan <strong>Surat Izin / Sakit</strong> pada tab ke-3.
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="tabs-nav-container pb-1" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <Button
            variant={activeTab === 'passcode' ? 'primary' : 'ghost'}
            size="sm"
            type="button"
            icon={KeyRound}
            onClick={() => setActiveTab('passcode')}
            style={{ fontWeight: activeTab === 'passcode' ? 700 : 500 }}
          >
            Kode 6-Digit
          </Button>
          <Button
            variant={activeTab === 'scan' ? 'primary' : 'ghost'}
            size="sm"
            type="button"
            icon={QrCode}
            onClick={() => setActiveTab('scan')}
            style={{ fontWeight: activeTab === 'scan' ? 700 : 500 }}
          >
            Pindai QR Code
          </Button>
          <Button
            variant={activeTab === 'izin' ? 'primary' : 'ghost'}
            size="sm"
            type="button"
            icon={FileText}
            onClick={() => setActiveTab('izin')}
            style={{ fontWeight: activeTab === 'izin' ? 700 : 500 }}
          >
            Ajukan Izin / Sakit
          </Button>
        </div>

        {/* TAB 1: PASSCODE */}
        {activeTab === 'passcode' && (
          <form onSubmit={handleSubmitPasscode} className="flex flex-col gap-4">
            <div className="text-center py-2">
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                Masukkan <strong>6-digit angka presensi</strong> yang sedang ditampilkan oleh dosen pengampu di proyektor kelas:
              </p>
              <input
                type="text"
                maxLength={6}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="• • • • • •"
                autoFocus
                disabled={!isSessionOpen}
                style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  letterSpacing: '10px',
                  textAlign: 'center',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-xl)',
                  border: '2px solid var(--color-primary-500)',
                  backgroundColor: isSessionOpen ? 'var(--bg-surface)' : 'var(--color-slate-100)',
                  color: 'var(--color-primary-900)',
                  width: '240px',
                  margin: '0 auto',
                  display: 'block',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
                  outline: 'none'
                }}
              />
            </div>

            <div className="modal-footer" style={{ margin: 'var(--space-2) calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              <Button variant="secondary" type="button" onClick={onClose}>
                Batal
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                isLoading={isLoading} 
                disabled={passcode.length !== 6 || !isSessionOpen}
              >
                Kirim Presensi
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: QR SCAN */}
        {activeTab === 'scan' && (
          <div className="flex flex-col items-center gap-4 text-center py-3">
            <div 
              style={{
                width: '180px',
                height: '180px',
                border: '2px dashed var(--color-primary-500)',
                borderRadius: 'var(--radius-2xl)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-primary-50)',
                color: 'var(--color-primary-800)',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Camera size={44} color="var(--color-primary-600)" />
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                Kamera Pemindai QR
              </span>
              {/* Scan Beam Effect */}
              {isSessionOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '20%',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--color-primary-500)',
                    boxShadow: '0 0 8px var(--color-primary-400)'
                  }} 
                />
              )}
            </div>

            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.5 }}>
              Arahkan kamera gawai Anda ke layar proyektor dosen untuk memvalidasi token rotasi QR secara instan.
            </p>

            <Button
              variant="primary"
              icon={QrCode}
              isLoading={isLoading}
              disabled={!isSessionOpen}
              onClick={handleSimulateScan}
              size="lg"
            >
              Pindai QR Code Sekarang
            </Button>
          </div>
        )}

        {/* TAB 3: IZIN / SAKIT */}
        {activeTab === 'izin' && (
          <form onSubmit={handleSubmitLeave} className="flex flex-col gap-3.5">
            <Select
              label="Jenis Permohonan"
              value={leaveStatus}
              onChange={(e) => setLeaveStatus(e.target.value as AttendanceStatus)}
              options={[
                { value: 'IZIN', label: 'Izin (Keperluan Resmi / Mendesak)' },
                { value: 'SAKIT', label: 'Sakit (Disertai / Tanpa Surat Dokter)' }
              ]}
            />

            <div className="form-group">
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                Alasan / Keterangan Lengkap
              </label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Jelaskan alasan izin atau kondisi sakit Anda..."
                value={leaveNotes}
                onChange={(e) => setLeaveNotes(e.target.value)}
                required
                style={{ fontSize: 'var(--text-sm)' }}
              />
            </div>

            <Input
              label="Lampiran Surat Keterangan Dokter / Dinas (Opsional)"
              placeholder="Contoh: Surat_Keterangan_Dokter_Klinik.pdf"
              value={attachmentFileName}
              onChange={(e) => setAttachmentFileName(e.target.value)}
              helperText="Format: PDF, JPG, atau PNG (Maks 5MB)"
            />

            <div className="modal-footer" style={{ margin: 'var(--space-2) calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              <Button variant="secondary" type="button" onClick={onClose}>
                Batal
              </Button>
              <Button variant="primary" type="submit" isLoading={isLoading} icon={Upload}>
                Kirim Surat Permohonan
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
