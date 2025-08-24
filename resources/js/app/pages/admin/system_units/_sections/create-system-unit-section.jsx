import React, { useState, useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import {
    validateForm,
    validateField,
    getRealTimeValidation,
    sanitizeFormData,
    checkDuplicateSerial,
    hasFormErrors,
    validateSpecifications,
    validateComponents
} from '@/app/utils/systemUnitValidation'

export default function CreateSystemUnitSection() {
    const { auth } = usePage().props
    const [isModalOpen, setModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [availableParts, setAvailableParts] = useState([])
    const [currentUser, setCurrentUser] = useState({ name: '' })
    
    // Validation states
    const [errors, setErrors] = useState({})
    const [backendErrors, setBackendErrors] = useState({})
    const [isValidating, setIsValidating] = useState(false)
    const [duplicateSerialCheck, setDuplicateSerialCheck] = useState({
        isChecking: false,
        isDuplicate: false,
        lastChecked: ''
    })
    
    // Get stored username if available (same approach as parts component)
    const storedUser = localStorage.getItem('userName') || '';
    const initialUsername = storedUser || auth?.user?.name || 'System User';
    
    // If we found a username and it wasn't in localStorage yet, store it
    if (!storedUser && auth?.user?.name) {
        localStorage.setItem('userName', auth.user.name);
    }
    
    // Initialize currentUser state
    useEffect(() => {
        setCurrentUser({ name: initialUsername });
    }, [initialUsername]);
    
    const [formData, setFormData] = useState({
        unit_type: 'pre_built',
        system_name: '',
        serial_number: '',
        brand: '',
        model: '',
        description: '',
        operating_system: '',
        mac_address: '',
        status: 'available',
        location: '',
        assigned_to: '',
        received_by: initialUsername,
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

    const openModal = () => {
        setModalOpen(true)
        setErrors({})
        setBackendErrors({})
        setDuplicateSerialCheck({
            isChecking: false,
            isDuplicate: false,
            lastChecked: ''
        })
    }
    
    const closeModal = () => {
        setModalOpen(false)
        resetForm()
        setErrors({})
        setBackendErrors({})
        setDuplicateSerialCheck({
            isChecking: false,
            isDuplicate: false,
            lastChecked: ''
        })
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
            mac_address: '',
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

    // We don't need a separate fetchCurrentUser anymore since we're handling
    // the user data at component initialization and storing it in state
    const fetchCurrentUser = () => {
        // This is now redundant but kept for compatibility
        // The username is already set during component initialization
        const username = localStorage.getItem('userName') || auth?.user?.name || 'System User';
        
        setCurrentUser({ name: username });
        setFormData(prev => ({
            ...prev,
            received_by: username
        }));
        
        // If we have auth data and it's not in localStorage, save it for future use
        if (auth?.user?.name && !localStorage.getItem('userName')) {
            localStorage.setItem('userName', auth.user.name);
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
        console.log(`System Unit Validation - Field changed: ${field}, Value: ${value}`);
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))

        // Clear backend error for this field
        if (backendErrors[field]) {
            setBackendErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }

        // Real-time validation with debounce for serial number
        if (field === 'serial_number') {
            // Clear existing duplicate check
            setDuplicateSerialCheck(prev => ({
                ...prev,
                isDuplicate: false,
                lastChecked: ''
            }))

            // Validate field format first
            const validation = validateField(field, value)
            setErrors(prev => ({
                ...prev,
                [field]: validation.isValid ? '' : validation.message
            }))

            // Check for duplicates if field is valid and not empty
            if (validation.isValid && value && value.trim().length >= 3) {
                const timeoutId = setTimeout(async () => {
                    setDuplicateSerialCheck(prev => ({ ...prev, isChecking: true }))
                    
                    try {
                        const isDuplicate = await checkDuplicateSerial(value.trim())
                        setDuplicateSerialCheck({
                            isChecking: false,
                            isDuplicate,
                            lastChecked: value.trim()
                        })

                        if (isDuplicate) {
                            setErrors(prev => ({
                                ...prev,
                                [field]: 'This serial number is already in use'
                            }))
                        } else {
                            // Clear error if no duplicate and field is valid
                            setErrors(prev => ({
                                ...prev,
                                [field]: ''
                            }))
                        }
                    } catch (error) {
                        console.error('Error checking duplicate serial:', error)
                        setDuplicateSerialCheck(prev => ({ ...prev, isChecking: false }))
                    }
                }, 500) // 500ms debounce

                return () => clearTimeout(timeoutId)
            }
        } else {
            // Regular field validation
            const validation = validateField(field, value)
            setErrors(prev => ({
                ...prev,
                [field]: validation.isValid ? '' : validation.message
            }))
        }
    }

    const handleSpecificationChange = (specKey, value) => {
        console.log(`Specification changed: ${specKey}, Value: ${value}`);
        
        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [specKey]: value
            }
        }))

        // Clear backend error for this specification field
        if (backendErrors.specifications && backendErrors.specifications[specKey]) {
            setBackendErrors(prev => {
                const newErrors = { ...prev }
                if (newErrors.specifications) {
                    delete newErrors.specifications[specKey]
                    if (Object.keys(newErrors.specifications).length === 0) {
                        delete newErrors.specifications
                    }
                }
                return newErrors
            })
        }

        // Real-time validation for specification
        const validation = getRealTimeValidation(`specifications.${specKey}`, formData)(value)
        setErrors(prev => {
            const newErrors = { ...prev }
            if (!newErrors.specifications) {
                newErrors.specifications = {}
            }
            newErrors.specifications[specKey] = validation.isValid ? '' : validation.message
            
            // Clean up empty specification errors
            if (Object.values(newErrors.specifications).every(error => !error)) {
                delete newErrors.specifications
            }
            
            return newErrors
        })
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
        console.log(`Component changed: Index ${index}, Field: ${field}, Value: ${value}`);
        
        const newComponents = [...formData.components]
        newComponents[index] = { ...newComponents[index], [field]: value }
        setFormData(prev => ({ ...prev, components: newComponents }))

        // Clear backend error for this component field
        if (backendErrors.components && backendErrors.components[index] && backendErrors.components[index][field]) {
            setBackendErrors(prev => {
                const newErrors = { ...prev }
                if (newErrors.components && newErrors.components[index]) {
                    delete newErrors.components[index][field]
                    if (Object.keys(newErrors.components[index]).length === 0) {
                        delete newErrors.components[index]
                    }
                    if (Object.keys(newErrors.components).length === 0) {
                        delete newErrors.components
                    }
                }
                return newErrors
            })
        }

        // Validate components after change
        const componentErrors = validateComponents(newComponents)
        setErrors(prev => {
            const newErrors = { ...prev }
            if (Object.keys(componentErrors).length > 0) {
                newErrors.components = componentErrors
            } else {
                delete newErrors.components
            }
            return newErrors
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log('System Unit Validation - Form submission started');
        console.log('Form data:', formData);
        
        setLoading(true)
        setIsValidating(true)
        setBackendErrors({})

        try {
            // Client-side validation
            const validationErrors = validateForm(formData)
            console.log('Validation errors:', validationErrors);
            
            if (hasFormErrors(validationErrors)) {
                setErrors(validationErrors)
                setLoading(false)
                setIsValidating(false)
                console.log('Form validation failed, not submitting');
                return
            }

            // Check for duplicate serial one more time before submission
            if (formData.serial_number && formData.serial_number.trim()) {
                const isDuplicate = await checkDuplicateSerial(formData.serial_number.trim())
                if (isDuplicate) {
                    setErrors(prev => ({
                        ...prev,
                        serial_number: 'This serial number is already in use'
                    }))
                    setLoading(false)
                    setIsValidating(false)
                    return
                }
            }

            // Sanitize form data
            const sanitizedData = sanitizeFormData(formData)
            console.log('Sanitized data for submission:', sanitizedData);

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
                body: JSON.stringify(sanitizedData)
            })

            const responseData = await response.json()
            console.log('API Response:', response.status, responseData);

            if (response.ok) {
                console.log('System unit created successfully');
                closeModal()
                window.location.reload() // Refresh to show new system unit
            } else if (response.status === 422) {
                // Handle validation errors from backend
                console.log('Backend validation errors:', responseData.errors);
                
                if (responseData.errors) {
                    setBackendErrors(responseData.errors)
                    
                    // Also set client-side errors for immediate display
                    const formattedErrors = {}
                    Object.keys(responseData.errors).forEach(field => {
                        if (Array.isArray(responseData.errors[field])) {
                            formattedErrors[field] = responseData.errors[field][0]
                        } else {
                            formattedErrors[field] = responseData.errors[field]
                        }
                    })
                    setErrors(formattedErrors)
                }
            } else {
                console.error('Failed to create system unit:', responseData)
                alert(responseData.message || 'Failed to create system unit. Please check the form and try again.')
            }
        } catch (error) {
            console.error('Error creating system unit:', error)
            alert('An error occurred while creating the system unit.')
        } finally {
            setLoading(false)
            setIsValidating(false)
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

    // Helper function to get error message for a field
    const getFieldError = (fieldName) => {
        return backendErrors[fieldName] || errors[fieldName] || ''
    }

    // Helper function to get specification error
    const getSpecificationError = (specKey) => {
        return (backendErrors.specifications && backendErrors.specifications[specKey]) || 
               (errors.specifications && errors.specifications[specKey]) || ''
    }

    // Helper function to get component error
    const getComponentError = (index, field) => {
        return (backendErrors.components && backendErrors.components[index] && backendErrors.components[index][field]) ||
               (errors.components && errors.components[index] && errors.components[index][field]) || ''
    }

    // Helper function to check if form can be submitted
    const canSubmitForm = () => {
        const hasClientErrors = hasFormErrors(errors)
        const hasBackendErrors = hasFormErrors(backendErrors)
        const isCheckingSerial = duplicateSerialCheck.isChecking
        const hasRequiredFields = formData.unit_type && formData.system_name && formData.status && formData.received_by
        
        return !hasClientErrors && !hasBackendErrors && !isCheckingSerial && hasRequiredFields && !loading
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
                <div className="bg-white max-h-[90vh] max-w-4xl w-full flex flex-col rounded-lg">
                    {/* Fixed Header */}
                    <div className="px-4 pt-5 sm:px-6 pb-4 border-b border-gray-200">
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
                                {getFieldError('unit_type') && (
                                    <InputError message={getFieldError('unit_type')} />
                                )}
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
                                        onBlur={(e) => handleInputChange('system_name', e.target.value)}
                                        required
                                    />
                                    {getFieldError('system_name') && (
                                        <InputError message={getFieldError('system_name')} />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                                        Serial Number
                                        {duplicateSerialCheck.isChecking && (
                                            <span className="ml-2 text-blue-600 text-xs">
                                                <i className="animate-spin inline-block w-3 h-3 border border-blue-600 border-t-transparent rounded-full mr-1"></i>
                                                Checking...
                                            </span>
                                        )}
                                    </label>
                                    <InputTextComponent
                                        id="serial_number"
                                        name="serial_number"
                                        type="text"
                                        placeholder="Auto-generated if empty"
                                        value={formData.serial_number}
                                        onChange={(e) => handleInputChange('serial_number', e.target.value)}
                                        onBlur={(e) => handleInputChange('serial_number', e.target.value)}
                                    />
                                    {getFieldError('serial_number') && (
                                        <InputError message={getFieldError('serial_number')} />
                                    )}
                                    {duplicateSerialCheck.isDuplicate && formData.serial_number && (
                                        <div className="text-red-600 text-sm mt-1">
                                            This serial number is already in use
                                        </div>
                                    )}
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
                                            onBlur={(e) => handleInputChange('brand', e.target.value)}
                                        />
                                        {getFieldError('brand') && (
                                            <InputError message={getFieldError('brand')} />
                                        )}
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
                                            onBlur={(e) => handleInputChange('model', e.target.value)}
                                        />
                                        {getFieldError('model') && (
                                            <InputError message={getFieldError('model')} />
                                        )}
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
                                    {getFieldError('status') && (
                                        <InputError message={getFieldError('status')} />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                        Location
                                    </label>
                                    <SelectComponent
                                        id="location"
                                        name="location"
                                        options={locations}
                                        value={formData.location}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                    />
                                    {getFieldError('location') && (
                                        <InputError message={getFieldError('location')} />
                                    )}
                                </div>
                            </div>

                            {/* Operating System and MAC Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        onBlur={(e) => handleInputChange('operating_system', e.target.value)}
                                    />
                                    {getFieldError('operating_system') && (
                                        <InputError message={getFieldError('operating_system')} />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="mac_address" className="block text-sm font-medium text-gray-700 mb-1">
                                        MAC Address
                                    </label>
                                    <InputTextComponent
                                        id="mac_address"
                                        name="mac_address"
                                        type="text"
                                        placeholder="e.g. 00:1B:44:11:3A:B7 or 00-1B-44-11-3A-B7"
                                        value={formData.mac_address}
                                        onChange={(e) => handleInputChange('mac_address', e.target.value)}
                                        onBlur={(e) => handleInputChange('mac_address', e.target.value)}
                                    />
                                    {getFieldError('mac_address') && (
                                        <InputError message={getFieldError('mac_address')} />
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX
                                    </p>
                                </div>
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
                                                    onBlur={(e) => handleSpecificationChange(key, e.target.value)}
                                                />
                                                {getSpecificationError(key) && (
                                                    <InputError message={getSpecificationError(key)} />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    {errors.specifications && errors.specifications.general && (
                                        <InputError message={errors.specifications.general} />
                                    )}
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
                                                    {getComponentError(index, 'component_role') && (
                                                        <InputError message={getComponentError(index, 'component_role')} />
                                                    )}
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
                                                    {getComponentError(index, 'part_item_id') && (
                                                        <InputError message={getComponentError(index, 'part_item_id')} />
                                                    )}
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
                                    {errors.components && errors.components.general && (
                                        <InputError message={errors.components.general} />
                                    )}
                                    {errors.components && errors.components.duplicateRoles && (
                                        <InputError message={errors.components.duplicateRoles} />
                                    )}
                                </div>
                            )}

                            {/* Purchase Information */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Purchase Price (₱)
                                    </label>
                                    <InputTextComponent
                                        id="purchase_price"
                                        name="purchase_price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.purchase_price}
                                        onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                                        onBlur={(e) => handleInputChange('purchase_price', e.target.value)}
                                    />
                                    {getFieldError('purchase_price') && (
                                        <InputError message={getFieldError('purchase_price')} />
                                    )}
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
                                        onBlur={(e) => handleInputChange('supplier', e.target.value)}
                                    />
                                    {getFieldError('supplier') && (
                                        <InputError message={getFieldError('supplier')} />
                                    )}
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
                                        onBlur={(e) => handleInputChange('purchase_date', e.target.value)}
                                    />
                                    {getFieldError('purchase_date') && (
                                        <InputError message={getFieldError('purchase_date')} />
                                    )}
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
                                        onBlur={(e) => handleInputChange('warranty_expiry', e.target.value)}
                                    />
                                    {getFieldError('warranty_expiry') && (
                                        <InputError message={getFieldError('warranty_expiry')} />
                                    )}
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
                                        onBlur={(e) => handleInputChange('assigned_to', e.target.value)}
                                    />
                                    {getFieldError('assigned_to') && (
                                        <InputError message={getFieldError('assigned_to')} />
                                    )}
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
                                    onBlur={(e) => handleInputChange('description', e.target.value)}
                                />
                                {getFieldError('description') && (
                                    <InputError message={getFieldError('description')} />
                                )}
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
                                    onBlur={(e) => handleInputChange('notes', e.target.value)}
                                />
                                {getFieldError('notes') && (
                                    <InputError message={getFieldError('notes')} />
                                )}
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
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">Received by:</span> {formData.received_by || 'System User'}
                            </div>
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
                                    disabled={!canSubmitForm()}
                                    form="create-system-unit-form"
                                >
                                    {loading ? 'Saving...' : isValidating ? 'Validating...' : 'Save System Unit'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
