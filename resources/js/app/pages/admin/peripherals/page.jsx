import React from 'react'
import AdminLayout from '../layout'
import PeripheralTableSection from './_sections/peripheral-table-section'
import CreatePeripheralsSection from './_sections/create-peripherals-section'

export default function PeripheralsPage() {
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center">

                    <div className="sm:flex-auto">

                        <h1 className="text-base font-semibold text-gray-900">Peripherals</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the peripherals in your organization.
                        </p>

                    </div>

                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <CreatePeripheralsSection />
                    </div>

                </div>

                <div className='shadow-md'>
                    <PeripheralTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
