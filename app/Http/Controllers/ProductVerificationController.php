<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\ScanActivity;
use App\Models\TagCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

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

        $locationLabel = $this->resolveLocationLabel(
            $validated['location_label'] ?? null,
            $validated['latitude'] ?? null,
            $validated['longitude'] ?? null,
            $resolvedIpAddress
        );

        ScanActivity::query()->create([
            'scanned_code' => $normalizedCode,
            'tag_code_id' => $tagCode?->id,
            'verification_code' => $tagCode?->verification_code,
            'product_name' => $tagCode?->product_name,
            'brand_name' => $tagCode?->brand_name,
            'tag_status' => $tagCode?->status,
            'result_status' => $resultStatus,
            'suspend_reason' => $suspendReason,
            'scan_count' => $scanCount,
            'location_label' => $locationLabel,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'ip_address' => $resolvedIpAddress,
            'user_agent' => $request->userAgent(),
            'scanned_at' => now(),
        ]);

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
        if (!\Illuminate\Support\Facades\Schema::hasTable('app_settings')) {
            return self::DEFAULT_MAX_VALID_SCAN_LIMIT;
        }

        return Cache::remember('security.max_valid_scan_limit', now()->addMinutes(10), function () {
            $storedValue = AppSetting::getValue('max_valid_scan_limit');
            $parsedValue = (int) ($storedValue ?? self::DEFAULT_MAX_VALID_SCAN_LIMIT);

            return $parsedValue > 0 ? $parsedValue : self::DEFAULT_MAX_VALID_SCAN_LIMIT;
        });
    }

    private function resolveLocationLabel(
        ?string $locationLabel,
        mixed $latitude,
        mixed $longitude,
        ?string $requestIp
    ): string
    {
        $labelFromCoordinates = $this->resolveLocationFromCoordinates($latitude, $longitude);
        if ($labelFromCoordinates !== null) {
            return $labelFromCoordinates;
        }

        $label = trim((string) ($locationLabel ?? ''));
        if ($label !== '') {
            return $label;
        }

        $labelFromIp = $this->resolveLocationFromIp($requestIp);
        if ($labelFromIp !== null) {
            return $labelFromIp;
        }

        return 'Tidak Diketahui';
    }

    private function resolveLocationFromCoordinates(mixed $latitude, mixed $longitude): ?string
    {
        if ($this->skipExternalLocationLookup()) {
            return null;
        }

        if (!is_numeric($latitude) || !is_numeric($longitude)) {
            return null;
        }

        $normalizedLat = (float) number_format((float) $latitude, 6, '.', '');
        $normalizedLng = (float) number_format((float) $longitude, 6, '.', '');

        $cacheKey = 'reverse_geo_location_' . hash('sha1', "{$normalizedLat},{$normalizedLng}");
        $cachedValue = Cache::get($cacheKey);
        if (is_string($cachedValue) && $cachedValue !== '') {
            return $cachedValue;
        }

        $payload = $this->fetchReverseGeocodePayload($normalizedLat, $normalizedLng);
        if ($payload === null) {
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

        if ($city === '' && $countryCode === '') {
            return null;
        }

        $label = $city !== '' && $countryCode !== ''
            ? "{$city},{$countryCode}"
            : ($city !== '' ? $city : $countryCode);

        Cache::put($cacheKey, $label, now()->addHours(6));
        return $label;
    }

    private function resolveLocationFromIp(?string $requestIp): ?string
    {
        if ($this->skipExternalLocationLookup()) {
            return null;
        }

        $candidateIps = [];
        $clientIp = trim((string) ($requestIp ?? ''));

        if ($clientIp !== '' && $this->isPublicIp($clientIp)) {
            $candidateIps[] = $clientIp;
        }

        // Fallback to server public IP lookup when client IP is private/reserved (e.g. localhost/dev).
        $candidateIps[] = null;

        foreach ($candidateIps as $ip) {
            $cacheKey = 'ip_api_location_' . ($ip ?? 'self');
            $cachedValue = Cache::get($cacheKey);
            if (is_string($cachedValue) && $cachedValue !== '') {
                return $cachedValue;
            }

            $resolvedLabel = $this->fetchLocationLabelFromIpApi($ip);
            if ($resolvedLabel === null) {
                continue;
            }

            Cache::put($cacheKey, $resolvedLabel, now()->addHours(6));
            return $resolvedLabel;
        }

        return null;
    }

    private function resolveClientIpAddress(Request $request): ?string
    {
        $requestIp = trim((string) $request->ip());
        if ($this->isPublicIp($requestIp)) {
            return $requestIp;
        }

        if ($this->skipExternalLocationLookup()) {
            return null;
        }

        $forwardedIp = $this->firstPublicIpFromForwardedHeaders($request);
        if ($forwardedIp !== null) {
            return $forwardedIp;
        }

        $publicIpFromApi = $this->resolvePublicIpFromIpApi();
        if ($publicIpFromApi !== null) {
            return $publicIpFromApi;
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

    private function resolvePublicIpFromIpApi(): ?string
    {
        $cachedValue = Cache::get('ip_api_public_ip_self');
        if (is_string($cachedValue) && $cachedValue !== '') {
            return $cachedValue;
        }

        $payload = $this->fetchIpApiPayload(null, 'status,message,query');
        if ($payload === null || ($payload['status'] ?? '') !== 'success') {
            return null;
        }

        $resolvedQueryIp = trim((string) ($payload['query'] ?? ''));
        if (!$this->isPublicIp($resolvedQueryIp)) {
            return null;
        }

        Cache::put('ip_api_public_ip_self', $resolvedQueryIp, now()->addHours(6));
        return $resolvedQueryIp;
    }

    private function fetchLocationLabelFromIpApi(?string $ip): ?string
    {
        $payload = $this->fetchIpApiPayload($ip, 'status,message,city,regionName,countryCode');
        if ($payload === null || ($payload['status'] ?? '') !== 'success') {
            return null;
        }

        $city = trim((string) ($payload['city'] ?? $payload['regionName'] ?? ''));
        $countryCode = strtoupper(trim((string) ($payload['countryCode'] ?? '')));

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

    private function fetchReverseGeocodePayload(float $latitude, float $longitude): ?array
    {
        try {
            $response = Http::timeout(3)
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
        return is_array($payload) ? $payload : null;
    }

    private function fetchIpApiPayload(?string $ip, string $fields): ?array
    {
        $endpoint = $ip !== null && $ip !== ''
            ? 'http://ip-api.com/json/' . urlencode($ip)
            : 'http://ip-api.com/json/';

        try {
            $response = Http::timeout(2)
                ->acceptJson()
                ->get($endpoint, [
                    'fields' => $fields,
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

    private function isPublicIp(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    private function skipExternalLocationLookup(): bool
    {
        return app()->environment(['testing']);
    }
}
