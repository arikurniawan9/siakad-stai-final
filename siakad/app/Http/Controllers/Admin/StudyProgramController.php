<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StudyProgramController extends Controller
{
    /**
     * Tampilkan Halaman Master Program Studi & Fakultas
     */
    public function index(): Response
    {
        $studyPrograms = DB::table('study_programs')
            ->leftJoin('faculties', 'study_programs.faculty_id', '=', 'faculties.id')
            ->leftJoin('users as kaprodi', 'study_programs.head_of_program_id', '=', 'kaprodi.id')
            ->leftJoin('users as sekretaris', 'study_programs.secretary_id', '=', 'sekretaris.id')
            ->select(
                'study_programs.*',
                'faculties.name as faculty_name',
                'faculties.code as faculty_code',
                'kaprodi.name as head_of_program_name',
                'kaprodi.identity_number as head_of_program_nidn',
                'sekretaris.name as secretary_name'
            )
            ->orderBy('study_programs.faculty_id', 'asc')
            ->orderBy('study_programs.id', 'asc')
            ->get()
            ->map(function ($prodi) {
                $curriculaCount = DB::table('curricula')->where('study_program_id', $prodi->id)->count();
                $studentsCount = DB::table('users')
                    ->where('role', 'mahasiswa')
                    ->where(function ($q) use ($prodi) {
                        $q->where('study_program', 'like', "%{$prodi->name}%")
                          ->orWhere('study_program', 'like', "%{$prodi->code}%");
                    })
                    ->count();

                $prodi->curricula_count = $curriculaCount;
                $prodi->students_count = $studentsCount;
                $prodi->is_active = (bool) $prodi->is_active;
                return $prodi;
            });

        $faculties = DB::table('faculties')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($f) {
                $f->prodi_count = DB::table('study_programs')->where('faculty_id', $f->id)->count();
                $f->is_active = (bool) $f->is_active;
                return $f;
            });

        $lecturers = DB::table('users')
            ->whereIn('role', ['dosen', 'kaprodi', 'dosen_pa', 'admin_akademik', 'superadmin'])
            ->select('id', 'name', 'identity_number', 'role', 'email')
            ->orderBy('name', 'asc')
            ->get();

        return Inertia::render('Admin/StudyPrograms/Index', [
            'studyPrograms' => $studyPrograms,
            'faculties' => $faculties,
            'lecturers' => $lecturers,
        ]);
    }

    /**
     * Simpan Program Studi Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'exists:faculties,id'],
            'code' => ['required', 'string', 'max:32', 'unique:study_programs,code'],
            'national_code' => ['nullable', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:100'],
            'degree' => ['required', 'string', 'in:D3,D4,S1,S2,S3,Profesi'],
            'accreditation' => ['required', 'string', 'in:Unggul,Baik Sekali,Baik,A,B,C,Belum Terakreditasi'],
            'sk_number' => ['nullable', 'string', 'max:100'],
            'head_of_program_id' => ['nullable', 'exists:users,id'],
            'secretary_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $id = DB::table('study_programs')->insertGetId([
            'faculty_id' => $validated['faculty_id'],
            'code' => strtoupper($validated['code']),
            'national_code' => $validated['national_code'] ?? null,
            'name' => $validated['name'],
            'degree' => $validated['degree'],
            'accreditation' => $validated['accreditation'],
            'sk_number' => $validated['sk_number'] ?? null,
            'head_of_program_id' => $validated['head_of_program_id'] ?? null,
            'secretary_id' => $validated['secretary_id'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'STUDY_PROGRAM_CREATE',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'StudyProgram',
            'target_id' => (string) $id,
            'details' => json_encode(['code' => $validated['code'], 'name' => $validated['name']]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Program Studi {$validated['name']} ({$validated['code']}) berhasil ditambahkan.");
    }

    /**
     * Perbarui Program Studi
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'faculty_id' => ['required', 'exists:faculties,id'],
            'code' => ['required', 'string', 'max:32', 'unique:study_programs,code,' . $id],
            'national_code' => ['nullable', 'string', 'max:32'],
            'name' => ['required', 'string', 'max:100'],
            'degree' => ['required', 'string', 'in:D3,D4,S1,S2,S3,Profesi'],
            'accreditation' => ['required', 'string', 'in:Unggul,Baik Sekali,Baik,A,B,C,Belum Terakreditasi'],
            'sk_number' => ['nullable', 'string', 'max:100'],
            'head_of_program_id' => ['nullable', 'exists:users,id'],
            'secretary_id' => ['nullable', 'exists:users,id'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('study_programs')
            ->where('id', $id)
            ->update([
                'faculty_id' => $validated['faculty_id'],
                'code' => strtoupper($validated['code']),
                'national_code' => $validated['national_code'] ?? null,
                'name' => $validated['name'],
                'degree' => $validated['degree'],
                'accreditation' => $validated['accreditation'],
                'sk_number' => $validated['sk_number'] ?? null,
                'head_of_program_id' => $validated['head_of_program_id'] ?? null,
                'secretary_id' => $validated['secretary_id'] ?? null,
                'is_active' => $request->boolean('is_active', true),
                'updated_at' => now(),
            ]);

        // Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'STUDY_PROGRAM_UPDATE',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'StudyProgram',
            'target_id' => (string) $id,
            'details' => json_encode(['code' => $validated['code'], 'name' => $validated['name']]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Data Program Studi {$validated['name']} berhasil diperbarui.");
    }

    /**
     * Hapus Program Studi
     */
    public function destroy(Request $request, int $id): RedirectResponse
    {
        $prodi = DB::table('study_programs')->find($id);
        if (!$prodi) {
            return back()->with('error', 'Program Studi tidak ditemukan.');
        }

        // Cek keterikatan data
        $curriculaCount = DB::table('curricula')->where('study_program_id', $id)->count();
        if ($curriculaCount > 0) {
            return back()->with('error', "Tidak dapat menghapus Prodi {$prodi->name} karena masih memiliki {$curriculaCount} data kurikulum aktif.");
        }

        DB::table('study_programs')->where('id', $id)->delete();

        // Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => Auth::id(),
            'action' => 'STUDY_PROGRAM_DELETE',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'StudyProgram',
            'target_id' => (string) $id,
            'details' => json_encode(['code' => $prodi->code, 'name' => $prodi->name]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Program Studi {$prodi->name} berhasil dihapus.");
    }

    /**
     * Tambah Fakultas Baru
     */
    public function storeFaculty(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:faculties,code'],
            'name' => ['required', 'string', 'max:100'],
            'dean_name' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('faculties')->insert([
            'code' => strtoupper($validated['code']),
            'name' => $validated['name'],
            'dean_name' => $validated['dean_name'] ?? null,
            'is_active' => $request->boolean('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Fakultas {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Update Fakultas
     */
    public function updateFaculty(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', 'unique:faculties,code,' . $id],
            'name' => ['required', 'string', 'max:100'],
            'dean_name' => ['nullable', 'string', 'max:100'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        DB::table('faculties')
            ->where('id', $id)
            ->update([
                'code' => strtoupper($validated['code']),
                'name' => $validated['name'],
                'dean_name' => $validated['dean_name'] ?? null,
                'is_active' => $request->boolean('is_active', true),
                'updated_at' => now(),
            ]);

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Data Fakultas {$validated['name']} berhasil diperbarui.");
    }

    /**
     * Hapus Fakultas
     */
    public function destroyFaculty(int $id): RedirectResponse
    {
        $faculty = DB::table('faculties')->find($id);
        if (!$faculty) {
            return back()->with('error', 'Fakultas tidak ditemukan.');
        }

        $prodiCount = DB::table('study_programs')->where('faculty_id', $id)->count();
        if ($prodiCount > 0) {
            return back()->with('error', "Tidak dapat menghapus Fakultas {$faculty->name} karena masih menaungi {$prodiCount} Program Studi.");
        }

        DB::table('faculties')->where('id', $id)->delete();

        return redirect()->route('admin.study_programs.index')
            ->with('success', "Fakultas {$faculty->name} berhasil dihapus.");
    }
}
