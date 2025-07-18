import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import { createStation, fetchAvailableMonitors, fetchStationLocations } from '@/app/redux/thunks/stationThunk'

export default function CreateStationsSection() {
    const dispatch = useDispatch()
    const { availableMonitors, locations, loading } = useSelector(state => state.stations)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [errors, setErrors] = useState({})
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        type: '',
        department: '',
        location_id: '',
        assigned_user: '',
        description: '',
        status: 'active',
        assigned_monitors: []
    })

    const openModal = () => {
        setIsModalOpen(true)
        setErrors({})
        setAlert({ show: false, type: '', message: '' })
        // Fetch available data when modal opens
        dispatch(fetchAvailableMonitors())
        dispatch(fetchStationLocations())
    }
    
    const closeModal = () => {
        setIsModalOpen(false)
        setFormData({
            name: '',
            code: '',
            type: '',
            department: '',
            location_id: '',
            assigned_user: '',
            description: '',
            status: 'active',
            assigned_monitors: []
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

    const handleMonitorSelection = (monitorId) => {
        setFormData(prev => ({
            ...prev,
            assigned_monitors: prev.assigned_monitors.includes(monitorId)
                ? prev.assigned_monitors.filter(id => id !== monitorId)
                : [...prev.assigned_monitors, monitorId]
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        try {
            await dispatch(createStation(formData)).unwrap()
            setAlert({ 
                show: true, 
                type: 'success', 
                message: 'Station created successfully!' 
            })
            setTimeout(() => {
                closeModal()
            }, 1500)
        } catch (error) {
            console.error('Error creating station:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error || 'Failed to create station' 
            })
        }
    }

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
        { label: 'IT Department', value: 'IT Department' },
        { label: 'Human Resources', value: 'Human Resources' },
        { label: 'Finance', value: 'Finance' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Operations', value: 'Operations' },
        { label: 'Administration', value: 'Administration' },
        { label: 'Executive', value: 'Executive' },
        { label: 'Shared', value: 'Shared' }
    ]

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' }
    ]

    const locationOptions = [
        { label: 'Select Location', value: '' },
        ...locations.map(location => ({
            label: `${location.name} - ${location.building}, ${location.floor}`,
            value: location.id
        }))
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
                                Add New Station
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
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Name *
                                            </label>
                                            <InputTextComponent
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Executive Office CEO"
                                                required
                                            />
                                            {errors.name && <InputError message={errors.name} />}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Code *
                                            </label>
                                            <InputTextComponent
                                                name="code"
                                                value={formData.code}
                                                onChange={handleInputChange}
                                                placeholder="e.g. EXE-CEO-001"
                                                required
                                            />
                                            {errors.code && <InputError message={errors.code} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Station Type *
                                            </label>
                                            <SelectComponent
                                                name="type"
                                                value={formData.type}
                                                onChange={handleInputChange}
                                                options={stationTypes}
                                                required
                                            />
                                            {errors.type && <InputError message={errors.type} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Department *
                                            </label>
                                            <SelectComponent
                                                name="department"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                options={departments}
                                                required
                                            />
                                            {errors.department && <InputError message={errors.department} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Location *
                                            </label>
                                            <SelectComponent
                                                name="location_id"
                                                value={formData.location_id}
                                                onChange={handleInputChange}
                                                options={locationOptions}
                                                required
                                            />
                                            {errors.location_id && <InputError message={errors.location_id} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Assigned User
                                            </label>
                                            <InputTextComponent
                                                name="assigned_user"
                                                value={formData.assigned_user}
                                                onChange={handleInputChange}
                                                placeholder="e.g. John Smith"
                                            />
                                            {errors.assigned_user && <InputError message={errors.assigned_user} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Status
                                            </label>
                                            <SelectComponent
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                options={statusOptions}
                                            />
                                            {errors.status && <InputError message={errors.status} />}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            placeholder="Enter station description"
                                        />
                                        {errors.description && <InputError message={errors.description} />}
                                    </div>

                                    {/* Monitor Assignment Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Monitors (Optional)
                                        </label>
                                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            {availableMonitors.length > 0 ? (
                                                availableMonitors.map(monitor => (
                                                    <div key={monitor.id} className="flex items-center mb-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`monitor-${monitor.id}`}
                                                            checked={formData.assigned_monitors.includes(monitor.id)}
                                                            onChange={() => handleMonitorSelection(monitor.id)}
                                                            className="mr-2"
                                                        />
                                                        <label htmlFor={`monitor-${monitor.id}`} className="text-sm">
                                                            {monitor.brand} {monitor.model} ({monitor.size}") - {monitor.serial_number}
                                                        </label>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-gray-500">No available monitors</p>
                                            )}
                                        </div>
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
                                            {loading ? 'Creating...' : 'Create Station'}
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
