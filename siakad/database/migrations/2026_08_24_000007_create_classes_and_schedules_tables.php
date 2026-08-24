<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            $table->string('name', 64); // Kelas A, Kelas B, PAI-301-A
            $table->string('code', 64)->unique(); // cls-20261-pai301-a
            $table->integer('capacity')->default(35);
            $table->string('delivery_mode', 32)->default('TATAP_MUKA'); // TATAP_MUKA, DARING, HYBRID
            $table->string('status', 32)->default('AKTIF'); // AKTIF, NONAKTIF, DIARSIPKAN
            $table->timestamps();
        });

        Schema::create('class_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('room_id')->constrained('rooms')->onDelete('cascade');
            $table->string('day_of_week', 16); // SENIN, SELASA, RABU, KAMIS, JUMAT, SABTU, AHAD
            $table->time('start_time'); // 08:00:00
            $table->time('end_time'); // 09:40:00
            $table->boolean('is_online')->default(false);
            $table->string('online_meeting_url')->nullable();
            $table->timestamps();
        });

        Schema::create('class_lecturers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
            $table->boolean('is_primary')->default(true); // Dosen Utama / Team Teaching
            $table->timestamps();

            $table->unique(['course_class_id', 'lecturer_id']);
        });

        Schema::create('class_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('status', 32)->default('TERDAFTAR'); // TERDAFTAR, NONAKTIF, LULUS
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();

            $table->unique(['course_class_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_enrollments');
        Schema::dropIfExists('class_lecturers');
        Schema::dropIfExists('class_schedules');
        Schema::dropIfExists('course_classes');
    }
};
