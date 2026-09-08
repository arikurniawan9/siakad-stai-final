<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\CurriculumEnhancementSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DatabaseController extends Controller
{
    /**
     * Daftar tabel yang dicakup dalam Backup & Restore (Diurutkan sesuai relasi)
     */
    private function getTablesToBackup(): array
    {
        return [
            'users',
            'campus_officials',
            'document_signatories',
            'faculties',
            'study_programs',
            'grading_scales',
            'sks_limits',
            'graduation_predicates',
            'academic_degrees',
            'curricula',
            'courses',
            'course_prerequisites',
            'academic_years',
            'academic_periods',
            'structural_positions',
            'lecturer_positions',
            'buildings',
            'rooms',
            'pmb_periods',
            'pmb_applicants',
            'pmb_documents',
            'fee_types',
            'fee_tariffs',
            'student_invoices',
            'va_bsi_transactions',
            'winpay_transactions',
            'fee_dispensations',
            'course_classes',
            'class_schedules',
            'exam_schedules',
            'class_meetings',
            'attendances',
            'class_lecturers',
            'class_enrollments',
            'krs_submissions',
            'krs_items',
            'edom_questionnaires',
            'edom_questions',
            'edom_responses',
            'student_edom_completions',
            'course_grades',
            'khs_records',
            'transcripts',
            'transfer_grade_conversions',
            'thesis_submissions',
            'student_activities',
            'student_leave_requests',
            'yudisium_periods',
            'yudisium_applicants',
            'system_settings',
            'announcements',
            'audit_logs',
        ];
    }

    /**
     * Helper: Resync all PostgreSQL Sequences
     */
    private function resyncSequences(): void
    {
        try {
            $sequences = DB::select("
                SELECT c.relname AS seq_name, t.relname AS table_name, a.attname AS col_name
                FROM pg_class c
                JOIN pg_depend d ON d.objid = c.oid
                JOIN pg_class t ON t.oid = d.refobjid
                JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
                WHERE c.relkind = 'S' AND t.relkind = 'r'
            ");

            foreach ($sequences as $seq) {
                try {
                    $maxVal = DB::table($seq->table_name)->max($seq->col_name) ?? 0;
                    $nextVal = max($maxVal, 1);
                    DB::statement("SELECT setval('{$seq->seq_name}', {$nextVal})");
                } catch (\Exception $e) {}
            }
        } catch (\Exception $e) {
            Log::warning('Sequence resync warning: ' . $e->getMessage());
        }
    }

    /**
     * Detail Metadata Komprehensif Tabel Database SIAKAD
     */
    private function getTableMetadata(string $table): array
    {
        $metaMap = [
            // --- DATA TRANSAKSI & PERCOBAAN (AMAN DIHAPUS / DIKOSONGKAN) ---
            'pmb_applicants' => [
                'label' => 'Pendaftar Calon Mahasiswa Baru (PMB)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan data identitas pendaftaran calon mahasiswa baru, asal sekolah, dan pilihan program studi.',
                'cascade_detail' => 'Menghapus pendaftar akan otomatis membersihkan berkas upload (pmb_documents), tagihan formulir pendaftaran (student_invoices), dan riwayat mutasi Virtual Account BSI (va_bsi_transactions).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'pmb_documents' => [
                'label' => 'Berkas Persyaratan Calon Mahasiswa (PMB)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan catatan file berkas persyaratan yang diunggah calon mahasiswa (KTP, Ijazah/SKL, Foto, KK).',
                'cascade_detail' => 'Menghapus catatan berkas dokumen verifikasi pendaftar PMB.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'student_invoices' => [
                'label' => 'Tagihan Keuangan Mahasiswa (SPP / UKT / PMB)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan nomor invoice tagihan SPP, UKT semester, biaya pendaftaran PMB, dan tagihan lainnya.',
                'cascade_detail' => 'Menghapus invoice akan otomatis membersihkan histori mutasi VA BSI (va_bsi_transactions), transaksi Winpay (winpay_transactions), dan surat dispensasi biaya (fee_dispensations).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'va_bsi_transactions' => [
                'label' => 'Mutasi Virtual Account Bank Syariah Indonesia (BSI)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan nomor VA BSI (prefix 9928), log status pembayaran, dan callback webhook perbankan.',
                'cascade_detail' => 'Menghapus riwayat mutasi dan histori notifikasi pembayaran VA BSI.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'winpay_transactions' => [
                'label' => 'Mutasi Payment Gateway Winpay',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan riwayat transaksi pembayaran online yang diproses melalui gateway Winpay.',
                'cascade_detail' => 'Menghapus riwayat transaksi dan log status pembayaran payment gateway Winpay.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'fee_dispensations' => [
                'label' => 'Dispensasi & Keringanan Biaya Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan permohonan dan surat persetujuan dispensasi penundaan atau cicilan pembayaran SPP.',
                'cascade_detail' => 'Menghapus persetujuan dispensasi dan membuka kembali kewajiban pembayaran normal.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'krs_submissions' => [
                'label' => 'Pengajuan Rencana Studi (KRS) Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan formulir pengajuan KRS semester mahasiswa beserta status persetujuan Dosen Pembimbing Akademik.',
                'cascade_detail' => 'Menghapus submission KRS akan otomatis membersihkan rincian matakuliah (krs_items) dan pendaftaran kelas (class_enrollments), serta mengembalikan status mahasiswa menjadi BELUM KRS.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'krs_items' => [
                'label' => 'Rincian Mata Kuliah dalam KRS',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan baris mata kuliah dan kelas yang dipilih mahasiswa dalam pengajuan KRS semester aktif.',
                'cascade_detail' => 'Menghapus daftar mata kuliah yang diambil dari kartu rencana studi mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'class_enrollments' => [
                'label' => 'Peserta Rombongan Belajar / Kelas Kuliah',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan relasi mahasiswa yang terdaftar aktif dalam rombongan belajar kelas perkuliahan.',
                'cascade_detail' => 'Mengeluarkan mahasiswa dari daftar kelas perkuliahan, lembar presensi, dan buku nilai (gradebook).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'course_classes' => [
                'label' => 'Kelas Perkuliahan (Rombongan Belajar)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rombel kelas per mata kuliah yang dibuka pada semester aktif (misal: PAI-1A, AS-3B).',
                'cascade_detail' => 'Menghapus kelas akan otomatis menghapus plotting jadwal (class_schedules), sesi pertemuan (class_meetings), peserta rombel (class_enrollments), dan penugasan dosen (class_lecturers).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'class_schedules' => [
                'label' => 'Jadwal Perkuliahan Mingguan',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan alokasi hari (Senin-Sabtu), jam mulai & selesai, dan ruangan tempat kelas diselenggarakan.',
                'cascade_detail' => 'Menghapus jadwal matriks perkuliahan mingguan pada semester aktif.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'class_lecturers' => [
                'label' => 'Penugasan Dosen Pengampu Kelas',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan penetapan dosen pengampu utama dan tim teaching yang mengajar pada setiap kelas perkuliahan.',
                'cascade_detail' => 'Menghapus penugasan mengajar dosen pada masing-masing rombel kelas.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'exam_schedules' => [
                'label' => 'Jadwal Ujian Semester (UTS / UAS)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan alokasi tanggal, sesi jam, dan ruangan pelaksanaan ujian tengah/akhir semester.',
                'cascade_detail' => 'Menghapus jadwal ujian perkuliahan semester aktif.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'class_meetings' => [
                'label' => 'Sesi Pertemuan Perkuliahan (Pertemuan 1 - 16)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan agenda 16 pertemuan kelas, materi silabus, token PIN presensi, dan QR code absensi dinamis.',
                'cascade_detail' => 'Menghapus sesi pertemuan kelas beserta seluruh rekapitulasi kehadiran mahasiswa (student_attendances).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'student_attendances' => [
                'label' => 'Rekap Presensi / Kehadiran Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekam jejak absensi mahasiswa di setiap pertemuan perkuliahan (Hadir, Izin, Sakit, Alpa).',
                'cascade_detail' => 'Menghapus seluruh histori kehadiran mahasiswa di perkuliahan.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'attendances' => [
                'label' => 'Log Kehadiran Perkuliahan',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan catatan rekap absensi kehadiran perkuliahan.',
                'cascade_detail' => 'Menghapus catatan presensi kuliah.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'assignments' => [
                'label' => 'Tugas Perkuliahan (LMS SALAM)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan modul penugasan kuliah daring yang dibuat dosen di sistem LMS.',
                'cascade_detail' => 'Menghapus penugasan beserta lembar pengumpulan tugas mahasiswa (assignment_submissions).',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'assignment_submissions' => [
                'label' => 'Pengumpulan Tugas Kuliah Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan berkas jawaban tugas, catatan pengerjaan, dan penilaian tugas mahasiswa.',
                'cascade_detail' => 'Menghapus file berkas dan nilai jawaban tugas mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'course_grades' => [
                'label' => 'Gradebook & Nilai Perkuliahan (DPNA)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekapitulasi nilai komponen presensi, tugas, UTS, UAS, dan huruf mutu akhir (Grade A-E).',
                'cascade_detail' => 'Menghapus seluruh nilai perkuliahan mahasiswa di buku nilai DPNA.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'khs_records' => [
                'label' => 'Kartu Hasil Studi (KHS) Semester',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekaman KHS per semester beserta Indeks Prestasi Semester (IPS) mahasiswa.',
                'cascade_detail' => 'Menghapus lembar rekam hasil studi semester mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'transcripts' => [
                'label' => 'Transkrip Nilai Akademik Kumulatif',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekapitulasi kumulatif nilai seluruh mata kuliah yang telah ditempuh dan IPK mahasiswa.',
                'cascade_detail' => 'Menghapus lembar transkrip akademik kumulatif mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'transfer_grade_conversions' => [
                'label' => 'Konversi Nilai MBKM & Mahasiswa Pindahan',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekognisi konversi nilai kegiatan MBKM atau matakuliah transfer mahasiswa pindahan.',
                'cascade_detail' => 'Menghapus data konversi SKS dan nilai transfer/MBKM.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'edom_responses' => [
                'label' => 'Jawaban Kuesioner Evaluasi Dosen (EDOM)',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan hasil penilaian kuesioner evaluasi dosen yang diisi mahasiswa secara 100% anonim.',
                'cascade_detail' => 'Menghapus seluruh respon evaluasi kinerja dosen oleh mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'student_edom_completions' => [
                'label' => 'Status Pengisian EDOM Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan status mahasiswa yang telah menyelesaikan pengisian kuisioner evaluasi dosen per semester.',
                'cascade_detail' => 'Mereset gembok pengisian EDOM sehingga mahasiswa wajib mengisi ulang.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'thesis_submissions' => [
                'label' => 'Pendaftaran Skripsi & Tugas Akhir',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan pengajuan judul skripsi, nama pembimbing, proposal, dan pendaftaran sidang skripsi.',
                'cascade_detail' => 'Menghapus data pengajuan skripsi dan histori bimbingan mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'yudisium_applicants' => [
                'label' => 'Pendaftaran Calon Wisudawan / Yudisium',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan pendaftaran kelulusan mahasiswa, nomor SK yudisium, dan berkas persyaratan wisuda.',
                'cascade_detail' => 'Menghapus permohonan dan berkas pendaftaran yudisium calon wisudawan.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'student_activities' => [
                'label' => 'Portofolio Kegiatan & Prestasi Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan sertifikat lomba, kejuaraan, dan aktivitas ekstrakurikuler kemahasiswaan.',
                'cascade_detail' => 'Menghapus catatan portofolio prestasi non-akademik mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'student_leave_requests' => [
                'label' => 'Permohonan Cuti Akademik Mahasiswa',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan data permohonan istirahat/cuti studi dan surat persetujuan cuti kuliah mahasiswa.',
                'cascade_detail' => 'Menghapus riwayat permohonan cuti kuliah.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'academic_advising_logs' => [
                'label' => 'Catatan Bimbingan Perwalian Dosen PA',
                'category' => 'transactional',
                'category_label' => 'Data Percobaan / Transaksi',
                'description' => 'Menyimpan rekam jejak konsultasi akademik antara mahasiswa dan Dosen Pembimbing Akademik.',
                'cascade_detail' => 'Menghapus riwayat catatan bimbingan studi mahasiswa.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],

            // --- AKUN PENGGUNA (PERLAKUAN KHUSUS) ---
            'users' => [
                'label' => 'Akun Pengguna Sistem (Users)',
                'category' => 'system',
                'category_label' => 'Pengguna & Akun',
                'description' => 'Menyimpan seluruh kredensial akun login sistem (Superadmin, BAAK, Keuangan, Dosen, Mahasiswa).',
                'cascade_detail' => 'PROTEKSI AKTIF: Tindakan pengosongan hanya menghapus akun mahasiswa dummy/percobaan beserta seluruh transaksi dependensinya. Akun Superadmin yang sedang login dan akun staff/dosen dilindungi dari penghapusan.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],

            // --- LOG & RIWAYAT SISTEM (AMAN DIKOSONGKAN) ---
            'audit_logs' => [
                'label' => 'Rekam Jejak Audit Sistem (Audit Trail)',
                'category' => 'log',
                'category_label' => 'Log Aktivitas',
                'description' => 'Menyimpan catatan rekam jejak seluruh aktivitas login, perubahan data, eksekusi modul, dan alamat IP pengguna.',
                'cascade_detail' => 'Menghapus seluruh histori aktivitas audit log sistem untuk efisiensi ruang penyimpanan database.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'lms_sync_logs' => [
                'label' => 'Log Sinkronisasi SALAM LMS',
                'category' => 'log',
                'category_label' => 'Log Aktivitas',
                'description' => 'Menyimpan rekam jejak histori integrasi data dua arah antara SIAKAD dan platform SALAM LMS.',
                'cascade_detail' => 'Menghapus riwayat log aktivitas sinkronisasi LMS.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'pddikti_sync_logs' => [
                'label' => 'Log Sinkronisasi PDDIKTI Neo Feeder',
                'category' => 'log',
                'category_label' => 'Log Aktivitas',
                'description' => 'Menyimpan catatan rekam jejak pelaporan sinkronisasi data akademik ke server PDDIKTI Neo Feeder.',
                'cascade_detail' => 'Menghapus riwayat log pengiriman pelaporan PDDIKTI.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],

            // --- MASTER DATA SISTEM (DILINDUNGI & TIDAK DISARANKAN DIHAPUS) ---
            'faculties' => [
                'label' => 'Master Fakultas Kampus',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master data fakultas induk institusi STAI Al-Ittihad (Tarbiyah, Syariah, dll.).',
                'cascade_detail' => 'MASTER DATA INTI. Menghapus fakultas akan merusak relasi program studi, kurikulum, dan mahasiswa.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'study_programs' => [
                'label' => 'Master Program Studi (Prodi)',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master data prodi (PAI, MPI, AS, HES, PGMI) lengkap dengan kode Dikti dan akreditasi BAN-PT.',
                'cascade_detail' => 'MASTER DATA INTI. Menghapus prodi akan merusak relasi kurikulum, mata kuliah, kelas, dan akun mahasiswa.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'study_program_degrees' => [
                'label' => 'Master Gelar Akademik Lulusan Prodi',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master singkatan gelar sarjana lulusan prodi (misal: S.Pd., S.H.).',
                'cascade_detail' => 'Master gelar akademik sarjana institusi.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'curricula' => [
                'label' => 'Master Kurikulum OBE',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master struktur kurikulum berbasis capaian pembelajaran (OBE) per program studi.',
                'cascade_detail' => 'MASTER DATA INTI. Menghapus kurikulum akan merusak pemetaan mata kuliah semester.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'courses' => [
                'label' => 'Master Mata Kuliah',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master daftar mata kuliah lengkap dengan kode, nama, beban SKS, dan semester standar.',
                'cascade_detail' => 'MASTER DATA INTI. Menghapus mata kuliah akan merusak kelas perkuliahan dan kurikulum.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'course_prerequisites' => [
                'label' => 'Master Pohon Prasyarat Mata Kuliah',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Aturan matakuliah prasyarat yang wajib ditempuh sebelum mengambil matakuliah lanjutan.',
                'cascade_detail' => 'Master validasi aturan prasyarat matakuliah.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'buildings' => [
                'label' => 'Master Gedung Perkuliahan',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master infrastruktur gedung kampus STAI Al-Ittihad.',
                'cascade_detail' => 'Master fisik gedung kampus. Terhubung dengan master ruangan kelas.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'rooms' => [
                'label' => 'Master Ruang Kelas & Lab',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master ruangan perkuliahan, kapasitas tempat duduk, dan fasilitas ruang kelas.',
                'cascade_detail' => 'MASTER RUANGAN. Terhubung langsung dengan matriks plotting jadwal perkuliahan.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'academic_years' => [
                'label' => 'Master Tahun Akademik',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master rentang tahun ajaran perkuliahan (misal: 2026/2027).',
                'cascade_detail' => 'Master tahun ajaran institusi.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'academic_periods' => [
                'label' => 'Master Periode Semester (Ganjil / Genap)',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master periode perkuliahan aktif, rentang tanggal KRS, masa perkuliahan, dan entri nilai.',
                'cascade_detail' => 'MASTER PERIODE INTI. Terhubung dengan seluruh operasional perkuliahan aktif.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'fee_types' => [
                'label' => 'Master Jenis Biaya / Tagihan',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master pengelompokan jenis pembayaran kampus (SPP, UKT, Formulir PMB, Wisuda, Cuti).',
                'cascade_detail' => 'Master tipe biaya. Diperlukan untuk penerbitan tagihan mahasiswa.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'fee_tariffs' => [
                'label' => 'Master Tarif Biaya Perkuliahan',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master besaran nominal tarif biaya kuliah per program studi, jenjang, dan angkatan.',
                'cascade_detail' => 'Master tarif sistem untuk otomasi tagihan invoice mahasiswa.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'grading_scales' => [
                'label' => 'Master Skala Nilai Huruf & Mutu',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master batas rentang nilai angka ke huruf mutu (A, B, C, D, E) dan bobot IPK.',
                'cascade_detail' => 'Master konversi mutu nilai akademik institusi.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'grade_weights' => [
                'label' => 'Master Bobot Komponen Nilai',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master persentase standar perhitungan nilai akhir (Presensi, Tugas, UTS, UAS).',
                'cascade_detail' => 'Master rumus perhitungan nilai DPNA.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'sks_limits' => [
                'label' => 'Master Batas Beban SKS Mahasiswa',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Aturan batas maksimal pengambilan SKS berdasarkan Indeks Prestasi Semester (IPS) sebelumnya.',
                'cascade_detail' => 'Master validasi batas kuota SKS saat mahasiswa mengajukan KRS.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'graduation_predicates' => [
                'label' => 'Master Predikat Kelulusan Mahasiswa',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Kriteria predikat kelulusan (Dengan Pujian / Cum Laude, Sangat Memuaskan, Memuaskan).',
                'cascade_detail' => 'Master predikat kelulusan ijazah dan transkrip.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'institutional_signatories' => [
                'label' => 'Master Penandatangan Dokumen Resmi',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master pejabat penandatangan KHS, KRS, Transkrip, dan Surat Keterangan Kampus.',
                'cascade_detail' => 'Master pejabat verifikasi dokumen ber-seal QR Code.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'structural_positions' => [
                'label' => 'Master Jabatan Struktural Kampus',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master nomenklatur jabatan pimpinan (Ketua, Wakil Ketua, Kepala Lembaga, Kaprodi).',
                'cascade_detail' => 'Master struktur organisasi kepemimpinan kampus.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'lecturer_positions' => [
                'label' => 'Master Jabatan Fungsional Dosen',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master jenjang kepangkatan fungsional dosen (Asisten Ahli, Lektor, Lektor Kepala, Guru Besar).',
                'cascade_detail' => 'Master jenjang fungsional dosen untuk pelaporan PDDIKTI.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'pmb_periods' => [
                'label' => 'Master Gelombang / Periode PMB',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master pengaturan jadwal gelombang pendaftaran PMB dan batas tanggal pendaftaran.',
                'cascade_detail' => 'Master jadwal pendaftaran calon mahasiswa baru.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'yudisium_periods' => [
                'label' => 'Master Periode Sidang Yudisium',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master jadwal penetapan tanggal pelaksanaan sidang yudisium kelulusan sarjana.',
                'cascade_detail' => 'Master periode yudisium institusi.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'edom_questions' => [
                'label' => 'Master Butir Pertanyaan EDOM',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master daftar instrumen pertanyaan evaluasi 4 kompetensi dosen.',
                'cascade_detail' => 'Master instrumen kuesioner evaluasi dosen.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'edom_questionnaires' => [
                'label' => 'Master Paket Kuesioner EDOM',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Master paket kuesioner EDOM yang ditugaskan pada periode semester tertentu.',
                'cascade_detail' => 'Master paket kuesioner evaluasi dosen.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'announcements' => [
                'label' => 'Pengumuman Akademik Kampus',
                'category' => 'master',
                'category_label' => 'Master Data Kampus',
                'description' => 'Berita dan siaran pengumuman resmi yang tampil pada dasbor dosen dan mahasiswa.',
                'cascade_detail' => 'Menghapus daftar berita/pengumuman kampus.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],
            'system_settings' => [
                'label' => 'Pengaturan Konfigurasi Sistem',
                'category' => 'system',
                'category_label' => 'Konfigurasi Sistem',
                'description' => 'Konfigurasi global nama institusi, kontak kampus, logo, dan preferensi aplikasi.',
                'cascade_detail' => 'Konfigurasi pengaturan aplikasi SIAKAD.',
                'safe_to_purge' => false,
                'is_protected' => false,
            ],

            // --- SISTEM & FRAMEWORK LARAVEL ---
            'migrations' => [
                'label' => 'Riwayat Migrasi Skema Database (Laravel)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Rekam jejak eksekusi berkas migrasi struktur tabel database PostgreSQL.',
                'cascade_detail' => 'DILARANG DIHAPUS. Menghapus tabel ini akan merusak mekanisme migrasi Laravel.',
                'safe_to_purge' => false,
                'is_protected' => true,
            ],
            'sessions' => [
                'label' => 'Sesi Login Pengguna (Web Sessions)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan token sesi login pengguna yang sedang aktif di browser.',
                'cascade_detail' => 'Mengosongkan sesi akan me-logout seluruh pengguna yang sedang login di sistem.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'cache' => [
                'label' => 'Penyimpanan Cache Aplikasi',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Penyimpanan data cache sementara untuk meningkatkan kecepatan respon aplikasi.',
                'cascade_detail' => 'Aman dikosongkan untuk me-refresh data cache internal sistem.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'cache_locks' => [
                'label' => 'Kunci Konkurensi Cache (Cache Locks)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan kunci proses konkurensi antar-pekerjaan Laravel.',
                'cascade_detail' => 'Aman dikosongkan jika ada proses lock yang menggantung.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'jobs' => [
                'label' => 'Antrean Pekerjaan Latar Belakang (Queue Jobs)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan antrean proses tugas asinkron latar belakang.',
                'cascade_detail' => 'Mengosongkan daftar pekerjaan yang sedang mengantre di queue.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'job_batches' => [
                'label' => 'Kelompok Antrean Job (Job Batches)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan batch pemrosesan antrean massal.',
                'cascade_detail' => 'Mengosongkan catatan batch job.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'failed_jobs' => [
                'label' => 'Pekerjaan Antrean Gagal (Failed Jobs)',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan log error pekerjaan latar belakang yang mengalami kegagalan eksekusi.',
                'cascade_detail' => 'Aman dibersihkan untuk menghapus histori job yang gagal.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
            'password_reset_tokens' => [
                'label' => 'Token Permohonan Reset Password',
                'category' => 'system',
                'category_label' => 'Sistem & Internal',
                'description' => 'Menyimpan token verifikasi email untuk permohonan reset kata sandi.',
                'cascade_detail' => 'Menghapus token sementara reset password yang belum digunakan.',
                'safe_to_purge' => true,
                'is_protected' => false,
            ],
        ];

        if (isset($metaMap[$table])) {
            return $metaMap[$table];
        }

        return [
            'label' => ucwords(str_replace('_', ' ', $table)),
            'category' => 'system',
            'category_label' => 'Lainnya / Tabel Sistem',
            'description' => "Menyimpan data entitas '{$table}'.",
            'cascade_detail' => "Menghapus seluruh record pada tabel {$table} dan tabel relasinya melalui mekanisme TRUNCATE CASCADE.",
            'safe_to_purge' => false,
            'is_protected' => ($table === 'migrations'),
        ];
    }

    /**
     * Tampilan Halaman Backup, Restore, dan Seeder Database (Khusus Superadmin)
     */
    public function index(): Response
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak. Fitur Database Management hanya dapat diakses oleh Super Administrator.');
        }

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        // Ambil daftar file backup
        $files = File::glob($backupDir . '/*.json');
        $backups = [];

        foreach ($files as $file) {
            $filename = basename($file);
            $sizeBytes = filesize($file);
            $createdAt = filemtime($file);

            // Baca metadata ringkas jika file valid JSON
            $meta = [];
            try {
                $raw = File::get($file);
                $json = json_decode($raw, true);
                if (is_array($json)) {
                    $meta = [
                        'app_name' => $json['app_name'] ?? 'SIAKAD',
                        'total_tables' => $json['total_tables'] ?? count($json['data'] ?? []),
                        'total_rows' => $json['total_rows'] ?? 0,
                        'created_by' => $json['created_by'] ?? 'System',
                        'timestamp' => $json['created_at'] ?? date('c', $createdAt),
                    ];
                }
            } catch (\Exception $e) {}

            $backups[] = [
                'filename' => $filename,
                'size_kb' => round($sizeBytes / 1024, 2),
                'size_mb' => round($sizeBytes / (1024 * 1024), 2),
                'created_at' => date('d M Y H:i:s', $createdAt),
                'timestamp' => $createdAt,
                'meta' => $meta,
            ];
        }

        // Urutkan backup terbaru di paling atas
        usort($backups, fn($a, $b) => $b['timestamp'] <=> $a['timestamp']);

        // Ambil SEMUA tabel riil dari PostgreSQL
        $dbTables = DB::select("
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
              AND table_type = 'BASE TABLE' 
            ORDER BY table_name
        ");

        $tableCatalog = [];
        $totalDatabaseRows = 0;
        $totalTestRows = 0;

        foreach ($dbTables as $t) {
            $tableName = $t->table_name;
            $meta = $this->getTableMetadata($tableName);
            try {
                $count = DB::table($tableName)->count();
            } catch (\Throwable $e) {
                $count = 0;
            }

            $tableItem = array_merge($meta, [
                'name' => $tableName,
                'rows' => $count,
            ]);

            $tableCatalog[] = $tableItem;
            $totalDatabaseRows += $count;
            if ($meta['category'] === 'transactional' || $meta['category'] === 'log') {
                $totalTestRows += $count;
            }
        }

        // Ukuran Database PostgreSQL
        $dbSize = '0 MB';
        try {
            $sizeResult = DB::select("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
            if (!empty($sizeResult)) {
                $dbSize = $sizeResult[0]->size;
            }
        } catch (\Exception $e) {}

        // Statistik Pembersihan Data Percobaan (Purge Stats)
        $purgeStats = [
            'pmb' => [
                'applicants' => DB::getSchemaBuilder()->hasTable('pmb_applicants') ? DB::table('pmb_applicants')->count() : 0,
                'documents' => DB::getSchemaBuilder()->hasTable('pmb_documents') ? DB::table('pmb_documents')->count() : 0,
                'invoices' => DB::getSchemaBuilder()->hasTable('student_invoices') ? DB::table('student_invoices')->whereNotNull('pmb_applicant_id')->count() : 0,
            ],
            'finance' => [
                'invoices' => DB::getSchemaBuilder()->hasTable('student_invoices') ? DB::table('student_invoices')->count() : 0,
                'va' => DB::getSchemaBuilder()->hasTable('va_bsi_transactions') ? DB::table('va_bsi_transactions')->count() : 0,
                'dispensations' => DB::getSchemaBuilder()->hasTable('fee_dispensations') ? DB::table('fee_dispensations')->count() : 0,
            ],
            'krs' => [
                'submissions' => DB::getSchemaBuilder()->hasTable('krs_submissions') ? DB::table('krs_submissions')->count() : 0,
                'items' => DB::getSchemaBuilder()->hasTable('krs_items') ? DB::table('krs_items')->count() : 0,
            ],
            'grades' => [
                'course_grades' => DB::getSchemaBuilder()->hasTable('course_grades') ? DB::table('course_grades')->count() : 0,
                'khs' => DB::getSchemaBuilder()->hasTable('khs_records') ? DB::table('khs_records')->count() : 0,
                'transcripts' => DB::getSchemaBuilder()->hasTable('transcripts') ? DB::table('transcripts')->count() : 0,
            ],
            'attendance' => [
                'attendances' => DB::getSchemaBuilder()->hasTable('attendances') ? DB::table('attendances')->count() : 0,
                'meetings' => DB::getSchemaBuilder()->hasTable('class_meetings') ? DB::table('class_meetings')->count() : 0,
            ],
            'edom' => [
                'responses' => DB::getSchemaBuilder()->hasTable('edom_responses') ? DB::table('edom_responses')->count() : 0,
                'completions' => DB::getSchemaBuilder()->hasTable('student_edom_completions') ? DB::table('student_edom_completions')->count() : 0,
            ],
            'classes' => [
                'classes' => DB::getSchemaBuilder()->hasTable('course_classes') ? DB::table('course_classes')->count() : 0,
                'schedules' => DB::getSchemaBuilder()->hasTable('class_schedules') ? DB::table('class_schedules')->count() : 0,
            ],
            'thesis' => [
                'thesis' => DB::getSchemaBuilder()->hasTable('thesis_submissions') ? DB::table('thesis_submissions')->count() : 0,
                'yudisium' => DB::getSchemaBuilder()->hasTable('yudisium_applicants') ? DB::table('yudisium_applicants')->count() : 0,
            ],
            'students' => [
                'total' => DB::getSchemaBuilder()->hasTable('users') ? DB::table('users')->where('role', 'mahasiswa')->count() : 0,
            ],
            'audit_logs' => [
                'total' => DB::getSchemaBuilder()->hasTable('audit_logs') ? DB::table('audit_logs')->count() : 0,
            ],
        ];

        return Inertia::render('Admin/Database/Index', [
            'tableCatalog' => $tableCatalog,
            'totalTestRows' => $totalTestRows,
            'backups' => $backups,
            'purgeStats' => $purgeStats,
            'dbInfo' => [
                'driver' => config('database.default'),
                'database' => config('database.connections.pgsql.database'),
                'host' => config('database.connections.pgsql.host'),
                'port' => config('database.connections.pgsql.port'),
                'size' => $dbSize,
                'total_tables' => count($tableCatalog),
                'total_rows' => $totalDatabaseRows,
            ],
        ]);
    }

    /**
     * Buat Backup Database Baru (.json)
     */
    public function createBackup(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $backupDir = storage_path('app/backups');
        if (!File::exists($backupDir)) {
            File::makeDirectory($backupDir, 0755, true);
        }

        $tables = $this->getTablesToBackup();
        $exportData = [];
        $totalRows = 0;

        foreach ($tables as $t) {
            if (DB::getSchemaBuilder()->hasTable($t)) {
                $rows = DB::table($t)->get()->map(fn($r) => (array) $r)->toArray();
                $exportData[$t] = $rows;
                $totalRows += count($rows);
            }
        }

        $backupPayload = [
            'app_name' => config('app.name', 'SIAKAD STAI Al-Ittihad'),
            'app_env' => config('app.env'),
            'created_at' => now()->toIso8601String(),
            'created_by' => Auth::user()?->name ?? 'Superadmin',
            'created_by_id' => Auth::id(),
            'total_tables' => count($exportData),
            'total_rows' => $totalRows,
            'data' => $exportData,
        ];

        $filename = 'backup_siakad_' . date('Y-m-d_His') . '.json';
        $filePath = $backupDir . '/' . $filename;

        File::put($filePath, json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        // Catat Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'DATABASE_BACKUP_CREATE',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'Database',
            'target_id' => $filename,
            'details' => json_encode([
                'filename' => $filename,
                'total_tables' => count($exportData),
                'total_rows' => $totalRows,
                'size_kb' => round(filesize($filePath) / 1024, 2),
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Backup database '{$filename}' berhasil dibuat! ({$totalRows} baris data dari " . count($exportData) . " tabel tersimpan).");
    }

    /**
     * Unduh File Backup
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = basename($filename);
        $filePath = storage_path('app/backups/' . $filename);

        if (!File::exists($filePath)) {
            abort(404, 'File backup tidak ditemukan.');
        }

        return response()->download($filePath, $filename, [
            'Content-Type' => 'application/json',
        ]);
    }

    /**
     * Hapus File Backup
     */
    public function deleteBackup(Request $request, string $filename): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = basename($filename);
        $filePath = storage_path('app/backups/' . $filename);

        if (File::exists($filePath)) {
            File::delete($filePath);

            // Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_BACKUP_DELETE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'DatabaseBackup',
                'target_id' => $filename,
                'details' => json_encode(['filename' => $filename]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "File backup '{$filename}' telah berhasil dihapus dari server.");
        }

        return back()->with('error', "File backup '{$filename}' tidak ditemukan.");
    }

    /**
     * Restore Database dari File Backup Server / Upload File
     */
    public function restoreBackup(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $filename = $request->input('filename');
        $uploadedFile = $request->file('backup_file');
        $jsonContent = null;
        $sourceName = '';

        if ($uploadedFile) {
            $request->validate([
                'backup_file' => 'required|file|mimes:json,txt|max:51200', // max 50MB
            ]);
            $sourceName = $uploadedFile->getClientOriginalName();
            $jsonContent = json_decode(File::get($uploadedFile->getRealPath()), true);
        } elseif ($filename) {
            $safeName = basename($filename);
            $filePath = storage_path('app/backups/' . $safeName);
            if (!File::exists($filePath)) {
                return back()->with('error', "File backup '{$safeName}' tidak ditemukan.");
            }
            $sourceName = $safeName;
            $jsonContent = json_decode(File::get($filePath), true);
        } else {
            return back()->with('error', 'Silakan pilih file backup yang ingin di-restore.');
        }

        if (!is_array($jsonContent) || !isset($jsonContent['data']) || !is_array($jsonContent['data'])) {
            return back()->with('error', 'Format file backup tidak valid. Pastikan file JSON hasil backup SIAKAD STAI Al-Ittihad.');
        }

        $data = $jsonContent['data'];
        $restoredTables = 0;
        $restoredRows = 0;

        try {
            DB::transaction(function () use ($data, &$restoredTables, &$restoredRows) {
                // 1. Truncate tabel dalam urutan terbalik
                foreach (array_reverse(array_keys($data)) as $table) {
                    if (DB::getSchemaBuilder()->hasTable($table)) {
                        DB::statement("TRUNCATE TABLE {$table} CASCADE");
                    }
                }

                // 2. Masukkan data per tabel dalam batch
                foreach ($data as $table => $rows) {
                    if (DB::getSchemaBuilder()->hasTable($table) && !empty($rows)) {
                        foreach (array_chunk($rows, 50) as $chunk) {
                            DB::table($table)->insert($chunk);
                        }
                        $restoredTables++;
                        $restoredRows += count($rows);
                    }
                }

                // 3. Sinkronkan semua sequence PostgreSQL
                $this->resyncSequences();
            });

            // Catat ke Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_RESTORE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'Database',
                'target_id' => $sourceName,
                'details' => json_encode([
                    'source' => $sourceName,
                    'restored_tables' => $restoredTables,
                    'restored_rows' => $restoredRows,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "✅ Database BERHASIL DI-RESTORE dari '{$sourceName}'! Sebanyak {$restoredRows} baris data pada {$restoredTables} tabel berhasil dipulihkan.");
        } catch (\Exception $e) {
            Log::error('Restore Database Error: ' . $e->getMessage());
            return back()->with('error', 'Gagal memulihkan database: ' . $e->getMessage());
        }
    }

    /**
     * Eksekusi Database Seeder untuk Pengembangan (Development Seeder)
     */
    public function runSeeder(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak.');
        }

        $type = $request->input('type', 'full'); // full | pmb | finance | curriculum

        try {
            $msg = '';

            if ($type === 'full') {
                // Jalankan DatabaseSeeder
                $seeder = new DatabaseSeeder();
                $seeder->run();
                $this->resyncSequences();
                $msg = 'Full Master & Dummy Seeder berhasil dieksekusi! Data Civitas, Prodi, Kurikulum, dan Tagihan telah diperbarui.';
            } elseif ($type === 'pmb') {
                // Generate 5 Pendaftar PMB Baru
                $pmbPeriod = DB::table('pmb_periods')->where('is_active', true)->first();
                $prodis = DB::table('study_programs')->where('is_active', true)->get();

                $names = [
                    'Faisal Akbar Ramadhan', 'Zaskia Nur Fatimah', 'Rizky Alamsyah Pratama',
                    'Annisa Salsabila Putri', 'M. Ilham Wahyudi'
                ];

                $countCreated = 0;
                foreach ($names as $idx => $name) {
                    $prodi = $prodis[$idx % count($prodis)];
                    $countToday = DB::table('pmb_applicants')->count() + 1;
                    $regNumber = 'PMB-' . date('Y') . '-' . str_pad($countToday, 4, '0', STR_PAD_LEFT);

                    $appId = DB::table('pmb_applicants')->insertGetId([
                        'pmb_period_id' => $pmbPeriod?->id ?? 1,
                        'registration_number' => $regNumber,
                        'full_name' => $name,
                        'nik' => '320301' . rand(1000000000, 9999999999),
                        'phone_number' => '0812' . rand(10000000, 99999999),
                        'email' => strtolower(str_replace(' ', '.', $name)) . '@gmail.com',
                        'gender' => $idx % 2 === 0 ? 'L' : 'P',
                        'birth_place' => 'Cianjur',
                        'birth_date' => '2005-' . str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' . str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT),
                        'address' => 'Jl. K.H. Abdullah Bin Nuh No. ' . rand(1, 100) . ', Cianjur',
                        'previous_school' => 'MAN ' . rand(1, 3) . ' Cianjur',
                        'first_choice_program_id' => $prodi->id,
                        'pathway' => 'REGULER',
                        'status' => $idx === 0 ? 'TERVERIFIKASI_BAYAR' : 'MENUNGGU_PEMBAYARAN',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $invId = DB::table('student_invoices')->insertGetId([
                        'invoice_number' => 'INV-PMB-' . date('Ymd') . '-' . str_pad($appId, 4, '0', STR_PAD_LEFT),
                        'pmb_applicant_id' => $appId,
                        'fee_type_id' => 1,
                        'amount' => 250000.00,
                        'final_amount' => 250000.00,
                        'due_date' => now()->addDays(7),
                        'status' => $idx === 0 ? 'LUNAS' : 'BELUM_BAYAR',
                        'paid_at' => $idx === 0 ? now() : null,
                        'payment_method' => $idx === 0 ? 'VA_BSI' : null,
                        'notes' => "Biaya Pendaftaran PMB Online - {$name}",
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $vaNumber = '992801' . date('y') . str_pad($appId, 4, '0', STR_PAD_LEFT);
                    DB::table('va_bsi_transactions')->insert([
                        'student_invoice_id' => $invId,
                        'va_number' => $vaNumber,
                        'channel' => 'BSI_MOBILE',
                        'amount' => 250000.00,
                        'status' => $idx === 0 ? 'PAID' : 'PENDING',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $countCreated++;
                }

                $this->resyncSequences();
                $msg = "Seeder PMB Berhasil! Sebanyak {$countCreated} calon mahasiswa baru + Invoice & VA BSI telah dibuat.";
            } elseif ($type === 'finance') {
                // Generate Tagihan SPP Kuliah Mahasiswa
                $students = DB::table('users')->where('role', 'mahasiswa')->get();
                $feeType = DB::table('fee_types')->where('code', 'SPP')->first() ?? DB::table('fee_types')->first();

                $invCreated = 0;
                foreach ($students as $stu) {
                    $invNumber = 'INV-SPP-' . date('Ym') . '-' . str_pad($stu->id, 4, '0', STR_PAD_LEFT);
                    $invId = DB::table('student_invoices')->insertGetId([
                        'invoice_number' => $invNumber,
                        'user_id' => $stu->id,
                        'fee_type_id' => $feeType->id,
                        'amount' => 1500000.00,
                        'final_amount' => 1500000.00,
                        'due_date' => now()->addDays(30),
                        'status' => 'BELUM_BAYAR',
                        'notes' => 'Tagihan SPP Semester Ganjil 2026/2027',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $vaNumber = '992802' . date('y') . str_pad($stu->id, 4, '0', STR_PAD_LEFT);
                    DB::table('va_bsi_transactions')->insert([
                        'student_invoice_id' => $invId,
                        'va_number' => $vaNumber,
                        'channel' => 'BSI_MOBILE',
                        'amount' => 1500000.00,
                        'status' => 'PENDING',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    $invCreated++;
                }

                $this->resyncSequences();
                $msg = "Seeder Keuangan Berhasil! Sebanyak {$invCreated} tagihan SPP & VA BSI mahasiswa telah digenerate.";
            } elseif ($type === 'curriculum') {
                $seeder = new CurriculumEnhancementSeeder();
                $seeder->run();
                $this->resyncSequences();
                $msg = 'Seeder Kurikulum OBE & Matakuliah Berhasil Diperbarui!';
            }

            // Catat ke Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_SEEDER_RUN',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'Database',
                'target_id' => strtoupper($type),
                'details' => json_encode(['type' => $type, 'message' => $msg]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "🌱 {$msg}");
        } catch (\Exception $e) {
            Log::error('Seeder Execution Error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menjalankan seeder: ' . $e->getMessage());
        }
    }

    /**
     * Bersihkan Data Percobaan Berdasarkan Modul (Data Purge Engine)
     */
    public function purgeModule(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak. Fitur ini khusus Super Administrator.');
        }

        $module = $request->input('module');
        $msg = '';

        try {
            DB::transaction(function () use ($module, &$msg) {
                switch ($module) {
                    case 'pmb':
                        $pmbInvoices = DB::table('student_invoices')->whereNotNull('pmb_applicant_id')->pluck('id')->toArray();
                        if (!empty($pmbInvoices)) {
                            DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $pmbInvoices)->delete();
                            DB::table('student_invoices')->whereIn('id', $pmbInvoices)->delete();
                        }
                        if (DB::getSchemaBuilder()->hasTable('pmb_documents')) {
                            DB::table('pmb_documents')->delete();
                        }
                        DB::table('pmb_applicants')->delete();
                        $msg = 'Seluruh data pendaftar PMB percobaan, berkas, invoice, dan VA BSI PMB berhasil dibersihkan.';
                        break;

                    case 'finance':
                        if (DB::getSchemaBuilder()->hasTable('va_bsi_transactions')) {
                            DB::statement("TRUNCATE TABLE va_bsi_transactions CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('winpay_transactions')) {
                            DB::statement("TRUNCATE TABLE winpay_transactions CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('fee_dispensations')) {
                            DB::statement("TRUNCATE TABLE fee_dispensations CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('student_invoices')) {
                            DB::statement("TRUNCATE TABLE student_invoices CASCADE");
                        }
                        $msg = 'Seluruh tagihan (invoices) dan transaksi VA BSI percobaan berhasil dibersihkan.';
                        break;

                    case 'krs':
                        if (DB::getSchemaBuilder()->hasTable('krs_items')) {
                            DB::statement("TRUNCATE TABLE krs_items CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('krs_submissions')) {
                            DB::statement("TRUNCATE TABLE krs_submissions CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_enrollments')) {
                            DB::statement("TRUNCATE TABLE class_enrollments CASCADE");
                        }
                        $msg = 'Seluruh pengajuan KRS dan detail pengambilan mata kuliah percobaan berhasil dibersihkan.';
                        break;

                    case 'grades':
                        if (DB::getSchemaBuilder()->hasTable('course_grades')) {
                            DB::statement("TRUNCATE TABLE course_grades CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('khs_records')) {
                            DB::statement("TRUNCATE TABLE khs_records CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('transcripts')) {
                            DB::statement("TRUNCATE TABLE transcripts CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('transfer_grade_conversions')) {
                            DB::statement("TRUNCATE TABLE transfer_grade_conversions CASCADE");
                        }
                        $msg = 'Seluruh nilai mahasiswa, lembar KHS, dan transkrip akademik percobaan berhasil dibersihkan.';
                        break;

                    case 'attendance':
                        if (DB::getSchemaBuilder()->hasTable('student_attendances')) {
                            DB::statement("TRUNCATE TABLE student_attendances CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('lecturer_attendances')) {
                            DB::statement("TRUNCATE TABLE lecturer_attendances CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('attendances')) {
                            DB::statement("TRUNCATE TABLE attendances CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('meeting_attendance_sessions')) {
                            DB::statement("TRUNCATE TABLE meeting_attendance_sessions CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_meetings')) {
                            DB::statement("TRUNCATE TABLE class_meetings CASCADE");
                        }
                        $msg = 'Seluruh rekaman presensi perkuliahan dan sesi pertemuan kelas berhasil dibersihkan.';
                        break;

                    case 'edom':
                        if (DB::getSchemaBuilder()->hasTable('edom_responses')) {
                            DB::statement("TRUNCATE TABLE edom_responses CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('student_edom_completions')) {
                            DB::statement("TRUNCATE TABLE student_edom_completions CASCADE");
                        }
                        $msg = 'Seluruh tanggapan dan respon evaluasi dosen (EDOM) percobaan berhasil dibersihkan.';
                        break;

                    case 'classes':
                        if (DB::getSchemaBuilder()->hasTable('course_grades')) {
                            DB::statement("TRUNCATE TABLE course_grades CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('krs_items')) {
                            DB::statement("TRUNCATE TABLE krs_items CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('attendances')) {
                            DB::statement("TRUNCATE TABLE attendances CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_meetings')) {
                            DB::statement("TRUNCATE TABLE class_meetings CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_enrollments')) {
                            DB::statement("TRUNCATE TABLE class_enrollments CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_lecturers')) {
                            DB::statement("TRUNCATE TABLE class_lecturers CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('class_schedules')) {
                            DB::statement("TRUNCATE TABLE class_schedules CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('exam_schedules')) {
                            DB::statement("TRUNCATE TABLE exam_schedules CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('course_classes')) {
                            DB::statement("TRUNCATE TABLE course_classes CASCADE");
                        }
                        $msg = 'Seluruh rombel kelas perkuliahan, jadwal, dan enrollment percobaan berhasil dibersihkan.';
                        break;

                    case 'thesis_yudisium':
                        if (DB::getSchemaBuilder()->hasTable('thesis_submissions')) {
                            DB::statement("TRUNCATE TABLE thesis_submissions CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('yudisium_applicants')) {
                            DB::statement("TRUNCATE TABLE yudisium_applicants CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('student_activities')) {
                            DB::statement("TRUNCATE TABLE student_activities CASCADE");
                        }
                        if (DB::getSchemaBuilder()->hasTable('student_leave_requests')) {
                            DB::statement("TRUNCATE TABLE student_leave_requests CASCADE");
                        }
                        $msg = 'Seluruh data skripsi, yudisium, dan aktivitas mahasiswa percobaan berhasil dibersihkan.';
                        break;

                    case 'dummy_students':
                        $studentIds = DB::table('users')->where('role', 'mahasiswa')->pluck('id')->toArray();
                        if (!empty($studentIds)) {
                            $invs = DB::table('student_invoices')->whereIn('user_id', $studentIds)->pluck('id')->toArray();
                            if (!empty($invs)) {
                                DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invs)->delete();
                                DB::table('winpay_transactions')->whereIn('student_invoice_id', $invs)->delete();
                                DB::table('fee_dispensations')->whereIn('student_invoice_id', $invs)->delete();
                                DB::table('student_invoices')->whereIn('id', $invs)->delete();
                            }
                            $krsSubs = DB::table('krs_submissions')->whereIn('student_id', $studentIds)->pluck('id')->toArray();
                            if (!empty($krsSubs)) {
                                DB::table('krs_items')->whereIn('krs_submission_id', $krsSubs)->delete();
                                DB::table('krs_submissions')->whereIn('id', $krsSubs)->delete();
                            }
                            DB::table('class_enrollments')->whereIn('student_id', $studentIds)->delete();
                            DB::table('attendances')->whereIn('student_id', $studentIds)->delete();
                            if (DB::getSchemaBuilder()->hasTable('student_attendances')) {
                                DB::table('student_attendances')->whereIn('student_id', $studentIds)->delete();
                            }
                            DB::table('course_grades')->whereIn('student_id', $studentIds)->delete();
                            DB::table('khs_records')->whereIn('student_id', $studentIds)->delete();
                            DB::table('transcripts')->whereIn('student_id', $studentIds)->delete();
                            DB::table('edom_responses')->whereIn('student_id', $studentIds)->delete();
                            DB::table('student_edom_completions')->whereIn('student_id', $studentIds)->delete();
                            DB::table('thesis_submissions')->whereIn('student_id', $studentIds)->delete();
                            DB::table('yudisium_applicants')->whereIn('student_id', $studentIds)->delete();
                            DB::table('users')->whereIn('id', $studentIds)->delete();
                        }
                        $msg = 'Seluruh akun mahasiswa dummy/percobaan (' . count($studentIds) . ' akun) berhasil dibersihkan.';
                        break;

                    case 'audit_logs':
                        DB::statement("TRUNCATE TABLE audit_logs CASCADE");
                        $msg = 'Seluruh log riwayat audit aktivitas sistem berhasil dibersihkan.';
                        break;

                    case 'all_test_data':
                        $transTables = [
                            'audit_logs',
                            'student_edom_completions',
                            'edom_responses',
                            'thesis_submissions',
                            'yudisium_applicants',
                            'student_activities',
                            'student_leave_requests',
                            'transfer_grade_conversions',
                            'transcripts',
                            'khs_records',
                            'course_grades',
                            'attendances',
                            'student_attendances',
                            'lecturer_attendances',
                            'meeting_attendance_sessions',
                            'class_meetings',
                            'krs_items',
                            'krs_submissions',
                            'class_enrollments',
                            'va_bsi_transactions',
                            'winpay_transactions',
                            'fee_dispensations',
                            'student_invoices',
                            'pmb_documents',
                            'pmb_applicants',
                        ];

                        foreach ($transTables as $tbl) {
                            if (DB::getSchemaBuilder()->hasTable($tbl)) {
                                DB::statement("TRUNCATE TABLE {$tbl} CASCADE");
                            }
                        }

                        $msg = '💥 RESET TOTAL SUKSES! Seluruh data transaksi PMB, Keuangan, KRS, Nilai, Presensi, dan EDOM percobaan berhasil dibersihkan. Master Data kurikulum, fakultas, prodi, gedung, dan akun staf tetap utuh & aman.';
                        break;

                    default:
                        throw new \Exception("Modul '{$module}' tidak dikenali.");
                }

                $this->resyncSequences();
            });

            // Audit Log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_PURGE_MODULE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'Database',
                'target_id' => strtoupper($module),
                'details' => json_encode(['module' => $module, 'message' => $msg]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "🧹 {$msg}");
        } catch (\Exception $e) {
            Log::error("Purge Module {$module} Error: " . $e->getMessage());
            return back()->with('error', "Gagal membersihkan data modul {$module}: " . $e->getMessage());
        }
    }

    /**
     * Kosongkan Tabel Spesifik Secara Langsung (Truncate Table)
     */
    public function truncateTable(Request $request): RedirectResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            abort(403, 'Akses ditolak. Fitur ini khusus Super Administrator.');
        }

        $table = $request->input('table');
        if (empty($table) || !DB::getSchemaBuilder()->hasTable($table)) {
            return back()->with('error', 'Tabel tidak ditemukan dalam skema database.');
        }

        // Proteksi tabel terlarang
        if ($table === 'migrations') {
            return back()->with('error', 'Tabel migrations tidak dapat dikosongkan karena esensial untuk integritas skema database.');
        }

        try {
            DB::transaction(function () use ($table) {
                if ($table === 'users') {
                    // Proteksi akun Superadmin
                    $superadminId = Auth::id();
                    
                    $depTables = [
                        'krs_items', 'krs_submissions', 'attendances', 'course_grades', 
                        'khs_records', 'transcripts', 'edom_responses', 'student_edom_completions', 
                        'student_invoices', 'va_bsi_transactions', 'class_enrollments', 'class_lecturers'
                    ];
                    foreach ($depTables as $dt) {
                        if (DB::getSchemaBuilder()->hasTable($dt)) {
                            DB::statement("TRUNCATE TABLE {$dt} CASCADE");
                        }
                    }
                    
                    // Hapus semua user kecuali superadmin aktif
                    DB::table('users')->where('id', '!=', $superadminId)->delete();
                } else {
                    DB::statement("TRUNCATE TABLE {$table} CASCADE");
                }

                $this->resyncSequences();
            });

            // Catat audit log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_TABLE_TRUNCATE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'DatabaseTable',
                'target_id' => $table,
                'details' => json_encode(['table' => $table]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return back()->with('success', "✅ Tabel '{$table}' berhasil dikosongkan (TRUNCATE CASCADE) dan sequence telah disinkronkan.");
        } catch (\Exception $e) {
            Log::error("Truncate Table {$table} Error: " . $e->getMessage());
            return back()->with('error', "Gagal mengosongkan tabel '{$table}': " . $e->getMessage());
        }
    }

    /**
     * API: Ambil Baris Data Tabel untuk Pratinjau Modal (JSON)
     */
    public function getTableData(Request $request): \Illuminate\Http\JsonResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $table = $request->query('table');
        if (empty($table) || !DB::getSchemaBuilder()->hasTable($table)) {
            return response()->json(['success' => false, 'message' => 'Tabel tidak ditemukan.'], 404);
        }

        $meta = $this->getTableMetadata($table);
        $allCols = DB::getSchemaBuilder()->getColumnListing($table);

        // Filter kolom sensitif untuk keamanan tampilan
        $hiddenCols = ['password', 'password_hash', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'];
        $displayCols = array_values(array_diff($allCols, $hiddenCols));

        $query = DB::table($table);

        // Search query jika ada
        $search = $request->query('search');
        if (!empty($search)) {
            $query->where(function ($q) use ($displayCols, $search) {
                foreach (array_slice($displayCols, 0, 8) as $col) {
                    $q->orWhere(DB::raw("CAST({$col} AS TEXT)"), 'ILIKE', "%{$search}%");
                }
            });
        }

        // Primary key
        $pk = in_array('id', $allCols) ? 'id' : ($allCols[0] ?? null);
        if ($pk) {
            $query->orderByDesc($pk);
        }

        $perPage = (int) $request->query('per_page', 15);
        $perPage = max(5, min(100, $perPage));
        $page = (int) $request->query('page', 1);

        $total = (clone $query)->count();
        $records = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        // Format data
        $formattedRecords = $records->map(function ($row) use ($displayCols, $pk) {
            $arr = (array) $row;
            foreach ($arr as $k => $v) {
                if (is_array($v) || is_object($v)) {
                    $arr[$k] = json_encode($v);
                } elseif (is_string($v) && strlen($v) > 80) {
                    $arr[$k] = substr($v, 0, 77) . '...';
                }
            }
            $arr['_pk'] = $pk ? ($row->$pk ?? null) : null;
            return $arr;
        });

        return response()->json([
            'success' => true,
            'table' => $table,
            'label' => $meta['label'],
            'category_label' => $meta['category_label'],
            'cascade_detail' => $meta['cascade_detail'],
            'primary_key' => $pk,
            'columns' => array_slice($displayCols, 0, 8),
            'all_columns' => $displayCols,
            'records' => $formattedRecords,
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
            'last_page' => (int) ceil($total / $perPage),
        ]);
    }

    /**
     * API: Hapus Baris Data Tabel (Single / Multi Delete)
     */
    public function deleteTableRows(Request $request): \Illuminate\Http\JsonResponse
    {
        if (Auth::user()?->role !== 'superadmin') {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $table = $request->input('table');
        $ids = (array) $request->input('ids', []);

        if (empty($table) || !DB::getSchemaBuilder()->hasTable($table)) {
            return response()->json(['success' => false, 'message' => 'Tabel tidak valid.'], 404);
        }

        if (empty($ids)) {
            return response()->json(['success' => false, 'message' => 'Pilih setidaknya satu baris data untuk dihapus.'], 400);
        }

        if ($table === 'migrations') {
            return response()->json(['success' => false, 'message' => 'Tabel migrations dilarang dihapus.'], 403);
        }

        $allCols = DB::getSchemaBuilder()->getColumnListing($table);
        $pk = in_array('id', $allCols) ? 'id' : ($allCols[0] ?? null);

        if (!$pk) {
            return response()->json(['success' => false, 'message' => 'Primary key tabel tidak terdeteksi.'], 400);
        }

        // Khusus tabel users: lindungi superadmin yang sedang login
        if ($table === 'users') {
            $superadminId = Auth::id();
            $ids = array_values(array_diff($ids, [$superadminId]));
            if (empty($ids)) {
                return response()->json(['success' => false, 'message' => 'Akun Superadmin yang sedang login tidak dapat dihapus.'], 400);
            }
        }

        try {
            DB::transaction(function () use ($table, $pk, $ids) {
                // Cascade cleaners untuk tabel-tabel utama
                if ($table === 'users') {
                    $invs = DB::table('student_invoices')->whereIn('user_id', $ids)->pluck('id')->toArray();
                    if (!empty($invs)) {
                        DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invs)->delete();
                        DB::table('winpay_transactions')->whereIn('student_invoice_id', $invs)->delete();
                        DB::table('fee_dispensations')->whereIn('student_invoice_id', $invs)->delete();
                        DB::table('student_invoices')->whereIn('id', $invs)->delete();
                    }
                    $krsSubs = DB::table('krs_submissions')->whereIn('student_id', $ids)->pluck('id')->toArray();
                    if (!empty($krsSubs)) {
                        DB::table('krs_items')->whereIn('krs_submission_id', $krsSubs)->delete();
                        DB::table('krs_submissions')->whereIn('id', $krsSubs)->delete();
                    }
                    DB::table('class_enrollments')->whereIn('student_id', $ids)->delete();
                    DB::table('attendances')->whereIn('student_id', $ids)->delete();
                    if (DB::getSchemaBuilder()->hasTable('student_attendances')) {
                        DB::table('student_attendances')->whereIn('student_id', $ids)->delete();
                    }
                    DB::table('course_grades')->whereIn('student_id', $ids)->delete();
                    DB::table('khs_records')->whereIn('student_id', $ids)->delete();
                    DB::table('transcripts')->whereIn('student_id', $ids)->delete();
                    DB::table('edom_responses')->whereIn('student_id', $ids)->delete();
                    DB::table('student_edom_completions')->whereIn('student_id', $ids)->delete();
                    DB::table('thesis_submissions')->whereIn('student_id', $ids)->delete();
                    DB::table('yudisium_applicants')->whereIn('student_id', $ids)->delete();
                } elseif ($table === 'pmb_applicants') {
                    $invs = DB::table('student_invoices')->whereIn('pmb_applicant_id', $ids)->pluck('id')->toArray();
                    if (!empty($invs)) {
                        DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invs)->delete();
                        DB::table('student_invoices')->whereIn('id', $invs)->delete();
                    }
                    DB::table('pmb_documents')->whereIn('pmb_applicant_id', $ids)->delete();
                } elseif ($table === 'student_invoices') {
                    DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $ids)->delete();
                    DB::table('winpay_transactions')->whereIn('student_invoice_id', $ids)->delete();
                    DB::table('fee_dispensations')->whereIn('student_invoice_id', $ids)->delete();
                } elseif ($table === 'krs_submissions') {
                    DB::table('krs_items')->whereIn('krs_submission_id', $ids)->delete();
                    $studentIds = DB::table('krs_submissions')->whereIn('id', $ids)->pluck('student_id')->toArray();
                    if (!empty($studentIds)) {
                        DB::table('class_enrollments')->whereIn('student_id', $studentIds)->delete();
                    }
                } elseif ($table === 'course_classes') {
                    DB::table('class_schedules')->whereIn('course_class_id', $ids)->delete();
                    DB::table('class_lecturers')->whereIn('course_class_id', $ids)->delete();
                    DB::table('class_enrollments')->whereIn('course_class_id', $ids)->delete();
                    $meetings = DB::table('class_meetings')->whereIn('course_class_id', $ids)->pluck('id')->toArray();
                    if (!empty($meetings)) {
                        if (DB::getSchemaBuilder()->hasTable('student_attendances')) {
                            DB::table('student_attendances')->whereIn('class_meeting_id', $meetings)->delete();
                        }
                        DB::table('attendances')->whereIn('class_meeting_id', $meetings)->delete();
                        DB::table('class_meetings')->whereIn('id', $meetings)->delete();
                    }
                }

                // Hapus baris data utama
                DB::table($table)->whereIn($pk, $ids)->delete();
                $this->resyncSequences();
            });

            $deletedCount = count($ids);

            // Catat audit log
            DB::table('audit_logs')->insert([
                'user_id' => Auth::id(),
                'action' => 'DATABASE_ROWS_DELETE',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => $table,
                'target_id' => implode(',', array_slice($ids, 0, 10)),
                'details' => json_encode(['count' => $deletedCount, 'ids' => $ids]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Berhasil menghapus {$deletedCount} data dari tabel '{$table}'.",
                'deleted_count' => $deletedCount,
            ]);
        } catch (\Exception $e) {
            Log::error("Delete Rows {$table} Error: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => "Gagal menghapus data tabel '{$table}': " . $e->getMessage()
            ], 500);
        }
    }
}
