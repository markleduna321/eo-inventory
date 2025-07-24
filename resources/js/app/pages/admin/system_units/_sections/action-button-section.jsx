import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, CameraIcon, PrinterIcon } from '@heroicons/react/24/outline'
import React from 'react'
import { useEffect } from 'react'
import { useState } from 'react'

export default function ActionButtonSection() {

    const [systemUnits, setSystemUnits] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Modal states
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [detailsModalOpen, setDetailsModalOpen] = useState(false)
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

    const fetchSystemUnits = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/system-units', { headers: { Accept: 'application/json' } })
            if (!res.ok) throw new Error('Failed to fetch system units')
            const data = await res.json()
            setSystemUnits(data)
        } catch (err) {
            setError(err.message)
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

    const closeDetailsModal = () => {
        setSelectedUnit(null)
        setDetailsModalOpen(false)
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
    const filteredUnits = systemUnits?.data?.filter(unit => {
        const matchesSearch = !searchTerm ||
            unit.system_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            unit.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (unit.brand && unit.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (unit.model && unit.model.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = !statusFilter || unit.status === statusFilter;
        const matchesType = !typeFilter || unit.unit_type === typeFilter;
        const matchesLocation = !locationFilter || unit.location === locationFilter;

        return matchesSearch && matchesStatus && matchesType && matchesLocation;
    }) || [];

    console.log('systemUnits', systemUnits)
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
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-gray-600">
                    Showing {filteredUnits.length} of {systemUnits.length} system units
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <PrinterIcon className='h-4 w-4 mr-1' />
                        Print
                    </Button>
                    <Button variant="outline" size="sm" onClick={openScannerModal}>
                        <CameraIcon className='h-4 w-4 mr-1' />
                        Scan QR
                    </Button>
                    <Button variant="success" size="sm">
                        <ArrowDownCircleIcon className='h-4 w-4 mr-1' />
                        Export
                    </Button>
                    <Button variant="primary" size="sm" onClick={fetchSystemUnits}>
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    )
}
