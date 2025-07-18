<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class DeviceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $devices = Device::latest()->get();
            
            return response()->json([
                'success' => true,
                'data' => $devices,
                'message' => 'Devices retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve devices',
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
                'serial_number' => 'required|string|unique:devices,serial_number',
                'device_type' => 'required|string',
                'brand' => 'required|string',
                'model' => 'required|string',
                'operating_system' => 'nullable|string',
                'status' => 'required|in:Working,Defective,For Repair',
                'issued_to' => 'nullable|string',
                'received_by' => 'required|string',
            ]);

            $device = Device::create($validated);

            return response()->json([
                'success' => true,
                'data' => $device,
                'message' => 'Device created successfully'
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create device',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Device $device): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $device,
                'message' => 'Device retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Device not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Device $device): JsonResponse
    {
        try {
            $validated = $request->validate([
                'serial_number' => 'required|string|unique:devices,serial_number,' . $device->id,
                'device_type' => 'required|string',
                'brand' => 'required|string',
                'model' => 'required|string',
                'operating_system' => 'nullable|string',
                'status' => 'required|in:Working,Defective,For Repair',
                'issued_to' => 'nullable|string',
                'received_by' => 'required|string',
            ]);

            $device->update($validated);

            return response()->json([
                'success' => true,
                'data' => $device->fresh(),
                'message' => 'Device updated successfully'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update device',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Device $device): JsonResponse
    {
        try {
            $device->delete();

            return response()->json([
                'success' => true,
                'message' => 'Device deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete device',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
