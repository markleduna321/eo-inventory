<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Monitor;
use App\Models\SystemUnit;
use App\Models\Peripheral;
use App\Models\Part;
use App\Models\PartDelivery;
use App\Models\PartTransaction;
use App\Models\PeripheralDelivery;
use App\Models\Station;
use App\Models\StationAsset;
use App\Models\StationHistory;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;

class ReportController extends Controller
{
    /**
     * Get a list of available reports
     */
    public function index()
    {
        $reports = [
            [
                'id' => 'asset-inventory',
                'name' => 'Asset Inventory Report',
                'description' => 'Complete list of all assets in the system',
                'type' => 'Inventory',
                'icon' => 'clipboard-document-list'
            ],
            [
                'id' => 'asset-utilization',
                'name' => 'Asset Utilization Report',
                'description' => 'Usage statistics and deployment status',
                'type' => 'Analytics',
                'icon' => 'chart-bar'
            ],
            [
                'id' => 'maintenance',
                'name' => 'Maintenance Schedule Report',
                'description' => 'Upcoming and overdue maintenance tasks',
                'type' => 'Maintenance',
                'icon' => 'wrench-screwdriver'
            ],
            [
                'id' => 'financial',
                'name' => 'Financial Summary Report',
                'description' => 'Asset values and depreciation overview',
                'type' => 'Financial',
                'icon' => 'banknotes'
            ],
            [
                'id' => 'transaction-history',
                'name' => 'Transaction History Report',
                'description' => 'Record of all asset transactions',
                'type' => 'Transaction',
                'icon' => 'receipt-percent'
            ],
            [
                'id' => 'location-based',
                'name' => 'Location-Based Inventory',
                'description' => 'Assets organized by location',
                'type' => 'Location',
                'icon' => 'map-pin'
            ]
        ];

        return response()->json(['reports' => $reports]);
    }

    /**
     * Show a report based on type
     */
    public function show(Request $request, $type)
    {
        // Validate report type
        if (!$this->isValidReportType($type)) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        // Default filters
        $filters = [];
        
        // Generate the report
        $data = $this->generateReport($type, $filters);
        
        return response()->json($data);
    }

    /**
     * Filter a report based on criteria
     */
    public function filter(Request $request, $type)
    {
        // Validate report type
        if (!$this->isValidReportType($type)) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        $validated = $request->validate([
            'filters' => 'required|array',
            'dateRange' => 'nullable|array',
        ]);

        $filters = $validated['filters'];
        $dateRange = $validated['dateRange'] ?? null;

        $startDate = null;
        $endDate = null;

        if ($dateRange && isset($dateRange['start']) && isset($dateRange['end'])) {
            $startDate = Carbon::parse($dateRange['start']);
            $endDate = Carbon::parse($dateRange['end']);
        }

        // Generate the filtered report
        $data = $this->generateReport($type, $filters, $startDate, $endDate);
        
        return response()->json($data);
    }

    /**
     * Export a report to CSV
     */
    public function export(Request $request, $type)
    {
        // Validate report type
        if (!$this->isValidReportType($type)) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        $filters = $request->query('filters', []);
        if (is_string($filters)) {
            $filters = json_decode($filters, true) ?? [];
        }
        
        // Generate the report
        $data = $this->generateReport($type, $filters);
        
        // Return CSV response
        return $this->generateCsvResponse($data, $type);
    }

    /**
     * Check if report type is valid
     */
    private function isValidReportType($type)
    {
        $validTypes = [
            'asset-inventory', 
            'asset-utilization', 
            'maintenance',
            'financial', 
            'transaction-history', 
            'location-based'
        ];
        
        return in_array($type, $validTypes);
    }

