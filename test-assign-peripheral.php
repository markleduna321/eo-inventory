<?php

$stationId = 19;
$peripheralIds = [18]; // The peripheral without serial numbers

$url = "http://127.0.0.1:8000/api/stations/{$stationId}/assign-peripherals";
$postData = json_encode(['peripheral_ids' => $peripheralIds]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

echo "=== TESTING PERIPHERAL ASSIGNMENT ===\n";
echo "Station ID: {$stationId}\n";
echo "Peripheral IDs: " . implode(', ', $peripheralIds) . "\n";
echo "URL: {$url}\n";
echo "POST Data: {$postData}\n\n";

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status Code: {$httpCode}\n";
echo "Response:\n";
echo $response . "\n\n";

$responseData = json_decode($response, true);
if ($responseData) {
    echo "Decoded Response:\n";
    print_r($responseData);
} else {
    echo "Failed to decode JSON response\n";
}
