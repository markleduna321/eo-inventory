<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Station;

echo "=== CURRENT STATION ASSIGNMENTS ===\n";

$station = Station::find(19);
echo "Station: {$station->name} (ID: {$station->id})\n\n";

$assignments = $station->stationAssets()->whereNull('unassigned_at')->get();

echo "Active assignments:\n";
foreach ($assignments as $assignment) {
    if ($assignment->asset_type === 'peripheral') {
        $peripheral = App\Models\Peripheral::find($assignment->asset_id);
        echo "- Peripheral: {$peripheral->brand} {$peripheral->model} (ID: {$peripheral->id})\n";
        echo "  Serial: " . ($assignment->serial_number ?: 'None') . "\n";
        echo "  Assigned: {$assignment->assigned_at}\n";
        echo "  Assignment ID: {$assignment->id}\n\n";
    }
}

if ($assignments->where('asset_type', 'peripheral')->count() === 0) {
    echo "No peripheral assignments found.\n";
}
