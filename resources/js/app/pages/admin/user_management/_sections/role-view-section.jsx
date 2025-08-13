import React from 'react'
import Modal from '@/app/pages/components/modal'
import Button from '@/app/pages/components/button'

export default function RoleViewSection({ role, isOpen, onClose }) {
    if (!role) return null

    const getLevelText = (level) => {
        switch (level) {
            case 1: return 'Level 1 - Basic User'
            case 2: return 'Level 2 - Advanced User'
            case 3: return 'Level 3 - Supervisor'
            case 4: return 'Level 4 - Manager'
            case 5: return 'Level 5 - Administrator'
            default: return `Level ${level}`
        }
    }

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
        switch (status) {
            case 'Active':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Inactive':
                return `${baseClasses} bg-red-100 text-red-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getLevelBadge = (level) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (level) {
            case 5:
                return `${baseClasses} bg-red-100 text-red-800`
            case 4:
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 3:
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 2:
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 1:
                return `${baseClasses} bg-gray-100 text-gray-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    // Organize permissions by module
    const organizePermissions = (permissions) => {
        if (!Array.isArray(permissions)) return {}

        const modules = {
            'Dashboard': [],
            'User Management': [],
            'Assets Management': [],
            'Locations & Stations': [],
            'Requests & Approvals': [],
            'Reports & Analytics': []
        }

        permissions.forEach(permission => {
            if (permission === 'dashboard_view') {
                modules['Dashboard'].push(permission)
            } else if (permission.startsWith('users_') || permission.startsWith('roles_')) {
                modules['User Management'].push(permission)
            } else if (permission.startsWith('assets_') || permission.includes('_manage') && !permission.startsWith('requests_')) {
                modules['Assets Management'].push(permission)
            } else if (permission.startsWith('locations_') || permission.startsWith('stations_')) {
                modules['Locations & Stations'].push(permission)
            } else if (permission.startsWith('requests_') || permission.startsWith('purchase_')) {
                modules['Requests & Approvals'].push(permission)
            } else if (permission.startsWith('reports_') || permission.startsWith('analytics_')) {
                modules['Reports & Analytics'].push(permission)
            }
        })

        return modules
    }

    const formatPermissionName = (permission) => {
        return permission
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    const organizedPermissions = organizePermissions(role.permissions)

    return (
        <Modal isOpen={isOpen} onClose={onClose} width="w-4/5 max-w-4xl">
            <div className="bg-white px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{role.name}</h2>
                        <span className={getLevelBadge(role.level)}>
                            {getLevelText(role.level)}
                        </span>
                        <span className={getStatusBadge(role.status)}>
                            {role.status}
                        </span>
                        {role.is_system && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                System Role
                            </span>
                        )}
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Role Information */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Information</h3>
                            
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role Name</label>
                                    <p className="text-sm text-gray-900">{role.name}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Level</label>
                                    <p className="text-sm text-gray-900">{getLevelText(role.level)}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="text-sm text-gray-900">{role.status}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <p className="text-sm text-gray-900">{role.description || 'No description provided'}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Users Assigned</label>
                                    <p className="text-sm text-gray-900">{role.userCount || 0} users</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Permissions</label>
                                    <p className="text-sm text-gray-900">{Array.isArray(role.permissions) ? role.permissions.length : 0} permissions</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Created</label>
                                    <p className="text-sm text-gray-900">{new Date(role.created_at).toLocaleDateString()}</p>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                                    <p className="text-sm text-gray-900">{new Date(role.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                            
                            {Object.keys(organizedPermissions).some(module => organizedPermissions[module].length > 0) ? (
                                <div className="space-y-4">
                                    {Object.entries(organizedPermissions).map(([module, permissions]) => {
                                        if (permissions.length === 0) return null
                                        
                                        return (
                                            <div key={module} className="border border-gray-200 rounded-lg p-3">
                                                <h4 className="font-medium text-gray-900 mb-2">{module}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {permissions.map(permission => (
                                                        <div key={permission} className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                                            <span className="text-sm text-gray-700">
                                                                {formatPermissionName(permission)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No permissions assigned to this role</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
