<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$peripherals = App\Models\Peripheral::all();
echo 'All peripherals:' . PHP_EOL;
foreach ($peripherals as $peripheral) {
    echo 'ID: ' . $peripheral->id . ', Name: ' . $peripheral->name . ', Brand: ' . $peripheral->brand . PHP_EOL;
    echo '  Available: ' . $peripheral->available_stock . PHP_EOL;
    echo '  Deployed: ' . $peripheral->deployed_stock . PHP_EOL; 
    echo '  Damaged: ' . $peripheral->damaged_stock . PHP_EOL;
    echo '  Total: ' . ($peripheral->available_stock + $peripheral->deployed_stock + $peripheral->damaged_stock) . PHP_EOL;
    echo '  Serial Count: ' . $peripheral->serialNumbers()->count() . PHP_EOL;
    echo '---' . PHP_EOL;
}
