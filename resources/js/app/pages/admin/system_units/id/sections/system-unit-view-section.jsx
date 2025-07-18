import { ArrowDownCircleIcon, BuildingLibraryIcon, CheckCircleIcon, CircleStackIcon, ComputerDesktopIcon, CpuChipIcon, DeviceTabletIcon, HashtagIcon, IdentificationIcon, MapPinIcon, PaperClipIcon, ServerStackIcon, UserIcon } from '@heroicons/react/24/outline'
import React from 'react'

export default function SystemUnitViewSection() {
    return (
        <div>
            <div className="px-4 sm:px-0">
                <h3 className="text-2xl font-semibold text-gray-900">System Unit Information</h3>
                <p className="mt-1 max-w-2xl text-sm/6 text-gray-500">Full spicifications and other details</p>
            </div>
            <div className="mt-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2">
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0"> 
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><IdentificationIcon className="h-6 w-6 text-blue-500" /> Serial Number</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">#124b31417</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><CpuChipIcon className="h-6 w-6 text-blue-500" /> CPU</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">Intel Core i7 8th Gen</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><ServerStackIcon className="h-6 w-6 text-blue-500" />RAM</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">8 GB</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><DeviceTabletIcon className="h-6 w-6 text-blue-500" />Motherboard</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">B450m</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><CircleStackIcon className="h-6 w-6 text-blue-500" />Storage</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">500 GB SSD</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><ComputerDesktopIcon className="h-6 w-6 text-blue-500" />Operating System</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">Windows 10</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><CheckCircleIcon className="h-6 w-6 text-blue-500" />Status</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">Working</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><UserIcon className="h-6 w-6 text-blue-500" />Received By</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">Quickly</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><MapPinIcon className="h-6 w-6 text-blue-500" />Location</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">Storage</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-1 sm:px-0">
                        <dt className="text-sm/6 font-bold text-gray-900 flex items-center gap-3"><HashtagIcon className="h-6 w-6 text-blue-500" />Station #</dt>
                        <dd className="mt-1 text-sm/6 text-gray-500 sm:mt-2">65</dd>
                    </div>
                    <div className="border-t border-gray-100 px-4 py-6 sm:col-span-2 sm:px-0">
                        <dt className="text-lg font-medium text-gray-900">History</dt>
                        <dd className="mt-2 text-sm text-gray-900">
                            <ul role="list" className="divide-y divide-gray-100 rounded-md border border-gray-200">
                                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <ArrowDownCircleIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                            <span className="truncate font-medium">Received by Quickly</span>
                                            <span className="shrink-0 text-gray-400">11/23/2024</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            TR#34324
                                        </a>
                                    </div>
                                </li>
                                <li className="flex items-center justify-between py-4 pr-5 pl-4 text-sm/6">
                                    <div className="flex w-0 flex-1 items-center">
                                        <BuildingLibraryIcon aria-hidden="true" className="size-5 shrink-0 text-gray-400" />
                                        <div className="ml-4 flex min-w-0 flex-1 gap-2">
                                            <span className="truncate font-medium">Deployed to site 2 - Floor 2 - Station 65</span>
                                            <span className="shrink-0 text-gray-400">06/16/2025</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                            TR#67567
                                        </a>
                                    </div>
                                </li>
                            </ul>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    )
}
