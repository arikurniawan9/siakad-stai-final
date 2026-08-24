<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Mata Kuliah Prasyarat
        Schema::create('course_prerequisites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->foreignId('prerequisite_course_id')->constrained('courses')->onDelete('cascade');
            $table->string('minimum_grade', 4)->default('C'); // Nilai minimum yang harus dicapai
            $table->timestamps();

            $table->unique(['course_id', 'prerequisite_course_id']);
        });

        // 2. Konversi Nilai MBKM & Mahasiswa Transfer
        Schema::create('transfer_grade_conversions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('target_course_id')->constrained('courses')->onDelete('cascade');
            $table->string('conversion_type', 32)->default('TRANSFER'); // TRANSFER, MBKM_KAMPUS_MENGAJAR, MBKM_MAGANG, MBKM_STUDI_INDEPENDEN, RPL
            $table->string('origin_institution', 128); // Universitas asal / Mitra MBKM
            $table->string('origin_course_name', 128); // Nama MK Asal
            $table->integer('origin_credits')->default(2);
            $table->string('origin_grade_letter', 4)->default('A');
            $table->string('converted_grade_letter', 4)->default('A');
            $table->decimal('converted_grade_point', 3, 2)->default(4.00);
            $table->string('sk_number', 100)->nullable(); // Nomor SK Rekognisi
            $table->string('status', 32)->default('DISETUJUI'); // DRAFT, MENUNGGU_VERIFIKASI, DISETUJUI, DITOLAK
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 3. Log Riwayat & Validasi PDDIKTI Neo Feeder
        Schema::create('pddikti_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('table_target', 64); // Mahasiswa, Kurikulum, MataKuliah, KelasKuliah, Nilai, AKM
            $table->string('sync_action', 32); // VALIDATE_DRYRUN, SYNC_PUSH, EXPORT_JSON, EXPORT_EXCEL
            $table->foreignId('executed_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('total_records')->default(0);
            $table->integer('valid_records')->default(0);
            $table->integer('invalid_records')->default(0);
            $table->string('status', 32)->default('SUCCESS'); // SUCCESS, WARNING, FAILED
            $table->jsonb('validation_errors')->nullable();
            $table->text('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pddikti_sync_logs');
        Schema::dropIfExists('transfer_grade_conversions');
        Schema::dropIfExists('course_prerequisites');
    }
};
