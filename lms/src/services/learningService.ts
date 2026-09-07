import { 
  RPSSection, 
  CourseMeeting, 
  LearningMaterial, 
  MaterialAccessLog,
  ModuleNote
} from '../types/learning';
import { AcademicClass } from '../types/academic';

const MEETINGS_KEY = 'salam_course_meetings';
const RPS_KEY = 'salam_course_rps';
const ACCESS_LOGS_KEY = 'salam_material_access_logs';
const MODULE_NOTES_KEY = 'salam_module_student_notes';
const SCHEMA_VERSION_KEY = 'salam_learning_service_v5_real_data';

// =========================================================================
// REAL RPS MAP FOR STAI AL-ITTIHAD SIAKAD COURSES
// =========================================================================
export const INITIAL_RPS_MAP: Record<string, RPSSection> = {
  // 1. PAI-301: Fiqih Mawaris (3 SKS)
  'cls-20261-pai301-a': {
    description: 'Mata kuliah Fiqih Mawaris (Hukum Kewarisan Islam) membekali mahasiswa dengan penguasaan komprehensif tentang kaidah syar\'i pembagian harta peninggalan (tirkah), hakikat ashabul furudh, ashabah, hijab-mahjub, metode hisab waris matematis (Aul, Radd, Tashih), serta komparasi ketentuan Kompilasi Hukum Islam (KHI) di Pengadilan Agama Indonesia.',
    learningOutcomes: [
      'Menguasai landasan normatif Al-Qur\'an (Surah An-Nisa: 11, 12, 176) dan Sunnah terkait hukum faraidh.',
      'Mampu mengidentifikasi rukun, syarat, mawani\'ul irtsi (penghalang waris), dan penyelesaian kewajiban tirkah.',
      'Mampu menganalisis porsi bagian ashabul furudh, ashabah, dan relasi hijab hirman maupun nuqshan.',
      'Mampu memecahkan hisab pembagian waris riil secara akurat dengan kaidah ashlul mas\'alah, aul, dan radd.',
      'Mampu mengevaluasi implementasi hukum kewarisan dalam Kompilasi Hukum Islam (KHI) di Indonesia.'
    ],
    teachingMethods: [
      'Kuliah Interaktif & Diskusi Kelas',
      'Praktik Simulasi Hisab Mawaris (Kalkulator Faraidh)',
      'Studi Kasus Pembagian Waris Keluarga Muslim (Case-Based Learning)',
      'Bedah Putusan Pengadilan Agama & Kompilasi Hukum Islam (KHI)'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Partisipasi Diskusi', weightPercentage: 15 },
      { component: 'Tugas & Praktik Hisab Mawaris', weightPercentage: 25 },
      { component: 'Kuis & Evaluasi Sesi', weightPercentage: 15 },
      { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
      { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
    ],
    references: [
      { title: 'Matan Ar-Rahabiyyah fi \'Ilmil Faraidh & Syarahnya', author: 'Imam Muhammad bin Ali Ar-Rahabi', year: 2019, isPrimary: true },
      { title: 'Al-Faraidh al-Hisabiyyah wa at-Tashfiyatut Tarikah', author: 'Prof. Dr. Wahbah Az-Zuhaili', year: 2021, isPrimary: true },
      { title: 'Hukum Kewarisan Islam di Indonesia', author: 'Prof. Dr. Amir Syarifuddin', year: 2022, isPrimary: true },
      { title: 'Panduan Praktis Ilmu Faraidh & Pembagian Waris Modern', author: 'Dr. H. M. Ridwan, M.Ag', year: 2025, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Resmi_PAI301_Fiqih_Mawaris_2026.pdf',
    updatedAt: new Date().toISOString()
  },

  // 2. PAI-202: Fiqih Ibadah & Muamalah (3 SKS)
  'cls-20261-pai202-a': {
    description: 'Mata kuliah Fiqih Ibadah & Muamalah mengkaji tata cara peribadatan mahdhah (thaharah, shalat, zakat, puasa, haji) serta prinsip-prinsip transaksi muamalah maliyyah kontemporer (akad tijariyyah, perbankan syariah, e-commerce, fintech, etika bisnis Islam).',
    learningOutcomes: [
      'Mampu menguasai tata cara ibadah mahdhah secara benar sesuai dalil shahih dan kaidah madzhab.',
      'Mampu membedakan transaksi yang halal dan yang dilarang (riba, gharar, maysir, tadlis).',
      'Mampu menganalisis akad-akad muamalah klasik dan terapan modern (murabahah, mudharabah, ijarah).',
      'Mampu mengevaluasi keabsahan transaksi digital modern seperti e-wallet, paylater, dan investasi syariah.'
    ],
    teachingMethods: [
      'Kuliah Interaktif & Demonstrasi Fiqih Ibadah',
      'Studi Kasus Transaksi Keuangan Syariah Kontemporer',
      'Diskusi Fiqih Kontemporer (Case-Based Learning)',
      'Analisis Fatwa Dewan Syariah Nasional (DSN-MUI)'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Keaktifan Diskusi', weightPercentage: 15 },
      { component: 'Tugas Analisis Akad & Praktik Ibadah', weightPercentage: 25 },
      { component: 'Kuis & Video Interaktif', weightPercentage: 15 },
      { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
      { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
    ],
    references: [
      { title: 'Bidayatul Mujtahid wa Nihayatul Muqtashid', author: 'Ibnu Rusyd Al-Qurthubi', year: 2020, isPrimary: true },
      { title: 'Fiqh al-Muamalat al-Maliyyah al-Mu\'ashirah', author: 'Dr. Wahbah Az-Zuhaili', year: 2022, isPrimary: true },
      { title: 'Fiqih Ibadah Praktis dan Muamalah Modern', author: 'Dr. H. M. Ridwan, M.Ag', year: 2025, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Resmi_PAI202_Fiqih_Ibadah_Muamalah_2026.pdf',
    updatedAt: new Date().toISOString()
  },

  // 3. PAI-101: Ulumul Qur'an (2 SKS)
  'cls-20261-pai101-a': {
    description: 'Mata kuliah Ulumul Qur\'an membekali mahasiswa dengan pemahaman ilmiah mengenai sejarah pewahyuan, kodifikasi Al-Qur\'an, asbabun nuzul, makkiyyah-madaniyyah, muhkam-mutasyabih, nasikh-mansukh, i\'jazul qur\'an, serta metodologi penafsiran tafsir Al-Qur\'an.',
    learningOutcomes: [
      'Mampu menjelaskan hakikat wahyu dan sejarah kodifikasi Al-Qur\'an pada era Nabi dan Sahabat.',
      'Mampu menerapkan kaidah asbabun nuzul dan makkiyyah-madaniyyah dalam penafsiran ayat.',
      'Mampu menganalisis ayat muhkam-mutasyabih dan nasikh-mansukh secara kritis.',
      'Memahami aspek kemukjizatan Al-Qur\'an (I\'jaz) dari segi sastra, hukum, dan sains.'
    ],
    teachingMethods: [
      'Kuliah Interaktif & Diskusi Kelas',
      'Kajian Literatur Kitab Tafsir Klasik dan Modern',
      'Presentasi Analisis Ayat Tematik'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Partisipasi', weightPercentage: 15 },
      { component: 'Makalah & Analisis Ayat', weightPercentage: 25 },
      { component: 'Kuis Ulumul Qur\'an', weightPercentage: 15 },
      { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
      { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
    ],
    references: [
      { title: 'Mabahits fi \'Ulum al-Qur\'an', author: 'Manna\' Al-Qaththan', year: 2020, isPrimary: true },
      { title: 'Al-Itqan fi \'Ulum al-Qur\'an', author: 'Imam Jalaluddin As-Suyuthi', year: 2018, isPrimary: true },
      { title: 'Pengantar Ilmu Al-Qur\'an & Tafsir', author: 'Dr. Ahmad Syafi\'i, M.Ag', year: 2024, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Resmi_PAI101_Ulumul_Quran_2026.pdf',
    updatedAt: new Date().toISOString()
  },

  // 4. MKU-101: Bahasa Arab Dasar (2 SKS)
  'cls-20261-mku101-a': {
    description: 'Mata kuliah Bahasa Arab Dasar membekali mahasiswa dengan kaidah tata bahasa Arab pemula (nahwu dan sharaf), penguasaan kosakata (mufrodat), struktur kalimat (jumlah ismiyyah dan fi\'liyyah), serta kecakapan membaca teks Arab.',
    learningOutcomes: [
      'Mampu membedakan jenis kata (isim, fi\'il, huruf) beserta ciri-cirinya.',
      'Mampu menyusun kalimat sempurna (jumlah mufidah) dengan struktur yang benar.',
      'Mampu mengenali tanda-tanda i\'rab dasar dalam membaca teks Arab gundul sederhana.',
      'Mampu melakukan percakapan dasar (muhadatsah) dalam situasi akademik kampus.'
    ],
    teachingMethods: [
      'Metode Qawa\'id wa Tarjamah (Grammar-Translation)',
      'Drill & Praktik Percakapan (Muhadatsah)',
      'Latihan Membaca & Menulis Teks Arab (Qira\'ah & Kitabah)'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Keaktifan Praktik', weightPercentage: 15 },
      { component: 'Tugas Latihan Nahwu-Sharaf', weightPercentage: 25 },
      { component: 'Kuis Mufrodat & Kaidah', weightPercentage: 15 },
      { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
      { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
    ],
    references: [
      { title: 'Al-Muyassar fi \'Ilmin Nahwi', author: 'KH. Aceng Zakaria', year: 2021, isPrimary: true },
      { title: 'Durus al-Lughah al-\'Arabiyyah', author: 'Dr. V. Abdur Rahim', year: 2020, isPrimary: true },
      { title: 'Modul Bahasa Arab Dasar Perguruan Tinggi', author: 'Dra. Hj. Siti Maryam, M.Pd.I', year: 2025, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Resmi_MKU101_Bahasa_Arab_Dasar_2026.pdf',
    updatedAt: new Date().toISOString()
  },

  // 5. STAIPD213: Bahasa Arab II (2 SKS)
  'cls-staipd213-pd2': {
    description: 'Pengembangan kemampuan bahasa Arab terapan untuk calon pendidik anak usia dini, pengayaan kosakata edukatif (mufrodat at-tarbiyah), keterampilan mendengar (istima\'), dan membaca teks keislaman anak.',
    learningOutcomes: [
      'Menguasai kosakata tematik PAUD dalam bahasa Arab (keluarga, alam, doa harian).',
      'Mampu menggunakan ungkapan instruksional di ruang kelas anak usia dini.',
      'Mampu menyusun media flashcard dan lagu edukatif berbahasa Arab untuk AUD.'
    ],
    teachingMethods: [
      'Pembelajaran Berbasis Lagu & Gerak (Action Songs)',
      'Simulasi Pengajaran Microteaching Bahasa Arab PAUD',
      'Pembuatan Alat Peraga Edukatif (APE) Bahasa Arab'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Partisipasi', weightPercentage: 15 },
      { component: 'Portofolio Media APE Bahasa Arab', weightPercentage: 25 },
      { component: 'Kuis & Praktik Bernyanyi Edukatif', weightPercentage: 15 },
      { component: 'UTS Microteaching', weightPercentage: 20 },
      { component: 'UAS Karya Tulis & Praktik Mengajar', weightPercentage: 25 },
    ],
    references: [
      { title: 'Ta\'lim al-Lughah al-\'Arabiyyah li Athfal', author: 'Dr. Mahmud Kamil An-Naqah', year: 2020, isPrimary: true },
      { title: 'Media Pembelajaran Bahasa Arab Anak Usia Dini', author: 'MUHAMMAD RIZAL ZAENULLOH, M.Pd.', year: 2025, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Resmi_STAIPD213_Bahasa_Arab_II_2026.pdf',
    updatedAt: new Date().toISOString()
  }
};

// Aliases for historical / backend compatibility
INITIAL_RPS_MAP['cls-pai301-a'] = INITIAL_RPS_MAP['cls-20261-pai301-a'];
INITIAL_RPS_MAP['1'] = INITIAL_RPS_MAP['cls-20261-pai301-a'];
INITIAL_RPS_MAP['4'] = INITIAL_RPS_MAP['cls-20261-pai202-a'];
INITIAL_RPS_MAP['2'] = INITIAL_RPS_MAP['cls-20261-pai101-a'];
INITIAL_RPS_MAP['3'] = INITIAL_RPS_MAP['cls-20261-mku101-a'];
INITIAL_RPS_MAP['5'] = INITIAL_RPS_MAP['cls-staipd213-pd2'];

// =========================================================================
// REAL SYLLABUS DEFINITIONS FOR 16 WEEKS (SEMESTER GANJIL 2026/2027)
// =========================================================================
interface SyllabusOutlineItem {
  week: number;
  title: string;
  topic: string;
  description: string;
}

const SYLLABUS_CATALOG: Record<string, SyllabusOutlineItem[]> = {
  // PAI-301: Fiqih Mawaris (3 SKS)
  'PAI-301': [
    {
      week: 1,
      title: 'Pengantar Ilmu Mawaris & Hak-hak Terkait Tirkah',
      topic: 'Definisi, Dasar Hukum Al-Qur\'an & Sunnah, Serta Urgensi Menjaga Keutuhan Harta Warisan',
      description: 'Orientasi perkuliahan semester, pengenalan RPS, urgensi ilmu faraidh, perbedaan harta tirkah dengan warisan, serta 4 tahapan hak yang harus diselesaikan atas tirkah (tajhiz, hutang, wasiat, pembagian waris).'
    },
    {
      week: 2,
      title: 'Rukun, Syarat, dan Mawani\'ul Irtsi (Halangan Waris)',
      topic: 'Rukun Pewarisan dan Faktor Penghalang Hak Waris',
      description: 'Membedah syarat pewarisan, kematian muwarrits, kehidupan warits, serta sebab gugurnya hak waris (pembunuhan, berlainan agama, dan perbudakan).'
    },
    {
      week: 3,
      title: 'Sebab-sebab Kewarisan (Asbabul Irtsi)',
      topic: 'Nasab (Kekerabatan), Pernikahan Sah, dan Wala\'',
      description: 'Analisis sebab timbulnya hak kewarisan karena hubungan nasab hakiki, ikatan pernikahan syar\'i yang sah, dan wala\' pembebasan budak.'
    },
    {
      week: 4,
      title: 'Klasifikasi Ahli Waris Laki-laki & Perempuan',
      topic: '15 Golongan Ahli Waris Laki-laki dan 10 Golongan Ahli Waris Perempuan',
      description: 'Identifikasi menyeluruh seluruh ahli waris laki-laki dan perempuan beserta hierarki kedekatan nasab dengan al-marhum.'
    },
    {
      week: 5,
      title: 'Ashabul Furudh I: Hak Pasti 1/2, 1/4, dan 1/8',
      topic: 'Kriteria Penerima Bagian Separuh, Seperempat, dan Seperdelapan',
      description: 'Ketentuan dan syarat penerima furudh 1/2 (suami, anak perempuan tunggal, cucu perempuan, saudari kandung/seayah), 1/4 (suami/istri), dan 1/8 (istri bila ada anak).'
    },
    {
      week: 6,
      title: 'Ashabul Furudh II: Hak Pasti 2/3, 1/3, dan 1/6',
      topic: 'Kriteria Penerima Bagian Dua Pertiga, Sepertiga, dan Seperenam',
      description: 'Kriteria dua anak perempuan atau lebih, ibu, saudara seibu, ayah, kakek shahih, nenek shahihah, dan saudara seayah.'
    },
    {
      week: 7,
      title: 'Ashabah: Konsep dan Pembagian Ahli Waris Penerima Sisa',
      topic: 'Ashabah bin-Nafs, Ashabah bil-Ghair, dan Ashabah ma\'al-Ghair',
      description: 'Kaidah hak sisa harta waris: ahli waris penerima sisa dengan sendirinya, penerima sisa karena bersama ahli waris lain, dan penerima sisa bersama anak perempuan.'
    },
    {
      week: 8,
      title: 'Ujian Tengah Semester (UTS): Evaluasi Teori & Kasus Ashabul Furudh',
      topic: 'Evaluasi Komprehensif Pemahaman Konsep Mawaris dan Penentuan Bagian Pasti',
      description: 'Ujian evaluasi tengah semester berupa analisis kasus kematian dan penetapan status ahli waris yang berhak menerima serta porsi bagiannya.'
    },
    {
      week: 9,
      title: 'Kaidah Hijab dan Mahjub (Penghalangan Hak Waris)',
      topic: 'Hijab Hirman (Penghalangan Penuh) dan Hijab Nuqshan (Pengurangan Porsi)',
      description: 'Peta hubungan penghalangan antar ahli waris: 6 ahli waris yang tidak pernah gugur haknya dan ahli waris yang gugur karena adanya nasab yang lebih dekat.'
    },
    {
      week: 10,
      title: 'Asal Masalah (Ashlul Mas\'alah) dan Teknik Hisab Mawaris',
      topic: 'Menemukan Kelipatan Persekutuan Terkecil (KPK) dalam Angka Masalah Waris',
      description: 'Teknik hisab matematis menentukan 7 angka asal masalah (2, 3, 4, 6, 8, 12, 24) untuk menghitung porsi rupiah harta waris secara adil dan presisi.'
    },
    {
      week: 11,
      title: 'Konsep Aul (Pertambahan Angka Masalah karena Defisit)',
      topic: 'Penyelesaian Kasus Total Porsi Ashabul Furudh Melebihi Nilai 1 (Harta Penuh)',
      description: 'Kajian sejarah penetapan Aul era Khalifah Umar bin Khattab dan simulasi hisab aul pada asal masalah 6, 12, dan 24.'
    },
    {
      week: 12,
      title: 'Konsep Radd (Pengembalian Sisa Harta Waris)',
      topic: 'Penyelesaian Kasus Sisa Harta Waris Ketika Tidak Ada Ashabah',
      description: 'Kaidah pengembalian surplus sisa tirkah kepada ashabul furudh nasabiyyah secara proporsional sesuai kaidah jumhur sahabat.'
    },
    {
      week: 13,
      title: 'Masalah-masalah Khusus dalam Mawaris (Gharrawain & Musyarakah)',
      topic: 'Kasus Al-Gharrawain (Al-Umariyyatan), Al-Musyarakah (Al-Himariyyah), dan Al-Akdariyyah',
      description: 'Bedah kasus klasik istimewa: suami/istri bersama ayah dan ibu (Gharrawain), saudara kandung dan saudara seibu bersama suami dan ibu (Musyarakah).'
    },
    {
      week: 14,
      title: 'Kewarisan Janin dalam Kandungan (Al-Hamlu) & Orang Hilang (Al-Mafqud)',
      topic: 'Kaidah Penahanan Harta Waris untuk Kepentingan Janin dan Status Hukum Al-Mafqud',
      description: 'Tata cara mengalokasikan bagian warisan bagi janin yang masih dalam kandungan ibu serta penyelesaian hak waris orang hilang menurut fatwa ulama.'
    },
    {
      week: 15,
      title: 'Hukum Kewarisan Islam di Indonesia (Kompilasi Hukum Islam & Wasiat Wajibah)',
      topic: 'Analisis Pasal 171-214 KHI, Bagian Anak Angkat, dan Yurisprudensi Mahkamah Agung',
      description: 'Implementasi hukum kewarisan di Pengadilan Agama Indonesia: wasiat wajibah untuk anak angkat/orang tua angkat, ahli waris pengganti, dan pembagian harta bersama (gono-gini).'
    },
    {
      week: 16,
      title: 'Ujian Akhir Semester (UAS): Praktik Komprehensif Penyelesaian Kasus Tirkah',
      topic: 'Ujian Akhir Semester dan Portofolio Simulasi Pembagian Harta Waris Keluarga Muslim',
      description: 'Evaluasi akhir komprehensif berupa penyelesaian berkas perkara pembagian waris keluarga muslim dari penetapan tirkah hingga hisab rupiah final.'
    }
  ],

  // PAI-202: Fiqih Ibadah & Muamalah (3 SKS)
  'PAI-202': [
    {
      week: 1,
      title: 'Pengantar Fiqih Ibadah & Kaidah Pokok Ibadah Mahdhah',
      topic: 'Hakikat Ibadah, Ikhlas, Ittiba\', dan Kaidah \'Al-Ashlu fil \'Ibadati Al-Hazhr\'',
      description: 'Tujuan penciptaan manusia, syarat diterimanya ibadah, serta landasan kaidah fiqhiyyah bahwa asal hukum ibadah mahdhah adalah haram hingga ada dalil yang memerintahkannya.'
    },
    {
      week: 2,
      title: 'Fiqih Thaharah (Bersuci): Air, Najis, dan Wudhu Kontemporer',
      topic: 'Pembagian Jenis Air, Tingkatan Najis, dan Tata Cara Bersuci Sesuai Sunnah',
      description: 'Klasifikasi air muthlaq, musta\'mal, mutanajjis, wudhu, tayammum, mandi wajib, serta hukum thaharah praktis bagi pasien rumah sakit dan musafir.'
    },
    {
      week: 3,
      title: 'Fiqih Shalat I: Rukun, Syarat Sah, dan Khusyu\'',
      topic: 'Panduan Shalat Fardhu Sesuai Sifat Shalat Nabi SAW',
      description: 'Rukun 13 shalat, syarat sah, perkara yang membatalkan shalat, serta tips meraih kekhusyukan dalam shalat fardhu.'
    },
    {
      week: 4,
      title: 'Fiqih Shalat II: Shalat Berjamaah & Shalat Musafir',
      topic: 'Ketentuan Imam dan Makmum, Masbuq, Shalat Jamak dan Qashar',
      description: 'Tata cara shalat berjamaah, posisi shaf, sujud sahwi, sujud tilawah, rukhsah shalat bagi musafir dan orang sakit.'
    },
    {
      week: 5,
      title: 'Fiqih Zakat: Zakat Maal, Zakat Fitrah, dan Zakat Profesi',
      topic: 'Nishab, Haul, Klasifikasi Harta Zakat, dan 8 Golongan Mustahiq',
      description: 'Perhitungan zakat emas, tabungan, perdagangan, pertanian, peternakan, zakat profesi kontemporer, dan distribusi produktif BAZNAS.'
    },
    {
      week: 6,
      title: 'Fiqih Puasa (Shiyam): Rukun, Pembatal, dan Rukhsah Puasa',
      topic: 'Syarat Sah Puasa, Fidyah, Kaffarah, dan Ibadah di Bulan Ramadhan',
      description: 'Rukun puasa, pembatal kontemporer (injeksi, obat tetes mata, inhaler), ketentuan fidyah bagi lansia/wanita hamil, serta puasa sunnah.'
    },
    {
      week: 7,
      title: 'Fiqih Haji dan Umrah: Manasik, Rukun, dan Dam',
      topic: 'Miqat, Ihram, Thawaf, Sa\'i, Wukuf di Arafah, dan Pelaksanaan Haji Tamattu\'',
      description: 'Rukun dan wajib haji, larangan ihram, ragam manasik (ifrad, qiran, tamattu\'), serta pembayaran dam kontemporer.'
    },
    {
      week: 8,
      title: 'Ujian Tengah Semester (UTS): Evaluasi Fiqih Ibadah Mahdhah',
      topic: 'Evaluasi Praktik dan Pemahaman Teori Fiqih Ibadah',
      description: 'Ujian tengah semester menguji penguasaan kaidah thaharah, shalat, zakat, puasa, dan manasik haji.'
    },
    {
      week: 9,
      title: 'Pengantar Fiqih Muamalah: Kaidah Asas Transaksi Ekonomi Islam',
      topic: 'Kaidah \'Al-Ashlu fil Mu\'amalati Al-Ibahah\' dan Rukun Akad',
      description: 'Konsep dasar transaksi ekonomi Islam, prinsip kerelaan (an-taradhin), rukun akad, aqidain, mahallul aqad, dan sighat.'
    },
    {
      week: 10,
      title: 'Larangan Pokok Muamalah: Riba, Gharar, Maisir, dan Tadlis',
      topic: 'Membedah Jenis Riba (Nasi\'ah & Fadhl), Ketidakpastian (Gharar), dan Spekulasi Judi',
      description: 'Bahaya riba dalam sistem moneter, perbedaan bunga bank dengan bagi hasil syariah, gharar dalam transaksi jual beli, dan penipuan mutu barang.'
    },
    {
      week: 11,
      title: 'Akad Jual Beli (Al-Bai\'): Murabahah, Salam, dan Istishna\'',
      topic: 'Jual Beli Tunai, Tangguh, Pemesanan Barang, dan Khiyar (Hak Batal)',
      description: 'Mekanisme akad murabahah pada perbankan syariah, skema jual beli salam pada komoditas pangan, dan istishna\' pada proyek konstruksi.'
    },
    {
      week: 12,
      title: 'Akad Kemitraan Bagi Hasil: Mudharabah & Musyarakah',
      topic: 'Kemitraan Modal dan Tenaga serta Pembagian Nisbah Keuntungan',
      description: 'Prinsip akad mudharabah (shahibul maal dan mudharib), musyarakah mutanaqisah pada KPR syariah, serta mitigasi risiko bisnis.'
    },
    {
      week: 13,
      title: 'Akad Jasa dan Sewa: Ijarah, IMBT, Ju\'alah, dan Rahn',
      topic: 'Sewa Barang, Upah Tenaga Kerja, Gadai Emas Syariah, dan Sayembara',
      description: 'Penyewaan aset, Ijarah Muntahiya Bittamlik (IMBT), gadai syariah (rahn), dan akad kafalah penjaminan kredit syariah.'
    },
    {
      week: 14,
      title: 'Akad Sosial & Filantropi: Wakaf Uang, Hibah, dan Qardh Hasan',
      topic: 'Optimalisasi Filantropi Islam untuk Kesejahteraan Umat',
      description: 'Kaidah pinjaman kebajikan (qardh hasan), regulasi wakaf uang produktif di Indonesia, hibah orang tua kepada anak, dan shadaqah jariyah.'
    },
    {
      week: 15,
      title: 'Transaksi Ekonomi Digital: E-Wallet, Paylater, & Fintech Syariah',
      topic: 'Tinjauan Fiqih Muamalah terhadap Uang Elektronik, Cashback, dan Buy Now Pay Later',
      description: 'Analisis Fatwa DSN-MUI tentang uang elektronik (e-money), hukum saldo bonus cashback, peer-to-peer lending syariah, dan cryptocurrency.'
    },
    {
      week: 16,
      title: 'Ujian Akhir Semester (UAS): Analisis Kasus Transaksi Muamalah Kontemporer',
      topic: 'Evaluasi Komprehensif Fiqih Muamalah dan Etika Bisnis Syariah',
      description: 'Ujian akhir semester berupa pemecahan masalah (case solving) studi kelayakan syariah pada produk perbankan atau platform digital.'
    }
  ],

  // PAI-101: Ulumul Qur'an (2 SKS)
  'PAI-101': [
    { week: 1, title: 'Pengantar Ulumul Qur\'an', topic: 'Definisi, Objek Kajian, dan Urgensi bagi Mufassir', description: 'Pengenalan cabang-cabang ilmu Al-Qur\'an dan sejarah perkembangannya.' },
    { week: 2, title: 'Hakikat Wahyu & Cara Penurunan Al-Qur\'an', topic: 'Tahapan Pewahyuan: Lauh Mahfuzh, Baitul \'Izzah, dan Berangsur-angsur', description: 'Hikmah Al-Qur\'an diturunkan secara bertahap selama 23 tahun.' },
    { week: 3, title: 'Sejarah Kodifikasi Mushaf Al-Qur\'an', topic: 'Pengumpulan Era Rasulullah, Abu Bakar Ash-Shiddiq, dan Utsman bin Affan', description: 'Metodologi pencatatan wahyu, hafalan sahabat, dan penyatuan mushaf imam.' },
    { week: 4, title: 'Ayat Makkiyyah dan Madaniyyah', topic: 'Karakteristik Teks, Aspek Tematik, dan Kriteria Klasifikasi', description: 'Ciri khas fase dakwah Mekkah dan Madinah dalam uslub Al-Qur\'an.' },
    { week: 5, title: 'Asbabun Nuzul: Urgensi dan Kaidah Penafsiran', topic: 'Kaidah \'Al-Ibratu bi \'Umumil Lafzhi la bi Khusushis Sabab\'', description: 'Peran konteks historis peristiwa turunnya ayat dalam memahami pesan Al-Qur\'an.' },
    { week: 6, title: 'Rasm Utsmani dan Dhabth Mushaf', topic: 'Kaidah Penulisan Khath Utsmani dan Tanda Baca Al-Qur\'an', description: 'Kaidah hadzf, ziyadah, hamz, badal, washl/fashl dalam rasm usmani.' },
    { week: 7, title: 'Qira\'at Al-Qur\'an: Sejarah Qira\'ah Sab\'ah', topic: 'Syarat Keshahihan Qira\'at dan Ragam Dialek Arab (Ahruf Sab\'ah)', description: 'Pengaruh perbedaan qira\'at terhadap penafsiran dan istinbath hukum syar\'i.' },
    { week: 8, title: 'Ujian Tengah Semester (UTS): Evaluasi Sejarah & Kodifikasi Teks', topic: 'Evaluasi Teori Ulumul Qur\'an', description: 'Ujian pemahaman sejarah mushaf dan kaidah dasar penafsiran.' },
    { week: 9, title: 'Al-Wujuh wan Nazhair dalam Al-Qur\'an', topic: 'Satu Kata Beragam Makna dalam Ragam Konteks Ayat', description: 'Kajian semantik kosakata Al-Qur\'an seperti kata Al-Huda, Ash-Shalah, dll.' },
    { week: 10, title: 'Muhkam dan Mutasyabih', topic: 'Definisi, Ragam Ayat Sifat, dan Sikap Ulama Salaf-Khalaf', description: 'Menelaah ayat-ayat yang jelas maknanya dan ayat yang membutuhkan takwil syar\'i.' },
    { week: 11, title: 'Nasikh dan Mansukh dalam Al-Qur\'an', topic: 'Konsep Pembatalan Hukum, Hikmah Ilahiyyah, dan Ragam Bentuk Naskh', description: 'Naskh tilawah wa hukman, naskh hukm duna tilawah, dan naskh tilawah duna hukm.' },
    { week: 12, title: 'Amtsal dan Aqsam dalam Al-Qur\'an', topic: 'Perumpamaan Edukatif dan Sumpah Allah dalam Firman-Nya', description: 'Hikmah Allah bersumpah dengan makhluk-Nya dan keindahan analogi Al-Qur\'an.' },
    { week: 13, title: 'Kisah-kisah Al-Qur\'an (Qashashul Qur\'an)', topic: 'Fakta Historis, Ibrah Tarbawiyyah, dan Penolakan Terhadap Israiliyyat', description: 'Tujuan pendidikan keimanan melalui kisah nabi-nabi dan umat terdahulu.' },
    { week: 14, title: 'I\'jaz Al-Qur\'an (Kemukjizatan Al-Qur\'an)', topic: 'I\'jaz Lughawi, I\'jaz Ilmi, I\'jaz Tasyri\'i, dan Berita Ghaib', description: 'Bukti keautentikan firman Allah yang tidak dapat ditandingi oleh siapapun.' },
    { week: 15, title: 'Kaidah & Metodologi Penafsiran Al-Qur\'an', topic: 'Tafsir bil-Ma\'tsur, Tafsir bir-Ra\'yi, dan Metode Tahlili, Ijmali, Muqaran, Maudhu\'i', description: 'Langkah-langkah menyusun tafsir maudhu\'i (tematik) atas isu-isu kontemporer.' },
    { week: 16, title: 'Ujian Akhir Semester (UAS): Portofolio Analisis Tafsir Tematik', topic: 'Ujian Akhir Semester Ulumul Qur\'an', description: 'Presentasi dan pengumpulan karya analisis tafsir ayat tematik.' }
  ],

  // MKU-101: Bahasa Arab Dasar (2 SKS)
  'MKU-101': [
    { week: 1, title: 'Ta\'aruf & Pengenalan Huruf Hijaiyyah', topic: 'Makharijul Huruf, Harakat, dan Kosakata Sapaan Kampus', description: 'Pengantar bahasa Arab dasar dan ungkapan salam perkenalan.' },
    { week: 2, title: 'Aqsamul Kalimah: Isim, Fi\'il, dan Huruf', topic: 'Ciri-ciri Kata Benda, Kata Kerja, dan Kata Sambung', description: 'Membedakan tanwin, alif lam, huruf jar, dan tanda-tanda fi\'il.' },
    { week: 3, title: 'Mudzakkar dan Muannats, Mufrad, Mutsanna, Jamak', topic: 'Klasifikasi Gender dan Jumlah Bilangan Kata Benda', description: 'Pembedaan ta marbuthah, jamak mudzakkar salim, muannats salim, dan taksir.' },
    { week: 4, title: 'Isim Isyarah dan Isim Dlamir', topic: 'Kata Tunjuk (Hadza/Hadzihi) dan Kata Ganti Pribadi', description: 'Penggunaan kata ganti orang (Huwa, Hiya, Anta, Anti, Ana, Nahnu) dalam kalimat.' },
    { week: 5, title: 'Jumlah Ismiyyah: Mubtada\' dan Khabar', topic: 'Struktur Kalimat Nomina dan Kesesuaian Gender serta Bilangan', description: 'Menyusun kalimat sederhana berpola subjek-predikat.' },
    { week: 6, title: 'Tarkib Idlafi: Mudhaf dan Mudhaf Ilaih', topic: 'Frasa Kepemilikan (Genitive Construction)', description: 'Aturan penghilangan tanwin dan alif lam pada kata kepemilikan.' },
    { week: 7, title: 'Tarkib Na\'ti: Na\'at dan Man\'ut', topic: 'Kata Sifat dan Penyelarasannya dengan Kata Benda', description: 'Kesesuaian 4 aspek: i\'rab, ma\'rifah/nakirah, gender, dan bilangan.' },
    { week: 8, title: 'Ujian Tengah Semester (UTS): Latihan Qawa\'id Dasar', topic: 'Evaluasi Tata Bahasa & Percakapan Arab Sederhana', description: 'Ujian tengah semester mencakup identifikasi struktur kalimat dan tarkib.' },
    { week: 9, title: 'Pengantar I\'rab: Rofa\', Nashab, Jar, dan Jazm', topic: 'Tanda-tanda Pokok Harakat Akhir Kata (Dhammah, Fathah, Kasrah, Sukun)', description: 'Memahami perubahan baris akhir kata sesuai posisi gramatikalnya.' },
    { week: 10, title: 'Huruf Jar dan Zharaf Makan & Zaman', topic: 'Kata Depan dan Keterangan Tempat serta Waktu', description: 'Penggunaan fi, \'ala, min, ila, tahta, fauqa, amama, wara\'a.' },
    { week: 11, title: 'Fi\'il Madhi: Kata Kerja Lampau', topic: 'Tashrif Lughawi Kata Kerja Bentuk Lampau', description: 'Konjugasi 14 dlamir pada kata kerja madhi (Fa\'ala, Fa\'alat, dst).' },
    { week: 12, title: 'Fi\'il Mudhari\': Kata Kerja Sekarang/Akan Datang', topic: 'Huruf Mudhara\'ah (A-N-Y-T) dan Konjugasi Waktu', description: 'Pola kata kerja berlangsung dan perubahan dlamir pelaku.' },
    { week: 13, title: 'Jumlah Fi\'liyyah: Fi\'il, Fa\'il, dan Maf\'ul Bih', topic: 'Struktur Kalimat Verbal (Kata Kerja, Pelaku, Objek Penderita)', description: 'Kaidah fa\'il marfu\' dan maf\'ul bih manshub dalam kalimat sempurna.' },
    { week: 14, title: 'Fi\'il Amr: Kata Kerja Perintah', topic: 'Pembentukan Fi\'il Amr dan Penggunaannya dalam Instruksi Harian', description: 'Rumus membuat fi\'il amr dari fi\'il mudhari\' yang dijazmkan.' },
    { week: 15, title: 'Muhadatsah Yaumiyyah & Qira\'ah Nash Mashadir', topic: 'Percakapan Tematik Seputar Kehidupan Kampus & Perpustakaan', description: 'Latihan membaca teks pendek tanpa harakat dan dialog berpasangan.' },
    { week: 16, title: 'Ujian Akhir Semester (UAS): Evaluasi Praktik Membaca & Menulis', topic: 'Evaluasi Akhir Bahasa Arab Dasar', description: 'Ujian lisan membaca teks berharakat dan tes tulis kaidah nahwu.' }
  ]
};

// =========================================================================
// REAL INITIAL MEETINGS (FOR PAI-301 FIQIH MAWARIS)
// =========================================================================
export const INITIAL_MEETINGS: CourseMeeting[] = SYLLABUS_CATALOG['PAI-301'].map((item) => {
  const num = item.week;
  const pad = num < 10 ? `0${num}` : `${num}`;
  const startDate = new Date(2026, 8, 7); // 7 September 2026 (Senin)
  const meetingDate = new Date(startDate.getTime() + (num - 1) * 7 * 24 * 60 * 60 * 1000);
  const dateStr = meetingDate.toISOString().split('T')[0];

  const meeting: CourseMeeting = {
    id: `mtg-pai301a-${pad}`,
    classId: 'cls-20261-pai301-a',
    meetingNumber: num,
    title: `Pertemuan #${num}: ${item.title}`,
    topic: item.topic,
    description: item.description,
    scheduledDate: dateStr,
    startTime: '08:00',
    endTime: '09:40',
    orderIndex: num,
    status: 'DITERBITKAN',
    publishedAt: '2026-09-01T08:00:00Z',
    materials: []
  };

  // Add rich learning materials to Meeting 1
  if (num === 1) {
    meeting.materials = [
      {
        id: 'mat-mawaris-01',
        classId: 'cls-20261-pai301-a',
        meetingId: `mtg-pai301a-${pad}`,
        title: 'E-Modul: Pengantar Ilmu Mawaris, Kaidah Tirkah & Rukun Faraidh',
        description: 'E-Modul interaktif komprehensif mengupas tuntas ayat-ayat kewarisan Al-Qur\'an, hak atas harta tirkah, dan rukun pembagian waris.',
        type: 'MODUL_ONLINE',
        fileName: 'Modul_01_Pengantar_Fiqih_Mawaris.pdf',
        fileSizeBytes: 2450000,
        orderIndex: 1,
        status: 'DITERBITKAN',
        allowDownload: true,
        onlineModule: {
          author: 'Dr. H. M. Ridwan, M.Ag & Tim Keilmuan Syariah STAI AL-ITTIHAD',
          edition: 'Edisi Akademik 2026/2027',
          totalEstimatedMinutes: 25,
          learningOutcomes: [
            'Memahami urgensi ilmu faraidh/mawaris sebagai separuh ilmu agama yang mudah dilupakan manusia.',
            'Menjelaskan urutan prioritas 4 hak yang harus diselesaikan atas harta peninggalan (tirkah).',
            'Mengidentifikasi 3 rukun pokok pewarisan dalam Islam (muwarrits, warits, mauruts).',
            'Menelaah teks ayat-ayat kewarisan Al-Qur\'an dalam Surah An-Nisa.'
          ],
          chapters: [
            {
              id: 'ch-mwr-01',
              chapterNumber: 1,
              title: 'Hakikat, Definisi, dan Urgensi Menjaga Hukum Kewarisan Islam',
              estimatedMinutes: 6,
              content: `Ilmu Mawaris atau dikenal sebagai 'Ilmul Faraidh adalah disiplin ilmu fiqih yang mempelajari kaidah-kaidah penentuan pihak yang berhak menerima harta peninggalan, pihak yang tidak berhak, serta besaran bagian pasti (furudhul muqaddarah) yang diterima oleh masing-masing ahli waris secara adil dan terukur.\n\nKata Faraidh merupakan bentuk jamak dari kata Faridhah yang bermakna ketentuan yang diwajibkan oleh Allah SWT. Kedudukan hukum kewarisan dalam Islam sangat agung, karena pembagian porsi waris tidak diserahkan kepada kehendak manusia, melainkan langsung dirinci secara qath'iy oleh Allah Ta'ala di dalam Al-Qur'an.\n\nRasulullah SAW berpesan dalam hadits yang diriwayatkan oleh Imam Ibnu Majah dan Ad-Daruquthni:\n"Pelajarilah ilmu faraidh dan ajarkanlah kepada orang lain, karena sesungguhnya ia adalah separuh dari ilmu, dan ia adalah ilmu yang pertama kali akan dicabut dari umatku."`,
              keyTakeaways: [
                'Ilmu Mawaris menetapkan hak harta peninggalan berdasarkan nash qath\'i Al-Qur\'an demi mencegah persengketaan keluarga.',
                'Porsi bagian waris bersumber langsung dari ketetapan Allah (Al-Faraidhul Muqaddarah), bukan rekayasa manusia.'
              ],
              arabicQuotes: [
                {
                  arabicText: 'تَعَلَّمُوا الْفَرَائِضَ وَعَلِّمُوهَا النَّاسَ ، فَإِنَّهَا نِصْفُ الْعِلْمِ ، وَهُوَ يُنْسَى ، وَهُوَ أَوَّلُ شَيْءٍ يُنْزَعُ مِنْ أُمَّتِي',
                  translation: 'Pelajarilah faraidh dan ajarkanlah kepada manusia, karena sesungguhnya ia adalah separuh ilmu, dan ia mudah dilupakan, serta ia adalah perkara pertama yang dicabut dari umatku.',
                  source: 'HR. Ibnu Majah (No. 2719) dan Ad-Daruquthni (No. 4/67)'
                }
              ]
            },
            {
              id: 'ch-mwr-02',
              chapterNumber: 2,
              title: 'Empat Hak Terkait Harta Peninggalan (Huququt Tarikah)',
              estimatedMinutes: 7,
              content: `Sebelum harta peninggalan (tirkah) seseorang yang telah wafat dibagikan kepada para ahli waris, wajib hukumnya menyelesaikan empat hak secara berurutan sesuai hierarki prioritas syar'i:\n\n1. Biaya Pengurusan Jenazah (Tajhizul Janazah):\nSeluruh biaya pembelian kain kafan, pemandian, transportasi, dan pemakaman jenazah secara wajar (tanpa berlebih-lebihan dan tanpa kikir).\n\n2. Pelunasan Hutang Piutang (Qadha'ud Duyuun):\nHutang kepada sesama manusia (kredit, pinjaman, sewa) maupun hutang kepada Allah (zakat yang belum ditunaikan, kaffarah, nazar, badal haji).\n\n3. Penunaian Wasiat (Tanfizhul Washiyyah):\nWasiat almarhum kepada selain ahli waris dengan batas maksimal sepertiga (1/3) dari sisa harta setelah dikurangi biaya tajhiz dan pelunasan hutang.\n\n4. Pembagian Warisan kepada Ahli Waris (Qismatut Tarikah):\nSisa harta bersih setelah ketiga kewajiban di atas diselesaikan secara tuntas barulah dibagikan kepada ahli waris yang sah.`,
              keyTakeaways: [
                'Harta waris tidak boleh dibagi sebelum seluruh hutang piutang dan biaya pengurusan jenazah lunas tertunaikan.',
                'Wasiat almarhum dibatasi maksimal 1/3 harta dan tidak boleh diberikan kepada ahli waris penerima bagian tetap.'
              ],
              arabicQuotes: [
                {
                  arabicText: 'مِن بَعْدِ وَصِيَّةٍ يُوصِي بِهَا أَوْ دَيْنٍ ۗ آبَاؤُكُمْ وَأَبْنَاؤُكُمْ لَا تَدْرُونَ أَيُّهُمْ أَقْرَبُ لَكُمْ نَفْعًا ۚ فَرِيضَةً مِّنَ اللَّهِ',
                  translation: '...setelah dipenuhi wasiat yang dibuatnya atau (dan setelah dibayar) hutangnya. Tentang orang tuamu dan anak-anakmu, kamu tidak mengetahui siapa di antara mereka yang lebih dekat kepadamu manfaatnya. Ini adalah ketetapan dari Allah.',
                  source: 'QS. An-Nisa [4]: 11'
                }
              ]
            },
            {
              id: 'ch-mwr-03',
              chapterNumber: 3,
              title: 'Rukun, Syarat, dan Studi Kasus Pembagian Tirkah',
              estimatedMinutes: 7,
              content: `Rukun kewarisan Islam mencakup 3 pilar utama:\n1. Al-Muwarrits: Orang yang meninggal dunia dan meninggalkan harta peninggalan.\n2. Al-Warits: Orang yang berhak menerima warisan karena adanya sebab kekerabatan, pernikahan, atau wala\'.\n3. Al-Mauruts: Harta peninggalan bersih (tirkah) yang ditinggalkan almarhum.\n\nSyarat Pewarisan:\n- Kepastian wafatnya muwarrits (hakiki atau hukmi lewat putusan pengadilan).\n- Kepastian hidupnya warits saat muwarrits meninggal dunia.\n- Mengetahui arah hubungan nasab dan tidak adanya mawani'ul irtsi (pembunuhan, beda agama, perbudakan).`,
              keyTakeaways: [
                'Tiga rukun kewarisan: Muwarrits (yang wafat), Warits (ahli waris hidup), dan Mauruts (harta warisan bersih).',
                'Ketiadaan salah satu rukun atau adanya penghalang waris menggugurkan hak pembagian waris.'
              ],
              caseStudy: {
                title: 'Studi Kasus: Alokasi Harta Peninggalan Bapak Ahmad',
                scenario: 'Bapak Ahmad wafat meninggalkan total harta senilai Rp 300.000.000. Biaya pemakaman sebesar Rp 10.000.000. Almarhum memiliki sisa hutang perbankan Rp 50.000.000 dan berwasiat Rp 60.000.000 untuk panti asuhan.',
                analysisGuide: '1. Hitung sisa setelah tajhiz dan hutang: Rp 300 jt - (10 jt + 50 jt) = Rp 240.000.000.\n2. Cek batas wasiat maksimal: 1/3 x Rp 240 jt = Rp 80.000.000. Karena wasiat Rp 60 jt <= Rp 80 jt, wasiat dapat ditunaikan penuh.\n3. Harta bersih yang siap dibagi kepada ahli waris: Rp 240 jt - 60 jt = Rp 180.000.000.'
              }
            },
            {
              id: 'ch-mwr-04',
              chapterNumber: 4,
              title: 'Rangkuman Materi & Evaluasi Pembelajaran Pekan 1',
              estimatedMinutes: 5,
              content: `RANGKUMAN SESI 1:\n1. Fiqih Mawaris adalah pilar keadilan keluarga dalam syariat Islam untuk menjamin hak-hak yatim dan kerabat tertunaikan secara transparan.\n2. Menjaga hukum kewarisan adalah bentuk ketaatan mutlak terhadap batasan-batasan hukum Allah (Hududullah).\n\nPERSIAPAN SESI 2:\nPelajari sebab-sebab kewarisan dan rincian halangan waris (Mawani'ul Irtsi) untuk pertemuan pekan depan.`,
              keyTakeaways: [
                'Kuasai 4 hak atas harta tirkah sebelum melangkah ke perhitungan ashabul furudh.',
                'Diskusikan studi kasus perhitungan di forum kelas untuk pendalaman materi.'
              ]
            }
          ]
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      },
      {
        id: 'mat-mawaris-02',
        classId: 'cls-20261-pai301-a',
        meetingId: `mtg-pai301a-${pad}`,
        title: 'Slide Presentasi: Peta Konsep & Pengantar Fiqih Mawaris',
        description: 'Bahan tayang kuliah tatap muka pertemuan pertama: definisi, dasar hukum, 4 hak tirkah, dan rukun faraidh.',
        type: 'PRESENTASI',
        fileName: 'Slide_01_Pengantar_Fiqih_Mawaris.pptx',
        fileSizeBytes: 3850000,
        orderIndex: 2,
        status: 'DITERBITKAN',
        allowDownload: true,
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      },
      {
        id: 'mat-mawaris-03',
        classId: 'cls-20261-pai301-a',
        meetingId: `mtg-pai301a-${pad}`,
        title: 'Buku Ajar & Kitab Turats: Matan Ar-Rahabiyyah fi \'Ilmil Faraidh',
        description: 'Naskah klasik matan syair ilmu faraidh karya Imam Ar-Rahabi dilengkapi syarah kaidah hukum pembagian waris.',
        type: 'BUKU_ELEKTRONIK',
        fileName: 'Matan_Ar_Rahabiyyah_fi_Ilmil_Faraidh.pdf',
        fileSizeBytes: 4200000,
        orderIndex: 3,
        status: 'DITERBITKAN',
        allowDownload: true,
        onlineModule: {
          author: 'Imam Muhammad bin Ali Ar-Rahabi (W. 577 H)',
          edition: 'Tahqiq & Syarah Kontemporer 2026',
          totalEstimatedMinutes: 20,
          learningOutcomes: [
            'Menghafal bait-bait dasar matan Ar-Rahabiyyah tentang sebab pewarisan.',
            'Mengenal istilah-istilah klasik ulama faraidh dalam teks turats Arab.'
          ],
          chapters: [
            {
              id: 'ch-rhb-01',
              chapterNumber: 1,
              title: 'Mukaddimah Matan Ar-Rahabiyyah & Sebab-sebab Pewarisan',
              estimatedMinutes: 8,
              content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nأَسْبَابُ مِيرَاثِ الْوَرَى ثَلَاثَةُ ۝ كُلٌّ يُفِيدُ رَبَّهُ الْوِرَاثَةَ\nوَهْيَ نِكَاحٌ وَوَلَاءٌ وَنَسَبْ ۝ مَا بَعْدَهُنَّ لِلْمَوَارِيثِ سَبَبْ\n\nPenjelasan Syair:\nSebab-sebab hak kewarisan bagi manusia itu ada tiga, masing-masing memberikan faedah hak waris bagi pemiliknya, yaitu:\n1. Nikah: Ikatan pernikahan yang sah secara syar'i.\n2. Wala': Loyalitas pembebasan budak.\n3. Nasab: Hubungan kekeluargaan darah/kekerabatan.\nTidak ada sebab kewarisan lain di luar ketiga pilar utama tersebut.`,
              arabicQuotes: [
                {
                  arabicText: 'أَسْبَابُ مِيرَاثِ الْوَرَى ثَلَاثَةُ ۝ كُلٌّ يُفِيدُ رَبَّهُ الْوِرَاثَةَ : نِكَاحٌ وَوَلَاءٌ وَنَسَبْ',
                  translation: 'Sebab-sebab kewarisan manusia ada tiga, yaitu: Nikah, Wala\', dan Nasab.',
                  source: 'Matan Ar-Rahabiyyah, Bait 11-12'
                }
              ],
              keyTakeaways: [
                'Matan Ar-Rahabiyyah adalah rujukan emas para penuntut ilmu faraidh di seluruh dunia Islam.',
                'Tiga pilar hak kewarisan: Nikah, Nasab, dan Wala\'.'
              ]
            }
          ]
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      }
    ];
  }

  return meeting;
});

// =========================================================================
// SERVICE IMPLEMENTATION
// =========================================================================
class LearningService {
  constructor() {
    this.ensureSchemaVersion();
  }

  /**
   * Reset data dummy lama jika schema version diperbarui ke data riil SIAKAD
   */
  private ensureSchemaVersion(): void {
    try {
      const isLatest = localStorage.getItem(SCHEMA_VERSION_KEY);
      const rawMeetings = localStorage.getItem(MEETINGS_KEY);
      
      // Jika versi berbeda atau masih tersisa teks dummy Ushul Fiqih pada PAI-301, reset cache
      const hasOldDummy = rawMeetings && rawMeetings.includes('Ushul Fiqih') && rawMeetings.includes('cls-20261-pai301-a');

      if (isLatest !== 'true' || hasOldDummy) {
        localStorage.setItem(RPS_KEY, JSON.stringify(INITIAL_RPS_MAP));
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
        localStorage.setItem(SCHEMA_VERSION_KEY, 'true');
      }
    } catch {
      // Abaikan jika LocalStorage tidak tersedia
    }
  }

  /**
   * Mengambil Rencana Pembelajaran Semester (RPS) untuk kelas terkait
   */
  public getRPS(classId: string, classInfo?: AcademicClass | null): RPSSection {
    try {
      const data = localStorage.getItem(RPS_KEY);
      const map = data ? JSON.parse(data) : INITIAL_RPS_MAP;

      if (map[classId]) return map[classId];

      // Cek berdasarkan kode kelas atau kode mata kuliah
      if (classInfo) {
        const courseCode = classInfo.courseCode || '';
        if (courseCode.includes('PAI-301') || classInfo.courseName.toLowerCase().includes('mawaris')) {
          return map['cls-20261-pai301-a'] || INITIAL_RPS_MAP['cls-20261-pai301-a'];
        }
        if (courseCode.includes('PAI-202') || classInfo.courseName.toLowerCase().includes('muamalah')) {
          return map['cls-20261-pai202-a'] || INITIAL_RPS_MAP['cls-20261-pai202-a'];
        }
        if (courseCode.includes('PAI-101') || classInfo.courseName.toLowerCase().includes('ulumul')) {
          return map['cls-20261-pai101-a'] || INITIAL_RPS_MAP['cls-20261-pai101-a'];
        }
        if (courseCode.includes('MKU-101') || classInfo.courseName.toLowerCase().includes('bahasa arab dasar')) {
          return map['cls-20261-mku101-a'] || INITIAL_RPS_MAP['cls-20261-mku101-a'];
        }
        if (courseCode.includes('STAIPD213') || classInfo.courseName.toLowerCase().includes('bahasa arab ii')) {
          return map['cls-staipd213-pd2'] || INITIAL_RPS_MAP['cls-staipd213-pd2'];
        }
      }

      // Alias lookup
      if (classId === 'cls-pai301-a' || classId === '1') {
        return map['cls-20261-pai301-a'] || INITIAL_RPS_MAP['cls-20261-pai301-a'];
      }
      if (classId === 'cls-20261-pai202-a' || classId === '4') {
        return map['cls-20261-pai202-a'] || INITIAL_RPS_MAP['cls-20261-pai202-a'];
      }

      // Bangun template dinamis berdasarkan info mata kuliah riil jika ada
      if (classInfo) {
        const generatedRps: RPSSection = {
          description: `Rencana Pembelajaran Semester (RPS) mata kuliah ${classInfo.courseName || classInfo.name} (${classInfo.courseCode || classInfo.code}, ${classInfo.credits} SKS) Program Studi ${classInfo.studyProgramCode}, STAI Al-Ittihad Cianjur.`,
          learningOutcomes: [
            `Mampu memahami konsep dasar dan ruang lingkup kajian ${classInfo.courseName || classInfo.name}.`,
            `Mampu menganalisis metodologi, teori keilmuan, dan studi kasus terapan ${classInfo.courseName || classInfo.name}.`,
            `Mampu mengintegrasikan nilai-nilai keislaman dan etika akademik dalam pemecahan masalah.`,
            `Mampu menyusun laporan analisis terstruktur dan mempresentasikannya secara ilmiah.`
          ],
          teachingMethods: [
            'Kuliah Interaktif & Diskusi Kelas',
            'Studi Kasus Tematik (Case-Based Learning)',
            'Pembelajaran Berbasis Video & Modul Daring',
            'Tugas Analisis Literatur & Presentasi Kelompok'
          ],
          assessmentWeights: [
            { component: 'Kehadiran & Partisipasi Diskusi', weightPercentage: 15 },
            { component: 'Tugas Mandiri & Terstruktur', weightPercentage: 25 },
            { component: 'Kuis & Evaluasi Pertemuan', weightPercentage: 15 },
            { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
            { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
          ],
          references: [
            { title: `Buku Rujukan Utama ${classInfo.courseName || classInfo.name}`, author: classInfo.lecturerName || 'Dosen Pengampu', year: 2025, isPrimary: true },
            { title: 'Kompilasi Studi & Panduan Akademik STAI Al-Ittihad', author: 'Tim Dosen STAI AL-ITTIHAD', year: 2026, isPrimary: false }
          ],
          documentAttachmentName: `RPS_Resmi_${(classInfo.courseCode || 'MK').replace(/[^a-zA-Z0-9]/g, '_')}_2026.pdf`,
          documentAttachmentUrl: '#',
          updatedAt: new Date().toISOString()
        };
        return generatedRps;
      }

      return INITIAL_RPS_MAP['cls-20261-pai301-a'];
    } catch {
      return INITIAL_RPS_MAP['cls-20261-pai301-a'];
    }
  }

  public updateRPS(classId: string, rps: RPSSection): void {
    try {
      const data = localStorage.getItem(RPS_KEY);
      const map = data ? JSON.parse(data) : { ...INITIAL_RPS_MAP };
      map[classId] = { ...rps, updatedAt: new Date().toISOString() };
      localStorage.setItem(RPS_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('Gagal menyimpan RPS:', e);
    }
  }

  public deleteRPS(classId: string): void {
    try {
      const data = localStorage.getItem(RPS_KEY);
      const map = data ? JSON.parse(data) : { ...INITIAL_RPS_MAP };
      delete map[classId];
      localStorage.setItem(RPS_KEY, JSON.stringify(map));
    } catch (e) {
      console.warn('Gagal menghapus RPS:', e);
    }
  }

  /**
   * Mengambil pertemuan untuk kelas terkait dengan data riil kurikulum
   */
  public getMeetingsByClass(classId: string, isStudent = false, classInfo?: AcademicClass | null): CourseMeeting[] {
    const allStored = this.getMeetingsData();

    // Normalisasi pencocokan classId
    const validClassIds = new Set<string>([classId]);
    if (classId === 'cls-20261-pai301-a' || classId === 'cls-pai301-a' || classId === '1') {
      validClassIds.add('cls-20261-pai301-a');
      validClassIds.add('cls-pai301-a');
      validClassIds.add('1');
    }
    if (classInfo) {
      validClassIds.add(classInfo.id);
      validClassIds.add(classInfo.code);
      if (classInfo.externalId) validClassIds.add(classInfo.externalId);
    }

    let matches = allStored.filter((m) => validClassIds.has(m.classId));

    // Jika kelas belum memiliki data pertemuan tersimpan, buat 16 sesi kurikulum riil
    if (matches.length === 0) {
      const courseCode = classInfo?.courseCode || (classId.includes('pai301') ? 'PAI-301' : classId.includes('pai202') ? 'PAI-202' : classId.includes('pai101') ? 'PAI-101' : classId.includes('mku101') ? 'MKU-101' : 'PAI-301');
      const syllabusTemplate = SYLLABUS_CATALOG[courseCode];

      let generated: CourseMeeting[] = [];

      if (syllabusTemplate && syllabusTemplate.length > 0) {
        generated = syllabusTemplate.map((item) => {
          const num = item.week;
          const pad = num < 10 ? `0${num}` : `${num}`;
          const startDate = new Date(2026, 8, 7);
          const meetingDate = new Date(startDate.getTime() + (num - 1) * 7 * 24 * 60 * 60 * 1000);
          const dateStr = meetingDate.toISOString().split('T')[0];

          return {
            id: `mtg-${classId}-${pad}`,
            classId: classId,
            meetingNumber: num,
            title: `Pertemuan #${num}: ${item.title}`,
            topic: item.topic,
            description: item.description,
            scheduledDate: dateStr,
            startTime: classInfo?.schedules[0]?.startTime || '08:00',
            endTime: classInfo?.schedules[0]?.endTime || '09:40',
            orderIndex: num,
            status: 'DITERBITKAN',
            publishedAt: '2026-09-01T08:00:00Z',
            materials: []
          };
        });
      } else {
        // Fallback 16 sesi berstruktur akademis
        generated = Array.from({ length: 16 }, (_, idx) => {
          const num = idx + 1;
          const pad = num < 10 ? `0${num}` : `${num}`;
          const startDate = new Date(2026, 8, 7);
          const meetingDate = new Date(startDate.getTime() + (num - 1) * 7 * 24 * 60 * 60 * 1000);
          const dateStr = meetingDate.toISOString().split('T')[0];

          const courseName = classInfo?.courseName || classInfo?.name || 'Mata Kuliah';
          const isUts = num === 8;
          const isUas = num === 16;

          return {
            id: `mtg-${classId}-${pad}`,
            classId: classId,
            meetingNumber: num,
            title: isUts 
              ? 'Ujian Tengah Semester (UTS)' 
              : isUas 
              ? 'Ujian Akhir Semester (UAS)' 
              : `Pertemuan #${num}: Kajian Topik Pokok Bahasan Ke-${num}`,
            topic: isUts 
              ? `Evaluasi Capaian Pembelajaran Sesi 1–7 ${courseName}` 
              : isUas 
              ? `Evaluasi Komprehensif Semester Ganjil ${courseName}` 
              : `Rencana Pembelajaran Semester (RPS) Sesi ${num} — ${courseName}`,
            description: isUts 
              ? `Ujian evaluasi tengah semester untuk mengukur pemahaman teori dan kompetensi mahasiswa pada materi sesi 1 sampai 7.`
              : isUas 
              ? `Evaluasi akhir semester untuk menguji penguasaan materi secara menyeluruh selama satu semester perkuliahan.`
              : `Pemaparan teori, telaah literatur turats/kontemporer, diskusi studi kasus, dan evaluasi capaian materi pertemuan ke-${num}.`,
            scheduledDate: dateStr,
            startTime: classInfo?.schedules[0]?.startTime || '08:00',
            endTime: classInfo?.schedules[0]?.endTime || '09:40',
            orderIndex: num,
            status: 'DITERBITKAN',
            publishedAt: new Date().toISOString(),
            materials: []
          };
        });
      }

      allStored.push(...generated);
      this.saveMeetingsData(allStored);
      matches = generated;
    }

    if (isStudent) {
      return matches
        .filter((m) => m.status === 'DITERBITKAN')
        .map((m) => ({
          ...m,
          materials: m.materials.filter((mat) => mat.status === 'DITERBITKAN')
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return matches.sort((a, b) => a.orderIndex - b.orderIndex);
  }

  public getMeetingById(meetingId: string): CourseMeeting | undefined {
    return this.getMeetingsData().find((m) => m.id === meetingId);
  }

  public createMeeting(meetingData: Omit<CourseMeeting, 'id' | 'materials'>): CourseMeeting {
    const all = this.getMeetingsData();
    const newMeeting: CourseMeeting = {
      ...meetingData,
      id: `mtg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      materials: []
    };

    all.push(newMeeting);
    this.saveMeetingsData(all);
    return newMeeting;
  }

  public updateMeeting(meetingId: string, updates: Partial<CourseMeeting>): CourseMeeting {
    const all = this.getMeetingsData();
    const index = all.findIndex((m) => m.id === meetingId);
    if (index === -1) throw new Error('Pertemuan tidak ditemukan');

    all[index] = {
      ...all[index],
      ...updates
    };

    this.saveMeetingsData(all);
    return all[index];
  }

  public deleteMeeting(meetingId: string): void {
    const all = this.getMeetingsData().filter((m) => m.id !== meetingId);
    this.saveMeetingsData(all);
  }

  public addMaterial(
    meetingId: string, 
    material: Omit<LearningMaterial, 'id' | 'createdAt' | 'updatedAt'>
  ): LearningMaterial {
    const all = this.getMeetingsData();
    const meeting = all.find((m) => m.id === meetingId);
    if (!meeting) throw new Error('Pertemuan tidak ditemukan');

    const now = new Date().toISOString();
    const newMat: LearningMaterial = {
      ...material,
      id: `mat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    meeting.materials.push(newMat);
    this.saveMeetingsData(all);
    return newMat;
  }

  public updateMaterial(
    meetingId: string, 
    materialId: string, 
    updates: Partial<LearningMaterial>
  ): LearningMaterial {
    const all = this.getMeetingsData();
    const meeting = all.find((m) => m.id === meetingId);
    if (!meeting) throw new Error('Pertemuan tidak ditemukan');

    const matIndex = meeting.materials.findIndex((mat) => mat.id === materialId);
    if (matIndex === -1) throw new Error('Materi tidak ditemukan');

    meeting.materials[matIndex] = {
      ...meeting.materials[matIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveMeetingsData(all);
    return meeting.materials[matIndex];
  }

  public deleteMaterial(meetingId: string, materialId: string): void {
    const all = this.getMeetingsData();
    const meeting = all.find((m) => m.id === meetingId);
    if (!meeting) return;

    meeting.materials = meeting.materials.filter((mat) => mat.id !== materialId);
    this.saveMeetingsData(all);
  }

  /**
   * PENCATATAN AKSES MATERI (Event tracking untuk completion engine)
   */
  public logMaterialAccess(
    materialId: string,
    meetingId: string,
    classId: string,
    studentId: string,
    studentNim: string,
    studentName: string,
    durationSeconds = 60
  ): MaterialAccessLog {
    const now = new Date().toISOString();
    const logs: MaterialAccessLog[] = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');

    let log = logs.find((l) => l.materialId === materialId && l.studentId === studentId);
    if (!log) {
      log = {
        id: `access-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        materialId,
        meetingId,
        classId,
        studentId,
        studentNim,
        studentName,
        firstAccessedAt: now,
        lastAccessedAt: now,
        accessCount: 1,
        totalDurationSeconds: durationSeconds
      };
      logs.push(log);
    } else {
      log.lastAccessedAt = now;
      log.accessCount += 1;
      log.totalDurationSeconds += durationSeconds;
    }

    localStorage.setItem(ACCESS_LOGS_KEY, JSON.stringify(logs));
    return log;
  }

  public getMaterialAccessLogs(studentId?: string, classId?: string): MaterialAccessLog[] {
    const logs: MaterialAccessLog[] = JSON.parse(localStorage.getItem(ACCESS_LOGS_KEY) || '[]');
    return logs.filter((l) => {
      const matchStudent = !studentId || l.studentId === studentId;
      const matchClass = !classId || l.classId === classId;
      return matchStudent && matchClass;
    });
  }

  /**
   * PENGELOLAAN CATATAN BELAJAR MAHASISWA PADA MODUL ONLINE
   */
  public getModuleNotes(materialId: string, studentId: string): ModuleNote[] {
    try {
      const raw = localStorage.getItem(MODULE_NOTES_KEY);
      const notes: ModuleNote[] = raw ? JSON.parse(raw) : [];
      return notes.filter((n) => n.materialId === materialId && n.studentId === studentId);
    } catch {
      return [];
    }
  }

  public saveModuleNote(note: Omit<ModuleNote, 'id' | 'createdAt' | 'updatedAt'>): ModuleNote {
    const raw = localStorage.getItem(MODULE_NOTES_KEY);
    const notes: ModuleNote[] = raw ? JSON.parse(raw) : [];
    const now = new Date().toISOString();

    const newNote: ModuleNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now,
      updatedAt: now
    };

    notes.unshift(newNote);
    localStorage.setItem(MODULE_NOTES_KEY, JSON.stringify(notes));
    return newNote;
  }

  public deleteModuleNote(noteId: string): void {
    const raw = localStorage.getItem(MODULE_NOTES_KEY);
    if (!raw) return;
    const notes: ModuleNote[] = JSON.parse(raw);
    const filtered = notes.filter((n) => n.id !== noteId);
    localStorage.setItem(MODULE_NOTES_KEY, JSON.stringify(filtered));
  }

  private getMeetingsData(): CourseMeeting[] {
    try {
      const data = localStorage.getItem(MEETINGS_KEY);
      return data ? JSON.parse(data) : INITIAL_MEETINGS;
    } catch {
      return INITIAL_MEETINGS;
    }
  }

  private saveMeetingsData(meetings: CourseMeeting[]): void {
    try {
      localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
    } catch (e) {
      console.warn('Gagal menyimpan pertemuan:', e);
    }
  }
}

export const learningService = new LearningService();
