<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class SystemUnit extends Model
{
    use HasFactory;

    protected $fillable = [
        'serial_number',
        'system_name',
        'unit_type',
        'brand',
        'model',
        'description',
        'operating_system',
        'status',
        'location',
        'station_id',
        'assigned_to',
        'received_by',
        'purchase_price',
        'supplier',
        'purchase_date',
        'warranty_expiry',
        'notes',
        'specifications',
        'qr_code'
    ];

    protected $casts = [
        'specifications' => 'array',
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'purchase_price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the parts used in this system unit (for custom built units)
     */
    public function partItems(): BelongsToMany
    {
        return $this->belongsToMany(PartItem::class, 'system_unit_parts')
                    ->withPivot('component_role')
                    ->withTimestamps();
    }

    /**
     * Get the station this system unit is assigned to
     */
    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    /**
     * Get the current station assignment for this system unit
     */
    public function stationAssignment()
    {
        return $this->hasOne(StationAsset::class, 'asset_id')
                    ->where('asset_type', 'system_unit')
                    ->whereNull('unassigned_at');
    }

    /**
     * Get parts grouped by component role
     */
    public function getComponentsAttribute()
    {
        if ($this->unit_type === 'pre_built') {
            return $this->specifications ?? [];
        }

        return $this->partItems->groupBy('pivot.component_role')->map(function ($items) {
            return $items->map(function ($item) {
                return [
                    'part_item_id' => $item->id,
                    'serial_number' => $item->serial_number,
                    'part' => $item->part
                ];
            });
        });
    }

    /**
     * Check if the system unit is available for assignment
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Get formatted specifications for display
     */
    public function getFormattedSpecificationsAttribute()
    {
        if ($this->unit_type === 'pre_built') {
            return $this->specifications ?? [];
        }

        $specs = [];
        foreach ($this->components as $role => $items) {
            $specs[$role] = $items->map(function ($item) {
                $part = $item['part'];
                return "{$part['brand']} {$part['model']} (SN: {$item['serial_number']})";
            })->implode(', ');
        }

        return $specs;
    }

    /**
     * Generate a unique QR code for this system unit
     */
    public function generateQrCode(): string
    {
        if (!$this->qr_code) {
            $this->qr_code = 'SU-' . Str::upper(Str::random(8));
            $this->save();
        }
        
        return $this->qr_code;
    }

    /**
     * Get the QR code URL that will display this system unit's data
     */
    public function getQrCodeUrl(): string
    {
        $this->generateQrCode();
        return url("/system-units/qr/{$this->qr_code}");
    }

    /**
     * Boot method to generate QR code when creating new system unit
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($systemUnit) {
            if (!$systemUnit->qr_code) {
                $systemUnit->qr_code = 'SU-' . Str::upper(Str::random(8));
            }
        });
    }
}
