<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test damaged unbinding specifically

echo "=== TESTING DAMAGED UNBINDING IMPACT ===\n\n";

$peripheral = App\Models\Peripheral::where('uses_serial_numbers', true)->first();
$station = App\Models\Station::first();

if (!$peripheral || !$station) {
    echo "No suitable peripheral or station found for testing\n";
    exit;
}

echo "Testing damaged unbinding with:\n";
echo "- Peripheral ID: {$peripheral->id}\n";
echo "- Peripheral: {$peripheral->brand} {$peripheral->model}\n";
echo "- Station: {$station->name}\n\n";

// Create and assign a test serial
$serialNumber = 'DAMAGE-TEST-' . time();
$peripheral->serialNumbers()->create([
    'serial_number' => $serialNumber,
    'unit_price' => 100.00,
    'status' => 'available',
    'delivery_date' => now(),
]);

$peripheral->recalculateStockFromSerials();
$peripheral->refresh();

echo "=== INITIAL STATE ===\n";
echo "Available: {$peripheral->available_stock}\n";
echo "Deployed: {$peripheral->deployed_stock}\n";
echo "Damaged: {$peripheral->damaged_stock}\n";
echo "Total: {$peripheral->total_stock}\n\n";

// Assign the peripheral
$assignment = $station->assignAsset('peripheral', $peripheral->id, $serialNumber);
$peripheral->refresh();

echo "=== AFTER ASSIGNMENT ===\n";
echo "Available: {$peripheral->available_stock}\n";
echo "Deployed: {$peripheral->deployed_stock}\n";
echo "Damaged: {$peripheral->damaged_stock}\n";
echo "Total: {$peripheral->total_stock}\n\n";

// Test damaged unbinding
echo "=== TESTING DAMAGED UNBINDING ===\n";
try {
    $station->unassignAsset(
        'peripheral', 
        $peripheral->id, 
        $serialNumber,
        App\Models\StationHistory::REASON_DAMAGED,
        'Testing damaged unbind with new stock calculation'
    );
    
    echo "✅ Damaged unbinding successful\n";
    
    $peripheral->refresh();
    echo "After damaged unbind:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
    // Check serial status
    $damagedSerial = $peripheral->serialNumbers()->where('serial_number', $serialNumber)->first();
    if ($damagedSerial) {
        echo "Serial status: {$damagedSerial->status}\n";
        echo "Serial damage reason: {$damagedSerial->damage_reason}\n\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Clean up
$testSerial = $peripheral->serialNumbers()->where('serial_number', $serialNumber)->first();
if ($testSerial) {
    $testSerial->delete();
    $peripheral->recalculateStockFromSerials();
    $peripheral->refresh();
    
    echo "=== FINAL STATE (after cleanup) ===\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n";
}

echo "\n=== DAMAGED UNBINDING TEST COMPLETED ===\n";
