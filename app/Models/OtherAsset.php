<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class OtherAsset extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'asset_type',
        'brand',
        'model',
        'serial_number',
        'description',
        'specifications',
        'condition_status',
        'location_id',
        'purchase_date',
        'purchase_price',
        'warranty_expiry',
        'assigned_to',
        'status',
        'notes',
        'qr_code',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'warranty_expiry' => 'date',
        'purchase_price' => 'decimal:2',
        'specifications' => 'array'
    ];

    protected $dates = ['deleted_at'];

    // Relationships
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('asset_type', $type);
    }

    public function scopeByLocation($query, $locationId)
    {
        return $query->where('location_id', $locationId);
    }

    // Accessors
    public function getFormattedPriceAttribute()
    {
        return $this->purchase_price ? '₱' . number_format($this->purchase_price, 2) : 'N/A';
    }

    public function getIsUnderWarrantyAttribute()
    {
        return $this->warranty_expiry && $this->warranty_expiry->isFuture();
    }

    // Static methods for dropdown data
    public static function getAssetTypes()
    {
        // Get from both dropdown_options table and existing assets
        $fromDropdown = \App\Models\DropdownOption::getOptionsByType('asset_type');
        $fromAssets = self::distinct('asset_type')
                         ->whereNotNull('asset_type')
                         ->where('asset_type', '!=', '')
                         ->pluck('asset_type')
                         ->toArray();
        
        return collect(array_merge($fromDropdown, $fromAssets))
               ->unique()
               ->sort()
               ->values();
    }

    public static function getBrands()
    {
        // Get from both dropdown_options table and existing assets
        $fromDropdown = \App\Models\DropdownOption::getOptionsByType('brand');
        $fromAssets = self::distinct('brand')
                         ->whereNotNull('brand')
                         ->where('brand', '!=', '')
                         ->pluck('brand')
                         ->toArray();
        
        return collect(array_merge($fromDropdown, $fromAssets))
               ->unique()
               ->sort()
               ->values();
    }

    public static function getModels()
    {
        // Get from both dropdown_options table and existing assets
        $fromDropdown = \App\Models\DropdownOption::getOptionsByType('model');
        $fromAssets = self::distinct('model')
                         ->whereNotNull('model')
                         ->where('model', '!=', '')
                         ->pluck('model')
                         ->toArray();
        
        return collect(array_merge($fromDropdown, $fromAssets))
               ->unique()
               ->sort()
               ->values();
    }

    public static function getConditionStatuses()
    {
        return [
            'New',
            'Excellent',
            'Good',
            'Fair',
            'Poor',
            'Damaged',
            'Under Repair'
        ];
    }

    public static function getStatusOptions()
    {
        return [
            'Active',
            'Inactive',
            'Retired',
            'Lost',
            'Stolen',
            'Under Maintenance'
        ];
    }
}
