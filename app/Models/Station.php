<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'qr_code',
        'type',
        'department',
        'location_id',
        'assigned_user',
        'description',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'location_name',
        'assets_count',
        'monitors_count',
        'peripherals_count',
        'system_units_count'
    ];

    // Relationships
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function stationAssets()
    {
        return $this->hasMany(StationAsset::class);
    }

    public function monitors()
    {
        return $this->hasManyThrough(
            Monitor::class,
            StationAsset::class,
            'station_id',
            'id',
            'id',
            'asset_id'
        )->where('station_assets.asset_type', 'monitor');
    }

    public function peripherals()
    {
        return $this->hasManyThrough(
            Peripheral::class,
            StationAsset::class,
            'station_id',
            'id',
            'id',
            'asset_id'
        )->where('station_assets.asset_type', 'peripheral');
    }

    public function systemUnits()
    {
        return $this->hasManyThrough(
            SystemUnit::class,
            StationAsset::class,
            'station_id',
            'id',
            'id',
            'asset_id'
        )->where('station_assets.asset_type', 'system_unit');
    }

    // Accessors
    public function getLocationNameAttribute()
    {
        return $this->location ? $this->location->name : 'No Location';
    }

    public function getAssetsCountAttribute()
    {
        return $this->stationAssets()->count();
    }

    public function getMonitorsCountAttribute()
    {
        return $this->stationAssets()->where('asset_type', 'monitor')->count();
    }

    public function getPeripheralsCountAttribute()
    {
        return $this->stationAssets()->where('asset_type', 'peripheral')->count();
    }

    public function getSystemUnitsCountAttribute()
    {
        return $this->stationAssets()->where('asset_type', 'system_unit')->count();
    }

    // Methods for asset assignment
    public function assignAsset($assetType, $assetId)
    {
        // Check if asset is already assigned to another station
        $existingAssignment = StationAsset::where('asset_type', $assetType)
            ->where('asset_id', $assetId)
            ->whereNull('unassigned_at')
            ->first();

        if ($existingAssignment) {
            throw new \Exception('Asset is already assigned to another station');
        }

        // For system units, check if station already has one assigned
        if ($assetType === 'system_unit') {
            $currentSystemUnit = $this->stationAssets()
                ->where('asset_type', 'system_unit')
                ->whereNull('unassigned_at')
                ->first();
                
            if ($currentSystemUnit) {
                throw new \Exception('Station can only have one system unit assigned. Please unassign the current system unit first.');
            }
        }

        // Create new assignment
        $assignment = $this->stationAssets()->create([
            'asset_type' => $assetType,
            'asset_id' => $assetId,
            'assigned_at' => now(),
        ]);

        // Update asset location based on asset type
        $this->updateAssetLocation($assetType, $assetId);

        return $assignment;
    }

    public function unassignAsset($assetType, $assetId)
    {
        $assignment = $this->stationAssets()
            ->where('asset_type', $assetType)
            ->where('asset_id', $assetId)
            ->whereNull('unassigned_at')
            ->first();

        if ($assignment) {
            $assignment->update(['unassigned_at' => now()]);
            // Clear asset location
            $this->clearAssetLocation($assetType, $assetId);
        }

        return $assignment;
    }

    private function updateAssetLocation($assetType, $assetId)
    {
        switch ($assetType) {
            case 'monitor':
                $asset = Monitor::find($assetId);
                if ($asset) {
                    $asset->update([
                        'location' => $this->location->name ?? 'Unknown',
                        'station_id' => $this->id
                    ]);
                }
                break;
            case 'system_unit':
                $asset = SystemUnit::find($assetId);
                if ($asset) {
                    $asset->update([
                        'location' => $this->location->name ?? 'Unknown',
                        'station_id' => $this->id,
                        'status' => 'assigned'
                    ]);
                }
                break;
            case 'peripheral':
                // For peripherals, deploy stock from available to deployed
                $asset = Peripheral::find($assetId);
                if ($asset) {
                    // Find similar peripherals (same type, brand, model)
                    $similarPeripheral = Peripheral::where('type', $asset->type)
                        ->where('brand', $asset->brand)
                        ->where('model', $asset->model)
                        ->where('available_stock', '>', 0)
                        ->orderBy('id')
                        ->first();
                        
                    if ($similarPeripheral) {
                        $similarPeripheral->deployStock(1); // Deploy 1 unit of the peripheral
                    } else {
                        // If no similar peripheral with stock is found, use the original one
                        $asset->deployStock(1);
                    }
                }
                break;
        }
    }

    private function clearAssetLocation($assetType, $assetId)
    {
        switch ($assetType) {
            case 'monitor':
                $asset = Monitor::find($assetId);
                if ($asset) {
                    $asset->update([
                        'location' => 'Storage',
                        'station_id' => null
                    ]);
                }
                break;
            case 'system_unit':
                $asset = SystemUnit::find($assetId);
                if ($asset) {
                    $asset->update([
                        'location' => 'Storage',
                        'station_id' => null,
                        'status' => 'available'
                    ]);
                }
                break;
            case 'peripheral':
                // For peripherals, return stock from deployed to available
                $asset = Peripheral::find($assetId);
                if ($asset) {
                    // Find similar peripherals (same type, brand, model)
                    $similarPeripheral = Peripheral::where('type', $asset->type)
                        ->where('brand', $asset->brand)
                        ->where('model', $asset->model)
                        ->orderBy('id')
                        ->first();
                        
                    if ($similarPeripheral) {
                        $similarPeripheral->returnStock(1); // Return 1 unit to the peripheral
                    } else {
                        // If no similar peripheral is found, use the original one
                        $asset->returnStock(1);
                    }
                }
                break;
        }
    }

    /**
     * Generate a unique QR code for this station
     */
    public function generateQrCode(): string
    {
        if (!$this->qr_code) {
            $this->qr_code = 'ST-' . Str::upper(Str::random(8));
            $this->save();
        }
        
        return $this->qr_code;
    }

    /**
     * Get the QR code URL that will display this station's data
     */
    public function getQrCodeUrl(): string
    {
        $this->generateQrCode();
        return url("/stations/qr/{$this->qr_code}");
    }

    /**
     * Boot method to generate QR code when creating new station
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($station) {
            if (!$station->qr_code) {
                $station->qr_code = 'ST-' . Str::upper(Str::random(8));
            }
        });
    }
}
