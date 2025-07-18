import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function RoleCreateSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedPermissions, setSelectedPermissions] = useState([])

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedPermissions([])
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

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Create Role
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 max-w-4xl mx-auto">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Create New Role
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-6">
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
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="role_level" className="block text-sm font-medium text-gray-700 mb-1">
                                                Role Level
                                            </label>
                                            <select 
                                                id="role_level"
                                                name="role_level"
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            >
                                                <option value="">Select Level</option>
                                                <option value="1">Level 1 - Basic User</option>
                                                <option value="2">Level 2 - Advanced User</option>
                                                <option value="3">Level 3 - Supervisor</option>
                                                <option value="4">Level 4 - Manager</option>
                                                <option value="5">Level 5 - Administrator</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="role_description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role Description
                                        </label>
                                        <textarea
                                            id="role_description"
                                            name="role_description"
                                            rows={2}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Describe the role's responsibilities and purpose..."
                                        />
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
                                    </div>

                                    {/* Hidden field for created_by - will be set to current user */}
                                    <input type="hidden" name="created_by" value="current_user" />
                                    <input type="hidden" name="permissions" value={JSON.stringify(selectedPermissions)} />
                                </form>
                            </div>

                            {/* Buttons */}
                            <div className='flex float-end gap-2 mt-6'>
                                <Button
                                    type='button'
                                    variant='primary'
                                    size='md'
                                    disabled={selectedPermissions.length === 0}
                                >
                                    Create Role
                                </Button>

                                <Button
                                    type='button'
                                    variant='danger'
                                    size='md'
                                    onClick={closeModal}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
