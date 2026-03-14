<?php

namespace App\Http\Controllers;

use App\Models\Brand;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Schema;

class BrandController extends Controller {
    public function index() {
        $databaseCategories = [];

        if (Schema::hasTable('product_categories')) {
            $databaseCategories = ProductCategory::query()
                ->whereNull('parent_id')
                ->with(['children.children'])
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(function (ProductCategory $level1) {
                    return [
                        'id' => $level1->id,
                        'name' => $level1->name,
                        'subCategories' => $level1->children
                            ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                            ->values()
                            ->map(function (ProductCategory $level2) {
                                return [
                                    'id' => $level2->id,
                                    'name' => $level2->name,
                                    'subSubCategories' => $level2->children
                                        ->sortBy([['sort_order', 'asc'], ['id', 'asc']])
                                        ->values()
                                        ->map(function (ProductCategory $level3) {
                                            return [
                                                'id' => $level3->id,
                                                'name' => $level3->name,
                                            ];
                                        })
                                        ->all(),
                                ];
                            })
                            ->all(),
                    ];
                })
                ->all();
        }

        return Inertia::render('Dashboard', [
            'databaseBrands' => Brand::latest()->get(),
            'databaseCategories' => $databaseCategories,
        ]);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'brand_code' => 'required|string|unique:brands',
            'owner_name' => 'nullable|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048', // Maks 2MB
            'status' => 'nullable|integer|in:0,1',
        ]);

        $data['owner_name'] = isset($data['owner_name']) ? trim($data['owner_name']) : null;
        $data['description'] = isset($data['description']) ? trim($data['description']) : null;
        $data['status'] = (int) ($data['status'] ?? 1);

        if ($request->hasFile('logo')) {
            $data['logo_url'] = $request->file('logo')->store('logos', 'public');
        }

        $brand = Brand::create($data);

        if ($request->expectsJson()) {
            return response()->json([
                'brand' => $this->brandPayload($brand),
            ], 201);
        }

        return redirect()->back();
    }

    public function update(Request $request, Brand $brand) {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'nullable|string',
            'description' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'status' => 'required|integer|in:0,1',
        ]);

        $data['owner_name'] = isset($data['owner_name']) ? trim($data['owner_name']) : null;
        $data['description'] = isset($data['description']) ? trim($data['description']) : null;
        $data['status'] = (int) $data['status'];

        if ($request->hasFile('logo')) {
            if ($brand->logo_url) Storage::disk('public')->delete($brand->logo_url); // Hapus logo lama
            $data['logo_url'] = $request->file('logo')->store('logos', 'public');
        }

        $brand->update($data);

        if ($request->expectsJson()) {
            return response()->json([
                'brand' => $this->brandPayload($brand->fresh()),
            ]);
        }

        return redirect()->back();
    }

    public function destroy(Brand $brand) {
        $deletedId = $brand->id;

        if ($brand->logo_url) Storage::disk('public')->delete($brand->logo_url);
        $brand->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'deleted_id' => $deletedId,
            ]);
        }

        return redirect()->back();
    }

    private function brandPayload(Brand $brand): array
    {
        return [
            'id' => $brand->id,
            'name' => $brand->name,
            'brand_code' => $brand->brand_code,
            'owner_name' => $brand->owner_name,
            'description' => $brand->description,
            'logo_url' => $brand->logo_url,
            'status' => $brand->status,
        ];
    }
}
