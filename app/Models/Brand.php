<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model {
    protected $fillable = ['name', 'brand_code', 'owner_name', 'description'];
}