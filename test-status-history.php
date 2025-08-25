<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Setup Laravel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test status history tracking
echo "Testing Status History Tracking\n";
echo "=====================================\n\n";

// Get the first system unit for testing
$systemUnit = App\Models\SystemUnit::first();

if (!$systemUnit) {
    echo "No system units found in database.\n";
    exit;
}

echo "System Unit: {$systemUnit->serial_number} (ID: {$systemUnit->id})\n";
echo "Current Status: {$systemUnit->status}\n\n";

// Check what's in the cache for this unit
$statusHistoryKey = "system_unit_status_history_{$systemUnit->id}";
$statusHistory = \Illuminate\Support\Facades\Cache::get($statusHistoryKey, []);

echo "Cached Status History:\n";
if (empty($statusHistory)) {
    echo "  No status history found in cache.\n";
} else {
    foreach ($statusHistory as $index => $change) {
        echo "  " . ($index + 1) . ". Status: {$change['status']}, ";
        echo "Changed by: {$change['changed_by']}, ";
        echo "Time: {$change['changed_at']}\n";
        if (isset($change['previous_status'])) {
            echo "     Previous: {$change['previous_status']}\n";
        }
    }
}

echo "\n";

// Check recent edit cache
$editKey = "system_unit_edit_{$systemUnit->id}";
$recentEdit = \Illuminate\Support\Facades\Cache::get($editKey);

echo "Recent Edit Cache:\n";
if (!$recentEdit) {
    echo "  No recent edit information found in cache.\n";
} else {
    echo "  User: {$recentEdit['user']}\n";
    echo "  Timestamp: {$recentEdit['timestamp']}\n";
    echo "  Changes: " . json_encode($recentEdit['changes']) . "\n";
}

echo "\n";

// Check database assignments
echo "Station Assignments from Database:\n";
$assignments = \Illuminate\Support\Facades\DB::table('station_assets')
    ->join('stations', 'station_assets.station_id', '=', 'stations.id')
    ->where('station_assets.asset_id', $systemUnit->id)
    ->where('station_assets.asset_type', 'system_unit')
    ->orderBy('station_assets.created_at', 'desc')
    ->select([
        'station_assets.*',
        'stations.name as station_name'
    ])
    ->get();

if ($assignments->isEmpty()) {
    echo "  No station assignments found.\n";
} else {
    foreach ($assignments as $assignment) {
        echo "  Station: {$assignment->station_name}\n";
        echo "  Assigned: {$assignment->created_at}\n";
        if ($assignment->unassigned_at) {
            echo "  Unassigned: {$assignment->unassigned_at}\n";
        } else {
            echo "  Status: Currently assigned\n";
        }
        echo "  ---\n";
    }
}

echo "\nDone.\n";
