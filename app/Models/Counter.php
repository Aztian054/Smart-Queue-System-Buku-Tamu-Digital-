<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Counter extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'number',
        'service_id',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the service that owns the counter.
     */
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    /**
     * Get active counters.
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)->orderBy('number');
    }
}