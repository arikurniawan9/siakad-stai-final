import React, { useState, useEffect, useMemo } from 'react';
import { 
  Award, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Calculator, 
  MessageSquare, 
  Send, 
  Search, 
  Printer, 
  Eye, 
  Layers,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/feedback/ToastContext';
import { 
  CourseGradebookSummary, 
  AssessmentItemDetail, 
  GradeInquiryRequest, 
  TargetGradeSimulation 
} from '../../types/studentGradebook';
import { LetterGrade } from '../../types/khs';
import { studentGradebookService } from '../../services/studentGradebookService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface BukuNilaiMahasiswaPageProps {
  onNavigateToKhs?: () => void;
  onNavigateToClass?: (classId: string) => void;
}

type GradebookTab = 'buku_nilai' | 'rincian_komponen' | 'simulator_target' | 'umpan_balik_dosen' | 'sanggah_nilai';

export const BukuNilaiMahasiswaPage: React.FC<BukuNilaiMahasiswaPageProps> = ({
  onNavigateToKhs,
  onNavigateToClass: _onNavigateToClass
}) => {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<GradebookTab>('buku_nilai');
  const [coursesGradebook, setCoursesGradebook] = useState<CourseGradebookSummary[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return studentGradebookService.getStudentGradebook(studentId);
  });
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    const books = studentGradebookService.getStudentGradebook(studentId);
    return books[0]?.classId || 'cls-pai301-a';
  });
  const [inquiries, setInquiries] = useState<GradeInquiryRequest[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return studentGradebookService.getGradeInquiries(studentId);
  });
  const [feedbackList, setFeedbackList] = useState<Array<{
    id: string;
    courseName: string;
    courseCode: string;
    lecturerName: string;
    assessmentTitle: string;
    score: number;
    feedback: string;
    date: string;
  }>>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return studentGradebookService.getAllLecturerFeedback(studentId);
  });

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Auto reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const hasActiveFilters = searchQuery !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Simulator State
  const [simulatorTargetGrade, setSimulatorTargetGrade] = useState<LetterGrade>('A');
  const [simulationResult, setSimulationResult] = useState<TargetGradeSimulation | null>(null);

  // Inquiry Modal State
  const [inquiryModalOpen, setInquiryModalOpen] = useState<boolean>(false);
  const [selectedItemForInquiry, setSelectedItemForInquiry] = useState<AssessmentItemDetail | null>(null);
  const [inquiryReasonCategory, setInquiryReasonCategory] = useState<'REVISI_PENILAIAN' | 'KOREKSI_BERKAS' | 'KETIDAKSESUAIAN_RUBRIK' | 'LAINNYA'>('KETIDAKSESUAIAN_RUBRIK');
  const [inquiryMessageText, setInquiryMessageText] = useState<string>('');

  // Assessment Item Detail Modal
  const [inspectItemModal, setInspectItemModal] = useState<AssessmentItemDetail | null>(null);

  // Load Data
  useEffect(() => {
    const studentId = user?.id || 'usr-mhs-01';
    const books = studentGradebookService.getStudentGradebook(studentId);
    const inqs = studentGradebookService.getGradeInquiries(studentId);
    const fbs = studentGradebookService.getAllLecturerFeedback(studentId);

    setCoursesGradebook(books);
    setInquiries(inqs);
    setFeedbackList(fbs);

    if (books.length > 0) {
      setSelectedClassId(books[0].classId);
    }
  }, [user]);

  // Selected Course
  const selectedCourse = useMemo(() => {
    return coursesGradebook.find((c) => c.classId === selectedClassId) || coursesGradebook[0] || null;
  }, [coursesGradebook, selectedClassId]);

  // Run Simulation when selected course or target grade changes
  useEffect(() => {
    if (selectedCourse) {
      const res = studentGradebookService.simulateTargetGrade(selectedCourse, simulatorTargetGrade);
      setSimulationResult(res);
    }
  }, [selectedCourse, simulatorTargetGrade]);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return coursesGradebook.filter((c) => 
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lecturerName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coursesGradebook, searchQuery]);

  // Paginated courses
  const totalPages = Math.ceil(filteredCourses.length / pageSize) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Average campus progress score across enrolled classes
  const averageGrade = useMemo(() => {
    if (coursesGradebook.length === 0) return 0;
    const total = coursesGradebook.reduce((acc, c) => acc + c.currentCalculatedScore, 0);
    return parseFloat((total / coursesGradebook.length).toFixed(2));
  }, [coursesGradebook]);

  const getLetterGradeBadge = (grade: LetterGrade) => {
    if (grade === 'A') return <Badge variant="success">A (4.00)</Badge>;
    if (grade === 'A-') return <Badge variant="success">A- (3.75)</Badge>;
    if (grade === 'B+') return <Badge variant="primary">B+ (3.50)</Badge>;
    if (grade === 'B') return <Badge variant="primary">B (3.00)</Badge>;
    if (grade === 'B-') return <Badge variant="warning">B- (2.75)</Badge>;
    return <Badge variant="danger">{grade}</Badge>;
  };

  const getInquiryStatusBadge = (status: string) => {
    if (status === 'DISETUJUI_REVISI') return <Badge variant="success">Disetujui & Direvisi</Badge>;
    if (status === 'SEDANG_DIPROSES') return <Badge variant="primary">Sedang Ditinjau</Badge>;
    if (status === 'DITOLAK') return <Badge variant="danger">Ditolak</Badge>;
    return <Badge variant="warning">Menunggu Tinjauan Dosen</Badge>;
  };

  const handleSubmitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !selectedItemForInquiry || !inquiryMessageText.trim()) return;

    const studentId = user?.id || 'usr-mhs-01';
    const studentName = user?.name || 'Ahmad Fauzi';
    const studentNim = user?.identityNumber || '21.01.0042';

    const created = studentGradebookService.submitGradeInquiry({
      classId: selectedCourse.classId,
      courseName: selectedCourse.courseName,
      assessmentItemId: selectedItemForInquiry.id,
      assessmentTitle: selectedItemForInquiry.title,
      studentId,
      studentName,
      studentNim,
      currentScore: selectedItemForInquiry.earnedScore || 0,
      reasonCategory: inquiryReasonCategory,
      inquiryMessage: inquiryMessageText
    });

    setInquiries([created, ...inquiries]);
    setInquiryModalOpen(false);
    setInquiryMessageText('');
    setSelectedItemForInquiry(null);

    toast.success(
      'Permohonan Klarifikasi Terkirim',
      'Permohonan klarifikasi nilai Anda telah disampaikan kepada dosen pengampu mata kuliah.'
    );
  };

  // Columns for Course Gradebook Items
  const itemColumns: Column<AssessmentItemDetail>[] = [
    {
      header: 'No',
      width: '50px',
      render: (_, index) => <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{index + 1}</span>
    },
    {
      header: 'Aktivitas / Penilaian',
      width: '280px',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
            {row.title}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px' }}>
            <span>{row.componentType.replace('_', ' ')}</span>
            {row.meetingNumber && <span>• Pertemuan {row.meetingNumber}</span>}
          </div>
        </div>
      )
    },
    {
      header: 'Bobot',
      width: '90px',
      render: (row) => (
        <Badge variant="default">{row.weightPercentage}%</Badge>
      )
    },
    {
      header: 'Nilai Diperoleh',
      width: '120px',
      render: (row) => (
        row.isGraded && row.earnedScore !== null ? (
          <span style={{ fontWeight: 'bold', color: row.earnedScore >= 80 ? 'var(--color-success-700)' : 'var(--text-primary)', fontSize: 'var(--text-md)' }}>
            {row.earnedScore.toFixed(1)} <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {row.maxScore}</span>
          </span>
        ) : (
          <Badge variant="warning">Belum Dinilai</Badge>
        )
      )
    },
    {
      header: 'Umpan Balik Dosen',
      width: '240px',
      render: (row) => (
        row.lecturerFeedback ? (
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)', fontStyle: 'italic', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            "{row.lecturerFeedback}"
          </div>
        ) : (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>-</span>
        )
      )
    },
    {
      header: 'Aksi',
      width: '140px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={Eye}
            onClick={() => setInspectItemModal(row)}
            title="Lihat Rubrik & Rincian"
          >
            Rincian
          </Button>
          {row.isGraded && (
            <Button
              variant="outline"
              size="sm"
              icon={HelpCircle}
              onClick={() => {
                setSelectedItemForInquiry(row);
                setInquiryModalOpen(true);
              }}
              title="Ajukan Klarifikasi / Sanggahan"
            >
              Klarifikasi
            </Button>
          )}
        </div>
      )
    }
  ];

  // Konfigurasi Ekspor Buku Nilai Berjalan Mahasiswa
  const gradebookExportConfig: ExportConfig<CourseGradebookSummary> = useMemo(() => ({
    filename: `SALAM_Buku_Nilai_${user?.id || user?.name?.replace(/\s+/g, '_') || 'Mahasiswa'}`,
    title: 'BUKU NILAI & EVALUASI PEMBELAJARAN BERJALAN',
    subtitle: `Mahasiswa: ${user?.name || '-'} | ID/NIM: ${user?.id || '-'} | Periode: Semester Ganjil 2026/2027`,
    data: coursesGradebook,
    columns: [
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Nama Mata Kuliah', width: '220px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '180px' },
      { key: 'attendanceScore', header: 'Presensi (10%)', width: '90px', align: 'center', format: (val) => `${val}%` },
      { key: 'assignmentScore', header: 'Tugas (20%)', width: '90px', align: 'center' },
      { key: 'quizScore', header: 'Kuis (15%)', width: '90px', align: 'center' },
      { key: 'midtermScore', header: 'UTS (25%)', width: '90px', align: 'center' },
      { key: 'finalExamScore', header: 'UAS (30%)', width: '90px', align: 'center' },
      { key: 'currentRunningScore', header: 'Skor Berjalan', width: '100px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'projectedLetterGrade', header: 'Proyeksi Huruf', width: '90px', align: 'center' }
    ],
    metadata: {
      'Nama Mahasiswa': user?.name || '-',
      'ID Mahasiswa': user?.id || '-',
      'Rata-rata Nilai': `${averageGrade.toFixed(2)} / 100`,
      'Total Mata Kuliah': `${coursesGradebook.length} Mata Kuliah`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [user, coursesGradebook, averageGrade]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">Semester Ganjil 2026/2027</Badge>
            <Badge variant="success">Buku Nilai Pembelajaran Aktif</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            Buku Nilai & Evaluasi Pembelajaran
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Pelacakan skor tugas, kuis daring, presensi, simulasi target nilai akhir, dan klarifikasi penilaian.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown 
            config={gradebookExportConfig} 
            buttonLabel="Ekspor Buku Nilai" 
          />
          {onNavigateToKhs && (
            <Button 
              variant="primary" 
              icon={Award}
              onClick={onNavigateToKhs}
            >
              Lihat KHS & Transkrip
            </Button>
          )}
          <Button 
            variant="outline" 
            icon={Printer}
            onClick={() => window.print()}
          >
            Cetak Rapor Nilai
          </Button>
        </div>
      </div>

      {/* 2. Ringkasan Scorecards Capaian Nilai Berjalan */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* Rata-Rata Nilai Berjalan */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Rata-Rata Nilai Berjalan
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-primary-700)', marginTop: '4px' }}>
                  {averageGrade.toFixed(2)} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 100</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '8px', fontWeight: 'var(--font-weight-medium)' }}>
              Proyeksi Huruf Mutu: A (Sangat Baik)
            </div>
          </CardBody>
        </Card>

        {/* Mata Kuliah Dinilai */}
        <Card style={{ borderLeft: '4px solid var(--color-success-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Mata Kuliah Aktif
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-success-700)', marginTop: '4px' }}>
                  {coursesGradebook.length} Mata Kuliah
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              Total Beban: 21 SKS Terdaftar
            </div>
          </CardBody>
        </Card>

        {/* Total Tugas & Kuis Dinilai */}
        <Card style={{ borderLeft: '4px solid #0284c7' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Komponen Penilaian Selesai
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#0369a1', marginTop: '4px' }}>
                  100% Selesai
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              Seluruh Tugas, Kuis & Ujian Dinilai
            </div>
          </CardBody>
        </Card>

        {/* Umpan Balik Dosen */}
        <Card style={{ borderLeft: '4px solid #7c3aed' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Umpan Balik & Evaluasi
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#6d28d9', marginTop: '4px' }}>
                  {feedbackList.length} Catatan
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <MessageSquare size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              Ulasan Dosen Pengampu Lengkap
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Tab Navigasi Buku Nilai */}
      <div 
        style={{ 
          display: 'flex', 
          gap: 'var(--space-2)', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: 'var(--space-2)',
          overflowX: 'auto'
        }}
      >
        <button
          className={`btn ${activeTab === 'buku_nilai' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('buku_nilai')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <BookOpen size={16} />
          <span>Buku Nilai Mata Kuliah</span>
        </button>

        <button
          className={`btn ${activeTab === 'rincian_komponen' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('rincian_komponen')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <Layers size={16} />
          <span>Rincian Komponen Penilaian</span>
        </button>

        <button
          className={`btn ${activeTab === 'simulator_target' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('simulator_target')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <Calculator size={16} />
          <span>Kalkulator & Target Nilai</span>
        </button>

        <button
          className={`btn ${activeTab === 'umpan_balik_dosen' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('umpan_balik_dosen')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <MessageSquare size={16} />
          <span>Umpan Balik Dosen ({feedbackList.length})</span>
        </button>

        <button
          className={`btn ${activeTab === 'sanggah_nilai' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('sanggah_nilai')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <HelpCircle size={16} />
          <span>Klarifikasi & Sanggah ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: BUKU NILAI MATA KULIAH SAYA */}
      {activeTab === 'buku_nilai' && (
        <div className="flex flex-col gap-6">
          {/* Search Bar */}
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="flex items-center gap-2" style={{ minWidth: '280px', maxWidth: '480px', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={16} 
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Cari mata kuliah atau nama dosen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    paddingLeft: '36px', 
                    paddingRight: '12px', 
                    paddingTop: '8px', 
                    paddingBottom: '8px',
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-color)',
                    width: '100%'
                  }}
                />
              </div>

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

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Menampilkan <strong>{filteredCourses.length}</strong> mata kuliah aktif semester ini
            </div>
          </div>

          {/* Grid Cards Mata Kuliah & Skor Berjalan */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
              gap: 'var(--space-4)' 
            }}
          >
            {paginatedCourses.map((course) => (
              <Card key={course.classId} style={{ display: 'flex', flexDirection: 'column' }}>
                <CardHeader className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: '4px' }}>
                      <Badge variant="primary">{course.courseCode}</Badge>
                      <Badge variant="default">{course.credits} SKS</Badge>
                      <Badge variant="default">{course.className}</Badge>
                    </div>
                    <CardTitle style={{ fontSize: 'var(--text-base)' }}>{course.courseName}</CardTitle>
                    <CardSubtitle style={{ fontSize: 'var(--text-xs)', marginTop: '2px' }}>
                      Dosen: {course.lecturerName}
                    </CardSubtitle>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-700)' }}>
                      {course.currentCalculatedScore.toFixed(2)}
                    </div>
                    <div style={{ marginTop: '2px' }}>
                      {getLetterGradeBadge(course.projectedLetterGrade)}
                    </div>
                  </div>
                </CardHeader>

                <CardBody style={{ flexGrow: 1, padding: 'var(--space-4) var(--space-5)' }}>
                  {/* Komponen Bar Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 2px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Presensi (10%)</div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{course.presenceScore.toFixed(0)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 2px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tugas (20%)</div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{course.assignmentScore.toFixed(0)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 2px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Kuis (15%)</div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{course.quizScore.toFixed(0)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 2px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UTS (25%)</div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{course.midtermScore.toFixed(0)}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '6px 2px', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UAS (30%)</div>
                      <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginTop: '2px' }}>{course.finalExamScore.toFixed(0)}</div>
                    </div>
                  </div>

                  {/* Progress Bar Status Nilai */}
                  <div>
                    <div className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status Kelulusan</span>
                      <span style={{ fontWeight: 'bold', color: course.currentCalculatedScore >= 60 ? 'var(--color-success-700)' : 'var(--color-danger-main)' }}>
                        {course.currentCalculatedScore >= 60 ? 'LULUS (Memenuhi Syarat)' : 'BELUM MEMENUHI'}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, course.currentCalculatedScore)}%`, 
                          height: '100%', 
                          backgroundColor: course.currentCalculatedScore >= 80 ? 'var(--color-success-600)' : course.currentCalculatedScore >= 60 ? 'var(--color-primary-600)' : 'var(--color-danger-main)' 
                        }} 
                      />
                    </div>
                  </div>
                </CardBody>

                <div 
                  style={{ 
                    padding: 'var(--space-3) var(--space-5)', 
                    backgroundColor: 'var(--bg-subtle)', 
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedClassId(course.classId);
                      setActiveTab('rincian_komponen');
                    }}
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    Buka Rincian Komponen
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Calculator}
                    onClick={() => {
                      setSelectedClassId(course.classId);
                      setActiveTab('simulator_target');
                    }}
                    style={{ fontSize: 'var(--text-xs)' }}
                  >
                    Simulasi Target
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card>
            <CardBody style={{ padding: 'var(--space-2) var(--space-4)' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCourses.length}
                pageSize={pageSize}
                pageSizeOptions={[3, 6, 12, 24]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemLabel="mata kuliah"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: RINCIAN KOMPONEN PENILAIAN MATA KULIAH */}
      {activeTab === 'rincian_komponen' && selectedCourse && (
        <div className="flex flex-col gap-6">
          {/* Selector Mata Kuliah */}
          <Card>
            <CardBody style={{ padding: 'var(--space-4)' }}>
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <label htmlFor="courseSelect" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Pilih Mata Kuliah:
                  </label>
                  <select
                    id="courseSelect"
                    className="form-control"
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--bg-surface)', 
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      minWidth: '280px'
                    }}
                  >
                    {coursesGradebook.map((c) => (
                      <option key={c.classId} value={c.classId}>
                        {c.courseCode} - {c.courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Nilai Akhir:</span>
                  <strong style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary-700)' }}>
                    {selectedCourse.currentCalculatedScore.toFixed(2)}
                  </strong>
                  {getLetterGradeBadge(selectedCourse.projectedLetterGrade)}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Matriks Ringkasan 5 Pilar Penilaian */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Presensi (10%)</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCourse.presenceScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-success-700)', marginTop: '2px' }}>
                {selectedCourse.presenceDetails.attendancePercentage.toFixed(0)}% Kehadiran
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tugas (20%)</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCourse.assignmentScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bobot Nilai: {(selectedCourse.assignmentScore * 0.20).toFixed(2)}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Kuis (15%)</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCourse.quizScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bobot Nilai: {(selectedCourse.quizScore * 0.15).toFixed(2)}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>UTS (25%)</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCourse.midtermScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bobot Nilai: {(selectedCourse.midtermScore * 0.25).toFixed(2)}
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-surface)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>UAS (30%)</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                {selectedCourse.finalExamScore.toFixed(1)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Bobot Nilai: {(selectedCourse.finalExamScore * 0.30).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Tabel Rincian Aktivitas Tugas & Kuis */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Daftar Tugas, Kuis & Evaluasi {selectedCourse.courseName}</CardTitle>
                <CardSubtitle>Dosen Pengampu: {selectedCourse.lecturerName} (NIDN: {selectedCourse.lecturerNidn})</CardSubtitle>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={HelpCircle}
                onClick={() => {
                  setSelectedItemForInquiry(selectedCourse.items[0] || null);
                  setInquiryModalOpen(true);
                }}
              >
                Ajukan Sanggah / Klarifikasi
              </Button>
            </CardHeader>

            <CardBody style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={itemColumns}
                  data={selectedCourse.items}
                  keyExtractor={(item) => item.id}
                  emptyMessage="Belum ada aktivitas penilaian terdaftar pada mata kuliah ini."
                />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: KALKULATOR & SIMULATOR TARGET NILAI AKHIR */}
      {activeTab === 'simulator_target' && selectedCourse && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator size={20} color="var(--color-primary-800)" />
                <div>
                  <CardTitle>Kalkulator & Simulator Target Nilai (What-If Analysis)</CardTitle>
                  <CardSubtitle>Hitung estimasi skor UAS yang diperlukan untuk mencapai target Huruf Mutu impian Anda</CardSubtitle>
                </div>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-6)' }}>
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                  gap: 'var(--space-6)' 
                }}
              >
                {/* Kolom 1: Konfigurasi Target */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="simCourseSelect" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                      Pilih Mata Kuliah yang Ingin Disimulasikan:
                    </label>
                    <select
                      id="simCourseSelect"
                      className="form-control"
                      value={selectedClassId}
                      onChange={(e) => setSelectedClassId(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                    >
                      {coursesGradebook.map((c) => (
                        <option key={c.classId} value={c.classId}>
                          {c.courseCode} - {c.courseName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
                      Pilih Target Huruf Mutu yang Diinginkan:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {(['A', 'A-', 'B+', 'B'] as LetterGrade[]).map((grade) => (
                        <button
                          key={grade}
                          type="button"
                          className={`btn ${simulatorTargetGrade === grade ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => setSimulatorTargetGrade(grade)}
                          style={{ fontWeight: 'bold', padding: '10px' }}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rincian Skor Berjalan Saat Ini */}
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      Akumulasi Skor Berjalan Saat Ini (Bobot 70%):
                    </div>
                    <ul style={{ paddingLeft: '16px', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                      <li>Presensi (10%): {selectedCourse.presenceScore.toFixed(1)} → <strong>{(selectedCourse.presenceScore * 0.10).toFixed(2)}</strong></li>
                      <li>Tugas (20%): {selectedCourse.assignmentScore.toFixed(1)} → <strong>{(selectedCourse.assignmentScore * 0.20).toFixed(2)}</strong></li>
                      <li>Kuis (15%): {selectedCourse.quizScore.toFixed(1)} → <strong>{(selectedCourse.quizScore * 0.15).toFixed(2)}</strong></li>
                      <li>UTS (25%): {selectedCourse.midtermScore.toFixed(1)} → <strong>{(selectedCourse.midtermScore * 0.25).toFixed(2)}</strong></li>
                    </ul>
                  </div>
                </div>

                {/* Kolom 2: Hasil Kalkulasi Simulasi */}
                {simulationResult && (
                  <div 
                    style={{ 
                      backgroundColor: simulationResult.isAchievable ? 'var(--color-primary-50)' : '#fef2f2', 
                      border: `1px solid ${simulationResult.isAchievable ? 'var(--color-primary-200)' : '#fecaca'}`,
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-6)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-center">
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Target Huruf Mutu:</span>
                        <Badge variant={simulationResult.isAchievable ? 'success' : 'danger'}>
                          {simulationResult.targetLetterGrade} (Skor Min. {simulationResult.targetScore})
                        </Badge>
                      </div>

                      <div style={{ textAlign: 'center', margin: 'var(--space-6) 0' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          Skor Ujian Akhir Semester (UAS) yang Diperlukan:
                        </div>
                        <div 
                          style={{ 
                            fontSize: 'var(--text-3xl)', 
                            fontWeight: 'bold', 
                            color: simulationResult.isAchievable ? 'var(--color-primary-800)' : 'var(--color-danger-main)',
                            marginTop: '8px'
                          }}
                        >
                          {simulationResult.requiredFinalExamScore.toFixed(1)} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ 100</span>
                        </div>
                      </div>

                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: '1.6', textAlign: 'center' }}>
                        {simulationResult.notes}
                      </p>
                    </div>

                    <div style={{ marginTop: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      Rumus Penilaian Resmi STAI AL-ITTIHAD: 10% Presensi + 20% Tugas + 15% Kuis + 25% UTS + 30% UAS
                    </div>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 4: PUSAT UMPAN BALIK DOSEN (FEEDBACK HUB) */}
      {activeTab === 'umpan_balik_dosen' && (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Semua Umpan Balik & Evaluasi Kualitatif Dosen</CardTitle>
              <CardSubtitle>Koleksi catatan pembinaan dosen pengampu pada tugas, kuis, dan diskusi perkuliahan</CardSubtitle>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className="flex flex-col gap-4">
                {feedbackList.map((fb) => (
                  <div 
                    key={fb.id}
                    style={{ 
                      backgroundColor: 'var(--bg-subtle)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: 'var(--space-4)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                          <Badge variant="primary">{fb.courseCode}</Badge>
                          <strong style={{ fontSize: 'var(--text-sm)' }}>{fb.courseName}</strong>
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          Aktivitas: <strong>{fb.assessmentTitle}</strong> • Dosen: {fb.lecturerName}
                        </div>
                      </div>

                      <Badge variant="success">Skor: {fb.score.toFixed(1)}</Badge>
                    </div>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontStyle: 'italic', marginTop: '10px', lineHeight: '1.6' }}>
                      "{fb.feedback}"
                    </p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 5: KLARIFIKASI & SANGGAH NILAI */}
      {activeTab === 'sanggah_nilai' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Riwayat Permohonan Klarifikasi Nilai</CardTitle>
                <CardSubtitle>Layanan sanggah resmi untuk klarifikasi skor tugas, kuis, atau rubrik penilaian</CardSubtitle>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={HelpCircle}
                onClick={() => {
                  setSelectedItemForInquiry(selectedCourse?.items[0] || null);
                  setInquiryModalOpen(true);
                }}
              >
                Ajukan Klarifikasi Baru
              </Button>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className="flex flex-col gap-4">
                {inquiries.map((inq) => (
                  <div 
                    key={inq.id}
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: 'var(--space-4)',
                      backgroundColor: 'var(--bg-surface)'
                    }}
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong style={{ fontSize: 'var(--text-sm)' }}>{inq.courseName}</strong>
                          {getInquiryStatusBadge(inq.status)}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Aktivitas: {inq.assessmentTitle} • Skor Awal: <strong>{inq.currentScore}</strong>
                        </div>
                      </div>

                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        Kategori: <Badge variant="default">{inq.reasonCategory.replace('_', ' ')}</Badge>
                      </div>
                    </div>

                    <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                      <strong>Pesan Mahasiswa:</strong>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-primary)' }}>{inq.inquiryMessage}</p>
                    </div>

                    {inq.lecturerResponse && (
                      <div style={{ backgroundColor: 'var(--color-primary-50)', border: '1px solid var(--color-primary-200)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                        <strong style={{ color: 'var(--color-primary-900)' }}>Tanggapan Dosen Pengampu:</strong>
                        <p style={{ margin: '4px 0 0', color: 'var(--color-primary-900)' }}>{inq.lecturerResponse}</p>
                        {inq.revisedScore !== undefined && (
                          <div style={{ marginTop: '4px', fontWeight: 'bold', color: 'var(--color-success-700)' }}>
                            Skor Direvisi Menjadi: {inq.revisedScore}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* MODAL 1: FORM PENGAJUAN KLARIFIKASI / SANGGAH NILAI */}
      {inquiryModalOpen && selectedItemForInquiry && selectedCourse && (
        <Modal
          isOpen={inquiryModalOpen}
          onClose={() => setInquiryModalOpen(false)}
          title={`Pengajuan Klarifikasi Nilai: ${selectedItemForInquiry.title}`}
          maxWidth="640px"
        >
          <form onSubmit={handleSubmitInquiry} className="flex flex-col gap-4">
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
              <div>Mata Kuliah: <strong>{selectedCourse.courseName}</strong></div>
              <div>Dosen Pengampu: <strong>{selectedCourse.lecturerName}</strong></div>
              <div>Skor Saat Ini: <strong>{selectedItemForInquiry.earnedScore ?? 0} / {selectedItemForInquiry.maxScore}</strong></div>
            </div>

            <div>
              <label htmlFor="inquiryReasonSelect" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Kategori Alasan Permohonan:
              </label>
              <select
                id="inquiryReasonSelect"
                className="form-control"
                value={inquiryReasonCategory}
                onChange={(e) => setInquiryReasonCategory(e.target.value as any)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
              >
                <option value="KETIDAKSESUAIAN_RUBRIK">Ketidaksesuaian Poin Rubrik Penilaian</option>
                <option value="KOREKSI_BERKAS">Koreksi Berkas Lampiran / Tugas Tertukar</option>
                <option value="REVISI_PENILAIAN">Permohonan Perbaikan / Remedial Mandiri</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="inquiryMessageArea" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                Pesan Permohonan Klarifikasi (Sampaikan Secara Santun & Akademis):
              </label>
              <textarea
                id="inquiryMessageArea"
                className="form-control"
                rows={4}
                required
                placeholder="Tuliskan penjelasan mengenai bagian tugas atau nomor kuis yang ingin diklarifikasi secara rinci..."
                value={inquiryMessageText}
                onChange={(e) => setInquiryMessageText(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', resize: 'vertical' }}
              />
            </div>

            <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-2)' }}>
              <Button type="button" variant="secondary" onClick={() => setInquiryModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" icon={Send}>
                Kirim Permohonan
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: INSPEKSI RINCIAN RUBRIK PENILAIAN */}
      {inspectItemModal && (
        <Modal
          isOpen={!!inspectItemModal}
          onClose={() => setInspectItemModal(null)}
          title={`Rincian Penilaian: ${inspectItemModal.title}`}
          maxWidth="640px"
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Jenis Aktivitas</div>
                <strong style={{ fontSize: 'var(--text-sm)' }}>{inspectItemModal.componentType.replace('_', ' ')}</strong>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Skor Diperoleh</div>
                <strong style={{ fontSize: 'var(--text-xl)', color: 'var(--color-primary-700)' }}>
                  {inspectItemModal.earnedScore ?? '-'}/{inspectItemModal.maxScore}
                </strong>
              </div>
            </div>

            {/* Rubric Details if Available */}
            {inspectItemModal.rubricSummary && inspectItemModal.rubricSummary.length > 0 && (
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', marginBottom: '8px' }}>
                  Kriteria & Poin Rubrik Penilaian:
                </div>
                <div className="flex flex-col gap-2">
                  {inspectItemModal.rubricSummary.map((rub, idx) => (
                    <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)' }}>{rub.criterionTitle}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Tingkat: {rub.levelTitle}</div>
                      </div>
                      <Badge variant="success">{rub.points} / {rub.maxPoints}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {inspectItemModal.lecturerFeedback && (
              <div style={{ backgroundColor: 'var(--bg-subtle)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)' }}>
                <strong>Catatan Dosen Pengampu:</strong>
                <p style={{ margin: '4px 0 0', fontStyle: 'italic' }}>"{inspectItemModal.lecturerFeedback}"</p>
              </div>
            )}

            <div className="flex justify-end" style={{ marginTop: 'var(--space-2)' }}>
              <Button variant="secondary" onClick={() => setInspectItemModal(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
