import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
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
  console.log('Dashboard component rendering');
  
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
    console.log('Dashboard useEffect triggered, timeframe:', dashboardData.timeframe);
    fetchDashboardData();
  }, [dashboardData.timeframe])

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch each API endpoint individually for better error handling
      let valueResponse, transactionsResponse, statsResponse;
      
      try {
        valueResponse = await axios.get('/api/dashboard/total-asset-value');
        console.log('Asset value response:', valueResponse.data);
      } catch (error) {
        console.error('Error fetching asset value:', error);
        valueResponse = { data: { formatted_value: '₱0' } };
      }
      
      try {
        transactionsResponse = await axios.get('/api/dashboard/recent-transactions');
        console.log('Transactions response:', transactionsResponse.data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        transactionsResponse = { data: [] };
      }
      
      try {
        statsResponse = await axios.get('/api/dashboard/stats');
        console.log('Stats response:', statsResponse.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
        statsResponse = { data: {} };
      }
      
      // Get the total asset value directly in pesos
      const totalAssetValue = valueResponse.data.formatted_value;
      
      // Get asset value breakdown for detailed display
      const assetBreakdown = valueResponse.data.breakdown;
        
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

      // Additional debug to verify what we're setting
      console.log('Setting totalAssetValue:', totalAssetValue);
      console.log('Setting transactions:', transactionsResponse.data);
      console.log('Setting stats:', statsResponse.data);
      
      const newDashboardData = {
        totalAssetValue: totalAssetValue,
        assetBreakdown: assetBreakdown || {},
        recentTransactions: transactionsResponse.data || [],
        stats: statsResponse.data || {},
        alertItems: sampleAlerts,
        timeframe: dashboardData.timeframe,
        viewMode: dashboardData.viewMode,
        loading: false
      };
      
      console.log('New dashboard data being set:', newDashboardData);
      setDashboardData(newDashboardData);
      
      // Log state change after next render
      setTimeout(() => {
        console.log('Dashboard data after update:', dashboardData);
        console.log('Is data loading?', dashboardData.loading);
        console.log('Total asset value after update:', dashboardData.totalAssetValue);
      }, 500);
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-xl shadow-lg mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Inventory Dashboard</h1>
              <p className="text-blue-100">Real-time overview of your inventory assets and key performance metrics</p>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-0">
              {/* Timeframe Selector */}
              <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button 
                  onClick={() => handleTimeframeChange('30days')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${dashboardData.timeframe === '30days' 
                    ? 'bg-white text-blue-600 shadow-md font-medium' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  30 Days
                </button>
                <button 
                  onClick={() => handleTimeframeChange('90days')}
                  className={`px-4 py-2 text-sm transition-all duration-200 ${dashboardData.timeframe === '90days' 
                    ? 'bg-white text-blue-600 shadow-md font-medium rounded-md' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  90 Days
                </button>
                <button 
                  onClick={() => handleTimeframeChange('12months')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${dashboardData.timeframe === '12months' 
                    ? 'bg-white text-blue-600 shadow-md font-medium' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  12 Months
                </button>
              </div>
              
              {/* View Mode Selector */}
              <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-lg p-1">
                <button 
                  onClick={() => handleViewModeChange('charts')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${dashboardData.viewMode === 'charts' 
                    ? 'bg-white text-blue-600 shadow-md font-medium' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  Charts
                </button>
                <button 
                  onClick={() => handleViewModeChange('statistics')}
                  className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${dashboardData.viewMode === 'statistics' 
                    ? 'bg-white text-blue-600 shadow-md font-medium' 
                    : 'text-white hover:bg-white/20'}`}
                >
                  Statistics
                </button>
              </div>
              
              <button 
                onClick={() => {
                  console.log('Manual refresh clicked');
                  setDashboardData(prev => ({...prev, loading: true}));
                  setTimeout(() => fetchDashboardData(), 100);
                }} 
                className="flex items-center px-4 py-2 text-sm bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <CogIcon className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Currency Notice 
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 mb-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">Currency Information</h3>
                <p className="text-sm text-amber-700 mt-1">
                  All financial values are displayed in Philippine Pesos (₱). Exchange rates are updated daily.
                </p>
              </div>
            </div>
          </div>*/}

          {/* Enhanced KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <div className="group bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow-md">
                    <ComputerDesktopIcon className="w-7 h-7" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Monitors</h3>
                    <div className="flex items-baseline mt-1">
                      <p className="text-3xl font-bold text-gray-900">
                        {dashboardData.loading ? '...' : dashboardData.stats?.total_monitors || 0}
                      </p>
                      <span className="ml-3 text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                        {dashboardData.loading ? '...' : `${dashboardData.stats?.active_monitors || 0} active`}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 via-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-green-100 hover:shadow-lg transition-all duration-300 hover:border-green-200 hover:bg-gradient-to-br hover:from-green-100 hover:to-emerald-100">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-green-700 tracking-wide uppercase">System Units</h3>
                  <div className="flex items-center space-x-3">
                    <p className="text-4xl font-bold text-gray-900 group-hover:text-green-800 transition-colors duration-300">
                      {dashboardData.loading ? '...' : dashboardData.stats?.total_system_units || 0}
                    </p>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-green-200 transition-colors duration-300">
                      {dashboardData.loading ? '...' : `${dashboardData.stats?.active_system_units || 0} active`}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <CpuChipIcon className="w-7 h-7 text-green-600 group-hover:text-green-700 transition-colors duration-300" />
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-amber-50 via-amber-50 to-orange-50 rounded-xl p-6 shadow-sm border border-amber-100 hover:shadow-lg transition-all duration-300 hover:border-amber-200 hover:bg-gradient-to-br hover:from-amber-100 hover:to-orange-100">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-amber-700 tracking-wide uppercase">Peripherals</h3>
                  <div className="flex items-center space-x-3">
                    <p className="text-4xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors duration-300">
                      {dashboardData.loading ? '...' : dashboardData.stats?.total_peripherals || 0}
                    </p>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-amber-200 transition-colors duration-300">
                      {dashboardData.loading ? '...' : `${dashboardData.stats?.available_peripherals || 0} available`}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <DeviceTabletIcon className="w-7 h-7 text-amber-600 group-hover:text-amber-700 transition-colors duration-300" />
                </div>
              </div>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 via-purple-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 hover:border-purple-200 hover:bg-gradient-to-br hover:from-purple-100 hover:to-indigo-100">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-purple-700 tracking-wide uppercase">Stations</h3>
                  <div className="flex items-center space-x-3">
                    <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-800 transition-colors duration-300">
                      {dashboardData.loading ? '...' : dashboardData.stats?.total_stations || 0}
                    </p>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold group-hover:bg-purple-200 transition-colors duration-300">
                      Total workstations
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  <BuildingOfficeIcon className="w-7 h-7 text-purple-600 group-hover:text-purple-700 transition-colors duration-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Content - Conditional rendering based on viewMode */}
        {dashboardData.viewMode === 'charts' ? (
          <>
            {/* Row 1: 3-Column Grid Layout for Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 - Asset Distribution Pie Chart */}
              <div className="bg-gradient-to-br from-white to-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-lg transition-all duration-300 h-80">
                <AssetUsageSection />
              </div>

              {/* Column 2 - Asset Value Growth */}
              <div className="bg-gradient-to-br from-white to-purple-50 p-4 rounded-xl shadow-sm border border-purple-100 hover:shadow-lg transition-all duration-300 h-80">
                <AssetValueMonthly />
              </div>

              {/* Column 3 - Financial Metrics */}
              <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-xl shadow-sm border border-indigo-100 hover:shadow-lg transition-all duration-300 h-80">
                <div className="space-y-4 h-full flex flex-col">
                  <h2 className="text-lg font-bold text-gray-800 tracking-tight flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Financial Metrics
                  </h2>
                  <div className="space-y-3 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                      <span className="text-gray-700 font-medium">Monthly Depreciation:</span>
                      <span className="font-bold text-red-600">₱145,650</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <span className="text-gray-700 font-medium">Maintenance Budget:</span>
                      <span className="font-bold text-amber-600">₱82,500/mo</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <span className="text-gray-700 font-medium">Replacement Value:</span>
                      <span className="font-bold text-green-600">₱3,842,750</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <span className="text-gray-700 font-medium">Cost per Workstation:</span>
                      <span className="font-bold text-blue-600">₱68,250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Total Asset Value and Transaction History/Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
              {/* Column 1 - Transaction History */}
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

              {/* Column 2 & 3 - Stacked Total Asset Value and Alerts */}
              <div className="flex flex-col gap-4">
                {/* Total Asset Value */}
                <div className="bg-gradient-to-br from-white to-green-50 p-6 rounded-xl shadow-sm border border-green-100 hover:shadow-lg transition-all duration-300">
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-gray-800 tracking-tight">Total Asset Value</h2>
                    <div className="flex items-center space-x-4">
                      <p className="text-3xl font-bold text-green-600">
                        {dashboardData.loading ? 'Loading...' : (
                          console.log('Rendering asset value:', dashboardData.totalAssetValue),
                          dashboardData.totalAssetValue ? dashboardData.totalAssetValue : '₱343,702.00'
                        )}
                      </p>
                      <div className="flex items-center text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full font-semibold">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        <span>+4.8%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Asset value breakdown: {!dashboardData.loading && dashboardData.assetBreakdown ? 
                        `Monitors (₱${dashboardData.assetBreakdown.monitors?.toLocaleString() || 0}), 
                         Peripherals (₱${dashboardData.assetBreakdown.peripherals?.toLocaleString() || 0}), 
                         System Units (₱${dashboardData.assetBreakdown.system_units?.toLocaleString() || 0}), 
                         Parts (₱${dashboardData.assetBreakdown.parts?.toLocaleString() || 0}),
                         Devices (₱${dashboardData.assetBreakdown.devices?.toLocaleString() || 0})` : 
                        'Calculating...'
                      }
                    </p>
                    <p className="text-xs text-gray-400 flex items-center space-x-1">
                      <span>•</span>
                      <span>Updated today at {new Date().toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>PHP (₱) currency</span>
                    </p>
                  </div>
                </div>

                {/* Alerts & Notifications */}
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
                          `${Math.round((dashboardData.stats?.deployed_monitors || 0) / 
                          (dashboardData.stats?.total_monitors || 1) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: dashboardData.loading ? '0%' : 
                            `${Math.round((dashboardData.stats?.deployed_monitors || 0) / 
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
                          `${Math.round((dashboardData.stats?.deployed_system_units || 0) / 
                          (dashboardData.stats?.total_system_units || 1) * 100)}%`
                        }
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: dashboardData.loading ? '0%' : 
                            `${Math.round((dashboardData.stats?.deployed_system_units || 0) / 
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
