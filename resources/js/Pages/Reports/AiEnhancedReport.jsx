import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AppLayout from '@/Layouts/AppLayout';
import ReportFilter from './Components/ReportFilter';

const AiEnhancedReport = ({ reportType }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({});

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
        fetchAiEnhancedReport();
    }, [reportType]);

    const fetchAiEnhancedReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/reports/${reportType}/ai-enhanced`);
            setReport(response.data);
        } catch (error) {
            console.error('Error fetching AI-enhanced report:', error);
            toast.error('Failed to fetch AI-enhanced report');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = async (newFilters) => {
        try {
            setLoading(true);
            setFilters(newFilters);
            
            // First apply filters to regular report
            await axios.post(`/api/reports/${reportType}/filter`, newFilters);
            
            // Then fetch AI enhanced version
            const response = await axios.get(`/api/reports/${reportType}/ai-enhanced`);
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
        fetchAiEnhancedReport();
        toast.success('Filters cleared');
    };

    return (
        <AppLayout title={`AI-Enhanced ${getReportName(reportType)} Report`}>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold">AI-Enhanced {getReportName(reportType)} Report</h1>
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
                                {/* AI Insights Section */}
                                {report.ai_insights && (
                                    <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-xl border border-purple-100">
                                        <h2 className="text-xl font-semibold mb-4 text-purple-700">AI Insights</h2>
                                        
                                        {report.ai_insights.error ? (
                                            <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                                                <p className="text-red-700">{report.ai_insights.error}</p>
                                                <p className="text-red-500 text-sm mt-1">{report.ai_insights.message}</p>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Summary */}
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-medium text-purple-600 mb-2">Summary</h3>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <p className="text-gray-700">{report.ai_insights.summary}</p>
                                                    </div>
                                                </div>
                                                
                                                {/* Trends */}
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-medium text-purple-600 mb-2">Key Trends</h3>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                                                            {report.ai_insights.trends.map((trend, idx) => (
                                                                <li key={idx}>{trend}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                
                                                {/* Recommendations */}
                                                <div className="mb-6">
                                                    <h3 className="text-lg font-medium text-purple-600 mb-2">Recommendations</h3>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                                                            {report.ai_insights.recommendations.map((rec, idx) => (
                                                                <li key={idx}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                
                                                {/* Predictive Analytics */}
                                                <div>
                                                    <h3 className="text-lg font-medium text-purple-600 mb-2">Predictive Analytics</h3>
                                                    <div className="bg-white p-4 rounded-lg shadow-sm">
                                                        <ul className="list-disc pl-5 text-gray-700 space-y-2">
                                                            {report.ai_insights.predictive_analytics.map((prediction, idx) => (
                                                                <li key={idx}>{prediction}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-4 text-right text-sm text-gray-500">
                                                    Generated: {report.ai_insights.generated_at}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                {/* Standard Report Data */}
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
                                
                                {/* Report Data (Simplified from regular report) */}
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
                                                            {items.slice(0, 5).map((item, idx) => (
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
                                                    {items.length > 5 && (
                                                        <div className="text-center mt-2 text-sm text-gray-500">
                                                            Showing 5 of {items.length} items
                                                        </div>
                                                    )}
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
        </AppLayout>
    );
};

export default AiEnhancedReport;
