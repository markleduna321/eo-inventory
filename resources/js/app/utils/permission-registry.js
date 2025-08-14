// Permission Registry - Central management for all permissions across the application

/**
 * Permission Registry System
 * This file contains all available permissions organized by modules.
 * When adding new pages or features, add the corresponding permissions here.
 */

export const PERMISSION_REGISTRY = {
    // Dashboard Module
    dashboard: {
        module: 'Dashboard',
        permissions: [
            { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to main dashboard and analytics' }
        ]
    },

    // User Management Module
    user_management: {
        module: 'User Management',
        permissions: [
            { id: 'users_view', name: 'View Users', description: 'View user list and details' },
            { id: 'users_create', name: 'Create Users', description: 'Add new users to the system' },
            { id: 'users_edit', name: 'Edit Users', description: 'Modify user information' },
            { id: 'users_delete', name: 'Delete Users', description: 'Remove users from system' },
            { id: 'roles_view', name: 'View Roles', description: 'View role list and permissions' },
            { id: 'roles_create', name: 'Create Roles', description: 'Create new roles' },
            { id: 'roles_edit', name: 'Edit Roles', description: 'Modify role permissions' },
            { id: 'roles_delete', name: 'Delete Roles', description: 'Remove roles from system' }
        ]
    },

    // Assets Management Module
    assets_management: {
        module: 'Assets Management',
        permissions: [
            { id: 'assets_view', name: 'View Assets', description: 'View all asset types and inventory' },
            { id: 'assets_create', name: 'Create Assets', description: 'Add new assets to inventory' },
            { id: 'assets_edit', name: 'Edit Assets', description: 'Modify asset information' },
            { id: 'assets_delete', name: 'Delete Assets', description: 'Remove assets from inventory' },
            { id: 'devices_manage', name: 'Manage Devices', description: 'Full access to devices management' },
            { id: 'monitors_manage', name: 'Manage Monitors', description: 'Full access to monitors management' },
            { id: 'peripherals_manage', name: 'Manage Peripherals', description: 'Full access to peripherals management' },
            { id: 'parts_manage', name: 'Manage Parts', description: 'Full access to parts and accessories' },
            { id: 'inventory_view', name: 'View Inventory', description: 'Access to inventory overview' },
            { id: 'inventory_audit', name: 'Audit Inventory', description: 'Perform inventory audits and checks' }
        ]
    },

    // Locations & Stations Module
    locations_stations: {
        module: 'Locations & Stations',
        permissions: [
            { id: 'locations_view', name: 'View Locations', description: 'View all locations and stations' },
            { id: 'locations_create', name: 'Create Locations', description: 'Add new locations' },
            { id: 'locations_edit', name: 'Edit Locations', description: 'Modify location information' },
            { id: 'locations_delete', name: 'Delete Locations', description: 'Remove locations' },
            { id: 'stations_manage', name: 'Manage Stations', description: 'Full access to station management' }
        ]
    },

    // Requests & Approvals Module
    requests_approvals: {
        module: 'Requests & Approvals',
        permissions: [
            { id: 'requests_view', name: 'View Requests', description: 'View all asset and purchase requests' },
            { id: 'requests_create', name: 'Create Requests', description: 'Submit new requests' },
            { id: 'requests_approve', name: 'Approve Requests', description: 'Approve or reject requests' },
            { id: 'requests_manage', name: 'Manage Requests', description: 'Full request lifecycle management' },
            { id: 'purchase_requests_view', name: 'View Purchase Requests', description: 'Access purchase request system' },
            { id: 'purchase_requests_manage', name: 'Manage Purchase Requests', description: 'Full purchase request management' }
        ]
    },

    // Reports & Analytics Module
    reports_analytics: {
        module: 'Reports & Analytics',
        permissions: [
            { id: 'reports_view', name: 'View Reports', description: 'Access to view generated reports' },
            { id: 'reports_generate', name: 'Generate Reports', description: 'Create and generate new reports' },
            { id: 'reports_export', name: 'Export Reports', description: 'Download and export report data' },
            { id: 'analytics_view', name: 'View Analytics', description: 'Access to system analytics and insights' }
        ]
    },

    // System Settings Module
    system_settings: {
        module: 'System Settings',
        permissions: [
            { id: 'settings_view', name: 'View Settings', description: 'Access system configuration' },
            { id: 'settings_edit', name: 'Edit Settings', description: 'Modify system settings' },
            { id: 'backup_manage', name: 'Manage Backups', description: 'Create and restore system backups' },
            { id: 'logs_view', name: 'View System Logs', description: 'Access system logs and audit trails' }
        ]
    }
};

/**
 * Get all permission modules as an array
 * @returns {Array} Array of permission modules
 */
export const getAllPermissionModules = () => {
    return Object.values(PERMISSION_REGISTRY);
};

/**
 * Get permissions for a specific module
 * @param {string} moduleKey - The module key (e.g., 'user_management')
 * @returns {Object|null} Module permissions or null if not found
 */
export const getModulePermissions = (moduleKey) => {
    return PERMISSION_REGISTRY[moduleKey] || null;
};

/**
 * Get all permissions as a flat array
 * @returns {Array} Array of all permission objects
 */
export const getAllPermissions = () => {
    return Object.values(PERMISSION_REGISTRY).flatMap(module => module.permissions);
};

/**
 * Get all permission IDs as an array
 * @returns {Array} Array of permission IDs
 */
export const getAllPermissionIds = () => {
    return getAllPermissions().map(permission => permission.id);
};

/**
 * Find permission by ID
 * @param {string} permissionId - The permission ID to find
 * @returns {Object|null} Permission object or null if not found
 */
export const findPermissionById = (permissionId) => {
    return getAllPermissions().find(permission => permission.id === permissionId) || null;
};

/**
 * Add a new permission to a module
 * @param {string} moduleKey - The module key
 * @param {Object} permission - Permission object with id, name, description
 * @returns {boolean} Success status
 */
export const addPermissionToModule = (moduleKey, permission) => {
    if (!PERMISSION_REGISTRY[moduleKey]) {
        console.error(`Module ${moduleKey} not found`);
        return false;
    }

    if (!permission.id || !permission.name || !permission.description) {
        console.error('Permission must have id, name, and description');
        return false;
    }

    // Check if permission already exists
    const existingPermission = findPermissionById(permission.id);
    if (existingPermission) {
        console.error(`Permission with ID ${permission.id} already exists`);
        return false;
    }

    PERMISSION_REGISTRY[moduleKey].permissions.push(permission);
    return true;
};

/**
 * Add a new permission module
 * @param {string} moduleKey - The module key
 * @param {string} moduleName - The module display name
 * @param {Array} permissions - Array of permission objects
 * @returns {boolean} Success status
 */
export const addPermissionModule = (moduleKey, moduleName, permissions = []) => {
    if (PERMISSION_REGISTRY[moduleKey]) {
        console.error(`Module ${moduleKey} already exists`);
        return false;
    }

    PERMISSION_REGISTRY[moduleKey] = {
        module: moduleName,
        permissions: permissions
    };

    return true;
};

/**
 * Helper function to create standard CRUD permissions for a new module
 * @param {string} resourceName - Name of the resource (e.g., 'documents', 'categories')
 * @param {string} displayName - Display name for the resource (e.g., 'Documents', 'Categories')
 * @returns {Array} Array of CRUD permission objects
 */
export const createCRUDPermissions = (resourceName, displayName) => {
    return [
        { 
            id: `${resourceName}_view`, 
            name: `View ${displayName}`, 
            description: `View ${displayName.toLowerCase()} list and details` 
        },
        { 
            id: `${resourceName}_create`, 
            name: `Create ${displayName}`, 
            description: `Add new ${displayName.toLowerCase()}` 
        },
        { 
            id: `${resourceName}_edit`, 
            name: `Edit ${displayName}`, 
            description: `Modify ${displayName.toLowerCase()} information` 
        },
        { 
            id: `${resourceName}_delete`, 
            name: `Delete ${displayName}`, 
            description: `Remove ${displayName.toLowerCase()} from system` 
        }
    ];
};

/**
 * Helper function to create management permissions for a new module
 * @param {string} resourceName - Name of the resource (e.g., 'workflow', 'notifications')
 * @param {string} displayName - Display name for the resource (e.g., 'Workflow', 'Notifications')
 * @returns {Array} Array of management permission objects
 */
export const createManagementPermissions = (resourceName, displayName) => {
    return [
        { 
            id: `${resourceName}_view`, 
            name: `View ${displayName}`, 
            description: `Access ${displayName.toLowerCase()} dashboard` 
        },
        { 
            id: `${resourceName}_manage`, 
            name: `Manage ${displayName}`, 
            description: `Full access to ${displayName.toLowerCase()} management` 
        }
    ];
};

export default PERMISSION_REGISTRY;
