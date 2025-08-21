<?php

$url = 'http://127.0.0.1:8000/api/stations/19';
$response = file_get_contents($url);
$data = json_decode($response, true);

echo "=== STATION API RESPONSE ===\n";
echo "Station ID: 19\n";
echo "URL: $url\n\n";

if ($data) {
    echo "Station Name: " . $data['name'] . "\n";
    echo "Location: " . $data['location'] . "\n\n";
    
    if (isset($data['station_assets'])) {
        echo "Station Assets (" . count($data['station_assets']) . "):\n";
        foreach ($data['station_assets'] as $asset) {
            if ($asset['asset_type'] === 'peripheral' && $asset['unassigned_at'] === null) {
                echo "- Peripheral ID: {$asset['asset_id']}\n";
                echo "  Serial: " . ($asset['serial_number'] ?: 'None') . "\n";
                echo "  Assigned: {$asset['assigned_at']}\n";
                echo "  Assignment ID: {$asset['id']}\n\n";
            }
        }
    } else {
        echo "No station_assets field found\n";
    }
    
    if (isset($data['peripherals'])) {
        echo "Peripherals relationship (" . count($data['peripherals']) . "):\n";
        foreach ($data['peripherals'] as $peripheral) {
            echo "- {$peripheral['brand']} {$peripheral['model']} (ID: {$peripheral['id']})\n";
        }
    } else {
        echo "No peripherals relationship found\n";
    }
    
    echo "\n=== FULL RESPONSE ===\n";
    echo json_encode($data, JSON_PRETTY_PRINT);
} else {
    echo "Failed to decode response\n";
    echo "Raw response: $response\n";
}
