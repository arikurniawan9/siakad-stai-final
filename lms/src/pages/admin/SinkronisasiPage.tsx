import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  BookOpen, 
  Layers, 
  Users, 
  CheckCircle2, 
  CheckCircle,
  Play
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../../components/ui/Card';
import { Table, Column } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AcademicClass, SyncRunLog } from '../../types/academic';
import { academicService } from '../../services/academicService';
import { syncService, RawSiakadPayload } from '../../services/syncService';
import { useToast } from '../../components/feedback/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { runSyncIdempotencyTests, SyncTestResult } from '../../tests/sync.test';

export const SinkronisasiPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();

  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncRunLog[]>([]);
  const [activeTab, setActiveTab] = useState<'classes' | 'logs' | 'test'>('classes');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedRunLog, setSelectedRunLog] = useState<SyncRunLog | null>(null);
  const [testResults, setTestResults] = useState<{ results: SyncTestResult[]; allPassed: boolean } | null>(null);

  const loadData = () => {
    setClasses(academicService.getClasses());
    setSyncLogs(syncService.getSyncRunLogs());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      const samplePayload: RawSiakadPayload = {
        academicPeriod: {
          externalId: 'EXT-PRD-20261',
          code: '20261',
          name: 'Semester Ganjil 2026/2027',
          year: '2026/2027',
          semesterType: 'GANJIL',
          startDate: '2026-09-01',
          endDate: '2027-01-31'
        },
        programs: [
          { externalId: 'EXT-PRODI-PAI', code: 'PAI', name: 'Pendidikan Agama Islam', degree: 'S1', faculty: 'Tarbiyah' },
          { externalId: 'EXT-PRODI-MPI', code: 'MPI', name: 'Manajemen Pendidikan Islam', degree: 'S1', faculty: 'Tarbiyah' },
          { externalId: 'EXT-PRODI-ES', code: 'ES', name: 'Ekonomi Syariah', degree: 'S1', faculty: 'Syariah & Ekonomi' }
        ],
        courses: [
          { externalId: 'EXT-CRS-PAI301', code: 'PAI-301', name: 'Ushul Fiqih & Qawaid Fiqhiyyah', credits: 3, semesterLevel: 3, studyProgramCode: 'PAI' },
          { externalId: 'EXT-CRS-PAI302', code: 'PAI-302', name: 'Hadits Tarbawi', credits: 2, semesterLevel: 3, studyProgramCode: 'PAI' },
          { externalId: 'EXT-CRS-PAI303', code: 'PAI-303', name: 'Pengembangan Kurikulum PAI', credits: 3, semesterLevel: 3, studyProgramCode: 'PAI' },
          { externalId: 'EXT-CRS-MPI202', code: 'MPI-202', name: 'Manajemen Pesantren & Madrasah', credits: 3, semesterLevel: 2, studyProgramCode: 'MPI' },
        ],
        classes: [
          {
            externalId: 'EXT-CLS-PAI301-A-20261',
            code: 'PAI-301-A',
            name: 'Ushul Fiqih (Kelas A)',
            courseExternalId: 'EXT-CRS-PAI301',
            lecturerId: 'usr-dsn-01',
            lecturerName: 'Dr. H. M. Ridwan, M.Ag',
            lecturerNidn: '2112087501',
            studentCount: 38,
            status: 'AKTIF',
            schedules: [{ dayOfWeek: 'SENIN', startTime: '08:00', endTime: '10:30', room: 'Ruang Tarbiyah 201', isOnline: false }]
          },
          {
            externalId: 'EXT-CLS-PAI301-B-20261',
            code: 'PAI-301-B',
            name: 'Ushul Fiqih (Kelas B)',
            courseExternalId: 'EXT-CRS-PAI301',
            lecturerId: 'usr-dsn-01',
            lecturerName: 'Dr. H. M. Ridwan, M.Ag',
            lecturerNidn: '2112087501',
            studentCount: 36,
            status: 'AKTIF',
            schedules: [{ dayOfWeek: 'SELASA', startTime: '10:45', endTime: '13:15', room: 'Ruang Tarbiyah 202', isOnline: false }]
          },
          {
            externalId: 'EXT-CLS-MPI202-A-20261',
            code: 'MPI-202-A',
            name: 'Manajemen Pesantren (Kelas A)',
            courseExternalId: 'EXT-CRS-MPI202',
            lecturerId: 'usr-dsn-02',
            lecturerName: 'Dr. Hj. Siti Maryam, M.Pd.I',
            lecturerNidn: '2114058202',
            studentCount: 34,
            status: 'AKTIF',
            schedules: [{ dayOfWeek: 'KAMIS', startTime: '08:00', endTime: '10:30', room: 'Ruang Tarbiyah 104', isOnline: false }]
          }
        ]
      };

      const result = await syncService.executeSync(
        samplePayload, 
        user?.id || 'usr-adm-01', 
        user?.name || 'Admin Akademik'
      );

      loadData();
      toast.success(
        'Sinkronisasi Berhasil',
        `${result.stats.classesCreated} kelas baru dibuat, ${result.stats.classesUpdated} kelas diperbarui secara idempotent.`
      );
    } catch (e: any) {
      toast.danger('Sinkronisasi Gagal', e.message || 'Terjadi kesalahan pada saat memproses sinkronisasi.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunTests = async () => {
    const res = await runSyncIdempotencyTests();
    setTestResults(res);
    loadData();
    toast.success('Pengujian Selesai', `${res.results.length} langkah verifikasi idempotensi telah dijalankan.`);
  };

  // Columns for Classes Table
  const classColumns: Column<AcademicClass>[] = [
    {
      header: 'Kode Kelas',
      width: '130px',
      render: (row) => <Badge variant="primary">{row.code}</Badge>
    },
    {
      header: 'Mata Kuliah & Kurikulum',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{row.courseName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            {row.studyProgramCode} • {row.credits} SKS • ID Eksternal: <code>{row.externalId}</code>
          </div>
        </div>
      )
    },
    {
      header: 'Dosen Pengampu',
      render: (row) => (
        <div>
          <div>{row.lecturerName}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>NIDN: {row.lecturerNidn}</div>
        </div>
      )
    },
    {
      header: 'Jadwal Kuliah',
      render: (row) => (
        <div style={{ fontSize: 'var(--text-xs)' }}>
          {row.schedules.map((s, idx) => (
            <div key={idx}>
              {s.dayOfWeek}, {s.startTime}–{s.endTime} ({s.room})
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Peserta',
      width: '90px',
      render: (row) => <span style={{ fontWeight: 'bold' }}>{row.studentCount} Mhs</span>
    },
    {
      header: 'Status',
      width: '100px',
      render: (row) => {
        const variant = row.status === 'AKTIF' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    }
  ];

  // Columns for Sync Run Logs Table
  const logColumns: Column<SyncRunLog>[] = [
    {
      header: 'Waktu Eksekusi',
      width: '180px',
      render: (row) => (
        <span style={{ fontSize: 'var(--text-xs)' }}>
          {new Date(row.startedAt).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </span>
      )
    },
    {
      header: 'Sistem Sumber',
      width: '130px',
      render: (row) => <Badge variant="default">{row.sourceSystem}</Badge>
    },
    {
      header: 'Statistik Pemrosesan Data',
      render: (row) => (
        <div className="flex gap-2 flex-wrap" style={{ fontSize: 'var(--text-xs)' }}>
          <Badge variant="success">+{row.stats.classesCreated} Dibuat</Badge>
          <Badge variant="primary">{row.stats.classesUpdated} Diperbarui</Badge>
          {row.stats.classesDeactivated > 0 && (
            <Badge variant="warning">{row.stats.classesDeactivated} Diarsipkan</Badge>
          )}
          <span style={{ color: 'var(--text-muted)' }}>({row.stats.coursesProcessed} Mata Kuliah)</span>
        </div>
      )
    },
    {
      header: 'Status',
      width: '120px',
      render: (row) => {
        const variant = row.status === 'BERHASIL' ? 'success' : 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      }
    },
    {
      header: 'Detail',
      width: '90px',
      render: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setSelectedRunLog(row)}>
          Rincian
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1>Sinkronisasi Akademik & Manajemen Kelas</h1>
          <p>Integrasi data master periode, prodi, kurikulum, mata kuliah, dan kelas perkuliahan SALAM</p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="primary" 
            icon={RefreshCw} 
            isLoading={isSyncing} 
            onClick={handleRunSync}
          >
            Jalankan Sinkronisasi SIAKAD
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-primary-50)', color: 'var(--color-primary-700)', borderRadius: 'var(--radius-lg)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{classes.length}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total Kelas Perkuliahan</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info-main)', borderRadius: 'var(--radius-lg)' }}>
              <Layers size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{academicService.getCourses().length}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Mata Kuliah Kurikulum</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning-main)', borderRadius: 'var(--radius-lg)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold' }}>{academicService.getStudyPrograms().length}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Program Studi Terdaftar</div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-3">
            <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success-text)', borderRadius: 'var(--radius-lg)' }}>
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--color-success-text)' }}>Idempotent</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Proteksi Anti-Duplikasi Aktif</div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button 
          variant={activeTab === 'classes' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('classes')}
        >
          Kelas Perkuliahan ({classes.length})
        </Button>
        <Button 
          variant={activeTab === 'logs' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('logs')}
        >
          Riwayat Sinkronisasi ({syncLogs.length})
        </Button>
        <Button 
          variant={activeTab === 'test' ? 'primary' : 'secondary'} 
          size="sm" 
          onClick={() => setActiveTab('test')}
        >
          Uji Idempotensi Otomatis
        </Button>
      </div>

      {activeTab === 'classes' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Daftar Ruang Kelas Pembelajaran SALAM</CardTitle>
              <CardSubtitle>Hasil sinkronisasi semester aktif yang terhubung dengan dosen & peserta</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              columns={classColumns}
              data={classes}
              keyExtractor={(row) => row.id}
              emptyMessage="Belum ada kelas perkuliahan. Silakan jalankan sinkronisasi."
            />
          </CardBody>
        </Card>
      )}

      {activeTab === 'logs' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Riwayat Putaran Sinkronisasi (*Sync Run Logs*)</CardTitle>
              <CardSubtitle>Audit trail berkala proses upsert dan deteksi perubahan data sumber</CardSubtitle>
            </div>
          </CardHeader>
          <CardBody>
            <Table
              columns={logColumns}
              data={syncLogs}
              keyExtractor={(row) => row.id}
              emptyMessage="Belum ada riwayat sinkronisasi."
            />
          </CardBody>
        </Card>
      )}

      {activeTab === 'test' && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <div>
                <CardTitle>Uji Validasi Idempotensi Sinkronisasi</CardTitle>
                <CardSubtitle>Membuktikan bahwa eksekusi sinkronisasi berulang kali tidak menyebabkan duplikasi data</CardSubtitle>
              </div>

              <Button variant="primary" icon={Play} size="sm" onClick={handleRunTests}>
                Jalankan Pengujian Idempotensi
              </Button>
            </div>
          </CardHeader>
          <CardBody>
            {testResults ? (
              <div className="flex flex-col gap-4">
                <div 
                  className="flex items-center gap-2" 
                  style={{ 
                    padding: 'var(--space-3)', 
                    backgroundColor: testResults.allPassed ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
                    border: `1px solid ${testResults.allPassed ? 'var(--color-success-border)' : 'var(--color-danger-border)'}`,
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <CheckCircle size={18} color={testResults.allPassed ? 'var(--color-success-main)' : 'var(--color-danger-main)'} />
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>
                    {testResults.allPassed ? 'SEMUA PENGUJIAN IDEMPOTENSI LULUS (100% Valid & Aman)' : 'TERDAPAT KEGAGALAN UJI'}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {testResults.results.map((tr, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        padding: 'var(--space-3) var(--space-4)', 
                        border: '1px solid var(--border-default)', 
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface)'
                      }}
                    >
                      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-1)' }}>
                        <span style={{ fontWeight: 'bold', fontSize: 'var(--text-sm)' }}>{tr.step}</span>
                        <Badge variant={tr.status === 'LULUS' ? 'success' : 'danger'}>{tr.status}</Badge>
                      </div>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{tr.description}</p>
                      <div className="flex gap-4" style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        <span>Kelas Sebelum: <strong>{tr.classesCountBefore}</strong></span>
                        <span>Kelas Sesudah: <strong>{tr.classesCountAfter}</strong></span>
                        <span>Dibuat: <strong>{tr.classesCreated}</strong></span>
                        <span>Diperbarui: <strong>{tr.classesUpdated}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                  Klik tombol di atas untuk menjalankan simulasi 3 putaran sinkronisasi (Inisiasi $\rightarrow$ Re-sync Identik $\rightarrow$ Nonaktifkan Aman).
                </p>
                <Button variant="outline" onClick={handleRunTests}>
                  Mulai Pengujian Idempotensi Sekarang
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Modal Detail Sync Run Item Logs */}
      <Modal
        isOpen={!!selectedRunLog}
        onClose={() => setSelectedRunLog(null)}
        title="Rincian Item Log Sinkronisasi"
        maxWidth="680px"
      >
        {selectedRunLog && (
          <div className="flex flex-col gap-3">
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Total {selectedRunLog.itemLogs.length} item data diproses pada {new Date(selectedRunLog.startedAt).toLocaleString('id-ID')}
            </div>

            <div style={{ maxHeight: '380px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {selectedRunLog.itemLogs.map((item) => (
                <div 
                  key={item.id}
                  style={{ 
                    padding: 'var(--space-2) var(--space-3)', 
                    border: '1px solid var(--border-subtle)', 
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-slate-50)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  <div className="flex justify-between items-center" style={{ marginBottom: '2px' }}>
                    <span style={{ fontWeight: 'bold' }}>{item.identifier}</span>
                    <Badge variant={item.action === 'DIBUAT' ? 'success' : item.action === 'DIPERBARUI' ? 'primary' : 'warning'}>
                      {item.action}
                    </Badge>
                  </div>
                  <div style={{ color: 'var(--text-muted)' }}>
                    ID Eksternal: <code>{item.externalId}</code> • {item.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
