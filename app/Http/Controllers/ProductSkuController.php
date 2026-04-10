<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\ProductSku;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ProductSkuController extends Controller
{
    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);
        $this->ensureProductAccess($request, null, (int) $validated['brand_id']);
        $this->assertCategoryHierarchy(
            (int) $validated['cat_l1_id'],
            $this->nullableInteger($validated['cat_l2_id'] ?? null),
            $this->nullableInteger($validated['cat_l3_id'] ?? null)
        );

        $productSku = ProductSku::query()->create([
            'name' => trim((string) $validated['name']),
            'sku_code' => strtoupper(trim((string) $validated['sku_code'])),
            'brand_id' => (int) $validated['brand_id'],
            'category_l1_id' => (int) $validated['cat_l1_id'],
            'category_l2_id' => $this->nullableInteger($validated['cat_l2_id'] ?? null),
            'category_l3_id' => $this->nullableInteger($validated['cat_l3_id'] ?? null),
            'description' => $this->nullableTrimmedString($validated['description'] ?? null),
            'image_url' => null,
            'dynamic_fields' => $this->normalizeDynamicFields($validated['dynamic_fields'] ?? []),
        ]);

        $imageUploadExpected = (int) ($validated['image_upload_expected'] ?? 0) === 1;
        if ($imageUploadExpected && !$request->hasFile('image')) {
            throw ValidationException::withMessages([
                'image' => ['File foto produk tidak terbaca oleh server. Silakan pilih ulang file.'],
            ]);
        }

        if ($request->hasFile('image')) {
            $storedImagePath = $this->storeImageFile($request->file('image'));
            if (!$storedImagePath) {
                throw ValidationException::withMessages([
                    'image' => ['Gagal menyimpan file foto produk. Silakan coba lagi.'],
                ]);
            }

            $productSku->update([
                'image_url' => $storedImagePath,
            ]);
        }

        $productSku->load(['brand', 'categoryL1', 'categoryL2', 'categoryL3']);

        return response()->json([
            'product' => $this->productPayload($productSku),
        ], 201);
    }

    public function update(Request $request, ProductSku $productSku)
    {
        $validated = $this->validatePayload($request, $productSku);
        $this->ensureProductAccess($request, $productSku, (int) $validated['brand_id']);
        $this->assertCategoryHierarchy(
            (int) $validated['cat_l1_id'],
            $this->nullableInteger($validated['cat_l2_id'] ?? null),
            $this->nullableInteger($validated['cat_l3_id'] ?? null)
        );

        $productSku->update([
            'name' => trim((string) $validated['name']),
            'sku_code' => strtoupper(trim((string) $validated['sku_code'])),
            'brand_id' => (int) $validated['brand_id'],
            'category_l1_id' => (int) $validated['cat_l1_id'],
            'category_l2_id' => $this->nullableInteger($validated['cat_l2_id'] ?? null),
            'category_l3_id' => $this->nullableInteger($validated['cat_l3_id'] ?? null),
            'description' => $this->nullableTrimmedString($validated['description'] ?? null),
            'dynamic_fields' => $this->normalizeDynamicFields($validated['dynamic_fields'] ?? []),
        ]);

        $imageUploadExpected = (int) ($validated['image_upload_expected'] ?? 0) === 1;
        if ($imageUploadExpected && !$request->hasFile('image')) {
            throw ValidationException::withMessages([
                'image' => ['File foto produk tidak terbaca oleh server. Silakan pilih ulang file.'],
            ]);
        }

        if ($request->hasFile('image')) {
            $storedImagePath = $this->storeImageFile($request->file('image'));
            if (!$storedImagePath) {
                throw ValidationException::withMessages([
                    'image' => ['Gagal menyimpan file foto produk. Silakan coba lagi.'],
                ]);
            }

            if ($productSku->image_url) {
                $this->deleteImageFile($productSku->image_url);
            }

            $productSku->update([
                'image_url' => $storedImagePath,
            ]);
        }

        $productSku->load(['brand', 'categoryL1', 'categoryL2', 'categoryL3']);

        return response()->json([
            'product' => $this->productPayload($productSku),
        ]);
    }

    public function destroy(Request $request, ProductSku $productSku)
    {
        $this->ensureProductAccess($request, $productSku, null);

        $deletedId = $productSku->id;
        if ($productSku->image_url) {
            $this->deleteImageFile($productSku->image_url);
        }
        $productSku->delete();

        return response()->json([
            'deleted_id' => $deletedId,
        ]);
    }

    private function validatePayload(Request $request, ?ProductSku $productSku = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku_code' => [
                'required',
                'string',
                'max:100',
                Rule::unique('product_skus', 'sku_code')->ignore($productSku?->id),
            ],
            'brand_id' => ['required', 'integer', 'exists:brands,id'],
            'cat_l1_id' => ['required', 'integer', 'exists:product_categories,id'],
            'cat_l2_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'cat_l3_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'],
            'image_upload_expected' => ['nullable', 'integer', Rule::in([0, 1])],
            'dynamic_fields' => ['nullable', 'array'],
            'dynamic_fields.*' => ['nullable', 'string', 'max:1000'],
        ]);
    }

    private function assertCategoryHierarchy(int $catL1Id, ?int $catL2Id, ?int $catL3Id): void
    {
        $catL1 = ProductCategory::query()->findOrFail($catL1Id);
        if ((int) $catL1->level !== 1) {
            throw ValidationException::withMessages([
                'cat_l1_id' => ['Kategori level 1 tidak valid.'],
            ]);
        }

        if ($catL2Id === null && $catL3Id === null) {
            return;
        }

        if ($catL2Id === null) {
            throw ValidationException::withMessages([
                'cat_l2_id' => ['Pilih Sub Kategori sebelum memilih Varian Akhir.'],
            ]);
        }

        $catL2 = ProductCategory::query()->findOrFail($catL2Id);
        $isValidL2 = (int) $catL2->level === 2
            && (int) $catL2->parent_id === (int) $catL1->id;

        if (!$isValidL2) {
            throw ValidationException::withMessages([
                'cat_l2_id' => ['Struktur kategori produk tidak valid.'],
            ]);
        }

        if ($catL3Id === null) {
            return;
        }

        $catL3 = ProductCategory::query()->findOrFail($catL3Id);
        $isValidL3 = (int) $catL3->level === 3
            && (int) $catL3->parent_id === (int) $catL2->id;

        if (!$isValidL3) {
            throw ValidationException::withMessages([
                'cat_l3_id' => ['Struktur kategori produk tidak valid.'],
            ]);
        }
    }

    private function nullableInteger(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $numericValue = (int) $value;
        return $numericValue > 0 ? $numericValue : null;
    }

    private function normalizeDynamicFields(array $dynamicFields): array
    {
        $normalized = [];

        foreach ($dynamicFields as $key => $value) {
            $safeKey = trim((string) $key);
            if ($safeKey === '') {
                continue;
            }

            $safeValue = trim((string) ($value ?? ''));
            if ($safeValue === '') {
                continue;
            }

            $normalized[$safeKey] = $safeValue;
        }

        return $normalized;
    }

    private function nullableTrimmedString(mixed $value): ?string
    {
        $trimmed = trim((string) ($value ?? ''));
        return $trimmed !== '' ? $trimmed : null;
    }

    private function productPayload(ProductSku $productSku): array
    {
        $brand = $productSku->brand;
        $categoryL1 = $productSku->categoryL1;
        $categoryL2 = $productSku->categoryL2;
        $categoryL3 = $productSku->categoryL3;
        $imagePath = $this->normalizeImagePath($productSku->image_url);

        $categoryParts = array_values(array_filter([
            $categoryL1?->name,
            $categoryL2?->name,
            $categoryL3?->name,
        ], fn ($name) => is_string($name) && trim($name) !== ''));

        return [
            'id' => $productSku->id,
            'name' => $productSku->name,
            'skuCode' => $productSku->sku_code,
            'brandId' => (int) ($productSku->brand_id ?? 0),
            'brandName' => $brand?->name ?? '-',
            'description' => $productSku->description ?: '-',
            'image_url' => $imagePath,
            'image_public_url' => $imagePath ? asset('storage/' . ltrim($imagePath, '/')) : null,
            'categoryPath' => $categoryParts !== [] ? implode(' > ', $categoryParts) : '-',
            'catL1' => (int) ($productSku->category_l1_id ?? 0),
            'catL2' => (int) ($productSku->category_l2_id ?? 0),
            'catL3' => (int) ($productSku->category_l3_id ?? 0),
            'dynamicFields' => is_array($productSku->dynamic_fields) ? $productSku->dynamic_fields : [],
            'updated_at' => optional($productSku->updated_at)->toISOString(),
        ];
    }

    private function normalizeImagePath(?string $imagePath): ?string
    {
        $path = trim((string) ($imagePath ?? ''));
        if ($path === '' || in_array(strtolower($path), ['0', 'null', 'undefined', 'false'], true)) {
            return null;
        }

        if (preg_match('#^https?://#i', $path)) {
            $parsedPath = parse_url($path, PHP_URL_PATH);
            $path = is_string($parsedPath) ? $parsedPath : $path;
        }

        $path = ltrim($path, '/');
        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        return $path !== '' ? $path : null;
    }

    private function storeImageFile(UploadedFile $imageFile): ?string
    {
        if (!$imageFile->isValid()) {
            Log::warning('Product image upload file is invalid.', [
                'error_code' => $imageFile->getError(),
                'error_message' => $imageFile->getErrorMessage(),
                'original_name' => $imageFile->getClientOriginalName(),
                'size' => $imageFile->getSize(),
            ]);

            return null;
        }

        $directory = 'products';
        $targetDirectory = storage_path("app/public/{$directory}");

        try {
            if (!File::isDirectory($targetDirectory)) {
                File::ensureDirectoryExists($targetDirectory, 0775, true);
            }

            $extension = strtolower((string) ($imageFile->getClientOriginalExtension() ?: $imageFile->extension() ?: 'png'));
            $filename = Str::random(40) . ($extension !== '' ? ".{$extension}" : '');
            $relativePath = "{$directory}/{$filename}";
            $targetPath = "{$targetDirectory}/{$filename}";

            // Direct move avoids false-negative return from Flysystem on Docker bind mounts.
            $imageFile->move($targetDirectory, $filename);

            if (!File::exists($targetPath)) {
                Log::warning('Product image upload move completed but file does not exist.', [
                    'target_path' => $targetPath,
                ]);
                return null;
            }

            return $relativePath;
        } catch (\Throwable $e) {
            Log::error('Failed to write product image file.', [
                'message' => $e->getMessage(),
                'original_name' => $imageFile->getClientOriginalName(),
                'size' => $imageFile->getSize(),
                'mime' => $imageFile->getClientMimeType(),
            ]);

            return null;
        }
    }

    private function deleteImageFile(?string $imagePath): void
    {
        $normalizedPath = $this->normalizeImagePath($imagePath);
        if (!$normalizedPath) {
            return;
        }

        try {
            Storage::disk('public')->delete($normalizedPath);
        } catch (\Throwable $e) {
            Log::warning('Failed deleting product image via Storage disk.', [
                'path' => $normalizedPath,
                'message' => $e->getMessage(),
            ]);
        }

        $absolutePath = storage_path('app/public/' . ltrim($normalizedPath, '/'));
        try {
            if (File::exists($absolutePath)) {
                File::delete($absolutePath);
            }
        } catch (\Throwable $e) {
            Log::warning('Failed deleting product image via direct filesystem path.', [
                'path' => $absolutePath,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function ensureProductAccess(Request $request, ?ProductSku $productSku, ?int $targetBrandId): void
    {
        if ($this->isSuperAdmin($request)) {
            return;
        }

        if (!$this->isBrandOwner($request)) {
            abort(403, 'Akses ditolak.');
        }

        $ownedBrandIds = $this->ownedBrandIdsForCurrentUser();
        if ($ownedBrandIds === []) {
            abort(403, 'Anda belum memiliki brand yang dapat dikelola.');
        }

        if ($targetBrandId !== null && !in_array($targetBrandId, $ownedBrandIds, true)) {
            abort(403, 'Anda hanya dapat mengelola SKU dari brand milik Anda sendiri.');
        }

        if ($productSku !== null && !in_array((int) $productSku->brand_id, $ownedBrandIds, true)) {
            abort(403, 'Anda hanya dapat mengelola SKU dari brand milik Anda sendiri.');
        }
    }

    private function ownedBrandIdsForCurrentUser(): array
    {
        $userName = trim((string) (Auth::user()?->name ?? ''));
        if ($userName === '' || !Schema::hasTable('brands')) {
            return [];
        }

        return Brand::query()
            ->where('owner_name', $userName)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function isSuperAdmin(Request $request): bool
    {
        return trim((string) ($request->user()?->role ?? '')) === 'Super Admin';
    }

    private function isBrandOwner(Request $request): bool
    {
        return trim((string) ($request->user()?->role ?? '')) === 'Brand Owner';
    }
}
