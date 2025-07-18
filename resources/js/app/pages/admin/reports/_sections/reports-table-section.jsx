import React from 'react'
import Button from '@/app/pages/components/button'

export default function ReportsTableSection() {
    const reports = [
        {
            id: 1,
            name: 'Asset Inventory Report',
            description: 'Complete list of all assets in the system',
            type: 'Inventory',
            lastGenerated: '2025-07-15',
            status: 'Ready',
            fileSize: '2.4 MB'
        },
        {
            id: 2,
            name: 'Asset Utilization Report',
            description: 'Usage statistics and deployment status',
            type: 'Analytics',
            lastGenerated: '2025-07-14',
            status: 'Ready',
            fileSize: '1.8 MB'
        },
        {
            id: 3,
            name: 'Maintenance Schedule Report',
            description: 'Upcoming and overdue maintenance tasks',
            type: 'Maintenance',
            lastGenerated: '2025-07-12',
            status: 'Ready',
            fileSize: '956 KB'
        },
        {
            id: 4,
            name: 'Financial Summary Report',
            description: 'Asset values and depreciation overview',
            type: 'Financial',
            lastGenerated: '2025-07-10',
            status: 'Generating',
            fileSize: '-'
        },
        {
            id: 5,
            name: 'Compliance Audit Report',
            description: 'Regulatory compliance and documentation status',
            type: 'Compliance',
            lastGenerated: '2025-07-08',
            status: 'Ready',
            fileSize: '3.2 MB'
        }
    ]

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
            case 'Compliance':
                return `${baseClasses} bg-indigo-100 text-indigo-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>Available Reports</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search reports..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Types</option>
                        <option value="inventory">Inventory</option>
                        <option value="analytics">Analytics</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="financial">Financial</option>
                        <option value="compliance">Compliance</option>
                    </select>
                </div>
            </div>

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
                        {reports.map((report) => (
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
                                    <span className={getStatusBadge(report.status)}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{report.fileSize}</td>
                                <td className='py-3 px-4'>
                                    <div className='flex gap-2'>
                                        {report.status === 'Ready' && (
                                            <>
                                                <Button
                                                    type='button'
                                                    variant='secondary'
                                                    size='sm'
                                                >
                                                    Download
                                                </Button>
                                                <Button
                                                    type='button'
                                                    variant='primary'
                                                    size='sm'
                                                >
                                                    View
                                                </Button>
                                            </>
                                        )}
                                        {report.status === 'Generating' && (
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
                                        >
                                            Regenerate
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
