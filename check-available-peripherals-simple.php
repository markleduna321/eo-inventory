<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Station;
use App\Models\Peripheral;

echo "=== CHECKING AVAILABLE PERIPHERALS ===\n";

$station = Station::find(19);
echo "Station: {$station->name} (ID: {$station->id})\n\n";

// Get all active peripherals with stock
$peripherals = Peripheral::where('status', 'active')
    ->where('available_stock', '>', 0)
    ->get();

echo "Active peripherals with available stock:\n";
foreach ($peripherals as $peripheral) {
    echo "- ID: {$peripheral->id}\n";
    echo "  Brand/Model: {$peripheral->brand} {$peripheral->model}\n";
    echo "  Type: {$peripheral->type}\n";
    echo "  Available Stock: {$peripheral->available_stock}\n";
    echo "  Uses Serial Numbers: " . ($peripheral->uses_serial_numbers ? 'true' : 'false') . "\n";
    echo "  Current Assignments: " . $peripheral->stationAssignment()->count() . "\n";
    echo "\n";
}

// Test what the controller method returns
echo "=== TESTING CONTROLLER METHOD ===\n";
try {
    $controller = new App\Http\Controllers\StationController();
    $availablePeripherals = $controller->getAvailablePeripherals($station);
    
    echo "Available peripherals returned by controller:\n";
    foreach ($availablePeripherals as $type => $items) {
        echo "Type: {$type}\n";
        foreach ($items as $item) {
            echo "  - ID: {$item['id']}, Brand: {$item['brand']}, Model: {$item['model']}, Stock: {$item['available_stock']}, Uses Serial: " . ($item['uses_serial_numbers'] ? 'true' : 'false') . "\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
