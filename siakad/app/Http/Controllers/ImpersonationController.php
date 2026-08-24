<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ImpersonationController extends Controller
{
    /**
     * Mulai Mode Menyamar sebagai Pengguna Tertentu
     */
    public function impersonate(Request $request, User $user): RedirectResponse
    {
        $currentAuthUser = Auth::user();

        // Ambil admin asli dari session atau user saat ini
        $realAdminId = session('impersonated_by', $currentAuthUser->id);
        $realAdmin = User::find($realAdminId);

        if (!$realAdmin) {
            abort(403, 'Akses ditolak. Pengguna tidak valid.');
        }

        // Aturan Hak Akses Menyamar:
        // 1. Superadmin -> Bebas menyamar ke semua role
        // 2. Admin BAAK (admin_akademik) -> HANYA boleh menyamar ke Dosen dan Mahasiswa
        if ($realAdmin->role !== 'superadmin' && $realAdmin->role !== 'admin_akademik') {
            abort(403, 'Akses ditolak. Fitur Mode Menyamar hanya dapat diakses oleh Superadmin dan Admin BAAK.');
        }

        if ($realAdmin->role === 'admin_akademik') {
            $allowedRolesForAdmin = ['mahasiswa', 'dosen', 'dosen_pa'];
            if (!in_array($user->role, $allowedRolesForAdmin)) {
                return back()->with('error', "Akses Ditolak: Admin BAAK hanya diizinkan menyamar sebagai Dosen atau Mahasiswa, bukan {$user->role}.");
            }
        }

        // Simpan admin ID asli di session jika belum ada
        if (!session()->has('impersonated_by')) {
            session(['impersonated_by' => $currentAuthUser->id]);
            session(['impersonator_name' => $currentAuthUser->name]);
            session(['impersonator_role' => $currentAuthUser->role]);
        }

        // Catat di Audit Log
        DB::table('audit_logs')->insert([
            'user_id' => $realAdminId,
            'action' => 'IMPERSONATE_START',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'target_entity' => 'User',
            'target_id' => (string) $user->id,
            'details' => json_encode([
                'real_admin_role' => $realAdmin->role,
                'target_name' => $user->name,
                'target_role' => $user->role,
                'target_identifier' => $user->identity_number ?? $user->username,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Login sebagai target user
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', "Mode Menyamar Aktif: Anda sekarang melihat sistem sebagai {$user->name} ({$user->role}).");
    }

    /**
     * Hentikan Mode Menyamar dan Kembali ke Akun Admin Asli
     */
    public function stopImpersonating(Request $request): RedirectResponse
    {
        $realAdminId = session()->pull('impersonated_by');
        $realAdminRole = session()->pull('impersonator_role', 'superadmin');
        session()->forget('impersonator_name');

        if ($realAdminId) {
            $admin = User::find($realAdminId);
            if ($admin) {
                Auth::login($admin);
                $request->session()->regenerate();

                DB::table('audit_logs')->insert([
                    'user_id' => $admin->id,
                    'action' => 'IMPERSONATE_STOP',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($admin->role === 'admin_akademik') {
                    return redirect()->route('dashboard')->with('success', 'Mode menyamar dihentikan. Anda telah kembali ke akun Admin BAAK.');
                }

                return redirect()->route('admin.users.index')->with('success', 'Mode menyamar dihentikan. Anda telah kembali ke akun Superadmin.');
            }
        }

        return redirect()->route('dashboard');
    }
}
