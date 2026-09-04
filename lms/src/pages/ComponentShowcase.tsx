import React, { useState } from 'react';
import { 
  Check, 
  Trash2, 
  Upload, 
  Eye, 
  Plus,
  Download,
  UploadCloud
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardSubtitle, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, Column } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner, Skeleton } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { PermissionDenied } from '../components/ui/PermissionDenied';
import { KAMUS_UI } from '../constants/dictionary';
import { useToast } from '../components/feedback/ToastContext';
import { ExportDropdown, DataImportModal, TemplateDownloadButton } from '../components/export-import';
import { STUDENT_IMPORT_SCHEMA } from '../constants/exportImportSchemas';

interface SampleStudent {
  id: string;
  nim: string;
  name: string;
  course: string;
  progress: number;
  status: string;
}

export const ComponentShowcase: React.FC = () => {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [demoImportOpen, setDemoImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'states' | 'export_import'>('components');

  const sampleData: SampleStudent[] = [
    { id: '1', nim: '2101001', name: 'Ahmad Fauzi', course: 'Ushul Fiqih', progress: 85, status: KAMUS_UI.STATUS_SELESAI },
    { id: '2', nim: '2101002', name: 'Siti Nurhaliza', course: 'Hadits Tarbawi', progress: 60, status: KAMUS_UI.STATUS_SEDANG_DIPELAJARI },
    { id: '3', nim: '2101003', name: 'Muhammad Rizki', course: 'Pengembangan Kurikulum', progress: 10, status: KAMUS_UI.STATUS_BELUM_DIMULAI },
  ];

  const columns: Column<SampleStudent>[] = [
    { header: 'NIM', accessor: 'nim', width: '120px' },
    { header: 'Nama Mahasiswa', accessor: 'name' },
    { header: 'Mata Kuliah', accessor: 'course' },
    {
      header: 'Progres',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--color-slate-200)', borderRadius: 'var(--radius-full)' }}>
            <div style={{ width: `${row.progress}%`, height: '100%', backgroundColor: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }} />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>{row.progress}%</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => {
        let variant: any = 'default';
        if (row.status === KAMUS_UI.STATUS_SELESAI) variant = 'success';
        if (row.status === KAMUS_UI.STATUS_SEDANG_DIPELAJARI) variant = 'warning';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Aksi',
      width: '100px',
      render: (row) => (
        <Button variant="ghost" size="sm" icon={Eye} onClick={() => toast.info('Detail', `Melihat detail mahasiswa: ${row.name}`)}>
          Lihat
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header Showcase */}
      <div className="flex justify-between items-center">
        <div>
          <h1>Fondasi Desain & Komponen UI SALAM</h1>
          <p>Verifikasi kepatuhan visual, aksesibilitas, dan terminologi 100% Bahasa Indonesia</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button 
            variant={activeTab === 'components' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('components')}
          >
            Katalog Komponen
          </Button>
          <Button 
            variant={activeTab === 'states' ? 'primary' : 'secondary'} 
            size="sm" 
            onClick={() => setActiveTab('states')}
          >
            Tampilan Kondisi (States)
          </Button>
          <Button 
            variant={activeTab === 'export_import' ? 'primary' : 'secondary'} 
            size="sm" 
            icon={Download}
            onClick={() => setActiveTab('export_import')}
          >
            Sistem Ekspor & Impor Terstandar
          </Button>
        </div>
      </div>

      {activeTab === 'components' ? (
        <>
          {/* Section 1: Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>1. Tombol (Buttons) & Status Interaksi</CardTitle>
              <CardSubtitle>Varian, ukuran, ikon, dan status memuat</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" icon={Check} onClick={() => toast.success('Berhasil', 'Aksi primer berhasil dijalankan')}>
                  {KAMUS_UI.SIMPAN_PERUBAHAN}
                </Button>
                <Button variant="secondary" onClick={() => toast.info('Batal', 'Tindakan dibatalkan')}>
                  {KAMUS_UI.BATAL}
                </Button>
                <Button variant="outline" icon={Upload} onClick={() => toast.info('Unggah', 'Membuka dialog unggah berkas')}>
                  {KAMUS_UI.UNGGAH}
                </Button>
                <Button variant="danger" icon={Trash2} onClick={() => toast.danger('Hapus', 'Data telah dihapus dari sistem')}>
                  {KAMUS_UI.HAPUS}
                </Button>
                <Button variant="ghost" onClick={() => toast.info('Pratinjau', 'Membuka mode pratinjau')}>
                  {KAMUS_UI.PRATINJAU}
                </Button>
                <Button variant="primary" isLoading>
                  Menyimpan
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" size="sm">Ukuran Kecil (sm)</Button>
                <Button variant="primary" size="md">Ukuran Sedang (md)</Button>
                <Button variant="primary" size="lg">Ukuran Besar (lg)</Button>
              </div>
            </CardBody>
          </Card>

          {/* Section 2: Badges */}
          <Card>
            <CardHeader>
              <CardTitle>2. Lencana Status (Badges / Chips)</CardTitle>
              <CardSubtitle>Standardisasi status pembelajaran dan akademik</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-wrap gap-3">
              <Badge variant="default">{KAMUS_UI.STATUS_DRAF}</Badge>
              <Badge variant="primary">{KAMUS_UI.STATUS_TERJADWAL}</Badge>
              <Badge variant="success">{KAMUS_UI.STATUS_DITERBITKAN}</Badge>
              <Badge variant="success">{KAMUS_UI.STATUS_SELESAI}</Badge>
              <Badge variant="warning">{KAMUS_UI.STATUS_SEDANG_DIPELAJARI}</Badge>
              <Badge variant="warning">{KAMUS_UI.STATUS_BELUM_DIKUMPULKAN}</Badge>
              <Badge variant="danger">{KAMUS_UI.STATUS_TERLAMBAT}</Badge>
              <Badge variant="info">{KAMUS_UI.STATUS_SUDAH_DINILAI}</Badge>
              <Badge variant="warning">{KAMUS_UI.STATUS_PERLU_REVISI}</Badge>
              <Badge variant="success">{KAMUS_UI.STATUS_SINKRON_BERHASIL}</Badge>
            </CardBody>
          </Card>

          {/* Section 3: Forms & Inputs */}
          <Card>
            <CardHeader>
              <CardTitle>3. Kontrol Formulir & Input</CardTitle>
              <CardSubtitle>Input teks, opsi pemilihan, pesan validasi, dan bantuan</CardSubtitle>
            </CardHeader>
            <CardBody>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
                <Input 
                  label="Judul Tugas Pembelajaran" 
                  placeholder="Contoh: Analisis Fiqih Muamalah..." 
                  helperText="Gunakan judul yang jelas dan deskriptif untuk mahasiswa."
                />

                <Select 
                  label="Status Penerbitan" 
                  options={[
                    { value: 'draf', label: KAMUS_UI.STATUS_DRAF },
                    { value: 'terjadwal', label: KAMUS_UI.STATUS_TERJADWAL },
                    { value: 'terbit', label: KAMUS_UI.STATUS_DITERBITKAN },
                  ]}
                  helperText="Tentukan apakah materi langsung dapat diakses mahasiswa."
                />

                <Input 
                  label="Batas Pengumpulan (Wajib)" 
                  type="date"
                  errorMessage="Batas pengumpulan tidak boleh kurang dari waktu sekarang"
                />
              </div>
            </CardBody>
          </Card>

          {/* Section 4: Table */}
          <Card>
            <CardHeader>
              <CardTitle>4. Tabel Data Terstruktur</CardTitle>
              <CardSubtitle>Daftar responsif dengan aksentuasi visual</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Table 
                columns={columns} 
                data={sampleData} 
                keyExtractor={(row) => row.id} 
              />
            </CardBody>
          </Card>

          {/* Section 5: Modal & Dialog Demo */}
          <Card>
            <CardHeader>
              <CardTitle>5. Dialog Modal & Konfirmasi</CardTitle>
              <CardSubtitle>Dialog dengan penanganan tombol Escape dan fokus aksesibel</CardSubtitle>
            </CardHeader>
            <CardBody>
              <Button variant="outline" icon={Plus} onClick={() => setModalOpen(true)}>
                Buka Contoh Dialog Modal
              </Button>

              <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Konfirmasi Penerbitan Pertemuan"
                footer={
                  <>
                    <Button variant="secondary" onClick={() => setModalOpen(false)}>
                      {KAMUS_UI.BATAL}
                    </Button>
                    <Button variant="primary" onClick={() => {
                      setModalOpen(false);
                      toast.success('Diterbitkan', 'Pertemuan berhasil diterbitkan untuk mahasiswa.');
                    }}>
                      {KAMUS_UI.TERBITKAN}
                    </Button>
                  </>
                }
              >
                <p>
                  Apakah Anda yakin ingin menerbitkan materi dan video interaktif pada <strong>Pertemuan 4: Ushul Fiqih Kontemporer</strong>? 
                  Mahasiswa yang terdaftar akan langsung menerima notifikasi pembelajaran.
                </p>
              </Modal>
            </CardBody>
          </Card>
        </>
      ) : activeTab === 'states' ? (
        /* Section States: Empty, Error, Loading, Permission Denied */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          <Card>
            <CardHeader>
              <CardTitle>Kondisi Data Kosong (Empty State)</CardTitle>
            </CardHeader>
            <CardBody>
              <EmptyState 
                title="Belum Ada Materi"
                description="Dosen belum mengunggah materi pembelajaran untuk pertemuan ini."
                actionLabel="Unggah Materi Pertama"
                onAction={() => toast.info('Aksi', 'Membuka form penambahan materi')}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kondisi Terjadi Kesalahan (Error State)</CardTitle>
            </CardHeader>
            <CardBody>
              <ErrorState 
                title="Gagal Memuat Data"
                message="Terjadi gangguan koneksi saat mengambil riwayat nilai kuis."
                onRetry={() => toast.success('Memuat Ulang', 'Berhasil memuat ulang data.')}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kondisi Akses Ditolak (Permission Denied)</CardTitle>
            </CardHeader>
            <CardBody>
              <PermissionDenied 
                onBack={() => toast.info('Kembali', 'Mengarahkan ke halaman Beranda')}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kondisi Memuat (Loading & Skeleton)</CardTitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <LoadingSpinner size="md" text="Sinkronisasi data perkuliahan..." />
              <div className="flex flex-col gap-2">
                <Skeleton height="24px" width="60%" />
                <Skeleton height="16px" width="100%" />
                <Skeleton height="16px" width="80%" />
              </div>
            </CardBody>
          </Card>
        </div>
      ) : (
        /* Tab 3: Sistem Ekspor & Impor Terstandar */
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alur Kerja Ekspor Standar Excel (.xlsx) & PDF Resmi</CardTitle>
              <CardSubtitle>Mendukung Buku Kerja Excel (.xlsx) berstyling kampus, penyesuaian lebar kolom otomatis, dan opsi Dokumen PDF Resmi STAI AL-ITTIHAD.</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Klik tombol ekspor di bawah untuk menguji unduhan multi-format atau pratinjau cetak resmi dokumen kampus:
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <ExportDropdown 
                  config={{
                    filename: 'SALAM_Demo_Daftar_Mahasiswa',
                    title: 'DAFTAR MAHASISWA & PROGRES AKADEMIK',
                    subtitle: 'Sekolah Tinggi Agama Islam (STAI) Al-Ittihad Cianjur',
                    data: sampleData,
                    columns: [
                      { key: 'nim', header: 'NIM', width: '120px' },
                      { key: 'name', header: 'Nama Lengkap', width: '220px' },
                      { key: 'course', header: 'Mata Kuliah', width: '200px' },
                      { key: 'progress', header: 'Progres (%)', width: '100px', align: 'center', format: (val) => `${val}%` },
                      { key: 'status', header: 'Status Kelulusan', width: '140px', align: 'center' }
                    ],
                    metadata: {
                      'Total Mahasiswa': `${sampleData.length} Mahasiswa Terdaftar`,
                      'Tahun Akademik': '2026/2027 Ganjil',
                      'Waktu Unduh': new Date().toLocaleString('id-ID')
                    }
                  }}
                  buttonLabel="Uji Menu Ekspor Lengkap"
                />
              </div>

              <div className="mt-4">
                <Table
                  columns={columns}
                  data={sampleData}
                  keyExtractor={(row) => row.id}
                />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alur Kerja Impor Berkas 4 Langkah (Import Wizard)</CardTitle>
              <CardSubtitle>Validasi skema ketat, pemetaan kolom cerdas (fuzzy match), penanganan galat inline, dan unduhan template CSV/JSON.</CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Klik tombol di bawah untuk membuka simulasi wizard impor interaktif:
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button 
                  variant="primary" 
                  icon={UploadCloud}
                  onClick={() => setDemoImportOpen(true)}
                >
                  Buka Wizard Impor Data Mahasiswa
                </Button>
                <TemplateDownloadButton 
                  schema={STUDENT_IMPORT_SCHEMA} 
                  label="Unduh Format Template" 
                />
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Demo Import Modal */}
      {demoImportOpen && (
        <DataImportModal
          isOpen={demoImportOpen}
          onClose={() => setDemoImportOpen(false)}
          schema={STUDENT_IMPORT_SCHEMA}
          onImport={async (_data, summary) => {
            toast.success('Simulasi Impor Berhasil', `Memproses ${summary.inserted} baris data mahasiswa.`);
          }}
          customTitle="Simulasi Wizard Impor Data Mahasiswa"
        />
      )}
    </div>
  );
};
