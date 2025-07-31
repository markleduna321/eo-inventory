import React, { useState, useEffect } from 'react'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SelectComponent from '@/app/pages/components/input-select'
import QrScanner from './QrScanner'
import { ArrowDownCircleIcon, EyeIcon, PrinterIcon, ComputerDesktopIcon, CpuChipIcon, QrCodeIcon, PencilIcon, TrashIcon, CameraIcon } from '@heroicons/react/24/outline'
import PaginationSection from './pagination-section'
import ActionButtonSection from './action-button-section'

export default function SystemUnitTableSection() {
    const [systemUnits, setSystemUnits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modal states
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
    const [editModalOpen, setEditModalOpen] = useState(false) // Added edit modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false)
    const [scannerModalOpen, setScannerModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [qrModalOpen, setQrModalOpen] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    
    // Edit form state
    const [editForm, setEditForm] = useState({
        system_name: '',
        serial_number: '',
        brand: '',
        model: '',
        operating_system: '',
        status: '',
        location: '',
        description: '',
        notes: '',
        specifications: {}
    })

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [locationFilter, setLocationFilter] = useState('')
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5 // Number of items to display per page

    // Assignment form
    const [assignmentData, setAssignmentData] = useState({
        assigned_to: '',
        notes: ''
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
            console.log('Fetched system units data:', data);
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
        setDetailsModalOpen(true)
    }
    
    const handleEditClick = (unit) => {
        setSelectedUnit(unit)
        setEditModalOpen(true)
        
        // Initialize edit form with current unit values
        setEditForm({
            system_name: unit.system_name || '',
            serial_number: unit.serial_number || '',
            brand: unit.brand || '',
            model: unit.model || '',
            operating_system: unit.operating_system || '',
            status: unit.status || '',
            location: unit.location || '',
            description: unit.description || '',
            notes: unit.notes || '',
            specifications: unit.specifications || {}
        })
    }

    const closeDetailsModal = () => {
        setSelectedUnit(null)
        setDetailsModalOpen(false)
    }
    
    const closeEditModal = () => {
        setSelectedUnit(null)
        setEditModalOpen(false)
    }
    
    const handleShowQrCode = (unit) => {
        setSelectedUnit(unit)
        setQrModalOpen(true)
    }
    
    const handleCloseQrModal = () => {
        setQrModalOpen(false)
    }
    
    const handleEditSubmit = async (e) => {
        e.preventDefault()
        
        if (!selectedUnit) return
        
        try {
            const response = await fetch(`/api/system-units/${selectedUnit.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify(editForm)
            })
            
            if (response.ok) {
                const updatedUnit = await response.json()
                
                // Update the unit in the systemUnits list
                setSystemUnits(prev => {
                    const newList = Array.isArray(prev.data) 
                        ? {
                            ...prev,
                            data: prev.data.map(unit => 
                                unit.id === updatedUnit.id ? updatedUnit : unit
                            )
                        }
                        : Array.isArray(prev)
                            ? prev.map(unit => unit.id === updatedUnit.id ? updatedUnit : unit)
                            : prev;
                    
                    return newList;
                });
                
                // Update the selectedUnit
                setSelectedUnit(updatedUnit)
                
                // Show success message
                alert('System unit updated successfully!');
                
                // Close the edit modal
                setEditModalOpen(false)
            } else {
                const errorData = await response.json()
                console.error('Failed to update system unit:', errorData)
                alert('Failed to update system unit. Please try again.');
            }
        } catch (err) {
            console.error('Error updating system unit:', err)
            alert('Error updating system unit: ' + err.message)
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
    const filteredUnits = Array.isArray(systemUnits?.data)
      ? systemUnits.data.filter(unit => {
          const matchesSearch = !searchTerm ||
              unit.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              unit.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (unit.brand && unit.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
              (unit.model && unit.model.toLowerCase().includes(searchTerm.toLowerCase()));

          const matchesStatus = !statusFilter || unit.status === statusFilter;
          const matchesType = !typeFilter || unit.unit_type === typeFilter;
          const matchesLocation = !locationFilter || unit.location === locationFilter;

          return matchesSearch && matchesStatus && matchesType && matchesLocation;
      }) : Array.isArray(systemUnits)
        ? systemUnits.filter(unit => {
            const matchesSearch = !searchTerm ||
                unit.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                unit.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (unit.brand && unit.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (unit.model && unit.model.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesStatus = !statusFilter || unit.status === statusFilter;
            const matchesType = !typeFilter || unit.unit_type === typeFilter;
            const matchesLocation = !locationFilter || unit.location === locationFilter;

            return matchesSearch && matchesStatus && matchesType && matchesLocation;
        }) : [];

    console.log('systemUnits', systemUnits)
    
    // Pagination calculations
    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedUnits = filteredUnits.slice(startIndex, endIndex)
    
    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page)
    }
    
    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, statusFilter, typeFilter, locationFilter])
    
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
                                <div className="text-2xl font-bold text-blue-900">{
                                  Array.isArray(systemUnits?.data)
                                    ? systemUnits.data.length
                                    : Array.isArray(systemUnits)
                                      ? systemUnits.length
                                      : 0
                                }</div>
                            </div>
                            <ComputerDesktopIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">Available</div>
                                <div className="text-2xl font-bold text-green-900">
                                    {Array.isArray(systemUnits?.data) 
                                        ? systemUnits.data.filter(u => u.status === 'available').length
                                        : Array.isArray(systemUnits)
                                            ? systemUnits.filter(u => u.status === 'available').length
                                            : 0
                                    }
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
                                    {Array.isArray(systemUnits?.data) 
                                        ? systemUnits.data.filter(u => u.status === 'assigned').length
                                        : Array.isArray(systemUnits)
                                            ? systemUnits.filter(u => u.status === 'assigned').length
                                            : 0
                                    }
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
                                    {Array.isArray(systemUnits?.data) 
                                        ? systemUnits.data.filter(u => u.unit_type === 'custom_built').length
                                        : Array.isArray(systemUnits)
                                            ? systemUnits.filter(u => u.unit_type === 'custom_built').length
                                            : 0
                                    }
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
            <ActionButtonSection />

            {/* Currency Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-800">
                            All financial values are displayed in Philippine Pesos (₱).
                        </p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300 border rounded-lg">
                    <thead className="bg-gray-50">
                        <tr>
                            <th
                                scope="col"
                                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900"
                            >
                                System Info
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Type
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                CPU
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                RAM
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Storage
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Operating System
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Status
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Location
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Station / Assignment
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredUnits.length === 0 ? (
                            <tr>
                                <td colSpan="10" className="px-6 py-8 text-center text-gray-500">
                                    {systemUnits.length === 0
                                        ? 'No system units found.'
                                        : 'No units match the current filters.'}
                                </td>
                            </tr>
                        ) : (
                            paginatedUnits.map((unit) => {
                                const specs = formatSpecifications(unit);
                                return (
                                    <tr key={unit.id} className="hover:bg-gray-50">
                                        <td className="py-4 pr-3 pl-4 text-sm">
                                            <div>
                                                <div className="font-medium text-gray-900">{unit.system_name}</div>
                                                <div className="text-gray-500">
                                                    SN: {unit.serial_number}
                                                    {unit.brand && unit.model && (
                                                        <span className="ml-2">
                                                            {unit.brand} {unit.model}
                                                        </span>
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
                                                    <div className="font-medium text-gray-900">
                                                        {unit.station.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {unit.station.type} -{' '}
                                                        {unit.assigned_to || 'Unassigned user'}
                                                    </div>
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
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="success"
                                                    size="sm"
                                                    onClick={() => handleShowQrCode(unit)}
                                                    title="View QR Code"
                                                >
                                                    <QrCodeIcon className="h-4 w-4" />
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
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleEditClick(unit)}
                                                    title="Edit Unit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
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
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Enhanced Pagination */}
                {filteredUnits.length > itemsPerPage && (
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
                                    <span className="font-semibold text-indigo-600">{Math.min(endIndex, filteredUnits.length)}</span>
                                    <span>of</span>
                                    <span className="font-semibold text-indigo-600">{filteredUnits.length}</span>
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


            {/* Details Modal */}
            <Modal isOpen={detailsModalOpen} onClose={closeDetailsModal}>
                {selectedUnit && (
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    System Unit Details - {selectedUnit.system_name}
                                </h3>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                                <div><span className="font-medium">Purchase Price:</span> ₱{parseFloat(selectedUnit.purchase_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
                                                                    ₱{parseFloat(item.unit_price || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
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

                                    {/* QR Code Section */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-3">QR Code</h4>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-600 mb-2">Scan or share this QR code to view system unit details:</p>
                                                    <p className="font-mono text-xs text-gray-500">QR Code: {selectedUnit.qr_code || 'Generating...'}</p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleShowQrCode(selectedUnit)}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <QrCodeIcon className="h-4 w-4" />
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

                                <div className="flex justify-end mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="md"
                                        onClick={closeDetailsModal}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={editModalOpen} onClose={closeEditModal}>
                {selectedUnit && (
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Edit System Unit - {selectedUnit.system_name}
                                </h3>
                                
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="system_name" className="block text-sm font-medium text-gray-700">System Name</label>
                                            <InputTextComponent
                                                id="system_name"
                                                value={editForm.system_name}
                                                onChange={(e) => setEditForm({...editForm, system_name: e.target.value})}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700">Serial Number</label>
                                            <InputTextComponent
                                                id="serial_number"
                                                value={editForm.serial_number}
                                                onChange={(e) => setEditForm({...editForm, serial_number: e.target.value})}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                                            <InputTextComponent
                                                id="brand"
                                                value={editForm.brand}
                                                onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                                            <InputTextComponent
                                                id="model"
                                                value={editForm.model}
                                                onChange={(e) => setEditForm({...editForm, model: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="operating_system" className="block text-sm font-medium text-gray-700">Operating System</label>
                                            <InputTextComponent
                                                id="operating_system"
                                                value={editForm.operating_system}
                                                onChange={(e) => setEditForm({...editForm, operating_system: e.target.value})}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                                            <SelectComponent
                                                id="status"
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                                options={[
                                                    { value: 'available', label: 'Available' },
                                                    { value: 'assigned', label: 'Assigned' }
                                                ]}
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                                            <InputTextComponent
                                                id="location"
                                                value={editForm.location}
                                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                            <textarea
                                                id="description"
                                                rows={3}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={editForm.description || ''}
                                                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
                                            <textarea
                                                id="notes"
                                                rows={2}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                value={editForm.notes || ''}
                                                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex justify-end space-x-3">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={closeEditModal}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
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

            {/* QR Code Modal */}
            <Modal isOpen={qrModalOpen} onClose={handleCloseQrModal}>
                <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">System Unit QR Code</h3>
                    {selectedUnit && (
                        <div className="flex flex-col items-center">
                            <img 
                                src={`/system-units/${selectedUnit.id}/qr-image`}
                                alt="QR Code"
                                className="w-64 h-64 mb-4"
                            />
                            <p className="text-sm text-gray-600 mb-4">{selectedUnit.system_name} - {selectedUnit.serial_number}</p>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => window.open(`/system-units/${selectedUnit.id}/qr-image?download=1`, '_blank')}
                            >
                                <ArrowDownCircleIcon className="h-4 w-4 mr-2" />
                                Download QR Code
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    )
}
