<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\ProductSku;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProductSkuManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_create_product_sku(): void
    {
        $user = User::factory()->create([
            'role' => 'Super Admin',
            'status' => 1,
        ]);
        $this->actingAs($user);

        $brand = Brand::query()->create([
            'name' => 'Brand Satu',
            'brand_code' => 'BR-001',
            'owner_name' => 'Owner Satu',
            'description' => 'Brand untuk test',
            'status' => 1,
        ]);

        [$catL1, $catL2, $catL3] = $this->createCategoryChain();

        $response = $this->post('/products', [
            'name' => 'Produk Percobaan',
            'sku_code' => 'SKU-001',
            'brand_id' => $brand->id,
            'cat_l1_id' => $catL1->id,
            'cat_l2_id' => $catL2->id,
            'cat_l3_id' => $catL3->id,
            'description' => 'Deskripsi test',
            'dynamic_fields' => [
                'bpom' => 'NA1234567',
            ],
            'image' => UploadedFile::fake()->image('produk.jpg', 500, 500),
            'image_upload_expected' => 1,
        ], [
            'Accept' => 'application/json',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('product.skuCode', 'SKU-001')
            ->assertJsonPath('product.brandId', $brand->id);

        $createdProduct = ProductSku::query()->where('sku_code', 'SKU-001')->first();
        $this->assertNotNull($createdProduct?->image_url);

        $this->assertDatabaseHas('product_skus', [
            'name' => 'Produk Percobaan',
            'sku_code' => 'SKU-001',
            'brand_id' => $brand->id,
            'category_l3_id' => $catL3->id,
        ]);
    }

    public function test_super_admin_can_update_and_delete_product_sku(): void
    {
        $user = User::factory()->create([
            'role' => 'Super Admin',
            'status' => 1,
        ]);
        $this->actingAs($user);

        $brandA = Brand::query()->create([
            'name' => 'Brand A',
            'brand_code' => 'BR-A',
            'status' => 1,
        ]);

        $brandB = Brand::query()->create([
            'name' => 'Brand B',
            'brand_code' => 'BR-B',
            'status' => 1,
        ]);

        [$catL1A, $catL2A, $catL3A] = $this->createCategoryChain('A');
        [$catL1B, $catL2B, $catL3B] = $this->createCategoryChain('B');

        $product = ProductSku::query()->create([
            'name' => 'Produk Awal',
            'sku_code' => 'SKU-AWAL',
            'brand_id' => $brandA->id,
            'category_l1_id' => $catL1A->id,
            'category_l2_id' => $catL2A->id,
            'category_l3_id' => $catL3A->id,
            'description' => 'Deskripsi awal',
            'dynamic_fields' => ['bpom' => 'OLD'],
        ]);

        $updateResponse = $this->postJson("/products/update/{$product->id}", [
            'name' => 'Produk Update',
            'sku_code' => 'SKU-BARU',
            'brand_id' => $brandB->id,
            'cat_l1_id' => $catL1B->id,
            'cat_l2_id' => $catL2B->id,
            'cat_l3_id' => $catL3B->id,
            'description' => 'Deskripsi update',
            'dynamic_fields' => ['bpom' => 'NEW'],
        ]);

        $updateResponse
            ->assertOk()
            ->assertJsonPath('product.name', 'Produk Update')
            ->assertJsonPath('product.skuCode', 'SKU-BARU')
            ->assertJsonPath('product.brandId', $brandB->id);

        $this->assertDatabaseHas('product_skus', [
            'id' => $product->id,
            'name' => 'Produk Update',
            'sku_code' => 'SKU-BARU',
            'brand_id' => $brandB->id,
            'category_l3_id' => $catL3B->id,
        ]);

        $deleteResponse = $this->deleteJson("/products/{$product->id}");

        $deleteResponse->assertOk();
        $this->assertDatabaseMissing('product_skus', [
            'id' => $product->id,
        ]);
    }

    private function createCategoryChain(string $suffix = ''): array
    {
        $l1 = ProductCategory::query()->create([
            'name' => "Kategori L1{$suffix}",
            'parent_id' => null,
            'level' => 1,
            'sort_order' => 1,
        ]);

        $l2 = ProductCategory::query()->create([
            'name' => "Kategori L2{$suffix}",
            'parent_id' => $l1->id,
            'level' => 2,
            'sort_order' => 1,
        ]);

        $l3 = ProductCategory::query()->create([
            'name' => "Kategori L3{$suffix}",
            'parent_id' => $l2->id,
            'level' => 3,
            'sort_order' => 1,
        ]);

        return [$l1, $l2, $l3];
    }
}
