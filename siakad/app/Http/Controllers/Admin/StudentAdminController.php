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
     * Tampilan Cetak Dokumen PDF Resmi (Dapat Difilter per Angkatan & Prodi)
     */
    public function printPdf(Request $request): Response
    {
        $yearFilter = $request->input('academic_year'); // e.g. 2026, 2025, etc.
        $prodiFilter = $request->input('study_program');
        $statusFilter = $request->input('status');

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();
        $studyPrograms = DB::table('study_programs')->get();

        $studentsQuery = User::where('role', 'mahasiswa')
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

        // Mapping Status KRS & Tagihan
        $studentIds = $students->pluck('id')->toArray();
        $krsMap = DB::table('krs_submissions')
            ->whereIn('student_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'student_id');

        $invoiceMap = DB::table('student_invoices')
            ->whereIn('user_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'user_id');

        $students->transform(function ($stu) use ($krsMap, $invoiceMap) {
            $stu->krs_status = $krsMap[$stu->id] ?? 'BELUM_KRS';
            $stu->invoice_status = $invoiceMap[$stu->id] ?? 'LUNAS';
            $nimPrefix = substr(preg_replace('/[^0-9]/', '', $stu->identity_number ?? '21'), 0, 2);
            $stu->batch_year = strlen($nimPrefix) === 2 ? "20{$nimPrefix}" : '2021';
            return $stu;
        });

        return Inertia::render('Admin/Students/Print', [
            'students' => $students,
            'activePeriod' => $activePeriod,
            'studyPrograms' => $studyPrograms,
            'selectedYear' => $yearFilter ?: 'Semua Angkatan',
            'selectedProdi' => $prodiFilter ?: 'Semua Program Studi',
            'printedAt' => now()->translatedFormat('d F Y - H:i') . ' WIB',
            'signer' => [
                'name' => 'Dr. H. M. Ridwan, M.Ag',
                'role' => 'Wakil Ketua I Bidang Akademik',
                'nidn' => '2112087501',
            ],
        ]);
    }

    /**
     * Ekspor Data Mahasiswa ke File Excel Mewah (.xls berformat HTML/XML Spreadsheet)
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $search = $request->input('search');
        $yearFilter = $request->input('academic_year');
        $prodiFilter = $request->input('study_program');
        $statusFilter = $request->input('status');

        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $studentsQuery = User::where('role', 'mahasiswa')
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
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

        $studentIds = $students->pluck('id')->toArray();
        $krsMap = DB::table('krs_submissions')
            ->whereIn('student_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'student_id');

        $invoiceMap = DB::table('student_invoices')
            ->whereIn('user_id', $studentIds)
            ->where('academic_period_id', $activePeriod?->id ?? 1)
            ->pluck('status', 'user_id');

        $filename = 'Data_Mahasiswa_STAI_AlIttihad_' . ($yearFilter ? "Angkatan_{$yearFilter}_" : "") . date('Ymd_His') . '.xls';

        return response()->streamDownload(function () use ($students, $yearFilter, $prodiFilter, $krsMap, $invoiceMap) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head>';
            echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Data Mahasiswa</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>';
            echo 'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11pt; }';
            echo '.title { font-size: 16pt; font-weight: bold; color: #064e3b; text-align: center; }';
            echo '.subtitle { font-size: 11pt; font-weight: bold; color: #334155; text-align: center; }';
            echo '.meta { font-size: 9.5pt; color: #64748b; margin-bottom: 12px; }';
            echo 'table { border-collapse: collapse; width: 100%; }';
            echo 'th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #044e39; padding: 10px 8px; text-align: center; vertical-align: middle; }';
            echo 'td { border: 1px solid #cbd5e1; padding: 7px 8px; vertical-align: middle; }';
            echo '.nim { mso-number-format:"\@"; text-align: center; font-weight: bold; }';
            echo '.center { text-align: center; }';
            echo '.even { background-color: #f8fafc; }';
            echo '.badge-lunas { color: #065f46; font-weight: bold; text-align: center; }';
            echo '.badge-pending { color: #b91c1c; font-weight: bold; text-align: center; }';
            echo '</style>';
            echo '</head>';
            echo '<body>';

            echo '<table>';
            echo '<tr><td colspan="10" class="title">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="10" class="subtitle">DIREKTORI DATA INDUK MAHASISWA & STATUS AKADEMIK</td></tr>';
            echo '<tr><td colspan="10" class="meta" style="text-align: center;">Angkatan: ' . ($yearFilter ?: 'Semua Angkatan') . ' | Program Studi: ' . ($prodiFilter ?: 'Semua Prodi') . ' | Tanggal Unduh: ' . date('d F Y H:i') . ' WIB</td></tr>';
            echo '<tr><td colspan="10" style="height: 10px;"></td></tr>';

            echo '<thead>';
            echo '<tr>';
            echo '<th style="width: 40px;">NO</th>';
            echo '<th style="width: 120px;">NIM</th>';
            echo '<th style="width: 240px;">NAMA LENGKAP MAHASISWA</th>';
            echo '<th style="width: 60px;">L/P</th>';
            echo '<th style="width: 220px;">PROGRAM STUDI</th>';
            echo '<th style="width: 200px;">EMAIL MAHASISWA</th>';
            echo '<th style="width: 130px;">NO. TELEPON / WA</th>';
            echo '<th style="width: 110px;">STATUS KRS</th>';
            echo '<th style="width: 110px;">TAGIHAN SPP</th>';
            echo '<th style="width: 90px;">STATUS AKUN</th>';
            echo '</tr>';
            echo '</thead>';
            echo '<tbody>';

            $no = 1;
            foreach ($students as $idx => $stu) {
                $bgClass = ($idx % 2 === 1) ? 'class="even"' : '';
                $krs = $krsMap[$stu->id] ?? 'BELUM_KRS';
                $invoice = $invoiceMap[$stu->id] ?? 'LUNAS';

                echo "<tr {$bgClass}>";
                echo "<td class=\"center\">{$no}</td>";
                echo "<td class=\"nim\">" . ($stu->identity_number ?: $stu->username) . "</td>";
                echo "<td style=\"font-weight: bold;\">" . htmlspecialchars($stu->name) . "</td>";
                echo "<td class=\"center\">" . ($stu->gender === 'P' ? 'P' : 'L') . "</td>";
                echo "<td>" . htmlspecialchars($stu->study_program ?: 'Pendidikan Agama Islam (S1)') . "</td>";
                echo "<td>" . htmlspecialchars($stu->email) . "</td>";
                echo "<td class=\"center\">" . htmlspecialchars($stu->phone_number ?: '-') . "</td>";
                echo "<td class=\"center\">{$krs}</td>";
                echo "<td class=\"" . ($invoice === 'LUNAS' ? 'badge-lunas' : 'badge-pending') . "\">{$invoice}</td>";
                echo "<td class=\"center\">" . ($stu->is_active ? 'AKTIF' : 'NONAKTIF') . "</td>";
                echo "</tr>";
                $no++;
            }

            echo '</tbody>';
            echo '</table>';
            echo '</body>';
            echo '</html>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Unduh Template Excel Resmi untuk Impor Mahasiswa Baru (.xls)
     */
    public function templateExcel(): StreamedResponse
    {
        $filename = 'Template_Impor_Mahasiswa_STAI_AlIttihad.xls';

        return response()->streamDownload(function () {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head>';
            echo '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Template Mahasiswa</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>';
            echo 'body { font-family: "Segoe UI", Arial, sans-serif; font-size: 11pt; }';
            echo '.header-table th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #044e39; padding: 10px; text-align: center; }';
            echo 'td { border: 1px solid #cbd5e1; padding: 8px; }';
            echo '.nim { mso-number-format:"\@"; text-align: center; }';
            echo '.center { text-align: center; }';
            echo '.instruction { background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px; font-size: 10pt; color: #064e3b; margin-bottom: 10px; }';
            echo '</style>';
            echo '</head>';
            echo '<body>';

            echo '<table>';
            echo '<tr><td colspan="6" style="font-size: 14pt; font-weight: bold; color: #064e3b;">TEMPLATE RESMI IMPOR DATA MAHASISWA — STAI AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="6" style="color: #64748b; font-size: 9.5pt;">Petunjuk: Kolom bertanda (*) WAJIB diisi. Jenis Kelamin diisi L (Laki-laki) atau P (Perempuan). NIM harus berupa teks/angka unik.</td></tr>';
            echo '<tr><td colspan="6" style="height: 10px;"></td></tr>';

            echo '<thead>';
            echo '<tr class="header-table">';
            echo '<th style="width: 220px;">NAMA LENGKAP (*)</th>';
            echo '<th style="width: 140px;">NIM (*)</th>';
            echo '<th style="width: 220px;">PROGRAM STUDI (*)</th>';
            echo '<th style="width: 80px;">L/P (*)</th>';
            echo '<th style="width: 220px;">EMAIL (OPSIONAL)</th>';
            echo '<th style="width: 140px;">NO. TELEPON / WA</th>';
            echo '</tr>';
            echo '</thead>';

            echo '<tbody>';
            echo '<tr>';
            echo '<td style="font-weight: bold;">Muhammad Farhan Al-Ghifari</td>';
            echo '<td class="nim">26010001</td>';
            echo '<td>Pendidikan Agama Islam (S1)</td>';
            echo '<td class="center">L</td>';
            echo '<td>farhan.ghifari@staialittihad.ac.id</td>';
            echo '<td class="center">081234567890</td>';
            echo '</tr>';

            echo '<tr>';
            echo '<td style="font-weight: bold;">Nabila Nur Azizah</td>';
            echo '<td class="nim">26010002</td>';
            echo '<td>Pendidikan Agama Islam (S1)</td>';
            echo '<td class="center">P</td>';
            echo '<td>nabila.azizah@staialittihad.ac.id</td>';
            echo '<td class="center">081234567891</td>';
            echo '</tr>';

            echo '<tr>';
            echo '<td style="font-weight: bold;">Bilal Ahmad Zulfikar</td>';
            echo '<td class="nim">26020001</td>';
            echo '<td>Pendidikan Islam Anak Usia Dini (S1)</td>';
            echo '<td class="center">L</td>';
            echo '<td>bilal.zulfikar@staialittihad.ac.id</td>';
            echo '<td class="center">081234567892</td>';
            echo '</tr>';

            echo '</tbody>';
            echo '</table>';
            echo '</body>';
            echo '</html>';
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Cek Duplikasi Data Sebelum Impor (Validasi Batch)
     */
    public function checkImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        if (empty($records)) {
            return response()->json(['success' => false, 'message' => 'Tidak ada data baris yang diterima.'], 422);
        }

        $allNims = array_filter(array_map(fn($r) => trim((string)($r['identity_number'] ?? '')), $records));
        $allEmails = array_filter(array_map(fn($r) => trim((string)($r['email'] ?? '')), $records));

        // Query database mahasiswa yang sudah ada
        $existingUsers = User::where(function ($q) use ($allNims, $allEmails) {
            $q->whereIn('identity_number', $allNims)
              ->orWhereIn('username', $allNims)
              ->orWhereIn('email', $allEmails);
        })->get();

        $existingNimMap = [];
        $existingEmailMap = [];
        foreach ($existingUsers as $u) {
            if ($u->identity_number) $existingNimMap[$u->identity_number] = $u;
            if ($u->username) $existingNimMap[$u->username] = $u;
            if ($u->email) $existingEmailMap[$u->email] = $u;
        }

        $analyzed = [];
        $duplicateCount = 0;
        $newCount = 0;

        foreach ($records as $index => $r) {
            $nim = trim((string)($r['identity_number'] ?? ''));
            $name = trim((string)($r['name'] ?? ''));
            $email = trim((string)($r['email'] ?? ''));
            if (!$email && $nim) {
                $email = "{$nim}@staialittihad.ac.id";
            }
            $prodi = trim((string)($r['study_program'] ?? 'Pendidikan Agama Islam (S1)'));
            $gender = (!empty($r['gender']) && strtoupper($r['gender']) === 'P') ? 'P' : 'L';
            $phone = trim((string)($r['phone_number'] ?? ''));

            if (empty($nim) || empty($name)) continue;

            $isDuplicate = false;
            $duplicateReason = null;
            $existingId = null;

            if (isset($existingNimMap[$nim])) {
                $isDuplicate = true;
                $existing = $existingNimMap[$nim];
                $duplicateReason = "NIM {$nim} sudah terdaftar di sistem atas nama '{$existing->name}'";
                $existingId = $existing->id;
            } elseif (isset($existingEmailMap[$email])) {
                $isDuplicate = true;
                $existing = $existingEmailMap[$email];
                $duplicateReason = "Email {$email} sudah digunakan oleh mahasiswa '{$existing->name}'";
                $existingId = $existing->id;
            }

            if ($isDuplicate) {
                $duplicateCount++;
            } else {
                $newCount++;
            }

            $analyzed[] = [
                'row_id' => $index + 1,
                'identity_number' => $nim,
                'name' => $name,
                'study_program' => $prodi,
                'gender' => $gender,
                'email' => $email,
                'phone_number' => $phone,
                'status' => $isDuplicate ? 'DUPLICATE' : 'NEW',
                'duplicate_reason' => $duplicateReason,
                'existing_id' => $existingId,
            ];
        }

        return response()->json([
            'success' => true,
            'analyzed' => $analyzed,
            'summary' => [
                'total' => count($analyzed),
                'new_count' => $newCount,
                'duplicate_count' => $duplicateCount,
            ]
        ]);
    }

    /**
     * Eksekusi Impor Massal dengan Pilihan (Lewati vs Timpa/Perbarui)
     */
    public function processImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        $conflictMode = $request->input('conflict_mode', 'skip'); // 'skip' atau 'overwrite'

        if (empty($records)) {
            return response()->json(['success' => false, 'message' => 'Tidak ada data untuk diimpor.'], 422);
        }

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;
        $now = now();
        $importedRows = [];

        DB::transaction(function () use ($records, $conflictMode, &$createdCount, &$updatedCount, &$skippedCount, &$importedRows, $now) {
            foreach ($records as $r) {
                $nim = trim((string)($r['identity_number'] ?? ''));
                $name = trim((string)($r['name'] ?? ''));
                $email = trim((string)($r['email'] ?? ''));
                if (!$email && $nim) {
                    $email = "{$nim}@staialittihad.ac.id";
                }
                $prodi = $r['study_program'] ?? 'Pendidikan Agama Islam (S1)';
                $gender = (!empty($r['gender']) && strtoupper($r['gender']) === 'P') ? 'P' : 'L';
                $phone = $r['phone_number'] ?? null;

                if (!$nim || !$name) {
                    $skippedCount++;
                    continue;
                }

                // Cek user eksisting
                $existing = User::where('identity_number', $nim)->orWhere('username', $nim)->orWhere('email', $email)->first();

                if ($existing) {
                    if ($conflictMode === 'overwrite') {
                        $existing->update([
                            'name' => $name,
                            'study_program' => $prodi,
                            'gender' => $gender,
                            'phone_number' => $phone ?: $existing->phone_number,
                            'is_active' => true,
                            'updated_at' => $now,
                        ]);
                        $updatedCount++;
                        $importedRows[] = [
                            'row_id' => $r['row_id'] ?? null,
                            'nim' => $nim,
                            'name' => $name,
                            'action' => 'OVERWRITTEN',
                        ];
                    } else {
                        $skippedCount++;
                        $importedRows[] = [
                            'row_id' => $r['row_id'] ?? null,
                            'nim' => $nim,
                            'name' => $name,
                            'action' => 'SKIPPED',
                        ];
                    }
                } else {
                    User::create([
                        'name' => $name,
                        'username' => $nim,
                        'identity_number' => $nim,
                        'email' => $email,
                        'role' => 'mahasiswa',
                        'study_program' => $prodi,
                        'gender' => $gender,
                        'phone_number' => $phone,
                        'password' => Hash::make('salam123'),
                        'is_active' => true,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                    $createdCount++;
                    $importedRows[] = [
                        'row_id' => $r['row_id'] ?? null,
                        'nim' => $nim,
                        'name' => $name,
                        'action' => 'CREATED',
                    ];
                }
            }
        });

        return response()->json([
            'success' => true,
            'summary' => [
                'total_processed' => count($records),
                'created_count' => $createdCount,
                'updated_count' => $updatedCount,
                'skipped_count' => $skippedCount,
            ],
            'imported_rows' => $importedRows,
            'message' => "Impor selesai: {$createdCount} mahasiswa baru ditambahkan, {$updatedCount} data diperbarui, {$skippedCount} dilewati."
        ]);
    }

    /**
     * Tambah Mahasiswa Baru Tunggal
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
     * Perbarui Data Mahasiswa Tunggal
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
}
