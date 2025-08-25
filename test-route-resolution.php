<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing Route Resolution\n";
    echo "========================\n\n";
    
    // Check if system unit with ID 1 exists
    $systemUnit = \App\Models\SystemUnit::find(1);
    
    if ($systemUnit) {
        echo "✅ System Unit ID 1 exists: {$systemUnit->serial_number}\n";
    } else {
        echo "❌ System Unit ID 1 not found\n";
        
        // Show available system units
        $units = \App\Models\SystemUnit::take(5)->get();
        echo "📋 Available system units:\n";
        foreach ($units as $unit) {
            echo "  ID {$unit->id}: {$unit->serial_number}\n";
        }
    }
    
    echo "\n";
    
    // Test the route manually
    echo "🔍 Testing route resolution:\n";
    
    // Check if the route exists
    $routes = collect(\Illuminate\Support\Facades\Route::getRoutes())->filter(function($route) {
        return str_contains($route->uri(), 'system-units') && str_contains($route->uri(), 'history');
    });
    
    foreach ($routes as $route) {
        echo "  Route found: {$route->methods()[0]} {$route->uri()}\n";
        echo "  Action: {$route->getActionName()}\n";
    }
    
    // Test with a system unit that exists
    $testUnit = \App\Models\SystemUnit::first();
    if ($testUnit) {
        echo "\n🧪 Testing history method directly with unit {$testUnit->id}:\n";
        
        try {
            $controller = new \App\Http\Controllers\SystemUnitController();
            $response = $controller->history($testUnit);
            echo "  ✅ History method works: " . $response->getStatusCode() . "\n";
            
            $data = $response->getData(true);
            echo "  Events count: " . count($data['history']) . "\n";
        } catch (Exception $e) {
            echo "  ❌ Error calling history method: " . $e->getMessage() . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "Fatal error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
