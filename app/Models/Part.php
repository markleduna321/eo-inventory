<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Part extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'brand',
        'model',
        'description',
        'specifications',
        'location',
        'total_stock',
        'available_stock',
        'unit_price',
        'notes',
        'received_by',
    ];

    protected $casts = [
        'specifications' => 'array',
        'unit_price' => 'decimal:2',
    ];

    protected $appends = [
        'current_stock',
    ];

    /**
     * Get the deliveries for this part.
     */
    public function deliveries()
    {
        return $this->hasMany(PartDelivery::class);
    }

    /**
     * Get the individual items for this part.
     */
    public function items()
    {
        return $this->hasMany(PartItem::class);
    }

    /**
     * Get available items for this part.
     */
    public function availableItems()
    {
        return $this->hasMany(PartItem::class)->where('status', 'available');
    }

    /**
     * Get assigned items for this part.
     */
    public function assignedItems()
    {
        return $this->hasMany(PartItem::class)->where('status', 'assigned');
    }

    /**
     * Get current stock (total - removed items).
     */
    public function getCurrentStockAttribute()
    {
        return $this->total_stock;
    }
}
