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
            case 'peripheral':
                return $this->belongsTo(Peripheral::class, 'asset_id');
            case 'system_unit':
                return $this->belongsTo(SystemUnit::class, 'asset_id');
            default:
                return null;
        }
    }

    // Specific relationship methods for eager loading
    public function monitor()
    {
        return $this->belongsTo(Monitor::class, 'asset_id');
    }

    public function peripheral()
    {
        return $this->belongsTo(Peripheral::class, 'asset_id');
    }

    public function systemUnit()
    {
        return $this->belongsTo(SystemUnit::class, 'asset_id');
    }

    // Get the actual asset model instance
    public function getAssetAttribute()
    {
        switch ($this->asset_type) {
            case 'monitor':
                return Monitor::find($this->asset_id);
            case 'peripheral':
                return Peripheral::find($this->asset_id);
            case 'system_unit':
                return SystemUnit::find($this->asset_id);
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
