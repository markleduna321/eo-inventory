import React, { useState } from 'react'
import { usePage } from '@inertiajs/react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreatePeripheralsSection() {
    const { auth } = usePage().props
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: '',
        brand: '',
        model: '',
        serial_number: '',
        status: '',
        location: '',
        description: '',
        notes: '',
        purchase_order: '',
        invoice_number: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_notes: '',
        received_by: auth?.user?.name || '',
        uses_serial_numbers: false
    })

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => {
        setIsModalOpen(false)
        setFormData({
            type: '',
            brand: '',
            model: '',
            serial_number: '',
            status: '',
            location: '',
            description: '',
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
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
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

            console.log('Submitting peripheral data:', formData);
            console.log('Using headers:', headers);

            // Add default initial_stock since we removed it from the form
            const submitData = {
                ...formData,
                initial_stock: 0, // Default to 0 since stock will be managed separately
                unit_price: 0.00, // Default unit price since it will be set when adding stock
                supplier: '' // Default empty supplier since it will be set when adding stock
            };

            const response = await fetch('/api/peripherals', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(submitData)
            })

            if (response.ok) {
                closeModal()
                // Refresh the page or update the peripheral list
                window.location.reload()
            } else {
                const errorData = await response.json()
                console.error('Failed to create peripheral:', errorData)
                console.error('Response status:', response.status)
                console.error('Response statusText:', response.statusText)
                
                // More specific error messages
                if (response.status === 422) {
                    // Show validation errors
                    const errorMessages = [];
                    if (errorData.errors) {
                        Object.keys(errorData.errors).forEach(field => {
                            const fieldErrors = errorData.errors[field];
                            if (Array.isArray(fieldErrors)) {
                                errorMessages.push(...fieldErrors);
                            }
                        });
                    }
                    const errorMessage = errorMessages.length > 0 
                        ? `Validation errors:\n${errorMessages.join('\n')}` 
                        : errorData.message || 'Validation error: Please check all required fields and their formats.';
                    alert(errorMessage);
                } else if (response.status === 401) {
                    alert('Authentication required. Please log in again.')
                } else if (response.status === 403) {
                    alert('Permission denied. You may not have access to create peripherals.')
                } else {
                    alert(`Failed to create peripheral. Server responded with status ${response.status}`)
                }
            }
        } catch (error) {
            console.error('Error creating peripheral:', error)
            alert('An error occurred while creating the peripheral.')
        } finally {
            setLoading(false)
        }
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

    const brands = [
        { label: 'Logitech', value: 'Logitech' },
        { label: 'Microsoft', value: 'Microsoft' },
        { label: 'A4 Tech', value: 'A4 Tech' },
        { label: 'Razer', value: 'Razer' },
        { label: 'Apple', value: 'Apple' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Asus', value: 'Asus' },
        { label: 'Lenovo', value: 'Lenovo' },
        { label: 'Havit', value: 'Havit' },
        { label: 'HP', value: 'HP' },
        { label: 'AWP', value: 'AWP' },
        { label: 'Secure', value: 'Secure' },
        { label: 'HikVision', value: 'HikVision' },
        { label: 'Nvision', value: 'Nvision' },
        { label: 'Jabra', value: 'Jabra' },
        { label: 'Rapoo', value: 'Rapoo' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Storage', value: 'storage' },
        { label: 'Office A', value: 'office_a' },
        { label: 'Office B', value: 'office_b' },
        { label: 'Conference Room', value: 'conference_room' },
        { label: 'IT Department', value: 'it_department' }
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
                                            <label htmlFor="peripheral_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Peripheral Type *
                                            </label>
                                            <SelectComponent
                                                id="peripheral_type"
                                                name="peripheral_type"
                                                options={peripheralTypes}
                                                value={formData.type}
                                                onChange={(e) => handleInputChange('type', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand *
                                            </label>
                                            <SelectComponent
                                                id="brand"
                                                name="brand"
                                                options={brands}
                                                value={formData.brand}
                                                onChange={(e) => handleInputChange('brand', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                                                Model *
                                            </label>
                                            <InputTextComponent
                                                id="model"
                                                name="model"
                                                type="text"
                                                placeholder="e.g. MX Keys, Surface Mouse"
                                                value={formData.model}
                                                onChange={(e) => handleInputChange('model', e.target.value)}
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

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="purchase_order" className="block text-sm font-medium text-gray-700 mb-1">
                                                Purchase Order
                                            </label>
                                            <InputTextComponent
                                                id="purchase_order"
                                                name="purchase_order"
                                                type="text"
                                                placeholder="e.g. PO-2024-001"
                                                value={formData.purchase_order}
                                                onChange={(e) => handleInputChange('purchase_order', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Invoice Number
                                            </label>
                                            <InputTextComponent
                                                id="invoice_number"
                                                name="invoice_number"
                                                type="text"
                                                placeholder="e.g. INV-2024-001"
                                                value={formData.invoice_number}
                                                onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Date *
                                        </label>
                                        <InputTextComponent
                                            id="delivery_date"
                                            name="delivery_date"
                                            type="date"
                                            value={formData.delivery_date}
                                            onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Description of the peripheral..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                        />
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
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional notes about the peripheral..."
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
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Peripheral'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
