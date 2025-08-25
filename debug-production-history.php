<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Production History Debug Check\n";
    echo "==============================\n\n";
    
    // Check if audit logs table exists
    try {
        $tableExists = \Illuminate\Support\Facades\Schema::hasTable('system_unit_audit_logs');
        echo "✅ Audit logs table exists: " . ($tableExists ? 'YES' : 'NO') . "\n";
    } catch (Exception $e) {
        echo "❌ Error checking table: " . $e->getMessage() . "\n";
    }
    
    // Check if we have any audit logs
    try {
        $totalAuditLogs = \App\Models\SystemUnitAuditLog::count();
        echo "📊 Total audit log entries: {$totalAuditLogs}\n";
    } catch (Exception $e) {
        echo "❌ Error counting audit logs: " . $e->getMessage() . "\n";
    }
    
    // Check system units
    $systemUnits = \App\Models\SystemUnit::take(5)->get();
    echo "📋 Sample system units and their audit logs:\n";
    
    foreach ($systemUnits as $unit) {
        $auditCount = $unit->auditLogs()->count();
        echo "  Unit {$unit->id} ({$unit->serial_number}): {$auditCount} audit logs\n";
        
        if ($auditCount === 0) {
            echo "    ⚠️  No audit logs found - this unit was created before audit logging\n";
        }
    }
    
    echo "\n";
    
    // Check if history endpoint works for a unit without audit logs
    if ($systemUnits->count() > 0) {
        $testUnit = $systemUnits->first();
        echo "🔍 Testing history endpoint for unit {$testUnit->id}:\n";
        
        try {
            $controller = new \App\Http\Controllers\SystemUnitController();
            $response = $controller->history($testUnit);
            $data = $response->getData(true);
            
            echo "  History events found: " . count($data['history']) . "\n";
            echo "  Total events: " . $data['total_events'] . "\n";
            
            if (count($data['history']) === 0) {
                echo "  ❌ No history events - this explains why history is empty in production\n";
            } else {
                echo "  ✅ History events found:\n";
                foreach (array_slice($data['history'], 0, 3) as $event) {
                    echo "    - {$event['title']} by {$event['user']} on {$event['date']}\n";
                }
            }
        } catch (Exception $e) {
            echo "  ❌ Error calling history endpoint: " . $e->getMessage() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
