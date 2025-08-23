<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\OtherAssetController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\MonitorController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\StationHistoryController;
use App\Http\Controllers\PeripheralController;
use App\Http\Controllers\PeripheralSerialController;
use App\Http\Controllers\PartController;
use App\Http\Controllers\SystemUnitController;
use App\Http\Controllers\SystemUnitStatsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Protected routes that require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'getUsers']);
    Route::resource('usermanagement', UserController::class);

    // Role management routes
    Route::apiResource('roles', RoleController::class);

    // Device management routes
    Route::apiResource('devices', DeviceController::class);

    // Monitor management routes
    Route::apiResource('monitors', MonitorController::class);

    // Location management routes
    Route::get('locations/statistics', [LocationController::class, 'statistics']);
    Route::apiResource('locations', LocationController::class);
});

// Station management routes
Route::get('stations/available-monitors', [StationController::class, 'getAvailableMonitors']);
Route::get('stations/available-system-units', [StationController::class, 'getAvailableSystemUnits']);
Route::get('stations/available-peripherals', [StationController::class, 'getAvailablePeripherals']);
Route::get('stations/available-peripherals-with-serials', [StationController::class, 'getAvailablePeripheralsWithSerials']);
Route::get('stations/locations', [StationController::class, 'getLocations']);
Route::get('stations/qr/{qrCode}', [StationController::class, 'showByQrCode']);

// Protected station routes that require authentication
Route::middleware('auth:sanctum')->group(function () {
    Route::post('stations/{station}/assign-asset', [StationController::class, 'assignAsset']);
    Route::post('stations/{station}/unassign-asset', [StationController::class, 'unassignAsset']);
    Route::post('stations/{station}/assign-peripherals', [StationController::class, 'assignPeripherals']);
    Route::get('stations/{station}/history', [StationHistoryController::class, 'index']);
    Route::apiResource('stations', StationController::class);
});

// Peripheral management routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('peripherals/{peripheral}/add-stock', [PeripheralController::class, 'addStock']);
    Route::post('peripherals/{peripheral}/deploy-stock', [PeripheralController::class, 'deployStock']);
    Route::post('peripherals/{peripheral}/return-stock', [PeripheralController::class, 'returnStock']);
    Route::post('peripherals/{peripheral}/mark-damaged', [PeripheralController::class, 'markDamaged']);
    Route::get('peripherals/{peripheral}/delivery-history', [PeripheralController::class, 'deliveryHistory']);
    Route::apiResource('peripherals', PeripheralController::class);
    
    // Peripheral Serial management routes
    Route::put('peripheral-serials/{peripheralSerial}', [PeripheralSerialController::class, 'update']);
    Route::delete('peripheral-serials/{peripheralSerial}', [PeripheralSerialController::class, 'destroy']);
});

// Parts management routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('parts/types', [PartController::class, 'getPartTypes']);
    Route::get('parts/{part}/items', [PartController::class, 'getItems']);
    Route::get('parts/{part}/delivery-history', [PartController::class, 'deliveryHistory']);
    Route::post('parts/{part}/add-stock', [PartController::class, 'addStock']);
    Route::post('parts/{part}/remove-stock', [PartController::class, 'removeStock']);
    Route::post('parts/{part}/items/{item}/assign', [PartController::class, 'assignItem']);
    Route::post('parts/{part}/items/{item}/return', [PartController::class, 'returnItem']);
    Route::apiResource('parts', PartController::class);
});

// System Unit management routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('system-units/stats', [SystemUnitStatsController::class, 'index']);
    Route::get('system-units/available-parts', [SystemUnitController::class, 'getAvailableParts']);
    Route::get('system-units/with-qr', [SystemUnitController::class, 'indexWithQr']);
    Route::get('system-units/qr/{qrCode}', [SystemUnitController::class, 'showByQrCode']);
    Route::post('system-units/{systemUnit}/assign', [SystemUnitController::class, 'assign']);
    Route::post('system-units/{systemUnit}/return', [SystemUnitController::class, 'returnUnit']);
    Route::apiResource('system-units', SystemUnitController::class);
});

