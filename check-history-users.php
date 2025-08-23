<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\StationHistory;
use App\Models\User;

echo "=== RECENT STATION HISTORY RECORDS ===\n";

$history = StationHistory::with('user')
    ->latest()
    ->take(10)
    ->get();

foreach ($history as $record) {
    $userName = $record->user ? $record->user->name : 'Unknown';
    echo "ID: {$record->id}\n";
    echo "Action: {$record->action_type}\n";
    echo "User ID: " . ($record->user_id ?: 'NULL') . "\n";
    echo "User Name: {$userName}\n";
    echo "Asset: {$record->asset_type} #{$record->asset_id}\n";
    echo "Created: {$record->created_at}\n";
    echo "---\n";
}

echo "\n=== USER CHECK ===\n";
$users = User::take(5)->get();
foreach ($users as $user) {
    echo "User ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
}
