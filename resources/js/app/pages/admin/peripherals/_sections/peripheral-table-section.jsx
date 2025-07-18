import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import Alert from '@/app/pages/components/alert'
import TableFilter from '@/app/pages/components/table-filter'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { ArrowDownCircleIcon, PrinterIcon, PencilIcon, TrashIcon, PlusIcon, CubeIcon, ArrowUturnLeftIcon, EyeIcon } from '@heroicons/react/24/outline'
import { fetchPeripherals, updatePeripheral, deletePeripheral, addStock, deployStock, returnStock, fetchStations, fetchDeliveryHistory, clearError, clearSuccessMessage } from '@/app/redux/peripheral/peripheralSlice'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import { usePage } from '@inertiajs/react'

export default function PeripheralTableSection() {
    const dispatch = useDispatch()
    const { auth } = usePage().props
    const { peripherals, stations = [], deliveryHistory = [], loading, error, successMessage } = useSelector(state => state.peripherals)
    
    // Modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isStockModalOpen, setIsStockModalOpen] = useState(false)
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [selectedPeripheral, setSelectedPeripheral] = useState(null)
    const [activeTab, setActiveTab] = useState('details') // 'details' or 'history'
    
    // Form states
    const [editForm, setEditForm] = useState({})
    const [stockForm, setStockForm] = useState({})
    const [deployForm, setDeployForm] = useState({})
    const [returnForm, setReturnForm] = useState({})
    
    // Alert state
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })

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
            { label: 'HP', value: 'HP' },
            { label: 'Dell', value: 'Dell' },
            { label: 'Canon', value: 'Canon' },
            { label: 'Epson', value: 'Epson' },
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

    const {
        searchTerm,
        handleSearchChange,
        filters,
        handleFilterChange,
        clearFilters,
        filteredData,
        filterStats
    } = useTableFilters(peripherals, searchableFields, filterOptions, 'created_at')

    useEffect(() => {
        dispatch(fetchPeripherals())
        dispatch(fetchStations())
    }, [dispatch])

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
    const handleEdit = (peripheral) => {
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
        setActiveTab('details')
        dispatch(fetchDeliveryHistory(peripheral.id))
        setIsEditModalOpen(true)
    }

    const handleAddStock = (peripheral) => {
        setSelectedPeripheral(peripheral)
        setStockForm({
            quantity: '',
            unit_price: peripheral.unit_price || '',
            supplier: '',
            purchase_order: '',
            invoice_number: '',
            delivery_date: new Date().toISOString().split('T')[0],
            received_by: auth.user?.name || '',
            notes: ''
        })
        setIsStockModalOpen(true)
    }

    const handleDeploy = (peripheral) => {
        setSelectedPeripheral(peripheral)
        setDeployForm({
            quantity: '',
            station_id: '',
            deployed_to: '',
            notes: ''
        })
        setIsDeployModalOpen(true)
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
        dispatch(addStock({ id: selectedPeripheral.id, stockData: stockForm }))
        setIsStockModalOpen(false)
    }

    const handleDeploySubmit = async (e) => {
        e.preventDefault()
        dispatch(deployStock({ id: selectedPeripheral.id, deployData: deployForm }))
        setIsDeployModalOpen(false)
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
    }

    const closeDeployModal = () => {
        setIsDeployModalOpen(false)
        setSelectedPeripheral(null)
        setDeployForm({})
    }

    const closeReturnModal = () => {
        setIsReturnModalOpen(false)
        setSelectedPeripheral(null)
        setReturnForm({})
    }

    if (loading && peripherals.length === 0) {
        return <div className="text-center py-4">Loading peripherals...</div>
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
                placeholder="Search peripherals by type, brand, model, description..."
                showDateRange={true}
                dateRangeLabel="Created Date"
            />

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
                                        Unit Price
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
                                    filteredData.map((peripheral) => (
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
                                                {peripheral.unit_price ? `$${parseFloat(peripheral.unit_price).toFixed(2)}` : 'N/A'}
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
                                                    {peripheral.available_stock > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleDeploy(peripheral)}
                                                            title="Deploy Stock"
                                                        >
                                                            <CubeIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {peripheral.deployed_stock > 0 && (
                                                        <Button
                                                            type="button"
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleReturn(peripheral)}
                                                            title="Return Stock"
                                                        >
                                                            <ArrowUturnLeftIcon className="h-4 w-4" />
                                                        </Button>
                                                    )}
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
                                                label="Unit Price"
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
                                ) : (
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
                                                                    <div><strong>Unit Price:</strong> ${delivery.unit_price ? parseFloat(delivery.unit_price).toFixed(2) : 'N/A'}</div>
                                                                    <div><strong>Total Value:</strong> ${delivery.unit_price ? (parseFloat(delivery.unit_price) * delivery.quantity_delivered).toFixed(2) : 'N/A'}</div>
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Add Stock Modal */}
            <Modal isOpen={isStockModalOpen} onClose={closeStockModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900">
                                Add Stock - {selectedPeripheral?.brand} {selectedPeripheral?.model}
                            </h3>

                            <form onSubmit={handleStockSubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                        rows={2}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Additional notes about this delivery..."
                                    />
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                    <strong>Received by:</strong> {auth.user?.name || 'Current User'}
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="secondary" onClick={closeStockModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="success">
                                        Add Stock
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Deploy Stock Modal */}
            <Modal isOpen={isDeployModalOpen} onClose={closeDeployModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900">
                                Deploy Stock - {selectedPeripheral?.brand} {selectedPeripheral?.model}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Available Stock: {selectedPeripheral?.available_stock || 0}
                            </p>

                            <form onSubmit={handleDeploySubmit} className="mt-4 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputTextComponent
                                        label="Quantity *"
                                        id="quantity"
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        max={selectedPeripheral?.available_stock || 1}
                                        value={deployForm.quantity || ''}
                                        onChange={(e) => setDeployForm({...deployForm, quantity: e.target.value})}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Station (Optional)</label>
                                        <select
                                            value={deployForm.station_id || ''}
                                            onChange={(e) => setDeployForm({...deployForm, station_id: e.target.value})}
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
                                    <InputTextComponent
                                        label="Deployed To *"
                                        id="deployed_to"
                                        name="deployed_to"
                                        value={deployForm.deployed_to || ''}
                                        onChange={(e) => setDeployForm({...deployForm, deployed_to: e.target.value})}
                                        placeholder="Person/Department receiving the peripheral"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                    <textarea
                                        value={deployForm.notes || ''}
                                        onChange={(e) => setDeployForm({...deployForm, notes: e.target.value})}
                                        rows={2}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Deployment notes..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="secondary" onClick={closeDeployModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        Deploy Stock
                                    </Button>
                                </div>
                            </form>
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
        </div>
    )
}