<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing History API Endpoint\n";
    echo "=============================\n\n";
    
    // Create a request to the history endpoint
    $request = Illuminate\Http\Request::create('/api/system-units/8/history', 'GET');
    
    // Create the controller and call the method
    $controller = new App\Http\Controllers\SystemUnitController();
    
    $systemUnit = App\Models\SystemUnit::find(8);
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    $response = $controller->history($systemUnit);
    $data = $response->getData(true);
    
    echo "API Response:\n";
    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Data count: " . count($data) . "\n\n";
    
    if (empty($data)) {
        echo "No history data returned.\n";
    } else {
        echo "History Events:\n";
        echo "Raw data structure:\n";
        print_r($data);
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
