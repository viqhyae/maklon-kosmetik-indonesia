<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Add production-safe browser security headers.
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        if (! config('security.headers.enabled', true)) {
            return $response;
        }

        $headers = $response->headers;

        $headers->set('X-Content-Type-Options', 'nosniff');
        $headers->set('X-Frame-Options', 'SAMEORIGIN');
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)');
        $headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        if (app()->environment('production') && config('security.headers.hsts', true)) {
            $maxAge = max(0, (int) config('security.headers.hsts_max_age', 31536000));
            $headers->set('Strict-Transport-Security', "max-age={$maxAge}; includeSubDomains");
        }

        if ($request->user() || $request->is('login', 'adminmki*', 'profile*', 'users*', 'settings*', 'scan-activities*')) {
            $headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
            $headers->set('Pragma', 'no-cache');
            $headers->set('Expires', '0');
        }

        return $response;
    }
}
