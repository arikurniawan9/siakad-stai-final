<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('yudisium_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->string('name', 100); // Yudisium Sarjana Gelombang I TA 2026/2027
            $table->date('event_date');
            $table->date('registration_deadline');
            $table->string('sk_number', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('yudisium_applicants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('yudisium_period_id')->constrained('yudisium_periods')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->decimal('gpa', 3, 2); // IPK Akhir (e.g. 3.85)
            $table->integer('total_credits'); // Total SKS Lulus (e.g. 146)
            $table->string('predicate', 50); // PUJIAN / DENGAN PUJIAN (CUMLAUDE), SANGAT MEMUASKAN, MEMUASKAN
            $table->string('thesis_title');
            $table->boolean('is_library_free')->default(true); // Bebas Pustaka
            $table->boolean('is_finance_free')->default(true); // Bebas Keuangan
            $table->string('status', 32)->default('DIAJUKAN'); // DIAJUKAN, LOLOS_VERIFIKASI, DITOLAK, RESMI_LULUS
            $table->string('certificate_hash', 64)->nullable()->unique();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('yudisium_applicants');
        Schema::dropIfExists('yudisium_periods');
    }
};
