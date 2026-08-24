<?php

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    /**
     * Catat aktivitas audit ke database
     */
    public static function log(string $action, ?string $targetEntity = null, ?string $targetId = null, array $details = []): void
    {
        try {
            $user = Auth::user();
            DB::table('audit_logs')->insert([
                'user_id' => $user ? $user->id : null,
                'action' => $action,
                'target_entity' => $targetEntity,
                'target_id' => (string) $targetId,
                'details' => json_encode(array_merge($details, [
                    'user_name' => $user ? $user->name : 'System / Guest',
                    'user_role' => $user ? $user->role : 'guest',
                ])),
                'ip_address' => Request::ip() ?? '127.0.0.1',
                'user_agent' => Request::userAgent() ?? 'Unknown Browser',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Fail silently to avoid breaking the main application transaction
            report($e);
        }
    }
}
