<?php

namespace App\Http\Controllers;

use App\Models\ProductCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
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
                if ($request->expectsJson()) {
                    return response()->json([
                        'errors' => [
                            'name' => ['Kategori maksimal sampai level varian/jenis (3 tingkat).'],
                        ],
                    ], 422);
                }

                return redirect()->back()->withErrors([
                    'name' => 'Kategori maksimal sampai level varian/jenis (3 tingkat).',
                ]);
            }
        }

        $maxSortOrder = ProductCategory::query()
            ->where('parent_id', $parentId)
            ->max('sort_order');

        $category = ProductCategory::query()->create([
            'name' => $name,
            'parent_id' => $parentId,
            'level' => $level,
            'sort_order' => ($maxSortOrder ?? 0) + 1,
        ]);

        if ($request->expectsJson()) {
            return response()->json([
                'category' => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'parent_id' => $category->parent_id,
                    'level' => $category->level,
                    'sort_order' => $category->sort_order,
                ],
            ], 201);
        }

        return redirect()->back();
    }

    public function destroy(ProductCategory $productCategory)
    {
        $deletedId = $productCategory->id;
        $deletedLevel = $productCategory->level;
        $productCategory->delete();

        if (request()->expectsJson()) {
            return response()->json([
                'deleted_id' => $deletedId,
                'deleted_level' => $deletedLevel,
            ]);
        }

        return redirect()->back();
    }
}
