import React, { useState } from 'react'
import AdminLayout from '../layout'
import { Link, router } from '@inertiajs/react'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SelectComponent from '@/app/pages/components/input-select'

export default function CreateDeviceRequest({ availableDevices = [], users = [] }) {
    const [formData, setFormData] = useState({
        device_id: '',
        assignee_id: '',
        request_type: 'assignment',
        justification: '',
        purpose: '',
        requested_from: '',
        requested_until: '',
        priority: 'medium'
    })

    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Transform backend data to format expected by SelectComponent
    const deviceOptions = availableDevices.map(device => ({
        id: device.id,
        value: device.id.toString(),
        label: `${device.asset_tag} - ${device.brand} ${device.model} (${device.device_type})`,
        ...device
    }))

    const userOptions = users.map(user => ({
        id: user.id,
        value: user.id.toString(),
        label: `${user.name} (${user.email})`,
        ...user
    }))

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear errors when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        const newErrors = {}
        if (!formData.device_id) newErrors.device_id = ['Please select a device']
        if (!formData.assignee_id) newErrors.assignee_id = ['Please select an assignee']
        if (!formData.justification || formData.justification.length < 10) {
            newErrors.justification = ['Justification must be at least 10 characters']
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setLoading(false)
            return
        }

        // Submit the form
        router.post('/admin/device-requests', formData, {
            onSuccess: () => {
                // Will redirect to requests list
            },
            onError: (errors) => {
                setErrors(errors)
                setLoading(false)
            }
        })
    }

    const requestTypes = [
        { value: 'assignment', label: 'New Assignment' },
        { value: 'transfer', label: 'Transfer Device' },
        { value: 'return', label: 'Return Device' }
    ]

    const priorities = [
        { value: 'low', label: 'Low Priority' },
        { value: 'medium', label: 'Medium Priority' },
        { value: 'high', label: 'High Priority' },
        { value: 'urgent', label: 'Urgent' }
    ]

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
                    
                    <h1 className="text-2xl font-bold text-gray-900">Create Device Request</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Request a device assignment for yourself or another user
                    </p>
                </div>

                {/* Form */}
                <div className="max-w-3xl">
                    <div className="bg-white shadow-sm rounded-lg border">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Device Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabelComponent htmlFor="device_id" labelText="Device" />
                                    <SelectComponent
                                        id="device_id"
                                        name="device_id"
                                        options={deviceOptions}
                                        value={formData.device_id}
                                        onChange={handleInputChange}
                                        placeholder="Select a device..."
                                        required
                                        className="w-full"
                                    />
                                    {errors.device_id && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.device_id[0]}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <InputLabelComponent htmlFor="assignee_id" labelText="Assign To" />
                                    <SelectComponent
                                        id="assignee_id"
                                        name="assignee_id"
                                        options={userOptions}
                                        value={formData.assignee_id}
                                        onChange={handleInputChange}
                                        placeholder="Select a user..."
                                        required
                                        className="w-full"
                                    />
                                    {errors.assignee_id && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {errors.assignee_id[0]}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Request Type and Priority */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabelComponent htmlFor="request_type" labelText="Request Type" />
                                    <SelectComponent
                                        id="request_type"
                                        name="request_type"
                                        options={requestTypes}
                                        value={formData.request_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabelComponent htmlFor="priority" labelText="Priority" />
                                    <SelectComponent
                                        id="priority"
                                        name="priority"
                                        options={priorities}
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabelComponent htmlFor="requested_from" labelText="From Date (Optional)" />
                                    <InputTextComponent
                                        id="requested_from"
                                        name="requested_from"
                                        type="date"
                                        value={formData.requested_from}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <InputLabelComponent htmlFor="requested_until" labelText="Until Date (Optional)" />
                                    <InputTextComponent
                                        id="requested_until"
                                        name="requested_until"
                                        type="date"
                                        value={formData.requested_until}
                                        onChange={handleInputChange}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            {/* Justification */}
                            <div>
                                <InputLabelComponent htmlFor="justification" labelText="Justification" />
                                <textarea
                                    id="justification"
                                    name="justification"
                                    rows={4}
                                    value={formData.justification}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Explain why this device is needed..."
                                    required
                                />
                                {errors.justification && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.justification[0]}
                                    </div>
                                )}
                            </div>

                            {/* Purpose */}
                            <div>
                                <InputLabelComponent htmlFor="purpose" labelText="Purpose (Optional)" />
                                <textarea
                                    id="purpose"
                                    name="purpose"
                                    rows={3}
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Additional details about how the device will be used..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Link href="/admin/device-requests">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="md"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    disabled={loading}
                                >
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
