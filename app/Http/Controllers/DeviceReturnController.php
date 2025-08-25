<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceReturn;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DeviceReturnController extends Controller
{
    /**
     * Display a listing of device returns
     */
    public function index(Request $request)
    {
        $query = DeviceReturn::with('device')
            ->orderBy('returned_at', 'desc');

        // Apply filters
        if ($request->filled('return_reason')) {
            $query->where('return_reason', $request->return_reason);
        }

        if ($request->filled('new_status')) {
            $query->where('new_status', $request->new_status);
        }

        if ($request->filled('has_issues')) {
            $query->where('has_issues', $request->boolean('has_issues'));
        }

        if ($request->filled('needs_approval')) {
            $query->where('approved_by_supervisor', false);
        }

        $returns = $query->paginate(15);

        return Inertia::render('admin/device-returns/page', [
            'returns' => $returns,
            'filters' => $request->only(['return_reason', 'new_status', 'has_issues', 'needs_approval'])
        ]);
    }

    /**
     * Show the form for creating a new device return
     */
    public function create(Request $request)
    {
        $device = null;
        if ($request->filled('device_id')) {
            $device = Device::findOrFail($request->device_id);
            
            // Check if device is currently assigned
            if (empty($device->issued_to)) {
                return redirect()->route('device-returns.index')
                    ->with('error', 'This device is not currently assigned to anyone.');
            }
        }

        return Inertia::render('admin/device-returns/create', [
            'device' => $device,
            'returnReasons' => $this->getReturnReasons(),
            'conditionCheckItems' => $this->getConditionCheckItems()
        ]);
    }

    /**
     * Store a newly created device return
     */
    public function store(Request $request)
    {
        $request->validate([
            'device_id' => 'required|exists:devices,id',
            'returner_name' => 'required|string|max:255',
            'return_reason' => 'required|string|in:resignation,termination,replacement,upgrade,repair,end_of_assignment,transfer,other',
            'return_notes' => 'nullable|string',
            'condition_check' => 'required|array',
            'condition_check.*.item' => 'required|string',
            'condition_check.*.status' => 'required|in:good,minor_issue,major_issue',
            'condition_check.*.notes' => 'nullable|string',
            'received_by' => 'required|string|max:255',
            'issues_description' => 'nullable|string',
            'repair_cost' => 'nullable|numeric|min:0',
            'supervisor_name' => 'nullable|string|max:255',
            'supervisor_notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $device = Device::findOrFail($request->device_id);
            
            // Check if device is currently assigned
            if (empty($device->issued_to)) {
                throw new \Exception('This device is not currently assigned to anyone.');
            }

            // Determine if there are any issues
            $hasIssues = collect($request->condition_check)
                ->contains(fn($item) => in_array($item['status'], ['minor_issue', 'major_issue']));

            // Determine new device status based on condition
            $newStatus = $this->determineNewStatus($request->condition_check, $hasIssues);

            // Create the return record
            $deviceReturn = DeviceReturn::create([
                'device_id' => $request->device_id,
                'returner_name' => $request->returner_name,
                'previous_assignee' => $device->issued_to,
                'return_reason' => $request->return_reason,
                'return_notes' => $request->return_notes,
                'condition_check' => $request->condition_check,
                'received_by' => $request->received_by,
                'has_issues' => $hasIssues,
                'issues_description' => $request->issues_description,
                'new_status' => $newStatus,
                'repair_cost' => $request->repair_cost,
                'approved_by_supervisor' => $request->filled('supervisor_name'),
                'supervisor_name' => $request->supervisor_name,
                'supervisor_notes' => $request->supervisor_notes,
                'returned_at' => now(),
            ]);

            // Update device status
            $device->update([
                'issued_to' => null, // Clear assignment
                'status' => $newStatus === 'available' ? 'Working' : ucfirst(str_replace('_', ' ', $newStatus))
            ]);

            DB::commit();

            Log::info('Device returned successfully', [
                'device_id' => $device->id,
                'return_id' => $deviceReturn->id,
                'returner' => $request->returner_name,
                'new_status' => $newStatus
            ]);

            return redirect()->route('device-returns.show', $deviceReturn)
                ->with('success', 'Device return processed successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Device return failed', [
                'error' => $e->getMessage(),
                'device_id' => $request->device_id
            ]);

            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to process device return: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified device return
     */
    public function show(DeviceReturn $deviceReturn)
    {
        $deviceReturn->load('device');

        return Inertia::render('admin/device-returns/show', [
            'deviceReturn' => $deviceReturn
        ]);
    }

    /**
     * Get list of assigned devices for return selection
     */
    public function getAssignedDevices(Request $request)
    {
        $query = Device::whereNotNull('issued_to')
            ->where('issued_to', '!=', '');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('serial_number', 'like', "%{$search}%")
                  ->orWhere('brand', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('issued_to', 'like', "%{$search}%");
            });
        }

        $devices = $query->select([
                'id', 'serial_number', 'device_type', 'brand', 'model', 'issued_to'
            ])
            ->orderBy('issued_to')
            ->limit(50)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $devices
        ]);
    }

    /**
     * Approve a device return by supervisor
     */
    public function approve(Request $request, DeviceReturn $deviceReturn)
    {
        $request->validate([
            'supervisor_name' => 'required|string|max:255',
            'supervisor_notes' => 'nullable|string',
        ]);

        $deviceReturn->update([
            'approved_by_supervisor' => true,
            'supervisor_name' => $request->supervisor_name,
            'supervisor_notes' => $request->supervisor_notes,
        ]);

        Log::info('Device return approved', [
            'return_id' => $deviceReturn->id,
            'supervisor' => $request->supervisor_name
        ]);

        return redirect()->back()
            ->with('success', 'Device return approved successfully.');
    }

    /**
     * Get return statistics
     */
    public function getStats()
    {
        $stats = [
            'total_returns' => DeviceReturn::count(),
            'returns_this_month' => DeviceReturn::whereMonth('returned_at', now()->month)
                ->whereYear('returned_at', now()->year)
                ->count(),
            'returns_with_issues' => DeviceReturn::where('has_issues', true)->count(),
            'pending_approval' => DeviceReturn::where('approved_by_supervisor', false)->count(),
            'by_reason' => DeviceReturn::selectRaw('return_reason, COUNT(*) as count')
                ->groupBy('return_reason')
                ->pluck('count', 'return_reason'),
            'by_status' => DeviceReturn::selectRaw('new_status, COUNT(*) as count')
                ->groupBy('new_status')
                ->pluck('count', 'new_status'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get return reasons
     */
    private function getReturnReasons(): array
    {
        return [
            'resignation' => 'Employee Resignation',
            'termination' => 'Employee Termination', 
            'replacement' => 'Device Replacement',
            'upgrade' => 'Device Upgrade',
            'repair' => 'Repair Required',
            'end_of_assignment' => 'End of Assignment',
            'transfer' => 'Department Transfer',
            'other' => 'Other'
        ];
    }

    /**
     * Get condition check items
     */
    private function getConditionCheckItems(): array
    {
        return [
            ['item' => 'Physical Condition', 'description' => 'Check for scratches, dents, cracks'],
            ['item' => 'Screen/Display', 'description' => 'Check for dead pixels, brightness, clarity'],
            ['item' => 'Keyboard', 'description' => 'Test all keys, check for wear'],
            ['item' => 'Ports & Connections', 'description' => 'USB, audio, charging ports'],
            ['item' => 'Battery Performance', 'description' => 'Battery life and charging'],
            ['item' => 'Performance', 'description' => 'Speed, responsiveness, overheating'],
            ['item' => 'Accessories', 'description' => 'Charger, cables, mouse, etc.'],
            ['item' => 'Software/Data', 'description' => 'Data wiped, software licenses'],
        ];
    }

    /**
     * Determine new device status based on condition check
     */
    private function determineNewStatus(array $conditionCheck, bool $hasIssues): string
    {
        if (!$hasIssues) {
            return 'available';
        }

        $majorIssues = collect($conditionCheck)
            ->filter(fn($item) => $item['status'] === 'major_issue')
            ->count();

        if ($majorIssues > 0) {
            return 'needs_repair';
        }

        $minorIssues = collect($conditionCheck)
            ->filter(fn($item) => $item['status'] === 'minor_issue')
            ->count();

        if ($minorIssues > 3) {
            return 'needs_repair';
        }

        return 'available';
    }
}
