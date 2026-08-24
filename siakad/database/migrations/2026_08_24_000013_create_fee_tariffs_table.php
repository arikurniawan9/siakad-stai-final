<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_tariffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignId('study_program_id')->nullable()->constrained('study_programs')->nullOnDelete();
            $table->foreignId('fee_type_id')->constrained('fee_types')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['academic_year_id', 'study_program_id', 'fee_type_id'], 'fee_tariff_unique_matrix');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_tariffs');
    }
};
