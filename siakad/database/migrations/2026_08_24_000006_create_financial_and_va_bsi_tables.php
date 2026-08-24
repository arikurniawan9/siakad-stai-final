<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fee_types', function (Blueprint $table) {
            $table->id();
            $table->string('code', 32)->unique(); // PMB, SPP_UKT, PRAKTIKUM, UJIAN_PROPOSAL, SIDANG_SKRIPSI, WISUDA
            $table->string('name', 100); // Biaya Pendaftaran PMB, UKT / SPP Semesteran
            $table->string('va_bill_code', 2)->default('01'); // 01 = PMB, 02 = SPP, 03 = Praktikum, 04 = Skripsi, 05 = Wisuda
            $table->decimal('default_amount', 12, 2);
            $table->boolean('is_periodic')->default(true); // Tagihan berulang per semester?
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('student_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_number', 64)->unique(); // INV-202608-0001
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('pmb_applicant_id')->nullable()->constrained('pmb_applicants')->nullOnDelete();
            $table->foreignId('fee_type_id')->constrained('fee_types');
            $table->foreignId('academic_period_id')->nullable()->constrained('academic_periods')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0);
            $table->decimal('penalty_amount', 12, 2)->default(0);
            $table->decimal('final_amount', 12, 2);
            $table->dateTime('due_date');
            $table->string('status', 32)->default('BELUM_BAYAR'); // BELUM_BAYAR, LUNAS, KADALUARSA, DIBATALKAN
            $table->dateTime('paid_at')->nullable();
            $table->string('payment_method', 32)->nullable(); // VA_BSI, TUNAI_KASIR, DISPENSASI
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('va_bsi_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_invoice_id')->constrained('student_invoices')->onDelete('cascade');
            $table->string('va_number', 32)->index(); // Prefix 9928 + BillType 01/02 + ID/NIM -> 992801260001
            $table->string('channel', 32)->default('BSI_MOBILE'); // BSI_MOBILE, ATM_BSI, TELLER, INTERBANK
            $table->decimal('amount', 12, 2);
            $table->string('status', 32)->default('PENDING'); // PENDING, PAID, EXPIRED
            $table->string('bsi_reference_no', 100)->nullable()->index(); // Nomor Jurnal / Reff Bank BSI
            $table->dateTime('payment_datetime')->nullable();
            $table->jsonb('raw_callback_payload')->nullable(); // Log payload JSON mentah dari BSI
            $table->timestamps();
        });

        Schema::create('fee_dispensations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_invoice_id')->constrained('student_invoices')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->string('reason');
            $table->string('letter_file_path')->nullable();
            $table->dateTime('new_due_date');
            $table->string('status', 32)->default('DIAJUKAN'); // DIAJUKAN, DISETUJUI, DITOLAK
            $table->foreignId('approved_by_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('approval_notes')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fee_dispensations');
        Schema::dropIfExists('va_bsi_transactions');
        Schema::dropIfExists('student_invoices');
        Schema::dropIfExists('fee_types');
    }
};
