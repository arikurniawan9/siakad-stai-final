<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('course_grades', function (Blueprint $table) {
            $table->foreignId('course_class_id')->nullable()->after('krs_item_id')->constrained('course_classes')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->after('course_class_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('locked_at')->nullable()->after('is_locked');
        });

        // Backfill existing rows if any
        DB::statement("
            UPDATE course_grades
            SET course_class_id = krs_items.course_class_id,
                student_id = krs_submissions.student_id
            FROM krs_items
            JOIN krs_submissions ON krs_items.krs_submission_id = krs_submissions.id
            WHERE course_grades.krs_item_id = krs_items.id
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_grades', function (Blueprint $table) {
            $table->dropForeign(['course_class_id']);
            $table->dropForeign(['student_id']);
            $table->dropColumn(['course_class_id', 'student_id', 'locked_at']);
        });
    }
};
