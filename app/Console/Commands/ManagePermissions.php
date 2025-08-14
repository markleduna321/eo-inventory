<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Role;

class ManagePermissions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'permissions:manage 
                            {action : The action to perform (list, add, remove, update-role)}
                            {--permission= : Permission ID to add/remove}
                            {--role= : Role ID or name to update}
                            {--module= : Module name for organization}
                            {--description= : Description for new permission}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage permissions and roles from command line';

    /**
     * Permission registry - keep in sync with frontend
     */
    private $permissionRegistry = [
        'dashboard' => [
            'dashboard_view' => 'Access to main dashboard and analytics'
        ],
        'user_management' => [
            'users_view' => 'View user list and details',
            'users_create' => 'Add new users to the system',
            'users_edit' => 'Modify user information',
            'users_delete' => 'Remove users from system',
            'roles_view' => 'View role list and permissions',
            'roles_create' => 'Create new roles',
            'roles_edit' => 'Modify role permissions',
            'roles_delete' => 'Remove roles from system'
        ],
        'assets_management' => [
            'assets_view' => 'View all asset types and inventory',
            'assets_create' => 'Add new assets to inventory',
            'assets_edit' => 'Modify asset information',
            'assets_delete' => 'Remove assets from inventory',
            'devices_manage' => 'Full access to devices management',
            'monitors_manage' => 'Full access to monitors management',
            'peripherals_manage' => 'Full access to peripherals management',
            'parts_manage' => 'Full access to parts and accessories',
            'inventory_view' => 'Access to inventory overview',
            'inventory_audit' => 'Perform inventory audits and checks'
        ],
        'locations_stations' => [
            'locations_view' => 'View all locations and stations',
            'locations_create' => 'Add new locations',
            'locations_edit' => 'Modify location information',
            'locations_delete' => 'Remove locations',
            'stations_manage' => 'Full access to station management'
        ],
        'requests_approvals' => [
            'requests_view' => 'View all asset and purchase requests',
            'requests_create' => 'Submit new requests',
            'requests_approve' => 'Approve or reject requests',
            'requests_manage' => 'Full request lifecycle management',
            'purchase_requests_view' => 'Access purchase request system',
            'purchase_requests_manage' => 'Full purchase request management'
        ],
        'reports_analytics' => [
            'reports_view' => 'Access to view generated reports',
            'reports_generate' => 'Create and generate new reports',
            'reports_export' => 'Download and export report data',
            'analytics_view' => 'Access to system analytics and insights'
        ],
        'system_settings' => [
            'settings_view' => 'Access system configuration',
            'settings_edit' => 'Modify system settings',
            'backup_manage' => 'Create and restore system backups',
            'logs_view' => 'Access system logs and audit trails'
        ]
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                $this->listPermissions();
                break;
            case 'add':
                $this->addPermission();
                break;
            case 'remove':
                $this->removePermission();
                break;
            case 'update-role':
                $this->updateRole();
                break;
            case 'create-role':
                $this->createRole();
                break;
            case 'list-roles':
                $this->listRoles();
                break;
            default:
                $this->error("Invalid action. Available actions: list, add, remove, update-role, create-role, list-roles");
                return 1;
        }

        return 0;
    }

    /**
     * List all available permissions
     */
    private function listPermissions()
    {
        $this->info('Available Permissions by Module:');
        $this->line('');

        foreach ($this->permissionRegistry as $module => $permissions) {
            $this->info(ucwords(str_replace('_', ' ', $module)) . ':');
            foreach ($permissions as $permission => $description) {
                $this->line("  • {$permission}: {$description}");
            }
            $this->line('');
        }
    }

    /**
     * Add a new permission to a role
     */
    private function addPermission()
    {
        $permission = $this->option('permission');
        $roleIdentifier = $this->option('role');

        if (!$permission || !$roleIdentifier) {
            $this->error('Both --permission and --role options are required for add action');
            return;
        }

        $role = $this->findRole($roleIdentifier);
        if (!$role) {
            $this->error("Role not found: {$roleIdentifier}");
            return;
        }

        $permissions = $role->permissions ?? [];
        
        if (in_array($permission, $permissions)) {
            $this->info("Permission '{$permission}' already exists in role '{$role->name}'");
            return;
        }

        $permissions[] = $permission;
        $role->permissions = $permissions;
        $role->save();

        $this->info("Added permission '{$permission}' to role '{$role->name}'");
    }

    /**
     * Remove a permission from a role
     */
    private function removePermission()
    {
        $permission = $this->option('permission');
        $roleIdentifier = $this->option('role');

        if (!$permission || !$roleIdentifier) {
            $this->error('Both --permission and --role options are required for remove action');
            return;
        }

        $role = $this->findRole($roleIdentifier);
        if (!$role) {
            $this->error("Role not found: {$roleIdentifier}");
            return;
        }

        $permissions = $role->permissions ?? [];
        
        if (!in_array($permission, $permissions)) {
            $this->info("Permission '{$permission}' not found in role '{$role->name}'");
            return;
        }

        $permissions = array_filter($permissions, function($p) use ($permission) {
            return $p !== $permission;
        });

        $role->permissions = array_values($permissions);
        $role->save();

        $this->info("Removed permission '{$permission}' from role '{$role->name}'");
    }

    /**
     * Update role permissions interactively
     */
    private function updateRole()
    {
        $roleIdentifier = $this->option('role');

        if (!$roleIdentifier) {
            $this->error('--role option is required for update-role action');
            return;
        }

        $role = $this->findRole($roleIdentifier);
        if (!$role) {
            $this->error("Role not found: {$roleIdentifier}");
            return;
        }

        $this->info("Updating permissions for role: {$role->name}");
        $this->line("Current permissions: " . implode(', ', $role->permissions ?? []));
        $this->line('');

        // Show available permissions and let user select
        $allPermissions = [];
        foreach ($this->permissionRegistry as $module => $permissions) {
            $allPermissions = array_merge($allPermissions, array_keys($permissions));
        }

        $selectedPermissions = $role->permissions ?? [];

        foreach ($this->permissionRegistry as $module => $permissions) {
            $this->info(ucwords(str_replace('_', ' ', $module)) . ':');
            
            foreach ($permissions as $permission => $description) {
                $hasPermission = in_array($permission, $selectedPermissions);
                $status = $hasPermission ? '[✓]' : '[ ]';
                
                if ($this->confirm("{$status} {$permission}: {$description} - Toggle?", false)) {
                    if ($hasPermission) {
                        $selectedPermissions = array_filter($selectedPermissions, function($p) use ($permission) {
                            return $p !== $permission;
                        });
                    } else {
                        $selectedPermissions[] = $permission;
                    }
                }
            }
        }

        $role->permissions = array_values($selectedPermissions);
        $role->save();

        $this->info("Updated permissions for role '{$role->name}'");
        $this->line("New permissions: " . implode(', ', $selectedPermissions));
    }

    /**
     * Create a new role
     */
    private function createRole()
    {
        $name = $this->ask('Role name:');
        $level = $this->ask('Role level (1-5):', '2');
        $description = $this->ask('Role description:');

        if (Role::where('name', $name)->exists()) {
            $this->error("Role '{$name}' already exists");
            return;
        }

        $role = Role::create([
            'name' => $name,
            'level' => intval($level),
            'description' => $description,
            'permissions' => [],
            'is_system' => false,
            'status' => 'Active'
        ]);

        $this->info("Created role '{$name}' with ID {$role->id}");
        
        if ($this->confirm('Add permissions now?')) {
            $this->option('role', $role->id);
            $this->updateRole();
        }
    }

    /**
     * List all roles
     */
    private function listRoles()
    {
        $roles = Role::all();

        $this->info('All Roles:');
        $this->line('');

        foreach ($roles as $role) {
            $systemTag = $role->is_system ? ' [SYSTEM]' : '';
            $this->info("• {$role->name} (ID: {$role->id}, Level: {$role->level}){$systemTag}");
            $this->line("  Description: {$role->description}");
            $this->line("  Status: {$role->status}");
            $this->line("  Permissions: " . implode(', ', $role->permissions ?? []));
            $this->line("  Users: {$role->users()->count()}");
            $this->line('');
        }
    }

    /**
     * Find role by ID or name
     */
    private function findRole($identifier)
    {
        if (is_numeric($identifier)) {
            return Role::find($identifier);
        }

        return Role::where('name', $identifier)->first();
    }
}
