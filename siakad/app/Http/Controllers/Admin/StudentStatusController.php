<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudentStatusController extends Controller
{
    /**
     * Tampilan Status Kuliah Mahasiswa & Pengajuan Cuti
     */
    public function index(Request $request): Response|JsonResponse
    {
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year');
        $statusType = $request->input('status_type');
        $search = $request->input('search');

        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

        $academicPeriods = DB::table('academic_periods')->orderBy('id', 'desc')->get();
        $activePeriod = $academicPeriods->firstWhere('is_active', true) ?? $academicPeriods->first();

        $prefix2 = $yearFilter ? substr($yearFilter, -2) : '';
        $prefix4 = $yearFilter ? substr($yearFilter, 0, 4) : '';

        $students = User::where('role', 'mahasiswa')
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', 'ilike', "%{$prodiFilter}%");
            })
            ->when($yearFilter, function ($q) use ($prefix2, $prefix4) {
                $q->where(function ($sq) use ($prefix2, $prefix4) {
                    $sq->where('identity_number', 'like', "{$prefix2}%")
                       ->orWhere('identity_number', 'like', "{$prefix4}%")
                       ->orWhereYear('created_at', $prefix4);
                });
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                       ->orWhere('identity_number', 'ilike', "%{$search}%");
                });
            })
            ->select('id', 'name', 'identity_number as nim', 'email', 'study_program', 'is_active', 'created_at')
            ->orderBy('identity_number', 'asc')
            ->get();

        $studentIds = $students->pluck('id')->toArray();

        $leaveRequests = DB::table('student_leave_requests')
            ->whereIn('student_id', $studentIds)
            ->get()
            ->keyBy('student_id');

        $mergedStudents = $students->map(function ($stu) use ($leaveRequests) {
            $leave = $leaveRequests->get($stu->id);
            $currentStatus = $leave ? $leave->status_type : ($stu->is_active ? 'AKTIF' : 'NON_AKTIF');

            return (object)[
                'id' => $stu->id,
                'nim' => $stu->nim,
                'name' => $stu->name,
                'email' => $stu->email,
                'study_program' => $stu->study_program,
                'status_type' => $currentStatus,
                'is_active' => (bool)$stu->is_active,
                'leave_id' => $leave?->id ?? null,
                'leave_reason' => $leave?->reason ?? null,
                'sk_number' => $leave?->sk_number ?? null,
            ];
        });

        if ($statusType) {
            $mergedStudents = $mergedStudents->where('status_type', $statusType)->values();
        }

        $stats = [
            'total' => $students->count(),
            'active' => $mergedStudents->where('status_type', 'AKTIF')->count(),
            'cuti' => $mergedStudents->where('status_type', 'CUTI')->count(),
            'non_active' => $mergedStudents->where('status_type', 'NON_AKTIF')->count(),
            'drop_out' => $mergedStudents->where('status_type', 'DROP_OUT')->count(),
            'graduated' => $mergedStudents->where('status_type', 'LULUS')->count(),
        ];

        return Inertia::render('Admin/StudentStatuses/Index', [
            'students' => $mergedStudents,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'academicPeriods' => $academicPeriods,
            'activePeriod' => $activePeriod,
            'stats' => $stats,
            'filters' => [
                'study_program' => $prodiFilter,
                'academic_year' => $yearFilter,
                'status_type' => $statusType,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Update Status Semester Mahasiswa (Cuti / Aktif / Non-Aktif)
     */
    public function updateStatus(Request $request): RedirectResponse|JsonResponse
    {
        $request->validate([
            'student_id' => 'required|exists:users,id',
            'status_type' => 'required|in:AKTIF,CUTI,NON_AKTIF,DROP_OUT,KELUAR,LULUS',
            'reason' => 'nullable|string',
            'sk_number' => 'nullable|string|max:100',
        ]);

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        DB::transaction(function () use ($request, $activePeriod) {
            $isActive = in_array($request->status_type, ['AKTIF']);

            User::where('id', $request->student_id)->update([
                'is_active' => $isActive,
                'updated_at' => now(),
            ]);

            DB::table('student_leave_requests')->updateOrInsert(
                [
                    'student_id' => $request->student_id,
                    'academic_period_id' => $activePeriod?->id ?? 1,
                ],
                [
                    'status_type' => $request->status_type,
                    'reason' => $request->reason,
                    'sk_number' => $request->sk_number,
                    'approval_status' => 'DISETUJUI',
                    'approved_by' => auth()->id() ?? 1,
                    'approved_at' => now(),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        });

        return back()->with('success', "Status semester mahasiswa berhasil diubah menjadi {$request->status_type}.");
    }
}
