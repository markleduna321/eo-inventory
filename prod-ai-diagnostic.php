<?php
/**
 * Production OpenAI API Diagnostic Tool
 * 
 * This script performs comprehensive diagnostics on the OpenAI integration
 * and provides detailed output for troubleshooting production issues.
 */

// Bootstrap the Laravel application to access environment variables
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

// Header
echo "================================================\n";
echo "    Production OpenAI API Diagnostic Tool        \n";
echo "================================================\n";
echo "Environment: " . app()->environment() . "\n";
echo "Date/Time: " . now()->toDateTimeString() . "\n\n";

// Step 1: Check environment variables
echo "1️⃣ Checking environment configuration...\n";
$apiKey = env('OPENAI_API_KEY');
$model = env('OPENAI_MODEL', 'gpt-4');
$temperature = env('OPENAI_TEMPERATURE', 0.3);
$maxTokens = env('OPENAI_MAX_TOKENS', 500);
$maxRetries = env('OPENAI_MAX_RETRIES', 3);
$cacheTime = env('OPENAI_CACHE_TIME', 60);
$useFallback = env('OPENAI_USE_FALLBACK', false);

// Validate API key
if (!$apiKey) {
    echo "❌ ERROR: No OpenAI API key found in environment variables.\n";
    echo "   Please check your .env file and ensure OPENAI_API_KEY is set.\n";
    exit(1);
}

// Display configuration
echo "✅ Configuration found:\n";
echo "   - Model: $model\n";
echo "   - Temperature: $temperature\n";
echo "   - Max Tokens: $maxTokens\n";
echo "   - Max Retries: $maxRetries\n";
echo "   - Cache Time: $cacheTime minutes\n";
echo "   - Use Fallback: " . ($useFallback ? 'true' : 'false') . "\n";

// Mask API key for security in output
$maskedKey = substr($apiKey, 0, 8) . '...' . substr($apiKey, -5);
echo "   - API Key: " . $maskedKey . "\n\n";

// Step 2: Check API key validity
echo "2️⃣ Checking API key validity...\n";
try {
    $startTime = microtime(true);
    $modelsResponse = Http::withHeaders([
        'Authorization' => 'Bearer ' . $apiKey,
    ])->timeout(10)->get('https://api.openai.com/v1/models');
    $duration = round(microtime(true) - $startTime, 2);
    
    if ($modelsResponse->successful()) {
        echo "✅ API key is valid (response time: {$duration}s)\n";
        
        // Count available models
        $models = $modelsResponse->json()['data'] ?? [];
        $modelCount = count($models);
        echo "   Found {$modelCount} models available to this API key\n";
        
        // Check if our configured model exists
        $modelExists = false;
        foreach ($models as $availableModel) {
            if ($availableModel['id'] === $model) {
                $modelExists = true;
                break;
            }
        }
        
        if ($modelExists) {
            echo "   ✅ Configured model '$model' is available\n\n";
        } else {
            echo "   ❌ WARNING: Configured model '$model' was not found in available models\n";
            echo "      Consider updating your OPENAI_MODEL setting\n\n";
        }
    } else {
        $statusCode = $modelsResponse->status();
        echo "❌ API key validation failed: HTTP $statusCode\n";
        echo "   Response: " . $modelsResponse->body() . "\n\n";
        
        if ($statusCode === 401) {
            echo "   ❌ Your API key appears to be invalid or revoked\n\n";
        } elseif ($statusCode === 429) {
            echo "   ❌ You are being rate limited. Check your OpenAI usage dashboard\n\n";
        }
    }
} catch (\Exception $e) {
    echo "❌ Exception during API key validation: " . $e->getMessage() . "\n\n";
}

// Step 3: Test model with different timeouts
echo "3️⃣ Testing model with different timeouts...\n";
$timeouts = [5, 10, 20];
$success = false;

foreach ($timeouts as $timeout) {
    echo "   Testing with {$timeout}s timeout: ";
    try {
        $startTime = microtime(true);
        $response = Http::timeout($timeout)->withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                [
                    'role' => 'user',
                    'content' => 'Reply with one word: "Working"'
                ]
            ],
            'max_tokens' => 10
        ]);
        
        $duration = round(microtime(true) - $startTime, 2);
        
        if ($response->successful()) {
            $content = $response->json()['choices'][0]['message']['content'] ?? 'No content';
            echo "✅ Success ({$duration}s)\n";
            echo "      Response: \"{$content}\"\n";
            $success = true;
            break;
        } else {
            echo "❌ Failed with status " . $response->status() . " ({$duration}s)\n";
            echo "      Error: " . ($response->json()['error']['message'] ?? $response->body()) . "\n";
        }
    } catch (\Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n";
    }
}

