<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tag_batches') && !Schema::hasColumn('tag_batches', 'suspend_reason')) {
            Schema::table('tag_batches', function (Blueprint $table) {
                $table->text('suspend_reason')->nullable()->after('status');
            });
        }

        if (Schema::hasTable('scan_activities') && !Schema::hasColumn('scan_activities', 'suspend_reason')) {
            Schema::table('scan_activities', function (Blueprint $table) {
                $table->text('suspend_reason')->nullable()->after('result_status');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('scan_activities') && Schema::hasColumn('scan_activities', 'suspend_reason')) {
            Schema::table('scan_activities', function (Blueprint $table) {
                $table->dropColumn('suspend_reason');
            });
        }

        if (Schema::hasTable('tag_batches') && Schema::hasColumn('tag_batches', 'suspend_reason')) {
            Schema::table('tag_batches', function (Blueprint $table) {
                $table->dropColumn('suspend_reason');
            });
        }
    }
};
