<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\TagBatch;
use App\Models\TagCode;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class TagBatchController extends Controller
{
    public function store(Request $request)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'product_name' => 'required|string|max:255',
            'brand_name' => 'nullable|string|max:255',
            'brand_code' => 'nullable|string|max:50',
            'quantity' => 'required|integer|min:1|max:10000',
            'random_length' => 'required|integer|in:5,6,7',
        ]);

        $quantity = (int) $validated['quantity'];
        $randomLength = (int) $validated['random_length'];
        $errorCorrection = 'M';
        $productName = trim((string) $validated['product_name']);
        $brandName = trim((string) ($validated['brand_name'] ?? ''));

        for ($attempt = 0; $attempt < 3; $attempt++) {
            try {
                $result = DB::transaction(function () use (
                    $quantity,
                    $randomLength,
                    $errorCorrection,
                    $productName,
                    $brandName
                ) {
                    $batchCode = $this->generateBatchCode();
                    $batch = TagBatch::query()->create([
                        'batch_code' => $batchCode,
                        'product_name' => $productName,
                        'brand_name' => $brandName !== '' ? $brandName : null,
                        'quantity' => $quantity,
                        'id_length' => $randomLength,
                        'error_correction' => $errorCorrection,
                        'use_pin' => false,
                        'pin_length' => null,
                        'status' => 'Generated',
                        'created_by' => Auth::id(),
                    ]);

                    $verificationCodes = $this->generateUniqueVerificationCodes(
                        $quantity,
                        $randomLength
                    );

                    $insertRows = [];
                    $now = now();
                    foreach ($verificationCodes as $code) {
                        $insertRows[] = [
                            'tag_batch_id' => $batch->id,
                            'verification_code' => $code,
                            'product_name' => $productName,
                            'brand_name' => $brandName !== '' ? $brandName : null,
                            'status' => 'Aktif',
                            'pin' => null,
                            'error_correction' => $errorCorrection,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];
                    }

                    TagCode::query()->insert($insertRows);

                    $batch->update([
                        'first_code' => $verificationCodes[0] ?? null,
                        'last_code' => $verificationCodes[$quantity - 1] ?? null,
                    ]);

                    return $batch->fresh();
                });

                return response()->json([
                    'batch' => $this->batchPayload($result),
                ], 201);
            } catch (QueryException $queryException) {
                if (!$this->isUniqueViolation($queryException)) {
                    throw $queryException;
                }
            }
        }

        return response()->json([
            'errors' => [
                'verification_code' => ['Gagal membuat kode verifikasi unik. Coba lagi dalam beberapa detik.'],
            ],
        ], 422);
    }

    public function updateStatus(Request $request, TagBatch $tagBatch)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['Generated', 'Suspended'])],
            'suspend_reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $batchStatus = (string) $validated['status'];
        $suspendReason = trim((string) ($validated['suspend_reason'] ?? ''));
        if ($batchStatus === 'Suspended' && $suspendReason === '') {
            throw ValidationException::withMessages([
                'suspend_reason' => ['Alasan suspend wajib diisi.'],
            ]);
        }

        $codeStatus = $batchStatus === 'Suspended' ? 'Suspended' : 'Aktif';

        DB::transaction(function () use ($tagBatch, $batchStatus, $codeStatus, $suspendReason) {
            $tagBatch->update([
                'status' => $batchStatus,
                'suspend_reason' => $batchStatus === 'Suspended' ? $suspendReason : null,
            ]);

            TagCode::query()
                ->where('tag_batch_id', $tagBatch->id)
                ->update([
                    'status' => $codeStatus,
                ]);
        });

        return response()->json([
            'batch' => $this->batchPayload($tagBatch),
        ]);
    }

    public function destroy(Request $request, TagBatch $tagBatch)
    {
        $this->ensureSuperAdminAccess($request);

        $deletedId = $tagBatch->batch_code;
        $tagBatch->delete();

        return response()->json([
            'deleted_id' => $deletedId,
        ]);
    }

    public function codes(TagBatch $tagBatch)
    {
        $this->ensureBatchReadableByCurrentUser($tagBatch);

        $codes = $tagBatch->codes()
            ->orderBy('id')
            ->get()
            ->map(fn (TagCode $tagCode) => $this->tagCodePayload($tagCode, $tagBatch->batch_code))
            ->all();

        return response()->json([
            'codes' => $codes,
        ]);
    }

    private function generateBatchCode(): string
    {
        do {
            $candidate = 'BATCH-' . str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (TagBatch::query()->where('batch_code', $candidate)->exists());

        return $candidate;
    }

    private function generateUniqueVerificationCodes(int $quantity, int $randomLength): array
    {
        $codes = [];
        $maxRounds = 25;

        for ($round = 0; $round < $maxRounds; $round++) {
            while (count($codes) < $quantity) {
                $candidate = strtoupper(Str::random($randomLength));

                $codes[$candidate] = true;
            }

            $codeCandidates = array_keys($codes);
            $existing = TagCode::query()
                ->whereIn('verification_code', $codeCandidates)
                ->pluck('verification_code')
                ->all();

            if ($existing === []) {
                return $codeCandidates;
            }

            foreach ($existing as $duplicateCode) {
                unset($codes[$duplicateCode]);
            }
        }

        throw new \RuntimeException('Unable to generate unique verification codes.');
    }

    private function isUniqueViolation(QueryException $queryException): bool
    {
        $sqlState = (string) ($queryException->errorInfo[0] ?? '');
        $driverCode = (string) ($queryException->errorInfo[1] ?? '');
        $message = strtolower($queryException->getMessage());

        return $sqlState === '23000'
            || $sqlState === '23505'
            || $driverCode === '1062'
            || str_contains($message, 'unique')
            || str_contains($message, 'duplicate');
    }

    private function batchPayload(TagBatch $tagBatch): array
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

    private function tagCodePayload(TagCode $tagCode, string $batchCode): array
    {
        return [
            'id' => $tagCode->id,
            'code' => $tagCode->verification_code,
            'productName' => $tagCode->product_name,
            'status' => $tagCode->status,
            'batchId' => $batchCode,
            'pin' => $tagCode->pin,
            'ecc' => $tagCode->error_correction,
        ];
    }

    private function ensureSuperAdminAccess(Request $request): void
    {
        $role = trim((string) ($request->user()?->role ?? ''));
        if ($role === 'Super Admin') {
            return;
        }

        abort(403, 'Akses ditolak. Fitur ini hanya untuk Super Admin.');
    }

    private function ensureBatchReadableByCurrentUser(TagBatch $tagBatch): void
    {
        $user = Auth::user();
        $role = trim((string) ($user?->role ?? ''));

        if ($role === 'Super Admin') {
            return;
        }

        if ($role !== 'Brand Owner') {
            abort(403, 'Akses ditolak.');
        }

        $ownedBrandNames = $this->ownedBrandNamesForCurrentUser();
        $batchBrandName = trim((string) ($tagBatch->brand_name ?? ''));

        if ($batchBrandName === '' || !in_array($batchBrandName, $ownedBrandNames, true)) {
            abort(403, 'Anda tidak memiliki akses ke batch ini.');
        }
    }

    private function ownedBrandNamesForCurrentUser(): array
    {
        $userName = trim((string) (Auth::user()?->name ?? ''));
        if ($userName === '' || !Schema::hasTable('brands')) {
            return [];
        }

        return Brand::query()
            ->where('owner_name', $userName)
            ->pluck('name')
            ->map(fn ($name) => trim((string) $name))
            ->filter(fn ($name) => $name !== '')
            ->unique()
            ->values()
            ->all();
    }
}
