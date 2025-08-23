<?php

// Test the stock count update functionality
$curl = curl_init();

// First, let's get the current peripheral data
curl_setopt_array($curl, array(
    CURLOPT_URL => 'http://127.0.0.1:8000/api/peripherals',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => array(
        'Accept: application/json',
        'Content-Type: application/json'
    ),
    CURLOPT_COOKIE => 'XSRF-TOKEN=test; laravel_session=test'
));

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

if ($httpCode === 200) {
    $data = json_decode($response, true);
    
    echo "Current peripherals with serial numbers:\n";
    echo "========================================\n";
    
    foreach ($data['data'] as $peripheral) {
        if ($peripheral['uses_serial_numbers'] && $peripheral['available_stock'] > 0) {
            echo "ID: {$peripheral['id']}\n";
            echo "Name: {$peripheral['brand']} {$peripheral['model']}\n";
            echo "Available: {$peripheral['available_stock']}\n";
            echo "Deployed: {$peripheral['deployed_stock']}\n";
            echo "Damaged: {$peripheral['damaged_stock']}\n";
            echo "Total Serial Numbers: " . count($peripheral['serial_numbers'] ?? []) . "\n";
            echo "---\n";
        }
    }
} else {
    echo "Failed to fetch peripherals. HTTP Code: $httpCode\n";
    echo "Response: $response\n";
}

curl_close($curl);
