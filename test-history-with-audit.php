<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing History API with Audit Logs\n";
    echo "===================================\n\n";
    
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
    echo "Total events: " . $data['total_events'] . "\n\n";
    
    echo "History Events:\n";
    foreach ($data['history'] as $index => $event) {
        $eventNumber = $index + 1;
        echo "{$eventNumber}. {$event['title']} ({$event['type']})\n";
        echo "   Date: {$event['date']} {$event['time']}\n";
        echo "   User: {$event['user']}\n";
        echo "   Description: {$event['description']}\n";
        if (isset($event['details'])) {
            echo "   Details:\n";
            foreach ($event['details'] as $key => $value) {
                echo "     {$key}: {$value}\n";
            }
        }
        echo "   ---\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
