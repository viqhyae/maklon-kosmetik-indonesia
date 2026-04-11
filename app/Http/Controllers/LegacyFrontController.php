<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use App\Models\ScanActivity;
use App\Models\TagCode;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\View\View;

class LegacyFrontController extends Controller
{
    public function index(): View
    {
        return view('front.page.home', [
            'requireGps' => $this->isGpsRequired(),
        ]);
    }

    public function kode(Request $request): JsonResponse
    {
        $rawKode = strtoupper(strip_tags((string) $request->input('kode')));
        $hasDashInInput = str_contains($rawKode, '-');
        $kode = str_replace('-', '', $rawKode);
        if ($kode === '') {
            return response()->json('', 204);
        }

        $coordinates = $this->extractCoordinatesFromRequest($request);
        if ($this->isGpsRequired() && ($coordinates['latitude'] === null || $coordinates['longitude'] === null)) {
            return response()->json([
                'message' => 'Izin lokasi wajib diaktifkan untuk verifikasi kode. Aktifkan GPS, lalu coba lagi.',
            ], 422);
        }

        $tagCode = TagCode::query()
            ->where('verification_code', $kode)
            ->first();

        if (!$tagCode && $hasDashInInput) {
            // Backward-compatibility for legacy code format that may include hyphens in DB.
            $tagCode = TagCode::query()
                ->whereRaw("REPLACE(verification_code, '-', '') = ?", [$kode])
                ->first();
        }

        if (!$tagCode) {
            return response()->json('', 204);
        }

        $historyQuery = ScanActivity::query()
            ->where('verification_code', $tagCode->verification_code);

        $scanCountBefore = (clone $historyQuery)->count();
        if ($scanCountBefore === 0) {
            $historyQuery = ScanActivity::query()->where('scanned_code', $kode);
            $scanCountBefore = (clone $historyQuery)->count();
        }

        $scanCountAfter = $scanCountBefore + 1;
        $now = Carbon::now();

        $timestamps = (clone $historyQuery)
            ->orderBy('scanned_at', 'asc')
            ->limit(3)
            ->pluck('scanned_at')
            ->map(fn ($value) => Carbon::parse($value))
            ->values();
        if ($scanCountBefore < 3) {
            $timestamps->push($now);
        }

        $scanStatus = 'Original';
        if (strtolower((string) $tagCode->status) === 'suspended') {
            $scanStatus = 'Suspended';
        } elseif ($scanCountAfter > 3) {
            $scanStatus = 'Peringatan';
        }
        $suspendReason = $this->resolveSuspendReason($tagCode);

        $resolvedIpAddress = $this->resolveClientIpAddress($request);
        $geo = $this->resolveLocation(
            $resolvedIpAddress,
            $coordinates['latitude'],
            $coordinates['longitude']
        );

        $scanActivity = ScanActivity::query()->create([
            'scanned_code' => $kode,
            'tag_code_id' => $tagCode->id,
            'verification_code' => $tagCode->verification_code,
            'product_name' => $tagCode->product_name,
            'brand_name' => $tagCode->brand_name,
            'tag_status' => $tagCode->status,
            'result_status' => $scanStatus,
            'suspend_reason' => $suspendReason,
            'scan_count' => $scanCountAfter,
            'location_label' => $geo['location_label'] ?? 'Tidak Diketahui',
            'latitude' => $coordinates['latitude'] ?? ($geo['latitude'] ?? null),
            'longitude' => $coordinates['longitude'] ?? ($geo['longitude'] ?? null),
            'ip_address' => $geo['ip_address'] ?? $resolvedIpAddress,
            'user_agent' => (string) $request->userAgent(),
            'scanned_at' => $now,
        ]);

        $this->enrichLocationLabelAfterResponse(
            (int) $scanActivity->id,
            $coordinates['latitude'],
            $coordinates['longitude'],
            $geo['ip_address'] ?? $resolvedIpAddress
        );

        return response()->json([
            'ke' => $scanCountBefore,
            'tgl' => isset($timestamps[0]) ? $timestamps[0]->format('d M Y H:i:s') : '-',
            'tgl2' => isset($timestamps[1]) ? $timestamps[1]->format('d M Y H:i:s') : '-',
            'tgl3' => isset($timestamps[2]) ? $timestamps[2]->format('d M Y H:i:s') : '-',
        ], 200);
    }

