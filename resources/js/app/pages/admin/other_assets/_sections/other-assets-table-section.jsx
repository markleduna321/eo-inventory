import React, { useState, useEffect } from 'react';
import Button from '@/app/pages/components/button';
import Modal from '@/app/pages/components/modal';
import InputTextComponent from '@/app/pages/components/input-text-component';
import InputSelectComponent from '@/app/pages/components/input-select';
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal';
import { 
    EyeIcon, 
    PencilIcon, 
    TrashIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowDownCircleIcon,
    QrCodeIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

export default function OtherAssetsTableSection() {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
    });

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        asset_type: '',
        status: '',
        location_id: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState({
        asset_types: [],
        status_options: [],
        locations: []
    });

    // Modal states
    const [viewAsset, setViewAsset] = useState(null);
    const [editAsset, setEditAsset] = useState(null);
    const [deleteAsset, setDeleteAsset] = useState(null);

    // Edit form states
    const [editFormData, setEditFormData] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    useEffect(() => {
        fetchAssets();
        fetchDropdownOptions();
    }, []);

    useEffect(() => {
        fetchAssets();
    }, [filters, pagination.current_page]);

    const fetchAssets = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current_page,
                per_page: pagination.per_page,
                ...filters
            };

            const response = await axios.get('/api/other-assets', { params });
            
            if (response.data.status === 'success') {
                setAssets(response.data.data.data);
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total
                });
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdownOptions = async () => {
        try {
            const response = await axios.get('/api/other-assets/dropdown-options');
            if (response.data.status === 'success') {
                setDropdownOptions(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching dropdown options:', error);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            asset_type: '',
            status: '',
            location_id: ''
        });
        setPagination(prev => ({ ...prev, current_page: 1 }));
    };

    const handleView = (asset) => {
        setViewAsset(asset);
    };

    const handleEdit = (asset) => {
        setEditAsset(asset);
        setEditFormData({
            name: asset.name || '',
            asset_type: asset.asset_type || '',
            brand: asset.brand || '',
            model: asset.model || '',
            serial_number: asset.serial_number || '',
            description: asset.description || '',
            condition_status: asset.condition_status || '',
            status: asset.status || '',
            location_id: asset.location_id || '',
            assigned_to: asset.assigned_to || '',
            purchase_date: asset.purchase_date || '',
            purchase_price: asset.purchase_price || '',
            warranty_expiry: asset.warranty_expiry || '',
            notes: asset.notes || ''
        });
        setEditFormErrors({});
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsEditSubmitting(true);
        setEditFormErrors({});

        try {
            const response = await axios.put(`/api/other-assets/${editAsset.id}`, editFormData);
            
            if (response.data.status === 'success') {
                fetchAssets();
                setEditAsset(null);
                setEditFormData({});
                // You can add a success toast here
            }
        } catch (error) {
            console.error('Error updating asset:', error);
            if (error.response?.data?.errors) {
                setEditFormErrors(error.response.data.errors);
            }
            // You can add an error toast here
        } finally {
            setIsEditSubmitting(false);
        }
    };

    const setEditFieldValue = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (editFormErrors[field]) {
            setEditFormErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleDelete = (asset) => {
        setDeleteAsset(asset);
    };

    const confirmDelete = async () => {
        if (!deleteAsset) return;

        try {
            const response = await axios.delete(`/api/other-assets/${deleteAsset.id}`);
            
            if (response.data.status === 'success') {
                fetchAssets();
                setDeleteAsset(null);
                // You can add a success toast here
            }
        } catch (error) {
            console.error('Error deleting asset:', error);
            // You can add an error toast here
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Active': 'bg-green-100 text-green-800',
            'Inactive': 'bg-gray-100 text-gray-800',
            'Retired': 'bg-red-100 text-red-800',
            'Lost': 'bg-red-100 text-red-800',
            'Stolen': 'bg-red-100 text-red-800',
            'Under Maintenance': 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    const getConditionBadge = (condition) => {
        const conditionColors = {
            'New': 'bg-blue-100 text-blue-800',
            'Excellent': 'bg-green-100 text-green-800',
            'Good': 'bg-green-100 text-green-800',
            'Fair': 'bg-yellow-100 text-yellow-800',
            'Poor': 'bg-orange-100 text-orange-800',
            'Damaged': 'bg-red-100 text-red-800',
            'Under Repair': 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${conditionColors[condition] || 'bg-gray-100 text-gray-800'}`}>
                {condition}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                    
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {/* Add export functionality */}}
                    >
                        <ArrowDownCircleIcon className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputSelectComponent
                            label="Asset Type"
                            value={filters.asset_type}
                            onChange={(value) => handleFilterChange('asset_type', value)}
                            options={[
                                { value: '', label: 'All Types' },
                                ...dropdownOptions.asset_types.map(type => ({
                                    value: type,
                                    label: type
                                }))
                            ]}
                        />

                        <InputSelectComponent
                            label="Status"
                            value={filters.status}
                            onChange={(value) => handleFilterChange('status', value)}
                            options={[
                                { value: '', label: 'All Statuses' },
                                ...dropdownOptions.status_options.map(status => ({
                                    value: status,
                                    label: status
                                }))
                            ]}
                        />

                        <InputSelectComponent
                            label="Location"
                            value={filters.location_id}
                            onChange={(value) => handleFilterChange('location_id', value)}
                            options={[
                                { value: '', label: 'All Locations' },
                                ...dropdownOptions.locations.map(location => ({
                                    value: location.id,
                                    label: location.name
                                }))
                            ]}
                        />
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    </div>
                </div>
            )}

            {/* Assets Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Asset
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type & Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Location & Assignment
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Purchase Info
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        Loading assets...
                                    </td>
                                </tr>
                            ) : assets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No assets found
                                    </td>
                                </tr>
                            ) : (
                                assets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {asset.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {asset.serial_number || 'No S/N'}
                                                    </div>
                                                    {asset.qr_code && (
                                                        <div className="flex items-center text-xs text-gray-400 mt-1">
                                                            <QrCodeIcon className="h-3 w-3 mr-1" />
                                                            {asset.qr_code}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{asset.asset_type}</div>
                                            <div className="text-sm text-gray-500">
                                                {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : 
                                                 asset.brand || asset.model || 'No brand/model'}
                                            </div>
                                            <div className="mt-1">
                                                {getConditionBadge(asset.condition_status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {asset.location?.name || 'No location'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {asset.assigned_user?.name || 'Unassigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(asset.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {formatCurrency(asset.purchase_price)}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {formatDate(asset.purchase_date)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleView(asset)}
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(asset)}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDelete(asset)}
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

                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={pagination.current_page === 1}
                                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                            >
                                Previous
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                            >
                                Next
                            </Button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                                    </span> of{' '}
                                    <span className="font-medium">{pagination.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={pagination.current_page === 1}
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
                                        className="rounded-l-md"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        disabled={pagination.current_page === pagination.last_page}
                                        onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
                                        className="rounded-r-md"
                                    >
                                        Next
                                    </Button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* View Asset Modal */}
            {viewAsset && (
                <Modal
                    isOpen={!!viewAsset}
                    onClose={() => setViewAsset(null)}
                    width="w-full max-w-4xl mx-4 sm:mx-6 lg:mx-8"
                >
                    <div className="bg-white">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Asset Details</h2>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="px-4 sm:px-6 py-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 mb-4">Basic Information</h3>
                                    <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Asset Type</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.asset_type}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Brand</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.brand || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Model</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.model || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Serial Number</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.serial_number || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">QR Code</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.qr_code || 'N/A'}</dd>
                                    </div>
                                </dl>
                            </div>
                            
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Assignment</h3>
                                <dl className="space-y-3">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Status</dt>
                                        <dd className="text-sm text-gray-900">{getStatusBadge(viewAsset.status)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Condition</dt>
                                        <dd className="text-sm text-gray-900">{getConditionBadge(viewAsset.condition_status)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.location?.name || 'N/A'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                                        <dd className="text-sm text-gray-900">{viewAsset.assigned_user?.name || 'Unassigned'}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Purchase Date</dt>
                                        <dd className="text-sm text-gray-900">{formatDate(viewAsset.purchase_date)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Purchase Price</dt>
                                        <dd className="text-sm text-gray-900">{formatCurrency(viewAsset.purchase_price)}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                        
                        {/* Additional Information Sections */}
                        {viewAsset.description && (
                            <div className="mt-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Description</h3>
                                <p className="text-sm sm:text-base text-gray-700">{viewAsset.description}</p>
                            </div>
                        )}
                        
                        {viewAsset.notes && (
                            <div className="mt-6">
                                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Notes</h3>
                                <p className="text-sm sm:text-base text-gray-700">{viewAsset.notes}</p>
                            </div>
                        )}
                        </div>
                        
                        {/* Footer */}
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setViewAsset(null)}
                                    className="w-full sm:w-auto"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Asset Modal */}
            {editAsset && (
                <Modal
                    isOpen={!!editAsset}
                    onClose={() => {
                        setEditAsset(null);
                        setEditFormData({});
                        setEditFormErrors({});
                    }}
                    width="w-full max-w-6xl mx-4 sm:mx-6 lg:mx-8"
                >
                    <div className="bg-white">
                        {/* Header */}
                        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Edit Asset</h2>
                        </div>
                        
                        {/* Scrollable Content */}
                        <div className="px-4 sm:px-6 py-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleEditSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Basic Information */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
                                        
                                        <div className="lg:col-span-2">
                                            <InputTextComponent
                                                label="Asset Name"
                                                name="name"
                                                value={editFormData.name}
                                                onChange={(e) => setEditFieldValue('name', e.target.value)}
                                                error={editFormErrors.name}
                                                required
                                            />
                                        </div>

                                        <InputSelectComponent
                                            label="Asset Type"
                                            value={editFormData.asset_type}
                                            onChange={(value) => setEditFieldValue('asset_type', value)}
                                            options={[
                                                { value: '', label: 'Select Asset Type' },
                                                ...dropdownOptions.asset_types.map(type => ({
                                                    value: type,
                                                    label: type
                                                }))
                                            ]}
                                            error={editFormErrors.asset_type}
                                            required
                                        />

                                        <InputTextComponent
                                            label="Brand"
                                            name="brand"
                                            value={editFormData.brand}
                                            onChange={(e) => setEditFieldValue('brand', e.target.value)}
                                            error={editFormErrors.brand}
                                        />

                                        <InputTextComponent
                                            label="Model"
                                            name="model"
                                            value={editFormData.model}
                                            onChange={(e) => setEditFieldValue('model', e.target.value)}
                                            error={editFormErrors.model}
                                        />

                                        <InputTextComponent
                                            label="Serial Number"
                                            name="serial_number"
                                            value={editFormData.serial_number}
                                            onChange={(e) => setEditFieldValue('serial_number', e.target.value)}
                                            error={editFormErrors.serial_number}
                                        />
                                    </div>

                                    {/* Status & Details */}
                                    <div className="space-y-4">
                                        <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Status & Details</h3>
                                        
                                        <InputSelectComponent
                                            label="Condition Status"
                                            value={editFormData.condition_status}
                                            onChange={(value) => setEditFieldValue('condition_status', value)}
                                            options={[
                                                { value: '', label: 'Select Condition' },
                                                { value: 'New', label: 'New' },
                                                { value: 'Excellent', label: 'Excellent' },
                                                { value: 'Good', label: 'Good' },
                                                { value: 'Fair', label: 'Fair' },
                                                { value: 'Poor', label: 'Poor' },
                                                { value: 'Damaged', label: 'Damaged' },
                                                { value: 'Under Repair', label: 'Under Repair' }
                                            ]}
                                            error={editFormErrors.condition_status}
                                        />

                                        <InputSelectComponent
                                            label="Status"
                                            value={editFormData.status}
                                            onChange={(value) => setEditFieldValue('status', value)}
                                            options={[
                                                { value: '', label: 'Select Status' },
                                                { value: 'Active', label: 'Active' },
                                                { value: 'Inactive', label: 'Inactive' },
                                                { value: 'Retired', label: 'Retired' },
                                                { value: 'Lost', label: 'Lost' },
                                                { value: 'Stolen', label: 'Stolen' },
                                                { value: 'Under Maintenance', label: 'Under Maintenance' }
                                            ]}
                                            error={editFormErrors.status}
                                            required
                                        />

                                        <InputSelectComponent
                                            label="Location"
                                            value={editFormData.location_id}
                                            onChange={(value) => setEditFieldValue('location_id', value)}
                                            options={[
                                                { value: '', label: 'Select Location' },
                                                ...dropdownOptions.locations.map(location => ({
                                                    value: location.id,
                                                    label: location.name
                                                }))
                                            ]}
                                            error={editFormErrors.location_id}
                                        />

                                        <InputSelectComponent
                                            label="Assigned To"
                                            value={editFormData.assigned_to}
                                            onChange={(value) => setEditFieldValue('assigned_to', value)}
                                            options={[
                                                { value: '', label: 'Unassigned' },
                                                // Add user options here when available
                                            ]}
                                            error={editFormErrors.assigned_to}
                                        />
                                    </div>
                                </div>

                                {/* Purchase Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Purchase Information</h3>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InputTextComponent
                                            label="Purchase Date"
                                            name="purchase_date"
                                            type="date"
                                            value={editFormData.purchase_date}
                                            onChange={(e) => setEditFieldValue('purchase_date', e.target.value)}
                                            error={editFormErrors.purchase_date}
                                        />

                                        <InputTextComponent
                                            label="Purchase Price"
                                            name="purchase_price"
                                            type="number"
                                            step="0.01"
                                            value={editFormData.purchase_price}
                                            onChange={(e) => setEditFieldValue('purchase_price', e.target.value)}
                                            error={editFormErrors.purchase_price}
                                        />

                                        <div className="sm:col-span-2 lg:col-span-1">
                                            <InputTextComponent
                                                label="Warranty Expiry"
                                                name="warranty_expiry"
                                                type="date"
                                                value={editFormData.warranty_expiry}
                                                onChange={(e) => setEditFieldValue('warranty_expiry', e.target.value)}
                                                error={editFormErrors.warranty_expiry}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Information */}
                                <div className="space-y-4">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editFormData.description}
                                            onChange={(e) => setEditFieldValue('description', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Asset description or specifications..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Notes
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editFormData.notes}
                                            onChange={(e) => setEditFieldValue('notes', e.target.value)}
                                            className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Additional notes..."
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                        {/* Fixed Footer */}
                        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => {
                                        setEditAsset(null);
                                        setEditFormData({});
                                        setEditFormErrors({});
                                    }}
                                    disabled={isEditSubmitting}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    disabled={isEditSubmitting}
                                    onClick={handleEditSubmit}
                                    className="w-full sm:w-auto"
                                >
                                    {isEditSubmitting ? 'Updating...' : 'Update Asset'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteAsset}
                onClose={() => setDeleteAsset(null)}
                onConfirm={confirmDelete}
                title="Delete Other Asset"
                message={`Are you sure you want to delete "${deleteAsset?.name}"? This action cannot be undone.`}
            />
        </div>
    );
}
