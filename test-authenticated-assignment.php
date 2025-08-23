<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Station;
use App\Models\Peripheral;

echo "=== TESTING AUTHENTICATED ASSIGNMENT ===\n";

// Simulate authentication by getting a user
$user = User::first();
if (!$user) {
    echo "No users found in database\n";
    exit(1);
}

echo "Simulating assignment by user: {$user->name} (ID: {$user->id})\n";

// Set the authenticated user for this request
auth()->login($user);

// Now test the assignment through the Station model
$station = Station::find(19);
if (!$station) {
    echo "Station 19 not found\n";
    exit(1);
}

$peripheral = Peripheral::find(18);
if (!$peripheral) {
    echo "Peripheral 18 not found\n";
    exit(1);
}

echo "Station: {$station->name}\n";
echo "Peripheral: {$peripheral->brand} {$peripheral->model}\n";
echo "Current user: " . (auth()->user() ? auth()->user()->name : 'None') . "\n\n";

try {
    // Perform the assignment
    $result = $station->assignAsset('peripheral', 18, null);
    echo "Assignment successful!\n";
    echo "Assignment ID: {$result->id}\n";
    
    // Check the history record
    $history = $station->history()->latest()->first();
    if ($history) {
        echo "\nHistory Record:\n";
        echo "Action: {$history->action_type}\n";
        echo "User ID: " . ($history->user_id ?: 'NULL') . "\n";
        if ($history->user) {
            echo "User Name: {$history->user->name}\n";
        }
        echo "Asset: {$history->asset_type} #{$history->asset_id}\n";
        echo "Created: {$history->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "Assignment failed: " . $e->getMessage() . "\n";
}

// Logout
auth()->logout();
