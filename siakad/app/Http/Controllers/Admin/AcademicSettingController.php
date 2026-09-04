<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class AcademicSettingController extends Controller
{
    /**
     * Tampilkan Halaman Setting Kebijakan Akademik
     * (Bobot & Skala Nilai, SKS Maksimum, Predikat Kelulusan, Gelar Kelulusan)
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'study_programs.faculty_id', '=', 'faculties.id')
            ->select('study_programs.*', 'faculties.name as faculty_name', 'faculties.code as faculty_code')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        // 1. Skala Nilai (Semua data skala nilai agar bisa difilter instan di sisi klien)
        $gradingScales = DB::table('grading_scales')
            ->orderBy('min_score', 'asc')
            ->get();

        // 2. Komposisi Bobot Nilai Komponen
        $gradeWeights = DB::table('grade_weights')
            ->orderBy('id', 'asc')
            ->get();

        // 3. Batas Beban SKS Maksimum Mahasiswa
        $sksLimits = DB::table('sks_limits')
            ->orderBy('min_ips', 'desc')
            ->get();

        // 4. Predikat Kelulusan (Yudisium Honours)
        $graduationPredicates = DB::table('graduation_predicates')
            ->orderBy('min_gpa', 'desc')
            ->get();

        // 5. Gelar Kelulusan Program Studi
        $studyProgramDegrees = DB::table('study_program_degrees')
            ->join('study_programs', 'study_program_degrees.study_program_id', '=', 'study_programs.id')
            ->select('study_program_degrees.*', 'study_programs.code as program_code', 'study_programs.name as program_name')
            ->orderBy('study_programs.id', 'asc')
            ->get();

        // 6. Tahun Akademik Aktif
        $activePeriod = DB::table('academic_periods')
            ->join('academic_years', 'academic_periods.academic_year_id', '=', 'academic_years.id')
            ->where('academic_periods.is_active', true)
            ->select('academic_periods.*', 'academic_years.name as year_name')
            ->first();

        return Inertia::render('Admin/Settings/Academic/Index', [
            'studyPrograms' => $studyPrograms,
            'gradingScales' => $gradingScales,
            'gradeWeights' => $gradeWeights,
            'sksLimits' => $sksLimits,
            'graduationPredicates' => $graduationPredicates,
            'studyProgramDegrees' => $studyProgramDegrees,
            'activePeriod' => $activePeriod,
        ]);
    }

    /**
     * Tambah Baris Skala Nilai Baru
     */
    public function storeScale(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'grade_letter' => ['required', 'string', 'max:8'],
            'min_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'max_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade_point' => ['required', 'numeric', 'min:0', 'max:4'],
            'predicate' => ['nullable', 'string', 'max:64'],
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'is_passing' => ['boolean'],
        ]);

        DB::table('grading_scales')->insert([
            'grade_letter' => strtoupper($validated['grade_letter']),
            'min_score' => (float) $validated['min_score'],
            'max_score' => (float) $validated['max_score'],
            'grade_point' => (float) $validated['grade_point'],
            'predicate' => $validated['predicate'] ?? null,
            'study_program_id' => $validated['study_program_id'],
            'is_passing' => $validated['is_passing'] ?? true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Baris skala nilai {$validated['grade_letter']} berhasil ditambahkan.");
    }

    /**
     * Perbarui Baris Skala Nilai
     */
    public function updateScale(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'grade_letter' => ['required', 'string', 'max:8'],
            'min_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'max_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'grade_point' => ['required', 'numeric', 'min:0', 'max:4'],
            'predicate' => ['nullable', 'string', 'max:64'],
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'is_passing' => ['boolean'],
        ]);

        DB::table('grading_scales')->where('id', $id)->update([
            'grade_letter' => strtoupper($validated['grade_letter']),
            'min_score' => (float) $validated['min_score'],
            'max_score' => (float) $validated['max_score'],
            'grade_point' => (float) $validated['grade_point'],
            'predicate' => $validated['predicate'] ?? null,
            'study_program_id' => $validated['study_program_id'] ?? null,
            'is_passing' => $validated['is_passing'] ?? true,
            'updated_at' => now(),
        ]);

        return back()->with('success', "Skala nilai {$validated['grade_letter']} berhasil diperbarui.");
    }

    /**
     * Hapus Baris Skala Nilai
     */
    public function destroyScale(int $id): RedirectResponse
    {
        DB::table('grading_scales')->where('id', $id)->delete();
        return back()->with('success', 'Baris skala nilai berhasil dihapus.');
    }

    /**
     * Terapkan / Salin Template Skala Nilai Standar Institusi ke Program Studi
     */
    public function copyStandardScales(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
        ]);

        $programId = (int) $validated['study_program_id'];
        $prodi = DB::table('study_programs')->where('id', $programId)->first();

        // Template Skala Mutu Standar Institusi
        $standardScales = [
            ['grade_letter' => 'A', 'min_score' => 85.00, 'max_score' => 100.00, 'grade_point' => 4.00, 'predicate' => 'Sangat Baik (Istimewa)', 'is_passing' => true],
            ['grade_letter' => 'A-', 'min_score' => 80.00, 'max_score' => 84.99, 'grade_point' => 3.75, 'predicate' => 'Sangat Baik', 'is_passing' => true],
            ['grade_letter' => 'B+', 'min_score' => 75.00, 'max_score' => 79.99, 'grade_point' => 3.50, 'predicate' => 'Baik Sekali', 'is_passing' => true],
            ['grade_letter' => 'B', 'min_score' => 70.00, 'max_score' => 74.99, 'grade_point' => 3.00, 'predicate' => 'Baik', 'is_passing' => true],
            ['grade_letter' => 'C+', 'min_score' => 65.00, 'max_score' => 69.99, 'grade_point' => 2.50, 'predicate' => 'Cukup Baik', 'is_passing' => true],
            ['grade_letter' => 'C', 'min_score' => 60.00, 'max_score' => 64.99, 'grade_point' => 2.00, 'predicate' => 'Cukup (Batas Kelulusan KKM)', 'is_passing' => true],
            ['grade_letter' => 'D', 'min_score' => 50.00, 'max_score' => 59.99, 'grade_point' => 1.00, 'predicate' => 'Kurang (Wajib Mengulang)', 'is_passing' => false],
            ['grade_letter' => 'E', 'min_score' => 0.00, 'max_score' => 49.99, 'grade_point' => 0.00, 'predicate' => 'Gagal / Tidak Lulus', 'is_passing' => false],
        ];

        DB::transaction(function () use ($standardScales, $programId) {
            DB::table('grading_scales')->where('study_program_id', $programId)->delete();

            foreach ($standardScales as $scale) {
                DB::table('grading_scales')->insert([
                    'study_program_id' => $programId,
                    'grade_letter' => $scale['grade_letter'],
                    'min_score' => $scale['min_score'],
                    'max_score' => $scale['max_score'],
                    'grade_point' => $scale['grade_point'],
                    'predicate' => $scale['predicate'],
                    'is_passing' => $scale['is_passing'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return back()->with('success', "Template skala nilai standar berhasil diterapkan untuk program studi {$prodi->name}.");
    }

    /**
     * Simpan / Perbarui Bobot Komponen Penilaian Massal
     */
    public function updateGrading(Request $request): RedirectResponse
    {
        $weights = $request->input('weights', []);

        $totalWeight = 0;
        foreach ($weights as $w) {
            $totalWeight += (float) ($w['weight_percentage'] ?? 0);
        }

        if (abs($totalWeight - 100.0) > 0.01) {
            return back()->with('error', "Total akumulasi persentase bobot nilai harus tepat 100% (Saat ini: {$totalWeight}%).");
        }

        DB::transaction(function () use ($weights) {
            foreach ($weights as $w) {
                if (isset($w['id'])) {
                    DB::table('grade_weights')->where('id', $w['id'])->update([
                        'component_name' => $w['component_name'],
                        'weight_percentage' => (float) $w['weight_percentage'],
                        'min_attendance_percentage' => (float) ($w['min_attendance_percentage'] ?? 75.0),
                        'description' => $w['description'] ?? null,
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Komposisi bobot penilaian berhasil diperbarui.');
    }

    /**
     * Tambah Baris Aturan SKS Baru
     */
    public function storeSksLimit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'category' => ['required', 'string', 'max:64'],
            'min_ips' => ['required', 'numeric', 'min:0', 'max:4'],
            'max_ips' => ['required', 'numeric', 'min:0', 'max:4'],
            'max_sks' => ['required', 'integer', 'min:1', 'max:30'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        DB::table('sks_limits')->insert([
            'study_program_id' => $validated['study_program_id'],
            'category' => strtoupper($validated['category']),
            'min_ips' => (float) $validated['min_ips'],
            'max_ips' => (float) $validated['max_ips'],
            'max_sks' => (int) $validated['max_sks'],
            'description' => $validated['description'] ?? null,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Aturan batas ({$validated['max_sks']} SKS) berhasil ditambahkan.");
    }

    /**
     * Perbarui Baris Aturan SKS
     */
    public function updateSksLimit(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:64'],
            'min_ips' => ['required', 'numeric', 'min:0', 'max:4'],
            'max_ips' => ['required', 'numeric', 'min:0', 'max:4'],
            'max_sks' => ['required', 'integer', 'min:1', 'max:30'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        DB::table('sks_limits')->where('id', $id)->update([
            'category' => strtoupper($validated['category']),
            'min_ips' => (float) $validated['min_ips'],
            'max_ips' => (float) $validated['max_ips'],
            'max_sks' => (int) $validated['max_sks'],
            'description' => $validated['description'] ?? null,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Aturan batas SKS berhasil diperbarui.');
    }

    /**
     * Hapus Baris Aturan SKS
     */
    public function destroySksLimit(int $id): RedirectResponse
    {
        DB::table('sks_limits')->where('id', $id)->delete();
        return back()->with('success', 'Aturan batas SKS berhasil dihapus.');
    }

    /**
     * Simpan / Perbarui Batas SKS Maksimum Massal
     */
    public function updateSksLimits(Request $request): RedirectResponse
    {
        $limits = $request->input('limits', []);

        DB::transaction(function () use ($limits) {
            foreach ($limits as $lim) {
                if (isset($lim['id'])) {
                    DB::table('sks_limits')->where('id', $lim['id'])->update([
                        'category' => strtoupper($lim['category'] ?? 'REGULER'),
                        'min_ips' => (float) $lim['min_ips'],
                        'max_ips' => (float) $lim['max_ips'],
                        'max_sks' => (int) $lim['max_sks'],
                        'description' => $lim['description'] ?? null,
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Ketentuan beban SKS maksimum berhasil diperbarui.');
    }

    /**
     * Terapkan / Salin Template Skema SKS Maksimum Standar ke Program Studi
     */
    public function copyStandardSksLimits(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
        ]);

        $programId = (int) $validated['study_program_id'];
        $prodi = DB::table('study_programs')->where('id', $programId)->first();

        $standardLimits = [
            ['min_ips' => 3.50, 'max_ips' => 4.00, 'max_sks' => 24, 'category' => 'REGULER', 'description' => 'Prestasi Sangat Memuaskan (IPS ≥ 3.50): Beban maksimum 24 SKS.'],
            ['min_ips' => 3.00, 'max_ips' => 3.49, 'max_sks' => 22, 'category' => 'REGULER', 'description' => 'Prestasi Memuaskan (IPS 3.00 – 3.49): Beban maksimum 22 SKS.'],
            ['min_ips' => 2.50, 'max_ips' => 2.99, 'max_sks' => 20, 'category' => 'REGULER', 'description' => 'Prestasi Baik (IPS 2.50 – 2.99): Beban maksimum 20 SKS.'],
            ['min_ips' => 2.00, 'max_ips' => 2.49, 'max_sks' => 18, 'category' => 'REGULER', 'description' => 'Prestasi Cukup (IPS 2.00 – 2.49): Beban maksimum 18 SKS.'],
            ['min_ips' => 0.00, 'max_ips' => 1.99, 'max_sks' => 15, 'category' => 'REGULER', 'description' => 'Perhatian Akademik (IPS < 2.00): Beban dibatasi maksimum 15 SKS dengan pembinaan Dosen PA.'],
            ['min_ips' => 0.00, 'max_ips' => 4.00, 'max_sks' => 20, 'category' => 'MAHASISWA_BARU', 'description' => 'Paket Mahasiswa Baru Semester 1 & 2: Otomatis 20 SKS.'],
            ['min_ips' => 0.00, 'max_ips' => 4.00, 'max_sks' => 9, 'category' => 'SEMESTER_PENDEK', 'description' => 'Semester Antara / Pendek (Remedial & Akselerasi): Beban maksimum 9 SKS.'],
        ];

        DB::transaction(function () use ($standardLimits, $programId) {
            DB::table('sks_limits')->where('study_program_id', $programId)->delete();

            foreach ($standardLimits as $lim) {
                DB::table('sks_limits')->insert([
                    'study_program_id' => $programId,
                    'category' => $lim['category'],
                    'min_ips' => $lim['min_ips'],
                    'max_ips' => $lim['max_ips'],
                    'max_sks' => $lim['max_sks'],
                    'description' => $lim['description'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return back()->with('success', "Template aturan beban SKS standar berhasil diterapkan untuk program studi {$prodi->name}.");
    }

    /**
     * Simpan / Perbarui Predikat Kelulusan (Yudisium Honours)
     */
    public function updatePredicates(Request $request): RedirectResponse
    {
        $predicates = $request->input('predicates', []);

        DB::transaction(function () use ($predicates) {
            foreach ($predicates as $p) {
                if (isset($p['id'])) {
                    DB::table('graduation_predicates')->where('id', $p['id'])->update([
                        'predicate_name' => $p['predicate_name'],
                        'predicate_en' => $p['predicate_en'] ?? null,
                        'description' => $p['description'] ?? null,
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Daftar nama predikat kelulusan berhasil diperbarui.');
    }

    /**
     * Simpan / Perbarui Gelar Kelulusan Program Studi
     */
    public function updateDegrees(Request $request): RedirectResponse
    {
        $degrees = $request->input('degrees', []);

        DB::transaction(function () use ($degrees) {
            foreach ($degrees as $d) {
                if (isset($d['id'])) {
                    DB::table('study_program_degrees')->where('id', $d['id'])->update([
                        'degree_full_title' => $d['degree_full_title'],
                        'degree_short_title' => $d['degree_short_title'],
                        'degree_full_title_en' => $d['degree_full_title_en'] ?? null,
                        'degree_short_title_en' => $d['degree_short_title_en'] ?? null,
                        'total_credits_required' => (int) $d['total_credits_required'],
                        'sk_accreditation_number' => $d['sk_accreditation_number'] ?? null,
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        return back()->with('success', 'Informasi gelar akademik program studi berhasil diperbarui.');
    }
}
