<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('product_categories')) {
            return;
        }

        $industries = [
            'Food & Beverage',
            'Healthcare',
            'Education',
            'Retail',
            'Jasa Konsumen',
            'Pariwisata',
            'Hospitality',
            'Otomotif',
            'Real Estate',
            'Event & Kreatif',
            'Manufaktur',
            'Logistik',
            'Jasa Profesional',
            'Financial',
            'Agriculture',
            'Nonprofit',
        ];

        DB::transaction(function () use ($industries): void {
            DB::table('product_categories')->delete();

            $now = now();
            foreach ($industries as $index => $industry) {
                DB::table('product_categories')->insert([
                    'name' => $industry,
                    'parent_id' => null,
                    'level' => 1,
                    'sort_order' => $index + 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        });
    }

    public function down(): void
    {
        // Intentionally no-op. Kategori industri adalah master kategori terbaru.
    }
};
