/**
 * KAMUS ISTILAH UI WAJIB SALAM STAI AL-ITTIHAD
 * 
 * Aturan Utama:
 * Seluruh teks yang dilihat pengguna WAJIB menggunakan Bahasa Indonesia yang konsisten.
 * Dilarang menggunakan istilah asing tanpa padanan pada UI.
 */

export const KAMUS_UI = {
  // Navigasi & Halaman Utama
  BERANDA: 'Beranda',
  MATA_KULIAH: 'Mata Kuliah',
  MATA_KULIAH_SAYA: 'Mata Kuliah Saya',
  MODUL_PEMBELAJARAN: 'Modul Pembelajaran',
  MATERI_PEMBELAJARAN: 'Materi Pembelajaran',
  VIDEO_INTERAKTIF: 'Video Interaktif',
  KUIS: 'Kuis',
  KUIS_DARING: 'Kuis Daring',
  BANK_SOAL: 'Bank Soal',
  TUGAS: 'Tugas',
  PENGUMPULAN: 'Pengumpulan',
  NILAI: 'Nilai',
  BUKU_NILAI: 'Buku Nilai',
  UMPAN_BALIK: 'Umpan Balik',
  FORUM_DISKUSI: 'Forum Diskusi',
  PROGRES_BELAJAR: 'Progres Belajar',
  PENYELESAIAN: 'Penyelesaian',
  BATAS_PENGUMPULAN: 'Batas Pengumpulan',
  JADWAL_KULIAH: 'Jadwal Kuliah',
  JADWAL_MENGAJAR: 'Jadwal Mengajar',
  PENGUMUMAN: 'Pengumuman',
  NOTIFIKASI: 'Notifikasi',
  PENGATURAN: 'Pengaturan',
  PROFIL_SAYA: 'Profil Saya',
  KEAMANAN_AKUN: 'Keamanan Akun',
  KELUAR: 'Keluar',

  // Aksi & Tombol
  SIMPAN: 'Simpan',
  SIMPAN_PERUBAHAN: 'Simpan Perubahan',
  BATAL: 'Batal',
  HAPUS: 'Hapus',
  UBAH: 'Ubah',
  CARI: 'Cari',
  SARING: 'Saring',
  TERBITKAN: 'Terbitkan',
  DRAF: 'Draf',
  PRATINJAU: 'Pratinjau',
  UNGGAH: 'Unggah',
  UNDUH: 'Unduh',
  TAUTAN: 'Tautan',
  KUMPULKAN: 'Kumpulkan',
  KUMPULKAN_TUGAS: 'Kumpulkan Tugas',
  MULAI_KUIS: 'Mulai Kuis',
  LANJUTKAN: 'Lanjutkan',
  LANJUTKAN_BELAJAR: 'Lanjutkan Belajar',
  KIRIM_BALASAN: 'Kirim Balasan',
  KEMBALI: 'Kembali',
  COBA_LAGI: 'Coba Lagi',
  TUTUP: 'Tutup',

  // Status Konten
  STATUS_DRAF: 'Draf',
  STATUS_TERJADWAL: 'Terjadwal',
  STATUS_DITERBITKAN: 'Diterbitkan',
  STATUS_DIARSIPKAN: 'Diarsipkan',

  // Status Pembelajaran & Aktivitas
  STATUS_BELUM_DIMULAI: 'Belum Dimulai',
  STATUS_SEDANG_DIPELAJARI: 'Sedang Dipelajari',
  STATUS_SELESAI: 'Selesai',

  // Status Tugas & Pengumpulan
  STATUS_BELUM_TERSEDIA: 'Belum Tersedia',
  STATUS_TERSEDIA: 'Tersedia',
  STATUS_BELUM_DIKUMPULKAN: 'Belum Dikumpulkan',
  STATUS_SUDAH_DIKUMPULKAN: 'Sudah Dikumpulkan',
  STATUS_TERLAMBAT: 'Terlambat',
  STATUS_SUDAH_DINILAI: 'Sudah Dinilai',
  STATUS_PERLU_REVISI: 'Perlu Revisi',

  // Status Akademik
  STATUS_DIAJUKAN: 'Diajukan',
  STATUS_MENUNGGU_PERSETUJUAN: 'Menunggu Persetujuan',
  STATUS_PERLU_PERBAIKAN: 'Perlu Perbaikan',
  STATUS_DISETUJUI: 'Disetujui',

  // Status Sinkronisasi
  STATUS_SINKRON_MENUNGGU: 'Menunggu',
  STATUS_SINKRON_BERJALAN: 'Berjalan',
  STATUS_SINKRON_BERHASIL: 'Berhasil',
  STATUS_SINKRON_SEBAGIAN: 'Berhasil Sebagian',
  STATUS_SINKRON_GAGAL: 'Gagal',

  // Label State Khusus
  MEMUAT_DATA: 'Memuat data...',
  TIDAK_ADA_DATA: 'Belum ada data tersedia',
  TERJADI_KESALAHAN: 'Terjadi kesalahan sistem',
  AKSES_DITOLAK: 'Akses Ditolak',
  AKSES_DITOLAK_DESKRIPSI: 'Anda tidak memiliki kewenangan untuk mengakses halaman ini.',
} as const;

export type KamusUIKey = keyof typeof KAMUS_UI;