if (!$success) {
    echo "\n   ❌ All timeout tests failed. This may indicate connectivity issues or severe rate limiting\n\n";
} else {
    echo "\n   ✅ Model test succeeded with {$timeout}s timeout\n\n";
}

// Step 4: Check network connectivity
echo "4️⃣ Checking network connectivity...\n";
try {
    $startTime = microtime(true);
    $response = Http::timeout(5)->get('https://api.openai.com/v1/models');
    $duration = round(microtime(true) - $startTime, 2);
    echo "   ✅ OpenAI API is reachable (ping: {$duration}s)\n";
    
    // Check for proxy issues
    $headers = $response->headers();
    if (isset($headers['via']) || isset($headers['proxy-connection'])) {
        echo "   ⚠️ Request seems to be going through a proxy\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Network connectivity issue: " . $e->getMessage() . "\n";
    echo "      This could indicate firewall restrictions or network issues\n";
}

// Try an alternative connection test
try {
    $startTime = microtime(true);
    $response = Http::timeout(5)->get('https://platform.openai.com');
    $duration = round(microtime(true) - $startTime, 2);
    echo "   ✅ OpenAI platform is reachable (ping: {$duration}s)\n\n";
} catch (\Exception $e) {
    echo "   ❌ Cannot reach OpenAI platform: " . $e->getMessage() . "\n\n";
}

// Step 5: Check for rate limiting issues
echo "5️⃣ Checking for rate limiting issues...\n";
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
        echo "   Rate limit information found:\n";
        echo "   - Limit: {$rateLimitLimit} requests\n";
        echo "   - Remaining: {$rateLimitRemaining} requests\n";
        if ($rateLimitReset) {
            echo "   - Reset in: {$rateLimitReset} seconds\n";
        }
        
        // Check if we're close to the limit
        if ($rateLimitRemaining < 10) {
            echo "\n   ⚠️ WARNING: You're close to your rate limit ({$rateLimitRemaining} requests remaining).\n";
            echo "      This could be causing the 'high demand' errors in production.\n";
        } else {
            echo "\n   ✅ Rate limits look healthy\n";
        }
    } else {
        echo "   No specific rate limit information found in headers\n";
        
        // Try to determine if we're rate limited through a test request
        $testResponse = Http::timeout(10)->withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => $model,
            'messages' => [
                ['role' => 'user', 'content' => 'Test']
            ],
            'max_tokens' => 5
        ]);
        
        if (!$testResponse->successful() && $testResponse->status() === 429) {
            echo "   ❌ Rate limiting detected through test request!\n";
            echo "      Error: " . ($testResponse->json()['error']['message'] ?? 'Unknown error') . "\n";
        } else {
            echo "   ✅ No rate limiting detected through test request\n";
        }
    }
} catch (\Exception $e) {
    echo "   ❌ Exception during rate limit check: " . $e->getMessage() . "\n";
}

