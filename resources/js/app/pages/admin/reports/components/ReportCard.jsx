import React from 'react';
import { Link } from '@inertiajs/react';

const ReportCard = ({ report }) => {
    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{report.name}</h2>
                <p className="text-gray-600 mb-4">{report.description}</p>
                <div className="flex flex-col space-y-2">
                    <Link href={`/admin/reports/${report.id}`} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded text-center">
                        View Standard Report
                    </Link>
                    <Link href={`/admin/reports/${report.id}/ai-enhanced`} className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded text-center">
                        View AI-Enhanced Report
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ReportCard;
