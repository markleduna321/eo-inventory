import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '../layout';
import { MagnifyingGlassIcon, PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function DeviceReturnsIndex({ returns, filters = {} }) {
    const [search, setSearch] = useState('');
    const [localFilters, setLocalFilters] = useState(filters);
    const [showFilters, setShowFilters] = useState(false);

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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFilterChange = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const applyFilters = () => {
        const searchParams = new URLSearchParams(localFilters);
        window.location.href = `${window.location.pathname}?${searchParams.toString()}`;
    };

    const clearFilters = () => {
        setLocalFilters({});
        window.location.href = window.location.pathname;
    };

    return (
        <AdminLayout>
            <Head title="Device Returns" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="sm:flex sm:items-center sm:justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold leading-6 text-gray-900">Device Returns</h1>
                            <p className="mt-2 text-sm text-gray-700">
                                Manage device returns for resignations, terminations, and replacements
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href="/admin/device-returns/create"
                                className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                                Process Return
                            </Link>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                            placeholder="Search by device, assignee, or reason..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Filters
                                    </button>
                                </div>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Return Reason
                                            </label>
                                            <select
                                                value={localFilters.return_reason || ''}
                                                onChange={(e) => handleFilterChange('return_reason', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Reasons</option>
                                                {Object.entries(returnReasons).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Device Status
                                            </label>
                                            <select
                                                value={localFilters.new_status || ''}
                                                onChange={(e) => handleFilterChange('new_status', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All Statuses</option>
                                                {Object.entries(statusOptions).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Issues Found
                                            </label>
                                            <select
                                                value={localFilters.has_issues || ''}
                                                onChange={(e) => handleFilterChange('has_issues', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All</option>
                                                <option value="true">With Issues</option>
                                                <option value="false">No Issues</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Approval Status
                                            </label>
                                            <select
                                                value={localFilters.needs_approval || ''}
                                                onChange={(e) => handleFilterChange('needs_approval', e.target.value)}
                                                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">All</option>
                                                <option value="true">Needs Approval</option>
                                                <option value="false">Approved</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={applyFilters}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Apply Filters
                                        </button>
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Returns Table */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {returns.data && returns.data.length > 0 ? (
                                returns.data.map((deviceReturn) => (
                                    <li key={deviceReturn.id}>
                                        <Link
                                            href={`/admin/device-returns/${deviceReturn.id}`}
                                            className="block hover:bg-gray-50"
                                        >
                                            <div className="px-4 py-4 sm:px-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    {deviceReturn.device?.device_type?.charAt(0) || 'D'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="flex items-center">
                                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                                    {deviceReturn.device?.brand} {deviceReturn.device?.model}
                                                                </p>
                                                                <p className="ml-2 text-sm text-gray-500">
                                                                    ({deviceReturn.device?.serial_number})
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center mt-1">
                                                                <p className="text-sm text-gray-500">
                                                                    Returned by: <span className="font-medium">{deviceReturn.returner_name}</span>
                                                                </p>
                                                                <p className="ml-4 text-sm text-gray-500">
                                                                    Previous assignee: <span className="font-medium">{deviceReturn.previous_assignee}</span>
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReasonColor(deviceReturn.return_reason)}`}>
                                                            {returnReasons[deviceReturn.return_reason]}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deviceReturn.new_status)}`}>
                                                            {statusOptions[deviceReturn.new_status]}
                                                        </span>
                                                        {deviceReturn.has_issues && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                Has Issues
                                                            </span>
                                                        )}
                                                        {!deviceReturn.approved_by_supervisor && (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Needs Approval
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-2 sm:flex sm:justify-between">
                                                    <div className="sm:flex">
                                                        <p className="text-sm text-gray-500">
                                                            Returned on {formatDate(deviceReturn.returned_at)}
                                                        </p>
                                                        <p className="mt-2 text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                                            Received by: {deviceReturn.received_by}
                                                        </p>
                                                    </div>
                                                    {deviceReturn.repair_cost && (
                                                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                            <p>
                                                                Repair cost: ${deviceReturn.repair_cost}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="px-4 py-12 text-center text-gray-500">
                                    <div className="space-y-3">
                                        <div className="mx-auto h-12 w-12 text-gray-400">
                                            📱
                                        </div>
                                        <p className="text-lg font-medium">No device returns found</p>
                                        <p className="text-sm">Get started by processing your first device return.</p>
                                        <Link
                                            href="/admin/device-returns/create"
                                            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                                        >
                                            Process Return
                                        </Link>
                                    </div>
                                </li>
                            )}
                        </ul>

                        {/* Pagination */}
                        {returns.last_page > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {returns.prev_page_url && (
                                        <Link
                                            href={returns.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Previous
                                        </Link>
                                    )}
                                    {returns.next_page_url && (
                                        <Link
                                            href={returns.next_page_url}
                                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{returns.from}</span> to{' '}
                                            <span className="font-medium">{returns.to}</span> of{' '}
                                            <span className="font-medium">{returns.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                            {returns.prev_page_url && (
                                                <Link
                                                    href={returns.prev_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    <ChevronLeftIcon className="h-5 w-5" />
                                                </Link>
                                            )}
                                            {returns.next_page_url && (
                                                <Link
                                                    href={returns.next_page_url}
                                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                                                >
                                                    <ChevronRightIcon className="h-5 w-5" />
                                                </Link>
                                            )}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
