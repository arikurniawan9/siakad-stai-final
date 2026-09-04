<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->string('exam_type', 16)->default('UTS'); // UTS, UAS
            $table->date('exam_date')->nullable(); // Tanggal Ujian
            $table->time('start_time')->nullable(); // Jam Mulai
            $table->time('end_time')->nullable(); // Jam Selesai
            $table->foreignId('room_id')->nullable()->constrained('rooms')->onDelete('set null');
            $table->foreignId('invigilator_id')->nullable()->constrained('users')->onDelete('set null'); // Pengawas
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['course_class_id', 'exam_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_schedules');
    }
};
