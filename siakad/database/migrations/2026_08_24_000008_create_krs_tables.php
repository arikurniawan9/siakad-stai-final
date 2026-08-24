<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('krs_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->integer('total_credits')->default(0);
            $table->integer('max_credits_allowed')->default(24);
            $table->decimal('previous_ips', 3, 2)->default(0.00);
            $table->string('status', 32)->default('DRAFT'); // DRAFT, DIAJUKAN, DISETUJUI_PA, DITOLAK
            $table->foreignId('academic_advisor_id')->nullable()->constrained('users')->nullOnDelete(); // Dosen PA
            $table->text('advisor_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'academic_period_id']);
        });

        Schema::create('krs_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('krs_submission_id')->constrained('krs_submissions')->onDelete('cascade');
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->string('status', 32)->default('DISETUJUI'); // TERDAFTAR, DISETUJUI, DIBATALKAN
            $table->timestamps();

            $table->unique(['krs_submission_id', 'course_class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('krs_items');
        Schema::dropIfExists('krs_submissions');
    }
};
