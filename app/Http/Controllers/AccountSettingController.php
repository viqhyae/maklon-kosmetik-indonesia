<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AccountSettingController extends Controller
{
    public function updateEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($request->user()?->id),
            ],
        ]);

        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        $user->update([
            'email' => strtolower(trim((string) $validated['email'])),
        ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::defaults(), 'confirmed'],
        ]);

        $user = $request->user();
        if (!$user) {
            abort(401);
        }

        $user->update([
            'password' => Hash::make((string) $validated['password']),
        ]);

        return response()->json([
            'message' => 'Password akun berhasil diperbarui.',
        ]);
    }
}

