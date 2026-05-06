<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('product_skus')) {
            return;
        }

        Schema::create('product_skus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku_code')->unique();

            $table->foreignId('brand_id')
                ->nullable()
                ->constrained('brands')
                ->nullOnDelete();

            $table->foreignId('category_l1_id')
                ->nullable()
                ->constrained('product_categories')
                ->nullOnDelete();

            $table->foreignId('category_l2_id')
                ->nullable()
                ->constrained('product_categories')
                ->nullOnDelete();

            $table->foreignId('category_l3_id')
                ->nullable()
                ->constrained('product_categories')
                ->nullOnDelete();

            $table->text('description')->nullable();
            $table->json('dynamic_fields')->nullable();
            $table->timestamps();

            $table->index(['brand_id', 'name'], 'product_skus_brand_name_index');
            $table->index('category_l3_id', 'product_skus_category_l3_index');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('product_skus')) {
            return;
        }

        Schema::dropIfExists('product_skus');
    }
};
