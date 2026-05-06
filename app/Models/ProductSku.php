<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSku extends Model
{
    protected $fillable = [
        'name',
        'sku_code',
        'brand_id',
        'category_l1_id',
        'category_l2_id',
        'category_l3_id',
        'description',
        'image_url',
        'dynamic_fields',
    ];

    protected $casts = [
        'brand_id' => 'integer',
        'category_l1_id' => 'integer',
        'category_l2_id' => 'integer',
        'category_l3_id' => 'integer',
        'dynamic_fields' => 'array',
    ];

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function categoryL1(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_l1_id');
    }

    public function categoryL2(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_l2_id');
    }

    public function categoryL3(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'category_l3_id');
    }
}
