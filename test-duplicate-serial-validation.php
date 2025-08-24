<?php

/**
 * Test Duplicate Serial Number Validation
 * 
 * This script tests if duplicate serial number validation works properly
 * for monitor creation and editing.
 */

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\MonitorController;

echo "=== TESTING DUPLICATE SERIAL NUMBER VALIDATION ===\n\n";

// Check if we're in the right directory
if (!file_exists('artisan')) {
    echo "❌ Error: Please run this script from the Laravel project root directory\n";
    exit(1);
}

// Load environment and bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "1. CHECKING EXISTING MONITORS\n";
echo "   Finding existing monitors with serial numbers...\n";

try {
    $monitors = \App\Models\Monitor::select('id', 'serial_number', 'brand', 'model')->take(5)->get();
    
    if ($monitors->count() > 0) {
        echo "   Found " . $monitors->count() . " existing monitors:\n";
        foreach ($monitors as $monitor) {
            echo "   - ID: {$monitor->id}, Serial: {$monitor->serial_number}, Brand: {$monitor->brand}, Model: {$monitor->model}\n";
        }
        
        $testSerialNumber = $monitors->first()->serial_number;
        echo "\n2. TESTING DUPLICATE SERIAL NUMBER VALIDATION\n";
        echo "   Using existing serial number: {$testSerialNumber}\n";
        
        // Test create with duplicate serial
        echo "\n   Testing CREATE with duplicate serial number...\n";
        
        $controller = new MonitorController();
        
        // Create a mock request with duplicate serial
        $requestData = [
            'serial_number' => $testSerialNumber,
            'brand' => 'Test Brand',
            'model' => 'Test Model',
            'size' => '24',
            'resolution' => '1920x1080',
            'refresh_rate' => 60,
            'status' => 'working',
            'location' => 'storage',
            'received_by' => 'Test User',
            'notes' => 'Test duplicate validation',
            'price' => 1000.00
        ];
        
        $request = new Request($requestData);
        $response = $controller->store($request);
        $responseData = json_decode($response->getContent(), true);
        
        if ($response->getStatusCode() === 422) {
            echo "   ✅ VALIDATION WORKING: Got 422 status code\n";
            if (isset($responseData['errors']['serial_number'])) {
                echo "   ✅ FIELD ERROR PRESENT: " . $responseData['errors']['serial_number'][0] . "\n";
            } else {
                echo "   ⚠️  WARNING: 422 status but no serial_number field error\n";
            }
        } else {
            echo "   ❌ VALIDATION FAILED: Expected 422, got " . $response->getStatusCode() . "\n";
            echo "   Response: " . $response->getContent() . "\n";
        }
        
        // Test update with duplicate serial (different monitor)
        if ($monitors->count() > 1) {
            $firstMonitor = $monitors->first();
            $secondMonitor = $monitors->skip(1)->first();
            
            echo "\n   Testing UPDATE with duplicate serial number...\n";
            echo "   Trying to update monitor {$secondMonitor->id} with serial from monitor {$firstMonitor->id}\n";
            
            $updateRequest = new Request([
                'serial_number' => $firstMonitor->serial_number,
                'brand' => $secondMonitor->brand,
                'model' => $secondMonitor->model,
                'size' => '24',
                'resolution' => '1920x1080',
                'status' => 'working',
                'received_by' => 'Test User'
            ]);
            
            $updateResponse = $controller->update($updateRequest, $secondMonitor->id);
            $updateResponseData = json_decode($updateResponse->getContent(), true);
            
            if ($updateResponse->getStatusCode() === 422) {
                echo "   ✅ UPDATE VALIDATION WORKING: Got 422 status code\n";
                if (isset($updateResponseData['errors']['serial_number'])) {
                    echo "   ✅ FIELD ERROR PRESENT: " . $updateResponseData['errors']['serial_number'][0] . "\n";
                } else {
                    echo "   ⚠️  WARNING: 422 status but no serial_number field error\n";
                }
            } else {
                echo "   ❌ UPDATE VALIDATION FAILED: Expected 422, got " . $updateResponse->getStatusCode() . "\n";
                echo "   Response: " . $updateResponse->getContent() . "\n";
            }
        }
        
    } else {
        echo "   No existing monitors found. Creating test monitors first...\n";
        
        // Create a test monitor
        $testMonitor = \App\Models\Monitor::create([
            'serial_number' => 'TEST123456789',
            'brand' => 'Test Brand',
            'model' => 'Test Model',
            'size' => '24',
            'resolution' => '1920x1080',
            'refresh_rate' => 60,
            'status' => 'working',
            'location' => 'storage',
            'received_by' => 'Test User',
            'notes' => 'Test monitor for validation',
            'price' => 1000.00
        ]);
        
        echo "   Created test monitor with serial: {$testMonitor->serial_number}\n";
        echo "   Now testing duplicate validation...\n";
        
        $controller = new MonitorController();
        $request = new Request([
            'serial_number' => 'TEST123456789',
            'brand' => 'Another Test Brand',
            'model' => 'Another Test Model',
            'size' => '27',
            'resolution' => '2560x1440',
            'refresh_rate' => 75,
            'status' => 'working',
            'location' => 'storage',
            'received_by' => 'Another Test User',
            'notes' => 'Testing duplicate serial',
            'price' => 1500.00
        ]);
        
        $response = $controller->store($request);
        $responseData = json_decode($response->getContent(), true);
        
        if ($response->getStatusCode() === 422) {
            echo "   ✅ VALIDATION WORKING: Got 422 status code\n";
            if (isset($responseData['errors']['serial_number'])) {
                echo "   ✅ FIELD ERROR PRESENT: " . $responseData['errors']['serial_number'][0] . "\n";
            }
        } else {
            echo "   ❌ VALIDATION FAILED: Expected 422, got " . $response->getStatusCode() . "\n";
        }
        
        // Clean up test monitor
        $testMonitor->delete();
        echo "   Cleaned up test monitor\n";
    }
    
} catch (\Exception $e) {
    echo "   ❌ ERROR: " . $e->getMessage() . "\n";
    echo "   File: " . $e->getFile() . " Line: " . $e->getLine() . "\n";
}

echo "\n3. FRONTEND ERROR HANDLING CHECK\n";
echo "   The frontend should now properly display validation errors:\n";
echo "   - Redux thunk enhanced to return validation errors\n";
echo "   - Forms configured to display backend validation errors\n";
echo "   - Error handling for both create and edit forms\n";

echo "\n4. TESTING INSTRUCTIONS\n";
echo "   To test in the browser:\n";
echo "   1. Go to the monitors page\n";
echo "   2. Click 'Add Monitor'\n";
echo "   3. Enter a serial number that already exists\n";
echo "   4. Fill in other required fields\n";
echo "   5. Submit the form\n";
echo "   6. You should see a validation error for the serial number field\n";

echo "\n=== TEST COMPLETE ===\n";
