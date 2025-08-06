import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AppLayout from '@/Layouts/AppLayout';
import ReportCard from './Components/ReportCard';
import ReportFilter from './Components/ReportFilter';

const ReportIndex = () => {
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
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Reports">
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-6">Reports</h1>
                    
                    {loading ? (
                        <div className="flex justify-center">
                            <div className="spinner">Loading...</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reportTypes.map(report => (
                                <ReportCard key={report.id} report={report} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ReportIndex;
