<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\View\View;

class StudentAdminController extends Controller
{
    /**
     * Tampilan Data Mahasiswa berdasarkan Tahun Akademik / Angkatan
     */
    public function index(Request $request): Response|JsonResponse
    {
        $search = $request->input('search');
        $yearFilter = $request->input('academic_year'); // e.g. 2026, 2025, 2024, 2023
        $prodiFilter = $request->input('study_program');
        $statusFilter = $request->input('status'); // all, active, inactive
        $krsFilter = $request->input('krs_status'); // DISETUJUI, DIAJUKAN, BELUM_KRS
        $invoiceFilter = $request->input('invoice_status'); // LUNAS, BELUM_LUNAS
        $perPage = (int) $request->input('per_page', 15);

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'faculties.id', '=', 'study_programs.faculty_id')
            ->select('study_programs.*', 'faculties.name as faculty_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $batchYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

        $curricula = DB::table('curricula')
            ->leftJoin('study_programs', 'curricula.study_program_id', '=', 'study_programs.id')
            ->select(
                'curricula.id',
                'curricula.code',
                'curricula.name',
                'curricula.start_year',
                'curricula.total_credits_required',
                'curricula.study_program_id',
                'study_programs.name as study_program_name'
            )
            ->where('curricula.is_active', true)
            ->orderByDesc('curricula.start_year')
            ->get();

        $lecturers = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->select('id', 'name', 'identity_number', 'email')
            ->orderBy('name')
            ->get();

        // Selected Prodi Object
        $selectedProdiObj = null;
        if ($prodiFilter) {
            $selectedProdiObj = $studyPrograms->first(function ($p) use ($prodiFilter) {
                return (string)$p->id === (string)$prodiFilter || $p->code === $prodiFilter || $p->name === $prodiFilter;
            });
        }

        $isSelectionComplete = !empty($selectedProdiObj) && !empty($yearFilter);

        $students = null;
        $stats = [
            'total' => 0,
            'active' => 0,
            'inactive' => 0,
            'krs_completed' => 0,
            'paid_invoices' => 0,
        ];

        if ($isSelectionComplete) {
            $studentsQuery = User::where('role', 'mahasiswa')
                ->when($selectedProdiObj, function ($q) use ($selectedProdiObj) {
                    $q->where(function ($sq) use ($selectedProdiObj) {
                        $sq->where('study_program', $selectedProdiObj->name)
                           ->orWhere('study_program', "{$selectedProdiObj->name} ({$selectedProdiObj->degree})")
                           ->orWhere('study_program', 'ilike', "%{$selectedProdiObj->name}%")
                           ->orWhere('study_program', 'ilike', "%{$selectedProdiObj->code}%");
                    });
                })
                ->when($yearFilter, function ($q) use ($yearFilter) {
                    $prefix2 = substr($yearFilter, -2);
                    $prefix4 = substr($yearFilter, 0, 4);
                    $q->where(function ($sq) use ($prefix2, $prefix4) {
                        $sq->where('identity_number', 'like', "{$prefix2}%")
                           ->orWhere('identity_number', 'like', "{$prefix4}%")
                           ->orWhereYear('created_at', $prefix4);
                    });
                })
                ->when($search, function ($q) use ($search) {
                    $q->where(function ($sq) use ($search) {
                        $sq->where('name', 'ilike', "%{$search}%")
                            ->orWhere('identity_number', 'ilike', "%{$search}%")
                            ->orWhere('nik', 'ilike', "%{$search}%")
                            ->orWhere('username', 'ilike', "%{$search}%")
                            ->orWhere('email', 'ilike', "%{$search}%")
                            ->orWhere('phone_number', 'ilike', "%{$search}%");
                    });
                })
                ->when($statusFilter, function ($q) use ($statusFilter) {
                    if ($statusFilter === 'active') {
                        $q->where('is_active', true);
                    } elseif ($statusFilter === 'inactive') {
                        $q->where('is_active', false);
                    }
                })
                ->when($krsFilter, function ($q) use ($krsFilter, $activePeriod) {
                    if ($krsFilter === 'BELUM_KRS') {
                        $submittedIds = DB::table('krs_submissions')
                            ->where('academic_period_id', $activePeriod?->id ?? 1)
                            ->pluck('student_id');
                        $q->whereNotIn('id', $submittedIds);
                    } else {
                        $targetIds = DB::table('krs_submissions')
                            ->where('academic_period_id', $activePeriod?->id ?? 1)
                            ->where('status', $krsFilter)
                            ->pluck('student_id');
                        $q->whereIn('id', $targetIds);
                    }
                })
                ->when($invoiceFilter, function ($q) use ($invoiceFilter, $activePeriod) {
                    if ($invoiceFilter === 'LUNAS') {
                        $paidIds = DB::table('student_invoices')
                            ->where('academic_period_id', $activePeriod?->id ?? 1)
                            ->where('status', 'PAID')
                            ->pluck('user_id');
                        $q->whereIn('id', $paidIds);
                    } elseif ($invoiceFilter === 'BELUM_LUNAS') {
                        $paidIds = DB::table('student_invoices')
                            ->where('academic_period_id', $activePeriod?->id ?? 1)
                            ->where('status', 'PAID')
                            ->pluck('user_id');
                        $q->whereNotIn('id', $paidIds);
                    }
                });

            $students = $studentsQuery->orderBy('identity_number', 'asc')->paginate($perPage)->withQueryString();

            // Status KRS, Tagihan, Kurikulum & Dosen Wali Maps
            $studentIds = $students->pluck('id')->toArray();
            $krsMap = DB::table('krs_submissions')
                ->whereIn('student_id', $studentIds)
                ->where('academic_period_id', $activePeriod?->id ?? 1)
                ->pluck('status', 'student_id');

            $invoiceMap = DB::table('student_invoices')
                ->whereIn('user_id', $studentIds)
                ->where('academic_period_id', $activePeriod?->id ?? 1)
                ->pluck('status', 'user_id');

            $curriculaMap = $curricula->keyBy('id');
            $advisorMap = $lecturers->keyBy('id');

            $students->getCollection()->transform(function ($stu) use ($krsMap, $invoiceMap, $curriculaMap, $advisorMap) {
                $stu->krs_status = $krsMap[$stu->id] ?? 'BELUM_KRS';
                $stu->invoice_status = $invoiceMap[$stu->id] ?? 'LUNAS';
                $stu->curriculum = $stu->curriculum_id ? ($curriculaMap[$stu->curriculum_id] ?? null) : null;
                $stu->advisor = $stu->academic_advisor_id ? ($advisorMap[$stu->academic_advisor_id] ?? null) : null;
                $nimDigits = preg_replace('/[^0-9]/', '', $stu->identity_number ?? '21');
                $nimPrefix = substr($nimDigits, 0, 2);
                $stu->batch_year = strlen($nimPrefix) === 2 ? "20{$nimPrefix}" : '2021';
                return $stu;
            });

            // Specific KPI for selection
            $totalInBatch = (clone $studentsQuery)->count();
            $activeInBatch = (clone $studentsQuery)->where('is_active', true)->count();
            $inactiveInBatch = $totalInBatch - $activeInBatch;

            $stats = [
                'total' => $totalInBatch,
                'active' => $activeInBatch,
                'inactive' => $inactiveInBatch,
                'krs_completed' => DB::table('krs_submissions')
                    ->whereIn('student_id', $studentIds)
                    ->where('academic_period_id', $activePeriod?->id ?? 1)
                    ->where('status', 'DISETUJUI')
                    ->distinct('student_id')
                    ->count('student_id'),
                'paid_invoices' => DB::table('student_invoices')
                    ->whereIn('user_id', $studentIds)
                    ->where('academic_period_id', $activePeriod?->id ?? 1)
                    ->where('status', 'PAID')
                    ->distinct('user_id')
                    ->count('user_id'),
            ];
        }

        if ($request->input('format') === 'json' && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'students' => $students,
                'stats' => $stats,
                'isSelectionComplete' => $isSelectionComplete,
                'selectedProdiObj' => $selectedProdiObj,
            ]);
        }

        return Inertia::render('Admin/Students/Index', [
            'students' => $students,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'batchYears' => $batchYears,
            'activePeriod' => $activePeriod,
            'curricula' => $curricula,
            'lecturers' => $lecturers,
            'initialTab' => $request->input('tab', 'students'),
            'isSelectionComplete' => $isSelectionComplete,
            'selectedProdiObj' => $selectedProdiObj,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'academic_year' => $yearFilter ?: '',
                'study_program' => $prodiFilter ?: '',
                'status' => $statusFilter ?: '',
                'krs_status' => $krsFilter ?: '',
                'invoice_status' => $invoiceFilter ?: '',
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Hapus Massal Data Mahasiswa (Bulk Delete)
     */
    public function bulkDestroy(Request $request): RedirectResponse
    {
        $ids = $request->input('ids', []);
        if (empty($ids) || !is_array($ids)) {
            return back()->with('error', 'Tidak ada data mahasiswa yang dipilih.');
        }

        $count = 0;
        foreach ($ids as $id) {
            $student = User::where('role', 'mahasiswa')->find($id);
            if ($student) {
                try {
                    $student->delete();
                    $count++;
                } catch (\Throwable $e) {
                    $student->update(['is_active' => false]);
                    $count++;
                }
            }
        }

        return back()->with('success', "Berhasil menghapus {$count} data mahasiswa terpilih secara massal.");
    }

    /**
     * Tambah Mahasiswa Baru Tunggal
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', 'unique:users,identity_number'],
            'nik' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
        ]);

        User::create([
            'name' => $validated['name'],
            'username' => $validated['identity_number'],
            'identity_number' => $validated['identity_number'],
            'nik' => $validated['nik'] ?: null,
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
     * Perbarui Data Mahasiswa Tunggal
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $student = User::where('role', 'mahasiswa')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', Rule::unique('users')->ignore($student->id)],
            'nik' => ['nullable', 'string', 'max:20'],
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
     * Hapus Data Mahasiswa Tunggal
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
            $student->update(['is_active' => false]);
            return back()->with('success', "Mahasiswa {$name} memiliki rekam akademik, status akun berhasil diubah menjadi NONAKTIF.");
        }
    }

    /**
     * Helper Query Filter Data Mahasiswa
     */
    private function buildStudentsQuery(Request $request)
    {
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $yearFilter = $request->input('academic_year');
        $statusFilter = $request->input('status');

        return User::where('role', 'mahasiswa')
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where(function ($sq) use ($prodiFilter) {
                    $sq->where('study_program', $prodiFilter)
                       ->orWhere('study_program', 'ilike', "%{$prodiFilter}%");
                });
            })
            ->when($yearFilter, function ($q) use ($yearFilter) {
                $prefix2 = substr($yearFilter, -2);
                $prefix4 = substr($yearFilter, 0, 4);
                $q->where(function ($sq) use ($prefix2, $prefix4) {
                    $sq->where('identity_number', 'like', "{$prefix2}%")
                       ->orWhere('identity_number', 'like', "{$prefix4}%")
                       ->orWhereYear('created_at', $prefix4);
                });
            })
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('nik', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%")
                        ->orWhere('phone_number', 'ilike', "%{$search}%");
                });
            })
            ->when($statusFilter, function ($q) use ($statusFilter) {
                if ($statusFilter === 'active') {
                    $q->where('is_active', true);
                } elseif ($statusFilter === 'inactive') {
                    $q->where('is_active', false);
                }
            });
    }

    /**
     * Ekspor Data Mahasiswa ke Format Excel (.xls) dengan KOP Resmi STAI Al-Ittihad
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $students = $this->buildStudentsQuery($request)->orderBy('identity_number', 'asc')->get();
        $prodi = $request->input('study_program');
        $year = $request->input('academic_year');
        $filename = 'data-mahasiswa-stai-al-ittihad-' . date('Ymd_His') . '.xls';

        $response = new StreamedResponse(function () use ($students, $prodi, $year) {
            $out = fopen('php://output', 'w');

            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
            echo '<style>
                body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11px; }
                table { border-collapse: collapse; width: 100%; }
                th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #047857; padding: 9px 8px; text-align: center; font-size: 11px; }
                td { border: 1px solid #d1d5db; padding: 7px 8px; vertical-align: middle; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-mono { font-family: "Consolas", monospace; mso-number-format:"\@"; }
                .zebra { background-color: #f9fafb; }
                .header-title { font-size: 15px; font-weight: 900; color: #065f46; }
                .badge-active { background-color: #d1fae5; color: #065f46; font-weight: bold; }
                .badge-inactive { background-color: #fee2e2; color: #991b1b; }
            </style></head><body>';

            echo '<table>';
            echo '<tr><td colspan="9" class="header-title" style="border:none; text-align:center;">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="9" style="border:none; text-align:center; font-weight:bold; font-size:12px;">DAFTAR RESMI BUKU INDUK & DATA MAHASISWA</td></tr>';
            $metaText = ($prodi ? "Prodi: {$prodi}" : "Semua Prodi") . " • " . ($year ? "Angkatan: {$year}" : "Semua Angkatan") . " • Tanggal Ekspor: " . date('d F Y, H:i') . " WIB • Total: " . $students->count() . " Mahasiswa";
            echo '<tr><td colspan="9" style="border:none; text-align:center; font-size:10px; color:#4b5563;">' . $metaText . '</td></tr>';
            echo '<tr><td colspan="9" style="border:none; height:12px;"></td></tr>';

            echo '<tr>';
            echo '<th style="width:40px;">No</th>';
            echo '<th style="width:130px;">NIM</th>';
            echo '<th style="width:160px;">No. KTP / NIK</th>';
            echo '<th style="width:240px;">Nama Lengkap Mahasiswa</th>';
            echo '<th style="width:50px;">L/P</th>';
            echo '<th style="width:200px;">Program Studi</th>';
            echo '<th style="width:200px;">Email Mahasiswa</th>';
            echo '<th style="width:130px;">No. HP / WA</th>';
            echo '<th style="width:90px;">Status</th>';
            echo '</tr>';

            $no = 1;
            foreach ($students as $stu) {
                $isZebra = ($no % 2 === 0) ? 'class="zebra"' : '';
                $statusText = $stu->is_active ? 'Aktif' : 'Nonaktif';
                $statusClass = $stu->is_active ? 'badge-active' : 'badge-inactive';
                $nim = $stu->identity_number ?: $stu->username;

                echo "<tr {$isZebra}>";
                echo "<td class='text-center'>{$no}</td>";
                echo "<td class='font-mono text-center'><strong>{$nim}</strong></td>";
                echo "<td class='font-mono text-center'>{$stu->nik}</td>";
                echo "<td>{$stu->name}</td>";
                echo "<td class='text-center'>{$stu->gender}</td>";
                echo "<td>{$stu->study_program}</td>";
                echo "<td>{$stu->email}</td>";
                echo "<td class='font-mono text-center'>{$stu->phone_number}</td>";
                echo "<td class='text-center {$statusClass}'>{$statusText}</td>";
                echo '</tr>';
                $no++;
            }

            echo '</table></body></html>';
            fclose($out);
        });

        $response->headers->set('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");
        $response->headers->set('Cache-Control', 'max-age=0');
        $response->headers->set('Pragma', 'public');

        return $response;
    }

    /**
     * Cetak Pratinjau Dokumen PDF Resmi Rekap Data Mahasiswa Ber-KOP
     */
    public function printPdf(Request $request): View
    {
        $students = $this->buildStudentsQuery($request)->orderBy('identity_number', 'asc')->get();
        $prodi = $request->input('study_program');
        $year = $request->input('academic_year');
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        return view('pdf.students', [
            'students' => $students,
            'studyProgram' => $prodi,
            'academicYear' => $year,
            'activePeriod' => $activePeriod,
        ]);
    }

    /**
     * Unduh Template Resmi Impor Excel Mahasiswa (.xlsx)
     */
    public function templateExcel(Request $request): BinaryFileResponse
    {
        $filePath = public_path('templates/template-impor-mahasiswa-stai.xlsx');
        if (!file_exists($filePath)) {
            abort(404, 'File template belum tersedia.');
        }

        return response()->download($filePath, 'template_impor_mahasiswa_stai_alittihad.xlsx', [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * Validasi Data Sebelum Impor Mahasiswa (Check & Analyze)
     */
    public function checkImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        if (empty($records)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada data rekaman mahasiswa untuk dianalisis.'
            ], 422);
        }

        $analyzed = [];
        $readyCount = 0;
        $conflictCount = 0;
        $invalidCount = 0;

        foreach ($records as $rec) {
            $nim = trim($rec['identity_number'] ?? '');
            $name = trim($rec['name'] ?? '');
            $nik = trim($rec['nik'] ?? '');
            $email = trim($rec['email'] ?? '');
            $prodi = trim($rec['study_program'] ?? '');
            $gender = strtoupper(trim($rec['gender'] ?? 'L')) === 'P' ? 'P' : 'L';
            $phone = trim($rec['phone_number'] ?? '');

            if (empty($nim) || empty($name)) {
                $status = 'invalid';
                $message = 'NIM dan Nama Lengkap wajib diisi.';
                $invalidCount++;
            } else {
                $existing = User::where('role', 'mahasiswa')
                    ->where(function ($q) use ($nim, $nik) {
                        $q->where('identity_number', $nim)
                          ->orWhere('username', $nim);
                        if (!empty($nik)) {
                            $q->orWhere('nik', $nik);
                        }
                    })->first();

                if ($existing) {
                    $status = 'conflict';
                    $message = "Mahasiswa dengan NIM/NIK ini sudah ada di database ({$existing->name}).";
                    $conflictCount++;
                } else {
                    $status = 'ready';
                    $message = 'Data valid & siap diimpor.';
                    $readyCount++;
                }
            }

            $analyzed[] = [
                'identity_number' => $nim,
                'nik' => $nik,
                'name' => $name,
                'gender' => $gender,
                'study_program' => $prodi,
                'email' => $email ?: ($nim ? "{$nim}@staialittihad.ac.id" : ''),
                'phone_number' => $phone,
                'status' => $status,
                'message' => $message,
            ];
        }

        return response()->json([
            'success' => true,
            'summary' => [
                'total' => count($records),
                'ready' => $readyCount,
                'conflicts' => $conflictCount,
                'invalid' => $invalidCount,
                'new_count' => $readyCount,
                'duplicate_count' => $conflictCount,
            ],
            'analyzed' => $analyzed,
        ]);
    }

    /**
     * Eksekusi Proses Impor Mahasiswa Massal
     */
    public function processImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        $conflictMode = $request->input('conflict_mode', 'skip'); // 'skip' atau 'overwrite'

        if (empty($records)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada rekaman untuk diproses.'
            ], 422);
        }

        $inserted = 0;
        $updated = 0;
        $skipped = 0;

        DB::beginTransaction();
        try {
            foreach ($records as $rec) {
                $nim = trim($rec['identity_number'] ?? '');
                $name = trim($rec['name'] ?? '');
                $nik = trim($rec['nik'] ?? '');
                $email = trim($rec['email'] ?? '');
                $prodi = trim($rec['study_program'] ?? 'Pendidikan Agama Islam (S1)');
                $gender = strtoupper(trim($rec['gender'] ?? 'L')) === 'P' ? 'P' : 'L';
                $phone = trim($rec['phone_number'] ?? '');

                if (empty($nim) || empty($name)) {
                    $skipped++;
                    continue;
                }

                $existing = User::where('role', 'mahasiswa')
                    ->where(function ($q) use ($nim) {
                        $q->where('identity_number', $nim)->orWhere('username', $nim);
                    })->first();

                if ($existing) {
                    if ($conflictMode === 'overwrite') {
                        $existing->update([
                            'name' => $name,
                            'nik' => $nik ?: $existing->nik,
                            'gender' => $gender,
                            'study_program' => $prodi,
                            'phone_number' => $phone ?: $existing->phone_number,
                            'email' => $email ?: $existing->email,
                            'is_active' => true,
                        ]);
                        $updated++;
                    } else {
                        $skipped++;
                    }
                } else {
                    $finalEmail = $email ?: "{$nim}@staialittihad.ac.id";
                    if (User::where('email', $finalEmail)->exists()) {
                        $finalEmail = "{$nim}." . time() . "@staialittihad.ac.id";
                    }

                    User::create([
                        'name' => $name,
                        'username' => $nim,
                        'identity_number' => $nim,
                        'nik' => $nik ?: null,
                        'email' => $finalEmail,
                        'password' => Hash::make('salam123'),
                        'role' => 'mahasiswa',
                        'gender' => $gender,
                        'study_program' => $prodi,
                        'phone_number' => $phone ?: null,
                        'is_active' => true,
                    ]);
                    $inserted++;
                }
            }

            DB::commit();

            // Catat audit log
            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'STUDENT_IMPORT_BATCH',
                'target_entity' => 'User (Mahasiswa)',
                'details' => json_encode([
                    'total_records' => count($records),
                    'inserted' => $inserted,
                    'updated' => $updated,
                    'skipped' => $skipped,
                    'conflict_mode' => $conflictMode,
                ]),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Proses impor selesai! {$inserted} mahasiswa baru ditambahkan, {$updated} diperbarui, {$skipped} dilewati.",
                'inserted' => $inserted,
                'updated' => $updated,
                'skipped' => $skipped,
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses impor: ' . $e->getMessage()
            ], 500);
        }
    }
}
