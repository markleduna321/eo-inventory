<?php

require_once 'vendor/autoload.php';

use App\Services\InventoryDataContextService;
use Illuminate\Support\Facades\App;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Testing InventoryDataContextService...\n";
    
    $contextService = new InventoryDataContextService();
    $data = $contextService->getComprehensiveSystemData();
    
    echo "=== DATA STRUCTURE ===\n";
    echo "Main keys: " . implode(', ', array_keys($data)) . "\n\n";
    
    if (isset($data['summary'])) {
        echo "=== SUMMARY ===\n";
        foreach ($data['summary'] as $key => $value) {
            echo "$key: $value\n";
        }
        echo "\n";
    }
    
    if (isset($data['error'])) {
        echo "=== ERROR ===\n";
        echo $data['error'] . "\n\n";
    }
    
    if (isset($data['assets'])) {
        echo "=== ASSETS ===\n";
        echo "Asset types: " . implode(', ', array_keys($data['assets'])) . "\n";
        
        if (isset($data['assets']['devices'])) {
            echo "Device stats keys: " . implode(', ', array_keys($data['assets']['devices'])) . "\n";
            echo "Total devices: " . ($data['assets']['devices']['total_count'] ?? 'Unknown') . "\n";
        }
        echo "\n";
    }
    
    if (isset($data['financial'])) {
        echo "=== FINANCIAL ===\n";
        echo "Financial keys: " . implode(', ', array_keys($data['financial'])) . "\n\n";
    }
    
    echo "✅ Test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}
