<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('krs_item_id')->constrained('krs_items')->onDelete('cascade');
            $table->decimal('attendance_score', 5, 2)->default(0); // 10%
            $table->decimal('assignment_score', 5, 2)->default(0); // 20%
            $table->decimal('quiz_score', 5, 2)->default(0); // 15%
            $table->decimal('mid_exam_score', 5, 2)->default(0); // 25%
            $table->decimal('final_exam_score', 5, 2)->default(0); // 30%
            $table->decimal('final_score', 5, 2)->default(0); // 0.00 - 100.00
            $table->string('grade_letter', 2)->default('E'); // A, A-, B+, B, B-, C+, C, D, E
            $table->decimal('grade_point', 3, 2)->default(0.00); // 4.00, 3.75, 3.50, 3.00, dst.
            $table->boolean('is_locked')->default(false);
            $table->boolean('is_synced_to_lms')->default(true);
            $table->timestamps();
        });

        Schema::create('khs_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->integer('semester_credits')->default(0);
            $table->decimal('semester_gpa', 3, 2)->default(0.00); // IPS (Indeks Prestasi Semester)
            $table->integer('cumulative_credits')->default(0);
            $table->decimal('cumulative_gpa', 3, 2)->default(0.00); // IPK (Indeks Prestasi Kumulatif)
            $table->string('verification_qr_hash', 64)->unique(); // Hash untuk validasi QR Code publik
            $table->timestamps();

            $table->unique(['student_id', 'academic_period_id']);
        });

        Schema::create('transcripts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->integer('total_credits_earned')->default(0);
            $table->decimal('cumulative_gpa', 3, 2)->default(0.00);
            $table->string('predicate', 64)->nullable(); // Dengan Pujian (Cumlaude), Sangat Memuaskan, Memuaskan
            $table->date('graduation_date')->nullable();
            $table->string('diploma_number', 100)->nullable(); // Nomor Ijazah Nasional (NINA)
            $table->string('verification_qr_hash', 64)->unique();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transcripts');
        Schema::dropIfExists('khs_records');
        Schema::dropIfExists('course_grades');
    }
};
