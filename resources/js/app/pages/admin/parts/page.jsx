import React from 'react'
import AdminLayout from '../layout'
import PartsTableSection from './_sections/parts-table-section'
import CreatePartsSection from './_sections/create-parts-section'

export default function PartsAndAccessoriesPage() {
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center">

                    <div className="sm:flex-auto">

                        <h1 className="text-base font-semibold text-gray-900">Parts and Accessories</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the parts and accessories in your organization.
                        </p>

                    </div>

                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <CreatePartsSection />
                    </div>

                </div>

                <div className='shadow-md'>
                    <PartsTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
