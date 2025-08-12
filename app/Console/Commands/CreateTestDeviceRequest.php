<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DeviceRequest;

class CreateTestDeviceRequest extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:create-device-request';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a test device request for approval testing';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $request = DeviceRequest::create([
            'device_id' => 2,
            'requester_id' => 1,
            'assignee_id' => 1,
            'request_type' => 'assignment',
            'justification' => 'Need for testing approval functionality',
            'purpose' => 'Testing',
            'requested_from' => '2025-01-15',
            'requested_until' => '2025-02-15',
            'priority' => 'medium',
            'status' => 'pending'
        ]);

        $this->info("Created test device request with ID: {$request->id}");
        return 0;
    }
}
