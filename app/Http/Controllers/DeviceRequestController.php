<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\DeviceRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DeviceRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = DeviceRequest::with(['device', 'requester', 'assignee', 'approver'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by user role - for now, show all requests to all users
        // TODO: Implement proper role-based filtering when roles are implemented
        // $user = Auth::user();
        // if (!$user->hasRole('admin')) {
        //     $query->forUser($user->id);
        // }

        $requests = $query->paginate(15);

        return Inertia::render('admin/device-requests/page', [
            'requests' => $requests,
            'filters' => $request->only(['status']),
        ]);
    }

    public function create()
    {
        $availableDevices = Device::where('status', 'Working')
            ->where(function ($query) {
                $query->whereNull('issued_to')
                    ->orWhere('issued_to', '');
            })
            ->get();

        $users = User::select('id', 'name', 'email')->get();

        return Inertia::render('admin/device-requests/create', [
            'availableDevices' => $availableDevices,
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'assignee_id' => 'required|exists:users,id',
            'request_type' => 'required|in:assignment,transfer,return',
            'justification' => 'required|string|min:10',
            'purpose' => 'nullable|string',
            'requested_from' => 'nullable|date|after_or_equal:today',
            'requested_until' => 'nullable|date|after:requested_from',
            'priority' => 'required|in:low,medium,high,urgent',
        ]);

        // Check if device is available
        $device = Device::findOrFail($validated['device_id']);
        if (!$device->isAvailable()) {
            return back()->withErrors(['device_id' => 'This device is not available for assignment.']);
        }

        // Check if device has pending requests
        if ($device->hasPendingRequest()) {
            return back()->withErrors(['device_id' => 'This device already has a pending request.']);
        }

        $deviceRequest = DeviceRequest::create([
            ...$validated,
            'requester_id' => Auth::id(),
        ]);

        return redirect()->route('device-requests.index')
            ->with('success', 'Device request submitted successfully.');
    }

    public function show(DeviceRequest $deviceRequest)
    {
        $deviceRequest->load(['device', 'requester', 'assignee', 'approver', 'liabilityForm']);

        return Inertia::render('admin/device-requests/show', [
            'deviceRequest' => $deviceRequest,
        ]);
    }

    public function approve(Request $request, DeviceRequest $deviceRequest)
    {
        $request->validate([
            'approval_notes' => 'nullable|string',
        ]);

        if (!$deviceRequest->canBeApproved()) {
            return back()->withErrors(['message' => 'This request cannot be approved.']);
        }

        $approved = $deviceRequest->approve(Auth::id(), $request->approval_notes);

        if ($approved) {
            return back()->with('success', 'Request approved successfully.');
        }

        return back()->withErrors(['message' => 'Failed to approve request.']);
    }

    public function reject(Request $request, DeviceRequest $deviceRequest)
    {
        $request->validate([
            'rejection_reason' => 'required|string|min:10',
        ]);

        if (!$deviceRequest->canBeRejected()) {
            return back()->withErrors(['message' => 'This request cannot be rejected.']);
        }

        $rejected = $deviceRequest->reject(Auth::id(), $request->rejection_reason);

        if ($rejected) {
            return back()->with('success', 'Request rejected.');
        }

        return back()->withErrors(['message' => 'Failed to reject request.']);
    }

    public function complete(DeviceRequest $deviceRequest)
    {
        if ($deviceRequest->status !== 'approved') {
            return back()->withErrors(['message' => 'Only approved requests can be completed.']);
        }

        // Check if liability form is completed
        if (!$deviceRequest->liabilityForm || !$deviceRequest->liabilityForm->hasValidSignature()) {
            return back()->withErrors(['message' => 'Liability form must be completed before assignment.']);
        }

        $completed = $deviceRequest->complete();

        if ($completed) {
            return back()->with('success', 'Device assignment completed successfully.');
        }

        return back()->withErrors(['message' => 'Failed to complete assignment.']);
    }

    public function cancel(DeviceRequest $deviceRequest)
    {
        if ($deviceRequest->status !== 'pending') {
            return back()->withErrors(['message' => 'Only pending requests can be cancelled.']);
        }

        $deviceRequest->update(['status' => 'cancelled']);

        return back()->with('success', 'Request cancelled successfully.');
    }

    public function getAvailableDevices()
    {
        $devices = Device::where('status', 'Working')
            ->where(function ($query) {
                $query->whereNull('issued_to')
                    ->orWhere('issued_to', '');
            })
            ->select('id', 'serial_number', 'device_type', 'brand', 'model')
            ->get();

        return response()->json($devices);
    }
}
