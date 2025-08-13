<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;

echo "Request Only User role permissions:\n";

$role = Role::find(11);
if ($role) {
    echo "Role Name: " . $role->name . "\n";
    echo "Level: " . $role->level . "\n";
    echo "Permissions: " . json_encode($role->permissions, JSON_PRETTY_PRINT) . "\n";
} else {
    echo "Role not found\n";
}