    private function resolveSuspendReason(TagCode $tagCode): ?string
    {
        if (strtolower(trim((string) $tagCode->status)) !== 'suspended') {
            return null;
        }

        $resolvedReason = trim((string) ($tagCode->batch?->suspend_reason ?? ''));
        return $resolvedReason !== '' ? $resolvedReason : null;
    }

    private function resolveLocation(?string $candidateIp, ?float $latitude, ?float $longitude): array
    {
        if ($latitude !== null && $longitude !== null) {
            $fromCoordinates = $this->resolveLocationByCoordinates($latitude, $longitude);
            if ($fromCoordinates !== null) {
                return $fromCoordinates;
            }
        }

        $fromIp = $this->resolveLocationByIp($candidateIp);
        if ($latitude !== null && $longitude !== null) {
            $fromIp['latitude'] = $latitude;
            $fromIp['longitude'] = $longitude;
        }

        return $fromIp;
    }

    private function resolveLocationByCoordinates(float $latitude, float $longitude): ?array
    {
        $normalizedLat = (float) number_format($latitude, 6, '.', '');
        $normalizedLng = (float) number_format($longitude, 6, '.', '');
        return [
            'location_label' => sprintf('Lat %.6f, Lng %.6f', $normalizedLat, $normalizedLng),
            'latitude' => $normalizedLat,
            'longitude' => $normalizedLng,
            'ip_address' => null,
        ];
    }

    private function resolveLocationByIp(?string $candidateIp): array
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

        $shouldLookupImmediately = !$this->isPublicIp($resolvedIp);
        $cachedGeoData = $this->resolveIpGeoData($resolvedIp, $shouldLookupImmediately);
        if (is_array($cachedGeoData)) {
            return [
                'location_label' => $cachedGeoData['location_label'] ?? "IP {$resolvedIp}",
                'latitude' => $cachedGeoData['latitude'] ?? null,
                'longitude' => $cachedGeoData['longitude'] ?? null,
                'ip_address' => $cachedGeoData['ip_address'] ?? $resolvedIp,
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

    private function resolveIpCandidate(?string $ip): ?string
    {
        $candidate = trim((string) ($ip ?? ''));
        if ($candidate === '' || !$this->isValidIp($candidate)) {
            return null;
        }

        return $candidate;
    }

    private function enrichLocationLabelAfterResponse(
        int $scanActivityId,
        ?float $latitude,
        ?float $longitude,
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
        $cacheKey = 'legacy_reverse_geo_async_' . hash('sha1', "{$latitude},{$longitude}");
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
        $cacheKey = 'legacy_ip_geo_payload_v3_' . $cacheSuffix;
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
            Cache::put('legacy_ip_geo_payload_v3_' . $resolvedIpAddress, $resolvedPayload, now()->addHours(6));
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

    private function extractCoordinatesFromRequest(Request $request): array
    {
        $latitude = $this->normalizeCoordinate($request->input('latitude'), -90, 90);
        $longitude = $this->normalizeCoordinate($request->input('longitude'), -180, 180);

        if ($latitude === null || $longitude === null) {
            return [
                'latitude' => null,
                'longitude' => null,
            ];
        }

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];
    }

    private function normalizeCoordinate(mixed $value, float $min, float $max): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        if (!is_numeric($value)) {
            return null;
        }

        $coordinate = (float) $value;
        if ($coordinate < $min || $coordinate > $max) {
            return null;
        }

        return (float) number_format($coordinate, 6, '.', '');
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

    private function isGpsRequired(): bool
    {
        if (!Schema::hasTable('app_settings')) {
            return false;
        }

        return Cache::remember('security.require_gps', now()->addMinutes(10), function () {
            $storedValue = AppSetting::getValue('require_gps', '1');
            return $this->toBoolSetting($storedValue);
        });
    }

    private function toBoolSetting(mixed $value): bool
    {
        $normalized = strtolower(trim((string) $value));
        return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
    }

    private function skipExternalLocationLookup(): bool
    {
        return app()->environment(['testing']);
    }

}
