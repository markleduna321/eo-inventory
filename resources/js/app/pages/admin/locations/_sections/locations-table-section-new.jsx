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
import { ArrowDownCircleIcon, PrinterIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { fetchLocations, updateLocation, deleteLocation } from '@/app/redux/thunks/locationThunk'
import { setCurrentLocation, clearCurrentLocation } from '@/app/redux/slices/locationSlice'
import { useTableFilters } from '@/app/hooks/useTableFilters'

export default function LocationsTableSection() {
    const dispatch = useDispatch()
    const { locations, loading, error } = useSelector(state => state.locations)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({})
    const [editErrors, setEditErrors] = useState({})
    const [editLoading, setEditLoading] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })

    // Filter configuration
    const searchableFields = ['name', 'code', 'type', 'building', 'floor', 'room', 'manager']
    const filterOptions = {
        type: [
            { label: 'Office', value: 'Office' },
            { label: 'Conference', value: 'Conference' },
            { label: 'Storage', value: 'Storage' },
            { label: 'Data Center', value: 'Data Center' },
            { label: 'Laboratory', value: 'Laboratory' },
            { label: 'Workshop', value: 'Workshop' },
            { label: 'Other', value: 'Other' }
        ],
        status: [
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' },
            { label: 'Under Maintenance', value: 'Under Maintenance' }
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
    } = useTableFilters(locations, searchableFields, filterOptions, 'created_at')

    // Options for select dropdowns
    const typeOptions = [
        { label: 'Select Type', value: '' },
        { label: 'Office', value: 'Office' },
        { label: 'Conference', value: 'Conference' },
        { label: 'Storage', value: 'Storage' },
        { label: 'Data Center', value: 'Data Center' },
        { label: 'Laboratory', value: 'Laboratory' },
        { label: 'Workshop', value: 'Workshop' },
        { label: 'Other', value: 'Other' }
    ]

    const statusOptions = [
        { label: 'Select Status', value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Under Maintenance', value: 'Under Maintenance' }
    ]

    useEffect(() => {
        dispatch(fetchLocations())
    }, [dispatch])

    const handleEdit = (location) => {
        setEditFormData({
            ...location,
            contact_info: location.contact_info || {}
        })
        setIsEditModalOpen(true)
        setEditErrors({})
    }

    const handleCloseEdit = () => {
        setIsEditModalOpen(false)
        setEditFormData({})
        setEditErrors({})
        setEditLoading(false)
        dispatch(clearCurrentLocation())
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        setEditErrors({})

        try {
            await dispatch(updateLocation({ 
                id: editFormData.id, 
                data: editFormData 
            })).unwrap()
            
            setAlert({
                show: true,
                type: 'success',
                message: 'Location updated successfully!'
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
            await dispatch(deleteLocation(deleteId)).unwrap()
            setAlert({
                show: true,
                type: 'success',
                message: 'Location deleted successfully!'
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

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
            'Inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
            'Under Maintenance': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
        }
        
        return (
            <span className={`text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        )
    }

    const getUtilizationBadge = (current, capacity) => {
        const percentage = capacity > 0 ? (current / capacity) * 100 : 0
        let colorClass = 'bg-green-100 text-green-800'
        
        if (percentage >= 90) {
            colorClass = 'bg-red-100 text-red-800'
        } else if (percentage >= 75) {
            colorClass = 'bg-yellow-100 text-yellow-800'
        }
        
        return (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-sm ${colorClass}`}>
                {current}/{capacity} ({percentage.toFixed(1)}%)
            </span>
        )
    }

    if (loading) {
        return (
            <div className="mt-8 flow-root bg-white p-5 rounded-lg">
                <div className="text-center py-8">
                    <div className="text-gray-500">Loading locations...</div>
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
                placeholder="Search locations by name, code, type, building..."
                showDateRange={true}
                dateRangeLabel="Created Date"
            />

            {/* Results Summary */}
            {filterStats.isFiltered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        Showing {filterStats.filtered} of {filterStats.total} locations
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
                                        Name & Code
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Type
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Location
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Capacity
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Manager
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
                                    filteredData.map((location) => (
                                        <tr key={location.id}>
                                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{location.name}</div>
                                                        <div className="text-gray-500">{location.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {location.type}
                                                </span>
                                            </td>
                                            <td className="px-3 py-4 text-sm text-gray-500">
                                                <div className="text-gray-900">{location.building}</div>
                                                <div className="text-gray-500">{location.floor}, {location.room}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getUtilizationBadge(location.current_items, location.capacity)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {location.manager || 'Not assigned'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                {getStatusBadge(location.status)}
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => handleEdit(location)}
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteConfirm(location.id)}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                            {searchTerm || Object.values(filters).some(v => v) ? 
                                                'No locations found matching your criteria.' : 
                                                'No locations available.'
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
                open={isEditModalOpen}
                onClose={handleCloseEdit}
                title="Edit Location"
                size="large"
            >
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    {editErrors.general && (
                        <Alert type="error" message={editErrors.general} />
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Name *
                            </label>
                            <InputTextComponent
                                value={editFormData.name || ''}
                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                placeholder="Enter location name"
                                required
                            />
                            {editErrors.name && <InputError message={editErrors.name} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location Code *
                            </label>
                            <InputTextComponent
                                value={editFormData.code || ''}
                                onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                                placeholder="Enter location code"
                                required
                            />
                            {editErrors.code && <InputError message={editErrors.code} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type *
                            </label>
                            <SelectComponent
                                value={editFormData.type || ''}
                                onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                                options={typeOptions}
                                required
                            />
                            {editErrors.type && <InputError message={editErrors.type} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Building *
                            </label>
                            <InputTextComponent
                                value={editFormData.building || ''}
                                onChange={(e) => setEditFormData({...editFormData, building: e.target.value})}
                                placeholder="Enter building name"
                                required
                            />
                            {editErrors.building && <InputError message={editErrors.building} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Floor *
                            </label>
                            <InputTextComponent
                                value={editFormData.floor || ''}
                                onChange={(e) => setEditFormData({...editFormData, floor: e.target.value})}
                                placeholder="Enter floor"
                                required
                            />
                            {editErrors.floor && <InputError message={editErrors.floor} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room *
                            </label>
                            <InputTextComponent
                                value={editFormData.room || ''}
                                onChange={(e) => setEditFormData({...editFormData, room: e.target.value})}
                                placeholder="Enter room number/name"
                                required
                            />
                            {editErrors.room && <InputError message={editErrors.room} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity *
                            </label>
                            <InputTextComponent
                                type="number"
                                value={editFormData.capacity || ''}
                                onChange={(e) => setEditFormData({...editFormData, capacity: parseInt(e.target.value) || 0})}
                                placeholder="Enter capacity"
                                min="1"
                                required
                            />
                            {editErrors.capacity && <InputError message={editErrors.capacity} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Items
                            </label>
                            <InputTextComponent
                                type="number"
                                value={editFormData.current_items || ''}
                                onChange={(e) => setEditFormData({...editFormData, current_items: parseInt(e.target.value) || 0})}
                                placeholder="Enter current items count"
                                min="0"
                            />
                            {editErrors.current_items && <InputError message={editErrors.current_items} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Manager
                            </label>
                            <InputTextComponent
                                value={editFormData.manager || ''}
                                onChange={(e) => setEditFormData({...editFormData, manager: e.target.value})}
                                placeholder="Enter manager name"
                            />
                            {editErrors.manager && <InputError message={editErrors.manager} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <SelectComponent
                                value={editFormData.status || 'Active'}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                            value={editFormData.description || ''}
                            onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                            placeholder="Enter location description"
                        />
                        {editErrors.description && <InputError message={editErrors.description} />}
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
                            {editLoading ? 'Updating...' : 'Update Location'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Location"
                message="Are you sure you want to delete this location? This action cannot be undone."
            />
        </div>
    )
}
