<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_skus')) {
            return;
        }

        if (!Schema::hasColumn('product_skus', 'image_url')) {
            Schema::table('product_skus', function (Blueprint $table) {
                $table->string('image_url')->nullable()->after('description');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('product_skus')) {
            return;
        }

        if (Schema::hasColumn('product_skus', 'image_url')) {
            Schema::table('product_skus', function (Blueprint $table) {
                $table->dropColumn('image_url');
            });
        }
    }
};
