import Button from '@/app/pages/components/button'
import { ArrowDownCircleIcon, PrinterIcon } from '@heroicons/react/24/outline'
import React from 'react'

const people = [
    { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
    // More people...
]

export default function DeviceTableSection() {
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
                                    Device Type
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Brand
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Model
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Software
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Status
                                </th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                    Issued to
                                </th>
                                <th scope="col" className="relative py-3.5 pr-4 pl-3 sm:pr-6">
                                    <span className="sr-only">Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {people.map((person) => (
                                <tr key={person.email}>
                                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-6">
                                        {person.name}
                                    </td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{person.title}</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{person.email}</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{person.role}</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{person.role}</td>
                                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">{person.role}</td>
                                    <td className="relative py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-6">
                                        <a href="#" className="text-indigo-600 hover:text-indigo-900">
                                            Edit<span className="sr-only">, {person.name}</span>
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    )
}
