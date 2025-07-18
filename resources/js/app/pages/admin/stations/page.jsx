import React from 'react'
import AdminLayout from '../layout'
import CreateStationsSection from './_sections/create-stations-section'
import StationsTableSection from './_sections/stations-table-section'

export default function StationsPage() {
    return (
        <AdminLayout>
            <div>
                <div className='bg-white shadow-md rounded-md p-4'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Workstations</h1>
                            <p className='text-gray-600 mt-1'>Manage employee workstations and desk assignments</p>
                        </div>
                        <CreateStationsSection />
                    </div>
                </div>
                <StationsTableSection />
            </div>
        </AdminLayout>
    )
}
