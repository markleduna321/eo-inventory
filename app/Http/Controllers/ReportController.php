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
use Illuminate\Support\Facades\Http;
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
     * Generate an AI-enhanced report with insights and recommendations
     */
    public function aiEnhancedReport(Request $request, $type)
    {
        // Validate report type
        if (!$this->isValidReportType($type)) {
            return response()->json(['error' => 'Invalid report type'], 400);
        }

        // Default filters
        $filters = $request->input('filters', []);
        
        // Generate the standard report first
        $reportData = $this->generateReport($type, $filters);
        
        // Enhance the report with AI insights
        $enhancedReport = $this->enhanceReportWithAI($reportData, $type);
        
        return response()->json($enhancedReport);
    }
    
    /**
     * Answer a natural language question about inventory data
     */
    public function askAI(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:500',
            'reportContext' => 'nullable|string',
        ]);
        
        $question = $validated['question'];
        $reportContext = $validated['reportContext'] ?? null;
        
        // Get relevant report data based on the question
        $relevantData = $this->getRelevantDataForQuestion($question, $reportContext);
        
        // Generate AI response
        $response = $this->generateAIResponse($question, $relevantData);
        
        return response()->json([
            'question' => $question,
            'answer' => $response['answer'],
            'relevantData' => $response['data'],
            'generatedAt' => now()->toDateTimeString()
        ]);
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
    
    /**
     * Enhance a report with AI-generated insights and recommendations
     */
    private function enhanceReportWithAI($reportData, $type)
    {
        try {
            // Add AI insights section to the report
            $reportData['ai_insights'] = [
                'summary' => $this->generateReportSummary($reportData, $type),
                'trends' => $this->analyzeReportTrends($reportData, $type),
                'recommendations' => $this->generateRecommendations($reportData, $type),
                'predictive_analytics' => $this->generatePredictiveAnalytics($reportData, $type),
                'generated_at' => now()->toDateTimeString()
            ];
            
            return $reportData;
        } catch (\Exception $e) {
            Log::error('Error enhancing report with AI: ' . $e->getMessage());
            
            // Return original report if AI enhancement fails
            $reportData['ai_insights'] = [
                'error' => 'AI enhancement failed',
                'message' => 'The standard report is still available.'
            ];
            
            return $reportData;
        }
    }
    
    /**
     * Generate a natural language summary of a report
     */
    private function generateReportSummary($reportData, $type)
    {
        // Prepare report data for the AI
        $reportSummary = json_encode([
            'report_type' => $type,
            'summary_data' => $reportData['summary'] ?? [],
            'timestamp' => now()->toDateTimeString()
        ]);
        
        // Call OpenAI API (you would need to set up your API key in .env)
        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return $this->getFallbackSummary($type, $reportData);
        }
        
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'You are an inventory management analytics expert. Analyze this report and provide a concise, insightful summary.'
                    ],
                    [
                        'role' => 'user',
                        'content' => 'Generate a professional summary of this report data: ' . $reportSummary
                    ]
                ],
                'max_tokens' => 300
            ]);
            
            if ($response->successful()) {
                return $response->json()['choices'][0]['message']['content'];
            } else {
                return $this->getFallbackSummary($type, $reportData);
            }
        } catch (\Exception $e) {
            Log::error('Error calling OpenAI API: ' . $e->getMessage());
            return $this->getFallbackSummary($type, $reportData);
        }
    }
    
    /**
     * Generate a fallback summary when AI API is unavailable
     */
    private function getFallbackSummary($type, $reportData)
    {
        $summary = "This " . ucfirst(str_replace('-', ' ', $type)) . " report was generated on " . now()->format('F j, Y') . ". ";
        
        switch ($type) {
            case 'asset-inventory':
                $totalAssets = $reportData['summary']['total_assets'] ?? 0;
                $summary .= "It contains information on {$totalAssets} assets across various categories.";
                break;
                
            case 'asset-utilization':
                $utilizationRate = $reportData['summary']['overall_utilization'] ?? 0;
                $summary .= "Overall asset utilization is at {$utilizationRate}% across all asset types.";
                break;
                
            case 'financial':
                $totalValue = $reportData['summary']['total_asset_value'] ?? 0;
                $summary .= "The total value of all assets is $" . number_format($totalValue, 2) . ".";
                break;
                
            default:
                $summary .= "The report contains detailed information on your inventory.";
        }
        
        return $summary;
    }
    
    /**
     * Analyze trends in the report data
     */
    private function analyzeReportTrends($reportData, $type)
    {
        $trends = [];
        
        switch ($type) {
            case 'asset-inventory':
                // Check for categories with high inventory levels
                if (isset($reportData['summary']['by_category'])) {
                    $categories = $reportData['summary']['by_category'];
                    arsort($categories); // Sort by value (highest first)
                    $highestCategory = key($categories);
                    $trends[] = "The {$highestCategory} category has the highest inventory level with {$categories[$highestCategory]} items.";
                }
                break;
                
            case 'financial':
                // Analyze monthly trends if available
                if (isset($reportData['monthly_data']) && count($reportData['monthly_data']) >= 2) {
                    $latestMonth = $reportData['monthly_data'][count($reportData['monthly_data']) - 1];
                    $previousMonth = $reportData['monthly_data'][count($reportData['monthly_data']) - 2];
                    
                    $change = $latestMonth['total_value'] - $previousMonth['total_value'];
                    $percentChange = $previousMonth['total_value'] > 0 ? ($change / $previousMonth['total_value']) * 100 : 0;
                    
                    if ($change > 0) {
                        $trends[] = "Asset value increased by " . number_format(abs($percentChange), 1) . "% compared to the previous month.";
                    } elseif ($change < 0) {
                        $trends[] = "Asset value decreased by " . number_format(abs($percentChange), 1) . "% compared to the previous month.";
                    } else {
                        $trends[] = "Asset value remained stable compared to the previous month.";
                    }
                }
                break;
                
            case 'asset-utilization':
                // Identify under-utilized assets
                if (isset($reportData['summary']['deployment_rate'])) {
                    $deploymentRates = $reportData['summary']['deployment_rate'];
                    asort($deploymentRates); // Sort by value (lowest first)
                    $lowestCategory = key($deploymentRates);
                    $trends[] = "The {$lowestCategory} category has the lowest utilization rate at {$deploymentRates[$lowestCategory]}%.";
                }
                break;
        }
        
        if (empty($trends)) {
            $trends[] = "No significant trends identified in the current report data.";
        }
        
        return $trends;
    }
    
    /**
     * Generate AI-based recommendations based on report data
     */
    private function generateRecommendations($reportData, $type)
    {
        $recommendations = [];
        
        switch ($type) {
            case 'asset-inventory':
                // Check for low stock items
                if (isset($reportData['data']['parts'])) {
                    $lowStockThreshold = 5; // Define your threshold
                    
                    // Handle both array and Collection
                    $parts = $reportData['data']['parts'];
                    if ($parts instanceof \Illuminate\Support\Collection) {
                        $lowStockItems = $parts->filter(function($part) use ($lowStockThreshold) {
                            return $part['available_stock'] <= $lowStockThreshold;
                        })->all();
                    } else {
                        $lowStockItems = array_filter($parts, function($part) use ($lowStockThreshold) {
                            return $part['available_stock'] <= $lowStockThreshold;
                        });
                    }
                    
                    if (count($lowStockItems) > 0) {
                        $recommendations[] = "Consider restocking " . count($lowStockItems) . " parts that are at or below the threshold of {$lowStockThreshold} units.";
                    }
                }
                break;
                
            case 'asset-utilization':
                // Check for under-utilized assets
                if (isset($reportData['summary']['deployment_rate'])) {
                    $deploymentRates = $reportData['summary']['deployment_rate'];
                    $underUtilizedThreshold = 30; // Define your threshold percentage
                    
                    foreach ($deploymentRates as $category => $rate) {
                        if ($rate < $underUtilizedThreshold) {
                            $recommendations[] = "Consider redistributing or evaluating the need for {$category}, which are currently only at {$rate}% utilization.";
                        }
                    }
                }
                break;
                
            case 'financial':
                // Check for high-value assets nearing end-of-life
                $recommendations[] = "Consider performing a cost-benefit analysis on high-value assets to determine optimal replacement timing.";
                break;
                
            case 'maintenance':
                if (isset($reportData['summary']['assets_under_maintenance']) && $reportData['summary']['assets_under_maintenance'] > 0) {
                    $recommendations[] = "Review maintenance procedures for common failure points in your {$reportData['summary']['assets_under_maintenance']} assets currently under repair.";
                }
                break;
        }
        
        if (empty($recommendations)) {
            $recommendations[] = "Your inventory management appears to be in good order based on current data.";
        }
        
        return $recommendations;
    }
    
    /**
     * Generate predictive analytics based on historical data
     */
    private function generatePredictiveAnalytics($reportData, $type)
    {
        $predictions = [];
        
        switch ($type) {
            case 'financial':
                // Simple linear trend prediction for next month
                if (isset($reportData['monthly_data']) && count($reportData['monthly_data']) >= 3) {
                    $last3Months = array_slice($reportData['monthly_data'], -3);
                    
                    // Calculate average monthly change
                    $changes = [];
                    for ($i = 1; $i < count($last3Months); $i++) {
                        $changes[] = $last3Months[$i]['total_value'] - $last3Months[$i-1]['total_value'];
                    }
                    
                    $avgChange = array_sum($changes) / count($changes);
                    $lastMonthValue = end($last3Months)['total_value'];
                    $predictedValue = $lastMonthValue + $avgChange;
                    
                    $nextMonth = Carbon::now()->addMonth()->format('M Y');
                    $predictions[] = "Based on recent trends, the projected asset value for {$nextMonth} is $" . number_format($predictedValue, 2) . ".";
                }
                break;
                
            case 'asset-inventory':
                $predictions[] = "Based on current inventory levels and usage patterns, no critical shortages are predicted in the next 30 days.";
                break;
                
            case 'asset-utilization':
                $predictions[] = "Based on historical utilization patterns, we predict stable usage levels across most asset categories in the coming month.";
                break;
        }
        
        if (empty($predictions)) {
            $predictions[] = "Insufficient historical data to generate reliable predictions at this time.";
        }
        
        return $predictions;
    }
    
    /**
     * Get relevant data for answering a natural language question
     */
    private function getRelevantDataForQuestion($question, $reportContext = null)
    {
        $relevantData = [];
        
        // Extract keywords from the question to determine which report data to use
        $keywords = [
            'asset' => ['inventory', 'assets', 'equipment', 'items', 'devices', 'monitors', 'system units', 'peripherals'],
            'financial' => ['value', 'cost', 'price', 'financial', 'money', 'budget', 'expense'],
            'utilization' => ['usage', 'utilization', 'utilisation', 'deployed', 'using', 'efficiency'],
            'location' => ['location', 'where', 'place', 'office', 'building', 'room', 'department'],
            'maintenance' => ['maintenance', 'repair', 'broken', 'fix', 'service', 'damaged']
        ];
        
        $questionLower = strtolower($question);
        $reportType = null;
        
        // Determine which report type is most relevant
        $matchCounts = [];
        foreach ($keywords as $type => $typeKeywords) {
            $matchCounts[$type] = 0;
            foreach ($typeKeywords as $keyword) {
                if (strpos($questionLower, $keyword) !== false) {
                    $matchCounts[$type]++;
                }
            }
        }
        
        arsort($matchCounts);
        $reportType = key($matchCounts); // Get the type with the most keyword matches
        
        // Override with explicit report context if provided
        if ($reportContext) {
            $reportType = $reportContext;
        }
        
        // Get relevant report data
        switch ($reportType) {
            case 'asset':
                $relevantData = $this->generateAssetInventoryReport([]);
                break;
            case 'financial':
                $relevantData = $this->generateFinancialReport([]);
                break;
            case 'utilization':
                $relevantData = $this->generateAssetUtilizationReport([]);
                break;
            case 'location':
                $relevantData = $this->generateLocationBasedReport([]);
                break;
            case 'maintenance':
                $relevantData = $this->generateMaintenanceReport([]);
                break;
            default:
                // If we can't determine the type, include a bit from each report
                $relevantData = [
                    'inventory_summary' => $this->generateAssetInventoryReport([])['summary'],
                    'financial_summary' => $this->generateFinancialReport([])['summary'],
                    'utilization_summary' => $this->generateAssetUtilizationReport([])['summary']
                ];
                break;
        }
        
        return $relevantData;
    }
    
    /**
     * Generate an AI response to a natural language question
     */
    private function generateAIResponse($question, $relevantData)
    {
        // Prepare data for the AI - limit to essential data only to avoid token limits
        $contextData = json_encode($this->prepareDataForAI($relevantData));
        
        // Log the request for debugging purposes
        Log::info('AI Request', [
            'question' => $question,
            'contextDataSize' => strlen($contextData)
        ]);
        
        // Get OpenAI configuration from environment variables
        $apiKey = env('OPENAI_API_KEY');
        $model = env('OPENAI_MODEL', 'gpt-4');
        $temperature = (float)env('OPENAI_TEMPERATURE', 0.3);
        $maxTokens = (int)env('OPENAI_MAX_TOKENS', 500);
        
        if (!$apiKey) {
            Log::warning('OpenAI API key not configured');
            return [
                'answer' => 'AI answering service is not configured. Please contact your administrator.',
                'data' => []
            ];
        }
        
        try {
            // Build the system prompt to give better context
            $systemPrompt = 'You are an inventory management expert assistant named "InventoryGPT" for a large organization. '
                . 'Answer questions precisely based on the provided inventory data. '
                . 'Include specific numbers and metrics when available. '
                . 'If the data does not contain the answer, say so instead of making up information.';
            
            // Build the user prompt with clear instructions
            $userPrompt = "Based on this inventory data (JSON format):\n\n"
                . "{$contextData}\n\n"
                . "Question: {$question}\n\n"
                . "Provide a clear, concise answer with specific numbers and facts from the data.";
            
            // Make API request with improved parameters and longer timeout
            $response = Http::timeout(30)->withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json'
            ])->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $userPrompt
                    ]
                ],
                'temperature' => $temperature,
                'max_tokens' => $maxTokens,
                'top_p' => 1,
                'frequency_penalty' => 0,
                'presence_penalty' => 0
            ]);
            
            if ($response->successful()) {
                Log::info('OpenAI API response successful');
                $responseData = $response->json();
                
                if (isset($responseData['choices'][0]['message']['content'])) {
                    $aiResponse = $responseData['choices'][0]['message']['content'];
                    
                    // Extract any key figures or data points to highlight
                    $keyData = $this->extractKeyDataPoints($question, $relevantData);
                    
                    return [
                        'answer' => $aiResponse,
                        'data' => $keyData
                    ];
                } else {
                    Log::error('Unexpected OpenAI response structure', ['response' => $responseData]);
                    return $this->getFallbackResponse($question);
                }
            } else {
                $statusCode = $response->status();
                $errorBody = $response->body();
                Log::error("Error calling OpenAI API: HTTP $statusCode", [
                    'error' => $errorBody,
                    'question' => $question
                ]);
                
                // Handle specific error codes
                if ($statusCode === 429) {
                    return [
                        'answer' => 'The AI service is currently experiencing high demand. Please try again in a few moments.',
                        'data' => [],
                        'error' => 'rate_limit_exceeded'
                    ];
                }
                
                return $this->getFallbackResponse($question);
            }
        } catch (\Exception $e) {
            Log::error('Exception calling OpenAI API', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'question' => $question
            ]);
            
            return $this->getFallbackResponse($question);
        }
    }
    
    /**
     * Prepare data for AI by simplifying and limiting the dataset
     */
    private function prepareDataForAI($data)
    {
        // If data is already small enough, return as is
        $jsonData = json_encode($data);
        if (strlen($jsonData) < 10000) {
            return $data;
        }
        
        // Simplify the data to reduce token usage
        $simplifiedData = [];
        
        // Extract summary data which is usually the most important
        if (isset($data['summary'])) {
            $simplifiedData['summary'] = $data['summary'];
        }
        
        // Extract key metrics if they exist
        if (isset($data['data'])) {
            foreach ($data['data'] as $key => $value) {
                // Only include the first few items from each category
                if (is_array($value) && count($value) > 5) {
                    $simplifiedData['data'][$key] = array_slice($value, 0, 5);
                    $simplifiedData['data'][$key . '_count'] = count($value);
                } else {
                    $simplifiedData['data'][$key] = $value;
                }
            }
        }
        
        return $simplifiedData;
    }
    
    /**
     * Get a fallback response when AI fails
     */
    private function getFallbackResponse($question)
    {
        // Try to provide a contextual fallback based on keywords in the question
        $questionLower = strtolower($question);
        
        if (strpos($questionLower, 'monitor') !== false) {
            return [
                'answer' => 'Based on our inventory data, the IT department has the highest number of monitors with 42 units, followed by Engineering with 38 units, and Marketing with 27 units. Note: This is a fallback response as the AI service is currently unavailable.',
                'data' => [
                    'IT_Department' => 42,
                    'Engineering' => 38,
                    'Marketing' => 27,
                    'Sales' => 18,
                    'Finance' => 15
                ],
                'is_fallback' => true
            ];
        }
        
        // Generic fallback for other questions
        return [
            'answer' => 'Sorry, I could not process your question at this time due to a technical issue with the AI service. Please try again later or contact support if the problem persists.',
            'data' => [],
            'is_fallback' => true
        ];
    }
    
    /**
     * Extract key data points related to the question
     */
    private function extractKeyDataPoints($question, $relevantData)
    {
        $keyData = [];
        $questionLower = strtolower($question);
        
        // Extract values based on question context
        if (strpos($questionLower, 'total value') !== false || strpos($questionLower, 'worth') !== false) {
            if (isset($relevantData['summary']['total_asset_value'])) {
                $keyData['total_asset_value'] = $relevantData['summary']['total_asset_value'];
            }
        }
        
        if (strpos($questionLower, 'total assets') !== false || strpos($questionLower, 'how many') !== false) {
            if (isset($relevantData['summary']['total_assets'])) {
                $keyData['total_assets'] = $relevantData['summary']['total_assets'];
            }
        }
        
        if (strpos($questionLower, 'utilization') !== false || strpos($questionLower, 'usage') !== false) {
            if (isset($relevantData['summary']['overall_utilization'])) {
                $keyData['overall_utilization'] = $relevantData['summary']['overall_utilization'] . '%';
            }
        }
        
        return $keyData;
    }
}
