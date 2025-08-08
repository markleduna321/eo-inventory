<?php

namespace App\Http\Controllers;

use App\Models\SystemUnit;
use App\Models\Part;
use App\Models\PartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\PngWriter;

class SystemUnitController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $systemUnits = SystemUnit::with(['partItems.part', 'station'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($systemUnits);
    }



    /**
     * Store a newly created system unit.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'unit_type' => 'required|in:pre_built,custom_built',
            'system_name' => 'required|string|max:255',
            'serial_number' => 'nullable|string|unique:system_units,serial_number',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'operating_system' => 'nullable|string|max:255',
            'mac_address' => 'nullable|string|max:17|regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            'status' => 'required|in:available,assigned,maintenance,retired',
            'location' => 'required|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'received_by' => 'required|string|max:255',
            'purchase_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'notes' => 'nullable|string',

            // For pre-built units
            'specifications' => 'nullable|array',

            // For custom-built units
            'components' => 'nullable|array',
            'components.*.part_item_id' => 'exists:part_items,id',
            'components.*.component_role' => 'required_with:components|string',
        ]);

        // Generate serial number if not provided
        if (empty($validated['serial_number'])) {
            $validated['serial_number'] = 'SYS-' . strtoupper(Str::random(8));
        }

        $systemUnit = SystemUnit::create($validated);

        // If custom built, attach the components
        if ($validated['unit_type'] === 'custom_built' && !empty($validated['components'])) {
            foreach ($validated['components'] as $component) {
                // Check if part item is available
                $partItem = PartItem::find($component['part_item_id']);
                if (!$partItem->isAvailableForSystemUnit()) {
                    return response()->json([
                        'error' => "Part item {$partItem->serial_number} is not available for use."
                    ], 422);
                }

                // Attach the part item to the system unit
                $systemUnit->partItems()->attach($component['part_item_id'], [
                    'component_role' => $component['component_role']
                ]);

                // Update part item status
                $partItem->update(['status' => 'assigned']);
            }
        }

        return response()->json($systemUnit->load(['partItems.part']), 201);
    }

    /**
     * Display the specified system unit.
     */
    public function show(SystemUnit $systemUnit): JsonResponse
    {
        return response()->json($systemUnit->load(['partItems.part', 'station']));
    }

    /**
     * Update the specified system unit.
     */
    public function update(Request $request, SystemUnit $systemUnit): JsonResponse
    {
        $validated = $request->validate([
            'system_name' => 'sometimes|string|max:255',
            'unit_type' => 'sometimes|in:pre_built,custom_built',
            'brand' => 'nullable|string|max:255',
            'model' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'operating_system' => 'nullable|string|max:255',
            'mac_address' => 'nullable|string|max:17|regex:/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/',
            'status' => 'sometimes|in:available,assigned,maintenance,retired',
            'location' => 'sometimes|string|max:255',
            'assigned_to' => 'nullable|string|max:255',
            'purchase_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        $systemUnit->update($validated);

        return response()->json($systemUnit->load(['partItems.part']));
    }

    /**
     * Remove the specified system unit.
     */
    public function destroy(SystemUnit $systemUnit): JsonResponse
    {
        // If custom built, release the parts back to available status
        if ($systemUnit->unit_type === 'custom_built') {
            foreach ($systemUnit->partItems as $partItem) {
                $partItem->update(['status' => 'available']);
            }
        }

        $systemUnit->delete();

        return response()->json(['message' => 'System unit deleted successfully']);
    }

    /**
     * Get available parts for building custom system units
     */
    public function getAvailableParts(): JsonResponse
    {
        $parts = Part::with(['items' => function ($query) {
            $query->where('status', 'available')
                ->whereDoesntHave('systemUnits');
        }])
            ->whereHas('items', function ($query) {
                $query->where('status', 'available')
                    ->whereDoesntHave('systemUnits');
            })
            ->get();

        return response()->json($parts);
    }

    /**
     * Assign system unit to user
     */
    public function assign(Request $request, SystemUnit $systemUnit): JsonResponse
    {
        $validated = $request->validate([
            'assigned_to' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        if (!$systemUnit->isAvailable()) {
            return response()->json([
                'error' => 'System unit is not available for assignment'
            ], 422);
        }

        $systemUnit->update([
            'status' => 'assigned',
            'assigned_to' => $validated['assigned_to'],
            'notes' => $validated['notes'] ?? $systemUnit->notes,
        ]);

        return response()->json($systemUnit->load(['partItems.part']));
    }

    /**
     * Return system unit from assignment
     */
    public function returnUnit(Request $request, SystemUnit $systemUnit): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $systemUnit->update([
            'status' => 'available',
            'assigned_to' => null,
            'notes' => $validated['notes'] ?? $systemUnit->notes,
        ]);

        return response()->json($systemUnit->load(['partItems.part']));
    }

    /**
     * Generate QR code image for a system unit
     */
    public function generateQrCode(SystemUnit $systemUnit)
    {
        $qrCodeUrl = $systemUnit->getQrCodeUrl();
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

        $filename = "system_unit_" . $systemUnit->serial_number . "_qr.png";
        $disposition = $download ? 'attachment' : 'inline';

        return response($result->getString())
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', $disposition . '; filename="' . $filename . '"');
    }

    /**
     * Display system unit data from QR code scan
     */
    public function showByQrCode(string $qrCode)
    {
        $systemUnit = SystemUnit::where('qr_code', $qrCode)
            ->with(['partItems.part', 'station'])
            ->firstOrFail();

        // If it's an API request, return JSON
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'id' => $systemUnit->id,
                'serial_number' => $systemUnit->serial_number,
                'system_name' => $systemUnit->system_name,
                'unit_type' => $systemUnit->unit_type,
                'brand' => $systemUnit->brand,
                'model' => $systemUnit->model,
                'description' => $systemUnit->description,
                'operating_system' => $systemUnit->operating_system,
                'status' => $systemUnit->status,
                'location' => $systemUnit->location,
                'assigned_to' => $systemUnit->assigned_to,
                'received_by' => $systemUnit->received_by,
                'purchase_price' => $systemUnit->purchase_price,
                'supplier' => $systemUnit->supplier,
                'purchase_date' => $systemUnit->purchase_date?->format('Y-m-d'),
                'warranty_expiry' => $systemUnit->warranty_expiry?->format('Y-m-d'),
                'notes' => $systemUnit->notes,
                'specifications' => $systemUnit->formatted_specifications,
                'qr_code' => $systemUnit->qr_code,
                'created_at' => $systemUnit->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $systemUnit->updated_at->format('Y-m-d H:i:s'),
            ]);
        }

        // For web requests, return a view
        return view('system-units.qr-view', compact('systemUnit'));
    }

    /**
     * Get all system units with their QR codes
     */
    public function indexWithQr(): JsonResponse
    {
        $systemUnits = SystemUnit::with(['partItems.part'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($unit) {
                $unit->qr_code_url = $unit->getQrCodeUrl();
                $unit->qr_code_image_url = route('system-units.qr-image', $unit);
                return $unit;
            });

        return response()->json($systemUnits);
    }
}
