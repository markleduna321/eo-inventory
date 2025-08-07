<?php

// This script tests the OpenAI API connection

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Get API key from environment
$apiKey = env('OPENAI_API_KEY');
$model = env('OPENAI_MODEL', 'gpt-4');

echo "Testing OpenAI API connection...\n";
echo "Using model: {$model}\n";

if (!$apiKey) {
    echo "Error: OpenAI API key not found in environment variables\n";
    exit(1);
}

// Mask the API key for display
$maskedKey = substr($apiKey, 0, 10) . '...' . substr($apiKey, -5);
echo "API Key found: {$maskedKey}\n";

try {
    echo "Sending test request to OpenAI API...\n";
    
    $startTime = microtime(true);
    
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type' => 'application/json'
    ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
        'model' => $model,
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a helpful assistant for inventory management.'
            ],
            [
                'role' => 'user',
                'content' => 'Which department has the highest number of monitors?'
            ]
        ],
        'max_tokens' => 100
    ]);
    
    $endTime = microtime(true);
    $duration = round($endTime - $startTime, 2);
    
    if ($response->successful()) {
        echo "✅ API request successful! (took {$duration} seconds)\n";
        echo "Response:\n";
        echo $response->json()['choices'][0]['message']['content'] . "\n";
    } else {
        echo "❌ API request failed with status code: " . $response->status() . "\n";
        echo "Error details:\n";
        print_r($response->json());
    }
} catch (\Exception $e) {
    echo "❌ Exception occurred: " . $e->getMessage() . "\n";
    echo "Stack trace:\n";
    echo $e->getTraceAsString() . "\n";
}
