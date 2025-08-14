import React, { useState, useEffect } from 'react';
import Button from '@/app/pages/components/button';
import Modal from '@/app/pages/components/modal';
import InputTextComponent from '@/app/pages/components/input-text-component';
import InputSelectComponent from '@/app/pages/components/input-select';
import { PlusIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function CreateOtherAssetSection({ onAssetCreated }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [dropdownOptions, setDropdownOptions] = useState({
        asset_types: [],
        brands: [],
        models: [],
        condition_statuses: [],
        status_options: [],
        locations: [],
        users: []
    });

    const [formData, setFormData] = useState({
        name: '',
        asset_type: '',
        brand: '',
        model: '',
        serial_number: '',
        description: '',
        condition_status: 'Good',
        location_id: '',
        purchase_date: '',
        purchase_price: '',
        warranty_expiry: '',
        assigned_to: '',
        status: 'Active',
        notes: ''
    });

    // Modal states for adding new dropdown options
    const [showAddOption, setShowAddOption] = useState({
        type: null,
        visible: false,
        value: ''
    });

    useEffect(() => {
        if (isModalOpen) {
            fetchDropdownOptions();
        }
    }, [isModalOpen]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setErrors({});

        try {
            const response = await axios.post('/api/other-assets', formData);
            
            if (response.data.status === 'success') {
                setIsModalOpen(false);
                resetForm();
                if (onAssetCreated) {
                    onAssetCreated(response.data.data);
                }
                // You can add a success toast here
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                setErrors({ general: 'An unexpected error occurred. Please try again.' });
            }
        } finally {
            setProcessing(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            asset_type: '',
            brand: '',
            model: '',
            serial_number: '',
            description: '',
            condition_status: 'Good',
            location_id: '',
            purchase_date: '',
            purchase_price: '',
            warranty_expiry: '',
            assigned_to: '',
            status: 'Active',
            notes: ''
        });
        setErrors({});
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    const handleAddNewOption = (type) => {
        setShowAddOption({
            type: type,
            visible: true,
            value: ''
        });
    };

    const confirmAddOption = async () => {
        if (!showAddOption.value || typeof showAddOption.value !== 'string' || !showAddOption.value.trim()) return;

        try {
            const response = await axios.post('/api/other-assets/add-dropdown-option', {
                type: showAddOption.type,
                value: showAddOption.value.trim()
            });

            if (response.data.status === 'success') {
                // Add the new option to the dropdown
                const fieldMap = {
                    'asset_type': 'asset_types',
                    'brand': 'brands',
                    'model': 'models'
                };
                
                const dropdownKey = fieldMap[showAddOption.type];
                if (dropdownKey) {
                    setDropdownOptions(prev => ({
                        ...prev,
                        [dropdownKey]: [...prev[dropdownKey], showAddOption.value.trim()].sort()
                    }));
                    
                    // Set the newly added value as selected
                    setFormData(prev => ({
                        ...prev,
                        [showAddOption.type]: showAddOption.value.trim()
                    }));
                }

                setShowAddOption({ type: null, visible: false, value: '' });
            }
        } catch (error) {
            console.error('Error adding option:', error);
            // You can show an error toast here
        }
    };

    const cancelAddOption = () => {
        setShowAddOption({ type: null, visible: false, value: '' });
    };

    const renderSelectWithAddOption = (field, options, label, required = false) => {
        const canAddOption = ['asset_type', 'brand', 'model'].includes(field);
        
        return (
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <InputSelectComponent
                            value={formData[field]}
                                                                onChange={(e) => handleInputChange(field, e.target.value)}
                            options={[
                                { value: '', label: `Select ${label}` },
                                ...options.map(option => ({
                                    value: typeof option === 'object' ? option.id : option,
                                    label: typeof option === 'object' ? option.name : option
                                }))
                            ]}
                            error={errors[field]}
                        />
                    </div>
                    {canAddOption && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAddNewOption(field)}
                            className="flex-shrink-0"
                        >
                            <PlusIcon className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {errors[field] && (
                    <p className="mt-1 text-sm text-red-600">{errors[field][0]}</p>
                )}
            </div>
        );
    };

    return (
        <>
            <Button
                type="button"
                variant="primary"
                onClick={() => setIsModalOpen(true)}
            >
                <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                Add Other Asset
            </Button>

            <Modal 
                isOpen={isModalOpen} 
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                width="w-full max-w-4xl"
            >
                <div className="bg-white px-6 py-4">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Other Asset</h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                                
                                <InputTextComponent
                                    label="Asset Name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="Enter asset name"
                                    required
                                    error={errors.name}
                                />

                                {renderSelectWithAddOption(
                                    'asset_type', 
                                    dropdownOptions.asset_types, 
                                    'Asset Type', 
                                    true
                                )}

                                {renderSelectWithAddOption(
                                    'brand', 
                                    dropdownOptions.brands, 
                                    'Brand'
                                )}

                                {renderSelectWithAddOption(
                                    'model', 
                                    dropdownOptions.models, 
                                    'Model'
                                )}

                                <InputTextComponent
                                    label="Serial Number"
                                    value={formData.serial_number}
                                    onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                    placeholder="Enter serial number"
                                    error={errors.serial_number}
                                />
                            </div>

                            {/* Details and Status */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900">Details & Status</h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Enter description"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description[0]}</p>
                                    )}
                                </div>

                                <InputSelectComponent
                                    label="Condition Status"
                                    value={formData.condition_status}
                                    onChange={(e) => handleInputChange('condition_status', e.target.value)}
                                    options={[
                                        ...dropdownOptions.condition_statuses.map(status => ({
                                            value: status,
                                            label: status
                                        }))
                                    ]}
                                    required
                                    error={errors.condition_status}
                                />

                                <InputSelectComponent
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    options={[
                                        ...dropdownOptions.status_options.map(status => ({
                                            value: status,
                                            label: status
                                        }))
                                    ]}
                                    required
                                    error={errors.status}
                                />

                                <InputSelectComponent
                                    label="Location"
                                    value={formData.location_id}
                                    onChange={(e) => handleInputChange('location_id', e.target.value)}
                                    options={[
                                        { value: '', label: 'Select Location' },
                                        ...dropdownOptions.locations.map(location => ({
                                            value: location.id,
                                            label: location.name
                                        }))
                                    ]}
                                    error={errors.location_id}
                                />

                                <InputSelectComponent
                                    label="Assigned To"
                                    value={formData.assigned_to}
                                    onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                                    options={[
                                        { value: '', label: 'Not Assigned' },
                                        ...dropdownOptions.users.map(user => ({
                                            value: user.id,
                                            label: user.name
                                        }))
                                    ]}
                                    error={errors.assigned_to}
                                />
                            </div>
                        </div>

                        {/* Purchase Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Purchase Information</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputTextComponent
                                    label="Purchase Date"
                                    type="date"
                                    value={formData.purchase_date}
                                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                                    error={errors.purchase_date}
                                />

                                <InputTextComponent
                                    label="Purchase Price"
                                    type="number"
                                    step="0.01"
                                    value={formData.purchase_price}
                                    onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                                    placeholder="0.00"
                                    error={errors.purchase_price}
                                />

                                <InputTextComponent
                                    label="Warranty Expiry"
                                    type="date"
                                    value={formData.warranty_expiry}
                                    onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                                    error={errors.warranty_expiry}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={3}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                placeholder="Additional notes..."
                            />
                            {errors.notes && (
                                <p className="mt-1 text-sm text-red-600">{errors.notes[0]}</p>
                            )}
                        </div>

                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <p className="text-sm text-red-600">{errors.general}</p>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={processing}
                            >
                                {processing ? 'Creating...' : 'Create Asset'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Add Option Modal */}
            <Modal 
                isOpen={showAddOption.visible} 
                onClose={cancelAddOption}
                width="w-full max-w-md"
            >
                <div className="bg-white px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Add New {showAddOption.type ? showAddOption.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''}
                    </h3>
                    
                    <InputTextComponent
                        label={`${showAddOption.type ? showAddOption.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : ''} Name`}
                        value={showAddOption.value}
                        onChange={(e) => setShowAddOption(prev => ({ ...prev, value: e.target.value || '' }))}
                        placeholder={`Enter ${showAddOption.type ? showAddOption.type.replace('_', ' ') : ''} name`}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                confirmAddOption();
                            }
                        }}
                    />
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={cancelAddOption}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={confirmAddOption}
                            disabled={!showAddOption.value || typeof showAddOption.value !== 'string' || !showAddOption.value.trim()}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
