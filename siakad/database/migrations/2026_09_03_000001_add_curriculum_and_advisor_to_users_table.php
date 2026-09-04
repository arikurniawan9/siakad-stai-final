<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('curriculum_id')->nullable()->constrained('curricula')->nullOnDelete();
            $table->foreignId('academic_advisor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('class_type', 32)->default('Reguler'); // Reguler, Karyawan, Ekstensi
        });

        Schema::create('academic_advising_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('advisor_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('academic_period_id')->nullable()->constrained('academic_periods')->nullOnDelete();
            $table->date('advising_date')->nullable();
            $table->string('topic', 255);
            $table->text('discussion_notes')->nullable();
            $table->text('recommendations')->nullable();
            $table->string('status', 32)->default('SELESAI'); // TERJADWAL, SELESAI, REVISI
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_advising_logs');
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['curriculum_id']);
            $table->dropForeign(['academic_advisor_id']);
            $table->dropColumn(['curriculum_id', 'academic_advisor_id', 'class_type']);
        });
    }
};
