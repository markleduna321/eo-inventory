import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReportFilter from './components/ReportFilter';

// Icons
const ArrowLeftIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
));

const SparklesIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
));

const RefreshIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
));

const ChartBarIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
));

const ExclamationIcon = React.forwardRef((props, ref) => (
    <svg ref={ref} {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.992-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
));

const EnhancedReport = ({ reportType }) => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [appliedFilters, setAppliedFilters] = useState({});

    const getReportTitle = (type) => {
        const titles = {
            'asset-inventory': 'Asset Inventory',
            'asset-utilization': 'Asset Utilization',
            'financial': 'Financial',
            'maintenance': 'Maintenance',
            'location-based': 'Location Based'
        };
        return titles[type] || 'Report';
    };

    useEffect(() => {
        fetchAIEnhancedReport();
    }, [reportType]);

    const fetchAIEnhancedReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/reports/${reportType}/ai-enhanced`);
            setReportData(response.data);
        } catch (error) {
            console.error('Error fetching AI-enhanced report:', error);
            toast.error('Failed to fetch AI-enhanced report');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltersApply = async (filters) => {
        try {
            setLoading(true);
            setAppliedFilters(filters);
            
            // Apply filters
            await axios.post(`/api/reports/${reportType}/filter`, filters);
            
            // Fetch updated AI-enhanced report
            const response = await axios.get(`/api/reports/${reportType}/ai-enhanced`);
            setReportData(response.data);
            toast.success('Filters applied');
        } catch (error) {
            console.error('Error applying filters:', error);
            toast.error('Failed to apply filters');
        } finally {
            setLoading(false);
        }
    };

    const handleClearFilters = () => {
        setAppliedFilters({});
        fetchAIEnhancedReport();
        toast.success('Filters cleared');
    };

    return (
        <AdminLayout>
            <Head title={`AI-Enhanced ${getReportTitle(reportType)} Report`} />
            
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
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
                                AI-Enhanced {getReportTitle(reportType)} Report
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
                                onClick={() => fetchAIEnhancedReport()}
                                className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-purple-600 to-blue-600 border border-transparent rounded-md font-bold text-sm text-white tracking-wider hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition shadow-md hover:shadow-lg"
                            >
                                <RefreshIcon className="h-4 w-4 mr-2" />
                                Refresh AI Analysis
                            </button>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <ReportFilter
                        applyFilters={handleFiltersApply}
                        clearFilters={handleClearFilters}
                    />

                    {loading ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                            <div className="flex flex-col items-center justify-center">
                                <svg className="animate-spin h-12 w-12 text-purple-600 mb-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Generating AI Analysis</h3>
                                <p className="text-sm text-gray-500">Please wait while we analyze your data...</p>
                            </div>
                        </div>
                    ) : reportData ? (
                        <div className="space-y-6">
                            {/* AI Insights Section */}
                            {reportData.aiInsights && (
                                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                                    <div className="flex items-center mb-4">
                                        <SparklesIcon className="h-6 w-6 text-purple-600 mr-3" />
                                        <h2 className="text-xl font-bold text-gray-900">AI Insights & Analysis</h2>
                                        {reportData.aiInsights.is_fallback && (
                                            <span className="ml-3 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded">
                                                Fallback Analysis
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 leading-relaxed">
                                            {reportData.aiInsights.analysis}
                                        </p>
                                    </div>

                                    {/* Key Insights */}
                                    {reportData.aiInsights.keyInsights && reportData.aiInsights.keyInsights.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {reportData.aiInsights.keyInsights.map((insight, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                        <div className="flex items-start">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                                    <ChartBarIcon className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{insight.value}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    {reportData.aiInsights.recommendations && reportData.aiInsights.recommendations.length > 0 && (
                                        <div className="mt-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                                            <div className="space-y-3">
                                                {reportData.aiInsights.recommendations.map((rec, index) => (
                                                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                                        <div className="flex items-start">
                                                            <ExclamationIcon className="h-5 w-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{rec.title}</p>
                                                                <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                                                {rec.priority && (
                                                                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                                                                        rec.priority === 'high' 
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : rec.priority === 'medium'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-green-100 text-green-800'
                                                                    }`}>
                                                                        {rec.priority.toUpperCase()} PRIORITY
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 text-xs text-gray-500">
                                        Generated: {reportData.aiInsights.generatedAt}
                                    </div>
                                </div>
                            )}

                            {/* Report Data Sections */}
                            {reportData.reportData && Object.keys(reportData.reportData).map((sectionKey, index) => {
                                const section = reportData.reportData[sectionKey];
                                if (!section || !Array.isArray(section) || section.length === 0) return null;

                                return (
                                    <div key={sectionKey} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                        <div className="p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                                                {sectionKey.replace(/_/g, ' ')}
                                            </h3>
                                            
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            {Object.keys(section[0]).map(key => (
                                                                <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    {key.replace(/_/g, ' ')}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {section.slice(0, 5).map((item, itemIndex) => (
                                                            <tr key={itemIndex} className="hover:bg-gray-50">
                                                                {Object.entries(item).map(([key, value]) => (
                                                                    <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                        {value}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {section.length > 5 && (
                                                <div className="mt-3 text-sm text-gray-500 text-center py-2 border-t border-gray-200 bg-gray-50">
                                                    Showing 5 of {section.length} items
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12 text-center">
                            <ExclamationIcon className="mx-auto h-12 w-12 text-purple-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No AI-enhanced report available</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Try generating a standard report first, then view the AI-enhanced version.
                            </p>
                            <div className="mt-5 space-x-3">
                                <a
                                    href={`/admin/reports/${reportType}`}
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    View Standard Report
                                </a>
                                <button
                                    onClick={() => fetchAIEnhancedReport()}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    <RefreshIcon className="h-4 w-4 mr-2" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default EnhancedReport;
