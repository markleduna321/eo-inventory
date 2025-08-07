import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout';
import ReportFilter from './components/ReportFilter';
import { ArrowDownTrayIcon, ArrowLeftIcon, ArrowPathIcon, ChartPieIcon } from '@heroicons/react/24/outline';

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
            'transaction-history': 'Transaction History',
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
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back button and title row */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <a 
                                href="/admin/reports" 
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                                Back to Reports
                            </a>
                            <h1 className="text-2xl font-bold text-gray-900">{getReportName(reportType)} Report</h1>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={handleExport}
                                disabled={exportLoading}
                                className="inline-flex items-center px-4 py-3 bg-blue-600 border border-transparent rounded-md font-bold text-sm text-white tracking-wider hover:bg-blue-500 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-25 transition shadow-md hover:shadow-lg"
                            >
                                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                                {exportLoading ? 'Exporting...' : 'Download CSV'}
                            </button>
                            <a
                                href={`/admin/reports/${reportType}/ai-enhanced`}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-sm text-white tracking-wider hover:bg-purple-500 active:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                            >
                                <ChartPieIcon className="h-4 w-4 mr-2" />
                                AI Analysis
                            </a>
                        </div>
                    </div>
                    
                    <ReportFilter 
                        applyFilters={applyFilters} 
                        clearFilters={clearFilters}
                    />
                    
                    {loading ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                <p className="mt-4 text-gray-600">Loading report data...</p>
                            </div>
                        </div>
                    ) : report ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {/* Report Summary Cards */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Report Summary</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {report.summary && Object.entries(report.summary).map(([key, value]) => (
                                            key !== 'by_category' && key !== 'deployment_rate' ? (
                                                <div key={key} className="bg-gradient-to-br from-white to-gray-50 shadow-sm p-4 rounded-lg border border-gray-100">
                                                    <div className="text-sm text-gray-500 font-medium">{key.replace(/_/g, ' ').toUpperCase()}</div>
                                                    <div className="mt-2 text-3xl font-bold text-gray-800">
                                                        {typeof value === 'number' && key.includes('rate') ? `${value}%` : value}
                                                    </div>
                                                    {key.includes('rate') && (
                                                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                                            <div 
                                                                className="bg-blue-600 h-1.5 rounded-full" 
                                                                style={{ width: `${typeof value === 'number' ? Math.min(value, 100) : 0}%` }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : null
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Report Data Sections with Improved Tables */}
                                <div>
                                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">Detailed Data</h2>
                                    
                                    {report.data && Object.entries(report.data).map(([category, items]) => (
                                        <div key={category} className="mb-8">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-lg font-medium capitalize text-gray-800">{category.replace(/_/g, ' ')}</h3>
                                                <button 
                                                    onClick={() => {}} 
                                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                >
                                                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                                                    Refresh
                                                </button>
                                            </div>
                                            
                                            {Array.isArray(items) && items.length > 0 ? (
                                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                {Object.keys(items[0]).map(header => (
                                                                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        {header.replace(/_/g, ' ')}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {items.map((item, idx) => (
                                                                <tr 
                                                                    key={idx} 
                                                                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                                                >
                                                                    {Object.entries(item).map(([key, value], vIdx) => (
                                                                        <td key={vIdx} className="px-6 py-4 text-sm text-gray-500">
                                                                            {typeof value === 'string' && value.includes('%') ? (
                                                                                <div className="flex items-center">
                                                                                    <span className="mr-2">{value}</span>
                                                                                    <div className="w-20 bg-gray-200 rounded-full h-1.5">
                                                                                        <div 
                                                                                            className="bg-blue-600 h-1.5 rounded-full" 
                                                                                            style={{ width: `${parseInt(value) || 0}%` }}
                                                                                        ></div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : typeof value === 'object' && value !== null ? (
                                                                                // Handle object values (like location, part, etc.)
                                                                                value.name || value.title || value.code || JSON.stringify(value)
                                                                            ) : (
                                                                                value
                                                                            )}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="bg-gray-50 p-6 rounded-lg text-center">
                                                    <p className="text-gray-500">No data available for this category.</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="text-xs text-gray-500 text-right mt-6">
                                    Report generated: {new Date().toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <ChartPieIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No report data available</h3>
                            <p className="mt-1 text-sm text-gray-500">Try changing your filter criteria or regenerate this report.</p>
                            <button
                                onClick={() => fetchReport()}
                                className="mt-5 inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-500 hover:shadow-xl transition-all duration-200"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2 animate-pulse" />
                                Generate Report
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default ReportDetail;
