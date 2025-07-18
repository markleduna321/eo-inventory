import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreatePeripheralsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

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

    const status = [
        { label: 'Select Status', value: '' },
        { label: 'Working', value: 'working' },
        { label: 'Not Working', value: 'not_working' },
        { label: 'Under Repair', value: 'under_repair' },
        { label: 'Retired', value: 'retired' }
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
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="peripheral_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Peripheral Type *
                                            </label>
                                            <SelectComponent
                                                id="peripheral_type"
                                                name="peripheral_type"
                                                options={peripheralTypes}
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
                                                placeholder="e.g. MX Keys, Surface Mouse"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Serial Number *
                                            </label>
                                            <InputTextComponent
                                                id="serial_number"
                                                name="serial_number"
                                                type="text"
                                                placeholder="e.g. PER123456789"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Status *
                                            </label>
                                            <SelectComponent
                                                id="status"
                                                name="status"
                                                options={status}
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
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Hidden field for received_by - will be set to current user */}
                                    <input type="hidden" name="received_by" value="current_user" />

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional details about the peripheral..."
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
