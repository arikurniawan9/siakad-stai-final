<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CourseController extends Controller
{
    /**
     * Tampilkan Data Matakuliah Berdasarkan Program Studi yang Dipilih
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->select('id', 'code', 'national_code', 'name', 'degree')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($p) {
                $p->courses_count = DB::table('courses')->where('study_program_id', $p->id)->count();
                return $p;
            });

        $selectedProgramId = $request->input('program_id');

        $courses = collect();
        if ($selectedProgramId) {
            $courses = DB::table('courses')
                ->where('study_program_id', $selectedProgramId)
                ->orderBy('code', 'asc')
                ->get();
        }

        return Inertia::render('Admin/Courses/Index', [
            'studyPrograms' => $studyPrograms,
            'selectedProgramId' => $selectedProgramId ? (int) $selectedProgramId : null,
            'courses' => $courses,
        ]);
    }

    /**
     * Tambah Mata Kuliah Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'code' => ['required', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:150'],
            'name_en' => ['nullable', 'string', 'max:150'],
            'credits' => ['required', 'numeric', 'min:0'],
            'theory_credits' => ['required', 'numeric', 'min:0'],
            'practice_credits' => ['required', 'numeric', 'min:0'],
            'field_credits' => ['required', 'numeric', 'min:0'],
            'semester_level' => ['nullable', 'integer', 'min:1', 'max:8'],
            'course_type' => ['required', 'string'],
            'course_group' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        // Cari kurikulum aktif prodi ini atau buat relasi default
        $curriculum = DB::table('curricula')
            ->where('study_program_id', $validated['study_program_id'])
            ->where('is_active', true)
            ->orderBy('id', 'desc')
            ->first();

        if (!$curriculum) {
            $curriculum = DB::table('curricula')
                ->where('study_program_id', $validated['study_program_id'])
                ->orderBy('id', 'desc')
                ->first();
        }

        $curriculumId = $curriculum?->id;
        if (!$curriculumId) {
            $prodiObj = DB::table('study_programs')->where('id', $validated['study_program_id'])->first();
            $prodiCode = $prodiObj?->code ?? 'PRODI';
            $curriculumId = DB::table('curricula')->insertGetId([
                'study_program_id' => $validated['study_program_id'],
                'name' => "Kurikulum Merdeka {$prodiCode} 2026",
                'code' => "KUR-{$prodiCode}-2026",
                'start_year' => 2026,
                'total_credits_required' => 144,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('courses')->insert([
            'curriculum_id' => $curriculumId,
            'study_program_id' => $validated['study_program_id'],
            'code' => strtoupper(trim($validated['code'])),
            'name' => trim($validated['name']),
            'name_en' => !empty($validated['name_en']) ? trim($validated['name_en']) : null,
            'credits' => $validated['credits'],
            'theory_credits' => $validated['theory_credits'],
            'practice_credits' => $validated['practice_credits'],
            'field_credits' => $validated['field_credits'],
            'semester_level' => $validated['semester_level'] ?? 1,
            'course_type' => $validated['course_type'],
            'course_group' => $validated['course_group'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.courses.index', ['program_id' => $validated['study_program_id']])
            ->with('success', 'Mata kuliah baru berhasil ditambahkan.');
    }

    /**
     * Perbarui Data Mata Kuliah
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'code' => ['required', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:150'],
            'name_en' => ['nullable', 'string', 'max:150'],
            'credits' => ['required', 'numeric', 'min:0'],
            'theory_credits' => ['required', 'numeric', 'min:0'],
            'practice_credits' => ['required', 'numeric', 'min:0'],
            'field_credits' => ['required', 'numeric', 'min:0'],
            'semester_level' => ['nullable', 'integer', 'min:1', 'max:8'],
            'course_type' => ['required', 'string'],
            'course_group' => ['required', 'string'],
            'description' => ['nullable', 'string'],
        ]);

        DB::table('courses')->where('id', $id)->update([
            'study_program_id' => $validated['study_program_id'],
            'code' => strtoupper(trim($validated['code'])),
            'name' => trim($validated['name']),
            'name_en' => !empty($validated['name_en']) ? trim($validated['name_en']) : null,
            'credits' => $validated['credits'],
            'theory_credits' => $validated['theory_credits'],
            'practice_credits' => $validated['practice_credits'],
            'field_credits' => $validated['field_credits'],
            'semester_level' => $validated['semester_level'] ?? 1,
            'course_type' => $validated['course_type'],
            'course_group' => $validated['course_group'],
            'description' => $validated['description'] ?? null,
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.courses.index', ['program_id' => $validated['study_program_id']])
            ->with('success', 'Data mata kuliah berhasil diperbarui.');
    }

    /**
     * Hapus Mata Kuliah
     */
    public function destroy(int $id): RedirectResponse
    {
        $course = DB::table('courses')->find($id);
        $programId = $course?->study_program_id;

        DB::table('courses')->where('id', $id)->delete();

        return redirect()->route('admin.courses.index', ['program_id' => $programId])
            ->with('success', 'Mata kuliah berhasil dihapus.');
    }

    /**
     * Unduh Template Excel Resmi untuk Impor Mata Kuliah (.xlsx)
     */
    public function templateExcel(): BinaryFileResponse|StreamedResponse
    {
        $filePath = public_path('templates/template-impor-matakuliah-stai.xlsx');
        if (file_exists($filePath)) {
            return response()->download($filePath, 'template-impor-matakuliah-stai.xlsx', [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            ]);
        }

        $filename = 'template-impor-matakuliah-stai.csv';
        return new StreamedResponse(function () {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['kode_mk', 'nama_mk', 'nama_mk_en', 'sks_total', 'sks_tatap_muka', 'sks_praktikum', 'sks_lapangan', 'semester', 'jenis_mk', 'kelompok_mk', 'kode_prodi', 'deskripsi']);
            fputcsv($handle, ['PAI-101', "Ulumul Qur'an", 'Quranic Studies', '2', '2', '0', '0', '1', 'Wajib', 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)', 'PAI', 'Mata kuliah dasar pengantar studi Al-Quran']);
            fputcsv($handle, ['PAI-301', 'Fiqih Mawaris', 'Islamic Inheritance Law', '3', '2', '1', '0', '3', 'Wajib', 'MKK (mata kuliah keahlian)', 'PAI', 'Kajian hukum waris Islam']);
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Analisis & Validasi Data Sebelum Eksekusi Impor Mata Kuliah
     */
    public function checkImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        $defaultProgramId = $request->input('program_id');

        if (empty($records)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada baris data mata kuliah yang ditemukan untuk dianalisis.'
            ], 422);
        }

        $allStudyPrograms = DB::table('study_programs')->get();
        $prodiMap = [];
        foreach ($allStudyPrograms as $sp) {
            $prodiMap[strtoupper(trim($sp->code))] = $sp;
            $prodiMap[strtoupper(trim($sp->name))] = $sp;
            $prodiMap[$sp->id] = $sp;
        }

        $analyzed = [];
        $readyCount = 0;
        $conflictCount = 0;
        $invalidCount = 0;

        foreach ($records as $index => $rec) {
            $code = strtoupper(trim($rec['kode_mk'] ?? $rec['code'] ?? ''));
            $name = trim($rec['nama_mk'] ?? $rec['name'] ?? '');
            $nameEn = trim($rec['nama_mk_en'] ?? $rec['name_en'] ?? '');
            
            $rawCredits = $rec['sks_total'] ?? $rec['credits'] ?? 2;
            $credits = is_numeric($rawCredits) ? (float)$rawCredits : 0;

            $rawTheory = $rec['sks_tatap_muka'] ?? $rec['theory_credits'] ?? $credits;
            $theoryCredits = is_numeric($rawTheory) ? (float)$rawTheory : $credits;

            $rawPractice = $rec['sks_praktikum'] ?? $rec['practice_credits'] ?? 0;
            $practiceCredits = is_numeric($rawPractice) ? (float)$rawPractice : 0.0;

            $rawField = $rec['sks_lapangan'] ?? $rec['field_credits'] ?? 0;
            $fieldCredits = is_numeric($rawField) ? (float)$rawField : 0.0;

            $rawSemester = $rec['semester'] ?? $rec['semester_level'] ?? 1;
            $semesterLevel = is_numeric($rawSemester) ? (int)$rawSemester : 1;

            $courseType = trim($rec['jenis_mk'] ?? $rec['course_type'] ?? 'Wajib');
            $courseGroup = trim($rec['kelompok_mk'] ?? $rec['course_group'] ?? 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)');
            $prodiIdentifier = strtoupper(trim($rec['kode_prodi'] ?? $rec['program_code'] ?? ''));
            $description = trim($rec['deskripsi'] ?? $rec['description'] ?? '');

            // Resolve prodi
            $targetProdi = null;
            if (!empty($prodiIdentifier) && isset($prodiMap[$prodiIdentifier])) {
                $targetProdi = $prodiMap[$prodiIdentifier];
            } elseif ($defaultProgramId && isset($prodiMap[$defaultProgramId])) {
                $targetProdi = $prodiMap[$defaultProgramId];
            } else {
                $targetProdi = $allStudyPrograms->first();
            }

            $targetProgramId = $targetProdi ? $targetProdi->id : 1;
            $targetProgramName = $targetProdi ? $targetProdi->name : 'Program Studi';

            if (empty($code) || empty($name)) {
                $status = 'invalid';
                $message = 'Kode Mata Kuliah dan Nama Mata Kuliah wajib diisi.';
                $invalidCount++;
            } elseif ($credits <= 0) {
                $status = 'invalid';
                $message = 'Bobot SKS harus berupa angka dan lebih dari 0.';
                $invalidCount++;
            } else {
                // Check if existing
                $existing = DB::table('courses')
                    ->where('study_program_id', $targetProgramId)
                    ->where('code', $code)
                    ->first();

                if ($existing) {
                    $status = 'conflict';
                    $message = "Mata kuliah dengan kode {$code} sudah ada di database ({$existing->name}).";
                    $conflictCount++;
                } else {
                    $status = 'ready';
                    $message = 'Valid & siap diimpor sebagai mata kuliah baru.';
                    $readyCount++;
                }
            }

            $analyzed[] = [
                'row_index' => $index + 1,
                'code' => $code,
                'name' => $name,
                'name_en' => $nameEn,
                'credits' => $credits,
                'theory_credits' => $theoryCredits,
                'practice_credits' => $practiceCredits,
                'field_credits' => $fieldCredits,
                'semester_level' => $semesterLevel,
                'course_type' => $courseType,
                'course_group' => $courseGroup,
                'study_program_id' => $targetProgramId,
                'study_program_name' => $targetProgramName,
                'description' => $description,
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
            ],
            'analyzed' => $analyzed,
        ]);
    }

    /**
     * Eksekusi Batch Proses Impor Mata Kuliah ke Database
     */
    public function processImport(Request $request): JsonResponse
    {
        $records = $request->input('records', []);
        $conflictMode = $request->input('conflict_mode', 'skip'); // 'skip' atau 'overwrite'
        $defaultProgramId = $request->input('program_id');

        if (empty($records)) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada baris data mata kuliah untuk diproses.'
            ], 422);
        }

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;

        DB::transaction(function () use ($records, $conflictMode, $defaultProgramId, &$createdCount, &$updatedCount, &$skippedCount) {
            foreach ($records as $rec) {
                $code = strtoupper(trim($rec['code'] ?? ''));
                $name = trim($rec['name'] ?? '');
                $credits = (float)($rec['credits'] ?? 2.0);

                if (empty($code) || empty($name) || $credits <= 0) {
                    $skippedCount++;
                    continue;
                }

                $programId = !empty($rec['study_program_id']) ? (int)$rec['study_program_id'] : ($defaultProgramId ? (int)$defaultProgramId : 1);

                // Find or create active curriculum for this prodi
                $curriculum = DB::table('curricula')
                    ->where('study_program_id', $programId)
                    ->where('is_active', true)
                    ->orderBy('id', 'desc')
                    ->first();

                if (!$curriculum) {
                    $curriculum = DB::table('curricula')
                        ->where('study_program_id', $programId)
                        ->orderBy('id', 'desc')
                        ->first();
                }

                $curriculumId = $curriculum?->id;
                if (!$curriculumId) {
                    $prodiObj = DB::table('study_programs')->where('id', $programId)->first();
                    $prodiCode = $prodiObj?->code ?? 'PRODI';
                    $curriculumId = DB::table('curricula')->insertGetId([
                        'study_program_id' => $programId,
                        'name' => "Kurikulum Merdeka {$prodiCode} 2026",
                        'code' => "KUR-{$prodiCode}-2026",
                        'start_year' => 2026,
                        'total_credits_required' => 144,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $existing = DB::table('courses')
                    ->where('study_program_id', $programId)
                    ->where('code', $code)
                    ->first();

                $courseData = [
                    'curriculum_id' => $curriculumId,
                    'study_program_id' => $programId,
                    'code' => $code,
                    'name' => $name,
                    'name_en' => !empty($rec['name_en']) ? trim($rec['name_en']) : null,
                    'credits' => $credits,
                    'theory_credits' => isset($rec['theory_credits']) ? (float)$rec['theory_credits'] : $credits,
                    'practice_credits' => isset($rec['practice_credits']) ? (float)$rec['practice_credits'] : 0.0,
                    'field_credits' => isset($rec['field_credits']) ? (float)$rec['field_credits'] : 0.0,
                    'semester_level' => isset($rec['semester_level']) ? (int)$rec['semester_level'] : 1,
                    'course_type' => !empty($rec['course_type']) ? trim($rec['course_type']) : 'Wajib',
                    'course_group' => !empty($rec['course_group']) ? trim($rec['course_group']) : 'MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)',
                    'description' => !empty($rec['description']) ? trim($rec['description']) : null,
                    'is_active' => true,
                    'updated_at' => now(),
                ];

                if ($existing) {
                    if ($conflictMode === 'overwrite') {
                        DB::table('courses')->where('id', $existing->id)->update($courseData);
                        $updatedCount++;
                    } else {
                        $skippedCount++;
                    }
                } else {
                    $courseData['created_at'] = now();
                    DB::table('courses')->insert($courseData);
                    $createdCount++;
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => "Proses impor selesai: {$createdCount} mata kuliah baru ditambahkan, {$updatedCount} diperbarui, dan {$skippedCount} dilewati.",
            'details' => [
                'created' => $createdCount,
                'updated' => $updatedCount,
                'skipped' => $skippedCount,
                'total' => $createdCount + $updatedCount + $skippedCount,
            ]
        ]);
    }

    /**
     * Ekspor Data Mata Kuliah ke Format Excel (.xls) Resmi Berkop
     */
    public function exportExcel(Request $request): StreamedResponse
    {
        $programId = $request->input('program_id');
        $studyProgram = $programId ? DB::table('study_programs')->where('id', $programId)->first() : null;

        $query = DB::table('courses')
            ->leftJoin('study_programs', 'study_programs.id', '=', 'courses.study_program_id')
            ->select('courses.*', 'study_programs.name as study_program_name', 'study_programs.code as study_program_code');

        if ($programId) {
            $query->where('courses.study_program_id', $programId);
        }

        $courses = $query->orderBy('courses.code', 'asc')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        $prodiTitle = $studyProgram ? "{$studyProgram->name} ({$studyProgram->degree})" : "Semua Program Studi (Institut)";
        $cleanProdiName = $studyProgram ? preg_replace('/[^A-Za-z0-9]/', '_', $studyProgram->code) : 'Semua_Prodi';
        $dateStr = now()->format('Ymd_His');
        $filename = "Daftar_Mata_Kuliah_{$cleanProdiName}_{$dateStr}.xls";

        return new StreamedResponse(function () use ($courses, $prodiTitle, $studyProgram, $activePeriod) {
            echo '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
            echo '<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8">';
            echo '<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Mata Kuliah</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->';
            echo '<style>';
            echo 'body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #111; }';
            echo 'table { border-collapse: collapse; width: 100%; }';
            echo '.th-inst { font-size: 14pt; font-weight: bold; text-align: center; color: #065f46; }';
            echo '.th-title { font-size: 12pt; font-weight: bold; text-align: center; color: #1e293b; }';
            echo '.th-meta { font-size: 10pt; color: #475569; }';
            echo 'th { background-color: #065f46; color: #ffffff; font-weight: bold; border: 1px solid #047857; text-align: center; padding: 8px 6px; font-size: 10pt; }';
            echo 'td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: middle; font-size: 10pt; }';
            echo '.text-center { text-align: center; }';
            echo '.text-right { text-align: right; }';
            echo '.font-bold { font-weight: bold; }';
            echo '.bg-total { background-color: #f1f5f9; font-weight: bold; }';
            echo '.text-code { mso-number-format:"\@"; text-align: center; font-family: Consolas, monospace; font-weight: bold; color: #065f46; }';
            echo '</style></head><body>';

            echo '<table>';
            echo '<tr><td colspan="11" class="th-inst">SEKOLAH TINGGI AGAMA ISLAM (STAI) AL-ITTIHAD CIANJUR</td></tr>';
            echo '<tr><td colspan="11" class="th-title">BIRO ADMINISTRASI AKADEMIK & KEMAHASISWAAN (BAAK) - DAFTAR MATA KULIAH STRUKTUR KURIKULUM</td></tr>';
            echo '<tr><td colspan="11" class="text-center th-meta">Tahun Akademik: ' . ($activePeriod->name ?? '2026/2027 Ganjil') . ' | Program Studi: ' . htmlspecialchars($prodiTitle) . ' | Tanggal Unduh: ' . Carbon::now()->translatedFormat('d F Y H:i') . ' WIB</td></tr>';
            echo '<tr><td colspan="11"></td></tr>';

            echo '<thead>';
            echo '<tr>';
            echo '<th rowspan="2" style="width: 45px;">No</th>';
            echo '<th rowspan="2" style="width: 120px;">Kode MK</th>';
            echo '<th rowspan="2" style="width: 270px;">Nama Mata Kuliah</th>';
            echo '<th rowspan="2" style="width: 230px;">Nama Bahasa Inggris</th>';
            echo '<th colspan="4">Bobot SKS</th>';
            echo '<th rowspan="2" style="width: 60px;">Smt</th>';
            echo '<th rowspan="2" style="width: 110px;">Jenis MK</th>';
            echo '<th rowspan="2" style="width: 250px;">Kelompok Mata Kuliah</th>';
            echo '</tr>';
            echo '<tr>';
            echo '<th style="width: 65px;">Total</th>';
            echo '<th style="width: 65px;">Teori</th>';
            echo '<th style="width: 65px;">Praktik</th>';
            echo '<th style="width: 65px;">Lapangan</th>';
            echo '</tr>';
            echo '</thead>';
            echo '<tbody>';

            $no = 1;
            $totCredits = 0;
            $totTheory = 0;
            $totPractice = 0;
            $totField = 0;

            foreach ($courses as $c) {
                $credits = (float)$c->credits;
                $theory = (float)($c->theory_credits ?? $credits);
                $practice = (float)($c->practice_credits ?? 0);
                $field = (float)($c->field_credits ?? 0);

                $totCredits += $credits;
                $totTheory += $theory;
                $totPractice += $practice;
                $totField += $field;

                echo '<tr>';
                echo '<td class="text-center">' . $no++ . '</td>';
                echo '<td class="text-code">' . htmlspecialchars($c->code) . '</td>';
                echo '<td class="font-bold">' . htmlspecialchars($c->name) . '</td>';
                echo '<td>' . htmlspecialchars($c->name_en ?? '-') . '</td>';
                echo '<td class="text-center font-bold">' . number_format($credits, 0) . '</td>';
                echo '<td class="text-center">' . number_format($theory, 0) . '</td>';
                echo '<td class="text-center">' . number_format($practice, 0) . '</td>';
                echo '<td class="text-center">' . number_format($field, 0) . '</td>';
                echo '<td class="text-center">' . ($c->semester_level ?? 1) . '</td>';
                echo '<td class="text-center">' . htmlspecialchars($c->course_type ?? 'Wajib') . '</td>';
                echo '<td>' . htmlspecialchars($c->course_group ?? 'MKU/MKDU') . '</td>';
                echo '</tr>';
            }

            echo '</tbody>';
            echo '<tfoot>';
            echo '<tr class="bg-total">';
            echo '<td colspan="4" class="text-right font-bold">TOTAL BOBOT SKS:</td>';
            echo '<td class="text-center font-bold">' . number_format($totCredits, 0) . '</td>';
            echo '<td class="text-center font-bold">' . number_format($totTheory, 0) . '</td>';
            echo '<td class="text-center font-bold">' . number_format($totPractice, 0) . '</td>';
            echo '<td class="text-center font-bold">' . number_format($totField, 0) . '</td>';
            echo '<td colspan="3" class="text-center">Total ' . count($courses) . ' Mata Kuliah</td>';
            echo '</tr>';
            echo '</tfoot>';
            echo '</table></body></html>';
        }, 200, [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Cache-Control' => 'max-age=0, no-cache, must-revalidate, proxy-revalidate',
            'Pragma' => 'public',
        ]);
    }

    /**
     * Cetak Pratinjau Dokumen PDF Resmi Berkop untuk Daftar Mata Kuliah
     */
    public function printPdf(Request $request): View
    {
        $programId = $request->input('program_id');
        $studyProgram = $programId ? DB::table('study_programs')->where('id', $programId)->first() : null;

        $query = DB::table('courses')
            ->leftJoin('study_programs', 'study_programs.id', '=', 'courses.study_program_id')
            ->select('courses.*', 'study_programs.name as study_program_name', 'study_programs.code as study_program_code');

        if ($programId) {
            $query->where('courses.study_program_id', $programId);
        }

        $courses = $query->orderBy('courses.code', 'asc')->get();
        $activePeriod = DB::table('academic_periods')->where('is_active', true)->first();

        // Calculate totals
        $totalCredits = $courses->sum('credits');
        $totalTheory = $courses->sum(fn($c) => $c->theory_credits ?? $c->credits);
        $totalPractice = $courses->sum('practice_credits');
        $totalField = $courses->sum('field_credits');

        // Look up Kaprodi if prodi specified
        $kaprodi = null;
        if ($studyProgram) {
            $kaprodi = DB::table('users')
                ->where('role', 'kaprodi')
                ->where(function ($q) use ($studyProgram) {
                    $q->where('study_program', 'like', "%{$studyProgram->code}%")
                      ->orWhere('study_program', 'like', "%{$studyProgram->name}%");
                })
                ->first();
        }

        return view('pdf.courses', [
            'courses' => $courses,
            'studyProgram' => $studyProgram,
            'activePeriod' => $activePeriod,
            'totalCredits' => $totalCredits,
            'totalTheory' => $totalTheory,
            'totalPractice' => $totalPractice,
            'totalField' => $totalField,
            'kaprodi' => $kaprodi,
        ]);
    }
}
