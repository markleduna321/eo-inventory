<?php

// Model comparison tool for inventory AI
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$apiKey = env('OPENAI_API_KEY');
$testQuestion = 'Which department has the highest number of monitors?';

// Sample inventory data for testing
$sampleData = [
    'summary' => [
        'total_assets' => 150,
        'by_category' => [
            'monitors' => 45,
            'system_units' => 38,
            'peripherals' => 67
        ]
    ],
    'data' => [
        'monitors' => [
            ['department' => 'IT', 'count' => 18],
            ['department' => 'Engineering', 'count' => 15],
            ['department' => 'Marketing', 'count' => 12]
        ]
    ]
];

$modelsToTest = [
    'gpt-3.5-turbo' => ['temp' => 0.1, 'tokens' => 300],
    'gpt-3.5-turbo-0125' => ['temp' => 0.1, 'tokens' => 300],
    'gpt-4' => ['temp' => 0.3, 'tokens' => 500],
];

echo "================================================\n";
echo "    OpenAI Model Comparison for Inventory AI     \n";
echo "================================================\n\n";

echo "Test Question: $testQuestion\n\n";

foreach ($modelsToTest as $model => $config) {
    echo "Testing model: $model\n";
    echo str_repeat('-', 50) . "\n";
    
    try {
        $startTime = microtime(true);
        
        $response = Http::timeout(20)->withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are InventoryGPT, an expert inventory management assistant. Analyze inventory data and provide accurate, specific answers. Use exact numbers from the data when available.'
                ],
                [
                    'role' => 'user',
                    'content' => "Inventory Data:\n" . json_encode($sampleData) . "\n\nQuestion: $testQuestion\n\nAnswer based only on the provided data with specific numbers."
                ]
            ],
            'temperature' => $config['temp'],
            'max_tokens' => $config['tokens']
        ]);
        
        $duration = round(microtime(true) - $startTime, 2);
        
        if ($response->successful()) {
            $responseData = $response->json();
            $content = $responseData['choices'][0]['message']['content'] ?? 'No content';
            $usage = $responseData['usage'] ?? [];
            
            echo "✅ Success ({$duration}s)\n";
            echo "Response: " . substr($content, 0, 200) . (strlen($content) > 200 ? '...' : '') . "\n";
            echo "Tokens used: " . ($usage['total_tokens'] ?? 'unknown') . "\n";
            echo "Cost estimate: $" . number_format(($usage['total_tokens'] ?? 0) * 0.002 / 1000, 6) . "\n";
            
            // Rate the response quality (simple check)
            $quality = 0;
            if (strpos(strtolower($content), 'it') !== false) $quality += 2;
            if (strpos($content, '18') !== false) $quality += 3;
            if (strpos(strtolower($content), 'department') !== false) $quality += 1;
            
            echo "Quality score: $quality/6\n";
            
        } else {
            echo "❌ Failed with status: " . $response->status() . "\n";
            echo "Error: " . ($response->json()['error']['message'] ?? 'Unknown error') . "\n";
        }
        
    } catch (\Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
    }
    
    echo "\n";
    sleep(2); // Avoid rate limiting
}

echo "================================================\n";
echo "RECOMMENDATIONS\n";
echo "================================================\n\n";

echo "Based on the test results:\n\n";

echo "1. GPT-3.5-turbo (standard):\n";
echo "   - Fastest responses\n";
echo "   - Lowest cost\n";
echo "   - Good for simple inventory queries\n";
echo "   - May need more specific prompts\n\n";

echo "2. GPT-3.5-turbo-0125 (latest):\n";
echo "   - Better instruction following\n";
echo "   - More consistent responses\n";
echo "   - Same cost as standard\n";
echo "   - Recommended for production\n\n";

echo "3. GPT-4:\n";
echo "   - Highest quality responses\n";
echo "   - Better understanding of complex queries\n";
echo "   - Higher cost (about 20x more expensive)\n";
echo "   - Use for complex analysis or when quality is critical\n\n";

echo "For your production environment, consider:\n";
echo "- Start with gpt-3.5-turbo-0125 for best balance\n";
echo "- Enable fallbacks to gpt-3.5-turbo if the first fails\n";
echo "- Keep gpt-4 as a final fallback for complex queries\n";
echo "- Monitor usage and costs through your OpenAI dashboard\n";

echo "\nTo update your configuration:\n";
echo "OPENAI_MODEL=gpt-3.5-turbo-0125\n";
echo "OPENAI_TEMPERATURE=0.1\n";
echo "OPENAI_MAX_TOKENS=300\n";
