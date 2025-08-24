<?php

namespace App\Http\Controllers;

use App\Models\SystemUnit;
use App\Models\SystemUnitAuditLog;
use App\Models\Part;
use App\Models\PartItem;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
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

        // Log the creation event in audit log
        $user = Auth::user();
        $userName = $user ? $user->name : 'System';
        $userId = $user ? $user->id : null;
        
        \App\Models\SystemUnitAuditLog::logCreation(
            $systemUnit,
            $userName,
            $userId
        );

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
            'received_by' => 'sometimes|string|max:255',
            'purchase_price' => 'nullable|numeric|min:0',
            'supplier' => 'nullable|string|max:255',
            'purchase_date' => 'nullable|date',
            'warranty_expiry' => 'nullable|date',
            'notes' => 'nullable|string',
            'specifications' => 'nullable|array',
        ]);

        // Track the user who made the changes
        $user = Auth::user();
        $userName = $user ? $user->name : 'System';
        $userId = $user ? $user->id : null;
        
        // Get the original values before updating
        $originalValues = $systemUnit->getOriginal();
        
        // Track all field changes in audit log
        foreach ($validated as $field => $newValue) {
            $oldValue = $originalValues[$field] ?? null;
            
            // Only log if value actually changed
            if ($oldValue != $newValue) {
                if ($field === 'status') {
                    // Special handling for status changes
                    \App\Models\SystemUnitAuditLog::logStatusChange(
                        $systemUnit,
                        $oldValue,
                        $newValue,
                        $userName,
                        $userId
                    );
                } else {
                    // Log other field updates
                    \App\Models\SystemUnitAuditLog::logFieldUpdate(
                        $systemUnit,
                        $field,
                        $oldValue,
                        $newValue,
                        $userName,
                        $userId
                    );
                }
            }
        }

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

    /**
     * Check if a serial number is already in use
     */
    public function checkDuplicateSerial(Request $request): JsonResponse
    {
        $serialNumber = $request->query('serial');
        $excludeId = $request->query('exclude');

        if (!$serialNumber) {
            return response()->json(['isDuplicate' => false]);
        }

        $query = SystemUnit::where('serial_number', $serialNumber);
        
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $isDuplicate = $query->exists();

        return response()->json(['isDuplicate' => $isDuplicate]);
    }

    /**
     * Get comprehensive history for a system unit
     */
    public function history(SystemUnit $systemUnit): JsonResponse
    {
        $history = [];
        $currentUser = Auth::user();
        $currentUserName = $currentUser ? $currentUser->name : 'System';
        
        // 1. Creation/Delivery Event
        $history[] = [
            'id' => 'creation-' . $systemUnit->id,
            'type' => 'created',
            'title' => 'System Unit Created',
            'description' => "System unit '{$systemUnit->system_name}' was added to inventory",
            'details' => [
                'Serial Number' => $systemUnit->serial_number,
                'Brand' => $systemUnit->brand,
                'Model' => $systemUnit->model,
                'Location' => $systemUnit->location,
                'Received By' => $systemUnit->received_by,
                'Purchase Price' => $systemUnit->purchase_price ? '₱' . number_format($systemUnit->purchase_price, 2) : 'N/A'
            ],
            'user' => $systemUnit->received_by,
            'timestamp' => $systemUnit->created_at->toISOString(),
            'date' => $systemUnit->created_at->format('M j, Y'),
            'time' => $systemUnit->created_at->format('g:i A'),
            'icon' => 'plus-circle',
            'color' => 'green'
        ];

        // 2. Station Assignment History
        // Get ALL assignments from station_assets table (both active and inactive)
        $assignments = \DB::table('station_assets')
            ->join('stations', 'station_assets.station_id', '=', 'stations.id')
            ->where('station_assets.asset_id', $systemUnit->id)
            ->where('station_assets.asset_type', 'system_unit')
            ->orderBy('station_assets.created_at', 'desc')
            ->select([
                'station_assets.*',
                'stations.name as station_name',
                'stations.type as station_type',
                'stations.department'
            ])
            ->get();

        foreach ($assignments as $assignment) {
            $assignmentDate = \Carbon\Carbon::parse($assignment->created_at);
            
            // Add assignment event
            $history[] = [
                'id' => 'assignment-' . $assignment->id,
                'type' => 'assigned',
                'title' => 'Assigned to Station',
                'description' => "Assigned to station '{$assignment->station_name}'",
                'details' => [
                    'Station' => $assignment->station_name,
                    'Station Type' => $assignment->station_type,
                    'Department' => $assignment->department,
                    'Assigned By' => $assignment->assigned_by ?? $currentUserName,
                    'Notes' => $assignment->notes ?? 'N/A'
                ],
                'user' => $assignment->assigned_by ?? $currentUserName,
                'timestamp' => $assignmentDate->toISOString(),
                'date' => $assignmentDate->format('M j, Y'),
                'time' => $assignmentDate->format('g:i A'),
                'icon' => 'arrow-right-circle',
                'color' => 'blue'
            ];
            
            // Add unassignment event if it exists
            if ($assignment->unassigned_at) {
                $unbindDate = \Carbon\Carbon::parse($assignment->unassigned_at);
                $history[] = [
                    'id' => 'unassignment-' . $assignment->id,
                    'type' => 'unassigned',
                    'title' => 'Unbound from Station',
                    'description' => "Unbound from station '{$assignment->station_name}'",
                    'details' => [
                        'Station' => $assignment->station_name,
                        'Reason' => $assignment->unbind_reason ?? 'N/A',
                        'Unbound By' => $assignment->unassigned_by ?? $currentUserName,
                        'Notes' => $assignment->notes ?? 'N/A'
                    ],
                    'user' => $assignment->unassigned_by ?? $currentUserName,
                    'timestamp' => $unbindDate->toISOString(),
                    'date' => $unbindDate->format('M j, Y'),
                    'time' => $unbindDate->format('g:i A'),
                    'icon' => 'arrow-left-circle',
                    'color' => 'orange'
                ];
            }
        }

        // 3. Audit Log Events (Status Changes and Field Updates)
        $auditLogs = $systemUnit->auditLogs()
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($auditLogs as $auditLog) {
            $logDate = \Carbon\Carbon::parse($auditLog->created_at);
            
            if ($auditLog->event_type === 'status_change') {
                $statusLabels = [
                    'available' => 'Available',
                    'assigned' => 'Assigned', 
                    'maintenance' => 'Under Maintenance',
                    'retired' => 'Retired'
                ];
                
                $statusColors = [
                    'available' => 'green',
                    'assigned' => 'blue',
                    'maintenance' => 'yellow',
                    'retired' => 'red'
                ];

                $history[] = [
                    'id' => 'audit-' . $auditLog->id,
                    'type' => 'status_change',
                    'title' => 'Status Changed',
                    'description' => $auditLog->description,
                    'details' => [
                        'Previous Status' => $statusLabels[$auditLog->old_value] ?? $auditLog->old_value,
                        'New Status' => $statusLabels[$auditLog->new_value] ?? $auditLog->new_value,
                        'Changed By' => $auditLog->user_name,
                        'Reason' => $auditLog->metadata['reason'] ?? 'N/A'
                    ],
                    'user' => $auditLog->user_name,
                    'timestamp' => $logDate->toISOString(),
                    'date' => $logDate->format('M j, Y'),
                    'time' => $logDate->format('g:i A'),
                    'icon' => 'arrow-path',
                    'color' => $statusColors[$auditLog->new_value] ?? 'gray'
                ];
            } elseif ($auditLog->event_type === 'field_update') {
                $history[] = [
                    'id' => 'audit-' . $auditLog->id,
                    'type' => 'field_update',
                    'title' => 'Information Updated',
                    'description' => $auditLog->description,
                    'details' => [
                        'Field' => $auditLog->field_name,
                        'Previous Value' => $auditLog->old_value ?? 'N/A',
                        'New Value' => $auditLog->new_value ?? 'N/A',
                        'Updated By' => $auditLog->user_name
                    ],
                    'user' => $auditLog->user_name,
                    'timestamp' => $logDate->toISOString(),
                    'date' => $logDate->format('M j, Y'),
                    'time' => $logDate->format('g:i A'),
                    'icon' => 'pencil-square',
                    'color' => 'blue'
                ];
            } elseif ($auditLog->event_type === 'creation') {
                $history[] = [
                    'id' => 'audit-' . $auditLog->id,
                    'type' => 'created',
                    'title' => 'System Unit Created',
                    'description' => $auditLog->description,
                    'details' => [
                        'Serial Number' => $auditLog->metadata['serial_number'] ?? $systemUnit->serial_number,
                        'Unit Type' => $auditLog->metadata['unit_type'] ?? $systemUnit->unit_type,
                        'Model' => $auditLog->metadata['model'] ?? $systemUnit->model ?? 'N/A',
                        'Manufacturer' => $auditLog->metadata['manufacturer'] ?? $systemUnit->manufacturer ?? 'N/A',
                        'Created By' => $auditLog->user_name,
                        'Initial Status' => 'Available'
                    ],
                    'user' => $auditLog->user_name,
                    'timestamp' => $logDate->toISOString(),
                    'date' => $logDate->format('M j, Y'),
                    'time' => $logDate->format('g:i A'),
                    'icon' => 'plus-circle',
                    'color' => 'green'
                ];
            }
        }

        // 4. Component Changes (for custom built units)
        if ($systemUnit->unit_type === 'custom_built') {
            $componentHistory = \DB::table('part_item_system_unit')
                ->join('part_items', 'part_item_system_unit.part_item_id', '=', 'part_items.id')
                ->join('parts', 'part_items.part_id', '=', 'parts.id')
                ->where('part_item_system_unit.system_unit_id', $systemUnit->id)
                ->select([
                    'part_item_system_unit.*',
                    'part_items.serial_number as component_serial',
                    'parts.brand',
                    'parts.model',
                    'parts.category'
                ])
                ->get();

            foreach ($componentHistory as $component) {
                $componentDate = \Carbon\Carbon::parse($component->created_at ?? $systemUnit->created_at);
                
                $history[] = [
                    'id' => 'component-' . $component->part_item_id,
                    'type' => 'component_added',
                    'title' => 'Component Added',
                    'description' => "Added {$component->category} component",
                    'details' => [
                        'Component Role' => ucfirst($component->component_role),
                        'Brand' => $component->brand,
                        'Model' => $component->model,
                        'Serial Number' => $component->component_serial ?? 'N/A',
                        'Category' => $component->category
                    ],
                    'user' => 'System',
                    'timestamp' => $componentDate->toISOString(),
                    'date' => $componentDate->format('M j, Y'),
                    'time' => $componentDate->format('g:i A'),
                    'icon' => 'cog',
                    'color' => 'purple'
                ];
            }
        }

        // 5. Maintenance Events (placeholder for future implementation)
        // This would come from a maintenance_logs table
        
        // Sort history by timestamp (most recent first)
        usort($history, function($a, $b) {
            return strtotime($b['timestamp']) - strtotime($a['timestamp']);
        });

        return response()->json([
            'history' => $history,
            'total_events' => count($history),
            'system_unit' => [
                'id' => $systemUnit->id,
                'system_name' => $systemUnit->system_name,
                'serial_number' => $systemUnit->serial_number,
                'current_status' => $systemUnit->status
            ]
        ]);
    }
}
