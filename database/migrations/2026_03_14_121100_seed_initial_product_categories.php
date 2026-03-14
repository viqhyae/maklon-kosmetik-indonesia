<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_categories')) {
            return;
        }

        if (DB::table('product_categories')->count() > 0) {
            return;
        }

        $now = Carbon::now();

        DB::table('product_categories')->insert([
            ['id' => 1, 'parent_id' => null, 'name' => 'Perawatan & Kecantikan', 'level' => 1, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 11, 'parent_id' => 1, 'name' => 'Parfum & Wewangian', 'level' => 2, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 12, 'parent_id' => 1, 'name' => 'Perawatan Wajah', 'level' => 2, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 13, 'parent_id' => 1, 'name' => 'Perawatan Tubuh', 'level' => 2, 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],

            ['id' => 111, 'parent_id' => 11, 'name' => 'Eau De Parfum (EDP)', 'level' => 3, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 112, 'parent_id' => 11, 'name' => 'Eau De Toilette (EDT)', 'level' => 3, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 113, 'parent_id' => 11, 'name' => 'Body Mist / Cologne', 'level' => 3, 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 114, 'parent_id' => 11, 'name' => 'Extrait De Parfum', 'level' => 3, 'sort_order' => 4, 'created_at' => $now, 'updated_at' => $now],

            ['id' => 121, 'parent_id' => 12, 'name' => 'Pembersih Wajah', 'level' => 3, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 122, 'parent_id' => 12, 'name' => 'Toner', 'level' => 3, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 123, 'parent_id' => 12, 'name' => 'Pelembab Wajah', 'level' => 3, 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 124, 'parent_id' => 12, 'name' => 'Minyak Wajah', 'level' => 3, 'sort_order' => 4, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 125, 'parent_id' => 12, 'name' => 'Facial Mist', 'level' => 3, 'sort_order' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 126, 'parent_id' => 12, 'name' => 'Serum & Essence Wajah', 'level' => 3, 'sort_order' => 6, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 127, 'parent_id' => 12, 'name' => 'Scrub & Peel Wajah', 'level' => 3, 'sort_order' => 7, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 128, 'parent_id' => 12, 'name' => 'Masker Wajah', 'level' => 3, 'sort_order' => 8, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 129, 'parent_id' => 12, 'name' => 'Treatment Mata', 'level' => 3, 'sort_order' => 9, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 130, 'parent_id' => 12, 'name' => 'Treatment Bibir', 'level' => 3, 'sort_order' => 10, 'created_at' => $now, 'updated_at' => $now],

            ['id' => 131, 'parent_id' => 13, 'name' => 'Sabun Mandi', 'level' => 3, 'sort_order' => 1, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 132, 'parent_id' => 13, 'name' => 'Scrub & Peel Tubuh', 'level' => 3, 'sort_order' => 2, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 133, 'parent_id' => 13, 'name' => 'Masker Tubuh', 'level' => 3, 'sort_order' => 3, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 134, 'parent_id' => 13, 'name' => 'Minyak Tubuh', 'level' => 3, 'sort_order' => 4, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 135, 'parent_id' => 13, 'name' => 'Body Cream, Lotion & Butter', 'level' => 3, 'sort_order' => 5, 'created_at' => $now, 'updated_at' => $now],
            ['id' => 136, 'parent_id' => 13, 'name' => 'Deodoran', 'level' => 3, 'sort_order' => 6, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        if (!Schema::hasTable('product_categories')) {
            return;
        }

        DB::table('product_categories')->whereIn('id', [
            1, 11, 12, 13,
            111, 112, 113, 114,
            121, 122, 123, 124, 125, 126, 127, 128, 129, 130,
            131, 132, 133, 134, 135, 136
        ])->delete();
    }
};

