<?php

namespace App\Http\Controllers;

use App\Models\Monitor;
use App\Models\SystemUnit;
use App\Models\Peripheral;
use App\Models\Part;
use App\Models\PartDelivery;
use App\Models\PeripheralDelivery;
use App\Models\Station;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        $stats = [
            'total_monitors' => Monitor::count(),
            'total_system_units' => SystemUnit::count(),
            'total_peripherals' => Peripheral::sum('total_stock'),
            'total_parts' => Part::count(),
            'total_stations' => Station::count(),
            
            // Asset status counts - updated to match actual database values
            'active_monitors' => Monitor::whereIn('status', ['working'])->count(),
            'deployed_monitors' => Monitor::whereHas('stationAssignment')->count(), // Count monitors assigned to stations
            'maintenance_monitors' => Monitor::whereIn('status', ['under_repair'])->count(),
            
            'active_system_units' => SystemUnit::whereIn('status', ['available', 'working', 'active'])->count(),
            'deployed_system_units' => SystemUnit::whereIn('status', ['assigned', 'deployed'])->count(),
            'maintenance_system_units' => SystemUnit::whereIn('status', ['maintenance', 'under_repair', 'repair'])->count(),
            
            'available_peripherals' => Peripheral::sum('available_stock'),
            'deployed_peripherals' => Peripheral::sum('deployed_stock'),
        ];

        return response()->json($stats);
    }

    /**
     * Get assets received per month for the last 12 months
     */
    public function getAssetsReceivedPerMonth()
    {
        $months = [];
        $data = [];

        // Get last 12 months
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');
            
            // Count assets received in this month
            $monthStart = $date->startOfMonth()->toDateString();
            $monthEnd = $date->endOfMonth()->toDateString();
            
            $monitors = Monitor::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $systemUnits = SystemUnit::whereBetween('created_at', [$monthStart, $monthEnd])->count();
            $peripherals = PeripheralDelivery::whereBetween('created_at', [$monthStart, $monthEnd])->sum('quantity_delivered');
            $parts = PartDelivery::whereBetween('created_at', [$monthStart, $monthEnd])->sum('quantity_delivered');
            
            $data[] = [
                'month' => $date->format('M Y'),
                'monitors' => $monitors,
                'system_units' => $systemUnits,
                'peripherals' => $peripherals ?: 0,
                'parts' => $parts ?: 0,
                'total' => $monitors + $systemUnits + ($peripherals ?: 0) + ($parts ?: 0)
            ];
        }

        return response()->json([
            'months' => $months,
            'data' => $data
        ]);
    }

        /**
     * Get asset usage distribution (for pie chart)
     */
    public function getAssetUsage()
    {
        $usage = [
            [
                'label' => 'Monitors',
                'value' => Monitor::count(),
                'active' => Monitor::whereIn('status', ['working'])->count(),
                'deployed' => Monitor::whereHas('stationAssignment')->count(), // Count monitors assigned to stations
                'maintenance' => Monitor::whereIn('status', ['under_repair'])->count(),
            ],
            [
                'label' => 'System Units',
                'value' => SystemUnit::count(),
                'active' => SystemUnit::whereIn('status', ['available', 'working', 'active'])->count(),
                'deployed' => SystemUnit::whereIn('status', ['assigned', 'deployed'])->count(),
                'maintenance' => SystemUnit::whereIn('status', ['maintenance', 'under_repair', 'repair'])->count(),
            ],
            [
                'label' => 'Peripherals',
                'value' => Peripheral::sum('total_stock'),
                'available' => Peripheral::sum('available_stock'),
                'deployed' => Peripheral::sum('deployed_stock'),
            ],
            [
                'label' => 'Parts',
                'value' => Part::count(),
                'available' => Part::sum('available_stock'),
            ]
        ];

        return response()->json($usage);
    }

    /**
     * Get total asset value
     */
    public function getTotalAssetValue()
    {
        // Use the price field for monitors, or default to 0 if null
        $monitorValue = (float)(Monitor::sum('price') ?? 0);
        
        // Force these values to be floats
        $peripheralValue = (float)(Peripheral::sum('unit_price') ?? 0);
        $systemUnitValue = (float)(SystemUnit::sum('purchase_price') ?? 0);
        
        // Include parts inventory value
        $partsValue = (float)(Part::sum(DB::raw('unit_price * total_stock')) ?? 0);
        
        // Include devices value
        $devicesValue = (float)(Device::sum('price') ?? 0);
        
        // Calculate total value as a float
        $totalValue = (float)$monitorValue + (float)$peripheralValue + (float)$systemUnitValue + (float)$partsValue + (float)$devicesValue;
        
        // Log the values for debugging
        Log::info('Asset Values', [
            'monitors' => $monitorValue,
            'peripherals' => $peripheralValue, 
            'system_units' => $systemUnitValue,
            'parts' => $partsValue,
            'devices' => $devicesValue,
            'total' => $totalValue
        ]);
        
        return response()->json([
            'total_value' => $totalValue,
            'formatted_value' => '₱' . number_format($totalValue, 2),
            'breakdown' => [
                'monitors' => $monitorValue,
                'peripherals' => $peripheralValue,
                'system_units' => $systemUnitValue,
                'parts' => $partsValue,
                'devices' => $devicesValue
            ]
        ]);
    }

    /**
     * Get asset value per month (for line chart)
     */
    public function getAssetValuePerMonth()
    {
        $months = [];
        $values = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $months[] = $date->format('M Y');
            
            $monthEnd = $date->endOfMonth()->toDateString();
            
            // Calculate cumulative value up to this month using actual prices
            $monitorValue = Monitor::where('created_at', '<=', $monthEnd)->sum('price') ?? 0;
            
            $systemUnitValue = SystemUnit::where('created_at', '<=', $monthEnd)->sum('purchase_price') ?? 0;
            
            // For peripherals, calculate based on deliveries up to this month
            $peripheralValue = 0;
            $peripheralDeliveries = PeripheralDelivery::where('created_at', '<=', $monthEnd)
                ->with('peripheral')
                ->get();
            
            foreach ($peripheralDeliveries as $delivery) {
                if ($delivery->peripheral) {
                    $peripheralValue += ($delivery->peripheral->unit_price ?: 0) * $delivery->quantity_delivered;
                }
            }
            
            // Include devices value up to this month
            $devicesValue = Device::where('created_at', '<=', $monthEnd)->sum('price') ?? 0;
            
            // Include parts value
            $partsValue = Part::where('created_at', '<=', $monthEnd)->sum(DB::raw('unit_price * total_stock')) ?? 0;
            
            $totalValue = $monitorValue + $systemUnitValue + $peripheralValue + $devicesValue + $partsValue;
            $values[] = $totalValue;
        }

        return response()->json([
            'months' => $months,
            'values' => $values
        ]);
    }

    /**
     * Get recent transactions/activities
     */
    public function getRecentTransactions()
    {
        $transactions = [];

        // Get recent monitor activities
        $recentMonitors = Monitor::orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'brand', 'model', 'status', 'created_at', 'updated_at']);
        
        foreach ($recentMonitors as $monitor) {
            $transactions[] = [
                'date' => $monitor->created_at->format('Y-m-d'),
                'asset_name' => $monitor->brand . ' ' . $monitor->model,
                'category' => 'Monitor',
                'status' => ucfirst($monitor->status),
                'user' => 'System',
                'created_at' => $monitor->created_at
            ];
        }

        // Get recent system unit activities
        $recentSystemUnits = SystemUnit::orderBy('created_at', 'desc')
            ->limit(10)
            ->get(['id', 'brand', 'model', 'system_name', 'status', 'created_at', 'updated_at']);
        
        foreach ($recentSystemUnits as $unit) {
            $transactions[] = [
                'date' => $unit->created_at->format('Y-m-d'),
                'asset_name' => $unit->system_name ?: ($unit->brand . ' ' . $unit->model),
                'category' => 'System Unit',
                'status' => ucfirst($unit->status),
                'user' => 'System',
                'created_at' => $unit->created_at
            ];
        }

        // Get recent peripheral deliveries
        $recentPeripheralDeliveries = PeripheralDelivery::with('peripheral')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();
        
        foreach ($recentPeripheralDeliveries as $delivery) {
            if ($delivery->peripheral) { // Check if peripheral exists
                $transactions[] = [
                    'date' => $delivery->created_at->format('Y-m-d'),
                    'asset_name' => $delivery->peripheral->device_type . ' - ' . $delivery->peripheral->brand,
                    'category' => 'Peripheral',
                    'status' => 'Received',
                    'user' => 'System',
                    'created_at' => $delivery->created_at
                ];
            } else {
                // Add a generic transaction for missing peripheral
                $transactions[] = [
                    'date' => $delivery->created_at->format('Y-m-d'),
                    'asset_name' => 'Unknown Peripheral',
                    'category' => 'Peripheral',
                    'status' => 'Received',
                    'user' => 'System',
                    'created_at' => $delivery->created_at
                ];
            }
        }

        // Sort by created_at desc and limit to 15 most recent
        usort($transactions, function($a, $b) {
            return $b['created_at']->timestamp - $a['created_at']->timestamp;
        });

        $transactions = array_slice($transactions, 0, 15);

        // Remove created_at from response
        foreach ($transactions as &$transaction) {
            unset($transaction['created_at']);
        }

        return response()->json($transactions);
    }
}
