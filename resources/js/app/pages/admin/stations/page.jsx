import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import CreateStationsSection from './_sections/create-stations-section'
import StationsTableSection from './_sections/stations-table-section'
import { useDispatch, useSelector } from 'react-redux'
import { Transition } from '@headlessui/react'
import { 
    ComputerDesktopIcon, 
    UserGroupIcon, 
    BuildingOfficeIcon, 
    CheckCircleIcon,
    ClockIcon,
    WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'
import { fetchStations } from '@/app/redux/thunks/stationThunk'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
import { Pie, Bar } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

export default function StationsPage() {
    const dispatch = useDispatch()
    const { stations } = useSelector(state => state.stations)
    const [showDashboard, setShowDashboard] = useState(() => {
        const savedState = localStorage.getItem('stationDashboardVisible')
        return savedState !== null ? JSON.parse(savedState) : true
    })
    
    // Save dashboard visibility state to localStorage
    useEffect(() => {
        localStorage.setItem('stationDashboardVisible', JSON.stringify(showDashboard))
    }, [showDashboard])
    
    useEffect(() => {
        dispatch(fetchStations())
    }, [dispatch])
    
    // Get station statistics
    const getStationStats = () => {
        if (!stations || !Array.isArray(stations)) {
            return {
                total: 0,
                active: 0,
                inactive: 0,
                maintenance: 0,
                byDepartment: {},
                byType: {},
                occupancy: 0
            }
        }
        
        const byDepartment = {}
        const byType = {}
        let assignedCount = 0
        
        stations.forEach(station => {
            // Count by department
            if (station.department) {
                byDepartment[station.department] = (byDepartment[station.department] || 0) + 1
            }
            
            // Count by type
            if (station.type) {
                byType[station.type] = (byType[station.type] || 0) + 1
            }
            
            // Count stations with assigned users
            if (station.assigned_user) {
                assignedCount++
            }
        })
        
        return {
            total: stations.length,
            active: stations.filter(s => s.status === 'active').length,
            inactive: stations.filter(s => s.status === 'inactive').length,
            maintenance: stations.filter(s => s.status === 'maintenance').length,
            byDepartment,
            byType,
            occupancy: stations.length ? Math.round((assignedCount / stations.length) * 100) : 0
        }
    }
    
    const stats = getStationStats()
    
    // Prepare chart data
    const departmentChartData = {
        labels: Object.keys(stats.byDepartment),
        datasets: [
            {
                data: Object.values(stats.byDepartment),
                backgroundColor: [
                    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2,
            },
        ],
    }
    
    const typeChartData = {
        labels: Object.keys(stats.byType).map(type => {
            // Convert snake_case to Title Case
            return type
                .split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
        }),
        datasets: [
            {
                label: 'Number of Stations',
                data: Object.values(stats.byType),
                backgroundColor: 'rgba(79, 70, 229, 0.6)',
                borderColor: 'rgba(79, 70, 229, 1)',
                borderWidth: 1,
            },
        ],
    }
    
    return (
        <AdminLayout>
            <div>
                <div className='bg-white shadow-md rounded-md p-4 mb-6'>
                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-800'>Workstations</h1>
                            <p className='text-gray-600 mt-1'>Manage employee workstations and desk assignments</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowDashboard(!showDashboard)}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    showDashboard
                                        ? 'text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100'
                                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                } shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                                title={showDashboard ? "Hide Dashboard" : "Show Dashboard"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {showDashboard ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    )}
                                </svg>
                                {showDashboard ? "Hide Dashboard" : "Show Dashboard"}
                            </button>
                            <CreateStationsSection />
                        </div>
                    </div>
                </div>
                
                <Transition
                    show={showDashboard}
                    enter="transition-opacity duration-300 ease-out"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-200 ease-in"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`overflow-hidden ${showDashboard ? 'max-h-[2000px]' : 'max-h-0'} transition-all duration-500 ease-in-out`}>
                        {/* Dashboard Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Total Workstations</div>
                                <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3">
                                <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                <span className="text-green-600 font-medium">{stats.occupancy}%</span> occupied
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Active Workstations</div>
                                <div className="text-3xl font-bold text-green-600 mt-2">{stats.active}</div>
                            </div>
                            <div className="rounded-full bg-green-100 p-3">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                <span className="text-green-600 font-medium">{stats.total ? Math.round((stats.active / stats.total) * 100) : 0}%</span> of total
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Inactive Workstations</div>
                                <div className="text-3xl font-bold text-gray-500 mt-2">{stats.inactive}</div>
                            </div>
                            <div className="rounded-full bg-gray-100 p-3">
                                <ClockIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                <span className="text-gray-600 font-medium">{stats.total ? Math.round((stats.inactive / stats.total) * 100) : 0}%</span> of total
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-500">Under Maintenance</div>
                                <div className="text-3xl font-bold text-amber-600 mt-2">{stats.maintenance}</div>
                            </div>
                            <div className="rounded-full bg-amber-100 p-3">
                                <WrenchScrewdriverIcon className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="text-sm text-gray-500">
                                <span className="text-amber-600 font-medium">{stats.total ? Math.round((stats.maintenance / stats.total) * 100) : 0}%</span> of total
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Stations by Department</h2>
                        <div className="h-64">
                            {Object.keys(stats.byDepartment).length > 0 ? (
                                <Pie data={departmentChartData} options={{ maintainAspectRatio: false }} />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No department data available
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Stations by Type</h2>
                        <div className="h-64">
                            {Object.keys(stats.byType).length > 0 ? (
                                <Bar 
                                    data={typeChartData} 
                                    options={{
                                        maintainAspectRatio: false,
                                        scales: {
                                            y: {
                                                beginAtZero: true,
                                                ticks: {
                                                    precision: 0
                                                }
                                            }
                                        }
                                    }} 
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                    No type data available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                    </div>
                </Transition>
                
                <StationsTableSection />
            </div>
        </AdminLayout>
    )
}
