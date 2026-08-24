<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    public function share(Request $request): array
    {
        $user = Auth::user();
        $isImpersonating = session()->has('impersonated_by');
        $impersonatorName = session('impersonator_name', 'Superadmin');

        // Ambil periode akademik aktif
        $activePeriod = DB::table('academic_periods')
            ->where('is_active', true)
            ->first(['id', 'code', 'name', 'semester_type']);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'identity_number' => $user->identity_number,
                    'email' => $user->email,
                    'role' => $user->role,
                    'study_program' => $user->study_program,
                    'avatar' => $user->avatar,
                ] : null,
                'impersonation' => [
                    'is_active' => $isImpersonating,
                    'admin_name' => $impersonatorName,
                ],
            ],
            'academic' => [
                'active_period' => $activePeriod,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
