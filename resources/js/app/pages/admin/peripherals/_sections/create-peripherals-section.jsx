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
        initial_stock: 1,
        unit_price: '',
        supplier: '',
        purchase_order: '',
        invoice_number: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_notes: '',
        received_by: auth?.user?.name || ''
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
            initial_stock: 1,
            unit_price: '',
            supplier: '',
            purchase_order: '',
            invoice_number: '',
            delivery_date: new Date().toISOString().split('T')[0],
            delivery_notes: '',
            received_by: auth?.user?.name || ''
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

            const response = await fetch('/api/peripherals', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
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
                    alert('Validation error: Please check all required fields and their formats.')
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
        { label: 'External Hard Drive', value: 'external_hdd' },
        { label: 'Other', value: 'other' }
    ]

    const brands = [
        { label: 'Select Brand', value: '' },
        { label: 'Logitech', value: 'logitech' },
        { label: 'Microsoft', value: 'microsoft' },
        { label: 'Razer', value: 'razer' },
        { label: 'Corsair', value: 'corsair' },
        { label: 'HP', value: 'hp' },
        { label: 'Canon', value: 'canon' },
        { label: 'Epson', value: 'epson' },
        { label: 'Creative', value: 'creative' },
        { label: 'Other', value: 'other' }
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
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Peripheral
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4" onSubmit={handleSubmit}>
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
                                            <label htmlFor="initial_stock" className="block text-sm font-medium text-gray-700 mb-1">
                                                Initial Stock *
                                            </label>
                                            <InputTextComponent
                                                id="initial_stock"
                                                name="initial_stock"
                                                type="number"
                                                placeholder="1"
                                                value={formData.initial_stock}
                                                onChange={(e) => handleInputChange('initial_stock', parseInt(e.target.value) || 0)}
                                                required
                                                min="0"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Unit Price
                                            </label>
                                            <InputTextComponent
                                                id="unit_price"
                                                name="unit_price"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.unit_price}
                                                onChange={(e) => handleInputChange('unit_price', e.target.value)}
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
                                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                                Supplier
                                            </label>
                                            <InputTextComponent
                                                id="supplier"
                                                name="supplier"
                                                type="text"
                                                placeholder="e.g. Amazon, Best Buy"
                                                value={formData.supplier}
                                                onChange={(e) => handleInputChange('supplier', e.target.value)}
                                            />
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

                                    {/* Buttons */}
                                    <div className='flex justify-end gap-2 mt-4'>
                                        <Button
                                            type='submit'
                                            variant='primary'
                                            size='md'
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save'}
                                        </Button>

                                        <Button
                                            type='button'
                                            variant='danger'
                                            size='md'
                                            onClick={closeModal}
                                            disabled={loading}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
