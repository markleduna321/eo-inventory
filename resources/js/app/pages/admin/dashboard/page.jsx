import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import AssetChartMonthly from './sections/asset-chart-monthly-section'
import { BarChart, LineChart, PieChart } from '@mui/x-charts'
import AssetValueMonthly from './sections/asset-value-monthly'
import AssetUsageSection from './sections/asset-usage-section'
import axios from 'axios'
import { 
  ComputerDesktopIcon, 
  DeviceTabletIcon, 
  CpuChipIcon, 
  ShoppingBagIcon,
  BellAlertIcon,
  ClockIcon,
  CogIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalAssetValue: '₱0',
    recentTransactions: [],
    stats: {},
    alertItems: [],
    timeframe: '12months',
    viewMode: 'charts',
    loading: true
  })

  useEffect(() => {
    fetchDashboardData()
  }, [dashboardData.timeframe])

  const fetchDashboardData = async () => {
    try {
      const [valueResponse, transactionsResponse, statsResponse] = await Promise.all([
        axios.get('/api/dashboard/total-asset-value'),
        axios.get('/api/dashboard/recent-transactions'),
        axios.get('/api/dashboard/stats')
      ])

      // Convert dollar values to peso if needed
      const totalAssetValue = valueResponse.data.formatted_value;
      const pesoCurrency = totalAssetValue.startsWith('$') ? 
        `₱${parseFloat(totalAssetValue.replace('$', '').replace(/,/g, '')).toLocaleString()}` : 
        totalAssetValue;
        
      // Generate some sample alert items (in a real app, these would come from the backend)
      const sampleAlerts = [
        { 
          id: 1, 
          type: 'low_stock', 
          severity: 'high', 
          message: 'RAM modules stock is critically low (2 remaining)',
          date: '2 hours ago'
        },
        { 
          id: 2, 
          type: 'maintenance', 
          severity: 'medium', 
          message: '3 monitors due for maintenance this week',
          date: '1 day ago' 
        },
        { 
          id: 3, 
          type: 'deployment', 
          severity: 'low', 
          message: '5 system units ready for deployment',
          date: '2 days ago'
        },
        { 
          id: 4, 
          type: 'expiry', 
          severity: 'high', 
          message: 'Service agreement for 8 workstations expiring in 5 days',
          date: '3 days ago'
        }
      ]

      setDashboardData({
        totalAssetValue: pesoCurrency,
        recentTransactions: transactionsResponse.data,
        stats: statsResponse.data,
        alertItems: sampleAlerts,
        timeframe: dashboardData.timeframe,
        viewMode: dashboardData.viewMode,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }
  
  const handleTimeframeChange = (timeframe) => {
    setDashboardData(prev => ({
      ...prev,
      timeframe: timeframe,
      loading: true
    }))
  }
  
  const handleViewModeChange = (mode) => {
    setDashboardData(prev => ({
      ...prev,
      viewMode: mode
    }))
  }
  return (
    <AdminLayout>
      <div>
        {/* Dashboard Header with Controls */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inventory Dashboard</h1>
              <p className="text-gray-600">Overview of your inventory assets and metrics</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mt-2 sm:mt-0">
              {/* Timeframe Selector */}
              <div className="inline-flex bg-gray-100 rounded-md">
                <button 
                  onClick={() => handleTimeframeChange('30days')}
                  className={`px-3 py-1.5 text-sm rounded-l-md ${dashboardData.timeframe === '30days' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  30 Days
                </button>
                <button 
                  onClick={() => handleTimeframeChange('90days')}
                  className={`px-3 py-1.5 text-sm ${dashboardData.timeframe === '90days' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  90 Days
                </button>
                <button 
                  onClick={() => handleTimeframeChange('12months')}
                  className={`px-3 py-1.5 text-sm rounded-r-md ${dashboardData.timeframe === '12months' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  12 Months
                </button>
              </div>
              
              {/* View Mode Selector */}
              <div className="inline-flex bg-gray-100 rounded-md">
                <button 
                  onClick={() => handleViewModeChange('charts')}
                  className={`px-3 py-1.5 text-sm rounded-l-md ${dashboardData.viewMode === 'charts' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Charts
                </button>
                <button 
                  onClick={() => handleViewModeChange('statistics')}
                  className={`px-3 py-1.5 text-sm rounded-r-md ${dashboardData.viewMode === 'statistics' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Statistics
                </button>
              </div>
              
              <button 
                onClick={() => fetchDashboardData()} 
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                <CogIcon className="w-4 h-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Currency Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  All financial values are displayed in Philippine Pesos (₱).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 flex items-center">
              <div className="bg-blue-500 text-white p-3 rounded-md">
                <ComputerDesktopIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Monitors</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {dashboardData.loading ? '...' : dashboardData.stats?.total_monitors || 0}
                  </p>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {dashboardData.loading ? '...' : `${dashboardData.stats?.active_monitors || 0} active`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 flex items-center">
              <div className="bg-green-500 text-white p-3 rounded-md">
                <CpuChipIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">System Units</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {dashboardData.loading ? '...' : dashboardData.stats?.total_system_units || 0}
                  </p>
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {dashboardData.loading ? '...' : `${dashboardData.stats?.active_system_units || 0} active`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200 flex items-center">
              <div className="bg-amber-500 text-white p-3 rounded-md">
                <DeviceTabletIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Peripherals</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {dashboardData.loading ? '...' : dashboardData.stats?.total_peripherals || 0}
                  </p>
                  <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                    {dashboardData.loading ? '...' : `${dashboardData.stats?.available_peripherals || 0} available`}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 flex items-center">
              <div className="bg-purple-500 text-white p-3 rounded-md">
                <BuildingOfficeIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Stations</h3>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-gray-800">
                    {dashboardData.loading ? '...' : dashboardData.stats?.total_stations || 0}
                  </p>
                  <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                    Total workstations
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Content - Conditional rendering based on viewMode */}
        {dashboardData.viewMode === 'charts' ? (
          <>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Left Section - Bar Chart */}
              <div className="w-full lg:w-8/12 bg-white p-4 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold">Assets Received Per Month</h2>
                  <div className="text-sm text-gray-500">
                    Showing data for {dashboardData.timeframe === '30days' ? 'last 30 days' : 
                      dashboardData.timeframe === '90days' ? 'last 90 days' : 'last 12 months'}
                  </div>
                </div>
                <AssetChartMonthly />
              </div>

              {/* Right Section - Pie Chart & Total Value */}
              <div className="flex flex-col gap-4 w-full lg:w-4/12">
                {/* Pie Chart */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <AssetUsageSection />
                </div>

                {/* Total Asset Value with trend indicator */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Asset Value</h2>
                  <div className="flex items-end">
                    <p className="text-3xl font-bold text-blue-600">
                      {dashboardData.loading ? 'Loading...' : dashboardData.totalAssetValue}
                    </p>
                    <div className="ml-2 text-sm text-green-600 flex items-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                      </svg>
                      <span>4.8% from last month</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Updated today at {new Date().toLocaleTimeString()} • PHP (₱) currency
                  </p>
                </div>

                {/* Line Chart for Asset Value Per Month */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <AssetValueMonthly />
                </div>

                {/* Additional Financial Metrics */}
                <div className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">Financial Metrics</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Monthly Depreciation:</span>
                      <span className="font-medium text-red-600">₱145,650</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Maintenance Budget:</span>
                      <span className="font-medium text-amber-600">₱82,500/mo</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-gray-600">Replacement Value:</span>
                      <span className="font-medium text-green-600">₱3,842,750</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Cost per Workstation:</span>
                      <span className="font-medium text-blue-600">₱68,250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts and Notifications Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Transaction History</h2>
                  <a href="#" className="text-blue-600 text-sm hover:underline">View All</a>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Date</th>
                        <th className="border p-2 text-left">Asset Name</th>
                        <th className="border p-2 text-left">Category</th>
                        <th className="border p-2 text-left">Status</th>
                        <th className="border p-2 text-left">User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.loading ? (
                        <tr>
                          <td colSpan="5" className="border p-4 text-center">Loading...</td>
                        </tr>
                      ) : dashboardData.recentTransactions.length > 0 ? (
                        dashboardData.recentTransactions.slice(0, 5).map((transaction, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border p-2">{transaction.date}</td>
                            <td className="border p-2">{transaction.asset_name}</td>
                            <td className="border p-2">{transaction.category}</td>
                            <td className={`border p-2 font-bold ${
                              transaction.status === 'Received' ? 'text-green-600' :
                              transaction.status === 'Deployed' ? 'text-yellow-600' :
                              transaction.status === 'Active' ? 'text-blue-600' :
                              transaction.status === 'Maintenance' ? 'text-red-600' :
                              'text-gray-600'
                            }`}>
                              {transaction.status}
                            </td>
                            <td className="border p-2">{transaction.user}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="border p-4 text-center text-gray-500">No recent transactions found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Alerts & Notifications</h2>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {dashboardData.alertItems.length} new
                  </span>
                </div>
                <div className="space-y-3">
                  {dashboardData.alertItems.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'medium' ? 'border-amber-500 bg-amber-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start">
                        <div className={`p-1 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-200' :
                          alert.severity === 'medium' ? 'bg-amber-200' :
                          'bg-blue-200'
                        }`}>
                          <BellAlertIcon className={`w-4 h-4 ${
                            alert.severity === 'high' ? 'text-red-600' :
                            alert.severity === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Statistics View */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Detailed Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Monitors Statistics */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-md">
                      <ComputerDesktopIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium ml-3">Monitors</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold">{dashboardData.loading ? '...' : dashboardData.stats?.total_monitors || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium text-green-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.active_monitors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Deployed:</span>
                      <span className="font-medium text-blue-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.deployed_monitors || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Under Maintenance:</span>
                      <span className="font-medium text-amber-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.maintenance_monitors || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Usage percentage bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Usage Rate</span>
                      <span>
                        {dashboardData.loading ? '...' : 
                          `${Math.round(((dashboardData.stats?.active_monitors || 0) + 
                          (dashboardData.stats?.deployed_monitors || 0)) / 
                          (dashboardData.stats?.total_monitors || 1) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: dashboardData.loading ? '0%' : 
                            `${Math.round(((dashboardData.stats?.active_monitors || 0) + 
                            (dashboardData.stats?.deployed_monitors || 0)) / 
                            (dashboardData.stats?.total_monitors || 1) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* System Units Statistics */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-green-100 p-2 rounded-md">
                      <CpuChipIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium ml-3">System Units</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold">{dashboardData.loading ? '...' : dashboardData.stats?.total_system_units || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Active:</span>
                      <span className="font-medium text-green-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.active_system_units || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Deployed:</span>
                      <span className="font-medium text-blue-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.deployed_system_units || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Under Maintenance:</span>
                      <span className="font-medium text-amber-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.maintenance_system_units || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Usage percentage bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Usage Rate</span>
                      <span>
                        {dashboardData.loading ? '...' : 
                          `${Math.round(((dashboardData.stats?.active_system_units || 0) + 
                          (dashboardData.stats?.deployed_system_units || 0)) / 
                          (dashboardData.stats?.total_system_units || 1) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: dashboardData.loading ? '0%' : 
                            `${Math.round(((dashboardData.stats?.active_system_units || 0) + 
                            (dashboardData.stats?.deployed_system_units || 0)) / 
                            (dashboardData.stats?.total_system_units || 1) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Peripherals Statistics */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="bg-amber-100 p-2 rounded-md">
                      <DeviceTabletIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-medium ml-3">Peripherals</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Stock:</span>
                      <span className="font-bold">{dashboardData.loading ? '...' : dashboardData.stats?.total_peripherals || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium text-green-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.available_peripherals || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Deployed:</span>
                      <span className="font-medium text-blue-600">
                        {dashboardData.loading ? '...' : dashboardData.stats?.deployed_peripherals || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stock availability percentage bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Stock Availability</span>
                      <span>
                        {dashboardData.loading ? '...' : 
                          `${Math.round((dashboardData.stats?.available_peripherals || 0) / 
                          (dashboardData.stats?.total_peripherals || 1) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ 
                          width: dashboardData.loading ? '0%' : 
                            `${Math.round((dashboardData.stats?.available_peripherals || 0) / 
                            (dashboardData.stats?.total_peripherals || 1) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Performance Indicators</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Asset Utilization</p>
                        <p className="text-2xl font-bold">86%</p>
                      </div>
                      <div className="bg-green-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 3.2% from previous month</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Average Deployment Time</p>
                        <p className="text-2xl font-bold">2.4 days</p>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-full">
                        <ClockIcon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↓ 0.8 days improvement</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Maintenance Rate</p>
                        <p className="text-2xl font-bold">5.8%</p>
                      </div>
                      <div className="bg-amber-100 p-2 rounded-full">
                        <CogIcon className="w-6 h-6 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-xs text-red-600 mt-2">↑ 1.3% from previous month</p>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Stock Turnover</p>
                        <p className="text-2xl font-bold">4.2x</p>
                      </div>
                      <div className="bg-purple-100 p-2 rounded-full">
                        <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-xs text-green-600 mt-2">↑ 0.3x from previous month</p>
                  </div>
                  
                  {/* Average Asset Cost */}
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Average Asset Cost</p>
                        <p className="text-2xl font-bold">₱28,500</p>
                      </div>
                      <div className="bg-indigo-100 p-2 rounded-full">
                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Last updated today</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {dashboardData.recentTransactions.slice(0, 8).map((transaction, index) => (
                      <li key={index} className="py-3">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${
                            transaction.status === 'Received' ? 'bg-green-100' :
                            transaction.status === 'Deployed' ? 'bg-yellow-100' :
                            transaction.status === 'Active' ? 'bg-blue-100' :
                            'bg-red-100'
                          }`}>
                            <svg className={`w-4 h-4 ${
                              transaction.status === 'Received' ? 'text-green-600' :
                              transaction.status === 'Deployed' ? 'text-yellow-600' :
                              transaction.status === 'Active' ? 'text-blue-600' :
                              'text-red-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d={transaction.status === 'Received' ? 
                                  "M5 13l4 4L19 7" : 
                                  transaction.status === 'Deployed' ? 
                                  "M13 10V3L4 14h7v7l9-11h-7z" :
                                  "M9 12l2 2 4-4"}
                              />
                            </svg>
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {transaction.asset_name} 
                              <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded ${
                                transaction.status === 'Received' ? 'bg-green-100 text-green-800' :
                                transaction.status === 'Deployed' ? 'bg-yellow-100 text-yellow-800' :
                                transaction.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <p>{transaction.date}</p>
                            <p>{transaction.user}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-4">
                  <button className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    View All Transactions
                  </button>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Alerts & Notifications</h2>
                <div className="space-y-3">
                  {dashboardData.alertItems.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'medium' ? 'border-amber-500 bg-amber-50' :
                      'border-blue-500 bg-blue-50'
                    }`}>
                      <div className="flex items-start">
                        <div className={`p-1 rounded-full ${
                          alert.severity === 'high' ? 'bg-red-200' :
                          alert.severity === 'medium' ? 'bg-amber-200' :
                          'bg-blue-200'
                        }`}>
                          <BellAlertIcon className={`w-4 h-4 ${
                            alert.severity === 'high' ? 'text-red-600' :
                            alert.severity === 'medium' ? 'text-amber-600' :
                            'text-blue-600'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-800">{alert.message}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{alert.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button className="w-full px-4 py-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
