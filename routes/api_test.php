<?php

use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

// Direct test to the ask-ai endpoint with simplified logic
Route::post('/direct-ask-ai-test', function (Request $request) {
    $question = $request->input('question', 'Which department has the highest number of monitors?');
    
    try {
        $reportController = app()->make(ReportController::class);
        $response = $reportController->askAI($request);
        
        return response()->json([
            'status' => 'success',
            'originalQuestion' => $question,
            'response' => $response->original,
            'environment' => app()->environment()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Mock AI endpoint that returns pre-defined responses for testing
Route::post('/test-ask-ai', function (Request $request) {
    $question = $request->input('question', 'What is our inventory status?');
    $questionLower = strtolower($question);
    
    // Define a set of mock responses for common questions
    $mockResponses = [
        'monitor' => [
            'answer' => 'Based on the inventory data, the IT department has the highest number of monitors with 42 units, followed by Engineering with 38 units. Overall, we have 152 monitors across all departments with 85% utilization rate.',
            'data' => [
                'IT_Department' => 42,
                'Engineering' => 38,
                'Marketing' => 27,
                'Sales' => 18,
                'Finance' => 15,
                'total_monitors' => 152,
                'utilization_rate' => '85%'
            ]
        ],
        'value' => [
            'answer' => 'The total value of your inventory is $2,347,850. This includes $895,200 in monitors, $1,125,400 in system units, $180,750 in peripherals, and $146,500 in spare parts.',
            'data' => [
                'total_value' => '$2,347,850',
                'monitors_value' => '$895,200',
                'system_units_value' => '$1,125,400',
                'peripherals_value' => '$180,750',
                'parts_value' => '$146,500'
            ]
        ],
        'stock' => [
            'answer' => 'Currently, we have 18 parts that are below the minimum stock level. The most critical items are: Laptop RAM modules (2 remaining, minimum 5), Power supplies (3 remaining, minimum 10), and SSD drives (4 remaining, minimum 8).',
            'data' => [
                'critical_parts_count' => 18,
                'lowest_stock_items' => [
                    'Laptop RAM modules' => 2,
                    'Power supplies' => 3,
                    'SSD drives' => 4
                ]
            ]
        ],
        'utilization' => [
            'answer' => 'The overall asset utilization rate last month was 82.3%, which is a 3.5% increase from the previous month. Monitors have the highest utilization at 89.1%, followed by system units at 83.7% and peripherals at 74.2%.',
            'data' => [
                'overall_utilization' => '82.3%',
                'month_over_month_change' => '+3.5%',
                'monitors_utilization' => '89.1%',
                'system_units_utilization' => '83.7%',
                'peripherals_utilization' => '74.2%'
            ]
        ]
    ];
    
    // Determine which mock response to use based on keywords
    $responseType = 'general';
    foreach ($mockResponses as $keyword => $response) {
        if (strpos($questionLower, $keyword) !== false) {
            $responseType = $keyword;
            break;
        }
    }
    
    // Default response if no specific match
    $response = $mockResponses[$responseType] ?? [
        'answer' => 'Based on the inventory data, you have 152 monitors, 128 system units, 304 peripherals, and 1,250 spare parts across all departments. The overall inventory utilization rate is 78.5%.',
        'data' => [
            'total_monitors' => 152,
            'total_system_units' => 128,
            'total_peripherals' => 304,
            'total_parts' => 1250,
            'utilization_rate' => '78.5%'
        ]
    ];
    
    // Add metadata for completeness
    $response['question'] = $question;
    $response['generatedAt'] = now()->toDateTimeString();
    $response['is_test'] = true;
    
    return response()->json($response);
});

Route::get('/test-openai', function () {
    try {
        $apiKey = env('OPENAI_API_KEY');
        
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'API key not found in environment variables'
            ], 500);
        }
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type' => 'application/json'
        ])->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are a helpful assistant.'
                ],
                [
                    'role' => 'user',
                    'content' => 'Test message - is this API key working?'
                ]
            ],
            'max_tokens' => 50
        ]);
        
        if ($response->successful()) {
            return response()->json([
                'status' => 'success',
                'message' => 'API key is valid',
                'response' => $response->json()
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'API request failed',
                'details' => $response->json()
            ], 500);
        }
    } catch (\Exception $e) {
        Log::error('OpenAI API Test Error: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Exception occurred: ' . $e->getMessage()
        ], 500);
    }
});
