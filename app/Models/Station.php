<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

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
        'ip_address',
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
    public function assignAsset($assetType, $assetId, $serialNumber = null)
    {
        Log::info('assignAsset called', ['assetType' => $assetType, 'assetId' => $assetId, 'serialNumber' => $serialNumber, 'stationId' => $this->id]);
        
        // Check if asset is already assigned based on type
        if ($assetType === 'peripheral') {
            if ($serialNumber) {
                // For peripherals with serial numbers, check if THIS specific serial is already assigned
                $existingAssignment = StationAsset::where('asset_type', $assetType)
                    ->where('asset_id', $assetId)
                    ->where('serial_number', $serialNumber)
                    ->whereNull('unassigned_at')
                    ->first();

                if ($existingAssignment) {
                    Log::warning('Serial number already assigned', ['existing' => $existingAssignment->toArray()]);
                    throw new \Exception("Serial number '{$serialNumber}' is already assigned to another station");
                }
            } else {
                // For peripherals without serial numbers, check if we have available stock
                $currentAssignments = StationAsset::where('asset_type', $assetType)
                    ->where('asset_id', $assetId)
                    ->whereNull('serial_number')
                    ->whereNull('unassigned_at')
                    ->count();

                $peripheral = \App\Models\Peripheral::find($assetId);
                if (!$peripheral || $peripheral->available_stock <= 0) {
                    Log::warning('No available stock for assignment', [
                        'peripheral_id' => $assetId,
                        'current_assignments' => $currentAssignments,
                        'available_stock' => $peripheral ? $peripheral->available_stock : 'N/A',
                        'deployed_stock' => $peripheral ? $peripheral->deployed_stock : 'N/A'
                    ]);
                    throw new \Exception('No available stock for this peripheral');
                }
            }
        } else {
            // For non-peripheral assets (monitors, system units), check if already assigned
            $existingAssignment = StationAsset::where('asset_type', $assetType)
                ->where('asset_id', $assetId)
                ->when($serialNumber, function($query) use ($serialNumber) {
                    return $query->where('serial_number', $serialNumber);
                })
                ->whereNull('unassigned_at')
                ->first();

            if ($existingAssignment) {
                Log::warning('Asset already assigned', ['existing' => $existingAssignment->toArray()]);
                throw new \Exception('Asset is already assigned to another station');
            }
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

        // For peripherals with serial numbers, validate the serial number
        if ($assetType === 'peripheral' && $serialNumber) {
            $peripheralSerial = PeripheralSerial::where('peripheral_id', $assetId)
                ->where('serial_number', $serialNumber)
                ->where('status', 'available')
                ->first();
                
            if (!$peripheralSerial) {
                throw new \Exception("Serial number '{$serialNumber}' is not available for this peripheral");
            }
        }

        // Check asset availability based on type
        if (!$this->isAssetAvailableForAssignment($assetType, $asset, $serialNumber)) {
            throw new \Exception('Asset is not available for assignment');
        }

        // Create new assignment
        $assignment = $this->stationAssets()->create([
            'asset_type' => $assetType,
            'asset_id' => $assetId,
            'serial_number' => $serialNumber,
            'assigned_at' => now(),
        ]);

        Log::info('Assignment created', ['assignment_id' => $assignment->id, 'assignment' => $assignment->toArray()]);

        // Update asset location based on asset type
        $this->updateAssetLocation($assetType, $assetId, $serialNumber);
        
        Log::info('Asset location updated', ['assetType' => $assetType, 'assetId' => $assetId, 'serialNumber' => $serialNumber]);
        
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
                'asset_serial' => $serialNumber ?: ($asset->serial_number ?? null)
            ]);
        }

        Log::info('Assignment completed successfully', [
            'assignment_id' => $assignment->id,
            'station_id' => $this->id,
            'asset_type' => $assetType,
            'asset_id' => $assetId,
            'serial_number' => $serialNumber,
            'final_status' => 'COMPLETED'
        ]);

        return $assignment;
    }

    public function unassignAsset($assetType, $assetId, $serialNumber = null, $reason = null, $notes = null)
    {
        // Get detailed backtrace to see what's calling this
        $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 10);
        $callerInfo = [];
        foreach ($backtrace as $index => $trace) {
            if (isset($trace['file']) && isset($trace['line'])) {
                $callerInfo[] = [
                    'file' => $trace['file'],
                    'line' => $trace['line'],
                    'function' => $trace['function'] ?? 'unknown',
                    'class' => $trace['class'] ?? null
                ];
            }
        }

        Log::info('=== UNASSIGN ASSET CALLED ===', [
            'station_id' => $this->id,
            'asset_type' => $assetType,
            'asset_id' => $assetId,
            'serial_number' => $serialNumber,
            'reason' => $reason,
            'notes' => $notes,
            'caller_stack' => $callerInfo,
            'request_url' => request()->fullUrl(),
            'request_method' => request()->method(),
            'request_ip' => request()->ip()
        ]);

        $assignment = $this->stationAssets()
            ->where('asset_type', $assetType)
            ->where('asset_id', $assetId)
            ->when($serialNumber, function($query) use ($serialNumber) {
                return $query->where('serial_number', $serialNumber);
            })
            ->whereNull('unassigned_at')
            ->first();

        if ($assignment) {
            Log::info('Found assignment to unassign', [
                'assignment_id' => $assignment->id,
                'created_at' => $assignment->created_at,
                'about_to_unassign' => true
            ]);

            $assignment->update(['unassigned_at' => now()]);
            
            // Get asset details before clearing location
            $assetModel = $this->getAssetModel($assetType, $assetId);
            $assetName = null;
            $assetSerial = $serialNumber;
            
            if ($assetModel) {
                $assetName = $assetType === 'system_unit' ? 
                    $assetModel->system_name : 
                    $assetModel->brand . ' ' . $assetModel->model;
                    
                if (!$assetSerial) {
                    $assetSerial = $assetModel->serial_number ?? null;
                }
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
                $this->updateAssetStatusByReason($assetType, $assetId, $reason, $serialNumber);
            } else {
                // Default behavior if no reason provided
                $this->clearAssetLocation($assetType, $assetId, $serialNumber);
            }

            Log::info('Unassignment completed', [
                'assignment_id' => $assignment->id,
                'unassigned_at' => $assignment->fresh()->unassigned_at
            ]);
        } else {
            Log::warning('No assignment found to unassign', [
                'station_id' => $this->id,
                'asset_type' => $assetType,
                'asset_id' => $assetId,
                'serial_number' => $serialNumber
            ]);
        }

        return $assignment;
    }

    private function updateAssetLocation($assetType, $assetId, $serialNumber = null)
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
                $asset = Peripheral::find($assetId);
                if ($asset) {
                    if ($serialNumber) {
                        Log::info('Attempting to deploy serial number', [
                            'peripheral_id' => $assetId,
                            'serial_number' => $serialNumber,
                            'station_name' => $this->name,
                            'station_id' => $this->id
                        ]);

                        // Deploy specific serial number
                        $peripheralSerial = PeripheralSerial::where('peripheral_id', $assetId)
                            ->where('serial_number', $serialNumber)
                            ->where('status', 'available')
                            ->first();

                        Log::info('Serial lookup result', [
                            'found' => $peripheralSerial ? true : false,
                            'serial_data' => $peripheralSerial ? $peripheralSerial->toArray() : null
                        ]);
                            
                        if ($peripheralSerial) {
                            Log::info('Deploying serial number', ['serial_id' => $peripheralSerial->id]);
                            $peripheralSerial->deploy($this->name, $this->id);
                            // Also update peripheral's deployed stock count
                            $asset->increment('deployed_stock');
                            $asset->decrement('available_stock');
                            Log::info('Serial deployment completed successfully');
                        } else {
                            Log::error('Serial number not found or not available', [
                                'peripheral_id' => $assetId,
                                'serial_number' => $serialNumber,
                                'all_serials_for_peripheral' => PeripheralSerial::where('peripheral_id', $assetId)->get()->toArray()
                            ]);
                            throw new \Exception("Serial number '{$serialNumber}' not found or not available");
                        }
                    } else {
                        // Deploy 1 unit of this peripheral (legacy behavior)
                        if ($asset->available_stock > 0) {
                            $asset->deployStock(1);
                        } else {
                            throw new \Exception('Peripheral has no available stock');
                        }
                    }
                }
                break;
        }
    }

    /**
     * Check if an asset is available for assignment
     * 
     * @param string $assetType
     * @param mixed $asset
     * @param string|null $serialNumber
     * @return bool
     */
    private function isAssetAvailableForAssignment($assetType, $asset, $serialNumber = null)
    {
        switch ($assetType) {
            case 'monitor':
                return $asset->status === 'working';
            case 'system_unit':
                return in_array($asset->status, ['available']);
            case 'peripheral':
                if ($serialNumber) {
                    // Check if specific serial number is available
                    $peripheralSerial = PeripheralSerial::where('peripheral_id', $asset->id)
                        ->where('serial_number', $serialNumber)
                        ->where('status', 'available')
                        ->exists();
                    return $asset->status === 'active' && $peripheralSerial;
                } else {
                    // Check if peripheral has available stock
                    return $asset->status === 'active' && $asset->available_stock > 0;
                }
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
     * @param string|null $serialNumber
     * @return void
     */
    private function updateAssetStatusByReason($assetType, $assetId, $reason, $serialNumber = null)
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
                        if ($serialNumber) {
                            $peripheralSerial = PeripheralSerial::where('peripheral_id', $assetId)
                                ->where('serial_number', $serialNumber)
                                ->first();
                            if ($peripheralSerial) {
                                $peripheralSerial->markDamaged('Damaged during station unbinding');
                                // Use the peripheral's markDamaged method for proper stock management
                                // This will move from available to damaged stock appropriately
                                $asset->decrement('deployed_stock');
                                $asset->increment('damaged_stock');
                                
                                // Keep peripheral active if it still has available stock or if it uses serial numbers
                                // Only mark as inactive if it has no available stock and doesn't use serial numbers
                                if (!$asset->uses_serial_numbers && $asset->available_stock <= 0) {
                                    $asset->update(['status' => 'inactive']);
                                }
                            }
                        } else {
                            // For peripherals without serial tracking - properly handle damaged stock
                            $asset->decrement('deployed_stock');
                            $asset->increment('damaged_stock');
                            
                            // Keep peripheral active if it still has available stock
                            if ($asset->available_stock <= 0) {
                                $asset->update(['status' => 'inactive']);
                            }
                        }
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
                        if ($serialNumber) {
                            $peripheralSerial = PeripheralSerial::where('peripheral_id', $assetId)
                                ->where('serial_number', $serialNumber)
                                ->first();
                            if ($peripheralSerial) {
                                $peripheralSerial->update([
                                    'status' => 'maintenance',
                                    'deployed_to' => null,
                                    'station_id' => null,
                                    'returned_at' => now()
                                ]);
                                // Update peripheral stock counts - move from deployed to neither available nor damaged
                                $asset->decrement('deployed_stock');
                                // Don't increment available_stock since it's in maintenance
                                
                                // Keep peripheral active if it still has available stock or if it uses serial numbers
                                // Only mark as inactive if it has no available stock and doesn't use serial numbers
                                if (!$asset->uses_serial_numbers && $asset->available_stock <= 0) {
                                    $asset->update(['status' => 'inactive']);
                                }
                            }
                        } else {
                            // For peripherals without serial tracking - move to maintenance
                            $asset->decrement('deployed_stock');
                            // Don't increment available_stock since it's under repair
                            
                            // Keep peripheral active if it still has available stock
                            if ($asset->available_stock <= 0) {
                                $asset->update(['status' => 'inactive']);
                            }
                        }
                        break;
                }
                break;
                
            case StationHistory::REASON_REPLACE_NEW:
                // Keep the current status but mark as unassigned
                $this->clearAssetLocation($assetType, $assetId, $serialNumber);
                break;
                
            default:
                // Default behavior
                $this->clearAssetLocation($assetType, $assetId, $serialNumber);
                break;
        }
    }

    private function clearAssetLocation($assetType, $assetId, $serialNumber = null)
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
                $asset = Peripheral::find($assetId);
                if ($asset) {
                    if ($serialNumber) {
                        // Return specific serial number to stock
                        $peripheralSerial = PeripheralSerial::where('peripheral_id', $assetId)
                            ->where('serial_number', $serialNumber)
                            ->where('status', 'deployed')
                            ->first();
                            
                        if ($peripheralSerial) {
                            $peripheralSerial->returnToStock();
                            // For peripherals with serial numbers, use the returnStock method
                            // which properly handles the stock counts
                            $asset->returnStock(1);
                        }
                    } else {
                        // Return 1 unit of this peripheral (legacy behavior)
                        if ($asset->deployed_stock > 0) {
                            $asset->returnStock(1);
                        }
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
                'name', 'type', 'department', 'location_id', 'assigned_user', 'ip_address', 'status'
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
