import React, { useState, useRef } from 'react'
import { useForm } from '@inertiajs/react'
import SignatureCanvas from 'react-signature-canvas'
import { 
    DocumentTextIcon, 
    UserIcon, 
    ComputerDesktopIcon,
    PencilIcon,
    TrashIcon
} from '@heroicons/react/24/outline'

export default function LiabilityFormForm({ liabilityForm, deviceInfo, prefilledData, token }) {
    const signatureRef = useRef()
    const [signatureEmpty, setSignatureEmpty] = useState(true)
    
    const { data, setData, post, processing, errors } = useForm({
        employee_name: '',
        contact_number: '',
        email: '',
        department: '',
        position: '',
        agrees_to_terms: false,
        signature_data: '',
        signature_format: 'png'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (signatureEmpty) {
            alert('Please provide your digital signature before submitting.')
            return
        }

        // Get signature data
        const signatureData = signatureRef.current.toDataURL()
        setData('signature_data', signatureData)
        
        post(`/liability-form/${token}/complete`)
    }

    const clearSignature = () => {
        signatureRef.current.clear()
        setSignatureEmpty(true)
        setData('signature_data', '')
    }

    const handleSignatureEnd = () => {
        setSignatureEmpty(signatureRef.current.isEmpty())
        if (!signatureRef.current.isEmpty()) {
            const signatureData = signatureRef.current.toDataURL()
            setData('signature_data', signatureData)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <DocumentTextIcon className="mx-auto h-16 w-16 text-indigo-600" />
                    <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                        Device Liability Agreement
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Please complete your information and digitally sign this agreement
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Device Information */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <ComputerDesktopIcon className="h-5 w-5 text-gray-400 mr-2" />
                                Device Assignment Details
                            </h3>
                            
                            {deviceInfo && (
                                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-blue-600 font-medium">Device:</span>
                                            <p className="text-blue-900">{deviceInfo.brand} {deviceInfo.model}</p>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 font-medium">Asset Tag:</span>
                                            <p className="text-blue-900">{deviceInfo.asset_tag}</p>
                                        </div>
                                        <div>
                                            <span className="text-blue-600 font-medium">Serial Number:</span>
                                            <p className="text-blue-900">{deviceInfo.serial_number}</p>
                                        </div>
                                    </div>
                                    
                                    {prefilledData && (
                                        <div className="mt-4 pt-4 border-t border-blue-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {prefilledData.device_condition && (
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Condition:</span>
                                                        <p className="text-blue-900">{prefilledData.device_condition}</p>
                                                    </div>
                                                )}
                                                {prefilledData.accessories && (
                                                    <div>
                                                        <span className="text-blue-600 font-medium">Accessories:</span>
                                                        <p className="text-blue-900">{prefilledData.accessories}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Employee Information */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                                Your Information
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
                                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700">
                                        Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="contact_number"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Your phone number"
                                    />
                                    {errors.contact_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="your.email@company.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Your department"
                                    />
                                    {errors.department && (
                                        <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                                        Position/Job Title
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Your job title"
                                    />
                                    {errors.position && (
                                        <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Terms and Signature */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                <PencilIcon className="h-5 w-5 text-gray-400 mr-2" />
                                Agreement and Signature
                            </h3>
                            
                            {/* Terms */}
                            <div className="bg-gray-50 rounded-lg p-6 mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-4">Terms of Device Use</h4>
                                <div className="text-sm text-gray-700 space-y-3">
                                    <p>By signing this agreement, I acknowledge that:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>I have received the device listed above in good working condition</li>
                                        <li>I am responsible for the proper care and security of this device</li>
                                        <li>I will report any damage, loss, or theft immediately to IT support</li>
                                        <li>I will return the device in the same condition when requested</li>
                                        <li>I understand that misuse may result in disciplinary action</li>
                                        <li>I will not install unauthorized software or modify the device</li>
                                        <li>I will comply with all company IT policies and procedures</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Agreement Checkbox */}
                            <div className="mb-6">
                                <div className="flex items-start">
                                    <input
                                        id="agrees_to_terms"
                                        type="checkbox"
                                        checked={data.agrees_to_terms}
                                        onChange={(e) => setData('agrees_to_terms', e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="agrees_to_terms" className="ml-3 text-sm text-gray-700">
                                        I have read, understood, and agree to the terms and conditions stated above.{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {errors.agrees_to_terms && (
                                    <p className="mt-1 text-sm text-red-600">{errors.agrees_to_terms}</p>
                                )}
                            </div>

                            {/* Digital Signature */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Digital Signature <span className="text-red-500">*</span>
                                </label>
                                <div className="border-2 border-gray-300 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm text-gray-600">
                                            Please sign in the box below using your mouse or touch screen
                                        </span>
                                        <button
                                            type="button"
                                            onClick={clearSignature}
                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <TrashIcon className="h-3 w-3 mr-1" />
                                            Clear
                                        </button>
                                    </div>
                                    <div className="border border-gray-200 rounded bg-white">
                                        <SignatureCanvas
                                            ref={signatureRef}
                                            canvasProps={{
                                                width: 600,
                                                height: 150,
                                                className: 'signature-canvas w-full'
                                            }}
                                            onEnd={handleSignatureEnd}
                                            backgroundColor="rgb(255, 255, 255)"
                                        />
                                    </div>
                                </div>
                                {errors.signature_data && (
                                    <p className="mt-1 text-sm text-red-600">{errors.signature_data}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing || !data.agrees_to_terms || signatureEmpty}
                                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting Agreement...
                                        </div>
                                    ) : (
                                        <>
                                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                                            Submit Liability Agreement
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
