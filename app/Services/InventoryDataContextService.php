<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Monitor;
use App\Models\Peripheral;
use App\Models\SystemUnit;
use App\Models\Part;
use App\Models\PartItem;
use App\Models\OtherAsset;
use App\Models\Station;
use App\Models\Location;
use App\Models\User;
use App\Models\DeviceRequest;
use App\Models\DeviceReturn;
use App\Models\StationAsset;
use App\Models\PartTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InventoryDataContextService
{
    /**
     * Get comprehensive system data with relationships and calculations
     */
    public function getComprehensiveSystemData()
    {
        try {
            return [
                'summary' => $this->getSystemSummary(),
                'assets' => $this->getAssetData(),
                'financial' => $this->getFinancialData(),
                'locations' => $this->getLocationData(),
                'users' => $this->getUserData(),
                'requests' => $this->getRequestData(),
                'inventory_health' => $this->getInventoryHealth(),
                'relationships' => $this->getDataRelationships(),
                'trends' => $this->getTrendData(),
                'metadata' => $this->getSystemMetadata()
            ];
        } catch (\Exception $e) {
            Log::error('Failed to get comprehensive system data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return $this->getFallbackData();
        }
    }

    /**
     * Get system summary with key metrics
     */
    private function getSystemSummary()
    {
        return [
            'total_assets' => $this->getTotalAssetCount(),
            'total_value' => $this->getTotalSystemValue(),
            'active_stations' => Station::count(),
            'total_users' => User::count(),
            'pending_requests' => DeviceRequest::where('status', 'pending')->count(),
            'low_stock_parts' => $this->getLowStockPartsCount(),
            'utilization_rate' => $this->calculateUtilizationRate(),
            'last_updated' => now()->toDateTimeString()
        ];
    }

    /**
     * Get detailed asset information
     */
    private function getAssetData()
    {
        return [
            'devices' => $this->getDeviceStats(),
            'monitors' => $this->getMonitorStats(),
            'peripherals' => $this->getPeripheralStats(),
            'system_units' => $this->getSystemUnitStats(),
            'parts' => $this->getPartStats(),
            'other_assets' => $this->getOtherAssetStats()
        ];
    }

    /**
     * Get device statistics with specs and pricing
     */
    private function getDeviceStats()
    {
        $devices = Device::all();
        
        $stats = [
            'total_count' => $devices->count(),
            'total_value' => $devices->sum('price'),
            'average_price' => $devices->avg('price'),
            'by_brand' => $devices->groupBy('brand')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_value' => $group->sum('price'),
                    'average_price' => $group->avg('price'),
                    'models' => $group->pluck('model')->unique()->values()
                ];
            }),
            'by_location' => [], // Devices don't have direct location relationships yet
            'status_breakdown' => $devices->groupBy('status')->map->count(),
            'age_analysis' => $this->calculateDeviceAgeAnalysis($devices),
            'specifications' => $this->analyzeDeviceSpecs($devices)
        ];

        return $stats;
    }

    /**
     * Get monitor statistics
     */
    private function getMonitorStats()
    {
        $monitors = Monitor::with(['station.location'])->get();
        
        return [
            'total_count' => $monitors->count(),
            'total_value' => $monitors->sum('price'),
            'by_size' => $monitors->groupBy('size')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_value' => $group->sum('price'),
                    'average_price' => $group->avg('price')
                ];
            }),
            'by_brand' => $monitors->groupBy('brand')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_value' => $group->sum('price')
                ];
            }),
            'by_resolution' => $monitors->groupBy('resolution')->map->count(),
            'specifications' => $this->analyzeMonitorSpecs($monitors),
            'detailed_list' => $monitors->map(function($monitor) {
                return [
                    'serial_number' => $monitor->serial_number,
                    'brand' => $monitor->brand,
                    'model' => $monitor->model,
                    'size' => $monitor->size,
                    'resolution' => $monitor->resolution,
                    'refresh_rate' => $monitor->refresh_rate,
                    'price' => $monitor->price,
                    'status' => $monitor->status
                ];
            }),
            'by_location' => $monitors->groupBy('station.location.name')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_value' => $group->sum('price')
                ];
            })
        ];
    }

    /**
     * Get peripheral statistics
     */
    private function getPeripheralStats()
    {
        $peripherals = Peripheral::with(['serialNumbers'])->get();
        
        return [
            'total_count' => $peripherals->count(),
            'by_type' => $peripherals->groupBy('type')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'with_serials' => $group->where('uses_serial_numbers', true)->count(),
                    'available_stock' => $group->sum('available_stock')
                ];
            }),
            'stock_levels' => [
                'total_stock' => $peripherals->sum('total_stock'),
                'low_stock' => $peripherals->where('available_stock', '<=', 5)->count(),
                'out_of_stock' => $peripherals->where('available_stock', 0)->count()
            ],
            'serial_tracking' => [
                'with_serials' => $peripherals->where('uses_serial_numbers', true)->count(),
                'without_serials' => $peripherals->where('uses_serial_numbers', false)->count()
            ]
        ];
    }

    /**
     * Get system unit statistics
     */
    private function getSystemUnitStats()
    {
        $systemUnits = SystemUnit::with(['station.location', 'partItems'])->get();
        
        return [
            'total_count' => $systemUnits->count(),
            'by_cpu' => $systemUnits->groupBy('cpu')->map->count(),
            'by_ram' => $systemUnits->groupBy('ram')->map->count(),
            'by_storage' => $systemUnits->groupBy('storage')->map->count(),
            'by_location' => $systemUnits->groupBy('station.location.name')->map->count(),
            'with_parts' => $systemUnits->filter(function($unit) {
                return $unit->partItems->count() > 0;
            })->count(),
            'total_parts' => $systemUnits->sum(function($unit) {
                return $unit->partItems->count();
            }),
            'specifications' => $this->analyzeSystemUnitSpecs($systemUnits),
            'detailed_list' => $systemUnits->map(function($unit) {
                return [
                    'serial_number' => $unit->serial_number,
                    'system_name' => $unit->system_name,
                    'brand' => $unit->brand,
                    'model' => $unit->model,
                    'operating_system' => $unit->operating_system,
                    'specifications' => $unit->specifications,
                    'purchase_price' => $unit->purchase_price,
                    'status' => $unit->status
                ];
            })
        ];
    }

    /**
     * Get parts statistics
     */
    private function getPartStats()
    {
        $parts = Part::with(['items'])->get();
        $partItems = PartItem::all();
        
        return [
            'total_categories' => $parts->count(),
            'total_items' => $partItems->count(),
            'total_value' => $partItems->sum('unit_price'),
            'by_category' => $parts->map(function($part) {
                return [
                    'name' => $part->name,
                    'description' => $part->description,
                    'item_count' => $part->items->count(),
                    'total_value' => $part->items->sum('unit_price'),
                    'transaction_count' => 0 // Part transactions not implemented yet
                ];
            }),
            'stock_analysis' => [
                'low_stock' => $parts->filter(function($part) {
                    return $part->items->count() <= ($part->minimum_stock ?? 5);
                })->count(),
                'adequate_stock' => $parts->filter(function($part) {
                    return $part->items->count() > ($part->minimum_stock ?? 5);
                })->count()
            ],
            'price_ranges' => $this->analyzePartPriceRanges($partItems)
        ];
    }

    /**
     * Get other assets statistics
     */
    private function getOtherAssetStats()
    {
        $otherAssets = OtherAsset::all();
        
        return [
            'total_count' => $otherAssets->count(),
            'total_value' => $otherAssets->sum('purchase_price'),
            'by_category' => $otherAssets->groupBy('category')->map(function($group) {
                return [
                    'count' => $group->count(),
                    'total_value' => $group->sum('purchase_price'),
                    'average_price' => $group->avg('purchase_price')
                ];
            }),
            'by_condition' => $otherAssets->groupBy('condition')->map->count(),
            'by_location' => $otherAssets->groupBy('location')->map->count(),
            'specifications' => $this->analyzeOtherAssetSpecs($otherAssets),
            'detailed_list' => $otherAssets->map(function($asset) {
                return [
                    'serial_number' => $asset->serial_number,
                    'brand' => $asset->brand ?? null,
                    'model' => $asset->model ?? null,
                    'category' => $asset->category,
                    'specifications' => $asset->specifications ?? [],
                    'purchase_price' => $asset->purchase_price,
                    'condition' => $asset->condition,
                    'location' => $asset->location
                ];
            }),
            'warranty_status' => [
                'under_warranty' => $otherAssets->where('warranty_expiry', '>', now())->count(),
                'warranty_expired' => $otherAssets->where('warranty_expiry', '<=', now())->count(),
                'no_warranty_info' => $otherAssets->whereNull('warranty_expiry')->count()
            ]
        ];
    }

    /**
     * Get financial overview
     */
    private function getFinancialData()
    {
        return [
            'total_asset_value' => $this->getTotalSystemValue(),
            'value_by_category' => [
                'devices' => Device::sum('price'),
                'monitors' => Monitor::sum('price'),
                'parts' => PartItem::sum('unit_price'),
                'other_assets' => OtherAsset::sum('purchase_price')
            ],
            'depreciation_analysis' => $this->calculateDepreciationAnalysis(),
            'investment_by_year' => $this->getInvestmentByYear(),
            'cost_per_user' => $this->calculateCostPerUser(),
            'budget_utilization' => $this->calculateBudgetUtilization()
        ];
    }

    /**
     * Get location-based data
     */
    private function getLocationData()
    {
        $locations = Location::with(['stations.stationAssets'])->get();
        
        return $locations->map(function($location) {
            $stations = $location->stations;
            $totalAssets = $stations->sum(function($station) {
                return $station->stationAssets->count();
            });
            
            return [
                'name' => $location->name,
                'address' => $location->address,
                'station_count' => $stations->count(),
                'total_assets' => $totalAssets,
                'asset_value' => $this->calculateLocationAssetValue($location),
                'utilization_rate' => $this->calculateLocationUtilization($location)
            ];
        });
    }

    /**
     * Get user and assignment data
     */
    private function getUserData()
    {
        $users = User::with(['role'])->get();
        
        return [
            'total_users' => $users->count(),
            'by_role' => $users->groupBy('role.name')->map->count(),
            'active_assignments' => $this->getActiveAssignments(),
            'request_activity' => $this->getUserRequestActivity()
        ];
    }

    /**
     * Get request and return data
     */
    private function getRequestData()
    {
        return [
            'device_requests' => [
                'total' => DeviceRequest::count(),
                'by_status' => DeviceRequest::groupBy('status')->selectRaw('status, count(*) as count')->pluck('count', 'status'),
                'pending_count' => DeviceRequest::where('status', 'pending')->count(),
                'average_processing_time' => $this->calculateAverageProcessingTime()
            ],
            'device_returns' => [
                'total' => DeviceReturn::count(),
                'by_status' => [], // DeviceReturn doesn't have status column
                'recent_returns' => DeviceReturn::where('created_at', '>=', now()->subDays(30))->count()
            ]
        ];
    }

    /**
     * Get inventory health metrics
     */
    private function getInventoryHealth()
    {
        return [
            'utilization_rate' => $this->calculateUtilizationRate(),
            'stock_levels' => $this->analyzeStockLevels(),
            'maintenance_needs' => $this->identifyMaintenanceNeeds(),
            'optimization_opportunities' => $this->identifyOptimizationOpportunities()
        ];
    }

    /**
     * Get data relationships and connections
     */
    private function getDataRelationships()
    {
        return [
            'stations_with_multiple_assets' => $this->getStationsWithMultipleAssets(),
            'user_asset_assignments' => $this->getUserAssetAssignments(),
            'location_asset_distribution' => $this->getLocationAssetDistribution(),
            'brand_preference_by_location' => $this->getBrandPreferenceByLocation()
        ];
    }

    /**
     * Get trend data
     */
    private function getTrendData()
    {
        return [
            'monthly_requests' => $this->getMonthlyRequestTrends(),
            'asset_acquisition_trends' => $this->getAssetAcquisitionTrends(),
            'utilization_trends' => $this->getUtilizationTrends(),
            'cost_trends' => $this->getCostTrends()
        ];
    }

    /**
     * Get system metadata
     */
    private function getSystemMetadata()
    {
        return [
            'last_updated' => now()->toDateTimeString(),
            'data_version' => '2.0',
            'total_records' => $this->getTotalRecordCount(),
            'system_health' => 'optimal',
            'ai_context_version' => '1.0'
        ];
    }

    // Helper methods for calculations

    private function getTotalAssetCount()
    {
        return Device::count() + Monitor::count() + SystemUnit::count() + OtherAsset::count();
    }

    private function getTotalSystemValue()
    {
        return Device::sum('price') + Monitor::sum('price') + PartItem::sum('unit_price') + OtherAsset::sum('purchase_price');
    }

    private function getLowStockPartsCount()
    {
        return Part::withCount('items')
            ->having('items_count', '<=', 5)
            ->count();
    }

    private function calculateUtilizationRate()
    {
        $totalAssets = $this->getTotalAssetCount();
        $deployedAssets = StationAsset::count();
        
        return $totalAssets > 0 ? round(($deployedAssets / $totalAssets) * 100, 2) : 0;
    }

    private function calculateDeviceAgeAnalysis($devices)
    {
        $currentYear = now()->year;
        
        return [
            'new' => $devices->filter(function($device) use ($currentYear) {
                return $device->purchase_date && 
                       \Carbon\Carbon::parse($device->purchase_date)->year >= $currentYear - 1;
            })->count(),
            'recent' => $devices->filter(function($device) use ($currentYear) {
                return $device->purchase_date && 
                       \Carbon\Carbon::parse($device->purchase_date)->year >= $currentYear - 3 &&
                       \Carbon\Carbon::parse($device->purchase_date)->year < $currentYear - 1;
            })->count(),
            'older' => $devices->filter(function($device) use ($currentYear) {
                return $device->purchase_date && 
                       \Carbon\Carbon::parse($device->purchase_date)->year < $currentYear - 3;
            })->count()
        ];
    }

    private function analyzeDeviceSpecs($devices)
    {
        $specsData = [];
        
        foreach ($devices as $device) {
            if ($device->specifications) {
                $specs = is_string($device->specifications) ? 
                    json_decode($device->specifications, true) : 
                    $device->specifications;
                
                if (is_array($specs)) {
                    foreach ($specs as $key => $value) {
                        if (!isset($specsData[$key])) {
                            $specsData[$key] = [];
                        }
                        $specsData[$key][] = $value;
                    }
                }
            }
        }
        
        // Analyze common specifications
        $analysis = [];
        foreach ($specsData as $specType => $values) {
            $analysis[$specType] = [
                'common_values' => array_count_values($values),
                'unique_count' => count(array_unique($values))
            ];
        }
        
        return $analysis;
    }

    private function analyzePartPriceRanges($partItems)
    {
        $prices = $partItems->pluck('unit_price')->filter()->values();
        
        if ($prices->isEmpty()) {
            return [];
        }
        
        return [
            'min' => $prices->min(),
            'max' => $prices->max(),
            'average' => $prices->avg(),
            'median' => $prices->median(),
            'ranges' => [
                'under_100' => $prices->filter(fn($p) => $p < 100)->count(),
                '100_to_500' => $prices->filter(fn($p) => $p >= 100 && $p < 500)->count(),
                '500_to_1000' => $prices->filter(fn($p) => $p >= 500 && $p < 1000)->count(),
                'over_1000' => $prices->filter(fn($p) => $p >= 1000)->count()
            ]
        ];
    }

    private function calculateDepreciationAnalysis()
    {
        // Simplified depreciation calculation
        $currentYear = now()->year;
        $devices = Device::whereNotNull('purchase_date')->get();
        
        $depreciatedValue = 0;
        foreach ($devices as $device) {
            $age = $currentYear - \Carbon\Carbon::parse($device->purchase_date)->year;
            $depreciationRate = min(0.8, $age * 0.15); // 15% per year, max 80%
            $depreciatedValue += $device->price * (1 - $depreciationRate);
        }
        
        return [
            'original_value' => $devices->sum('price'),
            'current_estimated_value' => round($depreciatedValue, 2),
            'total_depreciation' => round($devices->sum('price') - $depreciatedValue, 2)
        ];
    }

    private function getInvestmentByYear()
    {
        $devices = Device::whereNotNull('purchase_date')->get();
        $monitors = Monitor::all();  // Monitor doesn't have purchase_date
        
        $investments = [];
        
        foreach ($devices as $device) {
            $year = \Carbon\Carbon::parse($device->purchase_date)->year;
            $investments[$year] = ($investments[$year] ?? 0) + $device->price;
        }
        
        foreach ($monitors as $monitor) {
            $year = \Carbon\Carbon::parse($monitor->purchase_date)->year;
            $investments[$year] = ($investments[$year] ?? 0) + $monitor->price;
        }
        
        ksort($investments);
        return $investments;
    }

    private function calculateCostPerUser()
    {
        $totalValue = $this->getTotalSystemValue();
        $userCount = User::count();
        
        return $userCount > 0 ? round($totalValue / $userCount, 2) : 0;
    }

    private function calculateBudgetUtilization()
    {
        // This would be based on actual budget data if available
        // For now, we'll return a placeholder
        return [
            'estimated_annual_budget' => 500000,
            'ytd_spending' => $this->getYTDSpending(),
            'utilization_percentage' => 75.5
        ];
    }

    private function getYTDSpending()
    {
        $currentYear = now()->year;
        
        $deviceSpending = Device::whereYear('purchase_date', $currentYear)->sum('price');
        $monitorSpending = 0;  // Monitor doesn't have purchase_date
        
        return $deviceSpending + $monitorSpending;
    }

    private function calculateLocationAssetValue($location)
    {
        $totalValue = 0;
        
        foreach ($location->stations as $station) {
            foreach ($station->stationAssets as $asset) {
                if ($asset->asset_type === 'device') {
                    $device = Device::find($asset->asset_id);
                    $totalValue += $device ? $device->price : 0;
                } elseif ($asset->asset_type === 'monitor') {
                    $monitor = Monitor::find($asset->asset_id);
                    $totalValue += $monitor ? $monitor->price : 0;
                }
            }
        }
        
        return $totalValue;
    }

    private function calculateLocationUtilization($location)
    {
        $totalStations = $location->stations->count();
        $occupiedStations = $location->stations->filter(function($station) {
            return $station->stationAssets->count() > 0;
        })->count();
        
        return $totalStations > 0 ? round(($occupiedStations / $totalStations) * 100, 2) : 0;
    }

    private function getActiveAssignments()
    {
        return StationAsset::count();
    }

    private function getUserRequestActivity()
    {
        return [
            'total_requests' => DeviceRequest::count(),
            'requests_last_30_days' => DeviceRequest::where('created_at', '>=', now()->subDays(30))->count(),
            'most_active_users' => DeviceRequest::select('assignee_id', DB::raw('count(*) as request_count'))
                ->groupBy('assignee_id')
                ->orderByDesc('request_count')
                ->limit(5)
                ->get()
        ];
    }

    private function calculateAverageProcessingTime()
    {
        $completedRequests = DeviceRequest::whereIn('status', ['approved', 'completed'])
            ->whereNotNull('updated_at')
            ->get();
        
        if ($completedRequests->isEmpty()) {
            return 0;
        }
        
        $totalHours = $completedRequests->sum(function($request) {
            return $request->created_at->diffInHours($request->updated_at);
        });
        
        return round($totalHours / $completedRequests->count(), 2);
    }

    private function analyzeStockLevels()
    {
        $parts = Part::with('items')->get();
        
        return [
            'critical' => $parts->filter(fn($part) => $part->items->count() <= 2)->count(),
            'low' => $parts->filter(fn($part) => $part->items->count() > 2 && $part->items->count() <= 5)->count(),
            'adequate' => $parts->filter(fn($part) => $part->items->count() > 5)->count()
        ];
    }

    private function identifyMaintenanceNeeds()
    {
        // This would be based on actual maintenance tracking
        // For now, return estimated data
        return [
            'devices_needing_maintenance' => Device::where('status', 'maintenance')->count(),
            'overdue_maintenance' => 0,
            'scheduled_maintenance' => 5
        ];
    }

    private function identifyOptimizationOpportunities()
    {
        return [
            'underutilized_locations' => $this->getUnderutilizedLocations(),
            'duplicate_assets' => $this->findDuplicateAssets(),
            'cost_optimization' => $this->getCostOptimizationSuggestions()
        ];
    }

    private function getStationsWithMultipleAssets()
    {
        return Station::withCount('stationAssets')
            ->having('station_assets_count', '>', 1)
            ->get()
            ->map(function($station) {
                return [
                    'station_name' => $station->name,
                    'asset_count' => $station->station_assets_count,
                    'location' => $station->location->name ?? 'Unknown'
                ];
            });
    }

    private function getUserAssetAssignments()
    {
        return User::withCount(['deviceRequests'])
            ->having('device_requests_count', '>', 0)
            ->get()
            ->map(function($user) {
                return [
                    'user_name' => $user->name,
                    'request_count' => $user->device_requests_count,
                    'role' => $user->role->name ?? 'No Role'
                ];
            });
    }

    private function getLocationAssetDistribution()
    {
        return Location::with(['stations.stationAssets'])->get()
            ->map(function($location) {
                $assetCount = $location->stations->sum(function($station) {
                    return $station->stationAssets->count();
                });
                
                return [
                    'location' => $location->name,
                    'asset_count' => $assetCount,
                    'station_count' => $location->stations->count()
                ];
            });
    }

    private function getBrandPreferenceByLocation()
    {
        $preferences = [];
        
        foreach (Location::with('stations.stationAssets')->get() as $location) {
            $brands = [];
            
            foreach ($location->stations as $station) {
                foreach ($station->stationAssets as $asset) {
                    if ($asset->asset_type === 'device') {
                        $device = Device::find($asset->asset_id);
                        if ($device && $device->brand) {
                            $brands[] = $device->brand;
                        }
                    }
                }
            }
            
            $preferences[$location->name] = array_count_values($brands);
        }
        
        return $preferences;
    }

    private function getMonthlyRequestTrends()
    {
        return DeviceRequest::selectRaw('YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(12)
            ->get();
    }

    private function getAssetAcquisitionTrends()
    {
        $deviceTrends = Device::selectRaw('YEAR(purchase_date) as year, COUNT(*) as count')
            ->whereNotNull('purchase_date')
            ->groupBy('year')
            ->orderBy('year', 'desc')
            ->limit(5)
            ->get();
            
        return $deviceTrends;
    }

    private function getUtilizationTrends()
    {
        // This would track utilization over time
        // For now, return current data
        return [
            'current_rate' => $this->calculateUtilizationRate(),
            'trend' => 'stable'
        ];
    }

    private function getCostTrends()
    {
        return [
            'yearly_investment' => $this->getInvestmentByYear(),
            'average_device_cost' => Device::avg('price'),
            'cost_per_user_trend' => $this->calculateCostPerUser()
        ];
    }

    private function getTotalRecordCount()
    {
        return Device::count() + Monitor::count() + Peripheral::count() + 
               SystemUnit::count() + Part::count() + OtherAsset::count() + 
               Station::count() + Location::count() + User::count();
    }

    private function getUnderutilizedLocations()
    {
        return Location::with(['stations.stationAssets'])->get()
            ->filter(function($location) {
                $utilization = $this->calculateLocationUtilization($location);
                return $utilization < 50;
            })
            ->map(function($location) {
                return [
                    'location' => $location->name,
                    'utilization' => $this->calculateLocationUtilization($location)
                ];
            });
    }

    private function findDuplicateAssets()
    {
        $duplicates = Device::select('brand', 'model', DB::raw('COUNT(*) as count'))
            ->groupBy('brand', 'model')
            ->having('count', '>', 1)
            ->get();
            
        return $duplicates->map(function($item) {
            return [
                'brand' => $item->brand,
                'model' => $item->model,
                'count' => $item->count
            ];
        });
    }

    private function getCostOptimizationSuggestions()
    {
        return [
            'bulk_purchase_opportunities' => $this->identifyBulkPurchaseOpportunities(),
            'standardization_opportunities' => $this->identifyStandardizationOpportunities(),
            'lifecycle_replacements' => $this->identifyLifecycleReplacements()
        ];
    }

    private function identifyBulkPurchaseOpportunities()
    {
        return Peripheral::where('available_stock', '<=', 5)
            ->where('type', '!=', '')
            ->groupBy('type')
            ->selectRaw('type, COUNT(*) as low_stock_count')
            ->having('low_stock_count', '>', 2)
            ->get();
    }

    private function identifyStandardizationOpportunities()
    {
        $brandCounts = Device::groupBy('brand')
            ->selectRaw('brand, COUNT(*) as count')
            ->orderByDesc('count')
            ->get();
            
        return $brandCounts->take(3);
    }

    private function identifyLifecycleReplacements()
    {
        $oldDevices = Device::whereNotNull('purchase_date')
            ->where('purchase_date', '<', now()->subYears(4))
            ->count();
            
        return [
            'devices_over_4_years' => $oldDevices,
            'estimated_replacement_cost' => $oldDevices * 1200
        ];
    }

    /**
     * Analyze SystemUnit specifications
     */
    private function analyzeSystemUnitSpecs($systemUnits)
    {
        $specs = [];
        foreach($systemUnits as $unit) {
            if ($unit->specifications && is_array($unit->specifications)) {
                foreach($unit->specifications as $key => $value) {
                    if (!isset($specs[$key])) {
                        $specs[$key] = [];
                    }
                    $specs[$key][] = $value;
                }
            }
        }
        
        return collect($specs)->map(function($values, $key) {
            return [
                'total_values' => count($values),
                'unique_values' => count(array_unique($values)),
                'most_common' => collect($values)->countBy()->sortDesc()->keys()->first()
            ];
        });
    }

    /**
     * Analyze Monitor specifications
     */
    private function analyzeMonitorSpecs($monitors)
    {
        return [
            'size_distribution' => $monitors->pluck('size')->filter()->countBy(),
            'resolution_distribution' => $monitors->pluck('resolution')->filter()->countBy(),
            'refresh_rate_distribution' => $monitors->pluck('refresh_rate')->filter()->countBy(),
            'common_combinations' => $monitors->filter(function($monitor) {
                return $monitor->size && $monitor->resolution;
            })->map(function($monitor) {
                return $monitor->size . ' - ' . $monitor->resolution;
            })->countBy()->sortDesc()
        ];
    }

    /**
     * Analyze OtherAsset specifications
     */
    private function analyzeOtherAssetSpecs($otherAssets)
    {
        $specs = [];
        foreach($otherAssets as $asset) {
            if ($asset->specifications && is_array($asset->specifications)) {
                foreach($asset->specifications as $key => $value) {
                    if (!isset($specs[$key])) {
                        $specs[$key] = [];
                    }
                    $specs[$key][] = $value;
                }
            }
        }
        
        return collect($specs)->map(function($values, $key) {
            return [
                'total_values' => count($values),
                'unique_values' => count(array_unique($values)),
                'most_common' => collect($values)->countBy()->sortDesc()->keys()->first()
            ];
        });
    }

    /**
     * Get fallback data when full data retrieval fails
     */
    private function getFallbackData()
    {
        return [
            'summary' => [
                'total_assets' => 'Unknown',
                'total_value' => 'Unknown',
                'status' => 'Data retrieval failed'
            ],
            'error' => 'Unable to retrieve comprehensive data'
        ];
    }
}
