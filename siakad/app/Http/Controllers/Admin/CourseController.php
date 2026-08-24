<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

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
            ->get();

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
            'credits' => ['required', 'numeric', 'min:0'],
            'theory_credits' => ['required', 'numeric', 'min:0'],
            'practice_credits' => ['required', 'numeric', 'min:0'],
            'field_credits' => ['required', 'numeric', 'min:0'],
            'course_type' => ['required', 'string'],
            'course_group' => ['required', 'string'],
        ]);

        // Cari kurikulum aktif prodi ini atau buat relasi default
        $curriculum = DB::table('curricula')
            ->where('study_program_id', $validated['study_program_id'])
            ->orderBy('id', 'desc')
            ->first();

        $curriculumId = $curriculum?->id ?? 1;

        DB::table('courses')->insert([
            'curriculum_id' => $curriculumId,
            'study_program_id' => $validated['study_program_id'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'credits' => $validated['credits'],
            'theory_credits' => $validated['theory_credits'],
            'practice_credits' => $validated['practice_credits'],
            'field_credits' => $validated['field_credits'],
            'course_type' => $validated['course_type'],
            'course_group' => $validated['course_group'],
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.courses.index', ['program_id' => $validated['study_program_id']])
            ->with('success', 'Mata kuliah baru berhasil ditambahkan.');
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
}
