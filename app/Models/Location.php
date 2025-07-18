<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'type',
        'building',
        'floor',
        'room',
        'capacity',
        'current_items',
        'manager',
        'status',
        'description',
        'contact_info'
    ];

    protected $casts = [
        'contact_info' => 'array',
        'capacity' => 'integer',
        'current_items' => 'integer'
    ];

    // Relationships - Using string matching for now since foreign keys may not be set up
    public function devices()
    {
        return $this->hasMany(Device::class)->where('location', $this->name);
    }

    public function monitors()
    {
        return $this->hasMany(Monitor::class)->where('location', $this->name);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Accessors
    public function getUtilizationPercentageAttribute()
    {
        return $this->capacity > 0 ? round(($this->current_items / $this->capacity) * 100, 2) : 0;
    }

    public function getFullAddressAttribute()
    {
        return "{$this->building}, {$this->floor}, {$this->room}";
    }

    // Mutators
    public function setCodeAttribute($value)
    {
        $this->attributes['code'] = strtoupper($value);
    }
}
