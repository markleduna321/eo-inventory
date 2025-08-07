<?php

// Test the AI reporting with real inventory data simulation
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;

echo "Testing AI Reporting with GPT-3.5-turbo...\n\n";

// Create a test request
$request = new Request();
$request->merge([
    'question' => 'Which department has the highest number of monitors?'
]);

try {
    $controller = new ReportController();
    $response = $controller->askAI($request);
    
    $responseData = $response->original;
    
    echo "Question: " . $request->input('question') . "\n";
    echo "Status: " . ($responseData ? 'Success' : 'Failed') . "\n";
    
    if ($responseData && isset($responseData['answer'])) {
        echo "Answer: " . $responseData['answer'] . "\n";
        
        if (isset($responseData['model'])) {
            echo "Model used: " . $responseData['model'] . "\n";
        }
        
        if (isset($responseData['retries'])) {
            echo "Retries: " . $responseData['retries'] . "\n";
        }
        
        if (isset($responseData['relevantData']) && !empty($responseData['relevantData'])) {
            echo "Relevant data points found: " . count($responseData['relevantData']) . "\n";
        }
    } else {
        echo "Error: No answer received\n";
        if ($responseData && isset($responseData['error'])) {
            echo "Error details: " . print_r($responseData['error'], true) . "\n";
        }
    }
    
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}

echo "\n--- Testing with different questions ---\n\n";

$testQuestions = [
    'What is the total value of our inventory?',
    'How many system units do we have?',
    'Which location has the most assets?',
    'What is our current asset utilization rate?'
];

foreach ($testQuestions as $question) {
    $request = new Request();
    $request->merge(['question' => $question]);
    
    try {
        $response = $controller->askAI($request);
        $responseData = $response->original;
        
        echo "Q: $question\n";
        
        if ($responseData && isset($responseData['answer'])) {
            $answer = substr($responseData['answer'], 0, 100) . (strlen($responseData['answer']) > 100 ? '...' : '');
            echo "A: $answer\n";
            echo "Status: ✅ Success\n";
        } else {
            echo "Status: ❌ Failed\n";
            if ($responseData && isset($responseData['error'])) {
                echo "Error: " . $responseData['error'] . "\n";
            }
        }
        
        echo "\n";
        
        // Small delay to avoid rate limiting
        sleep(1);
        
    } catch (\Exception $e) {
        echo "Exception: " . $e->getMessage() . "\n\n";
    }
}

echo "Test completed.\n";
