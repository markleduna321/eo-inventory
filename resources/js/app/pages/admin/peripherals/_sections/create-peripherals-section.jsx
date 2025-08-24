import React, { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import {
    validatePeripheralForm,
    validateField,
    getRealTimeValidation,
    sanitizePeripheralFormData,
    hasFormErrors
} from '@/app/utils/peripheralValidation'

export default function CreatePeripheralsSection() {
    const { auth } = usePage().props
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    
    // Validation states
    const [errors, setErrors] = useState({})
    const [backendErrors, setBackendErrors] = useState({})
    const [isValidating, setIsValidating] = useState(false)
    
    const [formData, setFormData] = useState({
        type: '',
        brand: '',
        model: '',
        description: '',
        status: 'active',
        location: '',
        notes: '',
        purchase_order: '',
        invoice_number: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_notes: '',
        received_by: auth?.user?.name || '',
        uses_serial_numbers: false
    })

    const openModal = () => {
        setIsModalOpen(true)
        setErrors({})
        setBackendErrors({})
    }
    
    const closeModal = () => {
        setIsModalOpen(false)
        setErrors({})
        setBackendErrors({})
        setFormData({
            type: '',
            brand: '',
            model: '',
            description: '',
            status: 'active',
            location: '',
            notes: '',
            purchase_order: '',
            invoice_number: '',
            delivery_date: new Date().toISOString().split('T')[0],
            delivery_notes: '',
            received_by: auth?.user?.name || '',
            uses_serial_numbers: false
        })
    }



    const handleInputChange = (field, value) => {
        console.log(`Peripheral Validation - Field changed: ${field}, Value: ${value}`);
        
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

        // Real-time validation
        const validation = validateField(field, value)
        setErrors(prev => ({
            ...prev,
            [field]: validation.isValid ? '' : validation.message
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log('Peripheral Validation - Form submission started');
        console.log('Form data:', formData);
        
        setLoading(true)
        setIsValidating(true)
        setBackendErrors({})

        try {
            // Client-side validation
            const validationErrors = validatePeripheralForm(formData)
            console.log('Validation errors:', validationErrors);
            
            if (hasFormErrors(validationErrors)) {
                setErrors(validationErrors)
                setLoading(false)
                setIsValidating(false)
                console.log('Form validation failed, not submitting');
                return
            }

            // Sanitize form data
            const sanitizedData = sanitizePeripheralFormData(formData)
            console.log('Sanitized data for submission:', sanitizedData);

            // Get CSRF token safely
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            // Only add CSRF token if it exists
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            console.log('Submitting peripheral data:', sanitizedData);

            // Add default initial_stock since we removed it from the form
            const submitData = {
                ...sanitizedData,
                initial_stock: 0, // Default to 0 since stock will be managed separately
                unit_price: 0.00, // Default unit price since it will be set when adding stock
                supplier: '' // Default empty supplier since it will be set when adding stock
            };

            const response = await fetch('/api/peripherals', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(submitData)
            })

            const responseData = await response.json()
            console.log('API Response:', response.status, responseData);

            if (response.ok) {
                console.log('Peripheral created successfully');
                closeModal()
                window.location.reload()
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
                console.error('Failed to create peripheral:', responseData)
                alert(responseData.message || 'Failed to create peripheral. Please check the form and try again.')
            }
        } catch (error) {
            console.error('Error creating peripheral:', error)
            alert('An error occurred while creating the peripheral.')
        } finally {
            setLoading(false)
            setIsValidating(false)
        }
    }

    // Helper function to get error message for a field
    const getFieldError = (fieldName) => {
        return backendErrors[fieldName] || errors[fieldName] || ''
    }

    // Helper function to check if form can be submitted
    const canSubmitForm = () => {
        const hasClientErrors = hasFormErrors(errors)
        const hasBackendErrors = hasFormErrors(backendErrors)
        const hasRequiredFields = formData.type && formData.brand && formData.model && formData.location && formData.delivery_date && formData.received_by
        
        return !hasClientErrors && !hasBackendErrors && hasRequiredFields && !loading
    }

    // Options for select dropdowns
    const peripheralTypes = [
        { label: 'Select Peripheral Type', value: '' },
        { label: 'Keyboard', value: 'keyboard' },
        { label: 'Mouse', value: 'mouse' },
        { label: 'Speaker', value: 'speaker' },
        { label: 'Webcam', value: 'webcam' },
        { label: 'Headset', value: 'headset' },
        { label: 'Printer', value: 'printer' },
        { label: 'Scanner', value: 'scanner' },
        { label: 'UPS', value: 'ups' },
        { label: 'External Hard Drive', value: 'external_hdd' },
        { label: 'Other', value: 'other' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Storage Room', value: 'storage' },
        { label: 'IT Department', value: 'it_department' },
        { label: 'Reception', value: 'reception' },
        { label: 'Office Floor 1', value: 'office_floor_1' },
        { label: 'Office Floor 2', value: 'office_floor_2' },
        { label: 'Conference Room', value: 'conference_room' },
        { label: 'Training Room', value: 'training_room' }
    ]

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Add Peripheral
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="flex flex-col h-[85vh] w-full max-w-4xl bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                                Add New Peripheral
                            </h3>
                            
                        </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto px-6 py-6 flex-1 min-h-0">
                        <form id="create-peripheral-form" className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabelComponent htmlFor="peripheral_type" value="Peripheral Type *" />
                                            <SelectComponent
                                                id="peripheral_type"
                                                name="peripheral_type"
                                                options={peripheralTypes}
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                                onBlur={(e) => handleInputChange('type', e.target.value)}
                                                required
                                            />
                                            {getFieldError('type') && (
                                                <InputError message={getFieldError('type')} />
                                            )}
                                        </div>
                                        <div>
                                            <InputLabelComponent htmlFor="brand" value="Brand *" />
                                            <InputTextComponent
                                                id="brand"
                                                name="brand"
                                                type="text"
                                                placeholder="e.g. Logitech, Microsoft"
                                                value={formData.brand}
                                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                                onBlur={(e) => handleInputChange('brand', e.target.value)}
                                                required
                                            />
                                            {getFieldError('brand') && (
                                                <InputError message={getFieldError('brand')} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabelComponent htmlFor="model" value="Model *" />
                                            <InputTextComponent
                                                id="model"
                                                name="model"
                                                type="text"
                                                placeholder="e.g. MX Keys, Surface Mouse"
                                                value={formData.model}
                                                onChange={(e) => handleInputChange('model', e.target.value)}
                                                onBlur={(e) => handleInputChange('model', e.target.value)}
                                                required
                                            />
                                            {getFieldError('model') && (
                                                <InputError message={getFieldError('model')} />
                                            )}
                                        </div>
                                        <div>
                                            <InputLabelComponent htmlFor="location" value="Location *" />
                                            <SelectComponent
                                                id="location"
                                                name="location"
                                                options={locations}
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                onBlur={(e) => handleInputChange('location', e.target.value)}
                                                required
                                            />
                                            {getFieldError('location') && (
                                                <InputError message={getFieldError('location')} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabelComponent htmlFor="purchase_order" value="Purchase Order" />
                                            <InputTextComponent
                                                id="purchase_order"
                                                name="purchase_order"
                                                type="text"
                                                placeholder="e.g. PO-2024-001"
                                                value={formData.purchase_order}
                                                onChange={(e) => handleInputChange('purchase_order', e.target.value)}
                                                onBlur={(e) => handleInputChange('purchase_order', e.target.value)}
                                            />
                                            {getFieldError('purchase_order') && (
                                                <InputError message={getFieldError('purchase_order')} />
                                            )}
                                        </div>
                                        <div>
                                            <InputLabelComponent htmlFor="invoice_number" value="Invoice Number" />
                                            <InputTextComponent
                                                id="invoice_number"
                                                name="invoice_number"
                                                type="text"
                                                placeholder="e.g. INV-2024-001"
                                                value={formData.invoice_number}
                                                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                                                onBlur={(e) => handleInputChange('invoice_number', e.target.value)}
                                            />
                                            {getFieldError('invoice_number') && (
                                                <InputError message={getFieldError('invoice_number')} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <InputLabelComponent htmlFor="delivery_date" value="Delivery Date *" />
                                            <InputTextComponent
                                                id="delivery_date"
                                                name="delivery_date"
                                                type="date"
                                                value={formData.delivery_date}
                                                onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                                onBlur={(e) => handleInputChange('delivery_date', e.target.value)}
                                                required
                                            />
                                            {getFieldError('delivery_date') && (
                                                <InputError message={getFieldError('delivery_date')} />
                                            )}
                                        </div>
                                        <div>
                                            <InputLabelComponent htmlFor="received_by" value="Received By *" />
                                            <InputTextComponent
                                                id="received_by"
                                                name="received_by"
                                                type="text"
                                                placeholder="Staff member name"
                                                value={formData.received_by}
                                                onChange={(e) => handleInputChange('received_by', e.target.value)}
                                                onBlur={(e) => handleInputChange('received_by', e.target.value)}
                                                required
                                            />
                                            {getFieldError('received_by') && (
                                                <InputError message={getFieldError('received_by')} />
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="description" value="Description (Optional)" />
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Description of the peripheral..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            onBlur={(e) => handleInputChange('description', e.target.value)}
                                        />
                                        {getFieldError('description') && (
                                            <InputError message={getFieldError('description')} />
                                        )}
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="delivery_notes" value="Delivery Notes (Optional)" />
                                        <textarea
                                            id="delivery_notes"
                                            name="delivery_notes"
                                            rows={2}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Optional delivery notes..."
                                            value={formData.delivery_notes}
                                            onChange={(e) => handleInputChange('delivery_notes', e.target.value)}
                                            onBlur={(e) => handleInputChange('delivery_notes', e.target.value)}
                                        />
                                        {getFieldError('delivery_notes') && (
                                            <InputError message={getFieldError('delivery_notes')} />
                                        )}
                                    </div>

                                    {/* Serial Number Configuration */}
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                        <div className="flex items-center">
                                            <input
                                                id="uses_serial_numbers"
                                                type="checkbox"
                                                checked={formData.uses_serial_numbers || false}
                                                onChange={(e) => handleInputChange('uses_serial_numbers', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="uses_serial_numbers" className="ml-2 block text-sm font-medium text-blue-800">
                                                This peripheral uses serial numbers
                                            </label>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-1">
                                            Check this if each individual item will have a unique serial number that needs to be tracked separately.
                                        </p>
                                    </div>

                                    <div>
                                        <InputLabelComponent htmlFor="notes" value="Notes (Optional)" />
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional notes about the peripheral..."
                                            value={formData.notes}
                                            onChange={(e) => handleInputChange('notes', e.target.value)}
                                            onBlur={(e) => handleInputChange('notes', e.target.value)}
                                        />
                                        {getFieldError('notes') && (
                                            <InputError message={getFieldError('notes')} />
                                        )}
                                    </div>


                                </form>
                            </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-lg">
                        <div className="flex justify-end gap-3">
                            <Button
                                type='button'
                                variant='secondary'
                                size='md'
                                onClick={closeModal}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type='submit'
                                variant='primary'
                                size='md'
                                form="create-peripheral-form"
                                disabled={!canSubmitForm()}
                            >
                                {loading ? 'Creating...' : isValidating ? 'Validating...' : 'Create Peripheral'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
