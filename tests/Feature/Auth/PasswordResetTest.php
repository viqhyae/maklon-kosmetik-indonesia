<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_reset_flow_is_disabled_in_this_project(): void
    {
        $this->markTestSkipped('Password reset routes are intentionally disabled in this application.');
    }
}
