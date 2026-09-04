import bcrypt from 'bcryptjs';
import { db } from './pool.js';
import { logger } from '../config/logger.js';

export async function runSeeds(): Promise<void> {
  logger.info('Starting PostgreSQL Database Seeding...');
  
  const passwordHash = await bcrypt.hash('salam2026!', 10);

  await db.transaction(async (client) => {
    // 1. SEED USERS (7 ROLES)
    const users = [
      {
        id: 'usr-mhs-01',
        username: 'mahasiswa',
        name: 'Ahmad Fauzi',
        identity_number: '21.01.0042',
        email: 'ahmad.fauzi@student.stai-alittihad.ac.id',
        role: 'mahasiswa',
        study_program: 'Pendidikan Agama Islam (PAI)'
      },
      {
        id: 'usr-dsn-01',
        username: 'dosen',
        name: 'Dr. H. M. Ridwan, M.Ag',
        identity_number: '2108198501',
        email: 'm.ridwan@stai-alittihad.ac.id',
        role: 'dosen',
        study_program: 'Pendidikan Agama Islam (PAI)'
      },
      {
        id: 'usr-dsn-pa',
        username: 'dosen_pa',
        name: 'Dr. Siti Maryam, M.Pd.I',
        identity_number: '2112198002',
        email: 'siti.maryam@stai-alittihad.ac.id',
        role: 'dosen_pa',
        study_program: 'Pendidikan Agama Islam (PAI)'
      },
      {
        id: 'usr-kaprodi',
        username: 'kaprodi',
        name: 'Dr. Ahmad Subagja, M.Pd',
        identity_number: '2105197803',
        email: 'kaprodi.pai@stai-alittihad.ac.id',
        role: 'kaprodi',
        study_program: 'Pendidikan Agama Islam (PAI)'
      },
      {
        id: 'usr-admin-akd',
        username: 'admin_akademik',
        name: 'Budi Santoso, S.Kom',
        identity_number: '1988041501',
        email: 'akademik@stai-alittihad.ac.id',
        role: 'admin_akademik',
        study_program: 'Biro Administrasi Akademik'
      },
      {
        id: 'usr-pimpinan',
        username: 'pimpinan',
        name: 'Prof. Dr. KH. Mahmud Yunus, M.A',
        identity_number: '1965081701',
        email: 'ketua@stai-alittihad.ac.id',
        role: 'pimpinan',
        study_program: 'Pimpinan STAI AL-ITTIHAD'
      },
      {
        id: 'usr-admin-sys',
        username: 'admin',
        name: 'Administrator SALAM',
        identity_number: '1990010101',
        email: 'admin.lms@stai-alittihad.ac.id',
        role: 'administrator_sistem',
        study_program: 'Pusat Teknologi Informasi & Pangkalan Data'
      }
    ];

    for (const u of users) {
      await client.query(`
        INSERT INTO users (id, username, password_hash, name, identity_number, email, role, study_program)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          password_hash = EXCLUDED.password_hash;
      `, [u.id, u.username, passwordHash, u.name, u.identity_number, u.email, u.role, u.study_program]);
    }

    // 2. SEED PROGRAM STUDI, TAHUN AKADEMIK, SEMESTER
    await client.query(`
      INSERT INTO study_programs (id, code, name, degree)
      VALUES ('prodi-pai', 'PAI', 'Pendidikan Agama Islam', 'S1')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO academic_years (id, name, is_active)
      VALUES ('ay-2026-2027', '2026/2027', TRUE)
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO semesters (id, academic_year_id, semester_type, start_date, end_date, is_active)
      VALUES ('sem-2026-ganjil', 'ay-2026-2027', 'GANJIL', '2026-09-01', '2027-01-31', TRUE)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. SEED COURSES & CLASSES
    await client.query(`
      INSERT INTO courses (id, code, name, credits, study_program_id, semester_recommended)
      VALUES ('crs-pai301', 'PAI-301', 'Ushul Fiqih & Qawaid Fiqhiyyah', 3, 'prodi-pai', 5)
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO course_classes (id, course_id, semester_id, class_name, academic_year, source_system, external_id)
      VALUES ('cls-pai301-a', 'crs-pai301', 'sem-2026-ganjil', 'Kelas A', '2026/2027 Ganjil', 'SIAKAD_ALITTIHAD', 'EXT-CLS-PAI301A')
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO class_lecturers (id, class_id, lecturer_id, is_primary)
      VALUES ('cl-01', 'cls-pai301-a', 'usr-dsn-01', TRUE)
      ON CONFLICT (id) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO class_enrollments (id, class_id, student_id, status)
      VALUES ('enr-01', 'cls-pai301-a', 'usr-mhs-01', 'TERDAFTAR')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. SEED RPS
    const rpsData = {
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
      referencesList: [
        { title: 'Al-Mustashfa min \'Ilm al-Ushul', author: 'Imam Al-Ghazali', year: 2018, isPrimary: true },
        { title: 'Ushul al-Fiqh al-Islami', author: 'Prof. Dr. Wahbah Az-Zuhaili', year: 2020, isPrimary: true },
        { title: 'Kaidah-Kaidah Fiqih dan Ushul Fiqih Kontemporer', author: 'Dr. H. M. Ridwan, M.Ag', year: 2024, isPrimary: false }
      ]
    };

    await client.query(`
      INSERT INTO course_rps (id, class_id, description, learning_outcomes, teaching_methods, assessment_weights, references_list)
      VALUES ('rps-pai301a', 'cls-pai301-a', $1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING;
    `, [
      rpsData.description,
      JSON.stringify(rpsData.learningOutcomes),
      JSON.stringify(rpsData.teachingMethods),
      JSON.stringify(rpsData.assessmentWeights),
      JSON.stringify(rpsData.referencesList)
    ]);

    // 5. SEED MEETINGS & MATERIALS
    const meetingsSeed = [
      {
        id: 'mtg-pai301a-01',
        meeting_number: 1,
        title: 'Kontrak Belajar & Pengantar Ilmu Ushul Fiqih',
        topic: 'Definisi, Objek Kajian, dan Urgensi Ushul Fiqih bagi Akademisi Muslim',
        description: 'Orientasi perkuliahan satu semester, pengenalan RPS, pemahaman perbedaan antara Fiqih dan Ushul Fiqih, serta peta konsep metode penetapan hukum.',
        scheduled_date: '2026-09-07',
        start_time: '08:00',
        end_time: '10:30',
        order_index: 1,
        status: 'DITERBITKAN',
        published_at: '2026-09-01T08:00:00Z'
      },
      {
        id: 'mtg-pai301a-02',
        meeting_number: 2,
        title: "Kaidah Bahasa & Pembagian Lafadz ('Am, Khas, Musytarak)",
        topic: 'Analisis Lafadz dari Segi Cakupan Makna dan Penggunaannya',
        description: "Kaidah interpretasi teks nash Al-Qur'an dan Sunnah dari segi keumuman ('Am), kekhususan (Khas), serta kata bermakna ganda (Musytarak).",
        scheduled_date: '2026-09-14',
        start_time: '08:00',
        end_time: '10:30',
        order_index: 2,
        status: 'DITERBITKAN',
        published_at: '2026-09-08T08:00:00Z'
      },
      {
        id: 'mtg-pai301a-03',
        meeting_number: 3,
        title: "Sumber Hukum Primer: Al-Qur'an dan As-Sunnah",
        topic: "Kehujjahan Dalil Naqli dan Tingkatan Qath'i serta Zhanni",
        description: "Membedah kriteria qath'iyuts tsubut/dilalah dan zhanniyuts tsubut/dilalah dalam Al-Qur'an dan Hadits Nabawi.",
        scheduled_date: '2026-09-21',
        start_time: '08:00',
        end_time: '10:30',
        order_index: 3,
        status: 'DITERBITKAN',
        published_at: '2026-09-15T08:00:00Z'
      }
    ];

    for (const m of meetingsSeed) {
      await client.query(`
        INSERT INTO course_meetings (id, class_id, meeting_number, title, topic, description, scheduled_date, start_time, end_time, order_index, status, published_at)
        VALUES ($1, 'cls-pai301-a', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING;
      `, [
        m.id, m.meeting_number, m.title, m.topic, m.description,
        m.scheduled_date, m.start_time, m.end_time, m.order_index,
        m.status, m.published_at
      ]);
    }

    // 6. SEED INTERACTIVE VIDEO
    await client.query(`
      INSERT INTO interactive_videos (id, class_id, meeting_id, title, description, video_url, duration_seconds, min_watched_percentage, status)
      VALUES ('vid-ushul-01', 'cls-pai301-a', 'mtg-pai301a-01', 'Konsep Dasar Ushul Fiqih & Sejarah Pembentukan Mazhab', 'Video pembelajaran interaktif yang menguraikan perbedaan esensial antara Fiqih dan Ushul Fiqih.', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 300, 80, 'DITERBITKAN')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. SEED QUIZ & ASSIGNMENT
    const quizQuestions = [
      {
        id: 'q-01',
        type: 'PILIHAN_GANDA',
        title: 'Soal 1: Pengertian Ushul Fiqih',
        questionText: 'Secara etimologi bahasa Arab, kata Ushul adalah bentuk jamak dari Asl yang bermakna:',
        points: 25,
        options: [
          { id: 'opt-1', text: 'Sesuatu yang menjadi pondasi dasar berdirinya perkara lain', isCorrect: true },
          { id: 'opt-2', text: 'Hukum praktis perbuatan mukallaf', isCorrect: false },
          { id: 'opt-3', text: 'Dalil-dalil cabang yang terperinci', isCorrect: false },
        ],
        explanation: 'Asl secara etimologi adalah dasar atau fondasi bagi bangunan perkara lainnya.'
      }
    ];

    await client.query(`
      INSERT INTO quizzes (id, class_id, meeting_id, title, description, start_date, end_date, duration_minutes, max_attempts, passing_score, status, questions)
      VALUES ('qz-pai301-01', 'cls-pai301-a', 'mtg-pai301a-02', 'Kuis Evaluasi Sesi 2: Kaidah Lughawiyah & Sumber Hukum', 'Evaluasi formatif pemahaman kaidah lafadz dan sumber hukum Islam.', '2026-09-01T00:00:00Z', '2026-09-30T23:59:59Z', 30, 2, 75, 'DITERBITKAN', $1)
      ON CONFLICT (id) DO NOTHING;
    `, [JSON.stringify(quizQuestions)]);

    const assignmentRubric = {
      id: 'rub-asg-01',
      assignmentId: 'asg-pai301-01',
      criteria: [
        {
          id: 'crit-01',
          name: 'Ketajaman Analisis Ushuliyah',
          description: 'Kemampuan mengidentifikasi dalil nash dan kaidah istinbath.',
          weightPercentage: 40,
          levels: [
            { id: 'lvl-01', name: 'Sangat Baik', score: 100, description: 'Analisis kaidah sangat mendalam dan tepat.' },
            { id: 'lvl-02', name: 'Cukup', score: 70, description: 'Analisis cukup tepat namun kurang mendalam.' }
          ]
        }
      ]
    };

    await client.query(`
      INSERT INTO assignments (id, class_id, meeting_id, title, instructions, due_date, max_score, allow_late_submission, allowed_file_extensions, status, rubric)
      VALUES ('asg-pai301-01', 'cls-pai301-a', 'mtg-pai301a-03', 'Tugas Analisis Literatur Kitab Turats & Fatwa Kontemporer', 'Susun makalah ilmiah minimal 1.500 kata yang membedah metode penetapan hukum pada salah satu fatwa kontemporer.', '2026-09-30T23:59:59Z', 100, TRUE, '["pdf", "docx"]'::jsonb, 'DITERBITKAN', $1)
      ON CONFLICT (id) DO NOTHING;
    `, [JSON.stringify(assignmentRubric)]);

    // 8. SEED NOTIFICATIONS (ALL 7 ROLES)
    const seedNotifs = [
      { id: 'notif-mhs-01', user_id: 'usr-mhs-01', title: 'Nilai Tugas Telah Diterbitkan', message: 'Dosen telah menilai tugas Makalah Ushul Fiqih Anda. Nilai Akhir: 94 / 100.', category: 'NILAI', is_read: false, deep_link_path: '/buku-nilai', action_label: 'Lihat Buku Nilai' },
      { id: 'notif-mhs-02', user_id: 'usr-mhs-01', title: 'Persetujuan KRS Akademik Disahkan', message: 'Dosen Pembimbing Akademik telah menyetujui dan mengesahkan paket 22 SKS KRS Anda.', category: 'KRS', is_read: false, deep_link_path: '/krs', action_label: 'Cetak Lembar KRS' },
      { id: 'notif-dsn-01', user_id: 'usr-dsn-01', title: 'Pengumpulan Tugas Mahasiswa Baru', message: 'Mahasiswa Ahmad Fauzi mengumpulkan berkas Tugas Analisis Literatur Fatwa.', category: 'TUGAS', is_read: false, deep_link_path: '/tugas', action_label: 'Buka Portal Penilaian' },
      { id: 'notif-dsn-02', user_id: 'usr-dsn-01', title: 'Pengingat Batas Akhir Nilai Semester', message: 'Batas akhir penginputan nilai gradebook dosen tersisa 5 hari kalender.', category: 'NILAI', is_read: false, deep_link_path: '/nilai', action_label: 'Kelola Gradebook' },
      { id: 'notif-pa-01', user_id: 'usr-dsn-pa', title: 'Pengajuan Rencana Studi (KRS) Baru', message: 'Mahasiswa bimbingan Ahmad Fauzi (NIM: 21.01.0042) mengajukan persetujuan 22 SKS.', category: 'KRS', is_read: false, deep_link_path: '/krs', action_label: 'Verifikasi & Setujui KRS' },
      { id: 'notif-pa-02', user_id: 'usr-dsn-pa', title: 'Peringatan EWS: Mahasiswa Bimbingan Berisiko', message: 'Early Warning System mendeteksi mahasiswa bimbingan dengan presensi di bawah 75%.', category: 'EWS', is_read: false, deep_link_path: '/laporan-monitoring', action_label: 'Buka Laporan EWS' },
      { id: 'notif-kpr-01', user_id: 'usr-kaprodi', title: 'Validasi Kurikulum & RPS Mata Kuliah', message: 'Terdapat 3 RPS mata kuliah baru Program Studi PAI yang menunggu validasi Kaprodi.', category: 'AKADEMIK', is_read: false, deep_link_path: '/mata-kuliah', action_label: 'Tinjau Kurikulum & RPS' },
      { id: 'notif-adm-01', user_id: 'usr-admin-akd', title: 'Pembukaan Periode KRS Online', message: 'Periode pengisian KRS daring Semester Ganjil 2026/2027 telah aktif di sistem.', category: 'AKADEMIK', is_read: false, deep_link_path: '/admin/periode', action_label: 'Kelola Linimasa Periode' },
      { id: 'notif-sys-01', user_id: 'usr-admin-sys', title: 'Peringatan Keamanan: Anomali Otentikasi', message: 'Audit log mendeteksi aktivitas login anomali dari alamat IP eksternal.', category: 'KEAMANAN', is_read: false, deep_link_path: '/admin/audit-logs', action_label: 'Investigasi Jejak Audit' },
      { id: 'notif-pim-01', user_id: 'usr-pimpinan', title: 'Laporan Eksekutif Capaian Kinerja Akademik', message: 'Laporan Semester Ganjil STAI AL-ITTIHAD telah siap: 96.2% mahasiswa aktif, IPK rata-rata kampus 3.54.', category: 'AKADEMIK', is_read: false, deep_link_path: '/laporan-monitoring', action_label: 'Buka Dashboard Eksekutif' }
    ];

    for (const n of seedNotifs) {
      await client.query(`
        INSERT INTO notifications (id, user_id, title, message, category, is_read, deep_link_path, action_label)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET 
          title = EXCLUDED.title,
          message = EXCLUDED.message,
          category = EXCLUDED.category,
          action_label = EXCLUDED.action_label,
          deep_link_path = EXCLUDED.deep_link_path;
      `, [n.id, n.user_id, n.title, n.message, n.category, n.is_read, n.deep_link_path, n.action_label]);
    }

    logger.info('Database seeding completed successfully.');
  });
}

if (process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js'))) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seeding failed', err);
      process.exit(1);
    });
}
