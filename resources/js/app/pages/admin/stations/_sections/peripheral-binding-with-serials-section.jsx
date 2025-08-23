import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import { fetchAvailablePeripheralsWithSerials } from '@/app/redux/thunks/stationThunk'

export default function PeripheralBindingWithSerialsSection({ stationId, onClose, onSuccess }) {
    const dispatch = useDispatch()
    const { availablePeripheralsWithSerials } = useSelector(state => state.stations)
    
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [selectedPeripherals, setSelectedPeripherals] = useState([])
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    
    useEffect(() => {
        dispatch(fetchAvailablePeripheralsWithSerials())
    }, [dispatch])
    
    // Get unique peripheral types
    const peripheralTypes = availablePeripheralsWithSerials && Array.isArray(availablePeripheralsWithSerials)
        ? [...new Set(availablePeripheralsWithSerials.map(p => p.type))].sort()
        : []
    
    // Filter peripherals based on search term and selected type
    const filteredPeripherals = React.useMemo(() => {
        if (!availablePeripheralsWithSerials || !Array.isArray(availablePeripheralsWithSerials)) return []
        
        let filtered = availablePeripheralsWithSerials
        
        // Filter by type if not 'all'
        if (selectedType !== 'all') {
            filtered = filtered.filter(p => p.type === selectedType)
        }
        
        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                // Search through serial numbers
                (p.serial_numbers && p.serial_numbers.some(serial => 
                    serial.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
                ))
            )
        }
        
        return filtered
    }, [availablePeripheralsWithSerials, searchTerm, selectedType])
    
    const handlePeripheralSelection = (peripheralId, serialNumber = null) => {
        const selectionKey = serialNumber ? `${peripheralId}-${serialNumber}` : peripheralId.toString()
        
        setSelectedPeripherals(prev => 
            prev.find(item => item.key === selectionKey)
                ? prev.filter(item => item.key !== selectionKey)
                : [...prev, { key: selectionKey, peripheralId, serialNumber }]
        )
    }
    
    const isPeripheralSelected = (peripheralId, serialNumber = null) => {
        const selectionKey = serialNumber ? `${peripheralId}-${serialNumber}` : peripheralId.toString()
        return selectedPeripherals.some(item => item.key === selectionKey)
    }
    
    const bindPeripheralsToStation = async () => {
        if (selectedPeripherals.length === 0) {
            setAlert({
                show: true,
                type: 'warning',
                message: 'Please select at least one peripheral to bind.'
            })
            return
        }
        
        setLoading(true)
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            
            // Group peripherals by whether they have serial numbers or not
            const assignments = selectedPeripherals.map(item => ({
                peripheral_id: item.peripheralId,
                serial_number: item.serialNumber
            }))
            
            const response = await fetch(`/api/stations/${stationId}/assign-asset`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({
                    asset_type: 'peripheral',
                    assignments: assignments
                })
            })
            
            if (response.ok) {
                const result = await response.json()
                setAlert({
                    show: true,
                    type: 'success',
                    message: result.message || 'Peripherals successfully assigned to station.'
                })
                
                // Success callback
                onSuccess && onSuccess()
                
                // Refresh available peripherals
                dispatch(fetchAvailablePeripheralsWithSerials())
                
                // Clear selections
                setSelectedPeripherals([])
            } else {
                const errorData = await response.json()
                setAlert({
                    show: true,
                    type: 'error',
                    message: errorData.message || 'Failed to bind peripherals to station.'
                })
            }
        } catch (error) {
            console.error('Error binding peripherals:', error)
            setAlert({
                show: true,
                type: 'error',
                message: 'An error occurred while binding peripherals.'
            })
        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Bind Peripherals to Station</h2>
            
            {alert.show && (
                <div className={`p-3 mb-4 rounded ${
                    alert.type === 'error' ? 'bg-red-100 text-red-700' : 
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                }`}>
                    {alert.message}
                    <button
                        onClick={() => setAlert({ show: false, type: '', message: '' })}
                        className="float-right text-lg font-bold"
                    >
                        ×
                    </button>
                </div>
            )}
            
            <div className="mb-4 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Filter by Type
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="all">All Types</option>
                        {peripheralTypes.map(type => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Search
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by brand, model, or serial number"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            <div className="mb-4 max-h-96 overflow-y-auto border rounded-md">
                {filteredPeripherals.length > 0 ? (
                    filteredPeripherals.map((peripheral) => (
                        <div key={peripheral.id} className="border-b last:border-0">
                            <div className="p-3 bg-gray-50">
                                <h3 className="text-sm font-semibold text-gray-800">
                                    {peripheral.brand} {peripheral.model} ({peripheral.type})
                                </h3>
                                <p className="text-xs text-gray-600">
                                    Available Stock: {peripheral.available_stock} units
                                    {peripheral.uses_serial_numbers && " • Uses Serial Numbers"}
                                </p>
                            </div>
                            
                            {peripheral.uses_serial_numbers ? (
                                // Show serial number selection for peripherals that use them
                                <div className="p-3">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Select Serial Numbers:</p>
                                    <div className="space-y-2">
                                        {(() => {
                                            if (!peripheral.serial_numbers || peripheral.serial_numbers.length === 0) {
                                                return <p className="text-sm text-gray-500">No available serial numbers</p>;
                                            }
                                            
                                            // Filter serial numbers based on search term
                                            const filteredSerials = peripheral.serial_numbers.filter(serial => {
                                                if (!searchTerm) return true; // No search term, show all
                                                
                                                // Check if peripheral matched by brand/model/type (not serial)
                                                const peripheralMatchedByNonSerial = 
                                                    peripheral.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    peripheral.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                    peripheral.type?.toLowerCase().includes(searchTerm.toLowerCase());
                                                
                                                // If peripheral matched by brand/model/type, show all serials
                                                if (peripheralMatchedByNonSerial) return true;
                                                
                                                // Otherwise, only show serials that match the search term
                                                return serial.serial_number?.toLowerCase().includes(searchTerm.toLowerCase());
                                            });
                                            
                                            if (filteredSerials.length === 0) {
                                                return <p className="text-sm text-gray-500">No serial numbers match your search</p>;
                                            }
                                            
                                            return filteredSerials.map((serial) => (
                                                <div key={serial.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium">{serial.serial_number}</span>
                                                        <span className="text-xs text-gray-500">
                                                            Unit Price: ${serial.unit_price} • Status: {serial.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <Button
                                                        type="button"
                                                        variant={isPeripheralSelected(peripheral.id, serial.serial_number) ? "danger" : "primary"}
                                                        size="sm"
                                                        disabled={serial.status !== 'available'}
                                                        onClick={() => handlePeripheralSelection(peripheral.id, serial.serial_number)}
                                                    >
                                                        {isPeripheralSelected(peripheral.id, serial.serial_number) ? "Remove" : "Select"}
                                                    </Button>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                </div>
                            ) : (
                                // Show quantity selection for peripherals that don't use serial numbers
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Assign without serial tracking</span>
                                        <Button
                                            type="button"
                                            variant={isPeripheralSelected(peripheral.id) ? "danger" : "primary"}
                                            size="sm"
                                            disabled={peripheral.available_stock <= 0}
                                            onClick={() => handlePeripheralSelection(peripheral.id)}
                                        >
                                            {isPeripheralSelected(peripheral.id) ? "Remove" : "Select"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-sm text-gray-500">
                        No peripherals found matching your criteria
                    </p>
                )}
            </div>
            
            {selectedPeripherals.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Selected Peripherals:</h4>
                    <div className="space-y-1">
                        {selectedPeripherals.map((item) => {
                            const peripheral = filteredPeripherals.find(p => p.id === item.peripheralId)
                            return (
                                <div key={item.key} className="text-sm text-blue-700">
                                    {peripheral?.brand} {peripheral?.model}
                                    {item.serialNumber && ` (Serial: ${item.serialNumber})`}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
            
            <div className="flex justify-end space-x-3">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="button"
                    variant="primary"
                    disabled={selectedPeripherals.length === 0 || loading}
                    onClick={bindPeripheralsToStation}
                >
                    {loading ? "Binding..." : `Bind ${selectedPeripherals.length} Peripheral${selectedPeripherals.length !== 1 ? 's' : ''}`}
                </Button>
            </div>
        </div>
    )
}
