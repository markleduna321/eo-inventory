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
import { fetchMonitors, updateMonitor, deleteMonitor } from '@/app/redux/thunks/monitorThunk'
import { setCurrentMonitor, clearCurrentMonitor } from '@/app/redux/slices/monitorSlice'
import { useTableFilters } from '@/app/hooks/useTableFilters'
import { usePage } from '@inertiajs/react'

export default function MonitorTableSection() {
    const dispatch = useDispatch()
    const { auth } = usePage().props
    const { monitors, loading, error } = useSelector(state => state.monitors)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editFormData, setEditFormData] = useState({})
    const [editErrors, setEditErrors] = useState({})
    const [editLoading, setEditLoading] = useState(false)
    const [deleteId, setDeleteId] = useState(null)
    const [alert, setAlert] = useState({ show: false, type: '', message: '' })

    // Filter configuration
    const searchableFields = ['serial_number', 'brand', 'model', 'size', 'resolution', 'location', 'received_by', 'notes']
    const filterOptions = {
        brand: [
            { label: 'Dell', value: 'Dell' },
            { label: 'HP', value: 'HP' },
            { label: 'LG', value: 'LG' },
            { label: 'Samsung', value: 'Samsung' },
            { label: 'ASUS', value: 'ASUS' },
            { label: 'Acer', value: 'Acer' },
            { label: 'BenQ', value: 'BenQ' },
            { label: 'AOC', value: 'AOC' },
            { label: 'ViewSonic', value: 'ViewSonic' }
        ],
        size: [
            { label: '19"', value: '19' },
            { label: '21"', value: '21' },
            { label: '22"', value: '22' },
            { label: '23"', value: '23' },
            { label: '24"', value: '24' },
            { label: '27"', value: '27' },
            { label: '32"', value: '32' },
            { label: '34"', value: '34' },
            { label: '43"', value: '43' }
        ],
        resolution: [
            { label: '1366x768 (HD)', value: '1366x768' },
            { label: '1920x1080 (Full HD)', value: '1920x1080' },
            { label: '2560x1440 (QHD)', value: '2560x1440' },
            { label: '3840x2160 (4K)', value: '3840x2160' },
            { label: '5120x2880 (5K)', value: '5120x2880' }
        ],
        status: [
            { label: 'Working', value: 'working' },
            { label: 'Not Working', value: 'not_working' },
            { label: 'Under Repair', value: 'under_repair' },
            { label: 'Retired', value: 'retired' }
        ],
        location: [
            { label: 'Storage', value: 'storage' },
            { label: 'Office A', value: 'office_a' },
            { label: 'Office B', value: 'office_b' },
            { label: 'Conference Room', value: 'conference_room' },
            { label: 'IT Department', value: 'it_department' }
        ]
    }

    // Use the filtering hook
    const {
        searchTerm,
        filters,
        filteredData,
        filterStats,
        handleSearchChange,
        handleFilterChange,
        clearFilters
    } = useTableFilters(monitors, searchableFields, filterOptions)

    // Options for select dropdowns
    const brands = [
        { label: 'Select Brand', value: '' },
        { label: 'Dell', value: 'Dell' },
        { label: 'HP', value: 'HP' },
        { label: 'LG', value: 'LG' },
        { label: 'Samsung', value: 'Samsung' },
        { label: 'ASUS', value: 'ASUS' },
        { label: 'Acer', value: 'Acer' },
        { label: 'BenQ', value: 'BenQ' },
        { label: 'AOC', value: 'AOC' },
        { label: 'ViewSonic', value: 'ViewSonic' },
        { label: 'Other', value: 'Other' }
    ]

    const sizes = [
        { label: 'Select Size', value: '' },
        { label: '19"', value: '19' },
        { label: '21"', value: '21' },
        { label: '22"', value: '22' },
        { label: '23"', value: '23' },
        { label: '24"', value: '24' },
        { label: '27"', value: '27' },
        { label: '32"', value: '32' },
        { label: '34"', value: '34' },
        { label: '43"', value: '43' }
    ]

    const resolutions = [
        { label: 'Select Resolution', value: '' },
        { label: '1366x768 (HD)', value: '1366x768' },
        { label: '1920x1080 (Full HD)', value: '1920x1080' },
        { label: '2560x1440 (QHD)', value: '2560x1440' },
        { label: '3840x2160 (4K)', value: '3840x2160' },
        { label: '5120x2880 (5K)', value: '5120x2880' }
    ]

    const status = [
        { label: 'Select Status', value: '' },
        { label: 'Working', value: 'working' },
        { label: 'Not Working', value: 'not_working' },
        { label: 'Under Repair', value: 'under_repair' },
        { label: 'Retired', value: 'retired' }
    ]

    const locations = [
        { label: 'Select Location', value: '' },
        { label: 'Storage', value: 'storage' },
        { label: 'Office A', value: 'office_a' },
        { label: 'Office B', value: 'office_b' },
        { label: 'Conference Room', value: 'conference_room' },
        { label: 'IT Department', value: 'it_department' }
    ]

    useEffect(() => {
        dispatch(fetchMonitors())
    }, [dispatch])

    const handleEdit = (monitor) => {
        setEditFormData({
            id: monitor.id,
            serial_number: monitor.serial_number,
            brand: monitor.brand,
            model: monitor.model,
            size: monitor.size,
            resolution: monitor.resolution,
            refresh_rate: monitor.refresh_rate || '',
            status: monitor.status,
            location: monitor.location,
            received_by: monitor.received_by,
            notes: monitor.notes || ''
        })
        dispatch(setCurrentMonitor(monitor))
        setIsEditModalOpen(true)
    }

    const handleEditInputChange = (e) => {
        const { name, value } = e.target
        setEditFormData(prev => ({ ...prev, [name]: value }))
        if (editErrors[name]) {
            setEditErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        setEditLoading(true)
        setEditErrors({})

        try {
            const { id, ...updateData } = editFormData
            await dispatch(updateMonitor({ id, monitorData: updateData })).unwrap()
            setAlert({ 
                show: true, 
                type: 'success', 
                message: 'Monitor updated successfully!' 
            })
            setTimeout(() => {
                closeEditModal()
            }, 1500)
        } catch (error) {
            console.error('Error updating monitor:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error || 'Failed to update monitor' 
            })
        } finally {
            setEditLoading(false)
        }
    }

    const closeEditModal = () => {
        setIsEditModalOpen(false)
        setEditFormData({})
        setEditErrors({})
        setAlert({ show: false, type: '', message: '' })
        dispatch(clearCurrentMonitor())
    }

    const handleDeleteClick = (id) => {
        setDeleteId(id)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteConfirm = async () => {
        try {
            await dispatch(deleteMonitor(deleteId)).unwrap()
            setAlert({ 
                show: true, 
                type: 'success', 
                message: 'Monitor deleted successfully!' 
            })
            setIsDeleteModalOpen(false)
            setDeleteId(null)
        } catch (error) {
            console.error('Error deleting monitor:', error)
            setAlert({ 
                show: true, 
                type: 'error', 
                message: error || 'Failed to delete monitor' 
            })
        }
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            working: 'bg-green-100 text-green-800',
            not_working: 'bg-red-100 text-red-800',
            under_repair: 'bg-yellow-100 text-yellow-800',
            retired: 'bg-gray-100 text-gray-800'
        }
        
        return (
            <span className={`${statusConfig[status]} text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm`}>
                {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        )
    }

    if (loading && monitors.length === 0) {
        return <div className="text-center py-4">Loading monitors...</div>
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
                placeholder="Search monitors by serial number, brand, model, size..."
            />

            {/* Results Summary */}
            {filterStats.isFiltered && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                        Showing {filterStats.filtered} of {filterStats.total} monitors
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
                            <Button
                                type='button'
                                variant='primary'
                                size='sm'>
                                <PrinterIcon className='h-4' />
                            </Button>
                            <Button
                            type='button'
                            variant='success'
                            size='sm'>
                            <ArrowDownCircleIcon className='h-4' />
                        </Button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-300 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    Serial Number
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Brand
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Model
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Size
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Resolution
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Location
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Received By
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-gray-500">
                                        {filterStats.isFiltered ? 'No monitors match your search criteria' : 'No monitors found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((monitor) => (
                                    <tr key={monitor.id}>
                                        <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                            {monitor.serial_number}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.brand}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.model}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.size}"
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.resolution}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {getStatusBadge(monitor.status)}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.location.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {monitor.received_by}
                                        </td>
                                        <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleEdit(monitor)}
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="danger"
                                                    size="sm"
                                                    onClick={() => handleDeleteClick(monitor.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

            {/* Edit Monitor Modal */}
            <Modal isOpen={isEditModalOpen} onClose={closeEditModal}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                            <h3 className="text-base font-semibold text-gray-900" id="modal-title">
                                Edit Monitor
                            </h3>
                            
                            {alert.show && (
                                <Alert 
                                    type={alert.type} 
                                    message={alert.message} 
                                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                                />
                            )}
                            
                            <div className="mt-2">
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit_brand" className="block text-sm font-medium text-gray-700 mb-1">
                                                Brand *
                                            </label>
                                            <SelectComponent
                                                id="edit_brand"
                                                name="brand"
                                                options={brands}
                                                value={editFormData.brand}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.brand && <InputError message={editErrors.brand} />}
                                        </div>
                                        <div>
                                            <label htmlFor="edit_model" className="block text-sm font-medium text-gray-700 mb-1">
                                                Model *
                                            </label>
                                            <InputTextComponent
                                                id="edit_model"
                                                name="model"
                                                type="text"
                                                placeholder="e.g. U2419H, 24GL600F"
                                                value={editFormData.model}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.model && <InputError message={editErrors.model} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit_serial_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Serial Number *
                                            </label>
                                            <InputTextComponent
                                                id="edit_serial_number"
                                                name="serial_number"
                                                type="text"
                                                placeholder="e.g. MNT123456789"
                                                value={editFormData.serial_number}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.serial_number && <InputError message={editErrors.serial_number} />}
                                        </div>
                                        <div>
                                            <label htmlFor="edit_size" className="block text-sm font-medium text-gray-700 mb-1">
                                                Screen Size *
                                            </label>
                                            <SelectComponent
                                                id="edit_size"
                                                name="size"
                                                options={sizes}
                                                value={editFormData.size}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.size && <InputError message={editErrors.size} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit_resolution" className="block text-sm font-medium text-gray-700 mb-1">
                                                Resolution *
                                            </label>
                                            <SelectComponent
                                                id="edit_resolution"
                                                name="resolution"
                                                options={resolutions}
                                                value={editFormData.resolution}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.resolution && <InputError message={editErrors.resolution} />}
                                        </div>
                                        <div>
                                            <label htmlFor="edit_refresh_rate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Refresh Rate (Hz)
                                            </label>
                                            <InputTextComponent
                                                id="edit_refresh_rate"
                                                name="refresh_rate"
                                                type="number"
                                                placeholder="60"
                                                value={editFormData.refresh_rate}
                                                onChange={handleEditInputChange}
                                            />
                                            {editErrors.refresh_rate && <InputError message={editErrors.refresh_rate} />}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="edit_status" className="block text-sm font-medium text-gray-700 mb-1">
                                                Current Status *
                                            </label>
                                            <SelectComponent
                                                id="edit_status"
                                                name="status"
                                                options={status}
                                                value={editFormData.status}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.status && <InputError message={editErrors.status} />}
                                        </div>
                                        <div>
                                            <label htmlFor="edit_location" className="block text-sm font-medium text-gray-700 mb-1">
                                                Location *
                                            </label>
                                            <SelectComponent
                                                id="edit_location"
                                                name="location"
                                                options={locations}
                                                value={editFormData.location}
                                                onChange={handleEditInputChange}
                                                required
                                            />
                                            {editErrors.location && <InputError message={editErrors.location} />}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="edit_notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            id="edit_notes"
                                            name="notes"
                                            rows={3}
                                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                            placeholder="Additional notes about the monitor..."
                                            value={editFormData.notes}
                                            onChange={handleEditInputChange}
                                        />
                                        {editErrors.notes && <InputError message={editErrors.notes} />}
                                    </div>

                                    {/* Buttons */}
                                    <div className='flex float-end gap-2 mt-4'>
                                        <Button
                                            type='submit'
                                            variant='primary'
                                            size='md'
                                            disabled={editLoading}
                                        >
                                            {editLoading ? 'Updating...' : 'Update'}
                                        </Button>

                                        <Button
                                            type='button'
                                            variant='danger'
                                            size='md'
                                            onClick={closeEditModal}
                                            disabled={editLoading}
                                        >
                                            Cancel
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
                onConfirm={handleDeleteConfirm}
                title="Delete Monitor"
                message="Are you sure you want to delete this monitor? This action cannot be undone."
            />
        </div>
    )
}
