<?php

require_once 'vendor/autoload.php';

use App\Services\InventoryDataContextService;
use App\Services\OpenAIService;
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

echo "Testing Enhanced AI with Asset Specifications\n";
echo "===============================================\n\n";

try {
    $dataService = new InventoryDataContextService();
    $openAIService = new OpenAIService();

    // Get enhanced data with specifications
    $inventoryData = $dataService->getComprehensiveInventoryData();
    
    echo "Data Structure Overview:\n";
    echo "- Total Assets: " . ($inventoryData['summary']['total_assets'] ?? 'Unknown') . "\n";
    echo "- Total Value: $" . number_format($inventoryData['summary']['total_value'] ?? 0, 2) . "\n\n";
    
    // Check if specification data is included
    echo "Specifications Data Check:\n";
    
    if (isset($inventoryData['system_units']['specifications'])) {
        echo "✓ SystemUnit specifications found\n";
        $specCount = count($inventoryData['system_units']['specifications']);
        echo "  - Specification types: $specCount\n";
    } else {
        echo "✗ SystemUnit specifications missing\n";
    }
    
    if (isset($inventoryData['monitors']['specifications'])) {
        echo "✓ Monitor specifications found\n";
        $monitorSpecs = $inventoryData['monitors']['specifications'];
        echo "  - Size distribution: " . count($monitorSpecs['size_distribution'] ?? []) . " sizes\n";
        echo "  - Resolution distribution: " . count($monitorSpecs['resolution_distribution'] ?? []) . " resolutions\n";
    } else {
        echo "✗ Monitor specifications missing\n";
    }
    
    if (isset($inventoryData['other_assets']['specifications'])) {
        echo "✓ OtherAsset specifications found\n";
        $assetSpecCount = count($inventoryData['other_assets']['specifications']);
        echo "  - Specification types: $assetSpecCount\n";
    } else {
        echo "✗ OtherAsset specifications missing\n";
    }
    
    echo "\nDetailed Asset Lists Check:\n";
    
    if (isset($inventoryData['system_units']['detailed_list'])) {
        $unitCount = count($inventoryData['system_units']['detailed_list']);
        echo "✓ SystemUnit detailed list: $unitCount items\n";
        if ($unitCount > 0) {
            $firstUnit = $inventoryData['system_units']['detailed_list'][0];
            echo "  - Sample unit fields: " . implode(', ', array_keys($firstUnit)) . "\n";
        }
    }
    
    if (isset($inventoryData['monitors']['detailed_list'])) {
        $monitorCount = count($inventoryData['monitors']['detailed_list']);
        echo "✓ Monitor detailed list: $monitorCount items\n";
        if ($monitorCount > 0) {
            $firstMonitor = $inventoryData['monitors']['detailed_list'][0];
            echo "  - Sample monitor fields: " . implode(', ', array_keys($firstMonitor)) . "\n";
        }
    }
    
    if (isset($inventoryData['other_assets']['detailed_list'])) {
        $assetCount = count($inventoryData['other_assets']['detailed_list']);
        echo "✓ OtherAsset detailed list: $assetCount items\n";
        if ($assetCount > 0) {
            $firstAsset = $inventoryData['other_assets']['detailed_list'][0];
            echo "  - Sample asset fields: " . implode(', ', array_keys($firstAsset)) . "\n";
        }
    }
    
    // Test AI with specification query
    echo "\n\nTesting AI Response for Asset Specifications:\n";
    echo "==============================================\n";
    
    $question = "What are the specifications of our system units, monitors, and other assets? Please provide detailed information about their technical specifications.";
    
    $aiResponse = $openAIService->generateIntelligentInventoryResponse($question, $inventoryData);
    
    echo "AI Response:\n";
    echo $aiResponse . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
