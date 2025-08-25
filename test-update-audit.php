<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing System Unit Update with Audit Logging\n";
    echo "==============================================\n\n";
    
    // Get a system unit to test with
    $systemUnit = \App\Models\SystemUnit::find(5);
    
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    echo "System Unit: {$systemUnit->serial_number} (ID: {$systemUnit->id})\n";
    echo "Current Status: {$systemUnit->status}\n";
    echo "Audit logs before update: " . $systemUnit->auditLogs()->count() . "\n\n";
    
    // Simulate the update process that happens in the controller
    $originalStatus = $systemUnit->status;
    $newStatus = $originalStatus === 'available' ? 'maintenance' : 'available';
    
    echo "Testing status change: {$originalStatus} → {$newStatus}\n\n";
    
    // Get original values (like in the controller)
    $originalValues = $systemUnit->getOriginal();
    echo "Original values retrieved: " . json_encode($originalValues) . "\n\n";
    
    // Simulate authenticated user
    $userName = 'Test User';
    $userId = null;
    
    // Test the audit logging directly
    echo "Creating audit log entry...\n";
    try {
        $auditLog = \App\Models\SystemUnitAuditLog::logStatusChange(
            $systemUnit,
            $originalStatus,
            $newStatus,
            $userName,
            $userId,
            'Manual status change test'
        );
        
        echo "✅ Audit log created successfully (ID: {$auditLog->id})\n";
    } catch (Exception $e) {
        echo "❌ Error creating audit log: " . $e->getMessage() . "\n";
        throw $e;
    }
    
    // Update the system unit
    echo "Updating system unit status...\n";
    $systemUnit->update(['status' => $newStatus]);
    echo "✅ System unit updated\n\n";
    
    // Check audit logs after update
    $auditCount = $systemUnit->fresh()->auditLogs()->count();
    echo "Audit logs after update: {$auditCount}\n";
    
    // Get the latest audit log
    $latestLog = $systemUnit->auditLogs()->latest()->first();
    if ($latestLog) {
        echo "Latest audit log:\n";
        echo "  Event: {$latestLog->event_type}\n";
        echo "  Description: {$latestLog->description}\n";
        echo "  User: {$latestLog->user_name}\n";
        echo "  Created: {$latestLog->created_at}\n";
    }
    
    echo "\nNow testing the history API...\n";
    
    try {
        $controller = new \App\Http\Controllers\SystemUnitController();
        $response = $controller->history($systemUnit->fresh());
        $data = $response->getData(true);
        
        echo "History API Response:\n";
        echo "  Total events: " . $data['total_events'] . "\n";
        echo "  History events: " . count($data['history']) . "\n";
        
        if (count($data['history']) > 0) {
            echo "  Recent events:\n";
            foreach (array_slice($data['history'], 0, 3) as $event) {
                echo "    - {$event['title']} by {$event['user']} ({$event['type']})\n";
            }
        }
    } catch (Exception $e) {
        echo "❌ Error with history API: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
