<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
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
        'monitors_count'
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
            // Add other asset types as needed
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
            // Add other asset types as needed
        }
    }
}
