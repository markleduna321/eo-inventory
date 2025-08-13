<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Device;

echo "=== DEVICE AVAILABILITY TEST ===\n";
echo "Total devices: " . Device::count() . "\n";
echo "Working devices: " . Device::where('status', 'Working')->count() . "\n";

$availableDevices = Device::where('status', 'Working')
    ->where(function ($query) {
        $query->whereNull('issued_to')
            ->orWhere('issued_to', '');
    })
    ->get();

echo "Available devices: " . $availableDevices->count() . "\n\n";

if ($availableDevices->count() > 0) {
    echo "Available devices list:\n";
    foreach ($availableDevices->take(5) as $device) {
        echo "- ID: {$device->id}, Asset: {$device->asset_tag}, Brand: {$device->brand} {$device->model}, Status: {$device->status}, Issued To: " . ($device->issued_to ?: 'null') . "\n";
    }
} else {
    echo "No available devices found!\n";
}

echo "\n=== END TEST ===\n";
