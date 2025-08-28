<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Dotenv\Dotenv;

// Load environment
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Setup database connection
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => $_ENV['DB_HOST'],
    'port' => $_ENV['DB_PORT'],
    'database' => $_ENV['DB_DATABASE'],
    'username' => $_ENV['DB_USERNAME'],
    'password' => $_ENV['DB_PASSWORD'],
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "Testing System Unit Delete Functionality\n";
echo "========================================\n\n";

try {
    // Test API endpoint with proper headers
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8000/api/system-units/1');
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'Content-Type: application/json',
        'X-CSRF-TOKEN: test-token'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "HTTP Response Code: $httpCode\n";
    echo "Response Body: $response\n\n";
    
    if ($httpCode === 419) {
        echo "❌ CSRF token error - this means the token is missing or invalid\n";
        echo "Solution: Make sure the frontend is sending the correct CSRF token\n";
    } elseif ($httpCode === 401) {
        echo "❌ Authentication error - user is not logged in\n";
        echo "Solution: Make sure user is authenticated via Sanctum\n";
    } elseif ($httpCode === 403) {
        echo "❌ Authorization error - user doesn't have permission\n";
        echo "Solution: Check user permissions/roles\n";
    } elseif ($httpCode === 404) {
        echo "❌ System unit not found\n";
        echo "Solution: Make sure the system unit ID exists\n";
    } elseif ($httpCode === 200) {
        echo "✅ Delete would work - API endpoint is accessible\n";
    } else {
        echo "❓ Unexpected response code: $httpCode\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
