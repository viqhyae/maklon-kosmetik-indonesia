<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnforceMaxSessionAge;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();
        $request->session()->put(EnforceMaxSessionAge::LOGIN_STARTED_AT_KEY, time());

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        $this->forgetAuthCookies();

        if ($request->headers->has('X-Inertia')) {
            return Inertia::location(route('home'));
        }

        return redirect()->route('home');
    }

    private function forgetAuthCookies(): void
    {
        $path = config('session.path', '/');
        $domain = config('session.domain');
        $guard = Auth::guard('web');

        Cookie::queue(Cookie::forget((string) config('session.cookie'), $path, $domain));
        Cookie::queue(Cookie::forget('XSRF-TOKEN', $path, $domain));

        if (method_exists($guard, 'getRecallerName')) {
            Cookie::queue(Cookie::forget($guard->getRecallerName(), $path, $domain));
        }
    }
}
