<?php

require_once 'vendor/autoload.php';

use App\Services\InventoryDataContextService;
use Illuminate\Support\Facades\App;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing each method individually to find the failing one...\n\n";

$contextService = new InventoryDataContextService();
$reflection = new ReflectionClass($contextService);

$methods = [
    'getSystemSummary',
    'getAssetData', 
    'getFinancialData',
    'getLocationData',
    'getUserData',
    'getRequestData',
    'getInventoryHealth',
    'getDataRelationships',
    'getTrendData',
    'getSystemMetadata'
];

foreach ($methods as $methodName) {
    try {
        echo "Testing $methodName()... ";
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);
        $result = $method->invoke($contextService);
        echo "✅ SUCCESS\n";
    } catch (Exception $e) {
        echo "❌ FAILED\n";
        echo "  Error: " . $e->getMessage() . "\n";
        echo "  File: " . $e->getFile() . ":" . $e->getLine() . "\n";
        echo "  Type: " . get_class($e) . "\n\n";
        break; // Stop at first failure
    }
}

echo "\nDone!\n";
