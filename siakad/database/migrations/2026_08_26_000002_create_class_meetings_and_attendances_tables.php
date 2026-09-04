<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_meetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->integer('meeting_number'); // 1 s/d 16
            $table->date('meeting_date');
            $table->string('topic', 255)->nullable(); // Pokok bahasan / BAP
            $table->string('delivery_mode', 32)->default('TATAP_MUKA'); // TATAP_MUKA, DARING
            $table->foreignId('lecturer_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->unique(['course_class_id', 'meeting_number']);
        });

        Schema::create('student_attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_meeting_id')->constrained('class_meetings')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('status', 16)->default('HADIR'); // HADIR, SAKIT, IZIN, ALPA
            $table->string('notes', 255)->nullable();
            $table->timestamps();

            $table->unique(['class_meeting_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_attendances');
        Schema::dropIfExists('class_meetings');
    }
};
