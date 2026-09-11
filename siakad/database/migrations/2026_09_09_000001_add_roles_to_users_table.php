<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'roles')) {
                $table->jsonb('roles')->nullable()->after('role');
            }
        });

        // Backfill data peran yang sudah ada ke dalam array JSON roles
        try {
            DB::statement("UPDATE users SET roles = json_build_array(role) WHERE roles IS NULL OR roles = '[]'::jsonb");
        } catch (\Throwable $e) {
            // Fallback jika json_build_array tidak tersedia
            $users = DB::table('users')->select('id', 'role', 'roles')->get();
            foreach ($users as $u) {
                if (empty($u->roles) || $u->roles === '[]') {
                    DB::table('users')->where('id', $u->id)->update([
                        'roles' => json_encode([$u->role]),
                    ]);
                }
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'roles')) {
                $table->dropColumn('roles');
            }
        });
    }
};
