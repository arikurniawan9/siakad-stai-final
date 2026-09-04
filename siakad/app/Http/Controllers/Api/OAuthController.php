<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class OAuthController extends Controller
{
    /**
     * OAUTH2 / OIDC AUTHORIZE ENDPOINT
     * GET /oauth/authorize
     */
    public function authorizeClient(Request $request): RedirectResponse
    {
        $clientId = $request->input('client_id', 'salam_lms');
        $redirectUri = $request->input('redirect_uri', 'http://localhost:8080');
        $state = $request->input('state', '');

        // Jika belum login ke SIAKAD, arahkan ke login dengan return URL
        if (!Auth::check()) {
            session()->put('url.intended', $request->fullUrl());
            return redirect()->route('login')->with('info', 'Silakan masuk ke akun SIAKAD untuk mengotorisasi akses SALAM LMS.');
        }

        $user = Auth::user();

        // Terbitkan Authorization Code 1-Kali Pakai (TTL 5 Menit)
        $authCode = 'ac_' . Str::random(40);
        Cache::put("oauth_code_{$authCode}", [
            'user_id' => $user->id,
            'client_id' => $clientId,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'email' => $user->email,
                'identity_number' => $user->identity_number,
                'role' => $user->role,
                'study_program' => $user->study_program,
                'gender' => $user->gender,
                'phone_number' => $user->phone_number,
            ],
        ], now()->addMinutes(5));

        $delimiter = str_contains($redirectUri, '?') ? '&' : '?';
        $targetUrl = "{$redirectUri}{$delimiter}code={$authCode}" . ($state ? "&state=" . urlencode($state) : "");

        return redirect()->away($targetUrl);
    }

    /**
     * OAUTH2 TOKEN EXCHANGE ENDPOINT
     * POST /api/v1/oauth/token
     */
    public function issueToken(Request $request): JsonResponse
    {
        $code = $request->input('code');
        if (!$code) {
            return response()->json([
                'status' => 'error',
                'message' => 'Parameter code (authorization code) wajib disertakan.',
            ], 400);
        }

        // Ambil dan hapus code dari Cache (Single Use)
        $cachedData = Cache::pull("oauth_code_{$code}");
        if (!$cachedData) {
            return response()->json([
                'status' => 'error',
                'message' => 'Authorization code tidak valid atau telah kedaluwarsa.',
            ], 401);
        }

        $user = $cachedData['user'];
        $accessToken = 'siakad_sso_' . Str::random(60);

        // Simpan token akses selama 24 jam
        Cache::put("oauth_token_{$accessToken}", $user, now()->addHours(24));

        return response()->json([
            'status' => 'success',
            'token_type' => 'Bearer',
            'access_token' => $accessToken,
            'expires_in' => 86400,
            'user' => $user,
        ]);
    }

    /**
     * OAUTH2 USER INFO ENDPOINT
     * GET /api/v1/oauth/userinfo
     */
    public function userInfo(Request $request): JsonResponse
    {
        $authHeader = $request->header('Authorization', '');
        $token = str_replace('Bearer ', '', $authHeader);

        if (!$token) {
            return response()->json([
                'status' => 'error',
                'message' => 'Header Authorization Bearer token wajib disertakan.',
            ], 401);
        }

        $user = Cache::get("oauth_token_{$token}");
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Token akses tidak valid atau telah kedaluwarsa.',
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'user' => $user,
        ]);
    }

    /**
     * 1-KLIK DIRECT LAUNCH SALAM LMS DARI DALAM SIAKAD
     * GET /sso/lms
     */
    public function launchLms(Request $request): RedirectResponse
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $lmsUrl = env('LMS_FRONTEND_URL', 'http://localhost:8080');
        return $this->authorizeClient(new Request([
            'client_id' => 'salam_lms',
            'redirect_uri' => $lmsUrl,
        ]));
    }
}
