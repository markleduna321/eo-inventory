import React from 'react'
import AdminLayout from '../layout'
import SystemUnitTableSection from './_sections/system-unit-section'

export default function SystemUnitPage() {
  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">

        <div className="sm:flex sm:items-center">

          <div className="sm:flex-auto">

            <h1 className="text-base font-semibold text-gray-900">Devices</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all the devices in your organization.
            </p>

          </div>

          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            
          </div>

        </div>

        <div className=' shadow-md'>
          <SystemUnitTableSection/>
        </div>

      </div>
    </AdminLayout>
  )
}
