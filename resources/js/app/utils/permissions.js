// Permission utility functions for frontend

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export const hasPermission = (user, permission) => {
    if (!user || !user.role) {
        return false;
    }

    // Super Administrator should have access to everything
    if (user.role.name === 'Super Administrator' || user.role.level === 5) {
        return true;
    }

    const permissions = user.role.permissions || [];
    return permissions.includes(permission);
};

/**
 * Check if user has any of the given permissions
 * @param {Object} user - User object with role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAnyPermission = (user, permissions) => {
    if (!user || !user.role) {
        return false;
    }

    // Super Administrator should have access to everything
    if (user.role.name === 'Super Administrator' || user.role.level === 5) {
        return true;
    }

    const userPermissions = user.role.permissions || [];
    return permissions.some(permission => userPermissions.includes(permission));
};

/**
 * Check if user has all of the given permissions
 * @param {Object} user - User object with role
 * @param {Array} permissions - Array of permissions to check
 * @returns {boolean}
 */
export const hasAllPermissions = (user, permissions) => {
    if (!user || !user.role) {
        return false;
    }

    // Super Administrator should have access to everything
    if (user.role.name === 'Super Administrator' || user.role.level === 5) {
        return true;
    }

    const userPermissions = user.role.permissions || [];
    return permissions.every(permission => userPermissions.includes(permission));
};

/**
 * Filter menu items based on user permissions
 * @param {Array} menuItems - Array of menu items with required permissions
 * @param {Object} user - User object with role
 * @returns {Array} Filtered menu items
 */
export const filterMenuByPermissions = (menuItems, user) => {
    if (!user || !user.role) {
        return [];
    }

    // Super Administrator should have access to everything
    if (user.role.name === 'Super Administrator' || user.role.level === 5) {
        return menuItems;
    }

    return menuItems.filter(item => {
        if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
            return true;
        }

        return hasAnyPermission(user, item.requiredPermissions);
    });
};

/**
 * Permission constants for easy reference
 */
export const PERMISSIONS = {
    // Dashboard
    DASHBOARD_VIEW: 'dashboard_view',
    
    // User Management
    USERS_VIEW: 'users_view',
    USERS_CREATE: 'users_create',
    USERS_EDIT: 'users_edit',
    USERS_DELETE: 'users_delete',
    ROLES_VIEW: 'roles_view',
    ROLES_CREATE: 'roles_create',
    ROLES_EDIT: 'roles_edit',
    ROLES_DELETE: 'roles_delete',
    
    // Assets Management
    ASSETS_VIEW: 'assets_view',
    ASSETS_CREATE: 'assets_create',
    ASSETS_EDIT: 'assets_edit',
    ASSETS_DELETE: 'assets_delete',
    DEVICES_MANAGE: 'devices_manage',
    MONITORS_MANAGE: 'monitors_manage',
    PERIPHERALS_MANAGE: 'peripherals_manage',
    PARTS_MANAGE: 'parts_manage',
    SYSTEM_UNITS_MANAGE: 'system_units_manage',
    
    // Locations & Stations
    LOCATIONS_VIEW: 'locations_view',
    LOCATIONS_MANAGE: 'locations_manage',
    STATIONS_VIEW: 'stations_view',
    STATIONS_MANAGE: 'stations_manage',
    
    // Requests & Approvals
    REQUESTS_VIEW: 'requests_view',
    REQUESTS_CREATE: 'requests_create',
    REQUESTS_APPROVE: 'requests_approve',
    REQUESTS_MANAGE: 'requests_manage',
    PURCHASE_REQUESTS_VIEW: 'purchase_requests_view',
    PURCHASE_REQUESTS_MANAGE: 'purchase_requests_manage',
    
    // Reports & Analytics
    REPORTS_VIEW: 'reports_view',
    REPORTS_GENERATE: 'reports_generate',
    REPORTS_EXPORT: 'reports_export',
    ANALYTICS_VIEW: 'analytics_view'
};
