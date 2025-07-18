import React from 'react'
import AdminLayout from '../layout'
import CreateRequestSection from './_sections/create-request-section'
import RequestsTableSection from './_sections/requests-table-section'

export default function RequestItemPage() {
    return (
        <AdminLayout>
            <div>
                <div className='bg-white shadow-md rounded-md p-4'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Asset Requests</h1>
                            <p className='text-gray-600 mt-1'>Manage employee asset requests and approvals</p>
                        </div>
                        <CreateRequestSection />
                    </div>
                </div>
                <RequestsTableSection />
            </div>
        </AdminLayout>
    )
}
