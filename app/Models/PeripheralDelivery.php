<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeripheralDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'peripheral_id',
        'quantity_delivered',
        'unit_price',
        'total_amount',
        'supplier',
        'purchase_order',
        'invoice_number',
        'delivery_date',
        'received_by',
        'notes',
        'delivery_status'
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'unit_price' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'quantity_delivered' => 'integer',
    ];

    // Relationships
    public function peripheral()
    {
        return $this->belongsTo(Peripheral::class);
    }

    // Accessors
    public function getDeliveryStatusColorAttribute()
    {
        switch ($this->delivery_status) {
            case 'received':
                return 'bg-green-100 text-green-800';
            case 'damaged':
                return 'bg-red-100 text-red-800';
            case 'returned':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    // Automatically calculate total amount when saving
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($delivery) {
            if ($delivery->unit_price && $delivery->quantity_delivered) {
                $delivery->total_amount = $delivery->unit_price * $delivery->quantity_delivered;
            }
        });
    }
}
