import React from 'react'
import AdminLayout from '../layout'
import CreatePurchaseRequestSection from './_sections/create-purchase-request-section'
import PurchaseRequestsTableSection from './_sections/purchase-requests-table-section'

export default function PurchaseRequestPage() {
    return (
        <AdminLayout>
            <div>
                <div className='bg-white shadow-md rounded-md p-4'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Purchase Requests</h1>
                            <p className='text-gray-600 mt-1'>Manage purchase requests for new assets and equipment</p>
                        </div>
                        <CreatePurchaseRequestSection />
                    </div>
                </div>
                <PurchaseRequestsTableSection />
            </div>
        </AdminLayout>
    )
}
