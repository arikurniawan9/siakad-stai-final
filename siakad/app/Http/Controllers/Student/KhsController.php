<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class KhsController extends Controller
{
    /**
     * Tampilkan Kartu Hasil Studi (KHS) Semester & Transkrip
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();

        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $selectedPeriodId = $request->input('period_id', $academicPeriods->first()?->id ?? 1);
        $selectedPeriod = $academicPeriods->where('id', $selectedPeriodId)->first();

        // Sample Data Nilai Semester
        $grades = [
            [
                'code' => 'PAI-301',
                'name' => 'Fiqih Mawaris',
                'credits' => 3,
                'attendance' => 95,
                'assignment' => 88,
                'mid_exam' => 85,
                'final_exam' => 90,
                'final_score' => 88.5,
                'grade_letter' => 'A',
                'grade_point' => 4.00,
            ],
            [
                'code' => 'PAI-101',
                'name' => "Ulumul Qur'an",
                'credits' => 2,
                'attendance' => 100,
                'assignment' => 85,
                'mid_exam' => 80,
                'final_exam' => 85,
                'final_score' => 85.0,
                'grade_letter' => 'A-',
                'grade_point' => 3.75,
            ],
            [
                'code' => 'MKU-101',
                'name' => 'Bahasa Arab Dasar',
                'credits' => 2,
                'attendance' => 90,
                'assignment' => 80,
                'mid_exam' => 75,
                'final_exam' => 80,
                'final_score' => 80.0,
                'grade_letter' => 'B+',
                'grade_point' => 3.50,
            ],
        ];

        // Kalkulasi IPS
        $totalQuality = 0;
        $totalSks = 0;
        foreach ($grades as $g) {
            $totalQuality += $g['credits'] * $g['grade_point'];
            $totalSks += $g['credits'];
        }
        $ips = $totalSks > 0 ? round($totalQuality / $totalSks, 2) : 0.00;

        $signatory = DB::table('institutional_signatories')
            ->where('document_type', 'KHS')
            ->where('is_active', true)
            ->first();

        return Inertia::render('Student/Khs/Index', [
            'academicPeriods' => $academicPeriods,
            'selectedPeriodId' => (int) $selectedPeriodId,
            'selectedPeriod' => $selectedPeriod,
            'grades' => $grades,
            'signatory' => $signatory,
            'summary' => [
                'semester_credits' => $totalSks,
                'semester_gpa' => $ips,
                'cumulative_credits' => 68,
                'cumulative_gpa' => 3.82,
                'qr_hash' => 'KHS-STAI-20261-21010042-' . md5($user->id . $selectedPeriodId . 'SECRET_SALT'),
            ],
        ]);
    }
}
