import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreateStationsSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // Options for select dropdowns
    const stationTypes = [
        { label: 'Select Station Type', value: '' },
        { label: 'Employee Workstation', value: 'employee' },
        { label: 'Manager Office', value: 'manager' },
        { label: 'Executive Office', value: 'executive' },
        { label: 'Hot Desk', value: 'hotdesk' },
        { label: 'Meeting Room Station', value: 'meeting' },
        { label: 'Reception Desk', value: 'reception' },
        { label: 'Technical Workbench', value: 'technical' }
    ]

    const departments = [
        { label: 'Select Department', value: '' },
        { label: 'IT Department', value: 'it' },
        { label: 'Human Resources', value: 'hr' },
        { label: 'Finance', value: 'finance' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Operations', value: 'operations' },
        { label: 'Administration', value: 'admin' },
        { label: 'Executive', value: 'executive' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Site 1 - IT Department (3rd Floor)', value: 's1_it_3f' },
        { label: 'Site 1 - HR Department (5th Floor)', value: 's1_hr_5f' },
        { label: 'Site 1 - Executive Floor (10th Floor)', value: 's1_exec_10f' },
        { label: 'Site 1 - Finance Department (4th Floor)', value: 's1_fin_4f' },
        { label: 'Site 2 - Operations (Ground Floor)', value: 's2_ops_gf' },
        { label: 'Site 2 - Laboratory (1st Floor)', value: 's2_lab_1f' },
        { label: 'Site 2 - Marketing (2nd Floor)', value: 's2_mkt_2f' },
        { label: 'Site 3 - Administration (1st Floor)', value: 's3_admin_1f' },
        { label: 'Site 3 - Reception (Ground Floor)', value: 's3_rec_gf' },
        { label: 'Site 4 - Training Center (2nd Floor)', value: 's4_train_2f' },
        { label: 'Site 4 - Conference Rooms (3rd Floor)', value: 's4_conf_3f' }
    ]

    const status = [
        { label: 'Select Status', value: '' },
        { label: 'Occupied', value: 'occupied' },
        { label: 'Available', value: 'available' },
        { label: 'Under Setup', value: 'setup' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Reserved', value: 'reserved' }
    ]

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Add Station
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Workstation
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="station_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Name *
                                            </label>
                                            <InputTextComponent
                                                id="station_name"
                                                name="station_name"
                                                type="text"
                                                placeholder="e.g. WS-001, Manager Desk 1"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="station_code" className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Code *
                                            </label>
                                            <InputTextComponent
                                                id="station_code"
                                                name="station_code"
                                                type="text"
                                                placeholder="e.g. WS-001, MD-001"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="station_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Type *
                                            </label>
                                            <SelectComponent
                                                id="station_type"
                                                name="station_type"
                                                options={stationTypes}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                                Department *
                                            </label>
                                            <SelectComponent
                                                id="department"
                                                name="department"
                                                options={departments}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="assigned_employee" className="block text-sm font-medium text-gray-700 mb-1">
                                                Assigned Employee
                                            </label>
                                            <InputTextComponent
                                                id="assigned_employee"
                                                name="assigned_employee"
                                                type="text"
                                                placeholder="Employee name or ID"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="desk_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Desk/Seat Number
                                            </label>
                                            <InputTextComponent
                                                id="desk_number"
                                                name="desk_number"
                                                type="text"
                                                placeholder="e.g. D-101, Seat 25"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="phone_extension" className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Extension
                                            </label>
                                            <InputTextComponent
                                                id="phone_extension"
                                                name="phone_extension"
                                                type="text"
                                                placeholder="e.g. 1234, ext 567"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="network_port" className="block text-sm font-medium text-gray-700 mb-1">
                                                Network Port
                                            </label>
                                            <InputTextComponent
                                                id="network_port"
                                                name="network_port"
                                                type="text"
                                                placeholder="e.g. P-001, NP-123"
                                            />
                                        </div>
                                    </div>

                                    {/* Hidden field for created_by - will be set to current user */}
                                    <input type="hidden" name="created_by" value="current_user" />

                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional details about the workstation..."
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
