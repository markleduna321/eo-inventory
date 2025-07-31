import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import Alert from '@/app/pages/components/alert'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'

export default function PartsTableSection() {
    const [parts, setParts] = useState([])
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
    const [deliveryHistory, setDeliveryHistory] = useState([])
    const [activeTab, setActiveTab] = useState('details') // 'details', 'edit', or 'history'
    const [editForm, setEditForm] = useState({
        type: '',
        brand: '',
        model: '',
        description: '',
        specifications: {},
        location: '',
        unit_price: '',
        notes: ''
    })
    
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

    const fetchParts = async () => {
        try {
            const response = await fetch('/api/parts', {
                headers: { 'Accept': 'application/json' }
            })
            if (response.ok) {
                const data = await response.json()
                setParts(data)
            }
        } catch (error) {
            console.error('Error fetching parts:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCurrentUser = () => {
        // Get current user from localStorage or document
        // This approach prevents the API call that was causing the 401 error
        const storedUser = localStorage.getItem('userName') || '';
        if (storedUser) {
            setCurrentUser(storedUser);
        } else if (window.Laravel && window.Laravel.user) {
            // Check if Laravel puts user in window object (common pattern)
            setCurrentUser(window.Laravel.user.name);
            // Save for future use
            localStorage.setItem('userName', window.Laravel.user.name);
        } else {
            // Default user name when authentication info isn't available
            // This prevents null/undefined issues in your code
            setCurrentUser('System User');
        }
    }

    useEffect(() => {
        fetchParts()
        getCurrentUser()
    }, [])

    const openDetailsModal = async (part) => {
        setSelectedPart(part)
        setDetailsModalOpen(true)
        setActiveTab('details')
        
        // Initialize edit form with part data
        setEditForm({
            type: part.type || '',
            brand: part.brand || '',
            model: part.model || '',
            description: part.description || '',
            specifications: part.specifications || {},
            location: part.location || '',
            unit_price: part.unit_price || '',
            notes: part.notes || ''
        })
        
        // Fetch individual items for this part
        try {
            const itemsResponse = await fetch(`/api/parts/${part.id}/items`, {
                headers: { 'Accept': 'application/json' }
            })
            if (itemsResponse.ok) {
                const items = await itemsResponse.json()
                setPartItems(items)
            } else {
                setPartItems([])
            }
            
            // Fetch delivery history
            const historyResponse = await fetch(`/api/parts/${part.id}/delivery-history`, {
                headers: { 'Accept': 'application/json' }
            })
            if (historyResponse.ok) {
                const history = await historyResponse.json()
                setDeliveryHistory(history)
            } else {
                setDeliveryHistory([])
            }
        } catch (error) {
            console.error('Error fetching part data:', error)
            setPartItems([])
            setDeliveryHistory([])
        }
    }

    const closeDetailsModal = () => {
        setDetailsModalOpen(false)
        setSelectedPart(null)
        setPartItems([])
        setDeliveryHistory([])
        setActiveTab('details')
        setEditForm({
            type: '',
            brand: '',
            model: '',
            description: '',
            specifications: {},
            location: '',
            unit_price: '',
            notes: ''
        })
    }

    const openStockModal = (part) => {
        setSelectedPart(part)
        setStockModalOpen(true)
        setStockFormData({
            quantity: '',
            supplier: '',
            unit_price: part.unit_price || '',
            delivery_date: new Date().toISOString().split('T')[0],
            notes: '',
            items: []
        })
    }

    const closeStockModal = () => {
        setStockModalOpen(false)
        setSelectedPart(null)
        setStockFormData({
            quantity: '',
            supplier: '',
            unit_price: '',
            delivery_date: new Date().toISOString().split('T')[0],
            notes: '',
            items: []
        })
    }

    const handleDelete = (partId) => {
        setDeleteId(partId)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/api/parts/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            })
            
            if (response.ok) {
                fetchParts() // Refresh the parts list
                setAlert({
                    show: true,
                    type: 'success',
                    message: 'Part deleted successfully!'
                })
                setIsDeleteModalOpen(false)
                setDeleteId(null)
            } else {
                const errorData = await response.json()
                console.error('Failed to delete part:', errorData)
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Failed to delete part. Please try again.'
                })
            }
        } catch (error) {
            console.error('Error deleting part:', error)
            setAlert({
                show: true,
                type: 'error',
                message: 'An error occurred while deleting the part.'
            })
        }
    }
    
    // Handle edit part submission
    const handleEditSubmit = async (e) => {
        e.preventDefault()
        
        if (!selectedPart) return
        
        try {
            const response = await fetch(`/api/parts/${selectedPart.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(editForm)
            })
            
            if (response.ok) {
                const updatedPart = await response.json()
                
                // Update the part in the parts list
                setParts(prev => prev.map(part => 
                    part.id === updatedPart.id ? updatedPart : part
                ))
                
                // Update the selectedPart
                setSelectedPart(updatedPart)
                
                // Show success message
                setAlert({
                    show: true,
                    type: 'success',
                    message: 'Part updated successfully!'
                })
                
                // Switch back to details tab
                setActiveTab('details')
            } else {
                const errorData = await response.json()
                console.error('Failed to update part:', errorData)
                
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Failed to update part. Please try again.'
                })
            }
        } catch (error) {
            console.error('Error updating part:', error)
            
            setAlert({
                show: true,
                type: 'error',
                message: 'An error occurred while updating the part.'
            })
        }
    }

    const handleStockSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const endpoint = stockAction === 'add' 
                ? `/api/parts/${selectedPart.id}/add-stock`
                : `/api/parts/${selectedPart.id}/remove-stock`
                
            const actualQuantity = stockFormData.items.length > 0 ? stockFormData.items.length : stockFormData.quantity
                
            const payload = stockAction === 'add' 
                ? {
                    quantity_delivered: actualQuantity,
                    unit_price: stockFormData.unit_price,
                    supplier: stockFormData.supplier,
                    delivery_date: stockFormData.delivery_date,
                    notes: stockFormData.notes,
                    received_by: currentUser, // You might want to get this from auth user
                    items: stockFormData.items
                }
                : {
                    quantity: actualQuantity,
                    reason: 'manual', // You might want to add a reason field
                    notes: stockFormData.notes,
                    removed_by: currentUser // You might want to get this from auth user
                }
                
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                closeStockModal()
                fetchParts() // Refresh the parts list
                setAlert({
                    show: true,
                    type: 'success',
                    message: `Stock ${stockAction === 'add' ? 'added' : 'removed'} successfully!`
                })
            } else {
                const errorData = await response.json()
                console.error('Failed to update stock:', errorData)
                setAlert({
                    show: true,
                    type: 'error',
                    message: 'Failed to update stock. Please try again.'
                })
            }
        } catch (error) {
            console.error('Error updating stock:', error)
            setAlert({
                show: true,
                type: 'error',
                message: 'An error occurred while updating stock.'
            })
        }
    }

    const addStockItem = () => {
        setStockFormData(prev => ({
            ...prev,
            items: [...prev.items, { 
                serial_number: '', 
                barcode: '',
                unit_price: prev.unit_price || '',
                supplier: prev.supplier || ''
            }]
        }))
    }

    const removeStockItem = (index) => {
        setStockFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
    }

    const handleStockItemChange = (index, field, value) => {
        const newItems = [...stockFormData.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setStockFormData(prev => ({ ...prev, items: newItems }))
    }

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortDirection('asc')
        }
    }

    // Filter and search logic
    const filteredParts = parts.filter(part => {
        const matchesSearch = !filters.search || 
            part.brand.toLowerCase().includes(filters.search.toLowerCase()) ||
            part.model.toLowerCase().includes(filters.search.toLowerCase()) ||
            part.type.toLowerCase().includes(filters.search.toLowerCase())
        
        const matchesType = !filters.type || part.type === filters.type
        const matchesBrand = !filters.brand || part.brand === filters.brand
        const matchesLocation = !filters.location || part.location === filters.location
        
        const stock = parseInt(part.current_stock) || 0
        const matchesStockStatus = !filters.stockStatus || 
            (filters.stockStatus === 'in_stock' && stock > 5) ||
            (filters.stockStatus === 'low_stock' && stock > 0 && stock <= 5) ||
            (filters.stockStatus === 'out_of_stock' && stock === 0)
        
        return matchesSearch && matchesType && matchesBrand && matchesLocation && matchesStockStatus
    })

    // Get unique values for filter options
    const uniqueTypes = [...new Set(parts.map(part => part.type))].sort()
    const uniqueBrands = [...new Set(parts.map(part => part.brand))].sort()
    const uniqueLocations = [...new Set(parts.map(part => part.location))].sort()

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            brand: '',
            location: '',
            stockStatus: ''
        })
        setCurrentPage(1) // Reset to first page when clearing filters
    }

    const sortedParts = [...filteredParts].sort((a, b) => {
        let aValue = a[sortField]
        let bValue = b[sortField]

        // Handle nested objects (like specifications)
        if (sortField.includes('.')) {
            const fields = sortField.split('.')
            aValue = fields.reduce((obj, field) => obj?.[field], a)
            bValue = fields.reduce((obj, field) => obj?.[field], b)
        }

        // Convert to string for comparison
        aValue = String(aValue || '').toLowerCase()
        bValue = String(bValue || '').toLowerCase()

        if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue)
        } else {
            return bValue.localeCompare(aValue)
        }
    })

    // Pagination calculations
    const totalPages = Math.ceil(sortedParts.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedParts = sortedParts.slice(startIndex, endIndex)

    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    const handleFilterChange = (filterKey, value) => {
        setFilters(prev => ({ ...prev, [filterKey]: value }))
        setCurrentPage(1) // Reset to first page when filtering
    }

    const formatSpecifications = (specs) => {
        if (!specs || typeof specs !== 'object') return 'N/A'
        
        return Object.entries(specs)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
    }

    const getStockStatus = (currentStock, minStock = 5) => {
        const stock = parseInt(currentStock) || 0
        const min = parseInt(minStock) || 5
        
        if (stock === 0) {
            return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' }
        } else if (stock <= min) {
            return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' }
        } else {
            return { text: 'In Stock', color: 'text-green-600 bg-green-50' }
        }
    }

    const formatPartType = (type) => {
        const typeMap = {
            'ram': 'RAM',
            'ssd': 'SSD',
            'hdd': 'HDD',
            'gpu': 'GPU',
            'cpu': 'CPU',
            'motherboard': 'Motherboard',
            'psu': 'PSU'
        }
        return typeMap[type] || type.toUpperCase()
    }

    const exportToCSV = () => {
        if (parts.length === 0) return

        const headers = ['ID', 'Type', 'Brand', 'Model', 'Current Stock', 'Location', 'Unit Price', 'Specifications']
        const csvContent = [
            headers.join(','),
            ...parts.map(part => [
                part.id,
                formatPartType(part.type),
                part.brand,
                part.model,
                part.current_stock,
                part.location,
                part.unit_price || '0.00',
                `"${formatSpecifications(part.specifications)}"`
            ].join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `parts-inventory-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const SortIcon = ({ field }) => {
        if (sortField !== field) return null
        return sortDirection === 'asc' ? 
            <ChevronUpIcon className="w-4 h-4" /> : 
            <ChevronDownIcon className="w-4 h-4" />
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
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
            
            {/* Alert */}
            {alert.show && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                />
            )}
            
            {/* Header with Export Button */}
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

            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl shadow-lg ring-1 ring-green-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-green-600 uppercase tracking-wide">Total Stock</div>
                            <div className="text-3xl font-bold text-green-900 mt-2">
                                {parts.reduce((sum, part) => sum + (parseInt(part.current_stock) || 0), 0)}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-6 rounded-xl shadow-lg ring-1 ring-yellow-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Low Stock</div>
                            <div className="text-3xl font-bold text-yellow-900 mt-2">
                                {parts.filter(part => {
                                    const stock = parseInt(part.current_stock) || 0
                                    return stock > 0 && stock <= 5
                                }).length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-xl shadow-lg ring-1 ring-red-200/50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-red-600 uppercase tracking-wide">Out of Stock</div>
                            <div className="text-3xl font-bold text-red-900 mt-2">
                                {parts.filter(part => (parseInt(part.current_stock) || 0) === 0).length}
                            </div>
                        </div>
                        <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Filters */}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <InputTextComponent
                            type="text"
                            placeholder="Search parts..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                        >
                            <option value="">All Types</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Brand Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filters.brand}
                            onChange={(e) => handleFilterChange('brand', e.target.value)}
                        >
                            <option value="">All Brands</option>
                            {uniqueBrands.map(brand => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>

                    {/* Location Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                        >
                            <option value="">All Locations</option>
                            {uniqueLocations.map(location => (
                                <option key={location} value={location}>{location.replace('_', ' ').charAt(0).toUpperCase() + location.replace('_', ' ').slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Stock Status Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                        <select
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            value={filters.stockStatus}
                            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="in_stock">In Stock (&gt;5)</option>
                            <option value="low_stock">Low Stock (1-5)</option>
                            <option value="out_of_stock">Out of Stock (0)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4 text-sm text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, sortedParts.length)} of {sortedParts.length} parts 
                    {sortedParts.length !== parts.length && ` (filtered from ${parts.length} total)`}
                </div>
            </div>

            {/* Parts Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                {filteredParts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            {parts.length === 0 ? 'No parts found in inventory.' : 'No parts match the current filters.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-xl shadow-lg ring-1 ring-gray-200/50">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors duration-200"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>ID</span>
                                            <SortIcon field="id" />
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors duration-200"
                                        onClick={() => handleSort('type')}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span>Type</span>
                                            <SortIcon field="type" />
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors duration-200"
                                        onClick={() => handleSort('brand')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Brand
                                            <SortIcon field="brand" />
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('model')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Model
                                            <SortIcon field="model" />
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('current_stock')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Stock
                                            <SortIcon field="current_stock" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('location')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Location
                                            <SortIcon field="location" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Specifications
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('unit_price')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Price
                                            <SortIcon field="unit_price" />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedParts.map((part) => {
                                    const stockStatus = getStockStatus(part.current_stock)
                                    return (
                                        <tr key={part.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{part.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {formatPartType(part.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {part.brand}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {part.model}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {parseInt(part.current_stock) || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                                                    {stockStatus.text}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {part.location}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                                {formatSpecifications(part.specifications)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ₱{parseFloat(part.unit_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => openDetailsModal(part)}
                                                        title="View Details"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => openStockModal(part)}
                                                        title="Manage Stock"
                                                    >
                                                        <PlusIcon className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(part.id)}
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Enhanced Pagination */}
            {sortedParts.length > itemsPerPage && (
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
                                <span className="font-semibold text-indigo-600">{Math.min(endIndex, sortedParts.length)}</span>
                                <span>of</span>
                                <span className="font-semibold text-indigo-600">{sortedParts.length}</span>
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
            
            {/* Details/Edit/History Modal */}
            <Modal isOpen={detailsModalOpen} onClose={closeDetailsModal}>
                {selectedPart && (
                    <div className="bg-white">
                        {/* Header */}
                        <div className="px-4 pt-5 pb-3 sm:px-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedPart.brand} {selectedPart.model}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                View details and delivery history, or edit part information
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
                                        Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('edit')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'edit'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Edit
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
                        </div>

                        {/* Tab Content */}
                        <div className="px-4 pb-5 sm:px-6">
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                                            <div className="space-y-2 text-sm">
                                                <div><span className="font-medium">ID:</span> #{selectedPart.id}</div>
                                                <div><span className="font-medium">Type:</span> {formatPartType(selectedPart.type)}</div>
                                                <div><span className="font-medium">Brand:</span> {selectedPart.brand}</div>
                                                <div><span className="font-medium">Model:</span> {selectedPart.model}</div>
                                                <div><span className="font-medium">Location:</span> {selectedPart.location}</div>
                                                <div><span className="font-medium">Current Stock:</span> {parseInt(selectedPart.current_stock) || 0}</div>
                                                <div><span className="font-medium">Unit Price:</span> ₱{parseFloat(selectedPart.unit_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Specifications</h4>
                                            <div className="space-y-2 text-sm">
                                                {selectedPart.specifications && Object.entries(selectedPart.specifications).map(([key, value]) => (
                                                    <div key={key}>
                                                        <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                                                    </div>
                                                ))}
                                                {(!selectedPart.specifications || Object.keys(selectedPart.specifications).length === 0) && (
                                                    <div className="text-gray-500">No specifications available</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Description */}
                                    {selectedPart.description && (
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                            <p className="text-sm text-gray-600">{selectedPart.description}</p>
                                        </div>
                                    )}
                                    
                                    {/* Individual Items */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Individual Items ({partItems.length})</h4>
                                        {partItems.length > 0 ? (
                                            <div className="max-h-60 overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-300">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial Number</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Barcode</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {partItems.map((item) => (
                                                            <tr key={item.id}>
                                                                <td className="px-3 py-2 text-sm text-gray-900">#{item.id}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-900">{item.serial_number || 'N/A'}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-900">{item.barcode || 'N/A'}</td>
                                                                <td className="px-3 py-2 text-sm">
                                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                                                                        item.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                                                                        'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-3 py-2 text-sm text-gray-900">{item.assigned_to || 'N/A'}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-900">₱{parseFloat(item.unit_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                                                <td className="px-3 py-2 text-sm text-gray-900">{item.supplier || 'N/A'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">No individual items tracked for this part.</p>
                                        )}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'edit' && (
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
                                            label="Location"
                                            id="location"
                                            name="location"
                                            value={editForm.location || ''}
                                            onChange={(e) => setEditForm({...editForm, location: e.target.value})}
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
                                    </div>
                                    
                                    <div>
                                        <InputTextComponent
                                            label="Description"
                                            id="description"
                                            name="description"
                                            value={editForm.description || ''}
                                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            multiline={true}
                                            rows={3}
                                        />
                                    </div>
                                    
                                    <div>
                                        <InputTextComponent
                                            label="Notes"
                                            id="notes"
                                            name="notes"
                                            value={editForm.notes || ''}
                                            onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                            multiline={true}
                                            rows={2}
                                        />
                                    </div>
                                    
                                    <div className="flex justify-end gap-3 mt-6">
                                        <Button type="button" variant="secondary" onClick={() => setActiveTab('details')}>
                                            Cancel
                                        </Button>
                                        <Button type="submit" variant="primary">
                                            Update Part
                                        </Button>
                                    </div>
                                </form>
                            )}
                            
                            {activeTab === 'history' && (
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
                                                            {delivery.delivery_status || 'received'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Footer */}
                            {activeTab !== 'edit' && (
                                <div className="flex justify-end mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="md"
                                        onClick={closeDetailsModal}
                                    >
                                        Close
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Stock Management Modal */}
            <Modal isOpen={stockModalOpen} onClose={closeStockModal}>
                {selectedPart && (
                    <div className="bg-white max-h-[90vh] flex flex-col">
                        {/* Fixed Header */}
                        <div className="px-4 pt-5 sm:p-6 pb-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Manage Stock - {selectedPart.brand} {selectedPart.model}
                            </h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Current Stock: <span className="font-semibold">{parseInt(selectedPart.current_stock) || 0}</span>
                            </p>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                            <form id="stock-form" onSubmit={handleStockSubmit} className="space-y-4 py-4">
                                {/* Action Type */}
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

                                    {/* Quantity and Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity *
                                            </label>
                                            <InputTextComponent
                                                type="number"
                                                placeholder="1"
                                                value={stockFormData.items.length > 0 ? stockFormData.items.length : stockFormData.quantity}
                                                onChange={(e) => setStockFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                                required
                                                min="1"
                                                max={stockAction === 'remove' ? selectedPart.current_stock : undefined}
                                                disabled={stockFormData.items.length > 0}
                                            />
                                            {stockFormData.items.length > 0 && (
                                                <p className="text-xs text-blue-600 mt-1">
                                                    Quantity automatically set to {stockFormData.items.length} based on individual items
                                                </p>
                                            )}
                                        </div>
                                        
                                        {stockAction === 'add' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Price (₱)
                                                </label>
                                                <InputTextComponent
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={stockFormData.unit_price}
                                                    onChange={(e) => setStockFormData(prev => ({ ...prev, unit_price: e.target.value }))}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {stockAction === 'add' && (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Supplier
                                                    </label>
                                                    <InputTextComponent
                                                        type="text"
                                                        placeholder="e.g. Newegg, Amazon"
                                                        value={stockFormData.supplier}
                                                        onChange={(e) => setStockFormData(prev => ({ ...prev, supplier: e.target.value }))}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Delivery Date
                                                    </label>
                                                    <InputTextComponent
                                                        type="date"
                                                        value={stockFormData.delivery_date}
                                                        onChange={(e) => setStockFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                                                    />
                                                </div>
                                            </div>

                                            {/* Individual Items for Adding Stock */}
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <h4 className="text-sm font-medium text-gray-900">Individual Items (Optional)</h4>
                                                    <Button
                                                        type="button"
                                                        variant="primary"
                                                        size="xs"
                                                        onClick={addStockItem}
                                                    >
                                                        Add Item
                                                    </Button>
                                                </div>
                                                {stockFormData.items.map((item, index) => (
                                                    <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Serial Number
                                                                </label>
                                                                <InputTextComponent
                                                                    placeholder="Serial Number"
                                                                    value={item.serial_number || ''}
                                                                    onChange={(e) => handleStockItemChange(index, 'serial_number', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Barcode
                                                                </label>
                                                                <InputTextComponent
                                                                    placeholder="Barcode"
                                                                    value={item.barcode || ''}
                                                                    onChange={(e) => handleStockItemChange(index, 'barcode', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Unit Price (₱)
                                                                </label>
                                                                <InputTextComponent
                                                                    type="number"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={item.unit_price || ''}
                                                                    onChange={(e) => handleStockItemChange(index, 'unit_price', e.target.value)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Supplier
                                                                </label>
                                                                <InputTextComponent
                                                                    placeholder="e.g. Newegg, Amazon"
                                                                    value={item.supplier || ''}
                                                                    onChange={(e) => handleStockItemChange(index, 'supplier', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-end">
                                                            <Button
                                                                type="button"
                                                                variant="danger"
                                                                size="xs"
                                                                onClick={() => removeStockItem(index)}
                                                            >
                                                                Remove Item
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional notes..."
                                            value={stockFormData.notes}
                                            onChange={(e) => setStockFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        />
                                    </div>
                            </form>
                        </div>

                        {/* Fixed Footer */}
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={closeStockModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="md"
                                    form="stock-form"
                                >
                                    {stockAction === 'add' ? 'Add Stock' : 'Remove Stock'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Part"
                message="Are you sure you want to delete this part? This action cannot be undone."
            />
        </div>
    )
}