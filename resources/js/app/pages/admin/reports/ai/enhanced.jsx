import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../layout';
import ReportFilter from '../components/ReportFilter';
import { ArrowLeftIcon, ArrowPathIcon, BeakerIcon, ChartBarIcon, LightBulbIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

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
                            <h1 className="text-2xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                AI-Enhanced {getReportName(reportType)} Report
                            </h1>
                        </div>
                        <div className="flex space-x-3">
                            <a
                                href={`/admin/reports/${reportType}`}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md font-medium text-sm text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
                            >
                                Standard View
                            </a>
                            <button
                                onClick={() => fetchAiEnhancedReport()}
                                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 border border-transparent rounded-md font-bold text-sm text-white hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition shadow-md hover:shadow-xl"
                            >
                                <ArrowPathIcon className="h-5 w-5 mr-2" />
                                Regenerate AI Insights
                            </button>
                        </div>
                    </div>
                    
                    <ReportFilter 
                        applyFilters={applyFilters} 
                        clearFilters={clearFilters}
                    />
                    
                    {loading ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                            <div className="flex flex-col items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                                <p className="mt-4 text-gray-600">Analyzing data with AI...</p>
                            </div>
                        </div>
                    ) : report ? (
                        <>
                            {/* AI Insights Section with Modern Design */}
                            {report.ai_insights && (
                                <div className="mb-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-xl shadow-sm overflow-hidden border border-purple-100">
                                    <div className="p-6">
                                        <div className="flex items-center space-x-2 mb-6">
                                            <BeakerIcon className="h-6 w-6 text-purple-600" />
                                            <h2 className="text-xl font-bold text-gradient bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                AI-Powered Insights
                                            </h2>
                                        </div>
                                        
                                        {report.ai_insights.error ? (
                                            <div className="bg-red-50 p-6 rounded-lg border border-red-100 mb-4">
                                                <h3 className="text-red-700 font-medium mb-2">Error Generating AI Insights</h3>
                                                <p className="text-red-700">{report.ai_insights.error}</p>
                                                <p className="text-red-500 text-sm mt-3">{report.ai_insights.message}</p>
                                                <button 
                                                    onClick={() => fetchAiEnhancedReport()}
                                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                                >
                                                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                                                    Try Again
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                {/* Summary */}
                                                <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-blue-50">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <PresentationChartLineIcon className="h-5 w-5 text-purple-600" />
                                                        <h3 className="text-lg font-semibold text-purple-800">Executive Summary</h3>
                                                    </div>
                                                    <p className="text-gray-700 leading-relaxed">{report.ai_insights.summary}</p>
                                                </div>
                                                
                                                {/* Trends */}
                                                <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-50">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <ChartBarIcon className="h-5 w-5 text-blue-600" />
                                                        <h3 className="text-lg font-semibold text-blue-800">Key Trends</h3>
                                                    </div>
                                                    <ul className="list-none space-y-3">
                                                        {report.ai_insights.trends.map((trend, idx) => (
                                                            <li key={idx} className="flex items-start">
                                                                <div className="flex-shrink-0 h-5 w-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="text-gray-700">{trend}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                {/* Recommendations */}
                                                <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-50">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                                                        <h3 className="text-lg font-semibold text-blue-800">Recommendations</h3>
                                                    </div>
                                                    <ul className="list-none space-y-3">
                                                        {report.ai_insights.recommendations.map((rec, idx) => (
                                                            <li key={idx} className="flex items-start">
                                                                <div className="flex-shrink-0 h-5 w-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                                                                    {idx + 1}
                                                                </div>
                                                                <span className="text-gray-700">{rec}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                
                                                {/* AI Generated Footer */}
                                                <div className="lg:col-span-2 mt-2 pt-4 border-t border-blue-100 flex justify-between items-center">
                                                    <div className="text-xs text-gray-500">
                                                        AI analysis generated on {report.ai_insights.generated_at}
                                                    </div>
                                                    <div className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                                        Powered by AI
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    {/* Standard Report Data with Improved UI */}
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
                                    
                                    {/* Report Data with Highlighting Important Values */}
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Key Data Points</h2>
                                        {report.data && Object.entries(report.data).map(([category, items]) => (
                                            <div key={category} className="mb-8">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-medium capitalize text-gray-800">
                                                        {category.replace(/_/g, ' ')}
                                                    </h3>
                                                    {items.length > 5 && (
                                                        <a 
                                                            href={`/admin/reports/${reportType}#${category}`}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            View All ({items.length})
                                                        </a>
                                                    )}
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
                                                                {items.slice(0, 5).map((item, idx) => (
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
                                                                                ) : (
                                                                                    value
                                                                                )}
                                                                            </td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {items.length > 5 && (
                                                            <div className="text-center py-2 text-sm text-gray-500 border-t border-gray-200 bg-gray-50">
                                                                Showing 5 of {items.length} items
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                                                        <p className="text-gray-500">No data available for this category.</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <BeakerIcon className="mx-auto h-12 w-12 text-purple-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No AI-enhanced report available</h3>
                            <p className="mt-1 text-sm text-gray-500">Try generating a standard report first, then view the AI-enhanced version.</p>
                            <div className="mt-5 space-x-3">
                                <a
                                    href={`/admin/reports/${reportType}`}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    View Standard Report
                                </a>
                                <button
                                    onClick={() => fetchAiEnhancedReport()}
                                    className="inline-flex items-center px-5 py-3 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl transition-all duration-200"
                                >
                                    <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                                    Generate AI Report
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AiEnhancedReport;
