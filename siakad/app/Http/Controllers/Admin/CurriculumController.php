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
     * Tampilkan Data Kurikulum Berdasarkan Program Studi yang Dipilih
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->select('id', 'code', 'national_code', 'name', 'degree')
            ->orderBy('id', 'asc')
            ->get();

        $selectedProgramId = $request->input('program_id');
        
        // Default ke program studi pertama jika belum ada yang dipilih tapi ingin menampilkan
        $curricula = collect();
        if ($selectedProgramId) {
            $curricula = DB::table('curricula')
                ->join('study_programs', 'curricula.study_program_id', '=', 'study_programs.id')
                ->where('curricula.study_program_id', $selectedProgramId)
                ->select(
                    'curricula.*',
                    'study_programs.name as study_program_name',
                    'study_programs.code as study_program_code',
                    'study_programs.national_code as study_program_national_code'
                )
                ->orderBy('curricula.start_year', 'desc')
                ->get();
        }

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
            'is_active' => ['boolean'],
        ]);

        DB::table('curricula')->insert([
            'study_program_id' => $validated['study_program_id'],
            'code' => $validated['code'],
            'name' => $validated['name'],
            'start_year' => $validated['start_year'],
            'ideal_semesters' => $validated['ideal_semesters'],
            'total_credits_required' => $validated['total_credits_required'],
            'mandatory_credits' => $validated['mandatory_credits'],
            'elective_credits' => $validated['elective_credits'],
            'is_active' => $validated['is_active'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.curricula.index', ['program_id' => $validated['study_program_id']])
            ->with('success', 'Data kurikulum baru berhasil disimpan.');
    }

    /**
     * Hapus Kurikulum
     */
    public function destroy(int $id): RedirectResponse
    {
        $curriculum = DB::table('curricula')->find($id);
        $programId = $curriculum?->study_program_id;
        
        DB::table('curricula')->where('id', $id)->delete();

        return redirect()->route('admin.curricula.index', ['program_id' => $programId])
            ->with('success', 'Kurikulum berhasil dihapus.');
    }
}
