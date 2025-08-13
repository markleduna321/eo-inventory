<?php

require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

// Get a liability form that has a device request and isn't completed
$liabilityForm = App\Models\LiabilityForm::whereNotNull('device_request_id')
    ->where('is_completed', false)
    ->with('deviceRequest')
    ->first();

if ($liabilityForm) {
    echo "Found liability form ID: {$liabilityForm->id}\n";
    echo "Device request ID: {$liabilityForm->device_request_id}\n";
    echo "Device request status before: {$liabilityForm->deviceRequest->status}\n";
    
    // Simulate completing the form
    $liabilityForm->markAsCompleted();
    
    // Complete the device request
    if ($liabilityForm->deviceRequest) {
        $result = $liabilityForm->deviceRequest->complete();
        echo "Device request completion result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
        echo "Device request status after: {$liabilityForm->deviceRequest->fresh()->status}\n";
    }
} else {
    echo "No suitable liability form found for testing\n";
    
    // Show some statistics
    echo "Total liability forms: " . App\Models\LiabilityForm::count() . "\n";
    echo "Forms with device requests: " . App\Models\LiabilityForm::whereNotNull('device_request_id')->count() . "\n";
    echo "Completed forms: " . App\Models\LiabilityForm::where('is_completed', true)->count() . "\n";
}
