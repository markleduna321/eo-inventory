<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class DefaultRolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Administrator',
                'level' => 5,
                'description' => 'Full access to all system features and settings',
                'permissions' => [
                    'dashboard_view',
                    'users_view', 'users_create', 'users_edit', 'users_delete',
                    'roles_view', 'roles_create', 'roles_edit', 'roles_delete',
                    'assets_view', 'assets_create', 'assets_edit', 'assets_delete',
                    'devices_manage', 'monitors_manage', 'peripherals_manage', 'parts_manage', 'system_units_manage',
                    'locations_view', 'locations_manage',
                    'stations_view', 'stations_manage',
                    'requests_view', 'requests_create', 'requests_approve', 'requests_manage',
                    'purchase_requests_view', 'purchase_requests_manage',
                    'reports_view', 'reports_generate', 'reports_export', 'analytics_view'
                ],
                'is_system' => true,
                'status' => 'Active'
            ],
            [
                'name' => 'IT Manager',
                'level' => 4,
                'description' => 'Manage IT assets and approve requests',
                'permissions' => [
                    'dashboard_view',
                    'assets_view', 'assets_create', 'assets_edit',
                    'devices_manage', 'monitors_manage', 'peripherals_manage', 'parts_manage', 'system_units_manage',
                    'locations_view', 'locations_manage',
                    'stations_view', 'stations_manage',
                    'requests_view', 'requests_approve', 'requests_manage',
                    'purchase_requests_view', 'purchase_requests_manage',
                    'reports_view', 'reports_generate', 'analytics_view'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'name' => 'Asset Administrator',
                'level' => 3,
                'description' => 'Manage inventory and asset information',
                'permissions' => [
                    'dashboard_view',
                    'assets_view', 'assets_create', 'assets_edit',
                    'devices_manage', 'monitors_manage', 'peripherals_manage', 'parts_manage', 'system_units_manage',
                    'locations_view',
                    'stations_view',
                    'requests_view',
                    'reports_view'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'name' => 'Request Manager',
                'level' => 2,
                'description' => 'Handle and process requests only',
                'permissions' => [
                    'dashboard_view',
                    'requests_view', 'requests_create', 'requests_approve',
                    'purchase_requests_view',
                    'reports_view'
                ],
                'is_system' => false,
                'status' => 'Active'
            ],
            [
                'name' => 'Basic User',
                'level' => 1,
                'description' => 'Basic access to create requests only',
                'permissions' => [
                    'dashboard_view',
                    'requests_view', 'requests_create'
                ],
                'is_system' => false,
                'status' => 'Active'
            ]
        ];

        foreach ($roles as $roleData) {
            Role::updateOrCreate(
                ['name' => $roleData['name']],
                $roleData
            );
        }
    }
}
