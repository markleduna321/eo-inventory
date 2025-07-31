<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Monitor extends Model
{
    use HasFactory;

    protected $fillable = [
        'serial_number',
        'brand',
        'model',
        'size',
        'resolution',
        'refresh_rate',
        'status',
        'location',
        'received_by',
        'notes',
        'station_id',
        'qr_code',
    ];

    protected $casts = [
        'refresh_rate' => 'integer',
    ];

    protected $appends = [
        'deployment_status',
        'deployment_info',
        'is_deployed',
        'station_name'
    ];
    
    /**
     * Generate a QR code for the monitor if it doesn't exist
     */
    public function generateQrCode(): string
    {
        if (!$this->qr_code) {
            $this->qr_code = 'MON-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
            $this->save();
        }
        
        return $this->qr_code;
    }
    
    /**
     * Get the URL for the QR code
     */
    public function getQrCodeUrl(): string
    {
        $this->generateQrCode();
        
        return url("/monitors/qr/{$this->qr_code}");
    }
    
    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($monitor) {
            if (!$monitor->qr_code) {
                $monitor->qr_code = 'MON-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    // Relationships
    public function station()
    {
        return $this->belongsTo(Station::class);
    }

    public function stationAssignment()
    {
        return $this->hasOne(StationAsset::class, 'asset_id')
            ->where('asset_type', 'monitor')
            ->whereNull('unassigned_at');
    }

    // Accessors for deployment status
    public function getDeploymentStatusAttribute()
    {
        if ($this->stationAssignment && $this->station) {
            return 'Deployed';
        }
        
        if ($this->status === 'working') {
            return 'Available';
        }
        
        if (in_array($this->status, ['under_repair', 'not_working'])) {
            return 'Out of Service';
        }
        
        if ($this->status === 'retired') {
            return 'Retired';
        }
        
        return 'Available';
    }

    public function getDeploymentInfoAttribute()
    {
        if ($this->stationAssignment && $this->station) {
            return [
                'station_id' => $this->station->id,
                'station_name' => $this->station->name,
                'station_code' => $this->station->code,
                'location_name' => $this->station->location_name ?? 'Unknown',
                'assigned_user' => $this->station->assigned_user,
                'deployed_at' => $this->stationAssignment->assigned_at
            ];
        }
        
        return null;
    }

    public function getIsDeployedAttribute()
    {
        return $this->stationAssignment && $this->station;
    }

    public function getStationNameAttribute()
    {
        return $this->station ? $this->station->name : null;
    }
}
