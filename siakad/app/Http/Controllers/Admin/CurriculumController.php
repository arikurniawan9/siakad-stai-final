<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumController extends Controller
{
    /**
     * Tampilkan Data Kurikulum (Semua Kurikulum atau Berdasarkan Filter Program Studi)
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->select('id', 'code', 'name', 'degree')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($p) {
                $p->curricula_count = DB::table('curricula')->where('study_program_id', $p->id)->count();
                return $p;
            });

        $selectedProgramId = $request->input('program_id');
        
        $query = DB::table('curricula')
            ->join('study_programs', 'curricula.study_program_id', '=', 'study_programs.id')
            ->select(
                'curricula.*',
                'study_programs.name as study_program_name',
                'study_programs.code as study_program_code',
                'study_programs.degree as study_program_degree'
            );

        if ($selectedProgramId) {
            $query->where('curricula.study_program_id', $selectedProgramId);
        }

        $curricula = $query
            ->orderBy('study_programs.id', 'asc')
            ->orderBy('curricula.start_year', 'desc')
            ->get()
            ->map(function ($c) {
                $c->courses_count = DB::table('courses')->where('curriculum_id', $c->id)->count();
                $c->is_active = (bool) $c->is_active;
                return $c;
            });

        return Inertia::render('Admin/Curricula/Index', [
            'studyPrograms' => $studyPrograms,
            'selectedProgramId' => $selectedProgramId ? (int) $selectedProgramId : null,
            'curricula' => $curricula,
        ]);
    }

    /**
     * Tambah Kurikulum Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'code' => ['required', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:100'],
            'start_year' => ['required', 'integer', 'min:2000', 'max:2099'],
            'ideal_semesters' => ['required', 'integer', 'min:1', 'max:14'],
            'total_credits_required' => ['required', 'integer', 'min:1'],
            'mandatory_credits' => ['required', 'integer', 'min:0'],
            'elective_credits' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('curricula')->insert([
            'study_program_id' => $validated['study_program_id'],
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'start_year' => $validated['start_year'],
            'ideal_semesters' => $validated['ideal_semesters'],
            'total_credits_required' => $validated['total_credits_required'],
            'mandatory_credits' => $validated['mandatory_credits'],
            'elective_credits' => $validated['elective_credits'],
            'is_active' => $request->boolean('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.curricula.index', $validated['study_program_id'] ? ['program_id' => $validated['study_program_id']] : [])
            ->with('success', 'Data kurikulum baru berhasil disimpan.');
    }

    /**
     * Perbarui Data Kurikulum
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'study_program_id' => ['required', 'exists:study_programs,id'],
            'code' => ['required', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:100'],
            'start_year' => ['required', 'integer', 'min:2000', 'max:2099'],
            'ideal_semesters' => ['required', 'integer', 'min:1', 'max:14'],
            'total_credits_required' => ['required', 'integer', 'min:1'],
            'mandatory_credits' => ['required', 'integer', 'min:0'],
            'elective_credits' => ['required', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('curricula')
            ->where('id', $id)
            ->update([
                'study_program_id' => $validated['study_program_id'],
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'start_year' => $validated['start_year'],
                'ideal_semesters' => $validated['ideal_semesters'],
                'total_credits_required' => $validated['total_credits_required'],
                'mandatory_credits' => $validated['mandatory_credits'],
                'elective_credits' => $validated['elective_credits'],
                'is_active' => $request->boolean('is_active', true),
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.curricula.index', $validated['study_program_id'] ? ['program_id' => $validated['study_program_id']] : [])
            ->with('success', 'Data kurikulum berhasil diperbarui.');
    }

    /**
     * Hapus Kurikulum
     */
    public function destroy(int $id): RedirectResponse
    {
        $curriculum = DB::table('curricula')->find($id);
        $programId = $curriculum?->study_program_id;
        
        // Cek mata kuliah terhubung
        $coursesCount = DB::table('courses')->where('curriculum_id', $id)->count();
        if ($coursesCount > 0) {
            return back()->with('error', "Tidak dapat menghapus kurikulum ini karena masih memiliki {$coursesCount} mata kuliah terhubung.");
        }

        DB::table('curricula')->where('id', $id)->delete();

        return redirect()->route('admin.curricula.index', $programId ? ['program_id' => $programId] : [])
            ->with('success', 'Kurikulum berhasil dihapus.');
    }
}
