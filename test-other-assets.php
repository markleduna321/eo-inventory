<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

// Test the Other Assets API endpoints
echo "Testing Other Assets functionality...\n\n";

// Test getting dropdown options
echo "1. Testing dropdown options:\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/other-assets/dropdown-options");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    echo "Dropdown options response:\n";
    echo $response . "\n\n";
} else {
    echo "Failed to get dropdown options\n\n";
}

// Test getting other assets list
echo "2. Testing other assets list:\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/other-assets");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
$response = curl_exec($ch);
curl_close($ch);

if ($response) {
    echo "Other assets list response:\n";
    echo $response . "\n\n";
} else {
    echo "Failed to get other assets list\n\n";
}

echo "Test completed.\n";
