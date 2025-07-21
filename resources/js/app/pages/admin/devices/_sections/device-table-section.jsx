import Button from '@/app/pages/components/button'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import TableFilter from '@/app/pages/components/table-filter'
import { ArrowDownCircleIcon, PrinterIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { get_devices_thunk, delete_device_thunk } from '../_redux/devices-thunk'
import { setSelectedDevice, clearSelectedDevice } from '../_redux/devices-slice'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import CreateDevicesSection from './create-devices-section'

export default function DeviceTableSection() {
    const dispatch = useDispatch()
    const { devices, loading, error } = useSelector((state) => state.devices)
    const [editingDevice, setEditingDevice] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    // Filter configuration
    const searchableFields = ['serial_number', 'device_type', 'brand', 'model', 'operating_system', 'issued_to', 'received_by']
    const filterOptions = {
        device_type: [
            { label: 'Laptop', value: 'Laptop' },
            { label: 'MAC', value: 'MAC' },
            { label: 'Mobile Phone', value: 'Mobile Phone' },
            { label: 'Airpods', value: 'Airpods' },
            { label: 'Desktop', value: 'Desktop' },
            { label: 'Tablet', value: 'Tablet' }
        ],
        brand: [
            { label: 'HP', value: 'HP' },
            { label: 'Apple', value: 'Apple' },
            { label: 'MSI', value: 'MSI' },
            { label: 'Dell', value: 'Dell' },
            { label: 'Lenovo', value: 'Lenovo' },
            { label: 'ASUS', value: 'ASUS' },
            { label: 'Samsung', value: 'Samsung' }
        ],
        status: [
            { label: 'Working', value: 'Working' },
            { label: 'Defective', value: 'Defective' },
            { label: 'For Repair', value: 'For Repair' }
        ],
        operating_system: [
            { label: 'Windows 10', value: 'Windows 10' },
            { label: 'Windows 11', value: 'Windows 11' },
            { label: 'macOS', value: 'macOS' },
            { label: 'iOS 16', value: 'iOS 16' },
            { label: 'Android', value: 'Android' },
            { label: 'Linux', value: 'Linux' }
        ]
    }

    // Use the filtering hook with date field for 'created_at'
    const {
        searchTerm,
        filters,
        filteredData,
        filterStats,
        handleSearchChange,
        handleFilterChange,
        clearFilters
    } = useTableFilters(devices, searchableFields, filterOptions, 'created_at')

    useEffect(() => {
        dispatch(get_devices_thunk())
    }, [dispatch])

    const handleEdit = (device) => {
        setEditingDevice(device)
    }

    const handleCloseEdit = () => {
        setEditingDevice(null)
        dispatch(clearSelectedDevice())
    }

    const handleDelete = (deviceId) => {
        setDeleteId(deviceId)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        dispatch(delete_device_thunk(deleteId))
        setIsDeleteModalOpen(false)
        setDeleteId(null)
    }

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Working': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Defective': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            'For Repair': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }
        
        return (
            <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="mt-8 flow-root bg-white p-5 rounded-lg">
                <div className="text-center py-8">
                    <div className="text-gray-500">Loading devices...</div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-8 flow-root bg-white p-5 rounded-lg">
                <div className="text-center py-8">
                    <div className="text-red-500">Error: {error}</div>
                    <Button 
                        type="button" 
                        variant="primary" 
                        size="sm" 
                        onClick={() => dispatch(get_devices_thunk())}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }
    
    return (
        <div className="mt-8 space-y-4">
            {/* Filter Component */}
            <TableFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                filterOptions={filterOptions}
                placeholder="Search devices by serial number, type, brand, model..."
                showDateRange={true}
                dateRangeLabel="Created Date"
            />

            {/* Results Summary */}
            {filterStats.isFiltered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        Showing {filterStats.filtered} of {filterStats.total} devices
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>
            )}

            <div className="flow-root bg-white p-5 rounded-lg shadow-sm">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="flex float-end mb-4 gap-2">
                            <Button
                                type='button'
                                variant='primary'
                                size='sm'>
                                <PrinterIcon className='h-4'/>
                            </Button>
                            <Button
                                type='button'
                                variant='success'
                                size='sm'>
                                <ArrowDownCircleIcon className='h-4'/>
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-300 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Serial Number
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Device Type
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Brand
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Model
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Operating System
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Issued To
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Received By
                                    </th>
                                    <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="text-center py-8 text-gray-500">
                                            {filterStats.isFiltered ? 'No devices match your search criteria' : 'No devices found'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((device) => (
                                        <tr key={device.id}>
                                            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                                {device.serial_number}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.device_type}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.brand}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.model}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.operating_system}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {getStatusBadge(device.status)}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.issued_to || 'Not Issued'}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.received_by}
                                            </td>
                                            <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                                <div className="flex gap-2 justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(device)}
                                                        title="Edit Device"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(device.id)}
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingDevice && (
                <CreateDevicesSection 
                    editDevice={editingDevice} 
                    onClose={handleCloseEdit}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Device"
                message="Are you sure you want to delete this device? This action cannot be undone."
            />
        </div>
    )
}
