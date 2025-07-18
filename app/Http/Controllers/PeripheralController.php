<?php

namespace App\Http\Controllers;

use App\Models\Peripheral;
use App\Models\PeripheralDelivery;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class PeripheralController extends Controller
{
    public function index()
    {
        $peripherals = Peripheral::with('deliveries')
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
            'unit_price' => $validated['unit_price'],
            'location' => $validated['location'],
            'notes' => $validated['notes'],
            'received_by' => $validated['received_by'],
        ]);

        // Create initial delivery record
        if ($validated['initial_stock'] > 0) {
            $peripheral->deliveries()->create([
                'quantity_delivered' => $validated['initial_stock'],
                'unit_price' => $validated['unit_price'],
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
        return response()->json($peripheral->load('deliveries'));
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
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_order' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'delivery_date' => 'required|date',
            'received_by' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $peripheral->addStock($validated['quantity'], $validated);

        return response()->json($peripheral->fresh()->load('deliveries'));
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
