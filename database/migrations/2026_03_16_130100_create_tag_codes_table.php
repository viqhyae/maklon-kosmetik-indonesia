<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tag_codes')) {
            return;
        }

        Schema::create('tag_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tag_batch_id')->constrained('tag_batches')->cascadeOnDelete();
            $table->string('verification_code')->unique();
            $table->string('product_name');
            $table->string('brand_name')->nullable();
            $table->string('status')->default('Aktif');
            $table->string('pin')->nullable();
            $table->char('error_correction', 1)->default('M');
            $table->timestamps();

            $table->index(['tag_batch_id', 'status'], 'tag_codes_batch_status_index');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tag_codes')) {
            return;
        }

        Schema::dropIfExists('tag_codes');
    }
};
