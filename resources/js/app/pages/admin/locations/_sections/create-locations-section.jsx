import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreateLocationsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // Options for select dropdowns
    const locationTypes = [
        { label: 'Select Location Type', value: '' },
        { label: 'Office', value: 'office' },
        { label: 'Storage Room', value: 'storage' },
        { label: 'Warehouse', value: 'warehouse' },
        { label: 'Conference Room', value: 'conference' },
        { label: 'Data Center', value: 'datacenter' },
        { label: 'Workshop', value: 'workshop' },
        { label: 'Laboratory', value: 'laboratory' }
    ]

    const buildings = [
        { label: 'Select Site/Building', value: '' },
        { label: 'Site 1 - Main Campus', value: 'site_1' },
        { label: 'Site 2 - North Building', value: 'site_2' },
        { label: 'Site 3 - South Building', value: 'site_3' },
        { label: 'Site 4 - West Building', value: 'site_4' }
    ]

    const floors = [
        { label: 'Select Floor', value: '' },
        { label: 'Ground Floor', value: 'ground' },
        { label: '1st Floor', value: '1st' },
        { label: '2nd Floor', value: '2nd' },
        { label: '3rd Floor', value: '3rd' },
        { label: '4th Floor', value: '4th' },
        { label: '5th Floor', value: '5th' },
        { label: '6th Floor', value: '6th' },
        { label: '7th Floor', value: '7th' },
        { label: '8th Floor', value: '8th' },
        { label: '9th Floor', value: '9th' },
        { label: '10th Floor', value: '10th' },
        { label: 'Basement Level 1', value: 'basement_1' },
        { label: 'Basement Level 2', value: 'basement_2' }
    ]

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Add Location
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Location
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="location_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Name *
                                            </label>
                                            <InputTextComponent
                                                id="location_name"
                                                name="location_name"
                                                type="text"
                                                placeholder="e.g. IT Department, Storage Room 1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="location_code" className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Code *
                                            </label>
                                            <InputTextComponent
                                                id="location_code"
                                                name="location_code"
                                                type="text"
                                                placeholder="e.g. IT-001, STR-001"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Type *
                                            </label>
                                            <SelectComponent
                                                id="location_type"
                                                name="location_type"
                                                options={locationTypes}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="building" className="block text-sm font-medium text-gray-700 mb-1">
                                                Site/Building *
                                            </label>
                                            <SelectComponent
                                                id="building"
                                                name="building"
                                                options={buildings}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-1">
                                                Floor *
                                            </label>
                                            <SelectComponent
                                                id="floor"
                                                name="floor"
                                                options={floors}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="room_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Room Number
                                            </label>
                                            <InputTextComponent
                                                id="room_number"
                                                name="room_number"
                                                type="text"
                                                placeholder="e.g. 101, A-205"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                                                Capacity (Items)
                                            </label>
                                            <InputTextComponent
                                                id="capacity"
                                                name="capacity"
                                                type="number"
                                                min="1"
                                                placeholder="50"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="manager" className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Manager
                                            </label>
                                            <InputTextComponent
                                                id="manager"
                                                name="manager"
                                                type="text"
                                                placeholder="Name of person responsible"
                                            />
                                        </div>
                                    </div>

                                    {/* Hidden field for created_by - will be set to current user */}
                                    <input type="hidden" name="created_by" value="current_user" />

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional details about the location..."
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
