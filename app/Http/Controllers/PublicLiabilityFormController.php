<?php

namespace App\Http\Controllers;

use App\Models\LiabilityForm;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicLiabilityFormController extends Controller
{
    public function show($token)
    {
        $liabilityForm = LiabilityForm::where('public_token', $token)
            ->with(['deviceRequest.device', 'device'])
            ->first();

        if (!$liabilityForm || !$liabilityForm->isTokenValid()) {
            return Inertia::render('public/liability-form/expired', [
                'message' => $liabilityForm ? 'This form has expired or already been completed.' : 'Invalid form link.'
            ]);
        }

        // If already completed, show the thank you page
        if ($liabilityForm->is_completed) {
            return Inertia::render('public/liability-form/thank-you', [
                'liabilityForm' => $liabilityForm,
                'downloadUrl' => route('public.liability-forms.download', $token)
            ]);
        }

        // Get device info from either deviceRequest or direct device relationship
        $deviceInfo = $liabilityForm->deviceRequest?->device ?? $liabilityForm->device;

        return Inertia::render('public/liability-form/access', [
            'token' => $token,
            'deviceInfo' => $deviceInfo,
            'prefilledData' => $liabilityForm->admin_prefilled_data
        ]);
    }

    public function verify(Request $request, $token)
    {
        $request->validate([
            'employee_id' => 'required|string'
        ]);

        $liabilityForm = LiabilityForm::where('public_token', $token)->first();

        if (!$liabilityForm || !$liabilityForm->isTokenValid()) {
            return back()->withErrors(['message' => 'Invalid or expired form.']);
        }

        // Verify employee ID matches
        if ($liabilityForm->required_employee_id !== $request->employee_id) {
            return back()->withErrors(['employee_id' => 'Employee ID does not match our records.']);
        }

        // Mark as accessed
        $liabilityForm->markAsAccessed();

        return Inertia::render('public/liability-form/form', [
            'liabilityForm' => $liabilityForm,
            'deviceInfo' => $liabilityForm->deviceRequest?->device ?? $liabilityForm->device,
            'prefilledData' => $liabilityForm->admin_prefilled_data,
            'token' => $token
        ]);
    }

    public function store(Request $request, $token)
    {
        $liabilityForm = LiabilityForm::where('public_token', $token)->first();

        if (!$liabilityForm || !$liabilityForm->isTokenValid()) {
            return response()->json(['message' => 'Invalid or expired form.'], 422);
        }

        $validated = $request->validate([
            'employee_id' => 'required|string|max:50',
            'employee_name' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'agrees_to_terms' => 'required|accepted',
            'signature_data' => 'required|string',
            'signature_format' => 'nullable|string|in:png,svg,jpg,jpeg',
        ]);

        // Verify employee ID still matches (security check)
        if ($liabilityForm->required_employee_id !== $validated['employee_id']) {
            return response()->json(['message' => 'Employee ID does not match our records.'], 422);
        }

        // Remove data URL prefix if present
        $signatureData = $validated['signature_data'];
        if (str_contains($signatureData, 'data:image/')) {
            $signatureData = substr($signatureData, strpos($signatureData, ',') + 1);
        }

        // Update the liability form
        $liabilityForm->update([
            'employee_id' => $validated['employee_id'],
            'employee_name' => $validated['employee_name'],
            'contact_number' => $validated['contact_number'],
            'email' => $validated['email'],
            'department' => $validated['department'],
            'position' => $validated['position'],
            'agrees_to_terms' => $validated['agrees_to_terms'],
            'signature_data' => $signatureData,
            'signature_format' => $validated['signature_format'] ?? 'png',
            'signed_at' => now(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $liabilityForm->markAsCompleted();

        // Complete the device request if it exists
        if ($liabilityForm->deviceRequest) {
            $liabilityForm->deviceRequest->complete();
        }

        return Inertia::render('public/liability-form/thank-you', [
            'liabilityForm' => $liabilityForm,
            'downloadUrl' => route('public.liability-forms.download', $token)
        ]);
    }

    public function download($token)
    {
        $liabilityForm = LiabilityForm::where('public_token', $token)
            ->where('is_completed', true)
            ->with(['deviceRequest.device', 'device'])
            ->first();

        if (!$liabilityForm) {
            abort(404, 'Form not found or not completed.');
        }

        // Here you can implement PDF generation
        // For now, we'll redirect to the admin show page
        return redirect()->route('liability-forms.show', $liabilityForm->id);
    }
}
