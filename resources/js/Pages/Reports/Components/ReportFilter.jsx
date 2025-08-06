import React, { useState } from 'react';

const ReportFilter = ({ applyFilters, clearFilters }) => {
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
    const [location, setLocation] = useState('');
    const [assetType, setAssetType] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        applyFilters({
            dateRange,
            location,
            assetType
        });
    };

    const handleClear = () => {
        setDateRange({ startDate: '', endDate: '' });
        setLocation('');
        setAssetType('');
        clearFilters();
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium mb-4">Filter Report</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <select
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Locations</option>
                            <option value="main-office">Main Office</option>
                            <option value="branch-1">Branch 1</option>
                            <option value="branch-2">Branch 2</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">Asset Type</label>
                        <select
                            id="assetType"
                            value={assetType}
                            onChange={(e) => setAssetType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">All Types</option>
                            <option value="monitor">Monitors</option>
                            <option value="system-unit">System Units</option>
                            <option value="peripheral">Peripherals</option>
                            <option value="part">Parts</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Clear
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Apply Filters
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportFilter;
