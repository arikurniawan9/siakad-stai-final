import { 
  RPSSection, 
  CourseMeeting, 
  LearningMaterial, 
  MaterialAccessLog,
  ModuleNote
} from '../types/learning';

const MEETINGS_KEY = 'salam_course_meetings';
const RPS_KEY = 'salam_course_rps';
const ACCESS_LOGS_KEY = 'salam_material_access_logs';
const MODULE_NOTES_KEY = 'salam_module_student_notes';

export const INITIAL_RPS_MAP: Record<string, RPSSection> = {
  'cls-pai301-a': {
    description: 'Mata kuliah Ushul Fiqih membekali mahasiswa dengan pemahaman mendalam tentang kaidah-kaidah pengambilan hukum Islam dari dalil-dalil syar\'i (Al-Qur\'an, As-Sunnah, Ijma\', dan Qiyas) serta aplikasinya dalam problematika kontemporer.',
    learningOutcomes: [
      'Mampu menganalisis sumber-sumber hukum Islam primer dan sekunder.',
      'Mampu menerapkan kaidah kebahasaan (Amar, Nahyi, \'Am, Khas, Mujmal, Mubayyan) dalam istinbath hukum.',
      'Mampu mendudukkan metodologi ijtihad ulama madzhab dalam memecahkan isu fiqih kontemporer.',
      'Memiliki integritas dan sikap moderat dalam menyikapi perbedaan pendapat furu\'iyyah.'
    ],
    teachingMethods: [
      'Kuliah Interaktif & Diskusi Kelas',
      'Pembelajaran Berbasis Video Interaktif',
      'Studi Kasus Fiqih Kontemporer (Case-Based Learning)',
      'Tugas Analisis Literatur Kitab Turats'
    ],
    assessmentWeights: [
      { component: 'Kehadiran & Partisipasi Diskusi', weightPercentage: 15 },
      { component: 'Tugas & Analisis Kasus', weightPercentage: 25 },
      { component: 'Kuis & Video Interaktif', weightPercentage: 15 },
      { component: 'Ujian Tengah Semester (UTS)', weightPercentage: 20 },
      { component: 'Ujian Akhir Semester (UAS)', weightPercentage: 25 },
    ],
    references: [
      { title: 'Al-Mustashfa min \'Ilm al-Ushul', author: 'Imam Al-Ghazali', year: 2018, isPrimary: true },
      { title: 'Ushul al-Fiqh al-Islami', author: 'Prof. Dr. Wahbah Az-Zuhaili', year: 2020, isPrimary: true },
      { title: 'Kaidah-Kaidah Fiqih dan Ushul Fiqih Kontemporer', author: 'Dr. H. M. Ridwan, M.Ag', year: 2024, isPrimary: false }
    ],
    documentAttachmentUrl: '#',
    documentAttachmentName: 'RPS_Ushul_Fiqih_PAI301_2026.pdf',
    updatedAt: new Date().toISOString()
  }
};

