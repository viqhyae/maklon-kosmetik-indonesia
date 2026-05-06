<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users') && Schema::hasColumn('users', 'name')) {
            Schema::table('users', function (Blueprint $table) {
                $table->index('name', 'users_name_index');
            });
        }

        if (Schema::hasTable('brands') && Schema::hasColumn('brands', 'owner_name')) {
            Schema::table('brands', function (Blueprint $table) {
                $table->index('owner_name', 'brands_owner_name_index');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropIndex('users_name_index');
            });
        }

        if (Schema::hasTable('brands')) {
            Schema::table('brands', function (Blueprint $table) {
                $table->dropIndex('brands_owner_name_index');
            });
        }
    }
};
