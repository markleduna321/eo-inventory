import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout';
import ReportFilter from './components/ReportFilter';

const ReportDetail = ({ reportType }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});
    const [exportLoading, setExportLoading] = useState(false);

    // Get report name from ID
    const getReportName = (id) => {
        const reportTypes = {
            'asset-inventory': 'Asset Inventory',
            'asset-utilization': 'Asset Utilization',
            'financial': 'Financial',
            'maintenance': 'Maintenance',
            'location-based': 'Location Based',
        };
        return reportTypes[id] || 'Report';
    };

    useEffect(() => {
        fetchReport();
    }, [reportType]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/reports/${reportType}`);
            setReport(response.data);
        } catch (error) {
            console.error('Error fetching report:', error);
            toast.error('Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExportLoading(true);
            const response = await axios.get(`/api/reports/${reportType}/export`, {
                responseType: 'blob',
                params: filters
            });
            
            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${reportType}-report.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            toast.success('Report exported successfully');
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Failed to export report');
        } finally {
            setExportLoading(false);
        }
    };

    const applyFilters = async (newFilters) => {
        try {
            setLoading(true);
            setFilters(newFilters);
            
            const response = await axios.post(`/api/reports/${reportType}/filter`, newFilters);
            setReport(response.data);
            toast.success('Filters applied');
        } catch (error) {
            console.error('Error applying filters:', error);
            toast.error('Failed to apply filters');
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({});
        fetchReport();
        toast.success('Filters cleared');
    };

    return (
        <AdminLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">{getReportName(reportType)} Report</h1>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExport}
                                disabled={exportLoading}
                                className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-500 active:bg-green-700 focus:outline-none focus:border-green-700 focus:ring ring-green-300 disabled:opacity-25 transition ease-in-out duration-150"
                            >
                                {exportLoading ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>
                    
                    <ReportFilter 
                        applyFilters={applyFilters} 
                        clearFilters={clearFilters}
                    />
                    
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="spinner">Loading...</div>
                        </div>
                    ) : report ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {/* Report Summary */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {report.summary && Object.entries(report.summary).map(([key, value]) => (
                                            key !== 'by_category' && key !== 'deployment_rate' ? (
                                                <div key={key} className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-500">{key.replace('_', ' ').toUpperCase()}</div>
                                                    <div className="text-2xl font-bold">{typeof value === 'number' && key.includes('rate') ? `${value}%` : value}</div>
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Report Data */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4">Detailed Data</h2>
                                    {report.data && Object.entries(report.data).map(([category, items]) => (
                                        <div key={category} className="mb-8">
                                            <h3 className="text-lg font-medium mb-3 capitalize">{category.replace('_', ' ')}</h3>
                                            {Array.isArray(items) && items.length > 0 ? (
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {Object.keys(items[0]).map(header => (
                                                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        {header.replace('_', ' ')}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {items.map((item, idx) => (
                                                                <tr key={idx}>
                                                                    {Object.values(item).map((value, vIdx) => (
                                                                        <td key={vIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {value}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">No data available for this category.</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <p className="text-gray-500">No report data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportDetail;
