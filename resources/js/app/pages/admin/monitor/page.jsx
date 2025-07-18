import React from 'react'
import AdminLayout from '../layout'
import MonitorTableSection from './_sections/monitor-table-section'
import CreateMonitorsSection from './_sections/create-monitors-section'

export default function MonitorPage() {
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center">

                    <div className="sm:flex-auto">

                        <h1 className="text-base font-semibold text-gray-900">Monitors</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the monitors in your organization.
                        </p>

                    </div>

                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <CreateMonitorsSection />
                    </div>

                </div>

                <div className='shadow-md'>
                    <MonitorTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
