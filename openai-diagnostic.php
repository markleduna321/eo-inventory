<?php
/**
 * OpenAI API Connection Validator
 * 
 * This script will check the validity of your OpenAI API key and test various models
 * for availability in your current environment.
 */

// Bootstrap the Laravel application to access environment variables
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

// Configurable settings
$apiKey = env('OPENAI_API_KEY');
$defaultModel = env('OPENAI_MODEL', 'gpt-4');
$fallbackModels = ['gpt-3.5-turbo', 'gpt-3.5-turbo-1106', 'gpt-4-0613'];
$environment = app()->environment();

// Header
echo "================================================\n";
echo "       OpenAI API Connection Validator           \n";
echo "================================================\n";
echo "Environment: " . $environment . "\n";
echo "Default model: " . $defaultModel . "\n\n";

if (!$apiKey) {
    echo "❌ ERROR: No OpenAI API key found in environment variables.\n";
    echo "   Please check your .env file and ensure OPENAI_API_KEY is set.\n";
    exit(1);
}

// Mask API key for security in output
$maskedKey = substr($apiKey, 0, 8) . '...' . substr($apiKey, -5);
echo "Using API key: " . $maskedKey . "\n\n";

// 1. First, check the API key validity with a simple models list request
echo "1️⃣ Checking API key validity...\n";
try {
    $modelsResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
    ])->get('https://api.openai.com/v1/models');
    
    if ($modelsResponse->successful()) {
        echo "✅ API key is valid\n";
        
        // Count available models
        $models = $modelsResponse->json()['data'] ?? [];
        $modelCount = count($models);
        echo "   Found {$modelCount} models available to this API key\n\n";
    } else {
        echo "❌ API key validation failed: " . $modelsResponse->status() . "\n";
        echo "   Response: " . $modelsResponse->body() . "\n\n";
        // Continue with tests to get more diagnostic info
    }
} catch (\Exception $e) {
    echo "❌ Exception during API key validation: " . $e->getMessage() . "\n\n";
    // Continue with tests to get more diagnostic info
}

// 2. Test the configured model
echo "2️⃣ Testing default model ({$defaultModel})...\n";
$defaultModelResult = testModel($apiKey, $defaultModel);

// 3. If default failed, test fallback models
if (!$defaultModelResult) {
    echo "\n3️⃣ Testing fallback models...\n";
    foreach ($fallbackModels as $model) {
        echo "\nTrying model: {$model}\n";
        if (testModel($apiKey, $model)) {
            echo "\n✅ Found working fallback model: {$model}\n";
            echo "   Consider updating your .env configuration to use this model instead.\n";
            break;
        }
    }
}

// 4. Check for potential rate limiting
echo "\n4️⃣ Checking for rate limiting issues...\n";
$headers = [];
try {
    // Make a minimal request to check headers
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
    ])->get('https://api.openai.com/v1/models');
    
    // Extract rate limit headers if they exist
    $rateLimitLimit = $response->header('x-ratelimit-limit-requests');
    $rateLimitRemaining = $response->header('x-ratelimit-remaining-requests');
    $rateLimitReset = $response->header('x-ratelimit-reset-requests');
    
    if ($rateLimitLimit && $rateLimitRemaining) {
        echo "Rate limit information found:\n";
        echo "   - Limit: {$rateLimitLimit} requests\n";
        echo "   - Remaining: {$rateLimitRemaining} requests\n";
        if ($rateLimitReset) {
            echo "   - Reset in: {$rateLimitReset} seconds\n";
        }
        
        // Check if we're close to the limit
        if ($rateLimitRemaining < 10) {
            echo "\n⚠️ WARNING: You're close to your rate limit ({$rateLimitRemaining} requests remaining).\n";
            echo "   This could be causing the 'high demand' errors in production.\n";
        } else {
            echo "\n✅ Rate limits look healthy\n";
        }
    } else {
        echo "No specific rate limit information found in headers\n";
    }
} catch (\Exception $e) {
    echo "❌ Exception during rate limit check: " . $e->getMessage() . "\n";
}

// 5. Summary and recommendations
echo "\n================================================\n";
echo "SUMMARY & RECOMMENDATIONS\n";
echo "================================================\n";

if ($defaultModelResult) {
    echo "✅ Your OpenAI configuration appears to be working correctly.\n";
    echo "   If you're still experiencing issues in production, consider:\n";
    echo "   - Implementing more robust error handling\n";
    echo "   - Adding retry logic with exponential backoff\n";
    echo "   - Increasing timeouts for API requests\n";
} else {
    echo "❌ Your current OpenAI configuration has issues.\n";
    echo "   Recommended actions:\n";
    echo "   - Verify your API key is valid for the production environment\n";
    echo "   - Update your .env to use a working model (see fallback tests above)\n";
    echo "   - Implement model fallback logic in your application\n";
    echo "   - Consider upgrading your OpenAI plan if you're hitting rate limits\n";
}

/**
 * Test a specific model with a simple completion request
 */
function testModel($apiKey, $model) {
    try {
        $startTime = microtime(true);
        
        $response = Http::timeout(10)->withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => 'Reply with just one word: "Working"'
                ]
            ],
            'max_tokens' => 10
        ]);
        
        $duration = round(microtime(true) - $startTime, 2);
        
        if ($response->successful()) {
            $content = $response->json()['choices'][0]['message']['content'] ?? 'No content';
            echo "✅ Model test successful! ({$duration}s)\n";
            echo "   Response: \"{$content}\"\n";
            return true;
        } else {
            echo "❌ Model test failed with status code: " . $response->status() . " ({$duration}s)\n";
            echo "   Error: " . ($response->json()['error']['message'] ?? $response->body()) . "\n";
            return false;
        }
    } catch (\Exception $e) {
        echo "❌ Exception testing model: " . $e->getMessage() . "\n";
        return false;
    }
}
