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
            {/* Print-specific styles */}
            <style jsx global>{`
                @media print {
                    body { 
                        background: white !important; 
                        font-size: 12px !important;
                        line-height: 1.3 !important;
                    }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:ring-0 { box-shadow: none !important; }
                    .print\\:border-b-2 { border-bottom-width: 2px !important; }
                    .print\\:bg-blue-600 { background-color: #2563eb !important; }
                    .print\\:text-blue-100 { color: #dbeafe !important; }
                    .no-print { display: none !important; }
                    
                    /* Ensure proper page breaks */
                    .page-break-before { page-break-before: always; }
                    .page-break-after { page-break-after: always; }
                    .page-break-inside-avoid { page-break-inside: avoid; }
                    
                    /* Better table printing */
                    table { page-break-inside: auto; }
                    tr { page-break-inside: avoid; page-break-after: auto; }
                    td { page-break-inside: avoid; page-break-after: auto; }
                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }
                }
            `}</style>
            
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header - Hidden on print */}
                <div className="mb-6 no-print">
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
                        <div className="ml-auto">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.print()}
                            >
                                Print Document
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Print-only styling for professional document layout */}
                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden print:shadow-none print:ring-0">
                        
                        {/* Document Header - EmpireOne Branding */}
                        <div className="bg-white px-8 py-6 border-b border-gray-200 print:border-b-2">
                            <div className="flex items-center justify-center mb-4">
                                {/* EmpireOne Logo */}
                                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg shadow-lg print:shadow-none print:bg-blue-600">
                                    <div className="text-2xl font-bold tracking-wide">
                                        Empire<span className="text-blue-200 print:text-blue-100">One</span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
                                Device Liability Agreement
                            </h1>
                            <p className="text-center text-gray-600 text-lg">
                                This Device Liability Agreement was completed on <strong>{formatDate(liabilityForm.created_at)}</strong> between EmpireOne 
                                and the Employee listed below.
                            </p>
                        </div>

                        {/* Document Content */}
                        <div className="px-8 py-6 space-y-8">
                            
                            {/* Section 1: Device Issuance */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    1. Issuance of Company Device:
                                </h2>
                                <p className="text-gray-700 mb-4">
                                    The Company agrees to issue the following device to the Employee:
                                </p>
                                
                                {liabilityForm.device_request?.device && (
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
                                                        {liabilityForm.device_request.device.device_type || 'Computer Device'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                        {liabilityForm.device_request.device.brand} {liabilityForm.device_request.device.model}
                                                        {liabilityForm.accessories_received && liabilityForm.accessories_received.length > 0 && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                Accessories: {liabilityForm.accessories_received.join(', ')}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                        {liabilityForm.device_request.device.serial_number}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                        {liabilityForm.device_request.device.asset_tag}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-900 border-b border-gray-300">
                                                        {liabilityForm.device_condition_notes || 'Good'}
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <p className="text-sm text-gray-900 font-medium">{liabilityForm.employee_name}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                        <p className="text-sm text-gray-900 font-medium">{liabilityForm.employee_id || 'Not provided'}</p>
                                    </div>

                                    {liabilityForm.contact_number && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                            <p className="text-sm text-gray-900">{liabilityForm.contact_number}</p>
                                        </div>
                                    )}

                                    {liabilityForm.email && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <p className="text-sm text-gray-900">{liabilityForm.email}</p>
                                        </div>
                                    )}

                                    {liabilityForm.department && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                            <p className="text-sm text-gray-900">{liabilityForm.department}</p>
                                        </div>
                                    )}

                                    {liabilityForm.position && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Position/Job Title</label>
                                            <p className="text-sm text-gray-900">{liabilityForm.position}</p>
                                        </div>
                                    )}
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

                                {/* Digital Signature */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Employee Signature */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Employee:</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Digital Signature
                                            </label>
                                            <div className="border-2 border-gray-300 rounded-lg p-3 bg-white mb-3">
                                                {renderSignature()}
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                                                <p className="text-sm text-green-800">
                                                    ✓ I have read, understood, and agree to all the terms and conditions stated in this Device Liability Agreement. 
                                                    I acknowledge that I am fully responsible for the assigned device and will comply with all company policies.
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">
                                                    Signed on {formatDate(liabilityForm.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            <div>Name: {liabilityForm.employee_name}</div>
                                            <div className="mt-2">Date: {formatDate(liabilityForm.created_at)}</div>
                                        </div>
                                    </div>

                                    {/* Company Representative */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900 mb-3">Company Representative:</h3>
                                        <div className="mt-16 text-sm text-gray-600">
                                            <div>Name: ________________________________</div>
                                            <div className="mt-2">Title: IT Manager</div>
                                            <div className="mt-2">Date: {formatDate(liabilityForm.created_at)}</div>
                                            <div className="mt-4 text-xs font-medium text-gray-700">
                                                EmpireOne
                                            </div>
                                        </div>
                                    </div>
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
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
