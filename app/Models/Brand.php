<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model {
    protected $fillable = ['name', 'brand_code', 'owner_name', 'description', 'logo_url', 'status'];

    protected $casts = [
        'status' => 'integer',
    ];

    public function setLogoUrlAttribute($value): void
    {
        $normalized = trim((string) ($value ?? ''));
        if ($normalized === '' || in_array(strtolower($normalized), ['0', 'null', 'undefined', 'false'], true)) {
            $this->attributes['logo_url'] = null;
            return;
        }

        $this->attributes['logo_url'] = $normalized;
    }
}
