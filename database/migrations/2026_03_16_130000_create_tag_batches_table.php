<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tag_batches')) {
            return;
        }

        Schema::create('tag_batches', function (Blueprint $table) {
            $table->id();
            $table->string('batch_code')->unique();
            $table->string('product_name');
            $table->string('brand_name')->nullable();
            $table->unsignedInteger('quantity');
            $table->unsignedTinyInteger('id_length')->default(8);
            $table->char('error_correction', 1)->default('M');
            $table->boolean('use_pin')->default(false);
            $table->unsignedTinyInteger('pin_length')->nullable();
            $table->string('status')->default('Generated');
            $table->string('first_code')->nullable();
            $table->string('last_code')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['status', 'created_at'], 'tag_batches_status_created_index');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('tag_batches')) {
            return;
        }

        Schema::dropIfExists('tag_batches');
    }
};
