<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Tampilan Form Login
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Auth/Login');
    }

    /**
     * Eksekusi Login dengan Validasi 4-Digit Captcha & Multi-Identifier
     */
    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'captcha' => ['required', 'string', 'size:4'],
        ], [
            'login.required' => 'NIM, NIDN, Username, atau Email wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
            'captcha.required' => 'Kode keamanan captcha wajib diisi.',
            'captcha.size' => 'Kode captcha harus terdiri dari 4 karakter.',
        ]);

        // 1. Validasi Captcha
        $storedHash = session('captcha_hash');
        $expiresAt = session('captcha_expires_at');
        $inputCaptcha = strtoupper(trim($request->input('captcha')));
        $calculatedHash = hash_hmac('sha256', $inputCaptcha, config('app.key'));

        // Reset session captcha (single-use)
        session()->forget(['captcha_hash', 'captcha_expires_at']);

        if (!$storedHash || now()->timestamp > $expiresAt || !hash_equals($storedHash, $calculatedHash)) {
            return back()->withErrors([
                'captcha' => 'Kode keamanan captcha salah atau sudah kedaluwarsa. Silakan coba lagi.',
            ])->withInput($request->except('password', 'captcha'));
        }

        // 2. Multi-Identifier Lookup (NIM / NIDN / NIP / Username / Email)
        $loginInput = trim($request->input('login'));
        $user = User::where('username', $loginInput)
            ->orWhere('identity_number', $loginInput)
            ->orWhere('email', $loginInput)
            ->first();

        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors([
                'login' => 'Kombinasi identitas pengguna dan kata sandi tidak ditemukan.',
            ])->withInput($request->except('password', 'captcha'));
        }

        if (!$user->is_active) {
            return back()->withErrors([
                'login' => 'Akun Anda sedang dinonaktifkan oleh Administrator. Silakan hubungi BAAK.',
            ]);
        }

        // 3. Login User & Regenerate Session
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        // 4. Catat Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => $user->id,
            'action' => 'LOGIN',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'User',
            'target_id' => (string) $user->id,
            'details' => json_encode(['role' => $user->role, 'name' => $user->name]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return redirect()->intended(route('dashboard'));
    }

    /**
     * Logout
     */
    public function logout(Request $request): RedirectResponse
    {
        $userId = Auth::id();
        
        if ($userId) {
            DB::table('audit_logs')->insert([
                'user_id' => $userId,
                'action' => 'LOGOUT',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
