<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'parent_id' => 'nullable|integer|exists:product_categories,id',
        ]);

        $parentId = $data['parent_id'] ?? null;
        $name = trim($data['name']);

        $level = 1;
        if ($parentId) {
            $parent = ProductCategory::query()->findOrFail($parentId);
            $level = $parent->level + 1;

            if ($level > 3) {
                return redirect()->back()->withErrors([
                    'name' => 'Kategori maksimal sampai level varian/jenis (3 tingkat).',
                ]);
            }
        }

        $maxSortOrder = ProductCategory::query()
            ->where('parent_id', $parentId)
            ->max('sort_order');

        ProductCategory::query()->create([
            'name' => $name,
            'parent_id' => $parentId,
            'level' => $level,
            'sort_order' => ($maxSortOrder ?? 0) + 1,
        ]);

        return redirect()->back();
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->delete();

        return redirect()->back();
    }
}

