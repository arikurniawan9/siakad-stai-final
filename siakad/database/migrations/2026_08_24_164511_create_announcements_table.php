<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title', 200);
            $table->text('content');
            $table->string('type', 20)->default('INFO'); // INFO, WARNING, URGENT, EVENT
            $table->string('target_role', 32)->default('ALL'); // ALL, DOSEN, MAHASISWA, ADMIN
            $table->foreignId('target_study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
            $table->string('target_batch_year', 10)->nullable(); // e.g. '2026', '2025' or null for all
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcements');
    }
};
