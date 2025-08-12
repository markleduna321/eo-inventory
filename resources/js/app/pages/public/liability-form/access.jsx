import React, { useState } from 'react'
import { Head, useForm } from '@inertiajs/react'
import { ExclamationTriangleIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function PublicLiabilityFormAccess({ token, deviceInfo, prefilledData }) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        post(`/liability-form/${token}/verify`)
    }

    return (
        <>
            <Head title="Device Liability Agreement" />
            
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                        <LockClosedIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                        Device Liability Agreement
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Secure access to complete your device assignment agreement
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* Device Information */}
                        {deviceInfo && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Device Assignment</h3>
                                <div className="text-sm text-blue-700">
                                    <div><strong>Device:</strong> {deviceInfo.brand} {deviceInfo.model}</div>
                                    <div><strong>Asset Tag:</strong> {deviceInfo.asset_tag}</div>
                                    <div><strong>Serial:</strong> {deviceInfo.serial_number}</div>
                                </div>
                            </div>
                        )}

                        {/* Access Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">
                                    Employee ID
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="employee_id"
                                        name="employee_id"
                                        type="text"
                                        required
                                        value={data.employee_id}
                                        onChange={(e) => setData('employee_id', e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Enter your employee ID"
                                    />
                                    {errors.employee_id && (
                                        <p className="mt-2 text-sm text-red-600">{errors.employee_id}</p>
                                    )}
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Please enter your employee ID to verify your identity and access the form.
                                </p>
                            </div>

                            {errors.message && (
                                <div className="rounded-md bg-red-50 p-4">
                                    <div className="flex">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Access Denied
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                <p>{errors.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {processing ? 'Verifying...' : 'Access Form'}
                                </Button>
                            </div>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">
                                <strong>Security Notice:</strong> This form contains sensitive information. 
                                Access is restricted to authorized personnel only. Your access will be logged 
                                for security purposes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
