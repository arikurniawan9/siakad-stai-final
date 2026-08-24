<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('buildings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique(); // e.g. G-UTAMA, G-TARBIYAH
            $table->string('name', 100); // e.g. Gedung Rektorat & Kuliah Utama
            $table->integer('total_floors')->default(1);
            $table->text('address')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('building_id')->constrained('buildings')->onDelete('cascade');
            $table->string('code', 32)->unique(); // e.g. R-101, LAB-KOMP
            $table->string('name', 100); // e.g. Ruang Kuliah 101
            $table->integer('floor_number')->default(1);
            $table->integer('capacity')->default(35); // Kapasitas reguler
            $table->integer('exam_capacity')->nullable(); // Kapasitas saat ujian
            $table->string('room_type', 32)->default('TEORI'); // TEORI, LAB_KOMPUTER, MICROTEACHING, AUDITORIUM, SEMINAR
            $table->jsonb('facilities')->nullable(); // ["AC", "Proyektor", "Sound System", "CCTV", "Smartboard"]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('buildings');
    }
};
