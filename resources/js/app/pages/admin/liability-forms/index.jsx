import React, { useState } from 'react'
import AdminLayout from '../layout'
import { Link } from '@inertiajs/react'
import { DocumentTextIcon, EyeIcon, UserIcon, ComputerDesktopIcon, CalendarDaysIcon, PlusIcon, LinkIcon } from '@heroicons/react/24/outline'
import Button from '@/app/pages/components/button'

export default function LiabilityFormsIndex({ liabilityForms }) {
    const [searchTerm, setSearchTerm] = useState('')

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const filteredForms = liabilityForms.data?.filter(form =>
        (form.employee_name && form.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device_request?.device?.brand && form.device_request.device.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device_request?.device?.model && form.device_request.device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device_request?.device?.asset_tag && form.device_request.device.asset_tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device?.brand && form.device.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device?.model && form.device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.device?.asset_tag && form.device.asset_tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (form.required_employee_id && form.required_employee_id.toLowerCase().includes(searchTerm.toLowerCase()))
    ) || []

    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="sm:flex sm:items-center mb-6">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold text-gray-900">Liability Forms</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            View all signed device liability agreements and create public forms for employees
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <Link href="/admin/liability-forms/create-public">
                            <Button variant="primary" size="md">
                                <PlusIcon className="w-4 h-4 mr-2" />
                                Create Agreement
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-600">Total Forms</div>
                                <div className="text-2xl font-bold text-blue-900">{liabilityForms.total || 0}</div>
                            </div>
                            <DocumentTextIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">Signed Today</div>
                                <div className="text-2xl font-bold text-green-900">
                                    {liabilityForms.data?.filter(form => 
                                        new Date(form.created_at).toDateString() === new Date().toDateString()
                                    ).length || 0}
                                </div>
                            </div>
                            <CalendarDaysIcon className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-purple-600">Public Agreements</div>
                                <div className="text-2xl font-bold text-purple-900">
                                    {liabilityForms.data?.filter(form => form.is_public_form).length || 0}
                                </div>
                            </div>
                            <LinkIcon className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="max-w-md">
                        <input
                            type="text"
                            placeholder="Search by employee name, device, or asset tag..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Liability Forms Table */}
                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        {filteredForms.length === 0 ? (
                            <div className="text-center py-12">
                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No liability forms found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {searchTerm ? 'Try adjusting your search terms.' : 'Liability forms will appear here once device requests are approved and signed.'}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Employee
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Device
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Signed Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredForms.map((form) => (
                                            <tr key={form.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {form.employee_name || (form.is_public_form ? 'Pending Completion' : 'Unknown Employee')}
                                                            </div>
                                                            {(form.employee_id || form.required_employee_id) && (
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {form.employee_id || form.required_employee_id}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <ComputerDesktopIcon className="w-5 h-5 text-gray-400 mr-3" />
                                                        <div>
                                                            {form.device_request?.device ? (
                                                                <>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {form.device_request.device.brand} {form.device_request.device.model}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {form.device_request.device.asset_tag}
                                                                    </div>
                                                                </>
                                                            ) : form.device ? (
                                                                <>
                                                                    <div className="text-sm font-medium text-gray-900">
                                                                        {form.device.brand} {form.device.model}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {form.device.asset_tag}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div className="text-sm text-gray-500">Device info unavailable</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {form.is_public_form ? (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                                <LinkIcon className="w-3 h-3 mr-1" />
                                                                Public Agreement
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                <DocumentTextIcon className="w-3 h-3 mr-1" />
                                                                Standard Agreement
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {form.is_public_form ? (
                                                            form.completed_at ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    Completed
                                                                </span>
                                                            ) : form.accessed_at ? (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    In Progress
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                    Pending
                                                                </span>
                                                            )
                                                        ) : (
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Signed
                                                            </span>
                                                        )}
                                                    </div>
                                                    {form.department && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {form.department} {form.position && `• ${form.position}`}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(form.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <Link href={`/admin/liability-forms/${form.id}`}>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="inline-flex items-center"
                                                            >
                                                                <EyeIcon className="w-4 h-4 mr-1" />
                                                                View
                                                            </Button>
                                                        </Link>
                                                        {form.is_public_form && !form.completed_at && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    const url = `/liability-form/${form.public_token}`
                                                                    navigator.clipboard.writeText(window.location.origin + url)
                                                                    alert('Agreement link copied to clipboard!')
                                                                }}
                                                            >
                                                                <LinkIcon className="w-4 h-4 mr-1" />
                                                                Copy Link
                                                            </Button>
                                                        )}
                                                        {form.completed_at && (
                                                            <Link href={`/admin/liability-forms/${form.id}/download`}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    Download
                                                                </Button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pagination */}
                {liabilityForms.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {liabilityForms.prev_page_url && (
                                <Link href={liabilityForms.prev_page_url}>
                                    <Button variant="outline" size="sm">Previous</Button>
                                </Link>
                            )}
                            {liabilityForms.next_page_url && (
                                <Link href={liabilityForms.next_page_url}>
                                    <Button variant="outline" size="sm">Next</Button>
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{liabilityForms.from || 0}</span> to{' '}
                                    <span className="font-medium">{liabilityForms.to || 0}</span> of{' '}
                                    <span className="font-medium">{liabilityForms.total || 0}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {liabilityForms.prev_page_url && (
                                        <Link href={liabilityForms.prev_page_url}>
                                            <Button variant="outline" size="sm">Previous</Button>
                                        </Link>
                                    )}
                                    {liabilityForms.next_page_url && (
                                        <Link href={liabilityForms.next_page_url}>
                                            <Button variant="outline" size="sm">Next</Button>
                                        </Link>
                                    )}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}
