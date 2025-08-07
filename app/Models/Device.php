<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'serial_number',
        'device_type',
        'brand',
        'model',
        'operating_system',
        'mac_address',
        'specifications',
        'price',
        'purchase_date',
        'warranty_expiry',
        'status',
        'issued_to',
        'received_by',
        'qr_code',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'specifications' => 'array', // Changed from 'json' to 'array' for more reliable handling
        'price' => 'decimal:2',
        'purchase_date' => 'date:Y-m-d',
        'warranty_expiry' => 'date:Y-m-d',
    ];
    
    /**
     * Set the specifications attribute.
     *
     * @param  mixed  $value
     * @return void
     */
    public function setSpecificationsAttribute($value)
    {
        // Handle null or empty string
        if ($value === null || $value === '') {
            $this->attributes['specifications'] = json_encode([]);
            return;
        }
        
        // Handle string (JSON)
        if (is_string($value) && !is_numeric($value)) {
            try {
                // Try to decode it if it's already JSON
                $decoded = json_decode($value, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $this->attributes['specifications'] = json_encode($decoded);
                } else {
                    // If not valid JSON, store as is
                    $this->attributes['specifications'] = json_encode($value);
                }
            } catch (\Exception $e) {
                // If any error occurs, store empty array
                $this->attributes['specifications'] = json_encode([]);
            }
            return;
        }
        
        // Handle array or other values
        $this->attributes['specifications'] = is_array($value) ? 
            json_encode($value) : json_encode((array) $value);
    }
    
    /**
     * Generate a QR code for the device if it doesn't exist
     */
    public function generateQrCode(): string
    {
        if (!$this->qr_code) {
            $this->qr_code = 'DEV-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
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
        
        return url("/devices/qr/{$this->qr_code}");
    }
    
    /**
     * Boot the model
     */
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($device) {
            if (!$device->qr_code) {
                $device->qr_code = 'DEV-' . \Illuminate\Support\Str::upper(\Illuminate\Support\Str::random(8));
            }
        });
    }
}
