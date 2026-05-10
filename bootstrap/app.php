<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Trust proxy headers (X-Forwarded-For, etc.) for deployments behind reverse proxies / CDNs.
        $middleware->trustProxies(at: '*');
        $middleware->trustHosts(at: static function (): array {
            $trustedHosts = config('security.trusted_hosts', []);

            if (! is_array($trustedHosts) || $trustedHosts === []) {
                $appHost = parse_url((string) config('app.url'), PHP_URL_HOST);
                $trustedHosts = $appHost ? [$appHost] : [];
            }

            return array_map(
                static fn (string $host): string => '^'.preg_quote($host, '#').'$',
                array_filter(array_map('trim', $trustedHosts))
            );
        }, subdomains: false);

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\EnforceMaxSessionAge::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
