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
        $kode = strtoupper(str_replace('-', '', strip_tags((string) $request->input('kode'))));
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
            ->whereRaw("REPLACE(verification_code, '-', '') = ?", [$kode])
            ->first();

        if (!$tagCode) {
            return response()->json('', 204);
        }

        $history = ScanActivity::query()
            ->where(function ($query) use ($tagCode, $kode) {
                $query->where('verification_code', $tagCode->verification_code)
                    ->orWhere('scanned_code', $kode);
            })
            ->orderBy('scanned_at', 'asc')
            ->get(['scanned_at']);

        $scanCountBefore = $history->count();
        $scanCountAfter = $scanCountBefore + 1;
        $now = Carbon::now();

        $timestamps = $history
            ->pluck('scanned_at')
            ->map(fn ($value) => Carbon::parse($value))
            ->values();
        $timestamps->push($now);

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

        ScanActivity::query()->create([
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
        if ($this->skipExternalLocationLookup()) {
            return null;
        }

        $normalizedLat = (float) number_format($latitude, 6, '.', '');
        $normalizedLng = (float) number_format($longitude, 6, '.', '');
        $cacheKey = 'legacy_reverse_geo_' . hash('sha1', "{$normalizedLat},{$normalizedLng}");

        $cached = Cache::get($cacheKey);
        if (is_array($cached) && isset($cached['location_label'])) {
            return $cached;
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

        $locationLabel = $city !== '' && $countryCode !== ''
            ? "{$city},{$countryCode}"
            : ($city !== '' ? $city : $countryCode);

        $result = [
            'location_label' => $locationLabel,
            'latitude' => $normalizedLat,
            'longitude' => $normalizedLng,
            'ip_address' => null,
        ];

        Cache::put($cacheKey, $result, now()->addHours(6));
        return $result;
    }

    private function resolveLocationByIp(?string $candidateIp): array
    {
        if ($this->skipExternalLocationLookup()) {
            return [
                'location_label' => 'Tidak Diketahui',
                'latitude' => null,
                'longitude' => null,
                'ip_address' => $this->isPublicIp((string) $candidateIp) ? $candidateIp : null,
            ];
        }

        $ipsToTry = [];
        $trimmedIp = trim((string) ($candidateIp ?? ''));

        if ($trimmedIp !== '' && $this->isPublicIp($trimmedIp)) {
            $ipsToTry[] = $trimmedIp;
        }

        // Fallback to server public IP (ip-api self lookup) when client IP is private/local.
        $ipsToTry[] = null;

        foreach ($ipsToTry as $ip) {
            $cacheKey = 'legacy_ip_api_geo_' . ($ip ?? 'self');
            $cached = Cache::get($cacheKey);
            if (is_array($cached) && isset($cached['location_label'])) {
                return $cached;
            }

            $payload = $this->fetchIpApiPayload($ip);
            if ($payload === null || ($payload['status'] ?? '') !== 'success') {
                continue;
            }

            $city = trim((string) ($payload['city'] ?? ''));
            $countryCode = strtoupper(trim((string) ($payload['countryCode'] ?? '')));
            $locationLabel = $city !== '' && $countryCode !== ''
                ? "{$city},{$countryCode}"
                : ($city !== '' ? $city : ($countryCode !== '' ? $countryCode : 'Tidak Diketahui'));

            $result = [
                'location_label' => $locationLabel,
                'latitude' => isset($payload['lat']) ? (float) $payload['lat'] : null,
                'longitude' => isset($payload['lon']) ? (float) $payload['lon'] : null,
                'ip_address' => $this->resolvePublicIpCandidate(
                    trim((string) ($payload['query'] ?? '')) ?: ($ip ?? null)
                ),
            ];

            Cache::put($cacheKey, $result, now()->addHours(6));
            return $result;
        }

        return [
            'location_label' => 'Tidak Diketahui',
            'latitude' => null,
            'longitude' => null,
            'ip_address' => $this->resolvePublicIpCandidate($trimmedIp),
        ];
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

    private function fetchIpApiPayload(?string $ip): ?array
    {
        $endpoint = $ip !== null && $ip !== ''
            ? 'http://ip-api.com/json/' . urlencode($ip)
            : 'http://ip-api.com/json/';

        try {
            $response = Http::timeout(2)
                ->acceptJson()
                ->get($endpoint, [
                    'fields' => 'status,message,query,city,countryCode,lat,lon',
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

    private function isPublicIp(string $ip): bool
    {
        return filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false;
    }

    private function resolvePublicIpFromIpApi(): ?string
    {
        $cachedValue = Cache::get('legacy_ip_api_public_ip_self');
        if (is_string($cachedValue) && $this->isPublicIp($cachedValue)) {
            return $cachedValue;
        }

        $payload = $this->fetchIpApiPayload(null);
        if ($payload === null || ($payload['status'] ?? '') !== 'success') {
            return null;
        }

        $resolvedQueryIp = trim((string) ($payload['query'] ?? ''));
        if (!$this->isPublicIp($resolvedQueryIp)) {
            return null;
        }

        Cache::put('legacy_ip_api_public_ip_self', $resolvedQueryIp, now()->addHours(6));
        return $resolvedQueryIp;
    }

    private function resolvePublicIpCandidate(?string $ip): ?string
    {
        $candidate = trim((string) ($ip ?? ''));
        if ($candidate === '' || !$this->isPublicIp($candidate)) {
            return null;
        }

        return $candidate;
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
