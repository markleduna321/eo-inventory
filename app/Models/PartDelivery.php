<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartDelivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'part_id',
        'quantity_delivered',
        'unit_price',
        'supplier',
        'purchase_order',
        'invoice_number',
        'delivery_date',
        'notes',
        'received_by',
        'delivery_status',
    ];

    protected $casts = [
        'delivery_date' => 'date',
        'unit_price' => 'decimal:2',
    ];

    /**
     * Get the part that owns this delivery.
     */
    public function part()
    {
        return $this->belongsTo(Part::class);
    }

    /**
     * Get the individual items from this delivery.
     */
    public function items()
    {
        return $this->hasMany(PartItem::class);
    }
}
