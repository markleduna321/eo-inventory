<?php

namespace App\Http\Controllers;

use App\Models\Monitor;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class MonitorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $monitors = Monitor::with(['station', 'stationAssignment'])
                ->orderBy('created_at', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $monitors,
                'message' => 'Monitors retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve monitors: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'serial_number' => 'required|string|unique:monitors,serial_number|max:255',
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'size' => 'required|string|max:10',
                'resolution' => 'required|string|max:20',
                'refresh_rate' => 'nullable|integer|min:30|max:500',
                'status' => 'required|in:working,not_working,under_repair,retired',
                'location' => 'required|string|max:255',
                'received_by' => 'required|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ]);

            $monitor = Monitor::create($validated);

            return response()->json([
                'success' => true,
                'data' => $monitor,
                'message' => 'Monitor created successfully'
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
                'message' => 'Failed to create monitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $monitor = Monitor::findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $monitor,
                'message' => 'Monitor retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Monitor not found'
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $monitor = Monitor::findOrFail($id);
            
            $validated = $request->validate([
                'serial_number' => 'required|string|max:255|unique:monitors,serial_number,' . $id,
                'brand' => 'required|string|max:255',
                'model' => 'required|string|max:255',
                'size' => 'required|string|max:10',
                'resolution' => 'required|string|max:20',
                'refresh_rate' => 'nullable|integer|min:30|max:500',
                'status' => 'required|in:working,not_working,under_repair,retired',
                'location' => 'required|string|max:255',
                'received_by' => 'required|string|max:255',
                'notes' => 'nullable|string|max:1000',
            ]);

            $monitor->update($validated);

            return response()->json([
                'success' => true,
                'data' => $monitor,
                'message' => 'Monitor updated successfully'
            ], 200);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update monitor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $monitor = Monitor::findOrFail($id);
            $monitor->delete();

            return response()->json([
                'success' => true,
                'message' => 'Monitor deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete monitor: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Generate QR code for a monitor
     */
    public function generateQrCode(Monitor $monitor)
    {
        $qrCodeUrl = $monitor->getQrCodeUrl();
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

        $filename = "monitor_" . $monitor->serial_number . "_qr.png";
        $disposition = $download ? 'attachment' : 'inline';

        return response($result->getString())
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', $disposition . '; filename="' . $filename . '"');
    }

    /**
     * Display monitor data from QR code scan
     */
    public function showByQrCode(string $qrCode)
    {
        $monitor = Monitor::where('qr_code', $qrCode)
            ->with(['station'])
            ->firstOrFail();

        // If it's an API request, return JSON
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'id' => $monitor->id,
                'serial_number' => $monitor->serial_number,
                'brand' => $monitor->brand,
                'model' => $monitor->model,
                'size' => $monitor->size,
                'resolution' => $monitor->resolution,
                'refresh_rate' => $monitor->refresh_rate,
                'status' => $monitor->status,
                'location' => $monitor->location,
                'received_by' => $monitor->received_by,
                'notes' => $monitor->notes,
                'created_at' => $monitor->created_at,
                'updated_at' => $monitor->updated_at,
                'station_id' => $monitor->station_id,
                'deployment_status' => $monitor->deployment_status,
                'is_deployed' => $monitor->is_deployed,
                'station_name' => $monitor->station_name,
                'deployment_info' => $monitor->deployment_info,
                'qr_code' => $monitor->qr_code
            ]);
        }

        // For web view
        return view('monitor-details', ['monitor' => $monitor]);
    }
}
