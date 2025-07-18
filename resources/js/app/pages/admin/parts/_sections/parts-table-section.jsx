import React from 'react'
import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, PrinterIcon } from '@heroicons/react/24/outline'

export default function PartsTableSection() {
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
                                    Part #
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
                                    Quantity
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Condition
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Location
                                </th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {/* Sample data rows */}
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/parts/1`} className="text-indigo-600 hover:text-indigo-900">#PRT-001</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    RAM
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Kingston</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">ValueRAM 8GB DDR4</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">5</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
                                        New
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
                                        Available
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Storage Room A</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PRT-001</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/parts/2`} className="text-indigo-600 hover:text-indigo-900">#PRT-002</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    SSD
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Samsung</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">980 EVO 1TB</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">3</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
                                        New
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-yellow-900 dark:text-yellow-300">
                                        Reserved
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">IT Department</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PRT-002</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/parts/3`} className="text-indigo-600 hover:text-indigo-900">#PRT-003</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    Graphics Card
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">NVIDIA</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">GTX 1650</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">1</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
                                        Good
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-gray-700 dark:text-gray-300">
                                        In Use
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Repair Center</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PRT-003</span>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    <a href={`/admin/parts/4`} className="text-indigo-600 hover:text-indigo-900">#PRT-004</a>
                                </td>
                                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                    Cable
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Generic</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">HDMI 2.0 Cable 6ft</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">15</td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-blue-900 dark:text-blue-300">
                                        New
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                    <span className="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
                                        Available
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Storage Room B</td>
                                <td className="relative py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                        Edit<span className="sr-only">, PRT-004</span>
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
