<?php

$url = 'http://127.0.0.1:8000/api/stations/19/history';

// Get the response from the API
$context = stream_context_create([
    'http' => [
        'method' => 'GET',
        'header' => [
            'Accept: application/json',
            'Content-Type: application/json'
        ]
    ]
]);

$response = file_get_contents($url, false, $context);
$data = json_decode($response, true);

echo "=== STATION HISTORY API RESPONSE ===\n";
echo "URL: $url\n\n";

if ($data && is_array($data)) {
    echo "Found " . count($data) . " history records:\n\n";
    
    foreach (array_slice($data, 0, 5) as $item) {
        echo "Record ID: {$item['id']}\n";
        echo "Action: {$item['action_label']}\n";
        echo "Date: {$item['formatted_date']}\n";
        echo "User: " . ($item['user'] ? $item['user']['name'] : 'Unknown') . "\n";
        
        if ($item['asset']) {
            echo "Asset: {$item['asset']['type']} - {$item['asset']['name']}\n";
            if ($item['asset']['serial']) {
                echo "Serial: {$item['asset']['serial']}\n";
            }
        }
        
        if ($item['reason']) {
            echo "Reason: {$item['reason']}\n";
        }
        
        if ($item['notes']) {
            echo "Notes: {$item['notes']}\n";
        }
        
        echo "---\n";
    }
} else {
    echo "Error: Unable to fetch or decode history data\n";
    echo "Raw response: $response\n";
}
