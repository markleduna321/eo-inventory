<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;

echo "Updating Request Only User permissions...\n";

$role = Role::find(11);
if ($role) {
    $permissions = $role->permissions;
    
    // Add dashboard_view if not already present
    if (!in_array('dashboard_view', $permissions)) {
        $permissions[] = 'dashboard_view';
        $role->update(['permissions' => $permissions]);
        echo "Added 'dashboard_view' permission to Request Only User role\n";
    } else {
        echo "'dashboard_view' permission already exists\n";
    }
    
    echo "Updated permissions: " . json_encode($permissions, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Role not found\n";
}
