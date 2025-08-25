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
        employee_id: liabilityForm?.required_employee_id || '',
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

    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Document Container */}
                <div className="bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                    
                    {/* Company Header */}
                    <div className="bg-white px-8 py-6 border-b border-gray-200">
                        <div className="flex items-center justify-center mb-4">
                            {/* EmpireOne Logo */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg shadow-lg">
                                <div className="text-2xl font-bold tracking-wide">
                                    Empire<span className="text-blue-200">One</span>
                                </div>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                            Device Liability Agreement
                        </h1>
                        <p className="text-center text-gray-600 text-lg">
                            This Device Liability Agreement is made effective as of <strong>{currentDate}</strong> between EmpireOne 
                            and the Employee listed below.
                        </p>
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="px-8 py-6 space-y-8">
                        
                        {/* Section 1: Device Issuance */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                1. Issuance of Company Device:
                            </h2>
                            <p className="text-gray-700 mb-4">
                                The Company agrees to issue the following device to the Employee:
                            </p>
                            
                            {deviceInfo && (
                                <div className="overflow-hidden">
                                    <table className="min-w-full border border-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                                    Device Type
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                                    Description
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                                    Serial Number
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                                    Asset Tag
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300">
                                                    Condition
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            <tr>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                    {deviceInfo.type || 'Computer Device'}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                    {deviceInfo.brand} {deviceInfo.model}
                                                    {prefilledData?.accessories && (
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            Accessories: {prefilledData.accessories}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                    {deviceInfo.serial_number}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                    {deviceInfo.asset_tag}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                    {prefilledData?.device_condition || 'Good'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Employee Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                2. Employee Information:
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                                <div>
                                    <label htmlFor="employee_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="employee_name"
                                        required
                                        value={data.employee_name}
                                        onChange={(e) => setData('employee_name', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Enter your full name"
                                    />
                                    {errors.employee_name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.employee_name}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="contact_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="contact_number"
                                        value={data.contact_number}
                                        onChange={(e) => setData('contact_number', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Your phone number"
                                    />
                                    {errors.contact_number && (
                                        <p className="mt-1 text-sm text-red-600">{errors.contact_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="your.email@company.com"
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <input
                                        type="text"
                                        id="department"
                                        value={data.department}
                                        onChange={(e) => setData('department', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Your department"
                                    />
                                    {errors.department && (
                                        <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                                        Position/Job Title
                                    </label>
                                    <input
                                        type="text"
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Your job title"
                                    />
                                    {errors.position && (
                                        <p className="mt-1 text-sm text-red-600">{errors.position}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Responsibility of Employee */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                3. Responsibility of the Employee:
                            </h2>
                            <p className="text-gray-700 mb-3">
                                The Employee acknowledges receipt of the above-mentioned device and agrees to:
                            </p>
                            <div className="space-y-2 text-sm text-gray-700 ml-4">
                                <div className="flex">
                                    <span className="font-medium mr-2">a.</span>
                                    <span>Use the device solely for work-related purposes.</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium mr-2">b.</span>
                                    <span>Take reasonable care to prevent damage or loss, theft, or damage to the device.</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium mr-2">c.</span>
                                    <span>Notify the Company immediately in case of loss, theft, or damage to the device.</span>
                                </div>
                                <div className="flex">
                                    <span className="font-medium mr-2">d.</span>
                                    <span>Return the device promptly upon termination of employment or upon request by the Company.</span>
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Additional Terms */}
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    4. Deductions from Pay:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    The Employee agrees that in the event of loss, theft, or damage to the issued device, the cost 
                                    of repair or replacement shall be deducted from their salary or any other compensation owed to 
                                    them by the Company. The deductions shall be made in accordance with the Company's policies and applicable laws.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    5. Reporting:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    The Employee agrees to report any issues with the device to the Company's IT department or 
                                    designated personnel promptly.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    6. Ownership and Return:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    The device issued to the Employee remain the property of the Company. Upon termination of 
                                    employment or upon request by the Company, the Employee agrees to return all issued devices 
                                    in good condition, normal wear and tear excepted.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    7. Compliance with Policies:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    The Employee agrees to comply with all the applicable Company policies, including but not 
                                    limited to IT security policies, while using the issued device.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    8. Confidentiality:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    The Employee agrees not to disclose any confidential information stored or accessed through 
                                    the issued device to unauthorized individuals.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                    9. Entire Agreement:
                                </h2>
                                <p className="text-sm text-gray-700">
                                    This Agreement constitutes the entire agreement between the parties concerning the issuance 
                                    and use of company devices and supersedes all prior agreements and understandings, 
                                    whether written or oral.
                                </p>
                            </div>
                        </div>

                        {/* Agreement and Signature Section */}
                        <div className="border-t border-gray-200 pt-6">
                            <p className="text-sm font-medium text-gray-900 mb-4">
                                IN WITNESS WHEREOF, the parties hereto have executed this Agreement as of the date first above written.
                            </p>

                            {/* Agreement Checkbox */}
                            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <input
                                        id="agrees_to_terms"
                                        type="checkbox"
                                        checked={data.agrees_to_terms}
                                        onChange={(e) => setData('agrees_to_terms', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                                    />
                                    <label htmlFor="agrees_to_terms" className="ml-3 text-sm text-gray-900">
                                        <strong>Confirmation and Acceptance:</strong> I have read, understood, and agree to all the terms and 
                                        conditions stated in this Device Liability Agreement. I acknowledge that I am fully responsible 
                                        for the assigned device and will comply with all company policies.{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                </div>
                                {errors.agrees_to_terms && (
                                    <p className="mt-2 text-sm text-red-600">{errors.agrees_to_terms}</p>
                                )}
                            </div>

                            {/* Signature Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Employee Signature */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Employee:</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Digital Signature <span className="text-red-500">*</span>
                                        </label>
                                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-white">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-gray-600">
                                                    Sign using your mouse or touch screen
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={clearSignature}
                                                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                                >
                                                    <TrashIcon className="h-3 w-3 mr-1" />
                                                    Clear
                                                </button>
                                            </div>
                                            <div className="border border-gray-200 rounded bg-white">
                                                <SignatureCanvas
                                                    ref={signatureRef}
                                                    canvasProps={{
                                                        width: 300,
                                                        height: 120,
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
                                    <div className="mt-3 text-sm text-gray-600">
                                        <div>Name: ________________________________</div>
                                        <div className="mt-2">Date: {currentDate}</div>
                                    </div>
                                </div>

                                {/* Company Representative */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900 mb-3">Company Representative:</h3>
                                    <div className="mt-16 text-sm text-gray-600">
                                        <div>Name: ________________________________</div>
                                        <div className="mt-2">Title: IT Manager</div>
                                        <div className="mt-2">Date: {currentDate}</div>
                                        <div className="mt-4 text-xs font-medium text-gray-700">
                                            EmpireOne
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={processing || !data.agrees_to_terms || signatureEmpty}
                                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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

                        {/* Disclaimer */}
                        <div className="border-t border-gray-200 pt-4">
                            <div className="text-xs text-gray-500 italic">
                                <strong>Disclaimer:</strong> This document and its contents are the property of EmpireOne 
                                and are intended for internal use only. Unauthorized reproduction, disclosure, or distribution of this material, 
                                in whole or in part, without prior written permission from the company is strictly prohibited.
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
