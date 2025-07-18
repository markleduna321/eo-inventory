import React from 'react'
import Button from '@/app/pages/components/button'

export default function StationsTableSection() {
    const stations = [
        {
            id: 1,
            name: 'Developer Workstation 1',
            code: 'S1-WS-001',
            type: 'Employee Workstation',
            department: 'IT Department',
            location: 'Site 1 - IT Department (3rd Floor)',
            assignedEmployee: 'John Doe',
            deskNumber: 'S1-D-301',
            phoneExtension: '3001',
            networkPort: 'S1-P-001',
            status: 'Occupied'
        },
        {
            id: 2,
            name: 'HR Manager Office',
            code: 'S1-MO-001',
            type: 'Manager Office',
            department: 'Human Resources',
            location: 'Site 1 - HR Department (5th Floor)',
            assignedEmployee: 'Sarah Wilson',
            deskNumber: 'S1-M-501',
            phoneExtension: '5001',
            networkPort: 'S1-P-020',
            status: 'Occupied'
        },
        {
            id: 3,
            name: 'Hot Desk Alpha',
            code: 'S2-HD-001',
            type: 'Hot Desk',
            department: 'Operations',
            location: 'Site 2 - Operations (Ground Floor)',
            assignedEmployee: null,
            deskNumber: 'S2-HD-G01',
            phoneExtension: '2001',
            networkPort: 'S2-P-045',
            status: 'Available'
        },
        {
            id: 4,
            name: 'Reception Desk Main',
            code: 'S3-RD-001',
            type: 'Reception Desk',
            department: 'Administration',
            location: 'Site 3 - Reception (Ground Floor)',
            assignedEmployee: 'Emily Chen',
            deskNumber: 'S3-R-001',
            phoneExtension: '3000',
            networkPort: 'S3-P-010',
            status: 'Occupied'
        },
        {
            id: 5,
            name: 'Executive Office CEO',
            code: 'S1-EO-001',
            type: 'Executive Office',
            department: 'Executive',
            location: 'Site 1 - Executive Floor (10th Floor)',
            assignedEmployee: 'Michael Brown',
            deskNumber: 'S1-E-1001',
            phoneExtension: '1000',
            networkPort: 'S1-P-099',
            status: 'Occupied'
        },
        {
            id: 6,
            name: 'Technical Workbench 1',
            code: 'S2-TW-001',
            type: 'Technical Workbench',
            department: 'IT Department',
            location: 'Site 2 - Laboratory (1st Floor)',
            assignedEmployee: 'Alex Rodriguez',
            deskNumber: 'S2-TW-101',
            phoneExtension: '2101',
            networkPort: 'S2-P-030',
            status: 'Occupied'
        },
        {
            id: 7,
            name: 'Training Station 1',
            code: 'S4-TS-001',
            type: 'Meeting Room Station',
            department: 'Administration',
            location: 'Site 4 - Training Center (2nd Floor)',
            assignedEmployee: null,
            deskNumber: 'S4-TS-201',
            phoneExtension: '4201',
            networkPort: 'S4-P-101',
            status: 'Under Setup'
        },
        {
            id: 8,
            name: 'Finance Analyst Desk',
            code: 'S1-WS-041',
            type: 'Employee Workstation',
            department: 'Finance',
            location: 'Site 1 - Finance Department (4th Floor)',
            assignedEmployee: 'Jessica Liu',
            deskNumber: 'S1-D-401',
            phoneExtension: '4001',
            networkPort: 'S1-P-041',
            status: 'Occupied'
        },
        {
            id: 9,
            name: 'Marketing Hot Desk',
            code: 'S2-HD-002',
            type: 'Hot Desk',
            department: 'Marketing',
            location: 'Site 2 - Marketing (2nd Floor)',
            assignedEmployee: null,
            deskNumber: 'S2-HD-201',
            phoneExtension: '2201',
            networkPort: 'S2-P-061',
            status: 'Available'
        },
        {
            id: 10,
            name: 'Conference Room Manager',
            code: 'S4-CM-001',
            type: 'Manager Office',
            department: 'Administration',
            location: 'Site 4 - Conference Rooms (3rd Floor)',
            assignedEmployee: 'Robert Kim',
            deskNumber: 'S4-M-301',
            phoneExtension: '4301',
            networkPort: 'S4-P-121',
            status: 'Occupied'
        }
    ]

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
        switch (status) {
            case 'Occupied':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Available':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Under Setup':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            case 'Maintenance':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'Reserved':
                return `${baseClasses} bg-purple-100 text-purple-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getTypeBadge = (type) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (type) {
            case 'Employee Workstation':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Manager Office':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Executive Office':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'Hot Desk':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            case 'Meeting Room Station':
                return `${baseClasses} bg-orange-100 text-orange-800`
            case 'Reception Desk':
                return `${baseClasses} bg-indigo-100 text-indigo-800`
            case 'Technical Workbench':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>All Workstations</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search stations..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Types</option>
                        <option value="employee">Employee Workstation</option>
                        <option value="manager">Manager Office</option>
                        <option value="executive">Executive Office</option>
                        <option value="hotdesk">Hot Desk</option>
                        <option value="reception">Reception Desk</option>
                        <option value="technical">Technical Workbench</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Departments</option>
                        <option value="it">IT Department</option>
                        <option value="hr">Human Resources</option>
                        <option value="finance">Finance</option>
                        <option value="marketing">Marketing</option>
                        <option value="operations">Operations</option>
                        <option value="admin">Administration</option>
                        <option value="executive">Executive</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Status</option>
                        <option value="occupied">Occupied</option>
                        <option value="available">Available</option>
                        <option value="setup">Under Setup</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="reserved">Reserved</option>
                    </select>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200'>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Station</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Type</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Department</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Assigned Employee</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Desk/Phone</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Network Port</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stations.map((station) => (
                            <tr key={station.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='font-medium text-gray-900'>{station.name}</div>
                                        <div className='text-sm text-gray-500'>{station.code}</div>
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getTypeBadge(station.type)}>
                                        {station.type}
                                    </span>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{station.department}</td>
                                <td className='py-3 px-4'>
                                    {station.assignedEmployee ? (
                                        <div className='text-gray-900 font-medium'>{station.assignedEmployee}</div>
                                    ) : (
                                        <div className='text-gray-400 italic'>Unassigned</div>
                                    )}
                                </td>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='text-gray-900'>{station.deskNumber}</div>
                                        <div className='text-sm text-gray-500'>Ext: {station.phoneExtension}</div>
                                    </div>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{station.networkPort}</td>
                                <td className='py-3 px-4'>
                                    <span className={getStatusBadge(station.status)}>
                                        {station.status}
                                    </span>
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
                                        <Button
                                            type='button'
                                            variant='primary'
                                            size='sm'
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='danger'
                                            size='sm'
                                        >
                                            Delete
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
