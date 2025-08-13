<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Role;

echo "All roles in the system:\n";

$roles = Role::all();
foreach ($roles as $role) {
    echo "- Role: " . $role->name . " (ID: " . $role->id . ", Level: " . $role->level . ")\n";
}
