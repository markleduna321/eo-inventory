import React, { useState } from 'react'
import AdminLayout from '../layout'
import { Link, router } from '@inertiajs/react'
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SignaturePad from '@/app/pages/components/signature-pad'

export default function CreateLiabilityForm({ deviceRequest, user }) {
    const [formData, setFormData] = useState({
        employee_name: user?.name || '',
        employee_id: '',
        department: '',
        position: '',
        contact_number: '',
        email: user?.email || '',
        device_condition_notes: '',
        accessories_received: [],
        agrees_to_terms: false,
        signature_data: ''
    })

    const [newAccessory, setNewAccessory] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))

        // Clear errors when user types
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }))
        }
    }

    const handleSignatureChange = (signatureData) => {
        setFormData(prev => ({
            ...prev,
            signature_data: signatureData
        }))

        if (errors.signature_data) {
            setErrors(prev => ({
                ...prev,
                signature_data: null
            }))
        }
    }

    const addAccessory = () => {
        if (newAccessory.trim()) {
            setFormData(prev => ({
                ...prev,
                accessories_received: [...prev.accessories_received, newAccessory.trim()]
            }))
            setNewAccessory('')
        }
    }

    const removeAccessory = (index) => {
        setFormData(prev => ({
            ...prev,
            accessories_received: prev.accessories_received.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation
        const newErrors = {}
        if (!formData.employee_name) newErrors.employee_name = ['Employee name is required']
        if (!formData.email) newErrors.email = ['Email is required']
        if (!formData.agrees_to_terms) newErrors.agrees_to_terms = ['You must agree to the terms']
        if (!formData.signature_data) newErrors.signature_data = ['Digital signature is required']

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            setLoading(false)
            return
        }

        // Submit the form
        router.post(`/admin/liability-forms/${deviceRequest.id}`, formData, {
            onSuccess: () => {
                // Will redirect automatically
            },
            onError: (errors) => {
                setErrors(errors)
                setLoading(false)
            }
        })
    }

    const terms = [
        'I acknowledge receipt of the above-mentioned device and accessories in good working condition.',
        'I agree to use the device only for business purposes and in accordance with company policies.',
        'I will take reasonable care of the device and protect it from damage, theft, or loss.',
        'I will report any damage, malfunction, or security issues immediately to IT support.',
        'I understand that I am responsible for the device and may be liable for repair or replacement costs in case of negligence.',
        'I will return the device and all accessories in good condition when requested or upon termination of employment.',
        'I will not install unauthorized software or make unauthorized modifications to the device.',
        'I understand that all data on the device remains the property of the company.',
    ]

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <Link 
                        href={`/admin/device-requests/${deviceRequest.id}`}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Request Details
                    </Link>
                    
                    <h1 className="text-2xl font-bold text-gray-900">Device Liability Form</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Please complete this form to acknowledge receipt and responsibility for the assigned device
                    </p>
                </div>

                {/* Device Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                        <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-blue-900">Device Assignment Details</h3>
                            <div className="mt-1 text-sm text-blue-700">
                                <p><strong>Device:</strong> {deviceRequest.device?.brand} {deviceRequest.device?.model}</p>
                                <p><strong>Serial Number:</strong> {deviceRequest.device?.serial_number}</p>
                                <p><strong>Type:</strong> {deviceRequest.device?.device_type}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <div className="bg-white shadow-sm rounded-lg border">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Employee Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabelComponent htmlFor="employee_name" labelText="Full Name" />
                                        <InputTextComponent
                                            id="employee_name"
                                            name="employee_name"
                                            type="text"
                                            value={formData.employee_name}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                        {errors.employee_name && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors.employee_name[0]}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="employee_id" labelText="Employee ID (Optional)" />
                                        <InputTextComponent
                                            id="employee_id"
                                            name="employee_id"
                                            type="text"
                                            value={formData.employee_id}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="department" labelText="Department" />
                                        <InputTextComponent
                                            id="department"
                                            name="department"
                                            type="text"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="position" labelText="Position" />
                                        <InputTextComponent
                                            id="position"
                                            name="position"
                                            type="text"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="contact_number" labelText="Contact Number" />
                                        <InputTextComponent
                                            id="contact_number"
                                            name="contact_number"
                                            type="tel"
                                            value={formData.contact_number}
                                            onChange={handleInputChange}
                                            className="w-full"
                                        />
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="email" labelText="Email Address" />
                                        <InputTextComponent
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full"
                                        />
                                        {errors.email && (
                                            <div className="text-red-500 text-sm mt-1">
                                                {errors.email[0]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Device Condition */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Device Condition & Accessories</h3>
                                
                                <div className="mb-4">
                                    <InputLabelComponent htmlFor="device_condition_notes" labelText="Device Condition Notes" />
                                    <textarea
                                        id="device_condition_notes"
                                        name="device_condition_notes"
                                        rows={3}
                                        value={formData.device_condition_notes}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Note any existing damage or issues with the device..."
                                    />
                                </div>

                                <div>
                                    <InputLabelComponent labelText="Accessories Received" />
                                    <div className="flex mb-2">
                                        <input
                                            type="text"
                                            value={newAccessory}
                                            onChange={(e) => setNewAccessory(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter accessory (e.g., charger, mouse, bag)"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="md"
                                            onClick={addAccessory}
                                            className="rounded-l-none"
                                        >
                                            Add
                                        </Button>
                                    </div>
                                    
                                    {formData.accessories_received.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.accessories_received.map((accessory, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {accessory}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAccessory(index)}
                                                        className="ml-1.5 text-blue-600 hover:text-blue-800"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Terms and Conditions */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
                                
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                                    <ol className="space-y-2 text-sm text-gray-700">
                                        {terms.map((term, index) => (
                                            <li key={index} className="flex">
                                                <span className="font-medium mr-2">{index + 1}.</span>
                                                <span>{term}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="flex items-start">
                                    <input
                                        id="agrees_to_terms"
                                        name="agrees_to_terms"
                                        type="checkbox"
                                        checked={formData.agrees_to_terms}
                                        onChange={handleInputChange}
                                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="agrees_to_terms" className="ml-2 text-sm text-gray-700">
                                        I have read, understood, and agree to the above terms and conditions
                                    </label>
                                </div>
                                {errors.agrees_to_terms && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.agrees_to_terms[0]}
                                    </div>
                                )}
                            </div>

                            {/* Digital Signature */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Digital Signature</h3>
                                <SignaturePad 
                                    onSignatureChange={handleSignatureChange}
                                    disabled={loading}
                                />
                                {errors.signature_data && (
                                    <div className="text-red-500 text-sm mt-1">
                                        {errors.signature_data[0]}
                                    </div>
                                )}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Link href={`/admin/device-requests/${deviceRequest.id}`}>
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
                                    disabled={loading || !formData.agrees_to_terms || !formData.signature_data}
                                >
                                    {loading ? 'Submitting...' : 'Submit Liability Form'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