// Other Assets routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('other-assets/dropdown-options', [OtherAssetController::class, 'getDropdownOptions']);
    Route::post('other-assets/add-dropdown-option', [OtherAssetController::class, 'addDropdownOption']);
    Route::apiResource('other-assets', OtherAssetController::class);
});

// Dashboard routes (temporary - no auth for testing)
Route::get('dashboard/stats', [DashboardController::class, 'getStats']);
Route::get('dashboard/assets-received-per-month', [DashboardController::class, 'getAssetsReceivedPerMonth']);
Route::get('dashboard/asset-usage', [DashboardController::class, 'getAssetUsage']);
Route::get('dashboard/total-asset-value', [DashboardController::class, 'getTotalAssetValue']);
Route::get('dashboard/asset-value-per-month', [DashboardController::class, 'getAssetValuePerMonth']);
Route::get('dashboard/recent-transactions', [DashboardController::class, 'getRecentTransactions']);

// Report routes
Route::get('reports', [ReportController::class, 'index']);
Route::get('reports/{type}', [ReportController::class, 'show']);
Route::get('reports/{type}/export', [ReportController::class, 'export']);
Route::post('reports/{type}/filter', [ReportController::class, 'filter']);

// AI-enhanced report routes - No authentication for testing purposes
Route::get('reports/{type}/ai-enhanced', [ReportController::class, 'aiEnhancedReport']);
Route::post('reports/ask-ai', [ReportController::class, 'askAI']);

// Test route for Ask AI with no validation
Route::post('/test-ask-ai', function (Request $request) {
    try {
        // Get the question from request
        $question = $request->input('question', 'What is the total value of our inventory?');
        
        // Log the request details for debugging
        Log::info('Test Ask AI request received', [
            'question' => $question,
            'request_all' => $request->all()
        ]);
        
        // Provide some realistic mock responses based on common questions
        $mockAnswers = [
            'total value' => 'The total value of all assets in the inventory is approximately $1,250,000, with monitors accounting for $125,000, system units for $580,000, peripherals for $95,000, parts for $75,000, and devices for $375,000.',
            'monitor' => 'Based on the current inventory data, the IT department has the highest number of monitors with 42 units, followed by Engineering with 38 units, and Marketing with 27 units.',
            'minimum stock' => 'There are currently 5 parts that are below the minimum stock level: 2 graphics cards, 1 power supply unit, and 2 network interface cards.',
            'utilization' => 'The asset utilization rate last month was 78.5%, which is a 3.2% increase from the previous month. Monitors have the highest utilization rate at 87.2%.',
            'maintenance' => 'There are currently 12 assets scheduled for maintenance in the next 30 days: 5 system units, 3 monitors, and 4 network devices.',
            'default' => 'Based on the available inventory data, I cannot provide a specific answer to this question. Please try asking about asset values, counts by department, utilization rates, or maintenance schedules.'
        ];
        
        // Determine which mock answer to use based on keywords in the question
        $answer = $mockAnswers['default'];
        foreach ($mockAnswers as $keyword => $response) {
            if (stripos($question, $keyword) !== false) {
                $answer = $response;
                break;
            }
        }
        
        // Create some relevant data points based on the question
        $relevantData = [];
        if (stripos($question, 'monitor') !== false) {
            $relevantData = [
                'IT_Department' => 42,
                'Engineering' => 38,
                'Marketing' => 27,
                'Sales' => 18,
                'Finance' => 15
            ];
        } elseif (stripos($question, 'total value') !== false) {
            $relevantData = [
                'monitors_value' => 125000,
                'system_units_value' => 580000,
                'peripherals_value' => 95000,
                'parts_value' => 75000,
                'devices_value' => 375000,
                'total_value' => 1250000
            ];
        }
        
        return response()->json([
            'status' => 'success',
            'question' => $question,
            'answer' => $answer,
            'relevantData' => $relevantData,
            'generatedAt' => now()->toDateTimeString()
        ]);
    } catch (\Exception $e) {
        Log::error('Test Ask AI error: ' . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Test route for OpenAI API connection
Route::get('/test-openai', function () {
    try {
        $apiKey = config('services.openai.api_key');
        
        if (!$apiKey) {
            return response()->json([
                'status' => 'error',
                'message' => 'OpenAI API key not found in configuration'
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
