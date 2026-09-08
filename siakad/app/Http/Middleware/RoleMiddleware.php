<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user() ?? auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Superadmin memiliki akses universal ke seluruh modul sistem
        if ($user->role === 'superadmin') {
            return $next($request);
        }

        // Normalisasi alias penamaan peran & dukung comma-separated arguments
        $userRole = strtolower($user->role);
        $allowedRoles = [];
        foreach ($roles as $roleArg) {
            $parts = explode(',', $roleArg);
            foreach ($parts as $r) {
                $r = strtolower(trim($r));
                if (empty($r)) continue;
                $allowedRoles[] = $r;
                if ($r === 'admin_akademik') {
                    $allowedRoles[] = 'adminakademik';
                } elseif ($r === 'adminakademik') {
                    $allowedRoles[] = 'admin_akademik';
                }
            }
        }

        if (in_array($userRole, $allowedRoles, true)) {
            return $next($request);
        }

        // Respon jika request merupakan API / JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => false,
                'message' => "Akses Ditolak: Peran Anda ({$user->role}) tidak memiliki izin mengakses endpoint ini.",
            ], 403);
        }

        // Respon untuk request web / Inertia: Redirect ke dasbor dengan flash alert
        if ($request->hasSession()) {
            return redirect()->route('dashboard')->with(
                'error',
                "Akses Ditolak: Peran akun Anda ({$user->role}) tidak memiliki hak akses ke halaman tersebut."
            );
        }

        return redirect()->route('dashboard');
    }
}
