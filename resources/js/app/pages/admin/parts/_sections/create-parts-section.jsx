import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreatePartsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // Options for select dropdowns
    const partTypes = [
        { label: 'Select Part Type', value: '' },
        { label: 'RAM', value: 'ram' },
        { label: 'Hard Drive', value: 'hard_drive' },
        { label: 'SSD', value: 'ssd' },
        { label: 'Graphics Card', value: 'graphics_card' },
        { label: 'Motherboard', value: 'motherboard' },
        { label: 'CPU', value: 'cpu' },
        { label: 'Power Supply', value: 'power_supply' },
        { label: 'CPU Cooler', value: 'cpu_cooler' },
        { label: 'Case Fan', value: 'case_fan' },
        { label: 'Network Card', value: 'network_card' },
        { label: 'Sound Card', value: 'sound_card' },
        { label: 'Optical Drive', value: 'optical_drive' },
        { label: 'Cable', value: 'cable' },
        { label: 'Adapter', value: 'adapter' },
        { label: 'Other', value: 'other' }
    ]

    const brands = [
        { label: 'Select Brand', value: '' },
        { label: 'Intel', value: 'intel' },
        { label: 'AMD', value: 'amd' },
        { label: 'NVIDIA', value: 'nvidia' },
        { label: 'Samsung', value: 'samsung' },
        { label: 'Kingston', value: 'kingston' },
        { label: 'Corsair', value: 'corsair' },
        { label: 'Western Digital', value: 'western_digital' },
        { label: 'Seagate', value: 'seagate' },
        { label: 'ASUS', value: 'asus' },
        { label: 'MSI', value: 'msi' },
        { label: 'Gigabyte', value: 'gigabyte' },
        { label: 'Cooler Master', value: 'cooler_master' },
        { label: 'Thermaltake', value: 'thermaltake' },
        { label: 'Other', value: 'other' }
    ]

    const conditions = [
        { label: 'Select Condition', value: '' },
        { label: 'New', value: 'new' },
        { label: 'Like New', value: 'like_new' },
        { label: 'Good', value: 'good' },
        { label: 'Fair', value: 'fair' },
        { label: 'Poor', value: 'poor' },
        { label: 'Defective', value: 'defective' }
    ]

    const status = [
        { label: 'Select Status', value: '' },
        { label: 'Available', value: 'available' },
        { label: 'In Use', value: 'in_use' },
        { label: 'Reserved', value: 'reserved' },
        { label: 'Out of Stock', value: 'out_of_stock' },
        { label: 'Discontinued', value: 'discontinued' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Storage Room A', value: 'storage_a' },
        { label: 'Storage Room B', value: 'storage_b' },
        { label: 'IT Department', value: 'it_department' },
        { label: 'Repair Center', value: 'repair_center' },
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
                Add Part/Accessory
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Part/Accessory
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="part_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Part Type *
                                            </label>
                                            <SelectComponent
                                                id="part_type"
                                                name="part_type"
                                                options={partTypes}
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
                                                placeholder="e.g. ValueRAM 8GB DDR4, GTX 1650"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="part_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Part Number *
                                            </label>
                                            <InputTextComponent
                                                id="part_number"
                                                name="part_number"
                                                type="text"
                                                placeholder="e.g. KVR26N19S8/8, 90YV0DT0-M0NA00"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                                                Quantity *
                                            </label>
                                            <InputTextComponent
                                                id="quantity"
                                                name="quantity"
                                                type="number"
                                                min="1"
                                                placeholder="1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                                                Condition *
                                            </label>
                                            <SelectComponent
                                                id="condition"
                                                name="condition"
                                                options={conditions}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Status *
                                            </label>
                                            <SelectComponent
                                                id="status"
                                                name="status"
                                                options={status}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                                                Storage Location *
                                            </label>
                                            <SelectComponent
                                                id="location"
                                                name="location"
                                                options={locations}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Hidden field for received_by - will be set to current user */}
                                    <input type="hidden" name="received_by" value="current_user" />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Purchase Date (Optional)
                                            </label>
                                            <InputTextComponent
                                                id="purchase_date"
                                                name="purchase_date"
                                                type="date"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Price (Optional)
                                            </label>
                                            <InputTextComponent
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
                                            Specifications (Optional)
                                        </label>
                                        <textarea
                                            id="specifications"
                                            name="specifications"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Technical specifications, compatibility, etc..."
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
                                            placeholder="Additional notes or comments..."
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Buttons */}
                            <div className='flex float-end gap-2 mt-4'>
                                <Button
                                    type='button'
                                    variant='primary'
                                    size='md'
                                >
                                    Save
                                </Button>

                                <Button
                                    type='button'
                                    variant='danger'
                                    size='md'
                                    onClick={closeModal}>
                                    X
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
