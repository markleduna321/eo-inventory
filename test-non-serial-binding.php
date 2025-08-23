<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test non-serial peripherals

echo "=== TESTING NON-SERIAL PERIPHERAL BINDING ===\n\n";

$peripheral = App\Models\Peripheral::where('uses_serial_numbers', false)->first();
$station = App\Models\Station::first();

if (!$peripheral || !$station) {
    echo "No suitable peripheral or station found for testing\n";
    exit;
}

echo "Testing with non-serial peripheral:\n";
echo "- Peripheral ID: {$peripheral->id}\n";
echo "- Peripheral: {$peripheral->brand} {$peripheral->model}\n";
echo "- Uses Serial Numbers: " . ($peripheral->uses_serial_numbers ? 'Yes' : 'No') . "\n";
echo "- Station: {$station->name}\n\n";

echo "=== INITIAL STATE ===\n";
echo "Available: {$peripheral->available_stock}\n";
echo "Deployed: {$peripheral->deployed_stock}\n";
echo "Damaged: {$peripheral->damaged_stock}\n";
echo "Total: {$peripheral->total_stock}\n\n";

// Test assignment without serial number
echo "=== TESTING ASSIGNMENT (No Serial) ===\n";
try {
    $assignment = $station->assignAsset('peripheral', $peripheral->id);
    echo "✅ Assignment successful: ID {$assignment->id}\n";
    
    $peripheral->refresh();
    echo "After assignment:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
    // Test normal unassignment
    echo "=== TESTING NORMAL UNASSIGNMENT ===\n";
    $station->unassignAsset('peripheral', $peripheral->id);
    echo "✅ Normal unassignment successful\n";
    
    $peripheral->refresh();
    echo "After normal unassignment:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
    // Test damaged unassignment
    echo "=== TESTING DAMAGED UNASSIGNMENT ===\n";
    $assignment2 = $station->assignAsset('peripheral', $peripheral->id);
    echo "✅ Re-assigned for damage test: ID {$assignment2->id}\n";
    
    $station->unassignAsset(
        'peripheral', 
        $peripheral->id,
        null,
        App\Models\StationHistory::REASON_DAMAGED,
        'Testing damaged unbind for non-serial peripheral'
    );
    echo "✅ Damaged unassignment successful\n";
    
    $peripheral->refresh();
    echo "After damaged unassignment:\n";
    echo "Available: {$peripheral->available_stock}\n";
    echo "Deployed: {$peripheral->deployed_stock}\n";
    echo "Damaged: {$peripheral->damaged_stock}\n";
    echo "Total: {$peripheral->total_stock}\n\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "=== NON-SERIAL PERIPHERAL TEST COMPLETED ===\n";
