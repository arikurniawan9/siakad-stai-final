<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Tampilkan Daftar Pengguna & Fitur Mode Menyamar
     */
    public function index(Request $request): Response
    {
        $search = $request->input('search');
        $roleFilter = $request->input('role');
        $prodiFilter = $request->input('study_program');

        $users = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->where('role', $roleFilter);
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->orderBy('id', 'asc')
            ->paginate(15)
            ->withQueryString();

        $studyPrograms = DB::table('study_programs')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'studyPrograms' => $studyPrograms,
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'study_program' => $prodiFilter,
            ],
        ]);
    }

    /**
     * Tambah Pengguna / Akun Baru
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:64', 'unique:users,username'],
            'identity_number' => ['nullable', 'string', 'max:32', 'unique:users,identity_number'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'study_program' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'identity_number' => $validated['identity_number'] ?: null,
            'email' => $validated['email'],
            'role' => $validated['role'],
            'study_program' => $validated['study_program'] ?: 'Pendidikan Agama Islam (S1)',
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'password' => Hash::make($validated['password'] ?: 'salam123'),
            'is_active' => true,
        ]);

        return back()->with('success', "Akun {$validated['name']} ({$validated['username']}) berhasil didaftarkan.");
    }

    /**
     * Perbarui Data Pengguna
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:64', Rule::unique('users')->ignore($user->id)],
            'identity_number' => ['nullable', 'string', 'max:32', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['required', 'string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'study_program' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $user->update($validated);

        return back()->with('success', "Data akun {$user->name} berhasil diperbarui.");
    }

    /**
     * Reset Password Pengguna ke Default 'salam123'
     */
    public function resetPassword(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        $user->update([
            'password' => Hash::make('salam123'),
        ]);

        return back()->with('success', "Kata sandi akun {$user->name} ({$user->username}) berhasil direset menjadi 'salam123'.");
    }

    /**
     * Aktifkan / Nonaktifkan Akun
     */
    public function toggleStatus(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun yang sedang digunakan.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $statusText = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';
        return back()->with('success', "Status akun {$user->name} berhasil {$statusText}.");
    }

    /**
     * Impor Massal Pengguna via Data Parsed Excel / Array
     */
    public function importBatch(Request $request): RedirectResponse
    {
        $records = $request->input('records', []);
        if (empty($records)) {
            return back()->with('error', 'Tidak ada data pengguna yang diunggah.');
        }

        $createdCount = 0;
        $now = now();

        DB::transaction(function () use ($records, &$createdCount, $now) {
            foreach ($records as $r) {
                if (empty($r['name']) || empty($r['email'])) continue;

                $username = !empty($r['username']) ? $r['username'] : (!empty($r['identity_number']) ? $r['identity_number'] : explode('@', $r['email'])[0]);
                
                // Hindari duplikasi
                if (User::where('email', $r['email'])->orWhere('username', $username)->exists()) {
                    continue;
                }

                User::create([
                    'name' => $r['name'],
                    'username' => $username,
                    'identity_number' => $r['identity_number'] ?? null,
                    'email' => $r['email'],
                    'role' => $r['role'] ?? 'mahasiswa',
                    'study_program' => $r['study_program'] ?? 'Pendidikan Agama Islam (S1)',
                    'gender' => $r['gender'] ?? 'L',
                    'phone_number' => $r['phone_number'] ?? null,
                    'password' => Hash::make('salam123'),
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $createdCount++;
            }
        });

        return back()->with('success', "Berhasil mengimpor {$createdCount} data civitas akademika baru dengan kata sandi default 'salam123'!");
    }

    /**
     * Hapus Pengguna
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        $user->delete();
        return back()->with('success', "Akun {$user->name} berhasil dihapus dari sistem.");
    }
}
