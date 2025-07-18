import React from 'react'
import Button from '@/app/pages/components/button'

export default function LocationsTableSection() {
    const locations = [
        {
            id: 1,
            name: 'IT Department',
            code: 'S1-IT-001',
            type: 'Office',
            building: 'Site 1 - Main Campus',
            floor: '3rd Floor',
            room: '301',
            capacity: 30,
            currentItems: 24,
            manager: 'John Smith',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Executive Conference Room',
            code: 'S1-CR-001',
            type: 'Conference',
            building: 'Site 1 - Main Campus',
            floor: '10th Floor',
            room: '1001',
            capacity: 20,
            currentItems: 15,
            manager: 'Sarah Johnson',
            status: 'Active'
        },
        {
            id: 3,
            name: 'Storage Room North',
            code: 'S2-STR-001',
            type: 'Storage',
            building: 'Site 2 - North Building',
            floor: 'Ground Floor',
            room: 'G-001',
            capacity: 150,
            currentItems: 128,
            manager: 'Mike Davis',
            status: 'Active'
        },
        {
            id: 4,
            name: 'Data Center Primary',
            code: 'S3-DC-001',
            type: 'Data Center',
            building: 'Site 3 - South Building',
            floor: 'Basement Level 1',
            room: 'B1-001',
            capacity: 200,
            currentItems: 187,
            manager: 'Emily Chen',
            status: 'Active'
        },
        {
            id: 5,
            name: 'HR Department',
            code: 'S1-HR-001',
            type: 'Office',
            building: 'Site 1 - Main Campus',
            floor: '5th Floor',
            room: '501',
            capacity: 25,
            currentItems: 18,
            manager: 'Tom Wilson',
            status: 'Active'
        },
        {
            id: 6,
            name: 'Training Center A',
            code: 'S4-TC-001',
            type: 'Conference',
            building: 'Site 4 - West Building',
            floor: '2nd Floor',
            room: '201',
            capacity: 40,
            currentItems: 32,
            manager: 'Lisa Brown',
            status: 'Active'
        },
        {
            id: 7,
            name: 'Backup Storage',
            code: 'S3-STR-002',
            type: 'Storage',
            building: 'Site 3 - South Building',
            floor: 'Basement Level 2',
            room: 'B2-005',
            capacity: 100,
            currentItems: 45,
            manager: 'David Lee',
            status: 'Active'
        },
        {
            id: 8,
            name: 'Workshop Laboratory',
            code: 'S2-LAB-001',
            type: 'Laboratory',
            building: 'Site 2 - North Building',
            floor: '1st Floor',
            room: '105',
            capacity: 60,
            currentItems: 52,
            manager: 'Anna Martinez',
            status: 'Active'
        }
    ]

    const getStatusBadge = (status) => {
        const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
        switch (status) {
            case 'Active':
                return `${baseClasses} bg-green-100 text-green-800`
            case 'Inactive':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'Maintenance':
                return `${baseClasses} bg-yellow-100 text-yellow-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getTypeBadge = (type) => {
        const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
        switch (type) {
            case 'Office':
                return `${baseClasses} bg-blue-100 text-blue-800`
            case 'Storage':
                return `${baseClasses} bg-purple-100 text-purple-800`
            case 'Conference':
                return `${baseClasses} bg-emerald-100 text-emerald-800`
            case 'Data Center':
                return `${baseClasses} bg-red-100 text-red-800`
            case 'Workshop':
                return `${baseClasses} bg-orange-100 text-orange-800`
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`
        }
    }

    const getCapacityColor = (current, total) => {
        const percentage = (current / total) * 100
        if (percentage >= 90) return 'text-red-600 font-semibold'
        if (percentage >= 75) return 'text-yellow-600 font-semibold'
        return 'text-green-600 font-semibold'
    }

    return (
        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-gray-800'>All Locations</h2>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        placeholder="Search locations..."
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Types</option>
                        <option value="office">Office</option>
                        <option value="storage">Storage</option>
                        <option value="conference">Conference</option>
                        <option value="datacenter">Data Center</option>
                        <option value="workshop">Workshop</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Sites</option>
                        <option value="site_1">Site 1 - Main Campus</option>
                        <option value="site_2">Site 2 - North Building</option>
                        <option value="site_3">Site 3 - South Building</option>
                        <option value="site_4">Site 4 - West Building</option>
                    </select>
                </div>
            </div>

            <div className='overflow-x-auto'>
                <table className='w-full border-collapse'>
                    <thead>
                        <tr className='border-b border-gray-200'>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Location</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Type</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Site & Floor</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Room</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Capacity</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Manager</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Status</th>
                            <th className='text-left py-3 px-4 font-semibold text-gray-700'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {locations.map((location) => (
                            <tr key={location.id} className='border-b border-gray-100 hover:bg-gray-50 transition-colors'>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='font-medium text-gray-900'>{location.name}</div>
                                        <div className='text-sm text-gray-500'>{location.code}</div>
                                    </div>
                                </td>
                                <td className='py-3 px-4'>
                                    <span className={getTypeBadge(location.type)}>
                                        {location.type}
                                    </span>
                                </td>
                                <td className='py-3 px-4'>
                                    <div>
                                        <div className='text-gray-900'>{location.building}</div>
                                        <div className='text-sm text-gray-500'>{location.floor}</div>
                                    </div>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{location.room}</td>
                                <td className='py-3 px-4'>
                                    <div className={getCapacityColor(location.currentItems, location.capacity)}>
                                        {location.currentItems}/{location.capacity}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                        {Math.round((location.currentItems / location.capacity) * 100)}% used
                                    </div>
                                </td>
                                <td className='py-3 px-4 text-gray-600'>{location.manager}</td>
                                <td className='py-3 px-4'>
                                    <span className={getStatusBadge(location.status)}>
                                        {location.status}
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
