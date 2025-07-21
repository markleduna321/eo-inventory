<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_id',
        'part_delivery_id',
        'serial_number',
        'barcode',
        'unit_price',
        'supplier',
        'status',
        'assigned_to',
        'assigned_date',
        'condition_notes',
        'location',
    ];

    protected $casts = [
        'assigned_date' => 'date',
        'unit_price' => 'decimal:2',
    ];

    /**
     * Get the part this item belongs to.
     */
    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Get the delivery this item came from.
     */
    public function delivery()
    {
        return $this->belongsTo(PartDelivery::class, 'part_delivery_id');
    }

    /**
     * Get the system units this part item is used in.
     */
    public function systemUnits()
    {
        return $this->belongsToMany(SystemUnit::class, 'system_unit_parts')
                    ->withPivot('component_role')
                    ->withTimestamps();
    }

    /**
     * Check if this part item is available for use in a system unit
     */
    public function isAvailableForSystemUnit(): bool
    {
        return $this->status === 'available' && $this->systemUnits()->count() === 0;
    }
}
