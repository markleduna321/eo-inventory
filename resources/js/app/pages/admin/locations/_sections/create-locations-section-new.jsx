import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import { createLocation } from '@/app/redux/thunks/locationThunk'

export default function CreateLocationsSection() {
    const dispatch = useDispatch()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: '',
        building: '',
        floor: '',
        room: '',
        capacity: '',
        manager: '',
        description: '',
        status: 'Active'
    })

    const openModal = () => {
        setIsModalOpen(true)
        setErrors({})
        setAlert({ show: false, type: '', message: '' })
    }
    
    const closeModal = () => {
        setIsModalOpen(false)
        setFormData({
            name: '',
            code: '',
            type: '',
            building: '',
            floor: '',
            room: '',
            capacity: '',
            manager: '',
            description: '',
            status: 'Active'
        })
        setErrors({})
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})

        try {
            const locationData = {
                ...formData,
                capacity: parseInt(formData.capacity) || 1
            }
            
            await dispatch(createLocation(locationData)).unwrap()
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Location created successfully!'
            })
            
            setTimeout(() => {
                closeModal()
            }, 1500)
        } catch (error) {
            setErrors({ general: error })
            setAlert({
                show: true,
                type: 'error',
                message: error
            })
        } finally {
            setLoading(false)
        }
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    // Options for select dropdowns
    const locationTypes = [
        { label: 'Select Location Type', value: '' },
        { label: 'Office', value: 'Office' },
        { label: 'Conference', value: 'Conference' },
        { label: 'Storage', value: 'Storage' },
        { label: 'Data Center', value: 'Data Center' },
        { label: 'Laboratory', value: 'Laboratory' },
        { label: 'Workshop', value: 'Workshop' },
        { label: 'Other', value: 'Other' }
    ]

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Under Maintenance', value: 'Under Maintenance' }
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

            <Modal open={isModalOpen} onClose={closeModal} title="Add New Location" size="large">
                {alert.show && (
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        onClose={() => setAlert({ show: false, type: '', message: '' })}
                    />
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {errors.general && (
                        <Alert type="error" message={errors.general} />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Name *
                            </label>
                            <InputTextComponent
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g. IT Department, Storage Room 1"
                                required
                            />
                            {errors.name && <InputError message={errors.name} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Code *
                            </label>
                            <InputTextComponent
                                value={formData.code}
                                onChange={(e) => handleInputChange('code', e.target.value)}
                                placeholder="e.g. S1-IT-001, S2-STR-001"
                                required
                            />
                            {errors.code && <InputError message={errors.code} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <SelectComponent
                                value={formData.type}
                                onChange={(e) => handleInputChange('type', e.target.value)}
                                options={locationTypes}
                                required
                            />
                            {errors.type && <InputError message={errors.type} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Building *
                            </label>
                            <InputTextComponent
                                value={formData.building}
                                onChange={(e) => handleInputChange('building', e.target.value)}
                                placeholder="e.g. Site 1 - Main Campus"
                                required
                            />
                            {errors.building && <InputError message={errors.building} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Floor *
                            </label>
                            <InputTextComponent
                                value={formData.floor}
                                onChange={(e) => handleInputChange('floor', e.target.value)}
                                placeholder="e.g. 3rd Floor, Ground Floor"
                                required
                            />
                            {errors.floor && <InputError message={errors.floor} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room *
                            </label>
                            <InputTextComponent
                                value={formData.room}
                                onChange={(e) => handleInputChange('room', e.target.value)}
                                placeholder="e.g. 301, A-205"
                                required
                            />
                            {errors.room && <InputError message={errors.room} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity *
                            </label>
                            <InputTextComponent
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => handleInputChange('capacity', e.target.value)}
                                placeholder="50"
                                min="1"
                                required
                            />
                            {errors.capacity && <InputError message={errors.capacity} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manager
                            </label>
                            <InputTextComponent
                                value={formData.manager}
                                onChange={(e) => handleInputChange('manager', e.target.value)}
                                placeholder="Name of person responsible"
                            />
                            {errors.manager && <InputError message={errors.manager} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <SelectComponent
                                value={formData.status}
                                onChange={(e) => handleInputChange('status', e.target.value)}
                                options={statusOptions}
                            />
                            {errors.status && <InputError message={errors.status} />}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Additional details about the location..."
                        />
                        {errors.description && <InputError message={errors.description} />}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                        >
                            {loading ? 'Creating...' : 'Create Location'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
