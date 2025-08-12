import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { 
    DocumentTextIcon, 
    ExclamationTriangleIcon, 
    CheckCircleIcon,
    DevicePhoneMobileIcon,
    UserIcon,
    ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'
import SignaturePad from '@/app/pages/components/signature-pad'

export default function PublicLiabilityFormComplete({ 
    token, 
    deviceInfo, 
    prefilledData, 
    requiredEmployeeId 
}) {
    const [signatureData, setSignatureData] = useState('')
    
    const { data, setData, post, processing, errors } = useForm({
        employee_name: '',
        employee_email: '',
        personal_phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        additional_notes: '',
        agreement_accepted: false,
        signature: ''
    })

    const handleSignature = (signature) => {
        setSignatureData(signature)
        setData('signature', signature)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        post(`/liability-form/${token}/complete`)
    }

    return (
        <>
            <Head title="Device Liability Agreement" />
            
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                            <ClipboardDocumentCheckIcon className="h-6 w-6 text-green-600" />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                            Device Liability Agreement
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Please complete the following information to finalize your device assignment
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="bg-white shadow sm:rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                {/* Device Information (Read-only) */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Device Assignment Details
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Device</label>
                                            <p className="mt-1 text-sm text-gray-900">{deviceInfo.brand} {deviceInfo.model}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Asset Tag</label>
                                            <p className="mt-1 text-sm text-gray-900">{deviceInfo.asset_tag}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                                            <p className="mt-1 text-sm text-gray-900">{deviceInfo.serial_number}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                            <p className="mt-1 text-sm text-gray-900">{requiredEmployeeId}</p>
                                        </div>
                                        {prefilledData.device_condition && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Device Condition</label>
                                                <p className="mt-1 text-sm text-gray-900">{prefilledData.device_condition}</p>
                                            </div>
                                        )}
                                        {prefilledData.accessories && (
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Included Accessories</label>
                                                <p className="mt-1 text-sm text-gray-900">{prefilledData.accessories}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Employee Information */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Employee Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700">
                                                Full Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="employee_name"
                                                required
                                                value={data.employee_name}
                                                onChange={(e) => setData('employee_name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Enter your full name"
                                            />
                                            {errors.employee_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.employee_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="employee_email" className="block text-sm font-medium text-gray-700">
                                                Email Address <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                id="employee_email"
                                                required
                                                value={data.employee_email}
                                                onChange={(e) => setData('employee_email', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="your.email@company.com"
                                            />
                                            {errors.employee_email && (
                                                <p className="mt-1 text-sm text-red-600">{errors.employee_email}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="personal_phone" className="block text-sm font-medium text-gray-700">
                                                Personal Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="personal_phone"
                                                required
                                                value={data.personal_phone}
                                                onChange={(e) => setData('personal_phone', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                            {errors.personal_phone && (
                                                <p className="mt-1 text-sm text-red-600">{errors.personal_phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Emergency Contact Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="emergency_contact_name" className="block text-sm font-medium text-gray-700">
                                                Emergency Contact Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="emergency_contact_name"
                                                required
                                                value={data.emergency_contact_name}
                                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Contact person's full name"
                                            />
                                            {errors.emergency_contact_name && (
                                                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="emergency_contact_phone" className="block text-sm font-medium text-gray-700">
                                                Emergency Contact Phone <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                id="emergency_contact_phone"
                                                required
                                                value={data.emergency_contact_phone}
                                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                            {errors.emergency_contact_phone && (
                                                <p className="mt-1 text-sm text-red-600">{errors.emergency_contact_phone}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Notes */}
                                <div className="mb-8">
                                    <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700">
                                        Additional Notes or Comments
                                    </label>
                                    <textarea
                                        id="additional_notes"
                                        rows={3}
                                        value={data.additional_notes}
                                        onChange={(e) => setData('additional_notes', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Any additional information or special requirements..."
                                    />
                                    {errors.additional_notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.additional_notes}</p>
                                    )}
                                </div>

                                {/* Liability Agreement */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Liability Agreement
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <div className="text-sm text-gray-700 space-y-3">
                                            <p><strong>Device Responsibility:</strong> I acknowledge that I am responsible for the care and security of the assigned device. I understand that I must report any damage, loss, or theft immediately to the IT department.</p>
                                            
                                            <p><strong>Acceptable Use:</strong> I agree to use the device in accordance with company policies and only for business-related purposes. I will not install unauthorized software or modify the device configuration.</p>
                                            
                                            <p><strong>Return Condition:</strong> I understand that I must return the device in the same condition it was received, accounting for normal wear and tear. Any damages beyond normal use may result in repair or replacement charges.</p>
                                            
                                            <p><strong>Data Security:</strong> I acknowledge my responsibility to protect company data stored on this device and to follow all security protocols including password protection and encryption requirements.</p>
                                            
                                            <p><strong>Loss or Theft:</strong> In case of loss or theft, I will immediately notify the IT department and may be liable for replacement costs depending on the circumstances and company policy.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="agreement_accepted"
                                                type="checkbox"
                                                checked={data.agreement_accepted}
                                                onChange={(e) => setData('agreement_accepted', e.target.checked)}
                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="agreement_accepted" className="font-medium text-gray-700">
                                                I have read and agree to the terms of this liability agreement <span className="text-red-500">*</span>
                                            </label>
                                            <p className="text-gray-500">By checking this box, I acknowledge my understanding and acceptance of all terms outlined above.</p>
                                        </div>
                                    </div>
                                    {errors.agreement_accepted && (
                                        <p className="mt-1 text-sm text-red-600">{errors.agreement_accepted}</p>
                                    )}
                                </div>

                                {/* Digital Signature */}
                                <div className="mb-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                                        Digital Signature <span className="text-red-500">*</span>
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Please provide your digital signature to complete the agreement. This signature has the same legal effect as a handwritten signature.
                                    </p>
                                    
                                    <SignaturePad onSignature={handleSignature} />
                                    {errors.signature && (
                                        <p className="mt-1 text-sm text-red-600">{errors.signature}</p>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="lg"
                                        disabled={processing || !data.agreement_accepted || !signatureData}
                                        className="min-w-[200px]"
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Submitting...
                                            </div>
                                        ) : (
                                            <>
                                                <CheckCircleIcon className="h-5 w-5 mr-2" />
                                                Complete Agreement
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
