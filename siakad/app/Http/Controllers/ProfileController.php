<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    /**
     * Perbarui profil mandiri pengguna yang sedang login
     */
    public function updateProfile(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (!$user) {
            return back()->with('error', 'Sesi login tidak valid.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone_number' => ['nullable', 'string', 'max:25'],
            'gender' => ['nullable', 'in:L,P'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Alamat email ini sudah digunakan oleh pengguna lain.',
            'gender.in' => 'Pilihan jenis kelamin tidak valid.',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'] ?: null,
            'gender' => $validated['gender'] ?: ($user->gender ?: 'L'),
        ]);

        return back()->with('success', 'Profil akun Anda berhasil diperbarui.');
    }

    /**
     * Ganti kata sandi login pengguna yang sedang login
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $user = auth()->user();
        if (!$user) {
            return back()->with('error', 'Sesi login tidak valid.');
        }

        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors([
                'current_password' => 'Kata sandi saat ini tidak sesuai dengan yang tersimpan di sistem.',
            ]);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Kata sandi akun Anda berhasil diperbarui. Silakan gunakan kata sandi baru untuk login selanjutnya.');
    }
}
