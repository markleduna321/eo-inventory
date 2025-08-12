import React from 'react'
import { Head } from '@inertiajs/react'
import { 
    CheckCircleIcon, 
    DocumentTextIcon,
    CalendarIcon,
    UserIcon,
    DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function PublicLiabilityFormThankYou({ 
    liabilityForm, 
    deviceInfo 
}) {
    const handlePrint = () => {
        window.print()
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <>
            <Head title="Form Completed Successfully" />
            
            <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100">
                            <CheckCircleIcon className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
                            Form Completed Successfully!
                        </h1>
                        <p className="mt-2 text-lg text-gray-600">
                            Your device liability agreement has been submitted and recorded
                        </p>
                    </div>

                    {/* Confirmation Details */}
                    <div className="bg-white shadow sm:rounded-lg mb-8">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-6">
                                Agreement Confirmation
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start space-x-3">
                                    <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Agreement ID</p>
                                        <p className="text-sm text-gray-600">#{liabilityForm.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Completed On</p>
                                        <p className="text-sm text-gray-600">{formatDate(liabilityForm.updated_at)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <UserIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Employee</p>
                                        <p className="text-sm text-gray-600">{liabilityForm.employee_name}</p>
                                        <p className="text-xs text-gray-500">ID: {liabilityForm.employee_id}</p>
                                    </div>
                                </div>

                                <div className="flex items-start space-x-3">
                                    <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Assigned Device</p>
                                        <p className="text-sm text-gray-600">{deviceInfo.brand} {deviceInfo.model}</p>
                                        <p className="text-xs text-gray-500">Asset: {deviceInfo.asset_tag}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Important Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-medium text-blue-900 mb-4">
                            Important Information
                        </h3>
                        <div className="space-y-3 text-sm text-blue-800">
                            <div className="flex items-start space-x-2">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <p>
                                    <strong>Record Keeping:</strong> This agreement has been automatically saved to your employee record 
                                    and a copy has been sent to the IT department for processing.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <p>
                                    <strong>Device Pickup:</strong> Please contact the IT department to arrange device pickup or delivery. 
                                    Your device assignment will be activated once the physical handover is complete.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <p>
                                    <strong>Questions or Changes:</strong> If you need to make any changes to this agreement or have 
                                    questions about your device assignment, please contact the IT department immediately.
                                </p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <span className="inline-block w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                <p>
                                    <strong>Security Reminder:</strong> Remember to follow all company security policies when using 
                                    your assigned device. Report any issues, damage, or security concerns immediately.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-100 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Need Help?
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-medium text-gray-900">IT Department</p>
                                <p className="text-gray-600">Phone: (555) 123-4567</p>
                                <p className="text-gray-600">Email: it-support@company.com</p>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Office Hours</p>
                                <p className="text-gray-600">Monday - Friday: 8:00 AM - 6:00 PM</p>
                                <p className="text-gray-600">Emergency Support: 24/7</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={handlePrint}
                            className="min-w-[180px]"
                        >
                            <DocumentTextIcon className="h-5 w-5 mr-2" />
                            Print Confirmation
                        </Button>
                        
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => window.close()}
                            className="min-w-[180px]"
                        >
                            Close Window
                        </Button>
                    </div>

                    {/* Print-only Summary */}
                    <div className="hidden print:block mt-8 border-t pt-8">
                        <h2 className="text-xl font-bold mb-4">Device Liability Agreement - Summary</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p><strong>Agreement ID:</strong> #{liabilityForm.id}</p>
                                <p><strong>Employee:</strong> {liabilityForm.employee_name}</p>
                                <p><strong>Employee ID:</strong> {liabilityForm.employee_id}</p>
                                <p><strong>Email:</strong> {liabilityForm.employee_email}</p>
                                <p><strong>Phone:</strong> {liabilityForm.personal_phone}</p>
                            </div>
                            <div>
                                <p><strong>Device:</strong> {deviceInfo.brand} {deviceInfo.model}</p>
                                <p><strong>Asset Tag:</strong> {deviceInfo.asset_tag}</p>
                                <p><strong>Serial Number:</strong> {deviceInfo.serial_number}</p>
                                <p><strong>Date Completed:</strong> {formatDate(liabilityForm.updated_at)}</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-600">
                                This document serves as confirmation that the liability agreement has been completed and digitally signed.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
