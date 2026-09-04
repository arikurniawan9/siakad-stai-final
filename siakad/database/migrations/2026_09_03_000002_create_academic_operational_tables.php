<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tabel Tugas Akhir / Skripsi (Kelulusan Sub-tab 1)
        if (!Schema::hasTable('thesis_submissions')) {
            Schema::create('thesis_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
                $table->foreignId('academic_period_id')->nullable()->constrained('academic_periods')->nullOnDelete();
                $table->string('title');
                $table->text('abstract')->nullable();
                $table->foreignId('advisor_1_id')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('advisor_2_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('status')->default('PENGAJUAN'); // PENGAJUAN, PROPOSAL, PENELITIAN, MUNAQASYAH, LULUS, REVISI
                $table->decimal('score', 5, 2)->nullable();
                $table->string('grade_letter', 5)->nullable();
                $table->date('defense_date')->nullable();
                $table->string('defense_room')->nullable();
                $table->string('sk_number')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Tabel Aktivitas Mahasiswa & Rekognisi MBKM
        if (!Schema::hasTable('student_activities')) {
            Schema::create('student_activities', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
                $table->foreignId('academic_period_id')->nullable()->constrained('academic_periods')->nullOnDelete();
                $table->string('activity_type'); // MBKM_MAGANG, MBKM_MENGAJAR, MBKM_STUDI_INDEPENDEN, PRESTASI_LOMBA, ORGANISASI, PENELITIAN
                $table->string('title');
                $table->string('organization_name')->nullable();
                $table->string('location')->nullable();
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->integer('recognition_credits')->default(0); // SKS Rekognisi
                $table->string('sk_number')->nullable();
                $table->string('status')->default('DISETUJUI'); // DIAJUKAN, DISETUJUI, DITOLAK
                $table->string('certificate_url')->nullable();
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }

        // 3. Tabel Status Semester & Pengajuan Cuti Kuliah
        if (!Schema::hasTable('student_leave_requests')) {
            Schema::create('student_leave_requests', function (Blueprint $table) {
                $table->id();
                $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
                $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
                $table->string('status_type')->default('CUTI'); // AKTIF, CUTI, NON_AKTIF, KELUAR, DROP_OUT, LULUS
                $table->text('reason')->nullable();
                $table->string('supporting_document')->nullable();
                $table->string('approval_status')->default('DISETUJUI'); // MENUNGGU, DISETUJUI, DITOLAK
                $table->string('sk_number')->nullable();
                $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('approved_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_leave_requests');
        Schema::dropIfExists('student_activities');
        Schema::dropIfExists('thesis_submissions');
    }
};
