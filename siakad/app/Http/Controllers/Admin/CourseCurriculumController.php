<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CourseCurriculumController extends Controller
{
    /**
     * Tampilkan Data Matakuliah - Kurikulum Berdasarkan Program Studi & Kurikulum Terpilih
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->select('id', 'code', 'national_code', 'name', 'degree')
            ->orderBy('id', 'asc')
            ->get();

        $selectedProgramId = $request->input('program_id');
        $selectedCurriculumId = $request->input('curriculum_id');

        $curricula = collect();
        $mappedCourses = collect();
        $availableCourses = collect();

        if ($selectedProgramId) {
            $curricula = DB::table('curricula')
                ->where('study_program_id', $selectedProgramId)
                ->orderBy('start_year', 'desc')
                ->get();

            // Ambil master matakuliah untuk dropdown penugasan
            $availableCourses = DB::table('courses')
                ->where('study_program_id', $selectedProgramId)
                ->select('id', 'code', 'name', 'credits', 'course_type', 'course_group')
                ->orderBy('code', 'asc')
                ->get();

            if (!$selectedCurriculumId && $curricula->isNotEmpty()) {
                $selectedCurriculumId = $curricula->first()->id;
            }

            if ($selectedCurriculumId) {
                $mappedCourses = DB::table('courses')
                    ->where('curriculum_id', $selectedCurriculumId)
                    ->orderBy('semester_level', 'asc')
                    ->orderBy('code', 'asc')
                    ->get();
            }
        }

        return Inertia::render('Admin/CourseCurriculum/Index', [
            'studyPrograms' => $studyPrograms,
            'selectedProgramId' => $selectedProgramId ? (int) $selectedProgramId : null,
            'curricula' => $curricula,
            'selectedCurriculumId' => $selectedCurriculumId ? (int) $selectedCurriculumId : null,
            'mappedCourses' => $mappedCourses,
            'availableCourses' => $availableCourses,
        ]);
    }

    /**
     * Tambahkan / Plotting Mata Kuliah ke Kurikulum & Semester
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'program_id' => ['required', 'exists:study_programs,id'],
            'curriculum_id' => ['required', 'exists:curricula,id'],
            'course_id' => ['required', 'exists:courses,id'],
            'semester' => ['required', 'integer', 'min:1', 'max:14'],
        ]);

        $sourceCourse = DB::table('courses')->find($validated['course_id']);

        if ($sourceCourse) {
            // Update atau copy ke kurikulum target
            $existing = DB::table('courses')
                ->where('curriculum_id', $validated['curriculum_id'])
                ->where('code', $sourceCourse->code)
                ->first();

            if ($existing) {
                DB::table('courses')->where('id', $existing->id)->update([
                    'semester_level' => $validated['semester'],
                    'updated_at' => now(),
                ]);
            } else {
                DB::table('courses')->insert([
                    'curriculum_id' => $validated['curriculum_id'],
                    'study_program_id' => $validated['program_id'],
                    'code' => $sourceCourse->code,
                    'name' => $sourceCourse->name,
                    'credits' => $sourceCourse->credits,
                    'theory_credits' => $sourceCourse->theory_credits,
                    'practice_credits' => $sourceCourse->practice_credits,
                    'field_credits' => $sourceCourse->field_credits ?? 0,
                    'semester_level' => $validated['semester'],
                    'course_type' => $sourceCourse->course_type,
                    'course_group' => $sourceCourse->course_group,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return redirect()->route('admin.course_curriculum.index', [
            'program_id' => $validated['program_id'],
            'curriculum_id' => $validated['curriculum_id']
        ])->with('success', 'Mata kuliah berhasil dimasukkan ke struktur semester kurikulum.');
    }

    /**
     * Hapus Pemetaan Matakuliah dari Kurikulum
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $course = DB::table('courses')->find($id);
        $programId = $course?->study_program_id;
        $curriculumId = $course?->curriculum_id;

        DB::table('courses')->where('id', $id)->delete();

        return redirect()->route('admin.course_curriculum.index', [
            'program_id' => $programId,
            'curriculum_id' => $curriculumId
        ])->with('success', 'Mata kuliah berhasil dihapus dari kurikulum.');
    }
}
