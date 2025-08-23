<?php

namespace App\Http\Controllers;

use App\Models\Peripheral;
use App\Models\PeripheralDelivery;
use App\Models\PeripheralSerial;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class PeripheralController extends Controller
{
    public function index()
    {
        $peripherals = Peripheral::with(['deliveries', 'serialNumbers'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($peripherals);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'initial_stock' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'received_by' => 'required|string|max:255',
            'uses_serial_numbers' => 'boolean',
            // Delivery information for initial stock
            'supplier' => 'nullable|string|max:255',
            'purchase_order' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'delivery_date' => 'required|date',
            'delivery_notes' => 'nullable|string',
        ]);

        $peripheral = Peripheral::create([
            'type' => $validated['type'],
            'brand' => $validated['brand'],
            'model' => $validated['model'],
            'description' => $validated['description'],
            'total_stock' => $validated['initial_stock'],
            'available_stock' => $validated['initial_stock'],
            'unit_price' => $validated['unit_price'] ?? null,
            'location' => $validated['location'],
            'uses_serial_numbers' => $validated['uses_serial_numbers'] ?? false,
            'notes' => $validated['notes'],
            'received_by' => $validated['received_by'],
        ]);

        // Create initial delivery record
        if ($validated['initial_stock'] > 0) {
            $peripheral->deliveries()->create([
                'quantity_delivered' => $validated['initial_stock'],
                'unit_price' => $validated['unit_price'] ?? null,
                'supplier' => $validated['supplier'],
                'purchase_order' => $validated['purchase_order'],
                'invoice_number' => $validated['invoice_number'],
                'delivery_date' => $validated['delivery_date'],
                'received_by' => $validated['received_by'],
                'notes' => $validated['delivery_notes'],
                'delivery_status' => 'received',
            ]);
        }

        return response()->json($peripheral->load('deliveries'), 201);
    }

    public function show(Peripheral $peripheral)
    {
        return response()->json($peripheral->load(['deliveries', 'serialNumbers']));
    }

    public function update(Request $request, Peripheral $peripheral)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'required|string|max:255',
            'status' => 'required|in:active,discontinued',
            'notes' => 'nullable|string',
        ]);

        $peripheral->update($validated);

        return response()->json($peripheral->load('deliveries'));
    }

    public function destroy(Peripheral $peripheral)
    {
        $peripheral->delete();
        return response()->json(['message' => 'Peripheral deleted successfully']);
    }

    // Stock management methods
    public function addStock(Request $request, Peripheral $peripheral)
    {
        // Debug log the incoming request
        Log::info('Add stock request received', [
            'peripheral_id' => $peripheral->id,
            'request_data' => $request->all()
        ]);

        // Determine if this specific stock addition should use serial numbers
        // This is based on the frontend checkbox, not the peripheral's current setting
        $useSerialForThisAddition = $request->boolean('has_serial_numbers');
        
        try {
            $validated = $request->validate([
                'quantity' => $useSerialForThisAddition ? 'nullable|integer|min:1' : 'required|integer|min:1',
                'unit_price' => 'nullable|numeric|min:0',
                'supplier' => 'nullable|string|max:255',
                'purchase_order' => 'nullable|string|max:255',
                'invoice_number' => 'nullable|string|max:255',
                'delivery_date' => 'required|date',
                'received_by' => 'required|string|max:255',
                'notes' => 'nullable|string',
                'has_serial_numbers' => 'boolean',
                'serial_numbers' => $useSerialForThisAddition ? 'required|array|min:1' : 'nullable|array',
                'serial_numbers.*' => $useSerialForThisAddition ? 'required|string|distinct' : 'nullable|string',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validation failed', ['errors' => $e->errors()]);
            throw $e;
        }

        Log::info('Validation passed', ['validated_data' => $validated]);

        // Handle serial numbers if this addition uses them
        if ($useSerialForThisAddition && isset($validated['serial_numbers']) && is_array($validated['serial_numbers'])) {
            foreach ($validated['serial_numbers'] as $serialNumber) {
                if (PeripheralSerial::where('serial_number', $serialNumber)->exists()) {
                    return response()->json([
                        'message' => "Serial number '{$serialNumber}' already exists in the system."
                    ], 422);
                }
            }
            
            $validated['quantity'] = count(array_filter($validated['serial_numbers']));
        }

        // Create delivery record
        $delivery = $peripheral->deliveries()->create([
            'quantity_delivered' => $validated['quantity'],
            'unit_price' => $validated['unit_price'] ?? null,
            'supplier' => $validated['supplier'],
            'purchase_order' => $validated['purchase_order'],
            'invoice_number' => $validated['invoice_number'],
            'delivery_date' => $validated['delivery_date'],
            'received_by' => $validated['received_by'],
            'notes' => $validated['notes'],
        ]);

        // Update peripheral stock
        $peripheral->increment('total_stock', $validated['quantity']);
        $peripheral->increment('available_stock', $validated['quantity']);
        
        // Mark peripheral as using serial numbers if this addition uses them (only after successful delivery)
        if ($useSerialForThisAddition && !$peripheral->uses_serial_numbers) {
            $peripheral->update(['uses_serial_numbers' => true]);
        }

        // If serial numbers are provided, create individual serial records
        if ($useSerialForThisAddition && isset($validated['serial_numbers']) && is_array($validated['serial_numbers'])) {
            foreach (array_filter($validated['serial_numbers']) as $serialNumber) {
                $peripheral->serialNumbers()->create([
                    'serial_number' => $serialNumber,
                    'unit_price' => $validated['unit_price'] ?? null,
                    'status' => 'available',
                    'delivery_date' => $validated['delivery_date'],
                    'delivery_id' => $delivery->id,
                ]);
            }
        }

        return response()->json($peripheral->fresh()->load(['deliveries', 'serialNumbers']));
    }

    public function deployStock(Request $request, Peripheral $peripheral)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'station_id' => 'nullable|exists:stations,id',
            'deployed_to' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if ($peripheral->deployStock($validated['quantity'])) {
            // If station_id is provided, assign peripheral to station
            if (!empty($validated['station_id'])) {
                $station = \App\Models\Station::find($validated['station_id']);
                try {
                    $station->assignAsset('peripheral', $peripheral->id);
                } catch (\Exception $e) {
                    // Log the error but don't fail the deployment
                    Log::warning('Failed to assign peripheral to station during deployment: ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Stock deployed successfully']);
        }

        return response()->json(['message' => 'Insufficient stock available'], 400);
    }

    public function returnStock(Request $request, Peripheral $peripheral)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'station_id' => 'nullable|exists:stations,id',
            'notes' => 'nullable|string',
        ]);

        if ($peripheral->returnStock($validated['quantity'])) {
            // If station_id is provided, unassign peripheral from station
            if (!empty($validated['station_id'])) {
                $station = \App\Models\Station::find($validated['station_id']);
                try {
                    $station->unassignAsset('peripheral', $peripheral->id);
                } catch (\Exception $e) {
                    // Log the error but don't fail the return
                    Log::warning('Failed to unassign peripheral from station during return: ' . $e->getMessage());
                }
            }

            return response()->json(['message' => 'Stock returned successfully']);
        }

        return response()->json(['message' => 'Invalid return quantity'], 400);
    }

    public function markDamaged(Request $request, Peripheral $peripheral)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string',
        ]);

        if ($peripheral->markDamaged($validated['quantity'])) {
            return response()->json(['message' => 'Stock marked as damaged']);
        }

        return response()->json(['message' => 'Insufficient stock available'], 400);
    }

    // Get delivery history
    public function deliveryHistory(Peripheral $peripheral)
    {
        $deliveries = $peripheral->deliveries()
            ->orderBy('delivery_date', 'desc')
            ->get();

        return response()->json($deliveries);
    }
}
