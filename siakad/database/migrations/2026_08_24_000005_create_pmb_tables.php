<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pmb_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->integer('batch_number')->default(1); // Gelombang 1, 2, 3
            $table->string('name', 100); // PMB Gelombang 1 TA 2026/2027
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('registration_fee', 12, 2)->default(250000); // Rp 250.000
            $table->integer('quota')->default(300);
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('pmb_applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pmb_period_id')->constrained('pmb_periods')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('registration_number', 32)->unique(); // e.g. PMB-2026-0001
            $table->string('full_name', 150);
            $table->string('nik', 20)->index();
            $table->string('phone_number', 24);
            $table->string('email', 100);
            $table->string('gender', 1)->default('L'); // L / P
            $table->string('birth_place', 100)->nullable();
            $table->date('birth_date')->nullable();
            $table->text('address')->nullable();
            $table->string('previous_school', 150)->nullable(); // SMA / MA / SMK / Pesantren
            $table->foreignId('first_choice_program_id')->constrained('study_programs');
            $table->foreignId('second_choice_program_id')->nullable()->constrained('study_programs');
            $table->string('pathway', 32)->default('REGULER'); // REGULER, BEASISWA, TAHFIDZ, PINDAHAN
            $table->string('status', 32)->default('MENUNGGU_PEMBAYARAN'); // MENUNGGU_PEMBAYARAN, TERVERIFIKASI_BAYAR, BERKAS_LENGKAP, LULUS_SELEKSI, DITERIMA, DITOLAK
            $table->string('generated_nim', 32)->nullable()->unique();
            $table->timestamps();
        });

        Schema::create('pmb_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pmb_applicant_id')->constrained('pmb_applicants')->onDelete('cascade');
            $table->string('document_type', 32); // IJAZAH_SKL, KTP, KARTU_KELUARGA, PAS_FOTO, SKCK, SERTIFIKAT_TAHFIDZ
            $table->string('file_path');
            $table->string('file_name');
            $table->string('mime_type', 64)->nullable();
            $table->integer('file_size_kb')->nullable();
            $table->string('verification_status', 32)->default('MENUNGGU_VERIFIKASI'); // MENUNGGU_VERIFIKASI, VALID, DITOLAK
            $table->text('verification_notes')->nullable();
            $table->foreignId('verified_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pmb_documents');
        Schema::dropIfExists('pmb_applicants');
        Schema::dropIfExists('pmb_periods');
    }
};
