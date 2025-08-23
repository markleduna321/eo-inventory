<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Peripheral extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'brand',
        'model',
        'description',
        'total_stock',
        'available_stock',
        'deployed_stock',
        'damaged_stock',
        'unit_price',
        'location',
        'status',
        'uses_serial_numbers',
        'notes',
        'received_by'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_stock' => 'integer',
        'available_stock' => 'integer',
        'deployed_stock' => 'integer',
        'damaged_stock' => 'integer',
        'uses_serial_numbers' => 'boolean',
    ];

    // Relationships
    public function deliveries()
    {
        return $this->hasMany(PeripheralDelivery::class);
    }

    public function serialNumbers()
    {
        return $this->hasMany(PeripheralSerial::class);
    }

    public function stationAssignment()
    {
        return $this->hasOne(StationAsset::class, 'asset_id')
            ->where('asset_type', 'peripheral')
            ->whereNull('unassigned_at');
    }

    // Accessors
    public function getStockStatusAttribute()
    {
        if ($this->available_stock <= 0) {
            return 'Out of Stock';
        } elseif ($this->available_stock <= 5) {
            return 'Low Stock';
        } else {
            return 'In Stock';
        }
    }

    public function getStockStatusColorAttribute()
    {
        switch ($this->stock_status) {
            case 'Out of Stock':
                return 'bg-red-100 text-red-800';
            case 'Low Stock':
                return 'bg-yellow-100 text-yellow-800';
            case 'In Stock':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    public function getTotalValueAttribute()
    {
        return $this->total_stock * ($this->unit_price ?? 0);
    }

    // Methods for stock management
    public function addStock($quantity, $delivery_data = [])
    {
        $this->increment('total_stock', $quantity);
        $this->increment('available_stock', $quantity);

        // Create delivery record
        if (!empty($delivery_data)) {
            $this->deliveries()->create(array_merge($delivery_data, [
                'quantity_delivered' => $quantity
            ]));
        }

        return $this;
    }

    public function deployStock($quantity)
    {
        if ($this->available_stock >= $quantity) {
            $this->decrement('available_stock', $quantity);
            $this->increment('deployed_stock', $quantity);
            return true;
        }
        return false;
    }

    public function returnStock($quantity)
    {
        if ($this->deployed_stock >= $quantity) {
            $this->decrement('deployed_stock', $quantity);
            $this->increment('available_stock', $quantity);
            return true;
        }
        return false;
    }

    public function markDamaged($quantity)
    {
        if ($this->available_stock >= $quantity) {
            $this->decrement('available_stock', $quantity);
            $this->increment('damaged_stock', $quantity);
            return true;
        }
        return false;
    }

    /**
     * Recalculate stock counts based on serial numbers for peripherals that use them.
     * This ensures the stock columns stay in sync with actual serial records.
     */
    public function recalculateStockFromSerials()
    {
        if (!$this->uses_serial_numbers) {
            return false;
        }

        $availableCount = $this->serialNumbers()->where('status', 'available')->count();
        $deployedCount = $this->serialNumbers()->where('status', 'deployed')->count();
        $damagedCount = $this->serialNumbers()->where('status', 'damaged')->count();
        $totalCount = $availableCount + $deployedCount + $damagedCount;

        $this->update([
            'available_stock' => $availableCount,
            'deployed_stock' => $deployedCount,
            'damaged_stock' => $damagedCount,
            'total_stock' => $totalCount
        ]);

        return true;
    }
}
