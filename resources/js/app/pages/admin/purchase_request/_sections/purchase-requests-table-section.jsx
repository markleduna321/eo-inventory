import React from 'react'
import Button from '@/app/pages/components/button'

export default function PurchaseRequestsTableSection() {
    const purchaseRequests = [
        {
            id: 1,
            requestId: 'PR-001',
            itemName: 'Dell Latitude 5530 Laptop',
            category: 'Computer Hardware',
            quantity: 5,
            unitPrice: 1299.00,
            totalAmount: 6495.00,
            department: 'IT Department',
            requestedBy: 'John Smith',
            priority: 'High',
            preferredSupplier: 'Dell Technologies',
            deliveryDate: '2025-08-15',
            budgetCode: 'IT-2025-Q3',
            dateRequested: '2025-07-15',
            status: 'Pending Approval'
        },
        {
            id: 2,
            requestId: 'PR-002',
            itemName: 'Office Chairs (Ergonomic)',
            category: 'Furniture',
            quantity: 10,
            unitPrice: 450.00,
            totalAmount: 4500.00,
            department: 'Human Resources',
            requestedBy: 'Sarah Wilson',
            priority: 'Normal',
            preferredSupplier: 'Other',
            deliveryDate: '2025-08-30',
            budgetCode: 'HR-2025-Q3',
            dateRequested: '2025-07-14',
            status: 'Approved'
        },
        {
            id: 3,
            requestId: 'PR-003',
            itemName: 'Cisco Network Switch',
            category: 'Network Equipment',
            quantity: 2,
            unitPrice: 2500.00,
            totalAmount: 5000.00,
            department: 'IT Department',
            requestedBy: 'Mike Davis',
            priority: 'Urgent',
            preferredSupplier: 'CDW',
            deliveryDate: '2025-07-25',
            budgetCode: 'IT-2025-INFRA',
            dateRequested: '2025-07-13',
            status: 'In Progress'
        },
        {
            id: 4,
            requestId: 'PR-004',
            itemName: 'Microsoft Office 365 Licenses',
            category: 'Software Licenses',
            quantity: 50,
            unitPrice: 12.50,
            totalAmount: 625.00,
            department: 'Administration',
            requestedBy: 'Emily Chen',
            priority: 'Normal',
            preferredSupplier: 'Microsoft',
            deliveryDate: '2025-08-01',
            budgetCode: 'ADMIN-2025-SW',
            dateRequested: '2025-07-12',
            status: 'Ordered'
        },
        {
            id: 5,
            requestId: 'PR-005',
            itemName: 'Standing Desk Converters',
            category: 'Office Equipment',
            quantity: 8,
            unitPrice: 299.00,
            totalAmount: 2392.00,
            department: 'Operations',
            requestedBy: 'Tom Wilson',
            priority: 'Low',
            preferredSupplier: 'Amazon Business',
            deliveryDate: '2025-09-15',
            budgetCode: 'OPS-2025-Q4',
            dateRequested: '2025-07-11',
            status: 'Rejected'
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
            case 'Ordered':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Delivered':
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

    const getCategoryBadge = (category) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (category) {
            case 'Computer Hardware':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Office Equipment':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Network Equipment':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Software Licenses':
                return `${baseClasses} bg-indigo-100 text-indigo-800`
            case 'Furniture':
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 'Mobile Devices':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>Purchase Requests</h2>
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
                        <option value="ordered">Ordered</option>
                        <option value="delivered">Delivered</option>
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
                        <option value="">All Categories</option>
                        <option value="computer_hardware">Computer Hardware</option>
                        <option value="office_equipment">Office Equipment</option>
                        <option value="network_equipment">Network Equipment</option>
                        <option value="software_licenses">Software Licenses</option>
                        <option value="furniture">Furniture</option>
                    </select>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200'>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Request ID</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Item Details</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Category</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Quantity</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Total Amount</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Priority</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Delivery Date</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchaseRequests.map((request) => (
                            <tr key={request.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                <td className='py-3 px-4'>
                                    <div className='font-medium text-blue-600'>{request.requestId}</div>
                                    <div className='text-sm text-gray-500'>{request.dateRequested}</div>
                                </td>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='font-medium text-gray-900'>{request.itemName}</div>
                                        <div className='text-sm text-gray-500'>
                                            {request.department} • {request.requestedBy}
                                        </div>
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getCategoryBadge(request.category)}>
                                        {request.category}
                                    </span>
                                </td>
                                <td className='py-3 px-4'>
                                    <div className='font-medium text-gray-900'>{request.quantity}</div>
                                    <div className='text-sm text-gray-500'>
                                        ${request.unitPrice.toFixed(2)} each
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <div className='font-medium text-gray-900'>
                                        ${request.totalAmount.toFixed(2)}
                                    </div>
                                    <div className='text-sm text-gray-500'>
                                        {request.budgetCode}
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getPriorityBadge(request.priority)}>
                                        {request.priority}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{request.deliveryDate}</td>
                                <td className='py-3 px-4'>
                                    <span className={getStatusBadge(request.status)}>
                                        {request.status}
                                    </span>
                                    <div className='text-xs text-gray-500 mt-1'>
                                        Supplier: {request.preferredSupplier}
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
                                                Order
                                            </Button>
                                        )}
                                        {request.status === 'Ordered' && (
                                            <Button
                                                type='button'
                                                variant='success'
                                                size='sm'
                                            >
                                                Mark Delivered
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
