<?php

// Simulate how the CheckPermission middleware would work
class MockUser {
    public $role;
    
    public function __construct($roleName, $permissions) {
        $this->role = (object)['name' => $roleName, 'permissions' => $permissions];
    }
    
    public function hasPermission($permission) {
        return in_array($permission, $this->role->permissions ?? []);
    }
}

// Create test users
$requestOnlyUser = new MockUser('Request Only User', ['requests_view', 'requests_create']);
$adminUser = new MockUser('Super Administrator', ['dashboard_view', 'users_view', 'requests_view', 'assets_view']);

// Test routes and their required permissions
$routes = [
    '/admin/dashboard' => 'dashboard_view',
    '/admin/users' => 'users_view', 
    '/admin/requests' => 'requests_view',
    '/admin/assets' => 'assets_view'
];

echo "Route Access Test for Request Only User:\n";
foreach($routes as $route => $permission) {
    $access = $requestOnlyUser->hasPermission($permission) ? 'ALLOWED' : 'DENIED';
    echo "{$route} ({$permission}): {$access}\n";
}

echo "\nRoute Access Test for Admin User:\n";
foreach($routes as $route => $permission) {
    $access = $adminUser->hasPermission($permission) ? 'ALLOWED' : 'DENIED';
    echo "{$route} ({$permission}): {$access}\n";
}

echo "\nThis demonstrates how the middleware protects routes based on user permissions!\n";
