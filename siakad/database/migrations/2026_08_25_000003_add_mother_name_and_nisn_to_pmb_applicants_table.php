<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pmb_applicants', function (Blueprint $table) {
            if (!Schema::hasColumn('pmb_applicants', 'mother_name')) {
                $table->string('mother_name', 150)->nullable()->after('full_name');
            }
            if (!Schema::hasColumn('pmb_applicants', 'nisn')) {
                $table->string('nisn', 20)->nullable()->after('previous_school');
            }
        });
    }

    public function down(): void
    {
        Schema::table('pmb_applicants', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('pmb_applicants', 'mother_name')) $cols[] = 'mother_name';
            if (Schema::hasColumn('pmb_applicants', 'nisn')) $cols[] = 'nisn';
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
