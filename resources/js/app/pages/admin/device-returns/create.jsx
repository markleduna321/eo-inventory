import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '../layout';
import { MagnifyingGlassIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function DeviceReturnCreate({ device, returnReasons, conditionCheckItems }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        device_id: device?.id || '',
        returner_name: '',
        return_reason: '',
        return_notes: '',
        condition_check: conditionCheckItems.map(item => ({
            item: item.item,
            status: 'good',
            notes: ''
        })),
        received_by: '',
        issues_description: '',
        repair_cost: '',
        supervisor_name: '',
        supervisor_notes: '',
    });

    const [selectedDevice, setSelectedDevice] = useState(device);
    const [deviceSearch, setDeviceSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Search for assigned devices
    const searchDevices = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await fetch(`/admin/api/devices/assigned?search=${encodeURIComponent(query)}`);
            const result = await response.json();
            if (result.success) {
                setSearchResults(result.data);
            }
        } catch (error) {
            console.error('Error searching devices:', error);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            searchDevices(deviceSearch);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [deviceSearch]);

    const selectDevice = (device) => {
        setSelectedDevice(device);
        setData('device_id', device.id);
        setDeviceSearch(`${device.brand} ${device.model} (${device.serial_number})`);
        setSearchResults([]);
    };

    const handleConditionChange = (index, field, value) => {
        const newConditionCheck = [...data.condition_check];
        newConditionCheck[index] = {
            ...newConditionCheck[index],
            [field]: value
        };
        setData('condition_check', newConditionCheck);
    };

    const hasIssues = data.condition_check.some(item => 
        item.status === 'minor_issue' || item.status === 'major_issue'
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'good':
                return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'minor_issue':
                return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
            case 'major_issue':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
            default:
                return null;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return 'border-green-300 bg-green-50';
            case 'minor_issue':
                return 'border-yellow-300 bg-yellow-50';
            case 'major_issue':
                return 'border-red-300 bg-red-50';
            default:
                return 'border-gray-300 bg-white';
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post('/admin/device-returns');
    };

    return (
        <AdminLayout>
            <Head title="Process Device Return" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900">Process Device Return</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Process a device return for resignations, terminations, or other reasons.
                                </p>
                            </div>

                            <form onSubmit={submit} className="space-y-6">
                                {/* Device Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Device to Return *
                                    </label>
                                    {!selectedDevice ? (
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={deviceSearch}
                                                onChange={(e) => setDeviceSearch(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="Search for assigned devices by serial, brand, model, or assignee..."
                                            />
                                            
                                            {searchResults.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                                                    {searchResults.map((device) => (
                                                        <div
                                                            key={device.id}
                                                            onClick={() => selectDevice(device)}
                                                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white"
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="font-normal block truncate">
                                                                    {device.brand} {device.model}
                                                                </span>
                                                                <span className="text-gray-500 ml-2 truncate">
                                                                    ({device.serial_number})
                                                                </span>
                                                            </div>
                                                            <div className="text-xs opacity-75">
                                                                Assigned to: {device.issued_to}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {selectedDevice.brand} {selectedDevice.model}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Serial: {selectedDevice.serial_number}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Currently assigned to: {selectedDevice.issued_to}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedDevice(null);
                                                        setData('device_id', '');
                                                        setDeviceSearch('');
                                                    }}
                                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                                >
                                                    Change Device
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {errors.device_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.device_id}</p>
                                    )}
                                </div>

                                {/* Return Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Person Returning Device *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.returner_name}
                                            onChange={(e) => setData('returner_name', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Name of person returning the device"
                                        />
                                        {errors.returner_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.returner_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Return Reason *
                                        </label>
                                        <select
                                            value={data.return_reason}
                                            onChange={(e) => setData('return_reason', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select reason...</option>
                                            {Object.entries(returnReasons).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                        {errors.return_reason && (
                                            <p className="mt-1 text-sm text-red-600">{errors.return_reason}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Return Notes
                                    </label>
                                    <textarea
                                        value={data.return_notes}
                                        onChange={(e) => setData('return_notes', e.target.value)}
                                        rows={3}
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Additional notes about the return..."
                                    />
                                    {errors.return_notes && (
                                        <p className="mt-1 text-sm text-red-600">{errors.return_notes}</p>
                                    )}
                                </div>

                                {/* Condition Check */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Condition Check</h3>
                                    <div className="space-y-4">
                                        {data.condition_check.map((item, index) => (
                                            <div key={index} className={`border rounded-lg p-4 ${getStatusColor(item.status)}`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center">
                                                        {getStatusIcon(item.status)}
                                                        <h4 className="ml-2 font-medium text-gray-900">{item.item}</h4>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {conditionCheckItems.find(ci => ci.item === item.item)?.description}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Condition
                                                        </label>
                                                        <select
                                                            value={item.status}
                                                            onChange={(e) => handleConditionChange(index, 'status', e.target.value)}
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        >
                                                            <option value="good">Good</option>
                                                            <option value="minor_issue">Minor Issue</option>
                                                            <option value="major_issue">Major Issue</option>
                                                        </select>
                                                    </div>
                                                    
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Notes (if any issues)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.notes}
                                                            onChange={(e) => handleConditionChange(index, 'notes', e.target.value)}
                                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                            placeholder="Describe any issues found..."
                                                            disabled={item.status === 'good'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Issues Summary */}
                                {hasIssues && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                        <div className="flex">
                                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">
                                                    Issues Found During Return
                                                </h3>
                                                <div className="mt-2">
                                                    <textarea
                                                        value={data.issues_description}
                                                        onChange={(e) => setData('issues_description', e.target.value)}
                                                        rows={3}
                                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                        placeholder="Provide a detailed description of all issues found..."
                                                    />
                                                </div>
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Estimated Repair Cost
                                                        </label>
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-500 sm:text-sm">$</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={data.repair_cost}
                                                                onChange={(e) => setData('repair_cost', e.target.value)}
                                                                className="block w-full pl-7 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Processing Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Received By *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.received_by}
                                            onChange={(e) => setData('received_by', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Name of person processing the return"
                                        />
                                        {errors.received_by && (
                                            <p className="mt-1 text-sm text-red-600">{errors.received_by}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Supervisor Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.supervisor_name}
                                            onChange={(e) => setData('supervisor_name', e.target.value)}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Supervisor approving the return"
                                        />
                                        {errors.supervisor_name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.supervisor_name}</p>
                                        )}
                                    </div>
                                </div>

                                {data.supervisor_name && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Supervisor Notes
                                        </label>
                                        <textarea
                                            value={data.supervisor_notes}
                                            onChange={(e) => setData('supervisor_notes', e.target.value)}
                                            rows={3}
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Additional notes from supervisor..."
                                        />
                                        {errors.supervisor_notes && (
                                            <p className="mt-1 text-sm text-red-600">{errors.supervisor_notes}</p>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => window.history.back()}
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                    >
                                        {processing ? 'Processing...' : 'Process Return'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
