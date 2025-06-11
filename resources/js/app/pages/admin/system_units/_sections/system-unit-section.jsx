import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, EyeDropperIcon, EyeIcon, PrinterIcon } from '@heroicons/react/24/outline'
import React from 'react'

export default function SystemUnitTableSection() {
    return (
        <div className="mt-8 flow-root bg-white p-5 rounded-lg">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className=" flex float-end mb-4 gap-2">
                        <Button
                            type='button'
                            variant='primary'
                            size='sm'>
                            <PrinterIcon className='h-4'/>
                        </Button>
                        <Button
                            type='button'
                            variant='success'
                            size='sm'>
                            <ArrowDownCircleIcon className='h-4'/>
                        </Button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-300 border">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    SN
                                </th>
                                <th scope="col" className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                    CPU
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    RAM
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Motherboard
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Storage
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Operating System
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
                            
                                <tr >
                                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                        #4353452
                                    </td>
                                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                        Intel Core i7 8th Gen
                                    </td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">8 GB</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">B450m</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">500 GB</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">Windows 10</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                                        <span class="bg-green-100 text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm dark:bg-green-900 dark:text-green-300">
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
