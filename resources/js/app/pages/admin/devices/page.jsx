import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import DeviceTableSection from './_sections/device-table-section'
import CreateDevicesSection from './_sections/create-devices-section'
import { ComputerDesktopIcon, DeviceTabletIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { get_devices_thunk } from './_redux/devices-thunk'

export default function DevicesPage() {
    const dispatch = useDispatch()
    const { devices, loading } = useSelector((state) => state.devices)
    
    useEffect(() => {
        dispatch(get_devices_thunk())
    }, [dispatch])
    
    // Get device statistics
    const getDeviceStats = () => {
        if (!devices || !Array.isArray(devices.data || devices)) {
            return {
                total: 0,
                working: 0,
                defective: 0,
                laptops: 0,
                desktops: 0,
                mobile: 0
            }
        }
        
        const deviceArray = devices.data || devices
        
        return {
            total: deviceArray.length,
            working: deviceArray.filter(d => d.status === 'Working').length,
            defective: deviceArray.filter(d => d.status === 'Defective' || d.status === 'For Repair').length,
            laptops: deviceArray.filter(d => d.device_type === 'Laptop' || d.device_type === 'MAC').length,
            desktops: deviceArray.filter(d => d.device_type === 'Desktop').length,
            mobile: deviceArray.filter(d => d.device_type === 'Mobile Phone' || d.device_type === 'Tablet').length
        }
    }
    
    const stats = getDeviceStats()
    
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center mb-6">
                    <div className="sm:flex-auto">
                        <h1 className="text-base font-semibold text-gray-900">Devices</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all the devices in your organization.
                        </p>
                    </div>

                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <CreateDevicesSection />
                    </div>
                </div>
                
                {/* Device Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-600">Total Devices</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                            </div>
                            <ComputerDesktopIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">Working</div>
                                <div className="text-2xl font-bold text-green-900">{stats.working}</div>
                            </div>
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-rose-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-red-600">Needs Attention</div>
                                <div className="text-2xl font-bold text-red-900">{stats.defective}</div>
                            </div>
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">!</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-amber-600">Laptops</div>
                                <div className="text-2xl font-bold text-amber-900">{stats.laptops}</div>
                            </div>
                            <DeviceTabletIcon className="w-8 h-8 text-amber-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-purple-600">Desktops</div>
                                <div className="text-2xl font-bold text-purple-900">{stats.desktops}</div>
                            </div>
                            <ComputerDesktopIcon className="w-8 h-8 text-purple-500" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-teal-600">Mobile Devices</div>
                                <div className="text-2xl font-bold text-teal-900">{stats.mobile}</div>
                            </div>
                            <DevicePhoneMobileIcon className="w-8 h-8 text-teal-500" />
                        </div>
                    </div>
                </div>

                <div className='shadow-md'>
                    <DeviceTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
