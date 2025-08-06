import React, { useState } from 'react';
import { FunnelIcon, XCircleIcon, AdjustmentsHorizontalIcon, CalendarIcon, MapPinIcon, TagIcon, DeviceTabletIcon } from '@heroicons/react/24/outline';

const ReportFilter = ({ applyFilters, clearFilters }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [location, setLocation] = useState('');
    const [assetType, setAssetType] = useState('');
    const [status, setStatus] = useState('');
    
    // Track if filters are active
    const hasActiveFilters = dateRange.startDate || dateRange.endDate || location || assetType || status;

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilters({
            dateRange,
            location,
            assetType,
            status
        });
    };

    const handleClear = () => {
        setDateRange({ startDate: '', endDate: '' });
        setLocation('');
        setAssetType('');
        setStatus('');
        clearFilters();
    };

    return (
        <div className={`bg-white rounded-lg shadow mb-6 border ${hasActiveFilters ? 'border-blue-200' : 'border-gray-200'} transition-all duration-200`}>
            <div 
                className="flex justify-between items-center p-4 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-2">
                    <FunnelIcon className={`h-5 w-5 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-500'}`} />
                    <h3 className={`font-medium ${hasActiveFilters ? 'text-blue-700' : 'text-gray-700'}`}>
                        {hasActiveFilters ? 'Filters Applied' : 'Filter Report'}
                    </h3>
                    {hasActiveFilters && (
                        <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {Object.values({ 
                                dateFilter: dateRange.startDate || dateRange.endDate ? 1 : 0,
                                locationFilter: location ? 1 : 0,
                                assetTypeFilter: assetType ? 1 : 0,
                                statusFilter: status ? 1 : 0
                            }).reduce((a, b) => a + b, 0)} filters
                        </div>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                            className="inline-flex items-center px-2 py-1 text-xs text-red-600 hover:text-red-800"
                        >
                            <XCircleIcon className="h-4 w-4 mr-1" />
                            Clear All
                        </button>
                    )}
                    <AdjustmentsHorizontalIcon 
                        className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''} ${hasActiveFilters ? 'text-blue-600' : 'text-gray-500'}`} 
                    />
                </div>
            </div>
            
            {isExpanded && (
                <div className="border-t border-gray-200 p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Date Range Section */}
                            <div className="space-y-2">
                                <label className="flex items-center text-sm font-medium text-gray-700">
                                    <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Date Range
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <input
                                            type="date"
                                            id="startDate"
                                            placeholder="Start Date"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="date"
                                            id="endDate"
                                            placeholder="End Date"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Location Filter */}
                            <div>
                                <label htmlFor="location" className="flex items-center text-sm font-medium text-gray-700">
                                    <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Location
                                </label>
                                <select
                                    id="location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Locations</option>
                                    <option value="main-office">Main Office</option>
                                    <option value="branch-1">Branch 1</option>
                                    <option value="branch-2">Branch 2</option>
                                    <option value="remote">Remote Workers</option>
                                </select>
                            </div>
                            
                            {/* Asset Type Filter */}
                            <div>
                                <label htmlFor="assetType" className="flex items-center text-sm font-medium text-gray-700">
                                    <DeviceTabletIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Asset Type
                                </label>
                                <select
                                    id="assetType"
                                    value={assetType}
                                    onChange={(e) => setAssetType(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Types</option>
                                    <option value="monitor">Monitors</option>
                                    <option value="system-unit">System Units</option>
                                    <option value="peripheral">Peripherals</option>
                                    <option value="part">Parts</option>
                                    <option value="device">Devices</option>
                                </select>
                            </div>
                            
                            {/* Status Filter */}
                            <div>
                                <label htmlFor="status" className="flex items-center text-sm font-medium text-gray-700">
                                    <TagIcon className="h-4 w-4 mr-1 text-gray-400" />
                                    Status
                                </label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="decommissioned">Decommissioned</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="mt-5 flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                            >
                                <XCircleIcon className="h-4 w-4 mr-2 text-gray-400" />
                                Clear Filters
                            </button>
                            <button
                                type="submit"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <FunnelIcon className="h-4 w-4 mr-2" />
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Active filters summary - show when collapsed and filters are active */}
            {!isExpanded && hasActiveFilters && (
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {dateRange.startDate && dateRange.endDate && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(dateRange.startDate).toLocaleDateString()} to {new Date(dateRange.endDate).toLocaleDateString()}
                        </div>
                    )}
                    {location && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            Location: {location.replace('-', ' ')}
                        </div>
                    )}
                    {assetType && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                            <DeviceTabletIcon className="h-3 w-3 mr-1" />
                            Type: {assetType.replace('-', ' ')}
                        </div>
                    )}
                    {status && (
                        <div className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs">
                            <TagIcon className="h-3 w-3 mr-1" />
                            Status: {status}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReportFilter;
