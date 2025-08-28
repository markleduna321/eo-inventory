<?php

require_once 'vendor/autoload.php';

use App\Services\InventoryDataContextService;
use Illuminate\Database\Capsule\Manager as Capsule;
use Dotenv\Dotenv;

// Load environment
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Setup database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $_ENV['DB_HOST'],
    'port' => $_ENV['DB_PORT'],
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Testing Enhanced Inventory Data with Specifications\n";
echo "==================================================\n\n";

try {
    $dataService = new InventoryDataContextService();

    // Get enhanced data with specifications
    $inventoryData = $dataService->getComprehensiveSystemData();
    
    echo "Data Structure Overview:\n";
    echo "- Total Assets: " . ($inventoryData['summary']['total_assets'] ?? 'Unknown') . "\n";
    echo "- Total Value: $" . number_format($inventoryData['summary']['total_value'] ?? 0, 2) . "\n\n";
    
    // Check if specification data is included
    echo "Specifications Data Check:\n";
    echo "=========================\n";
    
    if (isset($inventoryData['system_units']['specifications'])) {
        echo "✓ SystemUnit specifications found\n";
        $specCount = count($inventoryData['system_units']['specifications']);
        echo "  - Specification types: $specCount\n";
        if ($specCount > 0) {
            echo "  - Available specs: " . implode(', ', array_keys($inventoryData['system_units']['specifications'])) . "\n";
        }
    } else {
        echo "✗ SystemUnit specifications missing\n";
    }
    
    if (isset($inventoryData['monitors']['specifications'])) {
        echo "✓ Monitor specifications found\n";
        $monitorSpecs = $inventoryData['monitors']['specifications'];
        echo "  - Size distribution: " . count($monitorSpecs['size_distribution'] ?? []) . " sizes\n";
        echo "  - Resolution distribution: " . count($monitorSpecs['resolution_distribution'] ?? []) . " resolutions\n";
        echo "  - Refresh rate distribution: " . count($monitorSpecs['refresh_rate_distribution'] ?? []) . " rates\n";
    } else {
        echo "✗ Monitor specifications missing\n";
    }
    
    if (isset($inventoryData['other_assets']['specifications'])) {
        echo "✓ OtherAsset specifications found\n";
        $assetSpecCount = count($inventoryData['other_assets']['specifications']);
        echo "  - Specification types: $assetSpecCount\n";
        if ($assetSpecCount > 0) {
            echo "  - Available specs: " . implode(', ', array_keys($inventoryData['other_assets']['specifications'])) . "\n";
        }
    } else {
        echo "✗ OtherAsset specifications missing\n";
    }
    
    echo "\nDetailed Asset Lists Check:\n";
    echo "===========================\n";
    
    if (isset($inventoryData['system_units']['detailed_list'])) {
        $unitCount = count($inventoryData['system_units']['detailed_list']);
        echo "✓ SystemUnit detailed list: $unitCount items\n";
        if ($unitCount > 0) {
            $firstUnit = $inventoryData['system_units']['detailed_list'][0];
            echo "  - Sample unit fields: " . implode(', ', array_keys($firstUnit)) . "\n";
            if (isset($firstUnit['specifications']) && is_array($firstUnit['specifications'])) {
                echo "  - Sample specifications: " . implode(', ', array_keys($firstUnit['specifications'])) . "\n";
            }
        }
    }
    
    if (isset($inventoryData['monitors']['detailed_list'])) {
        $monitorCount = count($inventoryData['monitors']['detailed_list']);
        echo "✓ Monitor detailed list: $monitorCount items\n";
        if ($monitorCount > 0) {
            $firstMonitor = $inventoryData['monitors']['detailed_list'][0];
            echo "  - Sample monitor fields: " . implode(', ', array_keys($firstMonitor)) . "\n";
            echo "  - Sample monitor size: " . ($firstMonitor['size'] ?? 'N/A') . "\n";
            echo "  - Sample monitor resolution: " . ($firstMonitor['resolution'] ?? 'N/A') . "\n";
        }
    }
    
    if (isset($inventoryData['other_assets']['detailed_list'])) {
        $assetCount = count($inventoryData['other_assets']['detailed_list']);
        echo "✓ OtherAsset detailed list: $assetCount items\n";
        if ($assetCount > 0) {
            $firstAsset = $inventoryData['other_assets']['detailed_list'][0];
            echo "  - Sample asset fields: " . implode(', ', array_keys($firstAsset)) . "\n";
            if (isset($firstAsset['specifications']) && is_array($firstAsset['specifications'])) {
                echo "  - Sample specifications: " . implode(', ', array_keys($firstAsset['specifications'])) . "\n";
            }
        }
    }
    
    // Show sample data structure for debugging
    echo "\nSample Data Structure (first 3 items):\n";
    echo "======================================\n";
    
    if (isset($inventoryData['system_units']['detailed_list']) && count($inventoryData['system_units']['detailed_list']) > 0) {
        echo "\nSystemUnit Sample:\n";
        print_r(array_slice($inventoryData['system_units']['detailed_list'], 0, 1));
    }
    
    if (isset($inventoryData['monitors']['detailed_list']) && count($inventoryData['monitors']['detailed_list']) > 0) {
        echo "\nMonitor Sample:\n";
        print_r(array_slice($inventoryData['monitors']['detailed_list'], 0, 1));
    }
    
    if (isset($inventoryData['other_assets']['detailed_list']) && count($inventoryData['other_assets']['detailed_list']) > 0) {
        echo "\nOtherAsset Sample:\n";
        print_r(array_slice($inventoryData['other_assets']['detailed_list'], 0, 1));
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
