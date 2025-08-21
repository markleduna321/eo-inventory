<?php

$url = 'http://127.0.0.1:8000/api/stations/available-peripherals';
$response = file_get_contents($url);
$data = json_decode($response, true);

echo "=== AVAILABLE PERIPHERALS API RESPONSE ===\n";
echo "Raw response:\n";
echo $response . "\n\n";

echo "Decoded data:\n";
print_r($data);

if (isset($data['all'])) {
    echo "\n=== ALL PERIPHERALS ===\n";
    foreach ($data['all'] as $peripheral) {
        echo "ID: {$peripheral['id']}, Type: {$peripheral['type']}, Brand: {$peripheral['brand']}, Model: {$peripheral['model']}, Stock: {$peripheral['available_stock']}\n";
    }
}

if (isset($data['grouped'])) {
    echo "\n=== GROUPED PERIPHERALS ===\n";
    foreach ($data['grouped'] as $type => $groups) {
        echo "Type: $type\n";
        foreach ($groups as $brandModel => $group) {
            echo "  - $brandModel: Stock {$group['available_stock']}\n";
        }
    }
}
