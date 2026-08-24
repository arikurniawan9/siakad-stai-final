<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentAdminController extends Controller
{
    /**
     * Tampilan Data Mahasiswa berdasarkan Tahun Akademik / Angkatan
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $yearFilter = $request->input('academic_year'); // e.g. 2026, 2025, 2024, 2023
        $prodiFilter = $request->input('study_program');
        $statusFilter = $request->input('status'); // AKTIF, CUTI, LULUS

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $studentsQuery = User::where('role', 'mahasiswa')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->when($yearFilter, function ($q) use ($yearFilter) {
                // Filter berdasarkan 2 digit awalan NIM (e.g. 21 -> 2021, 22 -> 2022, 26 -> 2026) atau created_at
                $prefix = substr($yearFilter, -2);
                $q->where(function ($sq) use ($prefix, $yearFilter) {
                    $sq->where('identity_number', 'like', "{$prefix}%")
                       ->orWhereYear('created_at', substr($yearFilter, 0, 4));
                });
            });

        $students = $studentsQuery->orderBy('identity_number', 'asc')->paginate(15)->withQueryString();

        // Status KRS & Tagihan
        $studentIds = $students->pluck('id')->toArray();
        $krsMap = DB::table('krs_submissions')
            ->whereIn('student_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'student_id');

        $invoiceMap = DB::table('student_invoices')
            ->whereIn('user_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'user_id');

        $students->getCollection()->transform(function ($stu) use ($krsMap, $invoiceMap) {
            $stu->krs_status = $krsMap[$stu->id] ?? 'BELUM_KRS';
            $stu->invoice_status = $invoiceMap[$stu->id] ?? 'LUNAS';
            // Extract angkatan
            $nimPrefix = substr($stu->identity_number ?? '21', 0, 2);
            $stu->batch_year = "20{$nimPrefix}";
            return $stu;
        });

        // KPI
        $totalStudents = User::where('role', 'mahasiswa')->count();
        $activeStudents = User::where('role', 'mahasiswa')->where('is_active', true)->count();

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'activePeriod' => $activePeriod,
            'stats' => [
                'total' => $totalStudents,
                'active' => $activeStudents,
            ],
            'filters' => [
                'search' => $search,
                'academic_year' => $yearFilter,
                'study_program' => $prodiFilter,
                'status' => $statusFilter,
            ],
        ]);
    }

    /**
     * Tambah Mahasiswa Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', 'unique:users,identity_number'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
        ]);

        User::create([
            'name' => $validated['name'],
            'username' => $validated['identity_number'],
            'identity_number' => $validated['identity_number'],
            'email' => $validated['email'],
            'role' => 'mahasiswa',
            'study_program' => $validated['study_program'],
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'password' => Hash::make('salam123'),
            'is_active' => true,
        ]);

        return back()->with('success', "Mahasiswa {$validated['name']} (NIM: {$validated['identity_number']}) berhasil didaftarkan.");
    }

    /**
     * Perbarui Data Mahasiswa
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $student = User::where('role', 'mahasiswa')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', Rule::unique('users')->ignore($student->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($student->id)],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $student->update($validated);

        return back()->with('success', "Data mahasiswa {$student->name} berhasil diperbarui.");
    }

    /**
     * Impor Massal Mahasiswa via Excel / Batch
     */
    public function importBatch(Request $request): RedirectResponse
    {
        $records = $request->input('records', []);
        if (empty($records)) {
            return back()->with('error', 'Tidak ada data mahasiswa yang diunggah.');
        }

        $created = 0;
        $now = now();

        DB::transaction(function () use ($records, &$created, $now) {
            foreach ($records as $r) {
                if (empty($r['name']) || empty($r['identity_number'])) continue;

                if (User::where('identity_number', $r['identity_number'])->orWhere('email', $r['email'])->exists()) {
                    continue;
                }

                User::create([
                    'name' => $r['name'],
                    'username' => $r['identity_number'],
                    'identity_number' => $r['identity_number'],
                    'email' => $r['email'],
                    'role' => 'mahasiswa',
                    'study_program' => $r['study_program'] ?? 'Pendidikan Agama Islam (S1)',
                    'gender' => $r['gender'] ?? 'L',
                    'phone_number' => $r['phone_number'] ?? null,
                    'password' => Hash::make('salam123'),
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $created++;
            }
        });

        return back()->with('success', "Berhasil mengimpor {$created} mahasiswa baru dengan password default 'salam123'.");
    }
}
