<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Peripheral;

echo "=== Testing getAvailablePeripherals Logic ===\n";

$peripherals = Peripheral::where('status', 'active')
    ->where('available_stock', '>', 0)
    ->where('uses_serial_numbers', false)
    ->orderBy('type')
    ->orderBy('brand')
    ->orderBy('model')
    ->get();

echo "Found " . $peripherals->count() . " peripherals:\n";

foreach ($peripherals as $p) {
    echo "- {$p->id}: {$p->brand} {$p->model} (Available: {$p->available_stock})\n";
}

// Group peripherals by type and brand/model for better organization
$groupedPeripherals = $peripherals->groupBy('type')->map(function($typeGroup) {
    return $typeGroup->groupBy(function($item) {
        return $item->brand . ' - ' . $item->model;
    })->map(function($brandModelGroup) {
        // For each brand/model group, calculate total available stock
        $firstItem = $brandModelGroup->first();
        $totalAvailable = $brandModelGroup->sum('available_stock');
        
        return [
            'id' => $firstItem->id,
            'type' => $firstItem->type,
            'brand' => $firstItem->brand,
            'model' => $firstItem->model,
            'display_name' => $firstItem->brand . ' ' . $firstItem->model,
            'available_stock' => $totalAvailable,
            'items' => $brandModelGroup
        ];
    });
});

echo "\nGrouped data:\n";
echo json_encode($groupedPeripherals, JSON_PRETTY_PRINT);
