<?php

namespace App\Http\Controllers;

use App\Models\Part;
use App\Models\PartDelivery;
use App\Models\PartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartController extends Controller
{
    /**
     * Display a listing of parts.
     */
    public function index()
    {
        $parts = Part::with(['deliveries', 'items'])
            ->withCount(['items', 'availableItems', 'assignedItems'])
            ->get();

        return response()->json($parts);
    }

    /**
     * Store a newly created part.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'location' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'received_by' => 'required|string|max:255',
            // Initial delivery information
            'initial_stock' => 'required|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_order' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'delivery_date' => 'required|date',
            'delivery_notes' => 'nullable|string',
            // Individual items data
            'items' => 'nullable|array',
            'items.*.serial_number' => 'nullable|string|unique:part_items,serial_number',
            'items.*.barcode' => 'nullable|string|unique:part_items,barcode',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.supplier' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($validated) {
            // Create the part
            $part = Part::create([
                'type' => $validated['type'],
                'brand' => $validated['brand'],
                'model' => $validated['model'],
                'description' => $validated['description'],
                'specifications' => $validated['specifications'] ?? [],
                'location' => $validated['location'],
                'total_stock' => $validated['initial_stock'],
                'available_stock' => $validated['initial_stock'],
                'unit_price' => $validated['unit_price'],
                'notes' => $validated['notes'],
                'received_by' => $validated['received_by'],
            ]);

            // Create initial delivery record
            if ($validated['initial_stock'] > 0) {
                $delivery = $part->deliveries()->create([
                    'quantity_delivered' => $validated['initial_stock'],
                    'unit_price' => $validated['unit_price'],
                    'supplier' => $validated['supplier'],
                    'purchase_order' => $validated['purchase_order'],
                    'invoice_number' => $validated['invoice_number'],
                    'delivery_date' => $validated['delivery_date'],
                    'notes' => $validated['delivery_notes'],
                    'received_by' => $validated['received_by'],
                    'delivery_status' => 'received',
                ]);

                // Create individual items if provided
                if (isset($validated['items'])) {
                    foreach ($validated['items'] as $itemData) {
                        $part->items()->create([
                            'part_delivery_id' => $delivery->id,
                            'serial_number' => $itemData['serial_number'] ?? null,
                            'barcode' => $itemData['barcode'] ?? null,
                            'unit_price' => $itemData['unit_price'] ?? $validated['unit_price'],
                            'supplier' => $itemData['supplier'] ?? $validated['supplier'],
                            'status' => 'available',
                            'location' => $part->location,
                        ]);
                    }
                } else {
                    // Create generic items for the quantity
                    for ($i = 0; $i < $validated['initial_stock']; $i++) {
                        $part->items()->create([
                            'part_delivery_id' => $delivery->id,
                            'unit_price' => $validated['unit_price'],
                            'supplier' => $validated['supplier'],
                            'status' => 'available',
                            'location' => $part->location,
                        ]);
                    }
                }
            }

            return response()->json($part->load(['deliveries', 'items']), 201);
        });
    }

    /**
     * Display the specified part.
     */
    public function show(Part $part)
    {
        return response()->json($part->load(['deliveries.items', 'items']));
    }

    /**
     * Update the specified part.
     */
    public function update(Request $request, Part $part)
    {
        $validated = $request->validate([
            'type' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'description' => 'nullable|string',
            'specifications' => 'nullable|array',
            'location' => 'required|string|max:255',
            'unit_price' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $part->update($validated);

        return response()->json($part->load(['deliveries', 'items']));
    }

    /**
     * Remove the specified part.
     */
    public function destroy(Part $part)
    {
        $part->delete();
        return response()->json(['message' => 'Part deleted successfully']);
    }

    /**
     * Add stock to a part via delivery.
     */
    public function addStock(Request $request, Part $part)
    {
        $validated = $request->validate([
            'quantity_delivered' => 'required|integer|min:1',
            'unit_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_order' => 'nullable|string|max:255',
            'invoice_number' => 'nullable|string|max:255',
            'delivery_date' => 'required|date',
            'notes' => 'nullable|string',
            'received_by' => 'required|string|max:255',
            // Individual items data
            'items' => 'nullable|array',
            'items.*.serial_number' => 'nullable|string|unique:part_items,serial_number',
            'items.*.barcode' => 'nullable|string|unique:part_items,barcode',
            'items.*.unit_price' => 'nullable|numeric|min:0',
            'items.*.supplier' => 'nullable|string|max:255',
        ]);

        return DB::transaction(function () use ($part, $validated) {
            // Create delivery record
            $delivery = $part->deliveries()->create($validated);

            // Update part stock
            $part->increment('total_stock', $validated['quantity_delivered']);
            $part->increment('available_stock', $validated['quantity_delivered']);

            // Create individual items
            if (isset($validated['items'])) {
                foreach ($validated['items'] as $itemData) {
                    $part->items()->create([
                        'part_delivery_id' => $delivery->id,
                        'serial_number' => $itemData['serial_number'] ?? null,
                        'barcode' => $itemData['barcode'] ?? null,
                        'unit_price' => $itemData['unit_price'] ?? $validated['unit_price'],
                        'supplier' => $itemData['supplier'] ?? $validated['supplier'],
                        'status' => 'available',
                        'location' => $part->location,
                    ]);
                }
            } else {
                // Create generic items for the quantity
                for ($i = 0; $i < $validated['quantity_delivered']; $i++) {
                    $part->items()->create([
                        'part_delivery_id' => $delivery->id,
                        'unit_price' => $validated['unit_price'],
                        'supplier' => $validated['supplier'],
                        'status' => 'available',
                        'location' => $part->location,
                    ]);
                }
            }

            return response()->json($part->load(['deliveries', 'items']), 201);
        });
    }

    /**
     * Assign a part item to someone/something.
     */
    public function assignItem(Request $request, Part $part, PartItem $item)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|string|max:255',
            'assigned_date' => 'required|date',
            'condition_notes' => 'nullable|string',
            'location' => 'nullable|string|max:255',
        ]);

        if ($item->status !== 'available') {
            return response()->json(['error' => 'Item is not available for assignment'], 400);
        }

        $item->update([
            'status' => 'assigned',
            'assigned_to' => $validated['assigned_to'],
            'assigned_date' => $validated['assigned_date'],
            'condition_notes' => $validated['condition_notes'],
            'location' => $validated['location'] ?? $item->location,
        ]);

        // Update part available stock
        $part->decrement('available_stock');

        return response()->json($item->load(['part', 'delivery']));
    }

    /**
     * Return an assigned item back to available.
     */
    public function returnItem(Request $request, Part $part, PartItem $item)
    {
        $validated = $request->validate([
            'condition_notes' => 'nullable|string',
            'location' => 'nullable|string|max:255',
        ]);

        if ($item->status !== 'assigned') {
            return response()->json(['error' => 'Item is not currently assigned'], 400);
        }

        $item->update([
            'status' => 'available',
            'assigned_to' => null,
            'assigned_date' => null,
            'condition_notes' => $validated['condition_notes'],
            'location' => $validated['location'] ?? $part->location,
        ]);

        // Update part available stock
        $part->increment('available_stock');

        return response()->json($item->load(['part', 'delivery']));
    }

    /**
     * Get available part types for dropdown.
     */
    public function getPartTypes()
    {
        $types = [
            'ram' => 'RAM',
            'ssd' => 'SSD',
            'hdd' => 'HDD',
            'gpu' => 'GPU',
            'cpu' => 'CPU',
            'motherboard' => 'Motherboard',
            'psu' => 'Power Supply',
            'cooling' => 'Cooling',
            'case' => 'Case',
            'cable' => 'Cable',
            'network' => 'Network',
            'optical' => 'Optical Drive',
            'other' => 'Other',
        ];

        return response()->json($types);
    }

    /**
     * Get all items of a specific part
     */
    public function getItems(Part $part)
    {
        $items = $part->items()->get();
        return response()->json($items);
    }
    
    /**
     * Get the delivery history of a specific part
     */
    public function deliveryHistory(Part $part)
    {
        $deliveries = $part->deliveries()
            ->orderBy('delivery_date', 'desc')
            ->get();
            
        return response()->json($deliveries);
    }

    /**
     * Remove stock from a part (mark items as removed/damaged).
     */
    public function removeStock(Request $request, Part $part)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1|max:' . $part->available_stock,
            'reason' => 'required|string|in:damaged,lost,disposed,transferred',
            'notes' => 'nullable|string',
            'removed_by' => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($part, $validated) {
            // Get available items to remove
            $itemsToRemove = $part->items()
                ->where('status', 'available')
                ->limit($validated['quantity'])
                ->get();

            if ($itemsToRemove->count() < $validated['quantity']) {
                return response()->json([
                    'error' => 'Not enough available items to remove'
                ], 400);
            }

            // Update items status
            foreach ($itemsToRemove as $item) {
                $item->update([
                    'status' => 'removed',
                    'condition_notes' => "Removed: {$validated['reason']}. {$validated['notes']}",
                    'assigned_to' => null,
                    'assigned_date' => null,
                ]);
            }

            // Update part stock
            $part->decrement('total_stock', $validated['quantity']);
            $part->decrement('available_stock', $validated['quantity']);

            // Create a negative delivery record for tracking
            $part->deliveries()->create([
                'quantity_delivered' => -$validated['quantity'],
                'delivery_date' => now(),
                'notes' => "Stock removed: {$validated['reason']}. {$validated['notes']}",
                'received_by' => $validated['removed_by'],
                'delivery_status' => 'removed',
            ]);

            return response()->json($part->load(['deliveries', 'items']));
        });
    }
}
