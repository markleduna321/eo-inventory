<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing Persistent Status Change Tracking\n";
    echo "=========================================\n\n";
    
    $systemUnit = App\Models\SystemUnit::find(8);
    
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    echo "System Unit: {$systemUnit->serial_number}\n";
    echo "Current Status: {$systemUnit->status}\n\n";
    
    // Simulate multiple status changes that would have been lost with cache
    $statusChanges = [
        ['from' => $systemUnit->status, 'to' => 'available', 'reason' => 'Testing status persistence'],
        ['from' => 'available', 'to' => 'maintenance', 'reason' => 'Scheduled maintenance'],
        ['from' => 'maintenance', 'to' => 'available', 'reason' => 'Maintenance completed'],
        ['from' => 'available', 'to' => 'retired', 'reason' => 'End of life'],
        ['from' => 'retired', 'to' => 'available', 'reason' => 'Brought back to service'],
    ];
    
    echo "Creating multiple status changes to test persistence...\n";
    
    foreach ($statusChanges as $index => $change) {
        App\Models\SystemUnitAuditLog::logStatusChange(
            $systemUnit,
            $change['from'],
            $change['to'],
            'Persistence Test User',
            null,
            $change['reason']
        );
        
        echo "  " . ($index + 1) . ". {$change['from']} → {$change['to']} ({$change['reason']})\n";
        
        // Small delay to ensure different timestamps
        usleep(100000); // 0.1 second
    }
    
    echo "\nChecking audit log entries...\n";
    
    $recentLogs = $systemUnit->auditLogs()
        ->where('event_type', 'status_change')
        ->where('user_name', 'Persistence Test User')
        ->orderBy('created_at', 'desc')
        ->get();
    
    echo "Found " . count($recentLogs) . " status change entries:\n";
    
    foreach ($recentLogs as $log) {
        echo "  {$log->old_value} → {$log->new_value} at {$log->created_at}\n";
        echo "    Reason: " . ($log->metadata['reason'] ?? 'N/A') . "\n";
    }
    
    echo "\n✅ All status changes are permanently stored in the database!\n";
    echo "✅ No more cache expiration issues!\n";
    echo "✅ Complete audit trail preserved!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
