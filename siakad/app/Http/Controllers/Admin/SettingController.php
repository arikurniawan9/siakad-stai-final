<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class SettingController extends Controller
{
    /**
     * Tampilan Halaman Pengaturan Sistem & Pemeliharaan
     */
    public function index(): Response
    {
        $settings = DB::table('system_settings')->get()->keyBy('key');

        $isMaintenance = app()->isDownForMaintenance();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'isMaintenance' => $isMaintenance,
        ]);
    }

    /**
     * Update Pengaturan Sistem
     */
    public function update(Request $request): RedirectResponse
    {
        $data = $request->except(['_token']);

        foreach ($data as $key => $val) {
            DB::table('system_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => (string) $val, 'updated_at' => now()]
            );
        }

        return back()->with('success', 'Pengaturan sistem berhasil diperbarui.');
    }

    /**
     * Toggle Maintenance Mode (Mode Pemeliharaan)
     */
    public function toggleMaintenance(Request $request): RedirectResponse
    {
        if (app()->isDownForMaintenance()) {
            Artisan::call('up');
            return back()->with('success', 'Aplikasi telah KEMBALI ONLINE (Maintenance Mode Nonaktif).');
        } else {
            Artisan::call('down', [
                '--secret' => 'superadmin-bypass-key-2026',
            ]);
            return back()->with('success', 'Mode Pemeliharaan (Maintenance) AKTIF. Pengguna umum tidak dapat mengakses sistem.');
        }
    }
}
