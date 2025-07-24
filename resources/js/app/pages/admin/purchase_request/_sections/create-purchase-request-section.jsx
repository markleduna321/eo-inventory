import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'

export default function CreatePurchaseRequestSection() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [currentUser, setCurrentUser] = useState('')

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/user', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Accept': 'application/json'
                }
            })
            if (response.ok) {
                const user = await response.json()
                setCurrentUser(user.name)
            }
        } catch (error) {
            console.error('Failed to fetch current user:', error)
        }
    }

    useEffect(() => {
        fetchCurrentUser()
    }, [])

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => setIsModalOpen(false)

    // Options for select dropdowns
    const categories = [
        { label: 'Select Category', value: '' },
        { label: 'Computer Hardware', value: 'computer_hardware' },
        { label: 'Office Equipment', value: 'office_equipment' },
        { label: 'Network Equipment', value: 'network_equipment' },
        { label: 'Software Licenses', value: 'software_licenses' },
        { label: 'Furniture', value: 'furniture' },
        { label: 'Mobile Devices', value: 'mobile_devices' },
        { label: 'Audio/Visual Equipment', value: 'av_equipment' },
        { label: 'Other', value: 'other' }
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

    const suppliers = [
        { label: 'Select Preferred Supplier', value: '' },
        { label: 'Dell Technologies', value: 'dell' },
        { label: 'HP Inc.', value: 'hp' },
        { label: 'Lenovo', value: 'lenovo' },
        { label: 'Microsoft', value: 'microsoft' },
        { label: 'Amazon Business', value: 'amazon' },
        { label: 'CDW', value: 'cdw' },
        { label: 'Best Buy Business', value: 'bestbuy' },
        { label: 'Other', value: 'other' }
    ]

    return (
        <div>
            <Button
                type='button'
                variant='primary'
                size='md'
                onClick={openModal}
            >
                Create Purchase Request
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Create New Purchase Request
                            </h3>
                            <div className="mt-2">
                                <form className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Item/Product Name *
                                            </label>
                                            <InputTextComponent
                                                id="item_name"
                                                name="item_name"
                                                type="text"
                                                placeholder="e.g. Dell Latitude 5530 Laptop"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                                Category *
                                            </label>
                                            <SelectComponent
                                                id="category"
                                                name="category"
                                                options={categories}
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
                                            <label htmlFor="unit_price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Estimated Unit Price ($) *
                                            </label>
                                            <InputTextComponent
                                                id="unit_price"
                                                name="unit_price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700 mb-1">
                                                Total Amount ($)
                                            </label>
                                            <InputTextComponent
                                                id="total_amount"
                                                name="total_amount"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Auto-calculated"
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                                                Requesting Department *
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
                                            <label htmlFor="preferred_supplier" className="block text-sm font-medium text-gray-700 mb-1">
                                                Preferred Supplier
                                            </label>
                                            <SelectComponent
                                                id="preferred_supplier"
                                                name="preferred_supplier"
                                                options={suppliers}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Required Delivery Date
                                            </label>
                                            <InputTextComponent
                                                id="delivery_date"
                                                name="delivery_date"
                                                type="date"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="budget_code" className="block text-sm font-medium text-gray-700 mb-1">
                                                Budget Code
                                            </label>
                                            <InputTextComponent
                                                id="budget_code"
                                                name="budget_code"
                                                type="text"
                                                placeholder="e.g. IT-2025-Q3"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="cost_center" className="block text-sm font-medium text-gray-700 mb-1">
                                                Cost Center
                                            </label>
                                            <InputTextComponent
                                                id="cost_center"
                                                name="cost_center"
                                                type="text"
                                                placeholder="e.g. CC-IT-001"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
                                            Detailed Specifications *
                                        </label>
                                        <textarea
                                            id="specifications"
                                            name="specifications"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Detailed technical specifications, model numbers, etc..."
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
                                            placeholder="Explain why this purchase is necessary for business operations..."
                                            required
                                        />
                                    </div>

                                    {/* Hidden field for created_by - will be set to current user */}
                                    <input type="hidden" name="created_by" value={currentUser} />
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
