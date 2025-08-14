// Add New Page Permissions - Utility for developers to easily add permissions for new pages

import PagePermissionManager from './page-permission-manager.js';

/**
 * Examples of how to add permissions for new pages
 * Copy and modify these examples when adding new features
 */

// Example 1: Adding a new CRUD page for Documents
export const addDocumentsPage = () => {
    return PagePermissionManager.addPagePermissions({
        pageType: 'crud',
        resourceName: 'documents',
        displayName: 'Documents',
        moduleKey: 'assets_management', // Add to existing Assets Management module
    });
};

// Example 2: Adding a new Management module for Workflows
export const addWorkflowsModule = () => {
    return PagePermissionManager.addPagePermissions({
        pageType: 'management',
        resourceName: 'workflows',
        displayName: 'Workflows',
        moduleName: 'Workflow Management', // Creates new module
    });
};

// Example 3: Adding a new view-only page for Analytics Dashboard
export const addAnalyticsDashboard = () => {
    return PagePermissionManager.addPagePermissions({
        pageType: 'view',
        resourceName: 'analytics_dashboard',
        displayName: 'Analytics Dashboard',
        moduleKey: 'reports_analytics',
    });
};

// Example 4: Adding custom permissions for Notifications
export const addNotificationsPage = () => {
    return PagePermissionManager.addPagePermissions({
        pageType: 'custom',
        resourceName: 'notifications',
        displayName: 'Notifications',
        moduleKey: 'system_settings',
        customPermissions: [
            { 
                id: 'notifications_send', 
                name: 'Send Notifications', 
                description: 'Send notifications to users' 
            },
            { 
                id: 'notifications_schedule', 
                name: 'Schedule Notifications', 
                description: 'Schedule automated notifications' 
            },
            { 
                id: 'notifications_broadcast', 
                name: 'Broadcast Notifications', 
                description: 'Send system-wide announcements' 
            }
        ]
    });
};

// Example 5: Adding permissions for API Management
export const addApiManagementModule = () => {
    return PagePermissionManager.addPagePermissions({
        pageType: 'custom',
        resourceName: 'api',
        displayName: 'API Management',
        moduleName: 'API Management',
        customPermissions: [
            { 
                id: 'api_keys_view', 
                name: 'View API Keys', 
                description: 'View API key list and details' 
            },
            { 
                id: 'api_keys_create', 
                name: 'Create API Keys', 
                description: 'Generate new API keys' 
            },
            { 
                id: 'api_keys_revoke', 
                name: 'Revoke API Keys', 
                description: 'Revoke or disable API keys' 
            },
            { 
                id: 'api_logs_view', 
                name: 'View API Logs', 
                description: 'Access API usage logs and analytics' 
            }
        ]
    });
};

/**
 * Quick setup function for common page types
 * Use this for rapid development
 */
export const quickAddPage = (pageName, pageType = 'crud', moduleKey = null) => {
    const resourceName = pageName.toLowerCase().replace(/\s+/g, '_');
    const displayName = pageName;
    
    const config = {
        pageType,
        resourceName,
        displayName
    };
    
    if (moduleKey) {
        config.moduleKey = moduleKey;
    } else {
        config.moduleName = `${displayName} Management`;
    }
    
    return PagePermissionManager.addPagePermissions(config);
};

/**
 * Step-by-step guide for adding new pages
 */
export const getAddPageGuide = () => {
    return {
        title: "How to Add Permissions for New Pages",
        steps: [
            {
                step: 1,
                title: "Identify Your Page Type",
                description: "Determine what type of page you're adding:",
                options: [
                    "CRUD - Full Create, Read, Update, Delete operations",
                    "Management - View and manage operations",
                    "View - Read-only access",
                    "Custom - Specific permissions you define"
                ]
            },
            {
                step: 2,
                title: "Choose Module Location",
                description: "Decide whether to:",
                options: [
                    "Add to existing module (provide moduleKey)",
                    "Create new module (provide moduleName)"
                ]
            },
            {
                step: 3,
                title: "Add Permissions",
                description: "Use PagePermissionManager.addPagePermissions() or quickAddPage()",
                example: `
// Quick method
quickAddPage('Categories', 'crud', 'assets_management');

// Detailed method
PagePermissionManager.addPagePermissions({
    pageType: 'crud',
    resourceName: 'categories',
    displayName: 'Categories',
    moduleKey: 'assets_management'
});`
            },
            {
                step: 4,
                title: "Update Components",
                description: "Update role creation/edit components to use new permissions",
                note: "This is automatically handled by the permission registry system"
            },
            {
                step: 5,
                title: "Add Route Middleware",
                description: "Add permission middleware to your Laravel routes",
                example: `
Route::middleware(['auth', 'permission:categories_view'])->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store'])
        ->middleware('permission:categories_create');
});`
            },
            {
                step: 6,
                title: "Add Component Guards",
                description: "Add permission checks to React components",
                example: `
import { hasPermission } from '@/utils/permissions';

function CategoriesPage({ user }) {
    if (!hasPermission(user, 'categories_view')) {
        return <AccessDenied />;
    }
    
    return (
        <div>
            {hasPermission(user, 'categories_create') && (
                <CreateButton />
            )}
        </div>
    );
}`
            },
            {
                step: 7,
                title: "Build and Test",
                description: "Build assets and test the new permissions",
                commands: [
                    "npm run build",
                    "Test role creation with new permissions",
                    "Test page access with different roles"
                ]
            }
        ]
    };
};

export default {
    addDocumentsPage,
    addWorkflowsModule,
    addAnalyticsDashboard,
    addNotificationsPage,
    addApiManagementModule,
    quickAddPage,
    getAddPageGuide
};
