import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from '@inertiajs/react'
import { router } from '@inertiajs/react'
import { ChevronDownIcon, PlusIcon, EyeIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function DeviceRequestsPage({ requests: initialRequests, filters, flash = {} }) {
    const { success, error } = flash;
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all')
    const [requests, setRequests] = useState(initialRequests?.data || initialRequests || [])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Filter requests when status filter changes
        if (initialRequests?.data || initialRequests) {
            const requestsData = initialRequests?.data || initialRequests
            setRequests(requestsData)
        }
    }, [statusFilter, initialRequests])

    const handleQuickApprove = (requestId, e) => {
        e.preventDefault()
        if (confirm('Are you sure you want to approve this request?')) {
            router.post(`/admin/device-requests/${requestId}/approve`, {
                approval_notes: 'Quick approval from list view'
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash message
                },
                onError: () => {
                    alert('Failed to approve request. Please try again.')
                }
            })
        }
    }

    const handleQuickReject = (requestId, e) => {
        e.preventDefault()
        const reason = prompt('Please provide a rejection reason:')
        if (reason && reason.trim()) {
            router.post(`/admin/device-requests/${requestId}/reject`, {
                rejection_reason: reason
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be shown via flash message
                },
                onError: () => {
                    alert('Failed to reject request. Please try again.')
                }
            })
        }
    }

    const getStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-gray-100 text-gray-800'
        }
        
        const labels = {
            pending: 'Pending',
            approved: 'Approved',
            rejected: 'Rejected',
            completed: 'Completed',
            cancelled: 'Cancelled'
        }

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || colors.pending}`}>
                {labels[status] || status}
            </span>
        )
    }

    const getPriorityBadge = (priority) => {
        const colors = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        }

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${colors[priority] || colors.medium}`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </span>
        )
    }

    const filteredRequests = statusFilter === 'all' 
        ? (requests || [])
        : (requests || []).filter(request => request.status === statusFilter)

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:flex sm:items-center mb-6">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold text-gray-900">Device Requests</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            Manage device assignment requests and approvals
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <Link href="/admin/device-requests/create">
                            <Button
                                variant="primary"
                                size="md"
                                className="inline-flex items-center"
                            >
                                <PlusIcon className="w-4 h-4 mr-2" />
                                New Request
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-yellow-600 font-semibold text-sm">P</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Pending</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {(requests || []).filter(r => r.status === 'pending').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <CheckIcon className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Approved</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {(requests || []).filter(r => r.status === 'approved').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <span className="text-green-600 font-semibold text-sm">C</span>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Completed</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {(requests || []).filter(r => r.status === 'completed').length}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow border">
                        <div className="flex items-center">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                                <XMarkIcon className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-500">Rejected</div>
                                <div className="text-2xl font-bold text-gray-900">
                                    {(requests || []).filter(r => r.status === 'rejected').length}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="text-green-800 text-sm">{success}</div>
                    </div>
                )}
                
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-red-800 text-sm">{error}</div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Requests Table */}
                <div className="bg-white shadow-sm rounded-lg border">
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Device
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requester
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assignee
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Requested
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : filteredRequests.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                            No requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRequests.map((request) => (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.device.serial_number}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.device.brand} {request.device.model}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.requester.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.requester.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {request.assignee.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {request.assignee.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(request.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getPriorityBadge(request.priority)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <Link 
                                                        href={`/admin/device-requests/${request.id}`}
                                                        className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                                    >
                                                        <EyeIcon className="w-4 h-4 mr-1" />
                                                        View
                                                    </Link>
                                                    
                                                    {request.status === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleQuickApprove(request.id, e)}
                                                                className="text-green-600 hover:text-green-900 inline-flex items-center ml-2"
                                                                title="Quick Approve"
                                                            >
                                                                <CheckIcon className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleQuickReject(request.id, e)}
                                                                className="text-red-600 hover:text-red-900 inline-flex items-center ml-2"
                                                                title="Quick Reject"
                                                            >
                                                                <XMarkIcon className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
