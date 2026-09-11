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
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LecturerAdminController extends Controller
{
    /**
     * Tampilan Data Dosen berdasarkan Tahun Akademik & Homebase
     */
    public function index(Request $request): Response|JsonResponse
    {
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $roleFilter = $request->input('role');

        $academicYears = DB::table('academic_years')->orderBy('code', 'desc')->get();
        $studyPrograms = DB::table('study_programs')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $lecturersQuery = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('nik', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->where('role', $roleFilter);
            });

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $lecturers = $lecturersQuery->orderBy('name', 'asc')->paginate($perPage)->withQueryString();

        // Hitung beban kelas mengajar per dosen di periode ini
        $lecturerIds = $lecturers->pluck('id')->toArray();
        $classCountMap = DB::table('class_lecturers')
            ->join('course_classes', 'class_lecturers.course_class_id', '=', 'course_classes.id')
            ->whereIn('class_lecturers.lecturer_id', $lecturerIds)
            ->where('course_classes.academic_period_id', $activePeriod?->id ?? 1)
            ->groupBy('class_lecturers.lecturer_id')
            ->select('class_lecturers.lecturer_id', DB::raw('count(*) as count'))
            ->pluck('count', 'class_lecturers.lecturer_id');

        $advisingCountMap = DB::table('users')
            ->where('role', 'mahasiswa')
            ->whereNotNull('academic_advisor_id')
            ->whereIn('academic_advisor_id', $lecturerIds)
            ->groupBy('academic_advisor_id')
            ->select('academic_advisor_id', DB::raw('count(*) as count'))
            ->pluck('count', 'academic_advisor_id');

        $lecturers->getCollection()->transform(function ($lec) use ($classCountMap, $advisingCountMap) {
            $lec->teaching_classes_count = $classCountMap[$lec->id] ?? 0;
            $lec->advising_students_count = $advisingCountMap[$lec->id] ?? 0;
            return $lec;
        });

        $totalLecturers = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->count();
        $paCount = User::where('role', 'dosen_pa')->count();
        $kaprodiCount = User::where('role', 'kaprodi')->count();
        $regularLecturerCount = User::where('role', 'dosen')->count();

        $stats = [
            'total' => $totalLecturers,
            'advisors' => $paCount,
            'kaprodi' => $kaprodiCount,
            'lecturers' => $regularLecturerCount,
        ];

        if ($request->input('format') === 'json' && !$request->header('X-Inertia')) {
            return response()->json([
                'success' => true,
                'lecturers' => $lecturers,
                'stats' => $stats,
            ]);
        }

        return Inertia::render('Admin/Lecturers/Index', [
            'lecturers' => $lecturers,
            'academicYears' => $academicYears,
            'studyPrograms' => $studyPrograms,
            'activePeriod' => $activePeriod,
            'stats' => $stats,
            'filters' => [
                'search' => $search,
                'study_program' => $prodiFilter,
                'role' => $roleFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Tambah Dosen Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', 'unique:users,identity_number'],
            'nik' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:dosen,dosen_pa,kaprodi'],
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
            'role' => $validated['role'],
            'study_program' => $validated['study_program'],
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'password' => Hash::make('salam123'),
            'is_active' => true,
        ]);

        return back()->with('success', "Dosen {$validated['name']} (NIDN: {$validated['identity_number']}) berhasil didaftarkan.");
    }

    /**
     * Perbarui Data Dosen
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $lecturer = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'identity_number' => ['required', 'string', 'max:32', Rule::unique('users')->ignore($lecturer->id)],
            'nik' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($lecturer->id)],
            'role' => ['required', 'in:dosen,dosen_pa,kaprodi'],
            'study_program' => ['required', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $lecturer->update($validated);

        return back()->with('success', "Data dosen {$lecturer->name} berhasil diperbarui.");
    }

    /**
     * Helper Query Filter Data Dosen
     */
    private function buildLecturersQuery(Request $request)
    {
        $search = $request->input('search');
        $prodiFilter = $request->input('study_program');
        $roleFilter = $request->input('role');

        return User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('nik', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->where('role', $roleFilter);
            });
    }

    /**
     * Ekspor Data Dosen ke Format Excel Resmi (.xls)
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $lecturers = $this->buildLecturersQuery($request)->orderBy('name', 'asc')->get();
        $prodi = $request->input('study_program');
        $filename = 'data-dosen-stai-al-ittihad-' . date('Ymd_His') . '.xls';

        $response = new StreamedResponse(function () use ($lecturers, $prodi) {
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
            echo '<tr><td colspan="9" style="border:none; text-align:center; font-weight:bold; font-size:12px;">DAFTAR RESMI DATA INDUK DOSEN & TENAGA PENDIDIK</td></tr>';
            $prodiText = $prodi ? "Program Studi: {$prodi}" : "Seluruh Program Studi";
            echo '<tr><td colspan="9" style="border:none; text-align:center; font-size:10px; color:#4b5563;">' . $prodiText . ' • Tanggal Ekspor: ' . date('d F Y, H:i') . ' WIB • Total: ' . $lecturers->count() . ' Dosen</td></tr>';
            echo '<tr><td colspan="9" style="border:none; height:12px;"></td></tr>';

            echo '<tr>';
            echo '<th style="width:40px;">No</th>';
            echo '<th style="width:220px;">Nama Lengkap & Gelar</th>';
            echo '<th style="width:130px;">NIDN / NIP</th>';
            echo '<th style="width:160px;">No. KTP / NIK (16 Digit)</th>';
            echo '<th style="width:200px;">Homebase Program Studi</th>';
            echo '<th style="width:140px;">Jabatan Akademik</th>';
            echo '<th style="width:200px;">Email Institusi</th>';
            echo '<th style="width:120px;">No. Telepon / HP</th>';
            echo '<th style="width:100px;">Status Akun</th>';
            echo '</tr>';

            $no = 1;
            foreach ($lecturers as $lec) {
                $isZebra = ($no % 2 === 0) ? 'class="zebra"' : '';
                $roleLabel = match ($lec->role) {
                    'kaprodi' => 'Ketua Program Studi',
                    'dosen_pa' => 'Dosen PA (Wali)',
                    default => 'Dosen Pengampu',
                };
                $statusText = $lec->is_active ? 'Aktif' : 'Nonaktif';
                $statusClass = $lec->is_active ? 'badge-active' : 'badge-inactive';

                echo "<tr {$isZebra}>";
                echo "<td class='text-center'>{$no}</td>";
                echo "<td><strong>{$lec->name}</strong></td>";
                echo "<td class='font-mono text-center'>{$lec->identity_number}</td>";
                echo "<td class='font-mono text-center'>{$lec->nik}</td>";
                echo "<td>{$lec->study_program}</td>";
                echo "<td class='text-center'>{$roleLabel}</td>";
                echo "<td>{$lec->email}</td>";
                echo "<td class='font-mono text-center'>{$lec->phone_number}</td>";
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
     * Ekspor Data Dosen ke Format PDF Resmi
     */
    public function exportPdf(Request $request): View
    {
        $lecturers = $this->buildLecturersQuery($request)->orderBy('name', 'asc')->get();
        $prodi = $request->input('study_program');
        $role = $request->input('role');
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        return view('pdf.lecturers', [
            'lecturers' => $lecturers,
            'studyProgram' => $prodi,
            'roleFilter' => $role,
            'activePeriod' => $activePeriod,
        ]);
    }

    /**
     * Unduh Template Excel (.xlsx) Resmi dan Sederhana untuk Impor Dosen
     */
    public function downloadTemplate(): BinaryFileResponse|StreamedResponse
    {
        $filePath = public_path('templates/template-impor-dosen-stai.xlsx');
        if (file_exists($filePath)) {
            return response()->download($filePath, 'template-impor-dosen-stai.xlsx', [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        }

        $filename = 'template-impor-dosen-stai.csv';
        $response = new StreamedResponse(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['nama_lengkap', 'nidn_nip', 'nik', 'email', 'program_studi', 'jabatan', 'jenis_kelamin', 'no_hp']);
            fputcsv($handle, ['Dr. H. M. Ridwan, M.Ag', '2112087501', '3203011208750001', 'ridwan@staialittihad.ac.id', 'Pendidikan Agama Islam (S1)', 'dosen', 'L', '08123456789']);
            fclose($handle);
        });
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', "attachment; filename=\"{$filename}\"");
        return $response;
    }

    /**
     * Impor Massal Dosen via Excel / CSV / Batch
     */
    public function importBatch(Request $request): RedirectResponse
    {
        $records = $request->input('records', []);

        // Jika unggah file CSV secara langsung
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $handle = fopen($file->getRealPath(), 'r');
            
            // Periksa & lewati BOM jika ada
            $bom = fread($handle, 3);
            if ($bom !== "\xEF\xBB\xBF") {
                rewind($handle);
            }

            $header = fgetcsv($handle, 1000, ',');
            if (!$header || count($header) < 2) {
                rewind($handle);
                $header = fgetcsv($handle, 1000, ';');
            }

            if ($header) {
                $header = array_map(function ($h) {
                    return preg_replace('/[^a-z0-9]+/', '_', strtolower(trim($h)));
                }, $header);

                while (($row = fgetcsv($handle, 1000, ',')) !== false) {
                    if (count($row) === 1) {
                        $row = explode(';', $row[0]);
                    }
                    if (count($row) < 2) continue;

                    $item = [];
                    foreach ($header as $i => $col) {
                        $val = trim($row[$i] ?? '');
                        if (in_array($col, ['nama', 'nama_lengkap', 'name', 'nama_dosen', 'dosen'])) $item['name'] = $val;
                        elseif (in_array($col, ['nidn', 'nip', 'nidn_nip', 'identity_number', 'no_induk', 'nomor_induk'])) $item['identity_number'] = $val;
                        elseif (in_array($col, ['nik', 'no_ktp', 'ktp', 'nomor_ktp', 'nik_no_ktp', 'nik_ktp', 'no_identitas'])) $item['nik'] = $val;
                        elseif (in_array($col, ['email', 'email_institusi', 'surel', 'e_mail'])) $item['email'] = $val;
                        elseif (in_array($col, ['prodi', 'program_studi', 'study_program', 'homebase', 'jurusan'])) $item['study_program'] = $val;
                        elseif (in_array($col, ['jabatan', 'role', 'peran', 'posisi'])) {
                            $rLower = strtolower($val);
                            if (str_contains($rLower, 'kaprodi') || str_contains($rLower, 'ketua')) $item['role'] = 'kaprodi';
                            elseif (str_contains($rLower, 'wali') || str_contains($rLower, 'pa')) $item['role'] = 'dosen_pa';
                            else $item['role'] = 'dosen';
                        }
                        elseif (in_array($col, ['gender', 'jenis_kelamin', 'jk', 'sex'])) {
                            $gUpper = strtoupper(substr($val, 0, 1));
                            $item['gender'] = ($gUpper === 'P' || $gUpper === 'W') ? 'P' : 'L';
                        }
                        elseif (in_array($col, ['no_hp', 'hp', 'phone', 'phone_number', 'telepon', 'no_telp', 'no_telepon', 'whatsapp', 'wa', 'kontak'])) $item['phone_number'] = $val;
                        elseif (in_array($col, ['password', 'kata_sandi', 'pass'])) $item['password'] = $val ?: 'salam123';
                    }

                    if (!empty($item['name'])) {
                        $records[] = $item;
                    }
                }
            }
            fclose($handle);
        }

        if (empty($records)) {
            return back()->with('error', 'Tidak ada data dosen yang berhasil diproses dari unggahan. Pastikan kolom nama terisi.');
        }

        $created = 0;
        $updated = 0;
        $now = now();

        // Cari nomor DSN tertinggi yang sudah ada di database
        $maxDsn = 0;
        $existingDsns = User::where('identity_number', 'LIKE', 'DSN%')
            ->orWhere('username', 'LIKE', 'DSN%')
            ->pluck('identity_number');
        foreach ($existingDsns as $code) {
            if (preg_match('/DSN(\d+)/i', $code, $m)) {
                $val = (int) $m[1];
                if ($val > $maxDsn) $maxDsn = $val;
            }
        }

        DB::transaction(function () use ($records, &$created, &$updated, &$maxDsn, $now) {
            foreach ($records as $r) {
                $name = trim($r['name'] ?? '');
                $identityNumber = trim($r['identity_number'] ?? '');
                $nik = trim($r['nik'] ?? '');
                $password = !empty($r['password']) ? trim($r['password']) : 'salam123';

                if (empty($name)) continue;

                if ($identityNumber === '-') $identityNumber = '';
                if ($nik === '-') $nik = '';

                // Jika identity_number / Kode Guru kosong, generate otomatis DSN001, DSN002...
                if (empty($identityNumber)) {
                    do {
                        $maxDsn++;
                        $candidateCode = 'DSN' . str_pad($maxDsn, 3, '0', STR_PAD_LEFT);
                    } while (User::where('identity_number', $candidateCode)->orWhere('username', $candidateCode)->exists());
                    $identityNumber = $candidateCode;
                }

                $email = !empty($r['email']) && $r['email'] !== '-' && !str_starts_with($r['email'], '-@')
                    ? trim($r['email']) 
                    : (strtolower($identityNumber) . '@staialittihad.ac.id');

                // Cari dosen yang sudah ada berdasarkan NIK, identity_number, username, atau email
                $existing = null;
                if (!empty($nik)) {
                    $existing = User::where('nik', $nik)->first();
                }
                if (!$existing && !empty($identityNumber)) {
                    $existing = User::where('identity_number', $identityNumber)
                        ->orWhere('username', $identityNumber)
                        ->first();
                }
                if (!$existing && !empty($email)) {
                    $existing = User::where('email', $email)->first();
                }

                if ($existing) {
                    $updateData = [
                        'name' => $name,
                        'study_program' => $r['study_program'] ?? $existing->study_program ?? 'Pendidikan Agama Islam (S1)',
                        'role' => in_array($r['role'] ?? '', ['dosen', 'dosen_pa', 'kaprodi']) ? $r['role'] : $existing->role,
                        'gender' => in_array($r['gender'] ?? '', ['L', 'P']) ? $r['gender'] : $existing->gender,
                        'phone_number' => !empty($r['phone_number']) ? $r['phone_number'] : $existing->phone_number,
                        'updated_at' => $now,
                    ];
                    if (!empty($nik)) {
                        $updateData['nik'] = $nik;
                    }
                    if (!empty($identityNumber) && (empty($existing->identity_number) || $existing->identity_number === '-')) {
                        $updateData['identity_number'] = $identityNumber;
                    }
                    if (!empty($r['password']) && $r['password'] !== 'salam123') {
                        $updateData['password'] = Hash::make($r['password']);
                    }
                    $existing->update($updateData);
                    $updated++;
                } else {
                    $uniqueEmail = $email;
                    $suffix = 1;
                    while (User::where('email', $uniqueEmail)->exists()) {
                        $cleanPrefix = preg_replace('/@.*$/', '', $email);
                        $uniqueEmail = $cleanPrefix . $suffix . '@staialittihad.ac.id';
                        $suffix++;
                    }

                    $uniqueUsername = $identityNumber;
                    $uSuffix = 1;
                    while (User::where('username', $uniqueUsername)->exists()) {
                        $uniqueUsername = $identityNumber . '_' . $uSuffix;
                        $uSuffix++;
                    }

                    User::create([
                        'name' => $name,
                        'username' => $uniqueUsername,
                        'identity_number' => $identityNumber,
                        'nik' => !empty($nik) ? $nik : null,
                        'email' => $uniqueEmail,
                        'role' => in_array($r['role'] ?? '', ['dosen', 'dosen_pa', 'kaprodi']) ? $r['role'] : 'dosen',
                        'study_program' => $r['study_program'] ?? 'Pendidikan Agama Islam (S1)',
                        'gender' => in_array($r['gender'] ?? '', ['L', 'P']) ? $r['gender'] : 'L',
                        'phone_number' => !empty($r['phone_number']) ? $r['phone_number'] : null,
                        'password' => Hash::make($password),
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);

                    $created++;
                }
            }
        });

        $messages = [];
        if ($created > 0) $messages[] = "{$created} dosen baru berhasil ditambahkan";
        if ($updated > 0) $messages[] = "{$updated} dosen diperbarui";
        $summary = count($messages) > 0 ? implode(' dan ', $messages) : "0 data diproses";

        return back()->with('success', "Proses impor selesai: {$summary}. Kode guru & kata sandi akun berhasil digenerate.");
    }

    /**
     * Hapus Data Dosen
     */
    public function destroy(int $id): RedirectResponse
    {
        $lecturer = User::whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])->findOrFail($id);
        if ($lecturer->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $name = $lecturer->name;
        $lecturer->delete();

        return back()->with('success', "Data dosen {$name} berhasil dihapus dari sistem.");
    }

    /**
     * Hapus Banyak Dosen Sekaligus (Batch / Multi Delete)
     */
    public function batchDestroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:users,id'],
        ]);

        $currentUserId = auth()->id();
        $idsToDelete = array_values(array_filter($validated['ids'], fn($id) => (int)$id !== (int)$currentUserId));

        if (empty($idsToDelete)) {
            return back()->with('error', 'Tidak ada data dosen yang dapat dihapus atau Anda mencoba menghapus akun Anda sendiri.');
        }

        $deletedCount = 0;
        DB::transaction(function () use ($idsToDelete, &$deletedCount) {
            $lecturers = User::whereIn('id', $idsToDelete)
                ->whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
                ->get();

            foreach ($lecturers as $lec) {
                $lec->delete();
                $deletedCount++;
            }
        });

        return back()->with('success', "Berhasil menghapus {$deletedCount} data dosen terpilih dari sistem.");
    }
}