export const INITIAL_MEETINGS: CourseMeeting[] = [
  {
    id: 'mtg-pai301a-01',
    classId: 'cls-pai301-a',
    meetingNumber: 1,
    title: 'Kontrak Belajar & Pengantar Ilmu Ushul Fiqih',
    topic: 'Definisi, Objek Kajian, dan Urgensi Ushul Fiqih bagi Akademisi Muslim',
    description: 'Orientasi perkuliahan satu semester, pengenalan RPS, pemahaman perbedaan antara Fiqih dan Ushul Fiqih, serta peta konsep metode penetapan hukum.',
    scheduledDate: '2026-09-07',
    startTime: '08:00',
    endTime: '10:30',
    orderIndex: 1,
    status: 'DITERBITKAN',
    publishedAt: '2026-09-01T08:00:00Z',
    materials: [
      {
        id: 'mat-01-01',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-01',
        title: 'Modul Pembelajaran Daring: Konsep Dasar & Metodologi Ushul Fiqih',
        description: 'E-Modul interaktif lengkap 4 bab dengan kutipan turats, perbandingan mazhab, dan studi kasus kontemporer.',
        type: 'MODUL_ONLINE',
        fileName: 'Modul_01_Konsep_Ushul_Fiqih.pdf',
        fileSizeBytes: 2450000,
        orderIndex: 1,
        status: 'DITERBITKAN',
        allowDownload: true,
        onlineModule: {
          author: 'Tim Dosen Keislaman & Ushul Fiqih STAI AL-ITTIHAD',
          edition: 'Edisi Akademik 2026/2027',
          totalEstimatedMinutes: 25,
          learningOutcomes: [
            'Memahami definisi etimologi dan terminologi Ushul Fiqih',
            'Menjelaskan perbedaan mendasar Fiqih (produk) dan Ushul Fiqih (metodologi)',
            'Mengidentifikasi dalil primer (Al-Qur\'an, Sunnah, Ijma\', Qiyas) dan sekunder'
          ],
          chapters: [
            {
              id: 'ch-01-01',
              chapterNumber: 1,
              title: 'Hakikat, Definisi, dan Ruang Lingkup Ushul Fiqih',
              estimatedMinutes: 6,
              content: `Ushul Fiqih secara kebahasaan merupakan susunan tarkib idlafi dari dua kata: Al-Ashl (الأصل) yang bermakna pondasi atau landasan pijak yang menjadi dasar bangunan lain, dan Al-Fiqh (الفقه) yang berarti pemahaman mendalam terhadap suatu perkara.\n\nSecara terminologi menurut jumhur ulama ushuliyyin, Ushul Fiqih didefinisikan sebagai ilmu mengenai kaidah-kaidah umum dan metode penggalian (istinbath) hukum-hukum syara' yang bersifat praktis ('amaliyyah) dari dalil-dalilnya yang terperinci (tafshiliyyah).\n\nPerbedaan fundamental antara Fiqih dan Ushul Fiqih:\n1. Fiqih adalah kumpulan hukum syar'i hasil ijtihad (misal: shalat fardhu hukumnya wajib, jual beli kredit hukumnya mubah).\n2. Ushul Fiqih adalah rumus, timbangan metodologis, dan kaidah-kaidah analisis yang digunakan mujtahid untuk menghasilkan ketetapan hukum fiqih tersebut.\n3. Dengan perumpamaan analogis: Jika Fiqih adalah buah atau hasil panen, maka Ushul Fiqih adalah akar pohon, pohon pengetahuan, dan alat panennya.`,
              keyTakeaways: [
                'Ushul Fiqih adalah metodologi perumusan hukum syar\'i (Ushul = pondasi kaidah, Fiqih = hukum terapan).',
                'Fiqih membahas perbuatan mukallaf, sedangkan Ushul Fiqih membahas dalil dan cara istinbath hukum dari dalil.'
              ],
              arabicQuotes: [
                {
                  arabicText: 'العِلْمُ بِالأَحْكَامِ الشَّرْعِيَّةِ العَمَلِيَّةِ المُكْتَسَبَةِ مِنْ أَدِلَّتِهَا التَّفْصِيلِيَّةِ',
                  translation: 'Ilmu tentang hukum-hukum syari\'at yang bersifat praktis yang diperoleh dari dalil-dalilnya yang terperinci.',
                  source: 'Imam Al-Baidhawi, Minhaj al-Wushul fi \'Ilm al-Ushul'
                }
              ]
            },
            {
              id: 'ch-01-02',
              chapterNumber: 2,
              title: 'Landasan Dalil Syar\'i & Sejarah Kodifikasi Kitab Turats',
              estimatedMinutes: 7,
              content: `Pada masa Rasulullah SAW, seluruh persoalan hukum diselesaikan langsung melalui wahyu Al-Qur'an dan bimbingan sabda Nabi. Pada era Sahabat dan Tabi'in, kaidah ushul fiqih telah digunakan secara intuitif (malakah fiqhiyyah) tanpa dibukukan ke dalam tulisan formal.\n\nMemasuki abad ke-2 Hijriyah, seiring meluasnya wilayah Islam dan timbulnya perbedaan antara Madrasah Ahli Hadits di Hijaz dan Madrasah Ahli Ra'yi di Irak, Imam Muhammad bin Idris Asy-Syafi'i (150-204 H) menyusun kitab rujukan ushul fiqih pertama di dunia Islam, yaitu Kitab Ar-Risalah.\n\nDalam perkembangannya, penulisan ushul fiqih terbagi menjadi dua metode utama (Thariqah):\n1. Thariqah Mutakallimin (Syafi'iyyah/Malikiyyah/Hanabilah): Menetapkan kaidah berdasarkan logika dalil tanpa terikat pada furu' mazhab tertentu.\n2. Thariqah Fuqaha (Hanafiyyah): Menyusun kaidah ushul berdasarkan keputusan fatwa furu' para imam madzhab terdahulu.`,
              keyTakeaways: [
                'Kitab Ar-Risalah karya Imam Asy-Syafi\'i adalah tonggak pertama kodifikasi metodologi ushul fiqih secara sistematis.',
                'Dua thariqah utama penulisan ushul fiqih: Thariqah Mutakallimin (Teoretis-Murni) dan Thariqah Fuqaha (Deduktif Furu\').'
              ],
              arabicQuotes: [
                {
                  arabicText: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ ۖ فَإِن تَنَازَعْتُمْ فِي شَيْءٍ فَرُدُّوهُ إِلَى اللَّهِ وَالرَّسُولِ',
                  translation: 'Wahai orang-orang yang beriman! Taatilah Allah dan taatilah Rasul, dan Ulil Amri di antara kamu. Kemudian jika kamu berbeda pendapat tentang sesuatu, maka kembalikanlah ia kepada Allah (Al-Qur\'an) dan Rasul (Sunnah).',
                  source: 'QS. An-Nisa [4]: 59 (Landasan Hierarki Sumber Hukum Islam)'
                }
              ]
            },
            {
              id: 'ch-01-03',
              chapterNumber: 3,
              title: 'Objek Kajian, Klasifikasi Adillah & Metodologi Istinbath',
              estimatedMinutes: 7,
              content: `Objek kajian ushul fiqih mencakup 4 rukun utama (Mabahits Ushuliyyah):\n\n1. Adillah Syar'iyyah (Sumber-Sumber Hukum):\n   - Adillah Muttafaq 'Alaiha (Disepakati): Al-Qur'an, As-Sunnah, Al-Ijma', Al-Qiyas.\n   - Adillah Mukhtalaf Fiha (Diperselisihkan): Istihsan, Maslahah Mursalah, 'Urf, Istish-hab, Saddudz Dzara'i, Syar'u Man Qablana, Qaul Sahabi.\n\n2. Al-Hukmu Asy-Syar'i (Hukum Syar'i):\n   - Taklifi (Wajib, Sunnah/Mandub, Haram, Makruh, Mubah)\n   - Wadh'i (Sebab, Syarat, Mani'/Penghalang, Shah, Bathil)\n\n3. Al-Qawa'id Al-Lughawiyyah (Kaidah Kebahasaan):\n   - 'Am dan Khas, Muthlaq dan Muqayyad, Amar dan Nahyi, Mantunq dan Mafhum.\n\n4. Al-Ijtihad wa At-Taqlid:\n   - Kriteria Mujtahid, Syarat Fatwa, Kaidah Ta'arudl al-Adillah (Pertentangan Dalil), dan Tarjih.`,
              keyTakeaways: [
                'Empat pilar utama kajian ushul fiqih: Sumber Dalil, Kaidah Bahasa/Istinbath, Klasifikasi Hukum, dan Teori Ijtihad/Tarjih.',
                'Ijma\' dan Qiyas bertindak sebagai instrumen dinamis untuk menjawab tantangan zaman.'
              ],
              caseStudy: {
                title: 'Transaksi Pembayaran Digital (E-Wallet) dan Cashback',
                scenario: 'Di era digital, mahasiswa menggunakan dompet digital yang memberikan saldo bonus berupa cashback 20% setiap kali melakukan deposit uang. Apakah transaksi ini termasuk riba qardh ataukah akad ji\'alah / hibah muqayyadah?',
                analysisGuide: 'Gunakan pendekatan kaidah ushul: "Al-Ashlu fil mu\'amalati al-ibahah hatta yadulla ad-dalilu \'ala tahrimiha" dan telusuri sifat akad pokok antara pengguna dengan penyedia jasa pembayaran digital.'
              }
            },
            {
              id: 'ch-01-04',
              chapterNumber: 4,
              title: 'Rangkuman, Glosarium Fiqhiyyah & Evaluasi Pembelajaran',
              estimatedMinutes: 5,
              content: `RANGKUMAN SESI:\n1. Ushul Fiqih adalah kompas metodologis intelektual muslim untuk memastikan pemahaman teks wahyu tetap murni, terarah, dan adaptif.\n2. Kedudukan Ushul Fiqih mencegah sikap taklid buta dan menghadirkan keterbukaan fikih yang bijaksana di tengah keragaman masyarakat.\n\nGLOSARIUM PENTING:\n• Istinbath: Penarikan kesimpulan hukum dari dalil-dalil nash.\n• Mukallaf: Orang yang telah baligh, berakal, dan layak menerima beban hukum syariat.\n• Qath'iyud Dilalah: Teks nash yang maknanya pasti, tegas, dan tidak mengandung multitafsir.\n• Zhanniyud Dilalah: Teks nash yang memiliki ruang penafsiran atau interpretasi ganda.\n\nREFLEKSI MANDIRI:\nRenungkan bagaimana kaidah ushul fiqih mampu menjaga syari'at Islam tetap relevan sepanjang masa (shalihun li kulli zaman wa makan).`,
              keyTakeaways: [
                'Ushul Fiqih menghindarkan akademisi dari ketergelinciran dalam memahami dalil agama.',
                'Siapkan diri untuk mempelajari Kaidah Kebahasaan (Lughawiyyah) pada pertemuan berikutnya.'
              ]
            }
          ]
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      },
      {
        id: 'mat-01-02',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-01',
        title: 'Slide Presentasi: Peta Konsep Ushul Fiqih vs Fiqih',
        description: 'Materi tayang pengantar kuliah pertemuan pertama.',
        type: 'PRESENTASI',
        fileName: 'Slide_Pengantar_Ushul_Fiqih.pptx',
        fileSizeBytes: 4100000,
        orderIndex: 2,
        status: 'DITERBITKAN',
        allowDownload: true,
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      },
      {
        id: 'mat-01-03',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-01',
        title: 'Buku Ajar & Kitab Turats: Matan Al-Waraqat fi Ushulil Fiqh',
        description: 'Kitab rujukan klasik dasar ushul fiqih karya Imam Al-Haramain Al-Juwaini dilengkapi terjemahan dan syarah kaidah.',
        type: 'BUKU_ELEKTRONIK',
        fileName: 'Matan_Al_Waraqat_Al_Juwaini.pdf',
        fileSizeBytes: 3800000,
        orderIndex: 3,
        status: 'DITERBITKAN',
        allowDownload: true,
        onlineModule: {
          author: 'Imam Al-Haramain Abul Ma\'ali Al-Juwaini (W. 478 H)',
          edition: 'Tahqiq & Syarah Kontemporer 2026',
          totalEstimatedMinutes: 30,
          learningOutcomes: [
            'Menghafal dan memahami matan kaidah pembagian ilmu Ushul Fiqih',
            'Menelaah definisi hukum taklifi dan hukum wadh\'i dalam teks Arab klasik',
            'Mengenal ragam metode pendalilan amar, nahyi, dan qiyas syar\'i'
          ],
          chapters: [
            {
              id: 'ch-waraqat-01',
              chapterNumber: 1,
              title: 'Muqaddimah & Definisi Mabadi\' Ushul Fiqih',
              estimatedMinutes: 8,
              content: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n\nهَذِهِ وَرَقَاتٌ تَشْتَمِلُ عَلَى مَعْرِفَةِ فُصُولٍ مِنْ أُصُولِ الْفِقْهِ. وَذَلِكَ مُؤَلَّفٌ مِنْ جُزْأَيْنِ مُفْرَدَيْنِ: فَالْأَصْلُ مَا يُبْنَى عَلَيْهِ غَيْرُهُ، وَالْفِقْهُ مَعْرِفَةُ الْأَحْكَامِ الشَّرْعِيَّةِ الَّتِي طَرِيقُهَا الِاجْتِهَادُ.\n\nPenjelasan Syarah:\nImam Al-Juwaini memulai kitab Al-Waraqat dengan menguraikan dua rukun istilah pembentuk Ushul Fiqih: Al-Ashl (dasar pondasi) dan Al-Fiqh (pengetahuan hukum syar'i hasil ijtihad). Kitab ringkas ini menjadi pedoman utama penuntut ilmu di berbagai universitas Islam dunia.`,
              arabicQuotes: [
                {
                  arabicText: 'فَالْأَصْلُ مَا يُبْنَى عَلَيْهِ غَيْرُهُ ، وَالْفَرْعُ مَا يُبْنَى عَلَى غَيْرِهِ',
                  translation: 'Pondasi (Al-Ashl) adalah apa yang dibangun di atasnya selainnya, sedangkan cabang (Al-Far\'u) adalah apa yang dibangun di atas selainnya.',
                  source: 'Matan Al-Waraqat, Fashl al-Mabadi'
                }
              ],
              keyTakeaways: [
                'Al-Waraqat adalah matan turats paling muktamad dalam madzhab Syafi\'iyyah untuk pemula.',
                'Fiqih dibatasi pada pengetahuan hukum yang dicapai melalui jalur ijtihad mujtahid.'
              ]
            },
            {
              id: 'ch-waraqat-02',
              chapterNumber: 2,
              title: 'Pembagian Tujuh Kategori Hukum Syara\'',
              estimatedMinutes: 10,
              content: `وَالْأَحْكَامُ سَبْعَةٌ: الْوَاجِبُ، وَالْمَنْدُوبُ، وَالْمُبَاحُ، وَالْمَحْظُورُ (الْحَرَامُ)، وَالْمَكْرُوهُ، وَالصَّحِيحُ، وَالْبَاطِلُ.\n\nفَالْوَاجِبُ: مَا يُثَابُ عَلَى فِعْلِهِ وَيُعَاقَبُ عَلَى تَرْكِهِ.\nوَالْمَنْدُوبُ: مَا يُثَابُ عَلَى فِعْلِهِ وَلَا يُعَاقَبُ عَلَى تَرْكِهِ.\nوَالْمُبَاحُ: مَا لَا يُثَابُ عَلَى فِعْلِهِ وَلَا يُعَاقَبُ عَلَى تَرْكِهِ.\nوَالْمَحْظُورُ: مَا يُثَابُ عَلَى تَرْكِهِ وَيُعَاقَبُ عَلَى فِعْلِهِ.\nوَالْمَكْرُوهُ: مَا يُثَابُ عَلَى تَرْكِهِ وَلَا يُعَاقَبُ عَلَى فِعْلِهِ.\nوَالصَّحِيحُ: مَا يَتَعَلَّقُ بِهِ النُّفُوذُ وَيُعْتَدُّ بِهِ.\nوَالْبَاطِلُ: مَا لَا يَتَعَلَّقُ بِهِ النُّفُوذُ وَلَا يُعْتَدُّ بِهِ.`,
              arabicQuotes: [
                {
                  arabicText: 'فَالْوَاجِبُ مَا يُثَابُ عَلَى فِعْلِهِ وَيُعَاقَبُ عَلَى تَرْكِهِ امتِثَالاً',
                  translation: 'Wajib adalah perbuatan yang pelakunya diberi pahala dan yang meninggalkannya berhak disiksa karena melanggar perintah.',
                  source: 'Matan Al-Waraqat, Bab Ahkam'
                }
              ],
              keyTakeaways: [
                'Tujuh kategori hukum dalam Al-Waraqat menggabungkan lima hukum taklifi dan dua hukum wadh\'i utama (Shah & Bathil).',
                'Kriteria sah (shahih) bergantung pada keterpenuhan rukun dan syarat serta ketiadaan mani\'.'
              ]
            },
            {
              id: 'ch-waraqat-03',
              chapterNumber: 3,
              title: 'Kaidah Amar, Nahyi, dan Metodologi Qiyas',
              estimatedMinutes: 12,
              content: `وَأَمَّا الْأَمْرُ فَهُوَ اسْتِدْعَاءُ الْفِعْلِ بِالْقَوْلِ مِمَّنْ هُوَ دُونَهُ عَلَى سَبِيلِ الْوُجُوبِ. وَصِيغَتُهُ: افْعَلْ.\n\nوَأَمَّا الْقِيَاسُ فَهُوَ رَدُّ الْفَرْعِ إِلَى الْأَصْلِ فِي حُكْمٍ لِعِلَّةٍ تَجْمَعُهُمَا فِي الْحُكْمِ.\n\nKajian Qiyas memuat 4 rukun pokok:\n1. Al-Ashl (Kasus rujukan primer yang ada nashnya, misal: Khamr).\n2. Al-Far'u (Kasus baru yang belum ada nash spesifik, misal: Narkotika sintetis).\n3. Hukmul Ashl (Ketetapan hukum pada ashl, misal: Haram).\n4. Al-'Illah (Sifat persamaan motif hukum, misal: Memabukkan dan merusak akal / Iskār).`,
              arabicQuotes: [
                {
                  arabicText: 'وَالْقِيَاسُ رَدُّ الْفَرْعِ إِلَى الْأَصْلِ لِعِلَّةٍ تَجْمَعُهُمَا فِي الْحُكْمِ',
                  translation: 'Qiyas adalah mengembalikan kasus cabang kepada kasus pokok karena adanya kesamaan motif hukum (\'illah) yang menghimpun keduanya.',
                  source: 'Matan Al-Waraqat, Bab Al-Qiyas'
                }
              ],
              keyTakeaways: [
                'Qiyas adalah sarana ijtihad paling komprehensif dalam hukum Islam.',
                'Menemukan \'Illat hukum yang shahih memerlukan pemahaman mendalam tentang maqashid syariah.'
              ]
            }
          ]
        },
        createdAt: '2026-09-01T08:00:00Z',
        updatedAt: '2026-09-01T08:00:00Z'
      }
    ]
  },
  {
    id: 'mtg-pai301a-02',
    classId: 'cls-pai301-a',
    meetingNumber: 2,
    title: 'Hukum Syara\', Hakim, Mahkum Fih, dan Mahkum \'Alaih',
    topic: 'Struktur Pembebanan Hukum Syar\'i (Taklifi & Wadh\'i)',
    description: 'Kajian mendalam tentang pembagian hukum taklifi (wajib, mandub, haram, makruh, mubah) dan hukum wadh\'i (sebab, syarat, mani\', shah, bathil).',
    scheduledDate: '2026-09-14',
    startTime: '08:00',
    endTime: '10:30',
    orderIndex: 2,
    status: 'DITERBITKAN',
    publishedAt: '2026-09-08T08:00:00Z',
    materials: [
      {
        id: 'mat-02-01',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-02',
        title: 'Modul Pembelajaran Daring: Klasifikasi Hukum Taklifi & Hukum Wadh\'i',
        description: 'E-Modul interaktif kajian pembebanan hukum syara\', hakikat khitab syar\'i, dan implementasi hukum wadh\'i.',
        type: 'MODUL_ONLINE',
        fileName: 'Modul_02_Hukum_Syar_i.pdf',
        fileSizeBytes: 2100000,
        orderIndex: 1,
        status: 'DITERBITKAN',
        allowDownload: true,
        onlineModule: {
          author: 'Tim Dosen Keislaman & Ushul Fiqih STAI AL-ITTIHAD',
          edition: 'Edisi Akademik 2026/2027',
          totalEstimatedMinutes: 20,
          learningOutcomes: [
            'Membedakan antara Hukum Taklifi dan Hukum Wadh\'i',
            'Menjelaskan tingkatan hukum taklifi (Wajib, Mandub, Tahrim, Karahah, Ibahah)',
            'Memahami fungsi Sebab, Syarat, dan Mani\' dalam keabsahan ibadah dan muamalah'
          ],
          chapters: [
            {
              id: 'ch-02-01',
              chapterNumber: 1,
              title: 'Hakikat Hukum Syara\' dan Pembagian Besarnya',
              estimatedMinutes: 5,
              content: `Hukum Syara' menurut ushuliyyin adalah firman/khithab Allah SWT yang berkaitan dengan perbuatan mukallaf, baik berupa tuntutan (iqtidla'), pilihan (takhyir), maupun ketetapan (wadh').\n\nBerdasarkan definisi tersebut, hukum syar'i terbagi menjadi dua klasifikasi besar:\n1. Hukum Taklifi: Khitab yang menuntut mukallaf untuk melakukan suatu tindakan, meninggalkan tindakan, atau memilih antara berbuat dan tidak berbuat.\n2. Hukum Wadh'i: Khitab yang menetapkan sesuatu sebagai sebab, syarat, atau penghalang (mani') bagi terwujudnya hukum lain.`,
              keyTakeaways: [
                'Hukum Taklifi membebani langsung perbuatan mukallaf.',
                'Hukum Wadh\'i menjadi indikator, prakondisi, dan legalitas berlakunya hukum taklifi.'
              ],
              arabicQuotes: [
                {
                  arabicText: 'خِطَابُ اللَّهِ تَعَالَى المُتَعَلِّقُ بِأَفْعَالِ المُكَلَّفِينَ بِالاِقْتِضَاءِ أَوِ التَّخْيِيرِ أَوِ الوَضْعِ',
                  translation: 'Khitab Allah Ta\'ala yang berkaitan dengan perbuatan para mukallaf dalam bentuk tuntutan, pemberian pilihan, atau penetapan.',
                  source: 'Al-Allamah Al-Amidi, Al-Ihkam fi Ushul al-Ahkam'
                }
              ]
            },
            {
              id: 'ch-02-02',
              chapterNumber: 2,
              title: 'Rincian Hukum Taklifi: Dari Ijab Hingga Ibahah',
              estimatedMinutes: 8,
              content: `Lima Kategori Hukum Taklifi:\n\n1. Ijab (Wajib): Tuntutan pasti untuk dikerjakan. Dikerjakan berpahala, ditinggalkan berdosa.\n   - Pembagian Wajib: Berdasarkan waktu (Mutlaq & Muwaqqat), subjek ('Aini & Kifa'i), kadar (Muhaddad & Ghairu Muhaddad).\n\n2. Nadb (Mandub/Sunnah): Tuntutan tidak pasti untuk dikerjakan. Dikerjakan berpahala, ditinggalkan tidak berdosa.\n\n3. Tahrim (Haram): Tuntutan pasti untuk ditinggalkan. Ditinggalkan berpahala, dikerjakan berdosa.\n   - Haram li-dzatihi (Zina, Membunuh) vs Haram li-ghairihi (Jual beli saat azan Jumat).\n\n4. Karahah (Makruh): Tuntutan tidak pasti untuk ditinggalkan.\n\n5. Ibahah (Mubah): Khitab yang memberikan kebebasan memilih kepada mukallaf.`,
              keyTakeaways: [
                'Membedakan Haram Li Dzatihi (esensial) dan Haram Li Ghairihi (faktor eksternal).',
                'Fardhu Kifayah gugur kewajiban bila sebagian telah mengerjakannya dengan cukup.'
              ]
            },
            {
              id: 'ch-02-03',
              chapterNumber: 3,
              title: 'Struktur Hukum Wadh\'i: Sebab, Syarat, Mani\', Shah & Bathil',
              estimatedMinutes: 7,
              content: `Hukum Wadh'i memiliki peran krusial dalam legalitas fiqih:\n\n1. As-Sabab (Sebab): Keberadaannya melahirkan hukum, ketiadaannya meniadakan hukum (Contoh: Tergelincirnya matahari menjadi sebab wajibnya Shalat Dzuhur; Masuknya nishab menjadi sebab wajibnya Zakat).\n\n2. Asy-Syarth (Syarat): Ketiadaannya meniadakan hukum, tetapi keberadaannya tidak secara otomatis melahirkan hukum (Contoh: Berwudhu adalah syarat sah shalat).\n\n3. Al-Mani' (Penghalang): Keberadaannya meniadakan hukum atau membatalkan sebab (Contoh: Perbedaan agama atau pembunuhan menjadi mani' dalam hukum waris).\n\n4. Ash-Shihhah (Sah) & Al-Buthlan (Batal): Terpenuhinya seluruh rukun dan syarat tanpa adanya mani'.`,
              keyTakeaways: [
                'Sebab adalah pemicu lahirnya kewajiban hukum.',
                'Syarat adalah prasyarat sah, dan Mani\' adalah faktor pembatal hukum.'
              ],
              caseStudy: {
                title: 'Pembagian Warisan bagi Ahli Waris yang Lalai Menyebabkan Kematian',
                scenario: 'Seorang anak yang sedang menyetir mobil mengalami kecelakaan tunggal karena mengantuk sehingga ayahnya yang berada di sampingnya wafat. Apakah sang anak terkena status mani\' pembunuhan dalam pembagian tirkah (warisan)?',
                analysisGuide: 'Bandingkan pendapat madzhab Syafi\'i (pembunuhan khatha\' tetap menghalangi waris dari harta pokok/diyat) dengan pandangan madzhab Maliki.'
              }
            }
          ]
        },
        createdAt: '2026-09-08T08:00:00Z',
        updatedAt: '2026-09-08T08:00:00Z'
      }
    ]
  },
  {
    id: 'mtg-pai301a-03',
    classId: 'cls-pai301-a',
    meetingNumber: 3,
    title: 'Sumber Hukum Primer: Al-Qur\'an dan As-Sunnah',
    topic: 'Kehujjahan Dalil Naqli dan Tingkatan Qath\'i serta Zhanni',
    description: 'Membedah kriteria qath\'iyuts tsubut/dilalah dan zhanniyuts tsubut/dilalah dalam Al-Qur\'an dan Hadits Nabawi.',
    scheduledDate: '2026-09-21',
    startTime: '08:00',
    endTime: '10:30',
    orderIndex: 3,
    status: 'DITERBITKAN',
    publishedAt: '2026-09-15T08:00:00Z',
    materials: [
      {
        id: 'mat-03-01',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-03',
        title: 'Tautan Jurnal: Hermeneutika Nash Hukum dalam Ushul Fiqih',
        description: 'Artikel ilmiah telaah kaidah tafsir hukum Islam.',
        type: 'TAUTAN_EKSTERNAL',
        externalUrl: 'https://journal.staialittihad.ac.id/index.php/tarbiyah/article/view/104',
        orderIndex: 1,
        status: 'DITERBITKAN',
        allowDownload: false,
        createdAt: '2026-09-15T08:00:00Z',
        updatedAt: '2026-09-15T08:00:00Z'
      }
    ]
  },
  {
    id: 'mtg-pai301a-04',
    classId: 'cls-pai301-a',
    meetingNumber: 4,
    title: 'Kaidah Amar, Nahyi, dan Takhyir dalam Ushul Fiqih',
    topic: 'Kaidah Kebahasaan (Lughawiyyah) dalam Menarik Kesimpulan Hukum',
    description: 'Menganalisis sighat amar (perintah) yang menunjukkan wajib atau sunnah, serta sighat nahyi (larangan) yang menunjukkan tahrim atau karahah.',
    scheduledDate: '2026-09-28',
    startTime: '08:00',
    endTime: '10:30',
    orderIndex: 4,
    status: 'DITERBITKAN',
    publishedAt: '2026-09-22T08:00:00Z',
    materials: [
      {
        id: 'mat-04-01',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-04',
        title: 'Diktat Bab 4: Kaidah Kebahasaan Amar dan Nahyi',
        description: 'Diktat lengkap kaidah istinbath lughawiyah.',
        type: 'DOKUMEN_PDF',
        fileName: 'Diktat_Bab_4_Amar_Nahyi.pdf',
        fileSizeBytes: 3100000,
        orderIndex: 1,
        status: 'DITERBITKAN',
        allowDownload: true,
        createdAt: '2026-09-22T08:00:00Z',
        updatedAt: '2026-09-22T08:00:00Z'
      }
    ]
  },
  {
    id: 'mtg-pai301a-05',
    classId: 'cls-pai301-a',
    meetingNumber: 5,
    title: 'Kaidah \'Am, Khas, Mutlaq, dan Muqayyad',
    topic: 'Takhshish al-\'Am dan Taqyid al-Mutlaq',
    description: 'Pembahasan teknis cara memahami teks umum yang dikhususkan dan teks mutlaq yang dibatasi ketentuannya.',
    scheduledDate: '2026-10-05',
    startTime: '08:00',
    endTime: '10:30',
    orderIndex: 5,
    status: 'DRAF', // Contoh DRAF untuk verifikasi bahwa mahasiswa tidak melihatnya sebelum diterbitkan
    materials: [
      {
        id: 'mat-05-01',
        classId: 'cls-pai301-a',
        meetingId: 'mtg-pai301a-05',
        title: 'Draf Modul 5: Kajian Takhshish al-\'Am',
        description: 'Materi masih dalam penyusunan oleh dosen pengampu.',
        type: 'DOKUMEN_PDF',
        fileName: 'Draf_Modul_05.pdf',
        fileSizeBytes: 1800000,
        orderIndex: 1,
        status: 'DRAF',
        allowDownload: true,
        createdAt: '2026-09-29T08:00:00Z',
        updatedAt: '2026-09-29T08:00:00Z'
      }
    ]
  }
];

class LearningService {
  private getMeetingsData(): CourseMeeting[] {
    try {
      const data = localStorage.getItem(MEETINGS_KEY);
      if (!data) {
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(INITIAL_MEETINGS));
        return INITIAL_MEETINGS;
      }
      const parsed: CourseMeeting[] = JSON.parse(data);
      let updated = false;

      // Pastikan materi awal seperti BUKU_ELEKTRONIK selalu tersedia
      INITIAL_MEETINGS.forEach((initMtg) => {
        const existingMtg = parsed.find((m) => m.id === initMtg.id);
        if (existingMtg) {
          initMtg.materials.forEach((initMat) => {
            if (!existingMtg.materials.some((m) => m.id === initMat.id)) {
              existingMtg.materials.push(initMat);
              updated = true;
            }
          });
        } else {
          parsed.push(initMtg);
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem(MEETINGS_KEY, JSON.stringify(parsed));
      }

      return parsed;
    } catch {
      return INITIAL_MEETINGS;
    }
  }

  private saveMeetingsData(meetings: CourseMeeting[]): void {
    localStorage.setItem(MEETINGS_KEY, JSON.stringify(meetings));
  }

  public getRPS(classId: string): RPSSection {
    try {
      const data = localStorage.getItem(RPS_KEY);
      const map = data ? JSON.parse(data) : INITIAL_RPS_MAP;
      return map[classId] || INITIAL_RPS_MAP['cls-pai301-a'];
    } catch {
      return INITIAL_RPS_MAP['cls-pai301-a'];
    }
  }

  public updateRPS(classId: string, rps: RPSSection): void {
    try {
      const data = localStorage.getItem(RPS_KEY);
      const map = data ? JSON.parse(data) : INITIAL_RPS_MAP;
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

  public getMeetingsByClass(classId: string, isStudent = false): CourseMeeting[] {
    const all = this.getMeetingsData().filter((m) => m.classId === classId);
    
    // Mahasiswa hanya dapat melihat pertemuan berstatus DITERBITKAN
    if (isStudent) {
      return all
        .filter((m) => m.status === 'DITERBITKAN')
        .map((m) => ({
          ...m,
          materials: m.materials.filter((mat) => mat.status === 'DITERBITKAN')
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return all.sort((a, b) => a.orderIndex - b.orderIndex);
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
}

export const learningService = new LearningService();

