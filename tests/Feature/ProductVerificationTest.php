<?php

namespace Tests\Feature;

use App\Models\AppSetting;
use App\Models\TagBatch;
use App\Models\TagCode;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_not_found_for_unknown_verification_code(): void
    {
        $response = $this->getJson('/verify-product-code?code=NOTEXIST');

        $response
            ->assertOk()
            ->assertJson([
                'exists' => false,
                'code' => 'NOTEXIST',
                'scan_status' => 'Invalid',
                'scan_count' => 1,
            ]);

        $this->assertDatabaseHas('scan_activities', [
            'scanned_code' => 'NOTEXIST',
            'verification_code' => null,
            'result_status' => 'Invalid',
            'scan_count' => 1,
        ]);
    }

    public function test_it_returns_registered_data_for_existing_verification_code(): void
    {
        $batch = TagBatch::query()->create([
            'batch_code' => 'BATCH-900001',
            'product_name' => 'Sample Product',
            'brand_name' => 'Sample Brand',
            'quantity' => 1,
            'id_length' => 6,
            'error_correction' => 'M',
            'use_pin' => false,
            'status' => 'Generated',
        ]);

        TagCode::query()->create([
            'tag_batch_id' => $batch->id,
            'verification_code' => 'AB12CD',
            'product_name' => 'Sample Product',
            'brand_name' => 'Sample Brand',
            'status' => 'Aktif',
            'error_correction' => 'M',
        ]);

        $response = $this->getJson('/verify-product-code?code=ab12cd');

        $response
            ->assertOk()
            ->assertJson([
                'exists' => true,
                'code' => 'AB12CD',
                'product_name' => 'Sample Product',
                'brand_name' => 'Sample Brand',
                'status' => 'Aktif',
                'scan_status' => 'Original',
                'scan_count' => 1,
            ]);

        $this->assertDatabaseHas('scan_activities', [
            'scanned_code' => 'AB12CD',
            'verification_code' => 'AB12CD',
            'product_name' => 'Sample Product',
            'brand_name' => 'Sample Brand',
            'result_status' => 'Original',
            'scan_count' => 1,
        ]);
    }

    public function test_it_marks_scan_as_warning_after_default_valid_limit_is_exceeded(): void
    {
        $batch = TagBatch::query()->create([
            'batch_code' => 'BATCH-900002',
            'product_name' => 'Sample Product 2',
            'brand_name' => 'Sample Brand 2',
            'quantity' => 1,
            'id_length' => 6,
            'error_correction' => 'M',
            'use_pin' => false,
            'status' => 'Generated',
        ]);

        TagCode::query()->create([
            'tag_batch_id' => $batch->id,
            'verification_code' => 'ZX90KL',
            'product_name' => 'Sample Product 2',
            'brand_name' => 'Sample Brand 2',
            'status' => 'Aktif',
            'error_correction' => 'M',
        ]);

        $firstResponse = $this->getJson('/verify-product-code?code=ZX90KL');
        $secondResponse = $this->getJson('/verify-product-code?code=ZX90KL');
        $thirdResponse = $this->getJson('/verify-product-code?code=ZX90KL');
        $fourthResponse = $this->getJson('/verify-product-code?code=ZX90KL');
        $fifthResponse = $this->getJson('/verify-product-code?code=ZX90KL');
        $sixthResponse = $this->getJson('/verify-product-code?code=ZX90KL');

        $firstResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 1,
        ]);

        $secondResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 2,
        ]);

        $thirdResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 3,
        ]);

        $fourthResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 4,
        ]);

        $fifthResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 5,
        ]);

        $sixthResponse->assertOk()->assertJson([
            'scan_status' => 'Peringatan',
            'scan_count' => 6,
        ]);

        $this->assertDatabaseHas('scan_activities', [
            'verification_code' => 'ZX90KL',
            'result_status' => 'Peringatan',
            'scan_count' => 6,
        ]);
    }

    public function test_it_uses_custom_max_valid_scan_limit_from_settings(): void
    {
        AppSetting::query()->create([
            'key' => 'max_valid_scan_limit',
            'value' => '3',
        ]);

        $batch = TagBatch::query()->create([
            'batch_code' => 'BATCH-900003',
            'product_name' => 'Sample Product 3',
            'brand_name' => 'Sample Brand 3',
            'quantity' => 1,
            'id_length' => 6,
            'error_correction' => 'M',
            'use_pin' => false,
            'status' => 'Generated',
        ]);

        TagCode::query()->create([
            'tag_batch_id' => $batch->id,
            'verification_code' => 'LM12NO',
            'product_name' => 'Sample Product 3',
            'brand_name' => 'Sample Brand 3',
            'status' => 'Aktif',
            'error_correction' => 'M',
        ]);

        $firstResponse = $this->getJson('/verify-product-code?code=LM12NO');
        $secondResponse = $this->getJson('/verify-product-code?code=LM12NO');
        $thirdResponse = $this->getJson('/verify-product-code?code=LM12NO');
        $fourthResponse = $this->getJson('/verify-product-code?code=LM12NO');

        $firstResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 1,
            'max_valid_scan_limit' => 3,
        ]);

        $secondResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 2,
            'max_valid_scan_limit' => 3,
        ]);

        $thirdResponse->assertOk()->assertJson([
            'scan_status' => 'Original',
            'scan_count' => 3,
            'max_valid_scan_limit' => 3,
        ]);

        $fourthResponse->assertOk()->assertJson([
            'scan_status' => 'Peringatan',
            'scan_count' => 4,
            'max_valid_scan_limit' => 3,
        ]);

        $this->assertDatabaseHas('scan_activities', [
            'verification_code' => 'LM12NO',
            'result_status' => 'Peringatan',
            'scan_count' => 4,
        ]);
    }

    public function test_it_marks_suspended_tag_as_recalled(): void
    {
        $batch = TagBatch::query()->create([
            'batch_code' => 'BATCH-900004',
            'product_name' => 'Sample Product 4',
            'brand_name' => 'Sample Brand 4',
            'quantity' => 1,
            'id_length' => 6,
            'error_correction' => 'M',
            'use_pin' => false,
            'status' => 'Generated',
        ]);

        TagCode::query()->create([
            'tag_batch_id' => $batch->id,
            'verification_code' => 'SU12SP',
            'product_name' => 'Sample Product 4',
            'brand_name' => 'Sample Brand 4',
            'status' => 'Suspended',
            'error_correction' => 'M',
        ]);

        $response = $this->getJson('/verify-product-code?code=SU12SP');

        $response->assertOk()->assertJson([
            'scan_status' => 'Suspended',
            'scan_count' => 1,
        ]);

        $this->assertDatabaseHas('scan_activities', [
            'verification_code' => 'SU12SP',
            'result_status' => 'Suspended',
            'scan_count' => 1,
        ]);
    }
}
