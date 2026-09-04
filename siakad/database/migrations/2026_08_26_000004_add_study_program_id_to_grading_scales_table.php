<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('grading_scales', function (Blueprint $table) {
            if (!Schema::hasColumn('grading_scales', 'study_program_id')) {
                $table->foreignId('study_program_id')->nullable()->after('id')->constrained('study_programs')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('grading_scales', function (Blueprint $table) {
            if (Schema::hasColumn('grading_scales', 'study_program_id')) {
                $table->dropConstrainedForeignId('study_program_id');
            }
        });
    }
};
