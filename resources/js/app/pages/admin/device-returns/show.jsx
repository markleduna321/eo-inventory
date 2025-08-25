import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '../layout';
import { 
    ArrowLeftIcon, 
    CheckCircleIcon, 
    ExclamationTriangleIcon,
    XCircleIcon,
    ClockIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function DeviceReturnShow({ deviceReturn }) {
    const { data, setData, post, processing } = useForm({
        supervisor_name: '',
        supervisor_notes: '',
    });

    const returnReasons = {
        'resignation': 'Employee Resignation',
        'termination': 'Employee Termination',
        'replacement': 'Device Replacement',
        'upgrade': 'Device Upgrade',
        'repair': 'Repair Required',
        'end_of_assignment': 'End of Assignment',
        'transfer': 'Department Transfer',
        'other': 'Other'
    };

    const statusOptions = {
        'available': 'Available',
        'needs_repair': 'Needs Repair',
        'damaged': 'Damaged',
        'disposed': 'Disposed'
    };

    const getStatusColor = (status) => {
        const colors = {
            'available': 'bg-green-100 text-green-800',
            'needs_repair': 'bg-yellow-100 text-yellow-800',
            'damaged': 'bg-red-100 text-red-800',
            'disposed': 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getReasonColor = (reason) => {
        const colors = {
            'resignation': 'bg-blue-100 text-blue-800',
            'termination': 'bg-red-100 text-red-800',
            'replacement': 'bg-green-100 text-green-800',
            'upgrade': 'bg-purple-100 text-purple-800',
            'repair': 'bg-orange-100 text-orange-800',
            'end_of_assignment': 'bg-gray-100 text-gray-800',
            'transfer': 'bg-indigo-100 text-indigo-800',
            'other': 'bg-yellow-100 text-yellow-800'
        };
        return colors[reason] || 'bg-gray-100 text-gray-800';
    };

    const getConditionIcon = (status) => {
        switch (status) {
            case 'good':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'minor_issue':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            case 'major_issue':
                return <XCircleIcon className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getConditionColor = (status) => {
        switch (status) {
            case 'good':
                return 'border-green-200 bg-green-50';
            case 'minor_issue':
                return 'border-yellow-200 bg-yellow-50';
            case 'major_issue':
                return 'border-red-200 bg-red-50';
            default:
                return 'border-gray-200 bg-gray-50';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleApproval = (e) => {
        e.preventDefault();
        post(`/admin/device-returns/${deviceReturn.id}/approve`);
    };

    const conditionSummary = deviceReturn.condition_check ? 
        deviceReturn.condition_check.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {}) : {};

    return (
        <AdminLayout>
            <Head title={`Device Return #${deviceReturn.id}`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link
                                    href="/admin/device-returns"
                                    className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                    Back to Returns
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Device Return #{deviceReturn.id}
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        Returned on {formatDate(deviceReturn.returned_at)}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getReasonColor(deviceReturn.return_reason)}`}>
                                    {returnReasons[deviceReturn.return_reason]}
                                </span>
                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(deviceReturn.new_status)}`}>
                                    {statusOptions[deviceReturn.new_status]}
                                </span>
                                {deviceReturn.has_issues && (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                                        Has Issues
                                    </span>
                                )}
                                {!deviceReturn.approved_by_supervisor && (
                                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                                        <ClockIcon className="h-4 w-4 mr-1" />
                                        Needs Approval
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Device Information */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Device Information</h2>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Device Type</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.device?.device_type}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Brand & Model</dt>
                                            <dd className="mt-1 text-sm text-gray-900">
                                                {deviceReturn.device?.brand} {deviceReturn.device?.model}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                            <dd className="mt-1 text-sm text-gray-900 font-mono">
                                                {deviceReturn.device?.serial_number}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Previous Status</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.device?.status}</dd>
                                        </div>
                                    </dl>
                                </div>
                            </div>

                            {/* Return Details */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Return Details</h2>
                                </div>
                                <div className="px-6 py-4">
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Returned By</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.returner_name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Previous Assignee</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.previous_assignee}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Received By</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.received_by}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Return Date</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{formatDate(deviceReturn.returned_at)}</dd>
                                        </div>
                                    </dl>
                                    
                                    {deviceReturn.return_notes && (
                                        <div className="mt-4">
                                            <dt className="text-sm font-medium text-gray-500">Return Notes</dt>
                                            <dd className="mt-1 text-sm text-gray-900">{deviceReturn.return_notes}</dd>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Condition Check */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-medium text-gray-900">Condition Assessment</h2>
                                        <div className="flex items-center space-x-4 text-sm">
                                            <span className="flex items-center text-green-600">
                                                <CheckCircleIcon className="h-4 w-4 mr-1" />
                                                {conditionSummary.good || 0} Good
                                            </span>
                                            <span className="flex items-center text-yellow-600">
                                                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                                                {conditionSummary.minor_issue || 0} Minor
                                            </span>
                                            <span className="flex items-center text-red-600">
                                                <XCircleIcon className="h-4 w-4 mr-1" />
                                                {conditionSummary.major_issue || 0} Major
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-6 py-4">
                                    <div className="space-y-3">
                                        {deviceReturn.condition_check?.map((item, index) => (
                                            <div key={index} className={`border rounded-lg p-3 ${getConditionColor(item.status)}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {getConditionIcon(item.status)}
                                                        <span className="ml-2 font-medium text-gray-900">{item.item}</span>
                                                    </div>
                                                    <span className="text-sm text-gray-600 capitalize">
                                                        {item.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                {item.notes && (
                                                    <p className="mt-2 text-sm text-gray-700">{item.notes}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Issues Description */}
                            {deviceReturn.has_issues && deviceReturn.issues_description && (
                                <div className="bg-white shadow rounded-lg">
                                    <div className="px-6 py-4 border-b border-gray-200">
                                        <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                            Issues Found
                                        </h2>
                                    </div>
                                    <div className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{deviceReturn.issues_description}</p>
                                        {deviceReturn.repair_cost && (
                                            <div className="mt-3 flex items-center">
                                                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-700">
                                                    Estimated repair cost: <span className="font-medium">${deviceReturn.repair_cost}</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Approval Status */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                        <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                                        Approval Status
                                    </h2>
                                </div>
                                <div className="px-6 py-4">
                                    {deviceReturn.approved_by_supervisor ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center">
                                                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                <span className="text-sm font-medium text-green-800">Approved</span>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                                                <dd className="mt-1 text-sm text-gray-900">{deviceReturn.supervisor_name}</dd>
                                            </div>
                                            {deviceReturn.supervisor_notes && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Supervisor Notes</dt>
                                                    <dd className="mt-1 text-sm text-gray-900">{deviceReturn.supervisor_notes}</dd>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
                                                <span className="text-sm font-medium text-yellow-800">Pending Approval</span>
                                            </div>
                                            
                                            <form onSubmit={handleApproval} className="space-y-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Supervisor Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.supervisor_name}
                                                        onChange={(e) => setData('supervisor_name', e.target.value)}
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Enter supervisor name"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Notes
                                                    </label>
                                                    <textarea
                                                        value={data.supervisor_notes}
                                                        onChange={(e) => setData('supervisor_notes', e.target.value)}
                                                        rows={3}
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Optional approval notes..."
                                                    />
                                                </div>
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                                >
                                                    {processing ? 'Approving...' : 'Approve Return'}
                                                </button>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                                </div>
                                <div className="px-6 py-4 space-y-3">
                                    <Link
                                        href={`/admin/devices/${deviceReturn.device?.id}`}
                                        className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        View Device Details
                                    </Link>
                                    <Link
                                        href="/admin/device-returns/create"
                                        className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        Process Another Return
                                    </Link>
                                </div>
                            </div>

                            {/* Return Summary */}
                            <div className="bg-white shadow rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-medium text-gray-900">Summary</h2>
                                </div>
                                <div className="px-6 py-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Return ID</span>
                                        <span className="font-medium">#{deviceReturn.id}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Device Status</span>
                                        <span className="font-medium">{statusOptions[deviceReturn.new_status]}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Issues Found</span>
                                        <span className="font-medium">{deviceReturn.has_issues ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Approved</span>
                                        <span className="font-medium">{deviceReturn.approved_by_supervisor ? 'Yes' : 'Pending'}</span>
                                    </div>
                                    {deviceReturn.repair_cost && (
                                        <div className="flex justify-between text-sm border-t pt-3">
                                            <span className="text-gray-500">Repair Cost</span>
                                            <span className="font-medium">${deviceReturn.repair_cost}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
