import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  Award, 
  TrendingUp, 
  Printer, 
  Eye, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  Sparkles, 
  Search, 
  QrCode, 
  BarChart3, 
  GraduationCap, 
  MessageSquare,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { 
  KhsSemesterData, 
  KhsGradeItem, 
  KhsPerformanceTrend, 
  StudentTranscriptSummary
} from '../../types/khs';
import { khsService } from '../../services/khsService';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface KhsMahasiswaPageProps {
  onNavigateToKrs?: () => void;
  onNavigateToSchedule?: () => void;
  onNavigateToClass?: (classId: string) => void;
  onNavigateToGradebook?: () => void;
}

type KhsTab = 'khs_semester' | 'transkrip_kumulatif' | 'analisis_grafik';

export const KhsMahasiswaPage: React.FC<KhsMahasiswaPageProps> = ({
  onNavigateToKrs,
  onNavigateToGradebook
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<KhsTab>('khs_semester');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('sem-20261');
  const [khsData, setKhsData] = useState<KhsSemesterData | null>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return khsService.getStudentKhs(studentId, 'sem-20261');
  });
  const [transcriptData, setTranscriptData] = useState<StudentTranscriptSummary | null>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return khsService.getFullTranscript(studentId);
  });
  const [trendData, setTrendData] = useState<KhsPerformanceTrend[]>(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return khsService.getPerformanceTrend(studentId);
  });
  
  // Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('SEMUA');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  // Auto reset page on search and category filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, selectedSemesterId]);

  const hasActiveFilters = searchQuery !== '' || categoryFilter !== 'SEMUA';

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('SEMUA');
    setCurrentPage(1);
  };

  // Modal States
  const [selectedGradeDetail, setSelectedGradeDetail] = useState<KhsGradeItem | null>(null);
  const [printPreviewModal, setPrintPreviewModal] = useState<boolean>(false);

  // Available semesters
  const availableSemesters = useMemo(() => {
    const studentId = user?.id || 'usr-mhs-01';
    return khsService.getAvailableSemesters(studentId);
  }, [user]);

  // Load Data on semester / user change
  useEffect(() => {
    const studentId = user?.id || 'usr-mhs-01';
    const currentKhs = khsService.getStudentKhs(studentId, selectedSemesterId);
    const fullTranscript = khsService.getFullTranscript(studentId);
    const performanceTrend = khsService.getPerformanceTrend(studentId);

    setKhsData(currentKhs);
    setTranscriptData(fullTranscript);
    setTrendData(performanceTrend);
  }, [user, selectedSemesterId]);

  // Filtered grades in current semester
  const filteredGrades = useMemo(() => {
    if (!khsData) return [];
    return khsData.grades.filter((item) => {
      const matchSearch = 
        item.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.lecturerName.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchSearch) return false;

      if (categoryFilter === 'SEMUA') return true;
      return item.courseCategory === categoryFilter;
    });
  }, [khsData, searchQuery, categoryFilter]);

  // Paginated grades
  const totalPages = Math.ceil(filteredGrades.length / pageSize) || 1;
  const paginatedGrades = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGrades.slice(start, start + pageSize);
  }, [filteredGrades, currentPage, pageSize]);

  // Grade Distribution Counts for Analysis Tab
  const gradeDistribution = useMemo(() => {
    if (!transcriptData) return [];
    const counts: Record<string, number> = { 'A': 0, 'A-': 0, 'B+': 0, 'B': 0, 'B-': 0, 'C+': 0, 'C': 0, 'D': 0, 'E': 0 };
    
    transcriptData.groups.forEach((grp) => {
      grp.courses.forEach((c) => {
        if (counts[c.letterGrade] !== undefined) {
          counts[c.letterGrade]++;
        }
      });
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([grade, count]) => ({ grade, count }));
  }, [transcriptData]);

  const handlePrint = () => {
    window.print();
  };

  const getLetterGradeBadge = (grade: string) => {
    if (grade === 'A') return <Badge variant="success">A (4.00)</Badge>;
    if (grade === 'A-') return <Badge variant="success">A- (3.75)</Badge>;
    if (grade === 'B+') return <Badge variant="primary">B+ (3.50)</Badge>;
    if (grade === 'B') return <Badge variant="primary">B (3.00)</Badge>;
    if (grade === 'B-') return <Badge variant="warning">B- (2.75)</Badge>;
    if (grade === 'C+' || grade === 'C') return <Badge variant="warning">C ({grade})</Badge>;
    return <Badge variant="danger">{grade}</Badge>;
  };

  const getCategoryBadge = (cat: string) => {
    if (cat === 'WAJIB_PRODI') return <Badge variant="primary">Wajib Prodi</Badge>;
    if (cat === 'WAJIB_INSTITUSI') return <Badge variant="default">Wajib Institut</Badge>;
    return <Badge variant="info">Pilihan</Badge>;
  };

  if (!khsData || !transcriptData) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
        Memuat data Kartu Hasil Studi...
      </div>
    );
  }

  // Table Columns Definition for Semester KHS
  const khsColumns: Column<KhsGradeItem>[] = [
    {
      header: 'No',
      width: '50px',
      render: (_, index) => <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{index + 1}</span>
    },
    {
      header: 'Mata Kuliah',
      width: '260px',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
            {row.courseName}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span>{row.courseCode}</span>
            <span>•</span>
            <span>{row.className}</span>
            <span>•</span>
            <span>{row.lecturerName}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Kategori',
      width: '120px',
      render: (row) => getCategoryBadge(row.courseCategory)
    },
    {
      header: 'SKS',
      width: '60px',
      render: (row) => <span style={{ fontWeight: 'var(--font-weight-bold)' }}>{row.credits}</span>
    },
    {
      header: 'Presensi (10%)',
      width: '100px',
      render: (row) => <span>{row.presenceScore.toFixed(1)}</span>
    },
    {
      header: 'Tugas (20%)',
      width: '95px',
      render: (row) => <span>{row.assignmentScore.toFixed(1)}</span>
    },
    {
      header: 'Kuis (15%)',
      width: '90px',
      render: (row) => <span>{row.quizScore.toFixed(1)}</span>
    },
    {
      header: 'UTS (25%)',
      width: '90px',
      render: (row) => <span>{row.midtermScore.toFixed(1)}</span>
    },
    {
      header: 'UAS (30%)',
      width: '90px',
      render: (row) => <span>{row.finalExamScore.toFixed(1)}</span>
    },
    {
      header: 'Nilai Akhir',
      width: '100px',
      render: (row) => (
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)' }}>
          {row.finalScore.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Huruf Mutu',
      width: '110px',
      render: (row) => getLetterGradeBadge(row.letterGrade)
    },
    {
      header: 'SKSN (SKS x Bobot)',
      width: '120px',
      render: (row) => (
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
          {row.qualityPoints.toFixed(2)}
        </span>
      )
    },
    {
      header: 'Rincian',
      width: '80px',
      render: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedGradeDetail(row)}
          title="Lihat Rincian Penilaian"
          aria-label={`Rincian ${row.courseName}`}
        >
          Lihat
        </Button>
      )
    }
  ];

  // Konfigurasi Ekspor Resmi KHS Mahasiswa
  const khsExportConfig: ExportConfig<KhsGradeItem> = useMemo(() => ({
    filename: `SALAM_KHS_${khsData?.studentNim || 'Mahasiswa'}_Semester_${khsData?.semesterNumber || 1}`,
    title: 'KARTU HASIL STUDI (KHS) MAHASISWA',
    subtitle: `Periode: ${khsData?.academicPeriodName || '-'} | NIM: ${khsData?.studentNim || '-'} | Nama: ${khsData?.studentName || '-'}`,
    data: filteredGrades,
    columns: [
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Nama Mata Kuliah', width: '220px' },
      { key: 'credits', header: 'SKS', width: '60px', align: 'center' },
      { key: 'lecturerName', header: 'Dosen Pengampu', width: '180px' },
      { key: 'numericScore', header: 'Nilai Akhir', width: '90px', align: 'center', format: (val) => Number(val).toFixed(1) },
      { key: 'letterGrade', header: 'Huruf Mutu', width: '90px', align: 'center' },
      { key: 'gradePoint', header: 'Bobot (N)', width: '80px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'qualityScore', header: 'Mutu (N x K)', width: '90px', align: 'center', format: (val) => Number(val).toFixed(2) },
      { key: 'passingStatus', header: 'Status Kelulusan', width: '110px', align: 'center' }
    ],
    metadata: {
      'Nama Mahasiswa': khsData?.studentName || '-',
      'NIM': khsData?.studentNim || '-',
      'Program Studi': khsData?.studyProgram || '-',
      'Dosen PA': khsData?.academicAdvisorName || '-',
      'IPS (Indeks Prestasi Semester)': `${khsData?.semesterGpa.toFixed(2) || '0.00'} / 4.00`,
      'IPK (Indeks Prestasi Kumulatif)': `${khsData?.cumulativeGpa.toFixed(2) || '0.00'} / 4.00`,
      'Total SKS Semester': `${khsData?.totalCreditsEnrolled || 0} SKS`
    }
  }), [khsData, filteredGrades]);

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 'var(--space-1)' }}>
            <Badge variant="primary">{khsData?.academicPeriodName || 'Semester Aktif'}</Badge>
            <Badge variant="success">Nilai Diterbitkan & Sah</Badge>
            <Badge variant="default">Semester {khsData?.semesterNumber || 5}</Badge>
          </div>
          <h1 style={{ fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
            Kartu Hasil Studi (KHS) & Transkrip
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Rekapitulasi pencapaian indeks prestasi akademik, rincian komponen nilai perkuliahan, dan pengesahan resmi.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <ExportDropdown 
            config={khsExportConfig} 
            buttonLabel="Ekspor / Unduh KHS" 
          />
          <Button 
            variant="primary" 
            icon={Printer}
            onClick={() => setPrintPreviewModal(true)}
          >
            Cetak KHS Resmi
          </Button>
          {onNavigateToKrs && (
            <Button 
              variant="outline" 
              icon={BookOpen}
              onClick={onNavigateToKrs}
            >
              Rencana Studi (KRS)
            </Button>
          )}
          {onNavigateToGradebook && (
            <Button 
              variant="outline" 
              icon={Award}
              onClick={onNavigateToGradebook}
            >
              Buku Nilai Perkuliahan
            </Button>
          )}
        </div>
      </div>

      {/* 2. Kartu Rangkuman Prestasi Akademik (Scorecards) */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: 'var(--space-4)' 
        }}
      >
        {/* IPS */}
        <Card style={{ borderLeft: '4px solid var(--color-primary-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Indeks Prestasi Semester (IPS)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)', marginTop: '4px' }}>
                  {khsData.semesterGpa.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)' }}>
                <TrendingUp size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '8px', fontWeight: 'var(--font-weight-medium)' }}>
              Skala 4.00 (Sangat Memuaskan)
            </div>
          </CardBody>
        </Card>

        {/* IPK */}
        <Card style={{ borderLeft: '4px solid var(--color-success-600)' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Indeks Prestasi Kumulatif (IPK)
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-700)', marginTop: '4px' }}>
                  {khsData.cumulativeGpa.toFixed(2)}
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-success-50)', color: 'var(--color-success-700)' }}>
                <Award size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              Predikat: <strong>{khsData.academicStanding}</strong>
            </div>
          </CardBody>
        </Card>

        {/* SKS Semester */}
        <Card style={{ borderLeft: '4px solid #0284c7' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  SKS Semester / Lulus
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#0369a1', marginTop: '4px' }}>
                  {khsData.totalCreditsEnrolled} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'normal' }}>/ {khsData.totalCreditsPassed} SKS</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f0f9ff', color: '#0284c7' }}>
                <Layers size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              100% Mata Kuliah Lulus
            </div>
          </CardBody>
        </Card>

        {/* Total SKS Kumulatif */}
        <Card style={{ borderLeft: '4px solid #7c3aed' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Total SKS Kumulatif
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#6d28d9', marginTop: '4px' }}>
                  {khsData.totalCumulativeCredits} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'normal' }}>SKS</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#f5f3ff', color: '#7c3aed' }}>
                <GraduationCap size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '8px' }}>
              Beban Kurikulum: 144 SKS (69.4% Selesai)
            </div>
          </CardBody>
        </Card>

        {/* Beban SKS Maksimal Semester Depan */}
        <Card style={{ borderLeft: '4px solid #d97706' }}>
          <CardBody style={{ padding: 'var(--space-4)' }}>
            <div className="flex justify-between items-start">
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
                  Maksimal SKS Semester Depan
                </div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)', color: '#b45309', marginTop: '4px' }}>
                  {khsData.maxCreditNextSemester} <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'normal' }}>SKS</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#fffbeb', color: '#d97706' }}>
                <Sparkles size={20} />
              </div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '8px', fontWeight: 'var(--font-weight-medium)' }}>
              Hak Kuota Maksimal Penuh
            </div>
          </CardBody>
        </Card>
      </div>

      {/* 3. Informasi Mahasiswa & DPA */}
      <Card>
        <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
              gap: 'var(--space-4)' 
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Nama Mahasiswa</div>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {khsData.studentName} ({khsData.studentNim})
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Jenjang: {khsData.academicDegree}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Program Studi</div>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {khsData.studyProgram}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Fakultas Tarbiyah STAI Al-Ittihad
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Dosen Pembimbing Akademik (DPA)</div>
              <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)', marginTop: '2px' }}>
                {khsData.academicAdvisorName}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                NIDN: {khsData.academicAdvisorNidn}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Otentikasi & Verifikasi Digital</div>
              <div style={{ fontWeight: 'var(--font-weight-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-primary-700)', marginTop: '2px' }}>
                {khsData.verificationCode}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-700)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} /> Terverifikasi SIAKAD Cloud
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 4. Tab Navigasi */}
      <div 
        style={{ 
          display: 'flex', 
          gap: 'var(--space-2)', 
          borderBottom: '1px solid var(--border-color)', 
          paddingBottom: 'var(--space-2)' 
        }}
      >
        <button
          className={`btn ${activeTab === 'khs_semester' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('khs_semester')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FileSpreadsheet size={16} />
          <span>KHS Semester ({khsData.academicYear})</span>
        </button>

        <button
          className={`btn ${activeTab === 'transkrip_kumulatif' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('transkrip_kumulatif')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Award size={16} />
          <span>Transkrip Kumulatif</span>
        </button>

        <button
          className={`btn ${activeTab === 'analisis_grafik' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setActiveTab('analisis_grafik')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <BarChart3 size={16} />
          <span>Evaluasi & Grafik Prestasi</span>
        </button>
      </div>

      {/* TAB 1: KHS SEMESTER AKTIF & PILIHAN SEMESTER */}
      {activeTab === 'khs_semester' && (
        <div className="flex flex-col gap-6">
          {/* Controls: Semester Selector & Search Filter */}
          <Card>
            <CardBody style={{ padding: 'var(--space-4)' }}>
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
                {/* Semester Dropdown */}
                <div className="flex items-center gap-3 flex-wrap">
                  <label htmlFor="semesterSelect" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Pilih Semester:
                  </label>
                  <select
                    id="semesterSelect"
                    className="form-control"
                    value={selectedSemesterId}
                    onChange={(e) => setSelectedSemesterId(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--bg-surface)', 
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--font-weight-medium)',
                      minWidth: '240px'
                    }}
                  >
                    {availableSemesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        {sem.name} {sem.isCurrent ? '(Aktif)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search & Category Filter */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div style={{ position: 'relative', minWidth: '220px' }}>
                    <Search 
                      size={16} 
                      style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
                    />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari mata kuliah / dosen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ 
                        paddingLeft: '34px', 
                        paddingRight: '12px', 
                        paddingTop: '6px', 
                        paddingBottom: '6px',
                        borderRadius: 'var(--radius-md)', 
                        border: '1px solid var(--border-color)',
                        width: '100%'
                      }}
                    />
                  </div>

                  <select
                    className="form-control"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-color)', 
                      backgroundColor: 'var(--bg-surface)', 
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-sm)'
                    }}
                  >
                    <option value="SEMUA">Semua Kategori</option>
                    <option value="WAJIB_PRODI">Wajib Prodi</option>
                    <option value="WAJIB_INSTITUSI">Wajib Institut</option>
                    <option value="PILIHAN">Pilihan</option>
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
            </CardBody>
          </Card>

          {/* Rincian Tabel Nilai KHS */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Rincian Nilai Hasil Studi Semester {khsData.semesterNumber}</CardTitle>
                <CardSubtitle>
                  Bobot Penilaian Standar SALAM: Presensi (10%), Tugas (20%), Kuis (15%), UTS (25%), UAS (30%)
                </CardSubtitle>
              </div>

              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Menampilkan <strong>{filteredGrades.length}</strong> mata kuliah
              </div>
            </CardHeader>

            <CardBody style={{ padding: 0 }}>
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={khsColumns}
                  data={paginatedGrades}
                  keyExtractor={(item) => item.id}
                  emptyMessage="Tidak ada data mata kuliah yang sesuai kriteria pencarian."
                />
              </div>
              <div style={{ padding: 'var(--space-2) var(--space-4)' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredGrades.length}
                  pageSize={pageSize}
                  pageSizeOptions={[3, 6, 12, 24]}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                  itemLabel="mata kuliah"
                />
              </div>
            </CardBody>

            {/* Footer Summary Table */}
            <div 
              style={{ 
                padding: 'var(--space-4) var(--space-6)', 
                backgroundColor: 'var(--color-primary-50)', 
                borderTop: '1px solid var(--color-primary-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                  Total Beban: <strong>{khsData.totalCreditsEnrolled} SKS</strong>
                </span>
                <span>•</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                  Total SKS Lulus: <strong>{khsData.totalCreditsPassed} SKS</strong>
                </span>
                <span>•</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                  Total Bobot Mutu (SKSN): <strong>{(khsData.grades.reduce((acc, g) => acc + g.qualityPoints, 0)).toFixed(2)}</strong>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)', fontWeight: 'var(--font-weight-medium)' }}>
                  Indeks Prestasi Semester (IPS):
                </span>
                <Badge variant="success" style={{ fontSize: 'var(--text-sm)', padding: '6px 14px', fontWeight: 'bold' }}>
                  {khsData.semesterGpa.toFixed(2)} / 4.00
                </Badge>
              </div>
            </div>
          </Card>

          {/* Catatan Pembimbing Akademik */}
          {khsData.advisorNotes && (
            <Card style={{ backgroundColor: '#f8fafc', borderLeft: '4px solid var(--color-primary-600)' }}>
              <CardBody style={{ padding: 'var(--space-5)' }}>
                <div className="flex items-start gap-3">
                  <div style={{ padding: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', flexShrink: 0 }}>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--text-primary)' }}>
                      Catatan Pembinaan & Evaluasi Dosen Pembimbing Akademik (DPA)
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Oleh: {khsData.academicAdvisorName} (NIDN: {khsData.academicAdvisorNidn})
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: '8px', fontStyle: 'italic', lineHeight: '1.6' }}>
                      "{khsData.advisorNotes}"
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: TRANSKRIP KUMULATIF LENGKAP */}
      {activeTab === 'transkrip_kumulatif' && (
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Transkrip Nilai Akademik Lengkap</CardTitle>
                <CardSubtitle>
                  Rekam jejak seluruh mata kuliah yang telah diselesaikan dari Semester 1 hingga Semester 5
                </CardSubtitle>
              </div>

              <Button 
                variant="primary" 
                size="sm" 
                icon={Printer}
                onClick={() => setPrintPreviewModal(true)}
              >
                Cetak Transkrip Resmi
              </Button>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  backgroundColor: 'var(--bg-subtle)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-6)',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)'
                }}
              >
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total SKS Kumulatif</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    {transcriptData.totalCreditsEarned} SKS
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Angka Mutu (SKSN)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                    {transcriptData.totalQualityPoints.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Indeks Prestasi Kumulatif (IPK)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary-700)' }}>
                    {transcriptData.cumulativeGpa.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Predikat Yudisium Sementara</div>
                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-success-700)', marginTop: '2px' }}>
                    {transcriptData.academicStanding}
                  </div>
                </div>
              </div>

              {/* Accordion List Per Semester */}
              <div className="flex flex-col gap-6">
                {transcriptData.groups.map((group) => (
                  <div 
                    key={group.semesterNumber} 
                    style={{ 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      overflow: 'hidden' 
                    }}
                  >
                    <div 
                      style={{ 
                        backgroundColor: 'var(--bg-subtle)', 
                        padding: 'var(--space-3) var(--space-4)', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--text-primary)' }}>
                          {group.academicPeriodName}
                        </span>
                        <Badge variant="default">{group.totalCredits} SKS</Badge>
                      </div>

                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          IPS: <strong style={{ color: 'var(--color-primary-700)' }}>{group.semesterGpa.toFixed(2)}</strong>
                        </span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                          IPK: <strong style={{ color: 'var(--color-success-700)' }}>{group.cumulativeGpa.toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="table" style={{ width: '100%', margin: 0 }}>
                        <thead>
                          <tr>
                            <th style={{ width: '50px' }}>No</th>
                            <th style={{ width: '110px' }}>Kode MK</th>
                            <th>Nama Mata Kuliah</th>
                            <th style={{ width: '70px', textAlign: 'center' }}>SKS</th>
                            <th style={{ width: '100px', textAlign: 'right' }}>Nilai Akhir</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Huruf</th>
                            <th style={{ width: '80px', textAlign: 'right' }}>Bobot</th>
                            <th style={{ width: '100px', textAlign: 'right' }}>SKSN</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.courses.map((course, idx) => (
                            <tr key={course.id}>
                              <td>{idx + 1}</td>
                              <td style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--text-xs)' }}>
                                {course.courseCode}
                              </td>
                              <td style={{ fontWeight: 'var(--font-weight-medium)' }}>
                                {course.courseName}
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{course.credits}</td>
                              <td style={{ textAlign: 'right' }}>{course.finalScore.toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span style={{ fontWeight: 'bold', color: course.letterGrade.startsWith('A') ? 'var(--color-success-700)' : 'var(--color-primary-700)' }}>
                                  {course.letterGrade}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>{course.gradePoint.toFixed(2)}</td>
                              <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{course.qualityPoints.toFixed(2)}</td>
                              <td style={{ textAlign: 'center' }}>
                                <Badge variant="success">LULUS</Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 3: EVALUASI & GRAFIK PRESTASI */}
      {activeTab === 'analisis_grafik' && (
        <div className="flex flex-col gap-6">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: 'var(--space-6)' 
            }}
          >
            {/* Grafik Tren IPS vs IPK */}
            <Card>
              <CardHeader>
                <CardTitle>Tren Indeks Prestasi Semester (IPS) & Kumulatif (IPK)</CardTitle>
                <CardSubtitle>Perjalanan konsistensi capaian akademik dari semester ke semester</CardSubtitle>
              </CardHeader>
              <CardBody style={{ padding: 'var(--space-6)' }}>
                <div className="flex flex-col gap-5">
                  {trendData.map((item) => (
                    <div key={item.semesterNumber} className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--text-sm)' }}>
                          {item.semester} ({item.sksPassed} SKS)
                        </span>
                        <div className="flex gap-3 text-xs">
                          <span>IPS: <strong>{item.ips.toFixed(2)}</strong></span>
                          <span>IPK: <strong style={{ color: 'var(--color-success-700)' }}>{item.ipk.toFixed(2)}</strong></span>
                        </div>
                      </div>

                      {/* Bar Visualization for IPS */}
                      <div 
                        style={{ 
                          width: '100%', 
                          height: '14px', 
                          backgroundColor: 'var(--bg-subtle)', 
                          borderRadius: 'var(--radius-full)', 
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <div 
                          style={{ 
                            width: `${(item.ips / 4.0) * 100}%`, 
                            height: '100%', 
                            backgroundColor: 'var(--color-primary-600)',
                            borderRadius: 'var(--radius-full)',
                            transition: 'width 0.4s ease'
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div 
                  style={{ 
                    marginTop: 'var(--space-6)', 
                    padding: 'var(--space-3) var(--space-4)', 
                    backgroundColor: 'var(--bg-subtle)', 
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)'
                  }}
                >
                  Indeks Prestasi stabil di rentang <strong>3.86 - 3.96</strong> dengan rata-rata kumulatif <strong>3.91</strong>.
                </div>
              </CardBody>
            </Card>

            {/* Distribusi Nilai Huruf Mutu */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Huruf Mutu Seluruh Mata Kuliah</CardTitle>
                <CardSubtitle>Proporsi perolehan nilai A, A-, B+, dan B selama studi</CardSubtitle>
              </CardHeader>
              <CardBody style={{ padding: 'var(--space-6)' }}>
                <div className="flex flex-col gap-4">
                  {gradeDistribution.map((item) => {
                    const totalCourses = transcriptData.groups.reduce((acc, g) => acc + g.courses.length, 0);
                    const percentage = totalCourses > 0 ? ((item.count / totalCourses) * 100).toFixed(1) : '0';

                    return (
                      <div key={item.grade} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <span style={{ fontWeight: 'bold', width: '30px' }}>{item.grade}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>
                              ({item.count} Mata Kuliah)
                            </span>
                          </div>
                          <span style={{ fontWeight: 'var(--font-weight-semibold)' }}>{percentage}%</span>
                        </div>

                        <div 
                          style={{ 
                            width: '100%', 
                            height: '12px', 
                            backgroundColor: 'var(--bg-subtle)', 
                            borderRadius: 'var(--radius-full)', 
                            overflow: 'hidden' 
                          }}
                        >
                          <div 
                            style={{ 
                              width: `${percentage}%`, 
                              height: '100%', 
                              backgroundColor: item.grade.startsWith('A') ? 'var(--color-success-600)' : 'var(--color-primary-600)',
                              borderRadius: 'var(--radius-full)'
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div 
                  style={{ 
                    marginTop: 'var(--space-6)', 
                    padding: 'var(--space-4)', 
                    backgroundColor: 'var(--color-success-50)', 
                    border: '1px solid var(--color-success-200)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className="flex items-center gap-2" style={{ color: 'var(--color-success-800)', fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>
                    <CheckCircle2 size={16} /> 100% Bebas Nilai D / E
                  </div>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-success-900)', marginTop: '4px' }}>
                    Seluruh 35 mata kuliah yang telah ditempuh berhasil lulus dengan nilai minimal B+ atau lebih tinggi.
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* MODAL 1: RINCIAN KOMPONEN NILAI & UMPAN BALIK DOSEN */}
      {selectedGradeDetail && (
        <Modal
          isOpen={!!selectedGradeDetail}
          onClose={() => setSelectedGradeDetail(null)}
          title={`Rincian Komponen Nilai: ${selectedGradeDetail.courseName}`}
          maxWidth="700px"
        >
          <div className="flex flex-col gap-5">
            {/* Header Ringkasan MK */}
            <div 
              style={{ 
                backgroundColor: 'var(--bg-subtle)', 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-3)'
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-md)', color: 'var(--text-primary)' }}>
                  {selectedGradeDetail.courseName}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Kode: {selectedGradeDetail.courseCode} • {selectedGradeDetail.credits} SKS • Dosen: {selectedGradeDetail.lecturerName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {getLetterGradeBadge(selectedGradeDetail.letterGrade)}
                <Badge variant="success">LULUS</Badge>
              </div>
            </div>

            {/* Matriks Komponen Penilaian */}
            <div>
              <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: 'var(--space-3)' }}>
                Komposisi & Nilai Komponen Perkuliahan
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
                {/* Presensi */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Presensi (10%)</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedGradeDetail.presenceScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bobot: {(selectedGradeDetail.presenceScore * 0.10).toFixed(2)}
                  </div>
                </div>

                {/* Tugas */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tugas (20%)</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedGradeDetail.assignmentScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bobot: {(selectedGradeDetail.assignmentScore * 0.20).toFixed(2)}
                  </div>
                </div>

                {/* Kuis */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Kuis (15%)</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedGradeDetail.quizScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bobot: {(selectedGradeDetail.quizScore * 0.15).toFixed(2)}
                  </div>
                </div>

                {/* UTS */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>UTS (25%)</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedGradeDetail.midtermScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bobot: {(selectedGradeDetail.midtermScore * 0.25).toFixed(2)}
                  </div>
                </div>

                {/* UAS */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>UAS (30%)</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selectedGradeDetail.finalExamScore.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Bobot: {(selectedGradeDetail.finalExamScore * 0.30).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Rekapitulasi Akhir */}
            <div 
              style={{ 
                backgroundColor: 'var(--color-primary-50)', 
                border: '1px solid var(--color-primary-200)', 
                padding: 'var(--space-4)', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-900)' }}>
                  Total Skor Akhir Terhitung:
                </span>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-primary-800)' }}>
                  {selectedGradeDetail.finalScore.toFixed(2)} / 100.00
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)' }}>
                  Angka Mutu (SKS x Bobot):
                </span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-primary-900)' }}>
                  {selectedGradeDetail.credits} SKS x {selectedGradeDetail.gradePoint.toFixed(2)} = {selectedGradeDetail.qualityPoints.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Umpan Balik Dosen */}
            {selectedGradeDetail.feedback && (
              <div 
                style={{ 
                  backgroundColor: '#f8fafc', 
                  border: '1px solid var(--border-color)', 
                  padding: 'var(--space-4)', 
                  borderRadius: 'var(--radius-md)' 
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Catatan & Umpan Balik Dosen Pengampu:
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                  "{selectedGradeDetail.feedback}"
                </div>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-2" style={{ marginTop: 'var(--space-2)' }}>
              {onNavigateToGradebook && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  icon={Award} 
                  onClick={() => {
                    setSelectedGradeDetail(null);
                    onNavigateToGradebook();
                  }}
                >
                  Buka di Buku Nilai Perkuliahan
                </Button>
              )}
              <Button variant="secondary" onClick={() => setSelectedGradeDetail(null)}>
                Tutup
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: PRATINJAU CETAK RESMI FORMAT STANDAR STAI AL-ITTIHAD */}
      {printPreviewModal && (
        <Modal
          isOpen={printPreviewModal}
          onClose={() => setPrintPreviewModal(false)}
          title="Pratinjau Cetak Kartu Hasil Studi (KHS) Resmi"
          maxWidth="850px"
        >
          <div className="flex flex-col gap-6">
            {/* Action Bar */}
            <div className="flex justify-between items-center flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-3)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Format Resmi Dokumen Akademik STAI Al-Ittihad Cianjur
              </div>

              <div className="flex gap-2">
                <Button variant="primary" icon={Printer} onClick={handlePrint}>
                  Cetak Sekarang
                </Button>
                <Button variant="secondary" onClick={() => setPrintPreviewModal(false)}>
                  Tutup
                </Button>
              </div>
            </div>

            {/* Lembar Dokumen KHS Fisik */}
            <div 
              id="printable-khs-sheet"
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#000000', 
                padding: 'var(--space-6)', 
                border: '1px solid #d1d5db', 
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                fontFamily: 'serif',
                lineHeight: '1.4'
              }}
            >
              {/* KOP SURAT RESMI */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  YAYASAN AL-ITTIHAD CIANJUR
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD
                </div>
                <div style={{ fontSize: '11px', color: '#333' }}>
                  SK Pendirian Kemenag RI No. Dj.I/257/2010 • Terakreditasi BAN-PT
                </div>
                <div style={{ fontSize: '10px', color: '#555' }}>
                  Jl. Raya Bandung Km. 03, Rawabango, Bojong, Karangtengah, Cianjur 43281 • Telp: (0263) 261877 • Web: stai-alittihad.ac.id
                </div>
              </div>

              {/* JUDUL DOKUMEN */}
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>
                  KARTU HASIL STUDI (KHS)
                </div>
                <div style={{ fontSize: '11px', marginTop: '2px' }}>
                  {khsData.academicPeriodName.toUpperCase()}
                </div>
              </div>

              {/* IDENTITAS MAHASISWA */}
              <table style={{ width: '100%', fontSize: '11px', marginBottom: '14px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '18%', padding: '2px 0' }}>Nama Mahasiswa</td>
                    <td style={{ width: '2%', padding: '2px 0' }}>:</td>
                    <td style={{ width: '40%', padding: '2px 0', fontWeight: 'bold' }}>{khsData.studentName}</td>
                    <td style={{ width: '18%', padding: '2px 0' }}>Semester / TA</td>
                    <td style={{ width: '2%', padding: '2px 0' }}>:</td>
                    <td style={{ width: '20%', padding: '2px 0' }}>{khsData.semesterNumber} / {khsData.academicYear}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0' }}>NIM</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0', fontWeight: 'bold' }}>{khsData.studentNim}</td>
                    <td style={{ padding: '2px 0' }}>Jenjang</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{khsData.academicDegree}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '2px 0' }}>Program Studi</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{khsData.studyProgram}</td>
                    <td style={{ padding: '2px 0' }}>Dosen PA</td>
                    <td style={{ padding: '2px 0' }}>:</td>
                    <td style={{ padding: '2px 0' }}>{khsData.academicAdvisorName}</td>
                  </tr>
                </tbody>
              </table>

              {/* TABEL NILAI */}
              <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse', marginBottom: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6', borderTop: '1px solid #000', borderBottom: '1px solid #000' }}>
                    <th style={{ padding: '6px 4px', width: '30px', textAlign: 'center', borderRight: '1px solid #ddd' }}>No</th>
                    <th style={{ padding: '6px 6px', width: '70px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Kode</th>
                    <th style={{ padding: '6px 6px', textAlign: 'left', borderRight: '1px solid #ddd' }}>Mata Kuliah</th>
                    <th style={{ padding: '6px 4px', width: '35px', textAlign: 'center', borderRight: '1px solid #ddd' }}>SKS</th>
                    <th style={{ padding: '6px 6px', width: '50px', textAlign: 'center', borderRight: '1px solid #ddd' }}>Nilai</th>
                    <th style={{ padding: '6px 6px', width: '50px', textAlign: 'center', borderRight: '1px solid #ddd' }}>Huruf</th>
                    <th style={{ padding: '6px 6px', width: '50px', textAlign: 'center', borderRight: '1px solid #ddd' }}>Bobot</th>
                    <th style={{ padding: '6px 6px', width: '60px', textAlign: 'right', borderRight: '1px solid #ddd' }}>SKSN</th>
                    <th style={{ padding: '6px 6px', width: '60px', textAlign: 'center' }}>Ket.</th>
                  </tr>
                </thead>
                <tbody>
                  {khsData.grades.map((g, idx) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #ddd' }}>{idx + 1}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #ddd' }}>{g.courseCode}</td>
                      <td style={{ padding: '4px 6px', borderRight: '1px solid #ddd' }}>{g.courseName}</td>
                      <td style={{ padding: '4px', textAlign: 'center', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>{g.credits}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #ddd' }}>{g.finalScore.toFixed(1)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>{g.letterGrade}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center', borderRight: '1px solid #ddd' }}>{g.gradePoint.toFixed(2)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'right', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>{g.qualityPoints.toFixed(2)}</td>
                      <td style={{ padding: '4px 6px', textAlign: 'center' }}>LULUS</td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                    <td colSpan={3} style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #ddd' }}>
                      JUMLAH BEBAN SEMESTER
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                      {khsData.totalCreditsEnrolled}
                    </td>
                    <td colSpan={3} style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #ddd' }}>
                      TOTAL SKSN
                    </td>
                    <td style={{ padding: '6px', textAlign: 'right', borderRight: '1px solid #ddd' }}>
                      {(khsData.grades.reduce((acc, g) => acc + g.qualityPoints, 0)).toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>

              {/* REKAPITULASI HASIL STUDI */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '11px', marginBottom: '20px', border: '1px solid #000', padding: '8px 12px' }}>
                <div>
                  <div>• SKS Semester Ditempuh / Lulus : <strong>{khsData.totalCreditsEnrolled} / {khsData.totalCreditsPassed} SKS</strong></div>
                  <div>• Indeks Prestasi Semester (IPS) : <strong>{khsData.semesterGpa.toFixed(2)}</strong></div>
                  <div>• Maks. Beban SKS Semester Depan : <strong>{khsData.maxCreditNextSemester} SKS</strong></div>
                </div>

                <div>
                  <div>• Total SKS Kumulatif Selesai : <strong>{khsData.totalCumulativeCredits} SKS</strong></div>
                  <div>• Indeks Prestasi Kumulatif (IPK) : <strong>{khsData.cumulativeGpa.toFixed(2)}</strong></div>
                  <div>• Predikat Prestasi Akademik : <strong>{khsData.academicStanding}</strong></div>
                </div>
              </div>

              {/* TANDA TANGAN & PENGESAHAN */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
                {/* Kolom 1: Mahasiswa */}
                <div>
                  <div>Mahasiswa Bersangkutan,</div>
                  <div style={{ height: '55px' }} />
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{khsData.studentName}</div>
                  <div>NIM: {khsData.studentNim}</div>
                </div>

                {/* Kolom 2: Verifikasi QR SALAM */}
                <div>
                  <div style={{ fontSize: '10px', color: '#555' }}>Otentikasi SIAKAD SALAM</div>
                  <div style={{ display: 'inline-block', margin: '4px 0', padding: '4px', border: '1px dashed #666' }}>
                    <QrCode size={40} />
                  </div>
                  <div style={{ fontSize: '8px', color: '#666', fontFamily: 'monospace' }}>
                    {khsData.verificationCode}
                  </div>
                </div>

                {/* Kolom 3: Dosen Pembimbing Akademik */}
                <div>
                  <div>Cianjur, {khsData.publishedDate}</div>
                  <div>Dosen Pembimbing Akademik,</div>
                  <div style={{ height: '40px' }} />
                  <div style={{ fontWeight: 'bold', textDecoration: 'underline' }}>{khsData.academicAdvisorName}</div>
                  <div>NIDN: {khsData.academicAdvisorNidn}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
