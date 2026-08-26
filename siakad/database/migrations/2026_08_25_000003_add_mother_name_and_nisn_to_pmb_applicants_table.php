<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pmb_applicants', function (Blueprint $table) {
            $table->string('mother_name', 150)->nullable()->after('full_name');
            $table->string('nisn', 20)->nullable()->after('previous_school');
        });
    }

    public function down(): void
    {
        Schema::table('pmb_applicants', function (Blueprint $table) {
            $table->dropColumn(['mother_name', 'nisn']);
        });
    }
};
