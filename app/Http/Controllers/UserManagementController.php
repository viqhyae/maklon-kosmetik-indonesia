<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function store(Request $request)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|max:255',
            'role' => ['required', 'string', Rule::in(['Super Admin', 'Brand Owner'])],
            'status' => 'nullable|integer|in:0,1',
        ]);

        $user = User::query()->create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'password' => $validated['password'],
            'role' => $validated['role'],
            'status' => (int) ($validated['status'] ?? 1),
        ]);

        return response()->json([
            'user' => $this->userPayload($user),
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $this->ensureSuperAdminAccess($request);

        $oldName = trim((string) $user->name);
        $oldRole = (string) ($user->role ?? 'Brand Owner');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => ['required', 'string', Rule::in(['Super Admin', 'Brand Owner'])],
            'status' => 'required|integer|in:0,1',
        ]);

        $newStatus = (int) $validated['status'];
        $newRole = (string) $validated['role'];
        $newName = trim((string) $validated['name']);

        if ($this->wouldLeaveNoActiveSuperAdmin($user, $newRole, $newStatus)) {
            return response()->json([
                'errors' => [
                    'role' => ['Minimal harus ada 1 akun Super Admin aktif. Aksi ini tidak diizinkan.'],
                ],
            ], 422);
        }

        if (Auth::id() === $user->id && $newStatus === 0) {
            return response()->json([
                'errors' => [
                    'status' => ['Akun Anda sendiri tidak boleh dinonaktifkan.'],
                ],
            ], 422);
        }

        $user->update([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => $newStatus,
        ]);

        $this->syncBrandsFromUserMutation($oldName, $newName, $oldRole, $newRole);

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    public function updateStatus(Request $request, User $user)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'status' => 'required|integer|in:0,1',
        ]);

        $newStatus = (int) $validated['status'];
        if ($this->wouldLeaveNoActiveSuperAdmin($user, null, $newStatus)) {
            return response()->json([
                'errors' => [
                    'status' => ['Minimal harus ada 1 akun Super Admin aktif. Aksi ini tidak diizinkan.'],
                ],
            ], 422);
        }

        if (Auth::id() === $user->id && $newStatus === 0) {
            return response()->json([
                'errors' => [
                    'status' => ['Akun Anda sendiri tidak boleh dinonaktifkan.'],
                ],
            ], 422);
        }

        $user->update([
            'status' => $newStatus,
        ]);

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    public function destroy(Request $request, User $user)
    {
        $this->ensureSuperAdminAccess($request);

        if (Auth::id() === $user->id) {
            return response()->json([
                'errors' => [
                    'user' => ['Akun Anda sendiri tidak dapat dihapus.'],
                ],
            ], 422);
        }

        if ($this->wouldLeaveNoActiveSuperAdmin($user, 'Brand Owner', 0)) {
            return response()->json([
                'errors' => [
                    'user' => ['Minimal harus ada 1 akun Super Admin aktif. Akun ini tidak dapat dihapus.'],
                ],
            ], 422);
        }

        $deletedName = trim((string) $user->name);
        $deletedRole = (string) ($user->role ?? 'Brand Owner');
        $deletedId = $user->id;
        $user->delete();
        $this->detachBrandsFromDeletedOwner($deletedName, $deletedRole);

        return response()->json([
            'deleted_id' => $deletedId,
        ]);
    }

    public function resetPassword(Request $request, User $user)
    {
        $this->ensureSuperAdminAccess($request);

        $validated = $request->validate([
            'password' => 'required|string|min:8|max:255|confirmed',
        ]);

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json([
            'user' => $this->userPayload($user),
        ]);
    }

    private function syncBrandsFromUserMutation(string $oldName, string $newName, string $oldRole, string $newRole): void
    {
        if (!Schema::hasTable('brands') || !Schema::hasColumn('brands', 'owner_name')) {
            return;
        }

        if ($oldName !== '' && $oldName !== $newName) {
            Brand::query()
                ->where('owner_name', $oldName)
                ->update(['owner_name' => $newName]);
        }

        $wasBrandOwner = $oldRole === 'Brand Owner';
        $isBrandOwner = $newRole === 'Brand Owner';

        if ($wasBrandOwner && !$isBrandOwner) {
            Brand::query()
                ->where('owner_name', $newName)
                ->update(['owner_name' => null]);
        }
    }

    private function detachBrandsFromDeletedOwner(string $ownerName, string $ownerRole): void
    {
        if ($ownerName === '' || $ownerRole !== 'Brand Owner') {
            return;
        }

        if (!Schema::hasTable('brands') || !Schema::hasColumn('brands', 'owner_name')) {
            return;
        }

        Brand::query()
            ->where('owner_name', $ownerName)
            ->update(['owner_name' => null]);
    }

    private function activeSuperAdminCount(): int
    {
        if (!Schema::hasTable('users')) {
            return 0;
        }

        return (int) User::query()
            ->where('role', 'Super Admin')
            ->where('status', 1)
            ->count();
    }

    private function wouldLeaveNoActiveSuperAdmin(User $user, ?string $nextRole = null, ?int $nextStatus = null): bool
    {
        $currentRole = (string) ($user->role ?? 'Brand Owner');
        $currentStatus = (int) ($user->status ?? 1);
        $targetRole = $nextRole ?? $currentRole;
        $targetStatus = $nextStatus ?? $currentStatus;

        $isCurrentlyActiveSuperAdmin = $currentRole === 'Super Admin' && $currentStatus === 1;
        $willRemainActiveSuperAdmin = $targetRole === 'Super Admin' && $targetStatus === 1;

        if (!$isCurrentlyActiveSuperAdmin || $willRemainActiveSuperAdmin) {
            return false;
        }

        return $this->activeSuperAdminCount() <= 1;
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'status' => (int) $user->status,
        ];
    }

    private function ensureSuperAdminAccess(Request $request): void
    {
        $role = trim((string) ($request->user()?->role ?? ''));
        if ($role === 'Super Admin') {
            return;
        }

        abort(403, 'Akses ditolak. Fitur manajemen pengguna hanya untuk Super Admin.');
    }
}
