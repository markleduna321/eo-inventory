<?php

$apiUrl = 'http://127.0.0.1:8001/api/reports/ask-ai';
$question = 'What are the specifications of our system units, monitors, and other assets? Please provide detailed information about their technical specifications.';

$data = [
    'question' => $question
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($apiUrl, false, $context);

if ($result === FALSE) {
    echo "Error: Failed to connect to API\n";
} else {
    $response = json_decode($result, true);
    
    echo "Testing AI Response for Asset Specifications\n";
    echo "===========================================\n\n";
    echo "Question: $question\n\n";
    echo "AI Response:\n";
    echo $response['response'] ?? 'No response received';
    echo "\n\n";
    
    if (isset($response['data_context'])) {
        echo "Data Context Summary:\n";
        echo "- Total Assets: " . ($response['data_context']['summary']['total_assets'] ?? 'Unknown') . "\n";
        echo "- Total Value: $" . number_format($response['data_context']['summary']['total_value'] ?? 0, 2) . "\n";
        
        if (isset($response['data_context']['system_units']['specifications'])) {
            echo "- SystemUnit specs available: Yes\n";
        }
        if (isset($response['data_context']['monitors']['specifications'])) {
            echo "- Monitor specs available: Yes\n";
        }
        if (isset($response['data_context']['other_assets']['specifications'])) {
            echo "- OtherAsset specs available: Yes\n";
        }
    }
}
