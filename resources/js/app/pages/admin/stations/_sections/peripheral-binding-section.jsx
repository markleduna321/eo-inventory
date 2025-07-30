import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import { fetchAvailablePeripherals } from '@/app/redux/thunks/stationThunk'

export default function PeripheralBindingSection({ stationId, onClose, onSuccess }) {
    const dispatch = useDispatch()
    const { availablePeripherals } = useSelector(state => state.stations)
    
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('all')
    const [selectedPeripherals, setSelectedPeripherals] = useState([])
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    
    useEffect(() => {
        dispatch(fetchAvailablePeripherals())
    }, [dispatch])
    
    // Group peripherals by type for the dropdown
    const peripheralTypes = availablePeripherals && availablePeripherals.grouped
        ? Object.keys(availablePeripherals.grouped).sort()
        : []
    
    // Filter peripherals based on search term and selected type
    const filteredPeripherals = React.useMemo(() => {
        if (!availablePeripherals || !availablePeripherals.grouped) return {}
        
        // If no type filter, return all types
        if (selectedType === 'all') {
            return Object.entries(availablePeripherals.grouped)
                .reduce((acc, [type, brandModels]) => {
                    // Filter brand models by search term
                    const filteredBrandModels = Object.entries(brandModels)
                        .filter(([brandModel, data]) => 
                            brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            data.type?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .reduce((acc2, [brandModel, data]) => {
                            acc2[brandModel] = data
                            return acc2
                        }, {})
                    
                    if (Object.keys(filteredBrandModels).length > 0) {
                        acc[type] = filteredBrandModels
                    }
                    
                    return acc
                }, {})
        } else {
            // Return only the selected type
            const typePeripherals = availablePeripherals.grouped[selectedType] || {}
            
            return {
                [selectedType]: Object.entries(typePeripherals)
                    .filter(([brandModel, data]) => 
                        brandModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        data.type?.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .reduce((acc, [brandModel, data]) => {
                        acc[brandModel] = data
                        return acc
                    }, {})
            }
        }
    }, [availablePeripherals, searchTerm, selectedType])
    
    const handlePeripheralSelection = (peripheralId) => {
        setSelectedPeripherals(prev => 
            prev.includes(peripheralId)
                ? prev.filter(id => id !== peripheralId)
                : [...prev, peripheralId]
        )
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
            
            const response = await fetch(`/api/stations/${stationId}/assign-peripherals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || ''
                },
                body: JSON.stringify({
                    peripheral_ids: selectedPeripherals
                })
            })
            
            if (response.ok) {
                // Success
                onSuccess && onSuccess()
                
                // Refresh available peripherals
                dispatch(fetchAvailablePeripherals())
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
                <div className={`p-3 mb-4 rounded ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {alert.message}
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
                        placeholder="Search by brand or model"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
            
            <div className="mb-4 max-h-96 overflow-y-auto border rounded-md">
                {Object.entries(filteredPeripherals).map(([type, brandModels]) => (
                    <div key={type} className="mb-3">
                        <h3 className="bg-gray-100 px-3 py-2 text-sm font-semibold">
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </h3>
                        <div className="px-3">
                            {Object.entries(brandModels).map(([brandModel, data]) => (
                                <div key={brandModel} className="py-2 border-b last:border-0 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{brandModel}</span>
                                        <span className="text-xs text-gray-500">
                                            Available: {data.available_stock} units
                                        </span>
                                    </div>
                                    
                                    <Button
                                        type="button"
                                        variant={selectedPeripherals.includes(data.id) ? "danger" : "primary"}
                                        size="sm"
                                        disabled={data.available_stock <= 0 && !selectedPeripherals.includes(data.id)}
                                        onClick={() => handlePeripheralSelection(data.id)}
                                    >
                                        {selectedPeripherals.includes(data.id) ? "Remove" : "Select"}
                                    </Button>
                                </div>
                            ))}
                            
                            {Object.keys(brandModels).length === 0 && (
                                <p className="py-2 text-sm text-gray-500">
                                    No {type} peripherals available
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                
                {Object.keys(filteredPeripherals).length === 0 && (
                    <p className="p-4 text-center text-sm text-gray-500">
                        No peripherals found matching your criteria
                    </p>
                )}
            </div>
            
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
                    {loading ? "Binding..." : "Bind Selected Peripherals"}
                </Button>
            </div>
        </div>
    )
}
