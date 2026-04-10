<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class SecuritySettingController extends Controller
{
    public function update(Request $request)
    {
        if (!$this->isSuperAdmin($request)) {
            abort(403, 'Akses ditolak. Hanya Super Admin yang dapat mengubah pengaturan keamanan.');
        }

        $validated = $request->validate([
            'max_valid_scan_limit' => ['required', 'integer', 'min:1', 'max:1000'],
            'require_gps' => ['required', 'boolean'],
            'email_notif' => ['required', 'boolean'],
        ]);

        AppSetting::setValue('max_valid_scan_limit', (string) $validated['max_valid_scan_limit']);
        AppSetting::setValue('require_gps', $validated['require_gps'] ? '1' : '0');
        AppSetting::setValue('email_notif', $validated['email_notif'] ? '1' : '0');

        Cache::forget('security.max_valid_scan_limit');
        Cache::forget('security.require_gps');

        return response()->json([
            'settings' => [
                'maxValidScanLimit' => (int) $validated['max_valid_scan_limit'],
                'requireGps' => (bool) $validated['require_gps'],
                'emailNotif' => (bool) $validated['email_notif'],
            ],
        ]);
    }

    private function isSuperAdmin(Request $request): bool
    {
        $role = trim((string) ($request->user()?->role ?? ''));
        return $role === 'Super Admin';
    }
}
