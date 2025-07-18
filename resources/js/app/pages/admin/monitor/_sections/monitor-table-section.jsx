import React from 'react'
import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, PrinterIcon } from '@heroicons/react/24/outline'

export default function MonitorTableSection() {
  return (
    <div className="mt-8 flow-root bg-white p-5 rounded-lg">
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
                  SN
                </th>
                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                  <a href={`/admin/monitor/1`} className="text-indigo-600 hover:text-indigo-900">#MNT-001</a>
                </td>
                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                  Dell
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">U2419H</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">24"</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">1920x1080</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
                    Working
                  </span>
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Storage</td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Quickly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
