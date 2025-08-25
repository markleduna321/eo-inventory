import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import { useForm } from '@inertiajs/react'
import { 
    DocumentTextIcon, 
    UserIcon, 
    ComputerDesktopIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function CreatePublicLiabilityForm({ devices, deviceRequests }) {
    const [selectedDevice, setSelectedDevice] = useState('')
    const [selectedRequest, setSelectedRequest] = useState('')

    const { data, setData, post, processing, errors } = useForm({
        device_id: '',
        device_request_id: '',
        employee_id: '',
        device_condition: '',
        accessories: '',
        admin_notes: ''
    })

    // Handle URL parameters to pre-select device request
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const deviceRequestId = urlParams.get('device_request_id')
        
        if (deviceRequestId && deviceRequests) {
            const request = deviceRequests.find(r => r.id == deviceRequestId)
            if (request) {
                handleRequestChange(deviceRequestId)
            }
        }
    }, [deviceRequests])

    const handleDeviceChange = (deviceId) => {
        setSelectedDevice(deviceId)
        setData('device_id', deviceId)
        setData('device_request_id', '') // Clear request selection when device changes
        setSelectedRequest('')
    }

    const handleRequestChange = (requestId) => {
        setSelectedRequest(requestId)
        setData('device_request_id', requestId)
        
        // Auto-fill device from request
        const request = deviceRequests.find(r => r.id == requestId)
        if (request) {
            setSelectedDevice(request.device_id)
            setData('device_id', request.device_id)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        post('/admin/liability-forms/create-public', {
            onSuccess: (page) => {
                // The controller now redirects to liability-forms.index
                // No need for additional handling as Inertia handles the redirect
            },
            onError: (errors) => {
                console.error('Form errors:', errors)
            }
        })
    }

    const selectedDeviceInfo = devices.find(d => d.id == selectedDevice)
    const selectedRequestInfo = deviceRequests.find(r => r.id == selectedRequest)

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Create Device Liability Agreement</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Pre-fill device assignment information and generate a secure link for the employee to complete their liability agreement
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                {/* Device Selection */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Device Assignment
                                    </h3>
                                    
                                    {/* Option 1: From Device Request - Make this primary */}
                                    <div className="mb-6">
                                        <label htmlFor="device_request_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select from Approved Device Request <span className="text-blue-600">(Recommended)</span>
                                        </label>
                                        <select
                                            id="device_request_id"
                                            value={selectedRequest}
                                            onChange={(e) => handleRequestChange(e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Choose an approved device request...</option>
                                            {deviceRequests.filter(request => request.status === 'approved').map((request) => (
                                                <option key={request.id} value={request.id}>
                                                    {request.requester?.name} - {request.device?.brand} {request.device?.model} ({request.device?.asset_tag})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.device_request_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.device_request_id}</p>
                                        )}
                                        {deviceRequests.filter(request => request.status === 'approved').length === 0 && (
                                            <p className="mt-1 text-sm text-amber-600">
                                                No approved device requests available. You can create a liability form for any device below.
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative mb-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-gray-300" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-2 bg-white text-gray-500">OR</span>
                                        </div>
                                    </div>

                                    {/* Option 2: Select Device Directly - Show warning */}
                                    <div className="mb-6">
                                        <label htmlFor="device_id" className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Device Directly
                                        </label>
                                        <select
                                            id="device_id"
                                            value={selectedDevice}
                                            onChange={(e) => handleDeviceChange(e.target.value)}
                                            disabled={selectedRequest}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100"
                                        >
                                            <option value="">Choose a device...</option>
                                            {devices.filter(device => device.status === 'Working').map((device) => (
                                                <option key={device.id} value={device.id}>
                                                    {device.brand} {device.model} - {device.asset_tag} ({device.serial_number})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.device_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.device_id}</p>
                                        )}
                                        {!selectedRequest && selectedDevice && (
                                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                                <p className="text-sm text-amber-800">
                                                    ⚠️ You're creating a liability form without linking it to a device request. 
                                                    Consider selecting from approved device requests above for better tracking.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Device Info Display */}
                                    {selectedDeviceInfo && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Device</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Device:</span>
                                                    <p className="font-medium">{selectedDeviceInfo.brand} {selectedDeviceInfo.model}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Asset Tag:</span>
                                                    <p className="font-medium">{selectedDeviceInfo.asset_tag}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Serial Number:</span>
                                                    <p className="font-medium">{selectedDeviceInfo.serial_number}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Employee Information */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Employee Information
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                                                Employee ID <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="employee_id"
                                                required
                                                value={data.employee_id}
                                                onChange={(e) => setData('employee_id', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Enter employee ID"
                                            />
                                            {errors.employee_id && (
                                                <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                The employee will need to verify this ID to access the agreement
                                            </p>
                                        </div>

                                        {selectedRequestInfo && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Requested By
                                                </label>
                                                <div className="mt-1 bg-gray-50 rounded-md px-3 py-2 text-sm text-gray-900">
                                                    {selectedRequestInfo.requester?.name}
                                                    <div className="text-xs text-gray-500">
                                                        {selectedRequestInfo.requester?.email}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Device Condition & Accessories */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Device Condition & Accessories
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="device_condition" className="block text-sm font-medium text-gray-700">
                                                Device Condition
                                            </label>
                                            <select
                                                id="device_condition"
                                                value={data.device_condition}
                                                onChange={(e) => setData('device_condition', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">Select condition...</option>
                                                <option value="Excellent">Excellent</option>
                                                <option value="Good">Good</option>
                                                <option value="Fair">Fair</option>
                                                <option value="Poor">Poor</option>
                                            </select>
                                            {errors.device_condition && (
                                                <p className="mt-1 text-sm text-red-600">{errors.device_condition}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="accessories" className="block text-sm font-medium text-gray-700">
                                                Included Accessories
                                            </label>
                                            <input
                                                type="text"
                                                id="accessories"
                                                value={data.accessories}
                                                onChange={(e) => setData('accessories', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="e.g., Charger, Case, Headphones"
                                            />
                                            {errors.accessories && (
                                                <p className="mt-1 text-sm text-red-600">{errors.accessories}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Admin Notes */}
                                <div className="mb-8">
                                    <label htmlFor="admin_notes" className="block text-sm font-medium text-gray-700">
                                        Admin Notes (Internal)
                                    </label>
                                    <textarea
                                        id="admin_notes"
                                        rows={3}
                                        value={data.admin_notes}
                                        onChange={(e) => setData('admin_notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Internal notes about this assignment (not visible to employee)..."
                                    />
                                    {errors.admin_notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.admin_notes}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        These notes are for internal use and will not be visible to the employee
                                    </p>
                                </div>

                                {/* Form Requirements Notice */}
                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Before Creating the Agreement
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Ensure the device is available and ready for assignment</li>
                                                    <li>Verify the employee ID is correct and active</li>
                                                    <li>The generated link will be valid for 7 days</li>
                                                    <li>The employee will need to complete their personal information and sign digitally</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={processing || !selectedDevice || !data.employee_id}
                                        className="min-w-[200px]"
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Creating Agreement...
                                            </div>
                                        ) : (
                                            <>
                                                <DocumentTextIcon className="h-5 w-5 mr-2" />
                                                Create Agreement
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}
