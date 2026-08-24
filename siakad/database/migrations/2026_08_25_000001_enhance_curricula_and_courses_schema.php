<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('study_programs', function (Blueprint $table) {
            if (!Schema::hasColumn('study_programs', 'national_code')) {
                $table->string('national_code', 32)->nullable()->after('code'); // 86236, 60202, dll
            }
        });

        Schema::table('curricula', function (Blueprint $table) {
            if (!Schema::hasColumn('curricula', 'ideal_semesters')) {
                $table->integer('ideal_semesters')->default(8)->after('total_credits_required');
            }
            if (!Schema::hasColumn('curricula', 'mandatory_credits')) {
                $table->integer('mandatory_credits')->default(136)->after('ideal_semesters');
            }
            if (!Schema::hasColumn('curricula', 'elective_credits')) {
                $table->integer('elective_credits')->default(8)->after('mandatory_credits');
            }
        });

        Schema::table('courses', function (Blueprint $table) {
            if (!Schema::hasColumn('courses', 'study_program_id')) {
                $table->foreignId('study_program_id')->nullable()->after('id')->constrained('study_programs')->nullOnDelete();
            }
            if (!Schema::hasColumn('courses', 'field_credits')) {
                $table->integer('field_credits')->default(0)->after('practice_credits');
            }
            if (!Schema::hasColumn('courses', 'course_group')) {
                $table->string('course_group', 100)->default('MKU/MKDU (mata kuliah umum/mata kuliah dasar umum)')->after('course_type');
            }
        });
    }

    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['study_program_id', 'field_credits', 'course_group']);
        });

        Schema::table('curricula', function (Blueprint $table) {
            $table->dropColumn(['ideal_semesters', 'mandatory_credits', 'elective_credits']);
        });

        Schema::table('study_programs', function (Blueprint $table) {
            $table->dropColumn(['national_code']);
        });
    }
};
