<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LiabilityForm;

class ShowLiabilityFormDetails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:show-liability-forms';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Show liability form details';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $forms = LiabilityForm::with('deviceRequest.device')->get();
        
        if ($forms->isEmpty()) {
            $this->info('No liability forms found.');
            return;
        }
        
        foreach ($forms as $form) {
            $this->info("Liability Form ID: {$form->id}");
            $this->info("Employee: {$form->employee_name}");
            $this->info("Device Request ID: {$form->device_request_id}");
            if ($form->deviceRequest && $form->deviceRequest->device) {
                $device = $form->deviceRequest->device;
                $this->info("Device: {$device->brand} {$device->model} ({$device->asset_tag})");
            }
            $this->info("Created: {$form->created_at}");
            $this->info("Signature data length: " . strlen($form->signature_data ?? ''));
            $this->info("Signature format: " . ($form->signature_format ?? 'unknown'));
            $this->info("Signature data preview: " . substr($form->signature_data ?? '', 0, 100) . '...');
            $this->info("URL: /admin/liability-forms/{$form->id}");
            $this->info("---");
        }
        
        return 0;
    }
}
