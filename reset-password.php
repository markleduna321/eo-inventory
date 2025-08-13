<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Update the test user password
$user = User::where('email', 'testuser@example.com')->first();
if ($user) {
    $user->password = Hash::make('password');
    $user->save();
    echo "Password for testuser@example.com has been reset to 'password'\n";
} else {
    echo "User not found\n";
}

// Update the admin user password
$admin = User::where('email', 'admin@gmail.com')->first();
if ($admin) {
    $admin->password = Hash::make('password');
    $admin->save();
    echo "Password for admin@gmail.com has been reset to 'password'\n";
} else {
    echo "Admin user not found\n";
}
