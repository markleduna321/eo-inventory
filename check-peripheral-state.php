<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$peripheral = App\Models\Peripheral::find(1);
if ($peripheral) {
    echo 'Peripheral ID 1:' . PHP_EOL;
    echo 'Available: ' . $peripheral->available_stock . PHP_EOL;
    echo 'Deployed: ' . $peripheral->deployed_stock . PHP_EOL; 
    echo 'Damaged: ' . $peripheral->damaged_stock . PHP_EOL;
    echo 'Total in columns: ' . ($peripheral->available_stock + $peripheral->deployed_stock + $peripheral->damaged_stock) . PHP_EOL;
    echo 'Serial Numbers Count: ' . $peripheral->serialNumbers()->count() . PHP_EOL;
    
    $serials = $peripheral->serialNumbers;
    echo 'Serial Numbers:' . PHP_EOL;
    foreach ($serials as $serial) {
        echo '  - ID: ' . $serial->id . ', Serial: ' . $serial->serial_number . PHP_EOL;
    }
} else {
    echo 'Peripheral not found' . PHP_EOL;
}
