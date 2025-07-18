import React, { useState } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreateRequestSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // Options for select dropdowns
    const requestTypes = [
        { label: 'Select Request Type', value: '' },
        { label: 'New Asset Request', value: 'new_asset' },
        { label: 'Asset Transfer', value: 'transfer' },
        { label: 'Asset Replacement', value: 'replacement' },
        { label: 'Asset Repair', value: 'repair' },
        { label: 'Asset Return', value: 'return' },
        { label: 'Asset Upgrade', value: 'upgrade' }
    ]

    const assetCategories = [
        { label: 'Select Asset Category', value: '' },
        { label: 'Laptop/Computer', value: 'laptop' },
        { label: 'Monitor', value: 'monitor' },
        { label: 'Peripherals', value: 'peripherals' },
        { label: 'Parts/Accessories', value: 'parts' },
        { label: 'System Unit', value: 'system_unit' },
        { label: 'Network Equipment', value: 'network' },
        { label: 'Mobile Device', value: 'mobile' },
        { label: 'Office Equipment', value: 'office' }
    ]

    const priorities = [
        { label: 'Select Priority', value: '' },
        { label: 'Low', value: 'low' },
        { label: 'Normal', value: 'normal' },
        { label: 'High', value: 'high' },
        { label: 'Urgent', value: 'urgent' },
        { label: 'Critical', value: 'critical' }
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

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Create Request
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Create New Asset Request
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="request_type" className="block text-sm font-medium text-gray-700 mb-1">
                                                Request Type *
                                            </label>
                                            <SelectComponent
                                                id="request_type"
                                                name="request_type"
                                                options={requestTypes}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="asset_category" className="block text-sm font-medium text-gray-700 mb-1">
                                                Asset Category *
                                            </label>
                                            <SelectComponent
                                                id="asset_category"
                                                name="asset_category"
                                                options={assetCategories}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="requester_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Requester Name *
                                            </label>
                                            <InputTextComponent
                                                id="requester_name"
                                                name="requester_name"
                                                type="text"
                                                placeholder="Employee name"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Employee ID *
                                            </label>
                                            <InputTextComponent
                                                id="employee_id"
                                                name="employee_id"
                                                type="text"
                                                placeholder="e.g. EMP-001"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <div>
                                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                                                Priority *
                                            </label>
                                            <SelectComponent
                                                id="priority"
                                                name="priority"
                                                options={priorities}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="needed_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Date Needed
                                            </label>
                                            <InputTextComponent
                                                id="needed_date"
                                                name="needed_date"
                                                type="date"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="budget_estimate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Budget Estimate ($)
                                            </label>
                                            <InputTextComponent
                                                id="budget_estimate"
                                                name="budget_estimate"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="asset_specification" className="block text-sm font-medium text-gray-700 mb-1">
                                            Asset Specification *
                                        </label>
                                        <textarea
                                            id="asset_specification"
                                            name="asset_specification"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Detailed specifications of the requested asset..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="business_justification" className="block text-sm font-medium text-gray-700 mb-1">
                                            Business Justification *
                                        </label>
                                        <textarea
                                            id="business_justification"
                                            name="business_justification"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Explain why this asset is needed for business operations..."
                                            required
                                        />
                                    </div>

                                    {/* Hidden field for created_by - will be set to current user */}
                                    <input type="hidden" name="created_by" value="current_user" />
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
