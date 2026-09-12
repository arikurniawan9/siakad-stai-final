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
  ShieldCheck, 
  Activity,
  BarChart2,
  Lock,
  QrCode
} from 'lucide-react';
import { NavGroup, NavItem } from '../types/navigation';
import { UserRole } from '../types/roles';

/**
 * Tautan resmi portal induk SALAM SIAKAD STAI Al-Ittihad Cianjur
 */
export const SIAKAD_PORTAL_URL = ((import.meta as any).env?.VITE_SIAKAD_URL || 'https://salam.stai-alittihad.ac.id').replace(/\/+$/, '');

/**
 * Master akademik (mahasiswa, dosen, prodi, periode, mata kuliah, kelas,
 * ruangan, jadwal, KRS/KHS dan nilai final) dikelola di SIAKAD.
 * LMS hanya menyediakan tautan resmi ke portal sumber data tersebut.
 */
const SIAKAD_MASTER_LINK: NavItem = {
  id: 'portal-siakad',
  label: 'Buka Portal SIAKAD',
  path: SIAKAD_PORTAL_URL,
  icon: FileText,
  badge: 'SIAKAD',
  isExternal: true,
  externalUrl: SIAKAD_PORTAL_URL,
  description: 'Kelola data akademik pada portal SIAKAD resmi.'
};