// Step 6: Test the OpenAI service class
echo "\n6️⃣ Testing OpenAI service implementation...\n";
try {
    // Check if OpenAIService class exists
    if (class_exists('App\Services\OpenAIService')) {
        echo "   ✅ OpenAIService class exists\n";
        
        // Create an instance of the service
        $openAIService = app()->make('App\Services\OpenAIService');
        
        // Test the connection method if it exists
        if (method_exists($openAIService, 'testConnection')) {
            $result = $openAIService->testConnection();
            
            if ($result['success']) {
                echo "   ✅ Service connection test successful\n";
                echo "      Response: " . $result['response'] . "\n";
            } else {
                echo "   ❌ Service connection test failed\n";
                echo "      Error: " . $result['message'] . "\n";
            }
        } else {
            echo "   ℹ️ testConnection method not found, skipping service test\n";
        }
        
        // Test the generateResponse method if it exists
        if (method_exists($openAIService, 'generateResponse')) {
            echo "   ✅ generateResponse method exists\n";
            $result = $openAIService->generateResponse(
                'You are a test assistant',
                'Reply with one word: Testing',
                ['temperature' => 0.1, 'maxTokens' => 10]
            );
            
            if (isset($result['success']) && $result['success']) {
                echo "   ✅ generateResponse test successful\n";
                echo "      Response: " . $result['content'] . "\n";
                echo "      Model used: " . ($result['model'] ?? 'unknown') . "\n";
            } else {
                echo "   ❌ generateResponse test failed\n";
                echo "      Error: " . (isset($result['error']) ? $result['error']['message'] : 'Unknown error') . "\n";
            }
        } else {
            echo "   ℹ️ generateResponse method not found, skipping method test\n";
        }
    } else {
        echo "   ❌ OpenAIService class not found!\n";
        echo "      Make sure the class is properly deployed at app/Services/OpenAIService.php\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Exception testing OpenAIService: " . $e->getMessage() . "\n";
}

// Step 7: Check Laravel cache configuration
echo "\n7️⃣ Checking cache configuration...\n";
try {
    $driver = config('cache.default');
    $store = config('cache.stores.' . $driver);
    
    echo "   Cache driver: {$driver}\n";
    
    if ($driver === 'file') {
        $path = $store['path'] ?? storage_path('framework/cache/data');
        echo "   Cache path: {$path}\n";
        
        // Check if cache path is writable
        if (is_writable($path)) {
            echo "   ✅ Cache path is writable\n";
        } else {
            echo "   ❌ Cache path is not writable! This will prevent caching from working\n";
        }
    }
    
    // Test cache functionality
    $cacheKey = 'openai_test_' . time();
    $cacheValue = 'test_value_' . time();
    
    // Try to write to cache
    Cache::put($cacheKey, $cacheValue, 1);
    
    // Try to read from cache
    $retrievedValue = Cache::get($cacheKey);
    
    if ($retrievedValue === $cacheValue) {
        echo "   ✅ Cache is working correctly\n";
    } else {
        echo "   ❌ Cache test failed! Retrieved value doesn't match stored value\n";
        echo "      This will prevent the OpenAI response caching from working\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Exception testing cache: " . $e->getMessage() . "\n";
}

// Step 8: Summary and recommendations
echo "\n================================================\n";
echo "SUMMARY & RECOMMENDATIONS\n";
echo "================================================\n";

if ($success) {
    echo "✅ Basic OpenAI API connectivity is working\n\n";
} else {
    echo "❌ OpenAI API connectivity is NOT working\n\n";
}

echo "Recommended checks and actions:\n\n";

echo "1. Application Logs\n";
echo "   Check Laravel logs for OpenAI-related errors:\n";
echo "   tail -n 100 storage/logs/laravel.log | grep -i openai\n\n";

echo "2. Environment Configuration\n";
echo "   Verify these settings in your production .env file:\n";
echo "   - OPENAI_API_KEY is correct and not expired\n";
echo "   - OPENAI_MODEL is available to your account\n";
echo "   - OPENAI_MAX_RETRIES=3 (allows for retry attempts)\n";
echo "   - OPENAI_CACHE_TIME=60 (for response caching)\n";
echo "   - OPENAI_USE_FALLBACK=true (consider setting to true if API issues persist)\n\n";

echo "3. Server Environment\n";
echo "   Verify these server settings:\n";
echo "   - PHP has OpenSSL extension enabled\n";
echo "   - Server can make outbound HTTPS connections\n";
echo "   - PHP timeout settings allow for longer API calls\n";
echo "   - Server firewall allows connections to api.openai.com\n\n";

echo "4. Try Alternative Models\n";
echo "   If using GPT-4 is causing issues, try:\n";
echo "   - Set OPENAI_MODEL=gpt-3.5-turbo in .env\n";
echo "   - This model has higher rate limits and faster response times\n\n";

echo "5. Additional Debugging\n";
echo "   - Check if your account has been flagged or restricted\n";
echo "   - Verify billing status on your OpenAI account\n";
echo "   - Consider implementing better error logging in OpenAIService.php\n";

// Done
echo "\n================================================\n";
echo "Diagnostic completed at: " . now()->toDateTimeString() . "\n";
echo "================================================\n";
