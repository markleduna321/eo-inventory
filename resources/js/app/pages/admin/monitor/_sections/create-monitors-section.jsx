import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import InputLabelComponent from '@/app/pages/components/input-label-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import { createMonitor } from '@/app/redux/thunks/monitorThunk'
import { usePage } from '@inertiajs/react'

export default function CreateMonitorsSection() {
    const dispatch = useDispatch()
    const { auth } = usePage().props
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        serial_number: '',
        brand: '',
        model: '',
        size: '',
        resolution: '',
        refresh_rate: '',
        status: 'working',
        location: '',
        received_by: auth.user?.name || '',
        notes: '',
        price: ''
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })

    const openModal = () => setIsModalOpen(true)
    const closeModal = () => {
        setIsModalOpen(false)
        setFormData({
            serial_number: '',
            brand: '',
            model: '',
            size: '',
            resolution: '',
            refresh_rate: '',
            status: 'working',
            location: '',
            received_by: auth.user?.name || '',
            notes: '',
            price: ''
        })
        setErrors({})
        setAlert({ show: false, type: '', message: '' })
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const result = await dispatch(createMonitor(formData)).unwrap()
            setAlert({ 
                show: true, 
                type: 'success', 
                message: 'Monitor created successfully!' 
            })
            setTimeout(() => {
                closeModal()
            }, 1500)
        } catch (error) {
            console.error('Error creating monitor:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error?.message || (typeof error === 'string' ? error : 'Failed to create monitor')
            })
        } finally {
            setLoading(false)
        }
    }

    // Options for select dropdowns
    const brands = [
        { label: 'Select Brand', value: '' },
        { label: 'Dell', value: 'dell' },
        { label: 'HP', value: 'hp' },
        { label: 'LG', value: 'lg' },
        { label: 'Samsung', value: 'samsung' },
        { label: 'ASUS', value: 'asus' },
        { label: 'Acer', value: 'acer' },
        { label: 'BenQ', value: 'benq' },
        { label: 'AOC', value: 'aoc' },
        { label: 'ViewSonic', value: 'viewsonic' },
        { label: 'Redmi', value: 'redmi' },
        { label: 'Nvision', value: 'nvision' },
        { label: 'Philips', value: 'philips' },
        { label: 'Migen', value: 'migen' },
        { label: 'Fonudar', value: 'fonudar' },
        { label: 'Other', value: 'other' }
    ]

    const sizes = [
        { label: 'Select Size', value: '' },
        { label: '19"', value: '19' },
        { label: '20"', value: '20' },
        { label: '21"', value: '21' },
        { label: '22"', value: '22' },
        { label: '23"', value: '23' },
        { label: '24"', value: '24' },
        { label: '27"', value: '27' },
        { label: '32"', value: '32' },
        { label: '34"', value: '34' },
        { label: '43"', value: '43' }
    ]

    const resolutions = [
        { label: 'Select Resolution', value: '' },
        { label: '1366x768 (HD)', value: '1366x768' },
        { label: '1920x1080 (Full HD)', value: '1920x1080' },
        { label: '2560x1440 (QHD)', value: '2560x1440' },
        { label: '3840x2160 (4K)', value: '3840x2160' },
        { label: '5120x2880 (5K)', value: '5120x2880' }
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
                Add Monitor
            </Button>

            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Add New Monitor
                            </h3>
                            
                            {alert.show && (
                                <Alert 
                                    type={alert.type} 
                                    message={alert.message} 
                                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                                />
                            )}
                            
                            <div className="mt-2">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand *
                                            </label>
                                            <SelectComponent
                                                id="brand"
                                                name="brand"
                                                options={brands}
                                                value={formData.brand}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.brand && <InputError message={errors.brand} />}
                                        </div>
                                        <div>
                                            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
                                                Model *
                                            </label>
                                            <InputTextComponent
                                                id="model"
                                                name="model"
                                                type="text"
                                                placeholder="e.g. U2419H, 24GL600F"
                                                value={formData.model}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.model && <InputError message={errors.model} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Serial Number *
                                            </label>
                                            <InputTextComponent
                                                id="serial_number"
                                                name="serial_number"
                                                type="text"
                                                placeholder="e.g. MNT123456789"
                                                value={formData.serial_number}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.serial_number && <InputError message={errors.serial_number} />}
                                        </div>
                                        <div>
                                            <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                                                Screen Size *
                                            </label>
                                            <SelectComponent
                                                id="size"
                                                name="size"
                                                options={sizes}
                                                value={formData.size}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.size && <InputError message={errors.size} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
                                                Resolution *
                                            </label>
                                            <SelectComponent
                                                id="resolution"
                                                name="resolution"
                                                options={resolutions}
                                                value={formData.resolution}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.resolution && <InputError message={errors.resolution} />}
                                        </div>
                                        <div>
                                            <label htmlFor="refresh_rate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Refresh Rate (Hz)
                                            </label>
                                            <InputTextComponent
                                                id="refresh_rate"
                                                name="refresh_rate"
                                                type="number"
                                                placeholder="60"
                                                value={formData.refresh_rate}
                                                onChange={handleInputChange}
                                            />
                                            {errors.refresh_rate && <InputError message={errors.refresh_rate} />}
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
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.status && <InputError message={errors.status} />}
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
                                                onChange={handleInputChange}
                                                required
                                            />
                                            {errors.location && <InputError message={errors.location} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                                Price (₱) (Optional)
                                            </label>
                                            <InputTextComponent
                                                id="price"
                                                name="price"
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                value={formData.price}
                                                onChange={handleInputChange}
                                            />
                                            {errors.price && <InputError message={errors.price} />}
                                        </div>
                                        <div></div>
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
                                            placeholder="Additional notes about the monitor..."
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                        />
                                        {errors.notes && <InputError message={errors.notes} />}
                                    </div>

                                    {/* Buttons */}
                                    <div className='flex float-end gap-2 mt-4'>
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
