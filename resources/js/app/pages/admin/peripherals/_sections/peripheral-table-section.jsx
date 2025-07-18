import React from 'react'
import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, PrinterIcon } from '@heroicons/react/24/outline'

export default function PeripheralTableSection() {
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
                                    Type
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Brand
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Model
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
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {/* Sample data row */}
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/peripherals/1`} className="text-indigo-600 hover:text-indigo-900">#PER-001</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    Keyboard
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Logitech</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">MX Keys</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
                                        Working
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Office A</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">John Doe</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PER-001</span>
                                    </a>
                                </td>
                            </tr>
                            {/* Additional sample row */}
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/peripherals/2`} className="text-indigo-600 hover:text-indigo-900">#PER-002</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    Mouse
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Microsoft</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Surface Mouse</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-yellow-900 dark:text-yellow-300">
                                        Under Repair
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">IT Department</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Jane Smith</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PER-002</span>
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
