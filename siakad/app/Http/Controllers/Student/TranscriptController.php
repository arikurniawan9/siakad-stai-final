<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TranscriptController extends Controller
{
    /**
     * Tampilkan Transkrip Nilai Akademik Kumulatif 8 Semester Mahasiswa
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        // 8 Semester Kurikulum Lengkap & Sebaran Matakuliah
        $semesterBuckets = [
            1 => [
                'name' => 'Semester I (Ganjil)',
                'courses' => [
                    ['code' => 'MKU-101', 'name' => 'Pancasila & Kewarganegaraan', 'credits' => 2, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'MKU-102', 'name' => 'Bahasa Indonesia Akademik', 'credits' => 2, 'score' => 85, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-101', 'name' => "Ulumul Qur'an", 'credits' => 3, 'score' => 92, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-102', 'name' => 'Ulumul Hadits', 'credits' => 3, 'score' => 86, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-103', 'name' => 'Ilmu Pendidikan Islam', 'credits' => 3, 'score' => 84, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-104', 'name' => 'Bahasa Arab I (Nahwu & Sharaf)', 'credits' => 3, 'score' => 80, 'grade' => 'B+', 'point' => 3.50],
                    ['code' => 'MKU-103', 'name' => 'Pengantar Teknologi Informasi', 'credits' => 2, 'score' => 90, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
            2 => [
                'name' => 'Semester II (Genap)',
                'courses' => [
                    ['code' => 'PAI-201', 'name' => 'Tafsir Tarbawi', 'credits' => 3, 'score' => 87, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-202', 'name' => 'Hadits Tarbawi', 'credits' => 3, 'score' => 85, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-203', 'name' => 'Filsafat Pendidikan Islam', 'credits' => 3, 'score' => 83, 'grade' => 'B+', 'point' => 3.50],
                    ['code' => 'PAI-204', 'name' => 'Ushul Fiqih Dasar', 'credits' => 3, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-205', 'name' => 'Psikologi Perkembangan Peserta Didik', 'credits' => 3, 'score' => 89, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-206', 'name' => 'Bahasa Arab II (Muhadatsah)', 'credits' => 3, 'score' => 82, 'grade' => 'B+', 'point' => 3.50],
                ]
            ],
            3 => [
                'name' => 'Semester III (Ganjil)',
                'courses' => [
                    ['code' => 'PAI-301', 'name' => 'Fiqih Mawaris (Faroidh)', 'credits' => 3, 'score' => 90, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-302', 'name' => 'Sejarah Kebudayaan & Peradaban Islam', 'credits' => 3, 'score' => 85, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-303', 'name' => 'Pengembangan Kurikulum PAI', 'credits' => 3, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-304', 'name' => 'Strategi & Model Pembelajaran PAI', 'credits' => 3, 'score' => 91, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-305', 'name' => 'Media & Sumber Belajar Digital', 'credits' => 3, 'score' => 94, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'MKU-201', 'name' => 'Metode Studi Islam', 'credits' => 2, 'score' => 84, 'grade' => 'A-', 'point' => 3.75],
                ]
            ],
            4 => [
                'name' => 'Semester IV (Genap)',
                'courses' => [
                    ['code' => 'PAI-401', 'name' => 'Evaluasi Pembelajaran PAI & Asesmen OBE', 'credits' => 3, 'score' => 89, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-402', 'name' => 'Perencanaan Pembelajaran PAI (RPP/RPS)', 'credits' => 3, 'score' => 87, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-403', 'name' => 'Bimbingan & Konseling Sekolah', 'credits' => 2, 'score' => 86, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-404', 'name' => 'Statistik Pendidikan', 'credits' => 3, 'score' => 82, 'grade' => 'B+', 'point' => 3.50],
                    ['code' => 'PAI-405', 'name' => 'Sosiologi & Antropologi Pendidikan', 'credits' => 2, 'score' => 85, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-406', 'name' => 'Metodologi Penelitian Kualitatif', 'credits' => 3, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
            5 => [
                'name' => 'Semester V (Ganjil)',
                'courses' => [
                    ['code' => 'PAI-501', 'name' => 'Metodologi Penelitian Kuantitatif & PTK', 'credits' => 3, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-502', 'name' => 'Microteaching / Praktik Pembelajaran Terbimbing', 'credits' => 3, 'score' => 93, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-503', 'name' => 'Kewirausahaan Berbasis Syariah', 'credits' => 2, 'score' => 87, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-504', 'name' => 'Pendidikan Inklusi & Multikultural', 'credits' => 2, 'score' => 85, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-505', 'name' => 'Manajemen Berbasis Madrasah/Sekolah', 'credits' => 3, 'score' => 86, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-506', 'name' => 'Etika Profesi Keguruan', 'credits' => 2, 'score' => 90, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
            6 => [
                'name' => 'Semester VI (Genap)',
                'courses' => [
                    ['code' => 'MBKM-601', 'name' => 'Program Kampus Mengajar / Magang Mandiri', 'credits' => 6, 'score' => 95, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-601', 'name' => 'Kajian Teks Kitab Turats Pendidikan', 'credits' => 3, 'score' => 84, 'grade' => 'A-', 'point' => 3.75],
                    ['code' => 'PAI-602', 'name' => 'Seminar Proposal Penelitian Pendidikan Islam', 'credits' => 3, 'score' => 90, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-603', 'name' => 'Desain Modul Ajar Kurikulum Merdeka', 'credits' => 3, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
            7 => [
                'name' => 'Semester VII (Ganjil)',
                'courses' => [
                    ['code' => 'KKN-701', 'name' => 'Kuliah Kerja Nyata (KKN) Tematik Kolaboratif', 'credits' => 4, 'score' => 94, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PLP-701', 'name' => 'Pengenalan Lapangan Persekolahan (PLP II)', 'credits' => 4, 'score' => 92, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-701', 'name' => 'Kapita Selekta Pendidikan Kontemporer', 'credits' => 2, 'score' => 87, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'PAI-702', 'name' => 'Bimbingan Skripsi Tahap I (Bab I-III)', 'credits' => 2, 'score' => 88, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
            8 => [
                'name' => 'Semester VIII (Genap)',
                'courses' => [
                    ['code' => 'SKR-801', 'name' => 'Skripsi / Tugas Akhir Sarjana Pendidikan (S.Pd)', 'credits' => 6, 'score' => 92, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'SKR-802', 'name' => 'Ujian Komprehensif Keislaman & Keguruan', 'credits' => 2, 'score' => 90, 'grade' => 'A', 'point' => 4.00],
                    ['code' => 'MKU-801', 'name' => 'Publikasi Jurnal Ilmiah / Prosiding Nasional', 'credits' => 2, 'score' => 95, 'grade' => 'A', 'point' => 4.00],
                ]
            ],
        ];

        // Hitung akumulasi SKS dan IPK
        $totalCredits = 0;
        $totalPoints = 0;
        $totalCourses = 0;

        foreach ($semesterBuckets as $semNum => &$semData) {
            $semSks = 0;
            $semPoints = 0;
            foreach ($semData['courses'] as $c) {
                $semSks += $c['credits'];
                $semPoints += ($c['credits'] * $c['point']);
                $totalCourses++;
            }
            $semData['semester_credits'] = $semSks;
            $semData['semester_ips'] = $semSks > 0 ? round($semPoints / $semSks, 2) : 0.00;

            $totalCredits += $semSks;
            $totalPoints += $semPoints;
        }

        $ipk = $totalCredits > 0 ? round($totalPoints / $totalCredits, 2) : 0.00;

        // Predikat Kelulusan
        $predicate = 'Memuaskan';
        if ($ipk >= 3.75) {
            $predicate = 'Dengan Pujian (Cum Laude)';
        } elseif ($ipk >= 3.50) {
            $predicate = 'Sangat Memuaskan';
        }

        // Tanda tangan pejabat pengesah transkrip
        $signatory = DB::table('institutional_signatories')
            ->where('document_type', 'TRANSKRIP')
            ->where('is_active', true)
            ->first() ?? (object)[
                'official_name' => 'Prof. Dr. KH. Abdul Halim, M.A.',
                'official_nip' => '196803151994031002',
                'structural_position' => 'Ketua STAI Al-Ittihad Cianjur',
            ];

        return Inertia::render('Student/Transcripts/Index', [
            'student' => [
                'id' => $user->id,
                'name' => $user->name,
                'nim' => $user->identity_number ?: '21010042',
                'nik' => $user->nik ?: '3203010508020003',
                'place_birth' => 'Cianjur',
                'date_birth' => '15 Agustus 2002',
                'faculty' => 'Tarbiyah dan Keguruan',
                'study_program' => $user->study_program ?: 'Pendidikan Agama Islam (S1)',
                'degree' => 'Sarjana Pendidikan (S.Pd)',
                'entry_year' => '2021',
            ],
            'semesters' => $semesterBuckets,
            'summary' => [
                'total_credits' => $totalCredits,
                'required_credits' => 144,
                'ipk' => $ipk,
                'total_courses' => $totalCourses,
                'predicate' => $predicate,
            ],
            'signatory' => $signatory,
        ]);
    }
}
