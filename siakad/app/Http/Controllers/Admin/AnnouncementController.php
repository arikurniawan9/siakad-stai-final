<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Tampilkan Pengumuman Broadcast Kampus
     */
    public function index(Request $request): Response
    {
        $studyPrograms = DB::table('study_programs')->get();

        $announcements = DB::table('announcements')
            ->leftJoin('users', 'announcements.created_by_id', '=', 'users.id')
            ->leftJoin('study_programs', 'announcements.target_study_program_id', '=', 'study_programs.id')
            ->select(
                'announcements.*',
                'users.name as author_name',
                'study_programs.name as target_study_program_name'
            )
            ->orderBy('is_pinned', 'desc')
            ->orderBy('announcements.id', 'desc')
            ->paginate(15);

        return Inertia::render('Admin/Announcements/Index', [
            'announcements' => $announcements,
            'studyPrograms' => $studyPrograms,
        ]);
    }

    /**
     * Tambah Pengumuman Broadcast Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'type' => ['required', 'in:INFO,WARNING,URGENT,EVENT'],
            'target_role' => ['required', 'in:ALL,DOSEN,MAHASISWA,ADMIN'],
            'target_study_program_id' => ['nullable', 'exists:study_programs,id'],
            'target_batch_year' => ['nullable', 'string', 'max:10'],
            'is_pinned' => ['boolean'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
        ]);

        DB::table('announcements')->insert([
            'title' => $validated['title'],
            'content' => $validated['content'],
            'type' => $validated['type'],
            'target_role' => $validated['target_role'],
            'target_study_program_id' => $validated['target_study_program_id'] ?? null,
            'target_batch_year' => $validated['target_batch_year'] ?? null,
            'is_pinned' => $validated['is_pinned'] ?? false,
            'is_active' => true,
            'created_by_id' => Auth::id(),
            'start_date' => $validated['start_date'] ?? now(),
            'end_date' => $validated['end_date'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Pengumuman resmi berhasil diterbitkan ke seluruh civitas akademika.');
    }

    /**
     * Toggle Pin / Aktif
     */
    public function togglePin(int $id): RedirectResponse
    {
        $ann = DB::table('announcements')->find($id);
        if ($ann) {
            DB::table('announcements')->where('id', $id)->update([
                'is_pinned' => !$ann->is_pinned,
                'updated_at' => now(),
            ]);
        }
        return back()->with('success', 'Status pin pengumuman diperbarui.');
    }

    /**
     * Hapus Pengumuman
     */
    public function destroy(int $id): RedirectResponse
    {
        DB::table('announcements')->where('id', $id)->delete();
        return back()->with('success', 'Pengumuman berhasil dihapus.');
    }
}
