import React, { useState, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreateSystemUnitSection() {
    const { auth } = usePage().props
    const [isModalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [availableParts, setAvailableParts] = useState([])
    const [formData, setFormData] = useState({
        unit_type: 'pre_built',
        system_name: '',
        serial_number: '',
        brand: '',
        model: '',
        description: '',
        operating_system: '',
        status: 'available',
        location: '',
        assigned_to: '',
        received_by: auth?.user?.name || '',
        purchase_price: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expiry: '',
        notes: '',
        // For pre-built units
        specifications: {
            cpu: '',
            ram: '',
            storage: '',
            gpu: '',
            motherboard: '',
            psu: '',
            case: ''
        },
        // For custom-built units
        components: []
    })

    const openModal = () => setModalOpen(true)
    const closeModal = () => {
        setModalOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            unit_type: 'pre_built',
            system_name: '',
            serial_number: '',
            brand: '',
            model: '',
            description: '',
            operating_system: '',
            status: 'available',
            location: '',
            assigned_to: '',
            received_by: auth?.user?.name || '',
            purchase_price: '',
            supplier: '',
            purchase_date: new Date().toISOString().split('T')[0],
            warranty_expiry: '',
            notes: '',
            specifications: {
                cpu: '',
                ram: '',
                storage: '',
                gpu: '',
                motherboard: '',
                psu: '',
                case: ''
            },
            components: []
        })
    }

    const fetchCurrentUser = async () => {
        try {
            // Get CSRF token safely
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const headers = {
                'Accept': 'application/json'
            };

            // Only add CSRF token if it exists
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/current-user', {
                headers: headers,
                credentials: 'same-origin'
            })
            if (response.ok) {
                const user = await response.json()
                setCurrentUser(user)
                // Update received_by in form data
                setFormData(prev => ({
                    ...prev,
                    received_by: user.name || ''
                }))
            } else if (response.status === 401) {
                console.warn('User not authenticated, received_by will be empty')
                // Set a default value or leave it empty
                setFormData(prev => ({
                    ...prev,
                    received_by: 'System User'
                }))
            }
        } catch (error) {
            console.error('Error fetching current user:', error)
            // Fallback: set a default value
            setFormData(prev => ({
                ...prev,
                received_by: 'System User'
            }))
        }
    }

    const fetchAvailableParts = async () => {
        try {
            const response = await fetch('/api/system-units/available-parts', {
                headers: { 'Accept': 'application/json' }
            })
            if (response.ok) {
                const parts = await response.json()
                setAvailableParts(parts)
            }
        } catch (error) {
            console.error('Error fetching available parts:', error)
        }
    }

    useEffect(() => {
        // Fetch current user on component mount
        fetchCurrentUser()
    }, [])

    useEffect(() => {
        if (isModalOpen && formData.unit_type === 'custom_built') {
            fetchAvailableParts()
        }
    }, [isModalOpen, formData.unit_type])

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSpecificationChange = (specKey, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [specKey]: value
            }
        }))
    }

    const addComponent = () => {
        setFormData(prev => ({
            ...prev,
            components: [...prev.components, {
                part_item_id: '',
                component_role: ''
            }]
        }))
    }

    const removeComponent = (index) => {
        setFormData(prev => ({
            ...prev,
            components: prev.components.filter((_, i) => i !== index)
        }))
    }

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...formData.components]
        newComponents[index] = { ...newComponents[index], [field]: value }
        setFormData(prev => ({ ...prev, components: newComponents }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken
            }

            const response = await fetch('/api/system-units', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                closeModal()
                window.location.reload() // Refresh to show new system unit
            } else {
                const errorData = await response.json()
                console.error('Failed to create system unit:', errorData)
                alert('Failed to create system unit. Please check the form and try again.')
            }
        } catch (error) {
            console.error('Error creating system unit:', error)
            alert('An error occurred while creating the system unit.')
        } finally {
            setLoading(false)
        }
    }

    const unitTypes = [
        { label: 'Pre-built System', value: 'pre_built' },
        { label: 'Custom Built from Parts', value: 'custom_built' }
    ]

    const statusOptions = [
        { label: 'Available', value: 'available' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Retired', value: 'retired' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Storage', value: 'storage' },
        { label: 'Secure Storage', value: 'secure_storage' },
        { label: 'IT Department', value: 'it_department' },
        { label: 'Office A', value: 'office_a' },
        { label: 'Office B', value: 'office_b' },
        { label: 'Warehouse', value: 'warehouse' }
    ]

    const componentRoles = [
        { label: 'Select Component Role', value: '' },
        { label: 'CPU', value: 'cpu' },
        { label: 'RAM', value: 'ram' },
        { label: 'Storage (SSD/HDD)', value: 'storage' },
        { label: 'GPU', value: 'gpu' },
        { label: 'Motherboard', value: 'motherboard' },
        { label: 'Power Supply', value: 'psu' },
        { label: 'Case', value: 'case' }
    ]

    const getPartItemOptions = (partType) => {
        const filteredParts = availableParts.filter(part => 
            part.type === partType && part.items && part.items.length > 0
        )
        
        const options = [{ label: 'Select Part Item', value: '' }]
        
        filteredParts.forEach(part => {
            part.items.forEach(item => {
                options.push({
                    label: `${part.brand} ${part.model} (SN: ${item.serial_number || 'N/A'})`,
                    value: item.id
                })
            })
        })
        
        return options
    }

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Add System Unit
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white max-h-[90vh] flex flex-col">
                    {/* Fixed Header */}
                    <div className="px-4 pt-5 sm:p-6 pb-4 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                            Add New System Unit
                        </h3>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-4 sm:px-6">
                        <form id="create-system-unit-form" className="space-y-4 py-4" onSubmit={handleSubmit}>
                            {/* Unit Type Selection */}
                            <div>
                                <label htmlFor="unit_type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit Type *
                                </label>
                                <SelectComponent
                                    id="unit_type"
                                    name="unit_type"
                                    options={unitTypes}
                                    value={formData.unit_type}
                                    onChange={(e) => handleInputChange('unit_type', e.target.value)}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Choose "Pre-built" for complete systems or "Custom Built" to assemble from parts inventory
                                </p>
                            </div>

                            {/* Basic Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="system_name" className="block text-sm font-medium text-gray-700 mb-1">
                                        System Name *
                                    </label>
                                    <InputTextComponent
                                        id="system_name"
                                        name="system_name"
                                        type="text"
                                        placeholder="e.g. Workstation 001"
                                        value={formData.system_name}
                                        onChange={(e) => handleInputChange('system_name', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        Serial Number
                                    </label>
                                    <InputTextComponent
                                        id="serial_number"
                                        name="serial_number"
                                        type="text"
                                        placeholder="Auto-generated if empty"
                                        value={formData.serial_number}
                                        onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Pre-built specific fields */}
                            {formData.unit_type === 'pre_built' && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                            Brand
                                        </label>
                                        <InputTextComponent
                                            id="brand"
                                            name="brand"
                                            type="text"
                                            placeholder="e.g. Dell, HP, Custom"
                                            value={formData.brand}
                                            onChange={(e) => handleInputChange('brand', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                                            Model
                                        </label>
                                        <InputTextComponent
                                            id="model"
                                            name="model"
                                            type="text"
                                            placeholder="e.g. OptiPlex 7070"
                                            value={formData.model}
                                            onChange={(e) => handleInputChange('model', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Status and Location */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status *
                                    </label>
                                    <SelectComponent
                                        id="status"
                                        name="status"
                                        options={statusOptions}
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Location *
                                    </label>
                                    <SelectComponent
                                        id="location"
                                        name="location"
                                        options={locations}
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Operating System */}
                            <div>
                                <label htmlFor="operating_system" className="block text-sm font-medium text-gray-700 mb-1">
                                    Operating System
                                </label>
                                <InputTextComponent
                                    id="operating_system"
                                    name="operating_system"
                                    type="text"
                                    placeholder="e.g. Windows 11 Pro, Ubuntu 22.04"
                                    value={formData.operating_system}
                                    onChange={(e) => handleInputChange('operating_system', e.target.value)}
                                />
                            </div>

                            {/* Specifications (Pre-built) or Components (Custom-built) */}
                            {formData.unit_type === 'pre_built' ? (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">System Specifications</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(formData.specifications).map(([key, value]) => (
                                            <div key={key}>
                                                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                                    {key === 'psu' ? 'Power Supply' : key}
                                                </label>
                                                <InputTextComponent
                                                    placeholder={`Enter ${key} details`}
                                                    value={value}
                                                    onChange={(e) => handleSpecificationChange(key, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-medium text-gray-900">System Components</h4>
                                        <Button
                                            type="button"
                                            variant="primary"
                                            size="xs"
                                            onClick={addComponent}
                                        >
                                            Add Component
                                        </Button>
                                    </div>
                                    {formData.components.map((component, index) => (
                                        <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Component Role *
                                                    </label>
                                                    <SelectComponent
                                                        options={componentRoles}
                                                        value={component.component_role}
                                                        onChange={(e) => handleComponentChange(index, 'component_role', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Part Item *
                                                    </label>
                                                    <SelectComponent
                                                        options={getPartItemOptions(component.component_role)}
                                                        value={component.part_item_id}
                                                        onChange={(e) => handleComponentChange(index, 'part_item_id', e.target.value)}
                                                        required
                                                        disabled={!component.component_role}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => removeComponent(index)}
                                                >
                                                    Remove Component
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.components.length === 0 && (
                                        <p className="text-sm text-gray-500">
                                            Add components from your parts inventory to build this system unit.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Purchase Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Purchase Price
                                    </label>
                                    <InputTextComponent
                                        id="purchase_price"
                                        name="purchase_price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.purchase_price}
                                        onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                        Supplier
                                    </label>
                                    <InputTextComponent
                                        id="supplier"
                                        name="supplier"
                                        type="text"
                                        placeholder="e.g. Dell Direct, Local Vendor"
                                        value={formData.supplier}
                                        onChange={(e) => handleInputChange('supplier', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
                                        Purchase Date
                                    </label>
                                    <InputTextComponent
                                        id="purchase_date"
                                        name="purchase_date"
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="warranty_expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                        Warranty Expiry
                                    </label>
                                    <InputTextComponent
                                        id="warranty_expiry"
                                        name="warranty_expiry"
                                        type="date"
                                        value={formData.warranty_expiry}
                                        onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Assignment */}
                            {formData.status === 'assigned' && (
                                <div>
                                    <label htmlFor="assigned_to" className="block text-sm font-medium text-gray-700 mb-1">
                                        Assigned To
                                    </label>
                                    <InputTextComponent
                                        id="assigned_to"
                                        name="assigned_to"
                                        type="text"
                                        placeholder="User name or department"
                                        value={formData.assigned_to}
                                        onChange={(e) => handleInputChange('assigned_to', e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Description and Notes */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={2}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Description of the system unit..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    id="notes"
                                    name="notes"
                                    rows={2}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Additional notes..."
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                />
                            </div>

                            {/* Hidden field for received_by (controlled) */}
                            <InputTextComponent
                                id="received_by"
                                name="received_by"
                                type="hidden"
                                value={formData.received_by}
                                onChange={e => setFormData(prev => ({ ...prev, received_by: e.target.value }))}
                            />
                        </form>
                    </div>

                    {/* Fixed Footer */}
                    <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="danger"
                                size="md"
                                onClick={closeModal}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                disabled={loading}
                                form="create-system-unit-form"
                            >
                                {loading ? 'Saving...' : 'Save System Unit'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
