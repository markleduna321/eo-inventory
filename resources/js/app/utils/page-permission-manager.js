// Page Permission Manager - Utility for handling permissions when adding new pages

import { 
    PERMISSION_REGISTRY, 
    addPermissionToModule, 
    addPermissionModule, 
    createCRUDPermissions, 
    createManagementPermissions,
    getAllPermissionModules 
} from './permission-registry.js';

/**
 * Page Permission Manager Class
 * Handles permission management for new pages and features
 */
export class PagePermissionManager {
    
    /**
     * Add permissions for a new page
     * @param {Object} config - Configuration object
     * @param {string} config.pageType - Type of page: 'crud', 'management', 'view', 'custom'
     * @param {string} config.resourceName - Resource name (e.g., 'documents', 'workflows')
     * @param {string} config.displayName - Display name (e.g., 'Documents', 'Workflows')
     * @param {string} config.moduleKey - Module to add to (optional, will create new if not exists)
     * @param {string} config.moduleName - Module display name (required if creating new module)
     * @param {Array} config.customPermissions - Custom permissions array (for pageType 'custom')
     * @returns {Object} Result object with success status and details
     */
    static addPagePermissions(config) {
        const {
            pageType,
            resourceName,
            displayName,
            moduleKey,
            moduleName,
            customPermissions = []
        } = config;

        // Validate required parameters
        if (!pageType || !resourceName || !displayName) {
            return {
                success: false,
                error: 'pageType, resourceName, and displayName are required'
            };
        }

        let permissions = [];

        // Generate permissions based on page type
        switch (pageType) {
            case 'crud':
                permissions = createCRUDPermissions(resourceName, displayName);
                break;
            
            case 'management':
                permissions = createManagementPermissions(resourceName, displayName);
                break;
            
            case 'view':
                permissions = [{
                    id: `${resourceName}_view`,
                    name: `View ${displayName}`,
                    description: `Access ${displayName.toLowerCase()} page`
                }];
                break;
            
            case 'custom':
                permissions = customPermissions;
                if (permissions.length === 0) {
                    return {
                        success: false,
                        error: 'customPermissions array is required for custom page type'
                    };
                }
                break;
            
            default:
                return {
                    success: false,
                    error: `Invalid pageType: ${pageType}. Must be 'crud', 'management', 'view', or 'custom'`
                };
        }

        // Determine target module
        let targetModuleKey = moduleKey;
        
        if (!targetModuleKey) {
            // Create new module if not specified
            targetModuleKey = `${resourceName}_module`;
            if (!moduleName) {
                return {
                    success: false,
                    error: 'moduleName is required when creating a new module'
                };
            }
            
            const moduleCreated = addPermissionModule(targetModuleKey, moduleName, permissions);
            if (!moduleCreated) {
                return {
                    success: false,
                    error: `Failed to create module: ${targetModuleKey}`
                };
            }
            
            return {
                success: true,
                moduleKey: targetModuleKey,
                moduleName: moduleName,
                permissionsAdded: permissions,
                message: `Successfully created new module '${moduleName}' with ${permissions.length} permissions`
            };
        }

        // Add to existing module
        let addedPermissions = [];
        let failedPermissions = [];

        for (const permission of permissions) {
            const added = addPermissionToModule(targetModuleKey, permission);
            if (added) {
                addedPermissions.push(permission);
            } else {
                failedPermissions.push(permission);
            }
        }

        return {
            success: addedPermissions.length > 0,
            moduleKey: targetModuleKey,
            permissionsAdded: addedPermissions,
            permissionsFailed: failedPermissions,
            message: `Added ${addedPermissions.length} permissions to module. ${failedPermissions.length} failed.`
        };
    }

    /**
     * Get updated permission modules for role creation/editing
     * @returns {Array} Array of permission modules with latest permissions
     */
    static getUpdatedPermissionModules() {
        return getAllPermissionModules();
    }

    /**
     * Generate route middleware configuration for new page
     * @param {string} permissionId - Permission ID required for the route
     * @returns {string} Middleware string for Laravel routes
     */
    static generateRouteMiddleware(permissionId) {
        return `['auth', 'permission:${permissionId}']`;
    }

    /**
     * Generate component permission check for React components
     * @param {string|Array} permissions - Permission ID or array of permission IDs
     * @param {string} checkType - 'any' or 'all' for multiple permissions
     * @returns {string} Code snippet for permission checking
     */
    static generateComponentPermissionCheck(permissions, checkType = 'any') {
        const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
        const permissionList = permissionArray.map(p => `'${p}'`).join(', ');
        
        if (permissionArray.length === 1) {
            return `hasPermission(user, '${permissionArray[0]}')`;
        }
        
        const functionName = checkType === 'all' ? 'hasAllPermissions' : 'hasAnyPermission';
        return `${functionName}(user, [${permissionList}])`;
    }

    /**
     * Example usage and setup guide
     * @returns {Object} Examples and documentation
     */
    static getSetupGuide() {
        return {
            examples: {
                crudPage: {
                    description: "Adding a CRUD page for Documents",
                    code: `
PagePermissionManager.addPagePermissions({
    pageType: 'crud',
    resourceName: 'documents',
    displayName: 'Documents',
    moduleKey: 'assets_management' // Add to existing module
});`
                },
                
                newModule: {
                    description: "Creating a new module with management permissions",
                    code: `
PagePermissionManager.addPagePermissions({
    pageType: 'management',
    resourceName: 'workflows',
    displayName: 'Workflows',
    moduleName: 'Workflow Management' // Creates new module
});`
                },
                
                customPermissions: {
                    description: "Adding custom permissions",
                    code: `
PagePermissionManager.addPagePermissions({
    pageType: 'custom',
    resourceName: 'notifications',
    displayName: 'Notifications',
    moduleKey: 'system_settings',
    customPermissions: [
        { id: 'notifications_send', name: 'Send Notifications', description: 'Send notifications to users' },
        { id: 'notifications_schedule', name: 'Schedule Notifications', description: 'Schedule automated notifications' }
    ]
});`
                }
            },
            
            steps: [
                "1. Identify the type of page you're adding (CRUD, Management, View, or Custom)",
                "2. Choose whether to add to existing module or create new one",
                "3. Call PagePermissionManager.addPagePermissions() with appropriate config",
                "4. Update role creation/edit components to use getUpdatedPermissionModules()",
                "5. Add middleware to your Laravel routes using generateRouteMiddleware()",
                "6. Add permission checks to React components using generateComponentPermissionCheck()",
                "7. Update existing roles to include new permissions as needed"
            ],
            
            routeExample: `
// Laravel route with permission middleware
Route::middleware(['auth', 'permission:documents_view'])->group(function () {
    Route::get('/documents', [DocumentController::class, 'index'])->name('documents.index');
    Route::post('/documents', [DocumentController::class, 'store'])->middleware('permission:documents_create');
    Route::put('/documents/{id}', [DocumentController::class, 'update'])->middleware('permission:documents_edit');
    Route::delete('/documents/{id}', [DocumentController::class, 'destroy'])->middleware('permission:documents_delete');
});`,

            componentExample: `
// React component with permission check
import { hasPermission } from '@/utils/permissions';

function DocumentsPage({ user }) {
    if (!hasPermission(user, 'documents_view')) {
        return <div>Access Denied</div>;
    }
    
    return (
        <div>
            <h1>Documents</h1>
            {hasPermission(user, 'documents_create') && (
                <button>Create Document</button>
            )}
        </div>
    );
}`
        };
    }
}

export default PagePermissionManager;
