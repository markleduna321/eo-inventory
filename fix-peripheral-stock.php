<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Fix peripheral ID 16 manually
$peripheral = App\Models\Peripheral::find(16);
if ($peripheral) {
    echo 'Before fix:' . PHP_EOL;
    echo "Total Stock: {$peripheral->total_stock}" . PHP_EOL;
    echo "Available: {$peripheral->available_stock}" . PHP_EOL;
    echo "Deployed: {$peripheral->deployed_stock}" . PHP_EOL;
    echo "Damaged: {$peripheral->damaged_stock}" . PHP_EOL;
    echo "Serial Count: " . $peripheral->serialNumbers()->count() . PHP_EOL;
    
    // Recalculate based on serial numbers if it uses them
    if ($peripheral->uses_serial_numbers) {
        $availableCount = $peripheral->serialNumbers()->where('status', 'available')->count();
        $deployedCount = $peripheral->serialNumbers()->where('status', 'deployed')->count();
        $damagedCount = $peripheral->serialNumbers()->where('status', 'damaged')->count();
        $totalCount = $availableCount + $deployedCount + $damagedCount;
        
        $peripheral->update([
            'available_stock' => $availableCount,
            'deployed_stock' => $deployedCount,
            'damaged_stock' => $damagedCount,
            'total_stock' => $totalCount
        ]);
        
        echo PHP_EOL . 'After fix:' . PHP_EOL;
        $peripheral->refresh();
        echo "Total Stock: {$peripheral->total_stock}" . PHP_EOL;
        echo "Available: {$peripheral->available_stock}" . PHP_EOL;
        echo "Deployed: {$peripheral->deployed_stock}" . PHP_EOL;
        echo "Damaged: {$peripheral->damaged_stock}" . PHP_EOL;
    }
} else {
    echo 'Peripheral not found' . PHP_EOL;
}
