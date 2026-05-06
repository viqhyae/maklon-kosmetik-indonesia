<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScanActivity extends Model
{
    protected $fillable = [
        'scanned_code',
        'tag_code_id',
        'verification_code',
        'product_name',
        'brand_name',
        'tag_status',
        'result_status',
        'suspend_reason',
        'scan_count',
        'location_label',
        'latitude',
        'longitude',
        'ip_address',
        'user_agent',
        'scanned_at',
    ];

    protected $casts = [
        'tag_code_id' => 'integer',
        'scan_count' => 'integer',
        'latitude' => 'float',
        'longitude' => 'float',
        'scanned_at' => 'datetime',
    ];

    public function tagCode(): BelongsTo
    {
        return $this->belongsTo(TagCode::class, 'tag_code_id');
    }
}
