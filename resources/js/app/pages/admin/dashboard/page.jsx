import React, { useState, useEffect } from 'react'
import AdminLayout from '../layout'
import AssetChartMonthly from './sections/asset-chart-monthly-section'
import { BarChart, LineChart, PieChart } from '@mui/x-charts'
import AssetValueMonthly from './sections/asset-value-monthly'
import AssetUsageSection from './sections/asset-usage-section'
import axios from 'axios'

export default function AdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalAssetValue: '$0',
    recentTransactions: [],
    loading: true
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [valueResponse, transactionsResponse] = await Promise.all([
        axios.get('/api/dashboard/total-asset-value'),
        axios.get('/api/dashboard/recent-transactions')
      ])

      setDashboardData({
        totalAssetValue: valueResponse.data.formatted_value,
        recentTransactions: transactionsResponse.data,
        loading: false
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setDashboardData(prev => ({ ...prev, loading: false }))
    }
  }
  return (
    <AdminLayout>
      <div>
        <div className="flex gap-4">
          {/* Left Section - Bar Chart */}
          <div className="w-8/12 bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Assets Received Per Month</h2>
            <AssetChartMonthly />
          </div>

          {/* Right Section - Pie Chart & Total Value */}
          <div className="flex flex-col gap-4 w-4/12">
            {/* Pie Chart */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <AssetUsageSection />
            </div>

            {/* Total Asset Value */}
            <div className="bg-white h-[80px] p-4 flex flex-col items-center justify-center rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Total Asset Value</h2>
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.loading ? 'Loading...' : dashboardData.totalAssetValue}
              </p>
            </div>

            {/* Line Chart for Asset Value Per Month */}
            <div className="bg-white p-4 rounded-lg shadow-md ">
              <AssetValueMonthly />
            </div>
          </div>
        </div>

        <div className='bg-white shadow-md rounded-md mt-4 p-4'>
          <h2 className="text-xl font-semibold mb-2">Transaction History</h2>
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
                  dashboardData.recentTransactions.map((transaction, index) => (
                    <tr key={index}>
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
      </div>

    </AdminLayout>
  )
}
