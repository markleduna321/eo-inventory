<?php

require_once 'vendor/autoload.php';

use App\Services\OpenAIService;
use Illuminate\Support\Facades\App;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    echo "Testing OpenAI Service with real data...\n\n";
    
    $openAIService = new OpenAIService();
    $response = $openAIService->generateIntelligentInventoryResponse("What is the total value of our inventory?");
    
    echo "=== RESPONSE STRUCTURE ===\n";
    echo "Response type: " . gettype($response) . "\n";
    echo "Response keys: " . implode(', ', array_keys($response)) . "\n\n";
    
    if (isset($response['success']) && $response['success']) {
        echo "✅ AI Service successful!\n";
        if (isset($response['response'])) {
            echo "Response length: " . strlen($response['response']) . " characters\n";
            echo "First 200 chars: " . substr($response['response'], 0, 200) . "...\n";
        }
    } else {
        echo "❌ AI Service failed\n";
        if (isset($response['error'])) {
            echo "Error: " . json_encode($response['error']) . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Exception: " . $e->getMessage() . "\n";
}
