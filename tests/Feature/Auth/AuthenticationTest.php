<?php

namespace Tests\Feature\Auth;

use App\Http\Middleware\EnforceMaxSessionAge;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
        $response->assertSessionHas(EnforceMaxSessionAge::LOGIN_STARTED_AT_KEY);
    }

    public function test_login_does_not_create_a_remember_me_cookie(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'remember' => true,
        ]);

        $this->assertAuthenticated();
        $response->assertCookieMissing(Auth::guard('web')->getRecallerName());
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();
        $recallerCookie = Auth::guard('web')->getRecallerName();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
        $response->assertCookieExpired((string) config('session.cookie'));
        $response->assertCookieExpired('XSRF-TOKEN');
        $response->assertCookieExpired($recallerCookie);
    }

    public function test_authenticated_session_expires_after_two_hours(): void
    {
        $user = User::factory()->create();
        $recallerCookie = Auth::guard('web')->getRecallerName();

        $response = $this
            ->actingAs($user)
            ->withSession([
                EnforceMaxSessionAge::LOGIN_STARTED_AT_KEY => now()->subMinutes(121)->timestamp,
            ])
            ->get('/adminmki');

        $this->assertGuest();
        $response->assertRedirect(route('login', absolute: false));
        $response->assertCookieExpired((string) config('session.cookie'));
        $response->assertCookieExpired('XSRF-TOKEN');
        $response->assertCookieExpired($recallerCookie);
    }
}
