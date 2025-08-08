<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeripheralSerial extends Model
{
    use HasFactory;

    protected $fillable = [
        'peripheral_id',
        'serial_number',
        'unit_price',
        'status',
        'deployed_to',
        'station_id',
        'deployed_at',
        'returned_at',
        'delivery_date',
        'delivery_id',
        'notes'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'deployed_at' => 'date',
        'returned_at' => 'date',
        'delivery_date' => 'date',
    ];

    // Relationships
    public function peripheral()
    {
        return $this->belongsTo(Peripheral::class);
    }

    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function delivery()
    {
        return $this->belongsTo(PeripheralDelivery::class, 'delivery_id');
    }

    // Scopes
    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeDeployed($query)
    {
        return $query->where('status', 'deployed');
    }

    public function scopeDamaged($query)
    {
        return $query->where('status', 'damaged');
    }

    // Accessors
    public function getStatusBadgeAttribute()
    {
        $colors = [
            'available' => 'bg-green-100 text-green-800',
            'deployed' => 'bg-blue-100 text-blue-800',
            'damaged' => 'bg-red-100 text-red-800',
            'maintenance' => 'bg-yellow-100 text-yellow-800',
        ];

        return $colors[$this->status] ?? 'bg-gray-100 text-gray-800';
    }

    // Methods
    public function deploy($deployedTo, $stationId = null)
    {
        $this->update([
            'status' => 'deployed',
            'deployed_to' => $deployedTo,
            'station_id' => $stationId,
            'deployed_at' => now(),
            'returned_at' => null
        ]);
    }

    public function returnToStock()
    {
        $this->update([
            'status' => 'available',
            'deployed_to' => null,
            'station_id' => null,
            'returned_at' => now()
        ]);
    }

    public function markDamaged($notes = null)
    {
        $this->update([
            'status' => 'damaged',
            'notes' => $notes
        ]);
    }
}
