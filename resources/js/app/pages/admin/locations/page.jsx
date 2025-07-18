import React from 'react'
import AdminLayout from '../layout'
import CreateLocationsSection from './_sections/create-locations-section'
import LocationsTableSection from './_sections/locations-table-section'

export default function LocationsPage() {
    return (
        <AdminLayout>
            <div>
                <div className='bg-white shadow-md rounded-md p-4'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Locations</h1>
                            <p className='text-gray-600 mt-1'>Manage office locations and storage areas</p>
                        </div>
                        <CreateLocationsSection />
                    </div>
                </div>
                <LocationsTableSection />
            </div>
        </AdminLayout>
    )
}
