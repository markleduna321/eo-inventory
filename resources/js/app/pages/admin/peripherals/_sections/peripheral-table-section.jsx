import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import Alert from '@/app/pages/components/alert'
import TableFilter from '@/app/pages/components/table-filter'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { ArrowDownCircleIcon, PrinterIcon, PencilIcon, TrashIcon, PlusIcon, CubeIcon, ArrowUturnLeftIcon, EyeIcon } from '@heroicons/react/24/outline'
import { fetchPeripherals, updatePeripheral, deletePeripheral, addStock, returnStock, fetchStations, fetchDeliveryHistory, clearError, clearSuccessMessage } from '@/app/redux/peripheral/peripheralSlice'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import { usePage } from '@inertiajs/react'

export default function PeripheralTableSection() {
    // ...existing code...
    const dispatch = useDispatch()
    const { auth } = usePage().props
    const { peripherals, stations = [], deliveryHistory = [], loading, error, successMessage } = useSelector(state => state.peripherals)
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isStockModalOpen, setIsStockModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [isSerialEditModalOpen, setIsSerialEditModalOpen] = useState(false)
    const [selectedPeripheral, setSelectedPeripheral] = useState(null)
    const [selectedSerial, setSelectedSerial] = useState(null)
    const [activeTab, setActiveTab] = useState('details') // 'details' or 'history'
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10 // Number of items to display per page
    
    // Form states
    const [editForm, setEditForm] = useState({})
    const [stockForm, setStockForm] = useState({})
    const [returnForm, setReturnForm] = useState({})
    const [serialEditForm, setSerialEditForm] = useState({})
    
    // Alert state
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    const [serialValidation, setSerialValidation] = useState({ duplicates: [], errors: [] })

    // Validation functions
    const validateSerialNumbers = (serialNumbers) => {
        const errors = []
        const duplicates = []
        
        // Check for duplicates within the form
        const seen = new Set()
        const cleanedSerials = serialNumbers.map(s => s.trim()).filter(s => s !== '')
        
        cleanedSerials.forEach((serial, index) => {
            if (seen.has(serial)) {
                duplicates.push({ index, serial })
            } else {
                seen.add(serial)
            }
        })
        
        setSerialValidation({ duplicates, errors })
        return duplicates.length === 0 && errors.length === 0
    }

    // Filter configuration
    const searchableFields = ['type', 'brand', 'model', 'description', 'location', 'received_by', 'stock_status']
    const filterOptions = {
        type: [
            { label: 'Keyboard', value: 'keyboard' },
            { label: 'Mouse', value: 'mouse' },
            { label: 'Speaker', value: 'speaker' },
            { label: 'Webcam', value: 'webcam' },
            { label: 'Headset', value: 'headset' },
            { label: 'Printer', value: 'printer' },
            { label: 'Scanner', value: 'scanner' },
            { label: 'External Hard Drive', value: 'external_hdd' },
            { label: 'Other', value: 'other' }
        ],
        brand: [
            { label: 'Logitech', value: 'Logitech' },
            { label: 'Microsoft', value: 'Microsoft' },
            { label: 'A4 Tech', value: 'A4 Tech' },
            { label: 'Razer', value: 'Razer' },
            { label: 'Apple', value: 'Apple' },
            { label: 'Samsung', value: 'Samsung' },
            { label: 'Asus', value: 'Asus' },
            { label: 'Lenovo', value: 'Lenovo' },
            { label: 'Havit', value: 'Havit' },
            { label: 'HP', value: 'HP' },
            { label: 'AWP', value: 'AWP' },
            { label: 'Secure', value: 'Secure' },
            { label: 'HikVision', value: 'HikVision' },
            { label: 'Nvision', value: 'Nvision' },
            { label: 'Jabra', value: 'Jabra' },
            { label: 'Creative', value: 'Creative' }
        ],
        stock_status: [
            { label: 'In Stock', value: 'In Stock' },
            { label: 'Low Stock', value: 'Low Stock' },
            { label: 'Out of Stock', value: 'Out of Stock' }
        ],
        status: [
            { label: 'Active', value: 'active' },
            { label: 'Discontinued', value: 'discontinued' }
        ]
    }

    // Helper function to calculate stock status
    const calculateStockStatus = (peripheral) => {
        const availableStock = peripheral.available_stock || 0
        if (availableStock <= 0) {
            return 'Out of Stock'
        } else if (availableStock <= 5) {
            return 'Low Stock'
        } else {
            return 'In Stock'
        }
    }

    // Enhanced peripherals with calculated stock status
    const enhancedPeripherals = useMemo(() => {
        if (!peripherals || !Array.isArray(peripherals)) return []
        
        return peripherals.map(peripheral => ({
            ...peripheral,
            stock_status: calculateStockStatus(peripheral)
        }))
    }, [peripherals])

    const {
        searchTerm,
        handleSearchChange,
        filters,
        handleFilterChange,
        clearFilters,
        filteredData,
        filterStats
    } = useTableFilters(enhancedPeripherals, searchableFields, filterOptions, 'created_at')

    useEffect(() => {
        dispatch(fetchPeripherals())
        dispatch(fetchStations())
    }, [dispatch])
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedPeripherals = filteredData.slice(startIndex, endIndex)
    
    // Pagination handler
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, filters])

    useEffect(() => {
        if (error) {
            setAlert({ show: true, type: 'error', message: error })
            dispatch(clearError())
        }
    }, [error, dispatch])

    useEffect(() => {
        if (successMessage) {
            setAlert({ show: true, type: 'success', message: successMessage })
            dispatch(clearSuccessMessage())
            dispatch(fetchPeripherals()) // Refresh data
        }
    }, [successMessage, dispatch])

    // Helper functions
    const getStockStatusBadge = (stockStatus) => {
        const statusConfig = {
            'In Stock': 'bg-green-100 text-green-800',
            'Low Stock': 'bg-yellow-100 text-yellow-800',
            'Out of Stock': 'bg-red-100 text-red-800'
        }
        
        return (
            <span className={`${statusConfig[stockStatus]} text-xs font-medium px-2.5 py-0.5 rounded-sm`}>
                {stockStatus}
            </span>
        )
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            'active': 'bg-green-100 text-green-800',
            'discontinued': 'bg-gray-100 text-gray-800'
        }
        
        return (
            <span className={`${statusConfig[status]} text-xs font-medium px-2.5 py-0.5 rounded-sm`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    // Modal handlers
    const handleEdit = async (peripheral) => {
        try {
            // Fetch fresh peripheral data with serial numbers
            const response = await axios.get(`/api/peripherals/${peripheral.id}`)
            const freshPeripheral = response.data
            
            // Ensure serial_numbers is mapped correctly from serialNumbers
            if (freshPeripheral.serialNumbers && !freshPeripheral.serial_numbers) {
                freshPeripheral.serial_numbers = freshPeripheral.serialNumbers
            }
            
            console.log('Fresh peripheral data:', freshPeripheral) // Debug log
            
            setSelectedPeripheral(freshPeripheral)
            setEditForm({
                type: freshPeripheral.type,
                brand: freshPeripheral.brand,
                model: freshPeripheral.model,
                description: freshPeripheral.description || '',
                unit_price: freshPeripheral.unit_price || '',
                location: freshPeripheral.location,
                status: freshPeripheral.status,
                notes: freshPeripheral.notes || ''
            })
        } catch (error) {
            console.error('Error fetching fresh peripheral data:', error)
            // Fallback to original data if API fails
            setSelectedPeripheral(peripheral)
            setEditForm({
                type: peripheral.type,
                brand: peripheral.brand,
                model: peripheral.model,
                description: peripheral.description || '',
                unit_price: peripheral.unit_price || '',
                location: peripheral.location,
                status: peripheral.status,
                notes: peripheral.notes || ''
            })
        }
        
        setActiveTab('details')
        dispatch(fetchDeliveryHistory(peripheral.id))
        setIsEditModalOpen(true)
    }

    const handleAddStock = (peripheral) => {
        setSelectedPeripheral(peripheral)
        
        // Default to peripheral's current setting, but allow override
        const defaultUsesSerial = peripheral.uses_serial_numbers || false
        
        setStockForm({
            quantity: defaultUsesSerial ? '' : '1', // Default quantity to 1 for non-serial peripherals
            unit_price: peripheral.unit_price || '',
            supplier: '',
            purchase_order: '',
            invoice_number: '',
            delivery_date: '',
            received_by: auth.user?.name || '',
            notes: '',
            has_serial_numbers: defaultUsesSerial, // Default based on peripheral setting
            serial_numbers: defaultUsesSerial ? [''] : []
        })
        setSerialValidation({ duplicates: [], errors: [] }) // Clear validation
        setIsStockModalOpen(true)
    }

    const handleReturn = (peripheral) => {
        setSelectedPeripheral(peripheral)
        setReturnForm({
            quantity: '',
            station_id: '',
            notes: ''
        })
        setIsReturnModalOpen(true)
    }

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this peripheral?')) {
            dispatch(deletePeripheral(id))
        }
    }

    // Form submissions
    const handleEditSubmit = async (e) => {
        e.preventDefault()
        dispatch(updatePeripheral({ id: selectedPeripheral.id, peripheralData: editForm }))
        setIsEditModalOpen(false)
    }

    const handleStockSubmit = async (e) => {
        e.preventDefault()
        console.log('Submitting stock form with data:', stockForm)
        console.log('Selected peripheral:', selectedPeripheral)
        
        // Prepare the data to send
        const dataToSend = { ...stockForm }
        
        // If using serial numbers, don't send quantity (it will be calculated from serial numbers)
        if (stockForm.has_serial_numbers || selectedPeripheral?.uses_serial_numbers) {
            delete dataToSend.quantity
        }
        
        console.log('Data being sent after processing:', dataToSend)
        dispatch(addStock({ id: selectedPeripheral.id, stockData: dataToSend }))
        setIsStockModalOpen(false)
    }

    const handleReturnSubmit = async (e) => {
        e.preventDefault()
        dispatch(returnStock({ id: selectedPeripheral.id, returnData: returnForm }))
        setIsReturnModalOpen(false)
    }

    // Close modal handlers
    const closeEditModal = () => {
        setIsEditModalOpen(false)
        setSelectedPeripheral(null)
        setEditForm({})
        setActiveTab('details')
    }

    const closeStockModal = () => {
        setIsStockModalOpen(false)
        setSelectedPeripheral(null)
        setStockForm({})
        setSerialValidation({ duplicates: [], errors: [] })
    }

    const closeReturnModal = () => {
        setIsReturnModalOpen(false)
        setSelectedPeripheral(null)
        setReturnForm({})
    }

    // Serial edit handlers
    const openSerialEditModal = (serial) => {
        setSelectedSerial(serial)
        setSerialEditForm({
            serial_number: serial.serial_number,
            unit_price: serial.unit_price || '',
            notes: serial.notes || ''
        })
        setIsSerialEditModalOpen(true)
    }

    const closeSerialEditModal = () => {
        setIsSerialEditModalOpen(false)
        setSelectedSerial(null)
        setSerialEditForm({})
    }

    const handleSerialUpdate = async () => {
        try {
            const response = await axios.put(`/api/peripheral-serials/${selectedSerial.id}`, serialEditForm)
            
            if (response.data.success) {
                // Update the selected peripheral's serial numbers
                const updatedSerials = selectedPeripheral.serial_numbers.map(serial => 
                    serial.id === selectedSerial.id ? response.data.data : serial
                )
                setSelectedPeripheral({
                    ...selectedPeripheral,
                    serial_numbers: updatedSerials
                })
                
                // Show success message
                setAlert({ show: true, type: 'success', message: response.data.message })
                closeSerialEditModal()
            }
        } catch (error) {
            console.error('Error updating serial:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to update serial number' 
            })
        }
    }

    const handleSerialDelete = async (serial) => {
        if (!confirm(`Are you sure you want to delete serial number "${serial.serial_number}"? This action cannot be undone.`)) {
            return
        }

        try {
            const response = await axios.delete(`/api/peripheral-serials/${serial.id}`)
            
            if (response.data.success) {
                // Force refresh peripherals first
                await dispatch(fetchPeripherals())
                
                // Get fresh peripheral data
                const freshResponse = await axios.get(`/api/peripherals/${selectedPeripheral.id}`)
                const freshPeripheral = freshResponse.data
                
                // Ensure serial_numbers is mapped correctly
                if (freshPeripheral.serialNumbers && !freshPeripheral.serial_numbers) {
                    freshPeripheral.serial_numbers = freshPeripheral.serialNumbers
                }
                
                setSelectedPeripheral(freshPeripheral)
                
                // Show success message
                setAlert({ show: true, type: 'success', message: response.data.message })
                
                console.log('Updated peripheral after deletion:', freshPeripheral)
            }
        } catch (error) {
            console.error('Error deleting serial:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error.response?.data?.message || 'Failed to delete serial number' 
            })
        }
    }

    if (loading && peripherals.length === 0) {
        return <div className="text-center py-4">Loading peripherals...</div>
    }

    // ...existing code...

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
                placeholder="Search peripherals by type, brand, model, description..."
                showDateRange={true}
                dateRangeLabel="Created Date"
            />

            {/* Currency Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 my-4 rounded">
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

            {/* Results Summary */}
            {filterStats.isFiltered && (
                <div className="text-sm text-gray-600">
                    Showing {filteredData.length} of {peripherals.length} peripherals
                </div>
            )}

            <div className="mt-8 flow-root bg-white p-5 rounded-lg">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="flex float-end mb-4 gap-2">
                            <Button
                                type='button'
                                variant='primary'
                                size='sm'>
                                <PrinterIcon className='h-4' />
                            </Button>
                            <Button
                                type='button'
                                variant='success'
                                size='sm'>
                                <ArrowDownCircleIcon className='h-4' />
                            </Button>
                        </div>
                        <table className="min-w-full divide-y divide-gray-300 border">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Type
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Brand/Model
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Stock Levels
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Stock Status
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Location
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-gray-500">
                                            {filterStats.isFiltered ? 'No peripherals match your search criteria' : 'No peripherals found'}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedPeripherals.map((peripheral) => (
                                        <tr key={peripheral.id}>
                                            <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{peripheral.type.charAt(0).toUpperCase() + peripheral.type.slice(1)}</span>
                                                    {peripheral.description && (
                                                        <span className="text-xs text-gray-500">{peripheral.description}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{peripheral.brand}</span>
                                                    <span className="text-xs text-gray-400">{peripheral.model}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Available:</span>
                                                        <span className="font-medium text-green-600">{peripheral.available_stock}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Deployed:</span>
                                                        <span className="font-medium text-blue-600">{peripheral.deployed_stock}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs">
                                                        <span>Damaged:</span>
                                                        <span className="font-medium text-red-600">{peripheral.damaged_stock}</span>
                                                    </div>
                                                    <div className="flex justify-between text-xs border-t pt-1">
                                                        <span>Total:</span>
                                                        <span className="font-medium">{peripheral.total_stock}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                {getStockStatusBadge(peripheral.stock_status)}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                {peripheral.location.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                {getStatusBadge(peripheral.status)}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="flex gap-2 flex-wrap">
                                                    <Button
                                                        type="button"
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => handleAddStock(peripheral)}
                                                        title="Add Stock"
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </Button>
                                                    
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleEdit(peripheral)}
                                                        title="View/Edit Details & History"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteClick(peripheral.id)}
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

            {/* Alert */}
            {alert.show && (
                <Alert 
                    type={alert.type} 
                    message={alert.message} 
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                />
            )}

            {/* Edit/View Peripheral Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900">
                                {selectedPeripheral?.brand} {selectedPeripheral?.model}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                View details and delivery history, or edit peripheral information
                            </p>

                            {/* Tab Navigation */}
                            <div className="mt-4 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'details'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Details & Edit
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'history'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Delivery History
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('serial')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'serial'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Serial Numbers
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-4">
                                {activeTab === 'details' ? (
                                    // Details/Edit Tab
                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InputTextComponent
                                                label="Type"
                                                id="type"
                                                name="type"
                                                value={editForm.type || ''}
                                                onChange={(e) => setEditForm({...editForm, type: e.target.value})}
                                                required
                                            />
                                            <InputTextComponent
                                                label="Brand"
                                                id="brand"
                                                name="brand"
                                                value={editForm.brand || ''}
                                                onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                                                required
                                            />
                                            <InputTextComponent
                                                label="Model"
                                                id="model"
                                                name="model"
                                                value={editForm.model || ''}
                                                onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                                                required
                                            />
                                            <InputTextComponent
                                                label="Unit Price (₱)"
                                                id="unit_price"
                                                name="unit_price"
                                                type="number"
                                                step="0.01"
                                                value={editForm.unit_price || ''}
                                                onChange={(e) => setEditForm({...editForm, unit_price: e.target.value})}
                                            />
                                            <InputTextComponent
                                                label="Location"
                                                id="location"
                                                name="location"
                                                value={editForm.location || ''}
                                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                                required
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select
                                                    value={editForm.status || ''}
                                                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    required
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="discontinued">Discontinued</option>
                                                </select>
                                            </div>
                                        </div>
                                        
                                        {/* Stock Information Display */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-3">Current Stock Levels</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div className="text-center">
                                                    <div className="font-medium text-green-600">{selectedPeripheral?.available_stock || 0}</div>
                                                    <div className="text-gray-500">Available</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-medium text-blue-600">{selectedPeripheral?.deployed_stock || 0}</div>
                                                    <div className="text-gray-500">Deployed</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-medium text-red-600">{selectedPeripheral?.damaged_stock || 0}</div>
                                                    <div className="text-gray-500">Damaged</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-medium text-gray-900">{selectedPeripheral?.total_stock || 0}</div>
                                                    <div className="text-gray-500">Total</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                            <textarea
                                                value={editForm.description || ''}
                                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                                rows={2}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                            <textarea
                                                value={editForm.notes || ''}
                                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                                rows={2}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 mt-6">
                                            <Button type="button" variant="secondary" onClick={closeEditModal}>
                                                Close
                                            </Button>
                                            <Button type="submit" variant="primary">
                                                Update Peripheral
                                            </Button>
                                        </div>
                                    </form>
                                ) : activeTab === 'history' ? (
                                    // History Tab
                                    <div className="max-h-96 overflow-y-auto">
                                        {deliveryHistory.length === 0 ? (
                                            <p className="text-gray-500 text-center py-8">No delivery history found</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {deliveryHistory.map((delivery, index) => (
                                                    <div key={delivery.id || index} className="border rounded-lg p-4 bg-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                                                                <div className="space-y-1 text-sm">
                                                                    <div><strong>Date:</strong> {new Date(delivery.delivery_date).toLocaleDateString()}</div>
                                                                    <div><strong>Quantity:</strong> {delivery.quantity_delivered}</div>
                                                                    <div><strong>Unit Price:</strong> ₱{delivery.unit_price ? parseFloat(delivery.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</div>
                                                                    <div><strong>Total Value:</strong> ₱{delivery.unit_price ? (parseFloat(delivery.unit_price) * delivery.quantity_delivered).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'N/A'}</div>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 mb-2">Purchase Info</h4>
                                                                <div className="space-y-1 text-sm">
                                                                    <div><strong>Supplier:</strong> {delivery.supplier || 'N/A'}</div>
                                                                    <div><strong>PO Number:</strong> {delivery.purchase_order || 'N/A'}</div>
                                                                    <div><strong>Invoice:</strong> {delivery.invoice_number || 'N/A'}</div>
                                                                    <div><strong>Received By:</strong> {delivery.received_by}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {delivery.notes && (
                                                            <div className="mt-3">
                                                                <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
                                                                <p className="text-sm text-gray-600">{delivery.notes}</p>
                                                            </div>
                                                        )}
                                                        <div className="mt-3 flex items-center justify-between">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                delivery.delivery_status === 'received' 
                                                                    ? 'bg-green-100 text-green-800' 
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {delivery.delivery_status || 'Received'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                Added {new Date(delivery.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex justify-end mt-6">
                                            <Button type="button" variant="secondary" onClick={closeEditModal}>
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // Serial Numbers Tab
                                    <div className="max-h-96 overflow-y-auto">
                                        {selectedPeripheral?.serial_numbers && selectedPeripheral.serial_numbers.length > 0 ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-medium text-gray-900">Serial Numbers</h4>
                                                    <span className="text-sm text-gray-500">
                                                        Total: {selectedPeripheral.serial_numbers.length}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    {selectedPeripheral.serial_numbers.map((serial, index) => (
                                                        <div key={serial.id || index} className="border rounded-lg p-4 bg-gray-50">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <span className="font-mono font-medium text-gray-900">
                                                                            {serial.serial_number}
                                                                        </span>
                                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                            serial.status === 'available' 
                                                                                ? 'bg-green-100 text-green-800'
                                                                                : serial.status === 'deployed'
                                                                                ? 'bg-blue-100 text-blue-800'
                                                                                : serial.status === 'maintenance'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : serial.status === 'damaged'
                                                                                ? 'bg-red-100 text-red-800'
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            {serial.status?.charAt(0).toUpperCase() + serial.status?.slice(1) || 'Available'}
                                                                        </span>
                                                                    </div>
                                                                    {serial.unit_price && (
                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                            Unit Price: ₱{parseFloat(serial.unit_price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                                        </div>
                                                                    )}
                                                                    {serial.deployed_to && (
                                                                        <div className="mt-1 text-sm text-gray-600">
                                                                            Deployed to: {serial.deployed_to}
                                                                        </div>
                                                                    )}
                                                                    {serial.deployed_at && (
                                                                        <div className="mt-1 text-sm text-gray-500">
                                                                            Deployed: {new Date(serial.deployed_at).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                    {serial.delivery_date && (
                                                                        <div className="mt-1 text-sm text-gray-500">
                                                                            Received: {new Date(serial.delivery_date).toLocaleDateString()}
                                                                        </div>
                                                                    )}
                                                                    {serial.notes && (
                                                                        <div className="mt-1 text-sm text-gray-500">
                                                                            Notes: {serial.notes}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 ml-4">
                                                                    <button
                                                                        onClick={() => openSerialEditModal(serial)}
                                                                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit Serial Number"
                                                                    >
                                                                        <PencilIcon className="h-4 w-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSerialDelete(serial)}
                                                                        className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete Serial Number"
                                                                    >
                                                                        <TrashIcon className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                                                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 4h6V3H9v1zm3 8l-3-3m0 0l3 3m-3-3v6" />
                                                    </svg>
                                                </div>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No Serial Numbers</h3>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    This peripheral doesn't have individual serial numbers tracked.
                                                </p>
                                            </div>
                                        )}
                                        <div className="flex justify-end mt-6">
                                            <Button type="button" variant="secondary" onClick={closeEditModal}>
                                                Close
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Stock Modal */}
            <Modal isOpen={isStockModalOpen} onClose={closeStockModal}>
                <div className="flex flex-col h-[85vh] w-full max-w-4xl bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Add Stock - {selectedPeripheral?.brand} {selectedPeripheral?.model}
                            </h3>
                           
                        </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto px-6 py-6 flex-1 min-h-0">
                        <form id="add-stock-form" onSubmit={handleStockSubmit} className="space-y-6">
                            {/* Serial Number Option - Always show for user choice, but indicate current state */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <div className="flex items-center">
                                    <input
                                        id="has_serial_numbers"
                                        type="checkbox"
                                        checked={stockForm.has_serial_numbers || false}
                                        onChange={(e) => {
                                            const hasSerial = e.target.checked
                                            setStockForm({
                                                ...stockForm, 
                                                has_serial_numbers: hasSerial,
                                                serial_numbers: hasSerial ? [''] : [],
                                                quantity: hasSerial ? '' : (stockForm.quantity || '1')
                                            })
                                        }}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="has_serial_numbers" className="ml-2 block text-sm font-medium text-blue-800">
                                        This peripheral has serial numbers
                                    </label>
                                </div>
                                <p className="text-xs text-blue-600 mt-1">
                                    {selectedPeripheral?.uses_serial_numbers 
                                        ? "This peripheral is configured to use serial numbers. You can uncheck this to add bulk stock instead."
                                        : "Check this if each item has a unique serial number. The quantity will be determined by the number of serial numbers entered."
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Quantity or Serial Numbers */}
                                {stockForm.has_serial_numbers || selectedPeripheral?.uses_serial_numbers ? (
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Serial Numbers *
                                        </label>
                                        <div className="space-y-2">
                                            {(stockForm.serial_numbers || []).map((serial, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <div className="flex-1">
                                                        <InputTextComponent
                                                            placeholder={`Serial Number ${index + 1}`}
                                                            value={serial}
                                                            onChange={(e) => {
                                                                const newSerials = [...(stockForm.serial_numbers || [])]
                                                                newSerials[index] = e.target.value
                                                                setStockForm({
                                                                    ...stockForm, 
                                                                    serial_numbers: newSerials,
                                                                    quantity: newSerials.filter(s => s.trim()).length
                                                                })
                                                                // Validate serial numbers after change
                                                                validateSerialNumbers(newSerials)
                                                            }}
                                                            required
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newSerials = (stockForm.serial_numbers || []).filter((_, i) => i !== index)
                                                            setStockForm({
                                                                ...stockForm, 
                                                                serial_numbers: newSerials,
                                                                quantity: newSerials.filter(s => s.trim()).length
                                                            })
                                                            validateSerialNumbers(newSerials)
                                                        }}
                                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                                                        disabled={(stockForm.serial_numbers || []).length <= 1}
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newSerials = [...(stockForm.serial_numbers || []), '']
                                                    setStockForm({
                                                        ...stockForm, 
                                                        serial_numbers: newSerials
                                                    })
                                                }}
                                                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors text-sm"
                                            >
                                                + Add Serial Number
                                            </button>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            Total Quantity: {(stockForm.serial_numbers || []).filter(s => s.trim()).length} items
                                        </div>
                                        {serialValidation.duplicates.length > 0 && (
                                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-red-800">
                                                            Duplicate Serial Numbers
                                                        </h3>
                                                        <div className="mt-2 text-sm text-red-700">
                                                            Please ensure all serial numbers are unique. Each serial number must be globally unique across the entire system.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <InputTextComponent
                                        label="Quantity *"
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        value={stockForm.quantity || ''}
                                        onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})}
                                        required
                                    />
                                )}
                                
                                <InputTextComponent
                                    label="Unit Price"
                                    id="unit_price"
                                    name="unit_price"
                                    type="number"
                                    step="0.01"
                                    value={stockForm.unit_price || ''}
                                    onChange={(e) => setStockForm({...stockForm, unit_price: e.target.value})}
                                />
                                <InputTextComponent
                                    label="Supplier"
                                    id="supplier"
                                    name="supplier"
                                    value={stockForm.supplier || ''}
                                    onChange={(e) => setStockForm({...stockForm, supplier: e.target.value})}
                                />
                                <InputTextComponent
                                    label="Purchase Order"
                                    id="purchase_order"
                                    name="purchase_order"
                                    value={stockForm.purchase_order || ''}
                                    onChange={(e) => setStockForm({...stockForm, purchase_order: e.target.value})}
                                />
                                <InputTextComponent
                                    label="Invoice Number"
                                    id="invoice_number"
                                    name="invoice_number"
                                    value={stockForm.invoice_number || ''}
                                    onChange={(e) => setStockForm({...stockForm, invoice_number: e.target.value})}
                                />
                                <InputTextComponent
                                    label="Delivery Date *"
                                    id="delivery_date"
                                    name="delivery_date"
                                    type="date"
                                    value={stockForm.delivery_date || ''}
                                    onChange={(e) => setStockForm({...stockForm, delivery_date: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={stockForm.notes || ''}
                                    onChange={(e) => setStockForm({...stockForm, notes: e.target.value})}
                                    rows={3}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Additional notes about this delivery..."
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                <strong>Received by:</strong> {auth.user?.name || 'Current User'}
                            </div>
                        </form>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-lg">
                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="secondary" onClick={closeStockModal}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="success" 
                                form="add-stock-form"
                                disabled={(stockForm.has_serial_numbers || selectedPeripheral?.uses_serial_numbers) && serialValidation.duplicates.length > 0}
                            >
                                Add Stock
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Return Stock Modal */}
            <Modal isOpen={isReturnModalOpen} onClose={closeReturnModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900">
                                Return Stock - {selectedPeripheral?.brand} {selectedPeripheral?.model}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Deployed Stock: {selectedPeripheral?.deployed_stock || 0}
                            </p>

                            <form onSubmit={handleReturnSubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputTextComponent
                                        label="Quantity *"
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        max={selectedPeripheral?.deployed_stock || 1}
                                        value={returnForm.quantity || ''}
                                        onChange={(e) => setReturnForm({...returnForm, quantity: e.target.value})}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Station (Optional)</label>
                                        <select
                                            value={returnForm.station_id || ''}
                                            onChange={(e) => setReturnForm({...returnForm, station_id: e.target.value})}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="">Select Station (Optional)</option>
                                            {stations.map(station => (
                                                <option key={station.id} value={station.id}>
                                                    {station.name} - {station.location_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={returnForm.notes || ''}
                                        onChange={(e) => setReturnForm({...returnForm, notes: e.target.value})}
                                        rows={2}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Return notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="secondary" onClick={closeReturnModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="warning">
                                        Return Stock
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Serial Edit Modal */}
            <Modal isOpen={isSerialEditModalOpen} onClose={closeSerialEditModal}>
                <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Edit Serial Number
                        </h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); handleSerialUpdate(); }}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Serial Number
                                    </label>
                                    <input
                                        type="text"
                                        value={serialEditForm.serial_number || ''}
                                        onChange={(e) => setSerialEditForm({
                                            ...serialEditForm,
                                            serial_number: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter serial number"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Unit Price
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={serialEditForm.unit_price || ''}
                                        onChange={(e) => setSerialEditForm({
                                            ...serialEditForm,
                                            unit_price: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        value={serialEditForm.notes || ''}
                                        onChange={(e) => setSerialEditForm({
                                            ...serialEditForm,
                                            notes: e.target.value
                                        })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Optional notes..."
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="secondary" onClick={closeSerialEditModal}>
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary">
                                    Update Serial
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </Modal>
        </div>
    )
}