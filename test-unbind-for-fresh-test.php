<?php

$stationId = 19;
$assetType = 'peripheral';
$assetId = 18;
$serialNumber = null;

$url = "http://127.0.0.1:8000/api/stations/{$stationId}/unassign-asset";
$postData = json_encode([
    'asset_type' => $assetType,
    'asset_id' => $assetId,
    'serial_number' => $serialNumber,
    'unbind_reason' => 'Replace New',
    'notes' => 'Unbinding for frontend test'
]);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

echo "=== UNBINDING PERIPHERAL FOR FRESH TEST ===\n";
echo "Station ID: {$stationId}\n";
echo "Asset Type: {$assetType}\n";
echo "Asset ID: {$assetId}\n";
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
