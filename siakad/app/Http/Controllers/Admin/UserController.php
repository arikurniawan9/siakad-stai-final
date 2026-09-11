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

        $perPage = (int) $request->input('per_page', 15);
        if ($perPage <= 0 || $perPage > 100) $perPage = 15;

        $users = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where(function ($sq) use ($search) {
                    $sq->where('name', 'ilike', "%{$search}%")
                        ->orWhere('username', 'ilike', "%{$search}%")
                        ->orWhere('identity_number', 'ilike', "%{$search}%")
                        ->orWhere('nik', 'ilike', "%{$search}%")
                        ->orWhere('email', 'ilike', "%{$search}%");
                });
            })
            ->when($roleFilter, function ($q) use ($roleFilter) {
                $q->where(function ($sq) use ($roleFilter) {
                    $sq->where('role', $roleFilter)
                       ->orWhereJsonContains('roles', $roleFilter);
                });
            })
            ->when($prodiFilter, function ($q) use ($prodiFilter) {
                $q->where('study_program', $prodiFilter);
            })
            ->orderBy('id', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        $studyPrograms = DB::table('study_programs')->get();
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $mhsCount = User::where('role', 'mahasiswa')->orWhereJsonContains('roles', 'mahasiswa')->count();
        $dosenCount = User::where(function ($q) {
            $q->whereIn('role', ['dosen', 'dosen_pa', 'kaprodi'])
              ->orWhereJsonContains('roles', 'dosen')
              ->orWhereJsonContains('roles', 'dosen_pa')
              ->orWhereJsonContains('roles', 'kaprodi');
        })->count();
        $staffCount = User::where(function ($q) {
            $q->whereIn('role', ['superadmin', 'admin_akademik', 'keuangan'])
              ->orWhereJsonContains('roles', 'superadmin')
              ->orWhereJsonContains('roles', 'admin_akademik')
              ->orWhereJsonContains('roles', 'keuangan');
        })->count();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'studyPrograms' => $studyPrograms,
            'stats' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'students' => $mhsCount,
                'lecturers' => $dosenCount,
                'staff' => $staffCount,
            ],
            'filters' => [
                'search' => $search,
                'role' => $roleFilter,
                'study_program' => $prodiFilter,
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Tambah Pengguna / Akun Baru (Dukung 1 atau Banyak Peran)
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:64', 'unique:users,username'],
            'identity_number' => ['nullable', 'string', 'max:32', 'unique:users,identity_number'],
            'nik' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['nullable', 'string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'study_program' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $roles = !empty($validated['roles']) 
            ? array_values(array_unique($validated['roles'])) 
            : (!empty($validated['role']) ? [$validated['role']] : ['mahasiswa']);
        $primaryRole = $roles[0] ?? 'mahasiswa';

        User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'identity_number' => $validated['identity_number'] ?: null,
            'nik' => $validated['nik'] ?: null,
            'email' => $validated['email'],
            'role' => $primaryRole,
            'roles' => $roles,
            'study_program' => $validated['study_program'] ?: 'Pendidikan Agama Islam (S1)',
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'password' => Hash::make($validated['password'] ?: 'salam123'),
            'is_active' => true,
        ]);

        return back()->with('success', "Akun {$validated['name']} ({$validated['username']}) berhasil didaftarkan dengan " . count($roles) . " peran.");
    }

    /**
     * Perbarui Data Pengguna (Dukung 1 atau Banyak Peran)
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:64', Rule::unique('users')->ignore($user->id)],
            'identity_number' => ['nullable', 'string', 'max:32', Rule::unique('users')->ignore($user->id)],
            'nik' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => ['nullable', 'string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'in:superadmin,admin_akademik,keuangan,kaprodi,dosen_pa,dosen,mahasiswa'],
            'study_program' => ['nullable', 'string', 'max:100'],
            'gender' => ['nullable', 'in:L,P'],
            'phone_number' => ['nullable', 'string', 'max:24'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $roles = !empty($validated['roles']) 
            ? array_values(array_unique($validated['roles'])) 
            : (!empty($validated['role']) ? [$validated['role']] : $user->getAllRoles());
        $primaryRole = $roles[0] ?? $user->role;

        $user->update([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'identity_number' => $validated['identity_number'] ?: null,
            'nik' => $validated['nik'] ?: null,
            'email' => $validated['email'],
            'role' => $primaryRole,
            'roles' => $roles,
            'study_program' => $validated['study_program'] ?? $user->study_program,
            'gender' => $validated['gender'] ?: 'L',
            'phone_number' => $validated['phone_number'] ?: null,
            'is_active' => $validated['is_active'] ?? $user->is_active,
        ]);

        return back()->with('success', "Data akun {$user->name} berhasil diperbarui dengan peran: " . implode(', ', $roles) . ".");
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
     * Hapus Pengguna (Cascade Clean-up Relasional)
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = User::findOrFail($id);
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri.');
        }

        if ($user->role === 'superadmin' && User::where('role', 'superadmin')->count() <= 1) {
            return back()->with('error', 'Tidak dapat menghapus superadmin satu-satunya dalam sistem.');
        }

        DB::transaction(function () use ($user) {
            $userId = $user->id;

            // 1. Tagihan & VA BSI
            $invoices = DB::table('student_invoices')->where('user_id', $userId)->pluck('id')->toArray();
            if (!empty($invoices)) {
                DB::table('va_bsi_transactions')->whereIn('student_invoice_id', $invoices)->delete();
                if (DB::getSchemaBuilder()->hasTable('winpay_transactions')) {
                    DB::table('winpay_transactions')->whereIn('student_invoice_id', $invoices)->delete();
                }
                if (DB::getSchemaBuilder()->hasTable('fee_dispensations')) {
                    DB::table('fee_dispensations')->whereIn('student_invoice_id', $invoices)->delete();
                }
                DB::table('student_invoices')->whereIn('id', $invoices)->delete();
            }

            // 2. KRS & Rencana Studi
            $subs = DB::table('krs_submissions')->where('student_id', $userId)->pluck('id')->toArray();
            if (!empty($subs)) {
                DB::table('krs_items')->whereIn('krs_submission_id', $subs)->delete();
                DB::table('krs_submissions')->whereIn('id', $subs)->delete();
            }

            // 3. Class enrollments & Attendances
            DB::table('class_enrollments')->where('student_id', $userId)->delete();
            DB::table('attendances')->where('student_id', $userId)->delete();
            if (DB::getSchemaBuilder()->hasTable('student_attendances')) {
                DB::table('student_attendances')->where('student_id', $userId)->delete();
            }

            // 4. Grades, KHS, Transcripts
            DB::table('course_grades')->where('student_id', $userId)->delete();
            DB::table('khs_records')->where('student_id', $userId)->delete();
            DB::table('transcripts')->where('student_id', $userId)->delete();
            if (DB::getSchemaBuilder()->hasTable('transfer_grade_conversions')) {
                DB::table('transfer_grade_conversions')->where('student_id', $userId)->delete();
            }

            // 5. EDOM
            DB::table('edom_responses')->where('student_id', $userId)->delete();
            DB::table('student_edom_completions')->where('student_id', $userId)->delete();

            // 6. Skripsi, Yudisium & Aktivitas
            if (DB::getSchemaBuilder()->hasTable('thesis_submissions')) {
                DB::table('thesis_submissions')->where('student_id', $userId)->delete();
            }
            if (DB::getSchemaBuilder()->hasTable('yudisium_applicants')) {
                DB::table('yudisium_applicants')->where('student_id', $userId)->delete();
            }
            if (DB::getSchemaBuilder()->hasTable('student_activities')) {
                DB::table('student_activities')->where('student_id', $userId)->delete();
            }
            if (DB::getSchemaBuilder()->hasTable('student_leave_requests')) {
                DB::table('student_leave_requests')->where('student_id', $userId)->delete();
            }

            // 7. Relasi Dosen jika ada
            DB::table('class_lecturers')->where('lecturer_id', $userId)->delete();

            // 8. Hapus user
            $user->delete();

            DB::table('audit_logs')->insert([
                'user_id' => auth()->id(),
                'action' => 'USER_DELETE',
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'target_entity' => 'User',
                'target_id' => (string) $userId,
                'details' => json_encode(['name' => $user->name, 'username' => $user->username, 'role' => $user->role]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return back()->with('success', "Akun {$user->name} ({$user->role}) beserta seluruh data riwayat terkait berhasil dihapus.");
    }
}
