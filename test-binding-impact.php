<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test the impact of our changes on binding/unbinding

echo "=== TESTING BINDING/UNBINDING IMPACT ===\n\n";

// Get a peripheral that uses serial numbers
$peripheral = App\Models\Peripheral::where('uses_serial_numbers', true)->first();
$station = App\Models\Station::first();

if (!$peripheral || !$station) {
    echo "No suitable peripheral or station found for testing\n";
    exit;
}

echo "Testing with:\n";
echo "- Peripheral ID: {$peripheral->id}\n";
echo "- Peripheral: {$peripheral->brand} {$peripheral->model}\n";
echo "- Station: {$station->name}\n\n";

// Check initial state
echo "=== INITIAL STATE ===\n";
echo "Available: {$peripheral->available_stock}\n";
echo "Deployed: {$peripheral->deployed_stock}\n";
echo "Damaged: {$peripheral->damaged_stock}\n";
echo "Total: {$peripheral->total_stock}\n";
echo "Serial Count: " . $peripheral->serialNumbers()->count() . "\n\n";

// Create a test serial number
$serialNumber = 'TEST-' . time();
$peripheral->serialNumbers()->create([
    'serial_number' => $serialNumber,
    'unit_price' => 100.00,
    'status' => 'available',
    'delivery_date' => now(),
]);

// Use the recalculateStockFromSerials method
$peripheral->recalculateStockFromSerials();
$peripheral->refresh();

echo "=== AFTER ADDING SERIAL ===\n";
echo "Available: {$peripheral->available_stock}\n";
echo "Deployed: {$peripheral->deployed_stock}\n";
echo "Damaged: {$peripheral->damaged_stock}\n";
echo "Total: {$peripheral->total_stock}\n";
echo "Serial Count: " . $peripheral->serialNumbers()->count() . "\n\n";

// Test assignment with serial number
echo "=== TESTING ASSIGNMENT ===\n";
try {
    $assignment = $station->assignAsset('peripheral', $peripheral->id, $serialNumber);
    echo "✅ Assignment successful: ID {$assignment->id}\n";
    
    $peripheral->refresh();
    echo "After assignment:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
    // Test unassignment
    echo "=== TESTING UNASSIGNMENT ===\n";
    $station->unassignAsset('peripheral', $peripheral->id, $serialNumber);
    echo "✅ Unassignment successful\n";
    
    $peripheral->refresh();
    echo "After unassignment:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

// Clean up - delete test serial
$testSerial = $peripheral->serialNumbers()->where('serial_number', $serialNumber)->first();
if ($testSerial) {
    $testSerial->delete();
    echo "Test serial deleted\n";
    
    // Use recalculateStockFromSerials to update stock counts
    $peripheral->recalculateStockFromSerials();
    $peripheral->refresh();
    
    echo "=== FINAL STATE (after cleanup) ===\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n";
    echo "Serial Count: " . $peripheral->serialNumbers()->count() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
