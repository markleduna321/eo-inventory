import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import Alert from '@/app/pages/components/alert'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'

export default function PartsTableSection() {
    const dispatch = useDispatch()
    const { parts, deliveryHistory } = useSelector(state => state.parts)
    const [loading, setLoading] = useState(true)
    const [sortField, setSortField] = useState('id')
    const [sortDirection, setSortDirection] = useState('asc')
    
    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        brand: '',
        location: '',
        stockStatus: ''
    })
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    
    // Details Modal
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [selectedPart, setSelectedPart] = useState(null)
    const [partItems, setPartItems] = useState([])
    const [activeTab, setActiveTab] = useState('details')
    
    // Stock Modal
    const [stockModalOpen, setStockModalOpen] = useState(false)
    const [stockAction, setStockAction] = useState('add') // 'add' or 'remove'
    const [stockFormData, setStockFormData] = useState({
        quantity: '',
        supplier: '',
        unit_price: '',
        delivery_date: new Date().toISOString().split('T')[0],
        notes: '',
        items: []
    })

    // Delete Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    // Alert state
    const [alert, setAlert] = useState({
        show: false,
        type: '',
        message: ''
    })

    // Current user state
    const [currentUser, setCurrentUser] = useState('')

    // Example function implementations (these should match the existing functions)
    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
    };
    
    const closeStockModal = () => {
        setStockModalOpen(false);
    };
    
    const handleDeleteConfirm = () => {
        // Implementation goes here
    };
    
    const handleStockSubmit = (e) => {
        e.preventDefault();
        // Implementation goes here
    };
    
    const handleEditSubmit = (e) => {
        e.preventDefault();
        // Implementation goes here
    };

    const exportToCSV = () => {
        // Implementation goes here
    };

    const fetchParts = () => {
        // Implementation goes here
    };

    const clearFilters = () => {
        // Implementation goes here
    };

    const handleFilterChange = (key, value) => {
        // Implementation goes here
    };

    const handleSort = (field) => {
        // Implementation goes here
    };

    const handlePageChange = (page) => {
        // Implementation goes here
    };

    const SortIcon = ({ field }) => {
        // Implementation goes here
        return null;
    };

    const handleStockItemChange = (index, field, value) => {
        // Implementation goes here
    };

    const addStockItem = () => {
        // Implementation goes here
    };

    const removeStockItem = (index) => {
        // Implementation goes here
    };

    // Main render function
    return (
        <div className="space-y-6">
            {/* Alert */}
            {alert.show && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                />
            )}
            
            {/* Header section with stats */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">Parts Inventory</h2>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={exportToCSV}
                        disabled={parts.length === 0}
                    >
                        Export CSV
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchParts}
                    >
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Total Parts Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl shadow-lg ring-1 ring-blue-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-blue-600 uppercase tracking-wide">Total Parts</div>
                            <div className="text-3xl font-bold text-blue-900 mt-2">{parts.length || 0}</div>
                        </div>
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                {/* Other stat cards would go here */}
            </div>

            {/* Filter section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-lg ring-1 ring-gray-200/50">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Filter Options</h3>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={clearFilters}
                    >
                        Clear All
                    </Button>
                </div>
                
                {/* Filter options would go here */}
            </div>

            {/* Data table section */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                {/* Table would go here */}
                <p className="text-center py-8">Loading parts data...</p>
            </div>
            
            {/* Modals */}
            <Modal isOpen={detailsModalOpen} onClose={closeDetailsModal}>
                {selectedPart && (
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {selectedPart.brand} {selectedPart.model}
                                </h3>
                                
                                {/* Tabs */}
                                <div className="border-b border-gray-200 mb-4">
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
                                
                                {/* Tab content would go here */}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={stockModalOpen} onClose={closeStockModal}>
                {selectedPart && (
                    <div className="bg-white max-h-[90vh] flex flex-col">
                        <div className="px-4 pt-5 sm:p-6 pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Manage Stock - {selectedPart.brand} {selectedPart.model}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Current Stock: <span className="font-semibold">{parseInt(selectedPart.current_stock) || 0}</span>
                            </p>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                            <form id="stock-form" onSubmit={handleStockSubmit} className="space-y-4 py-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="stockAction"
                                                value="add"
                                                checked={stockAction === 'add'}
                                                onChange={(e) => setStockAction(e.target.value)}
                                                className="mr-2"
                                            />
                                            Add Stock
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="stockAction"
                                                value="remove"
                                                checked={stockAction === 'remove'}
                                                onChange={(e) => setStockAction(e.target.value)}
                                                className="mr-2"
                                            />
                                            Remove Stock
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                                    <textarea
                                        rows={2}
                                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                        value={stockFormData.notes}
                                        onChange={(e) => setStockFormData(prev => ({ ...prev, notes: e.target.value }))}
                                    ></textarea>
                                </div>
                                
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button type="button" variant="secondary" onClick={closeStockModal}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="primary">
                                        {stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Modal>
            
            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Part"
                message="Are you sure you want to delete this part? This action cannot be undone."
            />
        </div>
    );
}
