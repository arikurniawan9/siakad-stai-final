<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faculties', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique(); // TARBIYAH, SYARIAH
            $table->string('name', 100); // Fakultas Tarbiyah, Fakultas Syariah
            $table->string('dean_name')->nullable(); // Nama Dekan
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('study_programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('faculty_id')->constrained('faculties')->onDelete('cascade');
            $table->string('code', 32)->unique(); // PAI, MPI, HES, PGMI, ESY
            $table->string('name', 100); // Pendidikan Agama Islam
            $table->string('degree', 16)->default('S1'); // S1, S2, D3
            $table->string('accreditation', 16)->default('B'); // Unggul, Baik Sekali, B, A
            $table->string('sk_number', 100)->nullable(); // Nomor SK Izin Operasional
            $table->foreignId('head_of_program_id')->nullable()->constrained('users')->nullOnDelete(); // Kaprodi
            $table->foreignId('secretary_id')->nullable()->constrained('users')->nullOnDelete(); // Sekretaris Prodi
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('curricula', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_program_id')->constrained('study_programs')->onDelete('cascade');
            $table->string('code', 32); // KUR-PAI-2024
            $table->string('name', 100); // Kurikulum Merdeka PAI 2024
            $table->integer('start_year'); // 2024
            $table->integer('total_credits_required')->default(144);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('curriculum_id')->constrained('curricula')->onDelete('cascade');
            $table->string('code', 32); // PAI-301, MKU-101
            $table->string('name', 100); // Fiqih Mawaris, Ulumul Qur'an
            $table->string('name_en', 100)->nullable();
            $table->integer('credits')->default(2); // Total SKS
            $table->integer('theory_credits')->default(2);
            $table->integer('practice_credits')->default(0);
            $table->integer('semester_level')->default(1); // Ditawarkan di semester 1, 2, dst.
            $table->string('course_type', 32)->default('WAJIB_PRODI'); // WAJIB_INSTITUSI, WAJIB_PRODI, PILIHAN
            $table->text('description')->nullable();
            $table->text('syllabus_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['curriculum_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
        Schema::dropIfExists('curricula');
        Schema::dropIfExists('study_programs');
        Schema::dropIfExists('faculties');
    }
};
