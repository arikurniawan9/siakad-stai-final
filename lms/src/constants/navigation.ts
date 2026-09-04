import { 
  Home, 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  FileText, 
  Award, 
  Bell, 
  User, 
  Video, 
  Users, 
  Settings, 
  Layers, 
  ShieldCheck, 
  Activity,
  FileSpreadsheet,
  RefreshCw,
  BarChart2,
  Lock,
  QrCode
} from 'lucide-react';
import { NavGroup, NavItem } from '../types/navigation';
import { UserRole } from '../types/roles';

// =========================================================================
// 1. NAVIGASI KHUSUS MAHASISWA
// =========================================================================
export const NAVIGATION_MAHASISWA: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Beranda Mahasiswa', path: '/', icon: Home },
    ]
  },
  {
    id: 'pembelajaran-group',
    title: 'PEMBELAJARAN',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah Saya', path: '/mata-kuliah', icon: BookOpen, badge: '5' },
      { id: 'presensi-kuliah', label: 'Presensi & Kehadiran', path: '/presensi', icon: QrCode },
      { id: 'tugas-saya', label: 'Tugas & Asesmen', path: '/tugas', icon: CheckSquare, badge: '2' },
      { id: 'kuis-ujian', label: 'Kuis & Evaluasi', path: '/kuis', icon: HelpCircle },
      { id: 'forum-diskusi', label: 'Forum Diskusi', path: '/forum', icon: MessageSquare },
      { id: 'progres-belajar', label: 'Progres Belajar', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'akademik-group',
    title: 'AKADEMIK',
    items: [
      { id: 'jadwal-kuliah', label: 'Jadwal Kuliah', path: '/jadwal', icon: Calendar },
      { id: 'krs', label: 'Kartu Rencana Studi (KRS)', path: '/krs', icon: FileText },
      { id: 'khs', label: 'Kartu Hasil Studi (KHS)', path: '/khs', icon: FileSpreadsheet },
      { id: 'buku-nilai', label: 'Buku Nilai Perkuliahan', path: '/buku-nilai', icon: Award },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI & KOMUNIKASI',
    items: [
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman', path: '/pengumuman', icon: Bell, badge: 'Baru' },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Saya', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 2. NAVIGASI KHUSUS DOSEN PENGAMPU
// =========================================================================
export const NAVIGATION_DOSEN: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Beranda Dosen', path: '/', icon: Home },
    ]
  },
  {
    id: 'perkuliahan-group',
    title: 'PERKULIAHAN',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah Diampu', path: '/mata-kuliah', icon: BookOpen, badge: '4' },
      { id: 'jadwal-mengajar', label: 'Jadwal Mengajar', path: '/jadwal', icon: Calendar },
      { id: 'presensi-kuliah', label: 'Presensi & Kehadiran', path: '/presensi', icon: QrCode },
      { id: 'materi-pembelajaran', label: 'Materi & RPS', path: '/materi', icon: Layers },
      { id: 'video-interaktif', label: 'Video Interaktif', path: '/video', icon: Video },
      { id: 'kuis-kelola', label: 'Bank Soal & Kuis', path: '/kuis', icon: HelpCircle },
      { id: 'tugas-kelola', label: 'Tugas & Penilaian', path: '/tugas', icon: CheckSquare, badge: 'Perlu Nilai' },
      { id: 'forum-diskusi', label: 'Forum Diskusi', path: '/forum', icon: MessageSquare },
      { id: 'progres-mahasiswa', label: 'Progres Mahasiswa', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'akademik-group',
    title: 'PENILAIAN & NILAI AKHIR',
    items: [
      { id: 'rekap-nilai', label: 'Rekap Nilai Akhir', path: '/admin/nilai', icon: Award },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI',
    items: [
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman', path: '/pengumuman', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Saya', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 3. NAVIGASI KHUSUS DOSEN PEMBIMBING AKADEMIK (DOSEN PA)
// =========================================================================
export const NAVIGATION_DOSEN_PA: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Beranda Dosen PA', path: '/', icon: Home },
    ]
  },
  {
    id: 'perkuliahan-group',
    title: 'PERKULIAHAN & PENGAJARAN',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah Diampu', path: '/mata-kuliah', icon: BookOpen },
      { id: 'jadwal-mengajar', label: 'Jadwal Mengajar', path: '/jadwal', icon: Calendar },
      { id: 'presensi-kuliah', label: 'Presensi & Kehadiran', path: '/presensi', icon: QrCode },
      { id: 'materi-pembelajaran', label: 'Materi & RPS', path: '/materi', icon: Layers },
      { id: 'tugas-kelola', label: 'Tugas & Penilaian', path: '/tugas', icon: CheckSquare },
      { id: 'kuis-kelola', label: 'Bank Soal & Kuis', path: '/kuis', icon: HelpCircle },
      { id: 'forum-diskusi', label: 'Forum Diskusi', path: '/forum', icon: MessageSquare },
      { id: 'progres-mahasiswa', label: 'Progres Mahasiswa', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'bimbingan-group',
    title: 'BIMBINGAN AKADEMIK & NILAI',
    items: [
      { id: 'mahasiswa-bimbingan', label: 'Bimbingan & KRS Mahasiswa', path: '/bimbingan', icon: Users, badge: 'Validasi' },
      { id: 'rekap-nilai', label: 'Rekap Nilai Akhir', path: '/admin/nilai', icon: Award },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI',
    items: [
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman', path: '/pengumuman', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Saya', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 4. NAVIGASI KHUSUS KETUA PROGRAM STUDI (KAPRODI)
// =========================================================================
export const NAVIGATION_KAPRODI: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Beranda Kaprodi', path: '/', icon: Home },
    ]
  },
  {
    id: 'kurikulum-group',
    title: 'KURIKULUM & PERKULIAHAN',
    items: [
      { id: 'program-studi', label: 'Program Studi & Kurikulum', path: '/admin/prodi', icon: Layers },
      { id: 'mata-kuliah-master', label: 'Mata Kuliah & Kelas', path: '/admin/mata-kuliah', icon: BookOpen },
      { id: 'jadwal-master', label: 'Ruangan & Jadwal Kuliah', path: '/admin/jadwal', icon: Calendar },
      { id: 'mata-kuliah-diampu', label: 'Mata Kuliah Diampu', path: '/mata-kuliah', icon: BookOpen },
    ]
  },
  {
    id: 'supervisi-group',
    title: 'SUPERVISI & EVALUASI',
    items: [
      { id: 'monitoring-aktivitas', label: 'Monitoring Aktivitas Kelas', path: '/admin/monitoring', icon: Activity },
      { id: 'monitoring-nilai', label: 'Monitoring & Rekap Nilai', path: '/admin/nilai', icon: Award },
      { id: 'validasi-krs', label: 'Persetujuan KRS & Bimbingan', path: '/bimbingan', icon: Users },
      { id: 'laporan-akademik', label: 'Laporan Kinerja Akademik', path: '/laporan', icon: BarChart2 },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI & BROADCAST',
    items: [
      { id: 'notifikasi-admin', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Saya', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 5. NAVIGASI KHUSUS ADMIN AKADEMIK (BAAK)
// =========================================================================
export const NAVIGATION_ADMIN_AKADEMIK: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Beranda Admin Akademik', path: '/', icon: Home },
    ]
  },
  {
    id: 'data-akademik-group',
    title: 'DATA AKADEMIK MASTER',
    items: [
      { id: 'tahun-akademik', label: 'Tahun Akademik & Periode', path: '/admin/periode', icon: Calendar },
      { id: 'program-studi', label: 'Program Studi & Kurikulum', path: '/admin/prodi', icon: Layers },
      { id: 'mata-kuliah-master', label: 'Mata Kuliah & Kelas', path: '/admin/mata-kuliah', icon: BookOpen },
      { id: 'jadwal-master', label: 'Ruangan & Jadwal Kuliah', path: '/admin/jadwal', icon: Calendar },
    ]
  },
  {
    id: 'sivitas-group',
    title: 'SIVITAS AKADEMIKA',
    items: [
      { id: 'data-mahasiswa', label: 'Data Mahasiswa', path: '/admin/mahasiswa', icon: Users },
      { id: 'data-dosen', label: 'Data Dosen & Pengajar', path: '/admin/dosen', icon: Users },
    ]
  },
  {
    id: 'operasional-group',
    title: 'OPERASIONAL & SINKRONISASI',
    items: [
      { id: 'sinkronisasi-akademik', label: 'Sinkronisasi SIAKAD', path: '/admin/sinkronisasi', icon: RefreshCw, badge: 'Siap' },
      { id: 'monitoring-aktivitas', label: 'Monitoring Aktivitas', path: '/admin/monitoring', icon: Activity },
      { id: 'monitoring-nilai', label: 'Monitoring & Rekap Nilai', path: '/admin/nilai', icon: Award },
      { id: 'laporan-institusi', label: 'Laporan Akademik', path: '/laporan', icon: BarChart2 },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI & LAYANAN',
    items: [
      { id: 'notifikasi-admin', label: 'Pusat Notifikasi & Broadcast', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Saya', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 6. NAVIGASI KHUSUS PIMPINAN STAI (KETUA / WAKIL KETUA)
// =========================================================================
export const NAVIGATION_PIMPINAN: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Ringkasan Eksekutif', path: '/', icon: Home },
    ]
  },
  {
    id: 'monitoring-eksekutif-group',
    title: 'EKSEKUTIF & MONITORING',
    items: [
      { id: 'laporan-kinerja', label: 'Laporan Kinerja Institusi', path: '/laporan', icon: BarChart2 },
      { id: 'monitoring-aktivitas', label: 'Monitoring Pembelajaran', path: '/admin/monitoring', icon: Activity },
      { id: 'monitoring-nilai', label: 'Monitoring Nilai & IPK', path: '/admin/nilai', icon: Award },
    ]
  },
  {
    id: 'tinjauan-akademik-group',
    title: 'TINJAUAN AKADEMIK',
    items: [
      { id: 'program-studi', label: 'Program Studi & Kurikulum', path: '/admin/prodi', icon: Layers },
      { id: 'katalog-mk', label: 'Katalog Mata Kuliah & Kelas', path: '/admin/mata-kuliah', icon: BookOpen },
      { id: 'jadwal-kuliah', label: 'Jadwal Perkuliahan', path: '/admin/jadwal', icon: Calendar },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
    ]
  },
  {
    id: 'audit-group',
    title: 'AUDIT & AKUNTABILITAS',
    items: [
      { id: 'audit-log', label: 'Audit Log Aktivitas', path: '/admin/audit', icon: FileText },
      { id: 'notifikasi-admin', label: 'Pusat Notifikasi & Edaran', path: '/notifikasi', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Pimpinan', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// 7. NAVIGASI KHUSUS SUPER ADMINISTRATOR SISTEM (IT)
// =========================================================================
export const NAVIGATION_SUPER_ADMIN: NavGroup[] = [
  {
    id: 'beranda-group',
    title: 'UTAMA',
    items: [
      { id: 'beranda', label: 'Dashboard Administrator', path: '/', icon: Home },
    ]
  },
  {
    id: 'data-akademik-group',
    title: 'MASTER AKADEMIK',
    items: [
      { id: 'tahun-akademik', label: 'Tahun Akademik & Periode', path: '/admin/periode', icon: Calendar },
      { id: 'program-studi', label: 'Program Studi & Kurikulum', path: '/admin/prodi', icon: Layers },
      { id: 'mata-kuliah-master', label: 'Mata Kuliah & Kelas', path: '/admin/mata-kuliah', icon: BookOpen },
      { id: 'jadwal-master', label: 'Ruangan & Jadwal', path: '/admin/jadwal', icon: Calendar },
    ]
  },
  {
    id: 'pengguna-group',
    title: 'MANAJEMEN PENGGUNA',
    items: [
      { id: 'data-mahasiswa', label: 'Data Mahasiswa', path: '/admin/mahasiswa', icon: Users },
      { id: 'data-dosen', label: 'Data Dosen & Pengajar', path: '/admin/dosen', icon: Users },
    ]
  },
  {
    id: 'pembelajaran-admin-group',
    title: 'OPERASIONAL & SINKRONISASI',
    items: [
      { id: 'sinkronisasi-akademik', label: 'Sinkronisasi SIAKAD', path: '/admin/sinkronisasi', icon: RefreshCw, badge: 'Siap' },
      { id: 'monitoring-aktivitas', label: 'Monitoring Aktivitas', path: '/admin/monitoring', icon: Activity },
      { id: 'monitoring-nilai', label: 'Monitoring Nilai & Transkrip', path: '/admin/nilai', icon: Award },
      { id: 'laporan-institusi', label: 'Laporan Akademik', path: '/laporan', icon: BarChart2 },
    ]
  },
  {
    id: 'sistem-audit-group',
    title: 'SISTEM & KEAMANAN IT',
    items: [
      { id: 'hak-akses', label: 'Peran & Hak Akses (RBAC)', path: '/admin/peran', icon: ShieldCheck },
      { id: 'audit-log', label: 'Audit Log & Jejak Keamanan', path: '/admin/audit', icon: FileText },
      { id: 'qa-security', label: 'Audit Keamanan & QA RBAC', path: '/admin/keamanan', icon: Lock },
      { id: 'konfigurasi', label: 'Pengaturan Sistem Global', path: '/admin/pengaturan', icon: Settings },
    ]
  },
  {
    id: 'informasi-group',
    title: 'LAYANAN & INFORMASI',
    items: [
      { id: 'notifikasi-admin', label: 'Pusat Notifikasi & Broadcast', path: '/notifikasi', icon: Bell },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    items: [
      { id: 'profil-saya', label: 'Profil Administrator', path: '/profil', icon: User },
      { id: 'keamanan-akun', label: 'Keamanan Akun', path: '/keamanan', icon: ShieldCheck },
    ]
  }
];

// =========================================================================
// NAVIGASI MOBILE PER PERAN
// =========================================================================
export const MOBILE_NAV_MAHASISWA: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-kuliah', label: 'Kuliah', path: '/mata-kuliah', icon: BookOpen },
  { id: 'mobile-jadwal', label: 'Jadwal', path: '/jadwal', icon: Calendar },
  { id: 'mobile-notifikasi', label: 'Notifikasi', path: '/notifikasi', icon: Bell },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_DOSEN: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-kuliah', label: 'Kelas', path: '/mata-kuliah', icon: BookOpen },
  { id: 'mobile-tugas', label: 'Tugas', path: '/tugas', icon: CheckSquare },
  { id: 'mobile-notifikasi', label: 'Notifikasi', path: '/notifikasi', icon: Bell },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_DOSEN_PA: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-kuliah', label: 'Kelas', path: '/mata-kuliah', icon: BookOpen },
  { id: 'mobile-bimbingan', label: 'Bimbingan', path: '/bimbingan', icon: Users },
  { id: 'mobile-notifikasi', label: 'Notifikasi', path: '/notifikasi', icon: Bell },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_KAPRODI: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-master', label: 'Kurikulum', path: '/admin/prodi', icon: Layers },
  { id: 'mobile-monitoring', label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
  { id: 'mobile-notifikasi', label: 'Notifikasi', path: '/notifikasi', icon: Bell },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_ADMIN_AKADEMIK: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-master', label: 'Data MK', path: '/admin/mata-kuliah', icon: BookOpen },
  { id: 'mobile-jadwal', label: 'Jadwal', path: '/admin/jadwal', icon: Calendar },
  { id: 'mobile-sinkronisasi', label: 'Sinkronisasi', path: '/admin/sinkronisasi', icon: RefreshCw },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_PIMPINAN: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-laporan', label: 'Laporan', path: '/laporan', icon: BarChart2 },
  { id: 'mobile-monitoring', label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
  { id: 'mobile-audit', label: 'Audit Log', path: '/admin/audit', icon: FileText },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_SUPER_ADMIN: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-master', label: 'Akademik', path: '/admin/mata-kuliah', icon: BookOpen },
  { id: 'mobile-rbac', label: 'Hak Akses', path: '/admin/peran', icon: ShieldCheck },
  { id: 'mobile-pengaturan', label: 'Pengaturan', path: '/admin/pengaturan', icon: Settings },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

// =========================================================================
// FUNGSI GETTER NAVIGASI BERDASARKAN PERAN PENGGUNA
// =========================================================================
export function getMobileNavByRole(role: UserRole): NavItem[] {
  switch (role) {
    case 'mahasiswa':
      return MOBILE_NAV_MAHASISWA;
    case 'dosen':
      return MOBILE_NAV_DOSEN;
    case 'dosen_pa':
      return MOBILE_NAV_DOSEN_PA;
    case 'kaprodi':
      return MOBILE_NAV_KAPRODI;
    case 'admin_akademik':
      return MOBILE_NAV_ADMIN_AKADEMIK;
    case 'pimpinan':
      return MOBILE_NAV_PIMPINAN;
    case 'administrator_sistem':
      return MOBILE_NAV_SUPER_ADMIN;
    default:
      return MOBILE_NAV_MAHASISWA;
  }
}

export function getNavigationByRole(role: UserRole): NavGroup[] {
  switch (role) {
    case 'mahasiswa':
      return NAVIGATION_MAHASISWA;
    case 'dosen':
      return NAVIGATION_DOSEN;
    case 'dosen_pa':
      return NAVIGATION_DOSEN_PA;
    case 'kaprodi':
      return NAVIGATION_KAPRODI;
    case 'admin_akademik':
      return NAVIGATION_ADMIN_AKADEMIK;
    case 'pimpinan':
      return NAVIGATION_PIMPINAN;
    case 'administrator_sistem':
      return NAVIGATION_SUPER_ADMIN;
    default:
      return NAVIGATION_MAHASISWA;
  }
}
