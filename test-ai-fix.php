<?php

require_once 'vendor/autoload.php';

use App\Services\InventoryDataContextService;
use App\Services\OpenAIService;
use Illuminate\Support\Facades\App;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Testing InventoryDataContextService...\n";
    
    $contextService = new InventoryDataContextService();
    $reflection = new ReflectionClass($contextService);
    
    // Test individual methods to find the issue
    echo "Testing getSystemSummary()...\n";
    $method = $reflection->getMethod('getSystemSummary');
    $method->setAccessible(true);
    $summary = $method->invoke($contextService);
    echo "✅ Summary worked!\n";
    
    echo "Testing getAssetData()...\n";
    $method = $reflection->getMethod('getAssetData');
    $method->setAccessible(true);
    $assetData = $method->invoke($contextService);
    echo "✅ Asset data worked!\n";
    
    echo "Testing getFinancialData()...\n";
    $method = $reflection->getMethod('getFinancialData');
    $method->setAccessible(true);
    $financialData = $method->invoke($contextService);
    echo "✅ Financial data worked!\n";
    
    $data = $contextService->getComprehensiveSystemData();
    
    echo "✅ InventoryDataContextService works successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "File: " . $e->getFile() . "\n";
}

try {
    echo "\nTesting OpenAI Service...\n";
    
    $openAIService = new OpenAIService();
    $response = $openAIService->generateIntelligentInventoryResponse("What is the total value of our inventory?");
    
    echo "✅ OpenAI Service works successfully!\n";
    echo "Response type: " . gettype($response) . "\n";
    if (is_array($response)) {
        echo "Response keys: " . implode(', ', array_keys($response)) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error in OpenAI Service: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\nTest completed!\n";
