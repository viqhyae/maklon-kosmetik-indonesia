<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (
            Schema::hasTable('scan_activities')
            && Schema::hasColumn('scan_activities', 'scanned_code')
            && Schema::hasColumn('scan_activities', 'brand_name')
        ) {
            Schema::table('scan_activities', function (Blueprint $table) {
                $table->index('scanned_code', 'scan_activities_scanned_code_index');
                $table->index(['brand_name', 'id'], 'scan_activities_brand_id_index');
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role') && Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index(['role', 'status'], 'users_role_status_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('scan_activities')) {
            Schema::table('scan_activities', function (Blueprint $table) {
                $table->dropIndex('scan_activities_scanned_code_index');
                $table->dropIndex('scan_activities_brand_id_index');
            });
        }

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role') && Schema::hasColumn('users', 'status')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_role_status_index');
            });
        }
    }
};
