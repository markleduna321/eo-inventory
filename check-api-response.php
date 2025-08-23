<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test what the API returns
$peripheral = App\Models\Peripheral::with(['deliveries', 'serialNumbers'])->find(16);
if ($peripheral) {
    echo 'API Response for Peripheral ID 16:' . PHP_EOL;
    echo json_encode($peripheral->toArray(), JSON_PRETTY_PRINT);
} else {
    echo 'Peripheral not found' . PHP_EOL;
}
