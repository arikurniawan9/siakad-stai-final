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
        $settingsRaw = DB::table('system_settings')->get();
        $settings = [];
        foreach ($settingsRaw as $row) {
            $settings[$row->key] = $row;
        }

        $isMaintenance = app()->isDownForMaintenance();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'isMaintenance' => $isMaintenance,
            'systemInfo' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => app()->environment(),
                'db_driver' => DB::connection()->getDriverName(),
                'cache_driver' => config('cache.default'),
            ]
        ]);
    }

    /**
     * Bersihkan Cache Aplikasi & Optimasi Sistem (php artisan optimize:clear)
     */
    public function clearCache(): RedirectResponse
    {
        Artisan::call('optimize:clear');
        return back()->with('success', 'Cache aplikasi, konfigurasi, rute, dan blade views berhasil dibersihkan.');
    }

    /**
     * Ulangi (retry) seluruh background jobs yang gagal
     */
    public function retryJobs(): RedirectResponse
    {
        Artisan::call('queue:retry', ['id' => ['all']]);
        return back()->with('success', 'Seluruh antrean background jobs yang gagal telah dijadwalkan ulang untuk diproses.');
    }

    /**
     * Hapus (flush) seluruh background jobs yang gagal
     */
    public function flushJobs(): RedirectResponse
    {
        Artisan::call('queue:flush');
        return back()->with('success', 'Seluruh antrean jobs yang gagal berhasil dibersihkan dari database.');
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