    /**
     * Generate a report based on type
     */
    private function generateReport($type, $filters, $startDate = null, $endDate = null)
    {
        switch ($type) {
            case 'asset-inventory':
                return $this->generateAssetInventoryReport($filters);
            case 'asset-utilization':
                return $this->generateAssetUtilizationReport($filters);
            case 'maintenance':
                return $this->generateMaintenanceReport($filters);
            case 'financial':
                return $this->generateFinancialReport($filters);
            case 'transaction-history':
                return $this->generateTransactionHistoryReport($filters, $startDate, $endDate);
            case 'location-based':
                return $this->generateLocationBasedReport($filters);
            default:
                return ['error' => 'Report type not supported'];
        }
    }

    /**
     * Generate a report based on type (legacy method for backwards compatibility)
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'format' => 'required|in:json,csv',
            'filters' => 'nullable|array',
            'dateRange' => 'nullable|array',
        ]);

        $type = $validated['type'];
        $format = $validated['format'];
        $filters = $validated['filters'] ?? [];
        $dateRange = $validated['dateRange'] ?? null;

        $startDate = null;
        $endDate = null;

        if ($dateRange && isset($dateRange['start']) && isset($dateRange['end'])) {
            $startDate = Carbon::parse($dateRange['start']);
            $endDate = Carbon::parse($dateRange['end']);
        }

        switch ($type) {
            case 'asset-inventory':
                $data = $this->generateAssetInventoryReport($filters);
                break;
            case 'asset-utilization':
                $data = $this->generateAssetUtilizationReport($filters);
                break;
            case 'maintenance':
                $data = $this->generateMaintenanceReport($filters);
                break;
            case 'financial':
                $data = $this->generateFinancialReport($filters);
                break;
            case 'transaction-history':
                $data = $this->generateTransactionHistoryReport($filters, $startDate, $endDate);
                break;
            case 'location-based':
                $data = $this->generateLocationBasedReport($filters);
                break;
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid report type'
                ], 400);
        }

        if ($format === 'csv') {
            return $this->generateCsvResponse($data, $type);
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'timestamp' => now()->toIso8601String(),
            'type' => $type
        ]);
    }

    /**
     * Generate asset inventory report
     */
    private function generateAssetInventoryReport($filters)
    {
        $data = [
            'monitors' => $this->getMonitorsData($filters),
            'system_units' => $this->getSystemUnitsData($filters),
            'peripherals' => $this->getPeripheralsData($filters),
            'parts' => $this->getPartsData($filters),
            'devices' => $this->getDevicesData($filters),
        ];

        return [
            'title' => 'Asset Inventory Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'total_assets' => count($data['monitors']) + count($data['system_units']) + 
                                 count($data['peripherals']) + count($data['parts']) + count($data['devices']),
                'by_category' => [
                    'monitors' => count($data['monitors']),
                    'system_units' => count($data['system_units']),
                    'peripherals' => count($data['peripherals']),
                    'parts' => count($data['parts']),
                    'devices' => count($data['devices']),
                ]
            ],
            'data' => $data
        ];
    }

    /**
     * Generate asset utilization report
     */
    private function generateAssetUtilizationReport($filters)
    {
        $monitors = Monitor::get();
        $systemUnits = SystemUnit::get();
        $peripherals = Peripheral::get();
        $devices = Device::get();

        // Calculate deployment statistics
        $monitorStats = $this->calculateDeploymentStats($monitors, 'status');
        $systemUnitStats = $this->calculateDeploymentStats($systemUnits, 'status');
        $peripheralStats = [
            'deployed' => Peripheral::sum('deployed_stock'),
            'available' => Peripheral::sum('available_stock'),
            'total' => Peripheral::sum('total_stock'),
        ];

        // Calculate utilization rates
        $totalMonitors = $monitors->count();
        $totalSystemUnits = $systemUnits->count();
        $totalPeripherals = Peripheral::sum('total_stock');
        $totalDevices = $devices->count();

        $utilizationData = [
            'monitors' => $totalMonitors > 0 ? round(($monitorStats['deployed'] / $totalMonitors) * 100, 1) : 0,
            'system_units' => $totalSystemUnits > 0 ? round(($systemUnitStats['deployed'] / $totalSystemUnits) * 100, 1) : 0,
            'peripherals' => $totalPeripherals > 0 ? round(($peripheralStats['deployed'] / $totalPeripherals) * 100, 1) : 0,
        ];

        return [
            'title' => 'Asset Utilization Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'total_assets' => $totalMonitors + $totalSystemUnits + $totalPeripherals + $totalDevices,
                'deployment_rate' => [
                    'monitors' => $utilizationData['monitors'],
                    'system_units' => $utilizationData['system_units'],
                    'peripherals' => $utilizationData['peripherals'],
                ],
                'overall_utilization' => round(
                    ($monitorStats['deployed'] + $systemUnitStats['deployed'] + $peripheralStats['deployed']) /
                    ($totalMonitors + $totalSystemUnits + $totalPeripherals) * 100,
                    1
                )
            ],
            'data' => [
                'monitors' => $monitorStats,
                'system_units' => $systemUnitStats,
                'peripherals' => $peripheralStats,
                'stations' => $this->getStationUtilizationData()
            ]
        ];
    }

    /**
     * Generate maintenance report
     */
    private function generateMaintenanceReport($filters)
    {
        // Get assets that need maintenance (example criteria)
        $needMaintenanceMonitors = Monitor::where('status', 'under_repair')->get();
        $needMaintenanceSystemUnits = SystemUnit::where('status', 'maintenance')->get();

        // Get assets that have maintenance history (implementation would depend on your maintenance tracking system)
        // This is a placeholder - you would need to adjust based on your actual data model

        return [
            'title' => 'Maintenance Schedule Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'assets_under_maintenance' => count($needMaintenanceMonitors) + count($needMaintenanceSystemUnits),
                'by_category' => [
                    'monitors' => count($needMaintenanceMonitors),
                    'system_units' => count($needMaintenanceSystemUnits)
                ]
            ],
            'data' => [
                'monitors' => $needMaintenanceMonitors->map(function ($monitor) {
                    return [
                        'id' => $monitor->id,
                        'name' => $monitor->brand . ' ' . $monitor->model,
                        'serial_number' => $monitor->serial_number,
                        'status' => $monitor->status,
                        'notes' => $monitor->notes
                    ];
                }),
                'system_units' => $needMaintenanceSystemUnits->map(function ($unit) {
                    return [
                        'id' => $unit->id,
                        'name' => $unit->brand . ' ' . $unit->model,
                        'serial_number' => $unit->serial_number,
                        'status' => $unit->status,
                        'notes' => $unit->notes
                    ];
                }),
            ]
        ];
    }

    /**
     * Generate financial report
     */
    private function generateFinancialReport($filters)
    {
        // Calculate asset values
        $monitorValue = Monitor::sum('price') ?? 0;
        $systemUnitValue = SystemUnit::sum('purchase_price') ?? 0;
        $peripheralValue = Peripheral::sum(DB::raw('unit_price * total_stock')) ?? 0;
        $partsValue = Part::sum(DB::raw('unit_price * total_stock')) ?? 0;
        $deviceValue = Device::sum('price') ?? 0;

        $totalAssetValue = $monitorValue + $systemUnitValue + $peripheralValue + $partsValue + $deviceValue;

        // Calculate monthly asset value changes (example - adjust as needed)
        $monthlyData = [];
        
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $monthEnd = $date->endOfMonth()->toDateString();
            
            $monthlyMonitorValue = Monitor::where('created_at', '<=', $monthEnd)->sum('price') ?? 0;
            $monthlySystemUnitValue = SystemUnit::where('created_at', '<=', $monthEnd)->sum('purchase_price') ?? 0;
            $monthlyDeviceValue = Device::where('created_at', '<=', $monthEnd)->sum('price') ?? 0;
            
            // For peripherals and parts, this is simplified - would need to account for stock changes
            
            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'total_value' => $monthlyMonitorValue + $monthlySystemUnitValue + $monthlyDeviceValue,
                'by_category' => [
                    'monitors' => $monthlyMonitorValue,
                    'system_units' => $monthlySystemUnitValue,
                    'devices' => $monthlyDeviceValue
                ]
            ];
        }

        return [
            'title' => 'Financial Summary Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'total_asset_value' => $totalAssetValue,
                'by_category' => [
                    'monitors' => $monitorValue,
                    'system_units' => $systemUnitValue,
                    'peripherals' => $peripheralValue,
                    'parts' => $partsValue,
                    'devices' => $deviceValue
                ]
            ],
            'monthly_data' => $monthlyData
        ];
    }

    /**
     * Generate transaction history report
     */
    private function generateTransactionHistoryReport($filters, $startDate = null, $endDate = null)
    {
        try {
            $query = PartTransaction::with(['part', 'user']);
            
            if ($startDate && $endDate) {
                $query->whereBetween('created_at', [$startDate, $endDate]);
            }
            
            if (!empty($filters['part_id'])) {
                $query->where('part_id', $filters['part_id']);
            }
            
            if (!empty($filters['transaction_type'])) {
                $query->where('transaction_type', $filters['transaction_type']);
            }
            
            $transactions = $query->orderBy('created_at', 'desc')->get();
        } catch (\Exception $e) {
            // If there's an error with PartTransaction, return empty results instead of failing
            Log::error('Error generating transaction history report: ' . $e->getMessage());
            $transactions = collect([]);
        }
        
        return [
            'title' => 'Transaction History Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'total_transactions' => $transactions->count(),
                'by_type' => [
                    'add_stock' => $transactions->where('transaction_type', 'add_stock')->count(),
                    'remove_stock' => $transactions->where('transaction_type', 'remove_stock')->count(),
                    'assign' => $transactions->where('transaction_type', 'assign')->count(),
                    'return' => $transactions->where('transaction_type', 'return')->count(),
                ],
                'date_range' => [
                    'start' => $startDate ? $startDate->toDateString() : null,
                    'end' => $endDate ? $endDate->toDateString() : null
                ]
            ],
            'data' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->created_at ? $transaction->created_at->toDateTimeString() : now()->toDateTimeString(),
                    'part' => $transaction->part ? $transaction->part->brand . ' ' . $transaction->part->model : 'Unknown Part',
                    'quantity' => $transaction->quantity,
                    'transaction_type' => $transaction->transaction_type,
                    'notes' => $transaction->notes,
                    'user' => $transaction->user ? $transaction->user->name : 'System'
                ];
            })
        ];
        
        return [
            'title' => 'Transaction History Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'total_transactions' => $transactions->count(),
                'by_type' => [
                    'in' => $transactions->where('transaction_type', 'in')->count(),
                    'out' => $transactions->where('transaction_type', 'out')->count()
                ],
                'date_range' => [
                    'start' => $startDate ? $startDate->toDateString() : null,
                    'end' => $endDate ? $endDate->toDateString() : null
                ]
            ],
            'data' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'date' => $transaction->created_at->toDateTimeString(),
                    'part' => $transaction->part ? $transaction->part->name : 'Unknown Part',
                    'quantity' => $transaction->quantity,
                    'transaction_type' => $transaction->transaction_type,
                    'notes' => $transaction->notes,
                    'user' => $transaction->user ? $transaction->user->name : 'Unknown User'
                ];
            })
        ];
    }

    /**
     * Generate location-based inventory report
     */
    private function generateLocationBasedReport($filters)
    {
        $locationGroups = [];
        
        // Get all distinct locations
        $monitorLocations = Monitor::distinct()->pluck('location')->filter();
        $systemUnitLocations = SystemUnit::distinct()->pluck('location')->filter();
        
        // Combine unique locations
        $allLocations = $monitorLocations->merge($systemUnitLocations)->unique();
        
        foreach ($allLocations as $location) {
            $monitors = Monitor::where('location', $location)->get();
            $systemUnits = SystemUnit::where('location', $location)->get();
            
            $locationGroups[$location] = [
                'name' => $location,
                'asset_count' => $monitors->count() + $systemUnits->count(),
                'assets' => [
                    'monitors' => $monitors->map(function ($monitor) {
                        return [
                            'id' => $monitor->id,
                            'name' => $monitor->brand . ' ' . $monitor->model,
                            'serial_number' => $monitor->serial_number,
                            'status' => $monitor->status
                        ];
                    }),
                    'system_units' => $systemUnits->map(function ($unit) {
                        return [
                            'id' => $unit->id,
                            'name' => $unit->brand . ' ' . $unit->model,
                            'serial_number' => $unit->serial_number,
                            'status' => $unit->status
                        ];
                    })
                ]
            ];
        }
        
        return [
            'title' => 'Location-Based Inventory Report',
            'generated' => now()->toDateTimeString(),
            'summary' => [
                'location_count' => count($locationGroups),
                'total_assets' => array_sum(array_column($locationGroups, 'asset_count'))
            ],
            'data' => array_values($locationGroups)
        ];
    }

    /**
     * Get monitors data for reports
     */
    private function getMonitorsData($filters)
    {
        $query = Monitor::query();
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['brand'])) {
            $query->where('brand', $filters['brand']);
        }
        
        if (!empty($filters['location'])) {
            $query->where('location', $filters['location']);
        }
        
        return $query->get()->map(function ($monitor) {
            return [
                'id' => $monitor->id,
                'serial_number' => $monitor->serial_number,
                'brand' => $monitor->brand,
                'model' => $monitor->model,
                'size' => $monitor->size,
                'resolution' => $monitor->resolution,
                'status' => $monitor->status,
                'location' => $monitor->location,
                'price' => $monitor->price,
                'deployment_status' => $monitor->deployment_status
            ];
        });
    }

    /**
     * Get system units data for reports
     */
    private function getSystemUnitsData($filters)
    {
        $query = SystemUnit::query();
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        if (!empty($filters['brand'])) {
            $query->where('brand', $filters['brand']);
        }
        
        if (!empty($filters['location'])) {
            $query->where('location', $filters['location']);
        }
        
        return $query->get()->map(function ($unit) {
            return [
                'id' => $unit->id,
                'serial_number' => $unit->serial_number,
                'system_name' => $unit->system_name,
                'brand' => $unit->brand,
                'model' => $unit->model,
                'unit_type' => $unit->unit_type,
                'operating_system' => $unit->operating_system,
                'status' => $unit->status,
                'location' => $unit->location,
                'purchase_price' => $unit->purchase_price
            ];
        });
    }

    /**
     * Get peripherals data for reports
     */
    private function getPeripheralsData($filters)
    {
        $query = Peripheral::with('deliveries');
        
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        return $query->get()->map(function ($peripheral) {
            return [
                'id' => $peripheral->id,
                'name' => $peripheral->name,
                'type' => $peripheral->type,
                'brand' => $peripheral->brand,
                'model' => $peripheral->model,
                'total_stock' => $peripheral->total_stock,
                'available_stock' => $peripheral->available_stock,
                'deployed_stock' => $peripheral->deployed_stock,
                'unit_price' => $peripheral->unit_price,
                'total_value' => $peripheral->unit_price * $peripheral->total_stock
            ];
        });
    }

    /**
     * Get parts data for reports
     */
    private function getPartsData($filters)
    {
        $query = Part::query();
        
        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        
        return $query->get()->map(function ($part) {
            return [
                'id' => $part->id,
                'name' => $part->name,
                'category' => $part->category,
                'part_number' => $part->part_number,
                'manufacturer' => $part->manufacturer,
                'total_stock' => $part->total_stock,
                'available_stock' => $part->available_stock,
                'unit_price' => $part->unit_price,
                'total_value' => $part->unit_price * $part->total_stock
            ];
        });
    }

    /**
     * Get devices data for reports
     */
    private function getDevicesData($filters)
    {
        $query = Device::query();
        
        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        return $query->get()->map(function ($device) {
            return [
                'id' => $device->id,
                'name' => $device->name,
                'type' => $device->type,
                'model' => $device->model,
                'serial_number' => $device->serial_number,
                'status' => $device->status,
                'price' => $device->price
            ];
        });
    }

    /**
     * Get station utilization data
     */
    private function getStationUtilizationData()
    {
        $stations = Station::withCount(['monitors', 'systemUnits'])->get();
        
        return $stations->map(function ($station) {
            return [
                'id' => $station->id,
                'name' => $station->name,
                'location' => $station->location,
                'status' => $station->status,
                'assigned_assets' => [
                    'monitors' => $station->monitors_count,
                    'system_units' => $station->system_units_count
                ]
            ];
        });
    }

    /**
     * Calculate deployment statistics for an asset collection
     */
    private function calculateDeploymentStats($collection, $statusField)
    {
        $deployed = $collection->where($statusField, 'deployed')->count();
        $available = $collection->where($statusField, 'available')->count();
        $maintenance = $collection->where($statusField, 'under_repair')->count() +
                      $collection->where($statusField, 'maintenance')->count();
        $retired = $collection->where($statusField, 'retired')->count();
        
        return [
            'deployed' => $deployed,
            'available' => $available,
            'maintenance' => $maintenance,
            'retired' => $retired,
            'total' => $collection->count()
        ];
    }

    /**
     * Generate a CSV response from report data
     */
    private function generateCsvResponse($data, $type)
    {
        // Flatten the data structure for CSV
        $csvData = [];
        $headers = [];
        
        switch ($type) {
            case 'asset-inventory':
                // Create CSV data for asset inventory
                $csvData = $this->flattenAssetInventory($data);
                break;
                
            case 'financial':
                // Create CSV data for financial report
                $csvData = $this->flattenFinancialReport($data);
                break;
                
            // Add cases for other report types
                
            default:
                // Generic CSV conversion
                $csvData = $this->convertToFlatCsv($data);
                break;
        }
        
        // Get headers from the first row keys
        if (!empty($csvData)) {
            $headers = array_keys($csvData[0]);
        }
        
        // Create CSV content
        $output = fopen('php://temp', 'r+');
        fputcsv($output, $headers);
        
        foreach ($csvData as $row) {
            fputcsv($output, $row);
        }
        
        rewind($output);
        $csv = stream_get_contents($output);
        fclose($output);
        
        // Create response
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $type . '-report-' . date('Y-m-d') . '.csv"',
        ];
        
        return Response::make($csv, 200, $headers);
    }

    /**
     * Flatten asset inventory data for CSV
     */
    private function flattenAssetInventory($data)
    {
        $flatData = [];
        
        // Add monitors
        foreach ($data['data']['monitors'] as $monitor) {
            $flatData[] = [
                'type' => 'Monitor',
                'id' => $monitor['id'],
                'serial_number' => $monitor['serial_number'],
                'brand' => $monitor['brand'],
                'model' => $monitor['model'],
                'status' => $monitor['status'],
                'location' => $monitor['location'],
                'value' => $monitor['price'] ?? 0,
                'additional_info' => 'Size: ' . $monitor['size'] . ', Resolution: ' . $monitor['resolution']
            ];
        }
        
        // Add system units
        foreach ($data['data']['system_units'] as $unit) {
            $flatData[] = [
                'type' => 'System Unit',
                'id' => $unit['id'],
                'serial_number' => $unit['serial_number'],
                'brand' => $unit['brand'],
                'model' => $unit['model'],
                'status' => $unit['status'],
                'location' => $unit['location'],
                'value' => $unit['purchase_price'] ?? 0,
                'additional_info' => 'OS: ' . $unit['operating_system'] . ', Type: ' . $unit['unit_type']
            ];
        }
        
        // Add peripherals
        foreach ($data['data']['peripherals'] as $peripheral) {
            $flatData[] = [
                'type' => 'Peripheral',
                'id' => $peripheral['id'],
                'serial_number' => 'N/A',
                'brand' => $peripheral['brand'],
                'model' => $peripheral['model'],
                'status' => 'Stock: ' . $peripheral['available_stock'] . '/' . $peripheral['total_stock'],
                'location' => 'Various',
                'value' => $peripheral['unit_price'] ?? 0,
                'additional_info' => 'Type: ' . $peripheral['type'] . ', Deployed: ' . $peripheral['deployed_stock']
            ];
        }
        
        // Add parts
        foreach ($data['data']['parts'] as $part) {
            $flatData[] = [
                'type' => 'Part',
                'id' => $part['id'],
                'serial_number' => $part['part_number'] ?? 'N/A',
                'brand' => $part['manufacturer'] ?? 'N/A',
                'model' => $part['name'],
                'status' => 'Stock: ' . $part['available_stock'] . '/' . $part['total_stock'],
                'location' => 'Inventory',
                'value' => $part['unit_price'] ?? 0,
                'additional_info' => 'Category: ' . $part['category']
            ];
        }
        
        // Add devices
        foreach ($data['data']['devices'] as $device) {
            $flatData[] = [
                'type' => 'Device',
                'id' => $device['id'],
                'serial_number' => $device['serial_number'] ?? 'N/A',
                'brand' => 'N/A',
                'model' => $device['model'],
                'status' => $device['status'],
                'location' => 'N/A',
                'value' => $device['price'] ?? 0,
                'additional_info' => 'Type: ' . $device['type'] . ', Name: ' . $device['name']
            ];
        }
        
        return $flatData;
    }

    /**
     * Flatten financial report data for CSV
     */
    private function flattenFinancialReport($data)
    {
        $flatData = [];
        
        // Add summary row
        $flatData[] = [
            'category' => 'SUMMARY',
            'total_value' => $data['summary']['total_asset_value'],
            'monitors_value' => $data['summary']['by_category']['monitors'],
            'system_units_value' => $data['summary']['by_category']['system_units'],
            'peripherals_value' => $data['summary']['by_category']['peripherals'],
            'parts_value' => $data['summary']['by_category']['parts'],
            'devices_value' => $data['summary']['by_category']['devices'],
        ];
        
        // Add monthly data
        foreach ($data['monthly_data'] as $month) {
            $flatData[] = [
                'category' => $month['month'],
                'total_value' => $month['total_value'],
                'monitors_value' => $month['by_category']['monitors'] ?? 0,
                'system_units_value' => $month['by_category']['system_units'] ?? 0,
                'peripherals_value' => 0, // Not included in monthly data
                'parts_value' => 0, // Not included in monthly data
                'devices_value' => $month['by_category']['devices'] ?? 0,
            ];
        }
        
        return $flatData;
    }

    /**
     * Generic conversion to flat CSV structure
     */
    private function convertToFlatCsv($data)
    {
        // This is a simplified implementation
        // For a real-world application, you'd want to handle nested structures better
        
        if (isset($data['data']) && is_array($data['data'])) {
            $flatData = [];
            
            // Try to flatten the first level of data
            foreach ($data['data'] as $key => $value) {
                if (is_array($value)) {
                    foreach ($value as $item) {
                        if (is_array($item)) {
                            $flatData[] = $item;
                        }
                    }
                }
            }
            
            return $flatData;
        }
        
        return [];
    }
}
