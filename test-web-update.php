<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing Web API Update Request\n";
    echo "==============================\n\n";
    
    // Get a system unit to test with
    $systemUnit = \App\Models\SystemUnit::find(5);
    
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    echo "System Unit: {$systemUnit->serial_number} (ID: {$systemUnit->id})\n";
    echo "Current Status: {$systemUnit->status}\n";
    echo "Audit logs before: " . $systemUnit->auditLogs()->count() . "\n\n";
    
    // Create a mock authenticated user
    $user = \App\Models\User::first();
    if (!$user) {
        echo "No users found. Creating a test user...\n";
        $user = \App\Models\User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);
    }
    
    echo "Test user: {$user->name} (ID: {$user->id})\n\n";
    
    // Simulate the web request
    $newStatus = $systemUnit->status === 'available' ? 'maintenance' : 'available';
    
    echo "Simulating API update request...\n";
    echo "Changing status to: {$newStatus}\n\n";
    
    // Create a request with the update data
    $request = \Illuminate\Http\Request::create('/api/system-units/' . $systemUnit->id, 'PUT', [
        'status' => $newStatus,
        'system_name' => $systemUnit->system_name,
        'unit_type' => $systemUnit->unit_type,
        'received_by' => $systemUnit->received_by,
    ]);
    
    // Set the authenticated user
    \Illuminate\Support\Facades\Auth::login($user);
    
    echo "Authenticated as: " . \Illuminate\Support\Facades\Auth::user()->name . "\n";
    
    // Call the controller update method
    $controller = new \App\Http\Controllers\SystemUnitController();
    
    try {
        $response = $controller->update($request, $systemUnit);
        $responseData = $response->getData(true);
        
        echo "✅ Update successful!\n";
        echo "Response status: " . $response->getStatusCode() . "\n";
        echo "New status in response: " . $responseData['status'] . "\n\n";
        
        // Check audit logs after update
        $systemUnit = $systemUnit->fresh();
        $auditCount = $systemUnit->auditLogs()->count();
        echo "Audit logs after update: {$auditCount}\n";
        
        if ($auditCount > 0) {
            $latestLog = $systemUnit->auditLogs()->latest()->first();
            echo "Latest audit log:\n";
            echo "  Event: {$latestLog->event_type}\n";
            echo "  Description: {$latestLog->description}\n";
            echo "  User: {$latestLog->user_name}\n";
            echo "  User ID: {$latestLog->user_id}\n";
            echo "  Created: {$latestLog->created_at}\n";
        }
        
        // Test history API
        echo "\nTesting history API after update...\n";
        $historyResponse = $controller->history($systemUnit);
        $historyData = $historyResponse->getData(true);
        
        echo "History events: " . count($historyData['history']) . "\n";
        if (count($historyData['history']) > 0) {
            echo "Recent events:\n";
            foreach (array_slice($historyData['history'], 0, 2) as $event) {
                echo "  - {$event['title']} by {$event['user']} on {$event['date']}\n";
            }
        }
        
    } catch (Exception $e) {
        echo "❌ Update failed: " . $e->getMessage() . "\n";
        echo "File: " . $e->getFile() . "\n";
        echo "Line: " . $e->getLine() . "\n";
    }
    
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
