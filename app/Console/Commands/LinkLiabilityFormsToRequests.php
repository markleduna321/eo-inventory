<?php

namespace App\Console\Commands;

use App\Models\DeviceRequest;
use App\Models\LiabilityForm;
use Illuminate\Console\Command;

class LinkLiabilityFormsToRequests extends Command
{
    protected $signature = 'liability-forms:link-requests';
    protected $description = 'Link existing liability forms to matching device requests';

    public function handle()
    {
        $this->info('Starting to link liability forms to device requests...');

        // Get liability forms without device request links
        $formsWithoutRequests = LiabilityForm::whereNull('device_request_id')
            ->with('device')
            ->get();

        $linkedCount = 0;

        foreach ($formsWithoutRequests as $form) {
            if (!$form->device) {
                $this->warn("Form {$form->id} has no device associated - skipping");
                continue;
            }

            // Find matching device request for the same device
            $matchingRequest = DeviceRequest::where('device_id', $form->device_id)
                ->where('status', 'approved')
                ->whereDoesntHave('liabilityForm')
                ->first();

            if ($matchingRequest) {
                $form->update(['device_request_id' => $matchingRequest->id]);
                
                // If the form is completed, complete the device request too
                if ($form->is_completed) {
                    $matchingRequest->complete();
                    $this->info("Linked and completed: Form {$form->id} -> Request {$matchingRequest->id}");
                } else {
                    $this->info("Linked: Form {$form->id} -> Request {$matchingRequest->id}");
                }
                
                $linkedCount++;
            } else {
                $this->warn("No matching device request found for form {$form->id} (device: {$form->device->brand} {$form->device->model})");
            }
        }

        $this->info("Linked {$linkedCount} liability forms to device requests.");
        
        return 0;
    }
}
