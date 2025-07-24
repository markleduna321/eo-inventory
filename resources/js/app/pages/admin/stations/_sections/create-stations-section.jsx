import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import SelectComponent from '@/app/pages/components/input-select'
import InputTextComponent from '@/app/pages/components/input-text-component'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import { createStation, fetchAvailableMonitors, fetchAvailableSystemUnits, fetchAvailablePeripherals, fetchStationLocations } from '@/app/redux/thunks/stationThunk'
import { useLocationRefresh } from '@/app/hooks/useLocationRefresh'

export default function CreateStationsSection() {
    const dispatch = useDispatch()
    const { availableMonitors, availableSystemUnits, availablePeripherals, locations, loading } = useSelector(state => state.stations)
    const { refreshLocations } = useLocationRefresh()
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
        assigned_monitors: [],
        assigned_system_units: [],
        assigned_peripherals: []
    })

    const openModal = () => {
        setIsModalOpen(true)
        setErrors({})
        setAlert({ show: false, type: '', message: '' })
        // Fetch available data when modal opens
        dispatch(fetchAvailableMonitors())
        dispatch(fetchAvailableSystemUnits())
        dispatch(fetchAvailablePeripherals())
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
            assigned_monitors: [],
            assigned_system_units: [],
            assigned_peripherals: []
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

    const handleSystemUnitSelection = (systemUnitId) => {
        setFormData(prev => ({
            ...prev,
            assigned_system_units: prev.assigned_system_units.includes(systemUnitId)
                ? [] // If already selected, deselect it (clear array)
                : [systemUnitId] // If not selected, select only this one (replace array)
        }))
    }

    const handlePeripheralSelection = (peripheralId) => {
        setFormData(prev => ({
            ...prev,
            assigned_peripherals: prev.assigned_peripherals.includes(peripheralId)
                ? prev.assigned_peripherals.filter(id => id !== peripheralId)
                : [...prev.assigned_peripherals, peripheralId]
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
            // Refresh locations to update capacity counts
            dispatch(fetchStationLocations())
            refreshLocations()
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
        { label: 'Team Lead Workstation', value: 'team_lead' },
        { label: 'Manager Workstation', value: 'manager' },
        { label: 'Executive Workstation', value: 'executive' },
        { label: 'Hot Desk', value: 'hotdesk' },
        { label: 'Meeting Room Station', value: 'meeting' },
        { label: 'Reception Desk', value: 'reception' },
        { label: 'Technical Workbench', value: 'technical' }
    ]

    const departments = [
        { label: 'Select Department', value: '' },
        { label: 'IT Department', value: 'IT Department' },
        { label: 'Human Resources', value: 'Human Resources' },
        { label: 'Accounting', value: 'Accounting' },
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
        ...locations.map(location => {
            const capacityText = location.capacity_display || `${location.current_count || 0}/${location.capacity || '∞'}`
            const label = `${location.name} - ${location.building}, ${location.floor} (${capacityText})`
            const isFull = location.is_full || (location.capacity > 0 && (location.current_count || 0) >= location.capacity)
            
            return {
                label: isFull ? `${label} - FULL` : label,
                value: location.id,
                disabled: isFull
            }
        })
    ]

    // Search/filter state for monitors and system units
    const [monitorSearch, setMonitorSearch] = useState("");
    const [systemUnitSearch, setSystemUnitSearch] = useState("");

    // Filtered lists
    const filteredMonitors = availableMonitors.filter(m => {
        const q = monitorSearch.toLowerCase();
        return (
            m.brand?.toLowerCase().includes(q) ||
            m.model?.toLowerCase().includes(q) ||
            m.serial_number?.toLowerCase().includes(q) ||
            String(m.size).includes(q)
        );
    });
    const filteredSystemUnits = availableSystemUnits.filter(su => {
        const q = systemUnitSearch.toLowerCase();
        return (
            su.brand?.toLowerCase().includes(q) ||
            su.model?.toLowerCase().includes(q) ||
            su.serial_number?.toLowerCase().includes(q)
        );
    });

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
                <div className="flex flex-col h-[80vh] w-full max-w-2xl bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
                        <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                            Add New Station
                        </h3>
                        {alert.show && (
                            <div className="mt-2">
                                <Alert
                                    type={alert.type}
                                    message={alert.message}
                                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                                />
                            </div>
                        )}
                    </div>
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto px-6 py-4 flex-1 min-h-0">
                        <form id="add-station-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* ...existing code for form fields... */}
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
                                <input
                                    type="text"
                                    className="mb-2 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Search monitors by brand, model, serial, size..."
                                    value={monitorSearch}
                                    onChange={e => setMonitorSearch(e.target.value)}
                                />
                                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {filteredMonitors.length > 0 ? (
                                        filteredMonitors.map(monitor => (
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
                            {/* System Unit Assignment Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign System Unit (Optional - One per station)
                                </label>
                                <input
                                    type="text"
                                    className="mb-2 w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                    placeholder="Search system units by brand, model, serial..."
                                    value={systemUnitSearch}
                                    onChange={e => setSystemUnitSearch(e.target.value)}
                                />
                                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {filteredSystemUnits.length > 0 ? (
                                        <>
                                            <div className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    id="system-unit-none"
                                                    name="system-unit-selection"
                                                    checked={formData.assigned_system_units.length === 0}
                                                    onChange={() => setFormData(prev => ({ ...prev, assigned_system_units: [] }))}
                                                    className="mr-2"
                                                />
                                                <label htmlFor="system-unit-none" className="text-sm text-gray-500">
                                                    No System Unit
                                                </label>
                                            </div>
                                            {filteredSystemUnits.map(systemUnit => (
                                                <div key={systemUnit.id} className="flex items-center mb-2">
                                                    <input
                                                        type="radio"
                                                        id={`system-unit-${systemUnit.id}`}
                                                        name="system-unit-selection"
                                                        checked={formData.assigned_system_units.includes(systemUnit.id)}
                                                        onChange={() => handleSystemUnitSelection(systemUnit.id)}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor={`system-unit-${systemUnit.id}`} className="text-sm">
                                                        {systemUnit.brand} {systemUnit.model} - {systemUnit.serial_number}
                                                    </label>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-500">No available system units</p>
                                    )}
                                </div>
                            </div>
                            {/* Peripheral Assignment Section */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assign Peripherals (Optional)
                                </label>
                                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {availablePeripherals.length > 0 ? (
                                        availablePeripherals.map(peripheral => (
                                            <div key={peripheral.id} className="flex items-center mb-2">
                                                <input
                                                    type="checkbox"
                                                    id={`peripheral-${peripheral.id}`}
                                                    checked={formData.assigned_peripherals.includes(peripheral.id)}
                                                    onChange={() => handlePeripheralSelection(peripheral.id)}
                                                    className="mr-2"
                                                />
                                                <label htmlFor={`peripheral-${peripheral.id}`} className="text-sm">
                                                    {peripheral.type} - {peripheral.brand} {peripheral.model} - {peripheral.serial_number}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No available peripherals</p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-lg flex justify-end gap-3">
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
                            form="add-station-form"
                        >
                            {loading ? 'Creating...' : 'Create Station'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
