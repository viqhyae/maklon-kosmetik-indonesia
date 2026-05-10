<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnforceMaxSessionAge
{
    public const LOGIN_STARTED_AT_KEY = 'auth.login_started_at';

    private const MAX_AUTH_SESSION_MINUTES = 120;
    private const XSRF_COOKIE = 'XSRF-TOKEN';

    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasSession() || ! $request->user()) {
            return $next($request);
        }

        $guard = Auth::guard('web');
        $loginStartedAt = (int) $request->session()->get(self::LOGIN_STARTED_AT_KEY, 0);

        if ($loginStartedAt <= 0) {
            if (method_exists($guard, 'viaRemember') && $guard->viaRemember()) {
                return $this->expireSession($request);
            }

            $request->session()->put(self::LOGIN_STARTED_AT_KEY, time());

            return $next($request);
        }

        if ((time() - $loginStartedAt) <= (self::MAX_AUTH_SESSION_MINUTES * 60)) {
            return $next($request);
        }

        return $this->expireSession($request);
    }

    private function expireSession(Request $request): Response
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        $this->forgetAuthCookies();

        if ($request->headers->has('X-Inertia')) {
            return Inertia::location(route('login'));
        }

        if ($request->expectsJson()) {
            return response()
                ->json(['message' => 'Sesi Anda sudah berakhir. Silakan login kembali.'], 401)
                ->header('X-Session-Expired', '1');
        }

        return redirect()->route('login');
    }

    private function forgetAuthCookies(): void
    {
        $path = config('session.path', '/');
        $domain = config('session.domain');
        $guard = Auth::guard('web');

        Cookie::queue(Cookie::forget((string) config('session.cookie'), $path, $domain));
        Cookie::queue(Cookie::forget(self::XSRF_COOKIE, $path, $domain));

        if (method_exists($guard, 'getRecallerName')) {
            Cookie::queue(Cookie::forget($guard->getRecallerName(), $path, $domain));
        }
    }
}
