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
        // Check if asset is already assigned to another station (with active assignment)
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

        // Check if asset exists and has the correct status
        $asset = $this->getAssetModel($assetType, $assetId);
        if (!$asset) {
            throw new \Exception('Asset not found');
        }

        // Check asset availability based on type
        if (!$this->isAssetAvailableForAssignment($assetType, $asset)) {
            throw new \Exception('Asset is not available for assignment');
        }

        // Create new assignment
        $assignment = $this->stationAssets()->create([
            'asset_type' => $assetType,
            'asset_id' => $assetId,
            'assigned_at' => now(),
        ]);

        // Update asset location based on asset type
        $this->updateAssetLocation($assetType, $assetId);
        
        // Get asset details for history
        if ($asset) {
            $assetName = $assetType === 'system_unit' ? 
                $asset->system_name : 
                $asset->brand . ' ' . $asset->model;
                
            // Record history entry for binding
            $this->recordHistory(StationHistory::ACTION_BIND, [
                'asset_type' => $assetType,
                'asset_id' => $assetId,
                'asset_name' => $assetName,
                'asset_serial' => $asset->serial_number
            ]);
        }

        return $assignment;
    }

    public function unassignAsset($assetType, $assetId, $reason = null, $notes = null)
    {
        $assignment = $this->stationAssets()
            ->where('asset_type', $assetType)
            ->where('asset_id', $assetId)
            ->whereNull('unassigned_at')
            ->first();

        if ($assignment) {
            $assignment->update(['unassigned_at' => now()]);
            
            // Get asset details before clearing location
            $assetModel = $this->getAssetModel($assetType, $assetId);
            $assetName = null;
            $assetSerial = null;
            
            if ($assetModel) {
                $assetName = $assetType === 'system_unit' ? 
                    $assetModel->system_name : 
                    $assetModel->brand . ' ' . $assetModel->model;
                $assetSerial = $assetModel->serial_number;
            }
            
            // Record history entry for unbinding
            $this->recordHistory(StationHistory::ACTION_UNBIND, [
                'asset_type' => $assetType,
                'asset_id' => $assetId,
                'asset_name' => $assetName,
                'asset_serial' => $assetSerial,
                'unbind_reason' => $reason,
                'notes' => $notes
            ]);
            
            // Update asset status based on unbind reason
            if ($reason) {
                $this->updateAssetStatusByReason($assetType, $assetId, $reason);
            } else {
                // Default behavior if no reason provided
                $this->clearAssetLocation($assetType, $assetId);
            }
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
                // Deploy exactly this peripheral's stock
                $asset = Peripheral::find($assetId);
                if ($asset && $asset->available_stock > 0) {
                    $asset->deployStock(1); // Deploy 1 unit of this specific peripheral
                } else {
                    throw new \Exception('Peripheral has no available stock');
                }
                break;
        }
    }

    /**
     * Check if an asset is available for assignment
     * 
     * @param string $assetType
     * @param mixed $asset
     * @return bool
     */
    private function isAssetAvailableForAssignment($assetType, $asset)
    {
        switch ($assetType) {
            case 'monitor':
                return $asset->status === 'working';
            case 'system_unit':
                return in_array($asset->status, ['available']);
            case 'peripheral':
                return $asset->status === 'active' && $asset->available_stock > 0;
            default:
                return false;
        }
    }

    /**
     * Get the asset model object based on type and ID
     * 
     * @param string $assetType
     * @param int $assetId
     * @return mixed
     */
    private function getAssetModel($assetType, $assetId)
    {
        switch ($assetType) {
            case 'monitor':
                return Monitor::find($assetId);
            case 'system_unit':
                return SystemUnit::find($assetId);
            case 'peripheral':
                return Peripheral::find($assetId);
            default:
                return null;
        }
    }
    
    /**
     * Update asset status based on unbinding reason
     * 
     * @param string $assetType
     * @param int $assetId
     * @param string $reason
     * @return void
     */
    private function updateAssetStatusByReason($assetType, $assetId, $reason)
    {
        $asset = $this->getAssetModel($assetType, $assetId);
        
        if (!$asset) {
            return;
        }
        
        switch ($reason) {
            case StationHistory::REASON_DAMAGED:
                // Update status to damaged
                switch ($assetType) {
                    case 'monitor':
                        $asset->update([
                            'location' => 'Storage',
                            'station_id' => null,
                            'status' => 'not_working',
                            'deployment_status' => 'Out of Service'
                        ]);
                        break;
                    case 'system_unit':
                        $asset->update([
                            'location' => 'Storage',
                            'station_id' => null,
                            'status' => 'retired',
                            'deployment_status' => 'Out of Service'
                        ]);
                        break;
                    case 'peripheral':
                        $asset->update([
                            'status' => 'inactive' // Use 'inactive' instead of 'not_working'
                        ]);
                        break;
                }
                break;
                
            case StationHistory::REASON_FOR_REPAIR:
                // Update status to indicate for repair
                switch ($assetType) {
                    case 'monitor':
                        $asset->update([
                            'location' => 'Service Center',
                            'station_id' => null,
                            'status' => 'under_repair',
                            'deployment_status' => 'Out of Service'
                        ]);
                        break;
                    case 'system_unit':
                        $asset->update([
                            'location' => 'Service Center',
                            'station_id' => null,
                            'status' => 'maintenance',
                            'deployment_status' => 'Out of Service'
                        ]);
                        break;
                    case 'peripheral':
                        $asset->update([
                            'status' => 'inactive' // Mark as inactive for repair
                        ]);
                        break;
                }
                break;
                
            case StationHistory::REASON_REPLACE_NEW:
                // Keep the current status but mark as unassigned
                $this->clearAssetLocation($assetType, $assetId);
                break;
                
            default:
                // Default behavior
                $this->clearAssetLocation($assetType, $assetId);
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
                // Return exactly this peripheral's stock
                $asset = Peripheral::find($assetId);
                if ($asset && $asset->deployed_stock > 0) {
                    $asset->returnStock(1); // Return 1 unit of this specific peripheral
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
        
        static::created(function ($station) {
            // Record creation history
            $station->recordHistory(StationHistory::ACTION_CREATE, [
                'notes' => 'Station created'
            ]);
        });
        
        static::updated(function ($station) {
            // Record update history when important fields change
            $dirtyAttributes = $station->getDirty();
            
            // Only record history for significant changes, not every update
            $significantAttributes = array_intersect_key($dirtyAttributes, array_flip([
                'name', 'type', 'department', 'location_id', 'assigned_user', 'status'
            ]));
            
            if (count($significantAttributes) > 0) {
                $station->recordHistory(StationHistory::ACTION_UPDATE, [
                    'notes' => 'Station information updated'
                ]);
            }
        });
    }

    /**
     * Get the station history records.
     */
    public function history()
    {
        return $this->hasMany(StationHistory::class)->orderBy('created_at', 'desc');
    }

    /**
     * Record a station history entry.
     * 
     * @param string $actionType
     * @param array $data
     * @return StationHistory
     */
    public function recordHistory($actionType, $data = [])
    {
        $userId = auth()->id() ?? null;
        
        $historyData = array_merge([
            'station_id' => $this->id,
            'action_type' => $actionType,
            'user_id' => $userId
        ], $data);
        
        return StationHistory::create($historyData);
    }
}
