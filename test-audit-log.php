<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing Audit Log Implementation\n";
    echo "================================\n\n";
    
    // Get a system unit
    $systemUnit = App\Models\SystemUnit::find(8);
    
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    echo "System Unit: {$systemUnit->serial_number}\n";
    echo "Current Status: {$systemUnit->status}\n\n";
    
    // Test creating an audit log entry
    echo "Creating test audit log entry...\n";
    
    $auditLog = App\Models\SystemUnitAuditLog::logStatusChange(
        $systemUnit,
        'available',
        'maintenance',
        'Test User',
        null,
        'Testing audit log functionality'
    );
    
    echo "Created audit log entry with ID: {$auditLog->id}\n\n";
    
    // Check existing audit logs
    $existingLogs = $systemUnit->auditLogs()->orderBy('created_at', 'desc')->get();
    
    echo "Existing audit logs for this unit:\n";
    if ($existingLogs->isEmpty()) {
        echo "  No audit logs found.\n";
    } else {
        foreach ($existingLogs as $log) {
            echo "  {$log->event_type}: {$log->description} by {$log->user_name} at {$log->created_at}\n";
        }
    }
    
    echo "\nTest completed successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
