<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

require_once __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

// Boot the application
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::capture();
$kernel->bootstrap();

echo "Testing authentication...\n";

// Test admin user
$admin = User::where('email', 'admin@gmail.com')->first();
if ($admin) {
    echo "Admin user found: " . $admin->email . "\n";
    echo "Password hash: " . substr($admin->password, 0, 20) . "...\n";
    echo "Password 'password' check: " . (Hash::check('password', $admin->password) ? 'VALID' : 'INVALID') . "\n";
    
    // Test Auth::attempt
    echo "Auth::attempt test: ";
    if (Auth::attempt(['email' => 'admin@gmail.com', 'password' => 'password'])) {
        echo "SUCCESS\n";
        echo "Authenticated user: " . Auth::user()->email . "\n";
    } else {
        echo "FAILED\n";
    }
} else {
    echo "Admin user not found!\n";
}

echo "\n";

// Test test user
$testUser = User::where('email', 'testuser@example.com')->first();
if ($testUser) {
    echo "Test user found: " . $testUser->email . "\n";
    echo "Password hash: " . substr($testUser->password, 0, 20) . "...\n";
    echo "Password 'password' check: " . (Hash::check('password', $testUser->password) ? 'VALID' : 'INVALID') . "\n";
} else {
    echo "Test user not found!\n";
}
