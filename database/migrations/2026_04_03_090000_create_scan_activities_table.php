<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('scan_activities')) {
            return;
        }

        Schema::create('scan_activities', function (Blueprint $table) {
            $table->id();
            $table->string('scanned_code');
            $table->foreignId('tag_code_id')->nullable()->constrained('tag_codes')->nullOnDelete();
            $table->string('verification_code')->nullable();
            $table->string('product_name')->nullable();
            $table->string('brand_name')->nullable();
            $table->string('tag_status')->nullable();
            $table->string('result_status')->default('Invalid');
            $table->unsignedInteger('scan_count')->default(0);
            $table->string('location_label')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('scanned_at')->useCurrent();
            $table->timestamps();

            $table->index(['verification_code', 'scanned_at'], 'scan_activities_code_scanned_index');
            $table->index(['result_status', 'scanned_at'], 'scan_activities_status_scanned_index');
        });
    }

    public function down(): void
    {
        if (!Schema::hasTable('scan_activities')) {
            return;
        }

        Schema::dropIfExists('scan_activities');
    }
};
