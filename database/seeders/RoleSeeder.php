<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'id' => 1,
                'name' => 'Super Administrator',
                'level' => 5,
                'description' => 'Full system access with all permissions',
                'permissions' => [
                    'dashboard_view', 'users_view', 'users_create', 'users_edit', 'users_delete',
                    'roles_view', 'roles_create', 'roles_edit', 'roles_delete',
                    'assets_view', 'assets_create', 'assets_edit', 'assets_delete',
                    'other_assets_view', 'other_assets_create', 'other_assets_edit', 'other_assets_delete', 'other_assets_manage',
                    'device_returns_view', 'device_returns_create', 'device_returns_edit', 'device_returns_delete', 'device_returns_manage', 'device_returns_approve',
                    'reports_view', 'reports_generate', 'reports_export'
                ],
                'is_system' => true,
                'status' => 'Active'
            ],
            [
                'id' => 2,
                'name' => 'Asset Manager',
                'level' => 4,
                'description' => 'Manage all assets, inventory, and asset-related operations',
                'permissions' => [
                    'dashboard_view', 'assets_view', 'assets_create', 'assets_edit',
                    'devices_manage', 'monitors_manage', 'peripherals_manage', 'parts_manage', 'system_units_manage',
                    'other_assets_view', 'other_assets_create', 'other_assets_edit', 'other_assets_delete', 'other_assets_manage',
                    'device_returns_view', 'device_returns_create', 'device_returns_edit', 'device_returns_manage',
                    'locations_view', 'locations_manage', 'stations_view', 'stations_manage',
                    'reports_view', 'reports_generate'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'id' => 3,
                'name' => 'IT Technician',
                'level' => 3,
                'description' => 'Technical support and basic asset management',
                'permissions' => [
                    'dashboard_view', 'assets_view', 'assets_edit',
                    'devices_manage', 'monitors_manage', 'peripherals_manage', 'system_units_manage',
                    'other_assets_view', 'other_assets_edit',
                    'device_returns_view', 'device_returns_create', 'device_returns_edit',
                    'locations_view', 'stations_view', 'requests_view', 'requests_create'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'id' => 4,
                'name' => 'Department Head',
                'level' => 3,
                'description' => 'Department-level asset requests and approvals',
                'permissions' => [
                    'dashboard_view', 'assets_view', 'requests_view', 'requests_create', 'requests_approve',
                    'device_returns_view', 'device_returns_approve',
                    'purchase_requests_view', 'purchase_requests_manage', 'reports_view'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'id' => 5,
                'name' => 'Employee',
                'level' => 1,
                'description' => 'Basic user access with limited permissions',
                'permissions' => [
                    'dashboard_view', 'assets_view', 'requests_view', 'requests_create',
                    'device_returns_view', 'device_returns_create'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'id' => 6,
                'name' => 'Viewer',
                'level' => 1,
                'description' => 'Read-only access to basic information',
                'permissions' => [
                    'dashboard_view', 'assets_view', 'requests_view'
                ],
                'is_system' => false,
                'status' => 'Inactive'
            ]
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['id' => $roleData['id']], 
                $roleData
            );
        }
    }
}
