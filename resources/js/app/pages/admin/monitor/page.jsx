import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import MonitorTableSection from './_sections/monitor-table-section'
import CreateMonitorsSection from './_sections/create-monitors-section'
import { ComputerDesktopIcon, TvIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMonitors } from '@/app/redux/thunks/monitorThunk'

export default function MonitorPage() {
    const dispatch = useDispatch()
    const { monitors, loading } = useSelector(state => state.monitors)
    
    useEffect(() => {
        dispatch(fetchMonitors())
    }, [dispatch])
    
    // Get monitor statistics
    const getMonitorStats = () => {
        if (!monitors || !Array.isArray(monitors.data || monitors)) {
            return {
                total: 0,
                deployed: 0,
                available: 0,
                outOfService: 0,
                smallSize: 0,
                largeSize: 0
            }
        }
        
        const monitorArray = monitors.data || monitors
        
        return {
            total: monitorArray.length,
            deployed: monitorArray.filter(m => m.deployment_status === 'Deployed').length,
            available: monitorArray.filter(m => m.deployment_status === 'Available').length,
            outOfService: monitorArray.filter(m => 
                m.deployment_status === 'Out of Service' || 
                m.deployment_status === 'Retired'
            ).length,
            smallSize: monitorArray.filter(m => {
                const size = parseInt(m.size);
                return !isNaN(size) && size <= 22;
            }).length,
            largeSize: monitorArray.filter(m => {
                const size = parseInt(m.size);
                return !isNaN(size) && size > 22;
            }).length
        }
    }
    
    const stats = getMonitorStats()
    
    return (
        <AdminLayout>
            <div className="px-4 sm:px-6 lg:px-8">

                <div className="sm:flex sm:items-center mb-6">
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
                
                {/* Monitor Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-blue-600">Total Monitors</div>
                                <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                            </div>
                            <TvIcon className="w-8 h-8 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-green-600">Deployed</div>
                                <div className="text-2xl font-bold text-green-900">{stats.deployed}</div>
                            </div>
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <ArrowUpIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-amber-600">Available</div>
                                <div className="text-2xl font-bold text-amber-900">{stats.available}</div>
                            </div>
                            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">✓</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-red-600">Out of Service</div>
                                <div className="text-2xl font-bold text-red-900">{stats.outOfService}</div>
                            </div>
                            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                                <ArrowDownIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-purple-600">Small (≤22")</div>
                                <div className="text-2xl font-bold text-purple-900">{stats.smallSize}</div>
                            </div>
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <TvIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-4 rounded-xl shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-teal-600">Large ({'>'}22")</div>
                                <div className="text-2xl font-bold text-teal-900">{stats.largeSize}</div>
                            </div>
                            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
                                <ComputerDesktopIcon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className='shadow-md'>
                    <MonitorTableSection />
                </div>

            </div>
        </AdminLayout>
    )
}
