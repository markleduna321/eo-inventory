import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../layout';
import { Link } from '@inertiajs/react';
import ReportCard from '../components/ReportCard';

const AIReportIndex = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    const reportTypes = [
        { id: 'asset-inventory', name: 'Asset Inventory', description: 'Overview of all assets in the system' },
        { id: 'asset-utilization', name: 'Asset Utilization', description: 'Analysis of how assets are being used' },
        { id: 'financial', name: 'Financial', description: 'Financial overview of assets and inventory' },
        { id: 'maintenance', name: 'Maintenance', description: 'Maintenance status and history' },
        { id: 'location-based', name: 'Location Based', description: 'Assets organized by location' },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/reports');
            setReports(response.data.reports || reportTypes);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
            setReports(reportTypes);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">AI-Enhanced Reports</h1>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 mb-8">
                        <div className="flex items-start">
                            <div className="bg-purple-100 rounded-full p-3 mr-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-medium text-purple-700 mb-2">AI-Powered Inventory Insights</h2>
                                <p className="text-gray-600">
                                    Get intelligent analysis of your inventory data, including trends, recommendations, 
                                    and predictive insights. Our AI-enhanced reports help you make data-driven decisions
                                    and optimize your inventory management.
                                </p>
                                <div className="mt-4 flex flex-wrap gap-3">
                                    <Link href="/admin/reports/ask-ai" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                                        Ask AI a Question
                                    </Link>
                                    <a href="/AI_REPORTING_DOCS.md" target="_blank" className="inline-flex items-center px-4 py-2 border border-purple-300 text-sm font-medium rounded-md shadow-sm text-purple-700 bg-white hover:bg-purple-50">
                                        View Documentation
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="spinner">Loading...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reports.map(report => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AIReportIndex;
