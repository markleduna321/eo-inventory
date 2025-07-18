import React from 'react'
import Button from '@/app/pages/components/button'

export default function RequestsTableSection() {
    const requests = [
        {
            id: 1,
            requestId: 'REQ-001',
            requesterName: 'John Doe',
            employeeId: 'EMP-001',
            department: 'IT Department',
            requestType: 'New Asset Request',
            assetCategory: 'Laptop',
            priority: 'High',
            dateRequested: '2025-07-15',
            dateNeeded: '2025-07-20',
            budgetEstimate: 1500.00,
            status: 'Pending Approval',
            assignedTo: 'IT Manager'
        },
        {
            id: 2,
            requestId: 'REQ-002',
            requesterName: 'Sarah Wilson',
            employeeId: 'EMP-002',
            department: 'Marketing',
            requestType: 'Asset Replacement',
            assetCategory: 'Monitor',
            priority: 'Normal',
            dateRequested: '2025-07-14',
            dateNeeded: '2025-07-25',
            budgetEstimate: 300.00,
            status: 'Approved',
            assignedTo: 'Asset Manager'
        },
        {
            id: 3,
            requestId: 'REQ-003',
            requesterName: 'Mike Davis',
            employeeId: 'EMP-003',
            department: 'Finance',
            requestType: 'Asset Repair',
            assetCategory: 'System Unit',
            priority: 'Urgent',
            dateRequested: '2025-07-13',
            dateNeeded: '2025-07-16',
            budgetEstimate: 200.00,
            status: 'In Progress',
            assignedTo: 'Tech Support'
        },
        {
            id: 4,
            requestId: 'REQ-004',
            requesterName: 'Emily Chen',
            employeeId: 'EMP-004',
            department: 'Human Resources',
            requestType: 'New Asset Request',
            assetCategory: 'Peripherals',
            priority: 'Low',
            dateRequested: '2025-07-12',
            dateNeeded: '2025-08-01',
            budgetEstimate: 150.00,
            status: 'Completed',
            assignedTo: 'Asset Manager'
        },
        {
            id: 5,
            requestId: 'REQ-005',
            requesterName: 'Tom Wilson',
            employeeId: 'EMP-005',
            department: 'Operations',
            requestType: 'Asset Transfer',
            assetCategory: 'Monitor',
            priority: 'Normal',
            dateRequested: '2025-07-11',
            dateNeeded: '2025-07-18',
            budgetEstimate: 0.00,
            status: 'Rejected',
            assignedTo: 'Department Head'
        }
    ]

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
        switch (status) {
            case 'Pending Approval':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'Approved':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'In Progress':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Completed':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            case 'Rejected':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'On Hold':
                return `${baseClasses} bg-gray-100 text-gray-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getPriorityBadge = (priority) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (priority) {
            case 'Critical':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'Urgent':
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 'High':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'Normal':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Low':
                return `${baseClasses} bg-gray-100 text-gray-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getTypeBadge = (type) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (type) {
            case 'New Asset Request':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Asset Replacement':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Asset Repair':
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 'Asset Transfer':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Asset Return':
                return `${baseClasses} bg-indigo-100 text-indigo-800`
            case 'Asset Upgrade':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>Asset Requests</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Departments</option>
                        <option value="it">IT Department</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="marketing">Marketing</option>
                        <option value="operations">Operations</option>
                    </select>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200'>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Request ID</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Requester</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Type</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Asset Category</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Priority</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Date Needed</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Budget</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map((request) => (
                            <tr key={request.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                <td className='py-3 px-4'>
                                    <div className='font-medium text-blue-600'>{request.requestId}</div>
                                    <div className='text-sm text-gray-500'>{request.dateRequested}</div>
                                </td>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='font-medium text-gray-900'>{request.requesterName}</div>
                                        <div className='text-sm text-gray-500'>{request.employeeId} • {request.department}</div>
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getTypeBadge(request.requestType)}>
                                        {request.requestType}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{request.assetCategory}</td>
                                <td className='py-3 px-4'>
                                    <span className={getPriorityBadge(request.priority)}>
                                        {request.priority}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{request.dateNeeded}</td>
                                <td className='py-3 px-4'>
                                    <div className='font-medium text-gray-900'>
                                        ${request.budgetEstimate.toFixed(2)}
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getStatusBadge(request.status)}>
                                        {request.status}
                                    </span>
                                    <div className='text-xs text-gray-500 mt-1'>
                                        Assigned to: {request.assignedTo}
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <div className='flex gap-2'>
                                        <Button
                                            type='button'
                                            variant='secondary'
                                            size='sm'
                                        >
                                            View
                                        </Button>
                                        {request.status === 'Pending Approval' && (
                                            <>
                                                <Button
                                                    type='button'
                                                    variant='success'
                                                    size='sm'
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    type='button'
                                                    variant='danger'
                                                    size='sm'
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                        {request.status === 'Approved' && (
                                            <Button
                                                type='button'
                                                variant='primary'
                                                size='sm'
                                            >
                                                Process
                                            </Button>
                                        )}
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
