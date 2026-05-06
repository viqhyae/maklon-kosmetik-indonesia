<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TagBatch extends Model
{
    protected $fillable = [
        'batch_code',
        'product_name',
        'brand_name',
        'quantity',
        'id_length',
        'error_correction',
        'use_pin',
        'pin_length',
        'status',
        'suspend_reason',
        'first_code',
        'last_code',
        'created_by',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'id_length' => 'integer',
        'use_pin' => 'boolean',
        'pin_length' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function codes(): HasMany
    {
        return $this->hasMany(TagCode::class, 'tag_batch_id');
    }

    public function getRouteKeyName(): string
    {
        return 'batch_code';
    }
}
