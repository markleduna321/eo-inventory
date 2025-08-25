import React, { useState } from 'react'
import AdminLayout from '../layout'
import { Link, router } from '@inertiajs/react'
import { ArrowLeftIcon, CheckIcon, XMarkIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function ShowDeviceRequest({ deviceRequest, errors, success }) {
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [approvalNotes, setApprovalNotes] = useState('')
    const [rejectionReason, setRejectionReason] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)

    const handleApprove = () => {
        setLoading(true)
        setMessage(null)
        
        router.post(`/admin/device-requests/${deviceRequest.id}/approve`, {
            approval_notes: approvalNotes
        }, {
            onSuccess: () => {
                setIsApproveModalOpen(false)
                setApprovalNotes('')
                setLoading(false)
                setMessage({ type: 'success', text: 'Request approved successfully!' })
            },
            onError: () => {
                setLoading(false)
                setMessage({ type: 'error', text: 'Failed to approve request. Please try again.' })
            }
        })
    }

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            setMessage({ type: 'error', text: 'Please provide a rejection reason' })
            return
        }

        setLoading(true)
        setMessage(null)
        
        router.post(`/admin/device-requests/${deviceRequest.id}/reject`, {
            rejection_reason: rejectionReason
        }, {
            onSuccess: () => {
                setIsRejectModalOpen(false)
                setRejectionReason('')
                setLoading(false)
                setMessage({ type: 'success', text: 'Request rejected successfully.' })
            },
            onError: () => {
                setLoading(false)
                setMessage({ type: 'error', text: 'Failed to reject request. Please try again.' })
            }
        })
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

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link 
                        href="/admin/device-requests"
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Device Requests
                    </Link>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Device Request Details</h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Request #{deviceRequest.id}
                            </p>
                        </div>
                        <div className="flex items-center space-x-3">
                            {getStatusBadge(deviceRequest.status)}
                            {getPriorityBadge(deviceRequest.priority)}
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="text-green-800 text-sm">{success}</div>
                    </div>
                )}

                {message && (
                    <div className={`mb-6 border rounded-md p-4 ${
                        message.type === 'success' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                    }`}>
                        <div className={`text-sm ${
                            message.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {message.text}
                        </div>
                    </div>
                )}

                {errors?.message && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="text-red-800 text-sm">{errors.message}</div>
                    </div>
                )}

                {/* Request Details */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Device Information */}
                    <div className="bg-white shadow-sm rounded-lg border p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Device Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Serial Number:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.device?.serial_number}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Type:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.device?.device_type}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Brand:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.device?.brand}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Model:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.device?.model}</span>
                            </div>
                        </div>
                    </div>

                    {/* Request Information */}
                    <div className="bg-white shadow-sm rounded-lg border p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Information</h3>
                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-gray-500">Requester:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.requester?.name}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Assignee:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                    {deviceRequest.assignee?.name || deviceRequest.assignee_id || 'Not assigned'}
                                </span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Request Type:</span>
                                <span className="ml-2 text-sm text-gray-900">{deviceRequest.request_type}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-gray-500">Requested Date:</span>
                                <span className="ml-2 text-sm text-gray-900">
                                    {new Date(deviceRequest.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Justification */}
                <div className="mt-6 bg-white shadow-sm rounded-lg border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Justification</h3>
                    <p className="text-sm text-gray-700">{deviceRequest.justification}</p>
                    
                    {deviceRequest.purpose && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Purpose</h4>
                            <p className="text-sm text-gray-700">{deviceRequest.purpose}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons for Pending Requests */}
                {deviceRequest.status === 'pending' && (
                    <div className="mt-6 bg-white shadow-sm rounded-lg border p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="primary"
                                size="md"
                                className="inline-flex items-center"
                                onClick={() => setIsApproveModalOpen(true)}
                                disabled={loading}
                            >
                                <CheckIcon className="w-4 h-4 mr-2" />
                                Approve Request
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                size="md"
                                className="inline-flex items-center"
                                onClick={() => setIsRejectModalOpen(true)}
                                disabled={loading}
                            >
                                <XMarkIcon className="w-4 h-4 mr-2" />
                                Reject Request
                            </Button>
                        </div>
                    </div>
                )}

                {/* Liability Form Link for Approved Requests */}
                {deviceRequest.status === 'approved' && !deviceRequest.liability_form && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <UserIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-blue-900">Next Step: Liability Form</h3>
                                <p className="mt-1 text-sm text-blue-700">
                                    The assignee needs to complete a liability form before device assignment can be finalized.
                                </p>
                                <div className="mt-3">
                                    <Link href={`/admin/liability-forms/create-public?device_request_id=${deviceRequest.id}`}>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="md"
                                        >
                                            Complete Liability Form
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed Liability Form */}
                {deviceRequest.liability_form && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <DocumentTextIcon className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-green-900">Liability Form Completed</h3>
                                <p className="mt-1 text-sm text-green-700">
                                    The liability form has been signed and completed by {deviceRequest.liability_form.employee_name} on{' '}
                                    {new Date(deviceRequest.liability_form.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}.
                                </p>
                                <div className="mt-3 flex space-x-3">
                                    <Link href={`/admin/liability-forms/${deviceRequest.liability_form.id}`}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="inline-flex items-center"
                                        >
                                            <DocumentTextIcon className="w-4 h-4 mr-2" />
                                            View Liability Form
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/liability-forms/${deviceRequest.liability_form.id}/download`}>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="inline-flex items-center"
                                        >
                                            Download PDF
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} width="w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Approve Request</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Are you sure you want to approve this device request?
                    </p>
                    
                    <div className="mb-4">
                        <InputLabelComponent htmlFor="approval_notes" labelText="Approval Notes (Optional)" />
                        <textarea
                            id="approval_notes"
                            value={approvalNotes}
                            onChange={(e) => setApprovalNotes(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Add any notes about this approval..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setIsApproveModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            size="md"
                            onClick={handleApprove}
                            disabled={loading}
                        >
                            {loading ? 'Approving...' : 'Approve Request'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Rejection Modal */}
            <Modal isOpen={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)} width="w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Request</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Please provide a reason for rejecting this request.
                    </p>
                    
                    <div className="mb-4">
                        <InputLabelComponent htmlFor="rejection_reason" labelText="Rejection Reason *" />
                        <textarea
                            id="rejection_reason"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            placeholder="Explain why this request is being rejected..."
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <Button
                            type="button"
                            variant="secondary"
                            size="md"
                            onClick={() => setIsRejectModalOpen(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            size="md"
                            onClick={handleReject}
                            disabled={loading || !rejectionReason.trim()}
                        >
                            {loading ? 'Rejecting...' : 'Reject Request'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    )
}
