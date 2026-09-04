import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  Upload, 
  AlertTriangle, 
  Send,
  FileText,
  Trash2,
  Sparkles,
  Award,
  Clock,
  RotateCcw,
  File
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Assignment, AssignmentSubmission } from '../../types/assignment';
import { assignmentService } from '../../services/assignmentService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { KAMUS_UI } from '../../constants/dictionary';

export interface TugasDetailPageProps {
  assignmentId: string;
  onBack: () => void;
}

export const TugasDetailPage: React.FC<TugasDetailPageProps> = ({ assignmentId, onBack }) => {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<'instruksi' | 'rubrik' | 'pengumpulan' | 'riwayat'>('instruksi');

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [textContent, setTextContent] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const loadData = async () => {
    try {
      const asg = await assignmentService.fetchAssignmentById(assignmentId);
      if (asg) setAssignment(asg);
      if (user) {
        const sub = assignmentService.getStudentSubmission(assignmentId, user.id);
        if (sub) {
          setSubmission(sub);
          setTextContent(sub.textContent || '');
        }
      }
    } catch {
      const asg = assignmentService.getAssignmentById(assignmentId);
      if (asg) setAssignment(asg);
      if (user) {
        const sub = assignmentService.getStudentSubmission(assignmentId, user.id);
        if (sub) {
          setSubmission(sub);
          setTextContent(sub.textContent || '');
        }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId, user]);

  // File selection & validation handler
  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileDataUrl('');
      return;
    }

    const validation = assignmentService.validateFileUpload(
      file.name,
      file.size,
      assignment?.allowedFileExtensions || ['.pdf', '.docx', '.zip'],
      assignment?.maxFileSizeBytes || 10485760
    );

    if (!validation.isValid) {
      toast.danger('Berkas Tidak Sah', validation.errorMessage || 'Format atau ukuran berkas tidak memenuhi syarat.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    toast.success('Berkas Terpilih', `Berkas ${file.name} (${assignmentService.formatFileSize(file.size)}) siap diunggah.`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSubmittedFile = (fileName?: string, fileUrl?: string, dataUrl?: string) => {
    if (!fileName) return;

    if (fileUrl && fileUrl !== '#' && !fileUrl.startsWith('data:')) {
      window.open(fileUrl, '_blank');
      return;
    }

    if (dataUrl && dataUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Unduh Berkas', `Mengunduh berkas ${fileName}`);
    } else {
      const blob = new Blob([`SALAM LMS - STAI AL-ITTIHAD\nNama Berkas: ${fileName}\nPengumpul: ${user?.name || 'Mahasiswa'}\nWaktu: ${new Date().toISOString()}`], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Unduh Berkas', `Mengunduh dokumen: ${fileName}`);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !assignment) {
      toast.danger('Gagal', 'Anda harus masuk sebagai mahasiswa.');
      return;
    }

    const requiresFile = assignment.submissionType === 'BERKAS_UNGGAHAN' || assignment.submissionType === 'KEDUANYA';
    const requiresText = assignment.submissionType === 'TEKS_DARING';

    if (requiresFile && !selectedFile && !submission) {
      toast.warning('Berkas Diperlukan', 'Silakan pilih atau unggah berkas dokumen tugas Anda.');
      return;
    }

    if (requiresText && !textContent.trim()) {
      toast.warning('Teks Jawaban Diperlukan', 'Silakan isi teks jawaban atau lembar tugas Anda.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(20);

    try {
      let uploadedUrl: string | undefined = undefined;
      if (selectedFile) {
        setUploadProgress(50);
        const uploadRes = await assignmentService.uploadFile(selectedFile, 'submissions');
        uploadedUrl = uploadRes.publicUrl;
        setUploadProgress(80);
      }

      const sub = assignmentService.submitAssignment(
        assignment.id,
        user.id,
        user.identityNumber || '21.01.0042',
        user.name,
        {
          fileUrl: uploadedUrl || submission?.fileUrl,
          fileName: selectedFile ? selectedFile.name : (submission?.fileName || undefined),
          fileSizeBytes: selectedFile ? selectedFile.size : (submission?.fileSizeBytes || undefined),
          fileMimeType: selectedFile ? selectedFile.type : (submission?.fileMimeType || 'application/pdf'),
          fileDataUrl: fileDataUrl || submission?.fileDataUrl || undefined,
          textContent: textContent || undefined,
          studentNotes: submissionNote || undefined,
          note: submissionNote || undefined
        }
      );

      setUploadProgress(100);
      setSubmission(sub);
      setSelectedFile(null);
      setSubmissionNote('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadData();

      toast.success(
        'Tugas Berhasil Dikumpulkan',
        `Pengumpulan tugas (Versi ${sub.version}) berhasil tersimpan pada ${new Date(sub.submittedAt).toLocaleTimeString('id-ID')} WIB.`
      );
      setActiveTab('pengumpulan');
    } catch (err: any) {
      toast.danger('Pengumpulan Gagal', err.message || 'Terjadi kendala saat mengumpulkan tugas.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!assignment) {
    return (
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar Tugas
        </Button>
        <Card>
          <CardBody style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
            <p className="text-muted">Data tugas tidak ditemukan atau sedang dimuat...</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const isDueDatePassed = new Date() > new Date(assignment.dueDate);

  return (
    <div className="flex flex-col gap-6" style={{ width: '100%' }}>
      {/* Top Breadcrumb */}
      <div className="flex justify-between items-center">
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
          Kembali ke Daftar {KAMUS_UI.TUGAS}
        </Button>
      </div>

      {/* Assignment Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <Badge variant="primary">Pertemuan #{assignment.meetingNumber}</Badge>
                <Badge variant={
                  submission?.status === 'SUDAH_DINILAI' 
                    ? 'success' 
                    : submission?.status === 'PERLU_REVISI'
                    ? 'danger'
                    : submission 
                    ? 'warning' 
                    : isDueDatePassed 
                    ? 'danger' 
                    : 'default'
                }>
                  {submission?.status === 'SUDAH_DINILAI' 
                    ? `Sudah Dinilai (${submission.finalScore} / ${assignment.maxScore} Poin)` 
                    : submission?.status === 'PERLU_REVISI'
                    ? '⚠️ Perlu Revisi / Perbaikan'
                    : submission 
                    ? (submission.isLate ? 'Terkumpul (Terlambat)' : 'Sudah Dikumpulkan') 
                    : isDueDatePassed 
                    ? 'Batas Waktu Lewat' 
                    : 'Belum Dikumpulkan'}
                </Badge>
                {submission && <Badge variant="primary">Versi {submission.version}</Badge>}
                {assignment.rubric && (
                  <Badge variant="info" icon={Sparkles}>
                    Rubrik Penilaian OBE ({assignment.rubric.criteria.length} Kriteria)
                  </Badge>
                )}
              </div>

              <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{assignment.title}</h1>
              <p className="text-xs font-semibold text-primary-700 dark:text-primary-400 mt-0.5">{assignment.courseName}</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1 text-xs">
              <div className="flex items-center gap-1 text-muted">
                <Calendar size={13} />
                <span>Batas Pengumpulan (Due Date):</span>
              </div>
              <strong style={{ color: isDueDatePassed && !submission ? 'var(--color-danger-main)' : 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                {new Date(assignment.dueDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })} WIB
              </strong>
              {isDueDatePassed && !submission && (
                <span className="text-[11px] text-danger-600 font-semibold flex items-center gap-1">
                  <AlertTriangle size={12} /> Terlewat Batas Waktu
                  {assignment.allowLateSubmission && ` (Penalti ${assignment.latePenaltyPercentage || 10}%)`}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-1" style={{ borderColor: 'var(--border-light)' }}>
        <button
          onClick={() => setActiveTab('instruksi')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-md transition-all ${
            activeTab === 'instruksi'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <FileText size={15} /> 1. Petunjuk & Instruksi
        </button>

        {assignment.rubric && (
          <button
            onClick={() => setActiveTab('rubrik')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-md transition-all ${
              activeTab === 'rubrik'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Sparkles size={15} /> 2. Rubrik Penilaian ({assignment.rubric.criteria.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('pengumpulan')}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-md transition-all ${
            activeTab === 'pengumpulan'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          <Upload size={15} /> 3. Lembar Pengumpulan
          {submission && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white text-primary-700 font-extrabold">
              v{submission.version}
            </span>
          )}
        </button>

        {submission && submission.history && submission.history.length > 1 && (
          <button
            onClick={() => setActiveTab('riwayat')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-t-md transition-all ${
              activeTab === 'riwayat'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-transparent text-muted hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <RotateCcw size={15} /> 4. Riwayat Versi ({submission.history.length})
          </button>
        )}
      </div>

      {/* Tab Content 1: Instruksi & Petunjuk */}
      {activeTab === 'instruksi' && (
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Deskripsi & Petunjuk Pengerjaan Tugas</CardTitle>
              <CardSubtitle>Bacalah dengan seksama seluruh ketentuan teknis sebelum menyusun jawaban.</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              {assignment.description && (
                <div className="p-3.5 rounded-lg border bg-primary-50/50 dark:bg-primary-950/20 text-xs">
                  <span className="font-bold text-primary-800 dark:text-primary-300 block mb-1">
                    📌 Ringkasan Capaian:
                  </span>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {assignment.description}
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border bg-white dark:bg-neutral-900">
                <span className="text-xs font-bold uppercase tracking-wider text-muted block mb-2">
                  Petunjuk Teknis Lengkap:
                </span>
                <div className="text-xs leading-relaxed whitespace-pre-line text-neutral-800 dark:text-neutral-200">
                  {assignment.instructions}
                </div>
              </div>

              {/* Lampiran Template dari Dosen */}
              {assignment.attachmentName && (
                <div className="p-3.5 rounded-lg border flex items-center justify-between gap-3 bg-neutral-50 dark:bg-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded bg-primary-100 dark:bg-primary-900/40 text-primary-700">
                      <FileText size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-bold">{assignment.attachmentName}</p>
                      <p className="text-[11px] text-muted">Berkas Panduan / Format Template Resmi Dosen</p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => {
                      if (assignment.attachmentUrl && assignment.attachmentUrl !== '#') {
                        window.open(assignment.attachmentUrl, '_blank');
                      } else {
                        handleDownloadSubmittedFile(assignment.attachmentName);
                      }
                    }}
                  >
                    Unduh Panduan
                  </Button>
                </div>
              )}

              {/* Aturan & Kebijakan Teknis Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded border text-xs flex flex-col justify-between" style={{ background: 'var(--bg-subtle)' }}>
                  <span className="text-muted flex items-center gap-1">
                    <Clock size={13} /> Kebijakan Terlambat:
                  </span>
                  <span className="font-semibold mt-1">
                    {assignment.allowLateSubmission 
                      ? `Diizinkan (Potongan ${assignment.latePenaltyPercentage || 10}%)` 
                      : 'Dilarang Keras'}
                  </span>
                </div>

                <div className="p-3 rounded border text-xs flex flex-col justify-between" style={{ background: 'var(--bg-subtle)' }}>
                  <span className="text-muted flex items-center gap-1">
                    <RotateCcw size={13} /> Kuota Resubmission:
                  </span>
                  <span className="font-semibold mt-1">
                    {assignment.allowResubmission 
                      ? `Maksimal ${assignment.maxResubmissions || 2}x Revisi` 
                      : 'Hanya 1x Pengumpulan Final'}
                  </span>
                </div>

                <div className="p-3 rounded border text-xs flex flex-col justify-between" style={{ background: 'var(--bg-subtle)' }}>
                  <span className="text-muted flex items-center gap-1">
                    <Upload size={13} /> Batas Ukuran & Format:
                  </span>
                  <span className="font-semibold mt-1">
                    Max {Math.round((assignment.maxFileSizeBytes || 10485760) / (1024 * 1024))} MB ({assignment.allowedFileExtensions?.join(', ') || '.pdf, .docx'})
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab Content 2: Rubrik Penilaian Interaktif */}
      {activeTab === 'rubrik' && assignment.rubric && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary-600" size={20} />
                    {assignment.rubric.title}
                  </CardTitle>
                  <CardSubtitle>
                    Tolak ukur evaluasi mutu dan pembobotan skor Capaian Pembelajaran Lulusan (OBE).
                  </CardSubtitle>
                </div>
                <Badge variant="primary">Total Bobot: 100%</Badge>
              </div>
            </CardHeader>
            <CardBody className="flex flex-col gap-5">
              {assignment.rubric.criteria.map((crit, idx) => (
                <div key={crit.id} className="p-4 rounded-lg border flex flex-col gap-3 bg-white dark:bg-neutral-900">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 border-b pb-2">
                    <div>
                      <span className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                        {idx + 1}. {crit.title}
                      </span>
                      <p className="text-[11px] text-muted">{crit.description}</p>
                    </div>
                    <Badge variant="info">
                      Bobot: {crit.weightPercentage}% (Maks {crit.maxPoints} Poin)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {crit.levels.map((lvl) => (
                      <div 
                        key={lvl.id}
                        className="p-3 rounded border text-xs flex flex-col justify-between"
                        style={{ background: 'var(--bg-subtle)' }}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-primary-700 dark:text-primary-300">{lvl.title}</span>
                            <span className="font-extrabold text-[11px]">{lvl.points} Poin</span>
                          </div>
                          <p className="text-[11px] text-muted leading-relaxed">{lvl.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab Content 3: Lembar Pengumpulan Mahasiswa */}
      {activeTab === 'pengumpulan' && (
        <div className="flex flex-col gap-5">
          {/* A. Kartu Hasil Penilaian & Feedback Dosen */}
          {submission && (submission.status === 'SUDAH_DINILAI' || submission.status === 'PERLU_REVISI') && (
            <Card style={{ borderLeft: `5px solid ${submission.status === 'SUDAH_DINILAI' ? 'var(--color-success-600)' : 'var(--color-danger-600)'}` }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className={submission.status === 'SUDAH_DINILAI' ? 'text-success-600' : 'text-danger-600'} size={24} />
                    <div>
                      <CardTitle>
                        {submission.status === 'SUDAH_DINILAI' ? 'Hasil Evaluasi & Nilai Tugas' : 'Catatan Permintaan Revisi Dosen'}
                      </CardTitle>
                      <CardSubtitle>
                        Dinilai oleh: <strong>{submission.gradedByLecturerName || 'Dosen Pengampu'}</strong> pada {submission.gradedAt ? new Date(submission.gradedAt).toLocaleString('id-ID') : '-'}
                      </CardSubtitle>
                    </div>
                  </div>
                  {submission.status === 'SUDAH_DINILAI' && (
                    <div className="text-right">
                      <span className="text-xs text-muted block">Nilai Akhir:</span>
                      <span className="text-3xl font-black text-success-600">{submission.finalScore}</span>
                      <span className="text-xs text-muted"> / 100</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-3">
                {submission.status === 'SUDAH_DINILAI' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-md bg-success-50/50 dark:bg-success-950/20 text-xs">
                    <div>
                      <span className="text-muted block">Skor Murni Rubrik:</span>
                      <strong className="text-sm">{submission.rawScore ?? submission.finalScore} Poin</strong>
                    </div>
                    <div>
                      <span className="text-muted block">Potongan Penalti Terlambat:</span>
                      <strong className={submission.penaltyDeduction && submission.penaltyDeduction > 0 ? 'text-danger-600 text-sm' : 'text-success-600 text-sm'}>
                        {submission.penaltyDeduction && submission.penaltyDeduction > 0 ? `-${submission.penaltyDeduction} Poin` : '0 Poin (Tepat Waktu)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-muted block">Status Kelulusan Tugas:</span>
                      <strong className="text-success-700 dark:text-success-300 text-sm">
                        {(submission.finalScore || 0) >= 70 ? 'Memenuhi Standar Kelulusan' : 'Di Bawah Standar Kelulusan'}
                      </strong>
                    </div>
                  </div>
                )}

                {(submission.feedbackNotes || submission.lecturerFeedback) && (
                  <div className="p-3.5 rounded border bg-neutral-50 dark:bg-neutral-800 text-xs">
                    <span className="font-bold text-neutral-800 dark:text-neutral-200 block mb-1">
                      💬 Catatan Koreksi & Feedback Dosen Pengampu:
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic">
                      "{submission.feedbackNotes || submission.lecturerFeedback}"
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* B. Form Pengumpulan Tugas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {submission ? `Perbarui Pengumpulan Tugas (Versi ${submission.version + 1})` : 'Formulir Pengumpulan Tugas Mahasiswa'}
                  </CardTitle>
                  <CardSubtitle>
                    Pastikan nama berkas, kelengkapan format, dan isi jawaban sudah sesuai ketentuan.
                  </CardSubtitle>
                </div>
                {submission && (
                  <Badge variant="primary">
                    Riwayat: v{submission.version} Terkumpul
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {(assignment.submissionType === 'BERKAS_UNGGAHAN' || assignment.submissionType === 'KEDUANYA') && (
                  <div>
                    <label className="text-xs font-semibold block mb-1">Unggah Berkas Dokumen Tugas *</label>
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging 
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/30' 
                          : 'border-neutral-300 hover:border-primary-500 bg-neutral-50 dark:bg-neutral-800/50'
                      }`}
                    >
                      <Upload className="text-primary-600" size={32} />
                      <div>
                        <p className="text-xs font-bold text-neutral-800 dark:text-neutral-100">
                          {selectedFile ? selectedFile.name : 'Tarik & Letakkan berkas ke sini, atau klik untuk memilih'}
                        </p>
                        <p className="text-[11px] text-muted mt-0.5">
                          Format yang didukung: {assignment.allowedFileExtensions?.join(', ') || '.pdf, .docx, .zip'} (Maksimal {Math.round((assignment.maxFileSizeBytes || 10485760) / (1024 * 1024))} MB)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept={assignment.allowedFileExtensions?.join(',') || '.pdf,.docx,.zip'}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      />
                    </div>

                    {selectedFile && (
                      <div className="mt-2 p-2.5 rounded bg-primary-50 dark:bg-primary-950/30 border border-primary-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <File className="text-primary-600" size={16} />
                          <span className="font-semibold">{selectedFile.name}</span>
                          <span className="text-muted">({assignmentService.formatFileSize(selectedFile.size)})</span>
                        </div>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          icon={Trash2} 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="text-danger-600"
                        />
                      </div>
                    )}
                  </div>
                )}

                {(assignment.submissionType === 'TEKS_DARING' || assignment.submissionType === 'KEDUANYA') && (
                  <div>
                    <label className="text-xs font-semibold block mb-1">
                      Teks Jawaban / Abstrak Tugas {assignment.submissionType === 'TEKS_DARING' ? '*' : '(Opsional)'}
                    </label>
                    <textarea
                      className="w-full p-3 text-xs rounded-md border"
                      style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)', minHeight: '100px' }}
                      placeholder="Ketikkan teks jawaban, abstrak makalah, atau tautan Google Drive / referensi tambahan..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold block mb-1">Catatan Pengantar untuk Dosen (Opsional)</label>
                  <input
                    type="text"
                    className="w-full p-2 text-xs rounded-md border"
                    style={{ background: 'var(--bg-input)', borderColor: 'var(--border-light)' }}
                    placeholder="Contoh: Bismillah, mohon koreksi bagian analisis istinbath hukum bab 3..."
                    value={submissionNote}
                    onChange={(e) => setSubmissionNote(e.target.value)}
                  />
                </div>

                {isSubmitting && uploadProgress > 0 && (
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[11px] text-muted font-medium">
                      <span>Mengunggah berkas ke Object Storage...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 h-full rounded-full overflow-hidden" style={{ height: '6px' }}>
                      <div 
                        className="bg-primary-600 h-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted">
                    {submission ? `Pengumpulan akan dicatat sebagai Versi ${submission.version + 1}` : 'Pengumpulan pertama (Versi 1)'}
                  </span>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    icon={Send} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : submission ? 'Kirim Versi Revisi' : 'Kumpulkan Tugas'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tab Content 4: Riwayat Versi Pengumpulan */}
      {activeTab === 'riwayat' && submission && submission.history && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="text-primary-600" size={20} />
                Riwayat Pengumpulan & Versi Berkas
              </CardTitle>
              <CardSubtitle>
                Rekam jejak revisi pengerjaan tugas dari versi pertama hingga versi terkini.
              </CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-3">
                {submission.history.map((h) => (
                  <div 
                    key={h.version} 
                    className={`p-3.5 rounded-lg border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                      h.version === submission.version 
                        ? 'bg-primary-50/40 border-primary-300 dark:bg-primary-950/20' 
                        : 'bg-white dark:bg-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-full bg-primary-100 text-primary-700 font-extrabold text-xs">
                        v{h.version}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold">{h.fileName || 'Jawaban Teks Daring'}</span>
                          {h.version === submission.version && (
                            <Badge variant="primary">Terkini</Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted mt-0.5">
                          Diserahkan pada: {new Date(h.submittedAt).toLocaleString('id-ID')} WIB
                          {h.fileSizeBytes ? ` • ${assignmentService.formatFileSize(h.fileSizeBytes)}` : ''}
                        </p>
                        {h.studentNotes && (
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic mt-1">
                            Catatan: "{h.studentNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {h.fileName && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Download}
                          onClick={() => handleDownloadSubmittedFile(h.fileName, h.fileUrl, h.fileDataUrl)}
                        >
                          Unduh Berkas
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};