// =========================================================================
// 1. NAVIGASI KHUSUS MAHASISWA (PEMBELAJARAN DARING)
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
    title: 'PEMBELAJARAN DARING',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah & Materi', path: '/mata-kuliah', icon: BookOpen, badge: '5' },
      { id: 'presensi-kuliah', label: 'Presensi Pertemuan', path: '/presensi', icon: QrCode },
      { id: 'tugas-saya', label: 'Tugas & Asesmen Daring', path: '/tugas', icon: CheckSquare, badge: '2' },
      { id: 'kuis-ujian', label: 'Kuis & CBT Online', path: '/kuis', icon: HelpCircle },
      { id: 'forum-diskusi', label: 'Forum Diskusi', path: '/forum', icon: MessageSquare },
      { id: 'progres-belajar', label: 'Progres Belajar', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'jadwal-group',
    title: 'JADWAL & AGENDA',
    items: [
      { id: 'jadwal-kuliah', label: 'Jadwal Kuliah', path: '/jadwal', icon: Calendar },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
    ]
  },
  {
    id: 'akademik-group',
    title: 'PORTAL SIAKAD (ADMINISTRASI RESMI)',
    items: [
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-mahasiswa', label: 'KRS, KHS & Administrasi Akademik' },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI & LAYANAN',
    items: [
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell, badge: 'Baru' },
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
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
// 2. NAVIGASI KHUSUS DOSEN PENGAMPU (KEGIATAN BELAJAR DARING)
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
    id: 'kelas-group',
    title: 'KELAS SAYA',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah & Materi', path: '/mata-kuliah', icon: BookOpen },
      { id: 'presensi-kuliah', label: 'Presensi & BAP Kuliah', path: '/presensi', icon: QrCode },
    ]
  },
  {
    id: 'pengelolaan-pembelajaran-group',
    title: 'KELOLA PEMBELAJARAN',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'tugas-kelola', label: 'Tugas & Penilaian Daring', path: '/tugas', icon: CheckSquare, badge: 'Perlu Nilai' },
      { id: 'kuis-kelola', label: 'Bank Soal & Kuis CBT', path: '/kuis', icon: HelpCircle },
      { id: 'video-interaktif', label: 'Video Kuliah Interaktif', path: '/video', icon: Video },
      { id: 'forum-diskusi', label: 'Forum Diskusi Kelas', path: '/forum', icon: MessageSquare },
      { id: 'progres-mahasiswa', label: 'Progres Mahasiswa', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'akademik-informasi-group',
    title: 'AKADEMIK & INFORMASI',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'jadwal-mengajar', label: 'Jadwal Mengajar', path: '/jadwal', icon: Calendar },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-dosen', label: 'Input DPNA & Administrasi SIAKAD' },
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell },
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    collapsible: true,
    defaultCollapsed: true,
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
    id: 'kelas-group',
    title: 'KELAS SAYA',
    items: [
      { id: 'mata-kuliah-saya', label: 'Mata Kuliah & Materi', path: '/mata-kuliah', icon: BookOpen },
      { id: 'presensi-kuliah', label: 'Presensi & BAP Kuliah', path: '/presensi', icon: QrCode },
    ]
  },
  {
    id: 'pengelolaan-pembelajaran-group',
    title: 'KELOLA PEMBELAJARAN',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'tugas-kelola', label: 'Tugas & Penilaian Daring', path: '/tugas', icon: CheckSquare },
      { id: 'kuis-kelola', label: 'Bank Soal & Kuis CBT', path: '/kuis', icon: HelpCircle },
      { id: 'video-interaktif', label: 'Video Kuliah Interaktif', path: '/video', icon: Video },
      { id: 'forum-diskusi', label: 'Forum Diskusi Kelas', path: '/forum', icon: MessageSquare },
      { id: 'progres-mahasiswa', label: 'Progres Mahasiswa', path: '/progres', icon: TrendingUp },
    ]
  },
  {
    id: 'akademik-informasi-group',
    title: 'AKADEMIK & INFORMASI',
    collapsible: true,
    defaultCollapsed: true,
    items: [
      { id: 'jadwal-mengajar', label: 'Jadwal Mengajar', path: '/jadwal', icon: Calendar },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-dosen-pa', label: 'Bimbingan KRS & Nilai di SIAKAD' },
      { id: 'pengumuman', label: 'Pengumuman Kampus', path: '/pengumuman', icon: Bell },
      { id: 'notifikasi-pusat', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
    ]
  },
  {
    id: 'akun-group',
    title: 'AKUN',
    collapsible: true,
    defaultCollapsed: true,
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
    id: 'supervisi-group',
    title: 'SUPERVISI PEMBELAJARAN DARING',
    items: [
      { id: 'monitoring-aktivitas', label: 'Monitoring Pembelajaran Daring', path: '/admin/monitoring', icon: Activity },
      { id: 'laporan-akademik', label: 'Laporan Kinerja Belajar LMS', path: '/laporan', icon: BarChart2 },
      { id: 'mata-kuliah-diampu', label: 'Mata Kuliah & Materi', path: '/mata-kuliah', icon: BookOpen },
    ]
  },
  {
    id: 'sinkronisasi-group',
    title: 'ADMINISTRASI AKADEMIK',
    items: [
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-kaprodi', label: 'Program Studi, Kelas & Persetujuan KRS' },
    ]
  },
  {
    id: 'informasi-group',
    title: 'INFORMASI & BROADCAST',
    items: [
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
      { id: 'notifikasi-admin', label: 'Pusat Notifikasi', path: '/notifikasi', icon: Bell },
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
      { id: 'beranda', label: 'Beranda Admin LMS', path: '/', icon: Home },
    ]
  },
  {
    id: 'operasional-group',
    title: 'OPERASIONAL PEMBELAJARAN DARING',
    items: [
      { id: 'monitoring-aktivitas', label: 'Monitoring Aktivitas Kelas', path: '/admin/monitoring', icon: Activity },
      { id: 'laporan-institusi', label: 'Laporan Pembelajaran LMS', path: '/laporan', icon: BarChart2 },
    ]
  },
  {
    id: 'sinkronisasi-group',
    title: 'SINKRONISASI DATA SIAKAD',
    items: [
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-admin', label: 'Kelola Master Akademik di SIAKAD' },
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
      { id: 'beranda', label: 'Ringkasan Eksekutif LMS', path: '/', icon: Home },
    ]
  },
  {
    id: 'monitoring-eksekutif-group',
    title: 'MONITORING PEMBELAJARAN DARING',
    items: [
      { id: 'laporan-kinerja', label: 'Laporan Aktivitas Belajar', path: '/laporan', icon: BarChart2 },
      { id: 'monitoring-aktivitas', label: 'Monitoring Kelas Daring', path: '/admin/monitoring', icon: Activity },
      { id: 'monitoring-nilai', label: 'Monitoring Capaian Nilai', path: '/admin/nilai', icon: Award },
    ]
  },
  {
    id: 'tinjauan-akademik-group',
    title: 'DATA TERPADU SIAKAD',
    items: [
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-pimpinan', label: 'Lihat Master Akademik di SIAKAD' },
      { id: 'kalender-akademik', label: 'Kalender Akademik', path: '/kalender', icon: Calendar },
    ]
  },
  {
    id: 'audit-group',
    title: 'AUDIT & AKUNTABILITAS LMS',
    items: [
      { id: 'audit-log', label: 'Audit Log Aktivitas LMS', path: '/admin/audit', icon: FileText },
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
      { id: 'beranda', label: 'Dashboard Administrator LMS', path: '/', icon: Home },
    ]
  },
  {
    id: 'pembelajaran-admin-group',
    title: 'OPERASIONAL PEMBELAJARAN DARING',
    items: [
      { id: 'monitoring-aktivitas', label: 'Monitoring Pembelajaran Daring', path: '/admin/monitoring', icon: Activity },
      { id: 'laporan-institusi', label: 'Laporan Pembelajaran LMS', path: '/laporan', icon: BarChart2 },
    ]
  },
  {
    id: 'sinkronisasi-group',
    title: 'SINKRONISASI & INTEGRASI SIAKAD',
    items: [
      { ...SIAKAD_MASTER_LINK, id: 'portal-siakad-superadmin', label: 'Kelola Master Akademik di SIAKAD' },
    ]
  },
  {
    id: 'sistem-audit-group',
    title: 'SISTEM & KEAMANAN LMS',
    items: [
      { id: 'hak-akses', label: 'Peran & Hak Akses (RBAC)', path: '/admin/peran', icon: ShieldCheck },
      { id: 'audit-log', label: 'Audit Log & Jejak Keamanan', path: '/admin/audit', icon: FileText },
      { id: 'qa-security', label: 'Audit Keamanan & QA RBAC', path: '/admin/keamanan', icon: Lock },
      { id: 'konfigurasi', label: 'Pengaturan Sistem LMS', path: '/admin/pengaturan', icon: Settings },
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
  { id: 'mobile-tugas', label: 'Tugas', path: '/tugas', icon: CheckSquare },
  { id: 'mobile-jadwal', label: 'Jadwal', path: '/jadwal', icon: Calendar },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_DOSEN: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-kuliah', label: 'Kelas', path: '/mata-kuliah', icon: BookOpen },
  { id: 'mobile-tugas', label: 'Tugas', path: '/tugas', icon: CheckSquare },
  { id: 'mobile-presensi', label: 'Presensi', path: '/presensi', icon: QrCode },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_DOSEN_PA: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-kuliah', label: 'Kelas', path: '/mata-kuliah', icon: BookOpen },
  { id: 'mobile-presensi', label: 'Presensi', path: '/presensi', icon: QrCode },
  { id: 'mobile-bimbingan', label: 'Bimbingan', path: '/bimbingan', icon: Users },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_KAPRODI: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-monitoring', label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
  { ...SIAKAD_MASTER_LINK, id: 'mobile-siakad', label: 'SIAKAD' },
  { id: 'mobile-laporan', label: 'Laporan', path: '/laporan', icon: BarChart2 },
  { id: 'mobile-akun', label: 'Akun', path: '/profil', icon: User },
];

export const MOBILE_NAV_ADMIN_AKADEMIK: NavItem[] = [
  { id: 'mobile-beranda', label: 'Beranda', path: '/', icon: Home },
  { id: 'mobile-monitoring', label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
  { ...SIAKAD_MASTER_LINK, id: 'mobile-siakad-admin', label: 'SIAKAD' },
  { id: 'mobile-laporan', label: 'Laporan', path: '/laporan', icon: BarChart2 },
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
  { ...SIAKAD_MASTER_LINK, id: 'mobile-siakad-superadmin', label: 'SIAKAD' },
  { id: 'mobile-monitoring', label: 'Monitoring', path: '/admin/monitoring', icon: Activity },
  { id: 'mobile-laporan', label: 'Laporan', path: '/laporan', icon: BarChart2 },
  { id: 'mobile-keamanan', label: 'Keamanan', path: '/admin/keamanan', icon: ShieldCheck },
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
