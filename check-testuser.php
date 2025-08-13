<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

echo "Checking testuser account:\n";

$testuser = User::where('email', 'testuser@example.com')->first();

if ($testuser) {
    echo "User found!\n";
    echo "Email: " . $testuser->email . "\n";
    echo "Role ID: " . $testuser->role_id . "\n";
    echo "Password hash exists: " . ($testuser->password ? 'YES' : 'NO') . "\n";
    echo "Password 'password' check: " . (Hash::check('password', $testuser->password) ? 'VALID' : 'INVALID') . "\n";
    
    // Check if role exists
    if ($testuser->role) {
        echo "Role name: " . $testuser->role->name . "\n";
        echo "Role level: " . $testuser->role->level . "\n";
    } else {
        echo "Role relationship: NULL (This could be the problem!)\n";
    }
} else {
    echo "User NOT found. Let's check all users:\n";
    $users = User::all();
    foreach ($users as $user) {
        echo "- " . $user->email . " (Role ID: " . $user->role_id . ")\n";
    }
}
