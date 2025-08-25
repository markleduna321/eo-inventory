<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Production Debug Check\n";
    echo "======================\n\n";
    
    // Check if system unit ID 1 exists
    $systemUnit = \App\Models\SystemUnit::find(1);
    
    if ($systemUnit) {
        echo "✅ System Unit ID 1 found: {$systemUnit->serial_number}\n";
        echo "   Status: {$systemUnit->status}\n";
        echo "   Created: {$systemUnit->created_at}\n";
    } else {
        echo "❌ System Unit ID 1 not found\n";
    }
    
    // Check audit logs for system unit 1
    if ($systemUnit) {
        $auditLogs = \App\Models\SystemUnitAuditLog::where('system_unit_id', 1)->get();
        echo "📊 Audit logs for Unit 1: " . count($auditLogs) . "\n";
        
        if (count($auditLogs) > 0) {
            echo "   Recent audit logs:\n";
            foreach ($auditLogs->take(3) as $log) {
                echo "   - {$log->event_type}: {$log->description} by {$log->user_name} at {$log->created_at}\n";
            }
        }
    }
    
    echo "\n";
    
    // Test history method directly
    if ($systemUnit) {
        echo "🧪 Testing history method for Unit 1:\n";
        
        try {
            $controller = new \App\Http\Controllers\SystemUnitController();
            $response = $controller->history($systemUnit);
            $data = $response->getData(true);
            
            echo "   ✅ History method successful\n";
            echo "   Status: {$response->getStatusCode()}\n";
            echo "   Events: " . count($data['history']) . "\n";
            echo "   Total events: {$data['total_events']}\n";
            
            if (count($data['history']) > 0) {
                echo "   Recent events:\n";
                foreach (array_slice($data['history'], 0, 3) as $event) {
                    echo "   - {$event['title']} by {$event['user']} on {$event['date']}\n";
                }
            }
            
        } catch (Exception $e) {
            echo "   ❌ Error: {$e->getMessage()}\n";
        }
    }
    
    echo "\n";
    
    // Check route registration
    echo "🔍 Checking route registration:\n";
    $routes = collect(\Illuminate\Support\Facades\Route::getRoutes())->filter(function($route) {
        return str_contains($route->uri(), 'system-units') && 
               str_contains($route->uri(), 'history') &&
               in_array('GET', $route->methods());
    });
    
    foreach ($routes as $route) {
        echo "   Route: {$route->methods()[0]} {$route->uri()}\n";
        echo "   Action: {$route->getActionName()}\n";
        echo "   Middleware: " . implode(', ', $route->middleware()) . "\n";
    }
    
    echo "\n";
    
    // Test route resolution
    echo "🎯 Testing route resolution:\n";
    try {
        $request = \Illuminate\Http\Request::create('/api/system-units/1/history', 'GET');
        $route = \Illuminate\Support\Facades\Route::getRoutes()->match($request);
        echo "   ✅ Route matches: {$route->uri()}\n";
        echo "   Parameters: " . json_encode($route->parameters()) . "\n";
    } catch (Exception $e) {
        echo "   ❌ Route resolution failed: {$e->getMessage()}\n";
    }
    
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
