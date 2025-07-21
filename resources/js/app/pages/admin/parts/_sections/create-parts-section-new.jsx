import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreatePartsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [partTypes, setPartTypes] = useState([])
    const [formData, setFormData] = useState({
        type: '',
        brand: '',
        model: '',
        description: '',
        specifications: {},
        location: '',
        notes: '',
        initial_stock: 1,
        unit_price: '',
        supplier: '',
        purchase_order: '',
        invoice_number: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_notes: '',
        received_by: 'current_user',
        // For individual items
        items: []
    })

    // Dynamic specifications based on part type
    const [specFields, setSpecFields] = useState([])

    const fetchPartTypes = async () => {
        try {
            const response = await fetch('/api/parts/types', {
                headers: { 'Accept': 'application/json' }
            })
            if (response.ok) {
                const types = await response.json()
                const typeOptions = [
                    { label: 'Select Part Type', value: '' },
                    ...Object.entries(types).map(([value, label]) => ({ label, value }))
                ]
                setPartTypes(typeOptions)
            }
        } catch (error) {
            console.error('Error fetching part types:', error)
        }
    }

    useEffect(() => {
        fetchPartTypes()
    }, [])

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => {
        setIsModalOpen(false)
        resetForm()
    }

    const resetForm = () => {
        setFormData({
            type: '',
            brand: '',
            model: '',
            description: '',
            specifications: {},
            location: '',
            notes: '',
            initial_stock: 1,
            unit_price: '',
            supplier: '',
            purchase_order: '',
            invoice_number: '',
            delivery_date: new Date().toISOString().split('T')[0],
            delivery_notes: '',
            received_by: 'current_user',
            items: []
        })
        setSpecFields([])
    }

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

    const handlePartTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            type: type,
            specifications: {}
        }))

        // Set dynamic specification fields based on part type
        const specificationFields = getSpecificationFields(type)
        setSpecFields(specificationFields)
    }

    const getSpecificationFields = (type) => {
        const specs = {
            'ram': [
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g. 16GB', required: true },
                { key: 'type', label: 'Type', placeholder: 'e.g. DDR4', required: true },
                { key: 'speed', label: 'Speed', placeholder: 'e.g. 3200MHz', required: false },
                { key: 'form_factor', label: 'Form Factor', placeholder: 'e.g. DIMM', required: false }
            ],
            'ssd': [
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g. 1TB', required: true },
                { key: 'interface', label: 'Interface', placeholder: 'e.g. NVMe M.2', required: true },
                { key: 'form_factor', label: 'Form Factor', placeholder: 'e.g. 2280', required: false },
                { key: 'read_speed', label: 'Read Speed', placeholder: 'e.g. 7000 MB/s', required: false }
            ],
            'hdd': [
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g. 2TB', required: true },
                { key: 'interface', label: 'Interface', placeholder: 'e.g. SATA III', required: true },
                { key: 'rpm', label: 'RPM', placeholder: 'e.g. 7200', required: false },
                { key: 'form_factor', label: 'Form Factor', placeholder: 'e.g. 3.5"', required: false }
            ],
            'gpu': [
                { key: 'memory', label: 'Memory', placeholder: 'e.g. 12GB GDDR6X', required: true },
                { key: 'base_clock', label: 'Base Clock', placeholder: 'e.g. 1920 MHz', required: false },
                { key: 'boost_clock', label: 'Boost Clock', placeholder: 'e.g. 2475 MHz', required: false },
                { key: 'interface', label: 'Interface', placeholder: 'e.g. PCIe 4.0 x16', required: false }
            ],
            'cpu': [
                { key: 'cores', label: 'Cores', placeholder: 'e.g. 8', required: true },
                { key: 'threads', label: 'Threads', placeholder: 'e.g. 16', required: false },
                { key: 'base_clock', label: 'Base Clock', placeholder: 'e.g. 3.8 GHz', required: false },
                { key: 'socket', label: 'Socket', placeholder: 'e.g. AM4', required: true }
            ],
            'motherboard': [
                { key: 'socket', label: 'Socket', placeholder: 'e.g. AM4', required: true },
                { key: 'form_factor', label: 'Form Factor', placeholder: 'e.g. ATX', required: true },
                { key: 'chipset', label: 'Chipset', placeholder: 'e.g. B550', required: false },
                { key: 'memory_slots', label: 'Memory Slots', placeholder: 'e.g. 4', required: false }
            ],
            'psu': [
                { key: 'wattage', label: 'Wattage', placeholder: 'e.g. 750W', required: true },
                { key: 'efficiency', label: 'Efficiency', placeholder: 'e.g. 80+ Gold', required: false },
                { key: 'modular', label: 'Modular', placeholder: 'e.g. Full', required: false }
            ]
        }
        return specs[type] || []
    }

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items]
        newItems[index] = { ...newItems[index], [field]: value }
        setFormData(prev => ({ ...prev, items: newItems }))
    }

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { serial_number: '', barcode: '' }]
        }))
    }

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }))
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

            const response = await fetch('/api/parts', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                closeModal()
                window.location.reload() // Refresh to show new part
            } else {
                const errorData = await response.json()
                console.error('Failed to create part:', errorData)
                alert('Failed to create part. Please check the form and try again.')
            }
        } catch (error) {
            console.error('Error creating part:', error)
            alert('An error occurred while creating the part.')
        } finally {
            setLoading(false)
        }
    }

    const brands = [
        { label: 'Select Brand', value: '' },
        { label: 'Intel', value: 'Intel' },
        { label: 'AMD', value: 'AMD' },
        { label: 'NVIDIA', value: 'NVIDIA' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'Kingston', value: 'Kingston' },
        { label: 'Corsair', value: 'Corsair' },
        { label: 'Western Digital', value: 'Western Digital' },
        { label: 'Seagate', value: 'Seagate' },
        { label: 'ASUS', value: 'ASUS' },
        { label: 'MSI', value: 'MSI' },
        { label: 'Gigabyte', value: 'Gigabyte' },
        { label: 'Cooler Master', value: 'Cooler Master' },
        { label: 'Other', value: 'Other' }
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

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Add Part
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Part
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4" onSubmit={handleSubmit}>
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Part Type *
                                            </label>
                                            <SelectComponent
                                                id="type"
                                                name="type"
                                                options={partTypes}
                                                value={formData.type}
                                                onChange={(e) => handlePartTypeChange(e.target.value)}
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
                                                placeholder="e.g. Vengeance LPX 16GB"
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

                                    {/* Dynamic Specifications */}
                                    {specFields.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900 mb-2">Specifications</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {specFields.map((field) => (
                                                    <div key={field.key}>
                                                        <label htmlFor={field.key} className="block text-sm font-medium text-gray-700 mb-1">
                                                            {field.label} {field.required && '*'}
                                                        </label>
                                                        <InputTextComponent
                                                            id={field.key}
                                                            name={field.key}
                                                            type="text"
                                                            placeholder={field.placeholder}
                                                            value={formData.specifications[field.key] || ''}
                                                            onChange={(e) => handleSpecificationChange(field.key, e.target.value)}
                                                            required={field.required}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Stock and Pricing */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    </div>

                                    {/* Delivery Information */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                                Supplier
                                            </label>
                                            <InputTextComponent
                                                id="supplier"
                                                name="supplier"
                                                type="text"
                                                placeholder="e.g. Newegg, Amazon"
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

                                    {/* Individual Items Section */}
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="text-sm font-medium text-gray-900">Individual Items (Optional)</h4>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="xs"
                                                onClick={addItem}
                                            >
                                                Add Item
                                            </Button>
                                        </div>
                                        {formData.items.map((item, index) => (
                                            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 p-2 border rounded">
                                                <InputTextComponent
                                                    placeholder="Serial Number"
                                                    value={item.serial_number || ''}
                                                    onChange={(e) => handleItemChange(index, 'serial_number', e.target.value)}
                                                />
                                                <InputTextComponent
                                                    placeholder="Barcode"
                                                    value={item.barcode || ''}
                                                    onChange={(e) => handleItemChange(index, 'barcode', e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="xs"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        {formData.items.length === 0 && (
                                            <p className="text-sm text-gray-500">
                                                Add individual items to track serial numbers and barcodes. 
                                                If not specified, generic items will be created.
                                            </p>
                                        )}
                                    </div>

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
                                            placeholder="Description of the part..."
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className='flex justify-end gap-2 mt-4'>
                                        <Button
                                            type='submit'
                                            variant='primary'
                                            size='md'
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Part'}
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
