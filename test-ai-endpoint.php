<?php

// Simple test for AI endpoint
$url = 'http://127.0.0.1:8002/api/reports/ask-ai';
$data = json_encode(['question' => 'What is the total value of our inventory?']);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: $httpCode\n";
echo "Response: $response\n";

if ($httpCode === 200) {
    echo "✅ AI endpoint is working!\n";
} else {
    echo "❌ AI endpoint returned error code $httpCode\n";
}
