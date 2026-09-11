<?php

namespace App\Http\Controllers;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SetupSuperadminController extends Controller
{
    /**
     * Helper: Periksa apakah akun superadmin sudah ada di database
     */
    private function hasSuperadmin(): bool
    {
        return User::where(function ($q) {
            $q->where('role', 'superadmin')
              ->orWhere('username', 'superadmin')
              ->orWhereRaw("roles::text LIKE '%superadmin%'");
        })->exists();
    }

    /**
     * Tampilan Formulir Setup Superadmin Pertama Kali
     */
    public function show(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        if ($this->hasSuperadmin()) {
            return redirect()->route('login')->with('info', 'Akun Super Administrator sudah terkonfigurasi. Silakan masuk.');
        }

        return Inertia::render('Auth/SetupSuperadmin');
    }

    /**
     * Eksekusi Pembuatan Akun Superadmin Baru
     */
    public function store(Request $request): RedirectResponse
    {
        if ($this->hasSuperadmin()) {
            return redirect()->route('login')->with('error', 'Akun Super Administrator sudah terdaftar di sistem.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:64', 'alpha_dash', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
            'phone_number' => ['nullable', 'string', 'max:20'],
            'seed_default_accounts' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama lengkap Super Administrator wajib diisi.',
            'username.required' => 'Username login wajib diisi.',
            'username.unique' => 'Username ini sudah digunakan.',
            'username.alpha_dash' => 'Username hanya boleh huruf, angka, strip (-), dan garis bawah (_).',
            'email.required' => 'Alamat email aktif wajib diisi.',
            'email.unique' => 'Alamat email ini sudah terdaftar.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $savedPassword = Hash::make($validated['password']);

        $user = User::create([
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'identity_number' => 'SA-001',
            'email' => strtolower($validated['email']),
            'password' => $savedPassword,
            'role' => 'superadmin',
            'roles' => ['superadmin'],
            'phone_number' => $validated['phone_number'] ?? '081234567890',
            'study_program' => 'Pusat Komputer & Sistem Informasi',
            'gender' => 'L',
            'is_active' => true,
        ]);

        // Jika opsi seed akun default dicentang
        if ($request->boolean('seed_default_accounts', false)) {
            try {
                $userSeeder = new UserSeeder();
                $userSeeder->run();
                // Pastikan password superadmin yang baru dibuat tetap dipertahankan
                $user->update([
                    'name' => $validated['name'],
                    'password' => $savedPassword,
                    'email' => strtolower($validated['email']),
                ]);
            } catch (\Throwable $e) {}
        }

        // Catat Audit Log
        try {
            DB::table('audit_logs')->insert([
                'user_id' => $user->id,
                'action' => 'SUPERADMIN_INITIAL_SETUP',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'target_entity' => 'User',
                'target_id' => (string) $user->id,
                'details' => json_encode(['username' => $user->username, 'name' => $user->name]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        // Otomatis Login dan Arahkan ke Dashboard
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', "🎉 Selamat datang, {$user->name}! Inisialisasi Akun Super Administrator berhasil diselesaikan.");
    }
}
