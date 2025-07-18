<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\Location;
use App\Models\Monitor;
use App\Models\StationAsset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

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
            'description' => 'nullable|string',
            'status' => 'in:active,inactive,maintenance',
            'assigned_monitors' => 'nullable|array',
            'assigned_monitors.*' => 'exists:monitors,id'
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
        $station->load(['location', 'stationAssets', 'monitors']);
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
            'description' => 'nullable|string',
            'status' => 'in:active,inactive,maintenance',
            'assigned_monitors' => 'nullable|array',
            'assigned_monitors.*' => 'exists:monitors,id'
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
        $monitors = Monitor::whereDoesntHave('stationAssignment')
            ->orWhereHas('stationAssignment', function ($query) {
                $query->whereNotNull('unassigned_at');
            })
            ->orderBy('brand')
            ->orderBy('model')
            ->get();

        return response()->json($monitors);
    }

    /**
     * Get locations for dropdown
     */
    public function getLocations()
    {
        $locations = Location::where('status', 'Active')
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'type', 'building', 'floor', 'room']);

        return response()->json($locations);
    }

    /**
     * Assign asset to station
     */
    public function assignAsset(Request $request, Station $station)
    {
        $validated = $request->validate([
            'asset_type' => 'required|in:monitor',
            'asset_id' => 'required|integer'
        ]);

        try {
            $assignment = $station->assignAsset($validated['asset_type'], $validated['asset_id']);
            
            return response()->json([
                'message' => 'Asset assigned successfully',
                'assignment' => $assignment
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assign asset',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Unassign asset from station
     */
    public function unassignAsset(Request $request, Station $station)
    {
        $validated = $request->validate([
            'asset_type' => 'required|in:monitor',
            'asset_id' => 'required|integer'
        ]);

        try {
            $assignment = $station->unassignAsset($validated['asset_type'], $validated['asset_id']);
            
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
}
