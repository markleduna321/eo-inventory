<?php
/**
 * Production AI Debugging Script
 * This script helps diagnose AI issues in production environment
 */

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "================================================\n";
echo "       Production AI Debugging Script\n";
echo "================================================\n";
echo "Environment: " . config('app.env') . "\n";
echo "Debug mode: " . (config('app.debug') ? 'enabled' : 'disabled') . "\n";
echo "Time: " . now()->toDateTimeString() . "\n\n";

// Test questions that work vs don't work
$testQuestions = [
    'Which department has the highest number of monitors?', // This works
    'What is the total value of our inventory?',           // This doesn't work
    'How many system units do we have?',
    'Which location has the most assets?'
];

// Check OpenAI configuration
echo "1️⃣ Checking OpenAI Configuration...\n";
echo "   API Key: " . (env('OPENAI_API_KEY') ? 'Present (' . substr(env('OPENAI_API_KEY'), 0, 10) . '...)' : 'Missing') . "\n";
echo "   Model: " . env('OPENAI_MODEL', 'Not set') . "\n";
echo "   Temperature: " . env('OPENAI_TEMPERATURE', 'Not set') . "\n";
echo "   Max Tokens: " . env('OPENAI_MAX_TOKENS', 'Not set') . "\n";
echo "   Max Retries: " . env('OPENAI_MAX_RETRIES', 'Not set') . "\n\n";

// Check if OpenAI service exists
echo "2️⃣ Checking OpenAI Service...\n";
try {
    $openAIService = app()->make(\App\Services\OpenAIService::class);
    echo "   ✅ OpenAI Service loaded successfully\n";
    
    // Test basic OpenAI connectivity
    echo "   Testing basic connectivity...\n";
    $testResult = $openAIService->generateResponse(
        'You are a helpful assistant.',
        'Say "Hello" in one word.'
    );
    
    if ($testResult['success']) {
        echo "   ✅ Basic OpenAI test successful\n";
        echo "   Response: " . $testResult['content'] . "\n";
    } else {
        echo "   ❌ Basic OpenAI test failed\n";
        echo "   Error: " . json_encode($testResult['error']) . "\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Failed to load OpenAI Service\n";
    echo "   Error: " . $e->getMessage() . "\n";
}
echo "\n";

// Test the ReportController AI method directly
echo "3️⃣ Testing ReportController AI functionality...\n";
try {
    $controller = new \App\Http\Controllers\ReportController();
    
    foreach ($testQuestions as $question) {
        echo "   Testing: '$question'\n";
        
        // Create a mock request
        $request = new \Illuminate\Http\Request();
        $request->merge(['question' => $question]);
        
        try {
            $response = $controller->askAI($request);
            $responseData = $response->getData(true);
            
            if (isset($responseData['success']) && $responseData['success']) {
                echo "   ✅ Success: " . substr($responseData['answer'] ?? 'No answer', 0, 100) . "...\n";
            } else {
                echo "   ❌ Failed: " . ($responseData['message'] ?? 'Unknown error') . "\n";
                if (isset($responseData['error'])) {
                    echo "   Error details: " . json_encode($responseData['error']) . "\n";
                }
            }
        } catch (\Exception $e) {
            echo "   ❌ Exception: " . $e->getMessage() . "\n";
            echo "   Line: " . $e->getFile() . ':' . $e->getLine() . "\n";
        }
        
        echo "\n";
    }
} catch (\Exception $e) {
    echo "   ❌ Failed to instantiate ReportController\n";
    echo "   Error: " . $e->getMessage() . "\n";
}

// Check Laravel logs for recent AI-related errors
echo "4️⃣ Checking recent Laravel logs...\n";
try {
    $logPath = storage_path('logs/laravel.log');
    if (file_exists($logPath)) {
        $logContent = file_get_contents($logPath);
        $lines = explode("\n", $logContent);
        $recentLines = array_slice($lines, -50); // Last 50 lines
        
        $aiRelatedLines = array_filter($recentLines, function($line) {
            return stripos($line, 'openai') !== false || 
                   stripos($line, 'ai request') !== false ||
                   stripos($line, 'ai response') !== false ||
                   stripos($line, 'generateairesponse') !== false;
        });
        
        if (!empty($aiRelatedLines)) {
            echo "   Recent AI-related log entries:\n";
            foreach ($aiRelatedLines as $line) {
                echo "   " . $line . "\n";
            }
        } else {
            echo "   No recent AI-related log entries found\n";
        }
    } else {
        echo "   Laravel log file not found at: $logPath\n";
    }
} catch (\Exception $e) {
    echo "   Error reading logs: " . $e->getMessage() . "\n";
}
echo "\n";

// Memory and resource check
echo "5️⃣ Resource Information...\n";
echo "   Memory limit: " . ini_get('memory_limit') . "\n";
echo "   Max execution time: " . ini_get('max_execution_time') . "\n";
echo "   Current memory usage: " . round(memory_get_usage(true) / 1024 / 1024, 2) . " MB\n";
echo "   Peak memory usage: " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB\n\n";

echo "================================================\n";
echo "Debug completed at " . now()->toDateTimeString() . "\n";
echo "================================================\n";
