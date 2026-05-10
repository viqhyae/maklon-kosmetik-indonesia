<?php

return [
    'force_https' => (bool) env('FORCE_HTTPS', true),

    'trusted_hosts' => array_values(array_filter(array_map(
        static fn (string $host): string => trim($host),
        explode(',', (string) env('APP_TRUSTED_HOSTS', 'cek.maklonkosmetik.co.id'))
    ))),

    'headers' => [
        'enabled' => (bool) env('SECURITY_HEADERS_ENABLED', true),
        'hsts' => (bool) env('SECURITY_HSTS_ENABLED', true),
        'hsts_max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 31536000),
    ],
];
