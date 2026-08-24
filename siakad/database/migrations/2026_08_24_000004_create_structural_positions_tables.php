<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('structural_positions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique(); // KETUA, WAKET_1, WAKET_2, WAKET_3, KAPRODI, SEKPRODI, KEPALA_BAAK, KEPALA_KEUANGAN
            $table->string('name', 100); // Ketua STAI, Wakil Ketua I Bidang Akademik
            $table->integer('level')->default(1); // 1 = Pimpinan Tertinggi, 2 = Warek/Waket, 3 = Kaprodi, dll.
            $table->boolean('can_approve_krs')->default(false);
            $table->boolean('can_sign_transcripts')->default(false);
            $table->boolean('can_manage_finance')->default(false);
            $table->timestamps();
        });

        Schema::create('lecturer_positions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('position_id')->constrained('structural_positions')->onDelete('cascade');
            $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
            $table->string('sk_number', 100)->nullable(); // Nomor SK Pengangkatan
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('digital_signature_path')->nullable(); // File tanda tangan / stempel digital
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecturer_positions');
        Schema::dropIfExists('structural_positions');
    }
};
