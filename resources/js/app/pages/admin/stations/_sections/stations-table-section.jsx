import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import TableFilter from '@/app/pages/components/table-filter'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import UnbindAssetModal from '@/app/components/UnbindAssetModal'
import PeripheralBindingWithSerialsSection from './peripheral-binding-with-serials-section'
import { ArrowDownCircleIcon, PrinterIcon, PencilIcon, TrashIcon, ComputerDesktopIcon, QrCodeIcon } from '@heroicons/react/24/outline'
import { fetchStations, updateStation, deleteStation, fetchAvailableMonitors, fetchAvailableSystemUnits, fetchAvailablePeripherals, fetchStationLocations } from '@/app/redux/thunks/stationThunk'
import { setCurrentStation, clearCurrentStation } from '@/app/redux/slices/stationSlice'
import StationHistory from '@/app/components/stations/station-history'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import { useLocationRefresh } from '@/app/hooks/useLocationRefresh'

export default function StationsTableSection() {
    const dispatch = useDispatch()
    const { stations, availableMonitors, availableSystemUnits, availablePeripherals, locations, loading, error } = useSelector(state => state.stations)
    const { refreshLocations } = useLocationRefresh()
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({})
    const [editErrors, setEditErrors] = useState({})
    const [activeTab, setActiveTab] = useState('details')
    const [editLoading, setEditLoading] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10 // Number of items to display per page
    
    // Unbind modal state
    const [isUnbindModalOpen, setIsUnbindModalOpen] = useState(false)
    const [unbindAsset, setUnbindAsset] = useState({ type: '', id: null, name: '', serialNumber: null })
    
    // QR code modal state
    const [isQrModalOpen, setIsQrModalOpen] = useState(false)
    const [selectedStation, setSelectedStation] = useState(null)
    
    // Peripheral binding with serials modal state
    const [isPeripheralBindingModalOpen, setIsPeripheralBindingModalOpen] = useState(false)
    const [peripheralBindingStationId, setPeripheralBindingStationId] = useState(null)
    
    // Search state for the edit form
    const [editMonitorSearch, setEditMonitorSearch] = useState("")
    const [editSystemUnitSearch, setEditSystemUnitSearch] = useState("")
    const [editPeripheralSearch, setEditPeripheralSearch] = useState("")
    const [editPeripheralTypeFilter, setEditPeripheralTypeFilter] = useState("all")

    // Filter configuration
    const searchableFields = ['name', 'code', 'type', 'department', 'assigned_user', 'ip_address', 'location_name']
    const filterOptions = {
        type: [
            { label: 'Employee', value: 'employee' },
            { label: 'Manager', value: 'manager' },
            { label: 'Executive', value: 'executive' },
            { label: 'Hot Desk', value: 'hotdesk' },
            { label: 'Meeting', value: 'meeting' },
            { label: 'Reception', value: 'reception' },
            { label: 'Technical', value: 'technical' }
        ],
        status: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Maintenance', value: 'maintenance' }
        ],
        department: [
            { label: 'IT Department', value: 'IT Department' },
            { label: 'Human Resources', value: 'Human Resources' },
            { label: 'Finance', value: 'Finance' },
            { label: 'Marketing', value: 'Marketing' },
            { label: 'Operations', value: 'Operations' },
            { label: 'Administration', value: 'Administration' },
            { label: 'Executive', value: 'Executive' },
            { label: 'Shared', value: 'Shared' }
        ]
    }

    // Use the filtering hook with date field for 'created_at'
    const {
        searchTerm,
        filters,
        filteredData,
        filterStats,
        handleSearchChange,
        handleFilterChange,
        clearFilters
    } = useTableFilters(stations, searchableFields, filterOptions, 'created_at')
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedStations = filteredData.slice(startIndex, endIndex)
    
    // Pagination handler
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }
    
    // QR code modal handlers
    const handleShowQrCode = (station) => {
        setSelectedStation(station)
        setIsQrModalOpen(true)
    }
    
    const handleCloseQrModal = () => {
        setIsQrModalOpen(false)
        setSelectedStation(null)
    }

    // Peripheral binding modal handlers
    const handleOpenPeripheralBindingModal = (stationId) => {
        setPeripheralBindingStationId(stationId)
        setIsPeripheralBindingModalOpen(true)
    }

    const handleClosePeripheralBindingModal = () => {
        setIsPeripheralBindingModalOpen(false)
        setPeripheralBindingStationId(null)
    }

    const handlePeripheralBindingSuccess = () => {
        // Close modal first
        handleClosePeripheralBindingModal()
        
        // Show success alert if needed
        setAlert({
            show: true,
            type: 'success',
            message: 'Peripherals assigned successfully!'
        })
        
        // Auto-hide alert after 3 seconds
        setTimeout(() => {
            setAlert({ show: false, type: '', message: '' })
        }, 3000)

        // Delay the station refresh to avoid race conditions
        setTimeout(() => {
            dispatch(fetchStations())
        }, 1500)
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
        { label: 'Select Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' }
    ]

    useEffect(() => {
        dispatch(fetchStations())
    }, [dispatch])

    const handleEdit = async (station) => {
        console.log('Editing station:', station)
        console.log('Station assets:', station.station_assets)
        
        const assignedMonitors = station.station_assets
            ? station.station_assets.filter(asset => asset.asset_type === 'monitor' && asset.unassigned_at === null).map(asset => asset.asset_id)
            : []
        const assignedSystemUnits = station.station_assets
            ? station.station_assets.filter(asset => asset.asset_type === 'system_unit' && asset.unassigned_at === null).map(asset => asset.asset_id)
            : []
        const assignedPeripherals = station.station_assets
            ? station.station_assets.filter(asset => asset.asset_type === 'peripheral' && asset.unassigned_at === null).map(asset => asset.asset_id)
            : []
            
        console.log('Assigned monitors:', assignedMonitors)
        console.log('Assigned system units:', assignedSystemUnits)
        console.log('Assigned peripherals:', assignedPeripherals)
        
        setEditFormData({
            ...station,
            assigned_monitors: assignedMonitors || [],
            assigned_system_units: assignedSystemUnits || [],
            assigned_peripherals: assignedPeripherals || []
        })
        setIsEditModalOpen(true)
        setEditErrors({})
        
        // Fetch fresh data for editing including available assets
        await dispatch(fetchAvailableMonitors())
        await dispatch(fetchAvailableSystemUnits())
        await dispatch(fetchAvailablePeripherals())
        await dispatch(fetchStationLocations())
        
        // Also fetch the full station details with relationships
        try {
            const response = await axios.get(`/api/stations/${station.id}`)
            const fullStation = response.data
            console.log('Full station with relationships:', fullStation)
            
            // Update form data with full relationships
            setEditFormData(prev => ({
                ...prev,
                monitors: fullStation.monitors || [],
                system_units: fullStation.system_units || [],
                peripherals: fullStation.peripherals || []
            }))
        } catch (error) {
            console.error('Error fetching full station details:', error)
        }
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setEditFormData({})
        setEditErrors({})
        setEditLoading(false)
        setEditMonitorSearch("")
        setEditSystemUnitSearch("")
        setEditPeripheralSearch("")
        dispatch(clearCurrentStation())
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        console.log('Form submitted', editFormData)
        setEditLoading(true)
        setEditErrors({})
        
        // Clean up the edit form data before submission
        const cleanedFormData = {...editFormData};
        
        // Ensure arrays are not empty which causes validation issues
        if (cleanedFormData.assigned_monitors && cleanedFormData.assigned_monitors.length === 0) {
            delete cleanedFormData.assigned_monitors;
        }
        
        if (cleanedFormData.assigned_system_units && cleanedFormData.assigned_system_units.length === 0) {
            delete cleanedFormData.assigned_system_units;
        }
        
        if (cleanedFormData.assigned_peripherals && cleanedFormData.assigned_peripherals.length === 0) {
            delete cleanedFormData.assigned_peripherals;
        }

        try {
            await dispatch(updateStation({ 
                id: editFormData.id, 
                data: cleanedFormData 
            })).unwrap()

            setAlert({
                show: true,
                type: 'success',
                message: 'Station updated successfully!'
            })

            // Refresh stations and available assets to update UI
            await dispatch(fetchStations())
            await dispatch(fetchAvailableMonitors())
            await dispatch(fetchAvailableSystemUnits())
            await dispatch(fetchAvailablePeripherals())
            dispatch(fetchStationLocations())
            refreshLocations()
            handleCloseEdit()
        } catch (error) {
            console.error('Update error:', error)
            
            // Check for validation errors
            if (error.response && error.response.data && error.response.data.errors) {
                setEditErrors(error.response.data.errors);
                const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
                setAlert({
                    show: true,
                    type: 'error',
                    message: `Validation error: ${errorMessages}`
                });
            } else if (error.response && error.response.data && error.response.data.message) {
                // API returned an error message
                setEditErrors({ general: error.response.data.message });
                setAlert({
                    show: true,
                    type: 'error',
                    message: error.response.data.message
                });
            } else {
                // Generic error
                setEditErrors({ general: error.message || 'An error occurred during update' });
                setAlert({
                    show: true,
                    type: 'error',
                    message: error.message || 'An error occurred during update'
                });
            }
        } finally {
            setEditLoading(false)
        }
    }

    const handleDeleteConfirm = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        try {
            await dispatch(deleteStation(deleteId)).unwrap()
            setAlert({
                show: true,
                type: 'success',
                message: 'Station deleted successfully!'
            })
            // Refresh locations to update capacity counts
            dispatch(fetchStationLocations())
            refreshLocations()
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: error
            })
        } finally {
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        }
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({ ...prev, [name]: value }))
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleMonitorSelection = (monitor) => {
        console.log('Monitor selection called with:', monitor);
        console.log('Current editFormData.assigned_monitors:', editFormData.assigned_monitors);
        
        // Handle both cases: when monitor is an object or just an ID
        let monitorId;
        
        if (typeof monitor === 'object' && monitor !== null) {
            monitorId = parseInt(monitor.id, 10);
        } else {
            // If monitor is directly the ID
            monitorId = parseInt(monitor, 10);
        }
        
        const assignedMonitors = Array.isArray(editFormData.assigned_monitors) ? editFormData.assigned_monitors : [];
        
        // Check if this monitor is already assigned to the station
        const isAlreadyAssigned = assignedMonitors.includes(monitorId);
        
        console.log('Is monitor already assigned?', isAlreadyAssigned);
        
        // If already assigned, show unbind modal
        if (isAlreadyAssigned) {
            // Find the monitor details if we only have the ID
            let monitorName = '';
            
            if (typeof monitor === 'object' && monitor !== null) {
                monitorName = monitor.name || `Monitor #${monitorId}`;
            } else {
                // Look up the monitor in available monitors
                const foundMonitor = availableMonitors.find(m => parseInt(m.id, 10) === monitorId);
                monitorName = foundMonitor ? foundMonitor.name : `Monitor #${monitorId}`;
            }
            
            setUnbindAsset({
                type: 'monitor',
                id: monitorId,
                name: monitorName
            });
            setIsUnbindModalOpen(true);
        } 
        // If not assigned, add it (bind)
        else {
            setEditFormData(prev => ({
                ...prev,
                assigned_monitors: [...(prev.assigned_monitors || []), monitorId]
            }));
        }
    }

    const handleSystemUnitSelection = (systemUnit) => {
        console.log('System unit selection called with:', systemUnit);
        console.log('Current editFormData.assigned_system_units:', editFormData.assigned_system_units);
        console.log('Current editFormData.system_units:', editFormData.system_units);
        
        // Handle both cases: when systemUnit is an object or just an ID
        let systemUnitId;
        
        if (typeof systemUnit === 'object' && systemUnit !== null) {
            systemUnitId = parseInt(systemUnit.id, 10);
        } else {
            // If systemUnit is directly the ID
            systemUnitId = parseInt(systemUnit, 10);
        }
        
        // Check if this system unit is already assigned to the station
        // We're looking only at the assigned_system_units array for the current form state
        // The system_units array is the full relationship data and shouldn't be used for checking assignment status
        const isAlreadyAssigned = 
            Array.isArray(editFormData.assigned_system_units) && 
            editFormData.assigned_system_units.includes(systemUnitId);
        
        console.log('Is system unit already assigned?', isAlreadyAssigned);
        
        // If already selected, show unbind modal
        if (isAlreadyAssigned) {
            console.log('Setting unbind asset for system unit:', systemUnit);
            
            // Find the system unit details if we only have the ID
            let systemUnitName = '';
            
            if (typeof systemUnit === 'object' && systemUnit !== null) {
                systemUnitName = systemUnit.name || systemUnit.system_name || `System Unit #${systemUnitId}`;
            } else {
                // Look up the system unit in available system units
                const foundSystemUnit = availableSystemUnits.find(su => parseInt(su.id, 10) === systemUnitId);
                systemUnitName = foundSystemUnit ? (foundSystemUnit.system_name || foundSystemUnit.name) : `System Unit #${systemUnitId}`;
            }
            
            setUnbindAsset({
                type: 'system_unit', // This must match the controller's expected values
                id: systemUnitId,
                name: systemUnitName
            });
            setIsUnbindModalOpen(true);
        } 
        // If not selected, select only this one (bind)
        else {
            setEditFormData(prev => ({
                ...prev,
                assigned_system_units: [systemUnitId]
            }));
        }
    }

    const handlePeripheralSelection = (peripheral) => {
        console.log('Peripheral selection called with:', peripheral);
        console.log('Current editFormData.assigned_peripherals:', editFormData.assigned_peripherals);
        
        // Handle both cases: when peripheral is an object or just an ID
        let peripheralId;
        
        if (typeof peripheral === 'object' && peripheral !== null) {
            peripheralId = parseInt(peripheral.id, 10);
        } else {
            // If peripheral is directly the ID
            peripheralId = parseInt(peripheral, 10);
        }
        
        const assignedPeripherals = Array.isArray(editFormData.assigned_peripherals) ? editFormData.assigned_peripherals : [];
        
        // Check if this peripheral is already assigned to the station
        const isAlreadyAssigned = assignedPeripherals.includes(peripheralId);
        
        console.log('Is peripheral already assigned?', isAlreadyAssigned);
        
        // If already assigned, show unbind modal
        if (isAlreadyAssigned) {
            // Find the peripheral details if we only have the ID
            let peripheralName = '';
            
            if (typeof peripheral === 'object' && peripheral !== null) {
                peripheralName = peripheral.name || `${peripheral.type || 'Peripheral'} #${peripheralId}`;
            } else {
                // Look up the peripheral in available peripherals
                const foundPeripheral = availablePeripherals.find(p => parseInt(p.id, 10) === peripheralId);
                peripheralName = foundPeripheral ? foundPeripheral.name : `Peripheral #${peripheralId}`;
            }
            
            setUnbindAsset({
                type: 'peripheral',
                id: peripheralId,
                name: peripheralName
            });
            setIsUnbindModalOpen(true);
        } 
        // If not assigned, add it (bind)
        else {
            setEditFormData(prev => ({
                ...prev,
                assigned_peripherals: [...(prev.assigned_peripherals || []), peripheralId]
            }));
        }
    }

    const handleUnbindConfirm = async (assetType, assetId, reason, notes) => {
        try {
            // Debug information
            console.log('Starting unbind with these parameters:');
            console.log('Asset type:', assetType);
            console.log('Asset ID:', assetId);
            console.log('Reason:', reason);
            console.log('Notes:', notes);
            console.log('Station ID:', editFormData.id);
            console.log('Serial Number:', unbindAsset.serialNumber);
            
            // We should use the provided assetId directly, as it comes from the unbindAsset object
            // that we set when opening the modal
            let actualAssetId = parseInt(assetId, 10);
            
            console.log(`Using asset ID for ${assetType}: ${actualAssetId}`);
            
            // The backend controller expects EXACTLY these values in the validation rule:
            // 'asset_type' => 'required|in:monitor,system_unit,peripheral',
            // Ensure we're using the exact string values expected by the backend
            // DO NOT modify the assetType value - it must be one of the three exact strings
            
            console.log(`Sending API request with asset_type: ${assetType}`);
            
            const requestData = {
                asset_type: assetType, // Use the exact string as provided - must be monitor, system_unit, or peripheral
                asset_id: actualAssetId, // Now always using the parsed integer ID
                serial_number: unbindAsset.serialNumber, // Include serial number for proper unbinding
                unbind_reason: reason,
                notes: notes
            };
            
            console.log('Request payload:', requestData);
            
            const response = await axios.post(`/api/stations/${editFormData.id}/unassign-asset`, requestData);
            
            // Update local state after successful API call
            if (assetType === 'monitor') {
                setEditFormData(prev => ({
                    ...prev,
                    assigned_monitors: prev.assigned_monitors.filter(id => id !== assetId)
                }));
            } else if (assetType === 'system_unit') {
                setEditFormData(prev => ({
                    ...prev,
                    assigned_system_units: []
                }));
            } else if (assetType === 'peripheral') {
                setEditFormData(prev => ({
                    ...prev,
                    assigned_peripherals: prev.assigned_peripherals.filter(id => id !== assetId)
                }));
            }
            
            // Close the modal
            setIsUnbindModalOpen(false);
            
            // Show success message
            setAlert({
                show: true,
                type: 'success',
                message: `Successfully unbound ${assetType.replace('_', ' ')} with reason: ${reason}`
            });
            
            // Hide alert after 3 seconds
            setTimeout(() => {
                setAlert({ show: false, type: '', message: '' });
            }, 3000);
            
        } catch (error) {
            console.error('Error unbinding asset:', error);
            
            // Log detailed error information
            if (error.response) {
                console.log('Error response status:', error.response.status);
                console.log('Error response data:', error.response.data);
                
                if (error.response.data && error.response.data.errors) {
                    console.log('Validation errors:', error.response.data.errors);
                }
                
                // Print the full error object for debugging
                console.log('Full error object:', JSON.stringify(error.response, null, 2));
            }
            
            // Show a more specific error message if available
            let errorMessage = 'There was an error unbinding the asset.';
            
            if (error.response && error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
            } else if (error.response && error.response.data && error.response.data.errors) {
                // Get all validation errors and join them
                const validationErrors = Object.values(error.response.data.errors).flat().join(', ');
                errorMessage = `Validation error: ${validationErrors}`;
            } else if (error.response && error.response.status === 400) {
                errorMessage = 'Invalid request (400). Make sure the asset exists and can be unbound.';
                
                // Add more specific debugging for asset type issues
                console.log('Asset type check:', assetType);
                if (assetType !== 'monitor' && assetType !== 'system_unit' && assetType !== 'peripheral') {
                    errorMessage += ` Invalid asset type: "${assetType}" - must be one of: monitor, system_unit, peripheral`;
                }
                
                // Add specific message for system unit issues
                if (assetType === 'system_unit') {
                    console.log('System unit data check:');
                    console.log('- assetId:', assetId);
                    console.log('- actualAssetId:', actualAssetId);
                    console.log('- system_units:', editFormData.system_units);
                    
                    if (!actualAssetId || actualAssetId === 0) {
                        errorMessage += ' No valid system unit ID found.';
                    }
                }
            }
            
            setAlert({
                show: true,
                type: 'error',
                message: errorMessage
            });
        }
    };
    
    const getStatusBadge = (status) => {
        const statusClasses = {
            'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            'maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }
        
        return (
            <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    const getTypeBadge = (type) => {
        const typeClasses = {
            'employee': 'bg-blue-100 text-blue-800',
            'manager': 'bg-purple-100 text-purple-800',
            'executive': 'bg-indigo-100 text-indigo-800',
            'hotdesk': 'bg-orange-100 text-orange-800',
            'meeting': 'bg-green-100 text-green-800',
            'reception': 'bg-pink-100 text-pink-800',
            'technical': 'bg-gray-100 text-gray-800'
        }
        
        return (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
                {type}
            </span>
        )
    }

    const locationOptions = [
        { label: 'Select Location', value: '' },
        ...locations.map(location => ({
            label: `${location.name} - ${location.building}, ${location.floor}`,
            value: location.id
        }))
    ]

    // Get all available monitors (including currently assigned ones for editing)
    const allAvailableMonitors = [
        ...availableMonitors,
        ...((editFormData.monitors || []).filter(m => m && m.id)),
        ...((editFormData.station_assets || [])
            .filter(asset => asset && asset.asset_type === 'monitor' && asset.monitor)
            .map(asset => asset.monitor)
            .filter(Boolean))
    ].filter((monitor, index, self) => 
        // Remove duplicates by ID
        monitor && monitor.id && index === self.findIndex(m => m.id === monitor.id)
    )

    // Get all available system units (including currently assigned ones for editing)  
    const allAvailableSystemUnits = [
        ...availableSystemUnits,
        ...((editFormData.system_units || []).filter(su => su && su.id)),
        ...((editFormData.station_assets || [])
            .filter(asset => asset && asset.asset_type === 'system_unit' && asset.system_unit)
            .map(asset => asset.system_unit)
            .filter(Boolean))
    ].filter((systemUnit, index, self) => 
        // Remove duplicates by ID
        systemUnit && systemUnit.id && index === self.findIndex(su => su.id === systemUnit.id)
    )

    // Get all available peripherals (including currently assigned ones for editing)  
    const allAvailablePeripherals = [
        ...(availablePeripherals && availablePeripherals.all ? availablePeripherals.all : []),
        ...(editFormData.peripherals || []),
        ...((editFormData.station_assets || [])
            .filter(asset => asset && asset.asset_type === 'peripheral' && asset.peripheral)
            .map(asset => asset.peripheral)
            .filter(Boolean))
    ].filter((peripheral, index, self) => 
        // Remove duplicates by ID
        peripheral && peripheral.id && index === self.findIndex(p => p.id === peripheral.id)
    )

    console.log('Available peripherals from Redux:', availablePeripherals)
    console.log('Edit form peripherals:', editFormData.peripherals)
    console.log('All available peripherals:', allAvailablePeripherals)

    // Get assigned monitor details by finding them in the Redux store or from all stations
    const getAssignedMonitorDetails = (monitorIds) => {
        return monitorIds.map(id => {
            // First try to find in availableMonitors
            let monitor = availableMonitors.find(m => m.id === id);
            if (!monitor) {
                // Then try to find in all stations' monitors
                for (const station of stations) {
                    if (station.monitors) {
                        monitor = station.monitors.find(m => m.id === id);
                        if (monitor) break;
                    }
                }
            }
            // If still not found, try allAvailableMonitors
            if (!monitor) {
                monitor = allAvailableMonitors.find(m => m.id === id);
            }
            return monitor;
        }).filter(Boolean);
    };

    // Get assigned system unit details
    const getAssignedSystemUnitDetails = (systemUnitIds) => {
        return systemUnitIds.map(id => {
            // First try to find in availableSystemUnits
            let systemUnit = availableSystemUnits.find(su => su.id === id);
            if (!systemUnit) {
                // Then try to find in all stations' system units
                for (const station of stations) {
                    if (station.system_units) {
                        systemUnit = station.system_units.find(su => su.id === id);
                        if (systemUnit) break;
                    }
                }
            }
            // If still not found, try allAvailableSystemUnits
            if (!systemUnit) {
                systemUnit = allAvailableSystemUnits.find(su => su.id === id);
            }
            return systemUnit;
        }).filter(Boolean);
    };

    // Get assigned peripheral details
    const getAssignedPeripheralDetails = (peripheralIds) => {
        return peripheralIds.map(id => {
            // First try to find in availablePeripherals.all array
            let peripheral = availablePeripherals && availablePeripherals.all ? 
                availablePeripherals.all.find(p => p.id === id) : null;
                
            if (!peripheral) {
                // Then try to find in all stations' peripherals
                for (const station of stations) {
                    if (station.peripherals) {
                        peripheral = station.peripherals.find(p => p.id === id);
                        if (peripheral) break;
                    }
                }
            }
            // If still not found, try allAvailablePeripherals
            if (!peripheral && Array.isArray(allAvailablePeripherals)) {
                peripheral = allAvailablePeripherals.find(p => p.id === id);
            }
            return peripheral;
        }).filter(Boolean);
    };

    // Get current assigned asset details
    const assignedMonitorDetails = getAssignedMonitorDetails(editFormData.assigned_monitors || []);
    const assignedSystemUnitDetails = getAssignedSystemUnitDetails(editFormData.assigned_system_units || []);
    const assignedPeripheralDetails = getAssignedPeripheralDetails(editFormData.assigned_peripherals || []);

    // Filter monitors, system units and peripherals based on search
    const filteredEditMonitors = allAvailableMonitors
        .filter(monitor => !(editFormData.assigned_monitors || []).includes(monitor.id))
        .filter(monitor => {
            const q = editMonitorSearch.toLowerCase();
            return !q || 
                monitor.brand?.toLowerCase().includes(q) ||
                monitor.model?.toLowerCase().includes(q) ||
                monitor.serial_number?.toLowerCase().includes(q) ||
                String(monitor.size).includes(q);
        });
        
    const filteredEditSystemUnits = allAvailableSystemUnits
        .filter(systemUnit => !(editFormData.assigned_system_units || []).includes(systemUnit.id))
        .filter(systemUnit => {
            const q = editSystemUnitSearch.toLowerCase();
            return !q ||
                systemUnit.brand?.toLowerCase().includes(q) ||
                systemUnit.model?.toLowerCase().includes(q) ||
                systemUnit.serial_number?.toLowerCase().includes(q);
        });
        
    const filteredEditPeripherals = Array.isArray(allAvailablePeripherals) ? 
        allAvailablePeripherals
            .filter(peripheral => !(editFormData.assigned_peripherals || []).includes(peripheral.id))
            .filter(peripheral => {
                const q = editPeripheralSearch.toLowerCase();
                return !q ||
                    peripheral.type?.toLowerCase().includes(q) ||
                    peripheral.brand?.toLowerCase().includes(q) ||
                    peripheral.model?.toLowerCase().includes(q) ||
                    peripheral.serial_number?.toLowerCase().includes(q);
            })
        : [];

    console.log('Assigned monitor details:', assignedMonitorDetails);
    console.log('Assigned system unit details:', assignedSystemUnitDetails);
    console.log('Assigned peripheral details:', assignedPeripheralDetails);

    if (loading) {
        return (
            <div className="mt-8 flow-root bg-white p-5 rounded-lg">
                <div className="text-center py-8">
                    <div className="text-gray-500">Loading stations...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 space-y-4">
            {/* Filter Component */}
            <TableFilter
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                filterOptions={filterOptions}
                placeholder="Search stations by name, code, type, department, user, IP address..."
                showDateRange={true}
                dateRangeLabel="Created Date"
            />

            {/* Results Summary */}
            {filterStats.isFiltered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        Showing {filterStats.filtered} of {filterStats.total} stations
                        {searchTerm && ` matching "${searchTerm}"`}
                    </p>
                </div>
            )}

            <div className="flow-root bg-white p-5 rounded-lg shadow-sm">
                {alert.show && (
                    <Alert 
                        type={alert.type} 
                        message={alert.message} 
                        onClose={() => setAlert({ show: false, type: '', message: '' })}
                    />
                )}

                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <div className="flex float-end mb-4 gap-2">
                            <Button variant="secondary" size="sm">
                                <ArrowDownCircleIcon className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="secondary" size="sm">
                                <PrinterIcon className="w-4 h-4 mr-2" />
                                Print
                            </Button>
                        </div>
                        
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Station Details
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Type
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Department
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Location
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Assigned User
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        IP Address
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Assets
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Status
                                    </th>
                                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {filteredData.length > 0 ? (
                                    paginatedStations.map((station) => (
                                        <tr key={station.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{station.name}</div>
                                                        <div className="text-gray-500">{station.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getTypeBadge(station.type)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {station.department}
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="text-gray-900">{station.location_name}</div>
                                                {station.location && (
                                                    <div className="text-gray-500">{station.location.building}, {station.location.floor}</div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {station.assigned_user || 'Unassigned'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {station.ip_address || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <ComputerDesktopIcon className="w-4 h-4 mr-1" />
                                                    <span>{
                                                        Array.isArray(station.station_assets)
                                                            ? station.station_assets.filter(a => a.asset_type === 'monitor' && a.unassigned_at === null).length
                                                            : (station.monitors_count || 0)
                                                    } monitors</span>
                                                </div>
                                                <div className="flex items-center text-xs text-gray-400">
                                                    <span>{
                                                        Array.isArray(station.station_assets)
                                                            ? station.station_assets.filter(a => a.asset_type === 'system_unit' && a.unassigned_at === null).length
                                                            : (station.system_units_count || 0)
                                                    } system units</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {
                                                        Array.isArray(station.station_assets)
                                                            ? station.station_assets.filter(a => a.unassigned_at === null).length
                                                            : (station.assets_count || 0)
                                                    } total assets
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getStatusBadge(station.status)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleShowQrCode(station)}
                                                        title="View QR Code"
                                                    >
                                                        <QrCodeIcon className="w-4 h-4" />
                                                    </Button>

                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleEdit(station)}
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteConfirm(station.id)}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {searchTerm || Object.values(filters).some(v => v) ? 
                                                'No stations found matching your criteria.' : 
                                                'No stations available.'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {filteredData.length > itemsPerPage && (
                            <div className="bg-white px-4 py-4 border-t border-gray-200 sm:px-6">
                                {/* Mobile Pagination */}
                                <div className="flex-1 flex justify-between items-center sm:hidden">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === 1
                                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                        Previous
                                    </button>
                                    
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-700 font-medium">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </div>
                                    
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                            currentPage === totalPages
                                                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100'
                                        }`}
                                    >
                                        Next
                                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                                
                                {/* Desktop Pagination */}
                                <div className="hidden sm:flex sm:items-center sm:justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                            <span>Showing</span>
                                            <span className="font-semibold text-indigo-600">{startIndex + 1}</span>
                                            <span>to</span>
                                            <span className="font-semibold text-indigo-600">{Math.min(endIndex, filteredData.length)}</span>
                                            <span>of</span>
                                            <span className="font-semibold text-indigo-600">{filteredData.length}</span>
                                            <span>results</span>
                                        </div>
                                    </div>
                                    
                                    <nav className="flex items-center space-x-1" aria-label="Pagination">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                currentPage === 1
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                            }`}
                                        >
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Previous
                                        </button>
                                        
                                        {/* Page Numbers */}
                                        <div className="flex items-center space-x-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                const isCurrentPage = currentPage === page
                                                const isNearCurrentPage = Math.abs(page - currentPage) <= 2
                                                const isFirstOrLast = page === 1 || page === totalPages
                                                
                                                // Show ellipsis logic
                                                if (!isNearCurrentPage && !isFirstOrLast) {
                                                    if (page === currentPage - 3 || page === currentPage + 3) {
                                                        return (
                                                            <span key={page} className="px-2 py-1 text-gray-500">
                                                                ...
                                                            </span>
                                                        )
                                                    }
                                                    return null
                                                }
                                                
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${
                                                            isCurrentPage
                                                                ? 'z-10 bg-indigo-600 text-white shadow-lg border border-indigo-600'
                                                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                        
                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                                                currentPage === totalPages
                                                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700'
                                            }`}
                                        >
                                            Next
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
            >
                <div className="flex flex-col h-[85vh] w-full max-w-4xl bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900" id="modal-title">
                                Edit Station
                            </h3>
                            <button
                                onClick={handleCloseEdit}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Tabs */}
                        <div className="border-b border-gray-200 mt-4">
                            <nav className="-mb-px flex space-x-8">
                                <button
                                    type="button"
                                    className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${!activeTab || activeTab === 'details' ? 'border-indigo-500 text-indigo-600' : ''}`}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Details
                                </button>
                                <button
                                    type="button"
                                    className={`border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'history' ? 'border-indigo-500 text-indigo-600' : ''}`}
                                    onClick={() => setActiveTab('history')}
                                >
                                    History
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="overflow-y-auto px-6 py-6 flex-1 min-h-0">
                        <div className="mt-2">
                                {(!activeTab || activeTab === 'details') && (
                                    <form id="edit-station-form" onSubmit={handleEditSubmit} className="space-y-6">
                                    {editErrors.general && (
                                        <Alert type="error" message={editErrors.general} />
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Station Name *
                                            </label>
                                            <InputTextComponent
                                                name="name"
                                                value={editFormData.name || ''}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter station name"
                                                required
                                            />
                                            {editErrors.name && <InputError message={editErrors.name} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Station Code *
                                            </label>
                                            <InputTextComponent
                                                name="code"
                                                value={editFormData.code || ''}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter station code"
                                                required
                                            />
                                            {editErrors.code && <InputError message={editErrors.code} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Type *
                                            </label>
                                            <SelectComponent
                                                name="type"
                                                value={editFormData.type || ''}
                                                onChange={handleEditInputChange}
                                                options={stationTypes}
                                                required
                                            />
                                            {editErrors.type && <InputError message={editErrors.type} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department *
                                            </label>
                                            <SelectComponent
                                                name="department"
                                                value={editFormData.department || ''}
                                                onChange={handleEditInputChange}
                                                options={departments}
                                                required
                                            />
                                            {editErrors.department && <InputError message={editErrors.department} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location *
                                            </label>
                                            <SelectComponent
                                                name="location_id"
                                                value={editFormData.location_id || ''}
                                                onChange={handleEditInputChange}
                                                options={locationOptions}
                                                required
                                            />
                                            {editErrors.location_id && <InputError message={editErrors.location_id} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Assigned User
                                            </label>
                                            <InputTextComponent
                                                name="assigned_user"
                                                value={editFormData.assigned_user || ''}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter assigned user"
                                            />
                                            {editErrors.assigned_user && <InputError message={editErrors.assigned_user} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                IP Address
                                            </label>
                                            <InputTextComponent
                                                name="ip_address"
                                                value={editFormData.ip_address || ''}
                                                onChange={handleEditInputChange}
                                                placeholder="e.g. 192.168.1.100"
                                            />
                                            {editErrors.ip_address && <InputError message={editErrors.ip_address} />}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status
                                            </label>
                                            <SelectComponent
                                                name="status"
                                                value={editFormData.status || 'active'}
                                                onChange={handleEditInputChange}
                                                options={statusOptions}
                                            />
                                            {editErrors.status && <InputError message={editErrors.status} />}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows="3"
                                            value={editFormData.description || ''}
                                            onChange={handleEditInputChange}
                                            placeholder="Enter station description"
                                        />
                                        {editErrors.description && <InputError message={editErrors.description} />}
                                    </div>

                                    {/* Currently Assigned Assets Section */}
                                    <div className="bg-gray-50 p-4 rounded-lg border">
                                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Currently Assigned Assets</h4>
                                        
                                        {/* Currently Assigned Monitors */}
                                        {assignedMonitorDetails.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Monitors</h5>
                                                <div className="space-y-2">
                                                    {assignedMonitorDetails.map(monitor => (
                                                        <div key={monitor.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                            <span className="text-sm text-gray-700">
                                                                {monitor.brand} {monitor.model} ({monitor.size}") - {monitor.serial_number}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleMonitorSelection(monitor)}
                                                                className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                                            >
                                                                Unbind
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Currently Assigned System Unit */}
                                        {assignedSystemUnitDetails.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">System Unit</h5>
                                                <div className="space-y-2">
                                                    {assignedSystemUnitDetails.map(systemUnit => (
                                                        <div key={systemUnit.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                            <span className="text-sm text-gray-700">
                                                                {systemUnit.brand} {systemUnit.model} - {systemUnit.serial_number}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleSystemUnitSelection(systemUnit)}
                                                                className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                                            >
                                                                Unbind
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Currently Assigned Peripherals */}
                                        {assignedPeripheralDetails.length > 0 && (
                                            <div className="mb-4">
                                                <h5 className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Peripherals</h5>
                                                <div className="space-y-2">
                                                    {assignedPeripheralDetails.map(peripheral => (
                                                        <div key={peripheral.id} className="flex items-center justify-between bg-white p-2 rounded border">
                                                            <span className="text-sm text-gray-700">
                                                                {peripheral.brand} {peripheral.model} - {peripheral.serial_number}
                                                            </span>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handlePeripheralSelection(peripheral)}
                                                                className="text-xs px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                                            >
                                                                Unbind
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No Assets Assigned */}
                                        {assignedMonitorDetails.length === 0 && 
                                         assignedSystemUnitDetails.length === 0 && 
                                         assignedPeripheralDetails.length === 0 && (
                                            <div className="text-sm text-gray-500 italic">
                                                No assets currently assigned to this station
                                            </div>
                                        )}
                                    </div>

                                    {/* Monitor Assignment Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Additional Monitors
                                        </label>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                placeholder="Search monitors by brand, model, serial number..."
                                                value={editMonitorSearch}
                                                onChange={(e) => setEditMonitorSearch(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            {filteredEditMonitors.length > 0 ? (
                                                filteredEditMonitors.map(monitor => (
                                                    <div key={monitor.id} className="flex items-center mb-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`edit-monitor-${monitor.id}`}
                                                            checked={false}
                                                            onChange={() => handleMonitorSelection(monitor.id)}
                                                            className="mr-2"
                                                            disabled={monitor.status?.toUpperCase() === 'NOT_WORKING' || monitor.deployment_status === 'Out of Service'}
                                                        />
                                                        <div className="flex flex-col">
                                                            <label htmlFor={`edit-monitor-${monitor.id}`} className={`text-sm ${monitor.status?.toUpperCase() === 'NOT_WORKING' || monitor.deployment_status === 'Out of Service' ? 'text-gray-500' : ''}`}>
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
                                                <p className="text-sm text-gray-500">
                                                    {editMonitorSearch 
                                                        ? 'No monitors match your search criteria' 
                                                        : (allAvailableMonitors.length === 0 
                                                            ? 'No available monitors' 
                                                            : 'All available monitors are already assigned to this station'
                                                        )
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* System Unit Assignment Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign System Unit (One per station)
                                        </label>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {(editFormData.assigned_system_units || []).length > 0 
                                                ? 'Replace current system unit or select "No System Unit" to remove'
                                                : 'Select a system unit to assign to this station'
                                            }
                                        </div>
                                        <div className="mb-2">
                                            <input
                                                type="text"
                                                placeholder="Search system units by brand, model, serial number..."
                                                value={editSystemUnitSearch}
                                                onChange={(e) => setEditSystemUnitSearch(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            <>
                                                <div className="flex items-center mb-2">
                                                    <input
                                                        type="radio"
                                                        id="edit-system-unit-none"
                                                        name="edit-system-unit-selection"
                                                        checked={(editFormData.assigned_system_units || []).length === 0}
                                                        onChange={() => setEditFormData(prev => ({ ...prev, assigned_system_units: [] }))}
                                                        className="mr-2"
                                                    />
                                                    <label htmlFor="edit-system-unit-none" className="text-sm text-gray-500">
                                                        No System Unit
                                                    </label>
                                                </div>
                                                {filteredEditSystemUnits.map(systemUnit => (
                                                    <div key={systemUnit.id} className="flex items-center mb-2">
                                                        <input
                                                            type="radio"
                                                            id={`edit-system-unit-${systemUnit.id}`}
                                                            name="edit-system-unit-selection"
                                                            checked={false}
                                                            onChange={() => handleSystemUnitSelection(systemUnit.id)}
                                                            className="mr-2"
                                                            disabled={systemUnit.status?.toUpperCase() === 'NOT_WORKING' || systemUnit.deployment_status === 'Out of Service'}
                                                        />
                                                        <div className="flex flex-col">
                                                            <label htmlFor={`edit-system-unit-${systemUnit.id}`} className={`text-sm ${systemUnit.status?.toUpperCase() === 'NOT_WORKING' || systemUnit.deployment_status === 'Out of Service' ? 'text-gray-500' : ''}`}>
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
                                                {filteredEditSystemUnits.length === 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        {editSystemUnitSearch 
                                                            ? 'No system units match your search criteria' 
                                                            : (allAvailableSystemUnits.length === 0 
                                                                ? 'No available system units' 
                                                                : 'No additional system units available'
                                                            )
                                                        }
                                                    </p>
                                                )}
                                            </>
                                        </div>
                                    </div>

                                    {/* Peripherals Assignment Section */}
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-medium text-gray-900">Assign Peripherals</h4>
                                            <Button
                                                type="button"
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleOpenPeripheralBindingModal(editFormData.id)}
                                            >
                                                Assign with Serial Numbers
                                            </Button>
                                        </div>
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <>
                                                {/* Show currently assigned peripherals with serial numbers */}
                                                {editFormData.station_assets && editFormData.station_assets.length > 0 && (
                                                    <div className="mb-4">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Currently Assigned:</h5>
                                                        <div className="space-y-2">
                                                            {editFormData.station_assets
                                                                .filter(asset => asset.asset_type === 'peripheral' && asset.unassigned_at === null)
                                                                .map(asset => {
                                                                    const peripheral = Array.isArray(allAvailablePeripherals) ? 
                                                                        allAvailablePeripherals.find(p => p.id === asset.asset_id) : null;
                                                                    return peripheral ? (
                                                                        <div key={`${asset.asset_id}-${asset.serial_number || 'no-serial'}`} className="flex items-center justify-between bg-green-50 p-3 rounded border border-green-200">
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium text-gray-800">
                                                                                    {peripheral.type} - {peripheral.brand} {peripheral.model}
                                                                                </div>
                                                                                {asset.serial_number && (
                                                                                    <div className="text-xs text-gray-600 mt-1">
                                                                                        Serial: {asset.serial_number}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    Assigned: {new Date(asset.assigned_at).toLocaleDateString()}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setUnbindAsset({
                                                                                        type: 'peripheral',
                                                                                        id: asset.asset_id,
                                                                                        name: `${peripheral.brand} ${peripheral.model}${asset.serial_number ? ` (Serial: ${asset.serial_number})` : ''}`,
                                                                                        serialNumber: asset.serial_number
                                                                                    });
                                                                                    setIsUnbindModalOpen(true);
                                                                                }}
                                                                                className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                                            >
                                                                                Unbind
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div key={`${asset.asset_id}-${asset.serial_number || 'no-serial'}`} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
                                                                            <div className="flex-1">
                                                                                <div className="text-sm font-medium text-gray-800">
                                                                                    Peripheral ID: {asset.asset_id}
                                                                                </div>
                                                                                {asset.serial_number && (
                                                                                    <div className="text-xs text-gray-600 mt-1">
                                                                                        Serial: {asset.serial_number}
                                                                                    </div>
                                                                                )}
                                                                                <div className="text-xs text-gray-500 mt-1">
                                                                                    Assigned: {new Date(asset.assigned_at).toLocaleDateString()}
                                                                                </div>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    setUnbindAsset({
                                                                                        type: 'peripheral',
                                                                                        id: asset.asset_id,
                                                                                        name: `Peripheral ID: ${asset.asset_id}${asset.serial_number ? ` (Serial: ${asset.serial_number})` : ''}`,
                                                                                        serialNumber: asset.serial_number
                                                                                    });
                                                                                    setIsUnbindModalOpen(true);
                                                                                }}
                                                                                className="ml-3 px-3 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors"
                                                                            >
                                                                                Unbind
                                                                            </button>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Legacy: Show from assigned_peripherals array if no station_assets data */}
                                                {(!editFormData.station_assets || editFormData.station_assets.filter(asset => asset.asset_type === 'peripheral' && asset.unassigned_at === null).length === 0) && editFormData.assigned_peripherals && editFormData.assigned_peripherals.length > 0 && (
                                                    <div className="mb-4">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-2">Currently Selected (Legacy):</h5>
                                                        <div className="space-y-2">
                                                            {editFormData.assigned_peripherals.map(peripheralId => {
                                                                const peripheral = Array.isArray(allAvailablePeripherals) ? 
                                                                    allAvailablePeripherals.find(p => p.id === peripheralId) : null;
                                                                return peripheral ? (
                                                                    <div key={peripheralId} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                                                                        <span className="text-sm">
                                                                            {peripheral.type} - {peripheral.brand} {peripheral.model}
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handlePeripheralSelection(peripheralId)}
                                                                            className="text-red-600 hover:text-red-800 text-sm"
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div className="flex justify-between mb-3">
                                                    <h5 className="text-sm font-medium text-gray-700">Available Peripherals:</h5>
                                                    <div className="flex space-x-2">
                                                        {availablePeripherals && availablePeripherals.grouped && (
                                                            <select
                                                                value={editPeripheralTypeFilter || 'all'}
                                                                onChange={(e) => setEditPeripheralTypeFilter(e.target.value)}
                                                                className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                                            >
                                                                <option value="all">All Types</option>
                                                                {Object.keys(availablePeripherals.grouped).map(type => (
                                                                    <option key={type} value={type}>
                                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}
                                                        <input
                                                            type="text"
                                                            placeholder="Search peripherals..."
                                                            value={editPeripheralSearch}
                                                            onChange={(e) => setEditPeripheralSearch(e.target.value)}
                                                            className="text-sm px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div className="max-h-60 overflow-y-auto border rounded-lg">
                                                    {availablePeripherals && availablePeripherals.grouped ? (
                                                        Object.entries(availablePeripherals.grouped)
                                                            .filter(([type]) => editPeripheralTypeFilter === 'all' || type === editPeripheralTypeFilter)
                                                            .map(([type, brandModels]) => (
                                                                <div key={type} className="mb-2">
                                                                    <h6 className="bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                                                    </h6>
                                                                    <div>
                                                                        {Object.entries(brandModels)
                                                                            .filter(([brandModel]) => 
                                                                                !editPeripheralSearch || 
                                                                                brandModel.toLowerCase().includes(editPeripheralSearch.toLowerCase())
                                                                            )
                                                                            .map(([brandModel, data]) => {
                                                                                const isAssigned = (editFormData.assigned_peripherals || []).includes(data.id);
                                                                                const isDisabled = data.available_stock <= 0 && !isAssigned;
                                                                                
                                                                                return (
                                                                                    <div key={brandModel} className="px-3 py-2 border-b last:border-0">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <div>
                                                                                                <div className="text-sm">{brandModel}</div>
                                                                                                <div className="text-xs text-gray-500">
                                                                                                    Available: {data.available_stock} {data.available_stock === 1 ? 'unit' : 'units'}
                                                                                                </div>
                                                                                            </div>
                                                                                            <button
                                                                                                type="button"
                                                                                                className={`text-xs px-2 py-1 rounded ${
                                                                                                    isAssigned 
                                                                                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                                                                                        : isDisabled
                                                                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                                                                }`}
                                                                                                onClick={() => handlePeripheralSelection(data.id)}
                                                                                                disabled={isDisabled}
                                                                                            >
                                                                                                {isAssigned ? 'Remove' : 'Add'}
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })
                                                                        }
                                                                        {Object.entries(brandModels).filter(([brandModel]) => 
                                                                            !editPeripheralSearch || 
                                                                            brandModel.toLowerCase().includes(editPeripheralSearch.toLowerCase())
                                                                        ).length === 0 && (
                                                                            <p className="px-3 py-2 text-xs text-gray-500">
                                                                                No {type} peripherals match your search
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <div className="p-3">
                                                            <p className="text-sm text-gray-500">Loading peripherals...</p>
                                                        </div>
                                                    )}
                                                    
                                                    {availablePeripherals && availablePeripherals.grouped && 
                                                     Object.keys(availablePeripherals.grouped)
                                                        .filter(type => editPeripheralTypeFilter === 'all' || type === editPeripheralTypeFilter)
                                                        .length === 0 && (
                                                        <p className="p-3 text-sm text-gray-500">
                                                            No peripherals available
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        </div>
                                    </div>

                                    {/* QR Code Section */}
                                    <div className="mb-6">
                                        <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                                        <div className="border border-gray-200 rounded-lg p-3">
                                            <>
                                                {editFormData.id && (
                                                    <>
                                                        <p className="text-gray-600 mb-2">Scan or share this QR code to view station details:</p>
                                                        <p className="font-mono text-xs text-gray-500">QR Code: {editFormData.qr_code || 'Generating...'}</p>
                                                        <div className="flex gap-2 mt-3">
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => handleShowQrCode(editFormData)}
                                                            >
                                                                <QrCodeIcon className="w-4 h-4 mr-1" />
                                                                View QR Code
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                onClick={() => window.open(`/stations/${editFormData.id}/qr-image?download=1`, '_blank')}
                                                            >
                                                                <ArrowDownCircleIcon className="w-4 h-4 mr-1" />
                                                                Download QR
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </>
                                        </div>
                                    </div>

                                    </form>
                                )}
                                
                                {activeTab === 'history' && (
                                    <div className="py-4">
                                        <h4 className="text-base font-medium text-gray-900 mb-4">Station History</h4>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <StationHistory stationId={editFormData.id} />
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                    
                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 sticky bottom-0 rounded-b-lg">
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleCloseEdit}
                                disabled={editLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={editLoading}
                                form="edit-station-form"
                                onClick={() => console.log('Update button clicked', editLoading, editFormData)}
                            >
                                {editLoading ? 'Updating...' : 'Update Station'}
                            </Button>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Unbind Asset Modal */}
            <UnbindAssetModal
                isOpen={isUnbindModalOpen}
                onClose={() => setIsUnbindModalOpen(false)}
                assetType={unbindAsset.type}
                assetId={unbindAsset.id}
                assetName={unbindAsset.name}
                onConfirm={handleUnbindConfirm}
            />
            
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Station"
                message="Are you sure you want to delete this station? This will unassign all assets and cannot be undone."
            />

            {/* QR Code Modal */}
            <Modal isOpen={isQrModalOpen} onClose={handleCloseQrModal}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Station QR Code</h3>
                    {selectedStation && (
                        <div className="flex flex-col items-center">
                            <img 
                                src={`/stations/${selectedStation.id}/qr-image`}
                                alt="QR Code"
                                className="w-64 h-64 mb-4"
                            />
                            <p className="text-sm text-gray-600 mb-4">{selectedStation.name} - {selectedStation.code || 'No Code'}</p>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => window.open(`/stations/${selectedStation.id}/qr-image?download=1`, '_blank')}
                            >
                                <ArrowDownCircleIcon className="h-4 w-4 mr-2" />
                                Download QR Code
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>

            {/* Peripheral Binding with Serials Modal */}
            <Modal isOpen={isPeripheralBindingModalOpen} onClose={handleClosePeripheralBindingModal}>
                {peripheralBindingStationId && (
                    <PeripheralBindingWithSerialsSection
                        stationId={peripheralBindingStationId}
                        onClose={handleClosePeripheralBindingModal}
                        onSuccess={handlePeripheralBindingSuccess}
                    />
                )}
            </Modal>
        </div>
    )
}
