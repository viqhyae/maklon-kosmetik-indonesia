<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\ProductSku;
use App\Models\ScanActivity;
use App\Models\TagBatch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class BrandController extends Controller {
    public function index() {
        $authUser = Auth::user();
        $isBrandOwner = $this->isBrandOwnerUser($authUser);
        $ownedBrandIds = $isBrandOwner ? $this->ownedBrandIdsForUser($authUser?->name) : [];
        $ownedBrandNames = $isBrandOwner ? $this->ownedBrandNamesByIds($ownedBrandIds) : [];

        $databaseCategories = [];
        $databaseProducts = [];
        $databaseScanLogs = [];
        $databaseScanActivitiesCount = 0;
        $databaseUsers = [];
        $databaseTagBatches = [];
        $securitySettings = [
            'maxValidScanLimit' => 5,
            'requireGps' => true,
            'emailNotif' => false,
        ];

        if (Schema::hasTable('product_categories')) {
            $databaseCategories = ProductCategory::query()
                ->whereNull('parent_id')
                ->with(['children.children'])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(function (ProductCategory $level1) {
                    return [
                        'id' => $level1->id,
                        'name' => $level1->name,
                        'subCategories' => $level1->children
                            ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                            ->values()
                            ->map(function (ProductCategory $level2) {
                                return [
                                    'id' => $level2->id,
                                    'name' => $level2->name,
                                    'subSubCategories' => $level2->children
                                        ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                                        ->values()
                                        ->map(function (ProductCategory $level3) {
                                            return [
                                                'id' => $level3->id,
                                                'name' => $level3->name,
                                            ];
                                        })
                                        ->all(),
                                ];
                            })
                            ->all(),
                    ];
                })
                ->all();
        }

        if (Schema::hasTable('users')) {
            if ($isBrandOwner && $authUser) {
                $databaseUsers = [[
                    'id' => $authUser->id,
                    'name' => $authUser->name,
                    'email' => $authUser->email,
                    'role' => $authUser->role ?? 'Brand Owner',
                    'status' => (int) ($authUser->status ?? 1),
                ]];
            } else {
                $userQuery = User::query()->select(['id', 'name', 'email']);

                if (Schema::hasColumn('users', 'role')) {
                    $userQuery->addSelect('role');
                }

                if (Schema::hasColumn('users', 'status')) {
                    $userQuery->addSelect('status');
                }

                $databaseUsers = $userQuery
                    ->latest('id')
                    ->get()
                    ->map(function (User $user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'email' => $user->email,
                            'role' => $user->role ?? 'Brand Owner',
                            'status' => (int) ($user->status ?? 1),
                        ];
                    })
                    ->all();
            }
        }

        if (Schema::hasTable('tag_batches')) {
            $tagBatchQuery = TagBatch::query();
            if ($isBrandOwner) {
                if ($ownedBrandNames === []) {
                    $tagBatchQuery->whereRaw('1 = 0');
                } else {
                    $tagBatchQuery->whereIn('brand_name', $ownedBrandNames);
                }
            }

            $databaseTagBatches = $tagBatchQuery
                ->latest('id')
                ->get()
                ->map(fn (TagBatch $tagBatch) => $this->tagBatchPayload($tagBatch))
                ->all();
        }

        if (Schema::hasTable('product_skus')) {
            $productQuery = ProductSku::query()
                ->with(['brand', 'categoryL1', 'categoryL2', 'categoryL3']);

            if ($isBrandOwner) {
                if ($ownedBrandIds === []) {
                    $productQuery->whereRaw('1 = 0');
                } else {
                    $productQuery->whereIn('brand_id', $ownedBrandIds);
                }
            }

            $databaseProducts = $productQuery
                ->latest('id')
                ->get()
                ->map(fn (ProductSku $productSku) => $this->productPayload($productSku))
                ->all();
        }

        if (Schema::hasTable('scan_activities')) {
            $scanQuery = ScanActivity::query();
            if ($isBrandOwner) {
                if ($ownedBrandNames === []) {
                    $scanQuery->whereRaw('1 = 0');
                } else {
                    $scanQuery->whereIn('brand_name', $ownedBrandNames);
                }
            }

            $databaseScanActivitiesCount = (clone $scanQuery)->count();
            $databaseScanLogs = $scanQuery
                ->latest('id')
                ->limit(500)
                ->get($this->scanActivityColumns())
                ->map(fn (ScanActivity $scanActivity) => $this->scanActivityPayload($scanActivity))
                ->all();
        }

        if (Schema::hasTable('app_settings')) {
            $settingMap = AppSetting::query()
                ->whereIn('key', ['max_valid_scan_limit', 'require_gps', 'email_notif'])
                ->pluck('value', 'key');

            $maxValidScanLimit = (int) ($settingMap['max_valid_scan_limit'] ?? 5);
            $securitySettings = [
                'maxValidScanLimit' => $maxValidScanLimit > 0 ? $maxValidScanLimit : 5,
                'requireGps' => $this->toBoolSetting($settingMap['require_gps'] ?? '1'),
                'emailNotif' => $this->toBoolSetting($settingMap['email_notif'] ?? '0'),
            ];
        }

        $brandQuery = Brand::query();
        if ($isBrandOwner) {
            $ownerName = trim((string) ($authUser?->name ?? ''));
            $brandQuery->where('owner_name', $ownerName);
        }

        return Inertia::render('AdminPanel', [
            'databaseBrands' => $brandQuery
                ->latest('id')
                ->get()
                ->map(fn (Brand $brand) => $this->brandPayload($brand))
                ->all(),
            'databaseCategories' => $databaseCategories,
            'databaseProducts' => $databaseProducts,
            'databaseScanLogs' => $databaseScanLogs,
            'databaseScanActivitiesCount' => $databaseScanActivitiesCount,
            'databaseUsers' => $databaseUsers,
            'databaseTagBatches' => $databaseTagBatches,
            'securitySettings' => $securitySettings,
        ]);
    }

    public function store(Request $request) {
        $this->ensureSuperAdminAccess($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'brand_code' => 'required|string|unique:brands',
            'owner_name' => 'nullable|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048', // Maks 2MB
            'status' => 'nullable|integer|in:0,1',
            'logo_upload_expected' => 'nullable|integer|in:0,1',
        ]);

        $logoUploadExpected = (int) ($data['logo_upload_expected'] ?? 0) === 1;
        unset($data['logo_upload_expected']);

        $data['owner_name'] = isset($data['owner_name']) ? trim($data['owner_name']) : null;
        $data['description'] = isset($data['description']) ? trim($data['description']) : null;
        $data['status'] = (int) ($data['status'] ?? 1);
        $this->ensureOwnerUserExists($data['owner_name']);

        if ($logoUploadExpected && !$request->hasFile('logo')) {
            return response()->json([
                'errors' => [
                    'logo' => ['File logo tidak terbaca oleh server. Pilih ulang file lalu simpan kembali.'],
                ],
            ], 422);
        }

        if ($request->hasFile('logo')) {
            $storedLogoPath = $this->storeLogoFile($request->file('logo'));
            if (!$storedLogoPath) {
                return response()->json([
                    'errors' => [
                        'logo' => ['Gagal menyimpan file logo ke storage. Silakan coba lagi.'],
                    ],
                ], 422);
            }

            $data['logo_url'] = $storedLogoPath;
        }

        $brand = Brand::create($data);

        return response()->json([
            'brand' => $this->brandPayload($brand),
        ], 201);
    }

    public function update(Request $request, Brand $brand) {
        $this->ensureSuperAdminAccess($request);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'nullable|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'status' => 'required|integer|in:0,1',
            'logo_upload_expected' => 'nullable|integer|in:0,1',
        ]);

        $logoUploadExpected = (int) ($data['logo_upload_expected'] ?? 0) === 1;
        unset($data['logo_upload_expected']);

        $data['owner_name'] = isset($data['owner_name']) ? trim($data['owner_name']) : null;
        $data['description'] = isset($data['description']) ? trim($data['description']) : null;
        $data['status'] = (int) $data['status'];
        $currentOwnerName = trim((string) ($brand->owner_name ?? ''));
        $nextOwnerName = trim((string) ($data['owner_name'] ?? ''));
        if ($nextOwnerName !== '' && $nextOwnerName !== $currentOwnerName) {
            $this->ensureOwnerUserExists($nextOwnerName);
        }

        if ($logoUploadExpected && !$request->hasFile('logo')) {
            return response()->json([
                'errors' => [
                    'logo' => ['File logo tidak terbaca oleh server. Pilih ulang file lalu simpan kembali.'],
                ],
            ], 422);
        }

        if ($request->hasFile('logo')) {
            $storedLogoPath = $this->storeLogoFile($request->file('logo'));
            if (!$storedLogoPath) {
                return response()->json([
                    'errors' => [
                        'logo' => ['Gagal menyimpan file logo ke storage. Silakan coba lagi.'],
                    ],
                ], 422);
            }

            if ($brand->logo_url) $this->deleteLogoFile($brand->logo_url); // Hapus logo lama
            $data['logo_url'] = $storedLogoPath;
        }

        $brand->update($data);

        return response()->json([
            'brand' => $this->brandPayload($brand->fresh()),
        ]);
    }

    public function updateStatus(Request $request, Brand $brand)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'status' => 'required|integer|in:0,1',
        ]);

        $brand->update([
            'status' => (int) $validated['status'],
        ]);

        return response()->json([
            'brand' => $this->brandPayload($brand->fresh()),
        ]);
    }

    public function destroy(Request $request, Brand $brand) {
        $this->ensureSuperAdminAccess($request);

        $deletedId = $brand->id;

        if ($brand->logo_url) $this->deleteLogoFile($brand->logo_url);
        $brand->delete();

        return response()->json([
            'deleted_id' => $deletedId,
        ]);
    }

    private function brandPayload(Brand $brand): array
    {
        $logoPath = $this->normalizeLogoPath($brand->logo_url);

        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'brand_code' => $brand->brand_code,
            'owner_name' => $brand->owner_name,
            'description' => $brand->description,
            'logo_url' => $logoPath,
            'logo_public_url' => $logoPath ? asset('storage/' . ltrim($logoPath, '/')) : null,
            'status' => $brand->status,
            'updated_at' => optional($brand->updated_at)->toISOString(),
        ];
    }

    private function normalizeLogoPath(?string $logoPath): ?string
    {
        $path = trim((string) ($logoPath ?? ''));
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

    private function tagBatchPayload(TagBatch $tagBatch): array
    {
        return [
            'id' => $tagBatch->batch_code,
            'date' => optional($tagBatch->created_at)->format('d M Y, H:i'),
            'productName' => $tagBatch->product_name,
            'brandName' => $tagBatch->brand_name ?: '-',
            'qty' => (int) $tagBatch->quantity,
            'firstCode' => $tagBatch->first_code,
            'lastCode' => $tagBatch->last_code,
            'status' => $tagBatch->status,
            'suspendReason' => $tagBatch->suspend_reason ?: null,
            'settings' => [
                'randomLength' => (int) $tagBatch->id_length . ' Karakter',
            ],
            'created_at' => optional($tagBatch->created_at)->toISOString(),
            'updated_at' => optional($tagBatch->updated_at)->toISOString(),
        ];
    }

    private function productPayload(ProductSku $productSku): array
    {
        $imagePath = $this->normalizeProductImagePath($productSku->image_url);
        $categoryParts = array_values(array_filter([
            $productSku->categoryL1?->name,
            $productSku->categoryL2?->name,
            $productSku->categoryL3?->name,
        ], fn ($name) => is_string($name) && trim($name) !== ''));

        return [
            'id' => $productSku->id,
            'name' => $productSku->name,
            'skuCode' => $productSku->sku_code,
            'brandId' => (int) ($productSku->brand_id ?? 0),
            'brandName' => $productSku->brand?->name ?? '-',
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

    private function scanActivityPayload(ScanActivity $scanActivity): array
    {
        $locationLabel = trim((string) ($scanActivity->location_label ?? ''));
        if ($locationLabel === '' || strcasecmp($locationLabel, 'Legacy Checker') === 0) {
            $locationLabel = 'Tidak Diketahui';
        }

        return [
            'id' => $scanActivity->id,
            'time' => optional($scanActivity->scanned_at)->format('d M Y, H:i:s'),
            'scannedAt' => optional($scanActivity->scanned_at)->toISOString(),
            'tagCode' => $scanActivity->verification_code ?: $scanActivity->scanned_code,
            'productName' => $scanActivity->product_name ?: 'Unknown / Invalid',
            'brand' => $scanActivity->brand_name ?: 'N/A',
            'location' => $locationLabel,
            'ip' => $scanActivity->ip_address ?: '-',
            'scanCount' => (int) $scanActivity->scan_count,
            'status' => $scanActivity->result_status ?: 'Invalid',
            'tagStatus' => $scanActivity->tag_status ?: '-',
            'suspendReason' => $scanActivity->suspend_reason ?: null,
            'userAgent' => $scanActivity->user_agent ?: '-',
            'latitude' => $scanActivity->latitude,
            'longitude' => $scanActivity->longitude,
        ];
    }

    private function scanActivityColumns(): array
    {
        return [
            'id',
            'scanned_at',
            'verification_code',
            'scanned_code',
            'product_name',
            'brand_name',
            'location_label',
            'ip_address',
            'scan_count',
            'result_status',
            'tag_status',
            'suspend_reason',
            'user_agent',
            'latitude',
            'longitude',
        ];
    }

    private function normalizeProductImagePath(?string $imagePath): ?string
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

    private function toBoolSetting(mixed $value): bool
    {
        $normalized = strtolower(trim((string) $value));
        return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
    }

    private function ensureSuperAdminAccess(Request $request): void
    {
        $role = trim((string) ($request->user()?->role ?? ''));
        if ($role === 'Super Admin') {
            return;
        }

        abort(403, 'Akses ditolak. Fitur ini hanya untuk Super Admin.');
    }

    private function isBrandOwnerUser(?User $user): bool
    {
        return trim((string) ($user?->role ?? '')) === 'Brand Owner';
    }

    private function ownedBrandIdsForUser(?string $ownerName): array
    {
        $name = trim((string) ($ownerName ?? ''));
        if ($name === '' || !Schema::hasTable('brands')) {
            return [];
        }

        return Brand::query()
            ->where('owner_name', $name)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();
    }

    private function ownedBrandNamesByIds(array $brandIds): array
    {
        if ($brandIds === [] || !Schema::hasTable('brands')) {
            return [];
        }

        return Brand::query()
            ->whereIn('id', $brandIds)
            ->pluck('name')
            ->map(fn ($name) => trim((string) $name))
            ->filter(fn ($name) => $name !== '')
            ->unique()
            ->values()
            ->all();
    }

    private function storeLogoFile(UploadedFile $logoFile): ?string
    {
        if (!$logoFile->isValid()) {
            Log::warning('Logo upload file is invalid.', [
                'error_code' => $logoFile->getError(),
                'error_message' => $logoFile->getErrorMessage(),
                'original_name' => $logoFile->getClientOriginalName(),
                'size' => $logoFile->getSize(),
            ]);

            return null;
        }

        $directory = 'logos';
        $targetDirectory = storage_path("app/public/{$directory}");

        try {
            if (!File::isDirectory($targetDirectory)) {
                File::ensureDirectoryExists($targetDirectory, 0775, true);
            }

            $extension = strtolower((string) ($logoFile->getClientOriginalExtension() ?: $logoFile->extension() ?: 'png'));
            $filename = Str::random(40) . ($extension !== '' ? ".{$extension}" : '');
            $relativePath = "{$directory}/{$filename}";
            $targetPath = "{$targetDirectory}/{$filename}";

            // Direct move avoids false-negative return from Flysystem on Docker bind mounts.
            $logoFile->move($targetDirectory, $filename);

            if (!File::exists($targetPath)) {
                Log::warning('Logo upload move completed but file does not exist.', [
                    'target_path' => $targetPath,
                ]);
                return null;
            }

            return $relativePath;
        } catch (\Throwable $e) {
            Log::error('Failed to write logo upload file.', [
                'message' => $e->getMessage(),
                'original_name' => $logoFile->getClientOriginalName(),
                'size' => $logoFile->getSize(),
                'mime' => $logoFile->getClientMimeType(),
            ]);

            return null;
        }
    }

    private function deleteLogoFile(?string $logoPath): void
    {
        $normalizedPath = $this->normalizeLogoPath($logoPath);
        if (!$normalizedPath) {
            return;
        }

        try {
            Storage::disk('public')->delete($normalizedPath);
        } catch (\Throwable $e) {
            Log::warning('Failed deleting logo file via Storage disk.', [
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
            Log::warning('Failed deleting logo file via direct filesystem path.', [
                'path' => $absolutePath,
                'message' => $e->getMessage(),
            ]);
        }
    }

    private function ensureOwnerUserExists(?string $ownerName): void
    {
        $ownerName = trim((string) $ownerName);
        if ($ownerName === '') {
            return;
        }

        if (!Schema::hasTable('users')) {
            return;
        }

        $existing = User::query()->where('name', $ownerName)->first();
        if ($existing) {
            return;
        }

        $base = Str::slug($ownerName, '.');
        if ($base === '') {
            $base = 'owner';
        }

        $candidateEmail = "{$base}@auto.local";
        $counter = 1;
        while (User::query()->where('email', $candidateEmail)->exists()) {
            $candidateEmail = "{$base}{$counter}@auto.local";
            $counter++;
        }

        $payload = [
            'name' => $ownerName,
            'email' => $candidateEmail,
            'password' => 'Owner12345!',
        ];

        if (Schema::hasColumn('users', 'role')) {
            $payload['role'] = 'Brand Owner';
        }

        if (Schema::hasColumn('users', 'status')) {
            $payload['status'] = 1;
        }

        User::query()->create($payload);
    }
}
