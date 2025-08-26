<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Role;

echo "Adding Other Assets and Device Returns permissions to existing roles...\n\n";

try {
    // Super Administrator - Full access to everything
    $superAdmin = Role::find(1);
    if ($superAdmin) {
        $permissions = $superAdmin->permissions ?? [];
        $newPermissions = [
            'other_assets_view', 'other_assets_create', 'other_assets_edit', 'other_assets_delete', 'other_assets_manage',
            'device_returns_view', 'device_returns_create', 'device_returns_edit', 'device_returns_delete', 'device_returns_manage', 'device_returns_approve'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $superAdmin->permissions = $permissions;
        $superAdmin->save();
        echo "✓ Updated Super Administrator permissions\n";
    }

    // Asset Manager - Full asset management including new modules
    $assetManager = Role::find(2);
    if ($assetManager) {
        $permissions = $assetManager->permissions ?? [];
        $newPermissions = [
            'other_assets_view', 'other_assets_create', 'other_assets_edit', 'other_assets_delete', 'other_assets_manage',
            'device_returns_view', 'device_returns_create', 'device_returns_edit', 'device_returns_manage'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $assetManager->permissions = $permissions;
        $assetManager->save();
        echo "✓ Updated Asset Manager permissions\n";
    }

    // IT Technician - Basic access to view and edit
    $itTechnician = Role::find(3);
    if ($itTechnician) {
        $permissions = $itTechnician->permissions ?? [];
        $newPermissions = [
            'other_assets_view', 'other_assets_edit',
            'device_returns_view', 'device_returns_create', 'device_returns_edit'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $itTechnician->permissions = $permissions;
        $itTechnician->save();
        echo "✓ Updated IT Technician permissions\n";
    }

    // Department Head - View and approve device returns
    $deptHead = Role::find(4);
    if ($deptHead) {
        $permissions = $deptHead->permissions ?? [];
        $newPermissions = [
            'device_returns_view', 'device_returns_approve'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $deptHead->permissions = $permissions;
        $deptHead->save();
        echo "✓ Updated Department Head permissions\n";
    }

    // Employee - Basic view and create device returns
    $employee = Role::find(5);
    if ($employee) {
        $permissions = $employee->permissions ?? [];
        $newPermissions = [
            'device_returns_view', 'device_returns_create'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $employee->permissions = $permissions;
        $employee->save();
        echo "✓ Updated Employee permissions\n";
    }

    // Viewer - Only view access (if active)
    $viewer = Role::find(6);
    if ($viewer) {
        $permissions = $viewer->permissions ?? [];
        $newPermissions = [
            'device_returns_view'
        ];
        
        foreach ($newPermissions as $permission) {
            if (!in_array($permission, $permissions)) {
                $permissions[] = $permission;
            }
        }
        
        $viewer->permissions = $permissions;
        $viewer->save();
        echo "✓ Updated Viewer permissions\n";
    }

    echo "\n✅ All role permissions have been successfully updated!\n";
    echo "\nNew permissions added:\n";
    echo "📋 Other Assets: view, create, edit, delete, manage\n";
    echo "🔄 Device Returns: view, create, edit, delete, manage, approve\n\n";

    // Display current role permissions summary
    echo "Current Role Permissions Summary:\n";
    echo "=================================\n";
    
    $roles = Role::all();
    foreach ($roles as $role) {
        echo "\n{$role->name} (Level {$role->level}):\n";
        $permissions = $role->permissions ?? [];
        $otherAssetsPerms = array_filter($permissions, fn($p) => str_contains($p, 'other_assets'));
        $deviceReturnsPerms = array_filter($permissions, fn($p) => str_contains($p, 'device_returns'));
        
        if (!empty($otherAssetsPerms)) {
            echo "  📋 Other Assets: " . implode(', ', array_map(fn($p) => str_replace('other_assets_', '', $p), $otherAssetsPerms)) . "\n";
        }
        
        if (!empty($deviceReturnsPerms)) {
            echo "  🔄 Device Returns: " . implode(', ', array_map(fn($p) => str_replace('device_returns_', '', $p), $deviceReturnsPerms)) . "\n";
        }
        
        if (empty($otherAssetsPerms) && empty($deviceReturnsPerms)) {
            echo "  ❌ No access to Other Assets or Device Returns\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error updating permissions: " . $e->getMessage() . "\n";
    exit(1);
}

?>
