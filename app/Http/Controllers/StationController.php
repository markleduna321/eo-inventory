<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\Location;
use App\Models\Monitor;
use App\Models\SystemUnit;
use App\Models\Peripheral;
use App\Models\StationAsset;
use App\Models\StationHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class StationController extends Controller
{
    /**
     * Display a listing of stations
     */
    public function index()
    {
        $stations = Station::with(['location', 'stationAssets'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($stations);
    }

    /**
     * Store a newly created station
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:stations,code|max:50',
            'type' => 'required|in:employee,manager,executive,hotdesk,meeting,reception,technical',
            'department' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'assigned_user' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|ip',
            'description' => 'nullable|string',
            'status' => 'in:active,inactive,maintenance',
            'assigned_monitors' => 'nullable|array',
            'assigned_monitors.*' => 'exists:monitors,id',
            'assigned_system_units' => 'nullable|array|max:1',
            'assigned_system_units.*' => 'exists:system_units,id',
            'assigned_peripherals' => 'nullable|array',
            'assigned_peripherals.*' => 'exists:peripherals,id'
        ]);

        try {
            // Create the station
            $station = Station::create($validated);

            // Assign monitors if provided
            if (isset($validated['assigned_monitors']) && !empty($validated['assigned_monitors'])) {
                foreach ($validated['assigned_monitors'] as $monitorId) {
                    try {
                        $station->assignAsset('monitor', $monitorId);
                    } catch (\Exception $e) {
                        // Log error but continue with other assignments
                        Log::warning("Failed to assign monitor {$monitorId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }

            // Assign system units if provided
            if (isset($validated['assigned_system_units']) && !empty($validated['assigned_system_units'])) {
                foreach ($validated['assigned_system_units'] as $systemUnitId) {
                    try {
                        $station->assignAsset('system_unit', $systemUnitId);
                    } catch (\Exception $e) {
                        // Log error but continue with other assignments
                        Log::warning("Failed to assign system unit {$systemUnitId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }

            // Assign peripherals if provided
            if (isset($validated['assigned_peripherals']) && !empty($validated['assigned_peripherals'])) {
                foreach ($validated['assigned_peripherals'] as $peripheralId) {
                    try {
                        $station->assignAsset('peripheral', $peripheralId);
                    } catch (\Exception $e) {
                        // Log error but continue with other assignments
                        Log::warning("Failed to assign peripheral {$peripheralId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }

            return response()->json([
                'message' => 'Station created successfully',
                'station' => $station->load(['location', 'stationAssets'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create station',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified station
     */
    public function show(Station $station)
    {
        $station->load(['location', 'stationAssets', 'monitors', 'systemUnits', 'peripherals']);
        return response()->json($station);
    }

    /**
     * Update the specified station
     */
    public function update(Request $request, Station $station)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => ['required', 'string', 'max:50', Rule::unique('stations')->ignore($station->id)],
            'type' => 'required|in:employee,manager,executive,hotdesk,meeting,reception,technical',
            'department' => 'required|string|max:255',
            'location_id' => 'required|exists:locations,id',
            'assigned_user' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|ip',
            'description' => 'nullable|string',
            'status' => 'in:active,inactive,maintenance',
            'assigned_monitors' => 'nullable|array',
            'assigned_monitors.*' => 'exists:monitors,id',
            'assigned_system_units' => 'nullable|array|max:1',
            'assigned_system_units.*' => 'exists:system_units,id',
            'assigned_peripherals' => 'nullable|array',
            'assigned_peripherals.*' => 'exists:peripherals,id'
        ]);

        try {
            // Update station basic info
            $station->update($validated);

            // Handle monitor assignments if provided
            if (isset($validated['assigned_monitors'])) {
                // Get current assignments
                $currentMonitors = $station->stationAssets()
                    ->where('asset_type', 'monitor')
                    ->whereNull('unassigned_at')
                    ->pluck('asset_id')
                    ->toArray();

                $newMonitors = $validated['assigned_monitors'];

                // Unassign monitors that are no longer assigned
                $toUnassign = array_diff($currentMonitors, $newMonitors);
                foreach ($toUnassign as $monitorId) {
                    $station->unassignAsset('monitor', $monitorId);
                }

                // Assign new monitors
                $toAssign = array_diff($newMonitors, $currentMonitors);
                foreach ($toAssign as $monitorId) {
                    try {
                        $station->assignAsset('monitor', $monitorId);
                    } catch (\Exception $e) {
                        Log::warning("Failed to assign monitor {$monitorId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }

            // Handle system unit assignments if provided
            if (isset($validated['assigned_system_units'])) {
                // Get current assignments
                $currentSystemUnits = $station->stationAssets()
                    ->where('asset_type', 'system_unit')
                    ->whereNull('unassigned_at')
                    ->pluck('asset_id')
                    ->toArray();

                $newSystemUnits = $validated['assigned_system_units'];

                // Unassign system units that are no longer assigned
                $toUnassign = array_diff($currentSystemUnits, $newSystemUnits);
                foreach ($toUnassign as $systemUnitId) {
                    $station->unassignAsset('system_unit', $systemUnitId);
                }

                // Assign new system units
                $toAssign = array_diff($newSystemUnits, $currentSystemUnits);
                foreach ($toAssign as $systemUnitId) {
                    try {
                        $station->assignAsset('system_unit', $systemUnitId);
                    } catch (\Exception $e) {
                        Log::warning("Failed to assign system unit {$systemUnitId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }

            // Handle peripheral assignments if provided
            // NOTE: Peripheral assignments are now handled via dedicated assignment API
            // This syncing logic interferes with individual peripheral assignments
            /*
            if (isset($validated['assigned_peripherals'])) {
                // Get current assignments
                $currentPeripherals = $station->stationAssets()
                    ->where('asset_type', 'peripheral')
                    ->whereNull('unassigned_at')
                    ->pluck('asset_id')
                    ->toArray();

                $newPeripherals = $validated['assigned_peripherals'];

                // Unassign peripherals that are no longer assigned
                $toUnassign = array_diff($currentPeripherals, $newPeripherals);
                foreach ($toUnassign as $peripheralId) {
                    $station->unassignAsset('peripheral', $peripheralId);
                }

                // Assign new peripherals
                $toAssign = array_diff($newPeripherals, $currentPeripherals);
                foreach ($toAssign as $peripheralId) {
                    try {
                        $station->assignAsset('peripheral', $peripheralId);
                    } catch (\Exception $e) {
                        Log::warning("Failed to assign peripheral {$peripheralId} to station {$station->id}: " . $e->getMessage());
                    }
                }
            }
            */

            return response()->json([
                'message' => 'Station updated successfully',
                'station' => $station->load(['location', 'stationAssets'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update station',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified station
     */
    public function destroy(Station $station)
    {
        try {
            // Unassign all assets before deleting
            $activeAssignments = $station->stationAssets()
                ->whereNull('unassigned_at')
                ->get();

            foreach ($activeAssignments as $assignment) {
                $station->unassignAsset($assignment->asset_type, $assignment->asset_id);
            }

            $station->delete();

            return response()->json([
                'message' => 'Station deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete station',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available monitors for assignment
     */
    public function getAvailableMonitors()
    {
        $monitors = Monitor::where('status', 'working') // Only select monitors with 'working' status
            ->where(function($query) {
                $query->whereDoesntHave('stationAssignment')
                      ->orWhereHas('stationAssignment', function ($q) {
                          $q->whereNotNull('unassigned_at');
                      });
            })
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        return response()->json($monitors);
    }

    /**
     * Get available system units for assignment
     */
    public function getAvailableSystemUnits()
    {
        $systemUnits = SystemUnit::where(function($query) {
                $query->where('status', 'available')
                      ->whereDoesntHave('stationAssignment');
            })
            ->orWhere(function($query) {
                $query->where('status', 'available')
                      ->whereHas('stationAssignment', function ($subQuery) {
                          $subQuery->whereNotNull('unassigned_at');
                      });
            })
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        return response()->json($systemUnits);
    }

    /**
     * Get available peripherals for assignment
     */
    public function getAvailablePeripherals()
    {
        $peripherals = Peripheral::where('status', 'active')
            ->where('available_stock', '>', 0)  // Only show peripherals with available stock
            ->where('uses_serial_numbers', false)  // Exclude peripherals that use serial numbers
            ->orderBy('type')
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        // Group peripherals by type and brand/model for better organization
        $groupedPeripherals = $peripherals->groupBy('type')->map(function($typeGroup) {
            return $typeGroup->groupBy(function($item) {
                return $item->brand . ' - ' . $item->model;
            })->map(function($brandModelGroup) {
                // For each brand/model group, calculate total available stock
                $firstItem = $brandModelGroup->first();
                $totalAvailable = $brandModelGroup->sum('available_stock');
                
                return [
                    'id' => $firstItem->id,
                    'type' => $firstItem->type,
                    'brand' => $firstItem->brand,
                    'model' => $firstItem->model,
                    'display_name' => $firstItem->brand . ' ' . $firstItem->model,
                    'available_stock' => $totalAvailable,
                    'items' => $brandModelGroup
                ];
            });
        });

        return response()->json([
            'grouped' => $groupedPeripherals,
            'all' => $peripherals
        ]);
    }

    /**
     * Get locations for dropdown
     */
    public function getLocations()
    {
        $locations = Location::withCount(['stations as current_stations'])
            ->where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'type', 'building', 'floor', 'room', 'capacity']);

        // Add capacity information
        $locations = $locations->map(function ($location) {
            $location->current_count = $location->current_stations;
            $location->is_full = $location->capacity > 0 && $location->current_stations >= $location->capacity;
            $location->capacity_display = $location->capacity > 0 ? "{$location->current_stations}/{$location->capacity}" : "∞";
            return $location;
        });

        return response()->json($locations);
    }

    /**
     * Assign asset to station
     */
    public function assignAsset(Request $request, Station $station)
    {
        // Handle both single asset assignment and bulk peripheral assignments
        if ($request->has('assignments') && $request->input('asset_type') === 'peripheral') {
            // Bulk peripheral assignment with serial numbers
            $validated = $request->validate([
                'asset_type' => 'required|in:peripheral',
                'assignments' => 'required|array|min:1',
                'assignments.*.peripheral_id' => 'required|integer|exists:peripherals,id',
                'assignments.*.serial_number' => 'nullable|string|max:100'
            ]);

            Log::info('Bulk peripheral assignment started', ['station_id' => $station->id, 'assignments' => $validated['assignments']]);

            $successfulAssignments = [];
            $errors = [];

            foreach ($validated['assignments'] as $assignment) {
                try {
                    Log::info('Attempting assignment', ['assignment' => $assignment]);
                    $result = $station->assignAsset(
                        'peripheral', 
                        $assignment['peripheral_id'],
                        $assignment['serial_number'] ?? null
                    );
                    Log::info('Assignment successful', ['result' => $result]);
                    $successfulAssignments[] = $result;
                } catch (\Exception $e) {
                    Log::error('Assignment failed', ['assignment' => $assignment, 'error' => $e->getMessage()]);
                    $errors[] = [
                        'peripheral_id' => $assignment['peripheral_id'],
                        'serial_number' => $assignment['serial_number'] ?? null,
                        'error' => $e->getMessage()
                    ];
                }
            }

            if (count($errors) > 0 && count($successfulAssignments) === 0) {
                return response()->json([
                    'message' => 'Failed to assign any peripherals',
                    'errors' => $errors
                ], 400);
            }

            return response()->json([
                'message' => count($successfulAssignments) . ' peripheral(s) assigned successfully' . 
                           (count($errors) > 0 ? ', ' . count($errors) . ' failed' : ''),
                'assignments' => $successfulAssignments,
                'errors' => $errors
            ]);
        } else {
            // Single asset assignment (original behavior)
            $validated = $request->validate([
                'asset_type' => 'required|in:monitor,system_unit,peripheral',
                'asset_id' => 'required|integer',
                'serial_number' => 'nullable|string|max:100' // For peripheral serial number assignment
            ]);

            try {
                $assignment = $station->assignAsset(
                    $validated['asset_type'], 
                    $validated['asset_id'],
                    $validated['serial_number'] ?? null
                );
                
                return response()->json([
                    'message' => 'Asset assigned successfully',
                    'assignment' => $assignment->load('station')
                ]);

            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Failed to assign asset',
                    'error' => $e->getMessage()
                ], 400);
            }
        }
    }

    /**
     * Unassign asset from station
     */
    public function unassignAsset(Request $request, Station $station)
    {
        $validated = $request->validate([
            'asset_type' => 'required|in:monitor,system_unit,peripheral',
            'asset_id' => 'required|integer',
            'serial_number' => 'nullable|string|max:100', // For peripheral serial number unassignment
            'unbind_reason' => 'nullable|in:' . implode(',', [
                StationHistory::REASON_DAMAGED,
                StationHistory::REASON_FOR_REPAIR,
                StationHistory::REASON_REPLACE_NEW
            ]),
            'notes' => 'nullable|string|max:255'
        ]);

        try {
            $assignment = $station->unassignAsset(
                $validated['asset_type'], 
                $validated['asset_id'],
                $validated['serial_number'] ?? null,
                $validated['unbind_reason'] ?? null, 
                $validated['notes'] ?? null
            );
            
            return response()->json([
                'message' => 'Asset unassigned successfully',
                'assignment' => $assignment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to unassign asset',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Generate QR code image for a station
     */
    public function generateQrCode(Station $station)
    {
        $qrCodeUrl = $station->getQrCodeUrl();
        $download = request()->get('download', false);
        
        $result = Builder::create()
            ->writer(new PngWriter())
            ->writerOptions([])
            ->data($qrCodeUrl)
            ->encoding(new Encoding('UTF-8'))
            ->errorCorrectionLevel(ErrorCorrectionLevel::Medium)
            ->size(300)
            ->margin(10)
            ->roundBlockSizeMode(RoundBlockSizeMode::Margin)
            ->build();

        $filename = "station_" . $station->code . "_qr.png";
        $disposition = $download ? 'attachment' : 'inline';

        return response($result->getString())
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', $disposition . '; filename="' . $filename . '"');
    }

    /**
     * Display station data from QR code scan
     */
    public function showByQrCode(string $qrCode)
    {
        $station = Station::where('qr_code', $qrCode)
            ->with(['location', 'stationAssets.monitor', 'stationAssets.systemUnit', 'stationAssets.peripheral'])
            ->firstOrFail();

        // If it's an API request, return JSON
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'id' => $station->id,
                'name' => $station->name,
                'code' => $station->code,
                'type' => $station->type,
                'department' => $station->department,
                'assigned_user' => $station->assigned_user,
                'ip_address' => $station->ip_address,
                'description' => $station->description,
                'status' => $station->status,
                'location' => $station->location,
                'assets' => [
                    'monitors' => $station->stationAssets->where('asset_type', 'monitor')
                        ->filter(function($asset) { return $asset->unassigned_at === null; })
                        ->pluck('monitor')
                        ->filter()
                        ->values(),
                    'system_units' => $station->stationAssets->where('asset_type', 'system_unit')
                        ->filter(function($asset) { return $asset->unassigned_at === null; })
                        ->pluck('systemUnit')
                        ->filter()
                        ->values(),
                    'peripherals' => $station->stationAssets->where('asset_type', 'peripheral')
                        ->filter(function($asset) { return $asset->unassigned_at === null; })
                        ->pluck('peripheral')
                        ->filter()
                        ->values()
                ]
            ]);
        }

        // For web requests, return a view with station data
        return view('stations.qr-view', compact('station'));
    }
    
    /**
     * Assign multiple peripherals to a station at once
     */
    public function assignPeripherals(Request $request, Station $station)
    {
        Log::info('=== ASSIGN PERIPHERALS API CALLED ===', [
            'station_id' => $station->id,
            'station_name' => $station->name,
            'request_data' => $request->all(),
            'user_agent' => $request->header('User-Agent'),
            'ip' => $request->ip()
        ]);
        
        $validated = $request->validate([
            'peripheral_ids' => 'required|array',
            'peripheral_ids.*' => 'exists:peripherals,id',
        ]);
        
        Log::info('Validation passed', ['validated_data' => $validated]);
        
        $successCount = 0;
        $errors = [];
        
        foreach ($validated['peripheral_ids'] as $peripheralId) {
            try {
                $peripheral = Peripheral::findOrFail($peripheralId);
                
                Log::info('Processing peripheral', [
                    'peripheral_id' => $peripheralId,
                    'brand_model' => $peripheral->brand . ' ' . $peripheral->model,
                    'available_stock' => $peripheral->available_stock,
                    'uses_serial_numbers' => $peripheral->uses_serial_numbers
                ]);
                
                // Check if the peripheral has available stock
                if ($peripheral->available_stock <= 0) {
                    $error = "Peripheral {$peripheral->brand} {$peripheral->model} is out of stock";
                    $errors[] = $error;
                    Log::warning('Peripheral out of stock', ['error' => $error]);
                    continue;
                }
                
                // Assign peripheral to station
                Log::info('About to assign peripheral to station');
                $assignment = $station->assignAsset('peripheral', $peripheralId);
                Log::info('Peripheral assigned successfully', ['assignment_id' => $assignment->id]);
                $successCount++;
                
            } catch (\Exception $e) {
                $error = $e->getMessage();
                $errors[] = $error;
                Log::error('Failed to assign peripheral', [
                    'peripheral_id' => $peripheralId,
                    'error' => $error,
                    'exception_file' => $e->getFile(),
                    'exception_line' => $e->getLine()
                ]);
            }
        }
        
        if (count($errors) > 0) {
            Log::warning('Some peripherals could not be assigned', [
                'errors' => $errors,
                'success_count' => $successCount
            ]);
            return response()->json([
                'message' => 'Some peripherals could not be assigned',
                'errors' => $errors,
                'success_count' => $successCount
            ], 422);
        }
        
        Log::info('All peripherals assigned successfully', ['success_count' => $successCount]);
        return response()->json([
            'message' => 'Peripherals assigned successfully',
            'success_count' => $successCount
        ]);
    }

    /**
     * Get available peripherals with their serial numbers for station assignment
     */
    public function getAvailablePeripheralsWithSerials()
    {
        $peripherals = Peripheral::where('status', 'active')
            ->where('available_stock', '>', 0)
            ->where('uses_serial_numbers', true)  // Only include peripherals that use serial numbers
            ->with(['serialNumbers' => function($query) {
                $query->where('status', 'available');
            }])
            ->get()
            ->map(function($peripheral) {
                return [
                    'id' => $peripheral->id,
                    'type' => $peripheral->type,
                    'brand' => $peripheral->brand,
                    'model' => $peripheral->model,
                    'description' => $peripheral->description,
                    'available_stock' => $peripheral->available_stock,
                    'uses_serial_numbers' => $peripheral->uses_serial_numbers,
                    'serial_numbers' => $peripheral->uses_serial_numbers 
                        ? $peripheral->serialNumbers->map(function($serial) {
                            return [
                                'id' => $serial->id,
                                'serial_number' => $serial->serial_number,
                                'unit_price' => $serial->unit_price,
                                'status' => $serial->status
                            ];
                        })
                        : []
                ];
            });

        return response()->json($peripherals);
    }
}
