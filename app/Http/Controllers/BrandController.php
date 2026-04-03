<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\ProductCategory;
use App\Models\TagBatch;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class BrandController extends Controller {
    public function index() {
        $databaseCategories = [];
        $databaseUsers = [];
        $databaseTagBatches = [];

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

        if (Schema::hasTable('tag_batches')) {
            $databaseTagBatches = TagBatch::query()
                ->latest('id')
                ->get()
                ->map(fn (TagBatch $tagBatch) => $this->tagBatchPayload($tagBatch))
                ->all();
        }

        return Inertia::render('AdminPanel', [
            'databaseBrands' => Brand::query()
                ->latest('id')
                ->get()
                ->map(fn (Brand $brand) => $this->brandPayload($brand))
                ->all(),
            'databaseCategories' => $databaseCategories,
            'databaseUsers' => $databaseUsers,
            'databaseTagBatches' => $databaseTagBatches,
        ]);
    }

    public function store(Request $request) {
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

    public function destroy(Brand $brand) {
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
            'settings' => [
                'randomLength' => (int) $tagBatch->id_length . ' Karakter',
            ],
            'created_at' => optional($tagBatch->created_at)->toISOString(),
            'updated_at' => optional($tagBatch->updated_at)->toISOString(),
        ];
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
