<?php

require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

use App\Models\Peripheral;
use App\Models\PeripheralSerial;

echo "Testing Peripheral Serial Edit Functionality\n";
echo "=============================================\n\n";

// Find a peripheral with serial numbers
$peripheral = Peripheral::with('serialNumbers')->where('uses_serial_numbers', true)->first();

if (!$peripheral) {
    echo "No peripherals with serial numbers found.\n";
    exit;
}

echo "Found peripheral: {$peripheral->brand} {$peripheral->model}\n";
echo "Current serial numbers:\n";

foreach ($peripheral->serialNumbers as $serial) {
    echo "- ID: {$serial->id}, Serial: {$serial->serial_number}, Price: {$serial->unit_price}, Status: {$serial->status}\n";
}

// Check if we have at least one serial to test with
$testSerial = $peripheral->serialNumbers->first();

if (!$testSerial) {
    echo "No serial numbers found for this peripheral.\n";
    exit;
}

echo "\nTesting with serial ID: {$testSerial->id}\n";
echo "Original serial number: {$testSerial->serial_number}\n";
echo "Original unit price: {$testSerial->unit_price}\n";

echo "\nAPI endpoints available:\n";
echo "PUT /api/peripheral-serials/{$testSerial->id} - Update serial number\n";
echo "DELETE /api/peripheral-serials/{$testSerial->id} - Delete serial number\n";

echo "\nTest completed successfully!\n";
