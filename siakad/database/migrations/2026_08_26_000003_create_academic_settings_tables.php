<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Skala Nilai & Huruf Mutu
        Schema::create('grading_scales', function (Blueprint $table) {
            $table->id();
            $table->string('grade_letter', 8); // A, A-, B+, B, C+, C, D, E
            $table->decimal('min_score', 5, 2); // 85.00
            $table->decimal('max_score', 5, 2); // 100.00
            $table->decimal('grade_point', 4, 2); // 4.00, 3.75, 3.50, dst.
            $table->string('predicate', 64); // Sangat Baik, Baik, Cukup, Kurang, Gagal
            $table->boolean('is_passing')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 2. Komposisi Bobot Nilai Standar
        Schema::create('grade_weights', function (Blueprint $table) {
            $table->id();
            $table->string('component_code', 32)->unique(); // ATTENDANCE, ASSIGNMENT, QUIZ, MID_EXAM, FINAL_EXAM
            $table->string('component_name', 100); // Presensi / Kehadiran, Tugas Mandiri / Terstruktur
            $table->decimal('weight_percentage', 5, 2); // 10.00, 20.00, 15.00, 25.00, 30.00
            $table->decimal('min_attendance_percentage', 5, 2)->default(75.00); // Syarat kelayakan UAS
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Batas SKS Maksimum berdasarkan IPS
        Schema::create('sks_limits', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_ips', 4, 2); // 3.50, 3.00, 2.50, 2.00, 0.00
            $table->decimal('max_ips', 4, 2); // 4.00, 3.49, 2.99, 2.49, 1.99
            $table->integer('max_sks'); // 24, 22, 20, 18, 15
            $table->string('category', 64)->default('REGULER'); // REGULER, SEMESTER_PENDEK, MAHASISWA_BARU
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. Predikat Kelulusan (Yudisium Honours)
        Schema::create('graduation_predicates', function (Blueprint $table) {
            $table->id();
            $table->string('predicate_name', 64); // Dengan Pujian (Cum Laude), Sangat Memuaskan, Memuaskan, Lulus
            $table->decimal('min_gpa', 4, 2); // 3.51, 3.01, 2.76, 2.00
            $table->decimal('max_gpa', 4, 2); // 4.00, 3.50, 3.00, 2.75
            $table->integer('max_semesters')->nullable(); // Maks. 8 semester untuk Cum Laude
            $table->boolean('requires_no_repeat')->default(false); // Tanpa nilai mengulang / C- kebawah
            $table->string('predicate_en', 64)->nullable(); // With Praise (Cum Laude), Highly Satisfactory
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 5. Gelar Kelulusan & Nomenklatur Ijazah Program Studi
        Schema::create('study_program_degrees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_program_id')->constrained('study_programs')->onDelete('cascade');
            $table->string('degree_level', 16)->default('S1'); // S1, S2, D3
            $table->string('degree_full_title', 100); // Sarjana Pendidikan, Sarjana Hukum, Sarjana Ekonomi
            $table->string('degree_short_title', 32); // S.Pd., S.H., S.E., S.Sos.
            $table->string('degree_full_title_en', 100)->nullable(); // Bachelor of Islamic Education
            $table->string('degree_short_title_en', 32)->nullable(); // B.Ed.
            $table->integer('total_credits_required')->default(144); // 144 SKS
            $table->integer('max_study_semesters')->default(14); // 14 semester (7 tahun)
            $table->string('sk_accreditation_number', 100)->nullable(); // SK LAMDIK / BAN-PT
            $table->date('accreditation_valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 6. Pejabat Pengesah Dokumen & Laporan Akademik
        Schema::create('institutional_signatories', function (Blueprint $table) {
            $table->id();
            $table->string('document_type', 64); // SURAT_KETERANGAN, KHS, TRANSKRIP, DPNA_NILAI, KRS, SKRIPSI
            $table->string('document_title', 120); // Surat Keterangan Aktif Kuliah, Kartu Hasil Studi Digital
            $table->string('position_code', 32); // KETUA, WAKET_1, WAKET_2, KEPALA_BAAK, KAPRODI
            $table->string('position_title', 100); // Wakil Ketua I Bidang Akademik, Ketua STAI
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('signatory_name', 150); // Dr. H. M. Ridwan, M.Ag
            $table->string('signatory_nip_nidn', 50)->nullable(); // NIDN: 2112087501
            $table->string('digital_signature_path')->nullable();
            $table->string('official_stamp_path')->nullable();
            $table->boolean('include_qr_seal')->default(true);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('institutional_signatories');
        Schema::dropIfExists('study_program_degrees');
        Schema::dropIfExists('graduation_predicates');
        Schema::dropIfExists('sks_limits');
        Schema::dropIfExists('grade_weights');
        Schema::dropIfExists('grading_scales');
    }
};
