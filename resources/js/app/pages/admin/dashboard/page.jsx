import React from 'react'
import AdminLayout from '../layout'
import AssetChartMonthly from './sections/asset-chart-monthly-section'
import { BarChart, LineChart, PieChart } from '@mui/x-charts'
import AssetValueMonthly from './sections/asset-value-monthly'
import AssetUsageSection from './sections/asset-usage-section'

export default function AdminDashboardPage() {
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
              <p className="text-2xl font-bold text-blue-600">$1,283,718</p>
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
                <tr>
                  <td className="border p-2">2025-04-01</td>
                  <td className="border p-2">Dell Laptop</td>
                  <td className="border p-2">Laptop</td>
                  <td className="border p-2 text-green-600 font-bold">Received</td>
                  <td className="border p-2">Admin</td>
                </tr>
                <tr>
                  <td className="border p-2">2025-03-30</td>
                  <td className="border p-2">HP Monitor</td>
                  <td className="border p-2">Monitor</td>
                  <td className="border p-2 text-yellow-600 font-bold">Deployed</td>
                  <td className="border p-2">John Doe</td>
                </tr>
                <tr>
                  <td className="border p-2">2025-03-28</td>
                  <td className="border p-2">Cisco Router</td>
                  <td className="border p-2">Network</td>
                  <td className="border p-2 text-red-600 font-bold">Damaged</td>
                  <td className="border p-2">IT Support</td>
                </tr>
                <tr>
                  <td className="border p-2">2025-03-25</td>
                  <td className="border p-2">Logitech Mouse</td>
                  <td className="border p-2">Peripherals</td>
                  <td className="border p-2 text-blue-600 font-bold">Repaired</td>
                  <td className="border p-2">Tech Team</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </AdminLayout>
  )
}
