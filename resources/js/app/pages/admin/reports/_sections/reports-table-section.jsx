import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { Link } from '@inertiajs/react'
import { ChartBarIcon, DocumentTextIcon, ChartPieIcon, CurrencyDollarIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'

export default function ReportsTableSection() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [generatingReportId, setGeneratingReportId] = useState(null);
    
    useEffect(() => {
        fetchReports();
    }, []);
    
    // Get the appropriate icon for each report type
    const getReportIcon = (type) => {
        switch (type) {
            case 'Inventory':
                return <DocumentTextIcon className="h-8 w-8 text-blue-500" />;
            case 'Analytics':
                return <ChartBarIcon className="h-8 w-8 text-purple-500" />;
            case 'Maintenance':
                return <ClockIcon className="h-8 w-8 text-orange-500" />;
            case 'Financial':
                return <CurrencyDollarIcon className="h-8 w-8 text-emerald-500" />;
            case 'Location':
                return <MapPinIcon className="h-8 w-8 text-cyan-500" />;
            case 'Transaction':
                return <ChartPieIcon className="h-8 w-8 text-pink-500" />;
            default:
                return <DocumentTextIcon className="h-8 w-8 text-gray-500" />;
        }
    };
    
    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reports');
            
            if (response.data && response.data.reports) {
                const reportsWithStatus = response.data.reports.map(report => ({
                    ...report,
                    lastGenerated: '2025-07-31', // This would come from the API in a real implementation
                    status: 'Ready',
                    fileSize: '1.2 MB' // This would come from the API in a real implementation
                }));
                setReports(reportsWithStatus);
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
        switch (status) {
            case 'Ready':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Generating':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'Failed':
                return `${baseClasses} bg-red-100 text-red-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getTypeBadge = (type) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (type) {
            case 'Inventory':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Analytics':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Maintenance':
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 'Financial':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            case 'Location':
                return `${baseClasses} bg-cyan-100 text-cyan-800`
            case 'Transaction':
                return `${baseClasses} bg-pink-100 text-pink-800`
            case 'Compliance':
                return `${baseClasses} bg-indigo-100 text-indigo-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }
    
    const handleViewReport = async (reportId) => {
        try {
            const report = reports.find(r => r.id === reportId);
            if (!report) return;
            
            const response = await axios.get(`/api/reports/${report.id}`);
            
            if (response.data) {
                // You could open a modal here or redirect to a details page
                // For now, we'll just show the data in an alert
                toast.success(`Viewing report: ${report.name}`);
                
                // Open in new window to view JSON data
                const newWindow = window.open('', '_blank');
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>${report.name}</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
                            </style>
                        </head>
                        <body>
                            <h1>${report.name}</h1>
                            <pre>${JSON.stringify(response.data, null, 2)}</pre>
                        </body>
                    </html>
                `);
            }
        } catch (error) {
            console.error('Failed to view report:', error);
            toast.error('Failed to view report. Please try again.');
        }
    };
    
    const handleDownloadReport = async (reportId) => {
        try {
            const report = reports.find(r => r.id === reportId);
            if (!report) return;
            
            // Open the export endpoint in a new tab
            window.open(`/api/reports/${report.id}/export`, '_blank');
            toast.success(`Downloading report: ${report.name}`);
        } catch (error) {
            console.error('Failed to download report:', error);
            toast.error('Failed to download report. Please try again.');
        }
    };
    
    const handleRegenerateReport = async (reportId) => {
        try {
            const report = reports.find(r => r.id === reportId);
            if (!report) return;
            
            setGeneratingReportId(reportId);
            
            const response = await axios.get(`/api/reports/${report.id}`);
            
            if (response.data) {
                toast.success(`Report regenerated: ${report.name}`);
                
                // Update the report's lastGenerated date
                const updatedReports = reports.map(r => 
                    r.id === reportId 
                        ? {...r, lastGenerated: new Date().toISOString().split('T')[0]} 
                        : r
                );
                setReports(updatedReports);
            }
        } catch (error) {
            console.error('Failed to regenerate report:', error);
            toast.error('Failed to regenerate report. Please try again.');
        } finally {
            setGeneratingReportId(null);
        }
    };

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-semibold text-gray-800'>Available Reports</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select 
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Analytics">Analytics</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Financial">Financial</option>
                        <option value="Transaction">Transaction</option>
                        <option value="Location">Location</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className='flex justify-center items-center py-10'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
                </div>
            ) : (
                <>
                    {/* Card View for Reports - Modern UI */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
                        {reports
                            .filter(report => 
                                (report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                report.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                                (typeFilter === '' || report.type === typeFilter)
                            )
                            .map((report) => (
                                <div key={report.id} className='bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
                                    <div className='p-5'>
                                        <div className='flex items-start space-x-4'>
                                            <div className='p-3 bg-gray-50 rounded-lg'>
                                                {getReportIcon(report.type)}
                                            </div>
                                            <div>
                                                <h3 className='text-lg font-semibold text-gray-900 mb-1'>{report.name}</h3>
                                                <span className={getTypeBadge(report.type)}>
                                                    {report.type}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <p className='text-gray-600 mt-3 text-sm'>{report.description}</p>
                                        
                                        <div className='flex justify-between items-center mt-4 text-xs text-gray-500'>
                                            <div>Last generated: {report.lastGenerated}</div>
                                            <span className={getStatusBadge(
                                                generatingReportId === report.id ? 'Generating' : report.status
                                            )}>
                                                {generatingReportId === report.id ? 'Generating' : report.status}
                                            </span>
                                        </div>
                                        
                                        <div className='grid grid-cols-2 gap-3 mt-5'>
                                            <Link 
                                                href={`/admin/reports/${report.id}`} 
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-3 rounded-md text-center text-sm font-medium transition-colors"
                                            >
                                                Standard Report
                                            </Link>
                                            <Link 
                                                href={`/admin/reports/${report.id}/ai-enhanced`} 
                                                className="bg-purple-100 hover:bg-purple-200 text-purple-700 py-2 px-3 rounded-md text-center text-sm font-medium transition-colors"
                                            >
                                                AI-Enhanced
                                            </Link>
                                        </div>
                                        
                                        <div className='flex justify-between mt-3'>
                                            <Button
                                                type='button'
                                                variant='secondary'
                                                size='sm'
                                                onClick={() => handleDownloadReport(report.id)}
                                                className="flex-1 mr-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                                Download
                                            </Button>
                                            <Button
                                                type='button'
                                                variant='success'
                                                size='sm'
                                                disabled={generatingReportId === report.id}
                                                onClick={() => handleRegenerateReport(report.id)}
                                                className="flex-1 ml-1 bg-green-600 hover:bg-green-700 text-white shadow-sm flex items-center justify-center"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                </svg>
                                                {generatingReportId === report.id ? 'Generating...' : 'Regenerate'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                    
                    {reports.filter(report => 
                        (report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        report.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (typeFilter === '' || report.type === typeFilter)
                    ).length === 0 && (
                        <div className="py-8 text-center">
                            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">No reports found</h3>
                            <p className="mt-1 text-sm text-gray-500">No reports match your current filter criteria.</p>
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setTypeFilter('');
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
