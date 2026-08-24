<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 64)->unique();
            $table->string('group', 32)->default('INSTITUTION'); // INSTITUTION, BSI, LMS, BACKUP
            $table->text('value');
            $table->string('type', 32)->default('string'); // string, integer, boolean, json
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 64); // LOGIN, LOGOUT, IMPERSONATE_START, IMPERSONATE_STOP, KRS_APPROVE, INVOICE_PAID, BSI_WEBHOOK
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('target_entity', 64)->nullable(); // User, KrsSubmission, StudentInvoice
            $table->string('target_id', 64)->nullable();
            $table->jsonb('details')->nullable();
            $table->timestamps();
        });

        Schema::create('lms_sync_logs', function (Blueprint $table) {
            $table->id();
            $table->string('sync_type', 32); // PUSH_MASTER_TO_LMS, PULL_GRADES_FROM_LMS
            $table->foreignId('triggered_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 32); // SUCCESS, FAILED, PARTIAL
            $table->integer('records_processed')->default(0);
            $table->jsonb('payload_summary')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lms_sync_logs');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('system_settings');
    }
};
