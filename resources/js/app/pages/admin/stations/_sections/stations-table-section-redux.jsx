import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Button from '@/app/pages/components/button'
import Modal from '@/app/pages/components/modal'
import TableFilter from '@/app/pages/components/table-filter'
import InputTextComponent from '@/app/pages/components/input-text-component'
import SelectComponent from '@/app/pages/components/input-select'
import InputError from '@/app/pages/components/InputError'
import Alert from '@/app/pages/components/alert'
import DeleteConfirmationModal from '@/app/pages/components/delete-confirmation-modal'
import { ArrowDownCircleIcon, PrinterIcon, PencilIcon, TrashIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { fetchStations, updateStation, deleteStation, fetchAvailableMonitors, fetchStationLocations } from '@/app/redux/thunks/stationThunk'
import { setCurrentStation, clearCurrentStation } from '@/app/redux/slices/stationSlice'
import { useTableFilters } from '@/app/hooks/useTableFilters'

export default function StationsTableSection() {
    const dispatch = useDispatch()
    const { stations, availableMonitors, locations, loading, error } = useSelector(state => state.stations)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({})
    const [editErrors, setEditErrors] = useState({})
    const [editLoading, setEditLoading] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })

    // Filter configuration
    const searchableFields = ['name', 'code', 'type', 'department', 'assigned_user', 'location_name']
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
        { label: 'Select Status', value: '' },
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
        { label: 'Maintenance', value: 'maintenance' }
    ]

    useEffect(() => {
        dispatch(fetchStations())
    }, [dispatch])

    const handleEdit = (station) => {
        setEditFormData({
            ...station,
            assigned_monitors: station.station_assets
                ? station.station_assets.filter(asset => asset.asset_type === 'monitor').map(asset => asset.asset_id)
                : []
        })
        setIsEditModalOpen(true)
        setEditErrors({})
        // Fetch fresh data for editing
        dispatch(fetchAvailableMonitors())
        dispatch(fetchStationLocations())
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setEditFormData({})
        setEditErrors({})
        setEditLoading(false)
        dispatch(clearCurrentStation())
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        setEditErrors({})

        try {
            await dispatch(updateStation({ 
                id: editFormData.id, 
                data: editFormData 
            })).unwrap()
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Station updated successfully!'
            })
            handleCloseEdit()
        } catch (error) {
            setEditErrors({ general: error })
            setAlert({
                show: true,
                type: 'error',
                message: error
            })
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

    const handleMonitorSelection = (monitorId) => {
        setEditFormData(prev => ({
            ...prev,
            assigned_monitors: prev.assigned_monitors.includes(monitorId)
                ? prev.assigned_monitors.filter(id => id !== monitorId)
                : [...prev.assigned_monitors, monitorId]
        }))
    }

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
        ...(editFormData.assigned_monitors || []).map(id => 
            stations.find(s => s.id === editFormData.id)?.monitors?.find(m => m.id === id)
        ).filter(Boolean)
    ]

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
                placeholder="Search stations by name, code, type, department, user..."
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
                                    filteredData.map((station) => (
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
                                                <div className="flex items-center">
                                                    <ComputerDesktopIcon className="w-4 h-4 mr-1" />
                                                    <span>{station.monitors_count || 0} monitors</span>
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {station.assets_count || 0} total assets
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
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={handleCloseEdit}
            >
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Edit Station
                            </h3>
                            
                            <div className="mt-2">
                                <form onSubmit={handleEditSubmit} className="space-y-6">
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

                                    {/* Monitor Assignment Section */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Assign Monitors
                                        </label>
                                        <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                                            {allAvailableMonitors.length > 0 ? (
                                                allAvailableMonitors.map(monitor => (
                                                    <div key={monitor.id} className="flex items-center mb-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`edit-monitor-${monitor.id}`}
                                                            checked={(editFormData.assigned_monitors || []).includes(monitor.id)}
                                                            onChange={() => handleMonitorSelection(monitor.id)}
                                                            className="mr-2"
                                                        />
                                                        <label htmlFor={`edit-monitor-${monitor.id}`} className="text-sm">
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
                                            onClick={handleCloseEdit}
                                            disabled={editLoading}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            variant="primary"
                                            disabled={editLoading}
                                        >
                                            {editLoading ? 'Updating...' : 'Update Station'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Station"
                message="Are you sure you want to delete this station? This will unassign all assets and cannot be undone."
            />
        </div>
    )
}
