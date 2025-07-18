<?php

namespace App\Http\Controllers;

use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class LocationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $locations = Location::orderBy('created_at', 'desc')->get();

            // Add computed fields without relationships for now
            $locations = $locations->map(function ($location) {
                $location->utilization_percentage = $location->utilization_percentage;
                $location->full_address = $location->full_address;
                return $location;
            });

            return response()->json([
                'success' => true,
                'data' => $locations,
                'message' => 'Locations retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve locations',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'code' => 'required|string|max:50|unique:locations,code',
                'type' => 'required|in:Office,Conference,Storage,Data Center,Laboratory,Workshop,Other',
                'building' => 'required|string|max:255',
                'floor' => 'required|string|max:100',
                'room' => 'required|string|max:100',
                'capacity' => 'required|integer|min:1',
                'manager' => 'nullable|string|max:255',
                'status' => 'nullable|in:Active,Inactive,Under Maintenance',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|array',
                'contact_info.phone' => 'nullable|string|max:20',
                'contact_info.email' => 'nullable|email|max:255',
                'contact_info.extension' => 'nullable|string|max:10'
            ]);

            $location = Location::create($validated);

            return response()->json([
                'success' => true,
                'data' => $location,
                'message' => 'Location created successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $location = Location::findOrFail($id);
            
            // Add computed fields without relationships for now
            $location->utilization_percentage = $location->utilization_percentage;
            $location->full_address = $location->full_address;

            return response()->json([
                'success' => true,
                'data' => $location,
                'message' => 'Location retrieved successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            $location = Location::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'code' => ['sometimes', 'required', 'string', 'max:50', Rule::unique('locations')->ignore($location->id)],
                'type' => 'sometimes|required|in:Office,Conference,Storage,Data Center,Laboratory,Workshop,Other',
                'building' => 'sometimes|required|string|max:255',
                'floor' => 'sometimes|required|string|max:100',
                'room' => 'sometimes|required|string|max:100',
                'capacity' => 'sometimes|required|integer|min:1',
                'current_items' => 'sometimes|integer|min:0',
                'manager' => 'nullable|string|max:255',
                'status' => 'sometimes|in:Active,Inactive,Under Maintenance',
                'description' => 'nullable|string',
                'contact_info' => 'nullable|array',
                'contact_info.phone' => 'nullable|string|max:20',
                'contact_info.email' => 'nullable|email|max:255',
                'contact_info.extension' => 'nullable|string|max:10'
            ]);

            $location->update($validated);

            return response()->json([
                'success' => true,
                'data' => $location->fresh(),
                'message' => 'Location updated successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $location = Location::findOrFail($id);
            
            // For now, just check if current_items > 0
            if ($location->current_items > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "Cannot delete location. It has {$location->current_items} items assigned to it."
                ], 409);
            }

            $location->delete();

            return response()->json([
                'success' => true,
                'message' => 'Location deleted successfully'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Location not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete location',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get location statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_locations' => Location::count(),
                'active_locations' => Location::where('status', 'Active')->count(),
                'inactive_locations' => Location::where('status', 'Inactive')->count(),
                'under_maintenance' => Location::where('status', 'Under Maintenance')->count(),
                'by_type' => Location::selectRaw('type, COUNT(*) as count')
                    ->groupBy('type')
                    ->pluck('count', 'type'),
                'utilization' => [
                    'total_capacity' => Location::sum('capacity'),
                    'total_items' => Location::sum('current_items'),
                    'average_utilization' => Location::whereRaw('capacity > 0')
                        ->selectRaw('AVG((current_items / capacity) * 100) as avg_util')
                        ->value('avg_util') ?? 0
                ]
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
