<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StationAsset extends Model
{
    use HasFactory;

    protected $fillable = [
        'station_id',
        'asset_type',
        'asset_id',
        'assigned_at',
        'unassigned_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'unassigned_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    // Dynamic relationship to get the actual asset
    public function asset()
    {
        switch ($this->asset_type) {
            case 'monitor':
                return $this->belongsTo(Monitor::class, 'asset_id');
            // Add other asset types as needed
            default:
                return null;
        }
    }

    // Scope for active assignments
    public function scopeActive($query)
    {
        return $query->whereNull('unassigned_at');
    }
}
