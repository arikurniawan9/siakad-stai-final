<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('edom_questionnaires', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_period_id')->constrained('academic_periods')->onDelete('cascade');
            $table->string('title', 150); // Evaluasi Dosen Oleh Mahasiswa (EDOM) Semester Ganjil 2026/2027
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('edom_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('edom_questionnaire_id')->constrained('edom_questionnaires')->onDelete('cascade');
            $table->string('category', 32); // PEDAGOGIK, PROFESIONAL, KEPRIBADIAN, SOSIAL
            $table->text('question_text');
            $table->integer('order_number')->default(1);
            $table->timestamps();
        });

        Schema::create('edom_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->foreignId('lecturer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('edom_question_id')->constrained('edom_questions')->onDelete('cascade');
            $table->integer('score'); // 1 s.d. 5
            $table->text('comment')->nullable();
            // Note: student_id tidak disimpan di sini untuk menjamin 100% anonimitas!
            $table->timestamps();
        });

        // Tabel tracking apakah mahasiswa sudah menyelesaikan EDOM untuk syarat buka KHS
        Schema::create('student_edom_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('course_class_id')->constrained('course_classes')->onDelete('cascade');
            $table->timestamp('completed_at')->useCurrent();

            $table->unique(['student_id', 'course_class_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_edom_completions');
        Schema::dropIfExists('edom_responses');
        Schema::dropIfExists('edom_questions');
        Schema::dropIfExists('edom_questionnaires');
    }
};
