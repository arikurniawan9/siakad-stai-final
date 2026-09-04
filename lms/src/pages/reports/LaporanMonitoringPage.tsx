import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  Clock,
  ShieldCheck,
  Search,
  X
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { InstitutionalReportSummary, AtRiskStudentItem, LecturerComplianceItem } from '../../types/reporting';
import { reportingService } from '../../services/reportingService';
import { KAMUS_UI } from '../../constants/dictionary';
import { ExportDropdown, ExportConfig } from '../../components/export-import';

export const LaporanMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'mahasiswa_berisiko' | 'kepatuhan_dosen' | 'sinkronisasi'>('ringkasan');
  const [report, setReport] = useState<InstitutionalReportSummary | null>(null);
  const [riskThreshold, setRiskThreshold] = useState<number>(50);

  // Search & Filter & Pagination States
  const [searchRiskQuery, setSearchRiskQuery] = useState<string>('');
  const [searchLecturerQuery, setSearchLecturerQuery] = useState<string>('');
  const [filterRiskFactor, setFilterRiskFactor] = useState<string>('SEMUA');
  
  const [currentPageRisk, setCurrentPageRisk] = useState<number>(1);
  const [pageSizeRisk, setPageSizeRisk] = useState<number>(10);

  const [currentPageLecturer, setCurrentPageLecturer] = useState<number>(1);
  const [pageSizeLecturer, setPageSizeLecturer] = useState<number>(10);

  // Auto reset pagination when filters change
  useEffect(() => {
    setCurrentPageRisk(1);
  }, [searchRiskQuery, filterRiskFactor, riskThreshold]);

  useEffect(() => {
    setCurrentPageLecturer(1);
  }, [searchLecturerQuery]);

  const hasActiveRiskFilters = searchRiskQuery !== '' || filterRiskFactor !== 'SEMUA';
  const handleResetRiskFilters = () => {
    setSearchRiskQuery('');
    setFilterRiskFactor('SEMUA');
    setCurrentPageRisk(1);
  };

  const hasActiveLecturerFilters = searchLecturerQuery !== '';
  const handleResetLecturerFilters = () => {
    setSearchLecturerQuery('');
    setCurrentPageLecturer(1);
  };

  const loadData = () => {
    const data = reportingService.getInstitutionalReport(riskThreshold);
    setReport(data);
  };

  useEffect(() => {
    loadData();
  }, [riskThreshold]);

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
        <p className="text-muted">{KAMUS_UI.MEMUAT_DATA}</p>
      </div>
    );
  }

  // Filtered At Risk Students
  const filteredAtRiskStudents = useMemo(() => {
    if (!report?.atRiskStudents) return [];
    return report.atRiskStudents.filter((s) => {
      const matchSearch = 
        s.studentName.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
        s.studentNim.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
        s.courseName.toLowerCase().includes(searchRiskQuery.toLowerCase()) ||
        s.courseCode.toLowerCase().includes(searchRiskQuery.toLowerCase());
      
      const matchFactor = filterRiskFactor === 'SEMUA' || s.riskFactor === filterRiskFactor;
      return matchSearch && matchFactor;
    });
  }, [report, searchRiskQuery, filterRiskFactor]);

  // Paginated At Risk Students
  const totalPagesRisk = Math.ceil(filteredAtRiskStudents.length / pageSizeRisk) || 1;
  const paginatedAtRiskStudents = useMemo(() => {
    const start = (currentPageRisk - 1) * pageSizeRisk;
    return filteredAtRiskStudents.slice(start, start + pageSizeRisk);
  }, [filteredAtRiskStudents, currentPageRisk, pageSizeRisk]);

  // Filtered Lecturer Compliances
  const filteredLecturerCompliances = useMemo(() => {
    if (!report?.lecturerCompliances) return [];
    return report.lecturerCompliances.filter((l) => {
      return (
        l.lecturerName.toLowerCase().includes(searchLecturerQuery.toLowerCase()) ||
        l.courseName.toLowerCase().includes(searchLecturerQuery.toLowerCase()) ||
        l.courseCode.toLowerCase().includes(searchLecturerQuery.toLowerCase())
      );
    });
  }, [report, searchLecturerQuery]);

  // Paginated Lecturer Compliances
  const totalPagesLecturer = Math.ceil(filteredLecturerCompliances.length / pageSizeLecturer) || 1;
  const paginatedLecturerCompliances = useMemo(() => {
    const start = (currentPageLecturer - 1) * pageSizeLecturer;
    return filteredLecturerCompliances.slice(start, start + pageSizeLecturer);
  }, [filteredLecturerCompliances, currentPageLecturer, pageSizeLecturer]);

  // Konfigurasi Ekspor Mahasiswa Berisiko
  const atRiskExportConfig: ExportConfig<AtRiskStudentItem> = useMemo(() => ({
    filename: 'SALAM_Deteksi_Mahasiswa_Berisiko',
    title: 'LAPORAN EARLY WARNING SYSTEM (EWS) — DETEKSI MAHASISWA BERISIKO',
    subtitle: `Periode Akademik: ${report?.academicYear || '2026/2027'} | Ambang Batas Progres: < ${riskThreshold}%`,
    data: filteredAtRiskStudents,
    columns: [
      { key: 'studentNim', header: 'NIM', width: '110px' },
      { key: 'studentName', header: 'Nama Mahasiswa', width: '220px' },
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Mata Kuliah', width: '220px' },
      { key: 'progressPercentage', header: 'Progres Belajar', width: '110px', align: 'center', format: (val) => `${val}%` },
      { key: 'uncompletedActivitiesCount', header: 'Aktivitas Tertinggal', width: '130px', align: 'center' },
      { key: 'riskFactor', header: 'Faktor Risiko', width: '160px', align: 'center' }
    ],
    metadata: {
      'Tahun Akademik': report?.academicYear || '-',
      'Total Mahasiswa Berisiko': `${filteredAtRiskStudents.length} Mahasiswa`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [report, riskThreshold, filteredAtRiskStudents]);

  // Konfigurasi Ekspor Kepatuhan Dosen
  const lecturerComplianceExportConfig: ExportConfig<LecturerComplianceItem> = useMemo(() => ({
    filename: 'SALAM_Audit_Kepatuhan_Dosen',
    title: 'AUDIT KEPATUHAN & KETERLAKSANAAN PERKULIAHAN DOSEN',
    subtitle: `Periode Akademik: ${report?.academicYear || '2026/2027'} — STAI Al-Ittihad Cianjur`,
    data: filteredLecturerCompliances,
    columns: [
      { key: 'lecturerName', header: 'Nama Dosen Pengampu', width: '220px' },
      { key: 'courseCode', header: 'Kode MK', width: '100px' },
      { key: 'courseName', header: 'Mata Kuliah', width: '220px' },
      { key: 'complianceRate', header: 'Kepatuhan RPS', width: '110px', align: 'center', format: (val) => `${val}%` },
      { key: 'publishedMeetings', header: 'Sesi Diterbitkan', width: '120px', align: 'center' },
      { key: 'pendingAssignmentGradingCount', header: 'Antrean Nilai Tugas', width: '130px', align: 'center' },
      { key: 'pendingQuizGradingCount', header: 'Antrean Nilai Kuis', width: '130px', align: 'center' }
    ],
    metadata: {
      'Tahun Akademik': report?.academicYear || '-',
      'Total Dosen Diaudit': `${filteredLecturerCompliances.length} Dosen`,
      'Waktu Unduh': new Date().toLocaleString('id-ID')
    }
  }), [report, filteredLecturerCompliances]);

  const atRiskColumns: Column<AtRiskStudentItem>[] = [
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
      header: 'Mata Kuliah',
      accessor: 'courseName'
    },
    {
      header: 'Ketercapaian',
      width: '130px',
      render: (row) => (
        <span style={{ fontWeight: 'bold', color: 'var(--color-danger-main)' }}>{row.progressPercentage}%</span>
      )
    },
    {
      header: 'Aktivitas Belum Selesai',
      width: '170px',
      render: (row) => (
        <span>{row.uncompletedActivitiesCount} Aktivitas Tertinggal</span>
      )
    },
    {
      header: 'Faktor Risiko',
      width: '180px',
      render: (row) => (
        <Badge variant="danger">
          <span className="flex items-center gap-1"><AlertTriangle size={12} /> {row.riskFactor.replace('_', ' ')}</span>
        </Badge>
      )
    }
  ];

  const complianceColumns: Column<LecturerComplianceItem>[] = [
    {
      header: 'Dosen Pengampu',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{row.lecturerName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mata Kuliah: {row.courseName}</div>
        </div>
      )
    },
    {
      header: 'Sesi Diterbitkan',
      width: '160px',
      render: (row) => (
        <div>
          <strong>{row.publishedMeetings}</strong> dari {row.totalMeetings} Sesi
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{row.draftMeetings} Sesi Draf</div>
        </div>
      )
    },
    {
      header: 'Antrean Penilaian',
      width: '180px',
      render: (row) => (
        <div>
          <div style={{ fontSize: 'var(--text-xs)' }}>Tugas: <strong>{row.pendingAssignmentGradingCount}</strong> berkas</div>
          <div style={{ fontSize: 'var(--text-xs)' }}>Kuis Esai: <strong>{row.pendingQuizGradingCount}</strong> lembar</div>
        </div>
      )
    },
    {
      header: 'Kepatuhan RPS',
      width: '140px',
      render: (row) => (
        <Badge variant={row.complianceRate >= 80 ? 'success' : 'warning'}>
          {row.complianceRate}% Terlaksana
        </Badge>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
            <Badge variant="primary"><Building2 size={12} /> Portal Pimpinan & Akademik</Badge>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{report.academicYear}</span>
          </div>
          <h1>Laporan, Monitoring & Audit Akademik</h1>
          <p>Visibilitas menyeluruh atas keterlaksanaan pembelajaran, kepatuhan dosen, dan deteksi mahasiswa tertinggal</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="secondary" icon={RefreshCw} onClick={loadData}>
            Segarkan Data
          </Button>
          {activeTab === 'mahasiswa_berisiko' ? (
            <ExportDropdown<AtRiskStudentItem> 
              config={atRiskExportConfig} 
              buttonLabel="Ekspor Mahasiswa Berisiko" 
            />
          ) : (
            <ExportDropdown<LecturerComplianceItem> 
              config={lecturerComplianceExportConfig} 
              buttonLabel="Ekspor Kepatuhan Dosen" 
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={activeTab === 'ringkasan' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('ringkasan')}
        >
          Ringkasan Institusional
        </Button>
        <Button 
          variant={activeTab === 'mahasiswa_berisiko' ? 'danger' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('mahasiswa_berisiko')}
        >
          Mahasiswa Berisiko ({report.totalAtRiskStudents})
        </Button>
        <Button 
          variant={activeTab === 'kepatuhan_dosen' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('kepatuhan_dosen')}
        >
          Monitoring Kepatuhan Dosen
        </Button>
        <Button 
          variant={activeTab === 'sinkronisasi' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('sinkronisasi')}
        >
          Kesehatan Sinkronisasi SIAKAD
        </Button>
      </div>

      {/* =========================================================================
          TAB 1: RINGKASAN INSTITUSIONAL
          ========================================================================= */}
      {activeTab === 'ringkasan' && (
        <div className="flex flex-col gap-6">
          {/* Key Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary-800)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mahasiswa Terdaftar</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{report.totalEnrolledStudents} Mahasiswa</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-info-main)' }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Rata-Rata Ketercapaian</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{report.averageStudentProgress}%</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-danger-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger-main)' }}>
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mahasiswa Berisiko (&lt;{riskThreshold}%)</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold', color: 'var(--color-danger-main)' }}>{report.totalAtRiskStudents} Orang</div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="flex items-center gap-4">
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-warning-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-warning-main)' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Antrean Penilaian Dosen</div>
                  <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>{report.totalPendingGrading} Item</div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Overview Tables */}
          <Card>
            <CardHeader>
              <CardTitle>Evaluasi Kepatuhan Perkuliahan Dosen</CardTitle>
              <CardSubtitle>Monitoring persentase penerbitan sesi RPS dan kecepatan penilaian tugas</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Table
                columns={complianceColumns}
                data={paginatedLecturerCompliances}
                keyExtractor={(row) => row.lecturerId}
              />
              <Pagination
                currentPage={currentPageLecturer}
                totalPages={totalPagesLecturer}
                totalItems={filteredLecturerCompliances.length}
                pageSize={pageSizeLecturer}
                onPageChange={setCurrentPageLecturer}
                onPageSizeChange={setPageSizeLecturer}
                itemLabel="dosen pengampu"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: MAHASISWA BERISIKO TERTINGGAL
          ========================================================================= */}
      {activeTab === 'mahasiswa_berisiko' && (
        <div className="flex flex-col gap-6">
          {/* Threshold Filter Bar */}
          <Card>
            <CardBody>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <strong>Kriteria Ambang Batas Risiko (*Risk Threshold*):</strong>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', margin: 0 }}>
                    Mahasiswa dengan progres di bawah persentase ini akan ditandai berisiko tertinggal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    className="form-select"
                    value={riskThreshold}
                    onChange={(e) => setRiskThreshold(parseInt(e.target.value) || 50)}
                    style={{ width: 'auto' }}
                  >
                    <option value={40}>Ketercapaian &lt; 40% (Kritis)</option>
                    <option value={50}>Ketercapaian &lt; 50% (Standar)</option>
                    <option value={60}>Ketercapaian &lt; 60% (Waspada)</option>
                  </select>

                  <ExportDropdown<AtRiskStudentItem> 
                    config={atRiskExportConfig} 
                    buttonLabel="Ekspor Data Mahasiswa" 
                    size="sm" 
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          {/* At-Risk Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                <div>
                  <CardTitle>Daftar Mahasiswa Perlu Intervensi Pembelajaran ({filteredAtRiskStudents.length})</CardTitle>
                  <CardSubtitle>Dosen PA dan Kaprodi dapat menggunakan data ini untuk bimbingan konseling akademik</CardSubtitle>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  <div style={{ position: 'relative', minWidth: '220px' }}>
                    <Input
                      placeholder="Cari NIM, nama mahasiswa..."
                      value={searchRiskQuery}
                      onChange={(e) => setSearchRiskQuery(e.target.value)}
                      style={{ paddingLeft: '32px' }}
                    />
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                  </div>

                  <select
                    className="form-select"
                    value={filterRiskFactor}
                    onChange={(e) => setFilterRiskFactor(e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="SEMUA">Semua Faktor Risiko</option>
                    <option value="PROGRES_RENDAH">Progres Rendah</option>
                    <option value="TUGAS_TERLEWAT">Tugas Terlewat</option>
                    <option value="KUIS_BELUM_LULUS">Kuis Belum Lulus</option>
                  </select>

                  {hasActiveRiskFilters && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      icon={X} 
                      onClick={handleResetRiskFilters}
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
                columns={atRiskColumns}
                data={paginatedAtRiskStudents}
                keyExtractor={(row) => row.studentId}
                emptyMessage="Alhamdulillah! Tidak ada mahasiswa yang berada di bawah ambang batas risiko sesuai filter."
              />
              <Pagination
                currentPage={currentPageRisk}
                totalPages={totalPagesRisk}
                totalItems={filteredAtRiskStudents.length}
                pageSize={pageSizeRisk}
                onPageChange={setCurrentPageRisk}
                onPageSizeChange={setPageSizeRisk}
                itemLabel="mahasiswa berisiko"
              />
            </CardBody>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MONITORING KEPATUHAN DOSEN
          ========================================================================= */}
      {activeTab === 'kepatuhan_dosen' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
              <div>
                <CardTitle>Matriks Kepatuhan Perkuliahan Dosen Pengampu ({filteredLecturerCompliances.length})</CardTitle>
                <CardSubtitle>Tinjauan kesiapan materi RPS, penerbitan pertemuan, dan beban penilaian yang tertunda</CardSubtitle>
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <Input
                    placeholder="Cari dosen, mata kuliah..."
                    value={searchLecturerQuery}
                    onChange={(e) => setSearchLecturerQuery(e.target.value)}
                    style={{ paddingLeft: '32px' }}
                  />
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
                </div>

                {hasActiveLecturerFilters && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={X} 
                    onClick={handleResetLecturerFilters}
                    title="Reset Filter"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              columns={complianceColumns}
              data={paginatedLecturerCompliances}
              keyExtractor={(row) => row.lecturerId}
            />
            <Pagination
              currentPage={currentPageLecturer}
              totalPages={totalPagesLecturer}
              totalItems={filteredLecturerCompliances.length}
              pageSize={pageSizeLecturer}
              onPageChange={setCurrentPageLecturer}
              onPageSizeChange={setPageSizeLecturer}
              itemLabel="dosen pengampu"
            />
          </CardBody>
        </Card>
      )}

      {/* =========================================================================
          TAB 4: KESEHATAN SINKRONISASI SIAKAD
          ========================================================================= */}
      {activeTab === 'sinkronisasi' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div>
                <CardTitle>Kesehatan Sinkronisasi Sistem Akademik (SIAKAD)</CardTitle>
                <CardSubtitle>Monitoring integrasi data master mahasiswa, dosen, mata kuliah, dan jadwal</CardSubtitle>
              </div>
              <Badge variant="success">
                <span className="flex items-center gap-1"><ShieldCheck size={14} /> STATUS: {report.syncHealth.overallStatus}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardBody className="flex flex-col gap-4">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted">Tingkat Keberhasilan:</span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-main)', marginTop: '2px' }}>
                  {report.syncHealth.successRate}%
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted">Total Entitas Tersinkron:</span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginTop: '2px' }}>
                  {report.syncHealth.totalSyncedEntities} Rekod
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted">Konflik Data / Duplikasi:</span>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--color-success-main)', marginTop: '2px' }}>
                  {report.syncHealth.conflictsCount} Konflik
                </div>
              </div>
              <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted">Sinkronisasi Terakhir:</span>
                <div style={{ fontWeight: 'bold', marginTop: '2px' }}>
                  {new Date(report.syncHealth.lastSyncAt).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
