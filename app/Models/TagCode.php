<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TagCode extends Model
{
    protected $fillable = [
        'tag_batch_id',
        'verification_code',
        'product_name',
        'brand_name',
        'status',
        'pin',
        'error_correction',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(TagBatch::class, 'tag_batch_id');
    }
}
