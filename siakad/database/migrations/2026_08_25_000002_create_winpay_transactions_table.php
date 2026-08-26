<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('winpay_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_invoice_id')->nullable()->constrained('student_invoices')->nullOnDelete();
            $table->string('order_id', 64)->unique();
            $table->string('winpay_transaction_id', 100)->nullable()->index();
            $table->string('channel', 32)->default('VA_BSI'); // VA_BSI, VA_MANDIRI, VA_BCA, VA_BRI, VA_PERMATA, QRIS
            $table->string('va_number', 64)->nullable()->index();
            $table->text('qris_content')->nullable();
            $table->text('qris_url')->nullable();
            $table->decimal('amount', 12, 2);
            $table->decimal('fee_amount', 12, 2)->default(0);
            $table->decimal('total_amount', 12, 2);
            $table->string('status', 32)->default('PENDING'); // PENDING, PAID, EXPIRED, FAILED
            $table->dateTime('payment_datetime')->nullable();
            $table->jsonb('raw_callback_payload')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('winpay_transactions');
    }
};
