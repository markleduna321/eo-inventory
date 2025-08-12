import Button from '@/app/pages/components/button'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import Modal from '@/app/pages/components/modal'
import TableFilter from '@/app/pages/components/table-filter'
import { ArrowDownCircleIcon, PrinterIcon, EyeIcon, PencilIcon, TrashIcon, QrCodeIcon, UserIcon } from '@heroicons/react/24/outline'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { get_devices_thunk, delete_device_thunk } from '../_redux/devices-thunk'
import { setSelectedDevice, clearSelectedDevice } from '../_redux/devices-slice'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import CreateDevicesSection from './create-devices-section'
import { Link } from '@inertiajs/react'

export default function DeviceTableSection() {
    const dispatch = useDispatch()
    const { devices, loading, error } = useSelector((state) => state.devices)
    const [editingDevice, setEditingDevice] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [viewingDevice, setViewingDevice] = useState(null)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10 // Number of items to display per page

    // Filter configuration
    const searchableFields = ['serial_number', 'device_type', 'brand', 'model', 'operating_system', 'mac_address', 'issued_to', 'received_by']
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
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedDevices = filteredData.slice(startIndex, endIndex)
    
    // Pagination handler
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filters])

    const handleViewDetails = (device) => {
        setViewingDevice(device)
        setIsDetailsModalOpen(true)
    }

    const handleCloseDetails = () => {
        setViewingDevice(null)
        setIsDetailsModalOpen(false)
    }
    
    // QR code functionality
    const [currentQrDevice, setCurrentQrDevice] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    
    const handleShowQrCode = (device) => {
        fetch(`/devices/${device.id}/qr-image`, { method: 'HEAD' })
            .then(() => {
                setCurrentQrDevice(device);
                setShowQrModal(true);
            })
            .catch(error => {
                console.error('Error checking QR code:', error);
                // Still show the modal even if there's an error with the HEAD request
                setCurrentQrDevice(device);
                setShowQrModal(true);
            });
    }

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

    const getAvailabilityBadge = (device) => {
        const isAvailable = !device.issued_to && device.status === 'Working'
        
        if (isAvailable) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                </span>
            )
        } else if (device.issued_to) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Assigned
                </span>
            )
        } else {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Unavailable
                </span>
            )
        }
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
            {/* Currency Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            All financial values are displayed in Philippine Pesos (₱).
                        </p>
                    </div>
                </div>
            </div>
            
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
                                        MAC Address
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Availability
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Price
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
                                        <td colSpan="11" className="text-center py-8 text-gray-500">
                                            {filterStats.isFiltered ? 'No devices match your search criteria' : 'No devices found'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDevices.map((device) => (
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
                                                {device.mac_address || '-'}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {getStatusBadge(device.status)}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {getAvailabilityBadge(device)}
                                            </td>
                                            <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                                {device.price ? `₱${parseFloat(device.price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
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
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(device)}
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    
                                                    {/* Request button - only show for available devices */}
                                                    {!device.issued_to && device.status === 'Working' && (
                                                        <Link href={`/admin/device-requests/create?device_id=${device.id}`}>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                title="Request Device"
                                                            >
                                                                <UserIcon className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    
                                                    <Button
                                                        type="button"
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleShowQrCode(device)}
                                                        title="View QR Code"
                                                    >
                                                        <QrCodeIcon className="h-4 w-4" />
                                                    </Button>
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
                        
                        {/* Pagination */}
                        {filteredData.length > itemsPerPage && (
                            <div className="bg-white px-4 py-4 border-t border-gray-200 sm:px-6">
                                {/* Mobile Pagination */}
                                <div className="flex-1 flex justify-between items-center sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === 1
                                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700 font-medium">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === totalPages
                                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                                        }`}
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Desktop Pagination */}
                                <div className="hidden sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                            <span>Showing</span>
                                            <span className="font-semibold text-indigo-600">{startIndex + 1}</span>
                                            <span>to</span>
                                            <span className="font-semibold text-indigo-600">{Math.min(endIndex, filteredData.length)}</span>
                                            <span>of</span>
                                            <span className="font-semibold text-indigo-600">{filteredData.length}</span>
                                            <span>results</span>
                                        </div>
                                    </div>
                                    
                                    <nav className="flex items-center space-x-1" aria-label="Pagination">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                currentPage === 1
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        
                                        {/* Page Numbers */}
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                const isCurrentPage = currentPage === page
                                                const isNearCurrentPage = Math.abs(page - currentPage) <= 2
                                                const isFirstOrLast = page === 1 || page === totalPages
                                                
                                                // Show ellipsis logic
                                                if (!isNearCurrentPage && !isFirstOrLast) {
                                                    if (page === currentPage - 3 || page === currentPage + 3) {
                                                        return (
                                                            <span key={page} className="px-2 py-1 text-gray-500">
                                                                ...
                                                            </span>
                                                        )
                                                    }
                                                    return null
                                                }
                                                
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                                            isCurrentPage
                                                                ? 'z-10 bg-indigo-600 text-white shadow-lg border border-indigo-600'
                                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        
                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                currentPage === totalPages
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                            }`}
                                        >
                                            Next
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        )}
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

            {/* View Details Modal */}
            {isDetailsModalOpen && viewingDevice && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border shadow-lg rounded-md bg-white max-w-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Device Details</h3>
                            <button
                                type="button"
                                onClick={handleCloseDetails}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-2 bg-gray-50 p-4 rounded-md">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Serial Number</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.serial_number || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Device Type</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.device_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Brand</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.brand || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Model</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.model || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Operating System</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.operating_system || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">MAC Address</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.mac_address || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.status || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Issued To</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.issued_to || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Received By</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.received_by || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Price</p>
                                    <p className="mt-1 text-sm text-gray-900">₱{parseFloat(viewingDevice.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Purchase Date</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.purchase_date || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Warranty Expiry</p>
                                    <p className="mt-1 text-sm text-gray-900">{viewingDevice.warranty_expiry || 'N/A'}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications</h4>
                                <div className="bg-white p-3 rounded-md shadow-sm">
                                    {viewingDevice.specifications ? (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">CPU</p>
                                                <p className="mt-1 text-sm text-gray-900">{viewingDevice.specifications.cpu || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">RAM</p>
                                                <p className="mt-1 text-sm text-gray-900">{viewingDevice.specifications.ram || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Storage</p>
                                                <p className="mt-1 text-sm text-gray-900">{viewingDevice.specifications.storage || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">GPU</p>
                                                <p className="mt-1 text-sm text-gray-900">{viewingDevice.specifications.gpu || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No specifications available</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    onClick={handleCloseDetails}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Device"
                message="Are you sure you want to delete this device? This action cannot be undone."
            />
            
            {/* QR Code Modal */}
            <Modal isOpen={showQrModal} setIsOpen={setShowQrModal} title="Device QR Code">
                <div className="p-4">
                    {currentQrDevice && (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="bg-white p-4 rounded-lg shadow">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentQrDevice.brand} {currentQrDevice.model}</h3>
                                <p className="text-sm text-gray-600 mb-1">S/N: {currentQrDevice.serial_number}</p>
                                <p className="text-sm text-gray-600">Type: {currentQrDevice.device_type}</p>
                                
                                <div className="mt-4 flex flex-col items-center justify-center">
                                    <p className="text-gray-600 mb-2">Scan or share this QR code:</p>
                                    <div className="border border-gray-300 p-1 rounded bg-white">
                                        <img
                                            src={`/devices/${currentQrDevice.id}/qr-image`} 
                                            alt="QR Code"
                                            className="w-64 h-64"
                                            onError={(e) => {
                                                console.error("QR code image load error");
                                                e.target.onerror = null;
                                                e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20version%3D%221.1%22%20width%3D%22300%22%20height%3D%22300%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23f8f9fa%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20font-size%3D%2218%22%20text-anchor%3D%22middle%22%20alignment-baseline%3D%22middle%22%20font-family%3D%22Arial%2C%20sans-serif%22%20fill%3D%22%236c757d%22%3EQR%20Code%20Unavailable%3C%2Ftext%3E%3C%2Fsvg%3E";
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">QR Code ID: {currentQrDevice.qr_code || "Generating..."}</p>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <Button 
                                    type="button" 
                                    variant="secondary" 
                                    size="md" 
                                    onClick={() => {
                                        window.location.href = `/devices/${currentQrDevice.id}/qr-image?download=1`;
                                    }}
                                >
                                    <ArrowDownCircleIcon className="h-5 w-5 mr-2" />
                                    Download QR Code
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="danger" 
                                    size="md" 
                                    onClick={() => setShowQrModal(false)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
