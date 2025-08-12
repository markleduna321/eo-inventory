import React from 'react'
import AdminLayout from '../layout'
import { Link } from '@inertiajs/react'
import { ArrowLeftIcon, DocumentTextIcon, UserIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function ShowLiabilityForm({ liabilityForm }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const renderSignature = () => {
        if (!liabilityForm.signature_data) {
            console.log('No signature data found');
            return (
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                    <span className="text-gray-500 text-sm">No signature data available</span>
                </div>
            );
        }

        console.log('Signature data length:', liabilityForm.signature_data.length);
        console.log('Signature format:', liabilityForm.signature_format);

        // Check if it's SVG data
        if (liabilityForm.signature_data.includes('<svg')) {
            console.log('Rendering as SVG');
            return (
                <div 
                    className="border border-gray-300 rounded-lg p-4 bg-white"
                    dangerouslySetInnerHTML={{ __html: liabilityForm.signature_data }}
                />
            );
        }

        // Handle base64 image data (PNG, JPG, etc.)
        let imageUrl = liabilityForm.signature_data;
        
        // If it doesn't start with 'data:', it's raw base64, so add the proper prefix
        if (!imageUrl.startsWith('data:')) {
            const format = liabilityForm.signature_format || 'png';
            imageUrl = `data:image/${format};base64,${imageUrl}`;
            console.log('Added data URL prefix for format:', format);
        }

        console.log('Final image URL length:', imageUrl.length);
        console.log('Image URL preview:', imageUrl.substring(0, 100) + '...');

        return (
            <div className="border border-gray-300 rounded-lg p-4 bg-white">
                <img 
                    src={imageUrl} 
                    alt="Digital Signature"
                    className="max-h-32 mx-auto"
                    onLoad={() => console.log('Signature image loaded successfully')}
                    onError={(e) => {
                        console.error('Failed to load signature image:', e);
                        console.error('Image URL:', imageUrl);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                    }}
                />
                <div className="text-center text-red-500 text-sm" style={{display: 'none'}}>
                    <span>❌ Signature data available but could not be displayed</span>
                    <div className="text-xs mt-1">Check browser console for details</div>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href="/admin/device-requests">
                            <Button variant="outline" size="sm">
                                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                                Back to Requests
                            </Button>
                        </Link>
                        <div className="h-6 border-l border-gray-300"></div>
                        <DocumentTextIcon className="w-6 h-6 text-gray-500" />
                        <h1 className="text-xl font-semibold text-gray-900">Liability Form</h1>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                        {/* Form Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-medium text-gray-900">Device Liability Agreement</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Completed on {formatDate(liabilityForm.created_at)}
                            </p>
                        </div>

                        {/* Employee Information */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                <UserIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Employee Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{liabilityForm.employee_name}</p>
                                </div>
                                {liabilityForm.employee_id && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.employee_id}</p>
                                    </div>
                                )}
                                {liabilityForm.department && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Department</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.department}</p>
                                    </div>
                                )}
                                {liabilityForm.position && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Position</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.position}</p>
                                    </div>
                                )}
                                {liabilityForm.contact_number && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.contact_number}</p>
                                    </div>
                                )}
                                {liabilityForm.email && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.email}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Device Information */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-gray-500" />
                                Device Information
                            </h3>
                            {liabilityForm.device_request?.device && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Device Type</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.device_request.device.device_type}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Brand & Model</label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {liabilityForm.device_request.device.brand} {liabilityForm.device_request.device.model}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Serial Number</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.device_request.device.serial_number}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Asset Tag</label>
                                        <p className="mt-1 text-sm text-gray-900">{liabilityForm.device_request.device.asset_tag}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Device Condition & Accessories */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-md font-medium text-gray-900 mb-4">Device Condition & Accessories</h3>
                            {liabilityForm.device_condition_notes && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Device Condition Notes</label>
                                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{liabilityForm.device_condition_notes}</p>
                                </div>
                            )}
                            {liabilityForm.accessories_received && liabilityForm.accessories_received.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Accessories Received</label>
                                    <ul className="list-disc list-inside text-sm text-gray-900">
                                        {liabilityForm.accessories_received.map((accessory, index) => (
                                            <li key={index}>{accessory}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Digital Signature */}
                        <div className="px-6 py-4">
                            <h3 className="text-md font-medium text-gray-900 mb-4">Digital Signature</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee Signature</label>
                                    {renderSignature()}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Agreement</label>
                                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-800">
                                            ✓ I agree to take full responsibility for the assigned device and understand the terms and conditions.
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Signed on {formatDate(liabilityForm.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
