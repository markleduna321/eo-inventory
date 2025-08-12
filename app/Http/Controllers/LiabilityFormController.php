<?php

namespace App\Http\Controllers;

use App\Models\DeviceRequest;
use App\Models\LiabilityForm;
use App\Models\Device;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LiabilityFormController extends Controller
{
    public function index()
    {
        $liabilityForms = LiabilityForm::with(['deviceRequest.device', 'device', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/liability-forms/index', [
            'liabilityForms' => $liabilityForms,
        ]);
    }

    public function create(DeviceRequest $deviceRequest)
    {
        // Check if user is authorized to fill this form
        if ($deviceRequest->assignee_id !== Auth::id()) {
            abort(403, 'You are not authorized to fill this liability form.');
        }

        // Check if request is approved
        if ($deviceRequest->status !== 'approved') {
            abort(403, 'This request is not approved yet.');
        }

        // Check if form already exists
        if ($deviceRequest->liabilityForm) {
            return redirect()->route('liability-forms.show', $deviceRequest->liabilityForm);
        }

        $deviceRequest->load(['device', 'requester']);

        return Inertia::render('admin/liability-forms/create', [
            'deviceRequest' => $deviceRequest,
            'user' => Auth::user(),
        ]);
    }

    public function showCreatePublic()
    {
        // Get available devices and approved device requests
        $devices = Device::where('status', 'Working')
            ->where(function ($query) {
                $query->whereNull('issued_to')
                    ->orWhere('issued_to', '');
            })
            ->get();
        
        // Get device requests that are approved but not completed, and don't have liability forms
        $deviceRequests = DeviceRequest::with(['device', 'requester'])
            ->where('status', 'approved')  // Only approved requests
            ->whereDoesntHave('liabilityForm', function ($query) {
                $query->where(function ($subQuery) {
                    // Exclude if there's a completed form
                    $subQuery->where('is_completed', true)
                        // Or if there's a non-public form (regular signed form)
                        ->orWhere('is_public_form', false)
                        // Or if there's an active (non-expired) public form
                        ->orWhere(function ($tokenQuery) {
                            $tokenQuery->where('is_public_form', true)
                                ->where('public_token_expires_at', '>', now())
                                ->where('is_completed', false);
                        });
                });
            })
            ->get();

        return Inertia::render('admin/liability-forms/create-public', [
            'devices' => $devices,
            'deviceRequests' => $deviceRequests,
        ]);
    }

    public function createPublic(Request $request)
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
            'device_request_id' => 'nullable|exists:device_requests,id',
            'employee_id' => 'required|string|max:50',
            'device_condition' => 'nullable|string|max:255',
            'accessories' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        // Check if device request already has a liability form (to prevent duplicates)
        if (!empty($validated['device_request_id'])) {
            $existingForm = LiabilityForm::where('device_request_id', $validated['device_request_id'])
                ->where(function ($query) {
                    // Check for completed forms or active public forms
                    $query->where('is_completed', true)
                        ->orWhere('is_public_form', false) // Regular signed forms
                        ->orWhere(function ($tokenQuery) {
                            // Active public forms (not expired and not completed)
                            $tokenQuery->where('is_public_form', true)
                                ->where('public_token_expires_at', '>', now())
                                ->where('is_completed', false);
                        });
                })
                ->first();

            if ($existingForm) {
                return back()->withErrors([
                    'device_request_id' => 'This device request already has a liability form that is either completed or still active.'
                ]);
            }
        } else {
            // If no device request was selected, try to find a matching approved device request
            // for the same device to auto-link it
            $matchingRequest = DeviceRequest::where('device_id', $validated['device_id'])
                ->where('status', 'approved')
                ->whereDoesntHave('liabilityForm')
                ->first();
            
            if ($matchingRequest) {
                $validated['device_request_id'] = $matchingRequest->id;
            }
        }

        // Prepare the data for creation
        $formData = [
            'device_id' => $validated['device_id'],
            'required_employee_id' => $validated['employee_id'],
            'is_public_form' => true,
            'admin_prefilled_data' => [
                'device_condition' => $validated['device_condition'],
                'accessories' => $validated['accessories'],
                'admin_notes' => $validated['admin_notes'],
                'created_by_admin' => auth()->user()->name,
                'created_at' => now()->toISOString(),
            ],
        ];

        // Only add device_request_id if it's provided
        if (!empty($validated['device_request_id'])) {
            $formData['device_request_id'] = $validated['device_request_id'];
        }

        // Create the liability form with prefilled data
        $liabilityForm = LiabilityForm::create($formData);

        // Generate public token
        $token = $liabilityForm->generatePublicToken();
        $publicUrl = $liabilityForm->getPublicUrl();

        return redirect()->route('liability-forms.index')->with([
            'success' => 'Liability agreement created successfully! Link: ' . $publicUrl,
            'publicUrl' => $publicUrl,
            'liabilityForm' => $liabilityForm->load('device'),
        ]);
    }

    public function store(Request $request, DeviceRequest $deviceRequest)
    {
        // Check authorization
        if ($deviceRequest->assignee_id !== Auth::id()) {
            abort(403, 'You are not authorized to fill this liability form.');
        }

        // Check if form already exists
        if ($deviceRequest->liabilityForm) {
            return back()->withErrors(['message' => 'Liability form already exists for this request.']);
        }

        $validated = $request->validate([
            'employee_name' => 'required|string|max:255',
            'employee_id' => 'nullable|string|max:50',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'device_condition_notes' => 'nullable|string',
            'accessories_received' => 'nullable|array',
            'accessories_received.*' => 'string|max:255',
            'agrees_to_terms' => 'required|accepted',
            'signature_data' => 'required|string',
            'signature_format' => 'nullable|string|in:png,svg,jpg,jpeg',
        ]);

        // Remove data URL prefix if present
        $signatureData = $validated['signature_data'];
        if (str_contains($signatureData, 'data:image/')) {
            $signatureData = substr($signatureData, strpos($signatureData, ',') + 1);
        }

        $liabilityForm = LiabilityForm::create([
            ...$validated,
            'device_request_id' => $deviceRequest->id,
            'user_id' => Auth::id(),
            'device_id' => $deviceRequest->device_id,
            'signature_data' => $signatureData,
            'signature_format' => $validated['signature_format'] ?? 'png',
            'signed_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'terms_agreed' => [
                'timestamp' => now()->toISOString(),
                'version' => '1.0',
                'agreed_to_terms' => true,
            ],
        ]);

        // Complete the device request since liability form is now signed
        $deviceRequest->complete();

        return redirect()->route('device-requests.show', $deviceRequest)
            ->with('success', 'Liability form submitted successfully. Your device assignment will be processed.');
    }

    public function show(LiabilityForm $liabilityForm)
    {
        $liabilityForm->load(['deviceRequest.device', 'user']);

        return Inertia::render('admin/liability-forms/show', [
            'liabilityForm' => $liabilityForm,
        ]);
    }

    public function download(LiabilityForm $liabilityForm)
    {
        // Generate PDF of the liability form
        // This would require a PDF generation library like DomPDF or similar
        
        $liabilityForm->load(['deviceRequest.device', 'user']);
        
        // For now, return JSON data that could be used to generate PDF on frontend
        return response()->json([
            'form' => $liabilityForm,
            'device' => $liabilityForm->deviceRequest->device,
            'user' => $liabilityForm->user,
            'signed_at' => $liabilityForm->signed_at->format('Y-m-d H:i:s'),
        ]);
    }
}