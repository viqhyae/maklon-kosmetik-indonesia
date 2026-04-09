<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\ScanActivity;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

class ScanActivityController extends Controller
{
    public function index()
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

        $logs = $query
            ->latest('id')
            ->limit(500)
            ->get()
            ->map(fn (ScanActivity $scanActivity) => $this->scanPayload($scanActivity))
            ->all();

        return response()->json([
            'logs' => $logs,
        ]);
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
