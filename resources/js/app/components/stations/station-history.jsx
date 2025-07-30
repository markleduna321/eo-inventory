import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
    ClockIcon, 
    DocumentTextIcon, 
    ComputerDesktopIcon, 
    DeviceTabletIcon, 
    ExclamationTriangleIcon,
    WrenchIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function StationHistory({ stationId }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/stations/${stationId}/history`);
                setHistory(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load station history');
                setLoading(false);
                console.error('Error fetching station history:', err);
            }
        };

        if (stationId) {
            fetchHistory();
        }
    }, [stationId]);

    const getActionIcon = (action) => {
        switch (action) {
            case 'create':
                return <DocumentTextIcon className="w-5 h-5 text-green-500" />;
            case 'update':
                return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
            case 'bind':
                return <ComputerDesktopIcon className="w-5 h-5 text-indigo-500" />;
            case 'unbind':
                return <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getAssetIcon = (assetType) => {
        switch (assetType?.toLowerCase()) {
            case 'monitor':
                return <DeviceTabletIcon className="w-4 h-4 text-blue-500" />;
            case 'system_unit':
                return <ComputerDesktopIcon className="w-4 h-4 text-purple-500" />;
            case 'peripheral':
                return <DeviceTabletIcon className="w-4 h-4 text-orange-500" />;
            default:
                return null;
        }
    };
    
    const getReasonBadge = (reason) => {
        if (!reason) return null;
        
        switch (reason) {
            case 'Damaged':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        Damaged
                    </span>
                );
            case 'For Repair':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                        <WrenchIcon className="w-3 h-3 mr-1" />
                        For Repair
                    </span>
                );
            case 'Replace New':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <ArrowPathIcon className="w-3 h-3 mr-1" />
                        Replace New
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="py-4 text-center text-gray-500">
                <p>Loading history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-4 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Timeline */}
            <div className="flow-root">
                <ul className="-mb-8">
                    {history.map((item, itemIdx) => (
                        <li key={item.id}>
                            <div className="relative pb-8">
                                {itemIdx !== history.length - 1 ? (
                                    <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    {/* Timeline icon */}
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                            {getActionIcon(item.action)}
                                        </div>
                                    </div>
                                    
                                    {/* Timeline content */}
                                    <div className="min-w-0 flex-1 py-1.5">
                                        <div className="text-sm text-gray-500">
                                            <div className="font-medium text-gray-900 mb-1">
                                                {item.action_label}
                                                {item.asset && (
                                                    <span className="font-normal text-gray-700">
                                                        {' - '}
                                                        <span className="inline-flex items-center">
                                                            {getAssetIcon(item.asset.type)}
                                                            <span className="ml-1">
                                                                {item.asset.type}
                                                            </span>
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Asset details */}
                                            {item.asset && (
                                                <p className="text-sm text-gray-700 mb-1">
                                                    {item.asset.name}
                                                    {item.asset.serial && (
                                                        <span className="text-gray-500 ml-2">
                                                            (S/N: {item.asset.serial})
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                            
                                            {/* Reason for unbinding */}
                                            {item.reason && (
                                                <div className="mt-1 mb-1">
                                                    {getReasonBadge(item.reason)}
                                                </div>
                                            )}
                                            
                                            {/* Notes */}
                                            {item.notes && (
                                                <p className="text-gray-600 italic text-xs mt-1">
                                                    "{item.notes}"
                                                </p>
                                            )}
                                            
                                            {/* Timestamp */}
                                            <span className="text-xs text-gray-400 mt-1 block">
                                                {item.formatted_date}
                                                {item.user && ` • ${item.user.name}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                
                {history.length === 0 && (
                    <p className="text-gray-500 text-center py-6">No history records found.</p>
                )}
            </div>
        </div>
    );
}
