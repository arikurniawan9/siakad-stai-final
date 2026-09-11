<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GradeController extends Controller
{
    /**
     * Tampilkan Nilai Mata Kuliah & Komponen Asesmen Mahasiswa
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $selectedPeriodId = $request->input('period_id', $academicPeriods->firstWhere('is_active', true)?->id ?? $academicPeriods->first()?->id ?? 1);
        $selectedPeriod = $academicPeriods->firstWhere('id', $selectedPeriodId) ?? $academicPeriods->first();

        // Ambil data nilai mata kuliah semester aktif
        $grades = [
            [
                'code' => 'PAI-301',
                'name' => 'Fiqih Mawaris (Faroidh)',
                'credits' => 3,
                'lecturer' => 'Dr. H. M. Ridwan, M.Ag',
                'attendance_score' => 95.0,
                'assignment_score' => 88.0,
                'quiz_score' => 85.0,
                'mid_score' => 85.0,
                'final_score' => 90.0,
                'total_score' => 88.5,
                'grade_letter' => 'A',
                'grade_point' => 4.00,
                'status' => 'LULUS',
            ],
            [
                'code' => 'PAI-302',
                'name' => 'Sejarah Kebudayaan & Peradaban Islam',
                'credits' => 3,
                'lecturer' => 'Dra. Hj. Siti Maryam, M.Pd.I',
                'attendance_score' => 100.0,
                'assignment_score' => 85.0,
                'quiz_score' => 82.0,
                'mid_score' => 80.0,
                'final_score' => 85.0,
                'total_score' => 85.0,
                'grade_letter' => 'A-',
                'grade_point' => 3.75,
                'status' => 'LULUS',
            ],
            [
                'code' => 'PAI-303',
                'name' => 'Pengembangan Kurikulum PAI Berbasis OBE',
                'credits' => 3,
                'lecturer' => "Dr. Ahmad Syafi'i, M.Ag",
                'attendance_score' => 90.0,
                'assignment_score' => 90.0,
                'quiz_score' => 88.0,
                'mid_score' => 84.0,
                'final_score' => 88.0,
                'total_score' => 87.6,
                'grade_letter' => 'A',
                'grade_point' => 4.00,
                'status' => 'LULUS',
            ],
            [
                'code' => 'PAI-304',
                'name' => 'Strategi & Model Pembelajaran Aktif',
                'credits' => 3,
                'lecturer' => 'H. Mahfudz Siddiq, M.Pd',
                'attendance_score' => 92.0,
                'assignment_score' => 86.0,
                'quiz_score' => 84.0,
                'mid_score' => 82.0,
                'final_score' => 86.0,
                'total_score' => 85.4,
                'grade_letter' => 'A-',
                'grade_point' => 3.75,
                'status' => 'LULUS',
            ],
            [
                'code' => 'PAI-305',
                'name' => 'Media & Sumber Belajar Digital',
                'credits' => 3,
                'lecturer' => 'Budi Santoso, S.Kom, M.T',
                'attendance_score' => 98.0,
                'assignment_score' => 92.0,
                'quiz_score' => 90.0,
                'mid_score' => 90.0,
                'final_score' => 94.0,
                'total_score' => 92.4,
                'grade_letter' => 'A',
                'grade_point' => 4.00,
                'status' => 'LULUS',
            ],
        ];

        // Ringkasan
        $totalSks = array_sum(array_column($grades, 'credits'));
        $totalQuality = 0;
        foreach ($grades as $g) {
            $totalQuality += ($g['credits'] * $g['grade_point']);
        }
        $ips = $totalSks > 0 ? round($totalQuality / $totalSks, 2) : 0.00;

        return Inertia::render('Student/Grades/Index', [
            'academicPeriods' => $academicPeriods,
            'selectedPeriodId' => (int)$selectedPeriodId,
            'selectedPeriod' => $selectedPeriod,
            'grades' => $grades,
            'summary' => [
                'total_sks' => $totalSks,
                'ips' => $ips,
                'total_courses' => count($grades),
            ],
        ]);
    }
}
