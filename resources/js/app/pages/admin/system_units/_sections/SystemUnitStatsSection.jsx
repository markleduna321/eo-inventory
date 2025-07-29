import React, { useState, useEffect } from 'react';
import { ComputerDesktopIcon, CheckCircleIcon, ArrowRightCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export default function SystemUnitStatsSection() {
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        assigned: 0,
        customBuilt: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/system-units/stats', {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch system unit stats');
            }

            // Get the stats directly from the stats API
            const data = await response.json();
            console.log('Raw API response:', data);
            
            // Make sure all required properties exist
            setStats({
                total: data.total || 0,
                available: data.available || 0,
                assigned: data.assigned || 0,
                customBuilt: data.customBuilt || 0
            });
            
            setLoading(false);
        } catch (error) {
            console.error('Error fetching system unit stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-100 animate-pulse rounded-lg p-6 h-24"></div>
                ))}
            </div>
        );
    }

    // Log stats for debugging
    console.log('Stats received from API:', stats);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Total Systems */}
            <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="text-blue-600 text-sm font-medium">Total Systems</p>
                    <p className="text-2xl font-semibold text-blue-900">{stats.total || 0}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                    <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
                </div>
            </div>

            {/* Available */}
            <div className="bg-green-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="text-green-600 text-sm font-medium">Available</p>
                    <p className="text-2xl font-semibold text-green-900">{stats.available || 0}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
            </div>

            {/* Assigned */}
            <div className="bg-yellow-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="text-yellow-600 text-sm font-medium">Assigned</p>
                    <p className="text-2xl font-semibold text-yellow-900">{stats.assigned || 0}</p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                    <ArrowRightCircleIcon className="h-6 w-6 text-yellow-600" />
                </div>
            </div>

            {/* Custom Built */}
            <div className="bg-purple-50 rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="text-purple-600 text-sm font-medium">Custom Built</p>
                    <p className="text-2xl font-semibold text-purple-900">{stats.customBuilt || 0}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                    <CpuChipIcon className="h-6 w-6 text-purple-600" />
                </div>
            </div>
        </div>
    );
}
