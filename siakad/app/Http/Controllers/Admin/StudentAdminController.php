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
use Symfony\Component\HttpFoundation\StreamedResponse;

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
        $statusFilter = $request->input('status'); // all, active, inactive

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $studentsQuery = User::where('role', 'mahasiswa')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%")
                        ->orWhere('phone_number', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->when($yearFilter, function ($q) use ($yearFilter) {
                $prefix = substr($yearFilter, -2);
                $q->where(function ($sq) use ($prefix, $yearFilter) {
                    $sq->where('identity_number', 'like', "{$prefix}%")
                       ->orWhereYear('created_at', substr($yearFilter, 0, 4));
                });
            })
            ->when($statusFilter, function ($q) use ($statusFilter) {
                if ($statusFilter === 'active') {
                    $q->where('is_active', true);
                } elseif ($statusFilter === 'inactive') {
                    $q->where('is_active', false);
                }
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
            // Extract angkatan dari 2 digit awalan NIM
            $nimPrefix = substr(preg_replace('/[^0-9]/', '', $stu->identity_number ?? '21'), 0, 2);
            $stu->batch_year = strlen($nimPrefix) === 2 ? "20{$nimPrefix}" : '2021';
            return $stu;
        });

        // KPI Ringkasan
        $totalStudents = User::where('role', 'mahasiswa')->count();
        $activeStudents = User::where('role', 'mahasiswa')->where('is_active', true)->count();
        $inactiveStudents = $totalStudents - $activeStudents;
        
        $krsCompleted = 0;
        $paidInvoices = 0;
        try {
            $krsCompleted = DB::table('krs_submissions')
                ->where('academic_period_id', $activePeriod?->id ?? 1)
                ->where('status', 'DISETUJUI')
                ->distinct('student_id')
                ->count('student_id');

            $paidInvoices = DB::table('student_invoices')
                ->where('academic_period_id', $activePeriod?->id ?? 1)
                ->where('status', 'PAID')
                ->distinct('user_id')
                ->count('user_id');
        } catch (\Throwable $e) {}

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'activePeriod' => $activePeriod,
            'stats' => [
                'total' => $totalStudents,
                'active' => $activeStudents,
                'inactive' => $inactiveStudents,
                'krs_completed' => $krsCompleted,
                'paid_invoices' => $paidInvoices,
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
     * Hapus Data Mahasiswa
     */
    public function destroy(int $id): RedirectResponse
    {
        $student = User::where('role', 'mahasiswa')->findOrFail($id);
        $name = $student->name;
        $nim = $student->identity_number;

        try {
            $student->delete();
            return back()->with('success', "Data mahasiswa {$name} (NIM: {$nim}) berhasil dihapus dari sistem.");
        } catch (\Throwable $e) {
            // Jika ada relasi foreign key, nonaktifkan akun
            $student->update(['is_active' => false]);
            return back()->with('success', "Mahasiswa {$name} memiliki rekam akademik, status akun berhasil diubah menjadi NONAKTIF.");
        }
    }

    /**
     * Ekspor Data Mahasiswa ke CSV Sesuai Filter
     */
    public function export(Request $request): StreamedResponse
    {
        $search = $request->input('search');
        $yearFilter = $request->input('academic_year');
        $prodiFilter = $request->input('study_program');
        $statusFilter = $request->input('status');

        $studentsQuery = User::where('role', 'mahasiswa')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, fn($q) => $q->where('study_program', $prodiFilter))
            ->when($yearFilter, function ($q) use ($yearFilter) {
                $prefix = substr($yearFilter, -2);
                $q->where(function ($sq) use ($prefix, $yearFilter) {
                    $sq->where('identity_number', 'like', "{$prefix}%")
                       ->orWhereYear('created_at', substr($yearFilter, 0, 4));
                });
            })
            ->when($statusFilter, function ($q) use ($statusFilter) {
                if ($statusFilter === 'active') $q->where('is_active', true);
                elseif ($statusFilter === 'inactive') $q->where('is_active', false);
            });

        $students = $studentsQuery->orderBy('identity_number', 'asc')->get();

        $filename = 'data_mahasiswa_stai_alittihad_' . date('Ymd_His') . '.csv';

        return response()->streamDownload(function () use ($students) {
            $handle = fopen('php://output', 'w');
            // UTF-8 BOM agar rapi di Microsoft Excel
            fputs($handle, "\xEF\xBB\xBF");
            // Header baris
            fputcsv($handle, ['No', 'NIM', 'Nama Lengkap', 'Program Studi', 'Jenis Kelamin', 'Email', 'No Telepon', 'Status Akun', 'Tanggal Terdaftar']);

            $no = 1;
            foreach ($students as $stu) {
                fputcsv($handle, [
                    $no++,
                    $stu->identity_number ?: $stu->username,
                    $stu->name,
                    $stu->study_program ?: 'Pendidikan Agama Islam (S1)',
                    $stu->gender === 'P' ? 'Perempuan' : 'Laki-laki',
                    $stu->email,
                    $stu->phone_number ?: '-',
                    $stu->is_active ? 'Aktif' : 'Nonaktif',
                    $stu->created_at ? $stu->created_at->format('Y-m-d H:i') : '-',
                ]);
            }
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
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
        $skipped = 0;
        $now = now();

        DB::transaction(function () use ($records, &$created, &$skipped, $now) {
            foreach ($records as $r) {
                if (empty($r['name']) || empty($r['identity_number'])) {
                    $skipped++;
                    continue;
                }

                $nim = trim((string)$r['identity_number']);
                $email = !empty($r['email']) ? trim($r['email']) : strtolower(str_replace(' ', '', $nim)) . '@staialittihad.ac.id';

                if (User::where('identity_number', $nim)->orWhere('email', $email)->exists()) {
                    $skipped++;
                    continue;
                }

                User::create([
                    'name' => trim($r['name']),
                    'username' => $nim,
                    'identity_number' => $nim,
                    'email' => $email,
                    'role' => 'mahasiswa',
                    'study_program' => $r['study_program'] ?? 'Pendidikan Agama Islam (S1)',
                    'gender' => (!empty($r['gender']) && in_array(strtoupper($r['gender']), ['L', 'P'])) ? strtoupper($r['gender']) : 'L',
                    'phone_number' => $r['phone_number'] ?? null,
                    'password' => Hash::make('salam123'),
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $created++;
            }
        });

        $msg = "Berhasil mengimpor {$created} mahasiswa baru dengan password default 'salam123'.";
        if ($skipped > 0) {
            $msg .= " ({$skipped} data dilewati karena NIM/Email sudah terdaftar).";
        }

        return back()->with('success', $msg);
    }
}
