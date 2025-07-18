import React, { useState, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Button from '@/app/pages/components/button'

export default function RoleManagementTableSection() {
    const dispatch = useDispatch()
    
    // Safe selector with fallback
    const rolesState = useSelector((store) => store?.roles)
    const usersState = useSelector((store) => store?.users)
    const rolesData = Array.isArray(rolesState?.roles) ? rolesState.roles : []
    const usersData = Array.isArray(usersState?.users) ? usersState.users : []
    
    const [searchTerm, setSearchTerm] = useState('')
    const [levelFilter, setLevelFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')

    // Calculate actual user counts for each role
    const getRealUserCount = (roleId) => {
        return usersData.filter(user => user.role_id?.toString() === roleId?.toString()).length
    }

    // Get roles with real user counts
    const rolesWithRealCounts = useMemo(() => {
        return rolesData.map(role => ({
            ...role,
            userCount: getRealUserCount(role.id)
        }))
    }, [rolesData, usersData])

    // Filter roles based on search term, level, and status
    const filteredRoles = useMemo(() => {
        if (!rolesWithRealCounts.length) return []
        
        return rolesWithRealCounts.filter(role => {
            const matchesSearch = searchTerm === '' || 
                (role.name && role.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (role.description && role.description.toLowerCase().includes(searchTerm.toLowerCase()))
            
            const matchesLevel = levelFilter === '' || (role.level && role.level.toString() === levelFilter)
            
            const matchesStatus = statusFilter === '' || 
                (role.status && role.status.toLowerCase() === statusFilter.toLowerCase())
            
            return matchesSearch && matchesLevel && matchesStatus
        })
    }, [rolesWithRealCounts, searchTerm, levelFilter, statusFilter])

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

    const getPermissionCount = (permissions) => {
        return Array.isArray(permissions) ? permissions.length : 0
    }

    const getPermissionSummary = (permissions) => {
        if (!Array.isArray(permissions)) return 'No permissions'
        
        const categories = {
            'User Management': permissions.filter(p => p.startsWith('users_') || p.startsWith('roles_')).length,
            'Asset Management': permissions.filter(p => p.startsWith('assets_') || p.includes('manage')).length,
            'Requests': permissions.filter(p => p.startsWith('requests_') || p.startsWith('purchase_')).length,
            'Reports': permissions.filter(p => p.startsWith('reports_') || p.startsWith('analytics_')).length
        }
        
        const summary = Object.entries(categories)
            .filter(([_, count]) => count > 0)
            .map(([category, count]) => `${category} (${count})`)
            .join(', ')
            
        return summary || 'No permissions'
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <div>
                    <h2 className='text-xl font-semibold text-gray-800'>System Roles</h2>
                    {(searchTerm || levelFilter || statusFilter) && (
                        <p className='text-sm text-gray-600 mt-1'>
                            Showing {filteredRoles.length} of {rolesWithRealCounts.length} roles
                            {searchTerm && <span className='ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded'>Search: "{searchTerm}"</span>}
                            {levelFilter && <span className='ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded'>Level: {levelFilter}</span>}
                            {statusFilter && <span className='ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded'>Status: {statusFilter}</span>}
                        </p>
                    )}
                </div>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search roles..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select 
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Levels</option>
                        <option value="5">Level 5 - Administrator</option>
                        <option value="4">Level 4 - Manager</option>
                        <option value="3">Level 3 - Supervisor</option>
                        <option value="2">Level 2 - Advanced User</option>
                        <option value="1">Level 1 - Basic User</option>
                    </select>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    {(searchTerm || levelFilter || statusFilter) && (
                        <Button
                            type='button'
                            variant='secondary'
                            size='sm'
                            onClick={() => {
                                setSearchTerm('')
                                setLevelFilter('')
                                setStatusFilter('')
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200'>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Role Name</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Level</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Users</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Permissions</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Permission Summary</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoles.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="py-8 text-center text-gray-500">
                                    {searchTerm || levelFilter || statusFilter ? 
                                        'No roles match your current filters.' : 
                                        'No roles found.'
                                    }
                                </td>
                            </tr>
                        ) : (
                            filteredRoles.map((role) => (
                                <tr key={role.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                    <td className='py-3 px-4'>
                                        <div>
                                            <div className='font-medium text-gray-900 flex items-center gap-2'>
                                                {role.name}
                                                {role.is_system && (
                                                    <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                                                        System
                                                    </span>
                                                )}
                                            </div>
                                            <div className='text-sm text-gray-500'>{role.description}</div>
                                            <div className='text-xs text-gray-400'>Created: {new Date(role.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <span className={getLevelBadge(role.level)}>
                                            Level {role.level}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <div className='font-medium text-gray-900'>{role.userCount || 0}</div>
                                        <div className='text-sm text-gray-500'>users assigned</div>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <div className='font-medium text-gray-900'>{getPermissionCount(role.permissions)}</div>
                                        <div className='text-sm text-gray-500'>permissions</div>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <div className='text-sm text-gray-600 max-w-xs'>
                                            {getPermissionSummary(role.permissions)}
                                        </div>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <span className={getStatusBadge(role.status)}>
                                            {role.status}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <div className='flex gap-2'>
                                            <Button
                                                type='button'
                                                variant='secondary'
                                                size='sm'
                                            >
                                                View
                                            </Button>
                                            {!role.is_system && (
                                                <>
                                                    <Button
                                                        type='button'
                                                        variant='primary'
                                                        size='sm'
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        type='button'
                                                        variant='danger'
                                                        size='sm'
                                                        disabled={role.userCount > 0}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                            {role.is_system && (
                                                <Button
                                                    type='button'
                                                    variant='secondary'
                                                    size='sm'
                                                >
                                                    Duplicate
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Role Statistics */}
            <div className='mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4 border-t pt-4'>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>{rolesWithRealCounts.length}</div>
                    <div className='text-sm text-gray-500'>Total Roles</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>{rolesWithRealCounts.filter(r => r.status === 'Active').length}</div>
                    <div className='text-sm text-gray-500'>Active Roles</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>{usersData.length}</div>
                    <div className='text-sm text-gray-500'>Users Assigned</div>
                </div>
                <div className='text-center'>
                    <div className='text-2xl font-bold text-gray-900'>{rolesWithRealCounts.filter(r => !r.is_system).length}</div>
                    <div className='text-sm text-gray-500'>Custom Roles</div>
                </div>
            </div>
        </div>
    )
}
