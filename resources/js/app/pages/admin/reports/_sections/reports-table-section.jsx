import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import axios from 'axios'
import { toast } from 'react-hot-toast'

export default function ReportsTableSection() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [generatingReportId, setGeneratingReportId] = useState(null);
    
    useEffect(() => {
        fetchReports();
    }, []);
    
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
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>Available Reports</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select 
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className='overflow-x-auto'>
                    <table className='w-full border-collapse'>
                        <thead>
                            <tr className='border-b border-gray-200'>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>Report Name</th>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>Type</th>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>Last Generated</th>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>File Size</th>
                                <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports
                                .filter(report => 
                                    (report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    report.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                                    (typeFilter === '' || report.type === typeFilter)
                                )
                                .map((report) => (
                                <tr key={report.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                    <td className='py-3 px-4'>
                                        <div>
                                            <div className='font-medium text-gray-900'>{report.name}</div>
                                            <div className='text-sm text-gray-500'>{report.description}</div>
                                        </div>
                                    </td>
                                    <td className='py-3 px-4'>
                                        <span className={getTypeBadge(report.type)}>
                                            {report.type}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4 text-gray-600'>{report.lastGenerated}</td>
                                    <td className='py-3 px-4'>
                                        <span className={getStatusBadge(
                                            generatingReportId === report.id ? 'Generating' : report.status
                                        )}>
                                            {generatingReportId === report.id ? 'Generating' : report.status}
                                        </span>
                                    </td>
                                    <td className='py-3 px-4 text-gray-600'>{report.fileSize}</td>
                                    <td className='py-3 px-4'>
                                        <div className='flex gap-2'>
                                            {generatingReportId !== report.id && report.status === 'Ready' && (
                                                <>
                                                    <Button
                                                        type='button'
                                                        variant='secondary'
                                                        size='sm'
                                                        onClick={() => handleDownloadReport(report.id)}
                                                    >
                                                        Download
                                                    </Button>
                                                    <Button
                                                        type='button'
                                                        variant='primary'
                                                        size='sm'
                                                        onClick={() => handleViewReport(report.id)}
                                                    >
                                                        View
                                                    </Button>
                                                </>
                                            )}
                                            {generatingReportId === report.id && (
                                                <Button
                                                    type='button'
                                                    variant='secondary'
                                                    size='sm'
                                                    disabled
                                                >
                                                    Generating...
                                                </Button>
                                            )}
                                            <Button
                                                type='button'
                                                variant='success'
                                                size='sm'
                                                disabled={generatingReportId === report.id}
                                                onClick={() => handleRegenerateReport(report.id)}
                                            >
                                                Regenerate
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {reports.filter(report => 
                                (report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                report.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
                                (typeFilter === '' || report.type === typeFilter)
                            ).length === 0 && (
                                <tr>
                                    <td colSpan="6" className="py-4 text-center text-gray-500">
                                        No reports found matching your criteria
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
