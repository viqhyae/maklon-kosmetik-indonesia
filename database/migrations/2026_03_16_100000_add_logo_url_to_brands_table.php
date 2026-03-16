<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('brands') || Schema::hasColumn('brands', 'logo_url')) {
            return;
        }

        Schema::table('brands', function (Blueprint $table) {
            $table->string('logo_url')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('brands') || !Schema::hasColumn('brands', 'logo_url')) {
            return;
        }

        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn('logo_url');
        });
    }
};
