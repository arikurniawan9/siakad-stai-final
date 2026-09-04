/**
 * Layanan Modul Pengumuman & Informasi Kampus
 * SALAM LMS — STAI AL-ITTIHAD CIANJUR
 */

import { 
  AnnouncementItem, 
  StudentAnnouncementState 
} from '../types/announcement';

const STORAGE_KEY_STATE = 'salam_announcements_student_state';

// Dataset Mock Pengumuman Resmi STAI Al-Ittihad Cianjur
const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann-01',
    title: 'Surat Edaran: Jadwal Ujian Akhir Semester (UAS) Ganjil TA 2026/2027 & Syarat Bebas Administrasi',
    slug: 'jadwal-uas-ganjil-2026-2027',
    category: 'AKADEMIK',
    urgency: 'PENTING',
    isPinned: true,
    publishedAt: '2026-08-15T08:00:00Z',
    expiresAt: '2026-09-30T23:59:00Z',
    publisherName: 'Biro Administrasi Akademik & Kemahasiswaan (BAAK)',
    publisherRole: 'Kepala BAAK STAI Al-Ittihad',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'Pelaksanaan Ujian Akhir Semester (UAS) Ganjil akan diselenggarakan pada 14–26 September 2026. Mahasiswa wajib melunasi administrasi dan memiliki presensi minimal 75%.',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Diberitahukan kepada seluruh mahasiswa STAI AL-ITTIHAD Cianjur, bahwa Ujian Akhir Semester (UAS) Tahun Akademik 2026/2027 akan diselenggarakan secara blended (tatap muka dan daring melalui SALAM LMS) dengan ketentuan sebagai berikut:</p>
      
      <h4 style="font-weight: bold; margin-top: 16px;">1. Waktu Pelaksanaan</h4>
      <ul>
        <li><strong>Minggu Tenang:</strong> 07 – 12 September 2026</li>
        <li><strong>Pelaksanaan UAS:</strong> 14 – 26 September 2026</li>
        <li><strong>Input & Finalisasi Nilai Dosen:</strong> 28 September – 05 Oktober 2026</li>
        <li><strong>Penerbitan KHS Resmi di SALAM:</strong> 08 Oktober 2026</li>
      </ul>

      <h4 style="font-weight: bold; margin-top: 16px;">2. Persyaratan Mengikuti Ujian</h4>
      <ol>
        <li>Terdaftar aktif pada semester berjalan dan telah mengisi KRS yang telah disetujui Dosen Pembimbing Akademik (PA).</li>
        <li>Tingkat kehadiran presensi perkuliahan minimal <strong>75%</strong> dari total 16 pertemuan.</li>
        <li>Telah melunasi biaya administrasi perkuliahan semester berjalan minimal tahap III.</li>
        <li>Membawa Kartu Peserta Ujian (dapat diunduh mandiri di SALAM LMS mulai H-3 ujian).</li>
      </ol>

      <p style="margin-top: 16px;">Demikian pengumuman ini disampaikan agar menjadi perhatian bersama. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.</p>
      <p>Wassalamu'alaikum Warahmatullahi Wabarakatuh.</p>
    `,
    attachments: [
      {
        id: 'att-01',
        fileName: 'SE_Jadwal_UAS_Ganjil_2026_2027_STAI_AlIttihad.pdf',
        fileSize: '1.2 MB',
        fileType: 'PDF',
        downloadUrl: '/downloads/SE_Jadwal_UAS_2026.pdf'
      },
      {
        id: 'att-02',
        fileName: 'Panduan_Tata_Tertib_Ujian_SALAM_LMS.pdf',
        fileSize: '650 KB',
        fileType: 'PDF',
        downloadUrl: '/downloads/Tata_Tertib_Ujian.pdf'
      }
    ],
    actionLink: {
      label: 'Lihat Jadwal Kuliah & Ujian',
      path: '/jadwal'
    },
    tags: ['UAS', 'Jadwal Akademik', 'Ujian', 'BAAK']
  },
  {
    id: 'ann-02',
    title: 'Pembukaan Pendaftaran Beasiswa Tahfidz Al-Quran & Prestasi Kitab Turats Semester Ganjil 2026',
    slug: 'beasiswa-tahfidz-prestasi-turats-2026',
    category: 'KEMAHASISWAAN',
    urgency: 'PENTING',
    isPinned: true,
    publishedAt: '2026-08-12T09:30:00Z',
    expiresAt: '2026-09-05T23:59:00Z',
    publisherName: 'Pusat Pengembangan Mutu & Kemahasiswaan',
    publisherRole: 'Wakil Ketua III Bidang Kemahasiswaan',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'Pendaftaran beasiswa potongan SPP 50%-100% bagi mahasiswa hafizh minimal 5 Juz dan penguasaan kitab kuning (Matan Ghayah wa Taqrib, Alfiyah Ibnu Malik).',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Dalam rangka mengapresiasi mahasiswa yang berdedikasi tinggi dalam menghafal Al-Qur'an dan mengkaji literatur Islam klasik (Kitab Turats), STAI AL-ITTIHAD membuka Program Beasiswa Semester Ganjil 2026/2027.</p>

      <h4 style="font-weight: bold; margin-top: 16px;">Kategori Beasiswa:</h4>
      <ul>
        <li><strong>Kategori A (Hafizh 30 Juz Mutqin):</strong> Beasiswa Pembebasan SPP 100% + Asrama Ma'had.</li>
        <li><strong>Kategori B (Hafizh 10-20 Juz):</strong> Beasiswa Pembebasan SPP 50%.</li>
        <li><strong>Kategori C (Prestasi Qira'atul Kutub):</strong> Penguasaan kitab Fathul Qarib / Minhaj al-Thalibin / Alfiyah Ibnu Malik.</li>
      </ul>

      <h4 style="font-weight: bold; margin-top: 16px;">Tahapan Seleksi:</h4>
      <ol>
        <li>Pendaftaran Online: 12 – 30 Agustus 2026</li>
        <li>Uji Tasmi' & Baca Kitab: 02 – 04 September 2026</li>
        <li>Pengumuman Kelulusan Beasiswa: 07 September 2026</li>
      </ol>
    `,
    attachments: [
      {
        id: 'att-03',
        fileName: 'Formulir_Pendaftaran_Beasiswa_Tahfidz_2026.pdf',
        fileSize: '480 KB',
        fileType: 'PDF',
        downloadUrl: '/downloads/Formulir_Beasiswa_Tahfidz.pdf'
      }
    ],
    tags: ['Beasiswa', 'Tahfidz', 'Turats', 'Kemahasiswaan']
  },
  {
    id: 'ann-03',
    title: 'Kajian Dhuha Akbar & Bedah Kitab "Adab al-Alim wa al-Muta\'allim" Karya KH. Hasyim Asy\'ari',
    slug: 'kajian-dhuha-bedah-kitab-adabul-alim',
    category: 'KEISLAMAN',
    urgency: 'NORMAL',
    isPinned: false,
    publishedAt: '2026-08-10T10:00:00Z',
    publisherName: 'Lembaga Pengkajian Islam & Ma\'had Mahasiswa',
    publisherRole: 'Mudir Ma\'had STAI Al-Ittihad',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'Kajian rutin bulanan bersama civitas akademika di Masjid Al-Ittihad Cianjur, menghadirkan narasumber ulama tafsir & pakar pendidikan Islam.',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Hadirilah Kajian Dhuha Civitas Akademika STAI AL-ITTIHAD yang akan dilaksanakan pada:</p>
      <ul>
        <li><strong>Hari / Tanggal:</strong> Sabtu, 22 Agustus 2026</li>
        <li><strong>Waktu:</strong> Pukul 08.00 – 11.30 WIB</li>
        <li><strong>Tempat:</strong> Masjid Utama Al-Ittihad Cianjur</li>
        <li><strong>Tema:</strong> <em>Etika Penuntut Ilmu dan Adab Guru dalam Perspektif Kitab Adab al-Alim wa al-Muta'allim</em></li>
        <li><strong>Pemateri:</strong> Dr. KH. Ahmad Syahid, M.Ag (Pakar Filologi Turats Pesantren)</li>
      </ul>
      <p>Seluruh mahasiswa PAI, MPI, dan HES diwajibkan hadir dan mengenakan busana muslim rapi almamater.</p>
    `,
    attachments: [
      {
        id: 'att-04',
        fileName: 'Ringkasan_Materi_Adabul_Alim_KH_Hasyim_Asyari.pdf',
        fileSize: '2.1 MB',
        fileType: 'PDF',
        downloadUrl: '/downloads/Ringkasan_Adabul_Alim.pdf'
      }
    ],
    tags: ['Kajian', 'Keislaman', 'Ma\'had', 'Adab Penuntut Ilmu']
  },
  {
    id: 'ann-04',
    title: 'Peluncuran Fitur Baru SALAM LMS: Pembaca Modul Online Interaktif & Simulator Nilai Mahasiswa',
    slug: 'peluncuran-fitur-baru-salam-lms',
    category: 'PERKULIAHAN',
    urgency: 'NORMAL',
    isPinned: false,
    publishedAt: '2026-08-08T14:00:00Z',
    publisherName: 'Pusat Teknologi Informasi & Pangkalan Data (PTIPD)',
    publisherRole: 'Administrator Sistem SALAM',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'SALAM LMS kini dilengkapi dengan pembaca E-Modul berdurasi aktif, pengaturan tema membaca, teks dalil Arab berharakat, dan simulasi proyeksi target nilai perkuliahan.',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Kami dengan senang hati mengumumkan peluncuran pembaruan sistem pembelajaran daring SALAM LMS STAI Al-Ittihad dengan fitur-fitur mutakhir:</p>
      <ul>
        <li><strong>E-Modul Online Interaktif:</strong> Membaca modul langsung di browser dengan tema Terang/Sepia/Gelap, timer durasi aktif, dan catatan belajar tersimpan.</li>
        <li><strong>Buku Nilai Perkuliahan:</strong> Transparansi bobot penilaian, simulator nilai UAS, dan umpan balik dosen terintegrasi.</li>
        <li><strong>Kartu Hasil Studi Digital:</strong> Cetak KHS berotentikasi QR Code resmi.</li>
      </ul>
      <p>Bila mengalami kendala teknis, silakan hubungi Layanan Bantuan PTIPD di Gedung Rektorat Lt. 2.</p>
    `,
    actionLink: {
      label: 'Jelajahi Buku Nilai Perkuliahan',
      path: '/buku-nilai'
    },
    tags: ['SALAM LMS', 'Pembaruan Fitur', 'PTIPD', 'E-Learning']
  },
  {
    id: 'ann-05',
    title: 'Batas Akhir Validasi & Pembayaran SPP Tahap II Tahun Akademik 2026/2027',
    slug: 'batas-akhir-spp-tahap-2',
    category: 'KEUANGAN',
    urgency: 'MENENGAH',
    isPinned: false,
    publishedAt: '2026-08-05T08:30:00Z',
    expiresAt: '2026-08-25T16:00:00Z',
    publisherName: 'Biro Keuangan & Administrasi Umum',
    publisherRole: 'Bagian Keuangan Kampus',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'Pembayaran SPP Tahap II dibuka melalui Virtual Account Bank Syariah Indonesia (BSI) dan Bank Muamalat hingga 25 Agustus 2026 pukul 16.00 WIB.',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Diberitahukan kepada seluruh mahasiswa, batas akhir pembayaran biaya kuliah (SPP Tahap II) adalah hari <strong>Selasa, 25 Agustus 2026 pukul 16.00 WIB</strong>.</p>
      <p>Pembayaran dapat dilakukan melalui nomor Virtual Account (VA) masing-masing pada Bank BSI atau Bank Muamalat. Keterlambatan pembayaran akan mengakibatkan penangguhan akses ujian akhir semester.</p>
    `,
    attachments: [
      {
        id: 'att-05',
        fileName: 'Panduan_Pembayaran_VA_BSI_Bank_Muamalat.pdf',
        fileSize: '820 KB',
        fileType: 'PDF',
        downloadUrl: '/downloads/Panduan_Pembayaran_VA.pdf'
      }
    ],
    tags: ['Keuangan', 'SPP', 'BSI', 'Administrasi']
  },
  {
    id: 'ann-06',
    title: 'Pengumuman Jadwal Pemeliharaan Server Rutin SALAM LMS (Maintenance Window)',
    slug: 'pemeliharaan-server-rutin-salam',
    category: 'DARURAT_PENTING',
    urgency: 'NORMAL',
    isPinned: false,
    publishedAt: '2026-08-01T20:00:00Z',
    publisherName: 'Tim Infrastruktur & Keamanan PTIPD',
    publisherRole: 'Administrator Jaringan',
    targetAudience: 'SEMUA_MAHASISWA',
    summary: 'Pemeliharaan server dan optimasi basis data terjadwal pada hari Minggu, 23 Agustus 2026 pukul 01.00 – 04.00 WIB.',
    contentHtml: `
      <p>Assalamu'alaikum Warahmatullahi Wabarakatuh,</p>
      <p>Untuk meningkatkan stabilitas dan kecepatan akses portal SALAM LMS, tim teknis PTIPD akan melakukan pemeliharaan infrastruktur rutin pada hari Minggu, 23 Agustus 2026, pukul 01.00 s.d. 04.00 WIB (dini hari).</p>
      <p>Selama periode tersebut, akses ke portal SALAM akan mengalami jeda sementara. Mohon mahasiswa tidak melakukan submit tugas atau pengerjaan kuis pada jam tersebut.</p>
    `,
    tags: ['Server', 'Maintenance', 'PTIPD']
  }
];

class AnnouncementService {
  private announcements: AnnouncementItem[] = INITIAL_ANNOUNCEMENTS;

  private memoryStates: Record<string, Record<string, StudentAnnouncementState>> = {};

  /**
   * Mengambil semua state pengumuman mahasiswa dari local storage
   */
  private getStudentStates(studentId: string): Record<string, StudentAnnouncementState> {
    try {
      if (typeof localStorage === 'undefined') {
        return this.memoryStates[studentId] || {};
      }
      const raw = localStorage.getItem(`${STORAGE_KEY_STATE}_${studentId}`);
      return raw ? JSON.parse(raw) : (this.memoryStates[studentId] || {});
    } catch {
      return this.memoryStates[studentId] || {};
    }
  }

  /**
   * Menyimpan state pengumuman mahasiswa ke local storage
   */
  private saveStudentStates(studentId: string, states: Record<string, StudentAnnouncementState>): void {
    this.memoryStates[studentId] = states;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_STATE}_${studentId}`, JSON.stringify(states));
      }
    } catch (e) {
      console.warn('Gagal menyimpan status pengumuman:', e);
    }
  }

  /**
   * Mengambil daftar pengumuman untuk mahasiswa beserta status baca & bookmark
   */
  public getAnnouncements(studentId: string = 'usr-mhs-01'): (AnnouncementItem & { isRead: boolean; isBookmarked: boolean })[] {
    const states = this.getStudentStates(studentId);

    return this.announcements.map((item) => {
      const state = states[item.id];
      return {
        ...item,
        isRead: state ? state.isRead : false,
        isBookmarked: state ? state.isBookmarked : false
      };
    });
  }

  /**
   * Mengambil satu pengumuman berdasarkan ID atau Slug
   */
  public getAnnouncementById(idOrSlug: string, studentId: string = 'usr-mhs-01'): (AnnouncementItem & { isRead: boolean; isBookmarked: boolean }) | null {
    const item = this.announcements.find((a) => a.id === idOrSlug || a.slug === idOrSlug);
    if (!item) return null;

    const states = this.getStudentStates(studentId);
    const state = states[item.id];

    return {
      ...item,
      isRead: state ? state.isRead : false,
      isBookmarked: state ? state.isBookmarked : false
    };
  }

  /**
   * Menandai pengumuman sebagai telah dibaca
   */
  public markAsRead(announcementId: string, studentId: string = 'usr-mhs-01'): void {
    const states = this.getStudentStates(studentId);
    states[announcementId] = {
      announcementId,
      isRead: true,
      readAt: new Date().toISOString(),
      isBookmarked: states[announcementId]?.isBookmarked || false
    };
    this.saveStudentStates(studentId, states);
  }

  /**
   * Menandai SEMUA pengumuman sebagai telah dibaca
   */
  public markAllAsRead(studentId: string = 'usr-mhs-01'): void {
    const states = this.getStudentStates(studentId);
    const now = new Date().toISOString();

    this.announcements.forEach((item) => {
      states[item.id] = {
        announcementId: item.id,
        isRead: true,
        readAt: states[item.id]?.readAt || now,
        isBookmarked: states[item.id]?.isBookmarked || false
      };
    });

    this.saveStudentStates(studentId, states);
  }

  /**
   * Mengubah status bookmark / simpan pengumuman
   */
  public toggleBookmark(announcementId: string, studentId: string = 'usr-mhs-01'): boolean {
    const states = this.getStudentStates(studentId);
    const current = states[announcementId];
    const newBookmarked = current ? !current.isBookmarked : true;

    states[announcementId] = {
      announcementId,
      isRead: current ? current.isRead : false,
      readAt: current?.readAt,
      isBookmarked: newBookmarked
    };

    this.saveStudentStates(studentId, states);
    return newBookmarked;
  }

  /**
   * Mengambil statistik ringkasan pengumuman untuk badge & dashboard
   */
  public getAnnouncementStats(studentId: string = 'usr-mhs-01'): {
    total: number;
    unreadCount: number;
    pinnedCount: number;
    bookmarkedCount: number;
    urgentCount: number;
  } {
    const items = this.getAnnouncements(studentId);
    const total = items.length;
    const unreadCount = items.filter((i) => !i.isRead).length;
    const pinnedCount = items.filter((i) => i.isPinned).length;
    const bookmarkedCount = items.filter((i) => i.isBookmarked).length;
    const urgentCount = items.filter((i) => i.urgency === 'PENTING').length;

    return {
      total,
      unreadCount,
      pinnedCount,
      bookmarkedCount,
      urgentCount
    };
  }
}

export const announcementService = new AnnouncementService();
