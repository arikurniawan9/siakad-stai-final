<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CampusOfficialController extends Controller
{
    /**
     * Tampilkan Halaman Data Pejabat Struktural & Pejabat Pengesah Dokumen
     */
    public function index(): Response
    {
        // 1. Data Pejabat Struktural Kampus (lecturer_positions)
        $officialsList = DB::table('lecturer_positions')
            ->join('users', 'lecturer_positions.user_id', '=', 'users.id')
            ->join('structural_positions', 'lecturer_positions.position_id', '=', 'structural_positions.id')
            ->leftJoin('study_programs', 'lecturer_positions.study_program_id', '=', 'study_programs.id')
            ->select(
                'lecturer_positions.*',
                'users.name as official_name',
                'users.identity_number as official_nip_nidn',
                'users.email as official_email',
                'users.avatar as official_avatar',
                'structural_positions.name as position_name',
                'structural_positions.code as position_code',
                'structural_positions.level as position_level',
                'structural_positions.can_approve_krs',
                'structural_positions.can_sign_transcripts',
                'structural_positions.can_manage_finance',
                'study_programs.name as prodi_name',
                'study_programs.code as prodi_code'
            )
            ->orderBy('structural_positions.level', 'asc')
            ->orderBy('lecturer_positions.id', 'asc')
            ->get();

        // 2. Data Pejabat Pengesah Dokumen Resmi (institutional_signatories)
        $signatories = DB::table('institutional_signatories')
            ->leftJoin('users', 'institutional_signatories.user_id', '=', 'users.id')
            ->select(
                'institutional_signatories.*',
                'users.avatar as user_avatar'
            )
            ->orderBy('institutional_signatories.id', 'asc')
            ->get();

        // 3. Data Master Pendukung
        $allUsers = DB::table('users')
            ->whereIn('role', ['superadmin', 'admin_akademik', 'dosen', 'keuangan'])
            ->select('id', 'name', 'identity_number', 'role', 'email')
            ->orderBy('name', 'asc')
            ->get();

        $structuralPositions = DB::table('structural_positions')
            ->orderBy('level', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $studyPrograms = DB::table('study_programs')
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Admin/Settings/Officials/Index', [
            'officialsList' => $officialsList,
            'signatories' => $signatories,
            'allUsers' => $allUsers,
            'structuralPositions' => $structuralPositions,
            'studyPrograms' => $studyPrograms,
        ]);
    }

    /**
     * Tambah Penugasan Pejabat Struktural Baru
     */
    public function storeOfficial(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'position_id' => ['required', 'exists:structural_positions,id'],
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'sk_number' => ['required', 'string', 'max:128'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        DB::table('lecturer_positions')->insert([
            'user_id' => $validated['user_id'],
            'position_id' => $validated['position_id'],
            'study_program_id' => $validated['study_program_id'] ?? null,
            'sk_number' => $validated['sk_number'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Penugasan pejabat struktural baru berhasil disimpan.');
    }

    /**
     * Perbarui Penugasan Pejabat Struktural
     */
    public function updateOfficial(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'position_id' => ['required', 'exists:structural_positions,id'],
            'study_program_id' => ['nullable', 'exists:study_programs,id'],
            'sk_number' => ['required', 'string', 'max:128'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'is_active' => ['boolean'],
        ]);

        DB::table('lecturer_positions')->where('id', $id)->update([
            'user_id' => $validated['user_id'],
            'position_id' => $validated['position_id'],
            'study_program_id' => $validated['study_program_id'] ?? null,
            'sk_number' => $validated['sk_number'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Data penugasan pejabat struktural berhasil diperbarui.');
    }

    /**
     * Hapus Penugasan Pejabat Struktural
     */
    public function destroyOfficial(int $id): RedirectResponse
    {
        DB::table('lecturer_positions')->where('id', $id)->delete();
        return back()->with('success', 'Data penugasan pejabat berhasil dihapus.');
    }

    /**
     * Tambah Pejabat Pengesah Dokumen Resmi
     */
    public function storeSignatory(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_type' => ['required', 'string', 'max:64'],
            'document_title' => ['required', 'string', 'max:128'],
            'position_code' => ['required', 'string', 'max:64'],
            'position_title' => ['required', 'string', 'max:128'],
            'signatory_name' => ['required', 'string', 'max:128'],
            'signatory_nip_nidn' => ['required', 'string', 'max:64'],
            'user_id' => ['nullable', 'exists:users,id'],
        ]);

        DB::table('institutional_signatories')->insert([
            'document_type' => strtoupper($validated['document_type']),
            'document_title' => $validated['document_title'],
            'position_code' => strtoupper($validated['position_code']),
            'position_title' => $validated['position_title'],
            'signatory_name' => $validated['signatory_name'],
            'signatory_nip_nidn' => $validated['signatory_nip_nidn'],
            'user_id' => $validated['user_id'] ?? null,
            'include_qr_seal' => true,
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', "Penugasan Pejabat Pengesah baru ({$validated['document_title']}) berhasil ditambahkan.");
    }

    /**
     * Perbarui Data Pejabat Pengesah Dokumen
     */
    public function updateSignatory(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'document_title' => ['required', 'string', 'max:128'],
            'position_title' => ['required', 'string', 'max:128'],
            'signatory_name' => ['required', 'string', 'max:128'],
            'signatory_nip_nidn' => ['nullable', 'string', 'max:64'],
            'user_id' => ['nullable', 'exists:users,id'],
            'include_qr_seal' => ['boolean'],
            'is_active' => ['boolean'],
        ]);

        DB::table('institutional_signatories')->where('id', $id)->update([
            'document_title' => $validated['document_title'],
            'position_title' => $validated['position_title'],
            'signatory_name' => $validated['signatory_name'],
            'signatory_nip_nidn' => $validated['signatory_nip_nidn'] ?? null,
            'user_id' => $validated['user_id'] ?? null,
            'include_qr_seal' => $validated['include_qr_seal'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
            'updated_at' => now(),
        ]);

        return back()->with('success', "Data Pejabat Pengesah ({$validated['document_title']}) berhasil diperbarui.");
    }

    /**
     * Hapus Pejabat Pengesah
     */
    public function destroySignatory(int $id): RedirectResponse
    {
        DB::table('institutional_signatories')->where('id', $id)->delete();
        return back()->with('success', 'Data Pejabat Pengesah berhasil dihapus.');
    }
}
