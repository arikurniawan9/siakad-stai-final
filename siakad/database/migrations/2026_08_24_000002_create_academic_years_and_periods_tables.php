<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->string('code', 16)->unique(); // e.g. 2026/2027
            $table->string('name', 64); // e.g. Tahun Akademik 2026/2027
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });

        Schema::create('academic_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->string('code', 32)->unique(); // e.g. 20261 (Ganjil), 20262 (Genap)
            $table->string('name', 100); // e.g. Semester Ganjil 2026/2027
            $table->string('semester_type', 16)->default('GANJIL'); // GANJIL, GENAP, PENDEK
            $table->date('start_date');
            $table->date('end_date');
            $table->date('krs_start_date');
            $table->date('krs_end_date');
            $table->date('krs_revision_end_date')->nullable();
            $table->date('payment_start_date');
            $table->date('payment_end_date');
            $table->date('grading_start_date');
            $table->date('grading_end_date');
            $table->date('edom_start_date')->nullable();
            $table->date('edom_end_date')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_periods');
        Schema::dropIfExists('academic_years');
    }
};
