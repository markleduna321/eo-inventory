import React, { useState, useEffect } from 'react'
import Modal from '@/app/pages/components/modal'
import Button from '@/app/pages/components/button'
import InputTextComponent from '@/app/pages/components/input-text-component'
import store from '@/app/store/store'
import { get_roles_thunk, update_role_thunk } from '../_redux/roles-thunk'

export default function RoleEditSection({ role, isOpen, onClose }) {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        description: '',
        status: 'Active'
    })
    const [selectedPermissions, setSelectedPermissions] = useState([])
    const [processing, setProcessing] = useState(false)
    const [errors, setErrors] = useState({})

    // Update form data when role changes
    useEffect(() => {
        if (role) {
            setFormData({
                name: role.name || '',
                level: role.level?.toString() || '',
                description: role.description || '',
                status: role.status || 'Active'
            })
            setSelectedPermissions(Array.isArray(role.permissions) ? role.permissions : [])
        }
    }, [role])

    const handleClose = () => {
        setErrors({})
        onClose()
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        setErrors({})
        
        try {
            // Prepare role data
            const roleData = {
                ...formData,
                permissions: selectedPermissions
            }

            // Use the Redux thunk to update the role
            const result = await store.dispatch(update_role_thunk(role.id, roleData))
            
            if (result.status === 200) {
                handleClose()
                // Refresh roles list
                store.dispatch(get_roles_thunk())
            } else {
                // Handle validation errors
                if (result.data && result.data.errors) {
                    setErrors(result.data.errors)
                } else {
                    setErrors({ general: 'Failed to update role. Please try again.' })
                }
            }
        } catch (error) {
            console.error('Role update error:', error)
            setErrors({ general: 'An unexpected error occurred.' })
        } finally {
            setProcessing(false)
        }
    }

    // Define all available permissions organized by module
    const permissionModules = [
        {
            module: 'Dashboard',
            permissions: [
                { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to main dashboard and analytics' }
            ]
        },
        {
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
        {
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
                { id: 'system_units_manage', name: 'Manage System Units', description: 'Full access to system units' }
            ]
        },
        {
            module: 'Locations & Stations',
            permissions: [
                { id: 'locations_view', name: 'View Locations', description: 'View location information' },
                { id: 'locations_manage', name: 'Manage Locations', description: 'Create, edit, and delete locations' },
                { id: 'stations_view', name: 'View Stations', description: 'View workstation information' },
                { id: 'stations_manage', name: 'Manage Stations', description: 'Create, edit, and delete workstations' }
            ]
        },
        {
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
        {
            module: 'Reports & Analytics',
            permissions: [
                { id: 'reports_view', name: 'View Reports', description: 'Access to view generated reports' },
                { id: 'reports_generate', name: 'Generate Reports', description: 'Create and generate new reports' },
                { id: 'reports_export', name: 'Export Reports', description: 'Download and export report data' },
                { id: 'analytics_view', name: 'View Analytics', description: 'Access to system analytics and insights' }
            ]
        }
    ]

    const handlePermissionChange = (permissionId) => {
        setSelectedPermissions(prev => 
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        )
    }

    const handleModuleSelectAll = (modulePermissions) => {
        const modulePermissionIds = modulePermissions.map(p => p.id)
        const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id))
        
        if (allSelected) {
            // Deselect all from this module
            setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)))
        } else {
            // Select all from this module
            setSelectedPermissions(prev => [...new Set([...prev, ...modulePermissionIds])])
        }
    }

    if (!role) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} width="w-4/5 max-w-4xl">
            <div className="bg-white px-6 py-4">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Edit Role: {role.name}</h2>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Role Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="role_name" className="block text-sm font-medium text-gray-700 mb-1">
                                Role Name *
                            </label>
                            <InputTextComponent
                                id="role_name"
                                name="role_name"
                                type="text"
                                placeholder="e.g. Asset Manager, IT Technician"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                required
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="role_level" className="block text-sm font-medium text-gray-700 mb-1">
                                Role Level *
                            </label>
                            <select 
                                id="role_level"
                                name="role_level"
                                value={formData.level}
                                onChange={(e) => setFormData({...formData, level: e.target.value})}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                required
                            >
                                <option value="">Select Level</option>
                                <option value="1">Level 1 - Basic User</option>
                                <option value="2">Level 2 - Advanced User</option>
                                <option value="3">Level 3 - Supervisor</option>
                                <option value="4">Level 4 - Manager</option>
                                <option value="5">Level 5 - Administrator</option>
                            </select>
                            {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="role_description" className="block text-sm font-medium text-gray-700 mb-1">
                                Role Description
                            </label>
                            <textarea
                                id="role_description"
                                name="role_description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Describe the role's responsibilities and purpose..."
                            />
                            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                        </div>
                        <div>
                            <label htmlFor="role_status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select 
                                id="role_status"
                                name="role_status"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Permissions</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            Select the permissions this role should have. Users with this role will only be able to access the selected features.
                        </p>
                        
                        <div className="space-y-6 max-h-96 overflow-y-auto border rounded-lg p-4">
                            {permissionModules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="border-b border-gray-200 pb-4 last:border-b-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-medium text-gray-900">{module.module}</h5>
                                        <button
                                            type="button"
                                            onClick={() => handleModuleSelectAll(module.permissions)}
                                            className="text-sm text-indigo-600 hover:text-indigo-500"
                                        >
                                            {module.permissions.every(p => selectedPermissions.includes(p.id)) ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {module.permissions.map((permission) => (
                                            <div key={permission.id} className="flex items-start">
                                                <input
                                                    type="checkbox"
                                                    id={permission.id}
                                                    checked={selectedPermissions.includes(permission.id)}
                                                    onChange={() => handlePermissionChange(permission.id)}
                                                    className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <div className="ml-3">
                                                    <label htmlFor={permission.id} className="text-sm font-medium text-gray-700 cursor-pointer">
                                                        {permission.name}
                                                    </label>
                                                    <p className="text-xs text-gray-500">{permission.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Selected Permissions:</strong> {selectedPermissions.length} permissions selected
                            </p>
                        </div>
                        {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
                    </div>

                    {/* General error display */}
                    {errors.general && <p className="text-red-500 text-sm">{errors.general}</p>}

                    {/* Submit Button */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            disabled={selectedPermissions.length === 0 || processing || !formData.name || !formData.level}
                        >
                            {processing ? 'Updating...' : 'Update Role'}
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}
