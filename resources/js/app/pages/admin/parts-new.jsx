import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Authenticated from '@/layouts/authenticated-layout';
import { 
    PlusIcon,
    PencilIcon,
    TrashIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

export default function PartsNew({ auth }) {
    // State management
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPart, setEditingPart] = useState(null);
    
    // Filter options
    const categories = [
        'CPU', 'Memory', 'Storage', 'Network', 'Power', 'Cooling', 
        'Chassis', 'Cables', 'Accessories', 'Other'
    ];

    // Fetch parts data
    const fetchParts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/parts');
            const data = await response.json();
            setParts(data.data || []);
        } catch (error) {
            console.error('Error fetching parts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, []);

    // Filter parts based on search and category
    const filteredParts = parts.filter(part => {
        const matchesSearch = !searchTerm || 
            part.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.part_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !selectedCategory || part.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });

    // Create new part
    const createPart = async (partData) => {
        try {
            const response = await fetch('/api/parts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(partData)
            });
            
            if (response.ok) {
                await fetchParts();
                setShowCreateModal(false);
            }
        } catch (error) {
            console.error('Error creating part:', error);
        }
    };

    // Update part
    const updatePart = async (id, partData) => {
        try {
            const response = await fetch(`/api/parts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(partData)
            });
            
            if (response.ok) {
                await fetchParts();
                setEditingPart(null);
            }
        } catch (error) {
            console.error('Error updating part:', error);
        }
    };

    // Delete part
    const deletePart = async (id) => {
        if (!confirm('Are you sure you want to delete this part?')) return;
        
        try {
            const response = await fetch(`/api/parts/${id}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });
            
            if (response.ok) {
                await fetchParts();
            }
        } catch (error) {
            console.error('Error deleting part:', error);
        }
    };

    return (
        <Authenticated user={auth.user}>
            <Head title="Parts Inventory" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Parts Inventory</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage components for system units
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Part
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search parts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                
                                {/* Category Filter */}
                                <div className="sm:w-48">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parts Grid */}
                    <div className="bg-white shadow rounded-lg">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-2 text-gray-600">Loading parts...</p>
                            </div>
                        ) : filteredParts.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No parts found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Part
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Price
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredParts.map((part) => (
                                            <tr key={part.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {part.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {part.part_number}
                                                        </div>
                                                        {part.brand && (
                                                            <div className="text-xs text-gray-400">
                                                                {part.brand} {part.model}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {part.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                                            part.quantity_in_stock > part.minimum_stock_level 
                                                                ? 'bg-green-400' 
                                                                : 'bg-red-400'
                                                        }`}></span>
                                                        {part.quantity_in_stock}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    ${part.unit_price}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        part.status === 'active' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {part.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => setEditingPart(part)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePart(part.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
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
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(showCreateModal || editingPart) && (
                <PartModal
                    part={editingPart}
                    categories={categories}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingPart(null);
                    }}
                    onSubmit={editingPart ? 
                        (data) => updatePart(editingPart.id, data) : 
                        createPart
                    }
                />
            )}
        </Authenticated>
    );
}

// Part Modal Component
function PartModal({ part, categories, onClose, onSubmit }) {
    const [formData, setFormData] = useState({
        part_number: part?.part_number || '',
        name: part?.name || '',
        category: part?.category || '',
        brand: part?.brand || '',
        model: part?.model || '',
        description: part?.description || '',
        unit_price: part?.unit_price || '',
        quantity_in_stock: part?.quantity_in_stock || '',
        minimum_stock_level: part?.minimum_stock_level || '',
        status: part?.status || 'active'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {part ? 'Edit Part' : 'Create New Part'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Part Number</label>
                            <input
                                type="text"
                                name="part_number"
                                value={formData.part_number}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">Select Category</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Brand</label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Model</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="unit_price"
                                    value={formData.unit_price}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                                <input
                                    type="number"
                                    name="quantity_in_stock"
                                    value={formData.quantity_in_stock}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Minimum Stock Level</label>
                            <input
                                type="number"
                                name="minimum_stock_level"
                                value={formData.minimum_stock_level}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="discontinued">Discontinued</option>
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {part ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
