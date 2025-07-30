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
    const [editPeripheralTypeFilter, setEditPeripheralTypeFilter] = useState("all")
    const [editPeripheralSearch, setEditPeripheralSearch] = useState("")
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
        setEditPeripheralTypeFilter("all")
        setEditPeripheralSearch("")
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
    
    // Get all available peripherals from the new structure
    const allAvailablePeripherals = (() => {
        try {
            console.log('Available peripherals structure:', availablePeripherals);
            
            if (!availablePeripherals) {
                console.log('availablePeripherals is null or undefined');
                return [];
            }
            
            if (Array.isArray(availablePeripherals)) {
                console.log('availablePeripherals is already an array, using as is');
                return availablePeripherals;
            }
            
            if (availablePeripherals.all && Array.isArray(availablePeripherals.all)) {
                console.log('Using availablePeripherals.all array');
                return availablePeripherals.all;
            }
            
            console.log('No valid peripheral array found, returning empty array');
            return [];
        } catch (error) {
            console.error('Error processing availablePeripherals:', error);
            return [];
        }
    })();
    
    console.log('Available peripherals from Redux:', availablePeripherals);
    console.log('All available peripherals:', allAvailablePeripherals);

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
                                                    disabled={monitor.status?.toUpperCase() === 'NOT_WORKING' || monitor.deployment_status === 'Out of Service'}
                                                />
                                                <div className="flex flex-col">
                                                    <label htmlFor={`monitor-${monitor.id}`} className={`text-sm ${monitor.status?.toUpperCase() === 'NOT_WORKING' || monitor.deployment_status === 'Out of Service' ? 'text-gray-500' : ''}`}>
                                                        {monitor.brand} {monitor.model} ({monitor.size}") - {monitor.serial_number}
                                                    </label>
                                                    <div className="flex items-center mt-1">
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full mr-2 ${
                                                            monitor.status?.toUpperCase() === 'NOT_WORKING' 
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'
                                                        }`}>
                                                            {monitor.status?.toUpperCase() || 'WORKING'}
                                                        </span>
                                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                            monitor.deployment_status === 'Out of Service' 
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {monitor.deployment_status || 'AVAILABLE'}
                                                        </span>
                                                    </div>
                                                </div>
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
                                                        disabled={systemUnit.status?.toUpperCase() === 'NOT_WORKING' || systemUnit.deployment_status === 'Out of Service'}
                                                    />
                                                    <div className="flex flex-col">
                                                        <label htmlFor={`system-unit-${systemUnit.id}`} className={`text-sm ${systemUnit.status?.toUpperCase() === 'NOT_WORKING' || systemUnit.deployment_status === 'Out of Service' ? 'text-gray-500' : ''}`}>
                                                            {systemUnit.brand} {systemUnit.model} - {systemUnit.serial_number}
                                                        </label>
                                                        <div className="flex items-center mt-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full mr-2 ${
                                                                systemUnit.status?.toUpperCase() === 'NOT_WORKING' 
                                                                    ? 'bg-red-100 text-red-800'
                                                                    : 'bg-green-100 text-green-800'
                                                            }`}>
                                                                {systemUnit.status?.toUpperCase() || 'WORKING'}
                                                            </span>
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                                                systemUnit.deployment_status === 'Out of Service' 
                                                                    ? 'bg-orange-100 text-orange-800'
                                                                    : 'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {systemUnit.deployment_status || 'AVAILABLE'}
                                                            </span>
                                                        </div>
                                                    </div>
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
                                
                                {/* Search and Filter Controls */}
                                <div className="flex mb-4 space-x-2">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Filter by Type
                                        </label>
                                        <select
                                            className="border border-gray-300 rounded-md px-3 py-1 w-full"
                                            value={editPeripheralTypeFilter}
                                            onChange={(e) => setEditPeripheralTypeFilter(e.target.value)}
                                        >
                                            <option value="all">All Types</option>
                                            {availablePeripherals && availablePeripherals.grouped && 
                                            Object.keys(availablePeripherals.grouped).map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Search
                                        </label>
                                        <input
                                            type="text"
                                            className="border border-gray-300 rounded-md px-3 py-1 w-full"
                                            placeholder="Search by brand, model, S/N..."
                                            value={editPeripheralSearch}
                                            onChange={(e) => setEditPeripheralSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Grouped View */}
                                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-2">
                                    {availablePeripherals && availablePeripherals.grouped && 
                                      Object.keys(availablePeripherals.grouped).length > 0 ? (
                                        Object.entries(availablePeripherals.grouped)
                                            .filter(([type]) => editPeripheralTypeFilter === 'all' || type === editPeripheralTypeFilter)
                                            .map(([type, brandModels]) => {
                                                let filteredBrandModels = {};
                                                
                                                try {
                                                    // Safety check for brandModels - ensure it's an object
                                                    if (!brandModels || typeof brandModels !== 'object') {
                                                        console.error('Invalid brandModels for type:', type, brandModels);
                                                        return null;
                                                    }

                                                    // Filter brand models based on search term
                                                    const q = editPeripheralSearch.toLowerCase();
                                                    filteredBrandModels = q 
                                                        ? Object.entries(brandModels).reduce((acc, [brandModel, group]) => {
                                                            // Check that the group has items
                                                            const items = group.items;
                                                            if (!Array.isArray(items)) {
                                                                console.log('Items is not an array for', brandModel, group);
                                                                
                                                                // Try to use the group directly if it's an array
                                                                if (Array.isArray(group)) {
                                                                    const filteredItems = group.filter(peripheral => 
                                                                        peripheral.brand?.toLowerCase().includes(q) ||
                                                                        peripheral.model?.toLowerCase().includes(q) ||
                                                                        peripheral.serial_number?.toLowerCase().includes(q) ||
                                                                        brandModel.toLowerCase().includes(q)
                                                                    );
                                                                    
                                                                    if (filteredItems.length > 0) {
                                                                        acc[brandModel] = filteredItems;
                                                                    }
                                                                }
                                                                return acc;
                                                            }
                                                            
                                                            const filteredItems = items.filter(peripheral => 
                                                                peripheral.brand?.toLowerCase().includes(q) ||
                                                                peripheral.model?.toLowerCase().includes(q) ||
                                                                peripheral.serial_number?.toLowerCase().includes(q) ||
                                                                brandModel.toLowerCase().includes(q)
                                                            );
                                                            
                                                            if (filteredItems.length > 0) {
                                                                acc[brandModel] = {
                                                                    ...group,
                                                                    items: filteredItems
                                                                };
                                                            }
                                                            return acc;
                                                        }, {})
                                                        : brandModels;
                                                    
                                                    // If no matching items after filtering, don't render this type
                                                    if (Object.keys(filteredBrandModels).length === 0) {
                                                        return null;
                                                    }
                                                } catch (error) {
                                                    console.error('Error processing peripherals for type:', type, error);
                                                    return null;
                                                }
                                                
                                                return (
                                                <div key={type} className="mb-4">
                                                    <h3 className="text-sm font-medium text-gray-700 mb-1">{type}</h3>
                                                    <div className="pl-4">
                                                        {Object.entries(filteredBrandModels).map(([brandModel, items]) => (
                                                            <div key={brandModel} className="mb-2">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-sm font-medium text-gray-600">
                                                                        {brandModel}
                                                                    </span>
                                                                    <span className="text-sm text-gray-500">
                                                                        Available: {
                                                                            items.available_stock !== undefined ? items.available_stock :
                                                                            items.items && Array.isArray(items.items) ? items.items.length :
                                                                            Array.isArray(items) ? items.length : 0
                                                                        } units
                                                                    </span>
                                                                </div>
                                                                
                                                                {/* Button to add one of this peripheral type */}
                                                                <div className="flex justify-end mt-1">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            // Get first available peripheral of this type
                                                                            const peripheral = items.items && items.items[0] ? 
                                                                                items.items[0] : (Array.isArray(items) && items[0] ? items[0] : null);
                                                                                
                                                                            if (peripheral) {
                                                                                handlePeripheralSelection(peripheral.id);
                                                                            }
                                                                        }}
                                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                                                                        disabled={
                                                                            (items.available_stock !== undefined && items.available_stock <= 0) ||
                                                                            (items.items && Array.isArray(items.items) && items.items.length <= 0) ||
                                                                            (Array.isArray(items) && items.length <= 0)
                                                                        }
                                                                    >
                                                                        Add
                                                                    </button>
                                                                </div>
                                                                
                                                                {/* Display all individual peripherals if needed 
                                                                {Array.isArray(items.items || items) && (items.items || items).length > 0 ? (items.items || items).map(peripheral => (
                                                                    <div key={peripheral.id} className="flex items-center ml-2 mt-1">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`peripheral-${peripheral.id}`}
                                                                            checked={formData.assigned_peripherals.includes(peripheral.id)}
                                                                            onChange={() => handlePeripheralSelection(peripheral.id)}
                                                                            className="mr-2"
                                                                        />
                                                                        <label htmlFor={`peripheral-${peripheral.id}`} className="text-sm">
                                                                            S/N: {peripheral.serial_number || 'N/A'}
                                                                        </label>
                                                                    </div>
                                                                )) : (
                                                                    <div className="text-xs text-gray-400 ml-2">No items available</div>
                                                                )}
                                                                */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )})
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
