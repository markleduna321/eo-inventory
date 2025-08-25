<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing System Unit Creation with Audit Log\n";
    echo "==========================================\n\n";
    
    // Simulate creating a new system unit
    $systemUnit = App\Models\SystemUnit::create([
        'unit_type' => 'pre_built',
        'system_name' => 'Test Audit Unit',
        'serial_number' => 'AUDIT-TEST-001',
        'brand' => 'Test Brand',
        'model' => 'Test Model',
        'status' => 'available',
        'location' => 'Test Location',
        'received_by' => 'Audit Test User',
    ]);
    
    echo "Created system unit: {$systemUnit->serial_number} (ID: {$systemUnit->id})\n\n";
    
    // Manually create the audit log entry (since we're not going through the controller)
    App\Models\SystemUnitAuditLog::logCreation(
        $systemUnit,
        'Audit Test User',
        null
    );
    
    echo "Created audit log for creation event.\n\n";
    
    // Test updating the status
    $originalStatus = $systemUnit->status;
    $systemUnit->update(['status' => 'maintenance']);
    
    // Log the status change
    App\Models\SystemUnitAuditLog::logStatusChange(
        $systemUnit,
        $originalStatus,
        'maintenance',
        'Audit Test User',
        null,
        'Testing status change tracking'
    );
    
    echo "Updated status and logged the change.\n\n";
    
    // Check the audit logs
    $auditLogs = $systemUnit->auditLogs()->orderBy('created_at', 'desc')->get();
    
    echo "Audit logs for new system unit:\n";
    foreach ($auditLogs as $log) {
        echo "  {$log->event_type}: {$log->description} by {$log->user_name} at {$log->created_at}\n";
    }
    
    // Clean up - delete the test unit
    $systemUnit->auditLogs()->delete();
    $systemUnit->delete();
    
    echo "\nTest completed and cleaned up successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
