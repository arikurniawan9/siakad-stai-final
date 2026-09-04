import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Award, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Edit, 
  BookOpen, 
  GraduationCap, 
  TrendingUp, 
  BarChart2, 
  Eye, 
  Send, 
  UserCheck, 
  UploadCloud,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  GradeSummaryStats, 
  ClassGradeSummary, 
  StudentCourseGrade, 
  StudentTranscript 
} from '../../types/gradeAdmin';
import { gradeAdminService } from '../../services/gradeAdminService';
import { ExportDropdown, DataImportModal, ExportConfig, BulkImportResult } from '../../components/export-import';
import { GRADE_IMPORT_SCHEMA, GradeImportRow } from '../../constants/exportImportSchemas';

type TabView = 'class_grades' | 'grade_distribution' | 'student_transcripts';

export const NilaiAdminPage: React.FC = () => {
  const { success, danger } = useToast();

  // State Utama
  const [activeTab, setActiveTab] = useState<TabView>('class_grades');
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<GradeSummaryStats | null>(null);
  const [classesList, setClassesList] = useState<ClassGradeSummary[]>([]);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterProdi, setFilterProdi] = useState<string>('SEMUA');
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Auto reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterProdi, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterProdi !== 'SEMUA' || filterStatus !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterProdi('SEMUA');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  // Modal: Lembar Nilai Kelas
  const [selectedClass, setSelectedClass] = useState<ClassGradeSummary | null>(null);
  const [classModalOpen, setClassModalOpen] = useState<boolean>(false);
  const [isGradeImportOpen, setIsGradeImportOpen] = useState<boolean>(false);
  const [classStudents, setClassStudents] = useState<StudentCourseGrade[]>([]);

  // Modal: Input / Edit Nilai Mahasiswa
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [selectedStudentGrade, setSelectedStudentGrade] = useState<StudentCourseGrade | null>(null);
  const [formPresence, setFormPresence] = useState<string>('90');
  const [formAssignment, setFormAssignment] = useState<string>('85');
  const [formQuiz, setFormQuiz] = useState<string>('85');
  const [formMidterm, setFormMidterm] = useState<string>('85');
  const [formFinalExam, setFormFinalExam] = useState<string>('88');
  const [savingGrade, setSavingGrade] = useState<boolean>(false);

  // Tab 3: Transkrip & KHS Mahasiswa
  const [transcriptStudentId, setTranscriptStudentId] = useState<string>('usr-mhs-01');
  const [transcriptData, setTranscriptData] = useState<StudentTranscript | null>(null);
  const [loadingTranscript, setLoadingTranscript] = useState<boolean>(false);

  // Load Data Utama
  const loadMainData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, classesRes] = await Promise.all([
        gradeAdminService.getGradesSummary(),
        gradeAdminService.getClassGradesSummary()
      ]);

      setSummaryStats(statsRes);
      setClassesList(classesRes);
    } catch {
      danger('Gagal Memuat Data', 'Tidak dapat mengambil rekapitulasi nilai dari server.');
    } finally {
      setLoading(false);
    }
  }, [danger]);

  useEffect(() => {
    loadMainData();
  }, [loadMainData]);

  // Load Lembar Nilai Kelas
  const handleOpenClassGrades = async (cls: ClassGradeSummary) => {
    setSelectedClass(cls);
    setClassModalOpen(true);
    try {
      const res = await gradeAdminService.getClassStudentGrades(cls.classId);
      setClassStudents(res);
    } catch {
      danger('Gagal Memuat Nilai Mahasiswa', 'Terjadi kesalahan saat memuat lembar penilaian kelas.');
    }
  };

  // Handler: Buka Modal Edit Nilai
  const handleOpenEditGrade = (grade: StudentCourseGrade) => {
    setSelectedStudentGrade(grade);
    setFormPresence(String(grade.presenceScore));
    setFormAssignment(String(grade.assignmentScore));
    setFormQuiz(String(grade.quizScore));
    setFormMidterm(String(grade.midtermScore));
    setFormFinalExam(String(grade.finalExamScore));
    setEditModalOpen(true);
  };

  // Kalkulasi Live Nilai Akhir & Huruf Mutu
  const calculatedLiveScore = useMemo(() => {
    const p = parseFloat(formPresence) || 0;
    const a = parseFloat(formAssignment) || 0;
    const q = parseFloat(formQuiz) || 0;
    const m = parseFloat(formMidterm) || 0;
    const f = parseFloat(formFinalExam) || 0;

    const final = (p * 0.10) + (a * 0.20) + (q * 0.15) + (m * 0.25) + (f * 0.30);
    const rounded = parseFloat(final.toFixed(2));

    let letter = 'E';
    let point = 0.00;
    if (rounded >= 88.00) { letter = 'A'; point = 4.00; }
    else if (rounded >= 84.00) { letter = 'A-'; point = 3.75; }
    else if (rounded >= 80.00) { letter = 'B+'; point = 3.50; }
    else if (rounded >= 75.00) { letter = 'B'; point = 3.00; }
    else if (rounded >= 70.00) { letter = 'B-'; point = 2.75; }
    else if (rounded >= 65.00) { letter = 'C+'; point = 2.25; }
    else if (rounded >= 60.00) { letter = 'C'; point = 2.00; }
    else if (rounded >= 50.00) { letter = 'D'; point = 1.00; }

    return { finalScore: rounded, letterGrade: letter, gradePoint: point };
  }, [formPresence, formAssignment, formQuiz, formMidterm, formFinalExam]);

  // Handler: Simpan Perubahan Nilai
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedStudentGrade) return;

    try {
      setSavingGrade(true);
      const res = await gradeAdminService.updateStudentGrade(
        selectedClass.classId,
        selectedStudentGrade.studentId,
        {
          presenceScore: parseFloat(formPresence) || 0,
          assignmentScore: parseFloat(formAssignment) || 0,
          quizScore: parseFloat(formQuiz) || 0,
          midtermScore: parseFloat(formMidterm) || 0,
          finalExamScore: parseFloat(formFinalExam) || 0,
          status: 'DITERBITKAN'
        }
      );

      success('Nilai Berhasil Disimpan', res.message);
      setEditModalOpen(false);

      // Refresh lembar nilai kelas & rekapitulasi utama
      const updatedStudents = await gradeAdminService.getClassStudentGrades(selectedClass.classId);
      setClassStudents(updatedStudents);
      loadMainData();
    } catch {
      danger('Gagal Menyimpan Nilai', 'Terjadi kesalahan sistem saat menyimpan nilai mahasiswa.');
    } finally {
      setSavingGrade(false);
    }
  };

  // Handler: Publikasikan Nilai Kelas
  const handlePublishClass = async (classId: string) => {
    try {
      const res = await gradeAdminService.publishClassGrades(classId);
      success('Nilai Kelas Diterbitkan', res.message);
      if (selectedClass && selectedClass.classId === classId) {
        const updatedStudents = await gradeAdminService.getClassStudentGrades(classId);
        setClassStudents(updatedStudents);
      }
      loadMainData();
    } catch {
      danger('Gagal Menerbitkan Nilai', 'Terjadi kesalahan saat mempublikasikan nilai kelas.');
    }
  };

  // Handler: Buka Kunci Nilai Kelas
  const handleUnlockClass = async (classId: string) => {
    try {
      const res = await gradeAdminService.unlockClassGrades(classId);
      success('Kunci Nilai Dibuka', res.message);
      if (selectedClass && selectedClass.classId === classId) {
        const updatedStudents = await gradeAdminService.getClassStudentGrades(classId);
        setClassStudents(updatedStudents);
      }
      loadMainData();
    } catch {
      danger('Gagal Membuka Kunci Nilai', 'Terjadi kesalahan saat membuka kunci nilai.');
    }
  };

  // Handler: Cari KHS Mahasiswa
  const handleFetchTranscript = useCallback(async (studentId: string) => {
    try {
      setLoadingTranscript(true);
      const res = await gradeAdminService.getStudentTranscript(studentId);
      setTranscriptData(res);
    } catch {
      danger('Gagal Memuat KHS', 'Tidak dapat mengambil transkrip nilai mahasiswa.');
    } finally {
      setLoadingTranscript(false);
    }
  }, [danger]);

  useEffect(() => {
    if (activeTab === 'student_transcripts') {
      handleFetchTranscript(transcriptStudentId);
    }
  }, [activeTab, transcriptStudentId, handleFetchTranscript]);

  // Filtered Classes List
  const filteredClasses = useMemo(() => {
    return classesList.filter((cls) => {
      const matchSearch = 
        cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchProdi = filterProdi === 'SEMUA' || cls.studyProgramCode === filterProdi;
      const matchStatus = filterStatus === 'SEMUA' || cls.status === filterStatus;

      return matchSearch && matchProdi && matchStatus;
    });
  }, [classesList, searchQuery, filterProdi, filterStatus]);

  // Paginated Classes
  const totalPages = Math.ceil(filteredClasses.length / pageSize) || 1;
  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClasses.slice(start, start + pageSize);
  }, [filteredClasses, currentPage, pageSize]);

  // Konfigurasi Ekspor Rekapitulasi Nilai Seluruh Kelas
  const gradesSummaryExportConfig: ExportConfig<ClassGradeSummary> = useMemo(() => ({
    filename: 'SALAM_Rekapitulasi_Nilai_Akademik',
    title: 'REKAPITULASI CAPAIAN NILAI AKADEMIK & MUTU PERKULIAHAN',
    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
    data: filteredClasses,
    columns: [
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Mata Kuliah', width: '220px' },
      { key: 'className', header: 'Kelas / Rombel', width: '110px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'studyProgramCode', header: 'Prodi', width: '80px', align: 'center' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '200px' },
      { key: 'enrolledCount', header: 'Jml Mhs', width: '80px', align: 'center' },
      { key: 'averageScore', header: 'Rata-rata', width: '80px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'highestScore', header: 'Tertinggi', width: '80px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'status', header: 'Status Penguncian', width: '110px', align: 'center' }
    ],
    metadata: {
      'Total Rombel Kelas': `${filteredClasses.length} Kelas`,
      'Filter Prodi': filterProdi,
      'Filter Status': filterStatus,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredClasses, filterProdi, filterStatus]);

  // Konfigurasi Ekspor Lembar Nilai Mahasiswa per Kelas
  const classGradesExportConfig: ExportConfig<StudentCourseGrade> = useMemo(() => ({
    filename: `SALAM_Lembar_Nilai_${selectedClass?.courseCode || 'Kelas'}`,
    title: `LEMBAR NILAI AKADEMIK — ${selectedClass?.courseName?.toUpperCase() || ''}`,
    subtitle: `Kelas: ${selectedClass?.className || ''} | Dosen: ${selectedClass?.lecturerName || ''} | TA: ${selectedClass?.academicYear || ''}`,
    data: classStudents,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Lengkap Mahasiswa', width: '220px' },
      { key: 'attendanceScore', header: 'Presensi (10%)', width: '90px', align: 'center' },
      { key: 'assignmentScore', header: 'Tugas (20%)', width: '90px', align: 'center' },
      { key: 'quizScore', header: 'Kuis (15%)', width: '90px', align: 'center' },
      { key: 'midtermScore', header: 'UTS (25%)', width: '90px', align: 'center' },
      { key: 'finalScore', header: 'UAS (30%)', width: '90px', align: 'center' },
      { key: 'finalNumericGrade', header: 'Nilai Akhir', width: '90px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'letterGrade', header: 'Huruf Mutu', width: '80px', align: 'center' },
      { key: 'status', header: 'Status', width: '100px', align: 'center' }
    ],
    metadata: {
      'Mata Kuliah': `${selectedClass?.courseCode} - ${selectedClass?.courseName}`,
      'Kelas': selectedClass?.className || '-',
      'Dosen Pengampu': selectedClass?.lecturerName || '-',
      'Total Mahasiswa': `${classStudents.length} Mahasiswa`
    }
  }), [selectedClass, classStudents]);

  // Handler Impor Nilai Massal ke Kelas
  const handleBulkImportGrades = async (data: GradeImportRow[], summary: BulkImportResult) => {
    if (!selectedClass) return;
    try {
      await gradeAdminService.bulkUpdateGrades(selectedClass.classId, data);
      success('Impor Nilai Berhasil', `Sebanyak ${summary.inserted} nilai mahasiswa berhasil diinput ke kelas ${selectedClass.courseName}.`);
      await handleOpenClassGrades(selectedClass);
    } catch {
      danger('Galat Impor', 'Gagal memproses data impor nilai ke server.');
    }
  };

  // Kolom Tabel Rekapitulasi Nilai Kelas
  const classColumns: Column<ClassGradeSummary>[] = [
    {
      header: 'Mata Kuliah & Rombel',
      width: '280px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {row.courseName}
          </span>
          <div className="flex items-center gap-2" style={{ marginTop: '2px' }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
              {row.courseCode} ({row.className})
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              • {row.credits} SKS • {row.studyProgramCode}
            </span>
          </div>
        </div>
      )
    },
    {
      header: 'Dosen Pengampu',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-xs)' }}>
            {row.lecturerName}
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {row.studyProgramName}
          </span>
        </div>
      )
    },
    {
      header: 'Statistik Nilai Kelas',
      width: '220px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rata-rata Kelas:</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-primary-900)' }}>{row.averageScore > 0 ? row.averageScore : '-'}</span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <span>Tertinggi: {row.highestScore > 0 ? row.highestScore : '-'}</span>
            <span>Terendah: {row.lowestScore > 0 ? row.lowestScore : '-'}</span>
          </div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Terisi: {row.gradedCount} / {row.enrolledCount} Mahasiswa
          </span>
        </div>
      )
    },
    {
      header: 'Status Nilai',
      width: '140px',
      render: (row) => {
        let variant: 'success' | 'warning' | 'default' = 'default';
        if (row.status === 'DITERBITKAN') variant = 'success';
        if (row.status === 'DRAF') variant = 'warning';
        if (row.status === 'DIKUNCI') variant = 'default';

        return (
          <Badge variant={variant}>
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: 'Aksi',
      width: '180px',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="primary"
            size="sm"
            icon={Eye}
            onClick={() => handleOpenClassGrades(row)}
            title="Buka Lembar Penilaian Kelas"
          >
            Lembar Nilai
          </Button>

          {row.status === 'DRAF' ? (
            <Button
              variant="secondary"
              size="sm"
              icon={Send}
              onClick={() => handlePublishClass(row.classId)}
              title="Terbitkan & Kunci Nilai"
            >
              Terbitkan
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              icon={Unlock}
              onClick={() => handleUnlockClass(row.classId)}
              title="Buka Kunci Nilai untuk Revisi"
            >
              Buka Kunci
            </Button>
          )}
        </div>
      )
    }
  ];

  // Kolom Lembar Nilai Mahasiswa (Modal)
  const studentColumns: Column<StudentCourseGrade>[] = [
    {
      header: 'Mahasiswa',
      width: '240px',
      render: (row) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
            {row.studentName}
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', fontWeight: 'var(--font-weight-semibold)' }}>
            {row.studentNim} ({row.studyProgramCode})
          </span>
        </div>
      )
    },
    {
      header: 'Presensi (10%)',
      width: '100px',
      render: (row) => <span style={{ fontSize: 'var(--text-xs)' }}>{row.presenceScore}</span>
    },
    {
      header: 'Tugas (20%)',
      width: '100px',
      render: (row) => <span style={{ fontSize: 'var(--text-xs)' }}>{row.assignmentScore}</span>
    },
    {
      header: 'Kuis (15%)',
      width: '100px',
      render: (row) => <span style={{ fontSize: 'var(--text-xs)' }}>{row.quizScore}</span>
    },
    {
      header: 'UTS (25%)',
      width: '100px',
      render: (row) => <span style={{ fontSize: 'var(--text-xs)' }}>{row.midtermScore}</span>
    },
    {
      header: 'UAS (30%)',
      width: '100px',
      render: (row) => <span style={{ fontSize: 'var(--text-xs)' }}>{row.finalExamScore}</span>
    },
    {
      header: 'Nilai Akhir & Mutu',
      width: '160px',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
            {row.finalScore}
          </span>
          <Badge variant={row.gradePoint >= 3.00 ? 'success' : row.gradePoint >= 2.00 ? 'warning' : 'danger'}>
            {row.letterGrade} ({row.gradePoint.toFixed(2)})
          </Badge>
        </div>
      )
    },
    {
      header: 'Aksi',
      width: '100px',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          icon={Edit}
          onClick={() => handleOpenEditGrade(row)}
          title="Ubah Nilai Komponen"
        >
          Koreksi
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evaluasi & Nilai Akademik
            </Badge>
            <span className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)', fontWeight: 'bold' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-success-DEFAULT)', display: 'inline-block' }} />
              PERIODE NILAI 2026/2027 GANJIL
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', margin: 0 }}>
            Monitoring & Rekapitulasi Nilai Perkuliahan
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            Pengelolaan lembar penilaian kelas, perhitungan otomatis nilai akhir (Presensi 10%, Tugas 20%, Kuis 15%, UTS 25%, UAS 30%), distribusi mutu kelulusan, dan pencetakan Kartu Hasil Studi (KHS).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <ExportDropdown 
            config={gradesSummaryExportConfig} 
            buttonLabel="Ekspor Rekapitulasi Nilai" 
          />
          <Button 
            variant="primary" 
            size="sm" 
            icon={RefreshCw}
            onClick={loadMainData}
            isLoading={loading}
          >
            Segarkan Data
          </Button>
        </div>
      </div>

      {/* 2. Kartu Metrik Ringkasan (Executive Metric Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  RATA-RATA NILAI INSTITUSI
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.averageCampusScore || 88.85}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / 100
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <TrendingUp size={13} />
                  <span>Mutu: Sangat Memuaskan (A-)</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Award size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  TINGKAT KELULUSAN MK
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.passRatePercent || 100.0}%
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Lulus
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <CheckCircle2 size={13} />
                  <span>Passing Grade: Bobot &ge; 2.00 (C)</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <GraduationCap size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  NILAI TERREKAP
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.totalGradesRecorded || 10}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    Mahasiswa
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-primary-700)', marginTop: '6px' }}>
                  <BookOpen size={13} />
                  <span>Tersinkronisasi ke KHS & SIAKAD</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-primary-50)', 
                  color: 'var(--color-primary-800)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <UserCheck size={22} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  STATUS KELAS KULIAH
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {summaryStats?.publishedClasses || 5}
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    / {summaryStats?.totalClasses || 6} Rombel
                  </span>
                </div>
                <div className="flex items-center gap-1" style={{ fontSize: '0.6875rem', color: 'var(--color-success-dark)', marginTop: '6px' }}>
                  <Lock size={13} />
                  <span>Nilai Diterbitkan & Terkunci</span>
                </div>
              </div>
              <div 
                style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--color-success-surface)', 
                  color: 'var(--color-success-dark)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Lock size={22} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Grup Tab Navigasi */}
      <div className="tabs-nav-container">
        <button
          className={`btn ${activeTab === 'class_grades' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('class_grades')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Award size={16} />
          <span>Rekapitulasi Nilai per Rombel Kelas ({classesList.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'grade_distribution' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('grade_distribution')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <BarChart2 size={16} />
          <span>Distribusi & Sebaran Mutu Nilai</span>
        </button>

        <button
          className={`btn ${activeTab === 'student_transcripts' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('student_transcripts')}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <GraduationCap size={16} />
          <span>Transkrip & KHS Mahasiswa</span>
        </button>
      </div>

      {/* 4. Konten Tab 1: Rekapitulasi Nilai per Rombel Kelas */}
      {activeTab === 'class_grades' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Daftar Rombel Kelas & Rekapitulasi Penilaian</CardTitle>
                <CardSubtitle>Kelola penginputan nilai, periksa rata-rata kelas, dan lakukan penerbitan serentak ke KHS mahasiswa.</CardSubtitle>
              </div>

              {/* Bilah Pencarian & Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '220px' }}>
                  <Input
                    placeholder="Cari mata kuliah, dosen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                <select
                  value={filterProdi}
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Program Studi</option>
                  <option value="PAI">Pendidikan Agama Islam (PAI)</option>
                  <option value="MPI">Manajemen Pendidikan Islam (MPI)</option>
                  <option value="HES">Hukum Ekonomi Syariah (HES)</option>
                  <option value="PGMI">PGMI</option>
                  <option value="ESY">Ekonomi Syariah</option>
                  <option value="MKU">MKU Institusi</option>
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto' }}
                >
                  <option value="SEMUA">Semua Status</option>
                  <option value="DITERBITKAN">Diterbitkan</option>
                  <option value="DRAF">Draf</option>
                  <option value="DIKUNCI">Dikunci</option>
                </select>

                {hasActiveFilters && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={X} 
                    onClick={handleResetFilters}
                    title="Reset Semua Filter"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <Table
              columns={classColumns}
              data={paginatedClasses}
              keyExtractor={(row) => row.classId}
              emptyMessage="Tidak ada data kelas yang sesuai filter."
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClasses.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              itemLabel="kelas perkuliahan"
            />
          </CardBody>
        </Card>
      )}

      {/* 5. Konten Tab 2: Distribusi & Sebaran Mutu Nilai */}
      {activeTab === 'grade_distribution' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Standar Konversi & Distribusi Huruf Mutu Akademik STAI AL-ITTIHAD</CardTitle>
              <CardSubtitle>Pedoman pembobotan nilai angka ke huruf mutu dan IPK berdasarkan regulasi akademik resmi.</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-success-surface border border-success rounded-md">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-dark)' }}>Grade A (4.00)</span>
                    <Badge variant="success">88.00 - 100</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                    {summaryStats?.gradeDistribution.find((g) => g.grade === 'A')?.count || 4} Mahasiswa
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-dark)', margin: '4px 0 0' }}>Predikat: Sangat Cemerlang / Terpuji</p>
                </div>

                <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>Grade A- (3.75)</span>
                    <Badge variant="primary">84.00 - 87.99</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                    {summaryStats?.gradeDistribution.find((g) => g.grade === 'A-')?.count || 4} Mahasiswa
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', margin: '4px 0 0' }}>Predikat: Sangat Memuaskan</p>
                </div>

                <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>Grade B+ (3.50)</span>
                    <Badge variant="primary">80.00 - 83.99</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                    {summaryStats?.gradeDistribution.find((g) => g.grade === 'B+')?.count || 2} Mahasiswa
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-800)', margin: '4px 0 0' }}>Predikat: Memuaskan</p>
                </div>

                <div className="p-4 bg-slate-50 border border-default rounded-md">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)' }}>Grade B (3.00)</span>
                    <Badge variant="default">75.00 - 79.99</Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', marginTop: '8px', color: 'var(--text-primary)' }}>
                    {summaryStats?.gradeDistribution.find((g) => g.grade === 'B')?.count || 0} Mahasiswa
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: '4px 0 0' }}>Predikat: Baik</p>
                </div>
              </div>

              {/* Rincian Rumus Bobot Penilaian */}
              <div className="mt-6 p-4 bg-slate-50 border border-default rounded-md">
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', margin: '0 0 8px', color: 'var(--text-primary)' }}>
                  Struktur Bobot Penilaian Mata Kuliah SALAM STAI AL-ITTIHAD:
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div className="p-2 bg-white border border-default rounded">
                    <strong>1. Presensi & Kehadiran:</strong> 10%
                  </div>
                  <div className="p-2 bg-white border border-default rounded">
                    <strong>2. Tugas & Praktikum:</strong> 20%
                  </div>
                  <div className="p-2 bg-white border border-default rounded">
                    <strong>3. Kuis & Forum:</strong> 15%
                  </div>
                  <div className="p-2 bg-white border border-default rounded">
                    <strong>4. Ujian Tengah Semester (UTS):</strong> 25%
                  </div>
                  <div className="p-2 bg-white border border-default rounded">
                    <strong>5. Ujian Akhir Semester (UAS):</strong> 30%
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* 6. Konten Tab 3: Transkrip & KHS Mahasiswa */}
      {activeTab === 'student_transcripts' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div>
                  <CardTitle>Kartu Hasil Studi (KHS) & Transkrip Akademik</CardTitle>
                  <CardSubtitle>Pencarian cepat transkrip nilai berjalan dan perhitungan Indeks Prestasi Kumulatif (IPK).</CardSubtitle>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={transcriptStudentId}
                    onChange={(e) => setTranscriptStudentId(e.target.value)}
                    className="form-select"
                    style={{ minWidth: '240px' }}
                  >
                    <option value="usr-mhs-01">Ahmad Fauzi (21.01.0042 - PAI)</option>
                    <option value="usr-mhs-02">Siti Fatimah Zahra (22.01.0015 - PAI)</option>
                    <option value="usr-mhs-03">Habibullah Al-Habsyi (23.01.0028 - PAI)</option>
                    <option value="usr-mhs-04">Muhammad Ridwan Nur (22.02.0008 - MPI)</option>
                    <option value="usr-mhs-05">Aulia Rahmawati (23.02.0019 - MPI)</option>
                    <option value="usr-mhs-06">Ali Haidar Rasyid (22.03.0012 - HES)</option>
                    <option value="usr-mhs-08">Zahid Abdul Malik (23.04.0005 - PGMI)</option>
                    <option value="usr-mhs-10">Farhan Ramadhan (23.05.0014 - ESY)</option>
                  </select>

                  <Button variant="ghost" size="sm" onClick={() => handleFetchTranscript(transcriptStudentId)} isLoading={loadingTranscript}>
                    <RefreshCw size={15} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardBody>
              {/* Ringkasan IPK Mahasiswa */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-primary-50 border border-primary-200 rounded-md">
                  <span style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--color-primary-800)', textTransform: 'uppercase' }}>
                    INDEKS PRESTASI KUMULATIF (IPK)
                  </span>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '4px' }}>
                    {transcriptData?.gpa ? transcriptData.gpa.toFixed(2) : '3.88'}
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      / 4.00
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-default rounded-md">
                  <span style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    TOTAL SKS TEMPUH
                  </span>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {transcriptData?.totalCredits || 6}
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      SKS
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-default rounded-md">
                  <span style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    TOTAL BOBOT MUTU (N x K)
                  </span>
                  <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {transcriptData?.totalQualityPoints || 23.25}
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)', marginLeft: '4px' }}>
                      Poin
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabel Mata Kuliah KHS */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kode MK</th>
                      <th>Mata Kuliah</th>
                      <th>SKS</th>
                      <th>Rombel & Semester</th>
                      <th>Nilai Akhir</th>
                      <th>Huruf Mutu</th>
                      <th>Bobot (N)</th>
                      <th>Mutu (N x K)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transcriptData?.courses.map((c) => (
                      <tr key={c.gradeId}>
                        <td><strong>{c.courseCode}</strong></td>
                        <td>{c.courseName}</td>
                        <td>{c.credits} SKS</td>
                        <td>{c.className} ({c.academicYear})</td>
                        <td><strong>{c.finalScore}</strong></td>
                        <td>
                          <Badge variant="success">{c.letterGrade}</Badge>
                        </td>
                        <td>{Number(c.gradePoint).toFixed(2)}</td>
                        <td><strong>{Number(c.qualityPoints).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* =====================================================================
          MODAL: LEMBAR PENILAIAN KELAS KULIAH
          ===================================================================== */}
      <Modal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        title={`Lembar Penilaian: ${selectedClass?.courseName} (${selectedClass?.className})`}
        maxWidth="960px"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 p-3 bg-slate-50 border border-default rounded-md text-xs">
            <div>
              <strong>Dosen Pengampu:</strong> {selectedClass?.lecturerName} • <strong>SKS:</strong> {selectedClass?.credits} SKS • <strong>Tahun:</strong> {selectedClass?.academicYear}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={selectedClass?.status === 'DITERBITKAN' ? 'success' : 'warning'}>
                Status: {selectedClass?.status}
              </Badge>
              <ExportDropdown 
                config={classGradesExportConfig} 
                buttonLabel="Ekspor Nilai Kelas" 
                size="sm"
              />
              <Button 
                variant="outline" 
                size="sm" 
                icon={UploadCloud}
                onClick={() => setIsGradeImportOpen(true)}
              >
                + Impor Nilai Excel/CSV
              </Button>
              {selectedClass && (
                selectedClass.status === 'DRAF' ? (
                  <Button variant="primary" size="sm" icon={Send} onClick={() => handlePublishClass(selectedClass.classId)}>
                    Terbitkan Nilai
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" icon={Unlock} onClick={() => handleUnlockClass(selectedClass.classId)}>
                    Buka Kunci Nilai
                  </Button>
                )
              )}
            </div>
          </div>

          <Table
            columns={studentColumns}
            data={classStudents}
            keyExtractor={(row) => row.enrollmentId}
            emptyMessage="Belum ada mahasiswa yang terdaftar di rombel kelas ini."
          />
        </div>
      </Modal>

      {/* =====================================================================
          MODAL: INPUT / EDIT KOMPONEN NILAI MAHASISWA
          ===================================================================== */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Koreksi Nilai: ${selectedStudentGrade?.studentName} (${selectedStudentGrade?.studentNim})`}
        maxWidth="640px"
      >
        <form onSubmit={handleSaveGrade} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="form-group">
              <label className="form-label" htmlFor="grade-presence">Presensi (10%)</label>
              <Input
                id="grade-presence"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formPresence}
                onChange={(e) => setFormPresence(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="grade-assignment">Tugas (20%)</label>
              <Input
                id="grade-assignment"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formAssignment}
                onChange={(e) => setFormAssignment(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="grade-quiz">Kuis & Diskusi (15%)</label>
              <Input
                id="grade-quiz"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formQuiz}
                onChange={(e) => setFormQuiz(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="grade-midterm">UTS (25%)</label>
              <Input
                id="grade-midterm"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formMidterm}
                onChange={(e) => setFormMidterm(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="grade-finalexam">UAS (30%)</label>
              <Input
                id="grade-finalexam"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formFinalExam}
                onChange={(e) => setFormFinalExam(e.target.value)}
                required
              />
            </div>

            {/* Hasil Kalkulasi Otomatis */}
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-md flex flex-col justify-center items-center">
              <span style={{ fontSize: '0.6875rem', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
                NILAI AKHIR KALKULASI
              </span>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-900)', marginTop: '2px' }}>
                {calculatedLiveScore.finalScore}
              </div>
              <Badge variant={calculatedLiveScore.gradePoint >= 3.00 ? 'success' : 'warning'} style={{ marginTop: '4px' }}>
                {calculatedLiveScore.letterGrade} (Bobot: {calculatedLiveScore.gradePoint.toFixed(2)})
              </Badge>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)} disabled={savingGrade}>
              Batal
            </Button>
            <Button variant="primary" type="submit" isLoading={savingGrade}>
              Simpan Nilai Akhir
            </Button>
          </div>
        </form>
      </Modal>

      {/* =====================================================================
          MODAL: WIZARD IMPOR MASSAL REKAP NILAI KELAS
          ===================================================================== */}
      {isGradeImportOpen && (
        <DataImportModal<GradeImportRow>
          isOpen={isGradeImportOpen}
          onClose={() => setIsGradeImportOpen(false)}
          schema={GRADE_IMPORT_SCHEMA}
          onImport={handleBulkImportGrades}
          customTitle={`Pusat Impor Nilai — ${selectedClass?.courseName || 'Kelas'}`}
        />
      )}
    </div>
  );
};
