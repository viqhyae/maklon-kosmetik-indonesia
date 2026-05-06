<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('product_categories')) {
            return;
        }

        $now = now();

        // Struktur kategori mengikuti file Excel terbaru:
        // Level 1: Perawatan & Kecantikan
        // Level 2: Parfum & Wewangian, Perawatan Wajah, Body Care
        // Level 3: sesuai masing-masing Level 2 pada Excel.
        $categoryTree = [
            [
                'name' => 'Perawatan & Kecantikan',
                'children' => [
                    [
                        'name' => 'Parfum & Wewangian',
                        'children' => [],
                    ],
                    [
                        'name' => 'Perawatan Wajah',
                        'children' => [
                            'Pembersih Wajah',
                            'Toner',
                            'Pelembab Wajah',
                            'Facial Mist',
                            'Serum & Essence Wajah',
                            'Scrub & Peel Wajah',
                            'Masker Wajah',
                            'Sunscreen Wajah',
                            'Perawatan Wajah Lainnya',
                        ],
                    ],
                    [
                        'name' => 'Body Care',
                        'children' => [
                            'Sabun Mandi',
                            'Scrub & Peel Tubuh',
                            'Body Cream, Body Lotion & Body Butter',
                            'Deodoran',
                            'Perawatan Tubuh Lainnya',
                        ],
                    ],
                ],
            ],
        ];

        DB::transaction(function () use ($categoryTree, $now) {
            // Hapus kategori lama, FK product_skus menggunakan nullOnDelete sehingga tetap aman.
            DB::table('product_categories')->delete();

            $insertCategory = function (string $name, int $level, ?int $parentId, int $sortOrder) use ($now): int {
                return (int) DB::table('product_categories')->insertGetId([
                    'name' => $name,
                    'parent_id' => $parentId,
                    'level' => $level,
                    'sort_order' => $sortOrder,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            };

            foreach ($categoryTree as $l1Index => $l1Node) {
                $l1Id = $insertCategory($l1Node['name'], 1, null, $l1Index + 1);

                foreach (($l1Node['children'] ?? []) as $l2Index => $l2Node) {
                    $l2Id = $insertCategory($l2Node['name'], 2, $l1Id, $l2Index + 1);

                    foreach (($l2Node['children'] ?? []) as $l3Index => $l3Name) {
                        $insertCategory((string) $l3Name, 3, $l2Id, $l3Index + 1);
                    }
                }
            }
        });
    }

    public function down(): void
    {
        // Intentionally no-op.
        // Sinkronisasi kategori ini bersifat final mengikuti master Excel terbaru.
    }
};

