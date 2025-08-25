<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Setup Laravel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Testing History API for Unit ID 8 (test)\n";
echo "=====================================\n\n";

// Use the same logic as the history API
$systemUnit = App\Models\SystemUnit::find(8);

if (!$systemUnit) {
    echo "System unit not found.\n";
    exit;
}

$history = [];

// Get current user name
$currentUserName = 'Test User';

echo "System Unit: {$systemUnit->serial_number}\n";
echo "Status: {$systemUnit->status}\n";
echo "Created: {$systemUnit->created_at}\n";
echo "Updated: {$systemUnit->updated_at}\n\n";

// 1. Creation Event
$creationDate = \Carbon\Carbon::parse($systemUnit->created_at);
$history[] = [
    'id' => 'creation',
    'type' => 'created',
    'title' => 'System Unit Created',
    'description' => "System unit '{$systemUnit->serial_number}' was created",
    'details' => [
        'Serial Number' => $systemUnit->serial_number,
        'Unit Type' => $systemUnit->unit_type,
        'Model' => $systemUnit->model ?? 'N/A',
        'Manufacturer' => $systemUnit->manufacturer ?? 'N/A',
        'Received By' => $systemUnit->received_by ?? 'N/A',
        'Initial Status' => 'Available'
    ],
    'user' => $systemUnit->received_by ?? $currentUserName,
    'timestamp' => $creationDate->toISOString(),
    'date' => $creationDate->format('M j, Y'),
    'time' => $creationDate->format('g:i A'),
    'icon' => 'plus-circle',
    'color' => 'green'
];

// 2. Station Assignment History
echo "Station Assignments:\n";
$assignments = \Illuminate\Support\Facades\DB::table('station_assets')
    ->join('stations', 'station_assets.station_id', '=', 'stations.id')
    ->where('station_assets.asset_id', $systemUnit->id)
    ->where('station_assets.asset_type', 'system_unit')
    ->orderBy('station_assets.created_at', 'desc')
    ->select([
        'station_assets.*',
        'stations.name as station_name',
        'stations.type as station_type',
        'stations.department'
    ])
    ->get();

foreach ($assignments as $assignment) {
    echo "Assignment ID {$assignment->id}: {$assignment->station_name}\n";
    echo "  Created: {$assignment->created_at}\n";
    echo "  Unassigned: " . ($assignment->unassigned_at ?? 'N/A') . "\n";
    
    $assignmentDate = \Carbon\Carbon::parse($assignment->created_at);
    
    // Add assignment event
    $history[] = [
        'id' => 'assignment-' . $assignment->id,
        'type' => 'assigned',
        'title' => 'Assigned to Station',
        'description' => "Assigned to station '{$assignment->station_name}'",
        'details' => [
            'Station' => $assignment->station_name,
            'Station Type' => $assignment->station_type,
            'Department' => $assignment->department,
            'Assigned By' => $assignment->assigned_by ?? $currentUserName,
            'Notes' => $assignment->notes ?? 'N/A'
        ],
        'user' => $assignment->assigned_by ?? $currentUserName,
        'timestamp' => $assignmentDate->toISOString(),
        'date' => $assignmentDate->format('M j, Y'),
        'time' => $assignmentDate->format('g:i A'),
        'icon' => 'arrow-right-circle',
        'color' => 'blue'
    ];
    
    // Add unassignment event if it exists
    if ($assignment->unassigned_at) {
        $unbindDate = \Carbon\Carbon::parse($assignment->unassigned_at);
        $history[] = [
            'id' => 'unassignment-' . $assignment->id,
            'type' => 'unassigned',
            'title' => 'Unbound from Station',
            'description' => "Unbound from station '{$assignment->station_name}'",
            'details' => [
                'Station' => $assignment->station_name,
                'Reason' => $assignment->unbind_reason ?? 'N/A',
                'Unbound By' => $assignment->unassigned_by ?? $currentUserName,
                'Notes' => $assignment->notes ?? 'N/A'
            ],
            'user' => $assignment->unassigned_by ?? $currentUserName,
            'timestamp' => $unbindDate->toISOString(),
            'date' => $unbindDate->format('M j, Y'),
            'time' => $unbindDate->format('g:i A'),
            'icon' => 'arrow-left-circle',
            'color' => 'orange'
        ];
    }
}

echo "\nTotal history events: " . count($history) . "\n\n";

// Sort by timestamp
usort($history, function($a, $b) {
    return strcmp($b['timestamp'], $a['timestamp']);
});

echo "History Timeline (newest first):\n";
foreach ($history as $event) {
    echo "- {$event['date']} {$event['time']}: {$event['title']} by {$event['user']}\n";
    echo "  {$event['description']}\n";
}

echo "\nDone.\n";
