<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\ScanActivity;
use App\Models\TagCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class ProductVerificationController extends Controller
{
    private const DEFAULT_MAX_VALID_SCAN_LIMIT = 5;

    public function check(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100'],
            'location_label' => ['nullable', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        $normalizedCode = strtoupper(trim((string) $validated['code']));
        if ($normalizedCode === '') {
            return response()->json([
                'exists' => false,
                'message' => 'Kode verifikasi wajib diisi.',
            ], 422);
        }

        if ($this->isGpsRequired() && !$this->hasCoordinates($validated)) {
            return response()->json([
                'exists' => false,
                'message' => 'Izin lokasi wajib diaktifkan untuk verifikasi kode. Aktifkan GPS, lalu coba lagi.',
            ], 422);
        }

        $tagCode = TagCode::query()
            ->where('verification_code', $normalizedCode)
            ->first();

        $scanCount = (int) ScanActivity::query()
            ->when(
                $tagCode !== null,
                fn ($query) => $query->where('verification_code', $normalizedCode),
                fn ($query) => $query->where('scanned_code', $normalizedCode)
            )
            ->count() + 1;

        $maxValidScanLimit = $this->getMaxValidScanLimit();

        $resultStatus = $tagCode
            ? $this->determineResultStatus((string) ($tagCode->status ?? 'Aktif'), $scanCount, $maxValidScanLimit)
            : 'Invalid';
        $suspendReason = $this->resolveSuspendReason($tagCode);

        $resolvedIpAddress = $this->resolveClientIpAddress($request);

        $resolvedLocation = $this->resolveLocation(
            $validated['location_label'] ?? null,
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $resolvedIpAddress
        );

        $scanActivity = ScanActivity::query()->create([
            'scanned_code' => $normalizedCode,
            'tag_code_id' => $tagCode?->id,
            'verification_code' => $tagCode?->verification_code,
            'product_name' => $tagCode?->product_name,
            'brand_name' => $tagCode?->brand_name,
            'tag_status' => $tagCode?->status,
            'result_status' => $resultStatus,
            'suspend_reason' => $suspendReason,
            'scan_count' => $scanCount,
            'location_label' => $resolvedLocation['location_label'],
            'latitude' => $resolvedLocation['latitude'],
            'longitude' => $resolvedLocation['longitude'],
            'ip_address' => $resolvedLocation['ip_address'],
            'user_agent' => $request->userAgent(),
            'scanned_at' => now(),
        ]);

        $this->enrichLocationLabelAfterResponse(
            (int) $scanActivity->id,
            $resolvedLocation['latitude'],
            $resolvedLocation['longitude'],
            $resolvedLocation['ip_address']
        );

        if (!$tagCode) {
            return response()->json([
                'exists' => false,
                'code' => $normalizedCode,
                'scan_status' => $resultStatus,
                'scan_count' => $scanCount,
                'max_valid_scan_limit' => $maxValidScanLimit,
                'message' => 'Kode tidak ditemukan di database.',
            ]);
        }

        return response()->json([
            'exists' => true,
            'code' => $tagCode->verification_code,
            'product_name' => $tagCode->product_name,
            'brand_name' => $tagCode->brand_name,
            'status' => $tagCode->status,
            'scan_status' => $resultStatus,
            'scan_count' => $scanCount,
            'max_valid_scan_limit' => $maxValidScanLimit,
            'message' => 'Kode terdaftar.',
        ]);
    }

    private function determineResultStatus(string $tagStatus, int $scanCount, int $maxValidScanLimit): string
    {
        if (strtolower(trim($tagStatus)) === 'suspended') {
            return 'Suspended';
        }

        if ($scanCount <= $maxValidScanLimit) {
            return 'Original';
        }

        return 'Peringatan';
    }

    private function resolveSuspendReason(?TagCode $tagCode): ?string
    {
        if (!$tagCode || strtolower(trim((string) $tagCode->status)) !== 'suspended') {
            return null;
        }

        $resolvedReason = trim((string) ($tagCode->batch?->suspend_reason ?? ''));
        return $resolvedReason !== '' ? $resolvedReason : null;
    }

    private function getMaxValidScanLimit(): int
    {
        if (!Schema::hasTable('app_settings')) {
            return self::DEFAULT_MAX_VALID_SCAN_LIMIT;
        }

        return Cache::remember('security.max_valid_scan_limit', now()->addMinutes(10), function () {
            $storedValue = AppSetting::getValue('max_valid_scan_limit');
            $parsedValue = (int) ($storedValue ?? self::DEFAULT_MAX_VALID_SCAN_LIMIT);

            return $parsedValue > 0 ? $parsedValue : self::DEFAULT_MAX_VALID_SCAN_LIMIT;
        });
    }

    private function hasCoordinates(array $validated): bool
    {
        $hasLatitude = array_key_exists('latitude', $validated) && $validated['latitude'] !== null;
        $hasLongitude = array_key_exists('longitude', $validated) && $validated['longitude'] !== null;

        return $hasLatitude && $hasLongitude;
    }

    private function isGpsRequired(): bool
    {
        if (!Schema::hasTable('app_settings')) {
            return false;
        }

        return Cache::remember('security.require_gps', now()->addMinutes(10), function () {
            $storedValue = AppSetting::getValue('require_gps', '1');
            $normalized = strtolower(trim((string) $storedValue));

            return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
        });
    }

    private function resolveLocation(
        ?string $locationLabel,
        mixed $latitude,
        mixed $longitude,
        ?string $candidateIp
    ): array {
        $normalizedLabel = trim((string) ($locationLabel ?? ''));
        $normalizedLat = $this->normalizeCoordinateValue($latitude, -90, 90);
        $normalizedLng = $this->normalizeCoordinateValue($longitude, -180, 180);
        $resolvedIp = $this->resolveIpCandidate($candidateIp);

        if ($normalizedLat !== null && $normalizedLng !== null) {
            return [
                'location_label' => $normalizedLabel !== ''
                    ? $normalizedLabel
                    : sprintf('Lat %.6f, Lng %.6f', $normalizedLat, $normalizedLng),
                'latitude' => $normalizedLat,
                'longitude' => $normalizedLng,
                'ip_address' => $resolvedIp,
            ];
        }

        $fromIp = $this->resolveLocationByIp($resolvedIp, false);
        if (
            $normalizedLabel !== ''
            && $this->isFallbackLocationLabel((string) ($fromIp['location_label'] ?? ''))
        ) {
            $fromIp['location_label'] = $normalizedLabel;
        }

        return $fromIp;
    }

    private function resolveLocationByIp(?string $candidateIp, bool $allowNetworkLookup): array
    {
        $resolvedIp = $this->resolveIpCandidate($candidateIp);
        if ($resolvedIp === null) {
            return [
                'location_label' => 'Tidak Diketahui',
                'latitude' => null,
                'longitude' => null,
                'ip_address' => null,
            ];
        }

        $shouldLookupImmediately = $allowNetworkLookup || !$this->isPublicIp($resolvedIp);
        $ipGeoData = $this->resolveIpGeoData($resolvedIp, $shouldLookupImmediately);
        if (is_array($ipGeoData)) {
            return [
                'location_label' => $ipGeoData['location_label'] ?? "IP {$resolvedIp}",
                'latitude' => $ipGeoData['latitude'] ?? null,
                'longitude' => $ipGeoData['longitude'] ?? null,
                'ip_address' => $ipGeoData['ip_address'] ?? $resolvedIp,
            ];
        }

        return [
            'location_label' => "IP {$resolvedIp}",
            'latitude' => null,
            'longitude' => null,
            'ip_address' => $resolvedIp,
        ];
    }

    private function resolveClientIpAddress(Request $request): ?string
    {
        $forwardedIp = $this->firstPublicIpFromForwardedHeaders($request);
        if ($forwardedIp !== null) {
            return $forwardedIp;
        }

        $requestIp = trim((string) $request->ip());
        if ($this->isValidIp($requestIp)) {
            return $requestIp;
        }

        return null;
    }

    private function firstPublicIpFromForwardedHeaders(Request $request): ?string
    {
        $headerValues = [
            $request->header('X-Forwarded-For'),
            $request->header('CF-Connecting-IP'),
            $request->header('X-Real-IP'),
        ];

        foreach ($headerValues as $headerValue) {
            $parts = explode(',', (string) $headerValue);
            foreach ($parts as $part) {
                $candidate = trim($part);
                if ($candidate === '') {
                    continue;
                }

                if ($this->isPublicIp($candidate)) {
                    return $candidate;
                }
            }
        }

        return null;
    }
    private function isPublicIp(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    private function isValidIp(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }

    private function resolveIpCandidate(?string $candidateIp): ?string
    {
        $resolvedIp = trim((string) ($candidateIp ?? ''));
        if ($resolvedIp === '' || !$this->isValidIp($resolvedIp)) {
            return null;
        }

        return $resolvedIp;
    }

    private function normalizeCoordinateValue(mixed $value, float $min, float $max): ?float
    {
        if (!is_numeric($value)) {
            return null;
        }

        $coordinate = (float) $value;
        if ($coordinate < $min || $coordinate > $max) {
            return null;
        }

        return (float) number_format($coordinate, 6, '.', '');
    }

    private function enrichLocationLabelAfterResponse(
        int $scanActivityId,
        mixed $latitude,
        mixed $longitude,
        ?string $requestIp
    ): void {
        $normalizedLat = $this->normalizeCoordinateValue($latitude, -90, 90);
        $normalizedLng = $this->normalizeCoordinateValue($longitude, -180, 180);
        $normalizedIp = $this->resolveIpCandidate($requestIp);
        $hasCoordinateCandidate = $normalizedLat !== null && $normalizedLng !== null;
        $hasIpCandidate = $normalizedIp !== null;

        if (!$hasCoordinateCandidate && !$hasIpCandidate) {
            return;
        }

        app()->terminating(function () use ($scanActivityId, $normalizedLat, $normalizedLng, $normalizedIp) {
            if ($this->skipExternalLocationLookup()) {
                return;
            }

            $scanActivity = ScanActivity::query()->find($scanActivityId);
            if (!$scanActivity) {
                return;
            }

            $currentLabel = trim((string) ($scanActivity->location_label ?? ''));
            $canUpdateLabel = $this->isFallbackLocationLabel($currentLabel);
            $needsCoordinateEnrichment = $normalizedLat === null
                && $normalizedLng === null
                && ($scanActivity->latitude === null || $scanActivity->longitude === null);

            if (!$canUpdateLabel && !$needsCoordinateEnrichment) {
                return;
            }

            $resolvedLabel = null;
            $resolvedLatitude = null;
            $resolvedLongitude = null;
            $resolvedIpAddress = null;
            if ($canUpdateLabel && $normalizedLat !== null && $normalizedLng !== null) {
                $resolvedLabel = $this->resolveCityCountryFromCoordinates($normalizedLat, $normalizedLng);
            }

            if ($normalizedLat === null && $normalizedLng === null && $normalizedIp !== null && ($canUpdateLabel || $needsCoordinateEnrichment)) {
                $resolvedGeo = $this->resolveIpGeoData($normalizedIp, true);
                if (is_array($resolvedGeo)) {
                    if ($canUpdateLabel) {
                        $resolvedLabel = $resolvedGeo['location_label'] ?? null;
                    }
                    $resolvedLatitude = $resolvedGeo['latitude'] ?? null;
                    $resolvedLongitude = $resolvedGeo['longitude'] ?? null;
                    $resolvedIpAddress = $this->resolveIpCandidate($resolvedGeo['ip_address'] ?? null);
                }
            } elseif ($canUpdateLabel && $resolvedLabel === null && $normalizedIp !== null) {
                $resolvedLabel = $this->resolveCityCountryFromIp($normalizedIp);
            }

            $updates = [];
            if ($resolvedLabel !== null && $canUpdateLabel) {
                $updates['location_label'] = $resolvedLabel;
            }

            if ($normalizedLat === null && $normalizedLng === null) {
                if ($scanActivity->latitude === null && $resolvedLatitude !== null) {
                    $updates['latitude'] = $resolvedLatitude;
                }
                if ($scanActivity->longitude === null && $resolvedLongitude !== null) {
                    $updates['longitude'] = $resolvedLongitude;
                }
            }

            $currentIpAddress = trim((string) ($scanActivity->ip_address ?? ''));
            if ($resolvedIpAddress !== null && ($currentIpAddress === '' || !$this->isPublicIp($currentIpAddress))) {
                $updates['ip_address'] = $resolvedIpAddress;
            } elseif (($scanActivity->ip_address === null || $currentIpAddress === '') && $normalizedIp !== null) {
                $updates['ip_address'] = $normalizedIp;
            }

            if ($updates === []) {
                return;
            }

            $scanActivity->update($updates);
        });
    }

    private function resolveCityCountryFromCoordinates(float $latitude, float $longitude): ?string
    {
        $cacheKey = 'reverse_geo_location_async_' . hash('sha1', "{$latitude},{$longitude}");
        $cachedValue = Cache::get($cacheKey);
        if (is_string($cachedValue) && $cachedValue !== '') {
            return $cachedValue;
        }

        try {
            $response = Http::connectTimeout(1)
                ->timeout(2)
                ->acceptJson()
                ->withHeaders([
                    'User-Agent' => 'mki-location-resolver/1.0',
                ])
                ->get('https://nominatim.openstreetmap.org/reverse', [
                    'format' => 'jsonv2',
                    'lat' => $latitude,
                    'lon' => $longitude,
                    'zoom' => 10,
                    'addressdetails' => 1,
                ]);
        } catch (\Throwable) {
            return null;
        }

        if (!$response->ok()) {
            return null;
        }

        $payload = $response->json();
        if (!is_array($payload)) {
            return null;
        }

        $address = is_array($payload['address'] ?? null) ? $payload['address'] : [];
        $city = trim((string) (
            $address['city']
            ?? $address['town']
            ?? $address['municipality']
            ?? $address['village']
            ?? $address['county']
            ?? $address['state_district']
            ?? $address['state']
            ?? ''
        ));
        $countryCode = strtoupper(trim((string) ($address['country_code'] ?? '')));
        $label = $this->composeCityCountryLabel($city, $countryCode);

        if ($label !== null) {
            Cache::put($cacheKey, $label, now()->addHours(6));
        }

        return $label;
    }

    private function resolveCityCountryFromIp(string $requestIp): ?string
    {
        $geoData = $this->resolveIpGeoData($requestIp, true);
        if (!is_array($geoData)) {
            return null;
        }

        $label = trim((string) ($geoData['location_label'] ?? ''));
        return $label !== '' ? $label : null;
    }

    private function resolveIpGeoData(string $requestIp, bool $allowNetworkLookup): ?array
    {
        $candidateIp = $this->resolveIpCandidate($requestIp);
        if ($candidateIp === null) {
            return null;
        }

        $publicCandidateIp = $this->isPublicIp($candidateIp) ? $candidateIp : null;
        $cacheSuffix = $publicCandidateIp ?? 'self';
        $cacheKey = 'ip_geo_payload_v3_' . $cacheSuffix;
        $cachedValue = Cache::get($cacheKey);
        if (is_array($cachedValue)) {
            $cachedLabel = trim((string) ($cachedValue['location_label'] ?? ''));
            $cachedLatitude = $this->normalizeCoordinateValue($cachedValue['latitude'] ?? null, -90, 90);
            $cachedLongitude = $this->normalizeCoordinateValue($cachedValue['longitude'] ?? null, -180, 180);
            $cachedIpAddress = $this->resolveIpCandidate($cachedValue['ip_address'] ?? null) ?? $publicCandidateIp ?? $candidateIp;
            if ($cachedLabel !== '' || $cachedLatitude !== null || $cachedLongitude !== null) {
                return [
                    'location_label' => $cachedLabel !== '' ? $cachedLabel : null,
                    'latitude' => $cachedLatitude,
                    'longitude' => $cachedLongitude,
                    'ip_address' => $cachedIpAddress,
                ];
            }
        }

        if (!$allowNetworkLookup) {
            return null;
        }

        $payload = $this->fetchIpGeoPayload($publicCandidateIp);
        $isPayloadValid = is_array($payload) && ($payload['status'] ?? '') === 'success';
        if (!$isPayloadValid) {
            $payload = $this->fetchIpGeoPayload(null);
            $isPayloadValid = is_array($payload) && ($payload['status'] ?? '') === 'success';
        }

        if (!$isPayloadValid || !is_array($payload)) {
            return null;
        }

        $city = trim((string) ($payload['city'] ?? $payload['regionName'] ?? ''));
        $countryCode = strtoupper(trim((string) ($payload['countryCode'] ?? '')));
        $resolvedLabel = $this->composeCityCountryLabel($city, $countryCode);
        $resolvedLatitude = $this->normalizeCoordinateValue($payload['lat'] ?? null, -90, 90);
        $resolvedLongitude = $this->normalizeCoordinateValue($payload['lon'] ?? null, -180, 180);
        $resolvedIpAddress = $this->resolveIpCandidate($payload['query'] ?? null) ?? $publicCandidateIp ?? $candidateIp;

        if ($resolvedLabel === null && $resolvedLatitude === null && $resolvedLongitude === null) {
            return null;
        }

        $resolvedPayload = [
            'location_label' => $resolvedLabel,
            'latitude' => $resolvedLatitude,
            'longitude' => $resolvedLongitude,
            'ip_address' => $resolvedIpAddress,
        ];
        Cache::put($cacheKey, $resolvedPayload, now()->addHours(6));
        if ($resolvedIpAddress !== null) {
            Cache::put('ip_geo_payload_v3_' . $resolvedIpAddress, $resolvedPayload, now()->addHours(6));
        }

        return $resolvedPayload;
    }

    private function fetchIpGeoPayload(?string $targetIp): ?array
    {
        $endpoint = $targetIp !== null
            ? 'http://ip-api.com/json/' . urlencode($targetIp)
            : 'http://ip-api.com/json/';

        try {
            $response = Http::connectTimeout(1)
                ->timeout(2)
                ->acceptJson()
                ->get($endpoint, [
                    'fields' => 'status,message,query,city,regionName,countryCode,lat,lon',
                ]);
        } catch (\Throwable) {
            return null;
        }

        if (!$response->ok()) {
            return null;
        }

        $payload = $response->json();
        return is_array($payload) ? $payload : null;
    }

    private function composeCityCountryLabel(string $city, string $countryCode): ?string
    {
        if ($city !== '' && $countryCode !== '') {
            return "{$city},{$countryCode}";
        }

        if ($city !== '') {
            return $city;
        }

        if ($countryCode !== '') {
            return $countryCode;
        }

        return null;
    }

    private function isFallbackLocationLabel(string $label): bool
    {
        $normalized = strtolower(trim($label));
        if ($normalized === '' || $normalized === 'tidak diketahui' || str_starts_with($normalized, 'ip ')) {
            return true;
        }

        return str_starts_with($normalized, 'lat ');
    }

    private function skipExternalLocationLookup(): bool
    {
        return app()->environment(['testing']);
    }
}
