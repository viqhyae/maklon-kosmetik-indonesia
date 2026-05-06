<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\ScanActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ScanActivityController extends Controller
{
    private const SNAPSHOT_FETCH_LIMIT = 500;
    private const DELTA_FETCH_LIMIT = 120;

    public function index(Request $request)
    {
        $query = ScanActivity::query();
        if ($this->isBrandOwner()) {
            $ownedBrandNames = $this->ownedBrandNamesForCurrentUser();
            if ($ownedBrandNames === []) {
                $query->whereRaw('1 = 0');
            } else {
                $query->whereIn('brand_name', $ownedBrandNames);
            }
        }

        $afterId = max(0, (int) $request->query('after_id', 0));
        if ($afterId > 0) {
            $deltaLogs = (clone $query)
                ->where('id', '>', $afterId)
                ->latest('id')
                ->limit(self::DELTA_FETCH_LIMIT + 1)
                ->get($this->scanColumns());

            $requiresResync = $deltaLogs->count() > self::DELTA_FETCH_LIMIT;
            if ($requiresResync) {
                $total = (clone $query)->count();
                $snapshotLogs = (clone $query)
                    ->latest('id')
                    ->limit(self::SNAPSHOT_FETCH_LIMIT)
                    ->get($this->scanColumns())
                    ->map(fn (ScanActivity $scanActivity) => $this->scanPayload($scanActivity))
                    ->all();

                return response()->json([
                    'logs' => $snapshotLogs,
                    'total' => $total,
                    'mode' => 'snapshot',
                    'requires_resync' => false,
                ]);
            }

            $deltaPayload = $deltaLogs
                ->take(self::DELTA_FETCH_LIMIT)
                ->map(fn (ScanActivity $scanActivity) => $this->scanPayload($scanActivity))
                ->all();

            return response()->json([
                'logs' => $deltaPayload,
                'mode' => 'delta',
                'requires_resync' => false,
            ]);
        }

        $total = (clone $query)->count();
        $logs = $query
            ->latest('id')
            ->limit(self::SNAPSHOT_FETCH_LIMIT)
            ->get($this->scanColumns())
            ->map(fn (ScanActivity $scanActivity) => $this->scanPayload($scanActivity))
            ->all();

        return response()->json([
            'logs' => $logs,
            'total' => $total,
            'mode' => 'snapshot',
            'requires_resync' => false,
        ]);
    }

    private function scanColumns(): array
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

    private function scanPayload(ScanActivity $scanActivity): array
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

    private function isBrandOwner(): bool
    {
        return trim((string) (Auth::user()?->role ?? '')) === 'Brand Owner';
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
