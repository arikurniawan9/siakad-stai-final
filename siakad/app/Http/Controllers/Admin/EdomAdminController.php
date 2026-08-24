<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EdomAdminController extends Controller
{
    /**
     * Tampilan Dashboard Evaluasi Dosen oleh Mahasiswa (EDOM)
     */
    public function index(Request $request): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        // Ambil semua dosen
        $lecturers = DB::table('users')
            ->whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->select('id', 'name', 'identity_number as nidn', 'email', 'study_program')
            ->get();

        // Rekapitulasi Skor 4 Kompetensi
        $lecturersWithScores = $lecturers->map(function ($lec) {
            // Mock realistic EDOM evaluations from 25 respondents per lecturer
            $seed = crc32($lec->nidn ?? $lec->name);
            $pedagogik = round(3.5 + (($seed % 40) / 100), 2); // 3.50 - 3.90
            $profesional = round(3.6 + ((($seed * 3) % 35) / 100), 2);
            $kepribadian = round(3.7 + ((($seed * 7) % 28) / 100), 2);
            $sosial = round(3.55 + ((($seed * 11) % 38) / 100), 2);
            $overall = round(($pedagogik + $profesional + $kepribadian + $sosial) / 4, 2);

            $lec->respondent_count = 28;
            $lec->score_pedagogik = $pedagogik;
            $lec->score_profesional = $profesional;
            $lec->score_kepribadian = $kepribadian;
            $lec->score_sosial = $sosial;
            $lec->overall_score = $overall;

            $lec->predicate = $overall >= 3.75 ? 'Sangat Baik (A)' : ($overall >= 3.25 ? 'Baik (B)' : 'Cukup (C)');

            return $lec;
        })->sortByDesc('overall_score')->values();

        $overallAverage = round($lecturersWithScores->avg('overall_score'), 2);

        return Inertia::render('Admin/Edom/Index', [
            'activePeriod' => $activePeriod,
            'lecturers' => $lecturersWithScores,
            'stats' => [
                'total_lecturers' => count($lecturersWithScores),
                'overall_average' => $overallAverage,
                'total_respondents' => count($lecturersWithScores) * 28,
            ],
        ]);
    }

    /**
     * Tampilan Detail Hasil EDOM per Dosen
     */
    public function show(int $lecturerId): Response
    {
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $lecturer = DB::table('users')->where('id', $lecturerId)->first();
        if (!$lecturer) {
            abort(404);
        }

        // Skor 4 Kompetensi
        $seed = crc32($lecturer->identity_number ?? $lecturer->name);
        $pedagogik = round(3.5 + (($seed % 40) / 100), 2);
        $profesional = round(3.6 + ((($seed * 3) % 35) / 100), 2);
        $kepribadian = round(3.7 + ((($seed * 7) % 28) / 100), 2);
        $sosial = round(3.55 + ((($seed * 11) % 38) / 100), 2);
        $overall = round(($pedagogik + $profesional + $kepribadian + $sosial) / 4, 2);

        // Feedback kualitatif mahasiswa (100% anonim)
        $feedbackList = [
            [
                'aspect' => 'Pedagogik',
                'comment' => 'Penyampaian materi sangat runut dan mudah dipahami. Penggunaan proyektor dan studi kasus aktual sangat membantu.',
                'date' => '20 Agustus 2026',
            ],
            [
                'aspect' => 'Kepribadian',
                'comment' => 'Dosen sangat disiplin waktu dan memberikan apresiasi tinggi terhadap keaktifan mahasiswa di kelas.',
                'date' => '18 Agustus 2026',
            ],
            [
                'aspect' => 'Sosial',
                'comment' => 'Sangat ramah saat bimbingan makalah dan terbuka untuk diskusi di luar jam kuliah.',
                'date' => '15 Agustus 2026',
            ],
            [
                'aspect' => 'Profesional',
                'comment' => 'Bahan rujukan kitab turats dan jurnal ilmiah internasional yang diberikan sangat komprehensif.',
                'date' => '12 Agustus 2026',
            ],
        ];

        return Inertia::render('Admin/Edom/Show', [
            'activePeriod' => $activePeriod,
            'lecturer' => [
                'id' => $lecturer->id,
                'name' => $lecturer->name,
                'nidn' => $lecturer->identity_number ?? '2112087501',
                'email' => $lecturer->email,
                'study_program' => $lecturer->study_program ?? 'Pendidikan Agama Islam (S1)',
                'scores' => [
                    'pedagogik' => $pedagogik,
                    'profesional' => $profesional,
                    'kepribadian' => $kepribadian,
                    'sosial' => $sosial,
                    'overall' => $overall,
                ],
                'respondent_count' => 28,
            ],
            'feedbackList' => $feedbackList,
        ]);
    }
}
