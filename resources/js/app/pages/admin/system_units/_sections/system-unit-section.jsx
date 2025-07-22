import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SelectComponent from '@/app/pages/components/input-select'
import QrScanner from './QrScanner'
import { ArrowDownCircleIcon, EyeIcon, PrinterIcon, ComputerDesktopIcon, CpuChipIcon, QrCodeIcon, PencilIcon, TrashIcon, CameraIcon } from '@heroicons/react/24/outline'

export default function SystemUnitTableSection() {
    const [systemUnits, setSystemUnits] = useState([])
    // ...existing code...
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // Modal states
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [scannerModalOpen, setScannerModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    
    // Assignment form
    const [assignmentData, setAssignmentData] = useState({
        assigned_to: '',
        notes: ''
    })

    // Edit form data
    const [editFormData, setEditFormData] = useState({
        serial_number: '',
        system_name: '',
        unit_type: '',
        brand: '',
        model: '',
        description: '',
        operating_system: '',
        status: '',
        location: '',
        assigned_to: '',
        received_by: '',
        purchase_price: '',
        supplier: '',
        purchase_date: '',
        warranty_expiry: '',
        notes: '',
        specifications: ''
    })

    const fetchSystemUnits = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/system-units', {
                headers: { 'Accept': 'application/json' }
            })
            
            if (!response.ok) {
                throw new Error('Failed to fetch system units')
            }
            
            const data = await response.json()
            setSystemUnits(data)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching system units:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSystemUnits()
    }, [])

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/api/system-units/${deleteId}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                throw new Error('Failed to delete system unit')
            }
            
            // Refresh the list
            fetchSystemUnits()
            setIsDeleteModalOpen(false)
            setDeleteId(null)
            console.log('System unit deleted successfully')
        } catch (err) {
            console.error('Error deleting system unit:', err)
            alert('Error deleting system unit: ' + err.message)
        }
    }

    const openDetailsModal = (unit) => {
        setSelectedUnit(unit)
        setEditFormData({
            serial_number: unit.serial_number || '',
            system_name: unit.system_name || '',
            unit_type: unit.unit_type || '',
            brand: unit.brand || '',
            model: unit.model || '',
            description: unit.description || '',
            operating_system: unit.operating_system || '',
            status: unit.status || '',
            location: unit.location || '',
            assigned_to: unit.assigned_to || '',
            received_by: unit.received_by || '',
            purchase_price: unit.purchase_price || '',
            supplier: unit.supplier || '',
            purchase_date: unit.purchase_date || '',
            warranty_expiry: unit.warranty_expiry || '',
            notes: unit.notes || '',
            specifications: typeof unit.specifications === 'object' && unit.specifications !== null 
                ? JSON.stringify(unit.specifications, null, 2) 
                : unit.specifications || ''
        })
        setIsEditMode(false) // Start in view mode
        setDetailsModalOpen(true)
    }

    const closeDetailsModal = () => {
        setSelectedUnit(null)
        setDetailsModalOpen(false)
        setIsEditMode(false)
        setEditFormData({
            serial_number: '',
            system_name: '',
            unit_type: '',
            brand: '',
            model: '',
            description: '',
            operating_system: '',
            status: '',
            location: '',
            assigned_to: '',
            received_by: '',
            purchase_price: '',
            supplier: '',
            purchase_date: '',
            warranty_expiry: '',
            notes: '',
            specifications: ''
        })
    }

    const toggleEditMode = () => {
        if (!isEditMode) {
            // When entering edit mode, refresh the form data with current selectedUnit data
            setEditFormData({
                serial_number: selectedUnit.serial_number || '',
                system_name: selectedUnit.system_name || '',
                unit_type: selectedUnit.unit_type || '',
                brand: selectedUnit.brand || '',
                model: selectedUnit.model || '',
                description: selectedUnit.description || '',
                operating_system: selectedUnit.operating_system || '',
                status: selectedUnit.status || '',
                location: selectedUnit.location || '',
                assigned_to: selectedUnit.assigned_to || '',
                received_by: selectedUnit.received_by || '',
                purchase_price: selectedUnit.purchase_price || '',
                supplier: selectedUnit.supplier || '',
                purchase_date: selectedUnit.purchase_date || '',
                warranty_expiry: selectedUnit.warranty_expiry || '',
                notes: selectedUnit.notes || '',
                specifications: typeof selectedUnit.specifications === 'object' && selectedUnit.specifications !== null 
                    ? JSON.stringify(selectedUnit.specifications, null, 2) 
                    : selectedUnit.specifications || ''
            })
        }
        setIsEditMode(!isEditMode)
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSpecificationChange = (field, value) => {
        try {
            const specs = JSON.parse(editFormData.specifications || '{}')
            specs[field] = value || null
            setEditFormData(prev => ({
                ...prev,
                specifications: JSON.stringify(specs, null, 2)
            }))
        } catch {
            const specs = { [field]: value || null }
            setEditFormData(prev => ({
                ...prev,
                specifications: JSON.stringify(specs, null, 2)
            }))
        }
    }

    const getSpecificationValue = (field) => {
        try {
            const specs = JSON.parse(editFormData.specifications || '{}')
            return specs[field] || ''
        } catch {
            return ''
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        console.log('Submitting form data:', editFormData)
        console.log('Selected unit ID:', selectedUnit.id)
        
        // Prepare the data for submission
        const submitData = { ...editFormData }
        
        // Remove serial_number from submission as it should not be changed
        delete submitData.serial_number
        
        // Debug: Check specific fields before and after processing
        console.log('Raw form data brand:', editFormData.brand)
        console.log('Raw form data model:', editFormData.model)
        
        // Ensure brand and model are properly included (handle null/undefined)
        if (submitData.brand === null || submitData.brand === undefined) {
            submitData.brand = ''
        }
        if (submitData.model === null || submitData.model === undefined) {
            submitData.model = ''
        }
        
        console.log('After processing brand:', submitData.brand)
        console.log('After processing model:', submitData.model)
        
        // Parse specifications if it's a string
        if (typeof submitData.specifications === 'string' && submitData.specifications.trim()) {
            try {
                submitData.specifications = JSON.parse(submitData.specifications)
            } catch (error) {
                console.error('Invalid JSON in specifications:', error)
                alert('Invalid JSON format in specifications. Please check the JSON syntax or use the individual fields instead.')
                return
            }
        } else if (!submitData.specifications || submitData.specifications === '') {
            // If specifications is empty, set it to an empty object
            submitData.specifications = {}
        }
        
        console.log('Prepared submit data:', submitData)
        console.log('Submit data keys:', Object.keys(submitData))
        console.log('Submit data brand included:', 'brand' in submitData)
        console.log('Submit data model included:', 'model' in submitData)
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            console.log('CSRF Token:', csrfToken)
            
            const response = await fetch(`/api/system-units/${selectedUnit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(submitData)
            })

            console.log('Response status:', response.status)
            console.log('Response ok:', response.ok)

            if (response.ok) {
                const updatedData = await response.json()
                console.log('Update successful, received data:', updatedData)
                
                // Debug: Check if brand and model are in the response
                console.log('Server returned brand:', updatedData.brand)
                console.log('Server returned model:', updatedData.model)
                
                // Update both the selected unit and form data with fresh server data
                setSelectedUnit(updatedData)
                setEditFormData({
                    serial_number: updatedData.serial_number || '',
                    system_name: updatedData.system_name || '',
                    unit_type: updatedData.unit_type || '',
                    brand: updatedData.brand || '',
                    model: updatedData.model || '',
                    description: updatedData.description || '',
                    operating_system: updatedData.operating_system || '',
                    status: updatedData.status || '',
                    location: updatedData.location || '',
                    assigned_to: updatedData.assigned_to || '',
                    received_by: updatedData.received_by || '',
                    purchase_price: updatedData.purchase_price || '',
                    supplier: updatedData.supplier || '',
                    purchase_date: updatedData.purchase_date || '',
                    warranty_expiry: updatedData.warranty_expiry || '',
                    notes: updatedData.notes || '',
                    specifications: typeof updatedData.specifications === 'object' && updatedData.specifications !== null 
                        ? JSON.stringify(updatedData.specifications, null, 2) 
                        : updatedData.specifications || ''
                })
                
                setIsEditMode(false) // Switch back to view mode
                fetchSystemUnits() // Refresh the list
                alert('System unit updated successfully!')
            } else {
                const errorText = await response.text()
                console.error('Failed to update system unit. Status:', response.status)
                console.error('Error response:', errorText)
                
                try {
                    const errorData = JSON.parse(errorText)
                    alert(`Failed to update system unit: ${errorData.message || 'Unknown error'}`)
                } catch {
                    alert(`Failed to update system unit. Server returned: ${response.status} - ${errorText}`)
                }
            }
        } catch (err) {
            console.error('Error updating system unit:', err)
            alert('Network error occurred while updating system unit: ' + err.message)
        }
    }

    const openAssignModal = (unit) => {
        setSelectedUnit(unit)
        setAssignmentData({ assigned_to: unit.assigned_to || '', notes: unit.notes || '' })
        setAssignModalOpen(true)
    }

    const closeAssignModal = () => {
        setAssignModalOpen(false)
        setSelectedUnit(null)
        setAssignmentData({ assigned_to: '', notes: '' })
    }

    // Scanner functions
    const openScannerModal = () => {
        setScannerModalOpen(true)
    }

    const closeScannerModal = () => {
        setScannerModalOpen(false)
    }

    const handleQrScan = async (qrCode) => {
        try {
            const response = await fetch(`/api/system-units/qr/${qrCode}`)
            if (response.ok) {
                const systemUnit = await response.json()
                setSelectedUnit(systemUnit)
                setDetailsModalOpen(true)
                closeScannerModal()
            } else {
                alert('System unit not found or QR code invalid.')
            }
        } catch (error) {
            console.error('Error fetching system unit:', error)
            alert('Error scanning QR code. Please try again.')
        }
    }

    const handleAssignment = async (e) => {
        e.preventDefault()
        
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            const endpoint = selectedUnit.status === 'assigned' 
                ? `/api/system-units/${selectedUnit.id}/return`
                : `/api/system-units/${selectedUnit.id}/assign`
                
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify(assignmentData)
            })

            if (response.ok) {
                closeAssignModal()
                fetchSystemUnits()
                alert(`System unit ${selectedUnit.status === 'assigned' ? 'returned' : 'assigned'} successfully!`)
            } else {
                const errorData = await response.json()
                alert('Failed to update assignment. Please try again.')
            }
        } catch (error) {
            console.error('Error updating assignment:', error)
            alert('An error occurred while updating the assignment.')
        }
    }

    // Filter system units
    const filteredUnits = systemUnits.filter(unit => {
        const matchesSearch = !searchTerm || 
            unit.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (unit.brand && unit.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (unit.model && unit.model.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesStatus = !statusFilter || unit.status === statusFilter
        const matchesType = !typeFilter || unit.unit_type === typeFilter
        const matchesLocation = !locationFilter || unit.location === locationFilter
        return matchesSearch && matchesStatus && matchesType && matchesLocation
    })

    // ...existing code...

    const formatSpecifications = (unit) => {
        if (unit.unit_type === 'pre_built') {
            return unit.specifications || {}
        }

        // For custom built, format components
        const specs = {}
        if (unit.part_items) {
            unit.part_items.forEach(item => {
                const role = item.pivot.component_role
                if (!specs[role]) specs[role] = []
                specs[role].push(`${item.part.brand} ${item.part.model}`)
            })
        }
        return specs
    }

    const getStatusBadge = (status) => {
        const statusClasses = {
            available: 'bg-green-100 text-green-800',
            assigned: 'bg-blue-100 text-blue-800',
            maintenance: 'bg-yellow-100 text-yellow-800',
            retired: 'bg-red-100 text-red-800'
        }

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const getUnitTypeBadge = (unitType) => {
        return unitType === 'pre_built' ? (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Pre-built
            </span>
        ) : (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                Custom Built
            </span>
        )
    }

    const statusOptions = [
        { label: 'All Statuses', value: '' },
        { label: 'Available', value: 'available' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Maintenance', value: 'maintenance' },
        { label: 'Retired', value: 'retired' }
    ]

    const typeOptions = [
        { label: 'All Types', value: '' },
        { label: 'Pre-built', value: 'pre_built' },
        { label: 'Custom Built', value: 'custom_built' }
    ]

    const locationOptions = [
        { label: 'All Locations', value: '' },
        { label: 'Storage', value: 'storage' },
        { label: 'Secure Storage', value: 'secure_storage' },
        { label: 'IT Department', value: 'it_department' },
        { label: 'Office A', value: 'office_a' },
        { label: 'Office B', value: 'office_b' },
        { label: 'Warehouse', value: 'warehouse' }
    ]

    if (loading) {
        return (
            <div className="mt-8 flow-root bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading system units...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="mt-8 flow-root bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center text-red-600">
                    <p>Error: {error}</p>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={fetchSystemUnits}
                        className="mt-4"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8 flow-root bg-white p-6 rounded-lg shadow-lg">
            {/* Header with Statistics */}
            <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-600">Total Systems</div>
                                <div className="text-2xl font-bold text-blue-900">{systemUnits.length}</div>
                            </div>
                            <ComputerDesktopIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">Available</div>
                                <div className="text-2xl font-bold text-green-900">
                                    {systemUnits.filter(u => u.status === 'available').length}
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">✓</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-yellow-600">Assigned</div>
                                <div className="text-2xl font-bold text-yellow-900">
                                    {systemUnits.filter(u => u.status === 'assigned').length}
                                </div>
                            </div>
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">→</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-purple-600">Custom Built</div>
                                <div className="text-2xl font-bold text-purple-900">
                                    {systemUnits.filter(u => u.unit_type === 'custom_built').length}
                                </div>
                            </div>
                            <CpuChipIcon className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <InputTextComponent
                            placeholder="Search by name, serial, brand..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <SelectComponent
                            options={statusOptions}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <SelectComponent
                            options={typeOptions}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <SelectComponent
                            options={locationOptions}
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                    Showing {filteredUnits.length} of {systemUnits.length} system units
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <PrinterIcon className='h-4 w-4 mr-1'/>
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={openScannerModal}>
                        <CameraIcon className='h-4 w-4 mr-1'/>
                        Scan QR
                    </Button>
                    <Button variant="success" size="sm">
                        <ArrowDownCircleIcon className='h-4 w-4 mr-1'/>
                        Export
                    </Button>
                    <Button variant="primary" size="sm" onClick={fetchSystemUnits}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900">
                                System Info
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Type
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                CPU
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                RAM
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Storage
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Operating System
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Status
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Location
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Station / Assignment
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUnits.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                                    {systemUnits.length === 0 ? 'No system units found.' : 'No units match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            filteredUnits.map((unit) => {
                                const specs = formatSpecifications(unit)
                                return (
                                    <tr key={unit.id} className="hover:bg-gray-50">
            {/* ...pagination controls removed... */}
                                        <td className="py-4 pr-3 pl-4 text-sm">
                                            <div>
                                                <div className="font-medium text-gray-900">{unit.system_name}</div>
                                                <div className="text-gray-500">
                                                    SN: {unit.serial_number}
                                                    {unit.brand && unit.model && (
                                                        <span className="ml-2">{unit.brand} {unit.model}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                                            {getUnitTypeBadge(unit.unit_type)}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {specs.cpu || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {specs.ram || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {specs.storage || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {unit.operating_system || 'N/A'}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap">
                                            {getStatusBadge(unit.status)}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500 capitalize">
                                            {unit.location.replace('_', ' ')}
                                        </td>
                                        <td className="px-3 py-4 text-sm text-gray-500">
                                            {unit.station ? (
                                                <div>
                                                    <div className="font-medium text-gray-900">{unit.station.name}</div>
                                                    <div className="text-xs text-gray-500">{unit.station.type} - {unit.assigned_to || 'Unassigned user'}</div>
                                                </div>
                                            ) : (
                                                <div className="text-gray-400">
                                                    {unit.assigned_to || 'Not assigned'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-3 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => openDetailsModal(unit)}
                                                    title="View/Edit Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => window.open(`/system-units/${unit.id}/qr-image`, '_blank')}
                                                    title="View QR Code"
                                                >
                                                    <QrCodeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => window.open(`/system-units/${unit.id}/qr-image?download=1`, '_blank')}
                                                    title="Download QR Code"
                                                >
                                                    <ArrowDownCircleIcon className="h-4 w-4" />
                                                </Button>
                                                {unit.status === 'available' && (
                                                    <Button
                                                        type="button"
                                                        variant="warning"
                                                        size="sm"
                                                        onClick={() => openAssignModal(unit)}
                                                        title="Assign to User"
                                                    >
                                                        <ComputerDesktopIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {unit.status === 'assigned' && (
                                                    <Button
                                                        type="button"
                                                        variant="info"
                                                        size="sm"
                                                        onClick={() => openAssignModal(unit)}
                                                        title="Return Unit"
                                                    >
                                                        <ComputerDesktopIcon className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(unit.id)}
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Details/Edit Combined Modal */}
            <Modal isOpen={detailsModalOpen} onClose={closeDetailsModal}>
                {selectedUnit && (
                    <div className="bg-white max-h-[90vh] flex flex-col">
                        {/* Fixed Header */}
                        <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {isEditMode ? 'Edit System Unit' : `System Unit Details - ${selectedUnit.system_name}`}
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleEditMode}
                                >
                                    <PencilIcon className="h-4 w-4 mr-2" />
                                    {isEditMode ? 'Cancel Edit' : 'Edit'}
                                </Button>
                            </div>
                        </div>

                        {/* Form wrapper for edit mode */}
                        <form onSubmit={handleEditSubmit} className="flex flex-col flex-1 overflow-hidden">
                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4">
                                {isEditMode ? (
                                    /* Edit Mode - Form Fields */
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Serial Number * (Read-only)
                                                </label>
                                                <InputTextComponent
                                                    name="serial_number"
                                                    value={editFormData.serial_number}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Serial number cannot be changed"
                                                    disabled
                                                    className="bg-gray-100"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Serial numbers cannot be modified to maintain data integrity</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    System Name *
                                                </label>
                                                <InputTextComponent
                                                    name="system_name"
                                                    value={editFormData.system_name}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter system name"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Unit Type *
                                                </label>
                                                <SelectComponent
                                                    name="unit_type"
                                                    value={editFormData.unit_type}
                                                    onChange={handleEditInputChange}
                                                    options={[
                                                        { value: '', label: 'Select Type' },
                                                        { value: 'custom_built', label: 'Custom Built' },
                                                        { value: 'pre_built', label: 'Pre-built' }
                                                    ]}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Brand
                                                </label>
                                                <InputTextComponent
                                                    name="brand"
                                                    value={editFormData.brand}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter brand"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Model
                                                </label>
                                                <InputTextComponent
                                                    name="model"
                                                    value={editFormData.model}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter model"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Operating System
                                                </label>
                                                <InputTextComponent
                                                    name="operating_system"
                                                    value={editFormData.operating_system}
                                                    onChange={handleEditInputChange}
                                                    placeholder="e.g., Windows 11, macOS"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Status *
                                                </label>
                                                <SelectComponent
                                                    name="status"
                                                    value={editFormData.status}
                                                    onChange={handleEditInputChange}
                                                    options={[
                                                        { value: '', label: 'Select Status' },
                                                        { value: 'available', label: 'Available' },
                                                        { value: 'assigned', label: 'Assigned' },
                                                        { value: 'maintenance', label: 'Maintenance' },
                                                        { value: 'retired', label: 'Retired' }
                                                    ]}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Location
                                                </label>
                                                <InputTextComponent
                                                    name="location"
                                                    value={editFormData.location}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter location"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Purchase Price
                                                </label>
                                                <InputTextComponent
                                                    name="purchase_price"
                                                    type="number"
                                                    step="0.01"
                                                    value={editFormData.purchase_price}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter purchase price"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Supplier
                                                </label>
                                                <InputTextComponent
                                                    name="supplier"
                                                    value={editFormData.supplier}
                                                    onChange={handleEditInputChange}
                                                    placeholder="Enter supplier"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description
                                            </label>
                                            <textarea
                                                name="description"
                                                rows={3}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={editFormData.description}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter description"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Specifications
                                            </label>
                                            {editFormData.unit_type === 'pre_built' ? (
                                                <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">CPU</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., Intel Core i7-12700K"
                                                                value={getSpecificationValue('cpu')}
                                                                onChange={(e) => handleSpecificationChange('cpu', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">RAM</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., 32GB DDR4 3200MHz"
                                                                value={getSpecificationValue('ram')}
                                                                onChange={(e) => handleSpecificationChange('ram', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Storage</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., 1TB NVMe SSD"
                                                                value={getSpecificationValue('storage')}
                                                                onChange={(e) => handleSpecificationChange('storage', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">GPU</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., NVIDIA RTX 4070"
                                                                value={getSpecificationValue('gpu')}
                                                                onChange={(e) => handleSpecificationChange('gpu', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Motherboard</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., ASUS ROG Strix B660-F"
                                                                value={getSpecificationValue('motherboard')}
                                                                onChange={(e) => handleSpecificationChange('motherboard', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Power Supply</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., 750W 80+ Gold"
                                                                value={getSpecificationValue('psu')}
                                                                onChange={(e) => handleSpecificationChange('psu', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Case</label>
                                                            <InputTextComponent
                                                                placeholder="e.g., Fractal Design Define 7"
                                                                value={getSpecificationValue('case')}
                                                                onChange={(e) => handleSpecificationChange('case', e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">Other</label>
                                                            <InputTextComponent
                                                                placeholder="Any additional specifications"
                                                                value={getSpecificationValue('other')}
                                                                onChange={(e) => handleSpecificationChange('other', e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <button 
                                                            type="button"
                                                            className="text-xs text-gray-500 hover:text-gray-700"
                                                            onClick={() => {
                                                                const showRaw = document.getElementById('raw-specs-' + selectedUnit?.id)
                                                                showRaw.style.display = showRaw.style.display === 'none' ? 'block' : 'none'
                                                            }}
                                                        >
                                                            Toggle Raw JSON View
                                                        </button>
                                                        <div id={'raw-specs-' + (selectedUnit?.id || 0)} style={{display: 'none'}} className="mt-2">
                                                            <textarea
                                                                name="specifications"
                                                                rows={4}
                                                                className="block w-full text-xs rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                                                                value={editFormData.specifications}
                                                                onChange={handleEditInputChange}
                                                                placeholder="Raw JSON format"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-800">
                                                        This is a custom-built system. Specifications are automatically tracked through the associated components.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes
                                            </label>
                                            <textarea
                                                name="notes"
                                                rows={3}
                                                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                                value={editFormData.notes}
                                                onChange={handleEditInputChange}
                                                placeholder="Enter additional notes"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* View Mode - Display */
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Basic Information */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div><span className="font-medium">ID:</span> #{selectedUnit.id}</div>
                                                    <div><span className="font-medium">Serial Number:</span> {selectedUnit.serial_number}</div>
                                                    <div><span className="font-medium">System Name:</span> {selectedUnit.system_name}</div>
                                                    <div><span className="font-medium">Type:</span> {getUnitTypeBadge(selectedUnit.unit_type)}</div>
                                                    {selectedUnit.brand && <div><span className="font-medium">Brand:</span> {selectedUnit.brand}</div>}
                                                    {selectedUnit.model && <div><span className="font-medium">Model:</span> {selectedUnit.model}</div>}
                                                    <div><span className="font-medium">Status:</span> {getStatusBadge(selectedUnit.status)}</div>
                                                    <div><span className="font-medium">Location:</span> {selectedUnit.location}</div>
                                                    <div><span className="font-medium">Operating System:</span> {selectedUnit.operating_system || 'N/A'}</div>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Purchase Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    <div><span className="font-medium">Purchase Price:</span> ${parseFloat(selectedUnit.purchase_price || 0).toFixed(2)}</div>
                                                    <div><span className="font-medium">Supplier:</span> {selectedUnit.supplier || 'N/A'}</div>
                                                    <div><span className="font-medium">Purchase Date:</span> {selectedUnit.purchase_date || 'N/A'}</div>
                                                    <div><span className="font-medium">Warranty Expiry:</span> {selectedUnit.warranty_expiry || 'N/A'}</div>
                                                    <div><span className="font-medium">Received By:</span> {selectedUnit.received_by}</div>
                                                </div>
                                            </div>

                                            {/* Assignment Information */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">Assignment Information</h4>
                                                <div className="space-y-2 text-sm">
                                                    {selectedUnit.station ? (
                                                        <>
                                                            <div><span className="font-medium">Station:</span> {selectedUnit.station.name}</div>
                                                            <div><span className="font-medium">Station Type:</span> {selectedUnit.station.type}</div>
                                                            <div><span className="font-medium">Department:</span> {selectedUnit.station.department}</div>
                                                            {selectedUnit.assigned_to && <div><span className="font-medium">Assigned To:</span> {selectedUnit.assigned_to}</div>}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-gray-500">Not assigned to any station</div>
                                                            {selectedUnit.assigned_to && <div><span className="font-medium">Assigned To:</span> {selectedUnit.assigned_to}</div>}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* QR Code Section */}
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                                                <div className="bg-gray-50 rounded-lg p-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="text-sm">
                                                            <p className="text-gray-600 mb-2">Scan or share this QR code:</p>
                                                            <p className="font-mono text-xs text-gray-500">QR Code: {selectedUnit.qr_code || 'Generating...'}</p>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/system-units/${selectedUnit.id}/qr-image`, '_blank')}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <QrCodeIcon className="h-4 w-4" />
                                                                <span>View QR</span>
                                                            </Button>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                onClick={() => window.open(`/system-units/${selectedUnit.id}/qr-image?download=1`, '_blank')}
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <ArrowDownCircleIcon className="h-4 w-4" />
                                                                <span>Download</span>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Specifications/Components */}
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-3">
                                                {selectedUnit.unit_type === 'pre_built' ? 'Specifications' : 'Components'}
                                            </h4>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                {selectedUnit.unit_type === 'pre_built' ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {Object.entries(selectedUnit.specifications || {}).map(([key, value]) => (
                                                            value && (
                                                                <div key={key} className="text-sm">
                                                                    <span className="font-medium capitalize">{key === 'psu' ? 'Power Supply' : key}:</span> {value}
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {selectedUnit.part_items && selectedUnit.part_items.length > 0 ? (
                                                            selectedUnit.part_items.map((item) => (
                                                                <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded border">
                                                                    <div>
                                                                        <div className="font-medium capitalize">{item.pivot.component_role}</div>
                                                                        <div className="text-sm text-gray-600">
                                                                            {item.part.brand} {item.part.model}
                                                                            {item.serial_number && ` (SN: ${item.serial_number})`}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        ${parseFloat(item.unit_price || 0).toFixed(2)}
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-gray-500">No components tracked for this system unit.</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Description and Notes */}
                                        {(selectedUnit.description || selectedUnit.notes) && (
                                            <div>
                                                {selectedUnit.description && (
                                                    <div className="mb-3">
                                                        <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                                        <p className="text-sm text-gray-600">{selectedUnit.description}</p>
                                                    </div>
                                                )}
                                                {selectedUnit.notes && (
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                                                        <p className="text-sm text-gray-600">{selectedUnit.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            {/* Fixed Footer */}
                            {isEditMode ? (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-2 flex-shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="md"
                                        onClick={() => setIsEditMode(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        size="md"
                                    >
                                        Update System Unit
                                    </Button>
                                </div>
                            ) : (
                                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="md"
                                        onClick={closeDetailsModal}
                                    >
                                        Close
                                    </Button>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </Modal>

            {/* Assignment Modal */}
            <Modal isOpen={assignModalOpen} onClose={closeAssignModal}>
                {selectedUnit && (
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {selectedUnit.status === 'assigned' ? 'Return' : 'Assign'} System Unit
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {selectedUnit.system_name} (SN: {selectedUnit.serial_number})
                        </p>
                        
                        <form onSubmit={handleAssignment} className="space-y-4">
                            {selectedUnit.status !== 'assigned' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign To *
                                    </label>
                                    <InputTextComponent
                                        placeholder="Enter user name or department"
                                        value={assignmentData.assigned_to}
                                        onChange={(e) => setAssignmentData(prev => ({ ...prev, assigned_to: e.target.value }))}
                                        required
                                    />
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    placeholder="Additional notes..."
                                    value={assignmentData.notes}
                                    onChange={(e) => setAssignmentData(prev => ({ ...prev, notes: e.target.value }))}
                                />
                            </div>
                            
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="md"
                                    onClick={closeAssignModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant={selectedUnit.status === 'assigned' ? 'danger' : 'primary'}
                                    size="md"
                                >
                                    {selectedUnit.status === 'assigned' ? 'Return System' : 'Assign System'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>

            {/* QR Scanner Modal */}
            <QrScanner 
                isOpen={scannerModalOpen}
                onClose={closeScannerModal}
                onScan={handleQrScan}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete System Unit"
                message="Are you sure you want to delete this system unit? This action cannot be undone."
            />
        </div>
    )
}
