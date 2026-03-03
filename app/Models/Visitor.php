<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'agency',
        'alamat',
        'purpose',
        'notes',
        'photo',
        'identity_photo',
        'signature',
        'location_lat',
        'location_lng',
        'visit_date',
    ];

    protected $casts = [
        'visit_date' => 'date',
    ];

    /**
     * Get the queue for the visitor.
     */
    public function queue()
    {
        return $this->hasOne(Queue::class);
    }

    /**
     * Get visitors for today.
     */
    public function scopeToday($query)
    {
        return $query->where('visit_date', today());
    }
}