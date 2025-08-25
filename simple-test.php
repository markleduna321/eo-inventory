<?php

require __DIR__.'/vendor/autoload.php';

try {
    $app = require_once __DIR__.'/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "Testing History API for Unit ID 8\n";
    
    $systemUnit = App\Models\SystemUnit::find(8);
    
    if (!$systemUnit) {
        echo "System unit not found.\n";
        exit;
    }
    
    echo "Found unit: {$systemUnit->serial_number}\n";
    echo "Status: {$systemUnit->status}\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
