import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import Alert from '@/app/pages/components/alert'
import InputTextComponent from '@/app/pages/components/input-text-component'
import { ChevronDownIcon, ChevronUpIcon, EyeIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'

export default function PartsTableSection({ initialParts = [] }) {
    // This is a hacky fix for when we have syntax errors in the file
    // Adding this empty function helps JSX close properly
    const fixSyntaxErrors = () => {};
    const dispatch = useDispatch()
    const partsState = useSelector(state => state.parts) || {}
    // Ensure parts is always an array, even if it's on partsState directly
    const [localParts, setLocalParts] = useState(initialParts || []);
    // This composite approach ensures we always have parts data from somewhere
    const parts = localParts.length > 0 ? localParts :
                 (Array.isArray(partsState?.parts) && partsState.parts.length > 0) ? partsState.parts : 
                 (Array.isArray(partsState) && partsState.length > 0) ? partsState : 
                 initialParts.length > 0 ? initialParts : []
    const deliveryHistory = partsState.deliveryHistory || []
    
    // State for UI
    const [loading, setLoading] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedPart, setSelectedPart] = useState(null)
    const [sortConfig, setSortConfig] = useState({
        key: 'name',
        direction: 'asc'
    })
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        brand: '',
        location: '',
        stockStatus: ''
    })
    const [alert, setAlert] = useState({
        show: false,
        type: '',
        message: ''
    })

    // Current user state
    const [currentUser, setCurrentUser] = useState('')

    // Fetch parts on component mount
    useEffect(() => {
        fetchParts();
    }, []);

    // Force refresh handling
    const [forceUpdateCounter, setForceUpdateCounter] = useState(0);
    
    // Monitor Redux state changes
    useEffect(() => {
        if (partsState?.parts?.length > 0) {
            // Clear loading state if we got data
            setLoading(false);
            setForceUpdateCounter(c => c + 1);
        }
    }, [partsState?.parts]);

    // Monitor local state changes
    useEffect(() => {
        if (localParts.length > 0) {
            setLoading(false);
            setForceUpdateCounter(c => c + 1);
        }
    }, [localParts.length]);

    // Function to fetch parts from the API
    const fetchParts = async () => {
        setLoading(true);
        
        try {
            // First try to get from Redux
            if (partsState?.parts?.length > 0) {
                console.log("Parts data already in Redux store");
                setLoading(false);
                return;
            }
            
            // Attempt API fetch
            const response = await fetch('/api/parts')
            
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success && Array.isArray(data.parts)) {
                setLocalParts(data.parts);
                
                // Also update Redux
                dispatch({
                    type: 'FETCH_PARTS_SUCCESS',
                    payload: { 
                        parts: data.parts, 
                        deliveryHistory: data.deliveryHistory || [] 
                    }
                });
                
                setLoading(false);

                // Show success message
                setAlert({
                    show: true,
                    type: 'success',
                    message: 'Parts data loaded successfully'
                });
                
                // Auto-hide alert after 3 seconds
                setTimeout(() => {
                    setAlert({ show: false, type: '', message: '' });
                }, 3000);
                
            } else {
                throw new Error('Invalid data format received from API')
            }
        } catch (error) {
            console.error("Error fetching parts:", error);
            
            // Try fallback to mock data if in development
            if (process.env.NODE_ENV !== 'production') {
                console.log("Falling back to mock data due to API error");
                setTimeout(() => {
                    const mockParts = [
                        { id: 1, name: 'Intel Core i7', type: 'cpu', brand: 'Intel', model: 'i7-11700K', current_stock: 5, location: 'main', unit_price: 349 },
                        { id: 2, name: 'NVIDIA RTX 3080', type: 'gpu', brand: 'NVIDIA', model: 'RTX 3080', current_stock: 2, location: 'main', unit_price: 699 },
                        { id: 3, name: 'Corsair Vengeance', type: 'ram', brand: 'Corsair', model: 'Vengeance LPX 16GB', current_stock: 10, location: 'storage', unit_price: 89 }
                    ];
                    
                    setLocalParts(mockParts);
                    setLoading(false);
                    
                    // Dispatch to Redux as well
                    dispatch({
                        type: 'FETCH_PARTS_SUCCESS',
                        payload: { parts: mockParts, deliveryHistory: [] }
                    });
                    
                    console.log("Mock parts loaded:", mockParts.length, "items");
                }, 200);
            }
        }
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            brand: '',
            location: '',
            stockStatus: ''
        })
    }

    const handleSort = (key) => {
        let direction = 'asc'
        
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc'
        }
        
        setSortConfig({ key, direction })
    }

    const handleDelete = (part) => {
        setSelectedPart(part)
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!selectedPart) return
        
        try {
            const response = await fetch(`/api/parts/${selectedPart.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            })
            
            if (response.ok) {
                // Update local state
                const updatedParts = parts.filter(part => part.id !== selectedPart.id)
                setLocalParts(updatedParts)
                
                // Update Redux state
                if (partsState?.parts) {
                    dispatch({
                        type: 'FETCH_PARTS_SUCCESS',
                        payload: { 
                            parts: updatedParts, 
                            deliveryHistory: partsState.deliveryHistory || [] 
                        }
                    });
                }
                
                setShowDeleteModal(false)
                setAlert({
                    show: true,
                    type: 'success',
                    message: `Part ${selectedPart.name} deleted successfully`
                })
                
                // Auto-hide alert after 3 seconds
                setTimeout(() => {
                    setAlert({ show: false, type: '', message: '' })
                }, 3000)
            } else {
                throw new Error('Failed to delete part')
            }
        } catch (error) {
            console.error('Error deleting part:', error)
            setAlert({
                show: true,
                type: 'error',
                message: `Failed to delete part: ${error.message}`
            })
        }
    }

    const handleEdit = (part) => {
        setSelectedPart(part)
        setShowEditModal(true)
    }

    const handleView = (part) => {
        setSelectedPart(part)
        // Navigate to part detail page
    }

    // Filter and sort the parts data
    const filteredAndSortedParts = [...(parts || [])]
        .filter(part => {
            const searchMatch = filters.search === '' || 
                part.name?.toLowerCase().includes(filters.search.toLowerCase()) || 
                part.type?.toLowerCase().includes(filters.search.toLowerCase()) || 
                part.brand?.toLowerCase().includes(filters.search.toLowerCase()) || 
                part.model?.toLowerCase().includes(filters.search.toLowerCase())
            
            const typeMatch = filters.type === '' || part.type === filters.type
            const brandMatch = filters.brand === '' || part.brand === filters.brand
            const locationMatch = filters.location === '' || part.location === filters.location
            
            let stockStatusMatch = true
            if (filters.stockStatus === 'in-stock') {
                stockStatusMatch = part.current_stock > 0
            } else if (filters.stockStatus === 'out-of-stock') {
                stockStatusMatch = part.current_stock <= 0
            } else if (filters.stockStatus === 'low-stock') {
                stockStatusMatch = part.current_stock > 0 && part.current_stock <= 5
            }
            
            return searchMatch && typeMatch && brandMatch && locationMatch && stockStatusMatch
        })
        .sort((a, b) => {
            if (sortConfig.key === 'current_stock' || sortConfig.key === 'unit_price') {
                // Numeric sort
                if (sortConfig.direction === 'asc') {
                    return (a[sortConfig.key] || 0) - (b[sortConfig.key] || 0)
                } else {
                    return (b[sortConfig.key] || 0) - (a[sortConfig.key] || 0)
                }
            } else {
                // String sort
                const aValue = a[sortConfig.key] || ''
                const bValue = b[sortConfig.key] || ''
                
                if (sortConfig.direction === 'asc') {
                    return aValue.localeCompare(bValue)
                } else {
                    return bValue.localeCompare(aValue)
                }
            }
        })
    
    // Extract unique values for filters
    const uniqueTypes = [...new Set(parts.map(part => part.type))].filter(Boolean)
    const uniqueBrands = [...new Set(parts.map(part => part.brand))].filter(Boolean)
    const uniqueLocations = [...new Set(parts.map(part => part.location))].filter(Boolean)
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10
    const indexOfLastItem = currentPage * itemsPerPage
    const indexOfFirstItem = indexOfLastItem - itemsPerPage
    const currentItems = filteredAndSortedParts.slice(indexOfFirstItem, indexOfLastItem)
    const totalPages = Math.ceil(filteredAndSortedParts.length / itemsPerPage)
    
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    return (
        <div>
            {alert.show && (
                <Alert
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ ...alert, show: false })}
                />
            )}
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Parts Inventory</h2>
                <Button onClick={() => setShowAddModal(true)} text="Add New Part" />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search</label>
                        <input
                            type="text"
                            id="search"
                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            placeholder="Search by name, type, brand..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                            id="type"
                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                        >
                            <option value="">All Types</option>
                            {uniqueTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                        <select
                            id="brand"
                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            value={filters.brand}
                            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                        >
                            <option value="">All Brands</option>
                            {uniqueBrands.map((brand) => (
                                <option key={brand} value={brand}>{brand}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <select
                            id="location"
                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            value={filters.location}
                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                        >
                            <option value="">All Locations</option>
                            {uniqueLocations.map((location) => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label htmlFor="stockStatus" className="block text-sm font-medium text-gray-700">Stock Status</label>
                        <select
                            id="stockStatus"
                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                            value={filters.stockStatus}
                            onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                        >
                            <option value="">All Stock</option>
                            <option value="in-stock">In Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                            <option value="low-stock">Low Stock (≤ 5)</option>
                        </select>
                    </div>
                    
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                        Showing 1-{Math.min(parts.length || localParts.length, itemsPerPage)} of {parts.length || localParts.length} parts
                        {localParts.length > 0 && parts.length === 0 && (
                            <span className="ml-2 text-xs text-purple-600">(using local state)</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Data table section */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
                {loading ? (
                    <p className="text-center py-8">Loading parts data...</p>
                ) : (!parts || parts.length === 0) && localParts.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No parts found in inventory.</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Try refreshing the page or contact the system administrator.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center">
                                            ID
                                            {sortConfig.key === 'id' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center">
                                            Name
                                            {sortConfig.key === 'name' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('type')}
                                    >
                                        <div className="flex items-center">
                                            Type
                                            {sortConfig.key === 'type' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('brand')}
                                    >
                                        <div className="flex items-center">
                                            Brand
                                            {sortConfig.key === 'brand' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('model')}
                                    >
                                        <div className="flex items-center">
                                            Model
                                            {sortConfig.key === 'model' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('current_stock')}
                                    >
                                        <div className="flex items-center">
                                            Stock
                                            {sortConfig.key === 'current_stock' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('location')}
                                    >
                                        <div className="flex items-center">
                                            Location
                                            {sortConfig.key === 'location' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('unit_price')}
                                    >
                                        <div className="flex items-center">
                                            Price
                                            {sortConfig.key === 'unit_price' && (
                                                sortConfig.direction === 'asc' ? 
                                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map((part, index) => (
                                    <tr key={part.id || index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {part.id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {part.name || 'Unknown Part'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {part.type || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {part.brand || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {part.model || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                part.current_stock <= 0 ? 'bg-red-100 text-red-800' : 
                                                part.current_stock <= 5 ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {part.current_stock || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {part.location || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${part.unit_price ? part.unit_price.toFixed(2) : '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                            <div className="flex justify-center space-x-2">
                                                <button 
                                                    onClick={() => handleView(part)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(part)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-5 w-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(part)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                    <nav className="inline-flex rounded-md shadow">
                        <button
                            onClick={() => goToPage(1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            First
                        </button>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Previous
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pageNumber = currentPage - 2 + i;
                            if (pageNumber > 0 && pageNumber <= totalPages) {
                                return (
                                    <button
                                        key={pageNumber}
                                        onClick={() => goToPage(pageNumber)}
                                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                            pageNumber === currentPage
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                );
                            }
                            return null;
                        })}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Next
                        </button>
                        <button
                            onClick={() => goToPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                                currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            Last
                        </button>
                    </nav>
                </div>
            )}
            
            {/* Add Part Modal */}
            {showAddModal && (
                <Modal
                    title="Add New Part"
                    onClose={() => setShowAddModal(false)}
                >
                    {/* Add part form */}
                    <div className="p-4">
                        <p>Add part form goes here...</p>
                    </div>
                </Modal>
            )}
            
            {/* Edit Part Modal */}
            {showEditModal && selectedPart && (
                <Modal
                    title={`Edit Part: ${selectedPart.name}`}
                    onClose={() => setShowEditModal(false)}
                >
                    {/* Edit part form */}
                    <div className="p-4">
                        <p>Edit part form for {selectedPart.name} goes here...</p>
                    </div>
                </Modal>
            )}
            
            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedPart && (
                <DeleteConfirmationModal
                    title="Delete Part"
                    message={`Are you sure you want to delete ${selectedPart.name || 'this part'}? This action cannot be undone.`}
                    onConfirm={confirmDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </div>
    )
}
