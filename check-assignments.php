<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Setup Laravel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "System Units with Station Assignments:\n";
echo "=====================================\n\n";

$assignments = \Illuminate\Support\Facades\DB::table('station_assets')
    ->join('system_units', 'station_assets.asset_id', '=', 'system_units.id')
    ->join('stations', 'station_assets.station_id', '=', 'stations.id')
    ->where('station_assets.asset_type', 'system_unit')
    ->select([
        'system_units.id',
        'system_units.serial_number',
        'system_units.status',
        'stations.name as station_name',
        'station_assets.created_at as assigned_at',
        'station_assets.unassigned_at'
    ])
    ->orderBy('station_assets.created_at', 'desc')
    ->get();

if ($assignments->isEmpty()) {
    echo "No station assignments found.\n";
} else {
    foreach ($assignments as $assignment) {
        echo "Unit: {$assignment->serial_number} (ID: {$assignment->id})\n";
        echo "Station: {$assignment->station_name}\n";
        echo "Assigned: {$assignment->assigned_at}\n";
        echo "Status: {$assignment->status}\n";
        if ($assignment->unassigned_at) {
            echo "Unassigned: {$assignment->unassigned_at}\n";
        } else {
            echo "Currently assigned\n";
        }
        echo "---\n";
    }
}

echo "\nTotal assignments: " . count($assignments) . "\n";
