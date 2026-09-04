import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp,
  Eye,
  RefreshCw,
  Search,
  X,
  BookOpen
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StudentClassProgressSummary, CourseProgressSummary } from '../../types/progress';
import { AcademicClass } from '../../types/academic';
import { progressService } from '../../services/progressService';
import { academicService } from '../../services/academicService';
import { useAuth } from '../../context/AuthContext';
import { KAMUS_UI } from '../../constants/dictionary';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export interface ProgresKelasDosenPageProps {
  classId?: string;
  onBack?: () => void;
}

export const ProgresKelasDosenPage: React.FC<ProgresKelasDosenPageProps> = ({ 
  classId = 'cls-pai301-a', 
  onBack 
}) => {
  const { user } = useAuth();
  
  // Available classes for lecturer (multi-course support)
  const [availableClasses, setAvailableClasses] = useState<AcademicClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>(classId);
  const [students, setStudents] = useState<StudentClassProgressSummary[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentProgress, setSelectedStudentProgress] = useState<CourseProgressSummary | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Load lecturer classes
  useEffect(() => {
    const allClasses = academicService.getClasses();
    // If logged in as lecturer, show their classes or all classes
    setAvailableClasses(allClasses);
    if (!selectedClassId && allClasses.length > 0) {
      setSelectedClassId(allClasses[0].id);
    }
  }, []);

  const activeClass = useMemo(() => {
    return availableClasses.find((c) => c.id === selectedClassId) || availableClasses[0];
  }, [availableClasses, selectedClassId]);

  const loadData = () => {
    const list = progressService.getClassProgressList(selectedClassId);
    setStudents(list);
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [selectedClassId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  const hasActiveFilters = searchQuery !== '' || filterStatus !== 'SEMUA';
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterStatus('SEMUA');
    setCurrentPage(1);
  };

  const handleOpenDetail = (student: StudentClassProgressSummary) => {
    const detail = progressService.getCourseProgress(selectedClassId, student.studentId, student.studentNim, student.studentName);
    setSelectedStudentProgress(detail);
  };

  // Stats calculation
  const totalStudents = students.length;
  const avgProgress = totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + s.overallPercentage, 0) / totalStudents) : 0;
  const atRiskStudents = students.filter((s) => s.status === 'TERTINGGAL');
  const completedStudents = students.filter((s) => s.status === 'SELESAI');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch = 
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentNim.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchStatus = filterStatus === 'SEMUA' || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, filterStatus]);

  // Paginated Students
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const columns: Column<StudentClassProgressSummary>[] = [
    {
      header: 'Mahasiswa',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{row.studentName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>NIM: {row.studentNim}</div>
        </div>
      )
    },
    {
      header: 'Aktivitas Selesai',
      width: '150px',
      render: (row) => (
        <span>{row.completedActivities} dari {row.totalActivities}</span>
      )
    },
    {
      header: 'Ketercapaian',
      width: '200px',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-slate-200)', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${row.overallPercentage}%`, 
                height: '100%', 
                backgroundColor: row.status === 'TERTINGGAL' ? 'var(--color-danger-main)' : row.status === 'SELESAI' ? 'var(--color-success-main)' : 'var(--color-primary-600)' 
              }} 
            />
          </div>
          <span style={{ fontWeight: 'bold', fontSize: 'var(--text-xs)', minWidth: '36px' }}>{row.overallPercentage}%</span>
        </div>
      )
    },
    {
      header: 'Status Belajar',
      width: '160px',
      render: (row) => (
        <Badge variant={row.status === 'SELESAI' ? 'success' : row.status === 'TERTINGGAL' ? 'danger' : 'primary'}>
          {row.status === 'SELESAI' ? 'Tuntas' : row.status === 'TERTINGGAL' ? 'Tertinggal (<50%)' : 'Berjalan Normal'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      width: '110px',
      render: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          icon={Eye}
          onClick={() => handleOpenDetail(row)}
        >
          Rincian
        </Button>
      )
    }
  ];

  // Konfigurasi Ekspor Progres Belajar Mahasiswa
  const progressExportConfig: ExportConfig<StudentClassProgressSummary> = useMemo(() => ({
    filename: `SALAM_Progres_${activeClass?.code || selectedClassId}`,
    title: 'LAPORAN MONITORING PROGRES & KETERCAPAIAN PEMBELAJARAN KELAS',
    subtitle: `Kelas: ${activeClass?.name || selectedClassId} (${activeClass?.courseName || '-'}) | Dosen: ${activeClass?.lecturerName || user?.name || '-'}`,
    data: filteredStudents,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Lengkap Mahasiswa', width: '240px' },
      { 
        key: 'completedActivities', 
        header: 'Aktivitas Selesai', 
        width: '140px', 
        align: 'center',
        format: (_val, row) => `${row.completedActivities} / ${row.totalActivities}`
      },
      { 
        key: 'overallPercentage', 
        header: 'Persentase Capaian', 
        width: '130px', 
        align: 'center',
        format: (val) => `${val}%`
      },
      { 
        key: 'status', 
        header: 'Status Belajar', 
        width: '140px', 
        align: 'center',
        format: (val) => val === 'SELESAI' ? 'Tuntas' : val === 'TERTINGGAL' ? 'Tertinggal (<50%)' : 'Berjalan Normal'
      }
    ],
    metadata: {
      'Kode Kelas': activeClass?.code || selectedClassId,
      'Mata Kuliah': activeClass?.courseName || '-',
      'Bobot SKS': `${activeClass?.credits || 3} SKS`,
      'Total Mahasiswa': `${students.length} Orang`,
      'Rata-rata Kelas': `${avgProgress}%`,
      'Mahasiswa Tertinggal': `${atRiskStudents.length} Orang`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [filteredStudents, activeClass, selectedClassId, students, avgProgress, atRiskStudents, user]);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={onBack}>
              Kembali
            </Button>
          )}
          <div>
            <h1>Monitoring {KAMUS_UI.PROGRES_BELAJAR} Kelas</h1>
            <p>Evaluasi ketercapaian mahasiswa terhadap seluruh modul pembelajaran dan identifikasi mahasiswa tertinggal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={loadData}>
            Segarkan
          </Button>
          <ExportDropdown<StudentClassProgressSummary>
            config={progressExportConfig}
            buttonLabel="Ekspor Progres Kelas"
          />
        </div>
      </div>

      {/* Multi-Course / Class Switcher Banner */}
      <Card style={{ backgroundColor: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)' }}>
        <CardBody style={{ padding: 'var(--space-4)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div style={{ padding: '10px', backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-800)', borderRadius: 'var(--radius-md)' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary-900)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mata Kuliah Aktif Diampu (Class Switcher)
                </div>
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {activeClass?.name || 'Pilih Kelas Perkuliahan'}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Kode MK: <strong>{activeClass?.courseCode || '-'}</strong> • Bobot: <strong>{activeClass?.credits || 3} SKS</strong> • Dosen: <strong>{activeClass?.lecturerName || user?.name || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Selector Dropdown */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="select-class-dosen" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold', color: 'var(--color-primary-900)', whiteSpace: 'nowrap' }}>
                Pilih Kelas:
              </label>
              <select
                id="select-class-dosen"
                className="form-select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                style={{ minWidth: '260px', fontWeight: 'bold', borderColor: 'var(--color-primary-300)' }}
              >
                {availableClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.courseCode} — {c.name} ({c.credits} SKS)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Analytics Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-800)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Mahasiswa Terdaftar</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{totalStudents} Orang</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-info-main)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Rata-Rata Progres Kelas</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{avgProgress}%</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-main)' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mahasiswa Perlu Perhatian</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-danger-main)' }}>{atRiskStudents.length} Mahasiswa</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-success-main)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Tuntas Pembelajaran</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-success-main)' }}>{completedStudents.length} Mahasiswa</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filter Tabs & Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <CardTitle>Daftar Capaian Mahasiswa Kelas {activeClass?.name || selectedClassId}</CardTitle>
              <CardSubtitle>Klik tombol "Rincian" untuk melihat checklist per aktivitas tiap mahasiswa</CardSubtitle>
            </div>

            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Input
                  placeholder="Cari NIM, nama mahasiswa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '32px' }}
                />
                <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              </div>

              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="SEMUA">Semua Status ({students.length})</option>
                <option value="TERTINGGAL">Tertinggal ({atRiskStudents.length})</option>
                <option value="SELESAI">Tuntas ({completedStudents.length})</option>
              </select>

              {hasActiveFilters && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  icon={X} 
                  onClick={handleResetFilters}
                  title="Reset Semua Filter"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <Table
            columns={columns}
            data={paginatedStudents}
            keyExtractor={(row) => row.studentId}
            emptyMessage="Tidak ada data mahasiswa untuk filter ini."
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="mahasiswa"
          />
        </CardBody>
      </Card>

      {/* MODAL: Detail Progres Mahasiswa Spesifik */}
      <Modal
        isOpen={!!selectedStudentProgress}
        onClose={() => setSelectedStudentProgress(null)}
        title={`Rincian Progres: ${selectedStudentProgress?.studentName} (${selectedStudentProgress?.studentNim})`}
        maxWidth="680px"
      >
        {selectedStudentProgress && (
          <div className="flex flex-col gap-4">
            <div style={{ padding: 'var(--space-3) var(--space-4)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Total Ketercapaian: {selectedStudentProgress.overallPercentage}%</strong>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {selectedStudentProgress.completedActivities} dari {selectedStudentProgress.totalActivities} Aktivitas Selesai
                </div>
              </div>

              <Badge variant={selectedStudentProgress.overallPercentage >= 80 ? 'success' : selectedStudentProgress.overallPercentage < 50 ? 'danger' : 'primary'}>
                {selectedStudentProgress.overallPercentage >= 80 ? 'Tuntas' : selectedStudentProgress.overallPercentage < 50 ? 'Tertinggal' : 'Berjalan Normal'}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {selectedStudentProgress.meetings.map((m) => (
                <div key={m.meetingId} style={{ padding: 'var(--space-3)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-2)' }}>
                    <strong>{m.title}</strong>
                    <Badge variant={m.isCompleted ? 'success' : 'default'} style={{ fontSize: '0.6875rem' }}>
                      {m.completedActivities}/{m.totalActivities} Selesai ({m.progressPercentage}%)
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    {m.activities.map((act) => (
                      <div key={act.id} className="flex justify-between items-center" style={{ fontSize: 'var(--text-xs)', padding: '2px 0' }}>
                        <span>• {act.title}</span>
                        <Badge variant={act.progress?.isCompleted ? 'success' : 'default'} style={{ fontSize: '0.625rem' }}>
                          {act.progress?.isCompleted ? 'Selesai' : 'Belum'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer" style={{ margin: '0 calc(-1 * var(--space-5)) calc(-1 * var(--space-5))' }}>
              <Button variant="primary" onClick={() => setSelectedStudentProgress(null)}>
                {KAMUS_UI.TUTUP}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
